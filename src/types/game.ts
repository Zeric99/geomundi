import { Continent, Country } from './country';
import { CityThemeCategory } from '../data/citiesData';

export type GameMode = 'click-find' | 'input-write' | 'match-cards' | 'trivia-curiosities' | 'list-select' | 'explore' | 'flag-skip-chain' | 'city-pinpoint';

export type QuestionType = 'name' | 'flag' | 'capital' | 'mixed' | 'trivia' | 'city-location';

export interface CityTarget {
  id: string;
  nameEs: string;
  nameEn: string;
  countryNameEs: string;
  cca3: string;
  continent: Continent;
  coordinates: [number, number]; // [lng, lat]
  population?: number;
  triviaFact: string;
  flagEmoji?: string;
}

export interface PinpointResult {
  city: CityTarget;
  clickedCoordinates: [number, number]; // [lng, lat]
  distanceKm: number;
  score: number;
  isSameCountry: boolean;
  isSameContinent: boolean;
  badgeTitle: string;
}

export interface TriviaItem {
  id: string;
  countryCode: string; // cca3
  question: string;
  factExplanation: string;
  category: 'records' | 'nature' | 'history' | 'culture' | 'geography';
  hint?: string;
}

export interface GameConfig {
  mode: GameMode;
  continent: Continent;
  questionType: QuestionType;
  totalQuestions: number;      // e.g. 5, 10, 20, 50, 195 (todos)
  timeLimitPerQuestion?: number;// in seconds (0 = no limit)
  allowHints: boolean;
  focusedPracticeCodes?: string[]; // If playing a targeted session on blind spots
  isAllCountriesMarathon?: boolean;
  isGeekMode?: boolean;         // Si incluye más de 40 territorios especiales y estados de facto
  cityTheme?: CityThemeCategory;
}

export interface Question {
  id: string;
  country: Country;
  questionType: QuestionType;
  promptText: string;
  hintUsed: boolean;
  attempts: number;
  triviaItem?: TriviaItem;
}

export interface MatchPair {
  id: string;
  country: Country;
  matched: boolean;
  selected: boolean;
  errorFlash?: boolean;
}

export interface GameRoundResult {
  question: Question;
  userSuccess: boolean;
  firstTry: boolean;
  attemptsUsed: number;
  timeSpentMs: number;
  pointsEarned: number;
  wrongCountryCode?: string;
}

export interface GameSummary {
  mode: GameMode;
  continent: Continent;
  totalQuestions: number;
  correctCount: number;
  firstTryCount: number;
  wrongCount: number;
  score: number;
  maxStreak: number;
  accuracy: number;
  durationSeconds: number;
  playedAt: string; // ISO String
  results: GameRoundResult[];
}
