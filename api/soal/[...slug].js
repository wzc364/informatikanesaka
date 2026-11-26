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
    let body = {};
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      try {
        body = await readJsonBody(req);
      } catch {
        return res.status(400).json({ error: 'Format payload JSON tidak valid.' });
      }
    }
    const slug = req.query?.slug;
    const subPath = Array.isArray(slug) ? slug.join('/') : String(slug || '');
    const { handleSoalApiRequest } = await import('../../server/soalMysql.mjs');
    const { status, payload } = await handleSoalApiRequest({
      method: req.method,
      subPath,
      body,
      authHeader: req.headers?.authorization,
    });
    return res.status(status).json(payload);
  } catch (err) {
    console.error('Fatal error in /api/soal/*:', err);
    return res.status(500).json({
      error: err?.message || 'Terjadi kesalahan internal pada API Kelola Soal.',
    });
  }
}
