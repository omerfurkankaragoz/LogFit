import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, BookCopy } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Exercise, Workout } from '../App';
import { Routine } from './RoutinesList'; // RoutinesList'ten Routine arayüzünü import ediyoruz

interface AddWorkoutProps {
  date: string;
  existingWorkout: Workout | null;
  routines: Routine[]; // App.tsx'den gelen rutinler listesi
  onSave: (workout: Omit<Workout, 'id'>) => void;
  onCancel: () => void;
}

const AddWorkout: React.FC<AddWorkoutProps> = ({ date, existingWorkout, routines, onSave, onCancel }) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isRoutinePickerOpen, setRoutinePickerOpen] = useState(false);

  useEffect(() => {
    if (existingWorkout) {
      setExercises(existingWorkout.exercises);
    } else {
      setExercises([]);
    }
  }, [existingWorkout, date]); // 'date' değişikliğini de dinle

  // --- YENİ FONKSİYONLAR ---
  const handleSelectRoutine = (routine: Routine) => {
    const exercisesFromRoutine = routine.exercises.map(ex => ({
      id: Date.now().toString() + ex.name,
      name: ex.name,
      sets: [{ reps: 0, weight: 0 }]
    }));
    setExercises(exercisesFromRoutine);
    setRoutinePickerOpen(false);
  };
  // -------------------------  


  const addExercise = () => {
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: '',
      sets: [{ reps: 0, weight: 0 }]
    };
    setExercises(prev => [...prev, newExercise]);
  };

  const removeExercise = (exerciseId: string) => {
    setExercises(prev => prev.filter(ex => ex.id !== exerciseId));
  };

  const updateExerciseName = (exerciseId: string, name: string) => {
    setExercises(prev => prev.map(ex => ex.id === exerciseId ? { ...ex, name } : ex));
  };

  const addSet = (exerciseId: string) => {
    setExercises(prev =>
      prev.map(ex => {
        if (ex.id === exerciseId) {
          const lastSet = ex.sets.length > 0 ? ex.sets[ex.sets.length - 1] : { reps: 0, weight: 0 };
          return { ...ex, sets: [...ex.sets, { reps: lastSet.reps, weight: lastSet.weight }] };
        }
        return ex;
      })
    );
  };

  const removeSet = (exerciseId: string, setIndex: number) => {
    setExercises(prev =>
      prev.map(ex => ex.id === exerciseId ? { ...ex, sets: ex.sets.filter((_, i) => i !== setIndex) } : ex)
    );
  };

  const updateSet = (exerciseId: string, setIndex: number, field: 'reps' | 'weight', value: number) => {
    setExercises(prev =>
      prev.map(ex => ex.id === exerciseId ? { ...ex, sets: ex.sets.map((set, i) => i === setIndex ? { ...set, [field]: value } : set) } : ex)
    );
  };

  const handleSave = () => {
    const validExercises = exercises.filter(ex => 
      ex.name.trim() && ex.sets.some(set => set.reps > 0 || set.weight > 0)
    ).map(ex => ({ ...ex, sets: ex.sets.filter(set => set.reps > 0 || set.weight > 0) }));

    if (validExercises.length === 0) {
      alert('Kaydedilecek bir set bulunamadı.');
      return;
    }
    onSave({ date, exercises: validExercises });
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          {format(new Date(date), 'dd MMMM yyyy', { locale: tr })}
        </h2>
        
        {/* --- YENİ RUTİN SEÇME BUTONU --- */}
        <div className="relative">
          <button 
            onClick={() => setRoutinePickerOpen(prev => !prev)}
            className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
          >
            <BookCopy size={16} /> Rutin Seç
          </button>
          {isRoutinePickerOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-10 border dark:border-gray-700">
              {routines.length > 0 ? routines.map(routine => (
                <a
                  key={routine.id}
                  onClick={() => handleSelectRoutine(routine)}
                  className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                >
                  {routine.name}
                </a>
              )) : <span className="block px-4 py-3 text-sm text-gray-500">Kayıtlı rutin yok.</span>}
            </div>
          )}
        </div>
        {/* ----------------------------- */}

      </div>

      <div className="space-y-6">
        {exercises.map((exercise) => (
          <div key={exercise.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <input
                type="text"
                value={exercise.name}
                onChange={(e) => updateExerciseName(exercise.id, e.target.value)}
                placeholder="Hareket adı"
                className="flex-1 p-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              />
              <button
                onClick={() => removeExercise(exercise.id)}
                className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-4 gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 px-2">
                <span>Set</span>
                <span>Tekrar</span>
                <span>Kg</span>
                <span></span>
              </div>
              
              {exercise.sets.map((set, setIndex) => (
                <div key={setIndex} className="grid grid-cols-4 gap-2 items-center">
                  <span className="text-center font-medium text-gray-500 dark:text-gray-400">
                    {setIndex + 1}
                  </span>
                  <input
                    type="number"
                    inputMode="numeric" 
                    value={set.reps || ''}
                    onChange={(e) => updateSet(exercise.id, setIndex, 'reps', parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  />
                  <input
                    type="number"
                    inputMode="numeric"
                    value={set.weight || ''}
                    onChange={(e) => updateSet(exercise.id, setIndex, 'weight', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    step="0.5"
                    className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  />
                </div>
              ))}
            </div>

            <button
              onClick={() => addSet(exercise.id)}
              className="w-full mt-3 p-2 text-blue-600 border-2 border-blue-200 dark:border-blue-800 border-dashed rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/50 transition-colors"
            >
              + Set Ekle
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={addExercise}
        className="w-full mt-6 p-4 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl border-2 border-gray-200 dark:border-gray-600 border-dashed hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
      >
        <Plus size={20} />
        Manuel Hareket Ekle
      </button>

      <div className="flex gap-3 mt-8">
        <button
          onClick={onCancel}
          className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          İptal
        </button>
        <button
          onClick={handleSave}
          className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <Save size={20} />
          Antrenmanı Kaydet
        </button>
      </div>
    </div>
  );
};

export default AddWorkout;