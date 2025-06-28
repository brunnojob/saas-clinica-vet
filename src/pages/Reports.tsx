import React, { useState } from 'react';
import { BarChart3, Download, Calendar, FileText, TrendingUp, PieChart } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell } from 'recharts';
import { mockAppointments, mockAnimals, mockExpenses, mockInventoryItems } from '../data/mockData';

export function Reports() {
  const [selectedReport, setSelectedReport] = useState('appointments');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  // Dados para gráficos
  const appointmentsByType = mockAppointments.reduce((acc, appointment) => {
    const type = appointment.type;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const appointmentChartData = Object.entries(appointmentsByType).map(([type, count]) => ({
    name: type === 'consultation' ? 'Consultas' : 
          type === 'vaccination' ? 'Vacinações' : 
          type === 'surgery' ? 'Cirurgias' : 
          type === 'exam' ? 'Exames' : 'Outros',
    value: count
  }));

  const expensesByMonth = mockExpenses.reduce((acc, expense) => {
    const month = expense.date.toLocaleDateString('pt-BR', { month: 'short' });
    acc[month] = (acc[month] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const expenseChartData = Object.entries(expensesByMonth).map(([month, amount]) => ({
    month,
    amount
  }));

  const COLORS = ['#059669', '#0284C7', '#EA580C', '#DC2626', '#7C3AED'];

  const generateReport = () => {
    alert('Relatório gerado! (Funcionalidade de download será implementada)');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600">Análises e estatísticas da clínica</p>
        </div>
        
        <button 
          onClick={generateReport}
          className="flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          <Download className="w-5 h-5 mr-2" />
          Exportar Relatório
        </button>
      </div>

      {/* Report Type Selection */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Relatório
            </label>
            <select
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="appointments">Atendimentos</option>
              <option value="financial">Financeiro</option>
              <option value="inventory">Estoque</option>
              <option value="patients">Pacientes</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data Início
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data Fim
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-end">
            <button className="w-full px-4 py-2 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 transition-colors">
              Filtrar
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Atendimentos</p>
              <p className="text-2xl font-bold text-gray-900">{mockAppointments.length}</p>
            </div>
            <FileText className="w-8 h-8 text-primary-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pacientes Ativos</p>
              <p className="text-2xl font-bold text-secondary-600">{mockAnimals.length}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-secondary-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Receita Total</p>
              <p className="text-2xl font-bold text-green-600">
                R$ {mockExpenses.reduce((sum, expense) => sum + expense.amount, 0).toFixed(2)}
              </p>
            </div>
            <BarChart3 className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Itens Estoque</p>
              <p className="text-2xl font-bold text-accent-600">{mockInventoryItems.length}</p>
            </div>
            <PieChart className="w-8 h-8 text-accent-500" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointments by Type */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Atendimentos por Tipo</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <RechartsPieChart data={appointmentChartData}>
                {appointmentChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </RechartsPieChart>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Expenses */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Gastos Mensais</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={expenseChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`R$ ${value}`, 'Valor']} />
              <Bar dataKey="amount" fill="#059669" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Report Table */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Relatório Detalhado - {selectedReport === 'appointments' ? 'Atendimentos' : 
                                   selectedReport === 'financial' ? 'Financeiro' :
                                   selectedReport === 'inventory' ? 'Estoque' : 'Pacientes'}
          </h3>
        </div>

        <div className="p-6">
          {selectedReport === 'appointments' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Paciente</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {mockAppointments.map((appointment) => {
                    const animal = mockAnimals.find(a => a.id === appointment.medicalRecordId);
                    return (
                      <tr key={appointment.id}>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {appointment.date.toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">{animal?.name}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{appointment.type}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">R$ {appointment.cost.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {selectedReport === 'financial' && (
            <div className="text-center py-8">
              <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Relatório financeiro detalhado em desenvolvimento</p>
            </div>
          )}

          {selectedReport === 'inventory' && (
            <div className="text-center py-8">
              <PieChart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Relatório de estoque detalhado em desenvolvimento</p>
            </div>
          )}

          {selectedReport === 'patients' && (
            <div className="text-center py-8">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Relatório de pacientes detalhado em desenvolvimento</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}