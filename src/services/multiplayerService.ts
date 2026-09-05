import { Country } from '../types/country';
import { QuestionType } from '../types/game';
import { DuelMode, DuelQuestion, PlayerProfile, PlayerRoundResult, RankInfo, RankTier } from '../types/multiplayer';

const MULTIPLAYER_PROFILE_KEY = 'GEOMUNDI_MULTIPLAYER_PROFILE_V1';

export const RANKS: Record<RankTier, RankInfo> = {
  bronce: {
    tier: 'bronce',
    label: 'Bronce',
    icon: '🟤',
    minElo: 0,
    maxElo: 1099,
    color: 'text-amber-700',
    border: 'border-amber-700/60',
    bg: 'bg-amber-950/40'
  },
  plata: {
    tier: 'plata',
    label: 'Plata',
    icon: '⚪',
    minElo: 1100,
    maxElo: 1299,
    color: 'text-slate-300',
    border: 'border-slate-400/60',
    bg: 'bg-slate-900/50'
  },
  oro: {
    tier: 'oro',
    label: 'Oro',
    icon: '🟡',
    minElo: 1300,
    maxElo: 1499,
    color: 'text-yellow-400',
    border: 'border-yellow-500/60',
    bg: 'bg-yellow-950/40'
  },
  platino: {
    tier: 'platino',
    label: 'Platino',
    icon: '💎',
    minElo: 1500,
    maxElo: 1699,
    color: 'text-cyan-300',
    border: 'border-cyan-400/60',
    bg: 'bg-cyan-950/40'
  },
  diamante: {
    tier: 'diamante',
    label: 'Diamante / Maestro',
    icon: '👑',
    minElo: 1700,
    maxElo: 9999,
    color: 'text-purple-300',
    border: 'border-purple-400/60',
    bg: 'bg-purple-950/40'
  }
};

const BOT_NAMES = [
  { name: 'GeoMaster_ES', avatar: '🦁' },
  { name: 'AtlasPro99', avatar: '🦅' },
  { name: 'VanguardGeographer', avatar: '🐺' },
  { name: 'MapRunner', avatar: '⚡' },
  { name: 'GlobeTrotter_99', avatar: '🦊' },
  { name: 'CapitalKing', avatar: '👑' },
  { name: 'FlagChaser', avatar: '🚩' },
  { name: 'TerraExplorer', avatar: '🌍' }
];

export class MultiplayerService {
  /**
   * Obtiene la información del rango correspondiente a un ELO determinado
   */
  getRankInfo(elo: number): RankInfo {
    if (elo >= 1700) return RANKS.diamante;
    if (elo >= 1500) return RANKS.platino;
    if (elo >= 1300) return RANKS.oro;
    if (elo >= 1100) return RANKS.plata;
    return RANKS.bronce;
  }

  /**
   * Carga el perfil multijugador del jugador local
   */
  getPlayerProfile(): PlayerProfile {
    try {
      const stored = localStorage.getItem(MULTIPLAYER_PROFILE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const elo = parsed.elo || 1000;
        return {
          id: parsed.id || 'player_local',
          name: parsed.name || 'Tú',
          avatar: parsed.avatar || '🎓',
          elo,
          rank: this.getRankInfo(elo),
          wins: parsed.wins || 0,
          losses: parsed.losses || 0,
          streak: parsed.streak || 0
        };
      }
    } catch (e) {}

    const defaultElo = 1000;
    return {
      id: 'player_local',
      name: 'Tú',
      avatar: '🎓',
      elo: defaultElo,
      rank: this.getRankInfo(defaultElo),
      wins: 0,
      losses: 0,
      streak: 0
    };
  }

  /**
   * Guarda el perfil multijugador actualizado
   */
  savePlayerProfile(profile: PlayerProfile): void {
    try {
      localStorage.setItem(MULTIPLAYER_PROFILE_KEY, JSON.stringify(profile));
    } catch (e) {}
  }

