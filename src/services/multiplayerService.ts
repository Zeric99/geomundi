import { Country } from '../types/country';
import { QuestionType } from '../types/game';
import { CommunityChallenge, DuelMode, DuelQuestion, DuelState, ModeEloConfig, PlayerProfile, PlayerRoundResult, RankInfo, RankTier } from '../types/multiplayer';
import { getRandomCities } from '../data/citiesData';
import { supabase } from '../lib/supabase';
import { authService } from './authService';

const MULTIPLAYER_PROFILE_KEY = 'GEOMUNDI_MULTIPLAYER_PROFILE_V1';
const MULTIPLAYER_HISTORY_KEY = 'GEOMUNDI_MULTIPLAYER_HISTORY_V1';
const COMMUNITY_CHALLENGES_KEY = 'GEOMUNDI_COMMUNITY_CHALLENGES_V1';

/**
 * Formatea una fecha en texto relativo en español ('Hace 5 min', 'Hace 2 h', 'Ayer')
 */
export function formatRelativeTime(dateStr?: string): string {
  if (!dateStr) return 'Reciente';
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffSec = Math.max(0, Math.floor(diffMs / 1000));
  if (diffSec < 45) return 'Hace unos segundos';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `Hace ${diffMin} min`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `Hace ${diffHours} h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  return new Date(dateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

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

  private memoryProfile: PlayerProfile | null = null;
  private memoryDuelHistory: DuelState[] = [];
  private memoryCommunityChallenges: CommunityChallenge[] = [];

  /**
   * Carga el perfil multijugador del jugador local con los 4 ELOs independientes
   */
  getPlayerProfile(): PlayerProfile {
    if (this.memoryProfile) {
      return this.memoryProfile;
    }

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

    const defaultElo = 1200;
    const initial: PlayerProfile = {
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

    this.memoryProfile = initial;
    return initial;
  }

  /**
   * Guarda el perfil multijugador actualizado en memoria de la sesión
   */
  savePlayerProfile(profile: PlayerProfile): void {
    this.memoryProfile = profile;
  }

  /**
   * Resetea el perfil y el historial multijugador (al cerrar sesión)
   */
  resetLocalProfile(): void {
    this.memoryProfile = null;
    this.memoryDuelHistory = [];
    this.memoryCommunityChallenges = [];
    try {
      localStorage.removeItem(MULTIPLAYER_PROFILE_KEY);
      localStorage.removeItem(MULTIPLAYER_HISTORY_KEY);
      localStorage.removeItem(COMMUNITY_CHALLENGES_KEY);
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
   * Obtiene el historial de duelos recientes persistiéndolo en localStorage
   */
  getDuelHistory(): DuelState[] {
    try {
      const saved = localStorage.getItem(MULTIPLAYER_HISTORY_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          this.memoryDuelHistory = parsed;
        }
      }
    } catch (e) {
      console.warn('Error cargando el historial de duelos local:', e);
    }
    return this.memoryDuelHistory;
  }

  /**
   * Guarda un duelo finalizado en el historial en memoria y localStorage (conserva las 10 últimas partidas)
   */
  saveDuelToHistory(duel: DuelState): void {
    const currentHistory = this.getDuelHistory();
    const filtered = currentHistory.filter(h => h.id !== duel.id);
    this.memoryDuelHistory = [duel, ...filtered].slice(0, 10);
    try {
      localStorage.setItem(MULTIPLAYER_HISTORY_KEY, JSON.stringify(this.memoryDuelHistory));
    } catch (e) {
      console.warn('Error guardando el historial de duelos local:', e);
    }
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
    if (winner === 'tie') {
      // Regla: Si empatan a 0 puntos, se penaliza a ambos como una derrota para evitar spam de 0 pts.
      // Si empatan con puntos > 0, exactamente 0 puntos (0 ELO).
      if (playerScore === 0 && rivalScore === 0) {
        const expectedScore = 1 / (1 + Math.pow(10, (rivalElo - playerElo) / 400));
        const actualScore = 0; // Se calcula como derrota
        const kFactor = 32;
        let change = Math.round(kFactor * (actualScore - expectedScore));
        return Math.min(-8, change);
      }
      return 0;
    }

    const expectedScore = 1 / (1 + Math.pow(10, (rivalElo - playerElo) / 400));
    const actualScore = winner === 'player' ? 1 : 0;
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
   * Obtiene los desafíos de la comunidad abiertos y disponibles desde Supabase
   */
  async getCommunityChallenges(limit = 30): Promise<CommunityChallenge[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('community_challenges')
          .select('*')
          .or('status.eq.open,status.is.null')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) {
          console.warn('[community_challenges] Error Supabase:', error.code, error.message, error.details);
        } else if (data) {
          const mapped: CommunityChallenge[] = data.map((row: any) => ({
            id: row.id,
            creatorId: row.creator_id,
            creatorName: row.creator_name,
            creatorAvatar: row.creator_avatar || '🎓',
            creatorElo: row.creator_elo || 1200,
            mode: row.mode,
            score: row.score,
            totalTimeMs: row.total_time_ms,
            questions: Array.isArray(row.questions) ? row.questions : [],
            roundResults: Array.isArray(row.round_results) ? row.round_results : [],
            createdAt: row.created_at,
            status: row.status || 'open',
            roomCode: row.room_code
          }));
          this.memoryCommunityChallenges = mapped;
          return mapped;
        }
      } catch (e) {
        console.warn('[community_challenges] Excepción inesperada:', e);
      }
    }

    // Fallback a memoria de la sesión
    return this.memoryCommunityChallenges.filter(c => !c.status || c.status === 'open');
  }

  /**
   * Publica un nuevo desafío abierto a la comunidad (Supabase)
   */
  async saveCommunityChallenge(challenge: CommunityChallenge): Promise<boolean> {
    const enrichedChallenge: CommunityChallenge = {
      ...challenge,
      status: 'open',
      creatorNotified: false
    };

    // Guardar en memoria de sesión
    this.memoryCommunityChallenges = [
      enrichedChallenge,
      ...this.memoryCommunityChallenges.filter(c => c.id !== challenge.id)
    ].slice(0, 30);

    if (supabase) {
      try {
        const { error } = await supabase
          .from('community_challenges')
          .insert({
            id: enrichedChallenge.id,
            creator_id: enrichedChallenge.creatorId,
            creator_name: enrichedChallenge.creatorName,
            creator_avatar: enrichedChallenge.creatorAvatar,
            creator_elo: enrichedChallenge.creatorElo,
            mode: enrichedChallenge.mode,
            score: enrichedChallenge.score,
            total_time_ms: enrichedChallenge.totalTimeMs,
            questions: enrichedChallenge.questions,
            round_results: enrichedChallenge.roundResults,
            created_at: enrichedChallenge.createdAt,
            status: 'open',
            creator_notified: false
          });

        if (error) {
          console.warn('[community_challenges] Error guardando desafío:', error.code, error.message, error.details);
          return false;
        }
        console.log('[community_challenges] Desafío publicado correctamente en Supabase:', enrichedChallenge.id);
        return true;
      } catch (e) {
        console.warn('[community_challenges] Excepción guardando desafío:', e);
        return false;
      }
    }

    return true;
  }

  /**
   * Reserva en exclusiva un desafío para que ningún otro jugador pueda desafiarlo a la vez
   */
  async claimCommunityChallenge(challengeId: string, challengerProfile: PlayerProfile): Promise<boolean> {
    if (!supabase) return true;
    try {
      const { data, error } = await supabase
        .from('community_challenges')
        .update({
          status: 'in_progress',
          challenger_id: challengerProfile.id,
          challenger_name: challengerProfile.name,
          challenger_avatar: challengerProfile.avatar,
          challenger_elo: challengerProfile.elo
        })
        .eq('id', challengeId)
        .or('status.eq.open,status.is.null')
        .select('id')
        .maybeSingle();

      if (error || !data) {
        return false;
      }
      return true;
    } catch (e) {
      return true;
    }
  }

  /**
   * Libera un desafío reservado si el retador cancela o abandona antes de terminarlo
   */
  async releaseCommunityChallenge(challengeId: string): Promise<boolean> {
    if (!supabase || !challengeId) return true;
    try {
      await supabase
        .from('community_challenges')
        .update({
          status: 'open',
          challenger_id: null,
          challenger_name: null,
          challenger_avatar: null,
          challenger_elo: null,
          challenger_score: null,
          challenger_time_ms: null,
          winner: null
        })
        .eq('id', challengeId)
        .eq('status', 'in_progress');
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Resuelve un desafío completado por un retador, calcula ganador y transfiere ELO a ambos jugadores
   */
  async resolveCommunityChallenge(params: {
    challenge: CommunityChallenge;
    challengerProfile: PlayerProfile;
    challengerScore: number;
    challengerTimeMs: number;
    challengerResults: PlayerRoundResult[];
  }): Promise<{ winner: 'creator' | 'challenger' | 'tie'; eloChange: number }> {
    const { challenge, challengerProfile, challengerScore, challengerTimeMs, challengerResults } = params;

    // 1. Determinar ganador (desempate por tiempo, excepto si ambos sacan 0 puntos)
    let winner: 'creator' | 'challenger' | 'tie' = 'tie';
    if (challengerScore > challenge.score) {
      winner = 'challenger';
    } else if (challengerScore < challenge.score) {
      winner = 'creator';
    } else if (challengerScore === 0 && challenge.score === 0) {
      winner = 'tie';
    } else {
      winner = challengerTimeMs < challenge.totalTimeMs ? 'challenger' : (challengerTimeMs > challenge.totalTimeMs ? 'creator' : 'tie');
    }

    // 2. Calcular cambio de ELO
    const winnerForElo = winner === 'challenger' ? 'player' : winner === 'creator' ? 'rival' : 'tie';
    const eloChange = this.calculateEloChange(
      challengerProfile.elo,
      challenge.creatorElo,
      winnerForElo,
      challengerScore,
      challenge.score
    );

    const absElo = Math.abs(eloChange);

    // 3. Guardar inmediatamente el duelo en el historial local del RETADOR
    try {
      const challengerWon = winner === 'challenger';
      const isTie = winner === 'tie';
      const duelForChallenger: DuelState = {
        id: challenge.id,
        type: 'ranked',
        duelMode: challenge.mode,
        questions: challenge.questions || [],
        player: challengerProfile,
        rival: {
          id: challenge.creatorId,
          name: challenge.creatorName,
          avatar: challenge.creatorAvatar,
          elo: challenge.creatorElo,
          rank: this.getRankInfo(challenge.creatorElo),
          wins: 0,
          losses: 0,
          streak: 0,
          xp: 0,
          level: 1
        },
        playerResults: challengerResults,
        rivalResults: challenge.roundResults || [],
        playerScore: challengerScore,
        rivalScore: challenge.score,
        playerTimeTotalMs: challengerTimeMs,
        rivalTimeTotalMs: challenge.totalTimeMs,
        winner: challengerWon ? 'player' : (isTie ? 'tie' : 'rival'),
        eloChange: eloChange,
        xpEarned: challengerWon ? 150 : (isTie && challengerScore === 0 ? 0 : 50)
      };
      this.saveDuelToHistory(duelForChallenger);
    } catch (e) {}

    // 4. Actualizar la fila del desafío en Supabase a status = 'completed'
    if (supabase) {
      try {
        const updatePayload: Record<string, any> = {
          status: 'completed',
          challenger_id: challengerProfile.id,
          challenger_name: challengerProfile.name,
          challenger_avatar: challengerProfile.avatar,
          challenger_elo: challengerProfile.elo,
          challenger_score: challengerScore,
          challenger_time_ms: challengerTimeMs,
          challenger_results: challengerResults,
          winner,
          elo_change: absElo,
          resolved_at: new Date().toISOString(),
          creator_notified: false
        };

        const { error: updateErr } = await supabase
          .from('community_challenges')
          .update(updatePayload)
          .eq('id', challenge.id);

        if (updateErr) {
          console.warn('[community_challenges] Error actualizando desafío a completed:', updateErr);
          // Fallback con campos básicos en caso de que falten columnas
          await supabase
            .from('community_challenges')
            .update({
              status: 'completed',
              challenger_id: challengerProfile.id,
              challenger_name: challengerProfile.name,
              challenger_score: challengerScore,
              winner
            })
            .eq('id', challenge.id);
        } else {
          console.log('[community_challenges] Desafío completado y registrado en Supabase con éxito');
        }

        // Las estadísticas del creador se sincronizan automáticamente en su perfil
        // a través de processPendingCreatorChallenges cuando él inicia sesión o sincroniza.
      } catch (e) {
        console.warn('Error resolviendo community_challenge en Supabase:', e);
      }
    }

    return { winner, eloChange };
  }

  /**
   * Procesa los desafíos creados por el usuario que han sido resueltos en su ausencia:
   * 1. Suma o resta el ELO al creador en su perfil de Supabase (él mismo está autenticado, así que RLS lo permite).
   * 2. Guarda cada duelo en el historial local del creador para que aparezca en la pestaña Historial.
   * 3. Marca creator_notified = true en Supabase.
   */
  async processPendingCreatorChallenges(
    userId: string,
    currentProfile: PlayerProfile
  ): Promise<{
    processedCount: number;
    netEloChange: number;
    updatedProfile?: Partial<PlayerProfile>;
    challenges: CommunityChallenge[];
  }> {
    if (!supabase || !userId || userId === 'player_local') {
      return { processedCount: 0, netEloChange: 0, challenges: [] };
    }

    try {
      const { data, error } = await supabase
        .from('community_challenges')
        .select('*')
        .eq('creator_id', userId)
        .eq('status', 'completed')
        .eq('creator_notified', false);

      if (error || !data || data.length === 0) {
        return { processedCount: 0, netEloChange: 0, challenges: [] };
      }

      let netEloChange = 0;
      const updatedElos = {
        pinpoint: currentProfile.elos?.pinpoint ?? 1200,
        countries: currentProfile.elos?.countries ?? 1200,
        capitals: currentProfile.elos?.capitals ?? 1200,
        flags: currentProfile.elos?.flags ?? 1200,
      };
      let winsDelta = 0;
      let lossesDelta = 0;
      const processedChallenges: CommunityChallenge[] = [];

      for (const row of data) {
        const creatorWon = row.winner === 'creator';
        const isTie = row.winner === 'tie';
        const isZeroZeroTie = isTie && (row.score || 0) === 0 && (row.challenger_score || 0) === 0;
        const absElo = Math.abs(row.elo_change || 16);
        const eloDelta = creatorWon ? absElo : (isTie ? (isZeroZeroTie ? -absElo : 0) : -absElo);
        netEloChange += eloDelta;

        if (creatorWon) winsDelta++;
        else if (!isTie) lossesDelta++;

        const mode = row.mode as DuelMode;
        if (mode && updatedElos[mode] !== undefined) {
          updatedElos[mode] = Math.max(500, updatedElos[mode] + eloDelta);
        }

        // Guardar en el historial local del creador
        const duelForHistory: DuelState = {
          id: row.id,
          type: 'ranked',
          duelMode: mode,
          questions: row.questions || [],
          player: {
            ...currentProfile,
            id: userId,
            name: row.creator_name,
            avatar: row.creator_avatar
          },
          rival: {
            id: row.challenger_id || 'rival',
            name: row.challenger_name || 'Retador',
            avatar: row.challenger_avatar || '👤',
            elo: row.challenger_elo || 1200,
            rank: this.getRankInfo(row.challenger_elo || 1200),
            wins: 0,
            losses: 0,
            streak: 0,
            xp: 0,
            level: 1
          },
          playerResults: row.round_results || [],
          rivalResults: row.challenger_results || [],
          playerScore: row.score || 0,
          rivalScore: row.challenger_score || 0,
          playerTimeTotalMs: row.total_time_ms || 0,
          rivalTimeTotalMs: row.challenger_time_ms || 0,
          winner: creatorWon ? 'player' : (isTie ? 'tie' : 'rival'),
          eloChange: eloDelta,
          xpEarned: creatorWon ? 150 : 50
        };

        this.saveDuelToHistory(duelForHistory);

        processedChallenges.push({
          id: row.id,
          creatorId: row.creator_id,
          creatorName: row.creator_name,
          creatorAvatar: row.creator_avatar,
          creatorElo: row.creator_elo,
          mode: row.mode,
          score: row.score,
          totalTimeMs: row.total_time_ms,
          questions: row.questions,
          roundResults: row.round_results,
          createdAt: row.created_at,
          status: 'completed',
          challengerId: row.challenger_id,
          challengerName: row.challenger_name,
          challengerAvatar: row.challenger_avatar,
          challengerElo: row.challenger_elo,
          challengerScore: row.challenger_score,
          challengerTimeMs: row.challenger_time_ms,
          winner: row.winner,
          eloChange: eloDelta,
          resolvedAt: row.resolved_at
        });
      }

      // Actualizar el perfil del creador en Supabase (él mismo está autenticado)
      const newGeneralElo = Math.max(500, Math.round(
        (updatedElos.pinpoint + updatedElos.countries + updatedElos.capitals + updatedElos.flags) / 4
      ));
      const rankTier = this.getRankInfo(newGeneralElo).tier;

      await authService.updateDuelStats(
        userId,
        newGeneralElo,
        winsDelta > 0,
        false,
        50 * processedChallenges.length,
        rankTier,
        undefined,
        undefined,
        updatedElos,
        { winsDelta, lossesDelta, duelsDelta: processedChallenges.length }
      );

      // Marcar desafíos como notificados en Supabase
      const ids = data.map((r: any) => r.id);
      await this.markChallengesAsNotified(ids);

      return {
        processedCount: processedChallenges.length,
        netEloChange,
        updatedProfile: {
          elo: newGeneralElo,
          rank: this.getRankInfo(newGeneralElo),
          wins: (currentProfile.wins || 0) + winsDelta,
          losses: (currentProfile.losses || 0) + lossesDelta,
          elos: updatedElos
        },
        challenges: processedChallenges
      };
    } catch (e) {
      console.error('Error procesando desafíos pendientes del creador:', e);
      return { processedCount: 0, netEloChange: 0, challenges: [] };
    }
  }

  /**
   * Obtiene los desafíos creados por el usuario que han sido resueltos mientras estaba fuera
   */
  async getUnnotifiedResolvedChallenges(userId: string): Promise<CommunityChallenge[]> {
    if (!supabase || !userId || userId === 'player_local') return [];
    try {
      const { data, error } = await supabase
        .from('community_challenges')
        .select('*')
        .eq('creator_id', userId)
        .eq('status', 'completed')
        .eq('creator_notified', false)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((row: any) => ({
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
          createdAt: row.created_at,
          status: 'completed',
          challengerId: row.challenger_id,
          challengerName: row.challenger_name,
          challengerAvatar: row.challenger_avatar,
          challengerElo: row.challenger_elo,
          challengerScore: row.challenger_score,
          challengerTimeMs: row.challenger_time_ms,
          winner: row.winner,
          eloChange: row.elo_change,
          resolvedAt: row.resolved_at
        }));
      }
    } catch (e) {}
    return [];
  }

  /**
   * Marca los desafíos resueltos como vistos/notificados
   */
  async markChallengesAsNotified(challengeIds: string[]): Promise<void> {
    if (!supabase || challengeIds.length === 0) return;
    try {
      await supabase
        .from('community_challenges')
        .update({ creator_notified: true })
        .in('id', challengeIds);
    } catch (e) {}
  }

  /**
   * Obtiene el historial completo de duelos del usuario (tanto locales como en la nube)
   */
  async getUserDuelHistory(userId?: string): Promise<DuelState[]> {
    const localHistory = this.getDuelHistory();

    if (!supabase || !userId || userId === 'player_local') return localHistory.slice(0, 10);

    try {
      const { data, error } = await supabase
        .from('community_challenges')
        .select('*')
        .or(`creator_id.eq.${userId},challenger_id.eq.${userId}`)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!error && data && data.length > 0) {
        const cloudDuels: DuelState[] = data.map((row: any) => {
          const isUserCreator = row.creator_id === userId;
          const isCompleted = row.status === 'completed';

          const userWon = isCompleted ? (isUserCreator ? row.winner === 'creator' : row.winner === 'challenger') : false;
          const isTie = isCompleted && row.winner === 'tie';

          const playerScore = isUserCreator ? (row.score || 0) : (row.challenger_score || 0);
          const rivalScore = isCompleted ? (isUserCreator ? (row.challenger_score || 0) : (row.score || 0)) : 0;
          const playerTime = isUserCreator ? (row.total_time_ms || 0) : (row.challenger_time_ms || 0);
          const rivalTime = isCompleted ? (isUserCreator ? (row.challenger_time_ms || 0) : (row.total_time_ms || 0)) : 0;

          const rivalName = isUserCreator
            ? (row.challenger_name || (isCompleted ? 'Retador' : 'Esperando Retador...'))
            : row.creator_name;
          const rivalAvatar = isUserCreator
            ? (row.challenger_avatar || (isCompleted ? '👤' : '⏳'))
            : row.creator_avatar;
          const rivalElo = isUserCreator ? (row.challenger_elo || 1200) : row.creator_elo;

          const eloDelta = isCompleted
            ? (userWon ? (row.elo_change || 16) : (isTie ? 0 : -(row.elo_change || 16)))
            : 0;

          const playerElo = isUserCreator ? (row.creator_elo || 1200) : (row.challenger_elo || 1200);
          const currentProfile = this.getPlayerProfile();

          const winnerState: 'player' | 'rival' | 'tie' | null = !isCompleted
            ? null
            : userWon
            ? 'player'
            : isTie
            ? 'tie'
            : 'rival';

          return {
            id: row.id,
            type: 'ranked',
            duelMode: row.mode as DuelMode,
            questions: row.questions || [],
            player: {
              id: userId,
              name: isUserCreator ? row.creator_name : (row.challenger_name || currentProfile.name || 'Tú'),
              avatar: isUserCreator ? row.creator_avatar : (row.challenger_avatar || currentProfile.avatar || '🎓'),
              elo: playerElo,
              rank: this.getRankInfo(playerElo),
              wins: 0,
              losses: 0,
              streak: 0,
              xp: 0,
              level: 1
            },
            rival: {
              id: isUserCreator ? (row.challenger_id || 'rival') : row.creator_id,
              name: rivalName,
              avatar: rivalAvatar,
              elo: rivalElo,
              rank: this.getRankInfo(rivalElo),
              wins: 0,
              losses: 0,
              streak: 0,
              xp: 0,
              level: 1
            },
            playerResults: isUserCreator ? (row.round_results || []) : (row.challenger_results || []),
            rivalResults: isUserCreator ? (row.challenger_results || []) : (row.round_results || []),
            playerScore,
            rivalScore,
            playerTimeTotalMs: playerTime,
            rivalTimeTotalMs: rivalTime,
            winner: winnerState,
            eloChange: eloDelta,
            xpEarned: userWon ? 150 : (isCompleted ? 50 : 0)
          };
        });

        // Combinar evitando IDs duplicados (primero locales más recientes, luego la nube)
        const seenIds = new Set<string>();
        const combined: DuelState[] = [];

        for (const d of [...localHistory, ...cloudDuels]) {
          const key = d.id || `${d.playerScore}_${d.rivalScore}_${d.duelMode}`;
          if (!seenIds.has(key)) {
            seenIds.add(key);
            combined.push(d);
          }
        }

        const top10 = combined.slice(0, 10);
        this.memoryDuelHistory = top10;
        try {
          localStorage.setItem(MULTIPLAYER_HISTORY_KEY, JSON.stringify(top10));
        } catch (e) {}

        return top10;
      }
    } catch (e) {
      console.warn('Error consultando historial de duelos en Supabase:', e);
    }

    return localHistory.slice(0, 10);
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
    duelMode: DuelMode = 'pinpoint',
    currentProfileOverride?: PlayerProfile
  ): { 
    updatedProfile: PlayerProfile; 
    eloChange: number; 
    winner: 'player' | 'rival' | 'tie'; 
    xpEarned: number;
    modeEloChange: number;
    newModeElo: number;
  } {
    const profile = currentProfileOverride || this.getPlayerProfile();

    let winner: 'player' | 'rival' | 'tie' = 'tie';
    if (playerScore > rivalScore) {
      winner = 'player';
    } else if (rivalScore > playerScore) {
      winner = 'rival';
    } else if (playerScore === 0 && rivalScore === 0) {
      winner = 'tie';
    } else {
      if (playerTimeMs < rivalTimeMs) winner = 'player';
      else if (rivalTimeMs < playerTimeMs) winner = 'rival';
    }

    let eloChange = 0;
    let xpEarned = 100;

    if (winner === 'player') {
      xpEarned += 150;
    } else if (winner === 'tie') {
      xpEarned += (playerScore === 0 ? 0 : 50);
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
