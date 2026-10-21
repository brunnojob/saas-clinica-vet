import { Calendar, Clock, User } from 'lucide-react';
import { useAnimals, useAppointments, useUsers } from '../../hooks/useDatabase';

export function RecentAppointments() {
  const { appointments, loading: appointmentsLoading } = useAppointments();
  const { animals } = useAnimals();
  const { users } = useUsers();

  if (appointmentsLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Atendimentos Recentes
          </h3>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
          <p className="text-gray-500 mt-2">Carregando...</p>
        </div>
      </div>
    );
  }

  const recentAppointments = appointments.slice(0, 5);

  const getAppointmentTypeColor = (type: string) => {
    switch (type) {
      case 'consultation':
        return 'bg-blue-100 text-blue-800';
      case 'vaccination':
        return 'bg-green-100 text-green-800';
      case 'surgery':
        return 'bg-red-100 text-red-800';
      case 'exam':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  if (recentAppointments.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Atendimentos Recentes
          </h3>
        </div>
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Nenhum atendimento registrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Atendimentos Recentes
        </h3>
        <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
          Ver todos
        </button>
      </div>

      <div className="space-y-4">
        {recentAppointments.map((appointment) => {
          const animal = animals.find(
            (a) => a.id === appointment.medicalRecordId,
          );
          const veterinarian = users.find(
            (u) => u.id === appointment.veterinarianId,
          );

          return (
            <div
              key={appointment.id}
              className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary-600" />
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">
                    {animal?.name || 'Animal'} - {appointment.description}
                  </p>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getAppointmentTypeColor(appointment.type)}`}
                  >
                    {formatAppointmentType(appointment.type)}
                  </span>
                </div>
                <div className="flex items-center text-xs text-gray-500 mt-1 space-x-4">
                  <div className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {appointment.date.toLocaleDateString('pt-BR')}
                  </div>
                  <div className="flex items-center">
                    <User className="w-3 h-3 mr-1" />
                    {veterinarian?.name || 'Veterinário'}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
