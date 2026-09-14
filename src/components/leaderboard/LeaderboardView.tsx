import React, { useState, useEffect } from 'react';
import { Trophy, Calendar, Flame, Target, Award, Users, Globe2, Crown, Sparkles, CheckCircle2, Medal, Clock, RefreshCw, User as UserIcon, Swords } from 'lucide-react';
import { UserStatsState } from '../../types/stats';
import { dailyChallengeService } from '../../services/dailyChallengeService';
import { cloudSyncService, DailyLeaderboardEntry, LeaderboardEntry } from '../../services/cloudSyncService';
import { useAuth } from '../../contexts/AuthContext';
import { DuelMode } from '../../types/multiplayer';
import { MODE_ELO_CONFIGS } from '../../services/multiplayerService';

interface LeaderboardViewProps {
  stats: UserStatsState;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ stats }) => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'daily' | 'elo' | 'history'>('daily');
  const [activeEloMode, setActiveEloMode] = useState<'all' | DuelMode>('all');
  const [dailyLeaders, setDailyLeaders] = useState<DailyLeaderboardEntry[]>([]);
  const [eloLeaders, setEloLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const streakState = dailyChallengeService.getStreakState();
  const dailyHistory = Object.values(streakState.history).sort((a, b) => b.dateStr.localeCompare(a.dateStr));
  const todayStr = dailyChallengeService.getTodayDateString();
  const userTodayLocal = streakState.history[todayStr];

  const currentUserName = profile?.nickname || user?.user_metadata?.full_name || user?.user_metadata?.name || 'Mi Perfil';

  const loadLeaderboards = async (eloMode: 'all' | DuelMode = activeEloMode) => {
    setLoading(true);
    try {
      const [dailyData, eloData] = await Promise.all([
        cloudSyncService.getTodayDailyLeaderboard(50),
        cloudSyncService.getEloLeaderboardByMode(eloMode, 50)
      ]);
      setDailyLeaders(dailyData);
      setEloLeaders(eloData);
    } catch (e) {
      console.error('Error cargando clasificaciones:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboards(activeEloMode);
  }, [user?.id, activeEloMode]);

  // Si el usuario jugó hoy pero aún no aparece en Supabase (o está offline), lo combinamos de forma limpia
  const hasUserInDaily = dailyLeaders.some(l => l.user_id === user?.id);
  const displayDailyLeaders = [...dailyLeaders];

  if (!hasUserInDaily && userTodayLocal) {
    displayDailyLeaders.push({
      attempt_id: 'local_today',
      user_id: user?.id || 'local_user',
      nickname: currentUserName,
      avatar_url: profile?.avatar_url || user?.user_metadata?.avatar_url || '',
      challenge_date: todayStr,
      solved: true,
      attempts_count: 5,
      time_seconds: userTodayLocal.durationSeconds || 30,
      score: userTodayLocal.score,
      rank_position: displayDailyLeaders.length + 1
    });
    // Reordenar por puntos y tiempo
    displayDailyLeaders.sort((a, b) => b.score - a.score || a.time_seconds - b.time_seconds);
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* CABECERA */}
      <div className="bg-[#18181B] border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-card-subtle flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-amber-500/15 border border-amber-500/30 rounded-xl text-amber-400 shrink-0">
            <Trophy className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-widest text-amber-400 bg-amber-950/60 px-2.5 py-0.5 rounded border border-amber-800/60 font-bold">
                Clasificación Oficial en Vivo
              </span>
              <button
                onClick={() => loadLeaderboards(activeEloMode)}
                disabled={loading}
                title="Actualizar tabla de líderes"
                className="p-1 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-zinc-100 mt-1">
              Tabla de Líderes & Récords
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
              Resultados reales de jugadores conectados en tiempo real con Supabase Cloud.
            </p>
          </div>
        </div>

        {/* RESUMEN EN VIVO */}
        <div className="flex items-center gap-3">
          <div className="bg-[#121214] border border-zinc-800 px-4 py-2 rounded-xl text-center">
            <span className="text-[10px] uppercase font-mono text-zinc-500 font-bold block">Puntaje Total</span>
            <span className="text-lg font-mono font-bold text-emerald-400">{stats.totalScore.toLocaleString('es-ES')}</span>
          </div>
          <div className="bg-[#121214] border border-zinc-800 px-4 py-2 rounded-xl text-center">
            <span className="text-[10px] uppercase font-mono text-zinc-500 font-bold block">Racha Diaria</span>
            <span className="text-lg font-mono font-bold text-amber-400">{streakState.currentStreak} días</span>
          </div>
        </div>
      </div>

      {/* SELECTOR DE PESTAÑAS */}
      <div className="flex items-center bg-[#18181B] p-1.5 rounded-xl border border-zinc-800 gap-1">
        <button
          onClick={() => setActiveTab('daily')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'daily'
              ? 'bg-zinc-100 text-zinc-950 font-bold shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
          }`}
        >
          <Calendar className="w-4 h-4 text-amber-400" />
          <span>Reto Diario de Hoy ({displayDailyLeaders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('elo')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'elo'
              ? 'bg-zinc-100 text-zinc-950 font-bold shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
          }`}
        >
          <Swords className="w-4 h-4 text-cyan-400" />
          <span>Ranking Elo 1v1 ({eloLeaders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'history'
              ? 'bg-zinc-100 text-zinc-950 font-bold shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
          }`}
        >
          <Trophy className="w-4 h-4 text-amber-500" />
          <span>Mi Historial ({dailyHistory.length})</span>
        </button>
      </div>

      {/* CONTENIDO PESTAÑA 1: RETO DIARIO (HOY) */}
      {activeTab === 'daily' && (
        <div className="bg-[#18181B] border border-zinc-800 rounded-2xl p-5 shadow-card-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-mono font-bold text-zinc-200 uppercase tracking-wider">
                Desafío Diario · #{todayStr}
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Clasificación de jugadores reales que han resuelto el reto hoy.
              </p>
            </div>
            <span className="text-xs font-mono bg-amber-950/60 text-amber-300 px-3 py-1 rounded-lg border border-amber-800/60 font-bold">
              Las mismas 5 preguntas para todos
            </span>
          </div>

          {displayDailyLeaders.length === 0 ? (
            <div className="py-12 text-center space-y-3 bg-[#121214] rounded-xl border border-zinc-800">
              <Sparkles className="w-8 h-8 text-amber-400 mx-auto animate-pulse" />
              <p className="text-sm text-zinc-300 font-medium">
                Aún no hay intentos registrados hoy en la nube.
              </p>
              <p className="text-xs text-zinc-500">
                ¡Juega el Desafío Diario para ser el primero en liderar la tabla de hoy!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {displayDailyLeaders.map((player, idx) => {
                const isCurrentPlayer = (user && player.user_id === user.id) || player.nickname === currentUserName;
                const position = idx + 1;

                return (
                  <div
                    key={player.attempt_id || idx}
                    className={`p-3.5 rounded-xl border flex items-center justify-between gap-4 font-mono transition-all ${
                      isCurrentPlayer
                        ? 'bg-[#1e1708] border-amber-500/60 shadow-md ring-1 ring-amber-500/30'
                        : position === 1
                        ? 'bg-[#181309] border-amber-500/30 text-amber-100'
                        : 'bg-[#121214] border-zinc-800 text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                        position === 1 ? 'bg-amber-500 text-zinc-950 font-black' :
                        position === 2 ? 'bg-zinc-300 text-zinc-950' :
                        position === 3 ? 'bg-amber-700 text-white' :
                        'bg-zinc-800 text-zinc-400 border border-zinc-700'
                      }`}>
                        #{position}
                      </div>

                      {/* Avatar */}
                      {player.avatar_url ? (
                        <img 
                          src={player.avatar_url} 
                          alt={player.nickname} 
                          className="w-8 h-8 rounded-full object-cover border border-zinc-700" 
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-300">
                          {player.nickname ? player.nickname.charAt(0).toUpperCase() : '👤'}
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold ${isCurrentPlayer ? 'text-amber-300' : 'text-zinc-200'}`}>
                            {player.nickname}
                          </span>
                          {isCurrentPlayer && (
                            <span className="text-[10px] bg-amber-950 text-amber-300 px-2 py-0.2 rounded border border-amber-800 font-bold">
                              Tu posición
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-zinc-400 mt-0.5">
                          <span>⏱️ {player.time_seconds}s</span>
                          <span className="text-emerald-400">✓ Resuelto</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-emerald-400 font-bold text-sm sm:text-base block">
                        {player.score.toLocaleString('es-ES')} pts
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* CONTENIDO PESTAÑA 2: RANKING ELO (DUELOS 1V1 REALES) */}
      {activeTab === 'elo' && (
        <div className="bg-[#18181B] border border-zinc-800 rounded-2xl p-5 shadow-card-subtle space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-mono font-bold text-zinc-200 uppercase tracking-wider">
                Ranking Mundial Competitivo 1v1 (Elo)
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Clasificaciones independientes por minijuego con identidad de color propia.
              </p>
            </div>

            {/* Selector de Modalidad ELO */}
            <div className="flex items-center bg-zinc-900/90 p-1 rounded-xl border border-zinc-800 gap-1 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveEloMode('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeEloMode === 'all'
                    ? 'bg-zinc-100 text-zinc-950 font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                }`}
              >
                <span>🌐</span>
                <span>General</span>
              </button>

              <button
                onClick={() => setActiveEloMode('pinpoint')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeEloMode === 'pinpoint'
                    ? 'bg-cyan-500 text-zinc-950 font-bold shadow-sm'
                    : 'text-cyan-400 hover:bg-cyan-950/40'
                }`}
              >
                <span>🎯</span>
                <span>Puntería</span>
              </button>

              <button
                onClick={() => setActiveEloMode('countries')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeEloMode === 'countries'
                    ? 'bg-indigo-500 text-white font-bold shadow-sm'
                    : 'text-indigo-400 hover:bg-indigo-950/40'
                }`}
              >
                <span>🗺️</span>
                <span>Países</span>
              </button>

              <button
                onClick={() => setActiveEloMode('capitals')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeEloMode === 'capitals'
                    ? 'bg-purple-500 text-white font-bold shadow-sm'
                    : 'text-purple-400 hover:bg-purple-950/40'
                }`}
              >
                <span>🏛️</span>
                <span>Capitales</span>
              </button>

              <button
                onClick={() => setActiveEloMode('flags')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeEloMode === 'flags'
                    ? 'bg-amber-500 text-zinc-950 font-bold shadow-sm'
                    : 'text-amber-400 hover:bg-amber-950/40'
                }`}
              >
                <span>🚩</span>
                <span>Banderas</span>
              </button>
            </div>
          </div>

          {eloLeaders.length === 0 ? (
            <div className="py-12 text-center space-y-3 bg-[#121214] rounded-xl border border-zinc-800">
              <Swords className="w-8 h-8 text-cyan-400 mx-auto" />
              <p className="text-sm text-zinc-300 font-medium">
                Aún no hay partidas multijugador registradas en esta modalidad.
              </p>
              <p className="text-xs text-zinc-500">
                ¡Juega un duelo en la pestaña Multijugador para figurar en la clasificación mundial!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {eloLeaders.map((player, idx) => {
                const isCurrentPlayer = user && player.id === user.id;
                const position = idx + 1;

                // Color dinámico según la modalidad ELO activa
                let eloTextColor = 'text-cyan-400';
                let playerCardRing = 'border-cyan-500/60 ring-cyan-500/40';
                let tagBadge = 'bg-cyan-950 text-cyan-300 border-cyan-800';

                if (activeEloMode === 'countries') {
                  eloTextColor = 'text-indigo-400';
                  playerCardRing = 'border-indigo-500/60 ring-indigo-500/40';
                  tagBadge = 'bg-indigo-950 text-indigo-300 border-indigo-800';
                } else if (activeEloMode === 'capitals') {
                  eloTextColor = 'text-purple-400';
                  playerCardRing = 'border-purple-500/60 ring-purple-500/40';
                  tagBadge = 'bg-purple-950 text-purple-300 border-purple-800';
                } else if (activeEloMode === 'flags') {
                  eloTextColor = 'text-amber-400';
                  playerCardRing = 'border-amber-500/60 ring-amber-500/40';
                  tagBadge = 'bg-amber-950 text-amber-300 border-amber-800';
                }

                return (
                  <div
                    key={player.id || idx}
                    className={`p-3.5 rounded-xl border flex items-center justify-between gap-4 font-mono transition-all ${
                      isCurrentPlayer
                        ? `bg-[#091824] ${playerCardRing} shadow-md ring-1`
                        : position === 1
                        ? 'bg-[#181309] border-amber-500/40 text-amber-100'
                        : 'bg-[#121214] border-zinc-800 text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                        position === 1 ? 'bg-amber-500 text-zinc-950 font-black' :
                        position === 2 ? 'bg-zinc-300 text-zinc-950' :
                        position === 3 ? 'bg-amber-700 text-white' :
                        'bg-zinc-800 text-zinc-400 border border-zinc-700'
                      }`}>
                        #{position}
                      </div>

                      {player.avatar_url ? (
                        <img 
                          src={player.avatar_url} 
                          alt={player.nickname} 
                          className="w-8 h-8 rounded-full object-cover border border-zinc-700" 
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-300">
                          {player.nickname ? player.nickname.charAt(0).toUpperCase() : '👤'}
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold ${isCurrentPlayer ? eloTextColor : 'text-zinc-200'}`}>
                            {player.nickname}
                          </span>
                          {isCurrentPlayer && (
                            <span className={`text-[10px] px-2 py-0.2 rounded border font-bold ${tagBadge}`}>
                              Tu posición
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-zinc-400 block">
                          Victorias: {player.wins} | Duelos: {player.total_duels}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`${eloTextColor} font-bold text-sm sm:text-base block`}>
                        {player.elo} Elo
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* CONTENIDO PESTAÑA 3: HISTORIAL & RACHAS */}
      {activeTab === 'history' && (
        <div className="bg-[#18181B] border border-zinc-800 rounded-2xl p-5 shadow-card-subtle space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-[#121214] border border-zinc-800 p-3 rounded-xl text-center">
              <span className="text-[10px] font-mono uppercase text-zinc-500 block">Racha Actual</span>
              <span className="text-xl font-mono font-bold text-amber-400">{streakState.currentStreak} días</span>
            </div>
            <div className="bg-[#121214] border border-zinc-800 p-3 rounded-xl text-center">
              <span className="text-[10px] font-mono uppercase text-zinc-500 block">Mejor Racha</span>
              <span className="text-xl font-mono font-bold text-indigo-400">{streakState.bestStreak} días</span>
            </div>
            <div className="bg-[#121214] border border-zinc-800 p-3 rounded-xl text-center col-span-2 sm:col-span-1">
              <span className="text-[10px] font-mono uppercase text-zinc-500 block">Desafíos Jugados</span>
              <span className="text-xl font-mono font-bold text-emerald-400">{dailyHistory.length}</span>
            </div>
          </div>

          <div className="space-y-2">
            {dailyHistory.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-6">
                Aún no has jugado ningún Reto Diario. ¡Comienza hoy para iniciar tu racha!
              </p>
            ) : (
              dailyHistory.map((d, idx) => (
                <div key={idx} className="bg-[#121214] border border-zinc-800 p-3 rounded-xl flex items-center justify-between font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-400" />
                    <span className="text-zinc-200 font-bold">Desafío Diario #{d.dateStr}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-cyan-400">⏱️ {d.durationSeconds || 30}s</span>
                    <span className="text-emerald-400 font-bold">{d.score} pts</span>
                    <span className="text-zinc-400">({d.accuracy}%)</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
