import React, { useState } from 'react';
import { Calendar, Clock, User, Plus, Search, Filter } from 'lucide-react';
import { AppointmentForm } from '../components/Appointments/AppointmentForm';
import { Appointment } from '../types';
import { useAppointments, useAnimals, useUsers } from '../hooks/useDatabase';

export function Appointments() {
  const { appointments, loading, error, createAppointment, updateAppointment } = useAppointments();
  const { animals } = useAnimals();
  const { users } = useUsers();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedType, setSelectedType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | undefined>();

  const filteredAppointments = appointments.filter(appointment => {
    const matchesDate = appointment.date.toISOString().split('T')[0] === selectedDate;
    const matchesType = selectedType === 'all' || appointment.type === selectedType;
    
    const animal = animals.find(a => a.id === appointment.medicalRecordId);
    const veterinarian = users.find(u => u.id === appointment.veterinarianId);
    
    const matchesSearch = !searchTerm || 
      animal?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      animal?.owner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      veterinarian?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesDate && matchesType && matchesSearch;
  });

  const handleAddAppointment = () => {
    setEditingAppointment(undefined);
    setIsFormOpen(true);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setIsFormOpen(true);
  };

  const handleSubmitAppointment = async (data: Partial<Appointment>) => {
    try {
      if (editingAppointment) {
        await updateAppointment(editingAppointment.id, data);
      } else {
        await createAppointment(data as Omit<Appointment, 'id'>);
      }
      setIsFormOpen(false);
      setEditingAppointment(undefined);
    } catch (err) {
      alert('Erro ao salvar atendimento');
    }
  };

  const getAppointmentTypeColor = (type: string) => {
    switch (type) {
      case 'consultation': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'vaccination': return 'bg-green-100 text-green-800 border-green-200';
      case 'surgery': return 'bg-red-100 text-red-800 border-red-200';
      case 'exam': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatAppointmentType = (type: string) => {
    const types = {
      consultation: 'Consulta',
      vaccination: 'Vacinação',
      surgery: 'Cirurgia',
      exam: 'Exame',
      'follow-up': 'Retorno',
    };
    return types[type as keyof typeof types] || type;
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Atendimentos</h1>
          <p className="text-gray-600">Gerencie consultas e procedimentos</p>
        </div>
        
        <button 
          onClick={handleAddAppointment}
          className="flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Novo Atendimento
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Atendimento
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">Todos os tipos</option>
              <option value="consultation">Consulta</option>
              <option value="vaccination">Vacinação</option>
              <option value="surgery">Cirurgia</option>
              <option value="exam">Exame</option>
              <option value="follow-up">Retorno</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Animal, tutor ou veterinário..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Atendimentos - {new Date(selectedDate).toLocaleDateString('pt-BR')}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {filteredAppointments.length} atendimento(s) encontrado(s)
          </p>
        </div>

        {filteredAppointments.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum atendimento encontrado
            </h3>
            <p className="text-gray-600 mb-6">
              Não há atendimentos para os filtros selecionados
            </p>
            <button 
              onClick={handleAddAppointment}
              className="inline-flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Agendar Atendimento
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredAppointments.map((appointment) => {
              const animal = animals.find(a => a.id === appointment.medicalRecordId);
              const veterinarian = users.find(u => u.id === appointment.veterinarianId);
              
              return (
                <div key={appointment.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-medium text-gray-900">
                          {animal?.name || 'Animal Desconhecido'}
                        </h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getAppointmentTypeColor(appointment.type)}`}>
                          {formatAppointmentType(appointment.type)}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-3">{appointment.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center text-gray-500">
                          <User className="w-4 h-4 mr-2" />
                          <span>Tutor: {animal?.owner.name}</span>
                        </div>
                        
                        <div className="flex items-center text-gray-500">
                          <Clock className="w-4 h-4 mr-2" />
                          <span>Veterinário: {veterinarian?.name}</span>
                        </div>
                        
                        <div className="flex items-center text-gray-500">
                          <span className="font-medium">Valor: R$ {appointment.cost.toFixed(2)}</span>
                        </div>
                      </div>
                      
                      {appointment.diagnosis && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm font-medium text-gray-900 mb-1">Diagnóstico:</p>
                          <p className="text-sm text-gray-700">{appointment.diagnosis}</p>
                        </div>
                      )}
                      
                      {appointment.treatment && (
                        <div className="mt-2 p-3 bg-green-50 rounded-lg">
                          <p className="text-sm font-medium text-green-900 mb-1">Tratamento:</p>
                          <p className="text-sm text-green-700">{appointment.treatment}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-2 ml-4">
                      <button 
                        onClick={() => handleEditAppointment(appointment)}
                        className="px-3 py-1 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      >
                        Editar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Appointment Form Modal */}
      <AppointmentForm
        appointment={editingAppointment}
        isOpen={isFormOpen}
        onSubmit={handleSubmitAppointment}
        onCancel={() => {
          setIsFormOpen(false);
          setEditingAppointment(undefined);
        }}
      />
    </div>
  );
}