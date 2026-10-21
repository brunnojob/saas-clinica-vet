export interface User {
  id: string;
  name: string;
  email: string;
  role: 'veterinarian' | 'assistant' | 'admin';
  avatar?: string;
  authUserId?: string;
  createdAt: Date;
}

export interface Owner {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  cpf?: string;
}

export interface Animal {
  id: string;
  name: string;
  species: string;
  registrationNumber?: string;
  age: number;
  gender: 'male' | 'female';
  weight: number;
  color: string;
  ownerId: string;
  owner: Owner;
  createdAt: Date;
  isActive: boolean;
}

export interface MedicalRecord {
  id: string;
  animalId: string;
  animal: Animal;
  openedAt: Date;
  status: 'active' | 'completed' | 'transferred' | 'deceased';
  observations: string;
  veterinarianId: string;
  veterinarian: User;
}

export interface Appointment {
  id: string;
  medicalRecordId: string;
  date: Date;
  type: 'consultation' | 'vaccination' | 'surgery' | 'exam' | 'follow-up';
  description: string;
  diagnosis?: string;
  treatment?: string;
  medications?: string[];
  nextAppointment?: Date;
  veterinarianId: string;
  cost: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  type: 'medication' | 'vaccine' | 'supply' | 'equipment';
  category: string;
  quantity: number;
  minQuantity: number;
  unit: string;
  expirationDate?: Date;
  cost: number;
  supplier?: string;
  location?: string;
}

export interface InventoryTransaction {
  id: string;
  itemId: string;
  type: 'in' | 'out';
  quantity: number;
  date: Date;
  reason: string;
  appointmentId?: string;
  userId: string;
  notes?: string;
}

export interface Expense {
  id: string;
  appointmentId: string;
  description: string;
  amount: number;
  date: Date;
  category: 'medication' | 'procedure' | 'exam' | 'supply' | 'other';
  receipt?: string;
}

export interface Report {
  id: string;
  type: 'inventory' | 'appointments' | 'financial' | 'medical';
  title: string;
  dateRange: {
    start: Date;
    end: Date;
  };
  filters: Record<string, unknown>;
  generatedAt: Date;
  generatedBy: string;
}
