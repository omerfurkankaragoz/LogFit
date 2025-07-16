// src/App.tsx

import React, { useState, useEffect } from 'react';
import { Calendar, Dumbbell, BarChart3, ArrowLeft, BookOpen, LogOut, User } from 'lucide-react';
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

// Arayüzler (Interfaces)
export interface Exercise {
  id: string;
  name: string;
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
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);
  const [previousView, setPreviousView] = useState<View>('calendar');

  // ... (Diğer tüm fonksiyonlarınız ve useEffect'leriniz aynı kalacak)
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

  const handleSetView = (view: View) => {
    setPreviousView(currentView);
    setCurrentView(view);
  };

  // --- Veri Kaydetme / Güncelleme / Silme ---

  const handleSaveWorkout = async (workoutData: Omit<Workout, 'id' | 'created_at' | 'user_id'>) => {
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setWorkouts([]);
    setRoutines([]);
    setCurrentView('calendar');
  };
  
  const handleAddExerciseFromLibrary = (exerciseToAdd: { id: string; name: string; }) => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    const workoutForToday = workouts.find(w => w.date === todayStr);
    const workoutToEdit = editingWorkout && editingWorkout.date === todayStr ? editingWorkout : workoutForToday;

    const newExercise: Exercise = {
        id: `${exerciseToAdd.id}-${Date.now()}`,
        name: exerciseToAdd.name,
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


  // --- Sayfa Yönlendirme ve Render ---

  if (loading) {
    return <div className="h-full w-full flex justify-center items-center"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div></div>;
  }

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
      library: 'Hareket Kütüphanesi',
      profile: 'Profilim'
    };
    
    const isSubPage = !['calendar', 'routines', 'progress', 'library', 'profile'].includes(currentView);

    return (
      <header className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 pt-[calc(1rem+env(safe-area-inset-top))] pb-4 shadow-lg z-20">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="w-10">
            {isSubPage && (
              <button
                onClick={() => setCurrentView(previousView)}
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
            {currentView === 'profile' && (
              <button onClick={handleLogout} className="p-2 hover:bg-blue-800 rounded-full transition-colors">
                <LogOut size={22} />
              </button>
            )}
          </div>
        </div>
      </header>
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
        />;
      case 'details':
        const selectedWorkout = workouts.find(w => w.date === selectedDate);
        return selectedWorkout ? <WorkoutDetails 
          workout={selectedWorkout}
          date={selectedDate}
          workouts={workouts}
          onEdit={() => { setEditingWorkout(selectedWorkout); handleSetView('add'); }}
          onDelete={() => handleDeleteWorkout(selectedWorkout.id)}
        /> : null;
      case 'progress':
        return <ProgressCharts workouts={workouts} />;
      
      case 'library':
        return <ExerciseLibrary 
            onExerciseSelect={handleAddExerciseFromLibrary}
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
      <nav className="flex-shrink-0 fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-lg z-20">
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
    <div className="h-full w-full flex flex-col relative">
      {renderHeader()}
      {/* YENİ YAPI:
        Bu div, başlık ve alt navigasyon arasında kalan tüm alanı doldurur.
        Kaydırma işlemi bu div içinde gerçekleşir.
        İstediğimiz arka plan rengi buradadır.
      */}
      <div className="flex-1 overflow-y-auto w-full bg-gray-50 dark:bg-gray-900">
        <main className="w-full max-w-md mx-auto pb-24">
          {renderContent()}
        </main>
      </div>
      {renderBottomNav()}
    </div>
  );
}

export default App;