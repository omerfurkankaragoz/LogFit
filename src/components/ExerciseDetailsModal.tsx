// src/components/ExerciseDetailsModal.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, ChevronDown, ChevronUp, Flame, Wrench, Gauge, Star, AlertTriangle } from 'lucide-react';
import { Exercise } from '../services/exerciseApi';

interface ExerciseDetailsModalProps {
  exercise: Exercise;
  onClose: () => void;
  onAdd: (exercise: Exercise) => void;
  getImageUrl: (gifPath: string) => string;
}

// Helper function to estimate difficulty based on equipment
const getDifficulty = (equipment: string): { level: string; color: string } => {
  const beginnerEquipment = ['body weight', 'assisted', 'stability ball'];
  const advancedEquipment = ['barbell', 'olympic barbell', 'weighted', 'trap bar'];

  if (beginnerEquipment.some(e => equipment?.toLowerCase().includes(e))) {
    return { level: 'Başlangıç', color: 'text-green-400' };
  } else if (advancedEquipment.some(e => equipment?.toLowerCase().includes(e))) {
    return { level: 'İleri', color: 'text-red-400' };
  }
  return { level: 'Orta', color: 'text-yellow-400' };
};

// Helper function to estimate calories
const getCalories = (bodyPart: string): number => {
  const highCalorie = ['cardio', 'upper legs', 'lower legs'];
  const lowCalorie = ['neck', 'lower arms'];

  if (highCalorie.includes(bodyPart?.toLowerCase())) return 15;
  if (lowCalorie.includes(bodyPart?.toLowerCase())) return 5;
  return 10;
};

// Helper function to get secondary muscles based on target
const getSecondaryMuscles = (target: string, _bodyPart: string): string[] => {
  const muscleMap: Record<string, string[]> = {
    'abs': ['Hip Flexors', 'Obliques'],
    'quads': ['Glutes', 'Hamstrings'],
    'glutes': ['Hamstrings', 'Lower Back'],
    'lats': ['Biceps', 'Rear Delts'],
    'pectorals': ['Triceps', 'Front Delts'],
    'delts': ['Triceps', 'Upper Chest'],
    'biceps': ['Forearms', 'Brachialis'],
    'triceps': ['Shoulders', 'Chest'],
    'traps': ['Rhomboids', 'Rear Delts'],
    'calves': ['Tibialis', 'Soleus'],
    'hamstrings': ['Glutes', 'Lower Back'],
    'forearms': ['Biceps', 'Grip'],
    'adductors': ['Hip Flexors', 'Quads'],
    'abductors': ['Glutes', 'Hip Flexors'],
  };

  return muscleMap[target?.toLowerCase()] || ['Core', 'Stabilizers'];
};

// Helper to get benefits
const getBenefits = (bodyPart: string, _target: string): string => {
  const benefitsMap: Record<string, string> = {
    'abs': 'Core stabilitesini artırır, bel desteği sağlar ve duruşu iyileştirir. Günlük aktivitelerde denge ve kontrol kazandırır.',
    'chest': 'Göğüs kaslarını güçlendirir, itme hareketlerinde performansı artırır. Üst vücut gücünü geliştirir.',
    'back': 'Sırt kaslarını güçlendirir, duruşu düzeltir ve çekme hareketlerinde güç sağlar.',
    'shoulders': 'Omuz stabilitesini artırır, üst vücut estetiğini geliştirir ve fonksiyonel güç sağlar.',
    'upper arms': 'Kol kaslarını güçlendirir, kavrama gücünü artırır ve günlük aktiviteleri kolaylaştırır.',
    'upper legs': 'Bacak gücünü artırır, metabolizmayı hızlandırır ve fonksiyonel hareket kapasitesini geliştirir.',
    'lower legs': 'Baldır kaslarını güçlendirir, ayak bileği stabilitesini artırır ve patlayıcı güç sağlar.',
    'cardio': 'Kalp damar sağlığını iyileştirir, dayanıklılığı artırır ve kalori yakmaya yardımcı olur.',
  };

  return benefitsMap[bodyPart?.toLowerCase()] || 'Hedef kas grubunu güçlendirir, genel fitness seviyesini artırır ve fonksiyonel hareket kapasitesini geliştirir.';
};

// Helper to get common mistakes
const getCommonMistakes = (bodyPart: string): string => {
  const mistakesMap: Record<string, string> = {
    'abs': 'Boynu çekmeyin veya momentum kullanmayın. Hareketi kontrollü yapın, core kaslarını aktif tutun.',
    'chest': 'Ağırlığı çok hızlı indirmeyin. Dirsekleri tam kilitlemeyin ve sırtınızı banktan kaldırmayın.',
    'back': 'Sırtınızı yuvarlaklaştırmayın. Hareketi omuzlardan değil, sırt kaslarından başlatın.',
    'shoulders': 'Ağırlığı sallamayın. Omuzları yukarı kaldırmayın ve dirsekleri sabit tutun.',
    'upper arms': 'Dirsekleri sabitlemeden hareket etmeyin. Momentum kullanmaktan kaçının.',
    'upper legs': 'Dizlerin ayak parmaklarının önüne geçmesine dikkat edin. Sırtı düz tutun.',
    'lower legs': 'Hareketi yarım yapmayın. Topuğu tam olarak yerden kaldırın.',
    'cardio': 'Nefes almayı unutmayın. Tempo çok yüksekse formu kaybedebilirsiniz.',
  };

  return mistakesMap[bodyPart?.toLowerCase()] || 'Hareketi kontrollü yapın, momentum kullanmaktan kaçının ve doğru formu koruyun.';
};

