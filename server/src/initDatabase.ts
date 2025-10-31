import { initializeDatabase, closeDatabase } from './services/databaseService';

// Initialize the database
initializeDatabase();

// Close the database connection
closeDatabase();

console.log('Database initialized successfully!');