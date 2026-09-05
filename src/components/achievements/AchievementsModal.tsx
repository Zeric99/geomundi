import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Award, Lock, CheckCircle2, X, Sparkles } from 'lucide-react';
import { UserStatsState } from '../../types/stats';
import { achievementService } from '../../services/achievementService';
import { AchievementTier } from '../../types/achievements';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: UserStatsState;
}

const TIER_COLORS: Record<AchievementTier, { border: string; bg: string; text: string }> = {
  bronze: { border: 'border-amber-700/60', bg: 'bg-amber-950/30', text: 'text-amber-500' },
  silver: { border: 'border-slate-400/60', bg: 'bg-slate-900/40', text: 'text-slate-300' },
  gold: { border: 'border-yellow-500/60', bg: 'bg-yellow-950/30', text: 'text-yellow-400' },
  diamond: { border: 'border-cyan-400/60', bg: 'bg-cyan-950/30', text: 'text-cyan-300' }
};

export const AchievementsModal: React.FC<AchievementsModalProps> = ({ isOpen, onClose, stats }) => {
  if (!isOpen) return null;

  const achievementsProgress = achievementService.getAchievementsProgress(stats);
  const unlockedCount = achievementsProgress.filter(a => a.unlocked).length;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative z-10 w-full max-w-2xl bg-[#18181B] border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition border border-zinc-700"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Cabecera */}
          <div className="flex items-center gap-4 pr-10">
            <div className="p-3 bg-amber-500/15 border border-amber-500/30 rounded-xl text-amber-400">
              <Trophy className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
                Galería de Recompensas
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-zinc-100 mt-0.5">
                Logros y Medallas ({unlockedCount} / {achievementsProgress.length})
              </h2>
            </div>
          </div>

          {/* Grid de Logros */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {achievementsProgress.map(({ achievement: ach, unlocked, progressPercent, currentValue, targetValue }) => {
              const tierStyle = TIER_COLORS[ach.tier];

              return (
                <div
                  key={ach.id}
                  className={`p-4 rounded-xl border flex items-start gap-3.5 transition-all relative overflow-hidden ${
                    unlocked
                      ? `${tierStyle.bg} ${tierStyle.border} shadow-sm`
                      : 'bg-[#121214] border-zinc-800 opacity-60'
                  }`}
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 border ${
                    unlocked ? 'bg-zinc-900 border-zinc-700' : 'bg-zinc-900/60 border-zinc-800'
                  }`}>
                    {unlocked ? ach.icon : <Lock className="w-5 h-5 text-zinc-600" />}
                  </div>

                  <div className="flex-1 min-w-0 font-sans space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className={`text-xs sm:text-sm font-bold truncate ${unlocked ? 'text-zinc-100' : 'text-zinc-400'}`}>
                        {ach.title}
                      </h4>
                      {unlocked && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                    </div>

                    <p className="text-[11px] text-zinc-400 leading-tight">
                      {ach.description}
                    </p>

                    {/* Barra de Progreso si no está desbloqueado */}
                    {!unlocked && (
                      <div className="pt-1">
                        <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-zinc-500 mt-0.5 block">
                          {currentValue} / {targetValue} ({progressPercent}%)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
