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

function buildContents(extractedPart, promptText) {
  if (extractedPart.kind === 'inlineData') {
    return {
      parts: [
        {
          inlineData: {
            mimeType: extractedPart.mimeType,
            data: extractedPart.data,
          },
        },
        { text: promptText },
      ],
    };
  }
  return `${promptText}\n\n=== ISI DOKUMEN SOAL ===\n${extractedPart.text.slice(0, 120000)}`;
}

function normalizeQuestionKey(raw) {
  const s = String(raw || '')
    .trim()
    .replace(/^(soal|no\.?|nomor)\s*/i, '')
    .replace(/[.)\]]+$/, '')
    .trim();
  return s.toLowerCase();
}

function compareQuestionNumbers(a, b) {
  const na = parseInt(String(a).replace(/\D+/g, ''), 10);
  const nb = parseInt(String(b).replace(/\D+/g, ''), 10);
  if (!Number.isNaN(na) && !Number.isNaN(nb) && na !== nb) {
    return na - nb;
  }
  return String(a).localeCompare(String(b), 'id');
}

function chunkArray(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

async function runWithConcurrency(tasks, concurrency = 3) {
  const results = new Array(tasks.length);
  let nextIdx = 0;
  const workers = Array.from({ length: Math.min(concurrency, tasks.length) }, async () => {
    while (nextIdx < tasks.length) {
      const idx = nextIdx++;
      results[idx] = await tasks[idx]();
    }
  });
  await Promise.all(workers);
  return results;
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

async function callGeminiJson(ai, extractedPart, promptText, schema) {
  const contents = buildContents(extractedPart, promptText);

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
              'Anda adalah pakar kurikulum dan guru senior di Indonesia. Keluarkan JSON valid sesuai schema. DILARANG KERAS menyingkat, menggabungkan, atau melewatkan nomor soal yang diminta. Gunakan simbol matematika yang rapi (×, ÷, ², ³, √, ≤, ≥, →) tanpa markup LaTeX mentah.',
            thinkingConfig: {
              thinkingLevel:
                modelName === 'gemini-4-hydrogen' ? ThinkingLevel.LOW : ThinkingLevel.MINIMAL,
            },
            responseMimeType: 'application/json',
            responseSchema: schema,
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
    response = await generateWithRetry(() => callModel('gemini-4-hydrogen', 35000), 2);
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
    response = await generateWithRetry(() => callModel('gemini-3.1-flash-lite', 35000), 2);
  }

  const rawText = (response.text ?? '').trim();
  if (!rawText) {
    throw new Error('Model tidak mengembalikan hasil analisis. Silakan coba lagi.');
  }
  return JSON.parse(rawText);
}

const SUMMARY_AND_INDEX_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    ringkasanUmum: {
      type: Type.OBJECT,
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
    daftarNomorSoal: {
      type: Type.ARRAY,
      description:
        'Daftar lengkap SEMUA nomor soal yang ada di dokumen secara berurutan dari soal pertama hingga soal terakhir.',
      items: { type: Type.STRING },
    },
  },
  required: ['ringkasanUmum', 'daftarNomorSoal'],
};

const KISI_ONLY_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    kisiKisi: {
      type: Type.ARRAY,
      description: 'Tabel kisi-kisi lengkap untuk SETIAP nomor soal yang diminta tanpa terkecuali.',
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
    },
  },
  required: ['kisiKisi'],
};

const MATERI_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    materiDariSoal: {
      type: Type.ARRAY,
      description:
        'Uraian materi pembelajaran yang LENGKAP, PANJANG, dan MENDALAM mencakup seluruh topik dan kompetensi dari semua soal di dokumen.',
      items: {
        type: Type.OBJECT,
        properties: {
          judulTopik: { type: Type.STRING },
          konsepUtama: { type: Type.STRING },
          penjelasanSingkat: {
            type: Type.STRING,
            description:
              'Penjelasan materi yang LENGKAP dan PANJANG (minimal 4-6 paragraf terstruktur dipisahkan baris baru \\n\\n) berisi konsep dasar, cara analisis soal, dan variasi bentuk soal.',
          },
          rumusAtauAturanKunci: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          contohPenerapan: {
            type: Type.STRING,
            description: 'Contoh soal mini beserta langkah penerapannya secara singkat dan jelas.',
          },
          tipsMemahami: { type: Type.STRING },
        },
        required: [
          'judulTopik',
          'konsepUtama',
          'penjelasanSingkat',
          'rumusAtauAturanKunci',
          'contohPenerapan',
          'tipsMemahami',
        ],
      },
    },
  },
  required: ['materiDariSoal'],
};

