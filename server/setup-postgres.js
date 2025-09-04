const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');

// Connect to PostgreSQL as postgres user to create databases and user
const adminPool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: '' // Try no password first
});

// Database configurations
const databases = [
  { name: 'Hospital 1', dbName: 'fmed_h1' },
  { name: 'Hospital 2', dbName: 'fmed_h2' },
  { name: 'Hospital 3', dbName: 'fmed_h3' },
  { name: 'Aggregator', dbName: 'fmed_aggregator' }
];

async function setupPostgreSQL() {
  console.log('🚀 Setting up PostgreSQL for medical RAG system...\n');

  try {
    // Test admin connection
    console.log('📡 Testing admin connection...');
    const adminClient = await adminPool.connect();
    console.log('✅ Connected to PostgreSQL as admin');
    adminClient.release();

    // Create user if it doesn't exist
    console.log('👤 Creating user "fmed"...');
    try {
      await adminPool.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'fmed') THEN
            CREATE ROLE fmed WITH LOGIN PASSWORD 'password123';
          END IF;
        END
        $$;
      `);
      console.log('✅ User "fmed" created/verified');
    } catch (error) {
      console.log('⚠️ User creation error (may already exist):', error.message);
    }

    // Create databases
    for (const db of databases) {
      console.log(`📊 Creating database "${db.dbName}"...`);
      try {
        await adminPool.query(`CREATE DATABASE ${db.dbName} OWNER fmed;`);
        console.log(`✅ Database "${db.dbName}" created`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`⚠️ Database "${db.dbName}" already exists`);
        } else {
          console.error(`❌ Failed to create database "${db.dbName}":`, error.message);
        }
      }
    }

    await adminPool.end();
    console.log('\n🎯 PostgreSQL setup complete! Now setting up schemas...\n');

    // Now set up schemas in each database
    await setupSchemas();

  } catch (error) {
    console.error('❌ PostgreSQL setup failed:', error.message);
    console.log('\n💡 Make sure PostgreSQL is running and the postgres user password is correct.');
    console.log('   You may need to update the password in this script.');
  }
}

async function setupSchemas() {
  for (const db of databases) {
    try {
      console.log(`📊 Setting up schema for ${db.name} (${db.dbName})...`);
      
      const pool = new Pool({
        host: 'localhost',
        port: 5432,
        database: db.dbName,
        user: 'fmed',
        password: 'password123'
      });

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

setupPostgreSQL().catch(console.error);
