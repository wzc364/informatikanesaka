export default function handler(req: any, res: any) {
  const forwarded = req.headers?.['x-forwarded-for'];
  const rawIp =
    (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(',')[0]?.trim() ||
    req.headers?.['x-real-ip'] ||
    req.socket?.remoteAddress ||
    'Unknown';

  return res.status(200).json({
    ip: rawIp,
    userAgent: req.headers?.['user-agent'] || '',
    timestamp: new Date().toISOString(),
  });
}
