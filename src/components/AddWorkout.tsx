import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Exercise, Workout } from '../App';
import { Exercise as ApiExercise } from '../services/exerciseApi';

interface AddWorkoutProps {
  date: string;
  onSave: (workout: Omit<Workout, 'id'>) => void;
  onCancel: () => void;
  selectedExercise?: ApiExercise;
}

const AddWorkout: React.FC<AddWorkoutProps> = ({ date, onSave, onCancel, selectedExercise }) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);

  // Seçilen egzersizi otomatik ekle
  useEffect(() => {
    if (selectedExercise) {
      const newExercise: Exercise = {
        id: Date.now().toString(),
        name: selectedExercise.name,
        sets: [{ reps: 0, weight: 0 }]
      };
      setExercises(prev => [...prev, newExercise]);
    }
  }, [selectedExercise]);

  const addExercise = () => {
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: '',
      sets: [{ reps: 0, weight: 0 }]
    };
    setExercises(prev => [...prev, newExercise]);
  };

  const removeExercise = (exerciseId: string) => {
    setExercises(prev => prev.filter(ex => ex.id !== exerciseId));
  };

  const updateExerciseName = (exerciseId: string, name: string) => {
    setExercises(prev =>
      prev.map(ex =>
        ex.id === exerciseId ? { ...ex, name } : ex
      )
    );
  };

  const addSet = (exerciseId: string) => {
    setExercises(prev =>
      prev.map(ex =>
        ex.id === exerciseId
          ? { ...ex, sets: [...ex.sets, { reps: 0, weight: 0 }] }
          : ex
      )
    );
  };

  const removeSet = (exerciseId: string, setIndex: number) => {
    setExercises(prev =>
      prev.map(ex =>
        ex.id === exerciseId
          ? { ...ex, sets: ex.sets.filter((_, i) => i !== setIndex) }
          : ex
      )
    );
  };

  const updateSet = (exerciseId: string, setIndex: number, field: 'reps' | 'weight', value: number) => {
    setExercises(prev =>
      prev.map(ex =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: ex.sets.map((set, i) =>
                i === setIndex ? { ...set, [field]: value } : set
              )
            }
          : ex
      )
    );
  };

  const handleSave = () => {
    const validExercises = exercises.filter(ex => 
      ex.name.trim() && ex.sets.some(set => set.reps > 0 && set.weight > 0)
    );

    if (validExercises.length === 0) {
      alert('En az bir hareket ve set eklemelisiniz!');
      return;
    }

    onSave({
      date,
      exercises: validExercises
    });
  };

  const commonExercises = [
    'Bench Press', 'Squat', 'Deadlift', 'Shoulder Press', 'Barbell Row',
    'Pull Up', 'Dumbbell Curl', 'Tricep Dip', 'Lat Pulldown', 'Leg Press'
  ];

  return (
    <div className="p-4">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          {format(new Date(date), 'dd MMMM yyyy', { locale: tr })}
        </h2>
      </div>

      {/* Hızlı hareket seçimi */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Popüler Hareketler</h3>
        <div className="flex flex-wrap gap-2">
          {commonExercises.map(exercise => (
            <button
              key={exercise}
              onClick={() => {
                const newExercise: Exercise = {
                  id: Date.now().toString(),
                  name: exercise,
                  sets: [{ reps: 0, weight: 0 }]
                };
                setExercises(prev => [...prev, newExercise]);
              }}
              className="px-3 py-2 bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-lg text-sm hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
            >
              {exercise}
            </button>
          ))}
        </div>
      </div>

      {/* Egzersizler */}
      <div className="space-y-6">
        {exercises.map((exercise, exerciseIndex) => (
          <div key={exercise.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <input
                type="text"
                value={exercise.name}
                onChange={(e) => updateExerciseName(exercise.id, e.target.value)}
                placeholder="Hareket adı"
                className="flex-1 p-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              />
              <button
                onClick={() => removeExercise(exercise.id)}
                className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>

            {/* Setler */}
            <div className="space-y-2">
              <div className="grid grid-cols-4 gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 px-2">
                <span>Set</span>
                <span>Tekrar</span>
                <span>Kg</span>
                <span></span>
              </div>
              
              {exercise.sets.map((set, setIndex) => (
                <div key={setIndex} className="grid grid-cols-4 gap-2 items-center">
                  <span className="text-center font-medium text-gray-500 dark:text-gray-400">
                    {setIndex + 1}
                  </span>
                  <input
                    type="number"
                    value={set.reps || ''}
                    onChange={(e) => updateSet(exercise.id, setIndex, 'reps', parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  />
                  <input
                    type="number"
                    value={set.weight || ''}
                    onChange={(e) => updateSet(exercise.id, setIndex, 'weight', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    step="0.5"
                    className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  />
                  {exercise.sets.length > 1 && (
                    <button
                      onClick={() => removeSet(exercise.id, setIndex)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => addSet(exercise.id)}
              className="w-full mt-3 p-2 text-blue-600 border-2 border-blue-200 dark:border-blue-800 border-dashed rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/50 transition-colors"
            >
              + Set Ekle
            </button>
          </div>
        ))}
      </div>

      {/* Hareket ekle butonu */}
      <button
        onClick={addExercise}
        className="w-full mt-6 p-4 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl border-2 border-gray-200 dark:border-gray-600 border-dashed hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
      >
        <Plus size={20} />
        Hareket Ekle
      </button>

      {/* Kaydet/İptal butonları */}
      <div className="flex gap-3 mt-8">
        <button
          onClick={onCancel}
          className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          İptal
        </button>
        <button
          onClick={handleSave}
          className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <Save size={20} />
          Kaydet
        </button>
      </div>
    </div>
  );
};

export default AddWorkout;