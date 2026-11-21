import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

function stripOptionPrefix(text) {
  return String(text || '').replace(/^[A-Da-d][).:\]]\s+/, '').trim();
}

async function generateWithRetry(fn, maxAttempts = 2) {
  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const status = err?.status || err?.code;
      const name = String(err?.name || '');
      const msg = String(err?.message || '').toLowerCase();
      if (name === 'TimeoutError' || name === 'AbortError' || status === 20) {
        const timeoutErr = new Error(
          'Permintaan pembuatan soal AI melebihi batas waktu. Coba kurangi jumlah soal per proses atau coba lagi.'
        );
        timeoutErr.name = 'TimeoutError';
        timeoutErr.status = 504;
        throw timeoutErr;
      }
      const isRetryable =
        status === 429 ||
        status === 500 ||
        status === 502 ||
        status === 503 ||
        status === 504 ||
        msg.includes('network') ||
        msg.includes('fetch') ||
        msg.includes('unavailable') ||
        msg.includes('resource_exhausted');
      if (!isRetryable || attempt === maxAttempts) {
        throw err;
      }
      const waitMs = status === 429 ? 2000 * attempt : 900 * Math.pow(2, attempt - 1);
      await new Promise((r) => setTimeout(r, waitMs));
    }
  }
  throw lastError;
}

const GENERATED_QUESTIONS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    questions: {
      type: Type.ARRAY,
      description: 'Daftar soal pilihan ganda 4 opsi yang dihasilkan secara lengkap.',
      items: {
        type: Type.OBJECT,
        properties: {
          questionText: {
            type: Type.STRING,
            description: 'Teks pertanyaan soal yang jelas, lengkap, dan tidak ambigu.',
          },
          options: {
            type: Type.ARRAY,
            description: 'Tepat 4 teks pilihan jawaban (tanpa huruf A/B/C/D di depannya).',
            items: { type: Type.STRING },
          },
          correctAnswerIndex: {
            type: Type.INTEGER,
            description: 'Indeks jawaban benar antara 0 (A), 1 (B), 2 (C), atau 3 (D).',
          },
          explanation: {
            type: Type.STRING,
            description: 'Pembahasan singkat mengapa jawaban tersebut benar.',
          },
          cognitiveLevel: {
            type: Type.STRING,
            description: 'Level kognitif singkat (misal: C1 Mengingat, C2 Memahami, C3 Menerapkan, C4 Menganalisis).',
          },
        },
        required: [
          'questionText',
          'options',
          'correctAnswerIndex',
          'explanation',
          'cognitiveLevel',
        ],
      },
    },
  },
  required: ['questions'],
};

async function callGeminiBatch(ai, promptText) {
  const callModel = async (modelName, timeoutMs) => {
    let timer;
    try {
      return await Promise.race([
        ai.models.generateContent({
          model: modelName,
          contents: promptText,
          config: {
            abortSignal: AbortSignal.timeout(timeoutMs),
            systemInstruction:
              'Anda adalah guru Informatika & kurikulum berpengalaman di Indonesia. Buat soal pilihan ganda 4 opsi berkualitas tinggi, akurat secara konsep, bervariasi letak kunci jawabannya (tidak semuanya A/B), menggunakan bahasa Indonesia yang baku dan ramah siswa, serta simbol matematika rapi (×, ÷, ², ³, √, ≤, ≥, →) tanpa markup LaTeX mentah.',
            thinkingConfig: {
              thinkingLevel:
                modelName === 'gemini-4-hydrogen' ? ThinkingLevel.LOW : ThinkingLevel.MINIMAL,
            },
            responseMimeType: 'application/json',
            responseSchema: GENERATED_QUESTIONS_SCHEMA,
          },
        }),
        new Promise((_, reject) => {
          timer = setTimeout(() => {
            const err = new Error(
              `Batas waktu permintaan (${Math.round(timeoutMs / 1000)} detik) tercapai.`
            );
            err.name = 'TimeoutError';
            err.status = 504;
            reject(err);
          }, timeoutMs + 500);
        }),
      ]);
    } finally {
      if (timer) clearTimeout(timer);
    }
  };

  let response;
  try {
    response = await generateWithRetry(() => callModel('gemini-4-hydrogen', 24000), 2);
  } catch (primaryErr) {
    const status = primaryErr?.status || primaryErr?.code;
    const msg = String(primaryErr?.message || '').toLowerCase();
    const shouldFallback =
      status === 429 ||
      status === 500 ||
      status === 503 ||
      status === 504 ||
      primaryErr?.name === 'TimeoutError' ||
      msg.includes('unavailable') ||
      msg.includes('high demand') ||
      msg.includes('deadline');
    if (!shouldFallback) {
      throw primaryErr;
    }
    response = await generateWithRetry(() => callModel('gemini-3.1-flash-lite', 28000), 2);
  }

  const rawText = (response.text ?? '').trim();
  if (!rawText) {
    throw new Error('Model AI tidak mengembalikan daftar soal. Silakan coba lagi.');
  }
  const parsed = JSON.parse(rawText);
  return Array.isArray(parsed?.questions) ? parsed.questions : [];
}

function sanitizeQuestions(rawList) {
  const valid = [];
  for (const item of rawList) {
    const qText = String(item?.questionText || '').trim();
    if (!qText) continue;

    const rawOpts = Array.isArray(item?.options) ? item.options : [];
    const cleanedOpts = rawOpts.slice(0, 4).map((o) => stripOptionPrefix(o));
    while (cleanedOpts.length < 4) {
      cleanedOpts.push(`Pilihan ${String.fromCharCode(65 + cleanedOpts.length)}`);
    }
    if (cleanedOpts.some((o) => !o)) continue;

    let idx = Number(item?.correctAnswerIndex);
    if (!Number.isInteger(idx) || idx < 0 || idx > 3) {
      idx = 0;
    }

    valid.push({
      questionText: qText,
      options: cleanedOpts,
      correctAnswer: idx,
      explanation: String(item?.explanation || '').trim(),
      cognitiveLevel: String(item?.cognitiveLevel || 'C2 Memahami').trim(),
    });
  }
  return valid;
}

