import { Continent, Country } from './country';

export type GameMode = 'click-find' | 'input-write' | 'match-cards' | 'explore';

export type QuestionType = 'name' | 'flag' | 'capital' | 'mixed';

export interface GameConfig {
  mode: GameMode;
  continent: Continent;
  questionType: QuestionType;
  totalQuestions: number;      // e.g. 10, 20, or custom
  timeLimitPerQuestion?: number;// in seconds (0 = no limit)
  allowHints: boolean;
  focusedPracticeCodes?: string[]; // If playing a targeted session on blind spots
}

export interface Question {
  id: string;
  country: Country;
  questionType: QuestionType;
  promptText: string;
  hintUsed: boolean;
  attempts: number;
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
