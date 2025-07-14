import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Dumbbell } from 'lucide-react';
import { Workout } from '../App';

interface WorkoutCalendarProps {
  workouts: Workout[];
  onDateSelect: (date: string) => void;
}

const WorkoutCalendar: React.FC<WorkoutCalendarProps> = ({ workouts, onDateSelect }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const workoutDates = new Set(workouts.map(w => w.date));

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
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
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
                aspect-square p-2 rounded-lg text-sm font-medium transition-all
                ${isCurrentMonth ? 'text-gray-900 dark:text-gray-100' : 'text-gray-300 dark:text-gray-600'}
                ${isCurrentDay ? 'bg-blue-100 dark:bg-blue-900 border-2 border-blue-500 dark:border-blue-400' : ''}
                ${hasWorkout ? 'bg-green-100 dark:bg-green-900 hover:bg-green-200 dark:hover:bg-green-800' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}
                active:scale-95
              `}
            >
              <div className="flex flex-col items-center justify-center h-full">
                <span>{format(day, 'd')}</span>
                {hasWorkout && (
                  <Dumbbell size={12} className="text-green-600 dark:text-green-400 mt-1" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* İstatistikler */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Bu Ay</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {workouts.filter(w => 
                format(parseISO(w.date), 'yyyy-MM') === format(currentMonth, 'yyyy-MM')
              ).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Antrenman</div>
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