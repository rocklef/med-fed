import { Router, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';
import { hospital1Pool, hospital2Pool, hospital3Pool } from '../config/database';

const router = Router();

const patientSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  age: z.number().optional(),
  gender: z.string().optional(),
  medicalHistory: z.string().optional(),
  currentCondition: z.string().optional(),
  hospitalId: z.number().min(1).max(3).default(1)
});

// Get all patients from a specific hospital
router.get('/hospital/:hospitalId', async (req: Request, res: Response) => {
  try {
    const hospitalId = parseInt(req.params.hospitalId);
    if (hospitalId < 1 || hospitalId > 3) {
      return res.status(StatusCodes.BAD_REQUEST).json({ 
        error: 'Invalid hospital ID. Must be 1, 2, or 3' 
      });
    }

    const pool = hospitalId === 1 ? hospital1Pool : 
                 hospitalId === 2 ? hospital2Pool : hospital3Pool;

    const result = await pool.query(`
      SELECT id, patient_id, first_name, last_name, date_of_birth, 
             gender, medical_history, created_at
      FROM patients 
      ORDER BY created_at DESC 
      LIMIT 50
    `);

    res.json({
      patients: result.rows,
      hospitalId,
      count: result.rows.length
    });

  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      error: 'Failed to fetch patients' 
    });
  }
});

// Add new patient
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = patientSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(StatusCodes.BAD_REQUEST).json({ 
        error: 'Invalid patient data', 
        details: parsed.error.flatten() 
      });
    }

    const { firstName, lastName, age, gender, medicalHistory, currentCondition, hospitalId } = parsed.data;
    
    const pool = hospitalId === 1 ? hospital1Pool : 
                 hospitalId === 2 ? hospital2Pool : hospital3Pool;

    // Generate patient ID
    const patientId = `P${hospitalId}${Date.now().toString().slice(-6)}`;

    const result = await pool.query(`
      INSERT INTO patients (
        patient_id, first_name, last_name, date_of_birth, gender, 
        medical_history, hospital_id, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING id, patient_id, first_name, last_name, created_at
    `, [
      patientId,
      firstName,
      lastName,
      age ? new Date(Date.now() - age * 365 * 24 * 60 * 60 * 1000) : null,
      gender,
      medicalHistory,
      hospitalId
    ]);

    // If there's a current condition, add it as a medical record
    if (currentCondition) {
      await pool.query(`
        INSERT INTO medical_records (
          patient_id, record_type, record_date, diagnosis, symptoms, created_at
        ) VALUES ($1, 'chief_complaint', CURRENT_DATE, $2, $3, NOW())
      `, [result.rows[0].id, currentCondition, currentCondition]);
    }

    res.status(StatusCodes.CREATED).json({
      message: 'Patient added successfully',
      patient: result.rows[0]
    });

  } catch (error) {
    console.error('Error adding patient:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      error: 'Failed to add patient' 
    });
  }
});

// Get patient by ID
router.get('/:patientId', async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;
    
    // Try all hospital databases
    const pools = [hospital1Pool, hospital2Pool, hospital3Pool];
    let patient = null;
    let hospitalId = 0;

    for (let i = 0; i < pools.length; i++) {
      try {
        const result = await pools[i].query(`
          SELECT p.*, 
                 array_agg(
                   json_build_object(
                     'id', mr.id,
                     'type', mr.record_type,
                     'date', mr.record_date,
                     'diagnosis', mr.diagnosis,
                     'symptoms', mr.symptoms,
                     'treatment', mr.treatment_plan
                   )
                 ) FILTER (WHERE mr.id IS NOT NULL) as medical_records
          FROM patients p
          LEFT JOIN medical_records mr ON p.id = mr.patient_id
          WHERE p.patient_id = $1
          GROUP BY p.id
        `, [patientId]);

        if (result.rows.length > 0) {
          patient = result.rows[0];
          hospitalId = i + 1;
          break;
        }
      } catch (error) {
        // Continue to next hospital
        continue;
      }
    }

    if (!patient) {
      return res.status(StatusCodes.NOT_FOUND).json({ 
        error: 'Patient not found' 
      });
    }

    res.json({
      patient,
      hospitalId
    });

  } catch (error) {
    console.error('Error fetching patient:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      error: 'Failed to fetch patient details' 
    });
  }
});

export default router;
