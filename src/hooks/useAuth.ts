import { useState, useEffect } from 'react';
import { User } from '../types';
import { supabase, verifyPassword } from '../lib/supabase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        console.log('🔍 Verificando autenticação...');
        
        // Verificar se há usuário no localStorage
        const storedUser = localStorage.getItem('brunnoclinic_user');
        
        if (storedUser && isMounted) {
          try {
            const parsedUser = JSON.parse(storedUser);
            console.log('✅ Usuário encontrado no localStorage:', parsedUser.email);
            setUser(parsedUser);
          } catch (parseError) {
            console.error('❌ Erro ao fazer parse do usuário:', parseError);
            localStorage.removeItem('brunnoclinic_user');
          }
        }
      } catch (error) {
        console.error('❌ Erro ao verificar autenticação:', error);
        if (isMounted) {
          localStorage.removeItem('brunnoclinic_user');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('🔐 Tentando fazer login com:', email);
      
      // Buscar usuário no banco de dados
      console.log('🔍 Buscando usuário no Supabase...');
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .limit(1);

      if (error) {
        console.error('❌ Erro ao buscar usuário:', error);
        return false;
      }

      if (!users || users.length === 0) {
        console.error('❌ Usuário não encontrado no banco:', email);
        return false;
      }

      const userData = users[0];

      // Verificar senha
      let isPasswordValid = false;

      if (userData.password) {
        // Verificar senha personalizada
        isPasswordValid = verifyPassword(password, userData.password);
        console.log('🔑 Verificando senha personalizada...');
      } else {
        // Fallback para senha padrão (para usuários antigos)
        isPasswordValid = password === 'demo123';
        console.log('🔑 Usando senha padrão (demo123)...');
      }

      if (isPasswordValid) {
        const foundUser: User = {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          avatar: userData.avatar,
          createdAt: new Date(userData.created_at),
        };

        console.log('✅ Login bem-sucedido para:', foundUser.name, `(${foundUser.role})`);

        // Salvar usuário no estado e localStorage
        setUser(foundUser);
        localStorage.setItem('brunnoclinic_user', JSON.stringify(foundUser));
        
        return true;
      }

      console.log('❌ Senha incorreta para:', email);
      return false;
    } catch (error) {
      console.error('❌ Erro no login:', error);
      return false;
    }
  };

  const logout = () => {
    console.log('🚪 Fazendo logout...');
    setUser(null);
    localStorage.removeItem('brunnoclinic_user');
  };

  return {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
  };
}