// src/components/ProgressCharts.tsx

import React, { useState, useMemo } from 'react';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    BarChart, Bar,
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { format, parseISO, subDays, subMonths, subYears, isAfter } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Workout } from '../App';

type TimeRange = 'week' | 'month' | 'year' | 'all';

const CustomTooltip = ({ active, payload, label }: any) => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    const tooltipBg = isDarkMode ? 'rgba(45, 55, 72, 0.9)' : 'rgba(255, 255, 255, 0.9)';
    const tooltipText = isDarkMode ? '#E2E8F0' : '#374151';
    const tooltipBorder = isDarkMode ? '#4A5568' : '#e5e7eb';

    if (active && payload && payload.length) {
        // Radar grafik için tooltip
        if (payload[0].payload.subject) {
            const { subject, value } = payload[0].payload;
            return (
                 <div style={{ backgroundColor: tooltipBg, backdropFilter: 'blur(5px)', border: `1px solid ${tooltipBorder}`, borderRadius: '0.75rem', padding: '0.75rem 1rem', boxShadow: '0 6px 12px -2px rgba(0, 0, 0, 0.1), 0 3px 7px -3px rgba(0, 0, 0, 0.1)' }}>
                    <p style={{ color: payload[0].color, fontWeight: 'bold' }}>{subject}: {value.toFixed(0)} kg</p>
                </div>
            )
        }
        
        // Diğer grafikler
        return (
            <div style={{ backgroundColor: tooltipBg, backdropFilter: 'blur(5px)', border: `1px solid ${tooltipBorder}`, borderRadius: '0.75rem', padding: '0.75rem 1rem', boxShadow: '0 6px 12px -2px rgba(0, 0, 0, 0.1), 0 3px 7px -3px rgba(0, 0, 0, 0.1)' }}>
                <p style={{ color: tooltipText, fontWeight: 'bold', marginBottom: '0.4rem' }}>{`Tarih: ${label}`}</p>
                {payload.map((pld: any, index: number) => (
                    <p key={index} style={{ color: pld.color, fontWeight: 500, fontSize: '0.9rem' }}>
                        {`${pld.name}: ${pld.value}${pld.unit || ''}`}
                    </p>
                ))}
            </div>
        );
    }

    return null;
};

// Detaylı kas gruplarını ana gruplara eşleyen fonksiyon (Sizin istediğiniz haliyle)
const mapToMajorGroup = (bodyPart: string): string => {
    if (!bodyPart) return 'Diğer';
    const lowerCaseBodyPart = bodyPart.toLowerCase();

    if (['chest'].includes(lowerCaseBodyPart)) return 'Göğüs';
    if (['back', 'lats'].includes(lowerCaseBodyPart)) return 'Sırt';
    if (['shoulders'].includes(lowerCaseBodyPart)) return 'Omuz';
    if (['upper arms', 'lower arms', 'biceps'].includes(lowerCaseBodyPart)) return 'Ön Kol';
    if (['triceps'].includes(lowerCaseBodyPart)) return 'Arka Kol';
    if (['upper legs', 'lower legs', 'quadriceps', 'hamstrings', 'glutes'].includes(lowerCaseBodyPart)) return 'Bacak';
    if (['waist', 'abdominals'].includes(lowerCaseBodyPart)) return 'Karın';
    
    return 'Diğer';
};


