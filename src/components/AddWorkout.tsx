import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, BookCopy, Search } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Exercise, Workout } from '../App';
import { Routine } from './RoutinesList';
import { searchExercisesByName, Exercise as ApiExercise } from '../services/exerciseApi';

interface AddWorkoutProps {
  date: string;
  existingWorkout: Workout | null;
  routines: Routine[];
  workouts: Workout[]; // Tüm antrenman geçmişi
  onSave: (workout: Omit<Workout, 'id'>) => void;
  onCancel: () => void;
}

const AddWorkout: React.FC<AddWorkoutProps> = ({ date, existingWorkout, routines, workouts, onSave, onCancel }) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isRoutinePickerOpen, setRoutinePickerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchedExercises, setSearchedExercises] = useState<ApiExercise[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (existingWorkout) {
      setExercises(existingWorkout.exercises);
    } else {
      setExercises([]);
    }
    setSearchTerm('');
    setSearchedExercises([]);
  }, [existingWorkout, date]);

  useEffect(() => {
    const searchTimer = setTimeout(async () => {
      if (searchTerm.trim().length < 2) {
        setSearchedExercises([]);
        return;
      }
      setLoading(true);
      const results = await searchExercisesByName(searchTerm);
      const filteredResults = results.filter(apiEx =>
        !exercises.some(ex => ex.name.toLowerCase() === apiEx.name.toLowerCase())
      );
      setSearchedExercises(filteredResults);
      setLoading(false);
    }, 500);

    return () => clearTimeout(searchTimer);
  }, [searchTerm, exercises]);

  const getPreviousExerciseData = (exerciseName: string): Exercise | null => {
    if (!exerciseName) return null;
    // Mevcut tarihten önceki antrenmanları bul ve tarihe göre sırala
    const sortedWorkouts = [...workouts]
      .filter(w => w.date < date)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // En son antrenmanda bu egzersizi ara
    for (const prevWorkout of sortedWorkouts) {
      const exercise = prevWorkout.exercises.find(ex => ex.name.toLowerCase() === exerciseName.toLowerCase());
      if (exercise) {
        return exercise; // Egzersizi bulursak döndür
      }
    }
    return null; // Bulamazsak null döndür
  };

  const handleSelectRoutine = (routine: Routine) => {
    const exercisesFromRoutine = routine.exercises.map(ex => ({
      id: Date.now().toString() + ex.name,
      name: ex.name,
      sets: [{ reps: 0, weight: 0 }]
    }));
    setExercises(exercisesFromRoutine);
    setRoutinePickerOpen(false);
  };

  const handleAddSearchedExercise = (exercise: ApiExercise) => {
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: exercise.name,
      sets: [{ reps: 0, weight: 0 }]
    };
    setExercises(prev => [...prev, newExercise]);
    setSearchTerm('');
    setSearchedExercises([]);
  };

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
        prev.map(ex =>
            ex.id === exerciseId
                ? { ...ex, sets: ex.sets.filter((_, i) => i !== setIndex) }
                : ex
        )
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
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          {format(new Date(date), 'dd MMMM yyyy', { locale: tr })}
        </h2>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <button
            onClick={() => setRoutinePickerOpen(prev => !prev)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg text-sm font-semibold hover:bg-green-600 transition-colors"
          >
            <BookCopy size={16} /> Rutinden Ekle
          </button>
          {isRoutinePickerOpen && (
            <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl z-10 border dark:border-gray-700">
              {routines.length > 0 ? routines.map(routine => (
                <a key={routine.id} onClick={() => handleSelectRoutine(routine)} className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                  {routine.name}
                </a>
              )) : <span className="block px-4 py-3 text-sm text-gray-500">Kayıtlı rutin yok.</span>}
            </div>
          )}
        </div>

        <div className="space-y-2">
            <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Hareket ara ve ekle..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                />
            </div>
            {(loading || searchedExercises.length > 0 || (searchTerm.length > 1 && !loading)) && (
                 <div className="max-h-60 overflow-y-auto space-y-2 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg border dark:border-gray-700">
                    {loading ? <p className="text-center text-gray-500 p-3">Aranıyor...</p> : searchedExercises.map(ex => (
                        <div key={ex.id} className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
                        <span className="text-gray-800 dark:text-gray-200">{ex.name}</span>
                        <button onClick={() => handleAddSearchedExercise(ex)} className="text-blue-600 hover:text-blue-800"><Plus size={18} /></button>
                        </div>
                    ))}
                    {!loading && searchedExercises.length === 0 && searchTerm.length > 1 && (
                        <p className="text-center text-gray-500 p-3">Hareket bulunamadı.</p>
                    )}
                </div>
            )}
        </div>

        <button
          onClick={addExercise}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <Plus size={16} /> Manuel Hareket Ekle
        </button>
      </div>

      <div className="space-y-6">
        {exercises.length > 0 && (
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b pb-2 border-gray-200 dark:border-gray-700">
                Antrenman Listesi
            </h3>
        )}
        {exercises.map((exercise) => {
          const previousExercise = getPreviousExerciseData(exercise.name);
          const previousMaxWeight = previousExercise && previousExercise.sets.length > 0
            ? Math.max(...previousExercise.sets.map(s => s.weight))
            : null;

          return (
            <div key={exercise.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="text"
                  value={exercise.name}
                  onChange={(e) => updateExerciseName(exercise.id, e.target.value)}
                  placeholder="Hareket adı"
                  className="flex-1 p-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                />
                <button onClick={() => removeExercise(exercise.id)} className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg transition-colors">
                  <Trash2 size={20} />
                </button>
              </div>
              <div className="space-y-2">
                <div className="grid grid-cols-5 gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 px-1">
                  <span>Set</span>
                  <span>Önceki</span>
                  <span>Kg</span>
                  <span>Tekrar</span>
                  <span></span>
                </div>
                {exercise.sets.map((set, setIndex) => {
                  return (
                    <div key={setIndex} className="grid grid-cols-5 gap-2 items-center">
                      <span className="text-center font-medium text-gray-500 dark:text-gray-400">{setIndex + 1}</span>
                      <div className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 p-2 rounded-md h-full flex items-center justify-center">
                        {previousMaxWeight !== null ? `${previousMaxWeight}kg` : '-'}
                      </div>
                      <input type="number" inputMode="numeric" value={set.weight || ''} onChange={(e) => updateSet(exercise.id, setIndex, 'weight', parseFloat(e.target.value) || 0)} placeholder="0" step="0.5" className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200" />
                      <input type="number" inputMode="numeric" value={set.reps || ''} onChange={(e) => updateSet(exercise.id, setIndex, 'reps', parseInt(e.target.value) || 0)} placeholder="0" className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200" />
                      <button onClick={() => removeSet(exercise.id, setIndex)} className="text-gray-400 hover:text-red-500 m-auto">
                        <Trash2 size={16}/>
                      </button>
                    </div>
                  );
                })}
              </div>
              <button onClick={() => addSet(exercise.id)} className="w-full mt-3 p-2 text-blue-600 border-2 border-blue-200 dark:border-blue-800 border-dashed rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/50 transition-colors">
                + Set Ekle
              </button>
            </div>
          );
        })}
      </div>

      {exercises.length > 0 && (
        <div className="flex gap-3 mt-8">
            <button onClick={onCancel} className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                İptal
            </button>
            <button onClick={handleSave} className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                <Save size={20} /> Antrenmanı Kaydet
            </button>
        </div>
      )}
       {exercises.length === 0 && (
         <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">Başlamak için bir rutin seçin, hareket arayın veya manuel olarak ekleyin.</p>
             <button
                onClick={onCancel}
                className="mt-4 py-2 px-6 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
                Geri Dön
            </button>
         </div>
      )}

    </div>
  );
};

export default AddWorkout;
