import React, { useState, useEffect } from 'react';
import { Calendar, Dumbbell, BarChart3, ArrowLeft, Home, BookOpen } from 'lucide-react'; // BookOpen ikonu eklendi
import WorkoutCalendar from './components/WorkoutCalendar';
import AddWorkout from './components/AddWorkout';
import WorkoutDetails from './components/WorkoutDetails';
import ProgressCharts from './components/ProgressCharts';
import RoutinesList, { Routine } from './components/RoutinesList';
import CreateRoutine from './components/CreateRoutine';
import ExerciseLibrary from './components/ExerciseLibrary'; // ExerciseLibrary import edildi
import { supabase } from './services/supabaseClient';
import { Exercise as ApiExercise, getExercises } from './services/exerciseApi';

// --- Arayüzler (Interfaces) ---
export interface Exercise {
  id: string;
  name: string;
  sets: { reps: number; weight: number }[];
}
export interface Workout {
  id: string;
  date: string;
  exercises: Exercise[];
}

// *** 1. DEĞİŞİKLİK: View tipine 'library' eklendi ***
type View = 'calendar' | 'add' | 'details' | 'progress' | 'routines' | 'create_routine' | 'library';

function App() {
  // --- State Yönetimi ---
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [allExercises, setAllExercises] = useState<ApiExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<View>('calendar');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);

  // --- Veri Çekme ---
  const fetchAllData = async () => {
    setLoading(true);
    const [workoutsRes, routinesRes, exercisesRes] = await Promise.all([
      supabase.from('workouts').select('*').order('date', { ascending: false }),
      supabase.from('routines').select('*').order('name'),
      getExercises()
    ]);
    
    if (workoutsRes.data) setWorkouts(workoutsRes.data as Workout[]);
    if (routinesRes.data) setRoutines(routinesRes.data as Routine[]);
    if (exercisesRes) setAllExercises(exercisesRes);

    setLoading(false);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // --- Veri Kaydetme / Güncelleme / Silme ---

  const handleSaveWorkout = async (workoutData: Omit<Workout, 'id'|'created_at'>) => {
    const workoutToUpdate = editingWorkout;
    
    if (workoutToUpdate && workoutToUpdate.id !== 'new') {
      await supabase.from('workouts').update({ exercises: workoutData.exercises }).eq('id', workoutToUpdate.id);
    } else {
      await supabase.from('workouts').insert([{ date: workoutData.date, exercises: workoutData.exercises }]);
    }
    
    setEditingWorkout(null);
    await fetchAllData();
    setCurrentView('calendar');
  };

  const handleDeleteWorkout = async (workoutId: string) => {
    await supabase.from('workouts').delete().eq('id', workoutId);
    await fetchAllData();
    setCurrentView('calendar');
  };

  const handleSaveRoutine = async (id: string | null, name: string, exercises: ApiExercise[]) => {
    const routineData = { name, exercises: exercises.map(({id, name}) => ({id, name})) };
    if (id) {
      await supabase.from('routines').update(routineData).eq('id', id);
    } else {
      await supabase.from('routines').insert([routineData]);
    }
    await fetchAllData();
    setEditingRoutine(null);
    setCurrentView('routines');
  };

  const handleDeleteRoutine = async (routineId: string) => {
    if (confirm("Bu rutini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.")) {
      await supabase.from('routines').delete().eq('id', routineId);
      await fetchAllData();
    }
  };
  
  const handleEditRoutine = (routine: Routine) => {
    setEditingRoutine(routine);
    setCurrentView('create_routine');
  };

  // --- Sayfa Yönlendirme ve Render ---

  const renderHeader = () => {
    const titles: Record<View, string> = {
      calendar: 'Takvim',
      add: editingWorkout ? 'Antrenman Düzenle' : 'Antrenman Ekle',
      details: 'Antrenman Detayı',
      progress: 'İstatistikler',
      routines: 'Rutinlerim',
      create_routine: editingRoutine ? 'Rutini Düzenle' : 'Yeni Rutin Oluştur',
      library: 'Hareket Kütüphanesi' // YENİ
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
          <div className="w-10" />
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
          allExercises={allExercises}
          onSave={handleSaveWorkout} 
          onCancel={() => { setEditingWorkout(null); setCurrentView('calendar'); }} 
        />;
      case 'details':
        const selectedWorkout = workouts.find(w => w.date === selectedDate);
        return <WorkoutDetails 
          workout={selectedWorkout} 
          date={selectedDate} 
          workouts={workouts} 
          onEdit={() => { if (selectedWorkout) { setEditingWorkout(selectedWorkout); setCurrentView('add'); }}} 
          onDelete={handleDeleteWorkout}
          onUpdate={(id, data) => handleSaveWorkout({id, ...data})} 
        />;
      case 'progress':
        return <ProgressCharts workouts={workouts} />;
      
      // *** 2. DEĞİŞİKLİK: library case'i eklendi ***
      case 'library':
        return <ExerciseLibrary 
            onExerciseSelect={(exercise) => {
                const today = new Date().toISOString().split('T')[0];
                const newWorkoutFromLibrary: Workout = {
                    id: 'new', // Yeni olduğunu belirt
                    date: today,
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
            onBack={() => setCurrentView('routines')} 
        />;
      default: return null;
    }
  };

  const renderBottomNav = () => {
    // *** 3. DEĞİŞİKLİK: Navigasyon barına yeni buton eklendi ***
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-lg">
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
      </div>
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