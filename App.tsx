import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AppData, PetProfile, Medication, WeightEntry } from './types';
import { loadData, saveData } from './services/storageService';
import { MedicationCard } from './components/MedicationCard';
import { WeightChart } from './components/WeightChart';
import { AddMedicationModal } from './components/AddMedicationModal';
import { AddPetModal } from './components/AddPetModal';
import { Plus, Trash2, Edit2, Folder, HardDrive, Save, X, Apple } from 'lucide-react';

const App: React.FC = () => {
  const [data, setData] = useState<AppData>({ pets: [], medications: [] });
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  
  // Modals
  const [isMedModalOpen, setIsMedModalOpen] = useState(false);
  const [isPetModalOpen, setIsPetModalOpen] = useState(false);
  
  const [editingMed, setEditingMed] = useState<Medication | null>(null);
  const [editingPet, setEditingPet] = useState<PetProfile | null>(null);
  
  const [showWeightInput, setShowWeightInput] = useState(false);
  const [newWeight, setNewWeight] = useState('');

  // Initial load
  useEffect(() => {
    const loaded = loadData();
    setData(loaded);
    if (loaded.pets.length > 0) {
      setSelectedPetId(loaded.pets[0].id);
    } else {
      setIsPetModalOpen(true);
    }
  }, []);

  // Save on change
  useEffect(() => {
    if (data.pets.length > 0 || data.medications.length > 0) {
      saveData(data);
    }
  }, [data]);

  const currentPet = data.pets.find(p => p.id === selectedPetId);

  // --- CRUD Operations ---
  const handleSavePet = (petData: PetProfile | Omit<PetProfile, 'id' | 'weightHistory'>) => {
    if ('id' in petData) {
      setData(prev => ({
        ...prev,
        pets: prev.pets.map(p => p.id === petData.id ? { ...p, ...petData } : p)
      }));
    } else {
      const newPet: PetProfile = {
        ...petData,
        id: uuidv4(),
        weightHistory: []
      };
      setData(prev => ({ ...prev, pets: [...prev.pets, newPet] }));
      setSelectedPetId(newPet.id);
    }
  };

  const handleDeletePet = (id: string) => {
    if (window.confirm("ARE YOU SURE YOU WANT TO DELETE THIS RECORD?")) {
      setData(prev => ({
        pets: prev.pets.filter(p => p.id !== id),
        medications: prev.medications.filter(m => m.petId !== id)
      }));
      if (selectedPetId === id) {
        setSelectedPetId(data.pets.find(p => p.id !== id)?.id || null);
      }
    }
  };

  const handleSaveMedication = (med: Medication | Omit<Medication, 'id'>) => {
    if (!selectedPetId) return;
    if ('id' in med) {
      setData(prev => ({
        ...prev,
        medications: prev.medications.map(m => m.id === med.id ? med : m)
      }));
    } else {
      const newMed: Medication = {
        ...med,
        petId: selectedPetId,
        id: uuidv4()
      };
      setData(prev => ({
        ...prev,
        medications: [...prev.medications, newMed]
      }));
    }
  };

  const handleDeleteMedication = (id: string) => {
    if (window.confirm("DELETE THIS ITEM?")) {
      setData(prev => ({ ...prev, medications: prev.medications.filter(m => m.id !== id) }));
    }
  };

  const handleRenewMedication = (med: Medication) => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    let newNextDate = undefined;

    // Calculate new next date based on previous interval
    if (med.reminderEnabled && med.nextDueDate) {
        const lastAdmin = new Date(med.dateAdministered);
        const lastNext = new Date(med.nextDueDate);
        const diffTime = lastNext.getTime() - lastAdmin.getTime();
        if (diffTime > 0) {
            const next = new Date(today.getTime() + diffTime);
            newNextDate = next.toISOString().split('T')[0];
        }
    }

    handleSaveMedication({ 
        ...med, 
        dateAdministered: todayStr,
        nextDueDate: newNextDate
    });
  };

  const handleAddWeight = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeight || !selectedPetId) return;
    const entry: WeightEntry = { date: new Date().toISOString(), weight: parseFloat(newWeight) };
    setData(prev => ({
      ...prev,
      pets: prev.pets.map(p => p.id === selectedPetId ? { ...p, weightHistory: [...p.weightHistory, entry] } : p)
    }));
    setNewWeight('');
    setShowWeightInput(false);
  };

  // Helpers
  const getCurrentWeight = () => {
    if (!currentPet || currentPet.weightHistory.length === 0) return 0;
    const sorted = [...currentPet.weightHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return sorted[0].weight;
  };

  const calculateAge = (birthDateString?: string) => {
    if (!birthDateString) return null;
    const birthDate = new Date(birthDateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    if (age === 0) {
      const diffTime = Math.abs(today.getTime() - birthDate.getTime());
      const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30)); 
      return `${diffMonths} MOIS`;
    }
    return `${age} AN${age > 1 ? 'S' : ''}`;
  };

  const currentWeight = getCurrentWeight();
  const petMeds = data.medications.filter(m => m.petId === selectedPetId);
  const sortedMeds = [...petMeds].sort((a, b) => {
    const timeA = a.reminderEnabled && a.nextDueDate ? new Date(a.nextDueDate).getTime() : new Date(a.dateAdministered).getTime();
    const timeB = b.reminderEnabled && b.nextDueDate ? new Date(b.nextDueDate).getTime() : new Date(b.dateAdministered).getTime();
    return timeA - timeB;
  });

  return (
    <div className="h-full flex flex-col font-sans text-xl antialiased">
      
      {/* Menu Bar */}
      <div className="h-8 bg-white border-b-2 border-black flex items-center px-4 justify-between z-50 select-none">
        <div className="flex items-center gap-6">
          <button className="flex items-center justify-center hover:bg-black hover:text-white px-2 rounded-sm transition-colors">
             <Apple fill="currentColor" size={16} />
          </button>
          <span className="font-bold hover:bg-black hover:text-white px-2 cursor-default">File</span>
          <span className="font-bold hover:bg-black hover:text-white px-2 cursor-default">Edit</span>
          <span className="font-bold hover:bg-black hover:text-white px-2 cursor-default">View</span>
          <span className="font-bold hover:bg-black hover:text-white px-2 cursor-default">Special</span>
        </div>
        <div className="font-bold">
            {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </div>
      </div>

      {/* Desktop Environment */}
      <div className="flex-1 relative bg-dither p-4 overflow-hidden flex gap-4">
        
        {/* Desktop Icons (Left Side) */}
        <div className="w-32 flex flex-col gap-6 items-center z-10 pt-4">
            <button onClick={() => { setEditingPet(null); setIsPetModalOpen(true); }} className="group flex flex-col items-center gap-1 w-full">
                <div className="w-16 h-16 bg-white border-2 border-black flex items-center justify-center shadow-retro group-active:bg-black group-active:text-white">
                    <HardDrive size={32} strokeWidth={2} />
                </div>
                <span className="bg-white border border-black px-1 text-sm font-bold shadow-retro">NEW DISK</span>
            </button>
            
            <div className="border-b-2 border-black border-dashed w-16 opacity-50"></div>

            {data.pets.map(pet => (
                <button 
                  key={pet.id} 
                  onClick={() => setSelectedPetId(pet.id)}
                  className="group flex flex-col items-center gap-1 w-full"
                >
                    <div className={`w-16 h-16 border-2 border-black flex items-center justify-center shadow-retro transition-transform ${selectedPetId === pet.id ? 'bg-black text-white' : 'bg-white hover:bg-gray-100'}`}>
                        {pet.type === 'Chat' ? <Folder size={32} strokeWidth={2} /> : <Folder size={32} strokeWidth={2} />}
                    </div>
                    <span className={`bg-white border border-black px-1 text-sm font-bold shadow-retro ${selectedPetId === pet.id ? 'bg-black text-white' : ''}`}>
                        {pet.name.toUpperCase()}
                    </span>
                </button>
            ))}
        </div>

        {/* Main Window */}
        {currentPet && (
            <div className="flex-1 flex flex-col bg-white border-2 border-black shadow-retro-lg max-w-5xl h-[calc(100vh-80px)] mt-4 animate-in zoom-in-95 duration-200">
                {/* Window Title Bar */}
                <div className="h-8 border-b-2 border-black bg-stripes flex items-center justify-between px-2 cursor-default">
                    <div className="w-4 h-4 border-2 border-black bg-white flex items-center justify-center hover:bg-black hover:text-white cursor-pointer" onClick={() => setSelectedPetId(null)}>
                        <div className="w-2 h-2 border border-black"></div>
                    </div>
                    <span className="bg-white px-4 font-bold border-l-2 border-r-2 border-black">
                        {currentPet.name.toUpperCase()} - INFO.SYS
                    </span>
                    <div className="w-4"></div> {/* Spacer for balance */}
                </div>

                {/* Window Content */}
                <div className="flex-1 overflow-auto p-1 bg-white">
                    <div className="flex flex-col h-full">
                        
                        {/* Header Info Block */}
                        <div className="border-2 border-black p-4 mb-4 flex justify-between items-start bg-white">
                            <div className="flex items-start gap-4">
                                <div className="w-20 h-20 border-2 border-black flex items-center justify-center bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAIklEQVQIW2NkQAKrVq36zwjjgzhhYWGMYAEYB8RmROaABADeOQ8CXl/xfgAAAABJRU5ErkJggg==')]">
                                    <div className="bg-white border border-black p-1">
                                        {/* Simple pixelated representation */}
                                        <div className="w-12 h-12 flex items-center justify-center font-bold text-3xl">
                                            {currentPet.type === 'Chat' ? 'C' : 'D'}
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h1 className="text-4xl font-bold uppercase underline decoration-2 underline-offset-4">{currentPet.name}</h1>
                                    <div className="mt-2 text-lg leading-none space-y-1">
                                        <p>BREED: {currentPet.breed.toUpperCase() || 'UNKNOWN'}</p>
                                        <p>AGE: {calculateAge(currentPet.birthDate) || 'UNKNOWN'}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex flex-col items-end gap-2">
                                <div className="flex gap-2">
                                    <button onClick={() => { setEditingPet(currentPet); setIsPetModalOpen(true); }} className="border-2 border-black px-3 py-1 hover:bg-black hover:text-white shadow-retro active:translate-y-1 active:shadow-none transition-all text-sm font-bold flex items-center gap-2">
                                        <Edit2 size={16} /> EDIT
                                    </button>
                                    <button onClick={() => handleDeletePet(currentPet.id)} className="border-2 border-black px-3 py-1 hover:bg-black hover:text-white shadow-retro active:translate-y-1 active:shadow-none transition-all text-sm font-bold flex items-center gap-2">
                                        <Trash2 size={16} /> TRASH
                                    </button>
                                </div>
                                <div className="mt-2 border-2 border-black p-2 shadow-retro bg-white text-right">
                                    <p className="text-xs font-bold mb-1">CURRENT_WEIGHT</p>
                                    <div className="text-2xl font-bold flex items-center gap-2 justify-end">
                                        {currentWeight} KG
                                        <button onClick={() => setShowWeightInput(!showWeightInput)} className="w-6 h-6 border-2 border-black flex items-center justify-center hover:bg-black hover:text-white text-lg leading-none pb-1">
                                            +
                                        </button>
                                    </div>
                                </div>
                                {showWeightInput && (
                                    <form onSubmit={handleAddWeight} className="flex gap-2 mt-2 items-center bg-white p-2 border-2 border-black absolute z-20 shadow-retro">
                                        <input autoFocus type="number" step="0.1" value={newWeight} onChange={e => setNewWeight(e.target.value)} className="w-20 border-b-2 border-black outline-none font-bold text-xl bg-white text-black" placeholder="0.0" />
                                        <button className="bg-black text-white px-2 py-1 font-bold hover:invert">OK</button>
                                    </form>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-4 flex-1 min-h-0">
                            {/* Chart Section */}
                            <div className="flex-1 border-2 border-black flex flex-col p-1">
                                <div className="bg-black text-white text-center text-sm font-bold py-1 mb-2">WEIGHT_HISTORY_LOG</div>
                                <div className="flex-1 border border-black relative">
                                    <WeightChart data={currentPet.weightHistory} />
                                </div>
                            </div>

                            {/* Meds List */}
                            <div className="flex-[1.5] border-2 border-black flex flex-col p-1 bg-[#f0f0f0]" style={{backgroundImage: 'radial-gradient(#000 10%, transparent 10%)', backgroundSize: '10px 10px'}}>
                                <div className="bg-white border-2 border-black p-1 flex justify-between items-center mb-2 shadow-retro">
                                    <span className="font-bold pl-2">MEDICATION_QUEUE</span>
                                    <button onClick={() => { setEditingMed(null); setIsMedModalOpen(true); }} className="border-2 border-black px-2 hover:bg-black hover:text-white text-sm font-bold flex items-center gap-1 active:shadow-none shadow-[2px_2px_0_0_#000]">
                                        <Plus size={14} /> NEW
                                    </button>
                                </div>
                                
                                <div className="flex-1 overflow-y-auto space-y-3 pr-2 pb-2">
                                    {sortedMeds.map(med => (
                                        <MedicationCard 
                                           key={med.id} 
                                           medication={med} 
                                           onDelete={handleDeleteMedication}
                                           onEdit={() => { setEditingMed(med); setIsMedModalOpen(true); }}
                                           onRenew={handleRenewMedication}
                                        />
                                    ))}
                                    {sortedMeds.length === 0 && (
                                        <div className="bg-white border-2 border-black p-8 text-center font-bold shadow-retro">
                                            NO RECORDS FOUND.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}
      </div>

      <AddPetModal isOpen={isPetModalOpen} onClose={() => setIsPetModalOpen(false)} onSave={handleSavePet} initialData={editingPet} />
      <AddMedicationModal isOpen={isMedModalOpen} onClose={() => setIsMedModalOpen(false)} onSave={handleSaveMedication} initialData={editingMed} />
    </div>
  );
};

export default App;