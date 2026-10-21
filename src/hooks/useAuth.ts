import { useEffect, useRef, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { loadUserProfile } from '../services/auth';
import { User } from '../types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const request = useRef(0);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    let active = true;
    const syncProfile = async (id?: string) => {
      const current = ++request.current;
      try {
        const profile = id ? await loadUserProfile(id) : null;
        if (active && current === request.current) setUser(profile);
      } catch {
        if (active && current === request.current) setUser(null);
      } finally {
        if (active && current === request.current) setIsLoading(false);
      }
    };

    const initialRequest = request.current;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void syncProfile(session?.user.id);
    });
    void supabase.auth
      .getUser()
      .then(({ data, error }) => {
        if (active && initialRequest === request.current) {
          void syncProfile(error ? undefined : data.user?.id);
        }
      })
      .catch(() => {
        if (active && initialRequest === request.current) void syncProfile();
      });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error || !data.user) return false;
      const current = ++request.current;
      const profile = await loadUserProfile(data.user.id);
      if (!profile) {
        await supabase.auth.signOut();
        return false;
      }
      if (current !== request.current) return false;
      setUser(profile);
      return true;
    } catch {
      return false;
    }
  };

  const logout = async () => {
    request.current++;
    setUser(null);
    const { error } = await supabase.auth.signOut();
    if (error) await supabase.auth.signOut({ scope: 'local' });
  };

  return { user, isLoading, login, logout, isAuthenticated: Boolean(user) };
}
