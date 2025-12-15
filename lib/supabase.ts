import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || '';
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || '';

// Log configuration status for debugging
console.log('[Supabase] Platform:', Platform.OS);
console.log('[Supabase] URL configured:', supabaseUrl ? 'Yes' : 'No');
console.log('[Supabase] Key configured:', supabaseAnonKey ? 'Yes' : 'No');
if (supabaseUrl) {
  console.log('[Supabase] URL prefix:', supabaseUrl.substring(0, 30) + '...');
}

let supabase: SupabaseClient;

if (supabaseUrl && supabaseAnonKey) {
  console.log('[Supabase] Creating real client');
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
} else {
  console.warn('[Supabase] Configuration missing! Using mock client.');
  supabase = {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: async () => ({ data: { user: null, session: null }, error: { message: 'Supabase not configured' } }),
      signUp: async () => ({ data: { user: null, session: null }, error: { message: 'Supabase not configured' } }),
      signOut: async () => ({ error: null }),
      signInWithOAuth: async () => ({ data: { url: null, provider: 'google' }, error: { message: 'Supabase not configured' } }),
    },
    from: () => ({
      select: () => ({ data: [], error: null }),
      insert: () => ({ data: null, error: { message: 'Supabase not configured' } }),
      update: () => ({ data: null, error: { message: 'Supabase not configured' } }),
      delete: () => ({ data: null, error: { message: 'Supabase not configured' } }),
      upsert: () => ({ data: null, error: { message: 'Supabase not configured' } }),
    }),
  } as unknown as SupabaseClient;
}

export { supabase };

export type AuthUser = {
  id: string;
  email: string;
  created_at: string;
};
