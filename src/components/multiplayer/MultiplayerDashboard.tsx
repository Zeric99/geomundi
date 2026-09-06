import React, { useState } from 'react';
import { Swords, Trophy, Crown, Flame, Target, Flag, Landmark, Users, Sparkles, ArrowRight, Clock, Globe, Shield, Key } from 'lucide-react';
import { CustomRoomConfig, DuelMode, DuelState, MultiplayerType, PlayerProfile } from '../../types/multiplayer';
import { multiplayerService } from '../../services/multiplayerService';
import { Continent } from '../../types/country';

interface MultiplayerDashboardProps {
  playerProfile: PlayerProfile;
  onStartDuel: (type: MultiplayerType, duelMode: DuelMode, customConfig?: CustomRoomConfig) => void;
}

export const MultiplayerDashboard: React.FC<MultiplayerDashboardProps> = ({
  playerProfile,
  onStartDuel
}) => {
  const [activeTab, setActiveTab] = useState<'ranked' | 'custom' | 'history'>('ranked');
  const [selectedDuelMode, setSelectedDuelMode] = useState<DuelMode>('pinpoint');
  const [duelHistory] = useState<DuelState[]>(() => multiplayerService.getDuelHistory());

  // Estado para la creación de sala personalizada
  const [customMode, setCustomMode] = useState<DuelMode>('pinpoint');
  const [customContinent, setCustomContinent] = useState<Continent>('World');
  const [customRounds, setCustomRounds] = useState<number>(5);
  const [customTimeLimit, setCustomTimeLimit] = useState<number>(30); // 30s por defecto

  // Estado para unirse con código
  const [joinCode, setJoinCode] = useState<string>('');
  const [joinError, setJoinError] = useState<string | null>(null);

  // Crear sala y empezar partida
  const handleCreateRoom = () => {
    const roomCode = multiplayerService.generateRoomCode();
    const config: CustomRoomConfig = {
      roomCode,
      mode: customMode,
      continent: customContinent,
      totalRounds: customRounds,
      timeLimitSeconds: customTimeLimit,
      isHost: true
    };
    onStartDuel('custom_room', customMode, config);
  };

  // Unirse a sala con código
  const handleJoinRoom = () => {
    if (!joinCode.trim() || joinCode.trim().length < 4) {
      setJoinError('Introduce un código de sala válido (ej. ROOM-4921)');
      return;
    }

    setJoinError(null);
    const config: CustomRoomConfig = {
      roomCode: joinCode.toUpperCase().trim(),
      mode: 'pinpoint',
      continent: 'World',
      totalRounds: 5,
      timeLimitSeconds: 30,
      isHost: false
    };
    onStartDuel('custom_room', 'pinpoint', config);
  };

  const modesInfo: { id: DuelMode; title: string; desc: string; icon: React.ReactNode; color: string }[] = [
    {
      id: 'pinpoint',
      title: '🎯 Puntería Geográfica',
      desc: 'El modo GeoStrike. Haz clic libre en el mapa para situar la ciudad objetivo (hasta 1,000 pts/ronda).',
      icon: <Target className="w-6 h-6 text-cyan-400" />,
      color: 'border-cyan-500/70 bg-cyan-950/30'
    },
    {
      id: 'countries',
      title: '🗺️ Países',
      desc: 'Localiza y haz clic sobre la masa territorial del país indicado.',
      icon: <Globe className="w-6 h-6 text-indigo-400" />,
      color: 'border-indigo-500/70 bg-indigo-950/30'
    },
    {
      id: 'capitals',
      title: '🏛️ Capitales',
      desc: 'Adivina la capital mostrada e identifica su país en el mapa.',
      icon: <Landmark className="w-6 h-6 text-purple-400" />,
      color: 'border-purple-500/70 bg-purple-950/30'
    },
    {
      id: 'flags',
      title: '🚩 Banderas',
      desc: 'Identifica la bandera oficial e indica su país correspondiente.',
      icon: <Flag className="w-6 h-6 text-rose-400" />,
      color: 'border-rose-500/70 bg-rose-950/30'
    }
  ];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Tarjeta de Rango ELO y Perfil del Jugador con Nivel y XP */}
      <div className={`p-6 sm:p-8 rounded-3xl border ${playerProfile.rank.border} bg-[#18181B] ${playerProfile.rank.bg} relative overflow-hidden shadow-2xl`}>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900/90 border border-zinc-700/80 flex items-center justify-center text-4xl shadow-md shrink-0">
              {playerProfile.rank.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded border bg-zinc-900 ${playerProfile.rank.color} ${playerProfile.rank.border}`}>
                  Rango {playerProfile.rank.label}
                </span>
                <span className="text-[11px] font-mono font-bold bg-cyan-950/80 text-cyan-300 px-2.5 py-0.5 rounded border border-cyan-700/60">
                  Nivel {playerProfile.level || 1}
                </span>
                {playerProfile.streak > 0 && (
                  <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30 flex items-center gap-1">
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

          <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl text-center min-w-[150px] shadow-inner">
            <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold block">Puntuación Clasificatoria</span>
            <span className="text-3xl font-mono font-black text-amber-400">{playerProfile.elo}</span>
            <span className="text-[10px] font-mono text-zinc-400 block mt-0.5">Puntos ELO</span>
          </div>
        </div>
      </div>

      {/* Navegación de Pestañas Simplificada */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 flex-wrap">
        <button
          onClick={() => setActiveTab('ranked')}
          className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center gap-2 ${
            activeTab === 'ranked'
              ? 'bg-amber-950/40 text-amber-300 border border-amber-800/60 shadow-sm'
              : 'text-zinc-400 hover:bg-zinc-900'
          }`}
        >
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>🏆 Modo Clasificatorio (Ranked ELO)</span>
        </button>

        <button
          onClick={() => setActiveTab('custom')}
          className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center gap-2 ${
            activeTab === 'custom'
              ? 'bg-indigo-950/40 text-indigo-300 border border-indigo-800/60 shadow-sm'
              : 'text-zinc-400 hover:bg-zinc-900'
          }`}
        >
          <Users className="w-4 h-4 text-indigo-400" />
          <span>🏠 Salas Personalizadas (Custom Rooms)</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center gap-2 ${
            activeTab === 'history'
              ? 'bg-cyan-950/40 text-cyan-300 border border-cyan-800/60 shadow-sm'
              : 'text-zinc-400 hover:bg-zinc-900'
          }`}
        >
          <Clock className="w-4 h-4 text-cyan-400" />
          <span>📜 Historial de Duelos</span>
        </button>
      </div>

      {/* PESTAÑA 1: MODOS RANKED (COMPETITIVO ELO) */}
      {activeTab === 'ranked' && (
        <div className="space-y-6">
          <div className="bg-[#18181B] border border-zinc-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-zinc-200 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Selecciona el Modo Ranked (Todas a 5 Rondas)</span>
              </h3>
              <span className="text-xs text-amber-400 font-mono font-semibold">Ganar suma ELO (+15 a +32 pts)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {modesInfo.map(mode => (
                <div
                  key={mode.id}
                  onClick={() => setSelectedDuelMode(mode.id)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                    selectedDuelMode === mode.id
                      ? `${mode.color} shadow-lg ring-1 ring-cyan-500/40`
                      : 'bg-[#121214] border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-3 bg-zinc-900 border border-zinc-700 rounded-xl shrink-0">
                      {mode.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-base text-zinc-100">{mode.title}</h4>
                        <span className="text-[11px] bg-zinc-800 text-zinc-300 font-mono px-2 py-0.5 rounded border border-zinc-700">
                          5 Rondas
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                        {mode.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Botón de Inicio de Búsqueda Ranked */}
            <div className="pt-2">
              <button
                onClick={() => onStartDuel('ranked', selectedDuelMode)}
                className="w-full py-4 bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-zinc-950 font-black rounded-xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 text-base uppercase tracking-wider"
              >
                <Swords className="w-5 h-5 fill-zinc-950" />
                <span>Buscar Partida Ranked 1v1</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 2: SALAS PERSONALIZADAS (CUSTOM ROOMS) */}
      {activeTab === 'custom' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Panel de Crear Sala */}
          <div className="bg-[#18181B] border border-zinc-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <span>Crear Nueva Sala Privada</span>
            </h3>

            {/* 1. Selector de Modo */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-zinc-400 uppercase">Modo de Juego</label>
              <select
                value={customMode}
                onChange={e => setCustomMode(e.target.value as DuelMode)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-cyan-500"
              >
                <option value="pinpoint">🎯 Puntería Geográfica (MapTap)</option>
                <option value="countries">🗺️ Países en Mapa</option>
                <option value="capitals">🏛️ Capitales Mundiales</option>
                <option value="flags">🚩 Banderas del Mundo</option>
              </select>
            </div>

            {/* 2. Selector de Región */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-zinc-400 uppercase">Continente / Región</label>
              <select
                value={customContinent}
                onChange={e => setCustomContinent(e.target.value as Continent)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-cyan-500"
              >
                <option value="World">🌍 Mundo Entero</option>
                <option value="Europe">🏰 Europa</option>
                <option value="Americas">🌎 América</option>
                <option value="Africa">🦁 África</option>
                <option value="Asia">🏯 Asia</option>
                <option value="Oceania">🏝️ Oceanía</option>
              </select>
            </div>

            {/* 3. Selector de Número de Rondas */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-zinc-400 uppercase">Rondas</label>
                <select
                  value={customRounds}
                  onChange={e => setCustomRounds(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value={3}>3 Rondas</option>
                  <option value={5}>5 Rondas (Estándar)</option>
                  <option value={10}>10 Rondas</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-zinc-400 uppercase">Tiempo por Ronda</label>
                <select
                  value={customTimeLimit}
                  onChange={e => setCustomTimeLimit(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value={15}>⏱️ 15 segundos</option>
                  <option value={30}>⏱️ 30 segundos</option>
                  <option value={60}>⏱️ 60 segundos</option>
                  <option value={0}>♾️ Sin Límite</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleCreateRoom}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 text-sm"
            >
              <Users className="w-4 h-4" />
              <span>Crear Sala e Invitar Amigos</span>
            </button>
          </div>

          {/* Panel de Unirse a Sala con Código */}
          <div className="bg-[#18181B] border border-zinc-800 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-400" />
                <span>Unirse a una Sala Existente</span>
              </h3>
              <p className="text-xs text-zinc-400">
                Introduce el código de 5 caracteres que te ha compartido tu amigo para entrar en su sala privada.
              </p>

              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Ej. ROOM-4921"
                  value={joinCode}
                  onChange={e => setJoinCode(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-lg font-mono text-center text-cyan-300 uppercase placeholder-zinc-600 focus:outline-none focus:border-cyan-500"
                />
                {joinError && (
                  <p className="text-xs text-rose-400 font-sans">{joinError}</p>
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

      {/* PESTAÑA 3: HISTORIAL DE DUELOS RECIENTES */}
      {activeTab === 'history' && (
        <div className="bg-[#18181B] border border-zinc-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            <span>Últimos Duelos Jugados</span>
          </h3>

          {duelHistory.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-zinc-800 rounded-xl space-y-2">
              <p className="text-sm text-zinc-400">Todavía no has jugado partidas clasificatorias o salas en esta sesión.</p>
              <p className="text-xs text-zinc-500">¡Juega una partida Ranked para ver tu progreso aquí!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {duelHistory.map((duel, idx) => {
                const isWinner = duel.winner === 'player';
                const isTie = duel.winner === 'tie';
                return (
                  <div
                    key={duel.id || idx}
                    className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-xl flex items-center justify-between gap-4 flex-wrap hover:border-zinc-700 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xl shrink-0">
                        {duel.rival?.avatar || '👤'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-zinc-100">VS {duel.rival?.name || 'Rival'}</span>
                          <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded uppercase">
                            {duel.duelMode === 'pinpoint' ? '🎯 Puntería' : duel.duelMode === 'flags' ? '🚩 Banderas' : duel.duelMode === 'capitals' ? '🏛️ Capitales' : '🗺️ Países'}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 font-mono mt-0.5">
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
                        {duel.eloChange !== 0 && (
                          <span className={`block text-xs font-mono font-bold mt-1 ${duel.eloChange > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {duel.eloChange > 0 ? `+${duel.eloChange}` : duel.eloChange} ELO
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
    </div>
  );
};
