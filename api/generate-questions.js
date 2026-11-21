async function readJsonBody(req) {
  if (Buffer.isBuffer(req.body)) {
    const raw = req.body.toString('utf8').trim();
    return raw ? JSON.parse(raw) : {};
  }
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }
  if (typeof req.body === 'string') {
    return req.body.trim() ? JSON.parse(req.body) : {};
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const raw = Buffer.concat(chunks).toString('utf8').trim();
  return raw ? JSON.parse(raw) : {};
}

export default async function handler(req, res) {
  try {
    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }

    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST, OPTIONS');
      return res.status(405).json({ error: 'Metode harus POST.' });
    }

    let body;
    try {
      body = await readJsonBody(req);
    } catch {
      return res.status(400).json({ error: 'Format payload JSON tidak valid.' });
    }

    const { processGenerateQuestionsRequest } = await import('../server/questionGenerator.mjs');
    const { status, payload } = await processGenerateQuestionsRequest(body);
    return res.status(status).json(payload);
  } catch (err) {
    console.error('Fatal error in /api/generate-questions:', err);
    return res.status(500).json({
      error:
        err?.message ||
        'Terjadi kesalahan internal pada server pembuat soal AI. Periksa GEMINI_API_KEY di Vercel Environment Variables.',
    });
  }
}
