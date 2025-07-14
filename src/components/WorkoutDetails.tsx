import React, { useState } from 'react';
import { format, parseISO, subDays } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Edit, Trash2, TrendingUp, Calendar } from 'lucide-react';
import { Workout, Exercise } from '../App';

interface WorkoutDetailsProps {
  workout: Workout | undefined;
  date: string;
  workouts: Workout[];
  onEdit: () => void;
  onDelete: (id: string) => void;
  onUpdate: (workoutId: string, updatedWorkout: Omit<Workout, 'id'>) => void;
}

const WorkoutDetails: React.FC<WorkoutDetailsProps> = ({
  workout,
  date,
  workouts,
  onEdit,
  onDelete,
  onUpdate
}) => {
  const [showComparison, setShowComparison] = useState(false);

  const formatDate = (dateStr: string) => {
    return format(parseISO(dateStr), 'dd MMMM yyyy', { locale: tr });
  };

  const getPreviousWorkout = (exerciseName: string) => {
    const sortedWorkouts = workouts
      .filter(w => w.date < date)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    for (const prevWorkout of sortedWorkouts) {
      const exercise = prevWorkout.exercises.find(ex => ex.name === exerciseName);
      if (exercise) {
        return { workout: prevWorkout, exercise };
      }
    }
    return null;
  };

  const getMaxWeight = (exercise: Exercise) => {
    return Math.max(...exercise.sets.map(set => set.weight));
  };

  const getTotalVolume = (exercise: Exercise) => {
    return exercise.sets.reduce((total, set) => total + (set.reps * set.weight), 0);
  };

  const getWorkoutStats = (workout: Workout) => {
    const totalSets = workout.exercises.reduce((total, ex) => total + ex.sets.length, 0);
    const totalVolume = workout.exercises.reduce((total, ex) => total + getTotalVolume(ex), 0);
    const exerciseCount = workout.exercises.length;

    return { totalSets, totalVolume, exerciseCount };
  };

  if (!workout) {
    return (
      <div className="p-4">
        <div className="text-center py-8">
          <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            Bu tarihte antrenman yok
          </h3>
          <p className="text-gray-500 mb-6">
            {formatDate(date)} tarihinde henüz antrenman kaydı bulunmuyor.
          </p>
          <button
            onClick={onEdit}
            className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Antrenman Ekle
          </button>
        </div>
      </div>
    );
  }

  const stats = getWorkoutStats(workout);

  return (
    <div className="p-4">
      {/* Başlık ve tarih */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            {formatDate(date)}
          </h2>
          <p className="text-sm text-gray-600">
            {stats.exerciseCount} hareket • {stats.totalSets} set
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowComparison(!showComparison)}
            className={`p-2 rounded-lg transition-colors ${
              showComparison ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'
            }`}
          >
            <TrendingUp size={20} />
          </button>
          <button
            onClick={onEdit}
            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
          >
            <Edit size={20} />
          </button>
          <button
            onClick={() => {
              if (confirm('Bu antrenmanı silmek istediğinizden emin misiniz?')) {
                onDelete(workout.id);
              }
            }}
            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      {/* İstatistikler */}
      <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
        <h3 className="font-semibold text-gray-800 mb-3">Antrenman İstatistikleri</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-xl font-bold text-blue-600">{stats.exerciseCount}</div>
            <div className="text-xs text-gray-600">Hareket</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-orange-500">{stats.totalSets}</div>
            <div className="text-xs text-gray-600">Toplam Set</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-green-600">{stats.totalVolume.toFixed(0)}</div>
            <div className="text-xs text-gray-600">Volüm (kg)</div>
          </div>
        </div>
      </div>

      {/* Egzersizler */}
      <div className="space-y-4">
        {workout.exercises.map((exercise) => {
          const previousData = getPreviousWorkout(exercise.name);
          const currentMax = getMaxWeight(exercise);
          const currentVolume = getTotalVolume(exercise);
          const previousMax = previousData ? getMaxWeight(previousData.exercise) : 0;
          const previousVolume = previousData ? getTotalVolume(previousData.exercise) : 0;

          return (
            <div key={exercise.id} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800">{exercise.name}</h3>
                {showComparison && previousData && (
                  <div className="text-xs text-gray-500">
                    Son: {formatDate(previousData.workout.date)}
                  </div>
                )}
              </div>

              {/* Set tablosu */}
              <div className="overflow-hidden">
                <div className="grid grid-cols-3 gap-2 text-sm font-medium text-gray-600 mb-2 px-2">
                  <span>Set</span>
                  <span>Tekrar</span>
                  <span>Kg</span>
                </div>
                
                {exercise.sets.map((set, setIndex) => (
                  <div key={setIndex} className="grid grid-cols-3 gap-2 py-2 px-2 bg-gray-50 rounded-lg mb-1">
                    <span className="text-center font-medium text-gray-700">
                      {setIndex + 1}
                    </span>
                    <span className="text-center">{set.reps}</span>
                    <span className="text-center font-medium">{set.weight} kg</span>
                  </div>
                ))}
              </div>

              {/* Karşılaştırma */}
              {showComparison && (
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600 mb-1">Maks Ağırlık</div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{currentMax} kg</span>
                        {previousMax > 0 && (
                          <span className={`text-xs ${
                            currentMax > previousMax ? 'text-green-600' : 
                            currentMax < previousMax ? 'text-red-500' : 'text-gray-500'
                          }`}>
                            ({currentMax > previousMax ? '+' : ''}{(currentMax - previousMax).toFixed(1)})
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600 mb-1">Toplam Volüm</div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{currentVolume.toFixed(0)} kg</span>
                        {previousVolume > 0 && (
                          <span className={`text-xs ${
                            currentVolume > previousVolume ? 'text-green-600' : 
                            currentVolume < previousVolume ? 'text-red-500' : 'text-gray-500'
                          }`}>
                            ({currentVolume > previousVolume ? '+' : ''}{(currentVolume - previousVolume).toFixed(0)})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {previousData && (
                    <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                      <div className="text-xs text-blue-700 font-medium mb-1">
                        Önceki Antrenman ({formatDate(previousData.workout.date)})
                      </div>
                      <div className="text-xs text-blue-600">
                        {previousData.exercise.sets.length} set • 
                        Maks: {previousMax} kg • 
                        Volüm: {previousVolume.toFixed(0)} kg
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorkoutDetails;