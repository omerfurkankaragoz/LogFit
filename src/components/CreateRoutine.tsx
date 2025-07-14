import React, { useState } from 'react';
import { Save, Plus, Trash2 } from 'lucide-react';
import { Routine } from './RoutinesList';

// Arayüzleri ve prop'ları aynı tutuyoruz.
interface CreateRoutineProps {
  existingRoutine: Routine | null;
  onSaveRoutine: (id: string | null, name: string, exercises: { id: string; name: string }[]) => void;
  onCancel: () => void;
}

// Bu geçici versiyonda API çağrısı ve arama mantığı kaldırılmıştır.
const CreateRoutine: React.FC<CreateRoutineProps> = ({ existingRoutine, onSaveRoutine, onCancel }) => {
  const [routineName, setRoutineName] = useState(existingRoutine?.name || '');
  
  const handleSave = () => {
    alert("Bu sadece bir testtir, kaydetme işlemi devre dışı.");
  };

  return (
    <div className="p-4 space-y-6">
      <div>
        <label htmlFor="routineName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Rutin Adı (Test Modu)
        </label>
        <input type="text" id="routineName" value={routineName} onChange={(e) => setRoutineName(e.target.value)} placeholder="Örn: İtiş Antrenmanı" className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200" />
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200">Hareket Ekle</h3>
        <p className="text-sm text-center text-gray-500 py-4">API bağlantısı test için geçici olarak devre dışı bırakıldı.</p>
      </div>
      
      <div className="flex gap-3 mt-4">
        <button onClick={onCancel} className="flex-1 py-3 border rounded-xl text-gray-800 dark:text-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">İptal</button>
        <button onClick={handleSave} className="flex-1 py-3 bg-blue-600 text-white rounded-xl flex items-center justify-center gap-2"><Save size={20} /> Kaydet</button>
      </div>
    </div>
  );
};

export default CreateRoutine;