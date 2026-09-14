import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email: string;
  nickname: string;
  avatar_url: string;
  elo: number;
  rank_tier: string;
  xp: number;
  level: number;
  total_duels: number;
  wins: number;
  losses: number;
  draws: number;
  win_streak: number;
  best_win_streak: number;
  daily_streak: number;
  best_daily_streak: number;
  created_at: string;
}

export const authService = {
  isConfigured(): boolean {
    return isSupabaseConfigured && supabase !== null;
  },

  async signInWithGoogle(): Promise<{ error: Error | null }> {
    if (!supabase) {
      return { error: new Error('Supabase no está configurado. Añade las claves en .env.local') };
    }
    try {
      const redirectUrl = window.location.origin + window.location.pathname;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl
        }
      });
      return { error: error ? new Error(error.message) : null };
    } catch (err: any) {
      return { error: err };
    }
  },

  async signOut(): Promise<{ error: Error | null }> {
    if (!supabase) return { error: null };
    try {
      const { error } = await supabase.auth.signOut();
      return { error: error ? new Error(error.message) : null };
    } catch (err: any) {
      return { error: err };
    }
  },

  async getCurrentUser(): Promise<User | null> {
    if (!supabase) return null;
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  async getProfile(userId: string): Promise<UserProfile | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      console.warn('No se pudo cargar el perfil de Supabase:', error);
      return null;
    }
    return data as UserProfile;
  },

  async updateNickname(userId: string, nickname: string): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase
      .from('profiles')
      .update({ nickname, updated_at: new Date().toISOString() })
      .eq('id', userId);
    return !error;
  }
};
