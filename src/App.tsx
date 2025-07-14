import React, { useState, useEffect } from 'react';
import { Calendar, Dumbbell, BarChart3, ArrowLeft, BookOpen, LogOut, User } from 'lucide-react';
import WorkoutCalendar from './components/WorkoutCalendar';
import AddWorkout from './components/AddWorkout';
import WorkoutDetails from './components/WorkoutDetails';
import ProgressCharts from './components/ProgressCharts';
import RoutinesList, { Routine } from './components/RoutinesList';
import CreateRoutine from './components/CreateRoutine';
import ExerciseLibrary from './components/ExerciseLibrary';
import Auth from './components/Auth'; // Auth bileşenini import ediyoruz
import { supabase } from './services/supabaseClient';
import { Session } from '@supabase/supabase-js';

// Arayüzler (Interfaces)
export interface Exercise {
  id: string;
  name:string;
  sets: { reps: number; weight: number }[];
}
export interface Workout {
  id: string;
  user_id: string; // user_id eklendi
  date: string;
  exercises: Exercise[];
}

type View = 'calendar' | 'add' | 'details' | 'progress' | 'routines' | 'create_routine' | 'library';

function App() {
  // State Yönetimi
  const [session, setSession] = useState<Session | null>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<View>('calendar');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);

  // Kullanıcı oturumunu dinle
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Oturum açıldığında verileri çek
  useEffect(() => {
    if (session) {
      fetchAllData();
    }
  }, [session]);

  const fetchAllData = async () => {
    if (!session) return;
    setLoading(true);
    try {
      const [workoutsRes, routinesRes] = await Promise.all([
        supabase.from('workouts').select('*').eq('user_id', session.user.id).order('date', { ascending: false }),
        supabase.from('routines').select('*').eq('user_id', session.user.id).order('name'),
      ]);
      
      if (workoutsRes.error) throw workoutsRes.error;
      if (routinesRes.error) throw routinesRes.error;
      
      if (workoutsRes.data) setWorkouts(workoutsRes.data as Workout[]);
      if (routinesRes.data) setRoutines(routinesRes.data as Routine[]);

    } catch (error) {
      console.error("Veri çekme hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- Veri Kaydetme / Güncelleme / Silme (user_id eklendi) ---

  const handleSaveWorkout = async (workoutData: Omit<Workout, 'id' | 'created_at' | 'user_id'>) => {
    if (!session) return;
    const workoutToUpdate = editingWorkout;
    const workoutPayload = { ...workoutData, user_id: session.user.id };

    if (workoutToUpdate && workoutToUpdate.id !== 'new') {
      await supabase.from('workouts').update({ exercises: workoutPayload.exercises }).eq('id', workoutToUpdate.id);
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
    setEditingRoutine(routine);
    setCurrentView('create_routine');
  };
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setWorkouts([]);
    setRoutines([]);
    setCurrentView('calendar');
  };

  // --- Sayfa Yönlendirme ve Render ---

  // Giriş yapılmamışsa Auth bileşenini göster
  if (!session) {
    return <Auth />;
  }

  const renderHeader = () => {
    const titles: Record<View, string> = {
      calendar: 'Takvim',
      add: editingWorkout ? 'Antrenman Düzenle' : 'Antrenman Ekle',
      details: 'Antrenman Detayı',
      progress: 'İstatistikler',
      routines: 'Rutinlerim',
      create_routine: editingRoutine ? 'Rutini Düzenle' : 'Yeni Rutin Oluştur',
      library: 'Hareket Kütüphanesi'
    };
    return (
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 pt-[calc(1rem+env(safe-area-inset-top))] pb-4 shadow-lg">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="w-10">
            {(currentView !== 'routines' && currentView !== 'calendar') && (
              <button
                onClick={() => setCurrentView(currentView === 'create_routine' ? 'routines' : 'calendar')}
                className="p-2 hover:bg-blue-800 rounded-full transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
            )}
          </div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Dumbbell size={24} />
            {titles[currentView]}
          </h1>
          <div className="w-10">
            <button onClick={handleLogout} className="p-2 hover:bg-blue-800 rounded-full transition-colors">
              <LogOut size={22} />
            </button>
          </div>
        </div>
      </header>
    );
  };

  const renderContent = () => {
    if (loading) {
      return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div></div>;
    }
    
    switch (currentView) {
      case 'routines':
        return <RoutinesList 
          routines={routines} 
          onAddNewRoutine={() => { setEditingRoutine(null); setCurrentView('create_routine'); }}
          onEditRoutine={handleEditRoutine}
          onDeleteRoutine={handleDeleteRoutine}
        />;
      case 'create_routine':
        return <CreateRoutine 
          existingRoutine={editingRoutine} 
          onSaveRoutine={handleSaveRoutine} 
          onCancel={() => { setEditingRoutine(null); setCurrentView('routines'); }} 
        />;
      case 'calendar':
        return <WorkoutCalendar 
          workouts={workouts} 
          onDateSelect={(date) => { 
            setSelectedDate(date);
            const workoutForDate = workouts.find(w => w.date === date);
            if (workoutForDate) {
              setCurrentView('details');
            } else {
              setEditingWorkout(null);
              setCurrentView('add');
            }
          }} 
        />;
      case 'add':
        return <AddWorkout 
          date={selectedDate} 
          existingWorkout={editingWorkout} 
          routines={routines}
          workouts={workouts}
          onSave={handleSaveWorkout} 
          onCancel={() => { setEditingWorkout(null); setCurrentView('calendar'); }} 
        />;
      case 'details':
        const selectedWorkout = workouts.find(w => w.date === selectedDate);
        return selectedWorkout ? <WorkoutDetails 
          workout={selectedWorkout}
          date={selectedDate}
          workouts={workouts}
          onEdit={() => { setEditingWorkout(selectedWorkout); setCurrentView('add'); }}
          onDelete={() => handleDeleteWorkout(selectedWorkout.id)}
          onUpdate={(id, data) => handleSaveWorkout({ id, ...data })}
        /> : null;
      case 'progress':
        return <ProgressCharts workouts={workouts} />;
      
      case 'library':
        return <ExerciseLibrary 
            onExerciseSelect={(exercise) => {
                const today = new Date().toISOString().split('T')[0];
                const newWorkoutFromLibrary: Workout = {
                    id: 'new',
                    date: today,
                    user_id: session?.user.id || '',
                    exercises: [{
                        id: Date.now().toString(),
                        name: exercise.name,
                        sets: [{ reps: 0, weight: 0 }]
                    }]
                };
                setEditingWorkout(newWorkoutFromLibrary);
                setSelectedDate(today);
                setCurrentView('add');
            }}
            onBack={() => setCurrentView('calendar')} 
        />;
      default: return null;
    }
  };

  const renderBottomNav = () => {
    return (
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-lg">
        <div className="max-w-md mx-auto flex justify-around">
            <button onClick={() => setCurrentView('calendar')} className={`flex flex-col items-center gap-1 w-1/4 ${currentView === 'calendar' ? 'text-blue-500' : 'text-gray-600 dark:text-gray-300'}`}>
                <Calendar size={24} />
                <span className="text-xs">Takvim</span>
            </button>
            <button onClick={() => setCurrentView('routines')} className={`flex flex-col items-center gap-1 w-1/4 ${currentView === 'routines' ? 'text-blue-500' : 'text-gray-600 dark:text-gray-300'}`}>
                <Dumbbell size={24} />
                <span className="text-xs">Rutinler</span>
            </button>
            <button onClick={() => setCurrentView('library')} className={`flex flex-col items-center gap-1 w-1/4 ${currentView === 'library' ? 'text-blue-500' : 'text-gray-600 dark:text-gray-300'}`}>
                <BookOpen size={24} />
                <span className="text-xs">Kütüphane</span>
            </button>
            <button onClick={() => setCurrentView('progress')} className={`flex flex-col items-center gap-1 w-1/4 ${currentView === 'progress' ? 'text-blue-500' : 'text-gray-600 dark:text-gray-300'}`}>
                <BarChart3 size={24} />
                <span className="text-xs">İstatistik</span>
            </button>
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
