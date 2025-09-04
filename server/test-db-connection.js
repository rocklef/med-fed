const { Pool } = require('pg');

async function testConnection() {
  const config = {
    host: 'localhost',
    port: 5432,
    database: 'fmed_h1',
    user: 'postgres',
    password: 'n2pyy3x5sd'
  };

  console.log('🔍 Testing database connection...');
  console.log('Config:', config);

  try {
    const pool = new Pool(config);
    const client = await pool.connect();
    
    const result = await client.query('SELECT current_database(), current_user, version()');
    console.log('✅ Connection successful!');
    console.log('Database:', result.rows[0].current_database);
    console.log('User:', result.rows[0].current_user);
    console.log('Version:', result.rows[0].version.split(',')[0]);
    
    // Test if tables exist
    const tablesResult = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('\n📋 Tables found:');
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    // Test if we have data
    if (tablesResult.rows.some(row => row.table_name === 'patients')) {
      const countResult = await client.query('SELECT COUNT(*) FROM patients');
      console.log(`\n👥 Patients count: ${countResult.rows[0].count}`);
    }
    
    client.release();
    await pool.end();
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

testConnection();
