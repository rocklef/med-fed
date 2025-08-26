import { Router, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

const router = Router();

router.post('/chat', async (req: Request, res: Response) => {
  const { message, context } = req.body || {};
  if (!message || typeof message !== 'string') {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'message is required' });
  }
  // Stub response; integrate with your LLM later
  const reply = `Received: ${message}. Context keys: ${context ? Object.keys(context).join(',') : 'none'}`;
  return res.json({ reply });
});

export default router;