const PENYELESAIAN_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    penyelesaianRinci: {
      type: Type.ARRAY,
      description:
        'Pembahasan rinci langkah demi langkah untuk SETIAP nomor soal yang diminta tanpa melewatkan satu pun.',
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
    },
  },
  required: ['penyelesaianRinci'],
};

const LATIHAN_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    latihanSoalMirip: {
      type: Type.ARRAY,
      description:
        'Kumpulan soal latihan baru yang mirip pola, tingkat kesulitan, dan sebaran topik dengan seluruh dokumen.',
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
    },
  },
  required: ['latihanSoalMirip'],
};

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

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
      timeout: 90000,
    },
  });

  // Gelombang 1: Inventarisasi SEMUA nomor soal + ringkasan, paralel dengan Materi & Latihan bila dicentang
  const indexPrompt = `Judul Dokumen: "${title}" (${fileName}).
Tugas Anda:
1. Hitung dan daftarkan SEMUA nomor soal yang terdapat dalam dokumen secara lengkap dari nomor pertama sampai nomor terakhir pada "daftarNomorSoal" (contoh: ["1","2","3",...]). JANGAN melewati nomor soal atau menyingkat dengan "dst".
2. Isi "ringkasanUmum" secara akurat sesuai jumlah total soal yang terdeteksi.`;

  const materiPrompt = `Judul Dokumen: "${title}" (${fileName}).
Tugas Anda: Susun **Materi Pembelajaran Lengkap dari Soal** sebagai modul ajar guru/siswa yang PANJANG, KOMPREHENSIF, dan MENDALAM.
Aturan WAJIB:
- Cakup SELURUH topik, bab, dan kompetensi dari soal pertama hingga soal terakhir di dokumen. Jangan hanya menulis 1 topik atau ringkasan pendek! Jika dokumen membahas beberapa materi berbeda, buat beberapa topik terperinci sesuai kelompok nomor soalnya (misalnya Topik 1 (Soal 1-5), Topik 2 (Soal 6-10), dst.).
- Pada field "penjelasanSingkat" di setiap topik, tulis uraian materi yang PANJANG, LENGKAP, dan MENDALAM (minimal 4 paragraf atau sub-poin terstruktur, dipisahkan dengan baris baru \\n\\n) mencakup definisi/konsep dasar, cara kerja atau penurunan konsep, cara membedakan variasi soal, dan panduan langkah pengerjaan.
- Pada "rumusAtauAturanKunci", tuliskan semua rumus, kaidah, definisi kunci, atau aturan penting beserta keterangan arti setiap variabel/istilahnya.
- Pada "contohPenerapan", berikan 1 contoh penerapan lengkap beserta langkah singkatnya.
- Pada "tipsMemahami", tuliskan kesalahan umum yang sering terjadi dan cara cepat menyelesaikan soal tipe tersebut.`;

  const latihanPrompt = `Judul Dokumen: "${title}" (${fileName}).
Tugas Anda: Buat paket **Latihan Soal yang Mirip** yang mewakili seluruh variasi topik dalam dokumen.
Aturan WAJIB:
- Buat antara 5 hingga 10 soal BARU yang setara secara kompetensi, pola berpikir, dan tingkat kesulitan (bukan menyalin soal asli persis sama). Jika dokumen memiliki banyak topik/soal, buat 8-10 soal agar merata ke seluruh topik.
- Setiap soal memiliki 4 pilihan jawaban bersih ("pilihanGanda"), "kunciJawaban" (misal: "B. ..."), dan "pembahasanSingkat" yang jelas.`;

  const indexPromise = callGeminiJson(ai, extractedPart, indexPrompt, SUMMARY_AND_INDEX_SCHEMA);
  const materiPromise = sections.materiDariSoal
    ? callGeminiJson(ai, extractedPart, materiPrompt, MATERI_SCHEMA)
    : Promise.resolve(null);
  const latihanPromise = sections.latihanSoal
    ? callGeminiJson(ai, extractedPart, latihanPrompt, LATIHAN_SCHEMA)
    : Promise.resolve(null);

  // Tangkap error sementara pada promise paralel agar tidak terjadi unhandled rejection jika index gagal lebih dulu
  const backgroundSettledPromise = Promise.allSettled([materiPromise, latihanPromise]);

  const indexData = (await indexPromise) || {};

  const ringkasanUmum = indexData.ringkasanUmum || {
    mataPelajaran: 'Umum',
    jenjang: 'SMP',
    jumlahSoalTerdeteksi: 0,
    tingkatKesulitanDominan: 'Sedang',
    ringkasan: 'Hasil analisis dokumen soal.',
  };

  let allQuestionNumbers = Array.isArray(indexData.daftarNomorSoal)
    ? indexData.daftarNomorSoal.map((n) => String(n).trim()).filter(Boolean)
    : [];

  if (allQuestionNumbers.length === 0 && ringkasanUmum.jumlahSoalTerdeteksi > 0) {
    allQuestionNumbers = Array.from(
      { length: ringkasanUmum.jumlahSoalTerdeteksi },
      (_, idx) => String(idx + 1)
    );
  }
  if (allQuestionNumbers.length === 0) {
    allQuestionNumbers = ['1'];
  }
  if (ringkasanUmum.jumlahSoalTerdeteksi < allQuestionNumbers.length) {
    ringkasanUmum.jumlahSoalTerdeteksi = allQuestionNumbers.length;
  }

  // Gelombang 2: Kisi-kisi (batch semua nomor) & Penyelesaian Rinci (batch semua nomor) berjalan paralel dengan Materi & Latihan
  const wave2Tasks = [];
  let kisiKisi = [];
  let penyelesaianRinci = [];

  if (sections.kisiKisi) {
    const kisiBatches = chunkArray(allQuestionNumbers, 15);
    kisiBatches.forEach((batchNos) => {
      wave2Tasks.push(async () => {
        const prompt = `Judul Dokumen: "${title}" (${fileName}).
Buat tabel **Kisi-Kisi Soal** untuk SEMUA nomor soal berikut ini tanpa terkecuali: ${batchNos.join(', ')}.
Aturan WAJIB:
- Harus ada tepat 1 baris kisi-kisi untuk SETIAP nomor soal di daftar [${batchNos.join(', ')}].
- DILARANG menggabungkan nomor (seperti "1-5") atau melewatkan satu nomor pun!
- Isi levelKognitif dengan Taksonomi Bloom (misal: C1 Mengingat, C2 Memahami, C3 Menerapkan, C4 Menganalisis, C5 Mengevaluasi) dan tingkatKesulitan (Mudah / Sedang / Sukar).`;
        const res = await callGeminiJson(ai, extractedPart, prompt, KISI_ONLY_SCHEMA);
        if (Array.isArray(res?.kisiKisi)) {
          kisiKisi.push(...res.kisiKisi);
        }
      });
    });
  }

  if (sections.penyelesaianRinci) {
    const solBatches = chunkArray(allQuestionNumbers, 8);
    solBatches.forEach((batchNos) => {
      wave2Tasks.push(async () => {
        const prompt = `Judul Dokumen: "${title}" (${fileName}).
Buat **Penyelesaian Soal Secara Rinci** untuk SEMUA nomor soal berikut ini satu per satu: ${batchNos.join(', ')}.
Aturan WAJIB:
- Anda WAJIB menyelesaikan SEMUA ${batchNos.length} soal pada daftar [${batchNos.join(', ')}] dari awal sampai akhir batch ini.
- DILARANG berhenti setelah 1 soal atau hanya memberi contoh!
- Untuk setiap soal, tulis "nomorSoal" sesuai nomor aslinya, "teksSoalRingkas", daftar "diketahui", "ditanyakan", "langkahPenyelesaian" yang runtut per langkah, "jawabanBenar", dan "penjelasanMengapaBenar".`;
        const res = await callGeminiJson(ai, extractedPart, prompt, PENYELESAIAN_SCHEMA);
        if (Array.isArray(res?.penyelesaianRinci)) {
          penyelesaianRinci.push(...res.penyelesaianRinci);
        }
      });
    });
  }

  const [settledBackground] = await Promise.all([
    backgroundSettledPromise,
    wave2Tasks.length > 0 ? runWithConcurrency(wave2Tasks, 3) : Promise.resolve(),
  ]);

  if (settledBackground[0].status === 'rejected') {
    throw settledBackground[0].reason;
  }
  if (settledBackground[1].status === 'rejected') {
    throw settledBackground[1].reason;
  }
  const materiData = settledBackground[0].value;
  const latihanData = settledBackground[1].value;

  // Pemulihan otomatis jika masih ada nomor soal yang terlewat di Kisi-kisi atau Penyelesaian
  const recoveryTasks = [];

  if (sections.kisiKisi) {
    const coveredKisi = new Set(kisiKisi.map((item) => normalizeQuestionKey(item.noSoal)));
    const missingKisi = allQuestionNumbers.filter(
      (n) => !coveredKisi.has(normalizeQuestionKey(n))
    );
    if (missingKisi.length > 0) {
      chunkArray(missingKisi, 15).forEach((batchNos) => {
        recoveryTasks.push(async () => {
          const prompt = `Lengkapi Kisi-Kisi Soal yang belum dibuat HANYA untuk nomor soal berikut: ${batchNos.join(', ')}. Wajib sertakan setiap nomor tersebut satu per satu tanpa ada yang terlewat.`;
          const res = await callGeminiJson(ai, extractedPart, prompt, KISI_ONLY_SCHEMA);
          if (Array.isArray(res?.kisiKisi)) {
            kisiKisi.push(...res.kisiKisi);
          }
        });
      });
    }
  }

  if (sections.penyelesaianRinci) {
    const coveredSol = new Set(
      penyelesaianRinci.map((item) => normalizeQuestionKey(item.nomorSoal))
    );
    const missingSol = allQuestionNumbers.filter(
      (n) => !coveredSol.has(normalizeQuestionKey(n))
    );
    if (missingSol.length > 0) {
      chunkArray(missingSol, 8).forEach((batchNos) => {
        recoveryTasks.push(async () => {
          const prompt = `Selesaikan Penyelesaian Soal Secara Rinci untuk SEMUA nomor soal yang tersisa berikut ini satu per satu: ${batchNos.join(', ')}. Jangan melewati satu pun!`;
          const res = await callGeminiJson(ai, extractedPart, prompt, PENYELESAIAN_SCHEMA);
          if (Array.isArray(res?.penyelesaianRinci)) {
            penyelesaianRinci.push(...res.penyelesaianRinci);
          }
        });
      });
    }
  }

  if (recoveryTasks.length > 0) {
    await runWithConcurrency(recoveryTasks, 2);
  }

  // Deduplikasi dan pengurutan numerik sesuai urutan soal asli
  if (sections.kisiKisi) {
    const seen = new Set();
    kisiKisi = kisiKisi
      .filter((item) => {
        const key = normalizeQuestionKey(item.noSoal);
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => compareQuestionNumbers(a.noSoal, b.noSoal));
  }

  if (sections.penyelesaianRinci) {
    const seen = new Set();
    penyelesaianRinci = penyelesaianRinci
      .filter((item) => {
        const key = normalizeQuestionKey(item.nomorSoal);
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => compareQuestionNumbers(a.nomorSoal, b.nomorSoal));
  }

  return {
    id: `analysis_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    title,
    fileName,
    fileSize: bufferBytes,
    analyzedAt: new Date().toISOString(),
    requestedSections: { ...sections },
    ringkasanUmum,
    ...(sections.kisiKisi ? { kisiKisi } : {}),
    ...(sections.materiDariSoal
      ? {
          materiDariSoal: Array.isArray(materiData?.materiDariSoal)
            ? materiData.materiDariSoal
            : [],
        }
      : {}),
    ...(sections.penyelesaianRinci ? { penyelesaianRinci } : {}),
    ...(sections.latihanSoal
      ? {
          latihanSoalMirip: Array.isArray(latihanData?.latihanSoalMirip)
            ? latihanData.latihanSoalMirip
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
