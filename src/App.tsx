import React, { useState, useEffect } from 'react';
import { Calendar, Plus, TrendingUp, Dumbbell, BarChart3, ArrowLeft } from 'lucide-react';
import WorkoutCalendar from './components/WorkoutCalendar';
import AddWorkout from './components/AddWorkout';
import WorkoutDetails from './components/WorkoutDetails';
import ProgressCharts from './components/ProgressCharts';
import ExerciseLibrary from './components/ExerciseLibrary';
import { supabase } from './services/supabaseClient'; // Supabase client'ı import ediyoruz

export interface Exercise {
  id: string;
  name: string;
  sets: {
    reps: number;
    weight: number;
  }[];
}

export interface Workout {
  id: string; // Supabase'den gelen id'yi kullanacağız
  date: string;
  exercises: Exercise[];
}

type View = 'calendar' | 'add' | 'details' | 'progress' | 'library';

function App() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<View>('calendar');
  const [selectedDate, setSelectedDate] = useState<string>('');

  // Verileri Supabase'den yükle
  useEffect(() => {
    const fetchWorkouts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching workouts:', error);
      } else if (data) {
        // Gelen verinin formatı Workout arayüzüne uygun olmalı
        const formattedData: Workout[] = data.map((item: any) => ({
          id: item.id.toString(),
          date: item.date,
          exercises: item.exercises,
        }));
        setWorkouts(formattedData);
      }
      setLoading(false);
    };
    fetchWorkouts();
  }, []);


  const addWorkout = async (workout: Omit<Workout, 'id'>) => {
    const { data, error } = await supabase
      .from('workouts')
      .insert([{ date: workout.date, exercises: workout.exercises }])
      .select();

    if (error) {
      console.error('Error adding workout:', error);
    } else if (data) {
        const newWorkout: Workout = {
            id: data[0].id.toString(),
            date: data[0].date,
            exercises: data[0].exercises,
        };
      setWorkouts(prev => [newWorkout, ...prev]);
    }
  };

  const updateWorkout = async (workoutId: string, updatedWorkout: Omit<Workout, 'id'>) => {
      const { data, error } = await supabase
        .from('workouts')
        .update({ date: updatedWorkout.date, exercises: updatedWorkout.exercises })
        .eq('id', workoutId)
        .select();

    if(error){
        console.error('Error updating workout:', error);
    } else if (data) {
        setWorkouts(prev =>
            prev.map(workout =>
                workout.id === workoutId
                ? { ...updatedWorkout, id: workoutId }
                : workout
            )
        );
    }
  };

  const deleteWorkout = async (workoutId: string) => {
    const { error } = await supabase
      .from('workouts')
      .delete()
      .eq('id', workoutId);

    if (error) {
      console.error('Error deleting workout:', error);
    } else {
      setWorkouts(prev => prev.filter(workout => workout.id !== workoutId));
    }
  };

  const selectedWorkout = workouts.find(w => w.date === selectedDate);

  const renderHeader = () => {
    const titles = {
      calendar: 'Fitness Takip',
      add: 'Antrenman Ekle',
      details: 'Antrenman Detayı',
      progress: 'İlerleme Grafikleri',
      library: 'Hareket Kütüphanesi'
    };

    return (
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 shadow-lg">
        <div className="max-w-md mx-auto flex items-center justify-between">
          {currentView !== 'calendar' && (
            <button
              onClick={() => setCurrentView('calendar')}
              className="p-2 hover:bg-blue-800 rounded-full transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
          )}
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
        return (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        );
      }
    switch (currentView) {
      case 'calendar':
        return (
          <WorkoutCalendar
            workouts={workouts}
            onDateSelect={(date) => {
              setSelectedDate(date);
              setCurrentView('details');
            }}
          />
        );
      case 'add':
        return (
          <AddWorkout
            date={selectedDate}
            onSave={(workout) => {
              addWorkout(workout);
              setCurrentView('calendar');
            }}
            onCancel={() => setCurrentView('calendar')}
          />
        );
      case 'details':
        return (
          <WorkoutDetails
            workout={selectedWorkout}
            date={selectedDate}
            workouts={workouts}
            onEdit={() => setCurrentView('add')}
            onDelete={(id) => {
              deleteWorkout(id);
              setCurrentView('calendar');
            }}
            onUpdate={updateWorkout}
          />
        );
      case 'progress':
        return <ProgressCharts workouts={workouts} />;
      case 'library':
        return (
          <ExerciseLibrary
            onExerciseSelect={(exercise) => {
              setSelectedDate(new Date().toISOString().split('T')[0]);
              // Seçilen egzersizi kullanarak yeni antrenman oluştur
              const newWorkout: Omit<Workout, 'id'> = {
                date: new Date().toISOString().split('T')[0],
                exercises: [{
                  id: Date.now().toString(),
                  name: exercise.name,
                  sets: [{ reps: 0, weight: 0 }]
                }]
              };
              addWorkout(newWorkout);
              setCurrentView('calendar');
            }}
            onBack={() => setCurrentView('calendar')}
          />
        );
      default:
        return null;
    }
  };

  const renderBottomNav = () => {
    if (currentView !== 'calendar') return null;

    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 shadow-lg">
        <div className="max-w-md mx-auto flex justify-center gap-4">
          <button
            onClick={() => {
              setSelectedDate(new Date().toISOString().split('T')[0]);
              setCurrentView('add');
            }}
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-lg"
          >
            <Plus size={20} />
            Antrenman Ekle
          </button>
          <button
            onClick={() => setCurrentView('library')}
            className="bg-green-500 text-white p-3 rounded-xl hover:bg-green-600 transition-colors shadow-lg"
            title="Hareket Kütüphanesi"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          <button
            onClick={() => setCurrentView('progress')}
            className="bg-orange-500 text-white p-3 rounded-xl hover:bg-orange-600 transition-colors shadow-lg"
            title="İlerleme Grafikleri"
          >
            <BarChart3 size={20} />
          </button>
        </div>
      </div>
    );
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