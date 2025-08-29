import { Router, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';
import { MedicalDatasetService, MedicalDataset } from '../services/medicalDatasetService';

const router = Router();

// Get dataset service instance (you'll need to initialize this in your main app)
let datasetService: MedicalDatasetService | null = null;

export function setDatasetService(service: MedicalDatasetService) {
  datasetService = service;
}

const datasetSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  type: z.enum(['clinical_notes', 'lab_results', 'imaging', 'medications', 'diagnoses']),
  format: z.enum(['json', 'csv', 'txt', 'xml']),
  size: z.number(),
  records: z.number(),
  path: z.string(),
  metadata: z.object({
    source: z.string(),
    dateRange: z.string(),
    privacyLevel: z.enum(['public', 'anonymized', 'encrypted']),
    license: z.string()
  })
});

router.get('/status', async (_req: Request, res: Response) => {
  try {
    if (!datasetService) {
      return res.json({ 
        status: 'unavailable', 
        message: 'Dataset service not initialized',
        lastRunAt: null, 
        nodes: 0 
      });
    }

    const datasets = datasetService.getDatasets();
    const trainingJobs = datasetService.getTrainingJobs();
    
    res.json({ 
      status: 'active', 
      lastRunAt: new Date().toISOString(),
      nodes: datasets.length,
      datasets: datasets.length,
      activeJobs: trainingJobs.filter(job => job.status === 'processing').length
    });
  } catch (error) {
    console.error('Error getting federated status:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to get status' });
  }
});

router.post('/process', async (req: Request, res: Response) => {
  try {
    const { datasetId } = req.body || {};
    if (!datasetId) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'datasetId is required' });
    }

    if (!datasetService) {
      return res.status(StatusCodes.SERVICE_UNAVAILABLE).json({ 
        error: 'Dataset service not available' 
      });
    }

    const result = await datasetService.processDataset(datasetId);
    
    res.status(StatusCodes.ACCEPTED).json({ 
      jobId: `process_${Date.now()}`, 
      datasetId,
      result 
    });
  } catch (error) {
    console.error('Error processing dataset:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      error: 'Failed to process dataset',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Dataset management endpoints
router.get('/datasets', async (_req: Request, res: Response) => {
  try {
    if (!datasetService) {
      return res.status(StatusCodes.SERVICE_UNAVAILABLE).json({ 
        error: 'Dataset service not available' 
      });
    }

    const datasets = datasetService.getDatasets();
    res.json(datasets);
  } catch (error) {
    console.error('Error getting datasets:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to get datasets' });
  }
});

router.get('/datasets/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!datasetService) {
      return res.status(StatusCodes.SERVICE_UNAVAILABLE).json({ 
        error: 'Dataset service not available' 
      });
    }

    const dataset = datasetService.getDataset(id);
    if (!dataset) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: 'Dataset not found' });
    }

    res.json(dataset);
  } catch (error) {
    console.error('Error getting dataset:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to get dataset' });
  }
});

router.post('/datasets', async (req: Request, res: Response) => {
  try {
    const parsed = datasetSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(StatusCodes.BAD_REQUEST).json({ 
        error: 'Invalid dataset data', 
        details: parsed.error.flatten() 
      });
    }

    if (!datasetService) {
      return res.status(StatusCodes.SERVICE_UNAVAILABLE).json({ 
        error: 'Dataset service not available' 
      });
    }

    await datasetService.addDataset(parsed.data);
    
    res.status(StatusCodes.CREATED).json({ 
      message: 'Dataset added successfully',
      dataset: parsed.data 
    });
  } catch (error) {
    console.error('Error adding dataset:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      error: 'Failed to add dataset',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Training job management
router.get('/training', async (_req: Request, res: Response) => {
  try {
    if (!datasetService) {
      return res.status(StatusCodes.SERVICE_UNAVAILABLE).json({ 
        error: 'Dataset service not available' 
      });
    }

    const jobs = datasetService.getTrainingJobs();
    res.json(jobs);
  } catch (error) {
    console.error('Error getting training jobs:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to get training jobs' });
  }
});

router.post('/training', async (req: Request, res: Response) => {
  try {
    const { datasetId } = req.body || {};
    if (!datasetId) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'datasetId is required' });
    }

    if (!datasetService) {
      return res.status(StatusCodes.SERVICE_UNAVAILABLE).json({ 
        error: 'Dataset service not available' 
      });
    }

    const jobId = await datasetService.startTrainingJob(datasetId);
    
    res.status(StatusCodes.ACCEPTED).json({ 
      jobId,
      message: 'Training job started successfully' 
    });
  } catch (error) {
    console.error('Error starting training job:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      error: 'Failed to start training job',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/training/:jobId', async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    
    if (!datasetService) {
      return res.status(StatusCodes.SERVICE_UNAVAILABLE).json({ 
        error: 'Dataset service not available' 
      });
    }

    const job = datasetService.getTrainingJob(jobId);
    if (!job) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: 'Training job not found' });
    }

    res.json(job);
  } catch (error) {
    console.error('Error getting training job:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to get training job' });
  }
});

export default router;


