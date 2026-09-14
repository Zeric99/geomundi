import { supabase } from '../lib/supabase';
import { StorageService } from './storageService';
import { DailyChallengeRecord } from './dailyChallengeService';
import { DuelMode } from '../types/multiplayer';

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
  mode?: DuelMode | 'all';
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
   * Obtiene la clasificación mundial de Elo de Duelos 1v1 (general o filtrado por minijuego)
   */
  async getEloLeaderboard(limit = 50): Promise<LeaderboardEntry[]> {
    return this.getEloLeaderboardByMode('all', limit);
  },

  /**
   * Obtiene el ranking específico de una modalidad de juego ('pinpoint', 'countries', 'capitals', 'flags' o 'all')
   */
  async getEloLeaderboardByMode(mode: DuelMode | 'all' = 'all', limit = 50): Promise<LeaderboardEntry[]> {
    if (!supabase) return [];
    try {
      if (mode === 'all') {
        const { data, error } = await supabase
          .from('leaderboard_elo')
          .select('*')
          .limit(limit);

        if (!error && data && data.length > 0) {
          return data as LeaderboardEntry[];
        }

        // Fallback directo a tabla profiles
        const { data: profiles, error: pError } = await supabase
          .from('profiles')
          .select('id, nickname, avatar_url, elo, rank_tier, level, xp, wins, losses, total_duels')
          .order('elo', { ascending: false })
          .limit(limit);

        if (pError || !profiles) return [];
        return profiles.map((p: any, idx: number) => ({
          ...p,
          rank_position: idx + 1,
          mode: 'all'
        })) as LeaderboardEntry[];
      }

      // Consulta de ranking específico para un minijuego
      const eloCol = `elo_${mode}`;
      const duelsCol = `duels_${mode}`;
      const winsCol = `wins_${mode}`;

      const { data, error } = await supabase
        .from('profiles')
        .select(`id, nickname, avatar_url, ${eloCol}, rank_tier, level, xp, ${winsCol}, total_duels, ${duelsCol}`)
        .order(eloCol, { ascending: false })
        .limit(limit);

      if (error) {
        console.warn(`Columna ${eloCol} no encontrada o error en ranking, usando fallback general:`, error);
        return this.getEloLeaderboardByMode('all', limit);
      }

      return (data || []).map((row: any, idx: number) => ({
        id: row.id,
        nickname: row.nickname,
        avatar_url: row.avatar_url,
        elo: row[eloCol] ?? row.elo ?? 1200,
        rank_tier: row.rank_tier || 'bronce',
        level: row.level || 1,
        xp: row.xp || 0,
        wins: row[winsCol] ?? 0,
        losses: Math.max(0, (row[duelsCol] || 0) - (row[winsCol] || 0)),
        total_duels: row[duelsCol] ?? 0,
        rank_position: idx + 1,
        mode
      })) as LeaderboardEntry[];
    } catch (e) {
      console.error('Excepción obteniendo ranking Elo:', e);
      return [];
    }
  },

  /**
   * Obtiene la posición de ranking mundial (# puesto) del usuario en cada una de las 4 modalidades y en general
   */
  async getUserRankPositions(userId: string): Promise<Record<DuelMode | 'all', number>> {
    const defaultPositions: Record<DuelMode | 'all', number> = {
      pinpoint: 1,
      countries: 1,
      capitals: 1,
      flags: 1,
      all: 1
    };

    if (!supabase || !userId) return defaultPositions;

    try {
      const { data: userProfile, error: profError } = await supabase
        .from('profiles')
        .select('elo, elo_pinpoint, elo_countries, elo_capitals, elo_flags')
        .eq('id', userId)
        .single();

      if (profError || !userProfile) return defaultPositions;

      const modes: (DuelMode | 'all')[] = ['all', 'pinpoint', 'countries', 'capitals', 'flags'];

      await Promise.all(
        modes.map(async (m) => {
          const col = m === 'all' ? 'elo' : `elo_${m}`;
          const userElo = (userProfile as Record<string, any>)[col] ?? 1200;

          const { count, error } = await supabase!
            .from('profiles')
            .select('id', { count: 'exact', head: true })
            .gt(col, userElo);

          if (!error && count !== null) {
            defaultPositions[m] = count + 1;
          }
        })
      );

      return defaultPositions;
    } catch (e) {
      console.warn('Excepción calculando puestos de ranking:', e);
      return defaultPositions;
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
