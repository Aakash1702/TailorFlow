import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserProfile = {
  id: string;
  shop_id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'manager' | 'tailor';
};

export type Shop = {
  id: string;
  name: string;
  owner_id: string;
  phone: string | null;
  address: string | null;
};

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  shop: Shop | null;
  isLoading: boolean;
  isOnline: boolean;
  signUp: (email: string, password: string, fullName?: string, shopName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MIGRATION_KEY = 'tailorflow_migration_complete';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        return;
      }

      if (profileData) {
        setProfile(profileData as UserProfile);

        const { data: shopData, error: shopError } = await supabase
          .from('shops')
          .select('*')
          .eq('id', profileData.shop_id)
          .single();

        if (!shopError && shopData) {
          setShop(shopData as Shop);
        }
      }
    } catch (err) {
      setIsOnline(false);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  }, [user?.id, fetchProfile]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setShop(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signUp = async (
    email: string,
    password: string,
    fullName?: string,
    shopName?: string
  ): Promise<{ error: Error | null }> => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || email,
            shop_name: shopName || 'My Tailoring Shop',
          },
        },
      });

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signIn = async (
    email: string,
    password: string
  ): Promise<{ error: Error | null }> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signOut = async (): Promise<void> => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
    setShop(null);
  };

  const resetPassword = async (email: string): Promise<{ error: Error | null }> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'tailorflow://reset-password',
      });

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        shop,
        isLoading,
        isOnline,
        signUp,
        signIn,
        signOut,
        resetPassword,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