  /**
   * Genera un oponente aleatorio ajustado al ELO del jugador
   */
  generateRival(playerElo: number): PlayerProfile {
    const randomBot = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
    const eloOffset = Math.floor(Math.random() * 80) - 40; // -40 a +40 ELO
    const rivalElo = Math.max(800, playerElo + eloOffset);

    return {
      id: `bot_${Date.now()}`,
      name: randomBot.name,
      avatar: randomBot.avatar,
      elo: rivalElo,
      rank: this.getRankInfo(rivalElo),
      wins: Math.floor(rivalElo / 20),
      losses: Math.floor(rivalElo / 30),
      streak: Math.floor(Math.random() * 4)
    };
  }

  /**
   * Genera 10 preguntas estandarizadas para el duelo según la modalidad elegida
   */
  generateDuelQuestions(countries: Country[], duelMode: DuelMode): DuelQuestion[] {
    if (countries.length === 0) return [];

    const shuffled = [...countries].sort(() => Math.random() - 0.5).slice(0, 10);

    return shuffled.map(country => {
      let qType: QuestionType = 'name';
      let promptText = `Ubica ${country.nameEs}`;

      if (duelMode === 'flags') {
        qType = 'flag';
        promptText = `Identifica el país de esta bandera`;
      } else if (duelMode === 'capitals') {
        qType = 'capital';
        promptText = `¿Qué país tiene por capital ${country.capital}?`;
      }

      return {
        country,
        questionType: qType,
        promptText
      };
    });
  }

  /**
   * Simula las respuestas del rival según su ELO (para jugabilidad inmediata 1v1)
   */
  simulateRivalPerformance(questions: DuelQuestion[], rivalElo: number): PlayerRoundResult[] {
    // A mayor ELO, mayor precisión (0.6 a 0.95) y mejor tiempo promedio (3s a 8s)
    const accuracyProbability = Math.min(0.95, Math.max(0.6, 0.6 + (rivalElo - 800) * 0.00035));
    const baseTimeMs = Math.max(2500, 7500 - (rivalElo - 800) * 3);

    return questions.map((_, index) => {
      const userSuccess = Math.random() < accuracyProbability;
      const timeSpentMs = Math.round(baseTimeMs + (Math.random() * 3000 - 1500));
      const speedBonus = userSuccess ? Math.max(0, Math.round(100 - (timeSpentMs / 1000) * 5)) : 0;
      const points = userSuccess ? 100 + speedBonus : 0;

      return {
        questionIndex: index,
        userSuccess,
        timeSpentMs,
        points
      };
    });
  }

  /**
   * Actualiza el perfil tras un duelo y calcula el cambio de ELO
   */
  processDuelResult(
    playerScore: number,
    rivalScore: number,
    playerTimeMs: number,
    rivalTimeMs: number,
    isRanked: boolean
  ): { updatedProfile: PlayerProfile; eloChange: number; winner: 'player' | 'rival' | 'tie' } {
    const profile = this.getPlayerProfile();

    let winner: 'player' | 'rival' | 'tie' = 'tie';
    if (playerScore > rivalScore) {
      winner = 'player';
    } else if (rivalScore > playerScore) {
      winner = 'rival';
    } else {
      if (playerTimeMs < rivalTimeMs) winner = 'player';
      else if (rivalTimeMs < playerTimeMs) winner = 'rival';
    }

    let eloChange = 0;

    if (isRanked) {
      if (winner === 'player') {
        const margin = Math.min(10, Math.max(1, Math.round((playerScore - rivalScore) / 100)));
        eloChange = 25 + margin;
      } else if (winner === 'rival') {
        eloChange = -18;
      } else {
        eloChange = 5;
      }

      const newElo = Math.max(500, profile.elo + eloChange);
      const updatedProfile: PlayerProfile = {
        ...profile,
        elo: newElo,
        rank: this.getRankInfo(newElo),
        wins: profile.wins + (winner === 'player' ? 1 : 0),
        losses: profile.losses + (winner === 'rival' ? 1 : 0),
        streak: winner === 'player' ? profile.streak + 1 : 0
      };

      this.savePlayerProfile(updatedProfile);
      return { updatedProfile, eloChange, winner };
    }

    return { updatedProfile: profile, eloChange: 0, winner };
  }
}

export const multiplayerService = new MultiplayerService();
