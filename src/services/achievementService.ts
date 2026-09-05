import { Achievement, AchievementProgress, UserAchievementState } from '../types/achievements';
import { UserStatsState } from '../types/stats';

const ACHIEVEMENTS_STORAGE_KEY = 'GEOMUNDI_USER_ACHIEVEMENTS_V1';

export const ALL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_game',
    title: '🔰 Primeros Pasos',
    description: 'Completa tu primera partida en MapTap.',
    icon: '🔰',
    tier: 'bronze',
    category: 'games'
  },
  {
    id: 'daily_first',
    title: '📅 Hábito Geográfico',
    description: 'Completa un Desafío Diario.',
    icon: '📅',
    tier: 'bronze',
    category: 'daily'
  },
  {
    id: 'streak_5',
    title: '🔥 Chispa de Conocimiento',
    description: 'Consigue una racha de 5 aciertos seguidos.',
    icon: '🔥',
    tier: 'bronze',
    category: 'streaks'
  },
  {
    id: 'streak_10',
    title: '⚡ Fuego Puro',
    description: 'Consigue una racha de 10 aciertos seguidos.',
    icon: '⚡',
    tier: 'silver',
    category: 'streaks'
  },
  {
    id: 'streak_20',
    title: '🔮 Clarividente Geográfico',
    description: 'Consigue una racha de 20 aciertos seguidos.',
    icon: '🔮',
    tier: 'gold',
    category: 'streaks'
  },
  {
    id: 'perfect_game',
    title: '💎 Desempeño Impecable',
    description: 'Completa una partida con el 100% de precisión.',
    icon: '💎',
    tier: 'gold',
    category: 'mastery'
  },
  {
    id: 'geek_explorer',
    title: '🧠 Experto en Territorios',
    description: 'Juega y completa una partida en Modo Friki.',
    icon: '🧠',
    tier: 'silver',
    category: 'geek'
  },
  {
    id: 'score_1000',
    title: '🏆 Leyenda del Atlas',
    description: 'Acumula un total de 1,000 puntos.',
    icon: '🏆',
    tier: 'bronze',
    category: 'games'
  },
  {
    id: 'score_5000',
    title: '🌟 Gran Maestro Global',
    description: 'Acumula un total de 5,000 puntos.',
    icon: '🌟',
    tier: 'silver',
    category: 'games'
  },
  {
    id: 'score_20000',
    title: '👑 Conquistador del Mundo',
    description: 'Acumula un total de 20,000 puntos.',
    icon: '👑',
    tier: 'diamond',
    category: 'games'
  }
];

export class AchievementService {
  /**
   * Obtiene los logros desbloqueados por el usuario
   */
  getUserAchievements(): Record<string, UserAchievementState> {
    try {
      const stored = localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      return {};
    }
  }

  /**
   * Guarda el estado de logros
   */
  saveUserAchievements(unlocked: Record<string, UserAchievementState>): void {
    try {
      localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(unlocked));
    } catch (e) {}
  }

  /**
   * Revisa estadísticas y partidas para desbloquear nuevos logros
   * Retorna la lista de logros RECIÉN desbloqueados en esta llamada
   */
  evaluateAchievements(
    userStats: UserStatsState,
    lastGame?: { accuracy: number; maxStreak: number; isGeekMode?: boolean; isDaily?: boolean }
  ): Achievement[] {
    const currentUnlocked = this.getUserAchievements();
    const newlyUnlocked: Achievement[] = [];
    const now = new Date().toISOString();

    const unlock = (ach: Achievement) => {
      if (!currentUnlocked[ach.id]) {
        currentUnlocked[ach.id] = { unlockedAt: now };
        newlyUnlocked.push(ach);
      }
    };

    // 1. Partidas jugadas
    if (userStats.totalGamesPlayed >= 1) {
      const ach = ALL_ACHIEVEMENTS.find(a => a.id === 'first_game');
      if (ach) unlock(ach);
    }

    // 2. Puntuaciones acumuladas
    if (userStats.totalScore >= 1000) {
      const ach = ALL_ACHIEVEMENTS.find(a => a.id === 'score_1000');
      if (ach) unlock(ach);
    }
    if (userStats.totalScore >= 5000) {
      const ach = ALL_ACHIEVEMENTS.find(a => a.id === 'score_5000');
      if (ach) unlock(ach);
    }
    if (userStats.totalScore >= 20000) {
      const ach = ALL_ACHIEVEMENTS.find(a => a.id === 'score_20000');
      if (ach) unlock(ach);
    }

    // 3. Rachas
    const bestStreak = Math.max(userStats.bestStreak || 0, lastGame?.maxStreak || 0);
    if (bestStreak >= 5) {
      const ach = ALL_ACHIEVEMENTS.find(a => a.id === 'streak_5');
      if (ach) unlock(ach);
    }
    if (bestStreak >= 10) {
      const ach = ALL_ACHIEVEMENTS.find(a => a.id === 'streak_10');
      if (ach) unlock(ach);
    }
    if (bestStreak >= 20) {
      const ach = ALL_ACHIEVEMENTS.find(a => a.id === 'streak_20');
      if (ach) unlock(ach);
    }

    // 4. Partida Específica
    if (lastGame) {
      if (lastGame.accuracy === 100) {
        const ach = ALL_ACHIEVEMENTS.find(a => a.id === 'perfect_game');
        if (ach) unlock(ach);
      }
      if (lastGame.isGeekMode) {
        const ach = ALL_ACHIEVEMENTS.find(a => a.id === 'geek_explorer');
        if (ach) unlock(ach);
      }
      if (lastGame.isDaily) {
        const ach = ALL_ACHIEVEMENTS.find(a => a.id === 'daily_first');
        if (ach) unlock(ach);
      }
    }

    if (newlyUnlocked.length > 0) {
      this.saveUserAchievements(currentUnlocked);
    }

    return newlyUnlocked;
  }

  /**
   * Obtiene la lista completa de logros con su progreso para la vista de medallas
   */
  getAchievementsProgress(userStats: UserStatsState): AchievementProgress[] {
    const unlockedMap = this.getUserAchievements();

    return ALL_ACHIEVEMENTS.map(ach => {
      const unlockedState = unlockedMap[ach.id];
      const isUnlocked = Boolean(unlockedState);
      let currentValue = 0;
      let targetValue = 1;

      if (ach.id === 'first_game') {
        currentValue = Math.min(1, userStats.totalGamesPlayed);
      } else if (ach.id === 'score_1000') {
        currentValue = userStats.totalScore;
        targetValue = 1000;
      } else if (ach.id === 'score_5000') {
        currentValue = userStats.totalScore;
        targetValue = 5000;
      } else if (ach.id === 'score_20000') {
        currentValue = userStats.totalScore;
        targetValue = 20000;
      } else if (ach.id === 'streak_5') {
        currentValue = userStats.bestStreak;
        targetValue = 5;
      } else if (ach.id === 'streak_10') {
        currentValue = userStats.bestStreak;
        targetValue = 10;
      } else if (ach.id === 'streak_20') {
        currentValue = userStats.bestStreak;
        targetValue = 20;
      }

      const percent = isUnlocked
        ? 100
        : Math.min(99, Math.round((currentValue / targetValue) * 100));

      return {
        achievement: ach,
        unlocked: isUnlocked,
        unlockedAt: unlockedState?.unlockedAt,
        progressPercent: percent,
        currentValue,
        targetValue
      };
    });
  }
}

export const achievementService = new AchievementService();
