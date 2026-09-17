import { supabase } from '../lib/supabase';
import { storageService, StorageService } from './storageService';
import { dailyChallengeService, DailyChallengeRecord } from './dailyChallengeService';
import { personalRecordsService } from './personalRecordsService';
import { achievementService } from './achievementService';
import { multiplayerService } from './multiplayerService';
import { customRoomService } from './customRoomService';
import { DuelMode } from '../types/multiplayer';
import { GameSummary } from '../types/game';
import { empireStorageService } from '../features/empires/services/empireStorageService';

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
   * Migra datos generados en modo invitado local a la nube (Supabase) al iniciar sesión
   */
  async migrateLocalDataToCloud(userId: string): Promise<boolean> {
    if (!supabase || !userId) return false;
    try {
      // 1. Maestría de países jugados como invitado
      const localStats = storageService.getUserStats();
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

      // 2. Récords personales locales
      const localRecords = personalRecordsService.getAllRecords();
      const recordKeys = Object.keys(localRecords);
      if (recordKeys.length > 0) {
        const recordRows = recordKeys.map(k => {
          const r = localRecords[k];
          return {
            user_id: userId,
            game_mode: r.mode,
            continent: r.continent,
            correct_count: r.correctCount,
            total_countries: r.totalQuestions,
            accuracy_pct: r.accuracyPct,
            time_seconds: r.timeSeconds,
            updated_at: r.date || new Date().toISOString()
          };
        });

        await supabase
          .from('personal_records')
          .upsert(recordRows, { onConflict: 'user_id,game_mode,continent' });
      }

      // 3. Logros conseguidos como invitado
      await achievementService.syncWithSupabase(userId);

      // 4. Reto diario de hoy si se completó antes de iniciar sesión
      const streakState = dailyChallengeService.getStreakState();
      const today = dailyChallengeService.getTodayDateString();
      const todayAttempt = streakState.history[today];
      if (todayAttempt && todayAttempt.completed) {
        await this.saveDailyChallengeAttempt(userId, todayAttempt);
      }

      // 5. Migrar imperio local si se fundó como invitado
      const currentEmpire = empireStorageService.getEmpire();
      if (currentEmpire && currentEmpire.capitalTileId) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('empire_data')
          .eq('id', userId)
          .maybeSingle();

        if (!prof?.empire_data || !prof.empire_data.capitalTileId) {
          await supabase
            .from('profiles')
            .update({
              empire_data: currentEmpire,
              updated_at: new Date().toISOString()
            })
            .eq('id', userId);
        }
      }

      return true;
    } catch (e) {
      console.error('Error migrando datos locales a la nube:', e);
      return false;
    }
  },

  /**
   * Descarga e hidrata los datos autoritativos del usuario desde Supabase en la sesión actual
   */
  async hydrateUserDataFromCloud(userId: string): Promise<void> {
    if (!supabase || !userId) return;
    try {
      // 1. Hidratar maestría de países
      const { data: masteryData, error: masteryError } = await supabase
        .from('country_mastery')
        .select('*')
        .eq('user_id', userId);

      if (!masteryError && masteryData && masteryData.length > 0) {
        storageService.mergeCloudMastery(masteryData);
      }

      // 2. Hidratar récords personales
      await personalRecordsService.syncFromSupabase(userId);

      // 3. Hidratar logros
      await achievementService.syncWithSupabase(userId);

      // 4. Hidratar intento del reto diario de hoy si ya se jugó en otro dispositivo
      const today = dailyChallengeService.getTodayDateString();
      const { data: dailyData, error: dailyError } = await supabase
        .from('daily_challenge_attempts')
        .select('*')
        .eq('user_id', userId)
        .eq('challenge_date', today)
        .maybeSingle();

      if (!dailyError && dailyData && dailyData.solved) {
        dailyChallengeService.hydrateDailyCompletionFromCloud(
          today,
          dailyData.score || 0,
          dailyData.time_seconds || 30
        );
      }

      // 5. Hidratar imperio desde Supabase
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('empire_data')
        .eq('id', userId)
        .maybeSingle();

      if (!profileError && profileData) {
        await empireStorageService.syncEmpireFromCloud(profileData.empire_data, userId);
      }
    } catch (e) {
      console.warn('Error hidratando datos de usuario desde Supabase:', e);
    }
  },

  /**
   * Sincroniza en tiempo real la maestría de países de una partida finalizada a Supabase
   */
  async syncGameMastery(userId: string, summary: GameSummary): Promise<void> {
    if (!supabase || !userId || !summary.results || summary.results.length === 0) return;
    try {
      const rows = summary.results.map(r => {
        const cca3 = r.question.country.cca3.toUpperCase();
        return {
          user_id: userId,
          cca3,
          correct_count: r.userSuccess && r.firstTry ? 1 : 0,
          wrong_count: r.userSuccess && r.firstTry ? 0 : 1,
          last_played: new Date().toISOString()
        };
      });

      // Upsert combinando o sumando
      for (const row of rows) {
        const { data: existing } = await supabase
          .from('country_mastery')
          .select('correct_count, wrong_count')
          .eq('user_id', userId)
          .eq('cca3', row.cca3)
          .maybeSingle();

        const currentCorrect = (existing?.correct_count || 0) + row.correct_count;
        const currentWrong = (existing?.wrong_count || 0) + row.wrong_count;

        await supabase
          .from('country_mastery')
          .upsert({
            user_id: userId,
            cca3: row.cca3,
            correct_count: currentCorrect,
            wrong_count: currentWrong,
            last_played: row.last_played
          }, { onConflict: 'user_id,cca3' });
      }
    } catch (e) {
      console.warn('Error sincronizando maestría de partida con Supabase:', e);
    }
  }
};

/**
 * Limpia absolutamente todos los datos de sesión/usuario guardados en el navegador
 * (para evitar contaminación cruzada de cuentas al cerrar sesión)
 */
export const clearAllUserSessionData = (): void => {
  storageService.resetStats();
  achievementService.resetAchievements();
  personalRecordsService.resetRecords();
  dailyChallengeService.resetDailyState();
  multiplayerService.resetLocalProfile();
  customRoomService.clearRoomCache();
  empireStorageService.resetToDefault();
};
