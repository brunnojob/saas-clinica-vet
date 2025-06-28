import React, { useState } from 'react';
import { Search, Plus, Filter } from 'lucide-react';
import { AnimalCard } from '../components/Animals/AnimalCard';
import { AnimalForm } from '../components/Animals/AnimalForm';
import { Animal } from '../types';
import { useAnimals } from '../hooks/useDatabase';

export function Animals() {
  const { animals, loading, error, createAnimal, updateAnimal, deleteAnimal } = useAnimals();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState<Animal | undefined>();

  const filteredAnimals = animals.filter(animal => {
    const matchesSearch = animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         animal.owner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         animal.species.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSpecies = selectedSpecies === 'all' || animal.species === selectedSpecies;
    
    return matchesSearch && matchesSpecies;
  });

  const handleAddAnimal = () => {
    setEditingAnimal(undefined);
    setIsFormOpen(true);
  };

  const handleEditAnimal = (animal: Animal) => {
    setEditingAnimal(animal);
    setIsFormOpen(true);
  };

  const handleDeleteAnimal = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este paciente?')) {
      try {
        await deleteAnimal(id);
      } catch (err) {
        alert('Erro ao excluir paciente');
      }
    }
  };

  const handleSubmitAnimal = async (data: Partial<Animal>) => {
    try {
      if (editingAnimal) {
        await updateAnimal(editingAnimal.id, data);
      } else {
        await createAnimal(data as Omit<Animal, 'id' | 'createdAt' | 'ownerId'>);
      }
      setIsFormOpen(false);
      setEditingAnimal(undefined);
    } catch (err) {
      alert('Erro ao salvar paciente');
    }
  };

  const speciesOptions = Array.from(new Set(animals.map(a => a.species)));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Erro: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pacientes</h1>
          <p className="text-gray-600">Gerencie os animais cadastrados na clínica</p>
        </div>
        
        <button
          onClick={handleAddAnimal}
          className="flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Novo Paciente
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome do animal, tutor ou espécie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Filter className="w-5 h-5 text-gray-400 mr-2" />
              <select
                value={selectedSpecies}
                onChange={(e) => setSelectedSpecies(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">Todas as espécies</option>
                {speciesOptions.map(species => (
                  <option key={species} value={species}>{species}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <span>
            Mostrando {filteredAnimals.length} de {animals.length} pacientes
          </span>
        </div>
      </div>

      {/* Animals Grid */}
      {filteredAnimals.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">🐾</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || selectedSpecies !== 'all' 
              ? 'Nenhum paciente encontrado' 
              : 'Nenhum paciente cadastrado'
            }
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || selectedSpecies !== 'all'
              ? 'Tente ajustar os filtros de busca'
              : 'Comece cadastrando o primeiro paciente da clínica'
            }
          </p>
          {!searchTerm && selectedSpecies === 'all' && (
            <button
              onClick={handleAddAnimal}
              className="inline-flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Cadastrar Primeiro Paciente
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAnimals.map((animal) => (
            <AnimalCard
              key={animal.id}
              animal={animal}
              onEdit={handleEditAnimal}
              onDelete={handleDeleteAnimal}
            />
          ))}
        </div>
      )}

      {/* Animal Form Modal */}
      <AnimalForm
        animal={editingAnimal}
        isOpen={isFormOpen}
        onSubmit={handleSubmitAnimal}
        onCancel={() => {
          setIsFormOpen(false);
          setEditingAnimal(undefined);
        }}
      />
    </div>
  );
}