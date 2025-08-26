import type { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose, { Schema, model } from 'mongoose';
import { getDbConnection } from './_db';
import { requireApiKey } from './_auth';

const patientSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dob: { type: Date, required: true },
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },
  contactNumber: { type: String },
  email: { type: String },
  address: { type: String },
  conditions: { type: [String], default: [] },
  medications: { type: [String], default: [] },
  notes: { type: String, default: '' }
}, { timestamps: true });

const Patient = mongoose.models.Patient || model('Patient', patientSchema);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireApiKey(req, res)) return;
  await getDbConnection();

  if (req.method === 'GET') {
    const items = await Patient.find().sort({ createdAt: -1 }).lean();
    return res.status(200).json(items);
  }

  if (req.method === 'POST') {
    const created = await Patient.create(req.body);
    return res.status(201).json(created);
  }

  if (req.method === 'PUT') {
    const id = (req.query.id as string) || '';
    if (!id) return res.status(400).json({ error: 'id required' });
    const updated = await Patient.findByIdAndUpdate(id, req.body, { new: true }).lean();
    if (!updated) return res.status(404).json({ error: 'not found' });
    return res.status(200).json(updated);
  }

  if (req.method === 'DELETE') {
    const id = (req.query.id as string) || '';
    if (!id) return res.status(400).json({ error: 'id required' });
    const deleted = await Patient.findByIdAndDelete(id).lean();
    if (!deleted) return res.status(404).json({ error: 'not found' });
    return res.status(204).end();
  }

  res.setHeader('Allow', 'GET,POST,PUT,DELETE');
  return res.status(405).json({ error: 'Method Not Allowed' });
}


