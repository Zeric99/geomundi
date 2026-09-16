import { CountryPerformance, UserStatsState } from '../types/stats';
import { GameSummary } from '../types/game';

const STATS_STORAGE_KEY = 'GEOMUNDI_USER_STATS_V2';
const SOUND_STORAGE_KEY = 'GEOMUNDI_SOUND_ENABLED';

const INITIAL_STATS: UserStatsState = {
  version: 2,
  countries: {},
  gameHistory: [],
  totalScore: 0,
  totalGamesPlayed: 0,
  bestStreak: 0,
  lastSessionDate: new Date().toISOString()
};

export class StorageService {
  /**
   * Obtiene el estado global de estadísticas del usuario
   */
  getUserStats(): UserStatsState {
    try {
      const stored = localStorage.getItem(STATS_STORAGE_KEY);
      if (!stored) return INITIAL_STATS;
      const parsed = JSON.parse(stored);
      let modeStats = parsed.modeStats || {};
      // Si modeStats está vacío pero hay historial, reconstruir
      if (Object.keys(modeStats).length === 0 && Array.isArray(parsed.gameHistory) && parsed.gameHistory.length > 0) {
        parsed.gameHistory.forEach((gh: any) => {
          const m = gh.config?.mode;
          if (m) {
            if (!modeStats[m]) {
              modeStats[m] = { gamesPlayed: 0, totalScore: 0, bestScore: 0, correctCount: 0 };
            }
            modeStats[m].gamesPlayed += 1;
            modeStats[m].totalScore += (gh.score || 0);
            modeStats[m].bestScore = Math.max(modeStats[m].bestScore, gh.score || 0);
            modeStats[m].correctCount = (modeStats[m].correctCount || 0) + (gh.correctCount || 0);
          }
          if (gh.config?.isGeekMode) {
            if (!modeStats['geek_mode']) {
              modeStats['geek_mode'] = { gamesPlayed: 0, totalScore: 0, bestScore: 0, correctCount: 0 };
            }
            modeStats['geek_mode'].gamesPlayed += 1;
            modeStats['geek_mode'].totalScore += (gh.score || 0);
            modeStats['geek_mode'].bestScore = Math.max(modeStats['geek_mode'].bestScore, gh.score || 0);
          }
        });
      }

      return {
        ...INITIAL_STATS,
        ...parsed,
        countries: parsed.countries || {},
        modeStats
      };
    } catch (e) {
      console.error('Error cargando estadísticas desde localStorage:', e);
      return INITIAL_STATS;
    }
  }

  /**
   * Guarda el estado global de estadísticas
   */
  saveUserStats(stats: UserStatsState): void {
    try {
      localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
    } catch (e) {
      console.error('Error guardando estadísticas en localStorage:', e);
    }
  }

