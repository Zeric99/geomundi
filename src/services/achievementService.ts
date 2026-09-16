import { Achievement, AchievementProgress, UserAchievementState } from '../types/achievements';
import { UserStatsState } from '../types/stats';
import { supabase } from '../lib/supabase';

const ACHIEVEMENTS_STORAGE_KEY = 'GEOMUNDI_USER_ACHIEVEMENTS_V1';

export const ALL_ACHIEVEMENTS: Achievement[] = [
  // =================================================================
  // 1. 🌍 CONTINENTES Y CARTOGRAFÍA (continents)
  // =================================================================
  {
    id: 'explorer_europe',
    title: 'EuroTrip',
    description: 'Completa el mapa de Europa con al menos el 90% de aciertos.',
    icon: '🇪🇺',
    tier: 'silver',
    category: 'continents',
    xpReward: 100
  },
  {
    id: 'explorer_africa',
    title: 'Espíritu Africano',
    description: 'Completa el mapa de África con más del 85% de aciertos.',
    icon: '🦁',
    tier: 'silver',
    category: 'continents',
    xpReward: 100
  },
  {
    id: 'explorer_asia',
    title: 'Ruta de la Seda',
    description: 'Completa el mapa de Asia con más del 85% de aciertos.',
    icon: '🏯',
    tier: 'silver',
    category: 'continents',
    xpReward: 100
  },
  {
    id: 'explorer_americas',
    title: 'De Polo a Polo',
    description: 'Completa el mapa de América con al menos el 90% de precisión.',
    icon: '🌎',
    tier: 'silver',
    category: 'continents',
    xpReward: 100
  },
  {
    id: 'explorer_oceania',
    title: 'Odisea en Oceanía',
    description: 'Completa todos los países de Oceanía con 100% de precisión.',
    icon: '🏝️',
    tier: 'silver',
    category: 'continents',
    xpReward: 100
  },
  {
    id: 'master_world',
    title: 'Atlas Viviente',
    description: 'Completa el desafío del Mundo entero (197 países).',
    icon: '👑',
    tier: 'diamond',
    category: 'continents',
    xpReward: 500
  },
  {
    id: 'all_continents',
    title: 'Trotamundos',
    description: 'Juega al menos una partida en cada uno de los continentes.',
    icon: '🧭',
    tier: 'gold',
    category: 'continents',
    xpReward: 250
  },

  // =================================================================
  // 2. 🎯 PUNTERÍA DE CIUDADES (pinpoint)
  // =================================================================
  {
    id: 'pinpoint_first',
    title: 'Primer Destino',
    description: 'Juega tu primera ronda en el modo Puntería de Ciudades.',
    icon: '📍',
    tier: 'bronze',
    category: 'pinpoint',
    xpReward: 50
  },
  {
    id: 'pinpoint_close',
    title: 'Cirujano de Precisión',
    description: 'Acierta una ciudad a menos de 50 km de distancia real.',
    icon: '🎯',
    tier: 'gold',
    category: 'pinpoint',
    xpReward: 250
  },
  {
    id: 'pinpoint_perfect',
    title: 'Francotirador Geográfico',
    description: 'Consigue 1.000 puntos perfectos en una ronda de puntería.',
    icon: '💎',
    tier: 'diamond',
    category: 'pinpoint',
    xpReward: 500
  },
  {
    id: 'pinpoint_streak',
    title: 'Brújula Infalible',
    description: 'Consigue más de 4.000 puntos en una partida de puntería de 5 ciudades.',
    icon: '🧭',
    tier: 'gold',
    category: 'pinpoint',
    xpReward: 250
  },
  {
    id: 'pinpoint_master',
    title: 'Topógrafo de Ciudades',
    description: 'Acierta 10 ciudades en el país correcto en modo puntería.',
    icon: '🏙️',
    tier: 'silver',
    category: 'pinpoint',
    xpReward: 100
  },
  {
    id: 'pinpoint_games_10',
    title: 'Puntería de Bronce',
    description: 'Juega 10 partidas en el modo Puntería Geográfica.',
    icon: '🥉',
    tier: 'bronze',
    category: 'pinpoint',
    xpReward: 50
  },
  {
    id: 'pinpoint_games_50',
    title: 'Puntería de Plata',
    description: 'Juega 50 partidas en el modo Puntería Geográfica.',
    icon: '🥈',
    tier: 'silver',
    category: 'pinpoint',
    xpReward: 150
  },
  {
    id: 'pinpoint_games_100',
    title: 'Puntería de Oro',
    description: 'Juega 100 partidas en el modo Puntería Geográfica.',
    icon: '🥇',
    tier: 'gold',
    category: 'pinpoint',
    xpReward: 300
  },

  // =================================================================
  // 3. 🚩 BANDERAS Y VEXILOLOGÍA (flags)
  // =================================================================
  {
    id: 'flag_first',
    title: 'Primera Insignia',
    description: 'Completa una partida en el modo Banderas.',
    icon: '🚩',
    tier: 'bronze',
    category: 'flags',
    xpReward: 50
  },
  {
    id: 'flag_streak_5',
    title: 'Vexilólogo Novato',
    description: 'Consigue una racha de 5 banderas seguidas sin fallar.',
    icon: '🎌',
    tier: 'bronze',
    category: 'flags',
    xpReward: 50
  },
  {
    id: 'flag_streak_15',
    title: 'Vexilólogo Maestro',
    description: 'Consigue una racha de 15 banderas seguidas sin fallar.',
    icon: '🏁',
    tier: 'gold',
    category: 'flags',
    xpReward: 250
  },
  {
    id: 'flag_speed',
    title: 'Identificador Relámpago',
    description: 'Acierta 5 banderas a gran velocidad sin cometer fallos.',
    icon: '⚡',
    tier: 'silver',
    category: 'flags',
    xpReward: 100
  },
  {
    id: 'flag_perfect',
    title: 'Emblema Dorado',
    description: 'Completa una partida de 20 banderas con el 100% de aciertos.',
    icon: '🎖️',
    tier: 'gold',
    category: 'flags',
    xpReward: 250
  },
  {
    id: 'flag_games_10',
    title: 'Banderas de Bronce',
    description: 'Juega 10 partidas en el modo Banderas.',
    icon: '🥉',
    tier: 'bronze',
    category: 'flags',
    xpReward: 50
  },
  {
    id: 'flag_games_50',
    title: 'Banderas de Plata',
    description: 'Juega 50 partidas en el modo Banderas.',
    icon: '🥈',
    tier: 'silver',
    category: 'flags',
    xpReward: 150
  },
  {
    id: 'flag_games_100',
    title: 'Banderas de Oro',
    description: 'Juega 100 partidas en el modo Banderas.',
    icon: '🥇',
    tier: 'gold',
    category: 'flags',
    xpReward: 300
  },

  // =================================================================
  // 4. ✍️ ESCRITURA Y ORTOGRAFÍA (typing)
  // =================================================================
  {
    id: 'typing_first',
    title: 'Pluma Geográfica',
    description: 'Completa una partida en el modo Escribir País.',
    icon: '✍️',
    tier: 'bronze',
    category: 'typing',
    xpReward: 50
  },
  {
    id: 'typing_clean_5',
    title: 'Sin Borrador',
    description: 'Acierta 5 países seguidos escribiendo su nombre sin fallos.',
    icon: '📝',
    tier: 'silver',
    category: 'typing',
    xpReward: 100
  },
  {
    id: 'typing_clean_15',
    title: 'Mecanógrafo Imperial',
    description: 'Acierta 15 países seguidos escribiendo su nombre exacto.',
    icon: '📜',
    tier: 'gold',
    category: 'typing',
    xpReward: 250
  },
  {
    id: 'typing_hard_name',
    title: 'Ortografía Imposible',
    description: 'Escribe correctamente un país de nombre complejo (ej. Kazajistán, Azerbaiyán, Liechtenstein).',
    icon: '🖋️',
    tier: 'gold',
    category: 'typing',
    xpReward: 250
  },
  {
    id: 'typing_games_10',
    title: 'Escriba de Bronce',
    description: 'Juega 10 partidas en el modo Escribir País.',
    icon: '🥉',
    tier: 'bronze',
    category: 'typing',
    xpReward: 50
  },
  {
    id: 'typing_games_50',
    title: 'Escriba de Plata',
    description: 'Juega 50 partidas en el modo Escribir País.',
    icon: '🥈',
    tier: 'silver',
    category: 'typing',
    xpReward: 150
  },
  {
    id: 'typing_games_100',
    title: 'Escriba de Oro',
    description: 'Juega 100 partidas en el modo Escribir País.',
    icon: '🥇',
    tier: 'gold',
    category: 'typing',
    xpReward: 300
  },

  // =================================================================
  // 5. 💡 TRIVIA Y CURIOSIDADES (trivia)
  // =================================================================
  {
    id: 'trivia_first',
    title: 'Mente Curiosa',
    description: 'Completa una partida de Trivia Geográfica.',
    icon: '💡',
    tier: 'bronze',
    category: 'trivia',
    xpReward: 50
  },
  {
    id: 'trivia_streak_5',
    title: 'Enciclopedia Andante',
    description: 'Acierta 5 preguntas de trivia seguidas.',
    icon: '📚',
    tier: 'silver',
    category: 'trivia',
    xpReward: 100
  },
  {
    id: 'trivia_streak_10',
    title: 'Sabio del Planeta',
    description: 'Acierta 10 preguntas de trivia seguidas.',
    icon: '🎓',
    tier: 'gold',
    category: 'trivia',
    xpReward: 250
  },
  {
    id: 'trivia_no_hints',
    title: 'Sin Ayuda de Nadie',
    description: 'Completa una ronda de trivia sin desvelar ninguna pista.',
    icon: '🧠',
    tier: 'silver',
    category: 'trivia',
    xpReward: 100
  },
  {
    id: 'trivia_games_10',
    title: 'Trivia de Bronce',
    description: 'Juega 10 partidas en el modo Trivia Geográfica.',
    icon: '🥉',
    tier: 'bronze',
    category: 'trivia',
    xpReward: 50
  },
  {
    id: 'trivia_games_50',
    title: 'Trivia de Plata',
    description: 'Juega 50 partidas en el modo Trivia Geográfica.',
    icon: '🥈',
    tier: 'silver',
    category: 'trivia',
    xpReward: 150
  },
  {
    id: 'trivia_games_100',
    title: 'Trivia de Oro',
    description: 'Juega 100 partidas en el modo Trivia Geográfica.',
    icon: '🥇',
    tier: 'gold',
    category: 'trivia',
    xpReward: 300
  },

  // =================================================================
  // 6. 🗺️ HAZ CLIC EN EL MAPA (click_find)
  // =================================================================
  {
    id: 'click_first',
    title: 'Radar Cartográfico',
    description: 'Completa tu primera partida de Haz Clic en el Mapa.',
    icon: '🗺️',
    tier: 'bronze',
    category: 'click_find',
    xpReward: 50
  },
  {
    id: 'click_fast_click',
    title: 'Reflejo Cartográfico',
    description: 'Haz clic en el país correcto en menos de 2 segundos.',
    icon: '⚡',
    tier: 'silver',
    category: 'click_find',
    xpReward: 100
  },
  {
    id: 'click_perfect_20',
    title: 'Cartógrafo Supremo',
    description: 'Acierta 20 países seguidos al primer clic sin fallar.',
    icon: '🌟',
    tier: 'gold',
    category: 'click_find',
    xpReward: 250
  },
  {
    id: 'click_microstate',
    title: 'Lupa de Detective',
    description: 'Encuentra y pulsa con éxito un microestado diminuto (Andorra, Mónaco, San Marino o Malta).',
    icon: '🔍',
    tier: 'gold',
    category: 'click_find',
    xpReward: 250
  },
  {
    id: 'click_games_10',
    title: 'Cartógrafo de Bronce',
    description: 'Juega 10 partidas en el modo Clic en el Mapa.',
    icon: '🥉',
    tier: 'bronze',
    category: 'click_find',
    xpReward: 50
  },
  {
    id: 'click_games_50',
    title: 'Cartógrafo de Plata',
    description: 'Juega 50 partidas en el modo Clic en el Mapa.',
    icon: '🥈',
    tier: 'silver',
    category: 'click_find',
    xpReward: 150
  },
  {
    id: 'click_games_100',
    title: 'Cartógrafo de Oro',
    description: 'Juega 100 partidas en el modo Clic en el Mapa.',
    icon: '🥇',
    tier: 'gold',
    category: 'click_find',
    xpReward: 300
  },

  // =================================================================
  // 7. 🧠 MODO FRIKI Y SECRETOS (geek)
  // =================================================================
  {
    id: 'geek_first',
    title: 'Iniciación Friki',
    description: 'Juega tu primera partida con el Modo Friki activado.',
    icon: '🤓',
    tier: 'bronze',
    category: 'geek',
    xpReward: 50
  },
  {
    id: 'geek_win',
    title: 'Cerebro Friki',
    description: 'Completa una partida en Modo Friki con más del 80% de aciertos.',
    icon: '🧠',
    tier: 'silver',
    category: 'geek',
    xpReward: 100
  },
  {
    id: 'geek_perfect',
    title: 'Erudito Territorial',
    description: 'Partida perfecta (100%) con territorios no soberanos y dependencias.',
    icon: '🔮',
    tier: 'diamond',
    category: 'geek',
    xpReward: 500
  },
  {
    id: 'geek_greenland',
    title: 'Tierra Helada',
    description: 'Identifica Groenlandia como territorio autónomo en Modo Friki.',
    icon: '❄️',
    tier: 'silver',
    category: 'geek',
    xpReward: 100
  },
  {
    id: 'geek_french_guiana',
    title: 'El Enclave Amazónico',
    description: 'Identifica la Guayana Francesa de forma independiente en Modo Friki.',
    icon: '🌿',
    tier: 'gold',
    category: 'geek',
    xpReward: 250
  },

  // =================================================================
  // 8. 📅 DESAFÍO DIARIO (daily)
  // =================================================================
  {
    id: 'daily_first',
    title: 'Hábito Geográfico',
    description: 'Resuelve tu primer Desafío Diario.',
    icon: '📅',
    tier: 'bronze',
    category: 'daily',
    xpReward: 50
  },
  {
    id: 'daily_genius',
    title: 'Sherlock Geográfico',
    description: 'Adivina el país misterioso del Reto Diario en 2 intentos o menos.',
    icon: '🕵️',
    tier: 'gold',
    category: 'daily',
    xpReward: 250
  },
  {
    id: 'daily_streak_3',
    title: 'Racha Prometedora',
    description: 'Resuelve el Desafío Diario 3 días consecutivos.',
    icon: '🔥',
    tier: 'bronze',
    category: 'daily',
    xpReward: 50
  },
  {
    id: 'daily_streak_7',
    title: 'Semana Legendaria',
    description: 'Mantén una racha de 7 días consecutivos en el Reto Diario.',
    icon: '⚡',
    tier: 'silver',
    category: 'daily',
    xpReward: 100
  },
  {
    id: 'daily_streak_30',
    title: 'Mes de Titanio',
    description: 'Mantén una racha de 30 días consecutivos en el Reto Diario.',
    icon: '👑',
    tier: 'diamond',
    category: 'daily',
    xpReward: 500
  },

  // =================================================================
  // 9. ⚔️ MULTIJUGADOR & DUELOS 1v1 (multiplayer)
  // =================================================================
  {
    id: 'duel_first',
    title: 'Primera Sangre',
    description: 'Gana tu primer duelo multijugador 1v1.',
    icon: '⚔️',
    tier: 'bronze',
    category: 'multiplayer',
    xpReward: 50
  },
  {
    id: 'duel_streak_3',
    title: 'Imbatible en la Arena',
    description: 'Gana 3 duelos 1v1 consecutivos.',
    icon: '🛡️',
    tier: 'silver',
    category: 'multiplayer',
    xpReward: 100
  },
  {
    id: 'duel_streak_5',
    title: 'Campeón Invicto',
    description: 'Gana 5 duelos 1v1 consecutivos.',
    icon: '🏆',
    tier: 'gold',
    category: 'multiplayer',
    xpReward: 250
  },
  {
    id: 'duel_rank_gold',
    title: 'Liga de Oro',
    description: 'Alcanza los 1.400 puntos de Elo en el modo competitivo.',
    icon: '🥇',
    tier: 'gold',
    category: 'multiplayer',
    xpReward: 250
  },
  {
    id: 'duel_rank_master',
    title: 'Gran Maestro',
    description: 'Alcanza los 1.800 puntos de Elo en la clasificación mundial.',
    icon: '⚜️',
    tier: 'diamond',
    category: 'multiplayer',
    xpReward: 500
  },
  {
    id: 'duel_games_10',
    title: 'Duelista de Bronce',
    description: 'Completa 10 duelos multijugador 1v1.',
    icon: '🥉',
    tier: 'bronze',
    category: 'multiplayer',
    xpReward: 50
  },
  {
    id: 'duel_games_50',
    title: 'Duelista de Plata',
    description: 'Completa 50 duelos multijugador 1v1.',
    icon: '🥈',
    tier: 'silver',
    category: 'multiplayer',
    xpReward: 150
  },
  {
    id: 'duel_games_100',
    title: 'Duelista de Oro',
    description: 'Completa 100 duelos multijugador 1v1.',
    icon: '🥇',
    tier: 'gold',
    category: 'multiplayer',
    xpReward: 300
  },

  // =================================================================
  // 10. 🏆 GENERALES Y LEYENDA (general)
  // =================================================================
  {
    id: 'first_game',
    title: 'Primeros Pasos',
    description: 'Completa tu primera partida en GeoStrike.',
    icon: '🔰',
    tier: 'bronze',
    category: 'general',
    xpReward: 50
  },
  {
    id: 'games_10',
    title: 'Viajero Habitual',
    description: 'Completa 10 partidas en cualquier modo de juego.',
    icon: '🧳',
    tier: 'bronze',
    category: 'general',
    xpReward: 50
  },
  {
    id: 'games_50',
    title: 'Veterano del Globo',
    description: 'Completa 50 partidas en GeoStrike.',
    icon: '🗺️',
    tier: 'silver',
    category: 'general',
    xpReward: 100
  },
  {
    id: 'score_1000',
    title: 'Explorador Constante',
    description: 'Acumula un total de 1.000 puntos globales.',
    icon: '🥉',
    tier: 'bronze',
    category: 'general',
    xpReward: 50
  },
  {
    id: 'score_5000',
    title: 'Gran Puntuador',
    description: 'Acumula un total de 5.000 puntos globales.',
    icon: '🥈',
    tier: 'silver',
    category: 'general',
    xpReward: 100
  },
  {
    id: 'score_20000',
    title: 'Monarca Geográfico',
    description: 'Acumula más de 20.000 puntos globales.',
    icon: '👑',
    tier: 'diamond',
    category: 'general',
    xpReward: 500
  },
  {
    id: 'streak_5',
    title: 'Chispa de Conocimiento',
    description: 'Consigue una racha de 5 aciertos seguidos.',
    icon: '🔥',
    tier: 'bronze',
    category: 'general',
    xpReward: 50
  },
  {
    id: 'streak_10',
    title: 'Fuego Puro',
    description: 'Consigue una racha de 10 aciertos seguidos.',
    icon: '⚡',
    tier: 'silver',
    category: 'general',
    xpReward: 100
  },
  {
    id: 'streak_20',
    title: 'Clarividente Geográfico',
    description: 'Consigue una racha de 20 aciertos seguidos.',
    icon: '🔮',
    tier: 'gold',
    category: 'general',
    xpReward: 250
  },
  {
    id: 'streak_30',
    title: 'Dios de la Geografía',
    description: 'Consigue una racha épica de 30 aciertos seguidos.',
    icon: '🌌',
    tier: 'diamond',
    category: 'general',
    xpReward: 500
  },
  {
    id: 'perfect_game',
    title: 'Desempeño Impecable',
    description: 'Completa una partida con el 100% de precisión.',
    icon: '💎',
    tier: 'gold',
    category: 'general',
    xpReward: 250
  },
  {
    id: 'tutor_session',
    title: 'Alumno Aplicado',
    description: 'Completa una sesión de refuerzo recomendada por el Tutor.',
    icon: '🎓',
    tier: 'bronze',
    category: 'general',
    xpReward: 50
  }
];

