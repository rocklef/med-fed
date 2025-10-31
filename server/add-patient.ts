import 'dotenv/config';
import { initializeDatabase, createPatient, getAllPatients } from './src/services/databaseService';

// Simple command-line script to add a new patient
async function addPatient() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: npm run add-patient -- <firstName> <lastName> <dob> <gender> [options]');
    console.log('\nRequired fields:');
    console.log('  firstName: Patient first name');
    console.log('  lastName: Patient last name');
    console.log('  dob: Date of birth (YYYY-MM-DD)');
    console.log('  gender: male, female, or other');
    console.log('\nOptional fields (as JSON):');
    console.log('  --contact "phone number"');
    console.log('  --email "email@example.com"');
    console.log('  --address "Street address"');
    console.log('  --conditions "condition1,condition2"');
    console.log('  --medications "med1,med2"');
    console.log('  --notes "Additional notes"');
    console.log('\nExample:');
    console.log('  npm run add-patient -- John Smith 1980-01-15 male --email john@example.com --conditions "Hypertension,Diabetes"');
    process.exit(1);
  }

  try {
    // Initialize database
    initializeDatabase();

    // Parse arguments
    const firstName = args[0];
    const lastName = args[1];
    const dob = args[2];
    const gender = args[3];

    if (!firstName || !lastName || !dob || !gender) {
      console.error('❌ Error: Missing required fields');
      process.exit(1);
    }

    // Validate gender
    if (!['male', 'female', 'other'].includes(gender.toLowerCase())) {
      console.error('❌ Error: Gender must be "male", "female", or "other"');
      process.exit(1);
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
      console.error('❌ Error: Date must be in YYYY-MM-DD format');
      process.exit(1);
    }

    // Parse optional arguments
    let contactNumber, email, address, conditions = [], medications = [], notes = '';
    
    for (let i = 4; i < args.length; i++) {
      const arg = args[i];
      
      if (arg === '--contact' && args[i + 1]) {
        contactNumber = args[++i];
      } else if (arg === '--email' && args[i + 1]) {
        email = args[++i];
      } else if (arg === '--address' && args[i + 1]) {
        address = args[++i];
      } else if (arg === '--conditions' && args[i + 1]) {
        conditions = args[++i].split(',').map(c => c.trim()).filter(c => c);
      } else if (arg === '--medications' && args[i + 1]) {
        medications = args[++i].split(',').map(m => m.trim()).filter(m => m);
      } else if (arg === '--notes' && args[i + 1]) {
        notes = args[++i];
      }
    }

    // Create patient
    const patientId = createPatient({
      firstName,
      lastName,
      dob: new Date(dob),
      gender: gender.toLowerCase() as 'male' | 'female' | 'other',
      contactNumber,
      email,
      address,
      conditions,
      medications,
      notes
    });

    console.log(`\n✅ Patient added successfully!`);
    console.log(`   ID: ${patientId}`);
    console.log(`   Name: ${firstName} ${lastName}`);
    console.log(`   DOB: ${dob}`);
    console.log(`   Gender: ${gender}`);
    
    if (contactNumber) console.log(`   Contact: ${contactNumber}`);
    if (email) console.log(`   Email: ${email}`);
    if (address) console.log(`   Address: ${address}`);
    if (conditions.length > 0) console.log(`   Conditions: ${conditions.join(', ')}`);
    if (medications.length > 0) console.log(`   Medications: ${medications.join(', ')}`);
    if (notes) console.log(`   Notes: ${notes}`);

    // Show total patients
    const allPatients = getAllPatients();
    console.log(`\n📊 Total patients in database: ${allPatients.length}`);

  } catch (error) {
    console.error('❌ Error adding patient:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

addPatient();

