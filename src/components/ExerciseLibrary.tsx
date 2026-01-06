// src/components/ExerciseLibrary.tsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Star, X, Grid3X3, List, Bookmark } from 'lucide-react';
import { Exercise, getBodyParts } from '../services/exerciseApi';
import ExerciseDetailsModal from './ExerciseDetailsModal';

const SUPABASE_PROJECT_URL = 'https://ekrhekungvoisfughwuz.supabase.co';
const BUCKET_NAME = 'images';

interface ExerciseLibraryProps {
  onExerciseSelect: (exercise: Exercise) => void;
  allExercises: Exercise[];
  favoriteExercises: string[];
  onToggleFavorite: (exerciseId: string) => void;
}

const formatBodyPartName = (bodyPart: string) => {
  if (!bodyPart) return 'Other';
  if (bodyPart === 'all') return 'Tümü';
  if (bodyPart === 'favorites') return 'Favoriler';
  return bodyPart.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const ExerciseLibrary: React.FC<ExerciseLibraryProps> = ({ onExerciseSelect, allExercises, favoriteExercises, onToggleFavorite }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [bodyParts, setBodyParts] = useState<string[]>([]);
  const [selectedBodyPart, setSelectedBodyPart] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchBodyPartsData = async () => {
      const parts = await getBodyParts();
      setBodyParts(parts);
    };
    fetchBodyPartsData();
  }, []);

  const filteredExercises = useMemo(() => {
    let exercises = [...allExercises];
    if (searchQuery.trim()) {
      exercises = exercises.filter(ex =>
        ex.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
      );
    }
    if (selectedBodyPart !== 'all') {
      if (selectedBodyPart === 'favorites') {
        exercises = exercises.filter(ex => favoriteExercises.includes(ex.id));
      } else {
        exercises = exercises.filter(ex =>
          ex.bodyPart && ex.bodyPart.toLowerCase() === selectedBodyPart.toLowerCase()
        );
      }
    }
    return exercises;
  }, [searchQuery, selectedBodyPart, allExercises, favoriteExercises]);

  const getImageUrl = (gifPath: string) => {
    if (!gifPath) return 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop';
    const imagePath = gifPath.replace('0.jpg', '1.jpg');
    return `${SUPABASE_PROJECT_URL}/storage/v1/object/public/${BUCKET_NAME}/exercises/${imagePath}`;
  };

  const handleAddExercise = (exercise: Exercise) => {
    onExerciseSelect(exercise);
    setSelectedExercise(null);
  };

  const handleSelectFilter = (part: string) => {
    setSelectedBodyPart(part);
  };

  return (
    <div ref={topRef}>
      {/* Sticky Header */}
      <div className="sticky top-[env(safe-area-inset-top)] z-20 bg-system-background/95 backdrop-blur-md pt-4 px-4 transition-colors duration-200">
        <h1 className="text-3xl font-bold text-system-label mb-4">Kütüphane</h1>

        {/* Body Part Filter Icons - Horizontal Scroll */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3 -mx-1 px-1">
          {/* Bookmark Tab */}
          <button
            onClick={() => handleSelectFilter('favorites')}
            className={`body-filter-item flex-shrink-0 ${selectedBodyPart === 'favorites' ? 'active' : ''}`}
          >
            <Bookmark size={20} className={selectedBodyPart === 'favorites' ? 'fill-white' : ''} />
          </button>

          {/* All Tab */}
          <button
            onClick={() => handleSelectFilter('all')}
            className={`body-filter-item flex-shrink-0 ${selectedBodyPart === 'all' ? 'active' : ''}`}
          >
            <Grid3X3 size={20} />
          </button>

          {/* Body Part Tabs */}
          {bodyParts.map(part => (
            <button
              key={part}
              onClick={() => handleSelectFilter(part)}
              className={`body-filter-item flex-shrink-0 px-3 ${selectedBodyPart === part ? 'active' : ''}`}
            >
              <span className="text-xs font-medium text-system-label-secondary capitalize truncate max-w-[4rem]">
                {formatBodyPartName(part).split(' ')[0]}
              </span>
            </button>
          ))}
        </div>

        {/* Search + View Toggle Row */}
        <div className="flex gap-2 items-center pb-4">
          <div className="relative flex-grow">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-system-label-tertiary" />
            <input
              type="text"
              autoComplete="off"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Hareket adı ara..."
              className="w-full pl-10 pr-10 py-2.5 bg-system-background-secondary text-system-label rounded-xl focus:outline-none focus:ring-2 focus:ring-system-blue text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center justify-center w-5 h-5 bg-system-label-tertiary rounded-full text-system-background active:scale-90 transition-transform"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* View Toggle */}
          <div className="flex bg-system-background-secondary rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-system-fill text-system-label' : 'text-system-label-tertiary'}`}
            >
              <List size={18} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-system-fill text-system-label' : 'text-system-label-tertiary'}`}
            >
              <Grid3X3 size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-28">
        {/* Category Label */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-semibold text-system-label">
            {selectedBodyPart === 'all' ? 'Tümü' :
              selectedBodyPart === 'favorites' ? 'Favoriler' :
                formatBodyPartName(selectedBodyPart)}
          </span>
          <span className="text-sm text-system-label-secondary">
            {filteredExercises.length} hareket
          </span>
        </div>

        {/* Grid View */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 gap-3">
            {filteredExercises.map(exercise => {
              const isFavorited = favoriteExercises.includes(exercise.id);
              return (
                <div
                  key={exercise.id}
                  className="exercise-grid-card"
                  onClick={() => setSelectedExercise(exercise)}
                >
                  {/* Bookmark Icon */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(exercise.id);
                    }}
                    className="bookmark z-10"
                  >
                    <Bookmark
                      size={16}
                      className={isFavorited ? 'fill-white text-white' : 'text-white/70'}
                    />
                  </button>

                  {/* Image */}
                  <img
                    src={getImageUrl(exercise.gifUrl)}
                    alt={exercise.name}
                    className="absolute inset-0"
                  />

                  {/* Overlay with Name */}
                  <div className="overlay">
                    <p className="font-semibold text-white text-sm leading-tight line-clamp-2">
                      {exercise.name}
                    </p>
                    <p className="text-xs text-white/60 mt-0.5">
                      {formatBodyPartName(exercise.bodyPart)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="glass-card divide-y divide-system-separator/30">
            {filteredExercises.map(exercise => {
              const isFavorited = favoriteExercises.includes(exercise.id);
              return (
                <div key={exercise.id} className="p-4 flex items-center gap-4">
                  <img
                    src={getImageUrl(exercise.gifUrl)}
                    alt={exercise.name}
                    className="w-14 h-14 rounded-xl object-cover bg-system-background-tertiary flex-shrink-0"
                  />
                  <div
                    onClick={() => setSelectedExercise(exercise)}
                    className="flex-1 min-w-0 cursor-pointer"
                  >
                    <p className="font-semibold text-system-label truncate">{exercise.name}</p>
                    <p className="text-sm text-system-label-secondary truncate">{formatBodyPartName(exercise.bodyPart)}</p>
                  </div>
                  <button
                    onClick={() => onToggleFavorite(exercise.id)}
                    className="p-2 text-system-label-secondary"
                  >
                    <Star className={`transition-all ${isFavorited ? 'fill-system-yellow text-system-yellow' : ''}`} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {filteredExercises.length === 0 && (
          <div className="text-center py-16">
            <p className="text-system-label-secondary">Sonuç bulunamadı</p>
          </div>
        )}
      </div>

      {/* Exercise Details Modal */}
      {selectedExercise && (
        <ExerciseDetailsModal
          exercise={selectedExercise}
          onClose={() => setSelectedExercise(null)}
          onAdd={handleAddExercise}
          getImageUrl={getImageUrl}
        />
      )}
    </div>
  );
};

export default ExerciseLibrary;