const formatBodyPartName = (bodyPart: string) => {
  if (!bodyPart) return 'Other';
  return bodyPart.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const ExerciseDetailsModal: React.FC<ExerciseDetailsModalProps> = ({ exercise, onClose, onAdd, getImageUrl }) => {
  const [isInstructionsExpanded, setIsInstructionsExpanded] = useState(false);

  const difficulty = getDifficulty(exercise.equipment);
  const calories = getCalories(exercise.bodyPart);
  const secondaryMuscles = getSecondaryMuscles(exercise.target, exercise.bodyPart);
  const benefits = getBenefits(exercise.bodyPart, exercise.target);
  const commonMistakes = getCommonMistakes(exercise.bodyPart);

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      {/* Backdrop - larger clickable area */}
      <motion.div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Modal Container - Draggable */}
      <motion.div
        className="relative w-full max-w-md bg-system-background rounded-t-3xl flex flex-col max-h-[80vh]"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.5 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 100 || info.velocity.y > 500) {
            onClose();
          }
        }}
      >
        {/* Drag Handle - larger touch area */}
        <div className="flex-shrink-0 pt-3 pb-2 cursor-grab active:cursor-grabbing">
          <div className="w-10 h-1 bg-white/30 rounded-full mx-auto" />
          <div className="h-4" /> {/* Extra touch area */}
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto scrollbar-thin flex-1 min-h-0 px-4 pb-[calc(6rem+env(safe-area-inset-bottom))]">

          {/* Top Chips - Horizontal Scroll */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide py-3 -mx-1 px-1">
            <div className="chip flex-shrink-0">
              <Gauge size={16} className={difficulty.color} />
              <span>{difficulty.level}</span>
            </div>
            <div className="chip flex-shrink-0">
              <Flame size={16} className="text-orange-400" />
              <span>{calories} kcal</span>
            </div>
            <div className="chip flex-shrink-0">
              <Wrench size={16} className="text-gray-400" />
              <span>{exercise.equipment || 'Bodyweight'}</span>
            </div>
          </div>

          {/* Exercise Image */}
          <div className="w-full aspect-video rounded-2xl bg-system-background-secondary overflow-hidden mb-4">
            <img
              src={getImageUrl(exercise.gifUrl)}
              alt={exercise.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Exercise Name */}
          <h2 className="text-xl font-bold text-system-label mb-4">{exercise.name}</h2>

          {/* Muscle Tags */}
          <div className="space-y-3 mb-4">
            <div>
              <p className="text-sm font-semibold text-system-label mb-2">Birincil Kaslar</p>
              <div className="flex flex-wrap gap-2">
                <span className="tag">{formatBodyPartName(exercise.bodyPart)}</span>
                {exercise.target && exercise.target.toLowerCase() !== exercise.bodyPart?.toLowerCase() && (
                  <span className="tag">{formatBodyPartName(exercise.target)}</span>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-system-label mb-2">İkincil Kaslar</p>
              <div className="flex flex-wrap gap-2">
                {secondaryMuscles.map((muscle, idx) => (
                  <span key={idx} className="tag">{muscle}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Instructions - Expandable */}
          {exercise.instructions && exercise.instructions.length > 0 && (
            <div className="expandable-section mb-4">
              <button
                onClick={() => setIsInstructionsExpanded(!isInstructionsExpanded)}
                className="expandable-header w-full"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">📋</span>
                  <span className="font-semibold text-system-label">Nasıl Yapılır</span>
                </div>
                {isInstructionsExpanded ? (
                  <ChevronUp size={20} className="text-system-label-tertiary" />
                ) : (
                  <ChevronDown size={20} className="text-system-label-tertiary" />
                )}
              </button>

              {isInstructionsExpanded && (
                <div className="expandable-content">
                  <ol className="space-y-2 list-decimal list-inside text-system-label-secondary text-sm">
                    {exercise.instructions.map((instruction, index) => (
                      <li key={index} className="leading-relaxed">
                        {instruction}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}

          {/* Benefits Section */}
          <div className="info-section mb-4">
            <div className="info-section-header">
              <Star size={18} className="text-yellow-400" />
              <span>Faydaları</span>
            </div>
            <p className="text-sm text-system-label-secondary leading-relaxed">
              {benefits}
            </p>
          </div>

          {/* Common Mistakes Section */}
          <div className="warning-section mb-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={18} className="text-orange-400" />
              <span className="font-semibold text-system-label">Sık Yapılan Hatalar</span>
            </div>
            <p className="text-sm text-system-label-secondary leading-relaxed">
              {commonMistakes}
            </p>
          </div>

        </div>

        {/* Fixed Bottom Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] bg-gradient-to-t from-system-background via-system-background to-transparent">
          <button
            onClick={() => onAdd(exercise)}
            className="w-full flex items-center justify-center gap-2 py-4 bg-system-blue text-white rounded-2xl font-bold text-lg active:scale-95 transition-transform shadow-lg shadow-system-blue/20"
          >
            <Plus size={22} />
            Antrenmana Ekle
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ExerciseDetailsModal;