import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const db = new PGlite();
const admin = '00000000-0000-4000-8000-000000000001';
const assistant = '00000000-0000-4000-8000-000000000002';
const outsider = '00000000-0000-4000-8000-000000000003';
const read = (file: string) =>
  readFileSync(new URL('../' + file, import.meta.url), 'utf8');
const migration = read(
  'supabase/migrations/20261021012011_secure_clinic_access.sql',
);

beforeAll(async () => {
  await db.exec(`
    CREATE ROLE anon;
    CREATE ROLE authenticated;
    CREATE SCHEMA auth;
    GRANT USAGE ON SCHEMA auth, public TO anon, authenticated;
    CREATE TABLE auth.users (id uuid PRIMARY KEY);
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS
    $$ SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  `);
  await db.exec(
    read('supabase/migrations/20250627150342_billowing_poetry.sql').split(
      'ALTER TABLE users ENABLE',
    )[0],
  );
  await db.exec('ALTER TABLE public.users ADD COLUMN password text;');
  await db.exec(migration);
  await db.exec(migration);
  await db.exec(`
    INSERT INTO auth.users VALUES ('${admin}'), ('${assistant}'), ('${outsider}');
    INSERT INTO public.users (name, email, role, auth_user_id, password) VALUES
      ('Admin', 'admin@example.com', 'admin', '${admin}', 'legacy'),
      ('Auxiliar', 'aux@example.com', 'assistant', '${assistant}', 'legacy');
    INSERT INTO public.animals (name, species, gender, owner_name, owner_phone)
      VALUES ('Teste', 'Cachorro', 'male', 'Responsável fictício', '000000000');
  `);
}, 30000);
afterAll(async () => {
  await db.close();
});

async function asUser(id: string | null, sql: string) {
  await db.exec('BEGIN');
  try {
    await db.query("SELECT set_config('request.jwt.claim.sub', $1, true)", [
      id ?? '',
    ]);
    await db.exec(`SET LOCAL ROLE ${id ? 'authenticated' : 'anon'}`);
    return await db.query(sql);
  } finally {
    await db.exec('ROLLBACK');
  }
}

describe('permissões da clínica', () => {
  it('bloqueia visitantes anônimos', async () => {
    await expect(asUser(null, 'SELECT * FROM public.animals')).rejects.toThrow(
      /permission denied/i,
    );
  });
  it('não libera registros para uma conta sem vínculo', async () => {
    expect(
      (await asUser(outsider, 'SELECT * FROM public.animals')).rows,
    ).toHaveLength(0);
  });
  it('permite que a equipe vinculada leia os animais', async () => {
    expect(
      (await asUser(assistant, 'SELECT * FROM public.animals')).rows,
    ).toHaveLength(1);
  });
  it('permite que a equipe registre gastos', async () => {
    const result = await asUser(
      assistant,
      "INSERT INTO public.expenses (description, amount, date, category) VALUES ('Material', 10, now(), 'supply') RETURNING id",
    );
    expect(result.rows).toHaveLength(1);
  });
  it('impede que uma conta sem vínculo registre gastos', async () => {
    await expect(
      asUser(
        outsider,
        "INSERT INTO public.expenses (description, amount, date, category) VALUES ('Material', 10, now(), 'supply')",
      ),
    ).rejects.toThrow(/row-level security/i);
  });
  it('impede que auxiliares promovam o próprio perfil', async () => {
    const result = await asUser(
      assistant,
      `UPDATE public.users SET role = 'admin' WHERE auth_user_id = '${assistant}' RETURNING id`,
    );
    expect(result.rows).toHaveLength(0);
  });
  it('permite que o administrador altere perfis', async () => {
    const result = await asUser(
      admin,
      `UPDATE public.users SET name = 'Atualizado' WHERE auth_user_id = '${assistant}' RETURNING name`,
    );
    expect(result.rows).toEqual([{ name: 'Atualizado' }]);
  });
  it('não expõe senhas antigas nem para administradores', async () => {
    await expect(
      asUser(admin, 'SELECT password FROM public.users'),
    ).rejects.toThrow(/permission denied/i);
  });
  it('não permite alterar senhas pela tabela de perfis', async () => {
    await expect(
      asUser(admin, "UPDATE public.users SET password = 'changed'"),
    ).rejects.toThrow(/permission denied/i);
  });
});
