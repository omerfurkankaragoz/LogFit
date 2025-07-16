// src/components/RoutinesList.tsx
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ChevronDown, X } from 'lucide-react';
import { getAllExercises, Exercise as LibraryExercise } from '../services/exerciseApi';

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

// Supabase URL ve Bucket bilgileri
const SUPABASE_PROJECT_URL = 'https://ekrhekungvoisfughwuz.supabase.co';
const BUCKET_NAME = 'images';

const RoutinesList: React.FC<RoutinesListProps> = ({ routines, onAddNewRoutine, onEditRoutine, onDeleteRoutine }) => {
  const [expandedRoutineId, setExpandedRoutineId] = useState<string | null>(null);
  const [libraryExercises, setLibraryExercises] = useState<LibraryExercise[]>([]);
  const [showLargeImage, setShowLargeImage] = useState(false);
  const [currentLargeImageUrl, setCurrentLargeImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchLibrary = async () => {
      const exercises = await getAllExercises();
      setLibraryExercises(exercises);
    };
    fetchLibrary();
  }, []);

  const handleCardClick = (routineId: string) => {
    setExpandedRoutineId(expandedRoutineId === routineId ? null : routineId);
  };
  
  const getImageUrl = (gifPath: string | undefined) => {
    const defaultImage = 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop';
    if (!gifPath) return defaultImage;
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
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Rutinlerim</h2>
        <button
          onClick={onAddNewRoutine}
          className="bg-blue-600 text-white py-2 px-4 rounded-full flex items-center gap-2 text-sm font-semibold shadow-md hover:bg-blue-700 transition-all duration-200 ease-in-out active:scale-95"
        >
          <Plus size={20} />
          Yeni Rutin
        </button>
      </div>

      {routines.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p className="text-lg mb-2">Henüz bir rutin oluşturmadınız.</p>
          <p className="text-md">Başlamak için sağ üstteki "Yeni Rutin" butonuna tıklayın.</p>
        </div>
      )}

      <div className="space-y-4">
        {routines.map((routine) => {
          const isExpanded = expandedRoutineId === routine.id;
          return (
            <div key={routine.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden transform transition-all duration-300 ease-in-out hover:scale-[1.01]">
              <button
                onClick={() => handleCardClick(routine.id)}
                className="w-full text-left p-5 flex justify-between items-center"
              >
                <div className="flex-1 min-w-0 pr-4">
                  <h3 className="font-bold text-xl text-gray-800 dark:text-gray-100 mb-1">{routine.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
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

              {/* GÜNCELLENDİ: Açılır menünün içeriği */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-2">
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
                    <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-3">Egzersizler:</h4>
                    {/* UL yerine DIV kullanarak liste işaretlerini kaldırdık */}
                    <div className="space-y-3">
                      {routine.exercises.map(ex => {
                        // Her egzersiz için kütüphaneden görseli bul
                        const libEx = libraryExercises.find(lib => lib.id === ex.id || lib.name === ex.name);
                        const imageUrl = getImageUrl(libEx?.gifUrl);

                        return (
                          // Her bir liste elemanı için flex container
                          <div key={ex.id} className="flex items-center gap-3">
                            <img
                              src={imageUrl}
                              alt={ex.name}
                              className="w-10 h-10 rounded-md object-cover cursor-pointer flex-shrink-0"
                              onClick={(e) => {
                                e.stopPropagation(); // Kartın kapanmasını engelle
                                handleImageClick(imageUrl);
                              }}
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{ex.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex gap-3 mt-5 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => onEditRoutine(routine)}
                      className="flex-1 py-3 px-4 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-xl flex items-center justify-center gap-2 text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                    >
                      <Edit size={18} /> Düzenle
                    </button>
                    <button
                      onClick={() => onDeleteRoutine(routine.id)}
                      className="flex-1 py-3 px-4 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 rounded-xl flex items-center justify-center gap-2 text-sm font-medium hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                    >
                      <Trash2 size={18} /> Sil
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Görsel Büyütme Modalı */}
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

export default RoutinesList;