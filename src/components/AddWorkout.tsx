// src/components/AddWorkout.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, Save, BookCopy, Search, X } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Exercise, Workout } from '../App';
import { Routine } from './RoutinesList';
import { getAllExercises, getBodyParts, Exercise as LibraryExercise } from '../services/exerciseApi';

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
  const [bodyParts, setBodyParts] = useState<string[]>([]);

  // Büyük görsel modalı için
  const [showLargeImage, setShowLargeImage] = useState(false);
  const [currentLargeImageUrl, setCurrentLargeImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      const [parts, exercises] = await Promise.all([getBodyParts(), getAllExercises()]);
      setBodyParts(parts);
      setAllLibraryExercises(exercises);
      setLoading(false);
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (existingWorkout) {
      setWorkoutExercises(existingWorkout.exercises);
    } else {
      setWorkoutExercises([]);
    }
  }, [existingWorkout]);

  const filteredLibraryExercises = useMemo(() => {
    const workoutExerciseNames = new Set(workoutExercises.map(ex => ex.name.toLowerCase()));
    let exercises = allLibraryExercises.filter(libEx => !workoutExerciseNames.has(libEx.name.toLowerCase()));
    if (searchQuery.trim()) {
      exercises = exercises.filter(ex => ex.name.toLowerCase().includes(searchQuery.trim().toLowerCase()));
    }
    return exercises;
  }, [searchQuery, allLibraryExercises, workoutExercises]);

  const getPreviousExerciseData = (exerciseName: string): Exercise | null => {
    if (!exerciseName) return null;
    const sortedWorkouts = [...workouts].filter(w => w.date < date).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    for (const prevWorkout of sortedWorkouts) {
      const exercise = prevWorkout.exercises.find(ex => ex.name.toLowerCase() === exerciseName.toLowerCase());
      if (exercise) return exercise;
    }
    return null;
  };

  const handleAddExerciseToWorkout = (exercise: LibraryExercise) => {
    const newExercise: Exercise = { id: `${Date.now()}`, name: exercise.name, sets: [{ reps: 0, weight: 0 }] };
    setWorkoutExercises(prev => [newExercise, ...prev]);
    setSearchQuery(''); // Aramayı temizle
  };

  const handleSelectRoutine = (routine: Routine) => {
    const existingExerciseNames = new Set(workoutExercises.map(ex => ex.name.toLowerCase()));
    const newExercisesFromRoutine = routine.exercises
      .filter(ex => !existingExerciseNames.has(ex.name.toLowerCase()))
      .map(ex => ({ id: Date.now().toString() + ex.name, name: ex.name, sets: [{ reps: 0, weight: 0 }] }));
    if (newExercisesFromRoutine.length > 0) {
      setWorkoutExercises(prev => [...prev, ...newExercisesFromRoutine]);
    }
    setRoutinePickerOpen(false);
  };

  const addManualExercise = () => {
    const newExercise: Exercise = { id: Date.now().toString(), name: '', sets: [{ reps: 0, weight: 0 }] };
    setWorkoutExercises(prev => [newExercise, ...prev]);
  };

  const removeWorkoutExercise = (exerciseId: string) => setWorkoutExercises(prev => prev.filter(ex => ex.id !== exerciseId));
  const updateExerciseName = (exerciseId: string, name: string) => setWorkoutExercises(prev => prev.map(ex => (ex.id === exerciseId ? { ...ex, name } : ex)));

  const addSet = (exerciseId: string) => {
    setWorkoutExercises(prev =>
      prev.map(ex => {
        if (ex.id === exerciseId) {
          const lastSet = ex.sets.length > 0 ? ex.sets[ex.sets.length - 1] : { reps: 0, weight: 0 };
          return { ...ex, sets: [...ex.sets, { ...lastSet }] };
        }
        return ex;
      })
    );
  };

  const removeSet = (exerciseId: string, setIndex: number) => {
    setWorkoutExercises(prev => prev.map(ex => (ex.id === exerciseId ? { ...ex, sets: ex.sets.filter((_, i) => i !== setIndex) } : ex)));
  };

  const updateSet = (exerciseId: string, setIndex: number, field: 'reps' | 'weight', value: number) => {
    setWorkoutExercises(prev =>
      prev.map(ex => (ex.id === exerciseId ? { ...ex, sets: ex.sets.map((set, i) => (i === setIndex ? { ...set, [field]: value } : set)) } : ex))
    );
  };

  const handleSave = () => {
    const exercisesToSave = workoutExercises.filter(ex => ex.name.trim()).map(ex => ({ ...ex, sets: ex.sets.filter(set => set.reps > 0 || set.weight > 0) }));
    if (exercisesToSave.length === 0) {
      alert('Kaydedilecek bir hareket bulunamadı.');
      return;
    }
    onSave({ date, exercises: exercisesToSave });
  };

  // GÜNCELLENDİ: Bu fonksiyon artık "0.jpg"yi "1.jpg" ile değiştiriyor.
  const getImageUrl = (gifPath: string | undefined) => {
    if (!gifPath) return 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop';
    
    // 0.jpg'yi 1.jpg ile değiştir
    const imagePath = gifPath.replace('0.jpg', '1.jpg');
    
    return `${SUPABASE_PROJECT_URL}/storage/v1/object/public/images/exercises/${imagePath}`;
  };

  const getBodyPartName = (bodyPart: string) => {
    const names: { [key: string]: string } = { 'chest': 'Göğüs', 'back': 'Sırt', 'shoulders': 'Omuz', 'waist': 'Karın', 'cardio': 'Kardiyo', 'neck': 'Boyun', 'lower arms': 'Ön Kol', 'upper arms': 'Pazu/Arka Kol', 'lower legs': 'Alt Bacak', 'upper legs': 'Üst Bacak', 'abdominals': 'Karın' };
    return names[bodyPart?.toLowerCase()] || bodyPart?.charAt(0).toUpperCase() + bodyPart?.slice(1) || '';
  };

  const handleImageClick = (imageUrl: string) => {
    setCurrentLargeImageUrl(imageUrl);
    setShowLargeImage(true);
  };

  const closeLargeImage = () => {
    setShowLargeImage(false);
    setCurrentLargeImageUrl(null);
  };

  return (
    <div className="p-4 space-y-6 pb-36">
      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
        {format(new Date(date), 'dd MMMM yyyy', { locale: tr })} Antrenmanı
      </h2>

      {/* Yeni Hareket Ekle */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 space-y-4">
        <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100">Yeni Hareket Ekle</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <button onClick={() => setRoutinePickerOpen(prev => !prev)} className="w-full flex items-center justify-center gap-2 px-3 py-3 bg-green-600 text-white rounded-xl text-base font-semibold hover:bg-green-700 transition-all duration-200 ease-in-out active:scale-95 shadow-md">
              <BookCopy size={20} /> Rutinden Ekle
            </button>
            {isRoutinePickerOpen && (
              <div className="absolute left-0 mt-2 w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl z-20 border border-gray-200 dark:border-gray-700 overflow-hidden">
                {routines.length > 0 ? routines.map(routine => (
                  <a key={routine.id} onClick={() => handleSelectRoutine(routine)} className="block px-4 py-3 text-base text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                    {routine.name}
                  </a>
                )) : <span className="block px-4 py-3 text-base text-gray-500 dark:text-gray-400">Kayıtlı rutin yok.</span>}
              </div>
            )}
          </div>
          <button onClick={addManualExercise} className="w-full flex items-center justify-center gap-2 px-3 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-base font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 ease-in-out active:scale-95 shadow-md">
            <Plus size={20} /> Manuel Ekle
          </button>
        </div>
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Veya kütüphaneden hareket ara..." className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-base" />
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-6"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
        ) : searchQuery.trim() && (
          <div className="space-y-3 max-h-[40vh] overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
            {filteredLibraryExercises.length > 0 ? filteredLibraryExercises.map(exercise => (
              <div key={exercise.id} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-600 hover:shadow-md transition-shadow transform hover:scale-[1.01] active:scale-[0.99]">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-600 flex-shrink-0 cursor-pointer shadow-sm" onClick={() => handleImageClick(getImageUrl(exercise.gifUrl))}>
                    <img src={getImageUrl(exercise.gifUrl)} alt={exercise.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'; }}/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base text-gray-800 dark:text-gray-200 truncate">{exercise.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-3 py-1 rounded-full font-medium">{getBodyPartName(exercise.bodyPart)}</span>
                    </div>
                  </div>
                  <button onClick={() => handleAddExerciseToWorkout(exercise)} className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 ease-in-out active:scale-95 shadow-md flex-shrink-0">
                    <Plus size={20} />
                  </button>
                </div>
              </div>
            )) : <p className="text-md text-center text-gray-500 dark:text-gray-400 py-4">Hareket bulunamadı.</p>}
          </div>
        )}
      </div>
      
      {/* Antrenman Listesi */}
      <div className="space-y-6">
        {workoutExercises.length > 0 && <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100 mt-4">Antrenman Listesi</h3>}
        {workoutExercises.map((exercise) => {
          const libraryExercise = allLibraryExercises.find(libEx => libEx.name.toLowerCase() === exercise.name.toLowerCase());
          const imageUrl = getImageUrl(libraryExercise?.gifUrl);

          const previousExercise = getPreviousExerciseData(exercise.name);
          const previousMaxWeight = previousExercise && previousExercise.sets.length > 0 ? Math.max(...previousExercise.sets.map(s => s.weight)) : null;
          return (
            <div key={exercise.id} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <div 
                  className="w-11 h-11 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0 cursor-pointer shadow-sm"
                  onClick={() => handleImageClick(imageUrl)}
                >
                  <img src={imageUrl} alt={exercise.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex items-center gap-2">
                    <input type="text" value={exercise.name} onChange={(e) => updateExerciseName(exercise.id, e.target.value)} placeholder="Hareket adı" className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-base" />
                    <button onClick={() => removeWorkoutExercise(exercise.id)} className="p-3 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors active:scale-95"> <Trash2 size={20} /> </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-5 gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 px-1">
                  <span>Set</span><span>Önceki</span><span>Kg</span><span>Tekrar</span><span></span>
                </div>
                {exercise.sets.map((set, setIndex) => (
                  <div key={setIndex} className="grid grid-cols-5 gap-2 items-center">
                    <span className="text-center font-medium text-gray-600 dark:text-gray-300 text-sm">{setIndex + 1}</span>
                    <div className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 p-2 rounded-md h-full flex items-center justify-center">
                      {previousMaxWeight !== null ? `${previousMaxWeight}kg` : '-'}
                    </div>
                    <input type="number" inputMode="decimal" value={set.weight || ''} onChange={(e) => updateSet(exercise.id, setIndex, 'weight', parseFloat(e.target.value) || 0)} placeholder="0" step="0.5" className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-base" />
                    <input type="number" inputMode="numeric" value={set.reps || ''} onChange={(e) => updateSet(exercise.id, setIndex, 'reps', parseInt(e.target.value) || 0)} placeholder="0" className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-base" />
                    <button onClick={() => removeSet(exercise.id, setIndex)} className="text-gray-400 hover:text-red-500 m-auto p-1 rounded-md transition-colors active:scale-95"> <Trash2 size={18}/> </button>
                  </div>
                ))}
              </div>
              <button onClick={() => addSet(exercise.id)} className="w-full mt-4 p-2 text-blue-600 border-2 border-blue-200 dark:border-blue-800 border-dashed rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/50 transition-colors active:scale-95 text-base font-medium"> + Set Ekle </button>
            </div>
          );
        })}
      </div>

     {/* Kaydet/İptal Butonları */}
      <div className="fixed bottom-24 left-0 right-0 z-10 border-t border-gray-200 bg-white/90 px-4 py-2 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/90">
        <div className="mx-auto flex max-w-md gap-3">
          <button onClick={onCancel} className="flex-1 rounded-xl border border-gray-300 py-2 px-6 text-base font-medium text-gray-800 shadow-md transition-all duration-200 ease-in-out hover:bg-gray-100 active:scale-95 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">
            İptal
          </button>
          <button onClick={handleSave} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 py-2 px-6 text-base font-medium text-white shadow-md transition-all duration-200 ease-in-out hover:bg-blue-700 active:scale-95">
            <Save size={18} /> Kaydet
          </button>
        </div>
      </div>

      {/* Büyük Görsel Modalı */}
      {showLargeImage && currentLargeImageUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4" onClick={closeLargeImage}>
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-3 max-w-full max-h-full overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={closeLargeImage} className="absolute top-3 right-3 text-white bg-gray-800 dark:bg-gray-700 rounded-full p-2 hover:bg-gray-900 dark:hover:bg-gray-600 transition-colors z-10">
              <X size={24} />
            </button>
            <img src={currentLargeImageUrl} alt="Büyük Egzersiz Görseli" className="max-w-[80vw] max-h-[80vh] object-contain mx-auto rounded-xl" onError={(e) => { e.currentTarget.src = 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=800'; }}/>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddWorkout;