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
      return {
        ...INITIAL_STATS,
        ...parsed,
        countries: parsed.countries || {}
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

      updatedCountries[cca3] = {
        ...existing,
        nameEs: result.question.country.nameEs,
        continent: result.question.country.continent,
        totalAttempts: newTotal,
        firstTrySuccesses: newFirstTry,
        mistakes: newMistakes,
        lastReviewedAt: new Date().toISOString(),
        averageResponseTimeMs: newAvgTime
      };
    }

    const updatedStats: UserStatsState = {
      ...currentStats,
      countries: updatedCountries,
      gameHistory: [gameSummary, ...(currentStats.gameHistory || [])].slice(0, 50), // Conservar últimas 50
      totalScore: currentStats.totalScore + gameSummary.score,
      totalGamesPlayed: currentStats.totalGamesPlayed + 1,
      bestStreak: Math.max(currentStats.bestStreak || 0, gameSummary.maxStreak || 0),
      lastSessionDate: new Date().toISOString()
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
