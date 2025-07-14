// src/components/ExerciseLibrary.tsx

import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus } from 'lucide-react';
import { Exercise, searchExercisesByName, getExercisesByBodyPart, getBodyParts } from '../services/exerciseApi';

interface ExerciseLibraryProps {
  onExerciseSelect: (exercise: Exercise) => void;
  onBack: () => void;
}

const ExerciseLibrary: React.FC<ExerciseLibraryProps> = ({ onExerciseSelect, onBack }) => {
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBodyPart, setSelectedBodyPart] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const bodyParts = getBodyParts();

  useEffect(() => {
    const searchTimer = setTimeout(async () => {
      const query = searchQuery.trim();
      const bodyPart = selectedBodyPart;

      if (!query && bodyPart === 'all') {
        setFilteredExercises([]);
        return;
      }

      setLoading(true);
      let results: Exercise[] = [];

      try {
        if (query) {
          // Arama kutusunda yazı varsa, isme göre ara
          results = await searchExercisesByName(query);
          // Eğer ek olarak vücut filtresi de varsa, gelen sonuçları daralt
          if (bodyPart !== 'all') {
            results = results.filter(ex => ex.bodyPart.toLowerCase() === bodyPart.toLowerCase());
          }
        } else {
          // Arama kutusu boşsa ve sadece vücut filtresi varsa, vücut bölgesine göre getir
          results = await getExercisesByBodyPart(bodyPart);
        }
        setFilteredExercises(results);
      } catch (error) {
        // Hata durumunda konsola yazmak yerine sessizce boş dizi basabiliriz
        setFilteredExercises([]);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(searchTimer);
  }, [searchQuery, selectedBodyPart]);

  const handleExerciseSelect = (exercise: Exercise) => {
    if (confirm(`"${exercise.name}" hareketini bugünkü antrenmana eklemek istiyor musunuz?`)) {
      onExerciseSelect(exercise);
    }
  };

  const getBodyPartEmoji = (bodyPart: string) => {
    const emojis: { [key: string]: string } = { 'chest': '💪', 'back': '🏋️', 'shoulders': '🤸', 'waist': '🔥', 'cardio': '🏃', 'lower arms': '💪', 'upper arms': '💪', 'lower legs': '🦵', 'upper legs': '🦵', 'neck': '🤸' };
    return emojis[bodyPart.toLowerCase()] || '🏃';
  };

  const getBodyPartName = (bodyPart: string) => {
    const names: { [key: string]: string } = { 'chest': 'Göğüs', 'back': 'Sırt', 'shoulders': 'Omuz', 'waist': 'Karın', 'cardio': 'Kardiyo', 'neck': 'Boyun', 'lower arms': 'Ön Kol', 'upper arms': 'Pazu/Arka Kol', 'lower legs': 'Alt Bacak', 'upper legs': 'Üst Bacak' };
    return names[bodyPart.toLowerCase()] || bodyPart.charAt(0).toUpperCase() + bodyPart.slice(1);
  };

  return (
    <div className="p-4">
      <div className="space-y-4 mb-6">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Hareket adı ara..." className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200" />
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${showFilters ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
          <Filter size={16} /> Filtreler
        </button>
        {showFilters && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-3">Vücut Bölgesi</h3>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setSelectedBodyPart('all')} className={`px-3 py-2 rounded-lg text-sm transition-colors ${selectedBodyPart === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}`}>Tümü</button>
              {bodyParts.map(bodyPart => (<button key={bodyPart} onClick={() => setSelectedBodyPart(bodyPart)} className={`px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-1 ${selectedBodyPart === bodyPart ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}`}><span>{getBodyPartEmoji(bodyPart)}</span>{getBodyPartName(bodyPart)}</button>))}
            </div>
          </div>
        )}
      </div>
      {loading && (<div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div><span className="ml-3 text-gray-600 dark:text-gray-400">Aranıyor...</span></div>)}
      {!loading && (
        <>
          <div className="mb-4"><p className="text-sm text-gray-600 dark:text-gray-400">{filteredExercises.length} hareket bulundu</p></div>
          <div className="space-y-3">
            {filteredExercises.map(exercise => (
              <div key={exercise.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0"><img src={exercise.gifUrl} alt={exercise.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'; }}/></div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 truncate">{exercise.name}</h3>
                    <div className="flex items-center gap-2 mt-1"><span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 rounded-full">{getBodyPartName(exercise.bodyPart)}</span><span className="text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 px-2 py-1 rounded-full">{exercise.equipment}</span></div>
                  </div>
                  <button onClick={() => handleExerciseSelect(exercise)} className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0"><Plus size={20} /></button>
                </div>
              </div>
            ))}
          </div>
          {filteredExercises.length === 0 && (searchQuery.trim() || selectedBodyPart !== 'all') && (<div className="text-center py-8"><div className="text-gray-400 dark:text-gray-500 mb-2">🔍</div><h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">Hareket bulunamadı</h3><p className="text-gray-500 dark:text-gray-500">Arama kriterlerinizi değiştirmeyi deneyin.</p></div>)}
        </>
      )}
    </div>
  );
};

export default ExerciseLibrary;