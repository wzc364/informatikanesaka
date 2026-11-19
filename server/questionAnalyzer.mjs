import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

const IMAGE_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
]);

function getExtension(fileName) {
  const idx = fileName.lastIndexOf('.');
  return idx >= 0 ? fileName.slice(idx + 1).toLowerCase() : '';
}

function stripRtfControlWords(rtfText) {
  return rtfText
    .replace(/\{\\([a-zA-Z]+)[^}]*\}/g, ' ')
    .replace(/\\par[d]?/g, '\n')
    .replace(/\\tab/g, '\t')
    .replace(/\\'[0-9a-fA-F]{2}/g, ' ')
    .replace(/\\[a-zA-Z]+-?\d*\s?/g, ' ')
    .replace(/[{}]/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function stripHtmlTags(htmlText) {
  return htmlText
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<\/(p|div|li|tr|h[1-6]|br)\s*>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function isMostlyPrintableText(text) {
  if (!text) return false;
  let badChars = 0;
  const sample = text.slice(0, 2000);
  for (let i = 0; i < sample.length; i++) {
    const code = sample.charCodeAt(i);
    if (code === 0 || (code < 32 && code !== 9 && code !== 10 && code !== 13)) {
      badChars++;
    }
  }
  return badChars / sample.length < 0.05;
}

async function extractDocumentPart(fileName, mimeType, fileBase64) {
  const ext = getExtension(fileName);
  const normalizedMime = (mimeType || '').toLowerCase().trim();

  if (ext === 'pdf' || normalizedMime === 'application/pdf') {
    return { kind: 'inlineData', mimeType: 'application/pdf', data: fileBase64 };
  }

  if (
    IMAGE_MIME_TYPES.has(normalizedMime) ||
    ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext)
  ) {
    const safeMime =
      normalizedMime && IMAGE_MIME_TYPES.has(normalizedMime)
        ? normalizedMime === 'image/jpg'
          ? 'image/jpeg'
          : normalizedMime
        : ext === 'png'
          ? 'image/png'
          : ext === 'webp'
            ? 'image/webp'
            : ext === 'gif'
              ? 'image/gif'
              : 'image/jpeg';
    return { kind: 'inlineData', mimeType: safeMime, data: fileBase64 };
  }

  const buffer = Buffer.from(fileBase64, 'base64');

  if (
    ext === 'docx' ||
    normalizedMime ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    const mammothMod = await import('mammoth');
    const mammoth = mammothMod.default || mammothMod;
    const result = await mammoth.extractRawText({ buffer });
    const text = (result.value || '').trim();
    if (!text) {
      throw new Error(
        'File DOCX tidak mengandung teks soal yang dapat dibaca (mungkin hanya berisi gambar tanpa teks).'
      );
    }
    return { kind: 'text', text };
  }

  if (ext === 'doc' || normalizedMime === 'application/msword') {
    try {
      const wordExtractorMod = await import('word-extractor');
      const WordExtractor = wordExtractorMod.default || wordExtractorMod;
      const extractor = new WordExtractor();
      const doc = await extractor.extract(buffer);
      const parts = [doc.getHeaders({ includeFooters: true }), doc.getBody(), doc.getFootnotes()]
        .map((s) => (s || '').trim())
        .filter(Boolean);
      const combined = parts.join('\n\n').trim();
      if (combined) {
        return { kind: 'text', text: combined };
      }
    } catch {
      // Fallback below for HTML/RTF-disguised .doc exports
    }

    const utf8 = buffer.toString('utf8').trim();
    if (/^<\?xml|<html|<!doctype/i.test(utf8)) {
      const cleaned = stripHtmlTags(utf8);
      if (cleaned) return { kind: 'text', text: cleaned };
    }
    if (/^\{\\rtf/i.test(utf8)) {
      const cleaned = stripRtfControlWords(utf8);
      if (cleaned) return { kind: 'text', text: cleaned };
    }
    if (isMostlyPrintableText(utf8)) {
      return { kind: 'text', text: utf8 };
    }

    throw new Error(
      'File DOC lama tidak dapat dibaca. Coba simpan ulang dokumen ke format DOCX atau PDF lalu unggah kembali.'
    );
  }

  if (
    ['xlsx', 'xls', 'ods'].includes(ext) ||
    normalizedMime.includes('spreadsheet') ||
    normalizedMime.includes('excel')
  ) {
    const xlsxMod = await import('xlsx');
    const XLSX = xlsxMod.default?.read ? xlsxMod.default : xlsxMod;
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetTexts = workbook.SheetNames.map((name) => {
      const sheet = workbook.Sheets[name];
      const csv = XLSX.utils.sheet_to_csv(sheet, { blankrows: false });
      return `=== Sheet: ${name} ===\n${csv}`;
    }).filter((s) => s.trim().length > 0);
    const combined = sheetTexts.join('\n\n').trim();
    if (!combined) {
      throw new Error('File spreadsheet tidak memiliki isi yang dapat dibaca.');
    }
    return { kind: 'text', text: combined };
  }

  if (ext === 'rtf' || normalizedMime === 'application/rtf' || normalizedMime === 'text/rtf') {
    const text = stripRtfControlWords(buffer.toString('utf8'));
    if (!text) {
      throw new Error('File RTF tidak mengandung teks soal yang dapat dibaca.');
    }
    return { kind: 'text', text };
  }

  if (['html', 'htm', 'xhtml'].includes(ext) || normalizedMime === 'text/html') {
    const text = stripHtmlTags(buffer.toString('utf8'));
    if (!text) {
      throw new Error('File HTML tidak mengandung teks soal yang dapat dibaca.');
    }
    return { kind: 'text', text };
  }

  if (
    ['txt', 'md', 'csv', 'tsv', 'json', 'xml', 'yaml', 'yml'].includes(ext) ||
    normalizedMime.startsWith('text/')
  ) {
    const text = buffer.toString('utf8').trim();
    if (!text) {
      throw new Error('File dokumen kosong.');
    }
    return { kind: 'text', text };
  }

  const genericText = buffer.toString('utf8').trim();
  if (isMostlyPrintableText(genericText)) {
    return { kind: 'text', text: genericText };
  }

  throw new Error(
    `Format file ".${ext || 'tidak dikenal'}" belum didukung. Gunakan PDF, DOC, DOCX, TXT, CSV, RTF, HTML, Excel, atau gambar soal (PNG/JPG).`
  );
}

function buildResponseSchema(sections) {
  const properties = {
    ringkasanUmum: {
      type: Type.OBJECT,
      description: 'Ringkasan umum isi dokumen soal yang diunggah.',
      properties: {
        mataPelajaran: { type: Type.STRING },
        jenjang: { type: Type.STRING },
        jumlahSoalTerdeteksi: { type: Type.INTEGER },
        tingkatKesulitanDominan: { type: Type.STRING },
        ringkasan: { type: Type.STRING },
      },
      required: [
        'mataPelajaran',
        'jenjang',
        'jumlahSoalTerdeteksi',
        'tingkatKesulitanDominan',
        'ringkasan',
      ],
    },
  };

  const requiredFields = ['ringkasanUmum'];

  if (sections.kisiKisi) {
    requiredFields.push('kisiKisi');
    properties.kisiKisi = {
      type: Type.ARRAY,
      description: 'Tabel kisi-kisi lengkap untuk setiap butir soal di dokumen.',
      items: {
        type: Type.OBJECT,
        properties: {
          noSoal: { type: Type.STRING },
          kompetensiDasar: { type: Type.STRING },
          materiPokok: { type: Type.STRING },
          indikatorSoal: { type: Type.STRING },
          levelKognitif: { type: Type.STRING },
          bentukSoal: { type: Type.STRING },
          tingkatKesulitan: { type: Type.STRING },
        },
        required: [
          'noSoal',
          'kompetensiDasar',
          'materiPokok',
          'indikatorSoal',
          'levelKognitif',
          'bentukSoal',
          'tingkatKesulitan',
        ],
      },
    };
  }

  if (sections.materiDariSoal) {
    requiredFields.push('materiDariSoal');
    properties.materiDariSoal = {
      type: Type.ARRAY,
      description: 'Ringkasan materi pembelajaran, konsep inti, dan rumus kunci dari soal-soal tersebut.',
      items: {
        type: Type.OBJECT,
        properties: {
          judulTopik: { type: Type.STRING },
          konsepUtama: { type: Type.STRING },
          penjelasanSingkat: { type: Type.STRING },
          rumusAtauAturanKunci: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          tipsMemahami: { type: Type.STRING },
        },
        required: [
          'judulTopik',
          'konsepUtama',
          'penjelasanSingkat',
          'rumusAtauAturanKunci',
          'tipsMemahami',
        ],
      },
    };
  }

  if (sections.penyelesaianRinci) {
    requiredFields.push('penyelesaianRinci');
    properties.penyelesaianRinci = {
      type: Type.ARRAY,
      description: 'Pembahasan lengkap dan langkah demi langkah untuk setiap soal di dokumen.',
      items: {
        type: Type.OBJECT,
        properties: {
          nomorSoal: { type: Type.STRING },
          teksSoalRingkas: { type: Type.STRING },
          diketahui: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          ditanyakan: { type: Type.STRING },
          langkahPenyelesaian: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          jawabanBenar: { type: Type.STRING },
          penjelasanMengapaBenar: { type: Type.STRING },
        },
        required: [
          'nomorSoal',
          'teksSoalRingkas',
          'diketahui',
          'ditanyakan',
          'langkahPenyelesaian',
          'jawabanBenar',
          'penjelasanMengapaBenar',
        ],
      },
    };
  }

  if (sections.latihanSoal) {
    requiredFields.push('latihanSoalMirip');
    properties.latihanSoalMirip = {
      type: Type.ARRAY,
      description: 'Latihan soal baru yang mirip tingkat kesulitan dan konsepnya dengan soal di dokumen.',
      items: {
        type: Type.OBJECT,
        properties: {
          nomor: { type: Type.INTEGER },
          konteksAtauTopik: { type: Type.STRING },
          pertanyaan: { type: Type.STRING },
          pilihanGanda: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          kunciJawaban: { type: Type.STRING },
          pembahasanSingkat: { type: Type.STRING },
        },
        required: [
          'nomor',
          'konteksAtauTopik',
          'pertanyaan',
          'pilihanGanda',
          'kunciJawaban',
          'pembahasanSingkat',
        ],
      },
    };
  }

  return {
    type: Type.OBJECT,
    properties,
    required: requiredFields,
  };
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
          'Permintaan analisis AI melebihi batas waktu. Coba lagi atau perkecil jumlah halaman/soal dalam satu dokumen.'
        );
        timeoutErr.name = 'TimeoutError';
        timeoutErr.status = 504;
        throw timeoutErr;
      }
      const isRetryable =
        status === 500 ||
        status === 502 ||
        status === 503 ||
        status === 504 ||
        msg.includes('network') ||
        msg.includes('fetch') ||
        msg.includes('unavailable');
      if (!isRetryable || attempt === maxAttempts) {
        throw err;
      }
      await new Promise((r) => setTimeout(r, 800 * Math.pow(2, attempt - 1)));
    }
  }
  throw lastError;
}

