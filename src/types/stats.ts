import { Continent, ContinentEs } from './country';
import { GameSummary } from './game';

export interface CountryPerformance {
  cca3: string;
  nameEs: string;
  continent: Continent;
  totalAttempts: number;
  firstTrySuccesses: number;
  mistakes: number;
  lastReviewedAt: string; // ISO date
  averageResponseTimeMs: number;
  lastMistakeContext?: string;
  confusionCountries?: string[]; // Codes of countries mistakenly selected instead
}

export interface ContinentMastery {
  continent: Continent;
  continentEs: ContinentEs;
  totalCountries: number;
  playedCountries: number;
  masteredCountries: number; // >80% first try
  accuracyPercentage: number;
  totalAttempts: number;
  totalMistakes: number;
  level: 'Novato' | 'Aprendiz' | 'Avanzado' | 'Experto' | 'Maestro';
}

export interface BlindSpotItem {
  cca3: string;
  nameEs: string;
  capital: string;
  continent: Continent;
  continentEs: ContinentEs;
  flagSvg: string;
  mistakeRate: number;       // percentage 0 - 100
  totalAttempts: number;
  mistakes: number;
  confusionWith?: string[];  // names of confused countries
}

export interface TutorAdvice {
  id: string;
  type: 'praise' | 'warning' | 'recommendation' | 'tip';
  title: string;
  description: string;
  targetContinent?: Continent;
  targetCountries?: string[]; // cca3 codes
  actionLabel?: string;
}

export interface UserStatsState {
  version: number;
  countries: Record<string, CountryPerformance>;
  gameHistory: GameSummary[];
  totalScore: number;
  totalGamesPlayed: number;
  bestStreak: number;
  lastSessionDate: string;
}
