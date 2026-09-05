import React, { useState } from 'react';
import { Trophy, Calendar, Flame, Target, Award, Users, Globe2, Crown, Sparkles, CheckCircle2, Medal, Clock } from 'lucide-react';
import { UserStatsState } from '../../types/stats';
import { dailyChallengeService } from '../../services/dailyChallengeService';

interface LeaderboardViewProps {
  stats: UserStatsState;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ stats }) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'global' | 'history'>('daily');
  const streakState = dailyChallengeService.getStreakState();
  const dailyHistory = Object.values(streakState.history).sort((a, b) => b.dateStr.localeCompare(a.dateStr));

  const dailyLeaderboard = dailyChallengeService.getDailyLeaderboard();
  const globalLeaderboard = dailyChallengeService.getGlobalLeaderboard();

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* CABECERA */}
      <div className="bg-[#18181B] border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-card-subtle flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-amber-500/15 border border-amber-500/30 rounded-xl text-amber-400 shrink-0">
            <Trophy className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400 bg-amber-950/60 px-2.5 py-0.5 rounded border border-amber-800/60 font-bold">
              Clasificación Oficial
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-zinc-100 mt-1">
              Tabla de Líderes & Récords
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
              Compite diariamente por el mejor tiempo y consulta la clasificación global acumulada.
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
          <Calendar className="w-4 h-4 text-indigo-400" />
          <span>Ranking Diario (Hoy)</span>
        </button>

        <button
          onClick={() => setActiveTab('global')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'global'
              ? 'bg-zinc-100 text-zinc-950 font-bold shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
          }`}
        >
          <Globe2 className="w-4 h-4 text-emerald-400" />
          <span>Ranking Mundial (Acumulado)</span>
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
          <span>Historial & Rachas ({dailyHistory.length})</span>
        </button>
      </div>

      {/* CONTENIDO PESTAÑA 1: RANKING DIARIO (HOY) */}
      {activeTab === 'daily' && (
        <div className="bg-[#18181B] border border-zinc-800 rounded-2xl p-5 shadow-card-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-mono font-bold text-zinc-200 uppercase tracking-wider">
                Desafío Diario · #{dailyChallengeService.getTodayDateString()}
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Clasificación de hoy según aciertos y tiempo en resolver las 5 pruebas.
              </p>
            </div>
            <span className="text-xs font-mono bg-indigo-950/60 text-indigo-300 px-3 py-1 rounded-lg border border-indigo-800/60 font-bold">
              Las mismas 5 pruebas para todos hoy
            </span>
          </div>

          <div className="space-y-2">
            {dailyLeaderboard.map((player) => (
              <div
                key={player.rank}
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-4 font-mono transition-all ${
                  player.isUser
                    ? 'bg-indigo-950/40 border-indigo-500 shadow-md ring-1 ring-indigo-500/50 text-white'
                    : player.rank === 1
                    ? 'bg-amber-950/20 border-amber-500/40 text-amber-100'
                    : 'bg-[#121214] border-zinc-800 text-zinc-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                    player.rank === 1 ? 'bg-amber-500 text-zinc-950' :
                    player.rank === 2 ? 'bg-zinc-300 text-zinc-950' :
                    player.rank === 3 ? 'bg-amber-700 text-white' :
                    'bg-zinc-800 text-zinc-400 border border-zinc-700'
                  }`}>
                    #{player.rank}
                  </div>

                  <span className="text-xl">{player.avatar}</span>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${player.isUser ? 'text-cyan-400' : 'text-zinc-200'}`}>
                        {player.username}
                      </span>
                      {player.isUser && (
                        <span className="text-[10px] bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800 font-bold">
                          ¡TÚ!
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-zinc-400">
                      <span>🎯 {player.accuracy}% precisión</span>
                      <span>⏱️ {player.durationSeconds}s</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-emerald-400 font-bold text-sm sm:text-base block">
                    {player.score} pts
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CONTENIDO PESTAÑA 2: RANKING MUNDIAL ACUMULADO */}
      {activeTab === 'global' && (
        <div className="bg-[#18181B] border border-zinc-800 rounded-2xl p-5 shadow-card-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-mono font-bold text-zinc-200 uppercase tracking-wider">
                Tabla de Posiciones Mundial (Acumulado Total)
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Puntuación global obtenida al sumar todos los días jugados.
              </p>
            </div>
            <span className="text-xs font-mono bg-emerald-950/60 text-emerald-300 px-3 py-1 rounded-lg border border-emerald-800/60 font-bold">
              Puntos Globales Acumulados
            </span>
          </div>

          <div className="space-y-2">
            {globalLeaderboard.map((player) => (
              <div
                key={player.rank}
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-4 font-mono transition-all ${
                  player.isUser
                    ? 'bg-indigo-950/40 border-indigo-500 shadow-md ring-1 ring-indigo-500/50 text-white'
                    : player.rank === 1
                    ? 'bg-amber-950/20 border-amber-500/40 text-amber-100'
                    : 'bg-[#121214] border-zinc-800 text-zinc-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                    player.rank === 1 ? 'bg-amber-500 text-zinc-950' :
                    player.rank === 2 ? 'bg-zinc-300 text-zinc-950' :
                    player.rank === 3 ? 'bg-amber-700 text-white' :
                    'bg-zinc-800 text-zinc-400 border border-zinc-700'
                  }`}>
                    #{player.rank}
                  </div>

                  <span className="text-xl">{player.avatar}</span>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${player.isUser ? 'text-cyan-400' : 'text-zinc-200'}`}>
                        {player.username}
                      </span>
                      {player.isUser && (
                        <span className="text-[10px] bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800 font-bold">
                          ¡TÚ!
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-zinc-400 block">
                      Promedio Precisión: {player.accuracy}%
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-amber-400 font-bold text-sm sm:text-base block">
                    {player.score.toLocaleString('es-ES')} pts
                  </span>
                </div>
              </div>
            ))}
          </div>
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
            {dailyHistory.map((d, idx) => (
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
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
