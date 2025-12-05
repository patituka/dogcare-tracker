import React, { useState, useEffect } from 'react';
import { PetProfile, PetType } from '../types';
import { X, Save, Dog, Cat } from 'lucide-react';

interface AddPetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (pet: Omit<PetProfile, 'id' | 'weightHistory'> | PetProfile) => void;
  initialData?: PetProfile | null;
}

export const AddPetModal: React.FC<AddPetModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData 
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<PetType>('Chien');
  const [breed, setBreed] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [avatar, setAvatar] = useState('blue');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setType(initialData.type);
        setBreed(initialData.breed || '');
        setBirthDate(initialData.birthDate || '');
        setAvatar('blue');
      } else {
        setName('');
        setType('Chien');
        setBreed('');
        setBirthDate('');
        setAvatar('blue');
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const petData = {
      name,
      type,
      breed,
      birthDate,
      avatar,
      ...(initialData ? { id: initialData.id, weightHistory: initialData.weightHistory } : {})
    };
    onSave(petData as any);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAIklEQVQIW2NkQAKrVq36zwjjgzhhYWGMYAEYB8RmROaABADeOQ8CXl/xfgAAAABJRU5ErkJggg==')]">
      <div className="bg-white border-2 border-black w-full max-w-md shadow-[8px_8px_0_0_#000] p-1">
        
        {/* Modal Title Bar */}
        <div className="bg-stripes h-6 mb-4 border-2 border-black flex items-center justify-center relative">
            <span className="bg-white px-2 font-bold text-sm border-l-2 border-r-2 border-black">
                {initialData ? 'EDIT_PROFILE' : 'NEW_PROFILE'}
            </span>
            <button onClick={onClose} className="absolute left-1 top-1 w-3 h-3 border border-black hover:bg-black"></button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 font-mono">
          
          <div className="flex justify-center gap-4 mb-6">
             <button
                type="button"
                onClick={() => setType('Chien')}
                className={`flex flex-col items-center gap-2 p-2 border-2 ${
                  type === 'Chien' 
                  ? 'border-black bg-black text-white' 
                  : 'border-transparent hover:border-black'
                }`}
              >
                <Dog size={32} strokeWidth={2} /> <span className="font-bold">DOG</span>
              </button>
              <button
                type="button"
                onClick={() => setType('Chat')}
                className={`flex flex-col items-center gap-2 p-2 border-2 ${
                  type === 'Chat' 
                  ? 'border-black bg-black text-white' 
                  : 'border-transparent hover:border-black'
                }`}
              >
                <Cat size={32} strokeWidth={2} /> <span className="font-bold">CAT</span>
              </button>
          </div>
          
          <div>
            <label className="block font-bold mb-1">NAME:</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border-2 border-black outline-none bg-white text-black transition-none focus:ring-1 focus:ring-black"
            />
          </div>

          <div>
            <label className="block font-bold mb-1">BREED:</label>
            <input
                type="text"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                className="w-full p-2 border-2 border-black outline-none bg-white text-black transition-none focus:ring-1 focus:ring-black"
            />
          </div>

          <div>
            <label className="block font-bold mb-1">BIRTH_DATE:</label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full p-2 border-2 border-black outline-none bg-white text-black transition-none focus:ring-1 focus:ring-black"
            />
          </div>

          <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border-2 border-black py-2 font-bold hover:bg-black hover:text-white shadow-retro active:translate-y-1 active:shadow-none"
              >
                CANCEL
              </button>
              <button
                type="submit"
                className="flex-1 border-2 border-black py-2 font-bold hover:bg-black hover:text-white shadow-retro active:translate-y-1 active:shadow-none flex items-center justify-center gap-2"
              >
                <Save size={16} /> SAVE
              </button>
          </div>
        </form>
      </div>
    </div>
  );
};