// src/components/CreateRoutine.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Save, Plus, Trash2, Search, X, GripVertical, Star } from 'lucide-react';
import { Routine } from './RoutinesList';
import { Exercise as LibraryExercise } from '../services/exerciseApi';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SUPABASE_PROJECT_URL = 'https://ekrhekungvoisfughwuz.supabase.co';
const BUCKET_NAME = 'images';

function SortableExercise({ id, name, onRemove }: { id: string; name: string; onRemove: (id: string) => void; }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 'auto',
    boxShadow: isDragging ? '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' : 'none',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-4 rounded-xl text-gray-800 dark:text-gray-200 text-base mb-2 select-none bg-gray-50 dark:bg-gray-700`}
    >
      <div className="flex items-center gap-3">
        <button {...attributes} {...listeners} className="cursor-grab touch-none p-1">
            <GripVertical className="text-gray-400" />
        </button>
        <span>{name}</span>
      </div>
      <button onClick={() => onRemove(id)} className="p-2 text-red-500 hover:text-red-700 rounded-md transition-colors active:scale-95"><Trash2 size={20} /></button>
    </div>
  );
}

interface CreateRoutineProps {
  existingRoutine: Partial<Routine> | null;
  onSaveRoutine: (id: string | null, name: string, exercises: { id: string; name: string; bodyPart?: string }[]) => void;
  onCancel: () => void;
  allLibraryExercises: LibraryExercise[];
  favoriteExercises: string[];
}

const CreateRoutine: React.FC<CreateRoutineProps> = ({ existingRoutine, onSaveRoutine, onCancel, allLibraryExercises, favoriteExercises }) => {
  const [routineName, setRoutineName] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<{ id: string; name: string; bodyPart?: string }[]>([]);
  const [manualExerciseName, setManualExerciseName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [showLargeImage, setShowLargeImage] = useState(false);
  const [currentLargeImageUrl, setCurrentLargeImageUrl] = useState<string | null>(null);

  const favoriteLibraryExercises = useMemo(() => {
    const selectedExerciseNames = new Set(selectedExercises.map(ex => ex.name.toLowerCase()));
    return allLibraryExercises
      .filter(ex => favoriteExercises.includes(ex.id))
      .filter(ex => !selectedExerciseNames.has(ex.name.toLowerCase()));
  }, [allLibraryExercises, favoriteExercises, selectedExercises]);


  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (existingRoutine) {
      setRoutineName(existingRoutine.name || '');
      const initialExercises = existingRoutine.exercises?.map(ex => {
          const libEx = allLibraryExercises.find(lib => lib.name.toLowerCase() === ex.name.toLowerCase());
          return {...ex, bodyPart: ex.bodyPart || libEx?.bodyPart }
      }) || [];
      setSelectedExercises(initialExercises);
    }
  }, [existingRoutine, allLibraryExercises]);

  const filteredLibraryExercises = useMemo(() => {
    const selectedExerciseNames = new Set(selectedExercises.map(ex => ex.name.toLowerCase()));
    
    let exercises = allLibraryExercises.filter(
      libEx => !selectedExerciseNames.has(libEx.name.toLowerCase())
    );

    if (searchQuery.trim()) {
      exercises = exercises.filter(ex =>
        ex.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
      );
    }
    
    return exercises;
  }, [searchQuery, allLibraryExercises, selectedExercises]);

  const handleAddExerciseFromLibrary = (exercise: LibraryExercise) => {
    if (!selectedExercises.find(e => e.name.toLowerCase() === exercise.name.toLowerCase())) {
      setSelectedExercises(prev => [...prev, { id: exercise.id, name: exercise.name, bodyPart: exercise.bodyPart }]);
    }
  };

  const handleManualAddExercise = () => {
    const trimmedName = manualExerciseName.trim();
    if (trimmedName && !selectedExercises.find(e => e.name.toLowerCase() === trimmedName.toLowerCase())) {
      const newExercise = {
        id: `manual-${Date.now()}`,
        name: trimmedName,
        bodyPart: undefined 
      };
      setSelectedExercises(prev => [...prev, newExercise]);
      setManualExerciseName('');
    }
  };

  const handleRemoveExercise = (exerciseId: string) => {
    setSelectedExercises(prev => prev.filter(e => e.id !== exerciseId));
  };
  
  function handleDragEnd(event: DragEndEvent) {
    const {active, over} = event;
    
    if (active.id !== over?.id) {
      setSelectedExercises((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over?.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  const handleSave = () => {
    if (!routineName.trim()) {
      alert('Lütfen rutin için bir isim girin.');
      return;
    }
    if (selectedExercises.length === 0) {
      alert('Lütfen rutine en az bir hareket ekleyin.');
      return;
    }
    onSaveRoutine(existingRoutine?.id || null, routineName, selectedExercises);
  };

  const getImageUrl = (gifPath: string) => {
    if (!gifPath) return 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop';
    const imagePath = gifPath.replace('0.jpg', '1.jpg');
    return `${SUPABASE_PROJECT_URL}/storage/v1/object/public/${BUCKET_NAME}/exercises/${imagePath}`;
  };

  const handleImageClick = (imageUrl: string) => {
    setCurrentLargeImageUrl(imageUrl);
    setShowLargeImage(true);
  };

  const closeLargeImage = () => {
    setShowLargeImage(false);
    setCurrentLargeImageUrl(null);
  };

  return (
    <div className="p-4 space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
        <label htmlFor="routineName" className="block text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
          Rutin Adı
        </label>
        <input type="text" id="routineName" value={routineName} onChange={(e) => setRoutineName(e.target.value)} placeholder="Örn: İtiş Antrenmanı" className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base" />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 space-y-3">
        <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100 mb-2">Rutindeki Hareketler ({selectedExercises.length})</h3>
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={selectedExercises}
            strategy={verticalListSortingStrategy}
          >
            {selectedExercises.length > 0 ? selectedExercises.map(ex => 
                <SortableExercise key={ex.id} id={ex.id} name={ex.name} onRemove={handleRemoveExercise} />
            ) : (
                <p className="text-md text-center text-gray-500 dark:text-gray-400 py-4">Rutine hareket eklemek için aşağıdaki listeden arama yapın veya manuel ekleyin.</p>
            )}
          </SortableContext>
        </DndContext>
      </div>

      <div className="space-y-4 pt-6 mt-6 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
        <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100 mb-4">Hareket Ekle</h3>
        
        {favoriteLibraryExercises.length > 0 && !searchQuery.trim() && (
            <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <h4 className="font-semibold text-md text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <Star size={18} className="text-yellow-400"/> Favorilerden Ekle
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                    {favoriteLibraryExercises.map(exercise => (
                        <button key={exercise.id} onClick={() => handleAddExerciseFromLibrary(exercise)} className="w-full text-left bg-gray-50 dark:bg-gray-700 rounded-xl p-3 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                            <div className="flex items-center gap-3">
                                <img src={getImageUrl(exercise.gifUrl)} alt={exercise.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                                <p className="flex-1 font-medium text-gray-800 dark:text-gray-200 text-sm">{exercise.name}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        )}

        <div>
            <label className="text-md font-medium text-gray-600 dark:text-gray-400 mb-1 block">Manuel Olarak Ekle</label>
            <div className="flex gap-3 mt-1">
                <input type="text" value={manualExerciseName} onChange={(e) => setManualExerciseName(e.target.value)} placeholder="Örn: Cable Crossover" className="flex-grow p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base" />
                <button onClick={handleManualAddExercise} className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 ease-in-out active:scale-95 shadow-md">
                    <Plus size={24} />
                </button>
            </div>
        </div>

        <div className="flex items-center text-center my-4">
            <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
            <span className="flex-shrink mx-4 text-sm text-gray-500 dark:text-gray-400 uppercase">Veya Kütüphaneden Seç</span>
            <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
        </div>

        <div>
            <label className="text-md font-medium text-gray-600 dark:text-gray-400 mb-1 block">Kütüphaneden Ara</label>
            <div className="relative mt-1">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Hareket ara..." className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base" />
            </div>
        </div>
        
        {searchQuery.trim() && (
            <div className="space-y-3 max-h-[50vh] overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
                {filteredLibraryExercises.length > 0 ? filteredLibraryExercises.map(exercise => (
                <button key={exercise.id} onClick={() => handleAddExerciseFromLibrary(exercise)} className="w-full text-left bg-gray-50 dark:bg-gray-700 rounded-xl p-3 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow transform hover:scale-[1.01] active:scale-[0.99]">
                    <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-600 flex-shrink-0 cursor-pointer shadow-sm"
                        onClick={(e) => { e.stopPropagation(); handleImageClick(getImageUrl(exercise.gifUrl)); }}>
                        <img src={getImageUrl(exercise.gifUrl)} alt={exercise.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'; }}/>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-base text-gray-800 dark:text-gray-200 truncate">{exercise.name}</p>
                    </div>
                    </div>
                </button>
                )) : (
                <p className="text-md text-center text-gray-500 dark:text-gray-400 py-4">Aradığınız hareket bulunamadı veya zaten rutininizde mevcut.</p>
                )}
            </div>
        )}
      </div>
      
      <div className="flex gap-3 mt-4">
        <button onClick={onCancel} className="flex-1 py-3 px-6 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 ease-in-out active:scale-95 shadow-md text-base">İptal</button>
        <button onClick={handleSave} className="flex-1 py-3 px-6 bg-blue-600 text-white rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-all duration-200 ease-in-out active:scale-95 shadow-md text-base"><Save size={20} /> Kaydet</button>
      </div>

      {showLargeImage && currentLargeImageUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4" onClick={closeLargeImage}>
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-3 max-w-full max-h-full overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={closeLargeImage}
              className="absolute top-3 right-3 text-white bg-gray-800 dark:bg-gray-700 rounded-full p-2 hover:bg-gray-900 dark:hover:bg-gray-600 transition-colors z-10"
            >
              <X size={24} />
            </button>
            <img
              src={currentLargeImageUrl}
              alt="Büyük Egzersiz Görseli"
              className="max-w-[80vw] max-h-[80vh] object-contain mx-auto rounded-xl"
              onError={(e) => { e.currentTarget.src = 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=800'; }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
export default CreateRoutine;