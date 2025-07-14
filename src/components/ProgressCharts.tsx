import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Workout } from '../App';

interface ProgressChartsProps {
  workouts: Workout[];
}

const ProgressCharts: React.FC<ProgressChartsProps> = ({ workouts }) => {
  const [selectedExercise, setSelectedExercise] = useState<string>('');

  // Tüm egzersizleri al
  const allExercises = useMemo(() => {
    const exerciseSet = new Set<string>();
    workouts.forEach(workout => {
      workout.exercises.forEach(exercise => {
        exerciseSet.add(exercise.name);
      });
    });
    return Array.from(exerciseSet).sort();
  }, [workouts]);

  // Seçili egzersiz için veri hazırla
  const exerciseData = useMemo(() => {
    if (!selectedExercise) return [];

    return workouts
      .filter(workout => 
        workout.exercises.some(ex => ex.name === selectedExercise)
      )
      .map(workout => {
        const exercise = workout.exercises.find(ex => ex.name === selectedExercise)!;
        const maxWeight = Math.max(...exercise.sets.map(set => set.weight));
        const totalVolume = exercise.sets.reduce((total, set) => total + (set.reps * set.weight), 0);
        const totalSets = exercise.sets.length;
        const avgReps = exercise.sets.reduce((total, set) => total + set.reps, 0) / exercise.sets.length;

        return {
          date: workout.date,
          dateFormatted: format(parseISO(workout.date), 'dd MMM', { locale: tr }),
          maxWeight,
          totalVolume,
          totalSets,
          avgReps: Math.round(avgReps * 10) / 10
        };
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [workouts, selectedExercise]);

  // Genel istatistikler
  const generalStats = useMemo(() => {
    const sortedWorkouts = [...workouts].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return sortedWorkouts.map(workout => {
      const totalVolume = workout.exercises.reduce((total, exercise) => 
        total + exercise.sets.reduce((exTotal, set) => exTotal + (set.reps * set.weight), 0), 0
      );
      const totalSets = workout.exercises.reduce((total, exercise) => total + exercise.sets.length, 0);
      const exerciseCount = workout.exercises.length;

      return {
        date: workout.date,
        dateFormatted: format(parseISO(workout.date), 'dd MMM', { locale: tr }),
        totalVolume,
        totalSets,
        exerciseCount
      };
    });
  }, [workouts]);

  if (workouts.length === 0) {
    return (
      <div className="p-4">
        <div className="text-center py-8">
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            Henüz veri yok
          </h3>
          <p className="text-gray-500">
            Grafikleri görmek için önce antrenman kayıtları eklemelisiniz.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Genel İstatistikler */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-4">Genel İlerleme</h3>
        
        {/* Toplam Volüm Grafiği */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Toplam Volüm (kg)</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={generalStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="dateFormatted" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  labelFormatter={(label) => `Tarih: ${label}`}
                  formatter={(value: number) => [`${value.toFixed(0)} kg`, 'Toplam Volüm']}
                />
                <Line 
                  type="monotone" 
                  dataKey="totalVolume" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Set Sayısı Grafiği */}
        <div>
          <h4 className="text-sm font-medium text-gray-600 mb-2">Toplam Set Sayısı</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={generalStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="dateFormatted" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  labelFormatter={(label) => `Tarih: ${label}`}
                  formatter={(value: number) => [value, 'Toplam Set']}
                />
                <Bar 
                  dataKey="totalSets" 
                  fill="#F97316"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Hareket Bazlı İstatistikler */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-4">Hareket Bazlı İlerleme</h3>
        
        {/* Hareket Seçimi */}
        <div className="mb-4">
          <select
            value={selectedExercise}
            onChange={(e) => setSelectedExercise(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Hareket seçin</option>
            {allExercises.map(exercise => (
              <option key={exercise} value={exercise}>
                {exercise}
              </option>
            ))}
          </select>
        </div>

        {selectedExercise && exerciseData.length > 0 && (
          <div className="space-y-6">
            {/* Maksimum Ağırlık */}
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-2">
                Maksimum Ağırlık - {selectedExercise}
              </h4>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={exerciseData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="dateFormatted" 
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      labelFormatter={(label) => `Tarih: ${label}`}
                      formatter={(value: number) => [`${value} kg`, 'Maks Ağırlık']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="maxWeight" 
                      stroke="#10B981" 
                      strokeWidth={2}
                      dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Volüm */}
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-2">
                Toplam Volüm - {selectedExercise}
              </h4>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={exerciseData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="dateFormatted" 
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      labelFormatter={(label) => `Tarih: ${label}`}
                      formatter={(value: number) => [`${value.toFixed(0)} kg`, 'Toplam Volüm']}
                    />
                    <Bar 
                      dataKey="totalVolume" 
                      fill="#8B5CF6"
                      radius={[2, 2, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Özet istatistikler */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  {Math.max(...exerciseData.map(d => d.maxWeight))} kg
                </div>
                <div className="text-sm text-gray-600">En Yüksek Ağırlık</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">
                  {exerciseData.length}
                </div>
                <div className="text-sm text-gray-600">Toplam Antrenman</div>
              </div>
            </div>
          </div>
        )}

        {selectedExercise && exerciseData.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            Bu hareket için henüz veri bulunmuyor.
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressCharts;