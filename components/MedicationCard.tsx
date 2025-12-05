import React, { useState } from 'react';
import { Medication, MedicationType } from '../types';
import { calculateNextDate, isOverdue, isDueSoon } from '../services/storageService';
import { Pill, Syringe, ShieldCheck, Activity, Clock, Trash2, Edit2, HelpCircle, Check, BellOff } from 'lucide-react';

interface MedicationCardProps {
  medication: Medication;
  onDelete: (id: string) => void;
  onEdit: (medication: Medication) => void;
  onRenew: (medication: Medication) => void;
}

export const MedicationCard: React.FC<MedicationCardProps> = ({ 
  medication, 
  onDelete, 
  onEdit,
  onRenew
}) => {
  const nextDate = medication.reminderEnabled ? calculateNextDate(medication) : null;
  const overdue = medication.reminderEnabled && isOverdue(medication);

  const getIcon = (type: MedicationType) => {
    switch (type) {
      case MedicationType.VACCIN: return <Syringe className="w-5 h-5 text-black" strokeWidth={2.5} />;
      case MedicationType.VERMIFUGE: return <Activity className="w-5 h-5 text-black" strokeWidth={2.5} />;
      case MedicationType.ANTI_PUCE: return <ShieldCheck className="w-5 h-5 text-black" strokeWidth={2.5} />;
      default: return <Pill className="w-5 h-5 text-black" strokeWidth={2.5} />;
    }
  };

  return (
    <div className="bg-white border-2 border-black p-3 shadow-retro flex flex-col gap-3 relative">
      
      {/* Alert Pattern for Overdue */}
      {overdue && (
        <div className="absolute top-0 right-0 bottom-0 w-2 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAIklEQVQIW2NkQAKrVq36zwjjgzhhYWGMYAEYB8RmROaABADeOQ8CXl/xfgAAAABJRU5ErkJggg==')] opacity-50 border-l-2 border-black"></div>
      )}

      <div className="flex justify-between items-start">
          <div className="flex items-start gap-3">
            <div className="border-2 border-black p-2 flex items-center justify-center bg-white shadow-[2px_2px_0_0_#000]">
               {getIcon(medication.type)}
            </div>
            <div>
               <h3 className="text-xl font-bold leading-none uppercase">{medication.name}</h3>
               <p className="text-sm font-bold bg-black text-white inline-block px-1 mt-1">{medication.type}</p>
            </div>
          </div>
          <div className="flex gap-2 pr-4">
             <button onClick={() => onEdit(medication)} className="hover:bg-black hover:text-white border border-transparent hover:border-black p-1"><Edit2 size={16} /></button>
             <button onClick={() => onDelete(medication.id)} className="hover:bg-black hover:text-white border border-transparent hover:border-black p-1"><Trash2 size={16} /></button>
          </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm border-t-2 border-black border-dashed pt-2">
         <div>
            <span className="block font-bold underline">LAST_ADMIN:</span>
            <span className="font-mono">{new Date(medication.dateAdministered).toLocaleDateString('fr-FR')}</span>
         </div>
         {medication.reminderEnabled && nextDate ? (
            <div>
                <span className="block font-bold underline">NEXT_DUE:</span>
                <span className={`font-mono flex items-center gap-1 ${overdue ? 'bg-black text-white px-1' : ''}`}>
                    {nextDate.toLocaleDateString('fr-FR')}
                    {overdue && " !"}
                </span>
            </div>
         ) : (
             <div className="text-gray-400 font-bold flex items-center gap-1">
                 <BellOff size={12} /> NO_ALARM
             </div>
         )}
      </div>

      <div className="flex gap-2 pt-1">
         {medication.reminderEnabled ? (
             <button onClick={() => onRenew(medication)} className="flex-1 border-2 border-black py-1 font-bold hover:bg-black hover:text-white active:translate-y-1 shadow-retro transition-none flex items-center justify-center gap-2">
                <Check size={16} /> CONFIRM
             </button>
         ) : <div className="flex-1"></div>}
      </div>
    </div>
  );
};