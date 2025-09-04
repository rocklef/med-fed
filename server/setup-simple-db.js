const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');

// Simple database setup without passwords
const databases = [
  { name: 'Hospital 1', config: { host: 'localhost', port: 5432, database: 'fmed_h1', user: 'postgres' } },
  { name: 'Hospital 2', config: { host: 'localhost', port: 5432, database: 'fmed_h2', user: 'postgres' } },
  { name: 'Hospital 3', config: { host: 'localhost', port: 5432, database: 'fmed_h3', user: 'postgres' } },
  { name: 'Aggregator', config: { host: 'localhost', port: 5432, database: 'fmed_aggregator', user: 'postgres' } }
];

async function setupSimpleDatabase() {
  console.log('🚀 Setting up medical RAG databases (simple mode)...\n');

  // First, create databases using postgres user
  const adminPool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'postgres',
    user: 'postgres'
  });

  try {
    console.log('📡 Connecting to PostgreSQL as postgres user...');
    const adminClient = await adminPool.connect();
    console.log('✅ Connected to PostgreSQL');

    // Create databases
    for (const db of databases) {
      console.log(`📊 Creating database "${db.config.database}"...`);
      try {
        await adminClient.query(`CREATE DATABASE ${db.config.database};`);
        console.log(`✅ Database "${db.config.database}" created`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`⚠️ Database "${db.config.database}" already exists`);
        } else {
          console.error(`❌ Failed to create database "${db.config.database}":`, error.message);
        }
      }
    }

    adminClient.release();
    await adminPool.end();
    console.log('\n🎯 Database creation complete! Now setting up schemas...\n');

    // Now set up schemas in each database
    await setupSchemas();

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.log('\n💡 Make sure PostgreSQL is running and accessible.');
    console.log('   You may need to configure PostgreSQL authentication.');
  }
}

async function setupSchemas() {
  for (const db of databases) {
    try {
      console.log(`📊 Setting up schema for ${db.name} (${db.config.database})...`);
      
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

setupSimpleDatabase().catch(console.error);
