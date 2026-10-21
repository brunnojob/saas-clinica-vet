import React, { lazy, Suspense } from 'react';
import { LoginForm } from './components/Auth/LoginForm';
import { Layout } from './components/Layout/Layout';
import { useAuth } from './hooks/useAuth';
import { isSupabaseConfigured } from './lib/supabase';

const Dashboard = lazy(() =>
  import('./pages/Dashboard').then((module) => ({ default: module.Dashboard })),
);

const Animals = lazy(() =>
  import('./pages/Animals').then((module) => ({ default: module.Animals })),
);

const Appointments = lazy(() =>
  import('./pages/Appointments').then((module) => ({
    default: module.Appointments,
  })),
);

const Inventory = lazy(() =>
  import('./pages/Inventory').then((module) => ({ default: module.Inventory })),
);

const Expenses = lazy(() =>
  import('./pages/Expenses').then((module) => ({ default: module.Expenses })),
);

const Reports = lazy(() =>
  import('./pages/Reports').then((module) => ({ default: module.Reports })),
);

const Users = lazy(() =>
  import('./pages/Users').then((module) => ({ default: module.Users })),
);

const Settings = lazy(() =>
  import('./pages/Settings').then((module) => ({ default: module.Settings })),
);

function App() {
  const { user, isLoading, login, logout, isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = React.useState('dashboard');

  if (!isSupabaseConfigured) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md bg-white border rounded-xl p-6">
          <h1 className="text-xl font-semibold">Configuração necessária</h1>
          <p className="mt-3 text-gray-600">
            Configure as variáveis do Supabase conforme o README e reinicie a
            aplicação.
          </p>
        </div>
      </main>
    );
  }

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
        return user?.role === 'admin' ? (
          <Users />
        ) : (
          <Dashboard onPageChange={setCurrentPage} />
        );
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
        <Suspense
          fallback={
            <p role="status" className="p-6 text-gray-600">
              Carregando...
            </p>
          }
        >
          {renderPage()}
        </Suspense>
      </Layout>
    </div>
  );
}

export default App;
