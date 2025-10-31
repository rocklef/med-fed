// Remove Mongoose dependencies since we're using SQLite
export interface Patient {
  id?: number;
  firstName: string;
  lastName: string;
  dob: Date;
  gender: 'male' | 'female' | 'other';
  contactNumber?: string;
  email?: string;
  address?: string;
  conditions: string[];
  medications: string[];
  notes: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// We don't need the Mongoose model anymore since we're using SQLite
// The Patient interface is sufficient for our TypeScript types