const ProgressCharts: React.FC<{ workouts: Workout[] }> = ({ workouts }) => {
  const [selectedExercise, setSelectedExercise] = useState<string>('');
  const [timeRange, setTimeRange] = useState<TimeRange>('all');
  const isDarkMode = document.documentElement.classList.contains('dark');

  const chartStyles = {
    gridColor: isDarkMode ? '#374151' : '#e5e7eb',
    tickColor: isDarkMode ? '#A0AEC0' : '#6b7280',
    axisLineColor: isDarkMode ? '#4A5568' : '#D1D5DB',
  };

  const filteredWorkouts = useMemo(() => {
    if (timeRange === 'all') return workouts;
    const now = new Date();
    let startDate: Date;
    switch(timeRange) {
        case 'week': startDate = subDays(now, 7); break;
        case 'month': startDate = subMonths(now, 1); break;
        case 'year': startDate = subYears(now, 1); break;
        default: startDate = new Date(0);
    }
    return workouts.filter(w => isAfter(parseISO(w.date), startDate));
  }, [workouts, timeRange]);

  const allExercises = useMemo(() => {
    const exerciseSet = new Set<string>();
    filteredWorkouts.forEach(w => w.exercises.forEach(ex => exerciseSet.add(ex.name)));
    return Array.from(exerciseSet).sort();
  }, [filteredWorkouts]);

  const exerciseData = useMemo(() => {
    if (!selectedExercise) return [];
    return filteredWorkouts
      .filter(w => w.exercises.some(ex => ex.name === selectedExercise))
      .map(w => {
        const exercise = w.exercises.find(ex => ex.name === selectedExercise)!;
        return {
          date: w.date,
          dateFormatted: format(parseISO(w.date), 'dd MMM', { locale: tr }),
          maxWeight: Math.max(0, ...exercise.sets.map(s => s.weight)),
          totalVolume: exercise.sets.reduce((sum, s) => sum + s.reps * s.weight, 0),
        };
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [filteredWorkouts, selectedExercise]);
  
  const generalStats = useMemo(() => {
    return filteredWorkouts
      .map(w => ({
        date: w.date,
        dateFormatted: format(parseISO(w.date), 'dd MMM', { locale: tr }),
        totalVolume: w.exercises.reduce((sum, ex) => sum + ex.sets.reduce((exSum, s) => exSum + s.reps * s.weight, 0), 0),
        totalSets: w.exercises.reduce((sum, ex) => sum + ex.sets.length, 0),
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [filteredWorkouts]);

  const radarChartData = useMemo(() => {
    // Sizin istediğiniz haliyle, Ön Kol/Arka Kol ayrımıyla
    const distribution: { [key: string]: number } = {
        'Göğüs': 0, 'Sırt': 0, 'Omuz': 0, 'Arka Kol': 0,'Ön Kol': 0, 'Bacak': 0, 'Karın': 0
    };

    filteredWorkouts.forEach(workout => {
        workout.exercises.forEach(exercise => {
            const volume = exercise.sets.reduce((sum, set) => sum + (set.reps * set.weight), 0);
            const majorGroup = mapToMajorGroup(exercise.bodyPart || 'Diğer');
            if (distribution.hasOwnProperty(majorGroup)) {
                distribution[majorGroup] += volume;
            }
        });
    });

    const data = Object.entries(distribution).map(([subject, value]) => ({ subject, value }));
    const maxValue = Math.max(...data.map(d => d.value));

    return {
        data: data.map(d => ({...d, fullMark: maxValue > 0 ? maxValue * 1.2 : 100 })),
        hasData: maxValue > 0
    };
  }, [filteredWorkouts]);
  
  
  const FilterButtons = () => {
      const ranges: { key: TimeRange; label: string }[] = [
          { key: 'week', label: 'Haftalık' },
          { key: 'month', label: 'Aylık' },
          { key: 'year', label: 'Yıllık' },
          { key: 'all', label: 'Tümü' },
      ];
      return (
          <div className="bg-gray-100 dark:bg-gray-700/50 p-1 rounded-xl flex items-center justify-center space-x-1 mb-6">
              {ranges.map(range => (
                  <button
                      key={range.key}
                      onClick={() => setTimeRange(range.key)}
                      className={`w-full px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${timeRange === range.key ? 'bg-white text-blue-600 shadow-md dark:bg-gray-800 dark:text-blue-400' : 'text-gray-600 hover:bg-gray-200/50 dark:text-gray-300 dark:hover:bg-gray-600/50'}`}>
                      {range.label}
                  </button>
              ))}
          </div>
      );
  };

  if (workouts.length === 0) {
    return <div className="p-4"><div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700"><h3 className="text-xl font-medium text-gray-600 dark:text-gray-300 mb-2">Henüz veri yok</h3><p className="text-gray-500 dark:text-gray-400 text-md">Grafikleri görmek için önce antrenman kayıtları eklemelisiniz.</p></div></div>;
  }

  return (
    <div className="p-4 space-y-6">
      <FilterButtons />

      {filteredWorkouts.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-medium text-gray-600 dark:text-gray-300 mb-2">Seçili Aralıkta Veri Yok</h3>
              <p className="text-gray-500 dark:text-gray-400 text-md">Lütfen farklı bir zaman aralığı seçin veya yeni antrenman ekleyin.</p>
          </div>
      ) : (
        <>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                <h3 className="font-bold text-xl text-gray-800 dark:text-gray-100 mb-4">Genel İlerleme</h3>
                
                {/* DÜZELTME BURADA: Grafiklerin sırası değiştirildi */}
                {radarChartData.hasData && (
                <div className="mb-8">
                    <h4 className="text-md font-medium text-gray-600 dark:text-gray-300 mb-3">Kas Grubu Dağılımı (Hacme Göre)</h4>
                    <div className="h-80 w-full"><ResponsiveContainer>
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarChartData.data}>
                            <PolarGrid stroke={chartStyles.gridColor} />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: chartStyles.tickColor, fontSize: 14 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 'dataMax']} tick={false} axisLine={false} />
                            <Radar name="Hacim" dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                            <Tooltip content={<CustomTooltip />} />
                        </RadarChart>
                    </ResponsiveContainer></div>
                </div>
                )}
                
                <div className="mb-6"><h4 className="text-md font-medium text-gray-600 dark:text-gray-300 mb-3">Toplam Volüm (kg)</h4><div className="h-56"><ResponsiveContainer width="100%" height="100%"><LineChart data={generalStats}><CartesianGrid strokeDasharray="3 3" stroke={chartStyles.gridColor} /><XAxis dataKey="dateFormatted" tick={{ fontSize: 12, fill: chartStyles.tickColor }} axisLine={{ stroke: chartStyles.axisLineColor }} tickLine={{ stroke: chartStyles.tickColor }} /><YAxis tick={{ fontSize: 12, fill: chartStyles.tickColor }} axisLine={{ stroke: chartStyles.axisLineColor }} tickLine={{ stroke: chartStyles.tickColor }} /><Tooltip content={<CustomTooltip />} /><Line type="monotone" dataKey="totalVolume" name="Toplam Volüm" unit=" kg" stroke="#3B82F6" strokeWidth={3} dot={{ fill: '#3B82F6', r: 5 }} activeDot={{ r: 7 }} /></LineChart></ResponsiveContainer></div></div>
                
                <div className="mb-8"><h4 className="text-md font-medium text-gray-600 dark:text-gray-300 mb-3">Toplam Set Sayısı</h4><div className="h-56"><ResponsiveContainer width="100%" height="100%"><BarChart data={generalStats}><CartesianGrid strokeDasharray="3 3" stroke={chartStyles.gridColor} /><XAxis dataKey="dateFormatted" tick={{ fontSize: 12, fill: chartStyles.tickColor }} axisLine={{ stroke: chartStyles.axisLineColor }} tickLine={{ stroke: chartStyles.tickColor }} /><YAxis tick={{ fontSize: 12, fill: chartStyles.tickColor }} allowDecimals={false} axisLine={{ stroke: chartStyles.axisLineColor }} tickLine={{ stroke: chartStyles.tickColor }} /><Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(249, 115, 22, 0.1)'}}/><Bar dataKey="totalSets" name="Toplam Set" unit=" set" radius={[6, 6, 0, 0]} barSize={20} fill="#F97316" /></BarChart></ResponsiveContainer></div></div>

            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                <h3 className="font-bold text-xl text-gray-800 dark:text-gray-100 mb-4">Hareket Bazlı İlerleme</h3>
                <div className="mb-4"><select value={selectedExercise} onChange={(e) => setSelectedExercise(e.target.value)} className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-base"><option value="">Hareket seçin</option>{allExercises.map(exercise => (<option key={exercise} value={exercise}>{exercise}</option>))}</select></div>
                {selectedExercise && exerciseData.length > 0 ? (
                <div className="space-y-6">
                    <div><h4 className="text-md font-medium text-gray-600 dark:text-gray-300 mb-3">Maksimum Ağırlık - {selectedExercise}</h4><div className="h-56"><ResponsiveContainer width="100%" height="100%"><LineChart data={exerciseData}><CartesianGrid strokeDasharray="3 3" stroke={chartStyles.gridColor} /><XAxis dataKey="dateFormatted" tick={{ fontSize: 12, fill: chartStyles.tickColor }} axisLine={{ stroke: chartStyles.axisLineColor }} tickLine={{ stroke: chartStyles.tickColor }} /><YAxis type="number" domain={['dataMin - 5', 'dataMax + 5']} tick={{ fontSize: 12, fill: chartStyles.tickColor }} axisLine={{ stroke: chartStyles.axisLineColor }} tickLine={{ stroke: chartStyles.tickColor }} /><Tooltip content={<CustomTooltip />} /><Line type="monotone" dataKey="maxWeight" name="Maks Ağırlık" unit=" kg" stroke="#10B981" strokeWidth={3} dot={{ fill: '#10B981', r: 5 }} activeDot={{ r: 7 }} /></LineChart></ResponsiveContainer></div></div>
                    <div><h4 className="text-md font-medium text-gray-600 dark:text-gray-300 mb-3">Toplam Volüm - {selectedExercise}</h4><div className="h-56"><ResponsiveContainer width="100%" height="100%"><BarChart data={exerciseData}><CartesianGrid strokeDasharray="3 3" stroke={chartStyles.gridColor} /><XAxis dataKey="dateFormatted" tick={{ fontSize: 12, fill: chartStyles.tickColor }} axisLine={{ stroke: 'transparent' }} tickLine={{ stroke: 'transparent' }} /><YAxis tick={{ fontSize: 12, fill: chartStyles.tickColor }} axisLine={{ stroke: 'transparent' }} tickLine={{ stroke: 'transparent' }} /><Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(139, 92, 246, 0.1)'}}/><Bar dataKey="totalVolume" name="Toplam Volüm" unit=" kg" radius={[6, 6, 0, 0]} barSize={20} fill="#8B5CF6"/></BarChart></ResponsiveContainer></div></div>
                </div>
                ) : selectedExercise && exerciseData.length === 0 ? (<div className="text-center py-4 text-gray-500 dark:text-gray-500 text-md">Bu hareket için seçili aralıkta veri bulunmuyor.</div>) : (<div className="text-center py-4 text-gray-500 dark:text-gray-500 text-md">Yukarıdan bir hareket seçerek ilerlemenizi görüntüleyin.</div>)}
            </div>
        </>
      )}
    </div>
  );
};

export default ProgressCharts;