import { act, create, ReactTestRenderer } from 'react-test-renderer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuth } from '../src/hooks/useAuth';

const mock = vi.hoisted(() => ({
  getUser: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  onChange: vi.fn(),
  unsubscribe: vi.fn(),
  profile: vi.fn(),
}));
vi.mock('../src/lib/supabase', () => ({
  isSupabaseConfigured: true,
  supabase: {
    auth: {
      getUser: mock.getUser,
      signInWithPassword: mock.signIn,
      signOut: mock.signOut,
      onAuthStateChange: mock.onChange,
    },
  },
}));
vi.mock('../src/services/auth', () => ({ loadUserProfile: mock.profile }));

let auth: ReturnType<typeof useAuth>;
let renderer: ReactTestRenderer;
let notify: (event: string, session: { user: { id: string } } | null) => void;
function Probe() {
  auth = useAuth();
  return null;
}
const profile = {
  id: 'profile-1',
  name: 'Teste',
  email: 'teste@example.com',
  role: 'admin',
  createdAt: new Date(),
};

beforeEach(async () => {
  vi.resetAllMocks();
  mock.getUser.mockResolvedValue({ data: { user: null }, error: null });
  mock.signOut.mockResolvedValue({ error: null });
  mock.onChange.mockImplementation((callback) => {
    notify = callback;
    return { data: { subscription: { unsubscribe: mock.unsubscribe } } };
  });
  await act(async () => {
    renderer = create(<Probe />);
  });
});
afterEach(() => {
  act(() => renderer.unmount());
});

describe('autenticação', () => {
  it('inicia sem usuário e termina o carregamento', () => {
    expect(auth.isLoading).toBe(false);
    expect(auth.isAuthenticated).toBe(false);
  });
  it('recusa credenciais inválidas sem buscar perfis', async () => {
    mock.signIn.mockResolvedValue({
      data: { user: null },
      error: new Error('invalid'),
    });
    await act(async () => {
      expect(await auth.login('teste@example.com', 'incorrect')).toBe(false);
    });
    expect(mock.profile).not.toHaveBeenCalled();
  });
  it('usa Supabase Auth e carrega somente o perfil vinculado', async () => {
    mock.signIn.mockResolvedValue({
      data: { user: { id: 'auth-1' } },
      error: null,
    });
    mock.profile.mockResolvedValue(profile);
    await act(async () => {
      expect(await auth.login(' teste@example.com ', 'secret')).toBe(true);
    });
    expect(mock.signIn).toHaveBeenCalledWith({
      email: 'teste@example.com',
      password: 'secret',
    });
    expect(mock.profile).toHaveBeenCalledWith('auth-1');
    expect(auth.user?.id).toBe('profile-1');
  });
  it('encerra a sessão quando não existe perfil vinculado', async () => {
    mock.signIn.mockResolvedValue({
      data: { user: { id: 'auth-1' } },
      error: null,
    });
    mock.profile.mockResolvedValue(null);
    await act(async () => {
      expect(await auth.login('teste@example.com', 'secret')).toBe(false);
    });
    expect(mock.signOut).toHaveBeenCalled();
    expect(auth.isAuthenticated).toBe(false);
  });
  it('limpa o usuário quando a sessão termina', async () => {
    mock.profile.mockResolvedValue(profile);
    await act(async () => {
      notify('SIGNED_IN', { user: { id: 'auth-1' } });
    });
    expect(auth.isAuthenticated).toBe(true);
    await act(async () => {
      notify('SIGNED_OUT', null);
    });
    expect(auth.isAuthenticated).toBe(false);
  });
  it('ignora uma resposta de perfil que chega após logout', async () => {
    let resolve!: (value: typeof profile) => void;
    mock.profile.mockReturnValue(
      new Promise((r) => {
        resolve = r;
      }),
    );
    await act(async () => {
      notify('SIGNED_IN', { user: { id: 'auth-1' } });
    });
    await act(async () => {
      await auth.logout();
    });
    await act(async () => {
      resolve(profile);
    });
    expect(auth.isAuthenticated).toBe(false);
  });
  it('remove a sessão local se a revogação remota falhar', async () => {
    mock.signOut.mockResolvedValueOnce({ error: new Error('offline') });
    await act(async () => {
      await auth.logout();
    });
    expect(mock.signOut).toHaveBeenLastCalledWith({ scope: 'local' });
  });
});
