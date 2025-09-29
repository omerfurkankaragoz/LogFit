// src/components/RoutinesList.tsx
import React, { useState } from 'react';
import { Plus, Edit, Trash2, ChevronDown, Copy, Dumbbell } from 'lucide-react';
import { Exercise as LibraryExercise } from '../services/exerciseApi';

export interface Routine {
  id: string;
  name: string;
  exercises: { id: string; name: string; bodyPart?: string }[];
}

interface RoutinesListProps {
  routines: Routine[];
  onAddNewRoutine: () => void;
  onEditRoutine: (routine: Routine) => void;
  onDeleteRoutine: (routineId: string) => void;
  onCopyRoutine: (routine: Routine) => void;
  allLibraryExercises: LibraryExercise[];
}

const SUPABASE_PROJECT_URL = 'https://ekrhekungvoisfughwuz.supabase.co';
const BUCKET_NAME = 'images';

const RoutinesList: React.FC<RoutinesListProps> = ({ routines, onAddNewRoutine, onEditRoutine, onDeleteRoutine, onCopyRoutine, allLibraryExercises }) => {
  const [expandedRoutineId, setExpandedRoutineId] = useState<string | null>(null);

  const handleCardClick = (routineId: string) => {
    setExpandedRoutineId(expandedRoutineId === routineId ? null : routineId);
  };
  
  const getImageUrl = (gifPath: string | undefined) => {
    const defaultImage = 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop';
    if (!gifPath) return defaultImage;
    const imagePath = gifPath.replace('0.jpg', '1.jpg');
    return `${SUPABASE_PROJECT_URL}/storage/v1/object/public/${BUCKET_NAME}/exercises/${imagePath}`;
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center pt-4">
        <h1 className="text-3xl font-bold text-system-label">Rutinler</h1>
        <button
          onClick={onAddNewRoutine}
          className="bg-system-blue text-white p-2 rounded-full shadow-md hover:opacity-90 transition-opacity"
        >
          <Plus size={22} />
        </button>
      </div>

      {routines.length === 0 ? (
        <div className="text-center py-16 px-4 bg-system-background-secondary rounded-xl">
          <Dumbbell size={40} className="mx-auto text-system-label-tertiary mb-4" />
          <h3 className="text-lg font-semibold text-system-label mb-1">Henüz Rutin Yok</h3>
          <p className="text-system-label-secondary text-sm">
            Yeni bir antrenman rutini oluşturmak için sağ üstteki '+' butonuna dokunun.
          </p>
        </div>
      ) : (
        <div className="bg-system-background-secondary rounded-xl divide-y divide-system-separator">
            {routines.map((routine) => {
            const isExpanded = expandedRoutineId === routine.id;
            return (
                <div key={routine.id}>
                <button
                    onClick={() => handleCardClick(routine.id)}
                    className="w-full text-left p-4 flex justify-between items-center"
                >
                    <div className="flex-1 min-w-0 pr-4">
                    <h3 className="font-semibold text-system-label">{routine.name}</h3>
                    <p className="text-sm text-system-label-secondary mt-1">
                        {routine.exercises?.length || 0} hareket
                    </p>
                    </div>
                    <ChevronDown
                    size={20}
                    className={`text-system-label-tertiary transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                    />
                </button>

                {isExpanded && (
                    <div className="px-4 pb-4">
                    <div className="border-t border-system-separator pt-3 mt-2">
                        <div className="space-y-3">
                        {(routine.exercises || []).map(ex => {
                            const libEx = allLibraryExercises.find(lib => lib.id === ex.id || lib.name === ex.name);
                            return (
                            <div key={ex.id} className="flex items-center gap-4">
                                <img
                                src={getImageUrl(libEx?.gifUrl)}
                                alt={ex.name}
                                className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-system-background-tertiary"
                                />
                                <span className="text-sm text-system-label-secondary">{ex.name}</span>
                            </div>
                            );
                        })}
                        </div>
                        <div className="flex gap-2 mt-4 pt-4 border-t border-system-separator">
                            <button onClick={(e) => { e.stopPropagation(); onCopyRoutine(routine); }} className="flex-1 py-2 px-3 bg-system-fill-tertiary text-system-label rounded-lg flex items-center justify-center gap-2 text-sm font-medium hover:opacity-80 transition-opacity"> <Copy size={16} /> Kopyala </button>
                            <button onClick={(e) => { e.stopPropagation(); onEditRoutine(routine); }} className="flex-1 py-2 px-3 bg-system-fill-tertiary text-system-label rounded-lg flex items-center justify-center gap-2 text-sm font-medium hover:opacity-80 transition-opacity"> <Edit size={16} /> Düzenle </button>
                            <button onClick={(e) => { e.stopPropagation(); onDeleteRoutine(routine.id); }} className="flex-1 py-2 px-3 bg-system-red text-white rounded-lg flex items-center justify-center gap-2 text-sm font-medium hover:opacity-80 transition-opacity"> <Trash2 size={16} /> Sil </button>
                        </div>
                    </div>
                    </div>
                )}
                </div>
            );
            })}
        </div>
      )}
    </div>
  );
};

export default RoutinesList;