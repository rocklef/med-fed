-- Medical RAG System Database Schema
-- This schema supports multiple hospitals and federated learning

-- Hospital 1 Database Schema
CREATE TABLE IF NOT EXISTS patients (
    id SERIAL PRIMARY KEY,
    patient_id VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(10),
    contact_number VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    medical_history TEXT,
    allergies TEXT,
    current_medications TEXT,
    hospital_id INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS medical_records (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id),
    record_type VARCHAR(50) NOT NULL, -- 'diagnosis', 'treatment', 'lab_result', 'prescription'
    record_date DATE NOT NULL,
    doctor_name VARCHAR(100),
    department VARCHAR(100),
    diagnosis TEXT,
    symptoms TEXT,
    treatment_plan TEXT,
    medications_prescribed TEXT,
    lab_results TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS medical_knowledge_base (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content_type VARCHAR(50) NOT NULL, -- 'disease', 'treatment', 'medication', 'procedure'
    content TEXT NOT NULL,
    source VARCHAR(255),
    tags TEXT[],
    embedding_vector VECTOR(1536), -- For storing embeddings
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rag_sessions (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(100) UNIQUE NOT NULL,
    user_query TEXT NOT NULL,
    retrieved_context TEXT,
    llm_response TEXT,
    confidence_score DECIMAL(3,2),
    sources_used TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS federated_datasets (
    id SERIAL PRIMARY KEY,
    dataset_name VARCHAR(255) NOT NULL,
    dataset_type VARCHAR(50) NOT NULL, -- 'patient_data', 'medical_knowledge', 'clinical_trials'
    hospital_id INTEGER,
    record_count INTEGER DEFAULT 0,
    last_sync TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_patients_patient_id ON patients(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_patient_id ON medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_record_type ON medical_records(record_type);
CREATE INDEX IF NOT EXISTS idx_medical_knowledge_content_type ON medical_knowledge_base(content_type);
CREATE INDEX IF NOT EXISTS idx_rag_sessions_session_id ON rag_sessions(session_id);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medical_records_updated_at BEFORE UPDATE ON medical_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medical_knowledge_updated_at BEFORE UPDATE ON medical_knowledge_base
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_federated_datasets_updated_at BEFORE UPDATE ON federated_datasets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
