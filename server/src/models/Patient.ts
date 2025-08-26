import mongoose, { Schema, InferSchemaType, Model } from 'mongoose';

const patientSchema = new Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    dob: { type: Date, required: true },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
    contactNumber: { type: String, required: false },
    email: { type: String, required: false, lowercase: true, trim: true },
    address: { type: String, required: false },
    conditions: { type: [String], default: [] },
    medications: { type: [String], default: [] },
    notes: { type: String, default: '' }
  },
  { timestamps: true }
);

export type Patient = InferSchemaType<typeof patientSchema>;

const PatientModel: Model<Patient> =
  mongoose.models.Patient || mongoose.model<Patient>('Patient', patientSchema);

export default PatientModel;