export interface GameEvaluationContext {
  mode?: string;
  continent?: string;
  accuracy?: number;
  maxStreak?: number;
  score?: number;
  totalQuestions?: number;
  correctCount?: number;
  isGeekMode?: boolean;
  isDaily?: boolean;
  distanceKm?: number;
  pinpointScore?: number;
  cleanTypingCount?: number;
  fastGuessesCount?: number;
  specialFlags?: string[];
  duelResult?: 'win' | 'loss' | 'draw';
  duelStreak?: number;
  elo?: number;
  dailyAttempts?: number;
  dailyStreak?: number;
  isTutorPractice?: boolean;
}

export class AchievementService {
  /**
   * Obtiene los logros desbloqueados por el usuario desde localStorage
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
   * Guarda el estado de logros en localStorage
   */
  saveUserAchievements(unlocked: Record<string, UserAchievementState>): void {
    try {
      localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(unlocked));
    } catch (e) {}
  }

  /**
   * Resetea el estado de logros en localStorage
   */
  resetAchievements(): void {
    try {
      localStorage.removeItem(ACHIEVEMENTS_STORAGE_KEY);
    } catch (e) {}
  }

  /**
   * Sincroniza logros desbloqueados con Supabase (para usuarios autenticados)
   */
  async syncWithSupabase(userId?: string): Promise<void> {
    if (!userId || !supabase) return;
    try {
      const localUnlocked = this.getUserAchievements();

      // 1. Obtener los que ya existen en Supabase
      const { data: cloudAchievements, error } = await supabase
        .from('user_achievements')
        .select('achievement_id, unlocked_at')
        .eq('user_id', userId);

      if (!error && cloudAchievements) {
        let changed = false;
        cloudAchievements.forEach((ca: any) => {
          if (!localUnlocked[ca.achievement_id]) {
            localUnlocked[ca.achievement_id] = { unlockedAt: ca.unlocked_at };
            changed = true;
          }
        });
        if (changed) {
          this.saveUserAchievements(localUnlocked);
        }
      }

      // 2. Subir a Supabase los locales que falten
      const cloudIds = new Set(cloudAchievements?.map((ca: any) => ca.achievement_id) || []);
      const toUpload = Object.keys(localUnlocked)
        .filter(id => !cloudIds.has(id))
        .map(id => ({
          user_id: userId,
          achievement_id: id,
          unlocked_at: localUnlocked[id].unlockedAt
        }));

      if (toUpload.length > 0) {
        await supabase.from('user_achievements').upsert(toUpload);
      }
    } catch (e) {
      console.warn('No se pudieron sincronizar los logros con Supabase:', e);
    }
  }

  /**
   * Revisa estadísticas y datos de partida para desbloquear nuevos logros
   * Retorna la lista de logros recién desbloqueados
   */
  evaluateAchievements(
    userStats?: Partial<UserStatsState>,
    gameCtx?: GameEvaluationContext,
    userId?: string
  ): Achievement[] {
    const currentUnlocked = this.getUserAchievements();
    const newlyUnlocked: Achievement[] = [];
    const now = new Date().toISOString();

    const unlock = (achId: string) => {
      if (!currentUnlocked[achId]) {
        const ach = ALL_ACHIEVEMENTS.find(a => a.id === achId);
        if (ach) {
          currentUnlocked[achId] = { unlockedAt: now };
          newlyUnlocked.push(ach);
        }
      }
    };

    // -------------------------------------------------------------
    // A. Progreso General (Partidas y Puntos acumulados)
    // -------------------------------------------------------------
    const gamesPlayed = userStats?.totalGamesPlayed || 0;
    const scoreTotal = userStats?.totalScore || 0;

    if (gamesPlayed >= 1) unlock('first_game');
    if (gamesPlayed >= 10) unlock('games_10');
    if (gamesPlayed >= 50) unlock('games_50');

    if (scoreTotal >= 1000) unlock('score_1000');
    if (scoreTotal >= 5000) unlock('score_5000');
    if (scoreTotal >= 20000) unlock('score_20000');

    // Rachas globales
    const bestStreak = Math.max(userStats?.bestStreak || 0, gameCtx?.maxStreak || 0);
    if (bestStreak >= 5) unlock('streak_5');
    if (bestStreak >= 10) unlock('streak_10');
    if (bestStreak >= 20) unlock('streak_20');
    if (bestStreak >= 30) unlock('streak_30');

    // -------------------------------------------------------------
    // A2. Progreso Escalonado por Minijuego (10, 50, 100 partidas)
    // -------------------------------------------------------------
    const modeStats = userStats?.modeStats || {};
    const pinpointGames = (modeStats['city-pinpoint']?.gamesPlayed || 0) + (modeStats['pinpoint']?.gamesPlayed || 0);
    const flagGames = (modeStats['flag-skip-chain']?.gamesPlayed || 0) + (modeStats['flags']?.gamesPlayed || 0);
    const typingGames = (modeStats['input-write']?.gamesPlayed || 0) + (modeStats['typing']?.gamesPlayed || 0);
    const triviaGames = (modeStats['trivia-curiosities']?.gamesPlayed || 0) + (modeStats['trivia']?.gamesPlayed || 0);
    const clickGames = (modeStats['click-find']?.gamesPlayed || 0) + (modeStats['click_find']?.gamesPlayed || 0);

    if (pinpointGames >= 10) unlock('pinpoint_games_10');
    if (pinpointGames >= 50) unlock('pinpoint_games_50');
    if (pinpointGames >= 100) unlock('pinpoint_games_100');

    if (flagGames >= 10) unlock('flag_games_10');
    if (flagGames >= 50) unlock('flag_games_50');
    if (flagGames >= 100) unlock('flag_games_100');

    if (typingGames >= 10) unlock('typing_games_10');
    if (typingGames >= 50) unlock('typing_games_50');
    if (typingGames >= 100) unlock('typing_games_100');

    if (triviaGames >= 10) unlock('trivia_games_10');
    if (triviaGames >= 50) unlock('trivia_games_50');
    if (triviaGames >= 100) unlock('trivia_games_100');

    if (clickGames >= 10) unlock('click_games_10');
    if (clickGames >= 50) unlock('click_games_50');
    if (clickGames >= 100) unlock('click_games_100');

    // -------------------------------------------------------------
    // B. Contexto de la Partida (gameCtx)
    // -------------------------------------------------------------
    if (gameCtx) {
      const { 
        mode, 
        continent, 
        accuracy = 0, 
        isGeekMode, 
        isDaily, 
        distanceKm, 
        pinpointScore,
        cleanTypingCount = 0,
        fastGuessesCount = 0,
        specialFlags = [],
        duelResult,
        duelStreak = 0,
        elo = 1200,
        dailyAttempts,
        dailyStreak = 0,
        isTutorPractice
      } = gameCtx;

      // Partida impecable
      if (accuracy === 100 && (gameCtx.totalQuestions || 0) >= 5) {
        unlock('perfect_game');
      }

      // Tutor
      if (isTutorPractice) {
        unlock('tutor_session');
      }

      // 1. Continentes y Cartografía
      if (continent === 'Europe' && accuracy >= 90) unlock('explorer_europe');
      if (continent === 'Africa' && accuracy >= 85) unlock('explorer_africa');
      if (continent === 'Asia' && accuracy >= 85) unlock('explorer_asia');
      if (continent === 'Americas' && accuracy >= 90) unlock('explorer_americas');
      if (continent === 'Oceania' && accuracy === 100) unlock('explorer_oceania');
      if (continent === 'World' && accuracy >= 95 && (gameCtx.totalQuestions || 0) >= 150) {
        unlock('master_world');
      }

      // 2. Puntería de Ciudades (pinpoint)
      if (mode === 'city_pinpoint' || mode === 'pinpoint') {
        unlock('pinpoint_first');
        if (distanceKm !== undefined && distanceKm <= 50) unlock('pinpoint_close');
        if (pinpointScore !== undefined && pinpointScore >= 995) unlock('pinpoint_perfect');
        if ((gameCtx.score || 0) >= 4000) unlock('pinpoint_streak');
        if ((gameCtx.correctCount || 0) >= 5) unlock('pinpoint_master');
      }

      // 3. Banderas (flags)
      if (mode === 'flag_skip_chain' || mode === 'flags') {
        unlock('flag_first');
        if (bestStreak >= 5) unlock('flag_streak_5');
        if (bestStreak >= 15) unlock('flag_streak_15');
        if (fastGuessesCount >= 5) unlock('flag_speed');
        if (accuracy === 100 && (gameCtx.totalQuestions || 0) >= 20) unlock('flag_perfect');
      }

      // 4. Escritura (typing)
      if (mode === 'input_write' || mode === 'typing') {
        unlock('typing_first');
        if (cleanTypingCount >= 5) unlock('typing_clean_5');
        if (cleanTypingCount >= 15) unlock('typing_clean_15');
        if (specialFlags.includes('hard_name')) unlock('typing_hard_name');
      }

      // 5. Trivia y Curiosidades
      if (mode === 'trivia_curiosities' || mode === 'trivia') {
        unlock('trivia_first');
        if (bestStreak >= 5) unlock('trivia_streak_5');
        if (bestStreak >= 10) unlock('trivia_streak_10');
        if (accuracy === 100) unlock('trivia_no_hints');
      }

      // 6. Haz Clic en el Mapa
      if (mode === 'click_and_find' || mode === 'click_find') {
        unlock('click_first');
        if (fastGuessesCount >= 1) unlock('click_fast_click');
        if (bestStreak >= 20) unlock('click_perfect_20');
        if (specialFlags.includes('microstate')) unlock('click_microstate');
      }

      // 7. Modo Friki
      if (isGeekMode) {
        unlock('geek_first');
        if (accuracy >= 80) unlock('geek_win');
        if (accuracy === 100 && (gameCtx.totalQuestions || 0) >= 10) unlock('geek_perfect');
        if (specialFlags.includes('GRL')) unlock('geek_greenland');
        if (specialFlags.includes('GUF')) unlock('geek_french_guiana');
      }

      // 8. Desafío Diario
      if (isDaily) {
        unlock('daily_first');
        if (dailyAttempts && dailyAttempts <= 2) unlock('daily_genius');
        if (dailyStreak >= 3) unlock('daily_streak_3');
        if (dailyStreak >= 7) unlock('daily_streak_7');
        if (dailyStreak >= 30) unlock('daily_streak_30');
      }

      // 9. Multijugador & Duelos 1v1
      if (duelResult === 'win') {
        unlock('duel_first');
        if (duelStreak >= 3) unlock('duel_streak_3');
        if (duelStreak >= 5) unlock('duel_streak_5');
      }
      if (elo >= 1400) unlock('duel_rank_gold');
      if (elo >= 1800) unlock('duel_rank_master');
    }

    if (newlyUnlocked.length > 0) {
      this.saveUserAchievements(currentUnlocked);
      if (userId) {
        this.syncWithSupabase(userId);
      }
    }

    return newlyUnlocked;
  }

  /**
   * Obtiene la lista completa de logros con su progreso para la vista de medallas
   */
  getAchievementsProgress(userStats: UserStatsState): AchievementProgress[] {
    const unlockedMap = this.getUserAchievements();
    const modeStats = userStats.modeStats || {};

    const pinpointGames = (modeStats['city-pinpoint']?.gamesPlayed || 0) + (modeStats['pinpoint']?.gamesPlayed || 0);
    const flagGames = (modeStats['flag-skip-chain']?.gamesPlayed || 0) + (modeStats['flags']?.gamesPlayed || 0);
    const typingGames = (modeStats['input-write']?.gamesPlayed || 0) + (modeStats['typing']?.gamesPlayed || 0);
    const triviaGames = (modeStats['trivia-curiosities']?.gamesPlayed || 0) + (modeStats['trivia']?.gamesPlayed || 0);
    const clickGames = (modeStats['click-find']?.gamesPlayed || 0) + (modeStats['click_find']?.gamesPlayed || 0);
    const duelGames = (modeStats['multiplayer']?.gamesPlayed || 0) + (modeStats['duels']?.gamesPlayed || 0);

    return ALL_ACHIEVEMENTS.map(ach => {
      const unlockedState = unlockedMap[ach.id];
      const isUnlocked = Boolean(unlockedState);
      let currentValue = 0;
      let targetValue = 1;

      switch (ach.id) {
        case 'first_game':
          currentValue = Math.min(1, userStats.totalGamesPlayed);
          break;
        case 'games_10':
          currentValue = Math.min(10, userStats.totalGamesPlayed);
          targetValue = 10;
          break;
        case 'games_50':
          currentValue = Math.min(50, userStats.totalGamesPlayed);
          targetValue = 50;
          break;
        case 'score_1000':
          currentValue = userStats.totalScore;
          targetValue = 1000;
          break;
        case 'score_5000':
          currentValue = userStats.totalScore;
          targetValue = 5000;
          break;
        case 'score_20000':
          currentValue = userStats.totalScore;
          targetValue = 20000;
          break;
        case 'streak_5':
        case 'flag_streak_5':
        case 'trivia_streak_5':
          currentValue = userStats.bestStreak;
          targetValue = 5;
          break;
        case 'streak_10':
        case 'trivia_streak_10':
          currentValue = userStats.bestStreak;
          targetValue = 10;
          break;
        case 'streak_20':
        case 'flag_streak_15':
          currentValue = userStats.bestStreak;
          targetValue = 20;
          break;
        case 'streak_30':
          currentValue = userStats.bestStreak;
          targetValue = 30;
          break;

        // Progresivos por Minijuego
        case 'pinpoint_games_10':
          currentValue = Math.min(10, pinpointGames);
          targetValue = 10;
          break;
        case 'pinpoint_games_50':
          currentValue = Math.min(50, pinpointGames);
          targetValue = 50;
          break;
        case 'pinpoint_games_100':
          currentValue = Math.min(100, pinpointGames);
          targetValue = 100;
          break;

        case 'flag_games_10':
          currentValue = Math.min(10, flagGames);
          targetValue = 10;
          break;
        case 'flag_games_50':
          currentValue = Math.min(50, flagGames);
          targetValue = 50;
          break;
        case 'flag_games_100':
          currentValue = Math.min(100, flagGames);
          targetValue = 100;
          break;

        case 'typing_games_10':
          currentValue = Math.min(10, typingGames);
          targetValue = 10;
          break;
        case 'typing_games_50':
          currentValue = Math.min(50, typingGames);
          targetValue = 50;
          break;
        case 'typing_games_100':
          currentValue = Math.min(100, typingGames);
          targetValue = 100;
          break;

        case 'trivia_games_10':
          currentValue = Math.min(10, triviaGames);
          targetValue = 10;
          break;
        case 'trivia_games_50':
          currentValue = Math.min(50, triviaGames);
          targetValue = 50;
          break;
        case 'trivia_games_100':
          currentValue = Math.min(100, triviaGames);
          targetValue = 100;
          break;

        case 'click_games_10':
          currentValue = Math.min(10, clickGames);
          targetValue = 10;
          break;
        case 'click_games_50':
          currentValue = Math.min(50, clickGames);
          targetValue = 50;
          break;
        case 'click_games_100':
          currentValue = Math.min(100, clickGames);
          targetValue = 100;
          break;

        case 'duel_games_10':
          currentValue = Math.min(10, duelGames);
          targetValue = 10;
          break;
        case 'duel_games_50':
          currentValue = Math.min(50, duelGames);
          targetValue = 50;
          break;
        case 'duel_games_100':
          currentValue = Math.min(100, duelGames);
          targetValue = 100;
          break;

        default:
          currentValue = isUnlocked ? 1 : 0;
          targetValue = 1;
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
