/*
  # Limpar banco de dados e criar apenas usuário admin

  1. Limpeza Completa
    - Remove todos os dados existentes de todas as tabelas
    - Mantém a estrutura das tabelas

  2. Usuário Admin Único
    - Cria apenas um usuário administrador
    - Email: admin@brunnoclinic.com
    - Senha: demo123 (validada no frontend)

  3. Segurança
    - Mantém RLS habilitado
    - Políticas permitem acesso público para desenvolvimento
*/

-- Limpar todos os dados existentes
TRUNCATE TABLE expenses CASCADE;
TRUNCATE TABLE appointments CASCADE;
TRUNCATE TABLE inventory_items CASCADE;
TRUNCATE TABLE animals CASCADE;
TRUNCATE TABLE users CASCADE;

-- Inserir apenas o usuário admin
INSERT INTO users (name, email, role) VALUES
  ('Bruno Admin', 'admin@brunnoclinic.com', 'admin');

-- Verificar se o usuário foi criado
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@brunnoclinic.com') THEN
    RAISE EXCEPTION 'Falha ao criar usuário admin';
  END IF;
  
  RAISE NOTICE 'Usuário admin criado com sucesso: admin@brunnoclinic.com';
END $$;