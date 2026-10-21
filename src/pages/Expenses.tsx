import {
  Calculator,
  DollarSign,
  Plus,
  Search,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { useState } from 'react';
import { ExpenseForm } from '../components/Expenses/ExpenseForm';
import { useAnimals, useAppointments, useExpenses } from '../hooks/useDatabase';
import { Expense } from '../types';

export function Expenses() {
  const {
    expenses,
    loading,
    error,
    createExpense,
    updateExpense,
    deleteExpense,
  } = useExpenses();
  const { appointments } = useAppointments();
  const { animals } = useAnimals();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7),
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>();

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch = expense.description
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || expense.category === selectedCategory;
    const expenseMonth = expense.date.toISOString().slice(0, 7);
    const matchesMonth = expenseMonth === selectedMonth;

    return matchesSearch && matchesCategory && matchesMonth;
  });

  const totalExpenses = filteredExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0,
  );
  const averageExpense =
    filteredExpenses.length > 0 ? totalExpenses / filteredExpenses.length : 0;

  const expensesByCategory = filteredExpenses.reduce(
    (acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    },
    {} as Record<string, number>,
  );

  const handleAddExpense = () => {
    setEditingExpense(undefined);
    setIsFormOpen(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setIsFormOpen(true);
  };

  const handleDeleteExpense = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este gasto?')) {
      try {
        await deleteExpense(id);
      } catch {
        alert('Erro ao excluir gasto');
      }
    }
  };

  const handleSubmitExpense = async (data: Partial<Expense>) => {
    try {
      if (editingExpense) {
        await updateExpense(editingExpense.id, data);
      } else {
        await createExpense(data as Omit<Expense, 'id'>);
      }
      setIsFormOpen(false);
      setEditingExpense(undefined);
    } catch {
      alert('Erro ao salvar gasto');
    }
  };

  const formatCategory = (category: string) => {
    const categories = {
      medication: 'Medicamentos',
      procedure: 'Procedimentos',
      exam: 'Exames',
      supply: 'Materiais',
      other: 'Outros',
    };
    return categories[category as keyof typeof categories] || category;
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Gastos</h1>
          <p className="text-gray-600">
            Controle financeiro por atendimento e categoria
          </p>
        </div>

        <button
          onClick={handleAddExpense}
          className="flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Novo Gasto
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total do Mês</p>
              <p className="text-2xl font-bold text-gray-900">
                R$ {totalExpenses.toFixed(2)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-primary-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Média por Gasto
              </p>
              <p className="text-2xl font-bold text-secondary-600">
                R$ {averageExpense.toFixed(2)}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-secondary-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total de Gastos
              </p>
              <p className="text-2xl font-bold text-accent-600">
                {filteredExpenses.length}
              </p>
            </div>
            <Calculator className="w-8 h-8 text-accent-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Maior Categoria
              </p>
              <p className="text-lg font-bold text-green-600">
                {Object.keys(expensesByCategory).length > 0
                  ? formatCategory(
                      Object.entries(expensesByCategory).sort(
                        ([, a], [, b]) => b - a,
                      )[0][0],
                    )
                  : 'N/A'}
              </p>
            </div>
            <TrendingDown className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mês/Ano
            </label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoria
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">Todas as categorias</option>
              <option value="medication">Medicamentos</option>
              <option value="procedure">Procedimentos</option>
              <option value="exam">Exames</option>
              <option value="supply">Materiais</option>
              <option value="other">Outros</option>
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
                placeholder="Descrição do gasto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Gastos por Categoria
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(expensesByCategory).map(([category, amount]) => (
            <div key={category} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  {formatCategory(category)}
                </span>
                <span className="text-lg font-bold text-gray-900">
                  R$ {amount.toFixed(2)}
                </span>
              </div>
              <div className="mt-2 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-500 h-2 rounded-full"
                  style={{ width: `${(amount / totalExpenses) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Lista de Gastos -{' '}
            {new Date(selectedMonth).toLocaleDateString('pt-BR', {
              month: 'long',
              year: 'numeric',
            })}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {filteredExpenses.length} gasto(s) encontrado(s)
          </p>
        </div>

        {filteredExpenses.length === 0 ? (
          <div className="p-12 text-center">
            <Calculator className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum gasto encontrado
            </h3>
            <p className="text-gray-600 mb-6">
              Não há gastos registrados para os filtros selecionados
            </p>
            <button
              onClick={handleAddExpense}
              className="inline-flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Registrar Primeiro Gasto
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descrição
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Atendimento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredExpenses.map((expense) => {
                  const appointment = appointments.find(
                    (a) => a.id === expense.appointmentId,
                  );
                  const animal = appointment
                    ? animals.find((a) => a.id === appointment.medicalRecordId)
                    : null;

                  return (
                    <tr key={expense.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {expense.date.toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {expense.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          {formatCategory(expense.category)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        R$ {expense.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {animal
                          ? `${animal.name} - ${appointment?.description}`
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditExpense(expense)}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteExpense(expense.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isFormOpen && (
        <ExpenseForm
          expense={editingExpense}
          isOpen={isFormOpen}
          onSubmit={handleSubmitExpense}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingExpense(undefined);
          }}
        />
      )}
    </div>
  );
}
