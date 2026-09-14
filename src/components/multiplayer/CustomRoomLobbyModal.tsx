import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Copy, Check, Share2, Play, ArrowLeft, Sparkles, Clock, Globe, Shield, Loader2, MessageCircle, Trophy, Swords } from 'lucide-react';
import { CustomRoomConfig, DuelMode, DuelQuestion, PlayerProfile, PlayerRoundResult } from '../../types/multiplayer';
import { customRoomService, RoomState, RoomChallengeData } from '../../services/customRoomService';
import { RealtimeChannel } from '@supabase/supabase-js';
import { PlayerAvatar } from '../common/PlayerAvatar';
import { multiplayerService } from '../../services/multiplayerService';

interface CustomRoomLobbyModalProps {
  isOpen: boolean;
  isHost: boolean;
  roomCode: string;
  config: CustomRoomConfig;
  playerProfile: PlayerProfile;
  questions: DuelQuestion[];
  onStartGame: (questions: DuelQuestion[], rivalProfile: PlayerProfile | null, recordedResults?: PlayerRoundResult[]) => void;
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
  const [existingChallenge, setExistingChallenge] = useState<RoomChallengeData | null>(null);
  const [isLoadingChallenge, setIsLoadingChallenge] = useState<boolean>(true);

  const channelRef = useRef<RealtimeChannel | null>(null);

