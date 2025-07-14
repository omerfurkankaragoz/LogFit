import React, { useState } from 'react';
import { Plus, Edit, Trash2, ChevronDown } from 'lucide-react';

export interface Routine {
  id: string;
  name: string;
  exercises: { id: string; name: string }[];
}

interface RoutinesListProps {
  routines: Routine[];
  onAddNewRoutine: () => void;
  onEditRoutine: (routine: Routine) => void;
  onDeleteRoutine: (routineId: string) => void;
}

const RoutinesList: React.FC<RoutinesListProps> = ({ routines, onAddNewRoutine, onEditRoutine, onDeleteRoutine }) => {
  const [expandedRoutineId, setExpandedRoutineId] = useState<string | null>(null);

  const handleCardClick = (routineId: string) => {
    setExpandedRoutineId(expandedRoutineId === routineId ? null : routineId);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Rutinlerim</h2>
        <button
          onClick={onAddNewRoutine}
          className="bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Yeni Rutin
        </button>
      </div>

      {routines.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p>Henüz bir rutin oluşturmadınız.</p>
          <p className="text-sm">Başlamak için "Yeni Rutin" butonuna tıklayın.</p>
        </div>
      )}

      <div className="space-y-3">
        {routines.map((routine) => {
          const isExpanded = expandedRoutineId === routine.id;
          return (
            <div key={routine.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm transition-all duration-300">
              <button
                onClick={() => handleCardClick(routine.id)}
                className="w-full text-left p-4 flex justify-between items-start"
              >
                <div className="flex-1 min-w-0 pr-4">
                  <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">{routine.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {routine.exercises.length} egzersiz
                  </p>
                  {!isExpanded && (
                     <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 truncate">
                        {routine.exercises.map(e => e.name).join(' • ')}
                     </p>
                  )}
                </div>
                <ChevronDown
                  size={24}
                  className={`text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                />
              </button>

              {isExpanded && (
                <div className="px-4 pb-4">
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
                    <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">Egzersizler:</h4>
                    <ul className="space-y-1 list-disc list-inside text-gray-600 dark:text-gray-400">
                      {routine.exercises.map(ex => (
                        <li key={ex.id}>{ex.name}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => onEditRoutine(routine)}
                      className="flex-1 py-2 px-4 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                    >
                      <Edit size={16} /> Düzenle
                    </button>
                    <button
                      onClick={() => onDeleteRoutine(routine.id)}
                      className="flex-1 py-2 px-4 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 rounded-lg flex items-center justify-center gap-2 hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                    >
                      <Trash2 size={16} /> Sil
                    </button>
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

export default RoutinesList;