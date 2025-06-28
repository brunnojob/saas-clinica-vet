import React, { useState, useEffect } from 'react';
import { Heart, Loader2, AlertCircle, CheckCircle, Users, Lock, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<boolean>;
  isLoading: boolean;
}

interface UserOption {
  id: string;
  name: string;
  email: string;
  role: string;
}

export function LoginForm({ onLogin, isLoading }: LoginFormProps) {
  const [email, setEmail] = useState('admin@brunnoclinic.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<UserOption[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Carregar usuários disponíveis
  useEffect(() => {
    const loadUsers = async () => {
      try {
        console.log('📋 Carregando usuários disponíveis...');
        const { data: users, error } = await supabase
          .from('users')
          .select('id, name, email, role')
          .order('created_at', { ascending: true });

        if (error) {
          console.error('❌ Erro ao carregar usuários:', error);
        } else {
          console.log(`✅ ${users?.length || 0} usuários encontrados`);
          setAvailableUsers(users || []);
        }
      } catch (err) {
        console.error('❌ Erro ao buscar usuários:', err);
      } finally {
        setLoadingUsers(false);
      }
    };

    loadUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting || isLoading) return;
    
    setError('');
    setIsSubmitting(true);
    setShowSuccess(false);
    
    try {
      console.log('📝 Formulário enviado para:', email);
      const success = await onLogin(email, password);
      
      if (success) {
        setShowSuccess(true);
        console.log('✅ Login realizado com sucesso!');
        // O redirecionamento será feito automaticamente pelo useAuth
      } else {
        setError('Email ou senha inválidos. Verifique as credenciais e tente novamente.');
      }
    } catch (err) {
      console.error('❌ Erro no formulário de login:', err);
      setError('Erro ao conectar. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUserSelect = (selectedUser: UserOption) => {
    setEmail(selectedUser.email);
    
    // Definir senhas padrão baseadas no usuário
    if (selectedUser.email === 'admin@brunnoclinic.com') {
      setPassword('admin123');
    } else {
      setPassword(''); // Limpar para que o usuário digite a senha personalizada
    }
    
    setError('');
  };

  const formatRole = (role: string) => {
    const roles = {
      admin: 'Administrador',
      veterinarian: 'Veterinário',
      assistant: 'Auxiliar',
    };
    return roles[role as keyof typeof roles] || role;
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'veterinarian': return 'bg-blue-100 text-blue-800';
      case 'assistant': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isFormDisabled = isLoading || isSubmitting;

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md animate-scale-in text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Login realizado com sucesso!</h2>
          <p className="text-gray-600">Redirecionando para o dashboard...</p>
          <div className="mt-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg animate-scale-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">BrunoClinic Pro</h1>
          <p className="text-gray-600 mt-2">Sistema de Gestão Veterinária</p>
        </div>

        {/* Available Users */}
        {!loadingUsers && availableUsers.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center mb-3">
              <Users className="w-5 h-5 text-blue-600 mr-2" />
              <h3 className="font-medium text-blue-900">Usuários Disponíveis:</h3>
            </div>
            <div className="space-y-2">
              {availableUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleUserSelect(user)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors hover:bg-blue-100 ${
                    email === user.email ? 'bg-blue-100 border-blue-300' : 'bg-white border-blue-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-blue-900">{user.name}</p>
                      <p className="text-sm text-blue-700">{user.email}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {formatRole(user.role)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-3 text-sm text-blue-800">
              <p><strong>Senhas:</strong></p>
              <p>• Admin: admin123</p>
              <p>• Outros: senha definida no cadastro</p>
            </div>
          </div>
        )}

        {loadingUsers && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500 mx-auto mb-2"></div>
            <p className="text-gray-600">Carregando usuários...</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isFormDisabled}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Selecione um usuário acima ou digite o email"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              <Lock className="w-4 h-4 inline mr-1" />
              Senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isFormDisabled}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Digite sua senha"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isFormDisabled}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isFormDisabled}
            className="w-full bg-primary-500 text-white py-3 rounded-lg font-medium hover:bg-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isFormDisabled ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                {isSubmitting ? 'Entrando...' : 'Carregando...'}
              </>
            ) : (
              'Entrar no Sistema'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Sistema integrado com Supabase
          </p>
        </div>
      </div>
    </div>
  );
}