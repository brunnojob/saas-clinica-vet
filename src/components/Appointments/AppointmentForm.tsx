import { X } from 'lucide-react';
import React, { useState } from 'react';
import { useAnimals, useUsers } from '../../hooks/useDatabase';
import { Appointment } from '../../types';

interface AppointmentFormProps {
  appointment?: Appointment;
  onSubmit: (data: Partial<Appointment>) => void;
  onCancel: () => void;
  isOpen: boolean;
}

export function AppointmentForm({
  appointment,
  onSubmit,
  onCancel,
  isOpen,
}: AppointmentFormProps) {
  const { animals } = useAnimals();
  const { users } = useUsers();

  const [formData, setFormData] = useState({
    medicalRecordId: appointment?.medicalRecordId || '',
    date: appointment?.date ? appointment.date.toISOString().slice(0, 16) : '',
    type: appointment?.type || 'consultation',
    description: appointment?.description || '',
    diagnosis: appointment?.diagnosis || '',
    treatment: appointment?.treatment || '',
    medications: appointment?.medications?.join(', ') || '',
    veterinarianId: appointment?.veterinarianId || '',
    cost: appointment?.cost || 0,
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const appointmentData: Partial<Appointment> = {
      medicalRecordId: formData.medicalRecordId,
      date: new Date(formData.date),
      type: formData.type as Appointment['type'],
      description: formData.description,
      diagnosis: formData.diagnosis,
      treatment: formData.treatment,
      medications: formData.medications
        .split(',')
        .map((m) => m.trim())
        .filter((m) => m),
      veterinarianId: formData.veterinarianId,
      cost: formData.cost,
    };

    onSubmit(appointmentData);
  };

  const veterinarians = users.filter((user) => user.role === 'veterinarian');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {appointment ? 'Editar Atendimento' : 'Novo Atendimento'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paciente *
              </label>
              <select
                value={formData.medicalRecordId}
                onChange={(e) =>
                  setFormData({ ...formData, medicalRecordId: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              >
                <option value="">Selecione um paciente</option>
                {animals.map((animal) => (
                  <option key={animal.id} value={animal.id}>
                    {animal.name} - {animal.owner.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Veterinário *
              </label>
              <select
                value={formData.veterinarianId}
                onChange={(e) =>
                  setFormData({ ...formData, veterinarianId: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              >
                <option value="">Selecione um veterinário</option>
                {veterinarians.map((vet) => (
                  <option key={vet.id} value={vet.id}>
                    {vet.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data e Hora *
              </label>
              <input
                type="datetime-local"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Atendimento *
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as Appointment['type'],
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              >
                <option value="consultation">Consulta</option>
                <option value="vaccination">Vacinação</option>
                <option value="surgery">Cirurgia</option>
                <option value="exam">Exame</option>
                <option value="follow-up">Retorno</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Descreva o motivo do atendimento..."
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Diagnóstico
              </label>
              <textarea
                value={formData.diagnosis}
                onChange={(e) =>
                  setFormData({ ...formData, diagnosis: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Diagnóstico do veterinário..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tratamento
              </label>
              <textarea
                value={formData.treatment}
                onChange={(e) =>
                  setFormData({ ...formData, treatment: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Tratamento prescrito..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Medicamentos
              </label>
              <input
                type="text"
                value={formData.medications}
                onChange={(e) =>
                  setFormData({ ...formData, medications: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Medicamentos utilizados (separados por vírgula)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor (R$)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.cost}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    cost: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              {appointment ? 'Atualizar' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
