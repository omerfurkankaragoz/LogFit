import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Workout } from '../App';

interface ProgressChartsProps {
  workouts: Workout[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    const tooltipBg = isDarkMode ? 'rgba(45, 55, 72, 0.8)' : 'rgba(255, 255, 255, 0.8)';
    const tooltipText = isDarkMode ? '#E2E8F0' : '#374151';
    const tooltipBorder = isDarkMode ? '#4A5568' : '#e5e7eb';

    if (active && payload && payload.length) {
        return (
            <div style={{ backgroundColor: tooltipBg, backdropFilter: 'blur(5px)', border: `1px solid ${tooltipBorder}`, borderRadius: '0.5rem', padding: '0.5rem 1rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)' }}>
                <p style={{ color: tooltipText, fontWeight: 'bold', marginBottom: '0.25rem' }}>{`Tarih: ${label}`}</p>
                {payload.map((pld: any, index: number) => (
                    <p key={index} style={{ color: pld.color, fontWeight: 500 }}>
                        {`${pld.name}: ${pld.value}${pld.unit || ''}`}
                    </p>
                ))}
            </div>
        );
    }

    return null;
};


const ProgressCharts: React.FC<ProgressChartsProps> = ({ workouts }) => {
  const [selectedExercise, setSelectedExercise] = useState<string>('');
  const isDarkMode = document.documentElement.classList.contains('dark');

  const chartStyles = {
    gridColor: isDarkMode ? '#374151' : '#e5e7eb',
    tickColor: isDarkMode ? '#A0AEC0' : '#6b7280',
  };

  const allExercises = useMemo(() => {
    const exerciseSet = new Set<string>();
    workouts.forEach(workout => {
      workout.exercises.forEach(exercise => {
        exerciseSet.add(exercise.name);
      });
    });
    return Array.from(exerciseSet).sort();
  }, [workouts]);

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

        return {
          date: workout.date,
          dateFormatted: format(parseISO(workout.date), 'dd MMM', { locale: tr }),
          maxWeight,
          totalVolume,
        };
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [workouts, selectedExercise]);

  const generalStats = useMemo(() => {
    const sortedWorkouts = [...workouts].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return sortedWorkouts.map(workout => {
      const totalVolume = workout.exercises.reduce((total, exercise) =>
        total + exercise.sets.reduce((exTotal, set) => exTotal + (set.reps * set.weight), 0), 0
      );
      const totalSets = workout.exercises.reduce((total, exercise) => total + exercise.sets.length, 0);

      return {
        date: workout.date,
        dateFormatted: format(parseISO(workout.date), 'dd MMM', { locale: tr }),
        totalVolume,
        totalSets,
      };
    });
  }, [workouts]);

  if (workouts.length === 0) {
    return (
      <div className="p-4">
        <div className="text-center py-8">
          <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">Henüz veri yok</h3>
          <p className="text-gray-500 dark:text-gray-500">Grafikleri görmek için önce antrenman kayıtları eklemelisiniz.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Genel İlerleme</h3>
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Toplam Volüm (kg)</h4>
          <div className="h-48" style={{outline: 'none'}} tabIndex={-1}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={generalStats}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartStyles.gridColor} />
                <XAxis dataKey="dateFormatted" tick={{ fontSize: 12, fill: chartStyles.tickColor }} />
                <YAxis tick={{ fontSize: 12, fill: chartStyles.tickColor }} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="totalVolume" name="Toplam Volüm" unit=" kg" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Toplam Set Sayısı</h4>
          <div className="h-48" style={{outline: 'none'}} tabIndex={-1}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={generalStats}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartStyles.gridColor} />
                <XAxis dataKey="dateFormatted" tick={{ fontSize: 12, fill: chartStyles.tickColor }} />
                <YAxis tick={{ fontSize: 12, fill: chartStyles.tickColor }} allowDecimals={false}/>
                <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}}/>
                <Bar dataKey="totalSets" name="Toplam Set" radius={[4, 4, 0, 0]}>
                   {generalStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="#F97316" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Hareket Bazlı İlerleme</h3>
        <div className="mb-4">
          <select value={selectedExercise} onChange={(e) => setSelectedExercise(e.target.value)} className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200">
            <option value="">Hareket seçin</option>
            {allExercises.map(exercise => (<option key={exercise} value={exercise}>{exercise}</option>))}
          </select>
        </div>
        {selectedExercise && exerciseData.length > 0 && (
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Maksimum Ağırlık - {selectedExercise}</h4>
              <div className="h-48" style={{outline: 'none'}} tabIndex={-1}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={exerciseData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartStyles.gridColor} />
                    <XAxis dataKey="dateFormatted" tick={{ fontSize: 12, fill: chartStyles.tickColor }} />
                    <YAxis tick={{ fontSize: 12, fill: chartStyles.tickColor }} domain={['dataMin - 5', 'dataMax + 5']} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="maxWeight" name="Maks Ağırlık" unit=" kg" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981', r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Toplam Volüm - {selectedExercise}</h4>
              <div className="h-48" style={{outline: 'none'}} tabIndex={-1}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={exerciseData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartStyles.gridColor} />
                    <XAxis dataKey="dateFormatted" tick={{ fontSize: 12, fill: chartStyles.tickColor }} />
                    <YAxis tick={{ fontSize: 12, fill: chartStyles.tickColor }} />
                    <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}}/>
                     <Bar dataKey="totalVolume" name="Toplam Volüm" unit=" kg" radius={[4, 4, 0, 0]} >
                       {exerciseData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill="#8B5CF6" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
        {selectedExercise && exerciseData.length === 0 && (
          <div className="text-center py-4 text-gray-500 dark:text-gray-500">Bu hareket için henüz veri bulunmuyor.</div>
        )}
      </div>
    </div>
  );
};

export default ProgressCharts;