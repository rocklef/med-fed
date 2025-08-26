import { Router, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

const router = Router();

router.get('/status', async (_req: Request, res: Response) => {
  res.json({ status: 'idle', lastRunAt: null, nodes: 0 });
});

router.post('/process', async (req: Request, res: Response) => {
  const { datasetId } = req.body || {};
  if (!datasetId) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'datasetId is required' });
  }
  // Stub for data processing kick-off
  res.status(StatusCodes.ACCEPTED).json({ jobId: 'demo-job-1', datasetId });
});

export default router;


