// src/components/AddWorkout.tsx

import React, { useState, useEffect, useMemo, useRef, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Search, X, Star, Radar, BadgePlus, Clock } from 'lucide-react';
import { Workout, Exercise } from '../App';
import { Routine, RoutineExercise } from '../types';
import { Exercise as LibraryExercise } from '../services/exerciseApi';

const SUPABASE_PROJECT_URL = 'https://ekrhekungvoisfughwuz.supabase.co';

// Timer component - isolated to prevent re-rendering parent
const WorkoutTimer = memo(({ startTimeRef, isToday, existingDuration }: {
  startTimeRef: React.MutableRefObject<string | null>;
  isToday: boolean;
  existingDuration?: number;
}) => {
  const [displaySeconds, setDisplaySeconds] = useState(0);

  useEffect(() => {
    if (!isToday) {
      if (existingDuration) {
        setDisplaySeconds(existingDuration);
      }
      return;
    }

    const savedStartTime = localStorage.getItem('currentWorkoutStartTime');
    let currentStartTimestamp = 0;

    if (savedStartTime) {
      startTimeRef.current = savedStartTime;
      currentStartTimestamp = new Date(savedStartTime).getTime();
    } else {
      const nowStr = new Date().toISOString();
      startTimeRef.current = nowStr;
      localStorage.setItem('currentWorkoutStartTime', nowStr);
      currentStartTimestamp = new Date(nowStr).getTime();
    }

    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = Math.max(0, Math.floor((now - currentStartTimestamp) / 1000));
      setDisplaySeconds(diff);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [isToday, existingDuration, startTimeRef]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!isToday && displaySeconds === 0) return null;

  return (
    <div className="flex items-center gap-1 text-[11px] font-medium font-mono text-system-label-secondary mt-0.5">
      <Clock size={12} className={isToday ? "text-system-green" : "text-system-label-secondary"} />
      <span className={isToday ? 'text-system-green' : 'text-system-label-secondary'}>
        {formatTime(displaySeconds)}
      </span>
    </div>
  );
});

// Memoized Set Row Component - uses local state for immediate feedback
// Parent state only updates on blur (when user leaves input)
const SetRow = memo(({
  exerciseId,
  setIndex,
  set,
  previousSet,
  onUpdateWeight,
  onUpdateReps,
  onRemove
}: {
  exerciseId: string;
  setIndex: number;
  set: { reps: number; weight: number; completed?: boolean };
  previousSet?: { reps: number; weight: number } | null;
  onUpdateWeight: (exerciseId: string, setIndex: number, value: number) => void;
  onUpdateReps: (exerciseId: string, setIndex: number, value: number) => void;
  onRemove: (exerciseId: string, setIndex: number) => void;
}) => {
  // Local state for immediate input feedback - no delay
  const [localWeight, setLocalWeight] = useState<string>(String(set.weight || ''));
  const [localReps, setLocalReps] = useState<string>(String(set.reps || ''));

  // Track if we have pending changes to commit
  const pendingWeightRef = useRef<string | null>(null);
  const pendingRepsRef = useRef<string | null>(null);

  // Sync local state only when parent explicitly changes (e.g., adding a new set copies previous values)
  const prevSetWeightRef = useRef(set.weight);
  const prevSetRepsRef = useRef(set.reps);

  useEffect(() => {
    // Only sync if parent value changed externally (not from our own blur update)
    if (set.weight !== prevSetWeightRef.current && pendingWeightRef.current === null) {
      setLocalWeight(String(set.weight || ''));
    }
    if (set.reps !== prevSetRepsRef.current && pendingRepsRef.current === null) {
      setLocalReps(String(set.reps || ''));
    }
    prevSetWeightRef.current = set.weight;
    prevSetRepsRef.current = set.reps;
  }, [set.weight, set.reps]);

  // Commit pending changes on unmount
  useEffect(() => {
    return () => {
      if (pendingWeightRef.current !== null) {
        onUpdateWeight(exerciseId, setIndex, parseFloat(pendingWeightRef.current) || 0);
      }
      if (pendingRepsRef.current !== null) {
        onUpdateReps(exerciseId, setIndex, parseInt(pendingRepsRef.current) || 0);
      }
    };
  }, [exerciseId, setIndex, onUpdateWeight, onUpdateReps]);

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalWeight(value);
    pendingWeightRef.current = value;
  };

  const handleRepsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalReps(value);
    pendingRepsRef.current = value;
  };

  const handleWeightBlur = () => {
    if (pendingWeightRef.current !== null) {
      onUpdateWeight(exerciseId, setIndex, parseFloat(pendingWeightRef.current) || 0);
      pendingWeightRef.current = null;
    }
  };

  const handleRepsBlur = () => {
    if (pendingRepsRef.current !== null) {
      onUpdateReps(exerciseId, setIndex, parseInt(pendingRepsRef.current) || 0);
      pendingRepsRef.current = null;
    }
  };

  return (
    <div className="grid grid-cols-[0.8fr,1.2fr,1.2fr,auto] gap-3 items-center">
      <div className="h-14 bg-system-fill-secondary rounded-xl flex flex-col items-center justify-center text-sm text-system-label-secondary font-medium">
        {previousSet ? (
          <>
            <span className="text-system-label">{previousSet.weight}kg</span>
            <span className="text-[10px] opacity-70">{previousSet.reps} tekrar</span>
          </>
        ) : (
          <span className="opacity-50">-</span>
        )}
      </div>

      <div className="relative">
        <input
          type="number"
          inputMode="decimal"
          autoComplete="off"
          value={localWeight}
          onChange={handleWeightChange}
          onBlur={handleWeightBlur}
          placeholder="0"
          className="w-full h-14 bg-system-background-tertiary text-system-label text-center text-xl font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-system-blue focus:bg-system-background transition-colors"
        />
      </div>

      <div className="relative">
        <input
          type="number"
          inputMode="numeric"
          autoComplete="off"
          value={localReps}
          onChange={handleRepsChange}
          onBlur={handleRepsBlur}
          placeholder="0"
          className="w-full h-14 bg-system-background-tertiary text-system-label text-center text-xl font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-system-blue focus:bg-system-background transition-colors"
        />
      </div>

      <button
        onClick={() => onRemove(exerciseId, setIndex)}
        className="h-14 w-12 flex items-center justify-center text-system-label-tertiary hover:text-system-red active:scale-90 transition-all bg-system-fill-tertiary rounded-xl"
      >
        <Trash2 size={20} />
      </button>
    </div>
  );
});

