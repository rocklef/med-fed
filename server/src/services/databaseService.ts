import Database from 'better-sqlite3';
import path from 'path';
import { Patient } from '../models/Patient';

// Database file path
const dbPath = path.join(__dirname, '..', '..', 'database.sqlite');
const db = new Database(dbPath);

// Initialize the database
export function initializeDatabase(): void {
  console.log('Initializing SQLite database...');
  
  // Create patients table
  db.exec(`
    CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      dob TEXT NOT NULL,
      gender TEXT NOT NULL,
      contactNumber TEXT,
      email TEXT,
      address TEXT,
      conditions TEXT,
      medications TEXT,
      notes TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Create indexes for better performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(firstName, lastName);
    CREATE INDEX IF NOT EXISTS idx_patients_dob ON patients(dob);
    CREATE INDEX IF NOT EXISTS idx_patients_gender ON patients(gender);
  `);
  
  // Create query_history table for RAG system
  db.exec(`
    CREATE TABLE IF NOT EXISTS query_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      query TEXT NOT NULL,
      response TEXT NOT NULL,
      contextType TEXT NOT NULL,
      confidence REAL,
      sources TEXT,
      patientId INTEGER,
      queryType TEXT,
      tokensUsed INTEGER,
      processingTime INTEGER,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE SET NULL
    )
  `);
  
  // Create medical_knowledge table for RAG knowledge base
  db.exec(`
    CREATE TABLE IF NOT EXISTS medical_knowledge (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT,
      keywords TEXT,
      source TEXT,
      relevanceScore REAL DEFAULT 0.0,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Create indexes for RAG tables
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_query_history_context ON query_history(contextType);
    CREATE INDEX IF NOT EXISTS idx_query_history_created ON query_history(createdAt DESC);
    CREATE INDEX IF NOT EXISTS idx_query_history_patient ON query_history(patientId);
    CREATE INDEX IF NOT EXISTS idx_medical_knowledge_category ON medical_knowledge(category);
    CREATE INDEX IF NOT EXISTS idx_medical_knowledge_keywords ON medical_knowledge(keywords);
  `);

  // Payments table for offline payments
  db.exec(`
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patientId INTEGER,
      payerName TEXT,
      amount REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'INR',
      method TEXT NOT NULL,
      status TEXT NOT NULL,
      notes TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE SET NULL
    )
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_payments_created ON payments(createdAt);
    CREATE INDEX IF NOT EXISTS idx_payments_method ON payments(method);
    CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
  `);
  
  // Enable full-text search for medical_knowledge
  db.exec(`
    CREATE VIRTUAL TABLE IF NOT EXISTS medical_knowledge_fts USING fts5(
      title, content, category, keywords,
      content_rowid='rowid',
      content='medical_knowledge'
    )
  `);
  
  console.log('SQLite database initialized successfully');
}

// Get all patients
export function getAllPatients(): Patient[] {
  const stmt = db.prepare('SELECT * FROM patients ORDER BY createdAt DESC');
  const rows: any[] = stmt.all();
  
  return rows.map(row => ({
    id: row.id,
    firstName: row.firstName,
    lastName: row.lastName,
    dob: new Date(row.dob),
    gender: row.gender,
    contactNumber: row.contactNumber,
    email: row.email,
    address: row.address,
    conditions: row.conditions ? JSON.parse(row.conditions) : [],
    medications: row.medications ? JSON.parse(row.medications) : [],
    notes: row.notes,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt)
  }));
}

// Get patient by ID
export function getPatientById(id: number): Patient | null {
  const stmt = db.prepare('SELECT * FROM patients WHERE id = ?');
  const row: any = stmt.get(id);
  
  if (!row) return null;
  
  return {
    id: row.id,
    firstName: row.firstName,
    lastName: row.lastName,
    dob: new Date(row.dob),
    gender: row.gender,
    contactNumber: row.contactNumber,
    email: row.email,
    address: row.address,
    conditions: row.conditions ? JSON.parse(row.conditions) : [],
    medications: row.medications ? JSON.parse(row.medications) : [],
    notes: row.notes,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt)
  };
}

