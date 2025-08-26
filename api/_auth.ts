import type { VercelRequest, VercelResponse } from '@vercel/node';

export function requireApiKey(req: VercelRequest, res: VercelResponse): boolean {
  const configuredKey = process.env.API_KEY;
  if (!configuredKey) return true;
  const key = req.headers['x-api-key'];
  if (!key || key !== configuredKey) {
    res.status(401).json({ error: 'Invalid or missing API key' });
    return false;
  }
  return true;
}


