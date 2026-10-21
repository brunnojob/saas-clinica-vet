import {
  AlertTriangle,
  Package,
  Plus,
  Search,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { useState } from 'react';
import { InventoryForm } from '../components/Inventory/InventoryForm';
import { useInventory } from '../hooks/useDatabase';
import { InventoryItem } from '../types';

export function Inventory() {
  const { items, loading, error, createItem, updateItem, deleteItem } =
    useInventory();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [showLowStock, setShowLowStock] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formType, setFormType] = useState<'add' | 'in' | 'out'>('add');
  const [editingItem, setEditingItem] = useState<InventoryItem | undefined>();

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = selectedType === 'all' || item.type === selectedType;
    const matchesStock = !showLowStock || item.quantity <= item.minQuantity;

    return matchesSearch && matchesType && matchesStock;
  });

  const handleAddItem = () => {
    setEditingItem(undefined);
    setFormType('add');
    setIsFormOpen(true);
  };

  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item);
    setFormType('add');
    setIsFormOpen(true);
  };

  const handleStockIn = (item: InventoryItem) => {
    setEditingItem(item);
    setFormType('in');
    setIsFormOpen(true);
  };

  const handleStockOut = (item: InventoryItem) => {
    setEditingItem(item);
    setFormType('out');
    setIsFormOpen(true);
  };

  const handleSubmitItem = async (data: Partial<InventoryItem>) => {
    try {
      if (formType === 'add') {
        if (editingItem) {
          await updateItem(editingItem.id, data);
        } else {
          await createItem(data as Omit<InventoryItem, 'id'>);
        }
      } else if (formType === 'in' && editingItem) {
        await updateItem(editingItem.id, {
          quantity: editingItem.quantity + (data.quantity || 0),
        });
      } else if (formType === 'out' && editingItem) {
        await updateItem(editingItem.id, {
          quantity: Math.max(0, editingItem.quantity - (data.quantity || 0)),
        });
      }

      setIsFormOpen(false);
      setEditingItem(undefined);
    } catch {
      alert('Erro ao salvar item');
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este item?')) {
      try {
        await deleteItem(id);
      } catch {
        alert('Erro ao excluir item');
      }
    }
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.quantity <= 0) {
      return {
        status: 'out',
        color: 'bg-red-100 text-red-800 border-red-200',
        text: 'Sem estoque',
      };
    } else if (item.quantity <= item.minQuantity) {
      return {
        status: 'low',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        text: 'Estoque baixo',
      };
    } else {
      return {
        status: 'ok',
        color: 'bg-green-100 text-green-800 border-green-200',
        text: 'Em estoque',
      };
    }
  };

  const getExpirationStatus = (expirationDate?: Date) => {
    if (!expirationDate) return null;

    const daysUntilExpiry = Math.ceil(
      (expirationDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysUntilExpiry <= 0) {
      return { color: 'text-red-600', text: 'Vencido' };
    } else if (daysUntilExpiry <= 30) {
      return {
        color: 'text-yellow-600',
        text: `Vence em ${daysUntilExpiry} dias`,
      };
    }

    return null;
  };

  const formatItemType = (type: string) => {
    const types = {
      medication: 'Medicamento',
      vaccine: 'Vacina',
      supply: 'Material',
      equipment: 'Equipamento',
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Controle de Estoque
          </h1>
          <p className="text-gray-600">
            Gerencie medicamentos, vacinas e materiais
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => {
              setFormType('in');
              setEditingItem(undefined);
              setIsFormOpen(true);
            }}
            className="flex items-center px-4 py-2 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 transition-colors"
          >
            <TrendingUp className="w-5 h-5 mr-2" />
            Entrada
          </button>
          <button
            onClick={() => {
              setFormType('out');
              setEditingItem(undefined);
              setIsFormOpen(true);
            }}
            className="flex items-center px-4 py-2 bg-accent-500 text-white rounded-lg hover:bg-accent-600 transition-colors"
          >
            <TrendingDown className="w-5 h-5 mr-2" />
            Saída
          </button>
          <button
            onClick={handleAddItem}
            className="flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Novo Item
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total de Itens
              </p>
              <p className="text-2xl font-bold text-gray-900">{items.length}</p>
            </div>
            <Package className="w-8 h-8 text-primary-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Estoque Baixo</p>
              <p className="text-2xl font-bold text-yellow-600">
                {
                  items.filter((item) => item.quantity <= item.minQuantity)
                    .length
                }
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Vencendo</p>
              <p className="text-2xl font-bold text-red-600">
                {
                  items.filter((item) => {
                    if (!item.expirationDate) return false;
                    const days = Math.ceil(
                      (item.expirationDate.getTime() - new Date().getTime()) /
                        (1000 * 60 * 60 * 24),
                    );
                    return days <= 30 && days > 0;
                  }).length
                }
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Valor Total</p>
              <p className="text-2xl font-bold text-green-600">
                R${' '}
                {items
                  .reduce((sum, item) => sum + item.cost * item.quantity, 0)
                  .toFixed(2)}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome ou categoria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">Todos os tipos</option>
              <option value="medication">Medicamentos</option>
              <option value="vaccine">Vacinas</option>
              <option value="supply">Materiais</option>
              <option value="equipment">Equipamentos</option>
            </select>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showLowStock}
                onChange={(e) => setShowLowStock(e.target.checked)}
                className="mr-2 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">
                Apenas estoque baixo
              </span>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Itens do Estoque
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {filteredItems.length} item(ns) encontrado(s)
          </p>
        </div>

        {filteredItems.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum item encontrado
            </h3>
            <p className="text-gray-600">Tente ajustar os filtros de busca</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantidade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Validade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.map((item) => {
                  const stockStatus = getStockStatus(item);
                  const expirationStatus = getExpirationStatus(
                    item.expirationDate,
                  );

                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.category}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {formatItemType(item.type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {item.quantity} {item.unit}
                        </div>
                        <div className="text-xs text-gray-500">
                          Mín: {item.minQuantity} {item.unit}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${stockStatus.color}`}
                        >
                          {stockStatus.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.expirationDate ? (
                          <div>
                            <div className="text-sm text-gray-900">
                              {item.expirationDate.toLocaleDateString('pt-BR')}
                            </div>
                            {expirationStatus && (
                              <div
                                className={`text-xs ${expirationStatus.color}`}
                              >
                                {expirationStatus.text}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          R$ {(item.cost * item.quantity).toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">
                          R$ {item.cost.toFixed(2)}/{item.unit}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditItem(item)}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleStockIn(item)}
                            className="text-secondary-600 hover:text-secondary-900"
                          >
                            Entrada
                          </button>
                          <button
                            onClick={() => handleStockOut(item)}
                            className="text-accent-600 hover:text-accent-900"
                          >
                            Saída
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
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
        <InventoryForm
          item={editingItem}
          type={formType}
          isOpen={isFormOpen}
          onSubmit={handleSubmitItem}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingItem(undefined);
          }}
        />
      )}
    </div>
  );
}
