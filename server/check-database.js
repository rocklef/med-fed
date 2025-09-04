const { Pool } = require('pg');

async function checkDatabase() {
  const pool = new Pool({ 
    host: 'localhost', 
    port: 5432, 
    database: 'fmed_h1', 
    user: 'fmed' 
  });

  try {
    console.log('🔍 Checking fmed_h1 database structure...\n');
    
    // Check existing tables
    const tablesResult = await pool.query(`
      SELECT table_name, column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      ORDER BY table_name, ordinal_position
    `);
    
    console.log('📋 Existing tables and columns:');
    let currentTable = '';
    tablesResult.rows.forEach(row => {
      if (row.table_name !== currentTable) {
        currentTable = row.table_name;
        console.log(`\n📁 Table: ${row.table_name}`);
      }
      console.log(`  - ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? '(NOT NULL)' : ''}`);
    });

    // Check if patients table exists and its structure
    const patientsResult = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'patients' AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
    
    if (patientsResult.rows.length > 0) {
      console.log('\n🔍 Patients table structure:');
      patientsResult.rows.forEach(row => {
        console.log(`  - ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? '(NOT NULL)' : ''}`);
      });
    }

  } catch (error) {
    console.error('❌ Error checking database:', error.message);
  } finally {
    await pool.end();
  }
}

checkDatabase();
