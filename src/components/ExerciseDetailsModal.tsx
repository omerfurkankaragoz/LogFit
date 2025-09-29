// src/components/ExerciseDetailsModal.tsx
import React from 'react';
import { X, Plus } from 'lucide-react';
import { Exercise } from '../services/exerciseApi';

interface ExerciseDetailsModalProps {
  exercise: Exercise;
  onClose: () => void;
  onAdd: (exercise: Exercise) => void;
  getImageUrl: (gifPath: string) => string;
}

// Sadece Vücut Bölgelerini İngilizce ve standart formatta gösteren fonksiyon
const formatBodyPartName = (bodyPart: string) => {
    if (!bodyPart) return 'Other';
    return bodyPart.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const ExerciseDetailsModal: React.FC<ExerciseDetailsModalProps> = ({ exercise, onClose, onAdd, getImageUrl }) => {

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative w-full max-w-md bg-system-background-secondary rounded-t-2xl max-h-[80vh] flex flex-col">
        <div className="relative flex-shrink-0 text-center p-4 border-b border-system-separator">
          <h1 className="text-lg font-bold text-system-label">{exercise.name}</h1>
          <button onClick={onClose} className="absolute top-3 right-3 p-1 bg-system-fill rounded-full text-system-label-secondary">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-grow overflow-y-auto p-4 space-y-4">
          <div className="w-full h-64 rounded-xl bg-system-background-tertiary overflow-hidden">
            <img 
              src={getImageUrl(exercise.gifUrl)} 
              alt={exercise.name} 
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="bg-system-background-tertiary rounded-xl p-4 grid grid-cols-2 gap-4">
            <div>
                <p className="text-sm text-system-label-secondary">Vücut Bölgesi</p>
                <p className="font-semibold text-system-label">{formatBodyPartName(exercise.bodyPart)}</p>
            </div>
            <div>
                <p className="text-sm text-system-label-secondary">Ekipman</p>
                <p className="font-semibold text-system-label">{exercise.equipment}</p>
            </div>
          </div>
        </div>
        
        <div className="flex-shrink-0 p-4 border-t border-system-separator bg-system-background-secondary">
          <button
            onClick={() => onAdd(exercise)}
            className="w-full flex items-center justify-center gap-2 py-3 bg-system-blue text-white rounded-xl font-semibold text-lg"
          >
            <Plus size={22} />
            Antrenmana Ekle
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExerciseDetailsModal;