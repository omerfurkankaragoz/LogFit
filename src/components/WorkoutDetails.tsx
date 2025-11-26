// src/components/WorkoutDetails.tsx
import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Edit, Trash2, TrendingUp, Calendar as CalendarIcon, ArrowLeft, Clock } from 'lucide-react';
import { Workout, Exercise } from '../App';

interface WorkoutDetailsProps {
  workout: Workout | undefined;
  date: string;
  workouts: Workout[];
  onEdit: () => void;
  onDelete: (id: string) => void;
  onCancel: () => void;
}

const WorkoutDetails: React.FC<WorkoutDetailsProps> = ({
  workout,
  date,
  workouts,
  onEdit,
  onDelete,
  onCancel
}) => {
  const [showComparison, setShowComparison] = useState(false);

  const formatDate = (dateStr: string) => {
    return format(parseISO(dateStr), 'dd MMMM yyyy', { locale: tr });
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return null;
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}sa ${m}dk`;
    return `${m}dk`;
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
    if (exercise.sets.length === 0) return 0;
    return Math.max(...exercise.sets.map(set => set.weight));
  };

  const getTotalVolume = (exercise: Exercise) => {
    return exercise.sets.reduce((total, set) => total + (set.reps * set.weight), 0);
  };

  const getWorkoutStats = (w: Workout) => {
    const exercisesWithData = w.exercises.filter(ex => ex.sets.length > 0);
    const totalSets = exercisesWithData.reduce((total, ex) => total + ex.sets.length, 0);
    const totalVolume = exercisesWithData.reduce((total, ex) => total + getTotalVolume(ex), 0);
    const exerciseCount = exercisesWithData.length;
    return { totalSets, totalVolume, exerciseCount };
  };

  if (!workout) {
    return (
      <div className="p-4">
        <div className="flex justify-between items-center pt-4">
          <button onClick={onCancel} className="text-system-blue text-lg">Geri</button>
          <div className="w-10"></div>
        </div>
        <div className="text-center py-16 px-4 bg-system-background-secondary rounded-xl mt-6">
          <CalendarIcon size={40} className="mx-auto text-system-label-tertiary mb-4" />
          <h3 className="text-lg font-semibold text-system-label mb-1">Antrenman Yok</h3>
          <p className="text-system-label-secondary text-sm mb-6">
            {formatDate(date)} tarihinde kayıtlı bir antrenman bulunmuyor.
          </p>
          <button
            onClick={onEdit}
            className="bg-system-blue text-white py-2 px-5 rounded-lg font-semibold"
          >
            Antrenman Ekle
          </button>
        </div>
      </div>
    );
  }

  const stats = getWorkoutStats(workout);
  const exercisesToShow = workout.exercises.filter(ex => ex.sets && ex.sets.length > 0);

  if (exercisesToShow.length === 0) {
    return (
      <div className="p-4">
        <div className="flex justify-between items-center pt-4">
          <button onClick={onCancel} className="text-system-blue text-lg">Geri</button>
          <div className="w-10"></div>
        </div>
        <div className="text-center py-16 px-4 bg-system-background-secondary rounded-xl mt-6">
          <CalendarIcon size={40} className="mx-auto text-system-label-tertiary mb-4" />
          <h3 className="text-lg font-semibold text-system-label mb-1">
            Henüz Veri Girilmedi
          </h3>
          <p className="text-system-label-secondary text-sm mb-6">
            Bu antrenmanda henüz set bilgisi girilmiş bir hareket yok.
          </p>
          <button
            onClick={onEdit}
            className="bg-system-blue text-white py-2 px-5 rounded-lg font-semibold flex items-center gap-2 mx-auto"
          >
            <Edit size={18} /> Antrenmana Devam Et
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-6">
      {/* Sayfa Başlığı ve Butonlar */}
      <div className="flex justify-between items-center pt-4">
        <button onClick={onCancel} className="text-system-blue text-lg p-2 -ml-2">
          <ArrowLeft size={24} />
        </button>
        <div className="flex flex-col items-center">
          <h1 className="text-xl font-bold text-system-label capitalize">
            {formatDate(date)}
          </h1>
          {/* SÜRE GÖSTERİMİ EKLENDİ */}
          {workout.duration && (
            <div className="flex items-center gap-1 text-xs text-system-label-secondary mt-1">
              <Clock size={12} />
              <span>{formatDuration(workout.duration)}</span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button onClick={onEdit} className="p-2 bg-system-fill rounded-full text-system-blue"> <Edit size={20} /> </button>
          <button onClick={() => { if (confirm('Bu antrenmanı silmek istediğinizden emin misiniz?')) { onDelete(workout.id); } }} className="p-2 bg-system-fill rounded-full text-system-red"> <Trash2 size={20} /> </button>
        </div>
      </div>

      {/* İstatistikler Kartı */}
      <div className="bg-system-background-secondary rounded-xl p-4">
        <h2 className="font-semibold text-system-label mb-3">Genel İstatistikler</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-system-blue">{stats.exerciseCount}</div>
            <div className="text-xs text-system-label-secondary">Hareket</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-system-orange">{stats.totalSets}</div>
            <div className="text-xs text-system-label-secondary">Toplam Set</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-system-green">{stats.totalVolume.toFixed(0)}</div>
            <div className="text-xs text-system-label-secondary">Hacim (kg)</div>
          </div>
        </div>
      </div>

      {/* Hareketler Başlığı ve Karşılaştırma Butonu */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-system-label">Hareketler</h2>
        <button
          onClick={() => setShowComparison(!showComparison)}
          className={`p-2 rounded-full transition-colors ${showComparison ? 'bg-system-orange text-white' : 'bg-system-fill text-system-orange'
            }`}
        >
          <TrendingUp size={20} />
        </button>
      </div>

      {/* Hareket Listesi */}
      <div className="space-y-4">
        {exercisesToShow.map((exercise) => {
          const previousData = getPreviousWorkout(exercise.name);
          const currentMax = getMaxWeight(exercise);
          const currentVolume = getTotalVolume(exercise);
          const previousMax = previousData ? getMaxWeight(previousData.exercise) : 0;
          const previousVolume = previousData ? getTotalVolume(previousData.exercise) : 0;

          return (
            <div key={exercise.id} className="bg-system-background-secondary rounded-xl overflow-hidden">
              <div className="p-4">
                <h3 className="font-semibold text-system-label">{exercise.name}</h3>
                {showComparison && previousData && (
                  <div className="text-xs text-system-label-secondary mt-1">
                    Önceki: {formatDate(previousData.workout.date)}
                  </div>
                )}
              </div>

              {/* Set Tablosu */}
              <div className="px-4 pb-4">
                <div className="grid grid-cols-3 gap-2 text-sm text-center font-medium text-system-label-secondary mb-2">
                  <span>Set</span>
                  <span>Tekrar</span>
                  <span>Kg</span>
                </div>
                {exercise.sets.map((set, setIndex) => (
                  <div key={setIndex} className="grid grid-cols-3 gap-2 py-2 text-center bg-system-background-tertiary rounded-lg mb-1">
                    <span className="font-medium text-system-label-secondary">{setIndex + 1}</span>
                    <span className="text-system-label">{set.reps}</span>
                    <span className="font-medium text-system-label">{set.weight} kg</span>
                  </div>
                ))}
              </div>

              {/* Karşılaştırma Bölümü */}
              {showComparison && (
                <div className="border-t border-system-separator p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-system-label-secondary mb-1">Maks Ağırlık</div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-system-label">{currentMax} kg</span>
                        {previousMax > 0 && (
                          <span className={`text-xs font-semibold ${currentMax > previousMax ? 'text-system-green' :
                            currentMax < previousMax ? 'text-system-red' : 'text-system-label-secondary'
                            }`}>
                            ({currentMax > previousMax ? '+' : ''}{(currentMax - previousMax).toFixed(1)})
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-system-label-secondary mb-1">Toplam Hacim</div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-system-label">{currentVolume.toFixed(0)} kg</span>
                        {previousVolume > 0 && (
                          <span className={`text-xs font-semibold ${currentVolume > previousVolume ? 'text-system-green' :
                            currentVolume < previousVolume ? 'text-system-red' : 'text-system-label-secondary'
                            }`}>
                            ({currentVolume > previousVolume ? '+' : ''}{(currentVolume - previousVolume).toFixed(0)})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
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