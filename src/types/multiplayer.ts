import { QuestionType } from './game';
import { Country } from './country';

export type RankTier = 'bronce' | 'plata' | 'oro' | 'platino' | 'diamante';

export type MultiplayerType = 'friendly' | 'ranked';

export type DuelMode = 'countries' | 'flags' | 'capitals';

export interface RankInfo {
  tier: RankTier;
  label: string;
  icon: string; // Emoji
  minElo: number;
  maxElo: number;
  color: string;
  border: string;
  bg: string;
}

export interface PlayerProfile {
  id: string;
  name: string;
  avatar: string;
  elo: number;
  rank: RankInfo;
  wins: number;
  losses: number;
  streak: number;
}

export interface DuelQuestion {
  country: Country;
  questionType: QuestionType;
  promptText: string;
}

export interface PlayerRoundResult {
  questionIndex: number;
  userSuccess: boolean;
  timeSpentMs: number;
  points: number;
}

export interface DuelState {
  id: string;
  type: MultiplayerType;
  duelMode: DuelMode;
  questions: DuelQuestion[];
  player: PlayerProfile;
  rival: PlayerProfile;
  playerResults: PlayerRoundResult[];
  rivalResults: PlayerRoundResult[];
  playerScore: number;
  rivalScore: number;
  playerTimeTotalMs: number;
  rivalTimeTotalMs: number;
  winner: 'player' | 'rival' | 'tie' | null;
  eloChange: number;
}