export async function analyzeQuestionDocument(input) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY belum terkonfigurasi di server. Pastikan GEMINI_API_KEY sudah diisi di Vercel Environment Variables atau Settings > Secrets.'
    );
  }

  const { title, fileName, mimeType, fileBase64, sections } = input;
  if (!fileBase64) {
    throw new Error('File dokumen belum dipilih atau kosong.');
  }
  if (
    !sections.kisiKisi &&
    !sections.materiDariSoal &&
    !sections.penyelesaianRinci &&
    !sections.latihanSoal
  ) {
    throw new Error('Pilih minimal satu bagian analisis yang ingin dihasilkan.');
  }

  const extractedPart = await extractDocumentPart(fileName, mimeType, fileBase64);
  const bufferBytes = Buffer.byteLength(fileBase64, 'base64');

  const requestedLabels = [
    sections.kisiKisi ? '1. Kisi-kisi Soal (lengkap per nomor soal)' : null,
    sections.materiDariSoal
      ? '2. Materi dari Soal (konsep inti, penjelasan, rumus/aturan kunci, dan tips)'
      : null,
    sections.penyelesaianRinci
      ? '3. Penyelesaian Soal Secara Rinci (diketahui, ditanyakan, langkah demi langkah hingga jawaban benar)'
      : null,
    sections.latihanSoal
      ? '4. Latihan Soal yang Mirip (minimal 5 soal baru atau sesuai variasi topik soal asli, lengkap dengan 4 pilihan A/B/C/D, kunci jawaban, dan pembahasan singkat)'
      : null,
  ]
    .filter(Boolean)
    .join('\n');

  const promptText = `Judul Dokumen Analisis: "${title}"
Nama File Asli: "${fileName}"

Tugas Anda sebagai pakar pendidikan & kurikulum Indonesia:
Analisis seluruh soal yang terdapat dalam dokumen terlampir secara teliti, akurat, terstruktur, dan mudah dicetak sebagai dokumen modul guru/siswa.

Hasilkan bagian-bagian berikut dalam bahasa Indonesia yang rapi, baku, dan edukatif:
${requestedLabels}

Aturan Penulisan:
- Pastikan perhitungan matematika, logika informatika, konsep sains/bahasa, dan kunci jawaban benar-benar akurat dan terverifikasi.
- Untuk bagian Kisi-kisi: isi levelKognitif dengan taksonomi Bloom (misal: C1 Mengingat, C2 Memahami, C3 Menerapkan, C4 Menganalisis, C5 Mengevaluasi) dan tingkatKesulitan (Mudah / Sedang / Sukar).
- Untuk bagian Penyelesaian Rinci: uraikan langkahPenyelesaian secara runtut per poin agar mudah dibaca siswa dan dicetak. Jangan mencampur semua langkah menjadi satu paragraf panjang.
- Untuk bagian Latihan Soal yang Mirip: buat soal BARU yang mirip pola, kompetensi, dan konteksnya (bukan menyalin soal persis sama), setiap soal memiliki 4 opsi jawaban bersih (tanpa perlu duplikasi huruf A./B. jika tidak konsisten—atau tulis jelas tanpa simbol aneh) serta kunciJawaban dan pembahasanSingkat.
- Gunakan simbol matematika yang mudah dibaca saat dicetak (seperti ×, ÷, ², ³, √, ≤, ≥, →) dan hindari markup LaTeX mentah berantakan seperti \\frac atau $$.`;

  const contents =
    extractedPart.kind === 'inlineData'
      ? {
          parts: [
            {
              inlineData: {
                mimeType: extractedPart.mimeType,
                data: extractedPart.data,
              },
            },
            { text: promptText },
          ],
        }
      : `${promptText}\n\n=== ISI DOKUMEN SOAL ===\n${extractedPart.text.slice(0, 120000)}`;

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
      timeout: 90000,
    },
  });

  const callModel = async (modelName, timeoutMs) => {
    let timer;
    try {
      return await Promise.race([
        ai.models.generateContent({
          model: modelName,
          contents,
          config: {
            abortSignal: AbortSignal.timeout(timeoutMs),
            systemInstruction:
              'Anda adalah asisten analisis soal profesional untuk guru SMP/SMA di Indonesia. Selalu keluarkan JSON valid sesuai schema dengan bahasa Indonesia yang jelas, sistematis, teliti dalam perhitungan, dan siap dicetak.',
            thinkingConfig: {
              thinkingLevel:
                modelName === 'gemini-4-hydrogen' ? ThinkingLevel.LOW : ThinkingLevel.MINIMAL,
            },
            responseMimeType: 'application/json',
            responseSchema: buildResponseSchema(sections),
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
    response = await generateWithRetry(() => callModel('gemini-4-hydrogen', 55000), 2);
  } catch (primaryErr) {
    const status = primaryErr?.status || primaryErr?.code;
    const msg = String(primaryErr?.message || '').toLowerCase();
    const shouldFallback =
      status === 503 ||
      status === 504 ||
      status === 500 ||
      primaryErr?.name === 'TimeoutError' ||
      msg.includes('unavailable') ||
      msg.includes('high demand') ||
      msg.includes('deadline');
    if (!shouldFallback) {
      throw primaryErr;
    }
    response = await generateWithRetry(() => callModel('gemini-3.1-flash-lite', 45000), 2);
  }

  const rawText = (response.text ?? '').trim();
  if (!rawText) {
    throw new Error('Model tidak mengembalikan hasil analisis. Silakan coba lagi.');
  }

  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    throw new Error('Format hasil analisis dari server tidak valid. Silakan ulangi analisis.');
  }

  return {
    id: `analysis_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    title,
    fileName,
    fileSize: bufferBytes,
    analyzedAt: new Date().toISOString(),
    requestedSections: { ...sections },
    ringkasanUmum: parsed.ringkasanUmum || {
      mataPelajaran: 'Umum',
      jenjang: 'SMP',
      jumlahSoalTerdeteksi: 0,
      tingkatKesulitanDominan: 'Sedang',
      ringkasan: 'Hasil analisis dokumen soal.',
    },
    ...(sections.kisiKisi ? { kisiKisi: Array.isArray(parsed.kisiKisi) ? parsed.kisiKisi : [] } : {}),
    ...(sections.materiDariSoal
      ? { materiDariSoal: Array.isArray(parsed.materiDariSoal) ? parsed.materiDariSoal : [] }
      : {}),
    ...(sections.penyelesaianRinci
      ? {
          penyelesaianRinci: Array.isArray(parsed.penyelesaianRinci)
            ? parsed.penyelesaianRinci
            : [],
        }
      : {}),
    ...(sections.latihanSoal
      ? {
          latihanSoalMirip: Array.isArray(parsed.latihanSoalMirip)
            ? parsed.latihanSoalMirip
            : [],
        }
      : {}),
  };
}

export async function processAnalyzeQuestionRequest(body) {
  try {
    const { title, fileName, mimeType, fileBase64, sections } = body || {};

    if (!fileName || typeof fileName !== 'string') {
      return { status: 400, payload: { error: 'Nama file dokumen wajib disertakan.' } };
    }
    if (!fileBase64 || typeof fileBase64 !== 'string') {
      return { status: 400, payload: { error: 'Isi file dokumen tidak boleh kosong.' } };
    }

    const cleanTitle =
      typeof title === 'string' && title.trim()
        ? title.trim()
        : fileName.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ');

    const normalizedSections = {
      kisiKisi: Boolean(sections?.kisiKisi),
      materiDariSoal: Boolean(sections?.materiDariSoal),
      penyelesaianRinci: Boolean(sections?.penyelesaianRinci),
      latihanSoal: Boolean(sections?.latihanSoal),
    };

    const result = await analyzeQuestionDocument({
      title: cleanTitle,
      fileName,
      mimeType: typeof mimeType === 'string' ? mimeType : '',
      fileBase64,
      sections: normalizedSections,
    });

    return { status: 200, payload: result };
  } catch (err) {
    console.error('Error analyzing question document:', err);
    const status = typeof err?.status === 'number' ? err.status : 500;
    const rawMessage = err?.message || 'Terjadi kesalahan saat menganalisis dokumen soal.';

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
            'Layanan AI sedang mengalami lonjakan trafik sementara. Silakan klik Analisis Soal lagi beberapa saat.',
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
