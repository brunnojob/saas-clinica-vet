BEGIN;

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS auth_user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE SCHEMA IF NOT EXISTS clinic_private;
REVOKE ALL ON SCHEMA clinic_private FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA clinic_private TO authenticated;

CREATE OR REPLACE FUNCTION clinic_private.current_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT role FROM public.users
  WHERE auth_user_id = (SELECT auth.uid())
    AND (SELECT auth.uid()) IS NOT NULL
$$;

REVOKE ALL ON FUNCTION clinic_private.current_role() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION clinic_private.current_role() TO authenticated;

DO $$
DECLARE
  policy_record record;
  table_name text;
BEGIN
  FOR policy_record IN
    SELECT tablename, policyname FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('users', 'animals', 'appointments', 'inventory_items', 'expenses')
  LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', policy_record.policyname, policy_record.tablename);
  END LOOP;

  FOREACH table_name IN ARRAY ARRAY['users', 'animals', 'appointments', 'inventory_items', 'expenses']
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
    EXECUTE format('REVOKE ALL ON public.%I FROM PUBLIC, anon, authenticated', table_name);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', table_name);
    EXECUTE format(
      'CREATE POLICY staff_read ON public.%I FOR SELECT TO authenticated USING ((SELECT clinic_private.current_role()) IN (''admin'', ''veterinarian'', ''assistant''))',
      table_name
    );
    IF table_name = 'users' THEN
      EXECUTE format(
        'CREATE POLICY admin_write ON public.%I FOR ALL TO authenticated USING ((SELECT clinic_private.current_role()) = ''admin'') WITH CHECK ((SELECT clinic_private.current_role()) = ''admin'')',
        table_name
      );
    ELSE
      EXECUTE format(
        'CREATE POLICY staff_write ON public.%I FOR ALL TO authenticated USING ((SELECT clinic_private.current_role()) IN (''admin'', ''veterinarian'', ''assistant'')) WITH CHECK ((SELECT clinic_private.current_role()) IN (''admin'', ''veterinarian'', ''assistant''))',
        table_name
      );
    END IF;
  END LOOP;
END;
$$;

REVOKE SELECT ON public.users FROM authenticated;
GRANT SELECT (id, name, email, role, avatar, created_at, updated_at, auth_user_id)
  ON public.users TO authenticated;
REVOKE INSERT, UPDATE ON public.users FROM authenticated;
GRANT INSERT (name, email, role, avatar, auth_user_id),
  UPDATE (name, email, role, avatar, auth_user_id, updated_at)
  ON public.users TO authenticated;

COMMIT;
