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

UPDATE users
SET password = 'YWRtaW4xMjNicnVubm9jbGluaWNfc2FsdA=='
WHERE email = 'admin@brunnoclinic.com' AND password IS NULL;

DO $$
DECLARE
  admin_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO admin_count
  FROM users
  WHERE email = 'admin@brunnoclinic.com' AND password IS NOT NULL;

  IF admin_count > 0 THEN
  ELSE
  END IF;
END $$;
