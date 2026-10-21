ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE animals DISABLE ROW LEVEL SECURITY;
ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários públicos podem ver todos os usuários" ON users;
DROP POLICY IF EXISTS "Usuários públicos podem inserir usuários" ON users;
DROP POLICY IF EXISTS "Usuários públicos podem atualizar usuários" ON users;
DROP POLICY IF EXISTS "Usuários públicos podem deletar usuários" ON users;

DROP POLICY IF EXISTS "Usuários públicos podem ver todos os animais" ON animals;
DROP POLICY IF EXISTS "Usuários públicos podem inserir animais" ON animals;
DROP POLICY IF EXISTS "Usuários públicos podem atualizar animais" ON animals;
DROP POLICY IF EXISTS "Usuários públicos podem deletar animais" ON animals;

DROP POLICY IF EXISTS "Usuários públicos podem ver todos os atendimentos" ON appointments;
DROP POLICY IF EXISTS "Usuários públicos podem inserir atendimentos" ON appointments;
DROP POLICY IF EXISTS "Usuários públicos podem atualizar atendimentos" ON appointments;
DROP POLICY IF EXISTS "Usuários públicos podem deletar atendimentos" ON appointments;

DROP POLICY IF EXISTS "Usuários públicos podem ver todos os itens do estoque" ON inventory_items;
DROP POLICY IF EXISTS "Usuários públicos podem inserir itens do estoque" ON inventory_items;
DROP POLICY IF EXISTS "Usuários públicos podem atualizar itens do estoque" ON inventory_items;
DROP POLICY IF EXISTS "Usuários públicos podem deletar itens do estoque" ON inventory_items;

DROP POLICY IF EXISTS "Usuários públicos podem ver todos os gastos" ON expenses;
DROP POLICY IF EXISTS "Usuários públicos podem inserir gastos" ON expenses;
DROP POLICY IF EXISTS "Usuários públicos podem atualizar gastos" ON expenses;
DROP POLICY IF EXISTS "Usuários públicos podem deletar gastos" ON expenses;

INSERT INTO users (name, email, role) VALUES
  ('Bruno Admin', 'admin@brunnoclinic.com', 'admin')
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  updated_at = now();

INSERT INTO users (name, email, role) VALUES
  ('Dr. Ana Silva', 'ana.silva@brunnoclinic.com', 'veterinarian'),
  ('Maria Auxiliar', 'maria@brunnoclinic.com', 'assistant')
ON CONFLICT (email) DO NOTHING;

DO $$
DECLARE
  user_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO user_count FROM users;

  IF user_count = 0 THEN
    RAISE EXCEPTION 'Nenhum usuário encontrado no banco de dados';
  END IF;
END $$;
