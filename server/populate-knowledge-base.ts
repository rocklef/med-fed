import 'dotenv/config';
import { initializeDatabase, addMedicalKnowledge } from './src/services/databaseService';

async function populateMedicalKnowledge() {
  console.log('📚 Populating Medical Knowledge Base...\n');

  try {
    // Initialize database
    initializeDatabase();

    // Sample medical knowledge entries
    const knowledgeEntries = [
      {
        title: 'Hypertension Treatment Guidelines',
        content: 'Hypertension, or high blood pressure, is typically managed through lifestyle modifications and medication. First-line treatments include ACE inhibitors, ARBs, diuretics, or calcium channel blockers. Lifestyle changes include reducing sodium intake, maintaining a healthy weight, regular exercise, and limiting alcohol consumption. Target blood pressure is typically below 130/80 mmHg for most adults.',
        category: 'cardiology',
        keywords: ['hypertension', 'high blood pressure', 'treatment', 'ACE inhibitors', 'diuretics'],
        source: 'Medical Guidelines 2024',
        relevanceScore: 0.9
      },
      {
        title: 'Diabetes Management',
        content: 'Type 2 diabetes management involves monitoring blood glucose levels, maintaining a balanced diet, regular physical activity, and medication when needed. Key medications include metformin, sulfonylureas, and insulin therapy. A1C target is typically below 7% for most patients. Regular monitoring of complications including retinopathy, nephropathy, and neuropathy is essential.',
        category: 'endocrinology',
        keywords: ['diabetes', 'blood glucose', 'A1C', 'metformin', 'insulin'],
        source: 'Diabetes Care Guidelines',
        relevanceScore: 0.9
      },
      {
        title: 'Asthma Treatment Protocol',
        content: 'Asthma management focuses on controlling symptoms and preventing exacerbations. Treatment includes inhaled corticosteroids for long-term control and short-acting beta-agonists for quick relief. Patients should identify and avoid triggers. Peak flow monitoring helps assess control. Severe exacerbations may require oral corticosteroids and emergency care.',
        category: 'pulmonology',
        keywords: ['asthma', 'inhalers', 'corticosteroids', 'bronchodilators', 'peak flow'],
        source: 'Respiratory Care Standards',
        relevanceScore: 0.85
      },
      {
        title: 'Antibiotic Selection Guidelines',
        content: 'Antibiotic selection should be based on the suspected pathogen, local resistance patterns, and patient factors. Broad-spectrum antibiotics should be reserved for severe infections. Common antibiotics include penicillin, cephalosporins, macrolides, and fluoroquinolones. Always consider allergies and drug interactions. Complete the full course as prescribed to prevent resistance.',
        category: 'infectious disease',
        keywords: ['antibiotics', 'infection', 'resistance', 'penicillin', 'treatment'],
        source: 'Antimicrobial Stewardship Guidelines',
        relevanceScore: 0.88
      },
      {
        title: 'Stroke Prevention',
        content: 'Stroke prevention focuses on managing risk factors including hypertension, atrial fibrillation, diabetes, and high cholesterol. Anticoagulation therapy (warfarin, DOACs) is indicated for patients with atrial fibrillation. Antiplatelet therapy (aspirin, clopidogrel) may be used for secondary prevention. Lifestyle modifications include smoking cessation, healthy diet, and regular exercise.',
        category: 'neurology',
        keywords: ['stroke', 'prevention', 'anticoagulation', 'atrial fibrillation', 'risk factors'],
        source: 'Stroke Prevention Guidelines',
        relevanceScore: 0.87
      },
      {
        title: 'Pain Management Principles',
        content: 'Pain management follows a stepwise approach. For mild pain, start with acetaminophen or NSAIDs. For moderate pain, consider weak opioids like tramadol. For severe pain, strong opioids may be needed. Always assess pain severity, consider patient history and contraindications, and monitor for side effects. Non-pharmacological approaches include physical therapy and cognitive-behavioral therapy.',
        category: 'pain management',
        keywords: ['pain', 'analgesics', 'opioids', 'NSAIDs', 'pain scale'],
        source: 'Pain Management Protocols',
        relevanceScore: 0.82
      },
      {
        title: 'Heart Failure Management',
        content: 'Heart failure treatment aims to reduce symptoms, improve quality of life, and prevent hospitalizations. Key medications include ACE inhibitors or ARBs, beta-blockers, diuretics, and aldosterone antagonists. Lifestyle modifications include sodium restriction, fluid management, and regular monitoring. Patients should monitor daily weights and symptoms. Advanced cases may require device therapy or transplantation.',
        category: 'cardiology',
        keywords: ['heart failure', 'ejection fraction', 'diuretics', 'beta-blockers', 'cardiac function'],
        source: 'Cardiology Guidelines 2024',
        relevanceScore: 0.9
      },
      {
        title: 'Depression Treatment Options',
        content: 'Depression treatment includes psychotherapy, medication, or a combination. First-line antidepressants include SSRIs (fluoxetine, sertraline) or SNRIs (venlafaxine). Treatment typically takes 4-6 weeks to show effect. Regular follow-up is important to monitor response and side effects. Severe cases may require augmentation strategies or referral to specialists.',
        category: 'psychiatry',
        keywords: ['depression', 'antidepressants', 'SSRI', 'therapy', 'mental health'],
        source: 'Mental Health Guidelines',
        relevanceScore: 0.83
      }
    ];

    let added = 0;
    for (const entry of knowledgeEntries) {
      try {
        addMedicalKnowledge(entry);
        added++;
        console.log(`✅ Added: ${entry.title}`);
      } catch (error) {
        console.error(`❌ Failed to add ${entry.title}:`, error);
      }
    }

    console.log(`\n✨ Successfully added ${added} knowledge entries to the database!`);
    console.log('📊 Database is ready for RAG queries.\n');

  } catch (error) {
    console.error('❌ Error populating medical knowledge:', error);
    process.exit(1);
  }
}

// Run the population script
populateMedicalKnowledge().catch(console.error);

