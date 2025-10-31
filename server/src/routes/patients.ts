import { Router, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';
import { 
  getAllPatients, 
  getPatientById, 
  createPatient, 
  updatePatient, 
  deletePatient 
} from '../services/databaseService';
import { Patient } from '../models/Patient';

const router = Router();

// Validation schemas
const patientSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD format
  gender: z.enum(['male', 'female', 'other']),
  contactNumber: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  conditions: z.array(z.string()).optional().default([]),
  medications: z.array(z.string()).optional().default([]),
  notes: z.string().optional().default('')
});

// Get all patients
router.get('/', async (_req: Request, res: Response) => {
  try {
    const patients = getAllPatients();
    res.status(StatusCodes.OK).json(patients);
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      error: 'Failed to fetch patients',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get patient by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(StatusCodes.BAD_REQUEST).json({ 
        error: 'Invalid patient ID' 
      });
    }

    const patient = getPatientById(id);
    if (!patient) {
      return res.status(StatusCodes.NOT_FOUND).json({ 
        error: 'Patient not found' 
      });
    }

    res.status(StatusCodes.OK).json(patient);
  } catch (error) {
    console.error('Error fetching patient:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      error: 'Failed to fetch patient',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create a new patient
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = patientSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(StatusCodes.BAD_REQUEST).json({ 
        error: 'Invalid patient data', 
        details: parsed.error.flatten() 
      });
    }

    const patientData = parsed.data;
    const id = createPatient({
      firstName: patientData.firstName,
      lastName: patientData.lastName,
      dob: new Date(patientData.dob),
      gender: patientData.gender,
      contactNumber: patientData.contactNumber,
      email: patientData.email,
      address: patientData.address,
      conditions: patientData.conditions,
      medications: patientData.medications,
      notes: patientData.notes
    });

    const newPatient = getPatientById(id);
    res.status(StatusCodes.CREATED).json(newPatient);
  } catch (error) {
    console.error('Error creating patient:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      error: 'Failed to create patient',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update a patient
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(StatusCodes.BAD_REQUEST).json({ 
        error: 'Invalid patient ID' 
      });
    }

    const parsed = patientSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(StatusCodes.BAD_REQUEST).json({ 
        error: 'Invalid patient data', 
        details: parsed.error.flatten() 
      });
    }

    const patientData = parsed.data;
    const success = updatePatient(id, {
      firstName: patientData.firstName,
      lastName: patientData.lastName,
      dob: patientData.dob ? new Date(patientData.dob) : undefined,
      gender: patientData.gender,
      contactNumber: patientData.contactNumber,
      email: patientData.email,
      address: patientData.address,
      conditions: patientData.conditions,
      medications: patientData.medications,
      notes: patientData.notes
    });

    if (!success) {
      return res.status(StatusCodes.NOT_FOUND).json({ 
        error: 'Patient not found' 
      });
    }

    const updatedPatient = getPatientById(id);
    res.status(StatusCodes.OK).json(updatedPatient);
  } catch (error) {
    console.error('Error updating patient:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      error: 'Failed to update patient',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete a patient
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(StatusCodes.BAD_REQUEST).json({ 
        error: 'Invalid patient ID' 
      });
    }

    const success = deletePatient(id);
    if (!success) {
      return res.status(StatusCodes.NOT_FOUND).json({ 
        error: 'Patient not found' 
      });
    }

    res.status(StatusCodes.NO_CONTENT).send();
  } catch (error) {
    console.error('Error deleting patient:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      error: 'Failed to delete patient',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;