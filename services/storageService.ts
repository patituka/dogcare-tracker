import { AppData, PetProfile, Medication, MedicationType } from '../types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'dogcare_data_v3';

const DEFAULT_DATA: AppData = {
  pets: [],
  medications: []
};

export const loadData = (): AppData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      // Check for v2 or v1 data
      const oldStoredv2 = localStorage.getItem('dogcare_data_v2');
      const oldStoredv1 = localStorage.getItem('dogcare_data_v1');
      
      let oldData: any = null;
      if (oldStoredv2) oldData = JSON.parse(oldStoredv2);
      else if (oldStoredv1) oldData = JSON.parse(oldStoredv1);

      if (oldData) {
        // Migrate to v3
        const pets = Array.isArray(oldData.pets) ? oldData.pets : [];
        let migratedPets = [];
        let migratedMeds = oldData.medications || [];

        // v1 migration logic
        if (!Array.isArray(oldData.pets) && oldData.profile) {
             const newPetId = uuidv4();
             const newPet: PetProfile = {
                id: newPetId,
                name: oldData.profile.name || 'Mon Animal',
                type: 'Chien',
                breed: 'Race inconnue',
                avatar: 'blue',
                weightHistory: oldData.profile.weightHistory || []
             };
             migratedPets = [newPet];
             migratedMeds = (oldData.medications || []).map((m: any) => ({ ...m, petId: newPetId }));
        } else {
             // v2 migration
            migratedPets = pets.map((p: any) => ({
                ...p,
                breed: p.breed || '',
                avatar: p.avatar || 'blue'
            }));
        }
        
        // Migrate Medications to have nextDueDate and reminderEnabled
        migratedMeds = migratedMeds.map((m: any) => {
            const hasFreq = typeof m.frequencyDays === 'number';
            const isCritical = [MedicationType.VACCIN, MedicationType.VERMIFUGE, MedicationType.ANTI_PUCE].includes(m.type);
            
            let nextDate = m.nextDueDate;
            if (!nextDate && hasFreq) {
                const d = new Date(m.dateAdministered);
                d.setDate(d.getDate() + m.frequencyDays);
                nextDate = d.toISOString().split('T')[0];
            }

            return {
                ...m,
                reminderEnabled: m.reminderEnabled !== undefined ? m.reminderEnabled : (isCritical || hasFreq),
                nextDueDate: nextDate,
                frequencyDays: m.frequencyDays || 0
            };
        });

        return { 
            pets: migratedPets, 
            medications: migratedMeds 
        };
      }
      return DEFAULT_DATA;
    }
    return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to load data", e);
    return DEFAULT_DATA;
  }
};

export const saveData = (data: AppData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save data", e);
  }
};

export const calculateNextDate = (med: Medication): Date | null => {
  if (!med.reminderEnabled) return null;
  if (med.nextDueDate) return new Date(med.nextDueDate);
  
  // Fallback if data is weird
  const date = new Date(med.dateAdministered);
  date.setDate(date.getDate() + (med.frequencyDays || 30));
  return date;
};

export const isOverdue = (med: Medication): boolean => {
  const nextDate = calculateNextDate(med);
  if (!nextDate) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  nextDate.setHours(0, 0, 0, 0);
  return today > nextDate;
};

export const isDueSoon = (med: Medication, daysThreshold = 7): boolean => {
  const nextDate = calculateNextDate(med);
  if (!nextDate) return false;

  const today = new Date();
  const diffTime = nextDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= daysThreshold;
};