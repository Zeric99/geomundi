import { Country } from '../types/country';
import { GameRoundResult, Question, TriviaItem } from '../types/game';
import { TRIVIA_POOL } from '../data/triviaPool';

const DAILY_STORAGE_KEY = 'GEOMUNDI_DAILY_CHALLENGE_V1';

export type DailyStageType = 'name-to-map' | 'flag-to-map' | 'capital-to-map' | 'map-to-input' | 'trivia-to-country';

export interface DailyStageQuestion {
  stage: 1 | 2 | 3 | 4 | 5;
  stageTitle: string;
  stageSubtitle: string;
  stageType: DailyStageType;
  country: Country;
  promptText: string;
  detailText?: string;
  triviaItem?: TriviaItem;
}

export interface DailyChallengeRecord {
  dateStr: string; // YYYY-MM-DD
  completed: boolean;
  score: number;
  accuracy: number;
  durationSeconds: number;
  completedAt: string;
}

export interface DailyStreakState {
  currentStreak: number;
  bestStreak: number;
  lastCompletedDate: string;
  history: Record<string, DailyChallengeRecord>;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  avatar: string;
  score: number;
  accuracy: number;
  durationSeconds: number;
  isUser?: boolean;
  countryCode?: string;
  playedDate?: string;
}

// PRNG con semilla basada en texto (Mulberry32)
function seededRandom(seed: number) {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

export class DailyChallengeService {
  /**
   * Obtiene la fecha actual formateada YYYY-MM-DD
   */
  getTodayDateString(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Genera las 5 preguntas estructuradas y deterministas para el día:
   * 1. Nombre -> Clicar en mapa
   * 2. Bandera -> Clicar en mapa
   * 3. Capital -> Clicar en mapa
   * 4. Resaltado en mapa -> Escribir nombre
   * 5. Trivia / Curiosidad -> Clicar en mapa
   */
  generateDailyQuestions(countries: Country[], dateStr: string = this.getTodayDateString()): DailyStageQuestion[] {
    if (countries.length === 0) return [];

    const seed = hashString(dateStr);
    const rng = seededRandom(seed);

    // Seleccionar 5 países únicos evitando repetirlos en la misma sesión
    const shuffledCountries = [...countries].sort(() => rng() - 0.5);
    const selectedCountries = shuffledCountries.slice(0, 5);

    // Seleccionar 1 pregunta de trivia determinista de la pool
    const triviaPoolShuffled = [...TRIVIA_POOL].sort(() => rng() - 0.5);
    const selectedTrivia = triviaPoolShuffled[0];
    const triviaCountry = countries.find(c => c.cca3 === selectedTrivia.countryCode) || selectedCountries[4];

    return [
      {
        stage: 1,
        stageTitle: 'Etapa 1: Nombre ➔ Mapa',
        stageSubtitle: 'Haz clic en el mapa donde está el país especificado',
        stageType: 'name-to-map',
        country: selectedCountries[0],
        promptText: `¿Dónde se ubica ${selectedCountries[0].nameEs} en el mapa mundial?`
      },
      {
        stage: 2,
        stageTitle: 'Etapa 2: Bandera ➔ Mapa',
        stageSubtitle: 'Identifica esta bandera y búscala en el mapa',
        stageType: 'flag-to-map',
        country: selectedCountries[1],
        promptText: `¿A qué país corresponde esta bandera nacional?`,
        detailText: selectedCountries[1].flagSvg
      },
      {
        stage: 3,
        stageTitle: 'Etapa 3: Capital ➔ Mapa',
        stageSubtitle: 'Ubica el país al que pertenece la capital',
        stageType: 'capital-to-map',
        country: selectedCountries[2],
        promptText: `¿En qué país se encuentra la capital ${selectedCountries[2].capital}?`,
        detailText: selectedCountries[2].capital
      },
      {
        stage: 4,
        stageTitle: 'Etapa 4: Mapa ➔ Escribir Nombre',
        stageSubtitle: 'El país está marcado en el mapa. Escribe su nombre',
        stageType: 'map-to-input',
        country: selectedCountries[3],
        promptText: `¿Qué país es el que aparece seleccionado en amarillo en el mapa?`
      },
      {
        stage: 5,
        stageTitle: 'Etapa 5: Trivia ➔ País',
        stageSubtitle: 'Resuelve la curiosidad seleccionando el país correcto',
        stageType: 'trivia-to-country',
        country: triviaCountry,
        promptText: selectedTrivia.question,
        detailText: selectedTrivia.hint,
        triviaItem: selectedTrivia
      }
    ];
  }

  /**
   * Obtiene el estado del reto diario y rachas del localStorage
   */
  getStreakState(): DailyStreakState {
    try {
      const raw = localStorage.getItem(DAILY_STORAGE_KEY);
      if (!raw) return { currentStreak: 0, bestStreak: 0, lastCompletedDate: '', history: {} };
      return JSON.parse(raw);
    } catch (e) {
      return { currentStreak: 0, bestStreak: 0, lastCompletedDate: '', history: {} };
    }
  }

  /**
   * Comprueba si el reto de hoy ya fue completado
   */
  isTodayCompleted(): boolean {
    const state = this.getStreakState();
    const today = this.getTodayDateString();
    return Boolean(state.history[today]?.completed);
  }

  /**
   * Registra el resultado del reto diario de hoy y actualiza racha
   */
  recordDailyCompletion(score: number, accuracy: number, durationSeconds: number): DailyStreakState {
    const state = this.getStreakState();
    const today = this.getTodayDateString();

    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = `${yesterdayDate.getFullYear()}-${String(yesterdayDate.getMonth() + 1).padStart(2, '0')}-${String(yesterdayDate.getDate()).padStart(2, '0')}`;

    let newStreak = state.currentStreak;
    if (state.lastCompletedDate === yesterdayStr) {
      newStreak += 1;
    } else if (state.lastCompletedDate !== today) {
      newStreak = 1;
    }

    const newBestStreak = Math.max(state.bestStreak, newStreak);

    const updatedState: DailyStreakState = {
      currentStreak: newStreak,
      bestStreak: newBestStreak,
      lastCompletedDate: today,
      history: {
        ...state.history,
        [today]: {
          dateStr: today,
          completed: true,
          score,
          accuracy,
          durationSeconds,
          completedAt: new Date().toISOString()
        }
      }
    };

    try {
      localStorage.setItem(DAILY_STORAGE_KEY, JSON.stringify(updatedState));
    } catch (e) {}

    return updatedState;
  }

  /**
   * Obtiene el ranking diario para la fecha dada (con rivales del día deterministas)
   */
  getDailyLeaderboard(dateStr: string = this.getTodayDateString()): LeaderboardEntry[] {
    const seed = hashString(dateStr + '_leaderboard');
    const rng = seededRandom(seed);

    const rivalNames = [
      { name: 'MateoGamer99', avatar: '👨‍🚀', country: 'ES' },
      { name: 'Sofia_Geo', avatar: '👩‍🏫', country: 'MX' },
      { name: 'LucasExplorer', avatar: '🦊', country: 'AR' },
      { name: 'Elena_Atlas', avatar: '👑', country: 'CL' },
      { name: 'Carlos_World', avatar: '🦁', country: 'CO' },
      { name: 'Vanesa_Map', avatar: '👩‍💻', country: 'ES' },
      { name: 'David_Geek', avatar: '🚀', country: 'PE' },
      { name: 'Lucia_Banderas', avatar: '🎨', country: 'UY' },
      { name: 'Nico_Master', avatar: '⚡', country: 'EC' }
    ];

    const rivals: LeaderboardEntry[] = rivalNames.map((r) => {
      const score = Math.floor(rng() * 200) + 800; // 800-1000 pts
      const accuracy = score > 950 ? 100 : score > 900 ? 80 : 60;
      const durationSeconds = Math.floor(rng() * 25) + 15; // 15-40s
      return {
        rank: 0,
        username: r.name,
        avatar: r.avatar,
        score,
        accuracy,
        durationSeconds,
        countryCode: r.country
      };
    });

    const state = this.getStreakState();
    const userToday = state.history[dateStr];

    if (userToday) {
      rivals.push({
        rank: 0,
        username: 'Tú (Jugador Local)',
        avatar: '🫵',
        score: userToday.score,
        accuracy: userToday.accuracy,
        durationSeconds: userToday.durationSeconds || 30,
        isUser: true,
        countryCode: 'ES'
      });
    }

    // Ordenar por score desc, luego duration asc
    rivals.sort((a, b) => b.score - a.score || a.durationSeconds - b.durationSeconds);
    return rivals.map((entry, idx) => ({ ...entry, rank: idx + 1 }));
  }

  /**
   * Obtiene el ranking acumulado mundial global de todos los tiempos
   */
  getGlobalLeaderboard(): LeaderboardEntry[] {
    const globalRivals: LeaderboardEntry[] = [
      { rank: 1, username: 'AtlasKing99', avatar: '👑', score: 14850, accuracy: 98, durationSeconds: 0, countryCode: 'ES' },
      { rank: 2, username: 'GeoMaster_Latam', avatar: '🌎', score: 12400, accuracy: 95, durationSeconds: 0, countryCode: 'MX' },
      { rank: 3, username: 'Carmen_Cartografa', avatar: '🧭', score: 11200, accuracy: 94, durationSeconds: 0, countryCode: 'AR' },
      { rank: 4, username: 'Diego_Speed', avatar: '⚡', score: 9850, accuracy: 91, durationSeconds: 0, countryCode: 'CL' },
      { rank: 5, username: 'Laura_Banderas', avatar: '🚩', score: 8900, accuracy: 89, durationSeconds: 0, countryCode: 'CO' },
      { rank: 6, username: 'Alvaro_Geek', avatar: '🎓', score: 7650, accuracy: 88, durationSeconds: 0, countryCode: 'ES' },
      { rank: 7, username: 'Beatriz_World', avatar: '🌟', score: 6500, accuracy: 86, durationSeconds: 0, countryCode: 'PE' }
    ];

    const state = this.getStreakState();
    const historyEntries = Object.values(state.history);
    const userTotalScore = historyEntries.reduce((acc, curr) => acc + curr.score, 0);

    if (userTotalScore > 0) {
      const avgAccuracy = Math.round(
        historyEntries.reduce((acc, curr) => acc + curr.accuracy, 0) / historyEntries.length
      );

      globalRivals.push({
        rank: 0,
        username: 'Tú (Jugador Local)',
        avatar: '🫵',
        score: userTotalScore,
        accuracy: avgAccuracy,
        durationSeconds: 0,
        isUser: true,
        countryCode: 'ES'
      });
    }

    globalRivals.sort((a, b) => b.score - a.score);
    return globalRivals.map((entry, idx) => ({ ...entry, rank: idx + 1 }));
  }

  /**
   * Genera el texto copiable estilo Wordle para compartir en redes/WhatsApp
   */
  generateShareSnippet(score: number, accuracy: number, durationOrResults?: number | GameRoundResult[], dateStr: string = this.getTodayDateString()): string {
    const duration = typeof durationOrResults === 'number' ? durationOrResults : 30;
    return `🌍 MapTap Desafío Diario #${dateStr}
🎯 Precisión: ${accuracy}% | ⏱️ Tiempo: ${duration}s | 🏆 Puntos: ${score} pts
🟩🟩🟩🟩🟩 (5/5 Pruebas Superadas)

¡Juega gratis y pon a prueba tu geografía en MapTap! 🗺️✨`;
  }
}

export const dailyChallengeService = new DailyChallengeService();
