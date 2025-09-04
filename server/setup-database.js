const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');

// Database configurations
const databases = [
  { name: 'Hospital 1', config: { host: 'localhost', port: 5432, database: 'fmed_h1', user: 'postgres', password: 'n2pyy3x5sd' } },
  { name: 'Hospital 2', config: { host: 'localhost', port: 5432, database: 'fmed_h2', user: 'postgres', password: 'n2pyy3x5sd' } },
  { name: 'Hospital 3', config: { host: 'localhost', port: 5432, database: 'fmed_h3', user: 'postgres', password: 'n2pyy3x5sd' } },
  { name: 'Aggregator', config: { host: 'localhost', port: 5432, database: 'fmed_agg', user: 'postgres', password: 'n2pyy3x5sd' } }
];

async function setupDatabase() {
  console.log('🚀 Setting up medical RAG databases...\n');

  for (const db of databases) {
    try {
      console.log(`📊 Setting up ${db.name} database...`);
      const pool = new Pool(db.config);
      
      // Read and execute schema
      const schemaPath = path.join(__dirname, 'database/schema.sql');
      const schema = await fs.readFile(schemaPath, 'utf8');
      await pool.query(schema);
      console.log(`✅ Schema created for ${db.name}`);

      // Read and execute seed data
      const seedPath = path.join(__dirname, 'database/seed-data.sql');
      const seedData = await fs.readFile(seedPath, 'utf8');
      await pool.query(seedData);
      console.log(`✅ Seed data inserted for ${db.name}`);

      await pool.end();
      console.log(`🎉 ${db.name} database setup complete!\n`);
    } catch (error) {
      console.error(`❌ Failed to setup ${db.name}:`, error.message);
    }
  }

  console.log('🎯 All databases setup complete! You can now start the server.');
}

setupDatabase().catch(console.error);
