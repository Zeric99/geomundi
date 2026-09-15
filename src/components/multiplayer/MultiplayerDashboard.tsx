import React, { useState, useEffect } from 'react';
import { Swords, Trophy, Crown, Flame, Target, Flag, Landmark, Users, Sparkles, ArrowRight, Clock, Globe, Shield, Key, RefreshCw } from 'lucide-react';
import { CommunityChallenge, CustomRoomConfig, DuelMode, DuelQuestion, DuelState, MultiplayerType, PlayerProfile, PlayerRoundResult } from '../../types/multiplayer';
import { multiplayerService, formatRelativeTime } from '../../services/multiplayerService';
import { customRoomService } from '../../services/customRoomService';
import { Continent, Country } from '../../types/country';
import { CustomRoomLobbyModal } from './CustomRoomLobbyModal';
import { PlayerAvatar } from '../common/PlayerAvatar';

interface MultiplayerDashboardProps {
  playerProfile: PlayerProfile;
  countries: Country[];
  initialRoomCode?: string;
  onStartDuel: (
    type: MultiplayerType,
    duelMode: DuelMode,
    customConfig?: CustomRoomConfig,
    customQuestions?: DuelQuestion[],
    rivalProfile?: PlayerProfile | null,
    recordedRivalResults?: PlayerRoundResult[]
  ) => void;
  onStartChallenge?: (challenge: CommunityChallenge) => void;
  onCreateChallenge?: (mode: DuelMode) => void;
}

