import React, { useState } from 'react';
import { Trophy, Calendar, Flame, Target, Award, Users, Globe2, Crown, Sparkles, CheckCircle2 } from 'lucide-react';
import { UserStatsState } from '../../types/stats';
import { dailyChallengeService } from '../../services/dailyChallengeService';

interface LeaderboardViewProps {
  stats: UserStatsState;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ stats }) => {
  const [activeTab, setActiveTab] = useState<'history' | 'daily' | 'global'>('history');
  const streakState = dailyChallengeService.getStreakState();
  const dailyHistory = Object.values(streakState.history).sort((a, b) => b.dateStr.localeCompare(a.dateStr));

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Cabecera */}
      <div className="bg-[#18181B] border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-card-subtle flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-amber-500/15 border border-amber-500/30 rounded-xl text-amber-400 shrink-0">
            <Trophy className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400 bg-amber-950/60 px-2.5 py-0.5 rounded border border-amber-800/60 font-bold">
              Salón de la Fama & Récords
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-zinc-100 mt-1">
              Tabla de Clasificación
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
              Revisa tus mejores marcas, historial de desafíos y récords acumulados.
            </p>
          </div>
        </div>

        {/* Resumen en Vivo */}
        <div className="flex items-center gap-3">
          <div className="bg-[#121214] border border-zinc-800 px-4 py-2 rounded-xl text-center">
            <span className="text-[10px] uppercase font-mono text-zinc-500 font-bold block">Puntaje Total</span>
            <span className="text-lg font-mono font-bold text-emerald-400">{stats.totalScore.toLocaleString('es-ES')}</span>
          </div>
          <div className="bg-[#121214] border border-zinc-800 px-4 py-2 rounded-xl text-center">
            <span className="text-[10px] uppercase font-mono text-zinc-500 font-bold block">Mejor Racha</span>
            <span className="text-lg font-mono font-bold text-amber-400">{stats.bestStreak}</span>
          </div>
        </div>
      </div>

      {/* Selector de Pestañas Internas */}
      <div className="flex items-center bg-[#18181B] p-1.5 rounded-xl border border-zinc-800 gap-1">
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'history'
              ? 'bg-zinc-100 text-zinc-950 font-bold shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
          }`}
        >
          <Trophy className="w-4 h-4 text-amber-500" />
          <span>Últimas Partidas ({stats.gameHistory?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('daily')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'daily'
              ? 'bg-zinc-100 text-zinc-950 font-bold shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
          }`}
        >
          <Calendar className="w-4 h-4 text-indigo-400" />
          <span>Desafíos Diarios ({dailyHistory.length})</span>
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
          <span>Ranking Mundial</span>
        </button>
      </div>

      {/* CONTENIDO PESTAÑA 1: HISTORIAL DE PARTIDAS */}
      {activeTab === 'history' && (
        <div className="bg-[#18181B] border border-zinc-800 rounded-2xl p-5 shadow-card-subtle space-y-3">
          <h3 className="text-sm font-mono font-bold text-zinc-300 uppercase tracking-wider mb-2">
            Registro Reciente de Partidas
          </h3>

          {!stats.gameHistory || stats.gameHistory.length === 0 ? (
            <p className="text-xs text-zinc-500 py-8 text-center">
              Aún no has completado ninguna partida. ¡Juega una partida para registrar tus marcas!
            </p>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {stats.gameHistory.map((game, idx) => (
                <div
                  key={idx}
                  className="bg-[#121214] border border-zinc-800 p-3.5 rounded-xl flex items-center justify-between gap-4 flex-wrap"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center font-mono font-bold text-zinc-400 text-xs">
                      #{idx + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-200 capitalize">
                          {game.mode === 'click-find' ? 'Localiza en el Mapa' :
                           game.mode === 'flag-skip-chain' ? 'Adivina la Bandera' :
                           game.mode === 'input-write' ? 'Escribir Países' :
                           game.mode === 'trivia-curiosities' ? 'Trivia & Curiosidades' : game.mode}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded border border-zinc-700">
                          {game.continent === 'World' ? 'Mundo' : game.continent}
                        </span>
                      </div>
                      <span className="text-[11px] text-zinc-500 font-mono">
                        {new Date(game.playedAt).toLocaleDateString('es-ES')} · {game.durationSeconds}s
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 font-mono text-xs">
                    <div className="text-right">
                      <span className="text-emerald-400 font-bold block">{game.score} pts</span>
                      <span className="text-zinc-400 text-[10px]">{game.accuracy}% precisión</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CONTENIDO PESTAÑA 2: DESAFÍOS DIARIOS */}
      {activeTab === 'daily' && (
        <div className="bg-[#18181B] border border-zinc-800 rounded-2xl p-5 shadow-card-subtle space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-[#121214] border border-zinc-800 p-3 rounded-xl text-center">
              <span className="text-[10px] font-mono uppercase text-zinc-500 block">Racha Actual</span>
              <span className="text-xl font-mono font-bold text-amber-400">{streakState.currentStreak} días</span>
            </div>
            <div className="bg-[#121214] border border-zinc-800 p-3 rounded-xl text-center">
              <span className="text-[10px] font-mono uppercase text-zinc-500 block">Mejor Racha Diaria</span>
              <span className="text-xl font-mono font-bold text-indigo-400">{streakState.bestStreak} días</span>
            </div>
            <div className="bg-[#121214] border border-zinc-800 p-3 rounded-xl text-center col-span-2 sm:col-span-1">
              <span className="text-[10px] font-mono uppercase text-zinc-500 block">Completados</span>
              <span className="text-xl font-mono font-bold text-emerald-400">{dailyHistory.length}</span>
            </div>
          </div>

          <div className="space-y-2">
            {dailyHistory.map((d, idx) => (
              <div key={idx} className="bg-[#121214] border border-zinc-800 p-3 rounded-xl flex items-center justify-between font-mono text-xs">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  <span className="text-zinc-200 font-bold">Desafío #{d.dateStr}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-emerald-400">{d.score} pts</span>
                  <span className="text-zinc-400">({d.accuracy}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CONTENIDO PESTAÑA 3: RANKING MUNDIAL */}
      {activeTab === 'global' && (
        <div className="bg-[#18181B] border border-zinc-800 rounded-2xl p-6 shadow-card-subtle text-center space-y-4">
          <div className="inline-flex p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
            <Crown className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-serif font-bold text-zinc-100">
            Ranking Mundial en Vivo
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
            Tus récords se están guardando localmente en tu dispositivo. Muy pronto podrás iniciar sesión de forma 100% gratuita para aparecer en la tabla de clasificación mundial junto a tus amigos.
          </p>

          <div className="pt-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-950/40 border border-emerald-500/30 rounded-lg text-emerald-300 text-xs font-mono">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Tus récords locales están seguros</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
