import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireApiKey } from './_auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireApiKey(req, res)) return;
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  const { message, context } = req.body || {};
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'message is required' });
  }
  const reply = `Received: ${message}. Context keys: ${context ? Object.keys(context).join(',') : 'none'}`;
  return res.status(200).json({ reply });
}


