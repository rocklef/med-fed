import http from 'http';

async function testRAGSystem() {
  console.log('🧪 Testing Medical RAG System...\n');

  // Test 1: Health Check
  console.log('1️⃣ Testing Health Check...');
  try {
    const healthResponse = await makeRequest('GET', '/api/rag/health');
    console.log('✅ Health Check:', healthResponse);
  } catch (error) {
    console.log('❌ Health Check failed:', error.message);
  }

  // Test 2: Medical Query
  console.log('\n2️⃣ Testing Medical Query...');
  try {
    const queryData = {
      query: "What are the treatment options for hypertension?",
      contextType: "all"
    };
    
    const queryResponse = await makeRequest('POST', '/api/rag/query', queryData);
    console.log('✅ Medical Query Response:');
    console.log('Query:', queryResponse.data.query);
    console.log('Response:', queryResponse.data.response.substring(0, 200) + '...');
    console.log('Confidence:', queryResponse.data.confidence);
    console.log('Sources:', queryResponse.data.sources.length, 'sources found');
  } catch (error) {
    console.log('❌ Medical Query failed:', error.message);
  }

  // Test 3: Patient-specific Query
  console.log('\n3️⃣ Testing Patient-specific Query...');
  try {
    const patientQueryData = {
      query: "Tell me about John Smith's medical history",
      contextType: "patient_data"
    };
    
    const patientResponse = await makeRequest('POST', '/api/rag/query', patientQueryData);
    console.log('✅ Patient Query Response:');
    console.log('Query:', patientResponse.data.query);
    console.log('Response:', patientResponse.data.response.substring(0, 200) + '...');
    console.log('Confidence:', patientResponse.data.confidence);
  } catch (error) {
    console.log('❌ Patient Query failed:', error.message);
  }
}

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 4000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'your-secret-api-key-here'
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsedData);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${parsedData.error || 'Unknown error'}`));
          }
        } catch (error) {
          reject(new Error('Invalid JSON response'));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Run the tests
testRAGSystem().catch(console.error);
