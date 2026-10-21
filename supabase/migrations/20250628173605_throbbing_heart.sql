TRUNCATE TABLE expenses CASCADE;
TRUNCATE TABLE appointments CASCADE;
TRUNCATE TABLE inventory_items CASCADE;
TRUNCATE TABLE animals CASCADE;
TRUNCATE TABLE users CASCADE;

INSERT INTO users (name, email, role) VALUES
  ('Bruno Admin', 'admin@brunnoclinic.com', 'admin');

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@brunnoclinic.com') THEN
    RAISE EXCEPTION 'Falha ao criar usuário admin';
  END IF;
END $$;