export async function generateQuestionsWithAI(input) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY belum terkonfigurasi di server. Pastikan GEMINI_API_KEY sudah diisi di Vercel Environment Variables atau Settings > Secrets.'
    );
  }

  const topic = String(input?.topic || '').trim();
  const materialContext = String(input?.materialContext || '').trim().slice(0, 24000);
  const jenjang = String(input?.jenjang || 'SMP Kelas VIII').trim();
  const difficulty = String(input?.difficulty || 'Campuran').trim();
  const instructions = String(input?.instructions || '').trim();
  const requestedCount = Math.min(20, Math.max(1, parseInt(String(input?.count || 5), 10) || 5));

  if (!topic && !materialContext) {
    throw new Error('Topik soal atau materi acuan wajib diisi.');
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
      timeout: 90000,
    },
  });

  // Bagi menjadi maksimal 10 soal per panggilan agar output tidak terpotong & selesai cepat
  const batchCounts = [];
  let remaining = requestedCount;
  while (remaining > 0) {
    const chunk = Math.min(10, remaining);
    batchCounts.push(chunk);
    remaining -= chunk;
  }

  const batchResults = await Promise.all(
    batchCounts.map((batchCount, batchIdx) => {
      const batchFocus =
        batchCounts.length > 1
          ? `Fokus batch ${batchIdx + 1} dari ${batchCounts.length}: buat soal yang BERBEDA topik/sudut pandang agar tidak mengulang soal di batch lain.`
          : '';
      const prompt = `Buat TEPAT ${batchCount} soal pilihan ganda (4 opsi) dalam Bahasa Indonesia.

Parameter Soal:
- Topik / Materi Utama: ${topic || 'Sesuai teks materi acuan di bawah'}
- Jenjang / Sasaran: ${jenjang}
- Tingkat Kesulitan: ${difficulty}
${instructions ? `- Instruksi Khusus Guru: ${instructions}` : ''}
${batchFocus ? `- ${batchFocus}` : ''}

Aturan WAJIB:
1. Hasilkan tepat ${batchCount} soal pada array "questions", tidak boleh kurang.
2. Setiap soal WAJIB memiliki tepat 4 pilihan jawaban ("options") yang masuk akal, setara panjangnya, tidak memakai awalan huruf "A./B./C./D.", dan hanya 1 jawaban paling tepat.
3. Sebarkan kunci jawaban ("correctAnswerIndex": 0, 1, 2, atau 3) secara bervariasi dan seimbang.
4. Sertakan "explanation" yang jelas, ringkas, dan edukatif untuk setiap soal.
${
  materialContext
    ? `\n=== MATERI ACUAN DARI KELOLA MATERI ===\n${materialContext}`
    : ''
}`;
      return callGeminiBatch(ai, prompt);
    })
  );

  const combined = sanitizeQuestions(batchResults.flat());
  // Deduplikasi berdasarkan teks pertanyaan yang dinormalisasi
  const seen = new Set();
  const unique = [];
  for (const q of combined) {
    const fp = q.questionText.toLowerCase().replace(/\s+/g, ' ').trim();
    if (seen.has(fp)) continue;
    seen.add(fp);
    unique.push(q);
  }

  if (unique.length === 0) {
    throw new Error('AI gagal menghasilkan butir soal yang valid. Silakan ubah topik atau coba lagi.');
  }

  return {
    questions: unique.slice(0, requestedCount),
    requestedCount,
    generatedAt: new Date().toISOString(),
  };
}

export async function processGenerateQuestionsRequest(body) {
  try {
    const result = await generateQuestionsWithAI(body || {});
    return { status: 200, payload: result };
  } catch (err) {
    console.error('Error generating AI questions:', err);
    const status = typeof err?.status === 'number' ? err.status : 500;
    const rawMessage = err?.message || 'Terjadi kesalahan saat membuat soal dengan AI.';

    if (
      rawMessage.includes('API_KEY_INVALID') ||
      rawMessage.includes('PERMISSION_DENIED') ||
      status === 403
    ) {
      return {
        status: 403,
        payload: {
          error:
            'Kunci API Gemini tidak valid atau tidak memiliki izin. Silakan periksa Environment Variables (GEMINI_API_KEY) di Vercel / Settings > Secrets.',
        },
      };
    }
    if (rawMessage.includes('RESOURCE_EXHAUSTED') || status === 429) {
      return {
        status: 429,
        payload: {
          error: 'Kuota permintaan AI sedang penuh (429). Tunggu beberapa saat lalu coba lagi.',
        },
      };
    }
    if (
      status === 503 ||
      status === 504 ||
      rawMessage.includes('UNAVAILABLE') ||
      rawMessage.includes('DEADLINE_EXCEEDED') ||
      rawMessage.includes('high demand')
    ) {
      return {
        status: 503,
        payload: {
          error:
            'Layanan AI sedang mengalami lonjakan trafik sementara. Silakan klik Generate Soal lagi beberapa saat.',
        },
      };
    }
    const clientStatus = status >= 400 && status < 500 ? status : 400;
    return {
      status: rawMessage.includes('GEMINI_API_KEY') || status >= 500 ? 500 : clientStatus,
      payload: { error: rawMessage },
    };
  }
}
