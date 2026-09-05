import { Country } from '../types/country';
import { GameRoundResult, Question } from '../types/game';

const DAILY_STORAGE_KEY = 'GEOMUNDI_DAILY_CHALLENGE_V1';

export interface DailyChallengeRecord {
  dateStr: string; // YYYY-MM-DD
  completed: boolean;
  score: number;
  accuracy: number;
  completedAt: string;
}

export interface DailyStreakState {
  currentStreak: number;
  bestStreak: number;
  lastCompletedDate: string;
  history: Record<string, DailyChallengeRecord>;
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
   * Genera las 10 preguntas deterministas para la fecha dada
   */
  generateDailyQuestions(countries: Country[], dateStr: string = this.getTodayDateString()): Question[] {
    if (countries.length === 0) return [];

    const seed = hashString(dateStr);
    const rng = seededRandom(seed);

    // Separar países por continente para asegurar variedad
    const continents = ['Europe', 'Americas', 'Africa', 'Asia', 'Oceania'] as const;
    const pool: Country[] = [];

    continents.forEach(cont => {
      const contCountries = countries.filter(c => c.continent === cont);
      const shuffled = [...contCountries].sort(() => rng() - 0.5);
      pool.push(...shuffled.slice(0, 2)); // 2 por continente = 10
    });

    // Si faltan para 10, rellenar
    if (pool.length < 10) {
      const remaining = countries.filter(c => !pool.includes(c));
      const shuffled = [...remaining].sort(() => rng() - 0.5);
      pool.push(...shuffled.slice(0, 10 - pool.length));
    }

    // Barajar lista final deterministamente
    const finalShuffled = [...pool].sort(() => rng() - 0.5);

    const questionTypes = ['name', 'flag', 'capital'] as const;

    return finalShuffled.map((country, idx) => {
      const qType = questionTypes[Math.floor(rng() * questionTypes.length)];
      let promptText = `Ubica ${country.nameEs}`;
      if (qType === 'capital') {
        promptText = `¿Qué país tiene por capital ${country.capital}?`;
      } else if (qType === 'flag') {
        promptText = `Identifica el país de esta bandera`;
      }

      return {
        id: `daily_${dateStr}_${country.cca3}_${idx}`,
        country,
        questionType: qType,
        promptText,
        hintUsed: false,
        attempts: 0
      };
    });
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
  recordDailyCompletion(score: number, accuracy: number): DailyStreakState {
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
   * Genera el texto copiable estilo Wordle para compartir en redes/WhatsApp
   */
  generateShareSnippet(score: number, accuracy: number, results: GameRoundResult[], dateStr: string = this.getTodayDateString()): string {
    const blocks = results.map(r => {
      if (r.firstTry) return '🟩';
      if (r.userSuccess) return '🟨';
      return '🟥';
    }).join('');

    return `🌍 MapTap Desafío Diario #${dateStr}
🎯 Precisión: ${accuracy}% | 🏆 Puntos: ${score} pts
${blocks}

¡Juega gratis y pon a prueba tu geografía en MapTap! 🗺️✨`;
  }
}

export const dailyChallengeService = new DailyChallengeService();
