# Llama3 Integration Setup Guide

## Overview

Your medical assistant frontend is already integrated with Llama3! This guide helps you get everything running properly.

## Prerequisites

1. **Ollama Installation**
   - Download and install Ollama from: https://ollama.ai/
   - Ensure Ollama is running on `http://localhost:11434`

2. **Llama3 Model**
   - Pull the Llama3 model: `ollama pull llama3:latest`
   - Or use a medical-specific model if available

## Backend Configuration

1. **Environment Setup**
   ```bash
   cd server
   cp env.example .env
   ```

2. **Configure Llama3 Settings in `.env`**
   ```env
   # Llama 3 Configuration
   LLAMA_API_URL=http://localhost:11434
   LLAMA_MODEL_PATH=llama3:latest
   LLAMA_CONTEXT_LENGTH=4096
   LLAMA_TEMPERATURE=0.7
   LLAMA_TOP_P=0.9
   LLAMA_MAX_TOKENS=2048
   LLAMA_SYSTEM_PROMPT=You are a medical AI assistant trained on medical datasets. Provide evidence-based medical information, clinical decision support, and analysis. Always emphasize that your responses are for educational and decision support purposes only, and should not replace professional medical judgment.
   ```

3. **Install Dependencies**
   ```bash
   cd server
   npm install
   ```

## Frontend Configuration

1. **Environment Setup**
   ```bash
   # In root directory
   cp .env.example .env.local  # if it exists, or create new
   ```

2. **Set API URL** (in `.env.local` or directly in code)
   ```env
   VITE_API_URL=http://localhost:4000
   ```

## Running the Application

1. **Start Ollama**
   ```bash
   ollama serve
   ```

2. **Pull Llama3 Model** (if not already done)
   ```bash
   ollama pull llama3:latest
   ```

3. **Start Backend Server**
   ```bash
   cd server
   npm run dev
   ```

4. **Start Frontend**
   ```bash
   npm run dev
   ```

5. **Access the Application**
   - Frontend: http://localhost:8080 (or the port shown in terminal)
   - Backend API: http://localhost:4000

## API Endpoints Available

### Chat Endpoint
- `POST /api/assistant/chat`
- Supports both streaming and non-streaming responses
- Includes medical context and patient data

### Specialized Endpoints
- `POST /api/assistant/diagnosis` - Differential diagnosis
- `POST /api/assistant/treatment` - Treatment recommendations
- `POST /api/assistant/analyze` - Medical data analysis
- `GET /api/assistant/status` - Service status check
- `POST /api/assistant/models/pull` - Pull new models

## Features

✅ **Already Implemented:**
- Complete Llama3 integration with Ollama
- Medical-specific prompt engineering
- Streaming and non-streaming responses
- Error handling with fallback responses
- Patient context integration
- Multiple query types (diagnosis, treatment, analysis, etc.)
- Confidence scoring
- Response time tracking
- Model management

## Testing the Integration

1. **Check Backend Status**
   ```bash
   curl http://localhost:4000/api/assistant/status
   ```

2. **Test Chat Endpoint**
   ```bash
   curl -X POST http://localhost:4000/api/assistant/chat \
     -H "Content-Type: application/json" \
     -H "x-api-key: your-secret-api-key-here" \
     -d '{
       "message": "What are the symptoms of diabetes?",
       "queryType": "general"
     }'
   ```

## Troubleshooting

### Common Issues

1. **Ollama Not Running**
   - Error: "Failed to connect to Ollama API"
   - Solution: Start Ollama with `ollama serve`

2. **Model Not Found**
   - Error: "Model not found"
   - Solution: Pull the model with `ollama pull llama3:latest`

3. **API Key Issues**
   - Error: "Unauthorized"
   - Solution: Set the correct API_KEY in server/.env and use it in frontend requests

4. **CORS Issues**
   - Error: CORS policy blocked
   - Solution: Ensure FRONTEND_ORIGIN is set correctly in server/.env

### Mock Mode

If Ollama is not available, the system automatically falls back to mock responses for development purposes.

## Advanced Configuration

### Using Different Models
```env
LLAMA_MODEL_PATH=llama3:8b-instruct-q4_0  # Smaller, faster model
LLAMA_MODEL_PATH=llama3:70b-instruct       # Larger, more accurate model
```

### Medical-Specific Models
Consider using medical-specific models if available:
```env
LLAMA_MODEL_PATH=medllama:latest           # If available
```

### Performance Tuning
```env
LLAMA_CONTEXT_LENGTH=8192    # Increase for longer conversations
LLAMA_TEMPERATURE=0.3        # Lower for more consistent medical advice
LLAMA_MAX_TOKENS=4096        # Increase for longer responses
```

## Security Notes

- Always use API keys in production
- Never expose sensitive medical data in logs
- Implement proper rate limiting
- Use HTTPS in production
- Regularly update models and dependencies

## Medical Disclaimer

This AI assistant provides clinical decision support only. Always verify information and use clinical judgment. Not a replacement for professional medical advice.
