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

function extractSubPath(req) {
  const qp = req.query?.__soalPath;
  if (Array.isArray(qp) && qp.length > 0) {
    return qp.join('/').replace(/^\/+|\/+$/g, '');
  }
  if (typeof qp === 'string' && qp.trim()) {
    return qp.trim().replace(/^\/+|\/+$/g, '');
  }
  const rawUrl = String(req.url || '').split('?')[0];
  return rawUrl.replace(/^\/api\/soal\/?/, '').replace(/^\/+|\/+$/g, '');
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

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

    const subPath = extractSubPath(req);
    const { handleSoalApiRequest } = await import('../server/soalMysql.mjs');
    const { status, payload } = await handleSoalApiRequest({
      method: req.method,
      subPath,
      body,
      authHeader: req.headers?.authorization,
    });
    return res.status(status).json(payload);
  } catch (err) {
    console.error('Fatal error in /api/soal:', err);
    return res.status(500).json({
      error:
        err?.message ||
        'Terjadi kesalahan internal pada API Kelola Soal. Periksa Environment Variables MySQL di Vercel.',
    });
  }
}