// Create a new patient
export function createPatient(patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): number {
  const stmt = db.prepare(`
    INSERT INTO patients (
      firstName, lastName, dob, gender, contactNumber, email, address, conditions, medications, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(
    patient.firstName,
    patient.lastName,
    patient.dob.toISOString(),
    patient.gender,
    patient.contactNumber,
    patient.email,
    patient.address,
    patient.conditions ? JSON.stringify(patient.conditions) : '[]',
    patient.medications ? JSON.stringify(patient.medications) : '[]',
    patient.notes
  );
  
  return result.lastInsertRowid as number;
}

// Update a patient
export function updatePatient(id: number, patient: Partial<Patient>): boolean {
  const fields: string[] = [];
  const values: any[] = [];
  
  // Build dynamic update query
  if (patient.firstName !== undefined) {
    fields.push('firstName = ?');
    values.push(patient.firstName);
  }
  if (patient.lastName !== undefined) {
    fields.push('lastName = ?');
    values.push(patient.lastName);
  }
  if (patient.dob !== undefined) {
    fields.push('dob = ?');
    values.push(patient.dob.toISOString());
  }
  if (patient.gender !== undefined) {
    fields.push('gender = ?');
    values.push(patient.gender);
  }
  if (patient.contactNumber !== undefined) {
    fields.push('contactNumber = ?');
    values.push(patient.contactNumber);
  }
  if (patient.email !== undefined) {
    fields.push('email = ?');
    values.push(patient.email);
  }
  if (patient.address !== undefined) {
    fields.push('address = ?');
    values.push(patient.address);
  }
  if (patient.conditions !== undefined) {
    fields.push('conditions = ?');
    values.push(patient.conditions ? JSON.stringify(patient.conditions) : '[]');
  }
  if (patient.medications !== undefined) {
    fields.push('medications = ?');
    values.push(patient.medications ? JSON.stringify(patient.medications) : '[]');
  }
  if (patient.notes !== undefined) {
    fields.push('notes = ?');
    values.push(patient.notes);
  }
  
  // Always update the updatedAt timestamp
  fields.push('updatedAt = CURRENT_TIMESTAMP');
  
  if (fields.length === 0) {
    return false; // Nothing to update
  }
  
  const query = `UPDATE patients SET ${fields.join(', ')} WHERE id = ?`;
  values.push(id);
  
  const stmt = db.prepare(query);
  const result = stmt.run(...values);
  
  return result.changes > 0;
}

// Delete a patient
export function deletePatient(id: number): boolean {
  const stmt = db.prepare('DELETE FROM patients WHERE id = ?');
  const result = stmt.run(id);
  
  return result.changes > 0;
}

// Close the database connection
export function closeDatabase(): void {
  db.close();
}

// ==================== RAG Functions ====================

export interface QueryHistory {
  id?: number;
  query: string;
  response: string;
  contextType: string;
  confidence?: number;
  sources?: string[];
  patientId?: number;
  queryType?: string;
  tokensUsed?: number;
  processingTime?: number;
  createdAt?: Date;
}

export interface MedicalKnowledge {
  id?: number;
  title: string;
  content: string;
  category?: string;
  keywords?: string[];
  source?: string;
  relevanceScore?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// ==================== Payments ====================
export interface PaymentRecord {
  id?: number;
  patientId?: number | null;
  payerName?: string | null;
  amount: number;
  currency: string; // e.g., 'INR'
  method: 'Cash' | 'UPI' | 'Card' | 'Cheque' | 'Other';
  status: 'Paid' | 'Pending' | 'Refunded';
  notes?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export function createPayment(record: Omit<PaymentRecord, 'id' | 'createdAt' | 'updatedAt'>): number {
  const stmt = db.prepare(`
    INSERT INTO payments (
      patientId, payerName, amount, currency, method, status, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    record.patientId ?? null,
    record.payerName ?? null,
    record.amount,
    record.currency,
    record.method,
    record.status,
    record.notes ?? null
  );

  return result.lastInsertRowid as number;
}

export function listPayments(limit: number = 100): PaymentRecord[] {
  const stmt = db.prepare('SELECT * FROM payments ORDER BY createdAt DESC LIMIT ?');
  const rows: any[] = stmt.all(limit);
  return rows.map(r => ({
    id: r.id,
    patientId: r.patientId ?? null,
    payerName: r.payerName ?? null,
    amount: r.amount,
    currency: r.currency,
    method: r.method,
    status: r.status,
    notes: r.notes ?? null,
    createdAt: new Date(r.createdAt),
    updatedAt: new Date(r.updatedAt)
  }));
}

export function getPaymentById(id: number): PaymentRecord | null {
  const stmt = db.prepare('SELECT * FROM payments WHERE id = ?');
  const r: any = stmt.get(id);
  if (!r) return null;
  return {
    id: r.id,
    patientId: r.patientId ?? null,
    payerName: r.payerName ?? null,
    amount: r.amount,
    currency: r.currency,
    method: r.method,
    status: r.status,
    notes: r.notes ?? null,
    createdAt: new Date(r.createdAt),
    updatedAt: new Date(r.updatedAt)
  };
}

export function updatePayment(id: number, data: Partial<PaymentRecord>): boolean {
  const fields: string[] = [];
  const values: any[] = [];

  if (data.patientId !== undefined) { fields.push('patientId = ?'); values.push(data.patientId ?? null); }
  if (data.payerName !== undefined) { fields.push('payerName = ?'); values.push(data.payerName ?? null); }
  if (data.amount !== undefined) { fields.push('amount = ?'); values.push(data.amount); }
  if (data.currency !== undefined) { fields.push('currency = ?'); values.push(data.currency); }
  if (data.method !== undefined) { fields.push('method = ?'); values.push(data.method); }
  if (data.status !== undefined) { fields.push('status = ?'); values.push(data.status); }
  if (data.notes !== undefined) { fields.push('notes = ?'); values.push(data.notes ?? null); }

  fields.push('updatedAt = CURRENT_TIMESTAMP');
  if (fields.length === 0) return false;
  const q = `UPDATE payments SET ${fields.join(', ')} WHERE id = ?`;
  values.push(id);
  const stmt = db.prepare(q);
  const res = stmt.run(...values);
  return res.changes > 0;
}

export function deletePayment(id: number): boolean {
  const stmt = db.prepare('DELETE FROM payments WHERE id = ?');
  const res = stmt.run(id);
  return res.changes > 0;
}
// Store a query in history
export function storeQueryHistory(history: Omit<QueryHistory, 'id' | 'createdAt'>): number {
  const stmt = db.prepare(`
    INSERT INTO query_history (
      query, response, contextType, confidence, sources, patientId, queryType, tokensUsed, processingTime
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(
    history.query,
    history.response,
    history.contextType,
    history.confidence ?? null,
    history.sources ? JSON.stringify(history.sources) : null,
    history.patientId ?? null,
    history.queryType ?? null,
    history.tokensUsed ?? null,
    history.processingTime ?? null
  );
  
  return result.lastInsertRowid as number;
}

// Get query history
export function getQueryHistory(limit: number = 50, patientId?: number): QueryHistory[] {
  let query = 'SELECT * FROM query_history';
  const params: any[] = [];
  
  if (patientId) {
    query += ' WHERE patientId = ?';
    params.push(patientId);
  }
  
  query += ' ORDER BY createdAt DESC LIMIT ?';
  params.push(limit);
  
  const stmt = db.prepare(query);
  const rows: any[] = stmt.all(...params);
  
  return rows.map(row => ({
    id: row.id,
    query: row.query,
    response: row.response,
    contextType: row.contextType,
    confidence: row.confidence,
    sources: row.sources ? JSON.parse(row.sources) : [],
    patientId: row.patientId,
    queryType: row.queryType,
    tokensUsed: row.tokensUsed,
    processingTime: row.processingTime,
    createdAt: new Date(row.createdAt)
  }));
}

// Search medical knowledge
export function searchMedicalKnowledge(
  query: string, 
  limit: number = 5,
  category?: string
): MedicalKnowledge[] {
  // Escape the query for FTS5 (use quotes for exact phrases, OR for multiple terms)
  const ftsQuery = query.split(' ').filter(q => q.length > 0).join(' OR ');
  
  let searchQuery = `
    SELECT mk.* FROM medical_knowledge mk
    JOIN (
      SELECT rowid FROM medical_knowledge_fts
      WHERE medical_knowledge_fts MATCH ?
    ) fts ON mk.rowid = fts.rowid
  `;
  
  const params: any[] = [ftsQuery];
  
  if (category) {
    searchQuery += ' WHERE mk.category = ?';
    params.push(category);
  }
  
  searchQuery += ' ORDER BY mk.relevanceScore DESC LIMIT ?';
  params.push(limit);
  
  // Fallback to LIKE search if FTS5 doesn't work
  try {
    const stmt = db.prepare(searchQuery);
    const rows: any[] = stmt.all(...params);
    
    return rows.map(row => ({
      id: row.id,
      title: row.title,
      content: row.content,
      category: row.category,
      keywords: row.keywords ? JSON.parse(row.keywords) : [],
      source: row.source,
      relevanceScore: row.relevanceScore,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt)
    }));
  } catch (error) {
    // Fallback to simple LIKE search
    let fallbackQuery = `
      SELECT * FROM medical_knowledge
      WHERE (title LIKE ? OR content LIKE ? OR keywords LIKE ?)
    `;
    const searchPattern = `%${query}%`;
    const fallbackParams: any[] = [searchPattern, searchPattern, searchPattern];
    
    if (category) {
      fallbackQuery += ' AND category = ?';
      fallbackParams.push(category);
    }
    
    fallbackQuery += ' ORDER BY relevanceScore DESC LIMIT ?';
    fallbackParams.push(limit);
    
    const stmt = db.prepare(fallbackQuery);
    const rows: any[] = stmt.all(...fallbackParams);
    
    return rows.map(row => ({
      id: row.id,
      title: row.title,
      content: row.content,
      category: row.category,
      keywords: row.keywords ? JSON.parse(row.keywords) : [],
      source: row.source,
      relevanceScore: row.relevanceScore,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt)
    }));
  }
}

// Add medical knowledge entry
export function addMedicalKnowledge(knowledge: Omit<MedicalKnowledge, 'id' | 'createdAt' | 'updatedAt'>): number {
  const stmt = db.prepare(`
    INSERT INTO medical_knowledge (
      title, content, category, keywords, source, relevanceScore
    ) VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(
    knowledge.title,
    knowledge.content,
    knowledge.category ?? null,
    knowledge.keywords ? JSON.stringify(knowledge.keywords) : null,
    knowledge.source ?? null,
    knowledge.relevanceScore ?? 0.0
  );
  
  const rowId = result.lastInsertRowid as number;
  
  // Update FTS5 index
  try {
    const ftsStmt = db.prepare(`
      INSERT INTO medical_knowledge_fts (rowid, title, content, category, keywords)
      VALUES (?, ?, ?, ?, ?)
    `);
    ftsStmt.run(
      rowId,
      knowledge.title,
      knowledge.content,
      knowledge.category ?? '',
      knowledge.keywords ? knowledge.keywords.join(' ') : ''
    );
  } catch (error) {
    console.warn('Failed to update FTS5 index:', error);
  }
  
  return rowId;
}

// Get patient by name (for RAG queries)
export function searchPatientsByName(name: string): Patient[] {
  const searchPattern = `%${name}%`;
  const stmt = db.prepare(`
    SELECT * FROM patients 
    WHERE firstName LIKE ? OR lastName LIKE ? OR (firstName || ' ' || lastName) LIKE ?
    ORDER BY createdAt DESC
    LIMIT 10
  `);
  
  const rows: any[] = stmt.all(searchPattern, searchPattern, searchPattern);
  
  return rows.map(row => ({
    id: row.id,
    firstName: row.firstName,
    lastName: row.lastName,
    dob: new Date(row.dob),
    gender: row.gender,
    contactNumber: row.contactNumber,
    email: row.email,
    address: row.address,
    conditions: row.conditions ? JSON.parse(row.conditions) : [],
    medications: row.medications ? JSON.parse(row.medications) : [],
    notes: row.notes,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt)
  }));
}