import React, { useState, useEffect } from 'react';
import { Exercise as ApiExercise, searchExercisesByName } from '../services/exerciseApi';
import { Save, Plus, Trash2, Search } from 'lucide-react';
import { Routine } from './RoutinesList';

interface CreateRoutineProps {
  existingRoutine: Routine | null;
  onSaveRoutine: (id: string | null, name: string, exercises: { id: string; name: string }[]) => void;
  onCancel: () => void;
}

const CreateRoutine: React.FC<CreateRoutineProps> = ({ existingRoutine, onSaveRoutine, onCancel }) => {
  const [routineName, setRoutineName] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<{ id: string; name: string }[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchedExercises, setSearchedExercises] = useState<ApiExercise[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (existingRoutine) {
      setRoutineName(existingRoutine.name);
      setSelectedExercises(existingRoutine.exercises);
    }
  }, [existingRoutine]);

  useEffect(() => {
    const searchTimer = setTimeout(async () => {
      if (searchTerm.trim().length < 2) {
        setSearchedExercises([]);
        return;
      }
      setLoading(true);
      const results = await searchExercisesByName(searchTerm);
      setSearchedExercises(results);
      setLoading(false);
    }, 500);

    return () => clearTimeout(searchTimer);
  }, [searchTerm]);

  const handleAddExercise = (exercise: ApiExercise) => {
    if (!selectedExercises.find(e => e.name.toLowerCase() === exercise.name.toLowerCase())) {
      setSelectedExercises(prev => [...prev, { id: exercise.id, name: exercise.name }]);
    }
  };

  const handleRemoveExercise = (exerciseName: string) => {
    setSelectedExercises(prev => prev.filter(e => e.name !== exerciseName));
  };

  const handleSave = () => {
    if (!routineName.trim()) {
      alert('Lütfen rutin için bir isim girin.');
      return;
    }
    if (selectedExercises.length === 0) {
      alert('Lütfen rutine en az bir hareket ekleyin.');
      return;
    }
    onSaveRoutine(existingRoutine ? existingRoutine.id : null, routineName, selectedExercises);
  };

  const filteredLibrary = searchedExercises.filter(
    ex => !selectedExercises.some(se => se.name.toLowerCase() === ex.name.toLowerCase())
  );

  return (
    <div className="p-4 space-y-6">
      <div>
        <label htmlFor="routineName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Rutin Adı
        </label>
        <input type="text" id="routineName" value={routineName} onChange={(e) => setRoutineName(e.target.value)} placeholder="Örn: İtiş Antrenmanı" className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200" />
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200">Rutindeki Hareketler ({selectedExercises.length})</h3>
        {selectedExercises.map(ex => (
          <div key={ex.id} className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
            <span className="text-gray-800 dark:text-gray-200">{ex.name}</span>
            <button onClick={() => handleRemoveExercise(ex.name)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
          </div>
        ))}
         {selectedExercises.length === 0 && (
            <p className="text-sm text-center text-gray-500 py-4">Rutine hareket eklemek için aşağıdan arama yapın.</p>
        )}
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200">Hareket Ekle</h3>
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            placeholder="Hareket ara..." 
            className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200" 
          />
        </div>
        <div className="max-h-60 overflow-y-auto space-y-2 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg border dark:border-gray-700">
          {loading ? <p className="text-center text-gray-500">Aranıyor...</p> : filteredLibrary.map(ex => (
            <div key={ex.id} className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-lg">
              <span className="text-gray-800 dark:text-gray-200">{ex.name}</span>
              <button onClick={() => handleAddExercise(ex)} className="text-blue-600 hover:text-blue-800"><Plus size={18} /></button>
            </div>
          ))}
           {!loading && filteredLibrary.length === 0 && searchTerm.length > 1 && (
                <p className="text-center text-gray-500 p-3">Aramayla eşleşen hareket bulunamadı.</p>
            )}
        </div>
      </div>
      
      <div className="flex gap-3 mt-4">
        <button onClick={onCancel} className="flex-1 py-3 border rounded-xl text-gray-800 dark:text-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">İptal</button>
        <button onClick={handleSave} className="flex-1 py-3 bg-blue-600 text-white rounded-xl flex items-center justify-center gap-2"><Save size={20} /> Kaydet</button>
      </div>
    </div>
  );
};
export default CreateRoutine;