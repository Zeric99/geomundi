import { supabase } from '../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';
import { CommunityChallenge, CustomRoomConfig, DuelMode, DuelQuestion, PlayerProfile, PlayerRoundResult } from '../types/multiplayer';

export interface RoomParticipant {
  id: string;
  name: string;
  avatar: string;
  elo: number;
  isHost: boolean;
  ready: boolean;
}

export interface RoomState {
  roomCode: string;
  config: CustomRoomConfig;
  questions: DuelQuestion[];
  host: RoomParticipant;
  guest: RoomParticipant | null;
  status: 'waiting' | 'in_progress' | 'finished';
}

export interface RoomChallengeData {
  roomCode: string;
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
}

const ROOM_CHALLENGE_STORAGE_PREFIX = 'GEOMUNDI_ROOM_CHALLENGE_';

export const customRoomService = {
  memoryRoomChallenges: new Map<string, RoomChallengeData>(),

  /**
   * Genera un código de sala amigable (ej. GEO-4821)
   */
  generateRoomCode(): string {
    const num = Math.floor(1000 + Math.random() * 9000);
    return `GEO-${num}`;
  },

  /**
   * Genera el enlace de invitación compartible limpio (?room=GEO-XXXX)
   */
  getInviteLink(roomCode: string): string {
    const base = window.location.origin + window.location.pathname;
    const cleanBase = base.split('#')[0].split('?')[0];
    return `${cleanBase}?room=${encodeURIComponent(roomCode.toUpperCase().trim())}`;
  },

  /**
   * Genera el enlace directo para enviar por WhatsApp con texto formateado
   */
  getWhatsAppInviteUrl(roomCode: string, modeTitle: string = 'Duelo 1v1'): string {
    const link = this.getInviteLink(roomCode);
    const text = `¡Te desafío a un duelo en GeoStrike! 🌍\nModo: ${modeTitle}\nEntra a mi sala aquí:\n${link}`;
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  },

  /**
   * Guarda la partida del anfitrión/amigo para la sala (en Supabase y con respaldo local)
   */
  async saveRoomChallenge(data: {
    roomCode: string;
    creatorProfile: PlayerProfile;
    mode: DuelMode;
    questions: DuelQuestion[];
    roundResults: PlayerRoundResult[];
    score: number;
    totalTimeMs: number;
  }): Promise<boolean> {
    const code = data.roomCode.toUpperCase().trim();
    const challengePayload: RoomChallengeData = {
      roomCode: code,
      creatorId: data.creatorProfile.id,
      creatorName: data.creatorProfile.name,
      creatorAvatar: data.creatorProfile.avatar,
      creatorElo: data.creatorProfile.elo,
      mode: data.mode,
      score: data.score,
      totalTimeMs: data.totalTimeMs,
      questions: data.questions,
      roundResults: data.roundResults,
      createdAt: new Date().toISOString()
    };

    // Guardar en memoria de sesión
    this.memoryRoomChallenges.set(code, challengePayload);

    // Guardado en Supabase community_challenges
    if (supabase) {
      try {
        await supabase.from('community_challenges').insert({
          creator_id: data.creatorProfile.id,
          creator_name: data.creatorProfile.name,
          creator_avatar: data.creatorProfile.avatar,
          creator_elo: data.creatorProfile.elo,
          mode: data.mode,
          score: data.score,
          total_time_ms: data.totalTimeMs,
          questions: data.questions,
          round_results: data.roundResults,
          room_code: code
        });
      } catch (e) {
        console.warn('No se pudo guardar room_challenge en Supabase:', e);
      }
    }

    return true;
  },

  /**
   * Recupera el desafío de la sala si el amigo o el anfitrión ya lo ha jugado
   */
  async getRoomChallenge(roomCode: string): Promise<RoomChallengeData | null> {
    const code = roomCode.toUpperCase().trim();

    // 1. Intentar consultar en Supabase
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('community_challenges')
          .select('*')
          .eq('room_code', code)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          return {
            roomCode: code,
            creatorId: data.creator_id,
            creatorName: data.creator_name,
            creatorAvatar: data.creator_avatar,
            creatorElo: data.creator_elo,
            mode: data.mode as DuelMode,
            score: data.score,
            totalTimeMs: data.total_time_ms,
            questions: data.questions as DuelQuestion[],
            roundResults: data.round_results as PlayerRoundResult[],
            createdAt: data.created_at
          };
        }
      } catch (e) {}
    }

    // 2. Fallback en memoria de la sesión actual
    if (this.memoryRoomChallenges.has(code)) {
      return this.memoryRoomChallenges.get(code)!;
    }

    return null;
  },

  /**
   * Suscribe a la sala mediante Supabase Broadcast Realtime (opcional para notificaciones instantáneas)
   */
  subscribeToRoom(
    roomCode: string,
    onGuestJoined?: (guest: PlayerProfile) => void,
    onRoomSync?: (roomState: RoomState) => void,
    onGameStart?: () => void,
    onRivalFinished?: (score: number, timeMs: number, results: PlayerRoundResult[]) => void
  ): RealtimeChannel | null {
    if (!supabase) return null;

    const channelName = `custom_room_${roomCode.toUpperCase().trim()}`;
    const channel = supabase.channel(channelName);

    channel
      .on('broadcast', { event: 'guest_joined' }, ({ payload }) => {
        if (onGuestJoined && payload?.guest) {
          onGuestJoined(payload.guest);
        }
      })
      .on('broadcast', { event: 'room_sync' }, ({ payload }) => {
        if (onRoomSync && payload?.roomState) {
          onRoomSync(payload.roomState);
        }
      })
      .on('broadcast', { event: 'game_start' }, () => {
        if (onGameStart) {
          onGameStart();
        }
      })
      .on('broadcast', { event: 'rival_finished' }, ({ payload }) => {
        if (onRivalFinished && payload) {
          onRivalFinished(payload.score, payload.timeMs, payload.results);
        }
      })
      .subscribe();

    return channel;
  },

  /**
   * El Anfitrión sincroniza el estado de la sala con el invitado
   */
  async broadcastRoomSync(channel: RealtimeChannel | null, roomState: RoomState): Promise<void> {
    if (!channel) return;
    try {
      await channel.send({
        type: 'broadcast',
        event: 'room_sync',
        payload: { roomState }
      });
    } catch (e) {
      console.warn('Error enviando room_sync:', e);
    }
  },

  /**
   * El Invitado envía su perfil al Anfitrión al unirse
   */
  async broadcastGuestJoined(channel: RealtimeChannel | null, guest: PlayerProfile): Promise<void> {
    if (!channel) return;
    try {
      await channel.send({
        type: 'broadcast',
        event: 'guest_joined',
        payload: { guest }
      });
    } catch (e) {
      console.warn('Error enviando guest_joined:', e);
    }
  },

  /**
   * El Anfitrión ordena comenzar la partida a todos los participantes
   */
  async broadcastGameStart(channel: RealtimeChannel | null): Promise<void> {
    if (!channel) return;
    try {
      await channel.send({
        type: 'broadcast',
        event: 'game_start',
        payload: {}
      });
    } catch (e) {
      console.warn('Error enviando game_start:', e);
    }
  },

  /**
   * Envía los resultados finales de un jugador al rival en la sala
   */
  async broadcastFinished(
    channel: RealtimeChannel | null,
    score: number,
    timeMs: number,
    results: PlayerRoundResult[]
  ): Promise<void> {
    if (!channel) return;
    try {
      await channel.send({
        type: 'broadcast',
        event: 'rival_finished',
        payload: { score, timeMs, results }
      });
    } catch (e) {
      console.warn('Error enviando rival_finished:', e);
    }
  },

  /**
   * Limpia el respaldo de salas personalizadas en memoria y posibles restos en localStorage
   */
  clearRoomCache(): void {
    try {
      this.memoryRoomChallenges.clear();
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(ROOM_CHALLENGE_STORAGE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {}
  }
};
