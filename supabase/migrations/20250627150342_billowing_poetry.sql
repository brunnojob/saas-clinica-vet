CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('veterinarian', 'assistant', 'admin')),
  avatar text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS animals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  species text NOT NULL,
  registration_number text,
  age integer DEFAULT 0,
  gender text NOT NULL CHECK (gender IN ('male', 'female')),
  weight numeric DEFAULT 0,
  color text DEFAULT '',
  owner_name text NOT NULL,
  owner_phone text NOT NULL,
  owner_email text,
  owner_address text,
  owner_cpf text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id uuid REFERENCES animals(id) ON DELETE CASCADE,
  veterinarian_id uuid REFERENCES users(id) ON DELETE SET NULL,
  date timestamptz NOT NULL,
  type text NOT NULL CHECK (type IN ('consultation', 'vaccination', 'surgery', 'exam', 'follow-up')),
  description text NOT NULL,
  diagnosis text,
  treatment text,
  medications text[],
  next_appointment timestamptz,
  cost numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('medication', 'vaccine', 'supply', 'equipment')),
  category text DEFAULT '',
  quantity integer DEFAULT 0,
  min_quantity integer DEFAULT 0,
  unit text DEFAULT 'unidade',
  expiration_date date,
  cost numeric DEFAULT 0,
  supplier text,
  location text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid REFERENCES appointments(id) ON DELETE SET NULL,
  description text NOT NULL,
  amount numeric NOT NULL,
  date timestamptz NOT NULL,
  category text NOT NULL CHECK (category IN ('medication', 'procedure', 'exam', 'supply', 'other')),
  receipt text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE animals ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários autenticados podem ver todos os usuários"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem inserir usuários"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar usuários"
  ON users FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem deletar usuários"
  ON users FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem ver todos os animais"
  ON animals FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem inserir animais"
  ON animals FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar animais"
  ON animals FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem deletar animais"
  ON animals FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem ver todos os atendimentos"
  ON appointments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem inserir atendimentos"
  ON appointments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar atendimentos"
  ON appointments FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem deletar atendimentos"
  ON appointments FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem ver todos os itens do estoque"
  ON inventory_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem inserir itens do estoque"
  ON inventory_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar itens do estoque"
  ON inventory_items FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem deletar itens do estoque"
  ON inventory_items FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem ver todos os gastos"
  ON expenses FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem inserir gastos"
  ON expenses FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar gastos"
  ON expenses FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem deletar gastos"
  ON expenses FOR DELETE
  TO authenticated
  USING (true);

INSERT INTO users (name, email, role) VALUES
  ('Dr. Ana Silva', 'ana.silva@brunnoclinic.com', 'veterinarian'),
  ('Dr. Carlos Santos', 'carlos.santos@brunnoclinic.com', 'veterinarian'),
  ('Maria Auxiliar', 'maria@brunnoclinic.com', 'assistant'),
  ('Bruno Admin', 'admin@brunnoclinic.com', 'admin')
ON CONFLICT (email) DO NOTHING;
