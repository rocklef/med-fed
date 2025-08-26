import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

export function apiKeyAuth(req: Request, res: Response, next: NextFunction) {
  const configuredKey = process.env.API_KEY;
  if (!configuredKey) {
    return next();
  }

  const headerKey = req.header('x-api-key');
  if (!headerKey || headerKey !== configuredKey) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Invalid or missing API key' });
  }
  return next();
}


