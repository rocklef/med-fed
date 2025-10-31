import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:4000/api';

async function testPatientQuery() {
  console.log('Testing patient-specific medical query...\n');
  
  try {
    // First, get patient data
    const patientResponse = await fetch(`${API_BASE_URL}/patients/2`);
    if (!patientResponse.ok) {
      console.log('❌ Failed to retrieve patient data');
      return;
    }
    
    const patient = await patientResponse.json();
    console.log(`Patient: ${patient.firstName} ${patient.lastName}`);
    console.log(`Conditions: ${patient.conditions.join(', ')}`);
    console.log(`Medications: ${patient.medications.join(', ')}\n`);
    
    // Now, create a patient-specific query
    const query = {
      message: "What lifestyle changes would you recommend for a patient with hypertension and diabetes?",
      context: "medical_assistant",
      queryType: "treatment",
      patientData: {
        age: new Date().getFullYear() - new Date(patient.dob).getFullYear(),
        gender: patient.gender,
        conditions: patient.conditions,
        medications: patient.medications,
        medicalHistory: patient.notes
      }
    };
    
    console.log('Sending patient-specific query to medical assistant...\n');
    
    const assistantResponse = await fetch(`${API_BASE_URL}/assistant/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(query)
    });
    
    if (assistantResponse.ok) {
      const result = await assistantResponse.json();
      console.log('✅ Medical assistant response received:');
      console.log('\n--- Response ---\n');
      console.log(result.response.substring(0, 800) + '...'); // Truncate for readability
      console.log('\n--- End Response ---\n');
    } else {
      const error = await assistantResponse.json();
      console.log('❌ Failed to get response from medical assistant:', error);
    }
  } catch (error) {
    console.log('❌ Error during test:', error.message);
  }
}

testPatientQuery();