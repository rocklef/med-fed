# Adding Patient Records

You can add new patient records to the SQLite database in several ways:

## Method 1: Using the API Endpoint (Recommended)

**Endpoint:** `POST http://localhost:4000/api/patients`

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "dob": "1980-01-15",
  "gender": "male",
  "contactNumber": "123-456-7890",
  "email": "john.doe@example.com",
  "address": "123 Main St",
  "conditions": ["Hypertension", "Diabetes"],
  "medications": ["Lisinopril", "Metformin"],
  "notes": "Patient has been stable on current medications."
}
```

**Required Fields:**
- `firstName` (string)
- `lastName` (string)
- `dob` (string, format: YYYY-MM-DD)
- `gender` (string: "male", "female", or "other")

**Optional Fields:**
- `contactNumber` (string)
- `email` (string, valid email format)
- `address` (string)
- `conditions` (array of strings)
- `medications` (array of strings)
- `notes` (string)

**Example using curl:**
```bash
curl -X POST http://localhost:4000/api/patients \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "dob": "1990-05-20",
    "gender": "female",
    "email": "jane@example.com",
    "conditions": ["Asthma"],
    "medications": ["Albuterol"]
  }'
```

## Method 2: Interactive Command-Line Tool

Run the interactive script that prompts you for patient information:

```bash
cd server
npm run add-patient-interactive
```

This will guide you through entering all patient details step by step.

## Method 3: Command-Line Arguments

Add a patient directly from the command line:

```bash
cd server
npm run add-patient -- John Smith 1980-01-15 male --email john@example.com --conditions "Hypertension,Diabetes"
```

**Usage:**
```bash
npm run add-patient -- <firstName> <lastName> <dob> <gender> [options]
```

**Options:**
- `--contact "phone number"`
- `--email "email@example.com"`
- `--address "Street address"`
- `--conditions "condition1,condition2"`
- `--medications "med1,med2"`
- `--notes "Additional notes"`

## Method 4: Using the Existing Sample Script

Add sample patients using the existing script:

```bash
cd server
node add-sample-patients.js
```

This will add 3 sample patients: John Smith, Sarah Johnson, and Robert Williams.

## Method 5: From Frontend/Code

If you're using the frontend React app, you can create patients through the PatientData page, or use the API directly in your code:

```javascript
const response = await fetch('http://localhost:4000/api/patients', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    firstName: 'John',
    lastName: 'Doe',
    dob: '1980-01-15',
    gender: 'male',
    // ... other fields
  })
});

const patient = await response.json();
console.log('Created patient:', patient);
```

## Viewing All Patients

Get all patients:
```bash
curl http://localhost:4000/api/patients
```

Or use the interactive script which will show the total count after adding.

## Notes

- All patient records are stored in SQLite database (`server/database.sqlite`)
- The database schema includes automatic timestamps (`createdAt`, `updatedAt`)
- Patient records can be queried by the RAG system when asking about specific patients
- Use the patient's name in RAG queries like "Tell me about John Smith's medical history"

