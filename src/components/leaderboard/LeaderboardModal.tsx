import React, { useState, useEffect } from 'react';
import { X, Trophy, Flame, Swords, Calendar, RefreshCw, User, Medal } from 'lucide-react';
import { cloudSyncService, LeaderboardEntry, DailyLeaderboardEntry } from '../../services/cloudSyncService';
import { useAuth } from '../../contexts/AuthContext';
import { DuelMode } from '../../types/multiplayer';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'daily' | 'elo'>('daily');
  const [activeEloMode, setActiveEloMode] = useState<'all' | DuelMode>('all');
  const [dailyLeaders, setDailyLeaders] = useState<DailyLeaderboardEntry[]>([]);
  const [eloLeaders, setEloLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const loadData = async (mode: 'all' | DuelMode = activeEloMode) => {
    setLoading(true);
    if (activeTab === 'daily') {
      const data = await cloudSyncService.getTodayDailyLeaderboard();
      setDailyLeaders(data);
    } else {
      const data = await cloudSyncService.getEloLeaderboardByMode(mode);
      setEloLeaders(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadData(activeEloMode);
    }
  }, [isOpen, activeTab, activeEloMode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#121620] border border-zinc-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[88vh]">
        {/* Cabecera */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg sm:text-xl text-zinc-100">
                Clasificación Mundial
              </h3>
              <p className="text-xs text-zinc-400">
                Compite con jugadores de todo el mundo en tiempo real
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => loadData(activeEloMode)}
              disabled={loading}
              className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 rounded-xl transition-colors disabled:opacity-50"
              title="Recargar clasificación"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Pestañas */}
        <div className="flex border-b border-zinc-800 bg-zinc-900/20 px-4 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('daily')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-bold text-xs sm:text-sm transition-all border-b-2 ${
              activeTab === 'daily'
                ? 'bg-zinc-800/80 text-amber-300 border-amber-400'
                : 'text-zinc-400 border-transparent hover:text-zinc-200'
            }`}
          >
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>Reto Diario (Hoy)</span>
          </button>
          <button
            onClick={() => setActiveTab('elo')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-bold text-xs sm:text-sm transition-all border-b-2 ${
              activeTab === 'elo'
                ? 'bg-zinc-800/80 text-cyan-300 border-cyan-400'
                : 'text-zinc-400 border-transparent hover:text-zinc-200'
            }`}
          >
            <Swords className="w-4 h-4 text-cyan-400" />
            <span>Ranking 1v1 (Elo)</span>
          </button>
        </div>

        {/* Si está en la pestaña Elo, selector de minijuego */}
        {activeTab === 'elo' && (
          <div className="px-4 pt-3 pb-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar border-b border-zinc-800/80 bg-zinc-900/30">
            <button
              onClick={() => setActiveEloMode('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 ${
                activeEloMode === 'all'
                  ? 'bg-zinc-100 text-zinc-950 font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span>🌐</span>
              <span>General</span>
            </button>
            <button
              onClick={() => setActiveEloMode('pinpoint')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 ${
                activeEloMode === 'pinpoint'
                  ? 'bg-cyan-500 text-zinc-950 font-bold'
                  : 'text-cyan-400 hover:bg-cyan-950/40'
              }`}
            >
              <span>🎯</span>
              <span>Puntería</span>
            </button>
            <button
              onClick={() => setActiveEloMode('countries')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 ${
                activeEloMode === 'countries'
                  ? 'bg-indigo-500 text-white font-bold'
                  : 'text-indigo-400 hover:bg-indigo-950/40'
              }`}
            >
              <span>🗺️</span>
              <span>Países</span>
            </button>
            <button
              onClick={() => setActiveEloMode('capitals')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 ${
                activeEloMode === 'capitals'
                  ? 'bg-purple-500 text-white font-bold'
                  : 'text-purple-400 hover:bg-purple-950/40'
              }`}
            >
              <span>🏛️</span>
              <span>Capitales</span>
            </button>
            <button
              onClick={() => setActiveEloMode('flags')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 ${
                activeEloMode === 'flags'
                  ? 'bg-amber-500 text-zinc-950 font-bold'
                  : 'text-amber-400 hover:bg-amber-950/40'
              }`}
            >
              <span>🚩</span>
              <span>Banderas</span>
            </button>
          </div>
        )}

        {/* Cuerpo / Lista de clasificados */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2.5">
          {loading ? (
            <div className="py-16 text-center text-zinc-500 space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-cyan-400" />
              <p className="text-sm">Consultando puntuaciones globales...</p>
            </div>
          ) : activeTab === 'daily' ? (
            dailyLeaders.length === 0 ? (
              <div className="py-16 text-center text-zinc-500 space-y-2">
                <Medal className="w-10 h-10 mx-auto text-zinc-600" />
                <p className="text-zinc-300 font-semibold">¡Aún no hay puntuaciones registradas hoy!</p>
                <p className="text-xs text-zinc-500">Sé el primero en completar el reto diario para liderar el ranking.</p>
              </div>
            ) : (
              dailyLeaders.map((entry, idx) => {
                const isCurrentUser = user && user.id === entry.user_id;
                return (
                  <div
                    key={entry.attempt_id || idx}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                      isCurrentUser
                        ? 'bg-cyan-950/40 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                        : 'bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Posición */}
                      <span className="w-7 text-center font-mono font-bold text-sm">
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                      </span>

                      {/* Avatar */}
                      {entry.avatar_url ? (
                        <img
                          src={entry.avatar_url}
                          alt={entry.nickname}
                          className="w-8 h-8 rounded-full object-cover border border-zinc-700"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                          <User className="w-4 h-4" />
                        </div>
                      )}

                      <div>
                        <p className="font-bold text-zinc-200 text-sm flex items-center gap-1.5">
                          <span>{entry.nickname}</span>
                          {isCurrentUser && (
                            <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded font-sans">
                              Tú
                            </span>
                          )}
                        </p>
                        <p className="text-[11px] text-zinc-500 font-mono">
                          {entry.time_seconds}s transcurridos
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded-lg">
                        {entry.attempts_count} {entry.attempts_count === 1 ? 'intento' : 'intentos'}
                      </span>
                    </div>
                  </div>
                );
              })
            )
          ) : eloLeaders.length === 0 ? (
            <div className="py-16 text-center text-zinc-500 space-y-2">
              <Swords className="w-10 h-10 mx-auto text-zinc-600" />
              <p className="text-zinc-300 font-semibold">Aún no hay jugadores registrados en esta modalidad.</p>
              <p className="text-xs text-zinc-500">Juega un duelo para aparecer en el ranking Elo mundial.</p>
            </div>
          ) : (
            eloLeaders.map((player, idx) => {
              const isCurrentUser = user && user.id === player.id;
              let eloColor = 'text-cyan-400';
              if (activeEloMode === 'countries') eloColor = 'text-indigo-400';
              else if (activeEloMode === 'capitals') eloColor = 'text-purple-400';
              else if (activeEloMode === 'flags') eloColor = 'text-amber-400';

              return (
                <div
                  key={player.id || idx}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                    isCurrentUser
                      ? 'bg-cyan-950/40 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                      : 'bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 text-center font-mono font-bold text-sm">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                    </span>

                    {player.avatar_url ? (
                      <img
                        src={player.avatar_url}
                        alt={player.nickname}
                        className="w-8 h-8 rounded-full object-cover border border-zinc-700"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                        <User className="w-4 h-4" />
                      </div>
                    )}

                    <div>
                      <p className="font-bold text-zinc-200 text-sm flex items-center gap-1.5">
                        <span>{player.nickname}</span>
                        {isCurrentUser && (
                          <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded font-sans">
                            Tú
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-zinc-500 font-mono">
                        {player.wins}V - {player.losses}D · Nivel {player.level}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`font-mono font-bold ${eloColor} text-sm`}>
                      {player.elo} <span className="text-[10px] text-zinc-500 font-sans">Elo</span>
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
