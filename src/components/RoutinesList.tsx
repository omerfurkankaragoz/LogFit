import React, { useState } from 'react';
import { Plus, MoreVertical, Edit, Trash2 } from 'lucide-react';

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
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const handleMenuClick = (e: React.MouseEvent, routineId: string) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === routineId ? null : routineId);
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
        {routines.map((routine) => (
          <div key={routine.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0 pr-2">
                <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">{routine.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {routine.exercises.length} egzersiz
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 truncate">
                  {routine.exercises.map(e => e.name).join(' • ')}
                </p>
              </div>
              
              <div className="relative">
                <button onClick={(e) => handleMenuClick(e, routine.id)} className="text-gray-400 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                  <MoreVertical size={20} />
                </button>
                {openMenuId === routine.id && (
                  <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-700 rounded-lg shadow-xl z-10 border dark:border-gray-600">
                    <a onClick={() => { onEditRoutine(routine); setOpenMenuId(null); }} className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer">
                      <Edit size={16} /> Düzenle
                    </a>
                    <a onClick={() => { onDeleteRoutine(routine.id); setOpenMenuId(null); }} className="flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer">
                      <Trash2 size={16} /> Sil
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoutinesList;