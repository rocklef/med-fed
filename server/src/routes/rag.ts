import { Router, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';
import { getLlamaService } from '../services/llamaService';
import {
  storeQueryHistory,
  searchMedicalKnowledge,
  searchPatientsByName,
  getQueryHistory
} from '../services/databaseService';

const router = Router();

const ragQuerySchema = z.object({
  query: z.string().min(1),
  contextType: z.enum(['all', 'patient_data', 'medical_knowledge', 'general']).default('all')
});

// Health check endpoint
router.get('/health', async (_req: Request, res: Response) => {
  try {
    const llamaService = getLlamaService();
    const dbStatus = 'connected'; // We can add a ping test if needed
    
    res.json({
      status: 'ok',
      database: dbStatus,
      llama: llamaService?.getStatus().ready ? 'ready' : 'unavailable',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Main RAG query endpoint
router.post('/query', async (req: Request, res: Response) => {
  try {
    const parsed = ragQuerySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: 'Invalid request data',
        details: parsed.error.flatten()
      });
    }

    const { query, contextType } = parsed.data;
    const startTime = Date.now();

    // Get Llama service
    const llamaService = getLlamaService();
    const isLlamaAvailable = llamaService?.getStatus().ready;

    // Retrieve relevant knowledge from database
    let retrievedSources: any[] = [];
    let patientData = null;

    if (contextType === 'patient_data' || contextType === 'all') {
      // Try to extract patient name from query
      const nameMatch = query.match(/(?:patient|patient's|for)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
      if (nameMatch) {
        const patientName = nameMatch[1];
        const patients = searchPatientsByName(patientName);
        if (patients.length > 0) {
          patientData = patients[0];
        }
      }
    }

    if (contextType === 'medical_knowledge' || contextType === 'all') {
      // Search medical knowledge base
      retrievedSources = searchMedicalKnowledge(query, 5);
    }

    // Build context for LLM
    let contextForLLM = '';
    if (patientData) {
      contextForLLM += `Patient Information:\n`;
      contextForLLM += `Name: ${patientData.firstName} ${patientData.lastName}\n`;
      contextForLLM += `DOB: ${patientData.dob.toISOString().split('T')[0]}\n`;
      contextForLLM += `Gender: ${patientData.gender}\n`;
      if (patientData.conditions.length > 0) {
        contextForLLM += `Conditions: ${patientData.conditions.join(', ')}\n`;
      }
      if (patientData.medications.length > 0) {
        contextForLLM += `Medications: ${patientData.medications.join(', ')}\n`;
      }
      if (patientData.notes) {
        contextForLLM += `Notes: ${patientData.notes}\n`;
      }
      contextForLLM += '\n';
    }

    if (retrievedSources.length > 0) {
      contextForLLM += `Relevant Medical Knowledge:\n`;
      retrievedSources.forEach((source, idx) => {
        contextForLLM += `\n[Source ${idx + 1}] ${source.title}\n`;
        contextForLLM += `${source.content.substring(0, 300)}...\n`;
      });
      contextForLLM += '\n';
    }

    // Generate response using Llama if available, otherwise use fallback
    let response: string;
    let confidence = 0.7;
    let tokensUsed = 0;
    let modelUsed = 'fallback';

    if (isLlamaAvailable && llamaService) {
      try {
        const medicalQuery = {
          query: contextForLLM ? `${contextForLLM}\n\nUser Question: ${query}` : query,
          queryType: 'general' as const,
          context: {
            patientData: patientData ? {
              age: patientData.dob ? Math.floor((Date.now() - patientData.dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : undefined,
              gender: patientData.gender,
              medications: patientData.medications,
              medicalHistory: patientData.notes
            } : undefined,
            medicalHistory: contextForLLM || 'general_query'
          }
        };

        const llamaResponse = await llamaService.query(medicalQuery);
        response = llamaResponse.response;
        confidence = llamaResponse.confidence || 0.7;
        tokensUsed = llamaResponse.tokensUsed || 0;
        modelUsed = llamaResponse.modelUsed || 'llama3';
      } catch (error) {
        console.error('Error calling Llama service:', error);
        response = generateFallbackResponse(query, retrievedSources, patientData);
      }
    } else {
      response = generateFallbackResponse(query, retrievedSources, patientData);
    }

    const processingTime = Date.now() - startTime;

    // Store query in history
    try {
      storeQueryHistory({
        query,
        response,
        contextType,
        confidence,
        sources: retrievedSources.map(s => s.title || s.content.substring(0, 100)),
        patientId: patientData?.id,
        queryType: 'rag',
        tokensUsed,
        processingTime
      });
    } catch (error) {
      console.warn('Failed to store query history:', error);
    }

    res.json({
      data: {
        query,
        response,
        confidence,
        sources: retrievedSources.map(s => ({
          title: s.title,
          content: s.content.substring(0, 200),
          category: s.category,
          source: s.source
        })),
        patientData: patientData ? {
          id: patientData.id,
          name: `${patientData.firstName} ${patientData.lastName}`,
          conditions: patientData.conditions,
          medications: patientData.medications
        } : null,
        tokensUsed,
        modelUsed,
        processingTime
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in RAG query endpoint:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: 'Failed to process RAG query',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get query history
router.get('/history', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const patientId = req.query.patientId ? parseInt(req.query.patientId as string) : undefined;

    const history = getQueryHistory(limit, patientId);

    res.json({
      history,
      count: history.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching query history:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: 'Failed to fetch query history',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Helper function to generate fallback response when LLM is unavailable
function generateFallbackResponse(
  query: string,
  sources: any[],
  patientData: any
): string {
  let response = 'Based on the available information:\n\n';

  if (patientData) {
    response += `For patient ${patientData.firstName} ${patientData.lastName}:\n`;
  }

  if (sources.length > 0) {
    response += `I found ${sources.length} relevant source(s) in the medical knowledge base:\n\n`;
    sources.forEach((source, idx) => {
      response += `${idx + 1}. ${source.title}\n`;
      response += `   ${source.content.substring(0, 200)}...\n\n`;
    });
    response += 'Please consult with a healthcare professional for personalized medical advice.\n';
  } else {
    response += 'I couldn\'t find specific information in the knowledge base for this query. ';
    response += 'Please consult with a healthcare professional for accurate medical advice.\n';
  }

  response += '\nNote: This is a basic response. For more detailed analysis, please ensure the AI service is available.';

  return response;
}

export default router;

