import { Router, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';
import PatientModel from '../models/Patient';

const router = Router();

const patientSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  dob: z.coerce.date(),
  gender: z.enum(['male', 'female', 'other']),
  contactNumber: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  conditions: z.array(z.string()).optional(),
  medications: z.array(z.string()).optional(),
  notes: z.string().optional()
});

router.get('/', async (_req: Request, res: Response) => {
  const patients = await PatientModel.find().sort({ createdAt: -1 }).lean();
  res.json(patients);
});

router.get('/:id', async (req: Request, res: Response) => {
  const patient = await PatientModel.findById(req.params.id).lean();
  if (!patient) return res.status(StatusCodes.NOT_FOUND).json({ error: 'Not found' });
  res.json(patient);
});

router.post('/', async (req: Request, res: Response) => {
  const parsed = patientSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: parsed.error.flatten() });
  }
  const created = await PatientModel.create(parsed.data);
  res.status(StatusCodes.CREATED).json(created);
});

router.put('/:id', async (req: Request, res: Response) => {
  const parsed = patientSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: parsed.error.flatten() });
  }
  const updated = await PatientModel.findByIdAndUpdate(
    req.params.id,
    { $set: parsed.data },
    { new: true }
  ).lean();
  if (!updated) return res.status(StatusCodes.NOT_FOUND).json({ error: 'Not found' });
  res.json(updated);
});

router.delete('/:id', async (req: Request, res: Response) => {
  const result = await PatientModel.findByIdAndDelete(req.params.id).lean();
  if (!result) return res.status(StatusCodes.NOT_FOUND).json({ error: 'Not found' });
  res.status(StatusCodes.NO_CONTENT).send();
});

export default router;


