import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus } from 'lucide-react';
import { Exercise, getAllExercises, getBodyParts } from '../services/exerciseApi';

// SUPABASE PROJE URL'NİZİ BURAYA GİRİN
// Supabase projenizin Ayarlar > API kısmında bulabilirsiniz.
const SUPABASE_PROJECT_URL = 'https://ekrhekungvoisfughwuz.supabase.co'; 
// DÜZELTME: Bucket adı 'images' olarak güncellendi.
const BUCKET_NAME = 'images';

interface ExerciseLibraryProps {
  onExerciseSelect: (exercise: Exercise) => void;
  onBack: () => void;
}

const ExerciseLibrary: React.FC<ExerciseLibraryProps> = ({ onExerciseSelect, onBack }) => {
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBodyPart, setSelectedBodyPart] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [bodyParts, setBodyParts] = useState<string[]>([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      const [parts, exercises] = await Promise.all([
        getBodyParts(),
        getAllExercises()
      ]);
      setBodyParts(parts);
      setAllExercises(exercises);
      setFilteredExercises(exercises);
      setLoading(false);
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    let exercises = [...allExercises];
    if (searchQuery.trim()) {
      exercises = exercises.filter(ex =>
        ex.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
      );
    }
    if (selectedBodyPart !== 'all') {
      exercises = exercises.filter(ex =>
        ex.bodyPart && ex.bodyPart.toLowerCase() === selectedBodyPart.toLowerCase()
      );
    }
    setFilteredExercises(exercises);
  }, [searchQuery, selectedBodyPart, allExercises]);

  const handleExerciseSelect = (exercise: Exercise) => {
    if (confirm(`"${exercise.name}" hareketini bugünkü antrenmana eklemek istiyor musunuz?`)) {
      onExerciseSelect(exercise);
    }
  };
  
  // DÜZELTME: Görselin tam URL'sini oluşturan fonksiyona '/exercises/' yolu eklendi.
  const getImageUrl = (gifPath: string) => {
    if (!gifPath) return 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop';
    // Örnek URL: .../storage/v1/object/public/images/exercises/3_4_Sit-Up/0.jpg
    return `${SUPABASE_PROJECT_URL}/storage/v1/object/public/${BUCKET_NAME}/exercises/${gifPath}`;
  };

  const getBodyPartEmoji = (bodyPart: string) => {
    if (!bodyPart) return '🏃';
    const emojis: { [key: string]: string } = { 'chest': '💪', 'back': '🏋️', 'shoulders': '🤸', 'waist': '🔥', 'cardio': '🏃', 'lower arms': '💪', 'upper arms': '💪', 'lower legs': '🦵', 'upper legs': '🦵', 'neck': '🤸', 'abdominals': '🔥' };
    return emojis[bodyPart.toLowerCase()] || '🏃';
  };
  
  const getBodyPartName = (bodyPart: string) => {
    if (!bodyPart) return '';
    const names: { [key: string]: string } = { 'chest': 'Göğüs', 'back': 'Sırt', 'shoulders': 'Omuz', 'waist': 'Karın', 'cardio': 'Kardiyo', 'neck': 'Boyun', 'lower arms': 'Ön Kol', 'upper arms': 'Pazu/Arka Kol', 'lower legs': 'Alt Bacak', 'upper legs': 'Üst Bacak', 'abdominals': 'Karın' };
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
      {loading && (<div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div><span className="ml-3 text-gray-600 dark:text-gray-400">Yükleniyor...</span></div>)}
      {!loading && (
        <>
          <div className="mb-4"><p className="text-sm text-gray-600 dark:text-gray-400">{filteredExercises.length} hareket bulundu</p></div>
          <div className="space-y-3">
            {filteredExercises.map(exercise => (
              <div key={exercise.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                    <img 
                      src={getImageUrl(exercise.gifUrl)} 
                      alt={exercise.name} 
                      className="w-full h-full object-cover" 
                      onError={(e) => { e.currentTarget.src = 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'; }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 truncate">{exercise.name}</h3>
                    <div className="flex items-center gap-2 mt-1"><span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 rounded-full">{getBodyPartName(exercise.bodyPart)}</span><span className="text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 px-2 py-1 rounded-full">{exercise.equipment}</span></div>
                  </div>
                  <button onClick={() => handleExerciseSelect(exercise)} className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0"><Plus size={20} /></button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ExerciseLibrary;
