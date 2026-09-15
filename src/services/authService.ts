import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { DuelMode } from '../types/multiplayer';

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
  // ELOs y estadísticas específicas por minijuego
  elo_pinpoint?: number;
  elo_countries?: number;
  elo_capitals?: number;
  elo_flags?: number;
  duels_pinpoint?: number;
  wins_pinpoint?: number;
  duels_countries?: number;
  wins_countries?: number;
  duels_capitals?: number;
  wins_capitals?: number;
  duels_flags?: number;
  wins_flags?: number;
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
  },

  async updateDuelStats(
    userId: string,
    newElo: number,
    isWin: boolean,
    isDraw: boolean,
    xpEarned: number,
    rankTier: string,
    duelMode?: DuelMode,
    modeElo?: number,
    allElos?: Partial<Record<DuelMode, number>>
  ): Promise<boolean> {
    if (!supabase) return false;
    try {
      const current = await this.getProfile(userId);
      if (!current) return false;

      const newTotal = (current.total_duels || 0) + 1;
      const newWins = (current.wins || 0) + (isWin ? 1 : 0);
      const newLosses = (current.losses || 0) + (!isWin && !isDraw ? 1 : 0);
      const newDraws = (current.draws || 0) + (isDraw ? 1 : 0);
      const newStreak = isWin ? (current.win_streak || 0) + 1 : 0;
      const bestStreak = Math.max(current.best_win_streak || 0, newStreak);
      const newXp = (current.xp || 0) + xpEarned;
      const newLevel = Math.floor(Math.sqrt(newXp / 100)) + 1;

      const updatePayload: Record<string, any> = {
        elo: newElo,
        rank_tier: rankTier,
        total_duels: newTotal,
        wins: newWins,
        losses: newLosses,
        draws: newDraws,
        win_streak: newStreak,
        best_win_streak: bestStreak,
        xp: newXp,
        level: newLevel,
        updated_at: new Date().toISOString()
      };

      if (allElos) {
        if (allElos.pinpoint !== undefined) updatePayload.elo_pinpoint = allElos.pinpoint;
        if (allElos.countries !== undefined) updatePayload.elo_countries = allElos.countries;
        if (allElos.capitals !== undefined) updatePayload.elo_capitals = allElos.capitals;
        if (allElos.flags !== undefined) updatePayload.elo_flags = allElos.flags;
      }

      if (duelMode) {
        const modeKey = duelMode;
        if (modeElo !== undefined) {
          updatePayload[`elo_${modeKey}`] = modeElo;
        }
        const currentModeDuels = (current as any)[`duels_${modeKey}`] || 0;
        const currentModeWins = (current as any)[`wins_${modeKey}`] || 0;
        updatePayload[`duels_${modeKey}`] = currentModeDuels + 1;
        if (isWin) {
          updatePayload[`wins_${modeKey}`] = currentModeWins + 1;
        }
      }

      const { error } = await supabase
        .from('profiles')
        .update(updatePayload)
        .eq('id', userId);

      if (error) {
        console.error('Error actualizando stats de duelo en profiles:', error);
        return false;
      }
      return true;
    } catch (e) {
      console.error('Excepción actualizando stats de duelo:', e);
      return false;
    }
  }
};

