import { AlertTriangle, Package } from 'lucide-react';
import { useInventory } from '../../hooks/useDatabase';

export function InventoryAlerts() {
  const { items, loading, error } = useInventory();

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Alertas de Estoque
          </h3>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
          <p className="text-gray-500 mt-2">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Alertas de Estoque
          </h3>
        </div>
        <div className="text-center py-8">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-red-500">Erro ao carregar alertas</p>
        </div>
      </div>
    );
  }

  const lowStockItems = items.filter(
    (item) => item.quantity <= item.minQuantity,
  );
  const expiringItems = items.filter((item) => {
    if (!item.expirationDate) return false;
    const daysUntilExpiry = Math.ceil(
      (item.expirationDate.getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24),
    );
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  });

  const totalAlerts = lowStockItems.length + expiringItems.length;

  if (totalAlerts === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Alertas de Estoque
          </h3>
        </div>
        <div className="text-center py-8">
          <Package className="w-12 h-12 text-green-400 mx-auto mb-3" />
          <p className="text-gray-500">
            Todos os itens estão em estoque adequado
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Alertas de Estoque
        </h3>
        <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
          {totalAlerts} alertas
        </span>
      </div>

      <div className="space-y-4">
        {lowStockItems.map((item) => (
          <div
            key={`low-${item.id}`}
            className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg"
          >
            <AlertTriangle className="w-5 h-5 text-red-500 mr-3" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900">{item.name}</p>
              <p className="text-xs text-red-700">
                Estoque baixo: {item.quantity} {item.unit} (mín:{' '}
                {item.minQuantity})
              </p>
            </div>
          </div>
        ))}

        {expiringItems.map((item) => {
          const daysUntilExpiry = Math.ceil(
            (item.expirationDate!.getTime() - new Date().getTime()) /
              (1000 * 60 * 60 * 24),
          );

          return (
            <div
              key={`exp-${item.id}`}
              className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
            >
              <AlertTriangle className="w-5 h-5 text-yellow-500 mr-3" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-900">
                  {item.name}
                </p>
                <p className="text-xs text-yellow-700">
                  Vence em {daysUntilExpiry} dias (
                  {item.expirationDate!.toLocaleDateString('pt-BR')})
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
