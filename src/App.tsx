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

type View = 'calendar' | 'add' | 'details' | 'progress' | 'routines' | 'create_routine' | 'library' | 'profile';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<View>('calendar');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [editingRoutine, setEditingRoutine] = useState<Partial<Routine> | null>(null);
  const [allLibraryExercises, setAllLibraryExercises] = useState<LibraryExercise[]>([]);
  const [favoriteExercises, setFavoriteExercises] = useState<string[]>([]);

  useEffect(() => {
    setLoading(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) fetchAllData();
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
      if (profileRes.error && profileRes.status !== 406) throw profileRes.error;
      setWorkouts(workoutsRes.data as Workout[] || []);
      setRoutines(routinesRes.data as Routine[] || []);
      setAllLibraryExercises(exercisesRes || []);
      setFavoriteExercises(profileRes.data?.favorite_exercises || []);
    } catch (error) { console.error("Veri çekme hatası:", error); } 
    finally { setLoading(false); }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setWorkouts([]);
    setRoutines([]);
    setFavoriteExercises([]);
    setCurrentView('calendar');
  };

  const toggleFavoriteExercise = async (exerciseId: string) => {
    if (!session) return;
    const updatedFavorites = favoriteExercises.includes(exerciseId)
      ? favoriteExercises.filter(id => id !== exerciseId)
      : [...favoriteExercises, exerciseId];
    setFavoriteExercises(updatedFavorites);
    const { error } = await supabase.from('profiles').update({ favorite_exercises: updatedFavorites }).eq('id', session.user.id);
    if (error) {
      console.error('Favori güncellenirken hata oluştu:', error);
      setFavoriteExercises(favoriteExercises);
    }
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
    setCurrentView('create_routine');
    setEditingRoutine(routine);
  };

  const handleCopyRoutine = (routine: Routine) => {
    const { id, ...routineData } = routine;
    const copiedRoutine = { ...routineData, name: `${routine.name} (Kopya)` };
    setEditingRoutine(copiedRoutine);
    setCurrentView('create_routine');
  };
  
  const handleAddExerciseFromLibrary = (exerciseToAdd: LibraryExercise) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const workoutForToday = workouts.find(w => w.date === todayStr);
    const workoutToEdit = editingWorkout && editingWorkout.date === todayStr ? editingWorkout : workoutForToday;
    const newExercise: Exercise = {
        id: `${exerciseToAdd.id}-${Date.now()}`,
        name: exerciseToAdd.name, bodyPart: exerciseToAdd.bodyPart, sets: [{ reps: 0, weight: 0 }]
    };
    if (workoutToEdit) {
        if (workoutToEdit.exercises.some(ex => ex.name.toLowerCase() === newExercise.name.toLowerCase())) {
             alert(`"${newExercise.name}" zaten bugünkü antrenmanınızda mevcut.`);
             return;
        } else {
            setEditingWorkout({ ...workoutToEdit, exercises: [newExercise, ...workoutToEdit.exercises] });
        }
    } else {
        setEditingWorkout({ id: 'new', user_id: session?.user.id || '', date: todayStr, exercises: [newExercise] });
    }
    setSelectedDate(todayStr);
    setCurrentView('add');
  };

  const handleStartOrContinueWorkout = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const workoutForToday = workouts.find(w => w.date === todayStr);
    setSelectedDate(todayStr);
    setEditingWorkout(workoutForToday || null); 
    setCurrentView('add');
  };

  if (loading) {
    return <div className="min-h-screen bg-system-background flex justify-center items-center"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-system-blue"></div></div>;
  }
  if (!session) return <Auth />;

  const renderContent = () => {
    switch (currentView) {
      case 'profile': return <Profile session={session} onLogout={handleLogout} />;
      case 'routines': return <RoutinesList routines={routines} onAddNewRoutine={() => { setEditingRoutine(null); setCurrentView('create_routine'); }} onEditRoutine={handleEditRoutine} onDeleteRoutine={handleDeleteRoutine} onCopyRoutine={handleCopyRoutine} allLibraryExercises={allLibraryExercises} />;
      case 'create_routine': return <CreateRoutine existingRoutine={editingRoutine} onSaveRoutine={handleSaveRoutine} onCancel={() => { setEditingRoutine(null); setCurrentView('routines'); }} allLibraryExercises={allLibraryExercises} favoriteExercises={favoriteExercises} />;
      case 'calendar': return <WorkoutCalendar workouts={workouts} onDateSelect={(date) => { setSelectedDate(date); const workoutForDate = workouts.find(w => w.date === date); if (workoutForDate) { setEditingWorkout(workoutForDate); setCurrentView('details'); } else { setEditingWorkout(null); setCurrentView('add'); } }} onStartWorkout={handleStartOrContinueWorkout} />;
      case 'add': return <AddWorkout date={selectedDate} existingWorkout={editingWorkout} routines={routines} workouts={workouts} onSave={handleSaveWorkout} onCancel={() => { setEditingWorkout(null); setCurrentView('calendar'); }} allLibraryExercises={allLibraryExercises} favoriteExercises={favoriteExercises} />;
      case 'details': 
        const selectedWorkout = workouts.find(w => w.date === selectedDate);
        return <WorkoutDetails 
            workout={selectedWorkout} 
            date={selectedDate} 
            workouts={workouts} 
            onEdit={() => { setEditingWorkout(selectedWorkout); setCurrentView('add'); }} 
            onDelete={() => handleDeleteWorkout(selectedWorkout!.id)} 
            onCancel={() => setCurrentView('calendar')}
        />;
      case 'progress': return <ProgressCharts workouts={workouts} />;
      case 'library': return <ExerciseLibrary onExerciseSelect={handleAddExerciseFromLibrary} allExercises={allLibraryExercises} favoriteExercises={favoriteExercises} onToggleFavorite={toggleFavoriteExercise} />;
      default: return null;
    }
  };

  const renderBottomNav = () => {
    const navItems = [
      { view: 'calendar', icon: Calendar, label: 'Takvim' },
      { view: 'routines', icon: Dumbbell, label: 'Rutinler' },
      { view: 'library', icon: BookOpen, label: 'Kütüphane' },
      { view: 'progress', icon: BarChart3, label: 'İlerleme' },
      { view: 'profile', icon: User, label: 'Profil' },
    ];
    return (
      <nav className="fixed bottom-0 left-0 right-0 bg-system-background-secondary/80 backdrop-blur-xl border-t border-system-separator">
        <div className="max-w-md mx-auto flex justify-around px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
            {navItems.map(item => (
              <button key={item.view} onClick={() => setCurrentView(item.view as View)} className={`flex flex-col items-center justify-center gap-1 w-1/5 py-1 rounded-lg transition-colors duration-200 ${currentView === item.view ? 'text-system-blue' : 'text-system-label-secondary hover:text-system-label'}`}>
                  <item.icon size={24} strokeWidth={currentView === item.view ? 2.5 : 2} />
                  <span className="text-xs font-medium">{item.label}</span>
              </button>
            ))}
        </div>
      </nav>
    );
  };

  return (
    <div className="min-h-screen bg-system-background flex flex-col max-w-md mx-auto">
      {/* DEĞİŞİKLİK: 
        Sabit bir header alanı oluşturuyoruz. Bu alan, iOS'teki "safe area" boşluğunu dolduracak.
        Arka plan rengi, uygulamanın ana arka planıyla aynı olacak.
      */}
      <header className="sticky top-0 z-10 bg-system-background w-full">
        <div className="h-[env(safe-area-inset-top)]"></div>
      </header>
      
      {/* DEĞİŞİKLİK: 
        Ana içerik artık header'dan sonra başlıyor ve padding'e ihtiyacı yok.
        flex-1 ve overflow-y-auto ile kendi içinde kaydırılabilir hale geliyor.
      */}
      <main className="flex-1 overflow-y-auto pb-24">
        {renderContent()}
      </main>

      {renderBottomNav()}
    </div>
  );
}

export default App;

