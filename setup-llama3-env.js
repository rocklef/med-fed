import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Setting up Llama3 Medical Assistant Environment...\n');

// Create server .env file if it doesn't exist
const serverEnvPath = path.join(__dirname, 'server', '.env');
const serverEnvExamplePath = path.join(__dirname, 'server', 'env.example');

if (!fs.existsSync(serverEnvPath)) {
    if (fs.existsSync(serverEnvExamplePath)) {
        fs.copyFileSync(serverEnvExamplePath, serverEnvPath);
        console.log('✅ Created server/.env from env.example');
    } else {
        // Create basic .env file
        const envContent = `# Server Configuration
PORT=4000
FRONTEND_ORIGIN=http://localhost:8080

# API Key for authentication
API_KEY=your-secret-api-key-here

# Llama 3 Configuration
LLAMA_API_URL=http://localhost:11434
LLAMA_MODEL_PATH=llama3:latest
LLAMA_CONTEXT_LENGTH=4096
LLAMA_TEMPERATURE=0.7
LLAMA_TOP_P=0.9
LLAMA_MAX_TOKENS=2048
LLAMA_API_KEY=
LLAMA_SYSTEM_PROMPT=You are a medical AI assistant trained on medical datasets. Provide evidence-based medical information, clinical decision support, and analysis. Always emphasize that your responses are for educational and decision support purposes only, and should not replace professional medical judgment.

# Database configurations (optional for basic usage)
HOSPITAL1_DB_HOST=localhost
HOSPITAL1_DB_PORT=5432
HOSPITAL1_DB_NAME=fmed_h1
HOSPITAL1_DB_USER=fmed
HOSPITAL1_DB_PASSWORD=
HOSPITAL1_DB_SSL=false
`;
        fs.writeFileSync(serverEnvPath, envContent);
        console.log('✅ Created server/.env file');
    }
} else {
    console.log('ℹ️  server/.env already exists');
}

// Create frontend .env.local file if it doesn't exist
const frontendEnvPath = path.join(__dirname, '.env.local');
if (!fs.existsSync(frontendEnvPath)) {
    const frontendEnvContent = `# Frontend Configuration
VITE_API_URL=http://localhost:4000
`;
    fs.writeFileSync(frontendEnvPath, frontendEnvContent);
    console.log('✅ Created .env.local file');
} else {
    console.log('ℹ️  .env.local already exists');
}

console.log('\n📋 Next Steps:');
console.log('1. Install and start Ollama:');
console.log('   - Download from: https://ollama.ai/');
console.log('   - Run: ollama serve');
console.log('   - Run: ollama pull llama3:latest');
console.log('');
console.log('2. Install dependencies:');
console.log('   - Backend: cd server && npm install');
console.log('   - Frontend: npm install');
console.log('');
console.log('3. Start the application:');
console.log('   - Option A: Use startup script: start-llama3-medical-assistant.bat');
console.log('   - Option B: Manual start:');
console.log('     * Backend: cd server && npm run dev');
console.log('     * Frontend: npm run dev');
console.log('');
console.log('4. Test the integration:');
console.log('   - Run: node test-llama3-integration.js');
console.log('');
console.log('5. Open your browser to the frontend URL (usually http://localhost:8080)');
console.log('');
console.log('🎉 Setup complete! Your Llama3 Medical Assistant is ready to use.');
