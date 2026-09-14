import { supabase } from '../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';
import { CustomRoomConfig, DuelQuestion, PlayerProfile, PlayerRoundResult } from '../types/multiplayer';

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

export const customRoomService = {
  /**
   * Genera un código de sala amigable (ej. GEO-4821)
   */
  generateRoomCode(): string {
    const num = Math.floor(1000 + Math.random() * 9000);
    return `GEO-${num}`;
  },

  /**
   * Genera el enlace de invitación compartible
   */
  getInviteLink(roomCode: string): string {
    const base = window.location.origin + window.location.pathname;
    return `${base}#room=${encodeURIComponent(roomCode.toUpperCase().trim())}`;
  },

  /**
   * Suscribe a la sala mediante Supabase Broadcast Realtime
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
  }
};
