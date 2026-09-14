import { supabase } from '../lib/supabase';
import { StorageService } from './storageService';
import { DailyChallengeRecord } from './dailyChallengeService';

export interface LeaderboardEntry {
  id: string;
  nickname: string;
  avatar_url: string;
  elo: number;
  rank_tier: string;
  level: number;
  xp: number;
  wins: number;
  losses: number;
  total_duels: number;
  rank_position: number;
}

export interface DailyLeaderboardEntry {
  attempt_id: string;
  user_id: string;
  nickname: string;
  avatar_url: string;
  challenge_date: string;
  solved: boolean;
  attempts_count: number;
  time_seconds: number;
  score: number;
  rank_position: number;
}

export const cloudSyncService = {
  /**
   * Guarda o actualiza el intento del reto diario en la nube
   */
  async saveDailyChallengeAttempt(userId: string, record: DailyChallengeRecord): Promise<boolean> {
    if (!supabase) return false;
    try {
      const { error } = await supabase
        .from('daily_challenge_attempts')
        .upsert({
          user_id: userId,
          challenge_date: record.dateStr,
          solved: record.completed,
          attempts_count: 5,
          time_seconds: record.durationSeconds || 0,
          guesses: [],
          score: record.score || 0
        }, { onConflict: 'user_id,challenge_date' });

      if (error) console.error('Error sincronizando reto diario:', error);
      return !error;
    } catch (e) {
      console.error('Excepción sincronizando reto diario:', e);
      return false;
    }
  },

  /**
   * Obtiene la clasificación mundial de Elo de Duelos 1v1
   */
  async getEloLeaderboard(limit = 50): Promise<LeaderboardEntry[]> {
    if (!supabase) return [];
    try {
      const { data, error } = await supabase
        .from('leaderboard_elo')
        .select('*')
        .limit(limit);

      if (error) {
        console.error('Error obteniendo ranking Elo:', error);
        return [];
      }
      return (data || []) as LeaderboardEntry[];
    } catch (e) {
      console.error('Excepción obteniendo ranking Elo:', e);
      return [];
    }
  },

  /**
   * Obtiene la clasificación mundial del Reto Diario de hoy
   */
  async getTodayDailyLeaderboard(limit = 50): Promise<DailyLeaderboardEntry[]> {
    if (!supabase) return [];
    try {
      const { data, error } = await supabase
        .from('leaderboard_daily_today')
        .select('*')
        .limit(limit);

      if (error) {
        console.error('Error obteniendo ranking diario de hoy:', error);
        return [];
      }
      return (data || []) as DailyLeaderboardEntry[];
    } catch (e) {
      console.error('Excepción obteniendo ranking diario:', e);
      return [];
    }
  },

  /**
   * Migra automáticamente las estadísticas locales del localStorage a Supabase
   */
  async migrateLocalDataToCloud(userId: string): Promise<boolean> {
    if (!supabase) return false;
    try {
      const storage = new StorageService();
      const localStats = storage.getUserStats();

      // Si tiene países jugados en local, sincronizarlos
      const entries = Object.values(localStats.countries || {});
      if (entries.length > 0) {
        const masteryRows = entries.map(c => ({
          user_id: userId,
          cca3: c.cca3,
          correct_count: c.firstTrySuccesses || 0,
          wrong_count: c.mistakes || 0,
          last_played: c.lastReviewedAt || new Date().toISOString()
        }));

        await supabase
          .from('country_mastery')
          .upsert(masteryRows, { onConflict: 'user_id,cca3' });
      }

      return true;
    } catch (e) {
      console.error('Error migrando datos locales a la nube:', e);
      return false;
    }
  }
};
