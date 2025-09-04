import { Router, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';
import { getLlamaService } from '../services/llamaService';

const router = Router();

const chatRequestSchema = z.object({
  message: z.string().min(1),
  context: z.string().optional(),
  queryType: z.enum(['diagnosis', 'treatment', 'analysis', 'general', 'medication', 'lab_interpretation']).default('general'),
  patientData: z.object({
    age: z.number().optional(),
    gender: z.string().optional(),
    weight: z.number().optional(),
    height: z.number().optional(),
    vitalSigns: z.object({
      bloodPressure: z.string().optional(),
      heartRate: z.number().optional(),
      temperature: z.number().optional(),
      oxygenSaturation: z.number().optional()
    }).optional(),
    medications: z.array(z.string()).optional(),
    allergies: z.array(z.string()).optional(),
    medicalHistory: z.string().optional(),
    labResults: z.record(z.any()).optional()
  }).optional(),
  enableStreaming: z.boolean().optional()
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

    const { message, context, queryType, patientData, enableStreaming } = parsed.data;

    // Get Llama 3 service instance
    const llamaService = getLlamaService();
    
    if (!llamaService || !llamaService.getStatus().ready) {
      return res.status(StatusCodes.SERVICE_UNAVAILABLE).json({
        error: 'AI service is not ready',
        message: 'The Llama 3 model is currently unavailable. Please ensure it is running and properly configured in the server environment.'
      });
    }

    // Create medical query for Llama 3
    const medicalQuery = {
      query: message,
      queryType: queryType,
      context: {
        patientData: patientData || null,
        medicalHistory: context || 'medical_assistant',
        labResults: patientData?.labResults || null,
        imagingData: null,
        vitalSigns: patientData?.vitalSigns || null,
        medications: patientData?.medications || [],
        allergies: patientData?.allergies || []
      }
    };

    // Handle streaming if requested
    if (enableStreaming) {
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Transfer-Encoding', 'chunked');
      
      try {
        const stream = await llamaService.streamQuery(medicalQuery);
        let fullResponse = '';
        
        for await (const chunk of stream) {
          if (chunk.done) {
            res.write(`\n\n---END---\n`);
            res.end();
            break;
          }
          
          fullResponse += chunk.chunk;
          res.write(chunk.chunk);
        }
        
        // Log the complete response for monitoring
        console.log('Streaming response completed:', {
          query: message,
          responseLength: fullResponse.length,
          queryType
        });
        
      } catch (error) {
        console.error('Streaming error:', error);
        res.write(`\nError: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
        res.end();
      }
      return;
    }

    // Process query with Llama 3 (non-streaming)
    const startTime = Date.now();
    const llamaResponse = await llamaService.query(medicalQuery);
    const processingTime = Date.now() - startTime;

    res.json({
      response: llamaResponse.response,
      confidence: llamaResponse.confidence,
      processingTime: processingTime,
      tokensUsed: llamaResponse.tokensUsed || 0,
      modelUsed: llamaResponse.modelUsed,
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
      availableModels: status.availableModels,
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
    const { data, analysisType, patientContext } = req.body;
    
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
        patientData: patientContext || null,
        medicalHistory: 'medical_analysis',
        labResults: analysisType === 'lab_interpretation' ? data : null,
        imagingData: analysisType === 'imaging' ? data : null,
        vitalSigns: patientContext?.vitalSigns || null,
        medications: patientContext?.medications || [],
        allergies: patientContext?.allergies || []
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
      modelUsed: llamaResponse.modelUsed,
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

router.post('/diagnosis', async (req: Request, res: Response) => {
  try {
    const { symptoms, patientContext, enableStreaming } = req.body;
    
    if (!symptoms) {
      return res.status(StatusCodes.BAD_REQUEST).json({ 
        error: 'Symptoms are required for diagnosis' 
      });
    }

    const llamaService = getLlamaService();
    
    if (!llamaService) {
      return res.status(StatusCodes.SERVICE_UNAVAILABLE).json({
        error: 'Llama 3 service is not available for diagnosis'
      });
    }

    const diagnosisQuery = {
      query: `Please provide a differential diagnosis for the following symptoms: ${symptoms}`,
      queryType: 'diagnosis' as const,
      context: {
        patientData: patientContext || null,
        medicalHistory: patientContext?.medicalHistory || 'diagnosis_request',
        labResults: patientContext?.labResults || null,
        imagingData: null,
        vitalSigns: patientContext?.vitalSigns || null,
        medications: patientContext?.medications || [],
        allergies: patientContext?.allergies || []
      }
    };

    if (enableStreaming) {
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Transfer-Encoding', 'chunked');
      
      try {
        const stream = await llamaService.streamQuery(diagnosisQuery);
        let fullResponse = '';
        
        for await (const chunk of stream) {
          if (chunk.done) {
            res.write(`\n\n---END---\n`);
            res.end();
            break;
          }
          
          fullResponse += chunk.chunk;
          res.write(chunk.chunk);
        }
      } catch (error) {
        console.error('Diagnosis streaming error:', error);
        res.write(`\nError: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
        res.end();
      }
      return;
    }

    const startTime = Date.now();
    const llamaResponse = await llamaService.query(diagnosisQuery);
    const processingTime = Date.now() - startTime;

    res.json({
      diagnosis: llamaResponse.response,
      confidence: llamaResponse.confidence,
      processingTime: processingTime,
      tokensUsed: llamaResponse.tokensUsed || 0,
      modelUsed: llamaResponse.modelUsed,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in diagnosis endpoint:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      error: 'Failed to generate diagnosis with Llama 3',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/treatment', async (req: Request, res: Response) => {
  try {
    const { condition, patientContext, enableStreaming } = req.body;
    
    if (!condition) {
      return res.status(StatusCodes.BAD_REQUEST).json({ 
        error: 'Condition is required for treatment recommendations' 
      });
    }

    const llamaService = getLlamaService();
    
    if (!llamaService) {
      return res.status(StatusCodes.SERVICE_UNAVAILABLE).json({
        error: 'Llama 3 service is not available for treatment recommendations'
      });
    }

    const treatmentQuery = {
      query: `Please provide evidence-based treatment recommendations for: ${condition}`,
      queryType: 'treatment' as const,
      context: {
        patientData: patientContext || null,
        medicalHistory: patientContext?.medicalHistory || 'treatment_request',
        labResults: patientContext?.labResults || null,
        imagingData: null,
        vitalSigns: patientContext?.vitalSigns || null,
        medications: patientContext?.medications || [],
        allergies: patientContext?.allergies || []
      }
    };

    if (enableStreaming) {
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Transfer-Encoding', 'chunked');
      
      try {
        const stream = await llamaService.streamQuery(treatmentQuery);
        let fullResponse = '';
        
        for await (const chunk of stream) {
          if (chunk.done) {
            res.write(`\n\n---END---\n`);
            res.end();
            break;
          }
          
          fullResponse += chunk.chunk;
          res.write(chunk.chunk);
        }
      } catch (error) {
        console.error('Treatment streaming error:', error);
        res.write(`\nError: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
        res.end();
      }
      return;
    }

    const startTime = Date.now();
    const llamaResponse = await llamaService.query(treatmentQuery);
    const processingTime = Date.now() - startTime;

    res.json({
      treatment: llamaResponse.response,
      confidence: llamaResponse.confidence,
      processingTime: processingTime,
      tokensUsed: llamaResponse.tokensUsed || 0,
      modelUsed: llamaResponse.modelUsed,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in treatment endpoint:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      error: 'Failed to generate treatment recommendations with Llama 3',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/models/pull', async (req: Request, res: Response) => {
  try {
    const { modelName } = req.body;
    
    if (!modelName) {
      return res.status(StatusCodes.BAD_REQUEST).json({ 
        error: 'Model name is required' 
      });
    }

    const llamaService = getLlamaService();
    
    if (!llamaService) {
      return res.status(StatusCodes.SERVICE_UNAVAILABLE).json({
        error: 'Llama 3 service is not available'
      });
    }

    const success = await llamaService.pullModel(modelName);
    
    if (success) {
      res.json({
        message: `Model ${modelName} pulled successfully`,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: `Failed to pull model ${modelName}`
      });
    }

  } catch (error) {
    console.error('Error pulling model:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      error: 'Failed to pull model',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;


