import React, { useState, useEffect } from 'react';
import { Medication, MedicationType } from '../types';
import { X, Save, Bell, BellOff } from 'lucide-react';

interface AddMedicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (med: Omit<Medication, 'id'> | Medication) => void;
  initialData?: Medication | null;
}

export const AddMedicationModal: React.FC<AddMedicationModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData 
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<MedicationType>(MedicationType.ANTI_PUCE);
  const [dateAdministered, setDateAdministered] = useState(new Date().toISOString().split('T')[0]);
  const [nextDueDate, setNextDueDate] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen && !initialData) {
       const isCritical = [MedicationType.VACCIN, MedicationType.VERMIFUGE, MedicationType.ANTI_PUCE].includes(type);
       setReminderEnabled(isCritical);
       const d = new Date();
       d.setDate(d.getDate() + 30);
       setNextDueDate(d.toISOString().split('T')[0]);
    }
  }, [isOpen, type, initialData]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setType(initialData.type);
        setDateAdministered(initialData.dateAdministered);
        setNextDueDate(initialData.nextDueDate || '');
        setReminderEnabled(initialData.reminderEnabled);
        setNotes(initialData.notes || '');
      } else {
        setName('');
        setDateAdministered(new Date().toISOString().split('T')[0]);
        setNotes('');
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const medData = {
      name,
      type,
      dateAdministered,
      nextDueDate: reminderEnabled ? nextDueDate : undefined,
      reminderEnabled,
      notes,
      ...(initialData ? { id: initialData.id, petId: initialData.petId } : {})
    };
    onSave(medData as any);
    onClose();
  };

  const applyDuration = (months: number) => {
    const start = new Date(dateAdministered);
    start.setMonth(start.getMonth() + months);
    setNextDueDate(start.toISOString().split('T')[0]);
    setReminderEnabled(true);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAIklEQVQIW2NkQAKrVq36zwjjgzhhYWGMYAEYB8RmROaABADeOQ8CXl/xfgAAAABJRU5ErkJggg==')]">
      <div className="bg-white border-2 border-black w-full max-w-lg shadow-[8px_8px_0_0_#000] p-1 font-mono">
        
        <div className="bg-stripes h-6 mb-4 border-2 border-black flex items-center justify-center relative">
             <span className="bg-white px-2 font-bold text-sm border-l-2 border-r-2 border-black uppercase">
               {initialData ? 'EDIT_ITEM' : 'NEW_ITEM'}
             </span>
             <button onClick={onClose} className="absolute left-1 top-1 w-3 h-3 border border-black hover:bg-black"></button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block font-bold mb-1">ITEM_NAME:</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border-2 border-black outline-none bg-white text-black focus:ring-1 focus:ring-black"
            />
          </div>

          <div>
            <label className="block font-bold mb-1">TYPE:</label>
            <div className="flex flex-wrap gap-2">
              {Object.values(MedicationType).map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setType(t)}
                  className={`px-2 py-1 border-2 text-sm font-bold ${
                    type === t 
                    ? 'bg-black text-white border-black' 
                    : 'bg-white text-black border-black hover:bg-gray-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="border-2 border-black p-3 space-y-3">
             <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                     <span className="font-bold">REMINDER_SYSTEM:</span>
                 </div>
                 <button 
                    type="button"
                    onClick={() => setReminderEnabled(!reminderEnabled)}
                    className="border-2 border-black px-2 font-bold hover:bg-black hover:text-white"
                 >
                    {reminderEnabled ? 'ON' : 'OFF'}
                 </button>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1">DATE_GIVEN:</label>
                  <input
                    type="date"
                    required
                    value={dateAdministered}
                    onChange={(e) => setDateAdministered(e.target.value)}
                    className="w-full p-1 border-2 border-black text-sm bg-white text-black"
                  />
                </div>
                
                {reminderEnabled && (
                  <div>
                    <label className="block text-xs font-bold mb-1">NEXT_DUE:</label>
                    <input
                      type="date"
                      required={reminderEnabled}
                      value={nextDueDate}
                      onChange={(e) => setNextDueDate(e.target.value)}
                      className="w-full p-1 border-2 border-black text-sm bg-white text-black"
                    />
                  </div>
                )}
             </div>

             {reminderEnabled && (
                  <div className="flex gap-2">
                    {[1, 3, 6, 12].map(months => (
                      <button
                        key={months}
                        type="button"
                        onClick={() => applyDuration(months)}
                        className="flex-1 border border-black text-xs font-bold hover:bg-black hover:text-white py-1"
                      >
                        +{months}M
                      </button>
                    ))}
                  </div>
              )}
          </div>

          <div className="flex gap-4 pt-2">
             <button
                type="button"
                onClick={onClose}
                className="flex-1 border-2 border-black py-3 font-bold hover:bg-black hover:text-white shadow-retro active:translate-y-1 active:shadow-none"
              >
                CANCEL
              </button>
            <button
              type="submit"
              className="flex-1 border-2 border-black py-3 font-bold hover:bg-black hover:text-white shadow-retro active:translate-y-1 active:shadow-none flex items-center justify-center gap-2"
            >
              <Save size={16} /> SAVE_RECORD
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};