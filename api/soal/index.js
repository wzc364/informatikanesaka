export default async function handler(req, res) {
  try {
    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }
    const { handleSoalApiRequest } = await import('../../server/soalMysql.mjs');
    const { status, payload } = await handleSoalApiRequest({
      method: req.method,
      subPath: '',
      body: req.body,
      authHeader: req.headers?.authorization,
    });
    return res.status(status).json(payload);
  } catch (err) {
    console.error('Fatal error in /api/soal:', err);
    return res.status(500).json({
      error: err?.message || 'Terjadi kesalahan internal pada API Kelola Soal.',
    });
  }
}