interface AddWorkoutProps {
  date: string;
  existingWorkout: Workout | null;
  routines: Routine[];
  workouts: Workout[];
  onSave: (workout: Omit<Workout, 'id' | 'user_id' | 'created_at'>, shouldFinish: boolean) => Promise<void>;
  onCancel: () => void;
  allLibraryExercises: LibraryExercise[];
  favoriteExercises: string[];
}

const AddWorkout: React.FC<AddWorkoutProps> = ({ date, existingWorkout, routines, workouts, onSave, onCancel, allLibraryExercises, favoriteExercises }) => {
  const [workoutExercises, setWorkoutExercises] = useState<Exercise[]>(() => {
    return existingWorkout ? existingWorkout.exercises : [];
  });

  // Rutin ID State'i
  const [workoutRoutineId, setWorkoutRoutineId] = useState<number | undefined>(() => {
    return existingWorkout ? existingWorkout.routine_id : undefined;
  });

  const [isRoutinePickerOpen, setRoutinePickerOpen] = useState(false);
  const [isExercisePickerOpen, setExercisePickerOpen] = useState(false);
  const [collapsedExerciseIds, setCollapsedExerciseIds] = useState<Set<string>>(new Set());
  const [exerciseToDelete, setExerciseToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // --- SAYAÇ STATE'LERİ ---
  const startTimeRef = useRef<string | null>(null);

  const [showLargeImage, setShowLargeImage] = useState(false);
  const [currentLargeImageUrl, setCurrentLargeImageUrl] = useState<string | null>(null);

  const loadedWorkoutId = useRef<string | null>(existingWorkout?.id || null);

  // Sayfa açıldığında en üste kaydır
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const isToday = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return date === todayStr;
  }, [date]);

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


  // --- VERİ YÜKLEME EFFECT'İ ---
  useEffect(() => {
    const currentId = existingWorkout?.id || 'new';

    if (loadedWorkoutId.current !== currentId) {
      setWorkoutExercises(existingWorkout ? existingWorkout.exercises : []);
      setWorkoutRoutineId(existingWorkout ? existingWorkout.routine_id : undefined);
      loadedWorkoutId.current = currentId;
    }
  }, [existingWorkout?.id]);


  // Track exercise names with ref to avoid recalculating on set changes
  const exerciseNamesRef = useRef<string>('');
  const currentExerciseNames = workoutExercises.map(ex => ex.name.toLowerCase()).join('|');
  if (currentExerciseNames !== exerciseNamesRef.current) {
    exerciseNamesRef.current = currentExerciseNames;
  }
  const exerciseNamesKey = exerciseNamesRef.current;

  // Memoize previous exercise data lookup - only recalculates when exercise names change
  const previousExerciseDataCache = useMemo(() => {
    const cache: Record<string, Exercise | null> = {};
    const pastWorkouts = workouts
      .filter(w => new Date(w.date) < new Date(date))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const exerciseNames = exerciseNamesKey.split('|').filter(Boolean);
    exerciseNames.forEach(exerciseName => {
      if (!exerciseName) {
        cache[exerciseName] = null;
        return;
      }
      for (const prevWorkout of pastWorkouts) {
        const exercise = prevWorkout.exercises.find(e => e.name.toLowerCase() === exerciseName);
        if (exercise) {
          cache[exerciseName] = exercise;
          return;
        }
      }
      cache[exerciseName] = null;
    });
    return cache;
  }, [workouts, exerciseNamesKey, date]);

  // Memoized update handlers for SetRow
  const handleUpdateWeight = useCallback((exerciseId: string, setIndex: number, value: number) => {
    setWorkoutExercises(prev => prev.map(ex =>
      ex.id === exerciseId
        ? { ...ex, sets: ex.sets.map((set, i) => i === setIndex ? { ...set, weight: value } : set) }
        : ex
    ));
  }, []);

  const handleUpdateReps = useCallback((exerciseId: string, setIndex: number, value: number) => {
    setWorkoutExercises(prev => prev.map(ex =>
      ex.id === exerciseId
        ? { ...ex, sets: ex.sets.map((set, i) => i === setIndex ? { ...set, reps: value } : set) }
        : ex
    ));
  }, []);

  const handleRemoveSet = useCallback((exerciseId: string, setIndex: number) => {
    setWorkoutExercises(prev => prev.map(ex =>
      ex.id === exerciseId ? { ...ex, sets: ex.sets.filter((_, i) => i !== setIndex) } : ex
    ));
  }, []);


  const handleAddExerciseToWorkout = (exercise: LibraryExercise) => {
    const newExercise: Exercise = {
      id: `lib-${exercise.id}-${Date.now()}`,
      name: exercise.name,
      bodyPart: exercise.bodyPart,
      sets: [{ reps: 0, weight: 0, completed: false }]
    };
    setWorkoutExercises(prev => [newExercise, ...prev]);
    setSearchQuery('');
    setExercisePickerOpen(false);
  };

  const handleSelectRoutine = (routine: Routine) => {
    const newExercisesFromRoutine = routine.exercises
      .filter((ex: RoutineExercise) => !workoutExerciseNames.has(ex.name.toLowerCase()))
      .map((routineExercise: RoutineExercise, index: number) => {
        const libraryMatch = allLibraryExercises.find(libEx => libEx.name.toLowerCase() === routineExercise.name.toLowerCase());
        return {
          id: `routine-${routineExercise.id}-${Date.now() + index}`,
          name: routineExercise.name,
          bodyPart: routineExercise.bodyPart || libraryMatch?.bodyPart,
          sets: [{ reps: 0, weight: 0, completed: false }]
        };
      });
    if (newExercisesFromRoutine.length > 0) {
      setWorkoutExercises(prev => [...prev, ...newExercisesFromRoutine]);
      setWorkoutRoutineId(Number(routine.id));
    }
    setRoutinePickerOpen(false);
  };

  const addManualExercise = () => {
    const newExercise: Exercise = { id: `manual-${Date.now()}`, name: '', sets: [{ reps: 0, weight: 0, completed: false }] };
    setWorkoutExercises(prev => [newExercise, ...prev]);
  };

  const removeWorkoutExercise = (exerciseId: string) => setWorkoutExercises(prev => prev.filter(ex => ex.id !== exerciseId));

  const updateExerciseName = (exerciseId: string, name: string) => {
    setWorkoutExercises(prev => prev.map(ex => (ex.id === exerciseId && ex.id.startsWith('manual-')) ? { ...ex, name } : ex));
  };

  const addSet = useCallback((exerciseId: string) => {
    setWorkoutExercises(prev => prev.map(ex => {
      if (ex.id === exerciseId) {
        const lastSet = ex.sets.length > 0 ? ex.sets[ex.sets.length - 1] : { reps: 0, weight: 0, completed: false };
        return { ...ex, sets: [...ex.sets, { ...lastSet, completed: false }] };
      }
      return ex;
    }));
  }, []);


  const prepareWorkoutData = () => {
    return workoutExercises
      .filter(ex => ex.name.trim())
      .map(ex => ({
        ...ex,
        sets: ex.sets.filter(set => set.reps > 0 || set.weight > 0)
      }));
  };


  const handleSaveAndExit = async () => {
    const exercisesToSave = prepareWorkoutData();

    // YENİ EKLENEN KONTROL: 
    // Kaydetmeden önce en az bir hareket ve o harekete ait en az bir geçerli set olup olmadığına bakar.
    const hasValidData = exercisesToSave.length > 0 && exercisesToSave.some(ex => ex.sets.length > 0);

    if (!hasValidData) {
      alert("Kaydetmek için lütfen en az bir hareket ve set bilgisi girin.");
      return;
    }

    // Calculate duration from startTimeRef
    const currentDuration = startTimeRef.current
      ? Math.floor((Date.now() - new Date(startTimeRef.current).getTime()) / 1000)
      : existingWorkout?.duration || 0;

    try {
      await onSave({
        date,
        exercises: exercisesToSave,
        startTime: startTimeRef.current || undefined,
        endTime: undefined,
        duration: currentDuration,
        routine_id: workoutRoutineId
      }, false);

      onCancel();
    } catch (error) {
      console.error("Save failed", error);
    }
  };

  const handleCancel = () => {
    // Check if there's any actual data entered (sets with weight or reps > 0)
    const hasValidData = workoutExercises.some(ex =>
      ex.sets.some(set => set.weight > 0 || set.reps > 0)
    );

    // Clear session only if no valid data was entered
    if (!hasValidData) {
      localStorage.removeItem('currentWorkoutStartTime');
    }
    onCancel();
  };

  const getImageUrl = (gifPath: string | undefined) => {
    if (!gifPath) return 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop';
    const imagePath = gifPath.replace('0.jpg', '1.jpg');
    return `${SUPABASE_PROJECT_URL}/storage/v1/object/public/images/exercises/${imagePath}`;
  };

  const closeLargeImage = () => {
    setShowLargeImage(false);
    setCurrentLargeImageUrl(null);
  };

  const ExerciseListItem = ({ exercise, isFavorite = false, onClick }: { exercise: LibraryExercise, isFavorite?: boolean, onClick: (ex: LibraryExercise) => void }) => (
    <button onClick={() => onClick(exercise)} className="w-full text-left p-4 flex items-center gap-4 hover:bg-system-background-tertiary transition-colors border-b border-system-separator/30 last:border-none">
      <img src={getImageUrl(exercise.gifUrl)} alt={exercise.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0 bg-system-background-tertiary" />
      <p className="flex-1 font-medium text-system-label text-base">{exercise.name}</p>
      {isFavorite && <Star size={16} className="text-system-yellow fill-system-yellow flex-shrink-0" />}
    </button>
  );



  const WorkoutListSection = (
    <div className="space-y-4">
      {workoutExercises.map((exercise) => {
        const libraryExercise = allLibraryExercises.find(libEx => libEx.name.toLowerCase() === exercise.name.toLowerCase());
        const imageUrl = getImageUrl(libraryExercise?.gifUrl);
        const isEditable = exercise.id.startsWith('manual-');
        const previousExercise = previousExerciseDataCache[exercise.name.toLowerCase()];
        const isCollapsed = collapsedExerciseIds.has(exercise.id);
        const totalSets = exercise.sets.length;
        const filledSets = exercise.sets.filter(s => s.weight > 0 || s.reps > 0).length;

        const toggleCollapse = () => {
          setCollapsedExerciseIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(exercise.id)) {
              newSet.delete(exercise.id);
            } else {
              newSet.add(exercise.id);
            }
            return newSet;
          });
        };

        return (
          <div key={exercise.id} className="bg-system-background-secondary rounded-2xl overflow-hidden shadow-sm border border-system-separator/10">
            {/* Header - Clickable to collapse/expand */}
            <div className="flex items-center gap-3 p-4 bg-system-background-tertiary/30">
              {/* Exercise Info - Clickable to toggle */}
              <button onClick={toggleCollapse} className="flex-1 flex items-center gap-3 min-w-0 text-left active:opacity-70 transition-opacity">
                <img src={imageUrl} alt={exercise.name} className="w-12 h-12 rounded-xl object-cover shadow-sm flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-system-label truncate">{exercise.name || 'Yeni Hareket'}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-system-blue font-medium">{libraryExercise?.bodyPart ? libraryExercise.bodyPart.charAt(0).toUpperCase() + libraryExercise.bodyPart.slice(1) : 'Genel'}</span>
                    <span className="text-xs text-system-label-tertiary">•</span>
                    <span className="text-xs text-system-label-secondary">{filledSets}/{totalSets} set</span>
                  </div>
                </div>
              </button>

              {/* Delete Button */}
              <button
                onClick={() => setExerciseToDelete(exercise.id)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-system-red/10 active:bg-system-red/20 active:scale-95 transition-all"
              >
                <Trash2 size={20} className="text-system-red" />
              </button>
            </div>

            {/* Expandable Content */}
            {!isCollapsed && (
              <div className="animate-in slide-in-from-top-2 duration-200">
                {/* Manual exercise name input */}
                {isEditable && (
                  <div className="px-4 pt-2">
                    <input
                      type="text"
                      value={exercise.name}
                      onChange={(e) => updateExerciseName(exercise.id, e.target.value)}
                      placeholder="Hareket Adı Girin"
                      className="w-full bg-system-background-tertiary text-system-label font-semibold px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-system-blue"
                    />
                  </div>
                )}

                {/* Column Headers */}
                <div className="grid grid-cols-[0.8fr,1.2fr,1.2fr,auto] gap-3 px-4 py-3 text-sm font-bold text-system-label-secondary uppercase tracking-wide text-center items-center border-b border-system-separator/10">
                  <span>Önceki</span>
                  <span>KG</span>
                  <span>Tekrar</span>
                  <span className="w-12"></span>
                </div>

                {/* Sets */}
                <div className="px-4 py-3 space-y-3">
                  {exercise.sets.map((set, setIndex) => {
                    const previousSet = previousExercise?.sets[setIndex];
                    return (
                      <SetRow
                        key={setIndex}
                        exerciseId={exercise.id}
                        setIndex={setIndex}
                        set={set}
                        previousSet={previousSet}
                        onUpdateWeight={handleUpdateWeight}
                        onUpdateReps={handleUpdateReps}
                        onRemove={handleRemoveSet}
                      />
                    );
                  })}

                  <button onClick={() => addSet(exercise.id)} className="w-full py-3.5 mt-2 text-system-blue text-center font-bold text-base bg-system-blue/10 rounded-xl hover:bg-system-blue/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                    <Plus size={20} /> SET EKLE
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="bg-system-background min-h-full relative">
      {/* iOS STİLİ HEADER */}
      <div className="sticky top-[env(safe-area-inset-top)] z-50 bg-system-background/95 backdrop-blur-xl border-b border-system-separator/30 transition-colors duration-200">
        <div className="flex justify-between items-center px-4 h-[52px]">
          {/* Sol Buton: İptal */}
          <button
            onClick={handleCancel}
            className="text-system-blue text-[17px] hover:opacity-70 transition-opacity active:scale-95"
          >
            Vazgeç
          </button>

          {/* Orta Kısım: Başlık ve Sayaç */}
          <div className="flex flex-col items-center">
            <h1 className="text-[17px] font-semibold text-system-label">Antrenman</h1>
            <WorkoutTimer
              startTimeRef={startTimeRef}
              isToday={isToday}
              existingDuration={existingWorkout?.duration}
            />
          </div>

          {/* Sağ Buton: Kaydet */}
          <button
            onClick={handleSaveAndExit}
            className="text-system-blue text-[17px] font-bold hover:opacity-70 transition-opacity active:scale-95"
          >
            Kaydet
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 pb-28">
        {workoutExercises.length > 0 ? (
          <>
            {WorkoutListSection}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-system-blue/10 flex items-center justify-center">
              <Plus size={40} className="text-system-blue" />
            </div>
            <h2 className="text-xl font-bold text-system-label mb-2">Antrenmana Başla</h2>
            <p className="text-system-label-secondary text-sm mb-6">Sağ alttaki + butonuna tıklayarak<br />hareket ekle.</p>

            {/* Quick Routine Start */}
            {routines.length > 0 && (
              <div className="mt-6">
                <p className="text-xs text-system-label-tertiary uppercase tracking-wide mb-3">Hızlı Başlat</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {routines.slice(0, 3).map(routine => (
                    <button
                      key={routine.id}
                      onClick={() => handleSelectRoutine(routine)}
                      className="px-4 py-2 bg-system-background-secondary rounded-xl text-sm font-medium text-system-label border border-system-separator/20 active:scale-95 transition-transform"
                    >
                      {routine.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Action Button (FAB) */}
      <button
        onClick={() => setExercisePickerOpen(true)}
        className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-4 w-14 h-14 bg-system-blue rounded-full shadow-lg shadow-system-blue/30 flex items-center justify-center text-white z-40 active:scale-90 transition-transform"
      >
        <Plus size={28} strokeWidth={2.5} />
      </button>

      {/* Modals */}
      {showLargeImage && currentLargeImageUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm animate-in fade-in duration-200" onClick={closeLargeImage}>
          <div className="relative bg-system-background-secondary rounded-3xl p-2 max-w-full max-h-full overflow-hidden shadow-2xl ring-1 ring-white/10" onClick={(e) => e.stopPropagation()}>
            <button onClick={closeLargeImage} className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 z-10 backdrop-blur-md">
              <X size={24} />
            </button>
            <img src={currentLargeImageUrl} alt="Büyük Egzersiz Görseli" className="max-w-[90vw] max-h-[80vh] object-contain mx-auto rounded-2xl" />
          </div>
        </div>
      )}

      {/* Routine Picker Bottom Sheet */}
      {isRoutinePickerOpen && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setRoutinePickerOpen(false)}></div>
          <div className="relative w-full max-w-md bg-system-background-secondary rounded-t-3xl p-6 pb-[calc(2rem+env(safe-area-inset-bottom))] animate-in slide-in-from-bottom duration-300">
            <div className="w-12 h-1.5 bg-system-label-tertiary rounded-full mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-center text-system-label mb-6">Rutin Seç</h2>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto scrollbar-thin">
              {routines.length > 0 ? routines.map(routine => (
                <button key={routine.id} onClick={() => handleSelectRoutine(routine)} className="w-full text-left p-5 bg-system-background-tertiary rounded-2xl hover:bg-system-fill-tertiary transition-colors flex justify-between items-center group">
                  <div>
                    <p className="font-bold text-system-label text-lg">{routine.name}</p>
                    <p className="text-sm text-system-label-secondary font-medium">{routine.exercises.length} hareket</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-system-blue/10 flex items-center justify-center text-system-blue group-hover:scale-110 transition-transform">
                    <Plus size={20} />
                  </div>
                </button>
              )) : (
                <p className="text-center text-system-label-secondary py-10">Kayıtlı rutin bulunmuyor.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Exercise Picker Bottom Sheet */}
      {isExercisePickerOpen && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setExercisePickerOpen(false); setSearchQuery(''); }}></div>
          <motion.div
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100 || info.velocity.y > 500) {
                setExercisePickerOpen(false);
                setSearchQuery('');
              }
            }}
            className="relative w-full max-w-md bg-system-background-secondary rounded-t-3xl pb-[env(safe-area-inset-bottom)] max-h-[70vh] flex flex-col touch-none"
          >
            {/* Drag Handle */}
            <div className="p-4 border-b border-system-separator/20 cursor-grab active:cursor-grabbing">
              <div className="w-12 h-1.5 bg-system-label-tertiary rounded-full mx-auto mb-4"></div>
              <h2 className="text-xl font-bold text-center text-system-label mb-4">Hareket Ekle</h2>

              {/* Search */}
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-system-label-tertiary" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Hareket ara..."
                  autoFocus
                  className="w-full pl-10 pr-10 py-3 bg-system-background-tertiary text-system-label rounded-xl focus:outline-none focus:ring-2 focus:ring-system-blue"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center justify-center w-6 h-6 bg-system-label-tertiary rounded-full text-system-background active:scale-90 transition-transform"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <button onClick={() => { setExercisePickerOpen(false); setRoutinePickerOpen(true); }} className="p-3 flex items-center justify-center gap-2 bg-system-background-tertiary rounded-xl active:scale-95 transition-transform">
                  <Radar size={20} className="text-system-orange" />
                  <span className="text-system-label font-semibold text-sm">Rutinden Seç</span>
                </button>
                <button onClick={() => { addManualExercise(); setExercisePickerOpen(false); }} className="p-3 flex items-center justify-center gap-2 bg-system-background-tertiary rounded-xl active:scale-95 transition-transform">
                  <BadgePlus size={20} className="text-system-green" />
                  <span className="text-system-label font-semibold text-sm">Manuel Ekle</span>
                </button>
              </div>
            </div>

            {/* Exercise List */}
            <div className="flex-1 overflow-y-auto">
              {searchQuery.trim() ? (
                searchedExercises.length > 0 ? (
                  searchedExercises.map(exercise => (
                    <ExerciseListItem key={exercise.id} exercise={exercise} onClick={handleAddExerciseToWorkout} />
                  ))
                ) : (
                  <p className="text-center text-system-label-secondary py-8">Sonuç bulunamadı.</p>
                )
              ) : (
                <>
                  {favoriteLibraryExercises.length > 0 && (
                    <div>
                      <p className="text-system-label-secondary px-4 py-2 text-xs font-bold uppercase tracking-wider bg-system-background-tertiary/50 sticky top-0 backdrop-blur-md">Favoriler</p>
                      {favoriteLibraryExercises.map(exercise => (
                        <ExerciseListItem key={exercise.id} exercise={exercise} isFavorite onClick={handleAddExerciseToWorkout} />
                      ))}
                    </div>
                  )}
                  <div>
                    <p className="text-system-label-secondary px-4 py-2 text-xs font-bold uppercase tracking-wider bg-system-background-tertiary/50 sticky top-0 backdrop-blur-md">Tüm Hareketler</p>
                    {otherLibraryExercises.map(exercise => (
                      <ExerciseListItem key={exercise.id} exercise={exercise} onClick={handleAddExerciseToWorkout} />
                    ))}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Exercise Confirmation Modal */}
      {exerciseToDelete && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setExerciseToDelete(null)} />
          <div className="relative bg-system-background-secondary rounded-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 shadow-2xl">
            <div className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-system-red/10 flex items-center justify-center">
                <Trash2 size={32} className="text-system-red" />
              </div>
              <h3 className="text-xl font-bold text-system-label mb-2">Hareketi Sil</h3>
              <p className="text-system-label-secondary text-sm">
                Bu hareketi antrenmanınızdan silmek istediğinizden emin misiniz?
              </p>
            </div>
            <div className="flex border-t border-system-separator/20">
              <button
                onClick={() => setExerciseToDelete(null)}
                className="flex-1 py-4 text-system-blue font-semibold text-[17px] border-r border-system-separator/20 active:bg-system-fill transition-colors"
              >
                İptal
              </button>
              <button
                onClick={() => {
                  removeWorkoutExercise(exerciseToDelete);
                  setExerciseToDelete(null);
                }}
                className="flex-1 py-4 text-system-red font-bold text-[17px] active:bg-system-fill transition-colors"
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddWorkout;