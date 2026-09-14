import { Country } from '../types/country';
import { QuestionType } from '../types/game';
import { CommunityChallenge, DuelMode, DuelQuestion, DuelState, ModeEloConfig, PlayerProfile, PlayerRoundResult, RankInfo, RankTier } from '../types/multiplayer';
import { getRandomCities } from '../data/citiesData';
import { supabase } from '../lib/supabase';

const MULTIPLAYER_PROFILE_KEY = 'GEOMUNDI_MULTIPLAYER_PROFILE_V1';
const MULTIPLAYER_HISTORY_KEY = 'GEOMUNDI_MULTIPLAYER_HISTORY_V1';
const COMMUNITY_CHALLENGES_KEY = 'GEOMUNDI_COMMUNITY_CHALLENGES_V1';

export const MODE_ELO_CONFIGS: Record<DuelMode, ModeEloConfig> = {
  pinpoint: {
    mode: 'pinpoint',
    name: 'Puntería Geográfica',
    subtitle: 'Precisión milimétrica sobre el mapa 3D',
    icon: '🎯',
    colorHex: '#06B6D4',
    textClass: 'text-cyan-400',
    borderClass: 'border-cyan-500/50',
    bgClass: 'bg-cyan-950/40',
    badgeClass: 'bg-cyan-950/80 text-cyan-300 border border-cyan-700/60',
    glowClass: 'shadow-[0_0_15px_rgba(6,182,212,0.25)]'
  },
  countries: {
    mode: 'countries',
    name: 'Países en Mapa',
    subtitle: 'Localización rápida de países por contorno',
    icon: '🗺️',
    colorHex: '#6366F1',
    textClass: 'text-indigo-400',
    borderClass: 'border-indigo-500/50',
    bgClass: 'bg-indigo-950/40',
    badgeClass: 'bg-indigo-950/80 text-indigo-300 border border-indigo-700/60',
    glowClass: 'shadow-[0_0_15px_rgba(99,102,241,0.25)]'
  },
  capitals: {
    mode: 'capitals',
    name: 'Capitales Mundiales',
    subtitle: 'Asociación de sedes de gobierno y estados',
    icon: '🏛️',
    colorHex: '#A855F7',
    textClass: 'text-purple-400',
    borderClass: 'border-purple-500/50',
    bgClass: 'bg-purple-950/40',
    badgeClass: 'bg-purple-950/80 text-purple-300 border border-purple-700/60',
    glowClass: 'shadow-[0_0_15px_rgba(168,85,247,0.25)]'
  },
  flags: {
    mode: 'flags',
    name: 'Banderas del Mundo',
    subtitle: 'Reconocimiento de vexilología nacional',
    icon: '🚩',
    colorHex: '#F59E0B',
    textClass: 'text-amber-400',
    borderClass: 'border-amber-500/50',
    bgClass: 'bg-amber-950/40',
    badgeClass: 'bg-amber-950/80 text-amber-300 border border-amber-700/60',
    glowClass: 'shadow-[0_0_15px_rgba(245,158,11,0.25)]'
  }
};

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
   * Carga el perfil multijugador del jugador local con los 4 ELOs independientes
   */
  getPlayerProfile(): PlayerProfile {
    const defaultElos: Record<DuelMode, number> = {
      pinpoint: 1200,
      countries: 1200,
      capitals: 1200,
      flags: 1200
    };

    const defaultStatsByMode: Record<DuelMode, { wins: number; losses: number; duels: number }> = {
      pinpoint: { wins: 0, losses: 0, duels: 0 },
      countries: { wins: 0, losses: 0, duels: 0 },
      capitals: { wins: 0, losses: 0, duels: 0 },
      flags: { wins: 0, losses: 0, duels: 0 }
    };

    try {
      const stored = localStorage.getItem(MULTIPLAYER_PROFILE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const elos: Record<DuelMode, number> = {
          ...defaultElos,
          ...(parsed.elos || {})
        };
        const statsByMode = {
          ...defaultStatsByMode,
          ...(parsed.statsByMode || {})
        };

        // El ELO general es el promedio ponderado o el guardado
        const elo = parsed.elo || Math.round(
          (elos.pinpoint + elos.countries + elos.capitals + elos.flags) / 4
        );
        const xp = parsed.xp || 0;
        const level = Math.floor(Math.sqrt(xp / 100)) + 1;

        return {
          id: parsed.id || 'player_local',
          name: parsed.name || 'Tú',
          avatar: parsed.avatar || '🎓',
          elo,
          rank: this.getRankInfo(elo),
          wins: parsed.wins || 0,
          losses: parsed.losses || 0,
          streak: parsed.streak || 0,
          xp,
          level,
          elos,
          statsByMode
        };
      }
    } catch (e) {}

    const defaultElo = 1200;
    return {
      id: 'player_local',
      name: 'Tú',
      avatar: '🎓',
      elo: defaultElo,
      rank: this.getRankInfo(defaultElo),
      wins: 0,
      losses: 0,
      streak: 0,
      xp: 0,
      level: 1,
      elos: defaultElos,
      statsByMode: defaultStatsByMode
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
   * Genera un código de sala personalizada corto (ej. ROOM-4921)
   */
  generateRoomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `ROOM-${code}`;
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
      streak: Math.floor(Math.random() * 4),
      xp: rivalElo * 10,
      level: Math.floor(Math.sqrt((rivalElo * 10) / 100)) + 1
    };
  }

  /**
   * Genera N preguntas estandarizadas a 5 rondas para el duelo según la modalidad elegida
   */
  generateDuelQuestions(countries: Country[], duelMode: DuelMode, totalRounds: number = 5): DuelQuestion[] {
    if (countries.length === 0) return [];

    // Modo Puntería (Pinpoint 3D): Seleccionar ciudades reales con coordenadas GPS exactas
    if (duelMode === 'pinpoint') {
      const selectedCities = getRandomCities(totalRounds);
      return selectedCities.map(city => {
        const matchingCountry = countries.find(c => c.cca3 === city.cca3) || {
          cca2: '',
          cca3: city.cca3,
          nameEs: city.countryNameEs,
          nameEn: city.countryNameEs,
          capital: city.nameEs,
          continent: city.continent as any,
          continentEs: (city.continent === 'Americas' ? 'América' : city.continent === 'Europe' ? 'Europa' : city.continent === 'Asia' ? 'Asia' : city.continent === 'Africa' ? 'África' : 'Oceanía') as any,
          population: city.population || 0,
          flagSvg: '',
          flagEmoji: city.flagEmoji || '🏳️',
          latlng: [city.coordinates[1], city.coordinates[0]]
        };

        return {
          country: matchingCountry,
          questionType: 'city-location' as QuestionType,
          promptText: `${city.nameEs}, ${city.countryNameEs}`,
          cityTarget: city
        };
      });
    }

    const shuffled = [...countries].sort(() => Math.random() - 0.5).slice(0, totalRounds);

    return shuffled.map(country => {
      let qType: QuestionType = 'name';
      let promptText = country.nameEs;

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
   * Obtiene el historial de duelos recientes (últimas 10 partidas)
   */
  getDuelHistory(): DuelState[] {
    try {
      const stored = localStorage.getItem(MULTIPLAYER_HISTORY_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return [];
  }

  /**
   * Guarda un duelo finalizado en el historial local
   */
  saveDuelToHistory(duel: DuelState): void {
    try {
      const history = this.getDuelHistory();
      const updated = [duel, ...history].slice(0, 10);
      localStorage.setItem(MULTIPLAYER_HISTORY_KEY, JSON.stringify(updated));
    } catch (e) {}
  }

  /**
   * Calcula la variación de ELO siguiendo el sistema estándar de Elo
   */
  calculateEloChange(
    playerElo: number,
    rivalElo: number,
    winner: 'player' | 'rival' | 'tie',
    playerScore: number,
    rivalScore: number
  ): number {
    const expectedScore = 1 / (1 + Math.pow(10, (rivalElo - playerElo) / 400));
    const actualScore = winner === 'player' ? 1 : winner === 'tie' ? 0.5 : 0;
    const kFactor = 32;
    let change = Math.round(kFactor * (actualScore - expectedScore));

    if (winner === 'player') {
      const marginBonus = Math.min(6, Math.max(1, Math.round(Math.abs(playerScore - rivalScore) / 400)));
      change = Math.max(12, change + marginBonus);
    } else if (winner === 'rival') {
      change = Math.min(-8, change);
    }
    return change;
  }

  /**
   * Obtiene los desafíos de la comunidad guardados (Supabase con fallback local)
   */
  async getCommunityChallenges(limit = 30): Promise<CommunityChallenge[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('community_challenges')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (!error && data && data.length > 0) {
          const mapped: CommunityChallenge[] = data.map((row: any) => ({
            id: row.id,
            creatorId: row.creator_id,
            creatorName: row.creator_name,
            creatorAvatar: row.creator_avatar || '🎓',
            creatorElo: row.creator_elo || 1200,
            mode: row.mode,
            score: row.score,
            totalTimeMs: row.total_time_ms,
            questions: row.questions,
            roundResults: row.round_results,
            createdAt: row.created_at
          }));
          try {
            localStorage.setItem(COMMUNITY_CHALLENGES_KEY, JSON.stringify(mapped));
          } catch (e) {}
          return mapped;
        }
      } catch (e) {
        console.warn('No se pudo consultar community_challenges de Supabase:', e);
      }
    }

    try {
      const cached = localStorage.getItem(COMMUNITY_CHALLENGES_KEY);
      if (cached) return JSON.parse(cached);
    } catch (e) {}

    return [];
  }

  /**
   * Publica un nuevo desafío a la comunidad (Supabase + local)
   */
  async saveCommunityChallenge(challenge: CommunityChallenge): Promise<boolean> {
    try {
      const cached = await this.getCommunityChallenges();
      const updated = [challenge, ...cached.filter(c => c.id !== challenge.id)].slice(0, 30);
      localStorage.setItem(COMMUNITY_CHALLENGES_KEY, JSON.stringify(updated));
    } catch (e) {}

    if (supabase) {
      try {
        const { error } = await supabase
          .from('community_challenges')
          .insert({
            id: challenge.id,
            creator_id: challenge.creatorId,
            creator_name: challenge.creatorName,
            creator_avatar: challenge.creatorAvatar,
            creator_elo: challenge.creatorElo,
            mode: challenge.mode,
            score: challenge.score,
            total_time_ms: challenge.totalTimeMs,
            questions: challenge.questions,
            round_results: challenge.roundResults,
            created_at: challenge.createdAt
          });

        if (error) {
          console.warn('Error insertando en community_challenges (Supabase):', error);
          return false;
        }
        return true;
      } catch (e) {
        console.warn('Excepción guardando desafío en Supabase:', e);
        return false;
      }
    }

    return true;
  }

  /**
   * Actualiza el perfil tras un duelo, otorga XP y calcula el cambio de ELO para la modalidad específica
   */
  processDuelResult(
    playerScore: number,
    rivalScore: number,
    playerTimeMs: number,
    rivalTimeMs: number,
    isRanked: boolean,
    isCustomRoom: boolean = false,
    rivalEloOverride?: number,
    duelMode: DuelMode = 'pinpoint'
  ): { 
    updatedProfile: PlayerProfile; 
    eloChange: number; 
    winner: 'player' | 'rival' | 'tie'; 
    xpEarned: number;
    modeEloChange: number;
    newModeElo: number;
  } {
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
    let xpEarned = 100;

    if (winner === 'player') {
      xpEarned += 150;
    } else if (winner === 'tie') {
      xpEarned += 50;
    }

    const currentElos = profile.elos || {
      pinpoint: 1200,
      countries: 1200,
      capitals: 1200,
      flags: 1200
    };

    const currentModeElo = currentElos[duelMode] ?? 1200;

    if (isRanked) {
      const rivalElo = rivalEloOverride ?? currentModeElo;
      eloChange = this.calculateEloChange(currentModeElo, rivalElo, winner, playerScore, rivalScore);
    }

    const newModeElo = isRanked ? Math.max(500, currentModeElo + eloChange) : currentModeElo;

    const updatedElos: Record<DuelMode, number> = {
      ...currentElos,
      [duelMode]: newModeElo
    };

    // Actualizar estadísticas por modalidad
    const currentStatsByMode = profile.statsByMode || {
      pinpoint: { wins: 0, losses: 0, duels: 0 },
      countries: { wins: 0, losses: 0, duels: 0 },
      capitals: { wins: 0, losses: 0, duels: 0 },
      flags: { wins: 0, losses: 0, duels: 0 }
    };

    const prevModeStats = currentStatsByMode[duelMode] || { wins: 0, losses: 0, duels: 0 };
    const updatedStatsByMode = {
      ...currentStatsByMode,
      [duelMode]: {
        duels: prevModeStats.duels + 1,
        wins: prevModeStats.wins + (winner === 'player' ? 1 : 0),
        losses: prevModeStats.losses + (winner === 'rival' ? 1 : 0)
      }
    };

    // ELO general promedio
    const newGeneralElo = Math.round(
      (updatedElos.pinpoint + updatedElos.countries + updatedElos.capitals + updatedElos.flags) / 4
    );

    const newXp = profile.xp + xpEarned;
    const newLevel = Math.floor(Math.sqrt(newXp / 100)) + 1;

    const updatedProfile: PlayerProfile = {
      ...profile,
      elo: newGeneralElo,
      rank: this.getRankInfo(newGeneralElo),
      wins: profile.wins + (winner === 'player' ? 1 : 0),
      losses: profile.losses + (winner === 'rival' ? 1 : 0),
      streak: winner === 'player' ? profile.streak + 1 : 0,
      xp: newXp,
      level: newLevel,
      elos: updatedElos,
      statsByMode: updatedStatsByMode
    };

    this.savePlayerProfile(updatedProfile);
    return { 
      updatedProfile, 
      eloChange, 
      winner, 
      xpEarned,
      modeEloChange: eloChange,
      newModeElo 
    };
  }
}


export const multiplayerService = new MultiplayerService();
