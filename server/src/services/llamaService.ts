import { EventEmitter } from 'events';

export interface LlamaConfig {
  modelPath: string;
  contextLength?: number;
  temperature?: number;
  topP?: number;
  maxTokens?: number;
  systemPrompt?: string;
  apiUrl?: string;
  apiKey?: string;
}

export interface MedicalQuery {
  query: string;
  context?: {
    patientData?: any;
    medicalHistory?: string;
    labResults?: any;
    imagingData?: any;
  };
  queryType: 'diagnosis' | 'treatment' | 'analysis' | 'general';
}

export interface LlamaResponse {
  response: string;
  confidence: number;
  processingTime: number;
  tokensUsed: number;
}

export class LlamaService extends EventEmitter {
  private config: LlamaConfig;
  private isReady = false;
  private queue: Array<{
    query: MedicalQuery;
    resolve: (response: LlamaResponse) => void;
    reject: (error: Error) => void;
  }> = [];
  private processing = false;

  constructor(config: LlamaConfig) {
    super();
    this.config = {
      contextLength: 4096,
      temperature: 0.7,
      topP: 0.9,
      maxTokens: 2048,
      apiUrl: 'http://localhost:11434',
      systemPrompt: `You are a medical AI assistant trained on medical datasets. Provide evidence-based medical information, clinical decision support, and analysis. Always emphasize that your responses are for educational and decision support purposes only, and should not replace professional medical judgment.`,
      ...config
    };
  }

  async initialize(): Promise<void> {
    try {
      console.log('Initializing Llama 3 service...');
      
      // Test connection to Llama API
      const testResponse = await this.testConnection();
      if (testResponse) {
        this.isReady = true;
        this.emit('ready');
        console.log('Llama 3 service initialized successfully');
      } else {
        throw new Error('Failed to connect to Llama 3 API');
      }

    } catch (error) {
      console.error('Failed to initialize Llama service:', error);
      throw error;
    }
  }

  private async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.apiUrl}/api/tags`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Available models:', data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;
    
    while (this.queue.length > 0) {
      const { query, resolve, reject } = this.queue.shift()!;
      
      try {
        const response = await this.processQuery(query);
        resolve(response);
      } catch (error) {
        reject(error as Error);
      }
    }
    
    this.processing = false;
  }

  private async processQuery(query: MedicalQuery): Promise<LlamaResponse> {
    if (!this.isReady) {
      throw new Error('Llama service not ready');
    }

    const startTime = Date.now();
    
    // Construct medical prompt
    const prompt = this.constructMedicalPrompt(query);
    
    try {
      // Make API call to Llama 3
      const response = await fetch(`${this.config.apiUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        },
        body: JSON.stringify({
          model: this.config.modelPath,
          prompt: prompt,
          stream: false,
          options: {
            temperature: this.config.temperature,
            top_p: this.config.topP,
            num_predict: this.config.maxTokens,
            repeat_penalty: 1.1
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Llama API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const processingTime = Date.now() - startTime;
      const confidence = this.calculateConfidence(data.response);
      
      return {
        response: data.response,
        confidence,
        processingTime,
        tokensUsed: data.eval_count || 0
      };

    } catch (error) {
      console.error('Error calling Llama API:', error);
      throw error;
    }
  }

  private constructMedicalPrompt(query: MedicalQuery): string {
    const { query: userQuery, context, queryType } = query;
    
    let prompt = `${this.config.systemPrompt}\n\n`;
    
    // Add context if available
    if (context) {
      if (context.patientData) {
        prompt += `Patient Information:\n${JSON.stringify(context.patientData, null, 2)}\n\n`;
      }
      if (context.medicalHistory) {
        prompt += `Medical History:\n${context.medicalHistory}\n\n`;
      }
      if (context.labResults) {
        prompt += `Laboratory Results:\n${JSON.stringify(context.labResults, null, 2)}\n\n`;
      }
    }
    
    // Add query type-specific instructions
    switch (queryType) {
      case 'diagnosis':
        prompt += `Please provide a differential diagnosis for the following query. Consider multiple possibilities and their likelihood:\n`;
        break;
      case 'treatment':
        prompt += `Please provide evidence-based treatment recommendations for the following query:\n`;
        break;
      case 'analysis':
        prompt += `Please analyze the following medical data and provide clinical insights:\n`;
        break;
      default:
        prompt += `Please provide medical information for the following query:\n`;
    }
    
    prompt += `Query: ${userQuery}\n\nResponse:`;
    
    return prompt;
  }

  private calculateConfidence(response: string): number {
    // Simple confidence calculation based on response characteristics
    const hasReferences = /references?|sources?|studies?/i.test(response);
    const hasSpecifics = /\d+%|\d+\.\d+|\d+ mg|\d+ ml/i.test(response);
    const hasStructure = /•|\*|\d+\.|\[|\]/.test(response);
    
    let confidence = 0.5; // Base confidence
    
    if (hasReferences) confidence += 0.2;
    if (hasSpecifics) confidence += 0.15;
    if (hasStructure) confidence += 0.15;
    
    return Math.min(confidence, 1.0);
  }

  async query(query: MedicalQuery): Promise<LlamaResponse> {
    return new Promise((resolve, reject) => {
      this.queue.push({ query, resolve, reject });
      this.processQueue();
    });
  }

  async shutdown(): Promise<void> {
    this.isReady = false;
    console.log('Llama service shutdown');
  }

  getStatus(): { ready: boolean; queueLength: number; processing: boolean } {
    return {
      ready: this.isReady,
      queueLength: this.queue.length,
      processing: this.processing
    };
  }
}

// Singleton instance
let llamaService: LlamaService | null = null;

export function getLlamaService(): LlamaService | null {
  return llamaService;
}

export function initializeLlamaService(config: LlamaConfig): Promise<LlamaService> {
  if (llamaService) {
    return Promise.resolve(llamaService);
  }
  
  llamaService = new LlamaService(config);
  return llamaService.initialize().then(() => llamaService!);
}
