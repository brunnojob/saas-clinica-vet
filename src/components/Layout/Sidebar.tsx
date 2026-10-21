import {
  BarChart3,
  Calculator,
  FileText,
  Heart,
  Home,
  LogOut,
  Package,
  Settings,
  Users,
} from 'lucide-react';
import { User } from '../../types';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  user: User;
  onLogout: () => void;
  isCollapsed: boolean;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'animals', label: 'Pacientes', icon: Heart },
  { id: 'appointments', label: 'Atendimentos', icon: FileText },
  { id: 'inventory', label: 'Estoque', icon: Package },
  { id: 'expenses', label: 'Gastos', icon: Calculator },
  { id: 'reports', label: 'Relatórios', icon: BarChart3 },
  { id: 'users', label: 'Usuários', icon: Users },
  { id: 'settings', label: 'Configurações', icon: Settings },
];

export function Sidebar({
  currentPage,
  onPageChange,
  user,
  onLogout,
  isCollapsed,
}: SidebarProps) {
  const filteredMenuItems = menuItems.filter((item) => {
    if (item.id === 'users' && user.role !== 'admin') return false;
    return true;
  });

  return (
    <div
      className={`bg-white border-r border-gray-200 transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      } flex flex-col h-full`}
    >
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
            <Heart className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <div className="ml-3">
              <h1 className="text-lg font-bold text-gray-900">
                Brunno Silveira
              </h1>
              <p className="text-xs text-gray-500">Gestão Veterinária</p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <li key={item.id}>
                <button
                  onClick={() => onPageChange(item.id)}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-500'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon
                    className={`w-5 h-5 ${isCollapsed ? 'mx-auto' : 'mr-3'}`}
                  />
                  {!isCollapsed && <span>{item.label}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200">
        {!isCollapsed && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user.role}</p>
          </div>
        )}
        <button
          onClick={onLogout}
          className={`w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title={isCollapsed ? 'Sair' : undefined}
        >
          <LogOut className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'}`} />
          {!isCollapsed && <span>Sair</span>}
        </button>
      </div>
    </div>
  );
}
