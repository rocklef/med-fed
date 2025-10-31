import { Router, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';
import {
  createPayment,
  deletePayment,
  getPaymentById,
  listPayments,
  updatePayment,
  getPatientById as getPatient,
} from '../services/databaseService';

const router = Router();

const methodEnum = z.enum(['Cash','UPI','Card','Cheque','Other']);
const statusEnum = z.enum(['Paid','Pending','Refunded']);

const baseSchema = z.object({
  patientId: z.number().int().positive().optional(),
  payerName: z.string().trim().min(1).optional(),
  amount: z.number().positive(),
  currency: z.string().trim().min(1).default('INR'),
  method: methodEnum,
  status: statusEnum,
  notes: z.string().trim().optional()
});

const createSchema = baseSchema.refine((v) => !!v.payerName || !!v.patientId, {
  message: 'Either payerName or patientId is required'
});

const updateSchema = baseSchema.partial();

router.post('/', (req: Request, res: Response) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid payment data', details: parsed.error.flatten() });
  }
  // Validate patient existence when patientId is provided to avoid FK errors
  if (parsed.data.patientId !== undefined) {
    const patient = getPatient(parsed.data.patientId);
    if (!patient) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: `Patient ${parsed.data.patientId} not found` });
    }
  }
  const id = createPayment(parsed.data);
  const record = getPaymentById(id);
  return res.status(StatusCodes.CREATED).json(record);
});

router.get('/', (_req: Request, res: Response) => {
  const items = listPayments(200);
  res.json(items);
});

router.get('/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid id' });
  const record = getPaymentById(id);
  if (!record) return res.status(StatusCodes.NOT_FOUND).json({ error: 'Not found' });
  res.json(record);
});

router.put('/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid id' });
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid payment data', details: parsed.error.flatten() });
  }
  const ok = updatePayment(id, parsed.data);
  if (!ok) return res.status(StatusCodes.NOT_FOUND).json({ error: 'Not found' });
  const record = getPaymentById(id);
  res.json(record);
});

router.delete('/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid id' });
  const ok = deletePayment(id);
  if (!ok) return res.status(StatusCodes.NOT_FOUND).json({ error: 'Not found' });
  res.status(StatusCodes.NO_CONTENT).send();
});

export default router;


