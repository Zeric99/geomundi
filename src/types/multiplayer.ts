import { QuestionType } from './game';
import { Country } from './country';

export type RankTier = 'bronce' | 'plata' | 'oro' | 'platino' | 'diamante';

export type MultiplayerType = 'friendly' | 'ranked' | 'custom_room';

export type DuelMode = 'pinpoint' | 'countries' | 'flags' | 'capitals';

export interface ModeEloConfig {
  mode: DuelMode;
  name: string;
  subtitle: string;
  icon: string;
  colorHex: string;
  textClass: string;
  borderClass: string;
  bgClass: string;
  badgeClass: string;
  glowClass: string;
}

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
  elo: number; // ELO general / promedio
  rank: RankInfo;
  wins: number;
  losses: number;
  streak: number;
  xp: number;
  level: number;
  elos?: Record<DuelMode, number>;
  statsByMode?: Record<DuelMode, { wins: number; losses: number; duels: number }>;
}

export interface CustomRoomConfig {
  roomCode: string;
  mode: DuelMode;
  continent: string;
  totalRounds: number; // 3, 5, 10
  timeLimitSeconds: number; // 15, 30, 60, 0 (sin límite)
  isHost: boolean;
}

export interface DuelQuestion {
  country: Country;
  questionType: QuestionType;
  promptText: string;
  cityTarget?: any; // Para el modo puntería (CityTarget)
}

export interface PlayerRoundResult {
  questionIndex: number;
  userSuccess: boolean;
  timeSpentMs: number;
  points: number;
  distanceKm?: number;
}

export interface CommunityChallenge {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  creatorElo: number;
  mode: DuelMode;
  score: number;
  totalTimeMs: number;
  questions: DuelQuestion[];
  roundResults: PlayerRoundResult[];
  createdAt: string;
  status?: 'open' | 'in_progress' | 'completed';
  roomCode?: string;
  challengerId?: string;
  challengerName?: string;
  challengerAvatar?: string;
  challengerElo?: number;
  challengerScore?: number;
  challengerTimeMs?: number;
  winner?: 'creator' | 'challenger' | 'tie';
  eloChange?: number;
  resolvedAt?: string;
  creatorNotified?: boolean;
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
  xpEarned: number;
  roomConfig?: CustomRoomConfig;
  challengeId?: string;
  isChallengeCreation?: boolean;
  isSurrender?: boolean;
}

