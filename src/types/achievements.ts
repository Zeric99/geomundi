export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'diamond';

export type AchievementCategory = 
  | 'continents'    // 🌍 Mapas y Continentes
  | 'pinpoint'      // 🎯 Puntería de Ciudades
  | 'flags'         // 🚩 Banderas y Vexilología
  | 'typing'        // ✍️ Escritura y Ortografía
  | 'trivia'        // 💡 Trivia y Curiosidades
  | 'click_find'    // 🗺️ Haz Clic en el Mapa
  | 'geek'          // 🧠 Modo Friki y Territorios
  | 'daily'         // 📅 Desafío Diario
  | 'multiplayer'   // ⚔️ Multijugador & Duelos
  | 'general';      // 🏆 Generales y Leyenda

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // Emoji o icono
  tier: AchievementTier;
  category: AchievementCategory;
  xpReward: number; // Puntos de experiencia para subir nivel (futura economia)
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
