import React from 'react';
import { Calendar, Trophy, Zap, CheckCircle2, Flame, Share2, Sparkles, ArrowRight } from 'lucide-react';
import { dailyChallengeService } from '../../services/dailyChallengeService';

interface DailyChallengeCardProps {
  onStartDaily: () => void;
}

export const DailyChallengeCard: React.FC<DailyChallengeCardProps> = ({ onStartDaily }) => {
  const isCompleted = dailyChallengeService.isTodayCompleted();
  const streakState = dailyChallengeService.getStreakState();
  const todayDateStr = dailyChallengeService.getTodayDateString();
  const todayRecord = streakState.history[todayDateStr];

  return (
    <div className="bg-gradient-to-r from-indigo-950/80 via-[#18181B] to-purple-950/80 border border-indigo-500/40 rounded-2xl p-5 sm:p-6 shadow-lg relative overflow-hidden group">
      {/* Fondo con destello visual */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-indigo-600/20 border border-indigo-500/40 rounded-2xl text-indigo-400 shadow-sm shrink-0">
            <Calendar className="w-8 h-8" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono uppercase tracking-widest font-bold bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-md border border-indigo-500/30">
                Desafío Diario · #{todayDateStr}
              </span>

              {streakState.currentStreak > 0 && (
                <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-md border border-amber-500/30 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
                  Racha: {streakState.currentStreak} días
                </span>
              )}
            </div>

            <h3 className="text-xl sm:text-2xl font-serif font-bold text-zinc-100 mt-1">
              Desafío Mundial del Día
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 mt-0.5 max-w-lg font-sans">
              10 países aleatorios iguales para todo el mundo. ¡Pon a prueba tu geografía hoy!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isCompleted ? (
            <div className="flex items-center gap-3 bg-emerald-950/50 border border-emerald-500/40 px-4 py-2.5 rounded-xl">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <div>
                <span className="text-xs font-mono font-bold text-emerald-300 block">
                  ¡Completado Hoy!
                </span>
                <span className="text-[11px] text-zinc-400 font-mono">
                  Score: {todayRecord?.score || 0} pts ({todayRecord?.accuracy || 0}%)
                </span>
              </div>
            </div>
          ) : (
            <button
              onClick={onStartDaily}
              className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 active:scale-95 border border-indigo-500"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Jugar Desafío Diario</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
