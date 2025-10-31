import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:4000/api';

// Sample patient data
const samplePatients = [
  {
    firstName: 'John',
    lastName: 'Smith',
    dob: '1955-03-15',
    gender: 'male',
    contactNumber: '+1-555-0101',
    email: 'john.smith@example.com',
    address: '123 Main St, Anytown, USA',
    conditions: ['Hypertension', 'Type 2 Diabetes'],
    medications: ['Metformin 500mg', 'Lisinopril 10mg'],
    notes: 'Patient has been managing diabetes for 5 years. Recently diagnosed with hypertension.'
  },
  {
    firstName: 'Sarah',
    lastName: 'Johnson',
    dob: '1980-07-22',
    gender: 'female',
    contactNumber: '+1-555-0102',
    email: 'sarah.johnson@example.com',
    address: '456 Oak Ave, Another City, USA',
    conditions: ['Asthma', 'Seasonal Allergies'],
    medications: ['Albuterol inhaler', 'Loratadine 10mg'],
    notes: 'Well-controlled asthma. Severe seasonal allergies during spring.'
  },
  {
    firstName: 'Robert',
    lastName: 'Williams',
    dob: '1945-11-08',
    gender: 'male',
    contactNumber: '+1-555-0103',
    email: 'robert.williams@example.com',
    address: '789 Pine Rd, Somewhere, USA',
    conditions: ['Heart Disease', 'High Cholesterol'],
    medications: ['Atorvastatin 20mg', 'Aspirin 81mg'],
    notes: 'History of heart attack 3 years ago. Regular cardiac follow-ups.'
  }
];

async function addSamplePatients() {
  console.log('Adding sample patients to the database...\n');
  
  for (let i = 0; i < samplePatients.length; i++) {
    const patient = samplePatients[i];
    
    try {
      const response = await fetch(`${API_BASE_URL}/patients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(patient)
      });
      
      if (response.ok) {
        const createdPatient = await response.json();
        console.log(`✅ Patient ${createdPatient.firstName} ${createdPatient.lastName} added successfully (ID: ${createdPatient.id})`);
      } else {
        const error = await response.json();
        console.log(`❌ Failed to add patient ${patient.firstName} ${patient.lastName}:`, error);
      }
    } catch (error) {
      console.log(`❌ Error adding patient ${patient.firstName} ${patient.lastName}:`, error.message);
    }
  }
  
  // Verify patients were added
  console.log('\nVerifying patients in database...');
  try {
    const response = await fetch(`${API_BASE_URL}/patients`);
    if (response.ok) {
      const patients = await response.json();
      console.log(`\n✅ Total patients in database: ${patients.length}`);
      console.log('\nPatient list:');
      patients.forEach(patient => {
        console.log(`- ${patient.firstName} ${patient.lastName}, DOB: ${patient.dob}, Conditions: ${patient.conditions.join(', ')}`);
      });
    } else {
      console.log('❌ Failed to retrieve patients');
    }
  } catch (error) {
    console.log('❌ Error retrieving patients:', error.message);
  }
}

addSamplePatients();