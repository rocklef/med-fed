import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireApiKey } from './_auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireApiKey(req, res)) return;
  if (req.method === 'GET') {
    return res.status(200).json({ status: 'idle', lastRunAt: null, nodes: 0 });
  }
  if (req.method === 'POST') {
    const { datasetId } = req.body || {};
    if (!datasetId) return res.status(400).json({ error: 'datasetId is required' });
    return res.status(202).json({ jobId: 'demo-job-1', datasetId });
  }
  res.setHeader('Allow', 'GET,POST');
  return res.status(405).json({ error: 'Method Not Allowed' });
}


