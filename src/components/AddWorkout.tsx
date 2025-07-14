import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, Save, BookCopy, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Exercise, Workout } from '../App';
import { Routine } from './RoutinesList';
import { getAllExercises, getBodyParts, Exercise as LibraryExercise } from '../services/exerciseApi';

// SUPABASE PROJE URL'NİZİ BURAYA GİRİN
const SUPABASE_PROJECT_URL = 'https://ekrhekungvoisfughwuz.supabase.co'; 
const BUCKET_NAME = 'images';

interface AddWorkoutProps {
  date: string;
  existingWorkout: Workout | null;
  routines: Routine[];
  workouts: Workout[]; // Önceki veriler için
  onSave: (workout: Omit<Workout, 'id'>) => void;
  onCancel: () => void;
}

const AddWorkout: React.FC<AddWorkoutProps> = ({ date, existingWorkout, routines, workouts, onSave, onCancel }) => {
  const [workoutExercises, setWorkoutExercises] = useState<Exercise[]>([]);
  const [isRoutinePickerOpen, setRoutinePickerOpen] = useState(false);

  // Library States
  const [allLibraryExercises, setAllLibraryExercises] = useState<LibraryExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBodyPart, setSelectedBodyPart] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [bodyParts, setBodyParts] = useState<string[]>([]);

  // Fetch all library exercises and body parts on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      const [parts, exercises] = await Promise.all([
        getBodyParts(),
        getAllExercises()
      ]);
      setBodyParts(parts);
      setAllLibraryExercises(exercises);
      setLoading(false);
    };
    fetchInitialData();
  }, []);

  // Populate workout list when editing
  useEffect(() => {
    if (existingWorkout) {
      setWorkoutExercises(existingWorkout.exercises);
    } else {
      setWorkoutExercises([]);
    }
  }, [existingWorkout]);

  // Memoized filtering for the library view
  const filteredLibraryExercises = useMemo(() => {
    const workoutExerciseNames = new Set(workoutExercises.map(ex => ex.name.toLowerCase()));
    
    let exercises = allLibraryExercises.filter(
      libEx => !workoutExerciseNames.has(libEx.name.toLowerCase())
    );

    if (searchQuery.trim()) {
      exercises = exercises.filter(ex =>
        ex.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
      );
    }

    if (selectedBodyPart !== 'all') {
      exercises = exercises.filter(ex =>
        ex.bodyPart && ex.bodyPart.toLowerCase() === selectedBodyPart.toLowerCase()
      );
    }
    
    return exercises;
  }, [searchQuery, selectedBodyPart, allLibraryExercises, workoutExercises]);

  const getPreviousExerciseData = (exerciseName: string): Exercise | null => {
    if (!exerciseName) return null;
    const sortedWorkouts = [...workouts]
      .filter(w => w.date < date)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    for (const prevWorkout of sortedWorkouts) {
      const exercise = prevWorkout.exercises.find(ex => ex.name.toLowerCase() === exerciseName.toLowerCase());
      if (exercise) return exercise;
    }
    return null;
  };

  const handleAddExerciseToWorkout = (exercise: LibraryExercise) => {
    const newExercise: Exercise = {
      id: `${Date.now()}`,
      name: exercise.name,
      sets: [{ reps: 0, weight: 0 }]
    };
    setWorkoutExercises(prev => [newExercise, ...prev]);
  };
  
  const handleSelectRoutine = (routine: Routine) => {
    const exercisesFromRoutine = routine.exercises.map(ex => ({
      id: Date.now().toString() + ex.name,
      name: ex.name,
      sets: [{ reps: 0, weight: 0 }]
    }));
    setWorkoutExercises(exercisesFromRoutine);
    setRoutinePickerOpen(false);
  };

  const addManualExercise = () => {
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: '',
      sets: [{ reps: 0, weight: 0 }]
    };
    setWorkoutExercises(prev => [newExercise, ...prev]);
  };

  const removeWorkoutExercise = (exerciseId: string) => {
    setWorkoutExercises(prev => prev.filter(ex => ex.id !== exerciseId));
  };

  const updateExerciseName = (exerciseId: string, name: string) => {
    setWorkoutExercises(prev => prev.map(ex => ex.id === exerciseId ? { ...ex, name } : ex));
  };

  const addSet = (exerciseId: string) => {
    setWorkoutExercises(prev =>
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
    setWorkoutExercises(prev =>
      prev.map(ex =>
        ex.id === exerciseId
          ? { ...ex, sets: ex.sets.filter((_, i) => i !== setIndex) }
          : ex
      )
    );
  };

  const updateSet = (exerciseId: string, setIndex: number, field: 'reps' | 'weight', value: number) => {
    setWorkoutExercises(prev =>
      prev.map(ex =>
        ex.id === exerciseId
          ? { ...ex, sets: ex.sets.map((set, i) => i === setIndex ? { ...set, [field]: value } : set) }
          : ex
      )
    );
  };

  const handleSave = () => {
    const validExercises = workoutExercises.filter(ex => 
      ex.name.trim() && ex.sets.some(set => set.reps > 0 || set.weight > 0)
    ).map(ex => ({ ...ex, sets: ex.sets.filter(set => set.reps > 0 || set.weight > 0) }));

    if (validExercises.length === 0) {
      alert('Kaydedilecek bir set bulunamadı.');
      return;
    }
    onSave({ date, exercises: validExercises });
  };
  
  const getImageUrl = (gifPath: string) => {
    if (!gifPath) return 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop';
    return `${SUPABASE_PROJECT_URL}/storage/v1/object/public/images/exercises/${gifPath}`;
  };

  const getBodyPartName = (bodyPart: string) => {
    if (!bodyPart) return '';
    const names: { [key: string]: string } = { 'chest': 'Göğüs', 'back': 'Sırt', 'shoulders': 'Omuz', 'waist': 'Karın', 'cardio': 'Kardiyo', 'neck': 'Boyun', 'lower arms': 'Ön Kol', 'upper arms': 'Pazu/Arka Kol', 'lower legs': 'Alt Bacak', 'upper legs': 'Üst Bacak', 'abdominals': 'Karın' };
    return names[bodyPart.toLowerCase()] || bodyPart.charAt(0).toUpperCase() + bodyPart.slice(1);
  };

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          {format(new Date(date), 'dd MMMM yyyy', { locale: tr })}
      </h2>
      
      {/* Section 1: Workout List */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b pb-2 mb-4 border-gray-200 dark:border-gray-700">
          Antrenman Listesi
        </h3>
        {workoutExercises.length === 0 ? (
            <p className="text-center text-gray-500 py-4">Başlamak için aşağıdaki listeden bir hareket ekleyin.</p>
        ) : (
            <div className="space-y-6">
            {workoutExercises.map((exercise) => {
                const previousExercise = getPreviousExerciseData(exercise.name);
                const previousMaxWeight = previousExercise && previousExercise.sets.length > 0
                    ? Math.max(...previousExercise.sets.map(s => s.weight))
                    : null;

                return (
                <div key={exercise.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <input type="text" value={exercise.name} onChange={(e) => updateExerciseName(exercise.id, e.target.value)} placeholder="Hareket adı" className="flex-1 p-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200" />
                        <button onClick={() => removeWorkoutExercise(exercise.id)} className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg transition-colors"> <Trash2 size={20} /> </button>
                    </div>
                    <div className="space-y-2">
                    <div className="grid grid-cols-5 gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 px-1">
                        <span>Set</span>
                        <span>Önceki</span>
                        <span>Kg</span>
                        <span>Tekrar</span>
                        <span></span>
                    </div>
                    {exercise.sets.map((set, setIndex) => (
                        <div key={setIndex} className="grid grid-cols-5 gap-2 items-center">
                        <span className="text-center font-medium text-gray-500 dark:text-gray-400">{setIndex + 1}</span>
                        <div className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 p-2 rounded-md h-full flex items-center justify-center">
                            {previousMaxWeight !== null ? `${previousMaxWeight}kg` : '-'}
                        </div>
                        <input type="number" inputMode="numeric" value={set.weight || ''} onChange={(e) => updateSet(exercise.id, setIndex, 'weight', parseFloat(e.target.value) || 0)} placeholder="0" step="0.5" className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200" />
                        <input type="number" inputMode="numeric" value={set.reps || ''} onChange={(e) => updateSet(exercise.id, setIndex, 'reps', parseInt(e.target.value) || 0)} placeholder="0" className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200" />
                        <button onClick={() => removeSet(exercise.id, setIndex)} className="text-gray-400 hover:text-red-500 m-auto"> <Trash2 size={16}/> </button>
                        </div>
                    ))}
                    </div>
                    <button onClick={() => addSet(exercise.id)} className="w-full mt-3 p-2 text-blue-600 border-2 border-blue-200 dark:border-blue-800 border-dashed rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/50 transition-colors"> + Set Ekle </button>
                </div>
                );
            })}
            </div>
        )}
      </div>

      {/* Section 2: Action Buttons & Library */}
      <div className="space-y-4 pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Hareket Ekle</h3>
        <div className="grid grid-cols-2 gap-3">
            <div className="relative">
                <button onClick={() => setRoutinePickerOpen(prev => !prev)} className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600">
                    <BookCopy size={16} /> Rutinden Ekle
                </button>
                {isRoutinePickerOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-10 border dark:border-gray-700">
                    {routines.length > 0 ? routines.map(routine => (
                        <a key={routine.id} onClick={() => handleSelectRoutine(routine)} className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                        {routine.name}
                        </a>
                    )) : <span className="block px-4 py-3 text-sm text-gray-500">Kayıtlı rutin yok.</span>}
                    </div>
                )}
            </div>
            <button onClick={addManualExercise} className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600"> <Plus size={16} /> Manuel Ekle </button>
        </div>

        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Hareket adı ara..." className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200" />
        </div>
        
        {loading ? (
            <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div><span className="ml-3 text-gray-600 dark:text-gray-400">Yükleniyor...</span></div>
        ) : (
            <div className="space-y-3 max-h-[50vh] overflow-y-auto p-1">
            {filteredLibraryExercises.map(exercise => (
              <div key={exercise.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                    <img src={getImageUrl(exercise.gifUrl)} alt={exercise.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'; }}/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 truncate">{exercise.name}</h3>
                    <div className="flex items-center gap-2 mt-1"><span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 rounded-full">{getBodyPartName(exercise.bodyPart)}</span><span className="text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 px-2 py-1 rounded-full">{exercise.equipment}</span></div>
                  </div>
                  <button onClick={() => handleAddExerciseToWorkout(exercise)} className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0"><Plus size={20} /></button>
                </div>
              </div>
            ))}
            </div>
        )}
      </div>

      {/* Save/Cancel Buttons */}
      <div className="flex gap-3 mt-8">
          <button onClick={onCancel} className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              İptal
          </button>
          <button onClick={handleSave} className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
              <Save size={20} /> Antrenmanı Kaydet
          </button>
      </div>
    </div>
  );
};

export default AddWorkout;
