import React from 'react';
import { Heart, Phone, Calendar, Edit, Trash2 } from 'lucide-react';
import { Animal } from '../../types';

interface AnimalCardProps {
  animal: Animal;
  onEdit: (animal: Animal) => void;
  onDelete: (id: string) => void;
}

export function AnimalCard({ animal, onEdit, onDelete }: AnimalCardProps) {
  const getSpeciesIcon = (species: string) => {
    return species.toLowerCase() === 'cão' ? '🐕' : '🐱';
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-2xl">
            {getSpeciesIcon(animal.species)}
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-gray-900">{animal.name}</h3>
            <p className="text-sm text-gray-500">{animal.breed} • {animal.species}</p>
          </div>
        </div>
        
        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(animal)}
            className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(animal.id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Idade:</span>
          <span className="font-medium">{animal.age} anos</span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Peso:</span>
          <span className="font-medium">{animal.weight} kg</span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Cor:</span>
          <span className="font-medium">{animal.color}</span>
        </div>
        
        <div className="pt-3 border-t border-gray-100">
          <p className="text-sm font-medium text-gray-900 mb-2">Tutor: {animal.owner.name}</p>
          <div className="flex items-center text-sm text-gray-600">
            <Phone className="w-4 h-4 mr-2" />
            {animal.owner.phone}
          </div>
        </div>
        
        <div className="flex items-center text-xs text-gray-500 pt-2">
          <Calendar className="w-3 h-3 mr-1" />
          Cadastrado em {animal.createdAt.toLocaleDateString('pt-BR')}
        </div>
      </div>
    </div>
  );
}