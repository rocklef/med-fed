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
import federatedRouter, { setDatasetService } from './routes/federated';
import { initializeLlamaService, LlamaConfig } from './services/llamaService';
import { MedicalDatasetService } from './services/medicalDatasetService';

const app = express();

const PORT = Number(process.env.PORT || 4000);
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:8080';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/med_fused_mind';

// Llama 3 configuration
const LLAMA_CONFIG: LlamaConfig = {
  apiUrl: process.env.LLAMA_API_URL || 'http://localhost:11434',
  modelPath: process.env.LLAMA_MODEL_PATH || 'llama3:latest',
  contextLength: Number(process.env.LLAMA_CONTEXT_LENGTH) || 4096,
  temperature: Number(process.env.LLAMA_TEMPERATURE) || 0.7,
  topP: Number(process.env.LLAMA_TOP_P) || 0.9,
  maxTokens: Number(process.env.LLAMA_MAX_TOKENS) || 2048,
  apiKey: process.env.LLAMA_API_KEY,
  systemPrompt: process.env.LLAMA_SYSTEM_PROMPT || `You are a medical AI assistant trained on medical datasets. Provide evidence-based medical information, clinical decision support, and analysis. Always emphasize that your responses are for educational and decision support purposes only, and should not replace professional medical judgment.`
};


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
    // Try to connect to MongoDB (optional for now)
    try {
      await mongoose.connect(MONGODB_URI);
      console.log('Connected to MongoDB');
    } catch (error) {
      console.warn('MongoDB connection failed, continuing without database:', error instanceof Error ? error.message : 'Unknown error');
    }



    // Initialize Medical Dataset Service
    console.log('Initializing Medical Dataset Service...');
    try {
      const datasetService = new MedicalDatasetService();
      await datasetService.initialize();
      setDatasetService(datasetService);
      console.log('Medical Dataset Service initialized successfully');
    } catch (error) {
      console.warn('Failed to initialize Medical Dataset Service:', error);
    }

    // Initialize Llama Service
    console.log('Initializing Llama Service...');
    try {
      await initializeLlamaService(LLAMA_CONFIG);
      console.log('Llama Service initialized successfully');
    } catch (error) {
      console.warn('Failed to initialize Llama Service:', error);
    }

    // Start server
    app.listen(PORT, () => {
      console.log(`API ready on http://localhost:${PORT}`);
      console.log(`Frontend origin: ${FRONTEND_ORIGIN}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('Received SIGTERM, shutting down gracefully...');
      await mongoose.connection.close();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      console.log('Received SIGINT, shutting down gracefully...');
      await mongoose.connection.close();
      process.exit(0);
    });

  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
}

start();


