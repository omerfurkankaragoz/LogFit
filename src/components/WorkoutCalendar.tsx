// src/components/WorkoutCalendar.tsx

import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, parseISO, startOfWeek, endOfWeek } from 'date-fns';
import { tr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Dumbbell, PlayCircle, Zap, UserCircle } from 'lucide-react';
import type { Workout } from '../App';
import { Routine } from './RoutinesList';

interface WorkoutCalendarProps {
  workouts: Workout[];
  routines: Routine[];
  onDateSelect: (date: string) => void;
  onStartWorkout: () => void;
  onStartRoutine: (routine: Routine) => void;
  userProfile: { fullName: string | null, avatarUrl: string | null }; // Yeni prop
  onProfileClick: () => void; // Yeni prop
}

const WorkoutCalendar: React.FC<WorkoutCalendarProps> = ({ workouts, routines, onDateSelect, onStartWorkout, onStartRoutine, userProfile, onProfileClick }) => {
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
    <div>
      {/* GÜNCELLENEN BAŞLIK ALANI - Sticky & Transparent Profile Header */}
      <div className="sticky top-[env(safe-area-inset-top)] z-10 bg-system-background/80 backdrop-blur-md pt-4 pb-2 px-4 flex justify-between items-center border-b border-system-separator/20 transition-colors duration-200">
        <div>
          <p className="text-xs text-system-label-secondary font-medium mb-0.5">Merhaba,</p>
          <h2 className="text-xl font-bold text-system-label truncate max-w-[200px] leading-tight">{userProfile.fullName || 'Kullanıcı'}</h2>
        </div>
        <button onClick={onProfileClick} className="rounded-full overflow-hidden w-10 h-10 border border-system-separator/30 active:scale-95 transition-transform">
          {userProfile.avatarUrl ? (
            <img src={userProfile.avatarUrl} alt="Profil" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-system-fill flex items-center justify-center text-system-label-secondary">
              <UserCircle size={32} />
            </div>
          )}
        </button>
      </div>

      <div className="p-4 space-y-6">
        {/* Ay Navigasyonu */}
        <div className="flex items-center justify-between pt-2 pb-2">
          <h1 className="text-3xl font-bold text-system-label capitalize">
            {format(currentMonth, 'MMMM yyyy', { locale: tr })}
          </h1>
          <div className="flex items-center gap-1 bg-system-fill rounded-full p-1">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-full text-system-label hover:bg-system-background-tertiary transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-full text-system-label hover:bg-system-background-tertiary transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Takvim Grid'i */}
        <div className="bg-system-background-secondary rounded-2xl p-4 shadow-sm border border-system-separator/10">
          <div className="grid grid-cols-7 mb-3">
            {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(day => (
              <div key={day} className="text-center text-xs font-bold text-system-label-tertiary uppercase tracking-wider">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
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
                    aspect-square rounded-xl text-lg font-medium transition-all duration-200 ease-in-out relative
                    flex flex-col items-center justify-center
                    ${isCurrentMonth ? 'text-system-label' : 'text-system-label-quaternary'}
                    ${isCurrentDay ? 'bg-system-blue text-white shadow-lg shadow-system-blue/30' : 'hover:bg-system-fill'}
                    ${!isCurrentDay && hasWorkout ? 'bg-system-green/10 text-system-green font-bold border border-system-green/20' : ''}
                    `}
                >
                  <span>{format(day, 'd')}</span>
                  {!isCurrentDay && hasWorkout && (
                    <div className="absolute bottom-1.5 w-1 h-1 bg-system-green rounded-full"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Antrenmana Başla Butonu */}
        <div className="px-2">
          <button
            onClick={onStartWorkout}
            className={`w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-bold text-lg shadow-xl transition-all active:scale-95 ${workoutForToday
              ? 'bg-gradient-to-r from-system-orange to-orange-500 text-white shadow-orange-500/20'
              : 'bg-gradient-to-r from-system-blue to-blue-600 text-white shadow-system-blue/30'
              }`}
          >
            {workoutForToday ? <Dumbbell size={24} /> : <PlayCircle size={24} />}
            {workoutForToday ? 'Antrenmana Devam Et' : 'Bugünkü Antrenmanı Başlat'}
          </button>
        </div>

        {/* Hızlı Başlangıç Bölümü */}
        {routines.length > 0 && !workoutForToday && (
          <div>
            <h2 className="text-sm font-bold text-system-label-secondary mb-3 uppercase tracking-wider px-1 flex items-center gap-1">
              <Zap size={14} className="text-system-yellow" /> Hızlı Başlat
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
              {routines.map(routine => (
                <button
                  key={routine.id}
                  onClick={() => onStartRoutine(routine)}
                  className="flex-shrink-0 w-40 p-4 rounded-2xl bg-system-background-secondary border border-system-separator/10 flex flex-col items-start gap-2 shadow-sm active:scale-95 transition-transform hover:bg-system-background-tertiary"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-system-blue to-blue-600 flex items-center justify-center text-white shadow-lg shadow-system-blue/20">
                    <PlayCircle size={20} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-system-label text-sm truncate w-32">{routine.name}</h3>
                    <p className="text-xs text-system-label-secondary">{routine.exercises.length} hareket</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* İstatistikler Kartı */}
        <div className="bg-system-background-secondary rounded-2xl p-6 border border-system-separator/10">
          <h2 className="font-bold text-system-label mb-4 text-lg">Bu Ayın Özeti</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center justify-center bg-system-background-tertiary/50 p-4 rounded-xl">
              <div className="text-3xl font-bold text-system-blue mb-1">
                {workouts.filter(w =>
                  format(parseISO(w.date), 'yyyy-MM') === format(currentMonth, 'yyyy-MM')
                ).length}
              </div>
              <div className="text-xs font-medium text-system-label-secondary uppercase tracking-wide">Antrenman</div>
            </div>
            <div className="flex flex-col items-center justify-center bg-system-background-tertiary/50 p-4 rounded-xl">
              <div className="text-3xl font-bold text-system-orange mb-1">
                {workouts.filter(w =>
                  format(parseISO(w.date), 'yyyy-MM') === format(currentMonth, 'yyyy-MM')
                ).reduce((total, workout) =>
                  total + workout.exercises.reduce((exTotal, exercise) =>
                    exTotal + exercise.sets.length, 0), 0
                )}
              </div>
              <div className="text-xs font-medium text-system-label-secondary uppercase tracking-wide">Toplam Set</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutCalendar;