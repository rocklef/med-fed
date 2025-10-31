import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database file path
const dbPath = join(__dirname, 'database.sqlite');
console.log('Database path:', dbPath);

const db = new Database(dbPath);

// Get table names
console.log('\nTables in database:');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
tables.forEach(table => {
  console.log('- ' + table.name);
});

// Get schema for patients table
console.log('\nSchema for patients table:');
const schema = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='patients'").get();
if (schema) {
  console.log(schema.sql);
}

// Get row count
console.log('\nPatient records:');
const count = db.prepare('SELECT COUNT(*) as count FROM patients').get();
console.log('Total patients:', count.count);

// Get first few records
if (count.count > 0) {
  console.log('\nFirst 3 patients:');
  const patients = db.prepare('SELECT * FROM patients LIMIT 3').all();
  patients.forEach(patient => {
    console.log(JSON.stringify(patient, null, 2));
  });
}

db.close();