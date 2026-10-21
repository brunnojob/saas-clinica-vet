ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS animals DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS inventory_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS expenses DISABLE ROW LEVEL SECURITY;

DO $$
DECLARE
    r RECORD;
BEGIN

    FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON ' || r.schemaname || '.' || r.tablename;
    END LOOP;
END $$;

DELETE FROM expenses;
DELETE FROM appointments;
DELETE FROM inventory_items;
DELETE FROM animals;
DELETE FROM users;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'password'
  ) THEN
    ALTER TABLE users ADD COLUMN password text;
  ELSE
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('veterinarian', 'assistant', 'admin')),
  avatar text,
  password text,
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

INSERT INTO users (name, email, role, password) VALUES
  ('Bruno Admin', 'admin@brunnoclinic.com', 'admin', 'YWRtaW4xMjNicnVubm9jbGluaWNfc2FsdA==')
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  password = EXCLUDED.password,
  updated_at = now();

DO $$
DECLARE
  admin_exists boolean;
  admin_id uuid;
  admin_name text;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM users
    WHERE email = 'admin@brunnoclinic.com'
    AND password IS NOT NULL
  ) INTO admin_exists;

  IF admin_exists THEN
    SELECT id, name INTO admin_id, admin_name
    FROM users
    WHERE email = 'admin@brunnoclinic.com';
  ELSE
    RAISE EXCEPTION 'Falha ao criar usuário admin';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_animals_owner_name ON animals(owner_name);
CREATE INDEX IF NOT EXISTS idx_animals_species ON animals(species);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_animal_id ON appointments(animal_id);
CREATE INDEX IF NOT EXISTS idx_appointments_veterinarian_id ON appointments(veterinarian_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_name ON inventory_items(name);
CREATE INDEX IF NOT EXISTS idx_inventory_items_type ON inventory_items(type);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);

DO $$
DECLARE
  total_users integer;
  total_animals integer;
  total_appointments integer;
  total_inventory integer;
  total_expenses integer;
  tables_with_rls text[];
BEGIN

  SELECT COUNT(*) INTO total_users FROM users;
  SELECT COUNT(*) INTO total_animals FROM animals;
  SELECT COUNT(*) INTO total_appointments FROM appointments;
  SELECT COUNT(*) INTO total_inventory FROM inventory_items;
  SELECT COUNT(*) INTO total_expenses FROM expenses;

  SELECT ARRAY(
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
    AND rowsecurity = true
  ) INTO tables_with_rls;
END $$;
