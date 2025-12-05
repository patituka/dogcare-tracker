export enum MedicationType {
  VACCIN = 'Vaccin',
  VERMIFUGE = 'Vermifuge',
  ANTI_PUCE = 'Anti-Puce/Tique',
  TRAITEMENT = 'Traitement',
  AUTRE = 'Autre'
}

export type PetType = 'Chien' | 'Chat';

export interface Medication {
  id: string;
  petId: string;
  name: string;
  type: MedicationType;
  dateAdministered: string; // ISO Date string YYYY-MM-DD
  nextDueDate?: string; // Explicit next date ISO string
  reminderEnabled: boolean;
  frequencyDays?: number; // Kept for backward compatibility/reference
  notes?: string;
}

export interface WeightEntry {
  date: string;
  weight: number; // in kg
}

export interface PetProfile {
  id: string;
  name: string;
  type: PetType;
  breed: string;
  avatar: string; // Identifier for the avatar style
  birthDate?: string;
  weightHistory: WeightEntry[];
}

export interface AppData {
  pets: PetProfile[];
  medications: Medication[];
}