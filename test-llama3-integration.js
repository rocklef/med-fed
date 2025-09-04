// Test script for Llama3 Medical Assistant Integration
const API_URL = 'http://localhost:4000';

async function testLlama3Integration() {
    console.log('🧪 Testing Llama3 Medical Assistant Integration...\n');

    // Test 1: Check service status
    console.log('1️⃣ Testing service status...');
    try {
        const response = await fetch(`${API_URL}/api/assistant/status`);
        const status = await response.json();
        console.log('✅ Service Status:', status);
    } catch (error) {
        console.log('❌ Service status failed:', error.message);
    }

    console.log('\n');

    // Test 2: Simple chat query
    console.log('2️⃣ Testing simple chat query...');
    try {
        const response = await fetch(`${API_URL}/api/assistant/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // 'x-api-key': 'your-secret-api-key-here' // Uncomment if needed
            },
            body: JSON.stringify({
                message: 'What are the symptoms of diabetes?',
                context: 'medical_assistant',
                queryType: 'general'
            })
        });
        
        const data = await response.json();
        if (response.ok) {
            console.log('✅ Chat response received:');
            console.log('Response:', data.response.substring(0, 200) + '...');
            console.log('Confidence:', data.confidence);
            console.log('Processing time:', data.processingTime + 'ms');
            console.log('Model used:', data.modelUsed);
        } else {
            console.log('❌ Chat failed:', data.error);
        }
    } catch (error) {
        console.log('❌ Chat test failed:', error.message);
    }

    console.log('\n');

    // Test 3: Diagnosis query
    console.log('3️⃣ Testing diagnosis query...');
    try {
        const response = await fetch(`${API_URL}/api/assistant/diagnosis`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // 'x-api-key': 'your-secret-api-key-here' // Uncomment if needed
            },
            body: JSON.stringify({
                symptoms: 'chest pain, shortness of breath, fatigue',
                patientContext: {
                    age: 45,
                    gender: 'male',
                    medicalHistory: 'hypertension'
                }
            })
        });
        
        const data = await response.json();
        if (response.ok) {
            console.log('✅ Diagnosis response received:');
            console.log('Diagnosis:', data.diagnosis.substring(0, 200) + '...');
            console.log('Confidence:', data.confidence);
        } else {
            console.log('❌ Diagnosis failed:', data.error);
        }
    } catch (error) {
        console.log('❌ Diagnosis test failed:', error.message);
    }

    console.log('\n');

    // Test 4: Treatment query
    console.log('4️⃣ Testing treatment query...');
    try {
        const response = await fetch(`${API_URL}/api/assistant/treatment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // 'x-api-key': 'your-secret-api-key-here' // Uncomment if needed
            },
            body: JSON.stringify({
                condition: 'Type 2 diabetes',
                patientContext: {
                    age: 55,
                    weight: 85,
                    allergies: ['penicillin']
                }
            })
        });
        
        const data = await response.json();
        if (response.ok) {
            console.log('✅ Treatment response received:');
            console.log('Treatment:', data.treatment.substring(0, 200) + '...');
            console.log('Confidence:', data.confidence);
        } else {
            console.log('❌ Treatment failed:', data.error);
        }
    } catch (error) {
        console.log('❌ Treatment test failed:', error.message);
    }

    console.log('\n');

    // Test 5: Health check
    console.log('5️⃣ Testing health endpoint...');
    try {
        const response = await fetch(`${API_URL}/health`);
        const data = await response.json();
        console.log('✅ Health check:', data);
    } catch (error) {
        console.log('❌ Health check failed:', error.message);
    }

    console.log('\n🎉 Integration tests completed!');
    console.log('\n📋 Setup Instructions:');
    console.log('1. Make sure Ollama is running: ollama serve');
    console.log('2. Pull Llama3 model: ollama pull llama3:latest');
    console.log('3. Start backend: cd server && npm run dev');
    console.log('4. Start frontend: npm run dev');
    console.log('5. Open http://localhost:8080 in your browser');
}

// Check if running in Node.js environment
if (typeof fetch === 'undefined') {
    console.log('❌ This script requires Node.js 18+ with fetch support or a browser environment');
    console.log('Run with: node --experimental-fetch test-llama3-integration.js');
    console.log('Or run in a browser console');
} else {
    testLlama3Integration();
}
