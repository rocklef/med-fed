import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

console.log('🔍 Current Database State\n');
console.log('=' .repeat(50));

// Count patients
const patientCount = db.prepare('SELECT COUNT(*) as count FROM patients').get();
console.log(`📊 Total Patients: ${patientCount.count}\n`);

// List all patients
if (patientCount.count > 0) {
  console.log('👥 Patient List:');
  console.log('-'.repeat(50));
  const patients = db.prepare('SELECT id, firstName, lastName, dob, gender FROM patients ORDER BY id').all();
  patients.forEach((p: any) => {
    console.log(`ID: ${p.id} | ${p.firstName} ${p.lastName} | DOB: ${p.dob} | ${p.gender}`);
  });
  console.log('-'.repeat(50));
} else {
  console.log('⚠️  No patients found in database\n');
}

// Check query history
const queryCount = db.prepare('SELECT COUNT(*) as count FROM query_history').get();
console.log(`\n📝 Query History Records: ${queryCount.count}`);

// Check medical knowledge
const knowledgeCount = db.prepare('SELECT COUNT(*) as count FROM medical_knowledge').get();
console.log(`📚 Medical Knowledge Entries: ${knowledgeCount.count}\n`);

db.close();
console.log('✅ Database check complete!\n');