  /**
   * Registra los resultados de una partida finalizada y actualiza métricas por país
   */
  recordGameResults(gameSummary: GameSummary): UserStatsState {
    const currentStats = this.getUserStats();
    const updatedCountries = { ...currentStats.countries };

    for (const result of gameSummary.results) {
      const cca3 = result.question.country.cca3.toUpperCase();
      const existing: CountryPerformance = updatedCountries[cca3] || {
        cca3,
        nameEs: result.question.country.nameEs,
        continent: result.question.country.continent,
        totalAttempts: 0,
        firstTrySuccesses: 0,
        mistakes: 0,
        lastReviewedAt: new Date().toISOString(),
        averageResponseTimeMs: 0,
        confusionCountries: []
      };

      const newTotal = existing.totalAttempts + 1;
      const newFirstTry = existing.firstTrySuccesses + (result.firstTry ? 1 : 0);
      const newMistakes = existing.mistakes + (result.userSuccess && result.firstTry ? 0 : 1);
      
      // Promedio móvil ponderado del tiempo de respuesta
      const newAvgTime = existing.averageResponseTimeMs > 0
        ? Math.round((existing.averageResponseTimeMs * 0.7) + (result.timeSpentMs * 0.3))
        : result.timeSpentMs;

      // Actualizar países de confusión si hubo un error de selección
      let confusionList = existing.confusionCountries || [];
      if (result.wrongCountryCode && !confusionList.includes(result.wrongCountryCode.toUpperCase())) {
        confusionList = [...confusionList, result.wrongCountryCode.toUpperCase()].slice(-5);
      }

      updatedCountries[cca3] = {
        ...existing,
        nameEs: result.question.country.nameEs,
        continent: result.question.country.continent,
        totalAttempts: newTotal,
        firstTrySuccesses: newFirstTry,
        mistakes: newMistakes,
        lastReviewedAt: new Date().toISOString(),
        averageResponseTimeMs: newAvgTime,
        confusionCountries: confusionList
      };
    }

    const modeKey = gameSummary.mode;
    const currentModeStats = currentStats.modeStats || {};
    const existingMode = currentModeStats[modeKey] || { gamesPlayed: 0, totalScore: 0, bestScore: 0, correctCount: 0 };

    const updatedModeStats: Record<string, any> = {
      ...currentModeStats,
      [modeKey]: {
        gamesPlayed: existingMode.gamesPlayed + 1,
        totalScore: existingMode.totalScore + gameSummary.score,
        bestScore: Math.max(existingMode.bestScore || 0, gameSummary.score),
        correctCount: (existingMode.correctCount || 0) + gameSummary.correctCount
      }
    };

    if (gameSummary.isGeekMode) {
      const existingGeek = currentModeStats['geek_mode'] || { gamesPlayed: 0, totalScore: 0, bestScore: 0, correctCount: 0 };
      updatedModeStats['geek_mode'] = {
        gamesPlayed: existingGeek.gamesPlayed + 1,
        totalScore: existingGeek.totalScore + gameSummary.score,
        bestScore: Math.max(existingGeek.bestScore || 0, gameSummary.score),
        correctCount: (existingGeek.correctCount || 0) + gameSummary.correctCount
      };
    }

    const updatedStats: UserStatsState = {
      ...currentStats,
      countries: updatedCountries,
      gameHistory: [gameSummary, ...(currentStats.gameHistory || [])].slice(0, 50), // Conservar últimas 50
      totalScore: currentStats.totalScore + gameSummary.score,
      totalGamesPlayed: currentStats.totalGamesPlayed + 1,
      bestStreak: Math.max(currentStats.bestStreak || 0, gameSummary.maxStreak || 0),
      lastSessionDate: new Date().toISOString(),
      modeStats: updatedModeStats
    };

    this.saveUserStats(updatedStats);
    return updatedStats;
  }

  /**
   * Integra registros de maestría por país descargados de Supabase
   */
  mergeCloudMastery(cloudRows: Array<{ cca3: string; correct_count: number; wrong_count: number; last_played?: string }>): UserStatsState {
    const currentStats = this.getUserStats();
    const updatedCountries = { ...currentStats.countries };

    for (const row of cloudRows) {
      const code = row.cca3.toUpperCase();
      const existing = updatedCountries[code];
      const correct = Math.max(existing?.firstTrySuccesses || 0, row.correct_count || 0);
      const mistakes = Math.max(existing?.mistakes || 0, row.wrong_count || 0);
      const totalAttempts = Math.max(existing?.totalAttempts || 0, correct + mistakes);

      updatedCountries[code] = {
        cca3: code,
        nameEs: existing?.nameEs || code,
        continent: existing?.continent || 'Europe',
        totalAttempts,
        firstTrySuccesses: correct,
        mistakes,
        lastReviewedAt: row.last_played || existing?.lastReviewedAt || new Date().toISOString(),
        averageResponseTimeMs: existing?.averageResponseTimeMs || 0,
        confusionCountries: existing?.confusionCountries || []
      };
    }

    const updatedStats: UserStatsState = {
      ...currentStats,
      countries: updatedCountries
    };

    this.saveUserStats(updatedStats);
    return updatedStats;
  }

  /**
   * Resetea las estadísticas de estudio
   */
  resetStats(): void {
    localStorage.removeItem(STATS_STORAGE_KEY);
  }

  /**
   * Configuración de sonido
   */
  getSoundEnabled(): boolean {
    const val = localStorage.getItem(SOUND_STORAGE_KEY);
    return val === null ? true : val === 'true';
  }

  setSoundEnabled(enabled: boolean): void {
    localStorage.setItem(SOUND_STORAGE_KEY, String(enabled));
  }
}

export const storageService = new StorageService();
