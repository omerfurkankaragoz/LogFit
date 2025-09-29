// src/components/WorkoutCalendar.tsx

import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, parseISO, startOfWeek, endOfWeek } from 'date-fns';
import { tr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Dumbbell } from 'lucide-react';
import { Workout } from '../App';

interface WorkoutCalendarProps {
  workouts: Workout[];
  onDateSelect: (date: string) => void;
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
    <div className="p-4 space-y-6">
      {/* Ay Navigasyonu ve Başlık (Yeni Tasarım) */}
      <div className="flex items-center justify-between pt-4">
        <h1 className="text-3xl font-bold text-system-label capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: tr })}
        </h1>
        <div className="flex items-center gap-2">
            <button
            onClick={handlePrevMonth}
            className="p-2 bg-system-fill rounded-full text-system-label-secondary"
            >
            <ChevronLeft size={20} />
            </button>
            <button
            onClick={handleNextMonth}
            className="p-2 bg-system-fill rounded-full text-system-label-secondary"
            >
            <ChevronRight size={20} />
            </button>
        </div>
      </div>

      {/* Takvim Grid'i (Eski Stil + Yeni Renkler) */}
      <div className="bg-system-background-secondary rounded-xl p-4">
        <div className="grid grid-cols-7 mb-2">
          {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(day => (
            <div key={day} className="text-center text-xs font-semibold text-system-label-secondary py-2">
              {day}
            </div>
          ))}
        </div>
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
                  ${isCurrentMonth ? 'text-system-label' : 'text-system-label-quaternary'}
                  ${isCurrentDay ? 'bg-system-fill ring-2 ring-system-blue' : ''}
                  ${!isCurrentDay && hasWorkout ? 'bg-system-green/20' : ''}
                  hover:bg-system-fill
                  active:scale-95
                `}
              >
                <span>{format(day, 'd')}</span>
                {hasWorkout && (
                  <div className="absolute bottom-1.5 w-1.5 h-1.5 bg-system-green rounded-full"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Antrenmana Başla Butonu (Yeni Tasarım) */}
      <div className="px-4">
        <button
          onClick={onStartWorkout}
          className="w-full flex items-center justify-center gap-3 py-3 px-6 bg-system-blue text-white rounded-xl font-semibold text-lg shadow-lg hover:opacity-90 transition-opacity active:scale-95"
        >
          <Dumbbell size={22} />
          {workoutForToday ? 'Antrenmana Devam Et' : 'Antrenmana Başla'}
        </button>
      </div>

      {/* İstatistikler Kartı (Yeni Tasarım) */}
      <div className="bg-system-background-secondary rounded-xl p-4">
        <h2 className="font-semibold text-system-label mb-3">Bu Ayın Özeti</h2>
        <div className="grid grid-cols-2 gap-px bg-system-separator rounded-lg overflow-hidden">
            <div className="text-center bg-system-background-secondary p-4">
                <div className="text-2xl font-bold text-system-blue">
                {workouts.filter(w => 
                    format(parseISO(w.date), 'yyyy-MM') === format(currentMonth, 'yyyy-MM')
                ).length}
                </div>
                <div className="text-sm text-system-label-secondary">Toplam Antrenman</div>
            </div>
            <div className="text-center bg-system-background-secondary p-4">
                <div className="text-2xl font-bold text-system-orange">
                {workouts.filter(w => 
                    format(parseISO(w.date), 'yyyy-MM') === format(currentMonth, 'yyyy-MM')
                ).reduce((total, workout) => 
                    total + workout.exercises.reduce((exTotal, exercise) => 
                    exTotal + exercise.sets.length, 0), 0
                )}
                </div>
                <div className="text-sm text-system-label-secondary">Toplam Set</div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutCalendar;