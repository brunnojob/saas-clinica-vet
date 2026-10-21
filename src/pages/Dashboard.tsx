import { Calendar, DollarSign, Heart, Package } from 'lucide-react';
import { InventoryAlerts } from '../components/Dashboard/InventoryAlerts';
import { RecentAppointments } from '../components/Dashboard/RecentAppointments';
import { StatsCard } from '../components/Dashboard/StatsCard';
import {
  useAnimals,
  useAppointments,
  useExpenses,
  useInventory,
} from '../hooks/useDatabase';

interface DashboardProps {
  onPageChange: (page: string) => void;
}

export function Dashboard({ onPageChange }: DashboardProps) {
  const { animals, loading: animalsLoading } = useAnimals();
  const { appointments, loading: appointmentsLoading } = useAppointments();
  const { items, loading: inventoryLoading } = useInventory();
  const { expenses, loading: expensesLoading } = useExpenses();

  const isLoading =
    animalsLoading ||
    appointmentsLoading ||
    inventoryLoading ||
    expensesLoading;

  const stats = {
    totalAnimals: animals.filter((animal) => animal.isActive).length,
    todayAppointments: appointments.filter(
      (a) => a.date.toDateString() === new Date().toDateString(),
    ).length,
    lowStockItems: items.filter((item) => item.quantity <= item.minQuantity)
      .length,
    monthlyExpenses: expenses
      .filter(
        (expense) =>
          expense.date.getFullYear() === new Date().getFullYear() &&
          expense.date.getMonth() === new Date().getMonth(),
      )
      .reduce((sum, expense) => sum + expense.amount, 0),
  };

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Bem-vindo</h1>
        <p className="text-primary-100">
          Gerencie sua clínica veterinária com eficiência e cuidado.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Pacientes Ativos"
          value={isLoading ? '...' : stats.totalAnimals}

          changeType="positive"
          icon={Heart}
          color="primary"
        />

        <StatsCard
          title="Atendimentos Hoje"
          value={isLoading ? '...' : stats.todayAppointments}

          changeType="neutral"
          icon={Calendar}
          color="secondary"
        />

        <StatsCard
          title="Itens em Falta"
          value={isLoading ? '...' : stats.lowStockItems}
          change={stats.lowStockItems > 0 ? 'Requer atenção' : 'Tudo ok'}
          changeType={stats.lowStockItems > 0 ? 'negative' : 'positive'}
          icon={Package}
          color="warning"
        />

        <StatsCard
          title="Gastos do Mês"
          value={isLoading ? '...' : `R$ ${stats.monthlyExpenses.toFixed(2)}`}
          change="+12% vs mês anterior"
          changeType="positive"
          icon={DollarSign}
          color="success"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RecentAppointments />
        <InventoryAlerts />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Ações Rápidas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => onPageChange('animals')}
            className="flex items-center p-4 bg-primary-50 border border-primary-200 rounded-lg hover:bg-primary-100 transition-colors"
          >
            <Heart className="w-6 h-6 text-primary-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-primary-900">Novo Paciente</p>
              <p className="text-sm text-primary-600">Cadastrar animal</p>
            </div>
          </button>

          <button
            onClick={() => onPageChange('appointments')}
            className="flex items-center p-4 bg-secondary-50 border border-secondary-200 rounded-lg hover:bg-secondary-100 transition-colors"
          >
            <Calendar className="w-6 h-6 text-secondary-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-secondary-900">Agendar Consulta</p>
              <p className="text-sm text-secondary-600">Novo atendimento</p>
            </div>
          </button>

          <button
            onClick={() => onPageChange('inventory')}
            className="flex items-center p-4 bg-accent-50 border border-accent-200 rounded-lg hover:bg-accent-100 transition-colors"
          >
            <Package className="w-6 h-6 text-accent-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-accent-900">Atualizar Estoque</p>
              <p className="text-sm text-accent-600">Gerenciar itens</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
