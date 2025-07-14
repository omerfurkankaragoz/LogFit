import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus } from 'lucide-react';
import { Exercise, getExercises, getExercisesByBodyPart, searchExercises, getBodyParts } from '../services/exerciseApi';

interface ExerciseLibraryProps {
  onExerciseSelect: (exercise: Exercise) => void;
  onBack: () => void;
}

const ExerciseLibrary: React.FC<ExerciseLibraryProps> = ({ onExerciseSelect, onBack }) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBodyPart, setSelectedBodyPart] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const bodyParts = getBodyParts();

  useEffect(() => {
    loadExercises();
  }, []);

  useEffect(() => {
    filterExercises();
  }, [exercises, searchQuery, selectedBodyPart]);

  const loadExercises = async () => {
    try {
      setLoading(true);
      const data = await getExercises();
      setExercises(data);
    } catch (error) {
      console.error('Egzersizler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterExercises = async () => {
    let filtered = exercises;

    // Vücut bölgesine göre filtrele
    if (selectedBodyPart !== 'all') {
      filtered = await getExercisesByBodyPart(selectedBodyPart);
    }

    // Arama sorgusuna göre filtrele
    if (searchQuery.trim()) {
      filtered = await searchExercises(searchQuery);
      if (selectedBodyPart !== 'all') {
        filtered = filtered.filter(ex => ex.bodyPart === selectedBodyPart);
      }
    }

    setFilteredExercises(filtered);
  };

  const handleExerciseSelect = (exercise: Exercise) => {
    // Hareketi seçtiğimizde direkt antrenman kaydı oluştur
    if (confirm(`"${exercise.name}" hareketini bugünkü antrenmana eklemek istiyor musunuz?`)) {
      onExerciseSelect(exercise);
    }
  };

  const getBodyPartEmoji = (bodyPart: string) => {
    const emojis: { [key: string]: string } = {
      chest: '💪',
      back: '🏋️',
      legs: '🦵',
      shoulders: '🤸',
      arms: '💪',
      core: '🔥'
    };
    return emojis[bodyPart] || '🏃';
  };

  const getBodyPartName = (bodyPart: string) => {
    const names: { [key: string]: string } = {
      chest: 'Göğüs',
      back: 'Sırt',
      legs: 'Bacak',
      shoulders: 'Omuz',
      arms: 'Kol',
      core: 'Karın'
    };
    return names[bodyPart] || bodyPart;
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Hareketler yükleniyor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Arama ve Filtreler */}
      <div className="space-y-4 mb-6">
        {/* Arama */}
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Hareket ara..."
            className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
          />
        </div>

        {/* Filtre Butonu */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            showFilters ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
          }`}
        >
          <Filter size={16} />
          Filtreler
        </button>

        {/* Vücut Bölgesi Filtreleri */}
        {showFilters && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-3">Vücut Bölgesi</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedBodyPart('all')}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedBodyPart === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Tümü
              </button>
              {bodyParts.map(bodyPart => (
                <button
                  key={bodyPart}
                  onClick={() => setSelectedBodyPart(bodyPart)}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-1 ${
                    selectedBodyPart === bodyPart
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  <span>{getBodyPartEmoji(bodyPart)}</span>
                  {getBodyPartName(bodyPart)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sonuç Sayısı */}
      <div className="mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {filteredExercises.length} hareket bulundu
        </p>
      </div>

      {/* Hareket Listesi */}
      <div className="space-y-3">
        {filteredExercises.map(exercise => (
          <div
            key={exercise.id}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              {/* Hareket Görseli */}
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                <img
                  src={exercise.gifUrl}
                  alt={exercise.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop';
                  }}
                />
              </div>

              {/* Hareket Bilgileri */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 truncate">
                  {exercise.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 rounded-full">
                    {getBodyPartEmoji(exercise.bodyPart)} {getBodyPartName(exercise.bodyPart)}
                  </span>
                  <span className="text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 px-2 py-1 rounded-full">
                    {exercise.equipment}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
                  Hedef: {exercise.target}
                </p>
              </div>

              {/* Ekle Butonu */}
              <button
                onClick={() => handleExerciseSelect(exercise)}
                className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0"
              >
                <Plus size={20} />
              </button>
            </div>

            {/* Talimatlar (İsteğe bağlı) */}
            {exercise.instructions && exercise.instructions.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {exercise.instructions[0]}...
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Sonuç Bulunamadı */}
      {filteredExercises.length === 0 && !loading && (
        <div className="text-center py-8">
          <div className="text-gray-400 dark:text-gray-500 mb-2">🔍</div>
          <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
            Hareket bulunamadı
          </h3>
          <p className="text-gray-500 dark:text-gray-500">
            Arama kriterlerinizi değiştirmeyi deneyin.
          </p>
        </div>
      )}
    </div>
  );
};

export default ExerciseLibrary;