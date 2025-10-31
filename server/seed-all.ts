import 'dotenv/config';
import {
  initializeDatabase,
  createPatient,
  getPatientById,
  addMedicalKnowledge,
  storeQueryHistory,
  createPayment,
} from './src/services/databaseService';

async function main() {
  console.log('🌱 Seeding demo data...');
  initializeDatabase();

  // Patients
  const patientInputs = [
    {
      firstName: 'John',
      lastName: 'Doe',
      dob: new Date('1980-05-01'),
      gender: 'male' as const,
      contactNumber: '+1-555-0101',
      email: 'john.doe@example.com',
      address: '123 Main St',
      conditions: ['Hypertension'],
      medications: ['Lisinopril 10mg'],
      notes: 'Stable on current therapy.'
    },
    {
      firstName: 'Sarah',
      lastName: 'Lee',
      dob: new Date('1992-11-15'),
      gender: 'female' as const,
      contactNumber: '+1-555-0102',
      email: 'sarah.lee@example.com',
      address: '456 Oak Ave',
      conditions: ['Asthma'],
      medications: ['Albuterol inhaler'],
      notes: 'Uses rescue inhaler intermittently.'
    },
    {
      firstName: 'Robert',
      lastName: 'Khan',
      dob: new Date('1956-02-20'),
      gender: 'male' as const,
      contactNumber: '+1-555-0103',
      email: 'robert.khan@example.com',
      address: '789 Pine Rd',
      conditions: ['Type 2 Diabetes', 'Hyperlipidemia'],
      medications: ['Metformin 500mg', 'Atorvastatin 20mg'],
      notes: 'Working on diet and exercise.'
    }
  ];

  const patientIds = patientInputs.map(p => createPatient(p));
  console.log('👥 Patients created:', patientIds);

  // Payments
  const payments = [
    { patientId: patientIds[0], payerName: undefined, amount: 500, currency: 'INR', method: 'UPI' as const, status: 'Paid' as const, notes: 'Consultation' },
    { patientId: patientIds[1], payerName: undefined, amount: 1200, currency: 'INR', method: 'Cash' as const, status: 'Paid' as const, notes: 'Pulmonary tests' },
    { patientId: patientIds[2], payerName: undefined, amount: 800, currency: 'INR', method: 'Card' as const, status: 'Pending' as const, notes: 'Follow-up booking' },
    { patientId: undefined, payerName: 'Walk-in', amount: 300, currency: 'INR', method: 'Cash' as const, status: 'Paid' as const, notes: 'Vaccine' },
  ];
  payments.forEach(rec => createPayment(rec));
  console.log('💳 Payments inserted:', payments.length);

  // Medical knowledge
  const knowledge = [
    {
      title: 'Hypertension First-line Therapy',
      content: 'Initial management includes ACE inhibitors, ARBs, thiazide diuretics, or calcium channel blockers. Emphasize lifestyle modifications: sodium restriction, weight loss, regular exercise.',
      category: 'cardiology',
      keywords: ['hypertension','ace inhibitors','arbs','thiazide'],
      source: 'Guidelines 2024',
      relevanceScore: 0.9
    },
    {
      title: 'Asthma Stepwise Approach',
      content: 'Use inhaled corticosteroids for persistent asthma; add LABA for step-up therapy. Short-acting beta-agonists for symptom relief. Trigger avoidance and action plans are essential.',
      category: 'pulmonology',
      keywords: ['asthma','ICS','LABA','SABA'],
      source: 'Respiratory Society',
      relevanceScore: 0.85
    },
    {
      title: 'Type 2 Diabetes Management',
      content: 'First-line therapy is metformin unless contraindicated. Consider GLP-1 agonists or SGLT2 inhibitors for patients with ASCVD, CKD, or heart failure. Set A1C targets based on comorbidities.',
      category: 'endocrinology',
      keywords: ['diabetes','metformin','GLP-1','SGLT2','A1C'],
      source: 'Diabetes Care Standards',
      relevanceScore: 0.9
    }
  ];
  knowledge.forEach(k => addMedicalKnowledge(k));
  console.log('📚 Medical knowledge entries added:', knowledge.length);

  // Query history (simulate a few interactions)
  const p0 = getPatientById(patientIds[0]);
  if (p0) {
    storeQueryHistory({
      query: 'What is the recommended treatment plan for this patient with hypertension?',
      response: 'Recommend lifestyle changes and start ACE inhibitor. Monitor BP weekly and check electrolytes in 2 weeks.',
      contextType: 'medical_assistant',
      confidence: 0.78,
      sources: ['Hypertension First-line Therapy'],
      patientId: p0.id,
      queryType: 'treatment',
      tokensUsed: 420,
      processingTime: 480
    });
  }
  storeQueryHistory({
    query: 'What are the stepwise management options for persistent asthma?',
    response: 'Initiate inhaled corticosteroids; if inadequate control, add LABA; ensure SABA for rescue and educate on inhaler technique.',
    contextType: 'medical_assistant',
    confidence: 0.82,
    sources: ['Asthma Stepwise Approach'],
    patientId: undefined,
    queryType: 'treatment',
    tokensUsed: 350,
    processingTime: 430
  });

  console.log('📝 Query history seeded.');
  console.log('✅ Seeding completed. Open DB Browser and refresh to view tables.');
}

main().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});


