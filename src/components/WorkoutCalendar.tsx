// src/components/WorkoutCalendar.tsx

import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, parseISO, startOfWeek, endOfWeek } from 'date-fns';
import { tr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Dumbbell } from 'lucide-react';
import { Workout } from '../App';

interface WorkoutCalendarProps {
  workouts: Workout[];
  onDateSelect: (date: string) => void;
  // 5. MADDE İÇİN GÜNCELLENDİ: onStartWorkout prop'u
  onStartWorkout: () => void;
}

const WorkoutCalendar: React.FC<WorkoutCalendarProps> = ({ workouts, onDateSelect, onStartWorkout }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startOfCalendar = startOfWeek(monthStart, { locale: tr, weekStartsOn: 1 });
  const endOfCalendar = endOfWeek(monthEnd, { locale: tr, weekStartsOn: 1 });
  const monthDays = eachDayOfInterval({ start: startOfCalendar, end: endOfCalendar });
  const workoutDates = new Set(workouts.map(w => w.date));

  // O güne ait antrenman olup olmadığını kontrol etmek için mantık
  const todayStr = new Date().toISOString().split('T')[0];
  const workoutForToday = workouts.find(w => w.date === todayStr);

  const handlePrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1));
  };

  const handleDateClick = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    onDateSelect(dateStr);
  };

  return (
    <div className="p-4">
      {/* Ay navigasyonu */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handlePrevMonth}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
        >
          <ChevronLeft size={24} className="text-gray-800 dark:text-gray-200" />
        </button>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: tr })}
        </h2>
        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
        >
          <ChevronRight size={24} className="text-gray-800 dark:text-gray-200" />
        </button>
      </div>

      {/* Haftanın günleri */}
      <div className="grid grid-cols-7 mb-2">
        {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Takvim günleri */}
      <div className="grid grid-cols-7 gap-1">
        {monthDays.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const hasWorkout = workoutDates.has(dateStr);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isCurrentDay = isToday(day);

          return (
            <button
              key={dateStr}
              onClick={() => handleDateClick(day)}
              className={`
                aspect-square p-2 rounded-xl text-lg font-medium transition-all duration-200 ease-in-out
                flex flex-col items-center justify-center relative
                ${isCurrentMonth ? 'text-gray-800 dark:text-gray-100' : 'text-gray-400 dark:text-gray-600'}
                ${isCurrentDay ? 'bg-blue-100 dark:bg-blue-900 ring-2 ring-blue-500 dark:ring-blue-400' : ''}
                ${!isCurrentDay && hasWorkout ? 'bg-green-100 dark:bg-green-900/50' : ''}
                hover:bg-gray-100 dark:hover:bg-gray-700
                active:scale-95
              `}
            >
              <span>{format(day, 'd')}</span>
              {hasWorkout && (
                <div className="absolute bottom-1.5 w-1.5 h-1.5 bg-green-500 dark:bg-green-400 rounded-full"></div>
              )}
            </button>
          );
        })}
      </div>

      {/* 5. MADDE İÇİN GÜNCELLENDİ: "Antrenmana Başla" butonu */}
      <div className="mt-8">
        <button
          onClick={onStartWorkout}
          className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-blue-600 text-white rounded-2xl font-semibold text-lg shadow-lg hover:bg-blue-700 transition-all duration-300 ease-in-out active:scale-95 transform hover:-translate-y-1"
        >
          <Dumbbell size={22} />
          {/* Buton metni o güne ait antrenman olup olmamasına göre değişir */}
          {workoutForToday ? 'Antrenmana Devam Et' : 'Antrenmana Başla'}
        </button>
      </div>

      {/* İstatistikler */}
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Bu Ayın Özeti</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {workouts.filter(w => 
                format(parseISO(w.date), 'yyyy-MM') === format(currentMonth, 'yyyy-MM')
              ).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Toplam Antrenman</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-500 dark:text-orange-400">
              {workouts.filter(w => 
                format(parseISO(w.date), 'yyyy-MM') === format(currentMonth, 'yyyy-MM')
              ).reduce((total, workout) => 
                total + workout.exercises.reduce((exTotal, exercise) => 
                  exTotal + exercise.sets.length, 0), 0
              )}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Toplam Set</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutCalendar;