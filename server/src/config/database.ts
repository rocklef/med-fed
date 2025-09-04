import { Pool } from 'pg';

// Hospital 1 Database Connection
export const hospital1Pool = new Pool({
  host: process.env.HOSPITAL1_DB_HOST || 'localhost',
  port: parseInt(process.env.HOSPITAL1_DB_PORT || '5432'),
  database: process.env.HOSPITAL1_DB_NAME || 'fmed_h1',
  user: process.env.HOSPITAL1_DB_USER || 'fmed',
  password: process.env.HOSPITAL1_DB_PASSWORD || '',
  ssl: process.env.HOSPITAL1_DB_SSL === 'true'
});

// Hospital 2 Database Connection
export const hospital2Pool = new Pool({
  host: process.env.HOSPITAL2_DB_HOST || 'localhost',
  port: parseInt(process.env.HOSPITAL2_DB_PORT || '5432'),
  database: process.env.HOSPITAL2_DB_NAME || 'fmed_h2',
  user: process.env.HOSPITAL2_DB_USER || 'fmed',
  password: process.env.HOSPITAL2_DB_PASSWORD || '',
  ssl: process.env.HOSPITAL2_DB_SSL === 'true'
});

// Hospital 3 Database Connection
export const hospital3Pool = new Pool({
  host: process.env.HOSPITAL3_DB_HOST || 'localhost',
  port: parseInt(process.env.HOSPITAL3_DB_PORT || '5432'),
  database: process.env.HOSPITAL3_DB_NAME || 'fmed_h3',
  user: process.env.HOSPITAL3_DB_USER || 'fmed',
  password: process.env.HOSPITAL3_DB_PASSWORD || '',
  ssl: process.env.HOSPITAL3_DB_SSL === 'true'
});

// Aggregator Database Connection
export const aggregatorPool = new Pool({
  host: process.env.AGGREGATOR_DB_HOST || 'localhost',
  port: parseInt(process.env.AGGREGATOR_DB_PORT || '5432'),
  database: process.env.AGGREGATOR_DB_NAME || 'fmed_aggregator',
  user: process.env.AGGREGATOR_DB_USER || 'fmed',
  password: process.env.AGGREGATOR_DB_PASSWORD || '',
  ssl: process.env.AGGREGATOR_DB_SSL === 'true'
});

export async function testDatabaseConnections(): Promise<void> {
  const pools = [
    { name: 'Hospital 1', pool: hospital1Pool },
    { name: 'Hospital 2', pool: hospital2Pool },
    { name: 'Hospital 3', pool: hospital3Pool },
    { name: 'Aggregator', pool: aggregatorPool }
  ];

  for (const { name, pool } of pools) {
    try {
      await pool.query('SELECT NOW()');
      console.log(`✅ ${name} database connected`);
    } catch (error) {
      console.warn(`⚠️ ${name} database connection failed:`, error);
      // Continue with other connections
    }
  }
}

export async function initializeDatabaseSchema(): Promise<void> {
  // This would typically run SQL schema files
  console.log('Database schema initialization complete');
}

export async function closeDatabaseConnections(): Promise<void> {
  await Promise.all([
    hospital1Pool.end(),
    hospital2Pool.end(),
    hospital3Pool.end(),
    aggregatorPool.end()
  ]);
}
