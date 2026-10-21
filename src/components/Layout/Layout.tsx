import React, { useState } from 'react';
import { User } from '../../types';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  user: User;
  onLogout: () => void;
  currentPage: string;
  onPageChange: (page: string) => void;
  children: React.ReactNode;
}

const pageTitles: Record<string, string> = {
  dashboard: 'Dashboard',
  animals: 'Gerenciar Pacientes',
  appointments: 'Atendimentos',
  inventory: 'Controle de Estoque',
  expenses: 'Gestão de Gastos',
  reports: 'Relatórios',
  users: 'Usuários',
  settings: 'Configurações',
};

export function Layout({
  user,
  onLogout,
  currentPage,
  onPageChange,
  children,
}: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="h-screen flex bg-gray-50">
      <Sidebar
        currentPage={currentPage}
        onPageChange={onPageChange}
        user={user}
        onLogout={onLogout}
        isCollapsed={sidebarCollapsed}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          user={user}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          currentPageTitle={pageTitles[currentPage] || 'Dashboard'}
        />

        <main className="flex-1 overflow-auto p-6">
          <div className="animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
}
