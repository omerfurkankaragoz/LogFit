// src/components/AddWorkout.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, BookCopy, Search, X, Star, Repeat, Radar, BadgePlus } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Exercise, Workout } from '../App';
import { Routine } from './RoutinesList';
import { Exercise as LibraryExercise } from '../services/exerciseApi';

const SUPABASE_PROJECT_URL = 'https://ekrhekungvoisfughwuz.supabase.co';
const BUCKET_NAME = 'images';

interface AddWorkoutProps {
  date: string;
  existingWorkout: Workout | null;
  routines: Routine[];
  workouts: Workout[];
  onSave: (workout: Omit<Workout, 'id' | 'user_id' | 'created_at'>) => void;
  onCancel: () => void;
  allLibraryExercises: LibraryExercise[];
  favoriteExercises: string[];
}

const AddWorkout: React.FC<AddWorkoutProps> = ({ date, existingWorkout, routines, workouts, onSave, onCancel, allLibraryExercises, favoriteExercises }) => {
  const [workoutExercises, setWorkoutExercises] = useState<Exercise[]>([]);
  const [isRoutinePickerOpen, setRoutinePickerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [showLargeImage, setShowLargeImage] = useState(false);
  const [currentLargeImageUrl, setCurrentLargeImageUrl] = useState<string | null>(null);
  
  const workoutExerciseNames = useMemo(() => 
    new Set(workoutExercises.map(ex => ex.name.toLowerCase())),
    [workoutExercises]
  );
  
  const [favoriteLibraryExercises, otherLibraryExercises] = useMemo(() => {
    const favorites: LibraryExercise[] = [];
    const others: LibraryExercise[] = [];
    
    allLibraryExercises.forEach(ex => {
      if (!workoutExerciseNames.has(ex.name.toLowerCase())) {
        if (favoriteExercises.includes(ex.id)) {
          favorites.push(ex);
        } else {
          others.push(ex);
        }
      }
    });
    
    return [favorites, others];
  }, [allLibraryExercises, favoriteExercises, workoutExerciseNames]);

  const searchedExercises = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return allLibraryExercises.filter(ex => 
      !workoutExerciseNames.has(ex.name.toLowerCase()) &&
      ex.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
    );
  }, [searchQuery, allLibraryExercises, workoutExerciseNames]);


  useEffect(() => {
    if (existingWorkout) {
      setWorkoutExercises(existingWorkout.exercises);
    } else {
      setWorkoutExercises([]);
    }
  }, [existingWorkout]);

  const getPreviousExerciseData = (exerciseName: string): Exercise | null => {
    if (!exerciseName) return null;
    const pastWorkouts = workouts.filter(w => new Date(w.date) < new Date(date));
    const sortedWorkouts = pastWorkouts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    for (const prevWorkout of sortedWorkouts) {
      const exercise = prevWorkout.exercises.find(ex => ex.name.toLowerCase() === exerciseName.toLowerCase());
      if (exercise) return exercise;
    }
    return null;
  };

  const handleAddExerciseToWorkout = (exercise: LibraryExercise) => {
    const newExercise: Exercise = {
      id: `lib-${exercise.id}-${Date.now()}`,
      name: exercise.name,
      bodyPart: exercise.bodyPart,
      sets: []
    };
    setWorkoutExercises(prev => [newExercise, ...prev]);
    setSearchQuery('');
  };

  const handleSelectRoutine = (routine: Routine) => {
    const newExercisesFromRoutine = routine.exercises
      .filter(ex => !workoutExerciseNames.has(ex.name.toLowerCase()))
      .map((routineExercise, index) => {
        const libraryMatch = allLibraryExercises.find(libEx => libEx.name.toLowerCase() === routineExercise.name.toLowerCase());
        return {
          id: `routine-${routineExercise.id}-${Date.now() + index}`,
          name: routineExercise.name,
          bodyPart: routineExercise.bodyPart || libraryMatch?.bodyPart,
          sets: []
        };
      });
    if (newExercisesFromRoutine.length > 0) {
      setWorkoutExercises(prev => [...prev, ...newExercisesFromRoutine]);
    }
    setRoutinePickerOpen(false);
  };

  const addManualExercise = () => {
    const newExercise: Exercise = { id: `manual-${Date.now()}`, name: '', sets: [] };
    setWorkoutExercises(prev => [newExercise, ...prev]);
  };

  const removeWorkoutExercise = (exerciseId: string) => setWorkoutExercises(prev => prev.filter(ex => ex.id !== exerciseId));

  const updateExerciseName = (exerciseId: string, name: string) => {
    setWorkoutExercises(prev => prev.map(ex => (ex.id === exerciseId && ex.id.startsWith('manual-')) ? { ...ex, name } : ex));
  };

  const addSet = (exerciseId: string) => {
    setWorkoutExercises(prev => prev.map(ex => {
      if (ex.id === exerciseId) {
        const lastSet = ex.sets.length > 0 ? ex.sets[ex.sets.length - 1] : { reps: 0, weight: 0 };
        return { ...ex, sets: [...ex.sets, { ...lastSet }] };
      }
      return ex;
    }));
  };

  const removeSet = (exerciseId: string, setIndex: number) => {
    setWorkoutExercises(prev => prev.map(ex => (ex.id === exerciseId ? { ...ex, sets: ex.sets.filter((_, i) => i !== setIndex) } : ex)));
  };

  const updateSet = (exerciseId: string, setIndex: number, field: 'reps' | 'weight', value: number) => {
    setWorkoutExercises(prev => prev.map(ex => (ex.id === exerciseId ? { ...ex, sets: ex.sets.map((set, i) => (i === setIndex ? { ...set, [field]: value } : set)) } : ex)));
  };

  const handleSave = () => {
    const exercisesToSave = workoutExercises
      .filter(ex => ex.name.trim()) 
      .map(ex => ({ 
        ...ex, 
        sets: ex.sets.filter(set => set.reps > 0 || set.weight > 0) 
    }));
    onSave({ date, exercises: exercisesToSave });
  };

  const getImageUrl = (gifPath: string | undefined) => {
    if (!gifPath) return 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop';
    const imagePath = gifPath.replace('0.jpg', '1.jpg');
    return `${SUPABASE_PROJECT_URL}/storage/v1/object/public/images/exercises/${imagePath}`;
  };

  const handleImageClick = (imageUrl: string) => {
    setCurrentLargeImageUrl(imageUrl);
    setShowLargeImage(true);
  };

  const closeLargeImage = () => {
    setShowLargeImage(false);
    setCurrentLargeImageUrl(null);
  };

  const ExerciseListItem = ({ exercise, isFavorite = false, onClick }: { exercise: LibraryExercise, isFavorite?: boolean, onClick: (ex: LibraryExercise) => void }) => (
    <button onClick={() => onClick(exercise)} className="w-full text-left p-4 flex items-center gap-4 hover:bg-system-background-tertiary transition-colors">
      <img src={getImageUrl(exercise.gifUrl)} alt={exercise.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0 bg-system-background-tertiary" />
      <p className="flex-1 font-medium text-system-label text-base">{exercise.name}</p>
      {isFavorite && <Star size={16} className="text-system-yellow fill-system-yellow flex-shrink-0" />}
    </button>
  );

  const AddExerciseSection = (
    <div className="bg-system-background-secondary rounded-xl">
        <div className="p-4">
            <h3 className="text-lg font-semibold text-system-label mb-3">Hareket Ekle</h3>
            <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setRoutinePickerOpen(true)} className="w-full text-left p-3 flex items-center justify-center gap-2 bg-system-background-tertiary rounded-lg hover:bg-system-fill-tertiary transition-colors">
                        <Radar size={20} className="text-system-orange" />
                        <span className="text-system-label font-medium text-sm">Rutinden</span>
                    </button>
                    <button onClick={addManualExercise} className="w-full text-left p-3 flex items-center justify-center gap-2 bg-system-background-tertiary rounded-lg hover:bg-system-fill-tertiary transition-colors">
                        <BadgePlus size={20} className="text-system-green" />
                        <span className="text-system-label font-medium text-sm">Manuel</span>
                    </button>
                </div>
                <div className="relative">
                    <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-system-label-tertiary" />
                    <input 
                        type="text" 
                        value={searchQuery} 
                        onChange={(e) => setSearchQuery(e.target.value)} 
                        placeholder="Kütüphaneden Ara" 
                        className="w-full pl-10 pr-10 py-3 bg-system-background-tertiary text-system-label rounded-lg focus:outline-none focus:ring-2 focus:ring-system-blue" 
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center justify-center w-5 h-5 bg-system-label-tertiary rounded-full text-system-background active:scale-90 transition-transform"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>
        </div>
        <div className="max-h-[50vh] overflow-y-auto scrollbar-thin divide-y divide-system-separator">
            {searchQuery.trim() ? (
                searchedExercises.length > 0 ? (
                    searchedExercises.map(exercise => (
                        <ExerciseListItem key={exercise.id} exercise={exercise} onClick={handleAddExerciseToWorkout} />
                    ))
                ) : (
                    <p className="text-md text-center text-system-label-secondary py-10 px-4">Sonuç bulunamadı.</p>
                )
            ) : (
                <>
                    {favoriteLibraryExercises.length > 0 && (
                        <div>
                            <p className="text-system-label-secondary px-4 pt-4 pb-2 text-sm font-bold">FAVORİLER</p>
                            {favoriteLibraryExercises.map(exercise => (
                                <ExerciseListItem key={exercise.id} exercise={exercise} isFavorite onClick={handleAddExerciseToWorkout} />
                            ))}
                        </div>
                    )}
                    <div>
                        <p className="text-system-label-secondary px-4 pt-4 pb-2 text-sm font-bold">TÜM HAREKETLER</p>
                        {otherLibraryExercises.map(exercise => (
                            <ExerciseListItem key={exercise.id} exercise={exercise} onClick={handleAddExerciseToWorkout} />
                        ))}
                    </div>
                </>
            )}
        </div>
    </div>
  );

  const WorkoutListSection = (
    <div className="space-y-4">
      {workoutExercises.map((exercise) => {
        const libraryExercise = allLibraryExercises.find(libEx => libEx.name.toLowerCase() === exercise.name.toLowerCase());
        const imageUrl = getImageUrl(libraryExercise?.gifUrl);
        const previousExercise = getPreviousExerciseData(exercise.name);
        const isEditable = exercise.id.startsWith('manual-');
        
        return (
          <div key={exercise.id} className="bg-system-background-secondary rounded-xl overflow-hidden">
            <div className="p-4 flex items-start gap-3">
                <button onClick={() => handleImageClick(imageUrl)} className="flex-shrink-0">
                    <img src={imageUrl} alt={exercise.name} className="w-12 h-12 rounded-lg object-cover mt-1" />
                </button>
                <div className="flex-1">
                    <input 
                    type="text" 
                    value={exercise.name} 
                    onChange={(e) => updateExerciseName(exercise.id, e.target.value)} 
                    placeholder="Hareket Adı Girin" 
                    readOnly={!isEditable}
                    className={`w-full bg-transparent text-lg font-semibold text-system-label focus:outline-none ${!isEditable ? 'cursor-default' : 'cursor-text'}`}
                    />
                    <p className="text-sm text-system-label-secondary">{libraryExercise?.bodyPart ? libraryExercise.bodyPart.charAt(0).toUpperCase() + libraryExercise.bodyPart.slice(1) : 'Genel'}</p>
                </div>
                <button onClick={() => removeWorkoutExercise(exercise.id)} className="p-2 text-system-label-tertiary">
                    <X size={20} />
                </button>
            </div>

            {exercise.sets.length > 0 && (
                <div className="px-4 pb-2">
                    <div className="grid grid-cols-[1fr,1fr,1fr,auto] gap-x-3 gap-y-2 text-sm text-center">
                        <p className="text-system-label-secondary">Önceki</p>
                        <p className="text-system-label-secondary">Kg</p>
                        <p className="text-system-label-secondary">Tekrar</p>
                        <div className="w-8"></div>

                        {exercise.sets.map((set, setIndex) => {
                        const previousSet = previousExercise?.sets[setIndex];
                        return (
                            <React.Fragment key={setIndex}>
                            <div className="bg-system-background-tertiary rounded-md flex items-center justify-center h-10 text-system-label-secondary">{previousSet ? `${previousSet.weight}kg x ${previousSet.reps}` : '-'}</div>
                            <input type="number" inputMode="decimal" value={set.weight || ''} onChange={(e) => updateSet(exercise.id, setIndex, 'weight', parseFloat(e.target.value) || 0)} placeholder="0" className="w-full h-10 bg-system-background-tertiary text-system-label text-center rounded-md focus:outline-none focus:ring-2 focus:ring-system-blue" />
                            <input type="number" inputMode="numeric" value={set.reps || ''} onChange={(e) => updateSet(exercise.id, setIndex, 'reps', parseInt(e.target.value) || 0)} placeholder="0" className="w-full h-10 bg-system-background-tertiary text-system-label text-center rounded-md focus:outline-none focus:ring-2 focus:ring-system-blue" />
                            <button onClick={() => removeSet(exercise.id, setIndex)} className="h-10 flex items-center justify-center text-system-label-tertiary">
                                <Trash2 size={18}/>
                            </button>
                            </React.Fragment>
                        );
                        })}
                    </div>
                </div>
            )}
            <button onClick={() => addSet(exercise.id)} className="w-full p-3 text-system-blue text-center font-medium border-t border-system-separator hover:bg-system-fill-tertiary transition-colors">
              Set Ekle
            </button>
          </div>
        );
      })}
    </div>
  );

  return (
    <div>
      {/* BAŞLIK BÖLÜMÜ - EKRANIN ÜSTÜNE SABİTLENDİ */}
      <div className="sticky top-[env(safe-area-inset-top)] z-10 bg-system-background/95 backdrop-blur-md">
        <div className="flex justify-between items-center p-4">
          <button onClick={onCancel} className="text-system-blue text-lg">İptal</button>
          <button onClick={handleSave} className="text-system-blue text-lg font-bold">Kaydet</button>
        </div>
      </div>

      {/* İÇERİK BÖLÜMÜ - KAYDIRILABİLİR ALAN */}
      <div className="p-4 space-y-6">
        {workoutExercises.length > 0 && (
          <>
            <p className="text-system-label-secondary px-4 pt-4 pb-2 text-sm font-bold">ANTRENMAN</p>
            {WorkoutListSection}
          </>
        )}
        
        <div className="space-y-4">{AddExerciseSection}</div>
      </div>
      
      {/* MODALLAR */}
      {showLargeImage && currentLargeImageUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4" onClick={closeLargeImage}>
          <div className="relative bg-system-background-secondary rounded-2xl p-2 max-w-full max-h-full overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={closeLargeImage} className="absolute top-3 right-3 text-white bg-black/50 rounded-full p-1 z-10">
              <X size={24} />
            </button>
            <img src={currentLargeImageUrl} alt="Büyük Egzersiz Görseli" className="max-w-[80vw] max-h-[80vh] object-contain mx-auto rounded-xl"/>
          </div>
        </div>
      )}

      {isRoutinePickerOpen && (
        <div className="fixed inset-0 z-40 flex items-end justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setRoutinePickerOpen(false)}></div>
            <div className="relative w-full max-w-md bg-system-background-secondary rounded-t-2xl p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
                <div className="w-12 h-1.5 bg-system-label-tertiary rounded-full mx-auto mb-4"></div>
                <h2 className="text-xl font-bold text-center text-system-label mb-4">Rutin Seç</h2>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                    {routines.length > 0 ? routines.map(routine => (
                        <button key={routine.id} onClick={() => handleSelectRoutine(routine)} className="w-full text-left p-4 bg-system-background-tertiary rounded-lg hover:bg-system-fill-tertiary transition-colors">
                            <p className="font-semibold text-system-label">{routine.name}</p>
                            <p className="text-sm text-system-label-secondary">{routine.exercises.length} hareket</p>
                        </button>
                    )) : (
                        <p className="text-center text-system-label-secondary py-8">Kayıtlı rutin bulunmuyor.</p>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default AddWorkout;