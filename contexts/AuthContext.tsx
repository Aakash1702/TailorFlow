import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session, User, Provider } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { Platform } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

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
  signInWithOAuth: (provider: Provider) => Promise<{ error: Error | null }>;
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

  const provisionShopAndProfile = useCallback(async (userId: string, email: string) => {
    try {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*, shops(*)')
        .eq('id', userId)
        .single();

      if (existingProfile && existingProfile.shop_id) {
        return {
          profile: existingProfile,
          shop: existingProfile.shops,
        };
      }

      const { data: existingShop } = await supabase
        .from('shops')
        .select('*')
        .eq('owner_id', userId)
        .single();

      if (existingShop) {
        const { data: existingProfileForShop } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (existingProfileForShop) {
          return { profile: existingProfileForShop, shop: existingShop };
        }

        const { data: sessionData } = await supabase.auth.getSession();
        const userMetadata = sessionData?.session?.user?.user_metadata || {};
        const fullName = userMetadata.full_name || userMetadata.name || email.split('@')[0];

        const { data: createdProfile, error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: userId,
            shop_id: existingShop.id,
            email: email,
            full_name: fullName,
            role: 'admin',
          }, { onConflict: 'id' })
          .select()
          .single();

        if (profileError) {
          console.error('Failed to create profile for existing shop:', profileError);
          const { data: refetchedProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
          return refetchedProfile ? { profile: refetchedProfile, shop: existingShop } : null;
        }

        return { profile: createdProfile, shop: existingShop };
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const userMetadata = sessionData?.session?.user?.user_metadata || {};
      const fullName = userMetadata.full_name || userMetadata.name || email.split('@')[0];
      const shopName = userMetadata.shop_name || 'My Tailoring Shop';

      const { data: newShop, error: shopError } = await supabase
        .from('shops')
        .insert({
          name: shopName,
          owner_id: userId,
        })
        .select()
        .single();

      if (shopError) {
        console.error('Failed to create shop:', shopError);
        const { data: refetchedShop } = await supabase
          .from('shops')
          .select('*')
          .eq('owner_id', userId)
          .single();
        
        if (refetchedShop) {
          const { data: refetchedProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
          return refetchedProfile ? { profile: refetchedProfile, shop: refetchedShop } : null;
        }
        return null;
      }

      const { data: newProfile, error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          shop_id: newShop.id,
          email: email,
          full_name: fullName,
          role: 'admin',
        }, { onConflict: 'id' })
        .select()
        .single();

      if (profileError) {
        console.error('Failed to create profile:', profileError);
        const { data: refetchedProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        return refetchedProfile ? { profile: refetchedProfile, shop: newShop } : null;
      }

      const { data: existingPresets } = await supabase
        .from('extras_presets')
        .select('id')
        .eq('shop_id', newShop.id)
        .limit(1);

      if (!existingPresets || existingPresets.length === 0) {
        const defaultPresets = [
          { shop_id: newShop.id, label: 'Designer Work', amount: 200, category: 'design' },
          { shop_id: newShop.id, label: 'Embroidery', amount: 300, category: 'design' },
          { shop_id: newShop.id, label: 'Neck Zip', amount: 50, category: 'finishing' },
          { shop_id: newShop.id, label: 'Side Zip', amount: 50, category: 'finishing' },
          { shop_id: newShop.id, label: 'Lining', amount: 100, category: 'material' },
          { shop_id: newShop.id, label: 'Pico/Fall', amount: 80, category: 'finishing' },
          { shop_id: newShop.id, label: 'Padding', amount: 60, category: 'material' },
          { shop_id: newShop.id, label: 'Piping', amount: 40, category: 'finishing' },
          { shop_id: newShop.id, label: 'Hooks', amount: 30, category: 'finishing' },
          { shop_id: newShop.id, label: 'Steam Press', amount: 50, category: 'finishing' },
        ];
        await supabase.from('extras_presets').insert(defaultPresets);
      }

      return { profile: newProfile, shop: newShop };
    } catch (err) {
      console.error('Provisioning failed:', err);
      return null;
    }
  }, []);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError || !profileData) {
        const { data: sessionData } = await supabase.auth.getSession();
        const email = sessionData?.session?.user?.email;
        
        if (email) {
          const result = await provisionShopAndProfile(userId, email);
          if (result) {
            setProfile(result.profile as UserProfile);
            setShop(result.shop as Shop);
          }
        }
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
      console.error('Fetch profile error:', err);
      setIsOnline(false);
    }
  }, [provisionShopAndProfile]);

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

  const signInWithOAuth = async (provider: Provider): Promise<{ error: Error | null }> => {
    try {
      const redirectTo = AuthSession.makeRedirectUri({
        scheme: 'tailorflow',
        path: 'auth/callback',
      });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      });

      if (error) {
        return { error };
      }

      if (data?.url) {
        if (Platform.OS === 'web') {
          window.location.href = data.url;
          return { error: null };
        } else {
          const result = await WebBrowser.openAuthSessionAsync(
            data.url,
            redirectTo
          );

          if (result.type === 'cancel' || result.type === 'dismiss') {
            return { error: new Error('Sign-in was cancelled') };
          }

          if (result.type === 'success' && result.url) {
            const url = new URL(result.url);
            
            const hashParams = new URLSearchParams(url.hash.substring(1));
            const queryParams = new URLSearchParams(url.search);
            
            const errorDescription = hashParams.get('error_description') || queryParams.get('error_description');
            if (errorDescription) {
              return { error: new Error(decodeURIComponent(errorDescription)) };
            }
            
            const accessToken = hashParams.get('access_token');
            const refreshToken = hashParams.get('refresh_token');
            
            if (accessToken && refreshToken) {
              const { error: sessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });

              if (sessionError) {
                return { error: sessionError };
              }
              return { error: null };
            }
            
            const code = queryParams.get('code');
            if (code) {
              const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
              if (exchangeError) {
                return { error: exchangeError };
              }
              return { error: null };
            }
            
            return { error: new Error('Authentication failed - no valid response received') };
          }

          return { error: new Error('Authentication failed') };
        }
      }

      return { error: new Error('Failed to initiate authentication') };
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
        signInWithOAuth,
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
