import { Router, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';
import { getLlamaService } from '../services/llamaService';

const router = Router();

const chatRequestSchema = z.object({
  message: z.string().min(1),
  context: z.string().optional(),
  queryType: z.enum(['diagnosis', 'treatment', 'analysis', 'general']).default('general')
});

router.post('/chat', async (req: Request, res: Response) => {
  try {
    const parsed = chatRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(StatusCodes.BAD_REQUEST).json({ 
        error: 'Invalid request data', 
        details: parsed.error.flatten() 
      });
    }

    const { message, context, queryType } = parsed.data;

    // Get Llama 3 service instance
    const llamaService = getLlamaService();
    
    if (!llamaService) {
      return res.status(StatusCodes.SERVICE_UNAVAILABLE).json({
        error: 'Llama 3 service is not available',
        message: 'Please ensure the Llama 3 model is running and properly configured'
      });
    }

    // Create medical query for Llama 3
    const medicalQuery = {
      query: message,
      queryType: queryType,
      context: {
        patientData: null,
        medicalHistory: context || 'medical_assistant',
        labResults: null,
        imagingData: null
      }
    };

    // Process query with Llama 3
    const startTime = Date.now();
    const llamaResponse = await llamaService.query(medicalQuery);
    const processingTime = Date.now() - startTime;

    res.json({
      response: llamaResponse.response,
      confidence: llamaResponse.confidence,
      processingTime: processingTime,
      tokensUsed: llamaResponse.tokensUsed || 0,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      error: 'Failed to process medical query with Llama 3',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/status', async (_req: Request, res: Response) => {
  try {
    const llamaService = getLlamaService();
    
    if (!llamaService) {
      return res.status(StatusCodes.SERVICE_UNAVAILABLE).json({
        status: 'unavailable',
        message: 'Llama 3 service is not initialized'
      });
    }

    const status = llamaService.getStatus();
    
    res.json({
      status: status.ready ? 'ready' : 'initializing',
      queueLength: status.queueLength,
      processing: status.processing,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error getting assistant status:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      error: 'Failed to get assistant status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/analyze', async (req: Request, res: Response) => {
  try {
    const { data, analysisType } = req.body;
    
    if (!data) {
      return res.status(StatusCodes.BAD_REQUEST).json({ 
        error: 'Data is required for analysis' 
      });
    }

    const llamaService = getLlamaService();
    
    if (!llamaService) {
      return res.status(StatusCodes.SERVICE_UNAVAILABLE).json({
        error: 'Llama 3 service is not available for analysis'
      });
    }

    // Create analysis query for Llama 3
    const analysisQuery = {
      query: `Please analyze the following ${analysisType || 'medical data'}: ${JSON.stringify(data)}`,
      queryType: 'analysis' as const,
      context: {
        patientData: null,
        medicalHistory: 'medical_analysis',
        labResults: null,
        imagingData: null
      }
    };

    const startTime = Date.now();
    const llamaResponse = await llamaService.query(analysisQuery);
    const processingTime = Date.now() - startTime;

    res.json({
      analysis: llamaResponse.response,
      confidence: llamaResponse.confidence,
      processingTime: processingTime,
      analysisType: analysisType || 'general',
      tokensUsed: llamaResponse.tokensUsed || 0,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in analysis endpoint:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      error: 'Failed to analyze medical data with Llama 3',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;