  // Comprobar si ya existe una partida grabada para este código de sala
  useEffect(() => {
    if (!isOpen || !roomCode) return;

    let isMounted = true;
    setIsLoadingChallenge(true);

    customRoomService.getRoomChallenge(roomCode).then(chal => {
      if (isMounted) {
        if (chal) {
          setExistingChallenge(chal);
          if (chal.questions && chal.questions.length > 0) {
            setRoomQuestions(chal.questions);
          }
        }
        setIsLoadingChallenge(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen, roomCode]);

  // Manejo de sincronización mediante WebSockets/Supabase Broadcast
  useEffect(() => {
    if (!isOpen || !roomCode) return;

    const channel = customRoomService.subscribeToRoom(
      roomCode,
      (guest) => {
        setGuestProfile(guest);
        // Si somos el anfitrión, enviar el estado de la sala al invitado con las preguntas ya fijas
        if (isHost) {
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
      (roomState) => {
        // El invitado recibe las preguntas y la info del anfitrión
        if (!isHost) {
          setRoomQuestions(roomState.questions);
          setHostProfile({
            id: roomState.host.id,
            name: roomState.host.name,
            avatar: roomState.host.avatar,
            elo: roomState.host.elo,
            rank: multiplayerService.getRankInfo(roomState.host.elo),
            wins: 0,
            losses: 0,
            streak: 0,
            xp: 0,
            level: 1
          });
        }
      },
      () => {
        // Señal de inicio
        onStartGame(roomQuestions, isHost ? guestProfile : hostProfile);
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

  const handleWhatsAppInvite = () => {
    const url = customRoomService.getWhatsAppInviteUrl(roomCode, modeTitle);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleLaunchGame = async () => {
    // Si hay un desafío ya grabado por el rival en esta sala, jugamos contra sus resultados
    if (existingChallenge && existingChallenge.creatorId !== playerProfile.id) {
      const rivalProf: PlayerProfile = {
        id: existingChallenge.creatorId,
        name: existingChallenge.creatorName,
        avatar: existingChallenge.creatorAvatar,
        elo: existingChallenge.creatorElo,
        rank: multiplayerService.getRankInfo(existingChallenge.creatorElo),
        wins: 0,
        losses: 0,
        streak: 0,
        xp: 0,
        level: 1
      };
      onStartGame(existingChallenge.questions, rivalProf, existingChallenge.roundResults);
      return;
    }

    // Modo directo / Jugar mi turno: enviar aviso realtime por si el amigo está conectado e iniciar
    await customRoomService.broadcastGameStart(channelRef.current);
    onStartGame(roomQuestions, isHost ? guestProfile : hostProfile);
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
          className="bg-[#18181B] border border-indigo-500/40 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-5 text-center relative overflow-hidden"
        >
          {/* Header */}
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full border bg-indigo-950/60 border-indigo-500/40 text-indigo-300">
              {isHost ? '👑 Eres el Anfitrión' : '🎮 Sala Privada de Duelo'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-zinc-100 mt-2">
              Duelo con Amigos (Sin Lag)
            </h2>
            <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
              Jugaréis exactamente las mismas preguntas a vuestro propio ritmo, sin tirones ni problemas de conexión.
            </p>
          </div>

          {/* Tarjeta si tu amigo ya completó su turno */}
          {existingChallenge && existingChallenge.creatorId !== playerProfile.id && (
            <div className="bg-gradient-to-r from-amber-950/40 to-yellow-950/30 border border-amber-500/50 rounded-2xl p-4 text-left space-y-2 animate-in fade-in duration-300">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold font-mono">
                <Trophy className="w-4 h-4" />
                <span>¡TU AMIGO YA HA JUGADO SU TURNO!</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <PlayerAvatar
                    avatar={existingChallenge.creatorAvatar}
                    name={existingChallenge.creatorName}
                    className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-500/60 text-xl"
                  />
                  <div>
                    <span className="font-bold text-sm text-zinc-100 block truncate">
                      {existingChallenge.creatorName}
                    </span>
                    <span className="text-xs font-mono text-zinc-400">
                      Puntuación: <strong className="text-emerald-400">{existingChallenge.score} pts</strong> · ⏱️ {Math.round(existingChallenge.totalTimeMs / 1000)}s
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Caja del Código de Sala y Acciones de Invitación */}
          <div className="bg-[#121214] border-2 border-dashed border-indigo-500/50 rounded-2xl p-4 sm:p-5 space-y-3">
            <span className="text-[10px] font-mono uppercase text-indigo-400 font-bold tracking-wider block">
              CÓDIGO DE SALA
            </span>
            <div className="text-3xl sm:text-4xl font-mono font-black text-cyan-300 tracking-widest selection:bg-cyan-500">
              {roomCode}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              {/* Copiar enlace directo */}
              <button
                onClick={copyLinkToClipboard}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border shadow-sm ${
                  copiedLink
                    ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300'
                    : 'bg-indigo-950/70 hover:bg-indigo-900/80 text-indigo-200 border-indigo-700/60'
                }`}
                title="Copiar enlace directo de invitación"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-indigo-400" />}
                <span>{copiedLink ? '¡Enlace Copiado!' : 'Copiar Enlace'}</span>
              </button>

              {/* Invitar por WhatsApp */}
              <button
                onClick={handleWhatsAppInvite}
                className="py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm font-sans"
                title="Invitar directamente por WhatsApp"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>WhatsApp</span>
              </button>

              {/* Copiar solo código */}
              <button
                onClick={copyCodeToClipboard}
                className="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-bold transition-all flex items-center justify-center gap-2 border border-zinc-700"
                title="Copiar únicamente el código"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-zinc-300" />}
                <span>{copiedCode ? '¡Copiado!' : 'Solo Código'}</span>
              </button>
            </div>
          </div>

          {/* Resumen de Modalidad */}
          <div className="bg-[#121214] border border-zinc-800 p-3 rounded-xl flex items-center justify-between text-xs text-zinc-300">
            <span className="font-medium text-zinc-400">Modalidad:</span>
            <span className="font-bold text-zinc-100">{modeTitle}</span>
            <span className="text-zinc-500">•</span>
            <span className="font-mono text-amber-400">{config.totalRounds} Rondas</span>
            <span className="text-zinc-500">•</span>
            <span className="font-mono text-cyan-400">⏱️ {config.timeLimitSeconds}s / ronda</span>
          </div>

          {/* Botones de Acción de Lanzamiento */}
          <div className="space-y-2 pt-2">
            <button
              onClick={handleLaunchGame}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-zinc-950 font-black rounded-xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
            >
              {existingChallenge && existingChallenge.creatorId !== playerProfile.id ? (
                <>
                  <Swords className="w-5 h-5 fill-zinc-950" />
                  <span>¡Aceptar Reto y Jugar Ahora!</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-zinc-950" />
                  <span>Jugar Mi Partida Ahora</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="w-full py-2.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Cancelar y Volver al Menú
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