export const MultiplayerDashboard: React.FC<MultiplayerDashboardProps> = ({
  playerProfile,
  countries,
  initialRoomCode,
  onStartDuel,
  onStartChallenge,
  onCreateChallenge
}) => {

  const [activeTab, setActiveTab] = useState<'ranked' | 'custom' | 'history'>('ranked');
  const [selectedDuelMode, setSelectedDuelMode] = useState<DuelMode>('pinpoint');
  const [duelHistory, setDuelHistory] = useState<DuelState[]>(() => multiplayerService.getDuelHistory());
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);

  // Estado de los desafíos de la comunidad
  const [challenges, setChallenges] = useState<CommunityChallenge[]>([]);
  const [isLoadingChallenges, setIsLoadingChallenges] = useState<boolean>(true);
  const [filterMode, setFilterMode] = useState<DuelMode | 'all'>('all');
  const [challengesError, setChallengesError] = useState<string | null>(null);

  // Estado de exclusividad y desafíos no notificados (offline)
  const [claimingChallengeId, setClaimingChallengeId] = useState<string | null>(null);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [unnotifiedDuels, setUnnotifiedDuels] = useState<CommunityChallenge[]>([]);

  const loadChallenges = async () => {
    setIsLoadingChallenges(true);
    setChallengesError(null);
    try {
      const data = await multiplayerService.getCommunityChallenges(30);
      setChallenges(data);
      if (data.length === 0) {
        // Intentar detectar si es fallo de Supabase vs tablón vacío legítimo
        // getCommunityChallenges ya loguea el error en consola con código exacto
        console.log('[MultiplayerDashboard] Tablón vacío tras carga');
      }
    } catch (e: any) {
      console.error('Error cargando desafíos:', e);
      setChallengesError(`Error al cargar: ${e?.message || 'desconocido'}`);
    } finally {
      setIsLoadingChallenges(false);
    }
  };

  const loadDuelHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const history = await multiplayerService.getUserDuelHistory(playerProfile.id);
      setDuelHistory(history);
    } catch (e) {
      console.error('Error cargando historial de duelos:', e);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const checkUnnotifiedDuels = async () => {
    if (!playerProfile.id || playerProfile.id === 'player_local') return;
    try {
      const unnotified = await multiplayerService.getUnnotifiedResolvedChallenges(playerProfile.id);
      if (unnotified.length > 0) {
        setUnnotifiedDuels(unnotified);
      }
    } catch (e) {
      console.error('Error comprobando duelos pendientes:', e);
    }
  };

  const handleDismissUnnotified = async () => {
    const ids = unnotifiedDuels.map(d => d.id);
    setUnnotifiedDuels([]);
    await multiplayerService.markChallengesAsNotified(ids);
  };

  // Reclamar desafío asegurando exclusividad (1 solo jugador)
  const handleChallengeClick = async (chal: CommunityChallenge) => {
    if (!onStartChallenge) return;

    // Validar que el desafío tiene preguntas válidas antes de intentar reclamarlo
    if (!chal.questions || chal.questions.length === 0) {
      setClaimError('Este desafío no tiene preguntas válidas. Puede que esté corrupto o sea de una versión antigua.');
      return;
    }

    setClaimingChallengeId(chal.id);
    setClaimError(null);
    try {
      const claimed = await multiplayerService.claimCommunityChallenge(chal.id, playerProfile);
      if (!claimed) {
        setClaimError('¡Este desafío ya ha sido aceptado por otro jugador o ya no está disponible!');
        await loadChallenges();
        return;
      }
      onStartChallenge(chal);
    } catch (e) {
      console.error('Error al reclamar desafío:', e);
      setClaimError('No se pudo conectar con el servidor para aceptar el desafío.');
    } finally {
      setClaimingChallengeId(null);
    }
  };

  useEffect(() => {
    loadChallenges();
    checkUnnotifiedDuels();
    loadDuelHistory();
  }, [playerProfile.id]);

  useEffect(() => {
    if (activeTab === 'history') {
      loadDuelHistory();
    }
  }, [activeTab]);

  // Estado de la sala de espera privada (Lobby)
  const [activeLobby, setActiveLobby] = useState<{
    isHost: boolean;
    roomCode: string;
    config: CustomRoomConfig;
    questions: DuelQuestion[];
  } | null>(null);

  // Estado para la creación de sala personalizada
  const [customMode, setCustomMode] = useState<DuelMode>('pinpoint');
  const [customContinent, setCustomContinent] = useState<Continent>('World');
  const [customRounds, setCustomRounds] = useState<number>(5);
  const [customTimeLimit, setCustomTimeLimit] = useState<number>(30); // 30s por defecto

  // Estado para unirse con código
  const [joinCode, setJoinCode] = useState<string>('');
  const [joinError, setJoinError] = useState<string | null>(null);

  // Si se pasa un código de sala en la URL, abrir automáticamente
  useEffect(() => {
    if (initialRoomCode) {
      setActiveTab('custom');
      setJoinCode(initialRoomCode);
      const code = initialRoomCode.toUpperCase().trim();
      const config: CustomRoomConfig = {
        roomCode: code,
        mode: 'pinpoint',
        continent: 'World',
        totalRounds: 5,
        timeLimitSeconds: 30,
        isHost: false
      };
      setActiveLobby({
        isHost: false,
        roomCode: code,
        config,
        questions: []
      });
    }
  }, [initialRoomCode]);

  // Crear sala y abrir Lobby de espera para invitar amigos
  const handleCreateRoom = () => {
    const roomCode = customRoomService.generateRoomCode();
    const config: CustomRoomConfig = {
      roomCode,
      mode: customMode,
      continent: customContinent,
      totalRounds: customRounds,
      timeLimitSeconds: customTimeLimit,
      isHost: true
    };
    const questions = multiplayerService.generateDuelQuestions(countries, customMode, customRounds);
    setActiveLobby({
      isHost: true,
      roomCode,
      config,
      questions
    });
  };

  // Unirse a sala con código y abrir Lobby
  const handleJoinRoom = () => {
    const code = joinCode.trim().toUpperCase();
    if (!code || code.length < 4) {
      setJoinError('Introduce un código de sala válido (ej. GEO-4821)');
      return;
    }

    setJoinError(null);
    const config: CustomRoomConfig = {
      roomCode: code,
      mode: 'pinpoint',
      continent: 'World',
      totalRounds: 5,
      timeLimitSeconds: 30,
      isHost: false
    };
    setActiveLobby({
      isHost: false,
      roomCode: code,
      config,
      questions: []
    });
  };


  const modesInfo: { id: DuelMode; title: string; desc: string; icon: React.ReactNode; color: string; eloColor: string }[] = [
    {
      id: 'pinpoint',
      title: '🎯 Puntería Geográfica',
      desc: 'El modo GeoStrike. Haz clic libre en el mapa para situar la ciudad objetivo (hasta 1,000 pts/ronda).',
      icon: <Target className="w-6 h-6 text-cyan-400" />,
      color: 'border-cyan-500/70 bg-cyan-950/30',
      eloColor: 'text-cyan-400'
    },
    {
      id: 'countries',
      title: '🗺️ Países',
      desc: 'Localiza y haz clic sobre la masa territorial del país indicado.',
      icon: <Globe className="w-6 h-6 text-indigo-400" />,
      color: 'border-indigo-500/70 bg-indigo-950/30',
      eloColor: 'text-indigo-400'
    },
    {
      id: 'capitals',
      title: '🏛️ Capitales',
      desc: 'Adivina la capital mostrada e identifica su país en el mapa.',
      icon: <Landmark className="w-6 h-6 text-purple-400" />,
      color: 'border-purple-500/70 bg-purple-950/30',
      eloColor: 'text-purple-400'
    },
    {
      id: 'flags',
      title: '🚩 Banderas',
      desc: 'Identifica la bandera oficial e indica su país correspondiente.',
      icon: <Flag className="w-6 h-6 text-amber-400" />,
      color: 'border-amber-500/70 bg-amber-950/30',
      eloColor: 'text-amber-400'
    }
  ];

  const filteredChallenges = challenges.filter(c => filterMode === 'all' || c.mode === filterMode);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Tarjeta de Rango ELO y Perfil del Jugador con Nivel y XP */}
      <div className={`p-6 sm:p-8 rounded-3xl border ${playerProfile.rank.border} bg-[#18181B] relative overflow-hidden shadow-2xl`}>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <PlayerAvatar
              avatar={playerProfile.avatar}
              name={playerProfile.name}
              className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-700/80 text-3xl shadow-md"
            />

            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded border bg-zinc-900 ${playerProfile.rank.color} ${playerProfile.rank.border}`}>
                  Rango {playerProfile.rank.label}
                </span>
                <span className="text-[11px] font-mono font-bold bg-[#0a1e2b] text-cyan-300 px-2.5 py-0.5 rounded border border-cyan-700/60">
                  Nivel {playerProfile.level || 1}
                </span>
                {playerProfile.streak > 0 && (
                  <span className="text-[10px] font-mono font-bold bg-[#261c07] text-amber-300 px-2 py-0.5 rounded border border-amber-500/30 flex items-center gap-1">
                    <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
                    Racha {playerProfile.streak}
                  </span>
                )}
              </div>

              <h2 className="text-2xl sm:text-3xl font-display font-bold text-zinc-100 mt-1">
                {playerProfile.name}
              </h2>
              <p className="text-xs text-zinc-400 font-sans mt-0.5">
                Victorias: <strong className="text-emerald-400">{playerProfile.wins}</strong> · Derrotas: <strong className="text-rose-400">{playerProfile.losses}</strong> · XP Acumulada: <strong className="text-cyan-300">{playerProfile.xp || 0} pts</strong>
              </p>
            </div>
          </div>

          {/* Calificaciones ELO por Minijuego */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 shrink-0">
            <div className="bg-[#121214] border border-cyan-500/40 p-2.5 rounded-xl text-center">
              <span className="text-[10px] font-mono text-cyan-400 font-bold block">🎯 Puntería</span>
              <span className="text-lg font-mono font-black text-cyan-300">
                {playerProfile.elos?.pinpoint ?? 1200}
              </span>
            </div>
            <div className="bg-[#121214] border border-indigo-500/40 p-2.5 rounded-xl text-center">
              <span className="text-[10px] font-mono text-indigo-400 font-bold block">🗺️ Países</span>
              <span className="text-lg font-mono font-black text-indigo-300">
                {playerProfile.elos?.countries ?? 1200}
              </span>
            </div>
            <div className="bg-[#121214] border border-purple-500/40 p-2.5 rounded-xl text-center">
              <span className="text-[10px] font-mono text-purple-400 font-bold block">🏛️ Capitales</span>
              <span className="text-lg font-mono font-black text-purple-300">
                {playerProfile.elos?.capitals ?? 1200}
              </span>
            </div>
            <div className="bg-[#121214] border border-amber-500/40 p-2.5 rounded-xl text-center">
              <span className="text-[10px] font-mono text-amber-400 font-bold block">🚩 Banderas</span>
              <span className="text-lg font-mono font-black text-amber-300">
                {playerProfile.elos?.flags ?? 1200}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Banner de Desafíos Resueltos en Ausencia (Notificaciones Offline) */}
      {unnotifiedDuels.length > 0 && (
        <div className="bg-gradient-to-r from-cyan-950/90 via-zinc-900 to-indigo-950/90 border border-cyan-500/50 rounded-2xl p-4 shadow-xl flex items-center justify-between gap-4 flex-wrap animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-2xl shrink-0">
              ⚔️
            </div>
            <div>
              <h4 className="font-bold text-sm text-cyan-200 flex items-center gap-2">
                <span>¡Han jugado contra tus desafíos mientras estabas fuera!</span>
                <span className="bg-cyan-500 text-black font-mono font-bold text-[10px] px-2 py-0.5 rounded-full">
                  {unnotifiedDuels.length} {unnotifiedDuels.length === 1 ? 'partida resuelta' : 'partidas resueltas'}
                </span>
              </h4>
              <p className="text-xs text-zinc-300 mt-0.5">
                {(() => {
                  const wins = unnotifiedDuels.filter(d => d.winner === 'creator').length;
                  const losses = unnotifiedDuels.filter(d => d.winner === 'challenger').length;
                  return `Balance: ${wins} ${wins === 1 ? 'victoria' : 'victorias'}, ${losses} ${losses === 1 ? 'derrota' : 'derrotas'}. Tu ELO se ha actualizado en la nube.`;
                })()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setActiveTab('history');
                handleDismissUnnotified();
              }}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition-all shadow-md active:scale-95"
            >
              Ver en Historial
            </button>
            <button
              onClick={handleDismissUnnotified}
              className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium text-xs transition-all border border-zinc-700"
            >
              Descartar
            </button>
          </div>
        </div>
      )}

      {/* Alerta de Error de Reclamación (Exclusividad) */}
      {claimError && (
        <div className="p-3.5 bg-amber-950/80 border border-amber-500/60 rounded-xl text-amber-200 text-xs flex items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <span className="text-base">⚠️</span>
            <span>{claimError}</span>
          </div>
          <button
            onClick={() => setClaimError(null)}
            className="text-amber-400 hover:text-white font-bold text-sm px-1.5 py-0.5 rounded hover:bg-amber-900/50"
          >
            ✕
          </button>
        </div>
      )}

      {/* Navegación de Pestañas Simplificada */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 flex-wrap">
        <button
          onClick={() => setActiveTab('ranked')}
          className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center gap-2 ${
            activeTab === 'ranked'
              ? 'bg-[#2a1c06] text-amber-300 border border-amber-800 shadow-sm'
              : 'text-zinc-400 hover:bg-zinc-900'
          }`}
        >
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>🏆 Desafíos Asíncronos (Ranked ELO)</span>
        </button>

        <button
          onClick={() => setActiveTab('custom')}
          className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center gap-2 ${
            activeTab === 'custom'
              ? 'bg-[#151229] text-indigo-300 border border-indigo-800 shadow-sm'
              : 'text-zinc-400 hover:bg-zinc-900'
          }`}
        >
          <Users className="w-4 h-4 text-indigo-400" />
          <span>🏠 Salas Privadas (Código de Amigos)</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center gap-2 ${
            activeTab === 'history'
              ? 'bg-[#091b26] text-cyan-300 border border-cyan-800 shadow-sm'
              : 'text-zinc-400 hover:bg-zinc-900'
          }`}
        >
          <Clock className="w-4 h-4 text-cyan-400" />
          <span>📜 Historial de Duelos</span>
        </button>
      </div>

      {/* PESTAÑA 1: DESAFÍOS CLASIFICATORIOS (GRABAR PARTIDA O RETAR A JUGADORES REALES) */}
      {activeTab === 'ranked' && (
        <div className="space-y-6">
          {/* SECCIÓN 1: GRABAR Y PUBLICAR PARTIDA PROPIA */}
          <div className="bg-[#18181B] border border-zinc-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span>1. Graba tu Partida y Lanza un Desafío</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Juega 5 rondas a tu ritmo. Tu partida se publicará en el tablón sin revelar tu puntuación. Ganarás o perderás ELO cuando otro jugador acepte tu reto.
                </p>
              </div>
            </div>

            {/* Selector de Minijuegos para Retar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {modesInfo.map(m => {
                const isSelected = selectedDuelMode === m.id;
                const modeElo = playerProfile.elos?.[m.id] ?? 1200;
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedDuelMode(m.id)}
                    className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-3 relative overflow-hidden ${
                      isSelected
                        ? `${m.color} ring-1 ring-amber-400/50 shadow-lg scale-[1.02]`
                        : 'bg-[#121214] border-zinc-800 hover:border-zinc-700 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        {m.icon}
                        <span className={`text-xs font-mono font-bold ${m.eloColor}`}>
                          {modeElo} ELO
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-zinc-100 mt-2">{m.title}</h4>
                      <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">{m.desc}</p>
                    </div>

                    <div className="text-[11px] font-mono text-zinc-500 pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                      <span>5 Rondas</span>
                      <span className={isSelected ? 'text-amber-400 font-bold' : ''}>
                        {isSelected ? '✓ Seleccionado' : 'Elegir'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => onCreateChallenge && onCreateChallenge(selectedDuelMode)}
                className="py-3 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-sm shadow-lg transition-all active:scale-95 flex items-center gap-2"
              >
                <Swords className="w-4 h-4" />
                <span>Iniciar y Grabar Partida (5 Rondas)</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>

          {/* SECCIÓN 2: TABLÓN DE DESAFÍOS DE LA COMUNIDAD (PUNTUACIÓN Y TIEMPO OCULTOS) */}
          <div className="bg-[#18181B] border border-zinc-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                  <Swords className="w-5 h-5 text-cyan-400" />
                  <span>2. Tablón de Desafíos de la Comunidad</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Elige a un rival del tablón y compite a ciegas contra su partida grabada. Cada desafío es exclusivo para un solo jugador.
                </p>
              </div>

              <button
                onClick={loadChallenges}
                disabled={isLoadingChallenges}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-400 hover:text-zinc-200 transition-all active:scale-95 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingChallenges ? 'animate-spin text-cyan-400' : ''}`} />
                <span>Actualizar Tablón</span>
              </button>
            </div>

            {/* Filtros de modalidad */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-none">
              {(['all', 'pinpoint', 'countries', 'capitals', 'flags'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setFilterMode(mode)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
                    filterMode === mode
                      ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-700/60 shadow-sm'
                      : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                  }`}
                >
                  {mode === 'all'
                    ? `Todos (${challenges.length})`
                    : mode === 'pinpoint'
                    ? '🎯 Puntería'
                    : mode === 'countries'
                    ? '🗺️ Países'
                    : mode === 'capitals'
                    ? '🏛️ Capitales'
                    : '🚩 Banderas'}
                </button>
              ))}
            </div>

            {/* Error de carga visible */}
            {challengesError && (
              <div className="p-3 bg-rose-950/60 border border-rose-700/50 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                <span>⚠️</span>
                <span>{challengesError} — Revisa la consola del navegador (F12) para más detalles.</span>
              </div>
            )}

            {/* Lista de Desafíos */}
            {isLoadingChallenges ? (
              <div className="py-12 text-center text-zinc-400 font-mono text-xs flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                <span>Cargando desafíos disponibles de la comunidad...</span>
              </div>
            ) : filteredChallenges.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-zinc-800 rounded-2xl space-y-3">
                <p className="text-sm text-zinc-300 font-medium">
                  Aún no hay desafíos abiertos en esta categoría.
                </p>
                <p className="text-xs text-zinc-500 max-w-md mx-auto">
                  ¡Sé el primero en jugar una partida arriba! Se publicará aquí para que otro jugador acepte tu reto y se dispute el ELO.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredChallenges.map(chal => {
                  // Solo comparar por ID para evitar falsos positivos por nombre duplicado
                  const isSelf = !!playerProfile.id && playerProfile.id !== 'player_local' && chal.creatorId === playerProfile.id;
                  const rankInfo = multiplayerService.getRankInfo(chal.creatorElo);
                  const modeBadge =
                    chal.mode === 'pinpoint' ? '🎯 Puntería' :
                    chal.mode === 'flags' ? '🚩 Banderas' :
                    chal.mode === 'capitals' ? '🏛️ Capitales' : '🗺️ Países';

                  return (
                    <div
                      key={chal.id}
                      className="bg-[#121214] border border-zinc-800 hover:border-zinc-700 p-4 rounded-2xl flex items-center justify-between gap-4 transition-all shadow-sm group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <PlayerAvatar
                          avatar={chal.creatorAvatar}
                          name={chal.creatorName}
                          className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-700/80 text-2xl shadow-inner shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-zinc-100 truncate">
                              {chal.creatorName}
                            </span>
                            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border bg-zinc-900 ${rankInfo.color} ${rankInfo.border}`}>
                              {rankInfo.icon} {chal.creatorElo} ELO
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mt-1.5 text-xs flex-wrap">
                            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-2 py-0.5 rounded font-semibold">
                              {modeBadge}
                            </span>
                            <span className="text-zinc-500">•</span>
                            <span className="font-mono text-zinc-400 text-[11px] flex items-center gap-1">
                              <Clock className="w-3 h-3 text-zinc-500" />
                              {formatRelativeTime(chal.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isSelf ? (
                          <span className="text-[11px] font-mono text-zinc-500 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl block text-center">
                            Tu partida
                          </span>
                        ) : (
                          <button
                            onClick={() => handleChallengeClick(chal)}
                            disabled={claimingChallengeId === chal.id}
                            className="py-2 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
                          >
                            {claimingChallengeId === chal.id ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Swords className="w-3.5 h-3.5" />
                            )}
                            <span>Desafiar</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}


      {/* PESTAÑA 2: SALAS PRIVADAS CON CÓDIGO (AMIGOS) */}
      {activeTab === 'custom' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Crear Sala Privada */}
          <div className="bg-[#18181B] border border-zinc-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              <span>Crear Sala de Amigos</span>
            </h3>
            <p className="text-xs text-zinc-400">
              Crea una sala personalizada, genera un código y compártelo con tu rival. Ambos jugaréis el mismo set exacto de preguntas.
            </p>

            <div className="space-y-3 pt-2">
              <div>
                <label className="text-xs font-mono text-zinc-400 block mb-1">Modalidad de Juego</label>
                <select
                  value={customMode}
                  onChange={(e) => setCustomMode(e.target.value as DuelMode)}
                  className="w-full bg-[#121214] border border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-200"
                >
                  <option value="pinpoint">🎯 Puntería Geográfica (GeoStrike)</option>
                  <option value="countries">🗺️ Países en Mapa</option>
                  <option value="capitals">🏛️ Capitales Mundiales</option>
                  <option value="flags">🚩 Banderas del Mundo</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-mono text-zinc-400 block mb-1">Continente</label>
                <select
                  value={customContinent}
                  onChange={(e) => setCustomContinent(e.target.value as Continent)}
                  className="w-full bg-[#121214] border border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-200"
                >
                  <option value="World">Mundo Completo (Global)</option>
                  <option value="Europe">Europa</option>
                  <option value="Americas">América</option>
                  <option value="Asia">Asia</option>
                  <option value="Africa">África</option>
                  <option value="Oceania">Oceanía</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-mono text-zinc-400 block mb-1">Rondas</label>
                  <select
                    value={customRounds}
                    onChange={(e) => setCustomRounds(Number(e.target.value))}
                    className="w-full bg-[#121214] border border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-200"
                  >
                    <option value={5}>5 Rondas</option>
                    <option value={10}>10 Rondas</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-mono text-zinc-400 block mb-1">Tiempo/Ronda</label>
                  <select
                    value={customTimeLimit}
                    onChange={(e) => setCustomTimeLimit(Number(e.target.value))}
                    className="w-full bg-[#121214] border border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-200"
                  >
                    <option value={15}>15 segundos</option>
                    <option value={30}>30 segundos</option>
                    <option value={60}>60 segundos</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              onClick={handleCreateRoom}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 text-sm pt-3"
            >
              <span>Crear Sala & Abrir Lobby</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Unirse a Sala Privada */}
          <div className="bg-[#18181B] border border-zinc-800 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                <Key className="w-5 h-5 text-zinc-300" />
                <span>Unirse con Código</span>
              </h3>
              <p className="text-xs text-zinc-400">
                Pídele a tu amigo el código de 6 caracteres (ej. GEO-4821) o abre directamente el enlace que te ha compartido.
              </p>

              <div>
                <input
                  type="text"
                  placeholder="GEO-XXXX"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="w-full bg-[#121214] border border-zinc-700 rounded-xl px-4 py-3 text-center font-mono text-lg tracking-widest text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 uppercase"
                  maxLength={10}
                />
                {joinError && (
                  <p className="text-xs text-rose-400 mt-1 text-center">{joinError}</p>
                )}
              </div>
            </div>

            <button
              onClick={handleJoinRoom}
              className="w-full py-3.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-bold rounded-xl border border-zinc-700 transition-all active:scale-95 flex items-center justify-center gap-2 text-sm"
            >
              <span>Entrar a la Sala</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* PESTAÑA 3: HISTORIAL DE DUELOS RECIENTES Y EN LA NUBE */}
      {activeTab === 'history' && (
        <div className="bg-[#18181B] border border-zinc-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              <span>Historial de Duelos y Desafíos Resueltos</span>
            </h3>
            <button
              onClick={loadDuelHistory}
              disabled={isLoadingHistory}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-400 hover:text-zinc-200 transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingHistory ? 'animate-spin text-cyan-400' : ''}`} />
              <span>Actualizar Historial</span>
            </button>
          </div>

          {isLoadingHistory ? (
            <div className="py-12 text-center text-zinc-400 font-mono text-xs flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
              <span>Cargando historial de duelos...</span>
            </div>
          ) : duelHistory.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-zinc-800 rounded-xl space-y-2">
              <p className="text-sm text-zinc-400">Todavía no tienes duelos finalizados en tu historial.</p>
              <p className="text-xs text-zinc-500">¡Juega partidas clasificatorias o lanza desafíos para ver los resultados aquí!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {duelHistory.map((duel, idx) => {
                const isWinner = duel.winner === 'player';
                const isTie = duel.winner === 'tie';
                const rivalRank = multiplayerService.getRankInfo(duel.rival?.elo || 1200);
                return (
                  <div
                    key={duel.id || idx}
                    className="bg-[#121214] border border-zinc-800 p-4 rounded-xl flex items-center justify-between gap-4 flex-wrap hover:border-zinc-700 transition-all shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <PlayerAvatar
                        avatar={duel.rival?.avatar}
                        name={duel.rival?.name}
                        fallbackIcon="👤"
                        className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 text-xl"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-zinc-100">VS {duel.rival?.name || 'Rival'}</span>
                          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${rivalRank.bg} ${rivalRank.color} ${rivalRank.border}`}>
                            {rivalRank.icon} {duel.rival?.elo || 1200}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded uppercase">
                            {duel.duelMode === 'pinpoint' ? '🎯 Puntería' : duel.duelMode === 'flags' ? '🚩 Banderas' : duel.duelMode === 'capitals' ? '🏛️ Capitales' : '🗺️ Países'}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 font-mono mt-1">
                          Tú: <strong className="text-emerald-400">{duel.playerScore} pts</strong> · Rival: <strong className="text-amber-400">{duel.rivalScore} pts</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded border inline-block ${
                          isWinner
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                            : isTie
                            ? 'bg-amber-950/80 text-amber-300 border-amber-700/60'
                            : 'bg-rose-950/80 text-rose-300 border-rose-700/60'
                        }`}>
                          {isWinner ? '¡Victoria!' : isTie ? 'Empate' : 'Derrota'}
                        </span>
                        {duel.eloChange !== undefined && duel.eloChange !== 0 ? (
                          <span className={`block text-xs font-mono font-bold mt-1 ${duel.eloChange > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {duel.eloChange > 0 ? `+${duel.eloChange}` : duel.eloChange} ELO
                          </span>
                        ) : (
                          <span className="block text-[11px] font-mono text-zinc-500 mt-1">
                            0 ELO
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}


      {/* Modal de Sala de Espera Privada (Lobby) */}
      {activeLobby && (
        <CustomRoomLobbyModal
          isOpen={Boolean(activeLobby)}
          isHost={activeLobby.isHost}
          roomCode={activeLobby.roomCode}

          config={activeLobby.config}
          playerProfile={playerProfile}
          questions={activeLobby.questions}
          onStartGame={(questions, rivalProfile, recordedResults) => {
            const lobby = activeLobby;
            setActiveLobby(null);
            onStartDuel('custom_room', lobby.config.mode, lobby.config, questions, rivalProfile, recordedResults);
          }}
          onClose={() => setActiveLobby(null)}
        />
      )}
    </div>
  );
};

