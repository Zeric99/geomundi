import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Copy, Check, Share2, Play, ArrowLeft, Sparkles, Clock, Globe, Shield, Loader2 } from 'lucide-react';
import { CustomRoomConfig, DuelMode, DuelQuestion, PlayerProfile } from '../../types/multiplayer';
import { customRoomService, RoomState } from '../../services/customRoomService';
import { RealtimeChannel } from '@supabase/supabase-js';

interface CustomRoomLobbyModalProps {
  isOpen: boolean;
  isHost: boolean;
  roomCode: string;
  config: CustomRoomConfig;
  playerProfile: PlayerProfile;
  questions: DuelQuestion[];
  onStartGame: (questions: DuelQuestion[], rivalProfile: PlayerProfile | null) => void;
  onClose: () => void;
}

export const CustomRoomLobbyModal: React.FC<CustomRoomLobbyModalProps> = ({
  isOpen,
  isHost,
  roomCode,
  config,
  playerProfile,
  questions,
  onStartGame,
  onClose
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [guestProfile, setGuestProfile] = useState<PlayerProfile | null>(null);
  const [hostProfile, setHostProfile] = useState<PlayerProfile>(playerProfile);
  const [roomQuestions, setRoomQuestions] = useState<DuelQuestion[]>(questions);

  const channelRef = useRef<RealtimeChannel | null>(null);

  // Subscribirse al canal de Supabase Realtime Broadcast
  useEffect(() => {
    if (!isOpen || !roomCode) return;

    const channel = customRoomService.subscribeToRoom(
      roomCode,
      // onGuestJoined (El anfitrión recibe al invitado)
      (guest) => {
        if (isHost) {
          setGuestProfile(guest);
          // Sincronizar estado completo con el invitado
          const state: RoomState = {
            roomCode,
            config,
            questions: roomQuestions,
            host: {
              id: playerProfile.id,
              name: playerProfile.name,
              avatar: playerProfile.avatar,
              elo: playerProfile.elo,
              isHost: true,
              ready: true
            },
            guest: {
              id: guest.id,
              name: guest.name,
              avatar: guest.avatar,
              elo: guest.elo,
              isHost: false,
              ready: true
            },
            status: 'waiting'
          };
          customRoomService.broadcastRoomSync(channel, state);
        }
      },
      // onRoomSync (El invitado recibe los datos del anfitrión)
      (state) => {
        if (!isHost) {
          setHostProfile({
            id: state.host.id,
            name: state.host.name,
            avatar: state.host.avatar,
            elo: state.host.elo,
            rank: { tier: 'plata', label: 'Plata', icon: '⚪', minElo: 1100, maxElo: 1299, color: '', border: '', bg: '' },
            wins: 0,
            losses: 0,
            streak: 0,
            xp: 0,
            level: 1
          });
          if (state.questions && state.questions.length > 0) {
            setRoomQuestions(state.questions);
          }
        }
      },
      // onGameStart (Todos reciben la orden de empezar la partida al unísono)
      () => {
        const rival = isHost ? guestProfile : hostProfile;
        onStartGame(roomQuestions, rival);
      }
    );

    channelRef.current = channel;

    // Si es el invitado, notificar al anfitrión que se ha unido
    if (!isHost) {
      setTimeout(() => {
        customRoomService.broadcastGuestJoined(channel, playerProfile);
      }, 500);
    }

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
    };
  }, [isOpen, roomCode, isHost, playerProfile, config, roomQuestions, onStartGame, guestProfile, hostProfile]);

  const copyCodeToClipboard = () => {
    navigator.clipboard.writeText(roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copyLinkToClipboard = () => {
    const link = customRoomService.getInviteLink(roomCode);
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleLaunchGame = async () => {
    if (!isHost) return;
    // Enviar señal de inicio a todos
    await customRoomService.broadcastGameStart(channelRef.current);
    // Iniciar localmente
    onStartGame(roomQuestions, guestProfile);
  };

  if (!isOpen) return null;

  const modeTitle =
    config.mode === 'pinpoint' ? '🎯 Puntería Geográfica' :
    config.mode === 'flags' ? '🚩 Banderas del Mundo' :
    config.mode === 'capitals' ? '🏛️ Capitales Mundiales' : '🗺️ Países en Mapa';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-[#18181B] border border-indigo-500/40 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6 text-center relative overflow-hidden"
        >
          {/* Header */}
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full border bg-indigo-950/60 border-indigo-500/40 text-indigo-300">
              {isHost ? '👑 Eres el Anfitrión' : '🎮 Te has unido a la sala'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-zinc-100 mt-2">
              Sala de Espera Privada
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Comparte el código o el enlace con tu amigo para jugar exactamente las mismas rondas.
            </p>
          </div>

          {/* Caja del Código de Sala */}
          <div className="bg-[#121214] border-2 border-dashed border-indigo-500/50 rounded-2xl p-4 sm:p-5 space-y-3">
            <span className="text-[10px] font-mono uppercase text-indigo-400 font-bold tracking-wider block">
              CÓDIGO DE SALA
            </span>
            <div className="text-3xl sm:text-4xl font-mono font-black text-cyan-300 tracking-widest selection:bg-cyan-500">
              {roomCode}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={copyCodeToClipboard}
                className="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-bold transition-all flex items-center justify-center gap-2 border border-zinc-700 active:scale-95"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
                <span>{copiedCode ? '¡Copiado!' : 'Copiar Código'}</span>
              </button>

              <button
                onClick={copyLinkToClipboard}
                className="py-2.5 px-3 rounded-xl bg-indigo-950/70 hover:bg-indigo-900/80 text-indigo-200 text-xs font-bold transition-all flex items-center justify-center gap-2 border border-indigo-700/60 active:scale-95"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-indigo-400" />}
                <span>{copiedLink ? '¡Enlace Copiado!' : 'Copiar Enlace'}</span>
              </button>
            </div>
          </div>

          {/* Jugadores en la Sala */}
          <div className="space-y-3 text-left">
            <span className="text-xs font-mono uppercase text-zinc-400 font-bold block">
              Jugadores en la Sala (2 Máx.)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Jugador 1 (Anfitrión) */}
              <div className="bg-[#121214] border border-zinc-800 p-3.5 rounded-xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-950/80 border border-indigo-500/50 flex items-center justify-center text-xl shrink-0">
                  {isHost ? playerProfile.avatar : hostProfile.avatar}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-zinc-100 truncate">
                      {isHost ? playerProfile.name : hostProfile.name}
                    </span>
                    <span className="text-[9px] bg-amber-500/20 text-amber-300 font-mono px-1.5 py-0.5 rounded border border-amber-500/30">
                      👑 Anfitrión
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 block mt-0.5">
                    🟢 Conectado
                  </span>
                </div>
              </div>

              {/* Jugador 2 (Invitado) */}
              <div className={`p-3.5 rounded-xl flex items-center gap-3 border transition-all ${
                (isHost ? guestProfile : playerProfile)
                  ? 'bg-[#121214] border-zinc-800'
                  : 'bg-zinc-900/40 border-dashed border-zinc-800'
              }`}>
                {(isHost ? guestProfile : playerProfile) ? (
                  <>
                    <div className="w-10 h-10 rounded-xl bg-rose-950/80 border border-rose-500/50 flex items-center justify-center text-xl shrink-0">
                      {isHost ? guestProfile?.avatar : playerProfile.avatar}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-zinc-100 truncate">
                          {isHost ? guestProfile?.name : playerProfile.name}
                        </span>
                        <span className="text-[9px] bg-cyan-500/20 text-cyan-300 font-mono px-1.5 py-0.5 rounded border border-cyan-500/30">
                          Invitado
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 block mt-0.5">
                        🟢 Listo
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-2.5 text-zinc-500 py-1">
                    <Loader2 className="w-5 h-5 animate-spin text-indigo-400 shrink-0" />
                    <span className="text-xs font-sans italic">Esperando a tu amigo...</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Resumen de Ajustes de Partida */}
          <div className="bg-[#121214] border border-zinc-800/80 p-3 rounded-xl flex items-center justify-around text-xs font-mono text-zinc-400 flex-wrap gap-2">
            <span>{modeTitle}</span>
            <span>•</span>
            <span>{config.totalRounds} Rondas</span>
            <span>•</span>
            <span>{config.timeLimitSeconds > 0 ? `${config.timeLimitSeconds}s por ronda` : 'Sin límite'}</span>
          </div>

          {/* Botones de Acción */}
          <div className="pt-2 space-y-2">
            {isHost ? (
              <button
                onClick={handleLaunchGame}
                className="w-full py-4 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-zinc-950 font-black rounded-xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 text-base uppercase tracking-wider"
              >
                <Play className="w-5 h-5 fill-zinc-950" />
                <span>Iniciar Partida para Todos</span>
              </button>
            ) : (
              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-center text-xs font-mono text-zinc-400 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                <span>Esperando a que el anfitrión pulse Iniciar Partida...</span>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full py-2.5 text-xs text-zinc-400 hover:text-zinc-200 transition"
            >
              Salir de la sala
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
