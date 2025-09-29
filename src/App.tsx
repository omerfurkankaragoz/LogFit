// src/App.tsx

import React, { useState, useEffect } from 'react';
import { Calendar, Dumbbell, BarChart3, BookOpen, User } from 'lucide-react';
import WorkoutCalendar from './components/WorkoutCalendar';
import AddWorkout from './components/AddWorkout';
import WorkoutDetails from './components/WorkoutDetails';
import ProgressCharts from './components/ProgressCharts';
import RoutinesList, { Routine } from './components/RoutinesList';
import CreateRoutine from './components/CreateRoutine';
import ExerciseLibrary from './components/ExerciseLibrary';
import Auth from './components/Auth';
import Profile from './components/Profile';
import { supabase } from './services/supabaseClient';
import { Session } from '@supabase/supabase-js';
import { getAllExercises, Exercise as LibraryExercise } from './services/exerciseApi';


// Arayüzler (Interfaces)
export interface Exercise {
  id: string;
  name: string;
  bodyPart?: string;
  sets: { reps: number; weight: number }[];
}
export interface Workout {
  id: string;
  user_id: string;
  date: string;
  exercises: Exercise[];
}

// View Tipi
type View = 'calendar' | 'add' | 'details' | 'progress' | 'routines' | 'create_routine' | 'library' | 'profile';

