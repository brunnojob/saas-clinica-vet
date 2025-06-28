/*
  # Adicionar coluna password na tabela users

  1. Alterações na Tabela
    - Adicionar coluna `password` na tabela `users`
    - Definir como texto opcional (nullable)
    - Atualizar usuário admin com senha padrão

  2. Dados
    - Definir senha padrão para usuário admin existente
*/

-- Adicionar coluna password se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'password'
  ) THEN
    ALTER TABLE users ADD COLUMN password text;
    RAISE NOTICE 'Coluna password adicionada à tabela users';
  ELSE
    RAISE NOTICE 'Coluna password já existe na tabela users';
  END IF;
END $$;

-- Atualizar usuário admin com senha padrão (hash de 'admin123')
UPDATE users 
SET password = 'YWRtaW4xMjNicnVubm9jbGluaWNfc2FsdA==' 
WHERE email = 'admin@brunnoclinic.com' AND password IS NULL;

-- Verificar se a atualização foi bem-sucedida
DO $$
DECLARE
  admin_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO admin_count 
  FROM users 
  WHERE email = 'admin@brunnoclinic.com' AND password IS NOT NULL;
  
  IF admin_count > 0 THEN
    RAISE NOTICE 'Usuário admin atualizado com senha padrão';
  ELSE
    RAISE NOTICE 'Usuário admin não encontrado ou senha não definida';
  END IF;
END $$;