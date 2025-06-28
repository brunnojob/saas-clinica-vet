import React, { useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { LoginForm } from './components/Auth/LoginForm';
import { Layout } from './components/Layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Animals } from './pages/Animals';
import { Appointments } from './pages/Appointments';
import { Inventory } from './pages/Inventory';
import { Expenses } from './pages/Expenses';
import { Reports } from './pages/Reports';
import { Users } from './pages/Users';
import { Settings } from './pages/Settings';
import { checkConnection } from './lib/supabase';

function App() {
  const { user, isLoading, login, logout, isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = React.useState('dashboard');

  useEffect(() => {
    // Verificar conexão com Supabase ao carregar
    const initializeApp = async () => {
      try {
        console.log('🚀 Inicializando aplicação...');
        await checkConnection();
      } catch (error) {
        console.error('❌ Erro ao inicializar aplicação:', error);
      }
    };

    initializeApp();
  }, []);

  // Mostrar loading apenas durante a verificação inicial de autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando BrunoClinic Pro...</p>
        </div>
      </div>
    );
  }

  // Se não está autenticado, mostrar tela de login
  if (!isAuthenticated) {
    return <LoginForm onLogin={login} isLoading={false} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onPageChange={setCurrentPage} />;
      case 'animals':
        return <Animals />;
      case 'appointments':
        return <Appointments />;
      case 'inventory':
        return <Inventory />;
      case 'expenses':
        return <Expenses />;
      case 'reports':
        return <Reports />;
      case 'users':
        return <Users />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard onPageChange={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Layout
        user={user!}
        onLogout={logout}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      >
        {renderPage()}
      </Layout>
    </div>
  );
}

export default App;