import React, { useState, useEffect } from 'react';
import { Exercise as ApiExercise, getExercises } from '../services/exerciseApi';
import { Save, Plus, Trash2, Search } from 'lucide-react';
import { Routine } from './RoutinesList';

interface CreateRoutineProps {
  existingRoutine: Routine | null;
  onSaveRoutine: (id: string | null, name: string, exercises: ApiExercise[]) => void;
  onCancel: () => void;
}

const CreateRoutine: React.FC<CreateRoutineProps> = ({ existingRoutine, onSaveRoutine, onCancel }) => {
  const [routineName, setRoutineName] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<ApiExercise[]>([]);
  const [allExercises, setAllExercises] = useState<ApiExercise[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Eğer düzenleme modundaysak, mevcut rutinin verilerini forma yükle
    if (existingRoutine) {
      setRoutineName(existingRoutine.name);
      // Gelen 'exercises' listesinin tam ApiExercise objesi olduğundan emin olmalıyız.
      // Supabase'den sadece id ve name geliyorsa, allExercises içinden eşleştirme yapmak gerekir.
      // Şimdilik gelen verinin uyumlu olduğunu varsayıyoruz.
      setSelectedExercises(existingRoutine.exercises as ApiExercise[]);
    }
    
    // Kütüphanedeki tüm hareketleri yükle
    const loadData = async () => {
      setLoading(true);
      const exercises = await getExercises();
      setAllExercises(exercises);
      setLoading(false);
    };
    loadData();
  }, [existingRoutine]);

  const handleAddExercise = (exercise: ApiExercise) => {
    if (!selectedExercises.find(e => e.name === exercise.name)) {
      setSelectedExercises(prev => [...prev, exercise]);
    }
  };

  const handleRemoveExercise = (exerciseId: string) => {
    setSelectedExercises(prev => prev.filter(e => e.id !== exerciseId));
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
    // Düzenleme modundaysak mevcut ID'yi, değilse null gönder
    onSaveRoutine(existingRoutine ? existingRoutine.id : null, routineName, selectedExercises);
  };

  const filteredLibrary = searchTerm
    ? allExercises.filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()) && !selectedExercises.some(se => se.name === e.name))
    : allExercises.filter(e => !selectedExercises.some(se => se.name === e.name));

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
            <button onClick={() => handleRemoveExercise(ex.id)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200">Hareket Ekle</h3>
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Hareket ara..." className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800" />
        </div>
        <div className="max-h-60 overflow-y-auto space-y-2 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg border dark:border-gray-700">
          {loading ? <p className="text-center text-gray-500">Yükleniyor...</p> : filteredLibrary.map(ex => (
            <div key={ex.id} className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-lg">
              <span className="text-gray-800 dark:text-gray-200">{ex.name}</span>
              <button onClick={() => handleAddExercise(ex)} className="text-blue-600 hover:text-blue-800"><Plus size={18} /></button>
            </div>
          ))}
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