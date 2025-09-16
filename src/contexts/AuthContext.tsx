import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (username: string, password: string) => Promise<{ error: any }>;
  signIn: (username: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (username: string, password: string) => {
    const normalized = username.trim().toLowerCase();
    const isValid = /^[a-z0-9_]{3,20}$/.test(normalized);
    if (!isValid) {
      return { error: { message: 'Invalid username. Use 3-20 chars: a-z, 0-9, _' } };
    }

    // Use a configurable domain to satisfy email domain allowlist/validation
    const domain = (import.meta as any).env?.VITE_AUTH_FAKE_EMAIL_DOMAIN || 'petgame.dev';
    const email = `${normalized}@${domain}`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: normalized,
        },
      },
    });
    return { error };
  };

  const signIn = async (username: string, password: string) => {
    const normalized = username.trim().toLowerCase();
    const domain = (import.meta as any).env?.VITE_AUTH_FAKE_EMAIL_DOMAIN || 'petgame.dev';
    const email = `${normalized}@${domain}`;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
