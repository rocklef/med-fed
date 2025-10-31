import http from 'http';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function makeRequest(method: string, path: string, data: any = null): Promise<any> {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 4000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
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
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
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

async function addPatientInteractive() {
  console.log('👤 Add New Patient Record\n');
  console.log('Please provide the following information:\n');

  try {
    const firstName = await question('First Name: ');
    const lastName = await question('Last Name: ');
    const dob = await question('Date of Birth (YYYY-MM-DD): ');
    const gender = await question('Gender (male/female/other): ');
    const contactNumber = await question('Contact Number (optional): ');
    const email = await question('Email (optional): ');
    const address = await question('Address (optional): ');
    const conditionsInput = await question('Medical Conditions (comma-separated, optional): ');
    const medicationsInput = await question('Medications (comma-separated, optional): ');
    const notes = await question('Notes (optional): ');

    const conditions = conditionsInput.trim() ? conditionsInput.split(',').map(c => c.trim()) : [];
    const medications = medicationsInput.trim() ? medicationsInput.split(',').map(m => m.trim()) : [];

    const patientData = {
      firstName,
      lastName,
      dob,
      gender: gender.toLowerCase(),
      contactNumber: contactNumber.trim() || undefined,
      email: email.trim() || undefined,
      address: address.trim() || undefined,
      conditions,
      medications,
      notes: notes.trim() || ''
    };

    console.log('\n⏳ Adding patient to database...\n');

    const response = await makeRequest('POST', '/api/patients', patientData);

    console.log('✅ Patient added successfully!\n');
    console.log('Patient Details:');
    console.log(`  ID: ${response.id}`);
    console.log(`  Name: ${response.firstName} ${response.lastName}`);
    console.log(`  DOB: ${response.dob}`);
    console.log(`  Gender: ${response.gender}`);
    if (response.contactNumber) console.log(`  Contact: ${response.contactNumber}`);
    if (response.email) console.log(`  Email: ${response.email}`);
    if (response.address) console.log(`  Address: ${response.address}`);
    if (response.conditions.length > 0) console.log(`  Conditions: ${response.conditions.join(', ')}`);
    if (response.medications.length > 0) console.log(`  Medications: ${response.medications.join(', ')}`);
    if (response.notes) console.log(`  Notes: ${response.notes}`);

    // Show total patients
    const allPatients = await makeRequest('GET', '/api/patients');
    console.log(`\n📊 Total patients in database: ${allPatients.length}`);

  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    if (error instanceof Error && error.message.includes('HTTP')) {
      console.error('Make sure the server is running on http://localhost:4000');
    }
  } finally {
    rl.close();
  }
}

addPatientInteractive();

