import { supabase } from '../lib/supabase';
import type { User } from '../types';

export async function loadUserProfile(
  authUserId: string,
): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, role, avatar, created_at, auth_user_id')
    .eq('auth_user_id', authUserId)
    .maybeSingle();

  if (error) throw new Error('Não foi possível carregar o perfil.');
  if (!data || !['admin', 'veterinarian', 'assistant'].includes(data.role))
    return null;

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    role: data.role,
    avatar: data.avatar ?? undefined,
    authUserId: data.auth_user_id,
    createdAt: new Date(data.created_at),
  };
}
