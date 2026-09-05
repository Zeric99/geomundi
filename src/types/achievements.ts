export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'diamond';

export type AchievementCategory = 'games' | 'streaks' | 'mastery' | 'daily' | 'geek';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // Emoji o icono
  tier: AchievementTier;
  category: AchievementCategory;
  secret?: boolean;
}

export interface UserAchievementState {
  unlockedAt: string; // ISO String
}

export interface AchievementProgress {
  achievement: Achievement;
  unlocked: boolean;
  unlockedAt?: string;
  progressPercent: number; // 0 - 100
  currentValue: number;
  targetValue: number;
}