function App() {
  // State Yönetimi
  const [session, setSession] = useState<Session | null>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<View>('calendar');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [editingRoutine, setEditingRoutine] = useState<Partial<Routine> | null>(null);
  const [previousView, setPreviousView] = useState<View>('calendar');
  const [allLibraryExercises, setAllLibraryExercises] = useState<LibraryExercise[]>([]);
  const [favoriteExercises, setFavoriteExercises] = useState<string[]>([]);

  // Kullanıcı oturumunu dinle
  useEffect(() => {
    setLoading(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Oturum açıldığında veya favoriler değiştiğinde verileri çek
  useEffect(() => {
    if (session) {
      fetchAllData();
    }
  }, [session]);

  const fetchAllData = async () => {
    if (!session) return;
    setLoading(true);
    try {
      const [workoutsRes, routinesRes, exercisesRes, profileRes] = await Promise.all([
        supabase.from('workouts').select('*').eq('user_id', session.user.id).order('date', { ascending: false }),
        supabase.from('routines').select('*').eq('user_id', session.user.id).order('name'),
        getAllExercises(),
        supabase.from('profiles').select('favorite_exercises').eq('id', session.user.id).single(),
      ]);
      
      if (workoutsRes.error) throw workoutsRes.error;
      if (routinesRes.error) throw routinesRes.error;
      if (profileRes.error && profileRes.status !== 406) throw profileRes.error; // 406 hatası profilin henüz olmadığı anlamına gelir, bu bir hata değil.
      
      setWorkouts(workoutsRes.data as Workout[] || []);
      setRoutines(routinesRes.data as Routine[] || []);
      setAllLibraryExercises(exercisesRes || []);
      setFavoriteExercises(profileRes.data?.favorite_exercises || []);

    } catch (error) {
      console.error("Veri çekme hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavoriteExercise = async (exerciseId: string) => {
    if (!session) return;

    const isFavorited = favoriteExercises.includes(exerciseId);
    const updatedFavorites = isFavorited
      ? favoriteExercises.filter(id => id !== exerciseId)
      : [...favoriteExercises, exerciseId];

    setFavoriteExercises(updatedFavorites);

    const { error } = await supabase
      .from('profiles')
      .update({ favorite_exercises: updatedFavorites })
      .eq('id', session.user.id);

    if (error) {
      console.error('Favori güncellenirken hata oluştu:', error);
      // Hata durumunda eski state'e geri dön
      setFavoriteExercises(favoriteExercises);
    }
  };

  const handleSetView = (view: View) => {
    setPreviousView(currentView);
    setCurrentView(view);
  };

  const handleSaveWorkout = async (workoutData: Omit<Workout, 'id' | 'user_id' | 'created_at'>) => {
      if (!session) return;
      const workoutToUpdate = editingWorkout;
      const workoutPayload = { ...workoutData, user_id: session.user.id };
  
      if (workoutToUpdate && workoutToUpdate.id !== 'new') {
          await supabase.from('workouts').update({ exercises: workoutPayload.exercises, date: workoutPayload.date }).eq('id', workoutToUpdate.id);
      } else {
          await supabase.from('workouts').insert([workoutPayload]);
      }
      setEditingWorkout(null);
      await fetchAllData();
      setCurrentView('calendar');
  };

  const handleSaveRoutine = async (id: string | null, name: string, exercises: { id: string; name: string }[]) => {
    if (!session) return;
    const routineData = { name, exercises, user_id: session.user.id };
    if (id) {
      await supabase.from('routines').update(routineData).eq('id', id);
    } else {
      await supabase.from('routines').insert([routineData]);
    }
    await fetchAllData();
    setEditingRoutine(null);
    setCurrentView('routines');
  };

  const handleDeleteWorkout = async (workoutId: string) => {
    await supabase.from('workouts').delete().eq('id', workoutId);
    await fetchAllData();
    setCurrentView('calendar');
  };

  const handleDeleteRoutine = async (routineId: string) => {
    if (confirm("Bu rutini silmek istediğinizden emin misiniz?")) {
      await supabase.from('routines').delete().eq('id', routineId);
      await fetchAllData();
    }
  };
  
  const handleEditRoutine = (routine: Routine) => {
    handleSetView('create_routine');
    setEditingRoutine(routine);
  };

  const handleCopyRoutine = (routine: Routine) => {
    const { id, ...routineData } = routine;
    const copiedRoutine = {
      ...routineData,
      name: `${routine.name} (Kopya)`,
    };
    setEditingRoutine(copiedRoutine);
    handleSetView('create_routine');
  };
  
  const handleAddExerciseFromLibrary = (exerciseToAdd: LibraryExercise) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const workoutForToday = workouts.find(w => w.date === todayStr);
    const workoutToEdit = editingWorkout && editingWorkout.date === todayStr ? editingWorkout : workoutForToday;

    const newExercise: Exercise = {
        id: `${exerciseToAdd.id}-${Date.now()}`,
        name: exerciseToAdd.name,
        bodyPart: exerciseToAdd.bodyPart,
        sets: [{ reps: 0, weight: 0 }]
    };

    if (workoutToEdit) {
        const exerciseExists = workoutToEdit.exercises.some(ex => ex.name.toLowerCase() === newExercise.name.toLowerCase());
        if (exerciseExists) {
             alert(`"${newExercise.name}" zaten bugünkü antrenmanınızda mevcut.`);
        } else {
            const updatedExercises = [newExercise, ...workoutToEdit.exercises];
            setEditingWorkout({ ...workoutToEdit, exercises: updatedExercises });
        }
    } else {
        const newWorkout: Workout = {
            id: 'new',
            user_id: session?.user.id || '',
            date: todayStr,
            exercises: [newExercise],
        };
        setEditingWorkout(newWorkout);
    }
    
    setSelectedDate(todayStr);
    handleSetView('add');
  };

  const handleStartOrContinueWorkout = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const workoutForToday = workouts.find(w => w.date === todayStr);

    setSelectedDate(todayStr);
    setEditingWorkout(workoutForToday || null); 
    handleSetView('add');
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center items-center"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div></div>;
  }

  if (!session) {
    return <Auth />;
  }

  const renderHeader = () => {
    return (
      <header className="sticky top-0 z-20 h-[env(safe-area-inset-top)] bg-gradient-to-r from-gray-900 to-gray-900" />
    );
  };

  const renderContent = () => {
    switch (currentView) {
      case 'profile':
        return <Profile session={session} />;
      case 'routines':
        return <RoutinesList 
          routines={routines} 
          onAddNewRoutine={() => { setEditingRoutine(null); handleSetView('create_routine'); }}
          onEditRoutine={handleEditRoutine}
          onDeleteRoutine={handleDeleteRoutine}
          onCopyRoutine={handleCopyRoutine}
        />;
      case 'create_routine':
        return <CreateRoutine 
          existingRoutine={editingRoutine} 
          onSaveRoutine={handleSaveRoutine} 
          onCancel={() => { setEditingRoutine(null); setCurrentView('routines'); }} 
          allLibraryExercises={allLibraryExercises}
          favoriteExercises={favoriteExercises}
        />;
      case 'calendar':
        return <WorkoutCalendar 
          workouts={workouts} 
          onDateSelect={(date) => { 
            setSelectedDate(date);
            const workoutForDate = workouts.find(w => w.date === date);
            if (workoutForDate) {
              setEditingWorkout(workoutForDate);
              handleSetView('details');
            } else {
              setEditingWorkout(null);
              handleSetView('add');
            }
          }} 
          onStartWorkout={handleStartOrContinueWorkout}
        />;
      case 'add':
        return <AddWorkout 
          date={selectedDate} 
          existingWorkout={editingWorkout} 
          routines={routines}
          workouts={workouts}
          onSave={handleSaveWorkout} 
          onCancel={() => { setEditingWorkout(null); setCurrentView('calendar'); }}
          allLibraryExercises={allLibraryExercises}
          favoriteExercises={favoriteExercises}
        />;
      case 'details':
        const selectedWorkout = workouts.find(w => w.date === selectedDate);
        return <WorkoutDetails 
          workout={selectedWorkout}
          date={selectedDate}
          workouts={workouts}
          onEdit={() => { setEditingWorkout(selectedWorkout); handleSetView('add'); }}
          onDelete={() => handleDeleteWorkout(selectedWorkout.id)}
        />;
      case 'progress':
        return <ProgressCharts workouts={workouts} />;
      
      case 'library':
        return <ExerciseLibrary 
            onExerciseSelect={handleAddExerciseFromLibrary}
            allExercises={allLibraryExercises}
            favoriteExercises={favoriteExercises}
            onToggleFavorite={toggleFavoriteExercise}
        />;
      default: return null;
    }
  };

  const renderBottomNav = () => {
    const navItems = [
      { view: 'calendar', icon: Calendar, label: 'Takvim' },
      { view: 'routines', icon: Dumbbell, label: 'Rutinler' },
      { view: 'library', icon: BookOpen, label: 'Kütüphane' },
      { view: 'progress', icon: BarChart3, label: 'İstatistik' },
      { view: 'profile', icon: User, label: 'Profil' },
    ];

    return (
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-lg">
        <div className="max-w-md mx-auto flex justify-around">
            {navItems.map(item => (
              <button key={item.view} onClick={() => setCurrentView(item.view as View)} className={`flex flex-col items-center gap-1 w-1/5 py-1 rounded-md ${currentView === item.view ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/50 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'}`}>
                  <item.icon size={24} />
                  <span className="text-xs">{item.label}</span>
              </button>
            ))}
        </div>
      </nav>
    )
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {renderHeader()}
      <main className="max-w-md mx-auto pb-24">
        {renderContent()}
      </main>
      {renderBottomNav()}
    </div>
  );
}

export default App;