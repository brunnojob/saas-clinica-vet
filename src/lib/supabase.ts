import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase com service_role para bypass do RLS
const supabaseUrl = 'https://yfnadpjwwcryfzjdjuxt.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmbmFkcGp3d2NyeWZ6amRqdXh0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTEyODAwMCwiZXhwIjoyMDY2NzA0MDAwfQ.lpm5d_q1R92OrRGAygjI2i1HeXcRIQYDAoHrfqiKYMo';

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'X-Client-Info': 'brunnoclinic-pro-admin',
      'Authorization': `Bearer ${supabaseServiceKey}`,
    },
  },
});

// Verificar conexão
export const checkConnection = async () => {
  try {
    console.log('🔄 Verificando conexão com Supabase (service_role)...');
    
    // Testar conexão básica com service_role
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Erro de conexão com Supabase:', error);
      return false;
    }
    
    console.log('✅ Supabase conectado com sucesso usando service_role!');
    
    // Garantir que o usuário admin existe
    await ensureAdminUser();
    
    return true;
  } catch (error) {
    console.error('❌ Falha na conexão com Supabase:', error);
    return false;
  }
};

// Garantir que o usuário admin existe
const ensureAdminUser = async () => {
  try {
    console.log('👤 Verificando usuário admin...');
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'admin@brunnoclinic.com')
      .limit(1);
    
    if (error) {
      console.error('❌ Erro ao verificar usuário admin:', error);
      return;
    }
    
    if (!data || data.length === 0) {
      console.log('➕ Criando usuário admin...');
      
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          name: 'Bruno Admin',
          email: 'admin@brunnoclinic.com',
          role: 'admin',
          password: hashPassword('admin123'), // Senha padrão para admin
        });
      
      if (insertError) {
        console.error('❌ Erro ao criar usuário admin:', insertError);
      } else {
        console.log('✅ Usuário admin criado com sucesso! Senha: admin123');
      }
    } else {
      // Verificar se o admin tem senha definida
      const adminUser = data[0];
      if (!adminUser.password) {
        console.log('🔑 Definindo senha padrão para usuário admin...');
        
        const { error: updateError } = await supabase
          .from('users')
          .update({ password: hashPassword('admin123') })
          .eq('email', 'admin@brunnoclinic.com');
        
        if (updateError) {
          console.error('❌ Erro ao definir senha do admin:', updateError);
        } else {
          console.log('✅ Senha padrão definida para admin: admin123');
        }
      } else {
        console.log('✅ Usuário admin já existe com senha definida');
      }
    }
  } catch (error) {
    console.error('❌ Erro ao garantir usuário admin:', error);
  }
};

// Função simples de hash para senhas (para demonstração)
export const hashPassword = (password: string): string => {
  // Em produção, use uma biblioteca como bcrypt
  // Para demonstração, vamos usar uma codificação simples
  return btoa(password + 'brunnoclinic_salt');
};

// Função para verificar senha
export const verifyPassword = (password: string, hashedPassword: string): boolean => {
  return hashPassword(password) === hashedPassword;
};

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: 'veterinarian' | 'assistant' | 'admin';
          avatar?: string;
          password?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          role: 'veterinarian' | 'assistant' | 'admin';
          avatar?: string;
          password?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          role?: 'veterinarian' | 'assistant' | 'admin';
          avatar?: string;
          password?: string;
          updated_at?: string;
        };
      };
      animals: {
        Row: {
          id: string;
          name: string;
          species: string;
          registration_number?: string;
          age: number;
          gender: 'male' | 'female';
          weight: number;
          color: string;
          owner_name: string;
          owner_phone: string;
          owner_email?: string;
          owner_address?: string;
          owner_cpf?: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          species: string;
          registration_number?: string;
          age: number;
          gender: 'male' | 'female';
          weight: number;
          color: string;
          owner_name: string;
          owner_phone: string;
          owner_email?: string;
          owner_address?: string;
          owner_cpf?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          species?: string;
          registration_number?: string;
          age?: number;
          gender?: 'male' | 'female';
          weight?: number;
          color?: string;
          owner_name?: string;
          owner_phone?: string;
          owner_email?: string;
          owner_address?: string;
          owner_cpf?: string;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      appointments: {
        Row: {
          id: string;
          animal_id: string;
          veterinarian_id: string;
          date: string;
          type: 'consultation' | 'vaccination' | 'surgery' | 'exam' | 'follow-up';
          description: string;
          diagnosis?: string;
          treatment?: string;
          medications?: string[];
          next_appointment?: string;
          cost: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          animal_id: string;
          veterinarian_id: string;
          date: string;
          type: 'consultation' | 'vaccination' | 'surgery' | 'exam' | 'follow-up';
          description: string;
          diagnosis?: string;
          treatment?: string;
          medications?: string[];
          next_appointment?: string;
          cost?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          animal_id?: string;
          veterinarian_id?: string;
          date?: string;
          type?: 'consultation' | 'vaccination' | 'surgery' | 'exam' | 'follow-up';
          description?: string;
          diagnosis?: string;
          treatment?: string;
          medications?: string[];
          next_appointment?: string;
          cost?: number;
          updated_at?: string;
        };
      };
      inventory_items: {
        Row: {
          id: string;
          name: string;
          type: 'medication' | 'vaccine' | 'supply' | 'equipment';
          category: string;
          quantity: number;
          min_quantity: number;
          unit: string;
          expiration_date?: string;
          cost: number;
          supplier?: string;
          location?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: 'medication' | 'vaccine' | 'supply' | 'equipment';
          category: string;
          quantity: number;
          min_quantity: number;
          unit: string;
          expiration_date?: string;
          cost: number;
          supplier?: string;
          location?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: 'medication' | 'vaccine' | 'supply' | 'equipment';
          category?: string;
          quantity?: number;
          min_quantity?: number;
          unit?: string;
          expiration_date?: string;
          cost?: number;
          supplier?: string;
          location?: string;
          updated_at?: string;
        };
      };
      expenses: {
        Row: {
          id: string;
          appointment_id?: string;
          description: string;
          amount: number;
          date: string;
          category: 'medication' | 'procedure' | 'exam' | 'supply' | 'other';
          receipt?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          appointment_id?: string;
          description: string;
          amount: number;
          date: string;
          category: 'medication' | 'procedure' | 'exam' | 'supply' | 'other';
          receipt?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          appointment_id?: string;
          description?: string;
          amount?: number;
          date?: string;
          category?: 'medication' | 'procedure' | 'exam' | 'supply' | 'other';
          receipt?: string;
          updated_at?: string;
        };
      };
    };
  };
}