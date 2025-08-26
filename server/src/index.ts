import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { StatusCodes } from 'http-status-codes';

import { apiKeyAuth } from './middleware/apiKeyAuth';
import { errorHandler } from './middleware/errorHandler';
import patientsRouter from './routes/patients';
import assistantRouter from './routes/assistant';
import federatedRouter from './routes/federated';

const app = express();

const PORT = Number(process.env.PORT || 4000);
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:8080';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/med_fused_mind';

// Security and parsing
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: FRONTEND_ORIGIN, credentials: false }));
app.use(morgan('dev'));

// Basic rate limiting
const limiter = rateLimit({ windowMs: 60_000, max: 120 });
app.use(limiter);

// Health endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(StatusCodes.OK).json({ status: 'ok' });
});

// API key auth for API routes
app.use('/api', apiKeyAuth);

// Routes
app.use('/api/patients', patientsRouter);
app.use('/api/assistant', assistantRouter);
app.use('/api/federated', federatedRouter);

// Not found
app.use((req: Request, res: Response) => {
  res.status(StatusCodes.NOT_FOUND).json({ error: 'Not Found', path: req.path });
});

// Error handler
app.use(errorHandler as unknown as (err: Error, req: Request, res: Response, next: NextFunction) => void);

async function start() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`API ready on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
}

start();


