import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Award, Lock, CheckCircle2, X, Sparkles, Filter, Zap } from 'lucide-react';
import { UserStatsState } from '../../types/stats';
import { achievementService } from '../../services/achievementService';
import { AchievementCategory, AchievementTier } from '../../types/achievements';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: UserStatsState;
}

const TIER_COLORS: Record<AchievementTier, { border: string; bg: string; text: string; badge: string }> = {
  bronze: { border: 'border-amber-700/60', bg: 'bg-amber-950/20', text: 'text-amber-500', badge: 'bg-amber-900/40 text-amber-400' },
  silver: { border: 'border-slate-400/60', bg: 'bg-slate-900/30', text: 'text-slate-300', badge: 'bg-slate-800 text-slate-300' },
  gold: { border: 'border-yellow-500/60', bg: 'bg-yellow-950/25', text: 'text-yellow-400', badge: 'bg-yellow-900/40 text-yellow-300' },
  diamond: { border: 'border-cyan-400/60', bg: 'bg-cyan-950/30', text: 'text-cyan-300', badge: 'bg-cyan-900/40 text-cyan-300' }
};

const CATEGORIES: { key: 'all' | AchievementCategory; label: string; icon: string }[] = [
  { key: 'all', label: 'Todos', icon: '🌟' },
  { key: 'continents', label: 'Continentes', icon: '🌍' },
  { key: 'pinpoint', label: 'Puntería', icon: '🎯' },
  { key: 'flags', label: 'Banderas', icon: '🚩' },
  { key: 'typing', label: 'Escribir', icon: '✍️' },
  { key: 'trivia', label: 'Trivia', icon: '💡' },
  { key: 'click_find', label: 'Clic Mapa', icon: '🗺️' },
  { key: 'geek', label: 'Modo Friki', icon: '🧠' },
  { key: 'daily', label: 'Diario', icon: '📅' },
  { key: 'multiplayer', label: 'Duelos 1v1', icon: '⚔️' },
  { key: 'general', label: 'Generales', icon: '🏆' }
];

export const AchievementsModal: React.FC<AchievementsModalProps> = ({ isOpen, onClose, stats }) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | AchievementCategory>('all');

  if (!isOpen) return null;

  const achievementsProgress = achievementService.getAchievementsProgress(stats);
  const unlockedCount = achievementsProgress.filter(a => a.unlocked).length;
  const totalCount = achievementsProgress.length;
  const percentComplete = Math.round((unlockedCount / totalCount) * 100);

  // Total XP ganada de logros
  const earnedXp = achievementsProgress
    .filter(a => a.unlocked)
    .reduce((acc, a) => acc + (a.achievement.xpReward || 50), 0);

  const filtered = selectedCategory === 'all'
    ? achievementsProgress
    : achievementsProgress.filter(a => a.achievement.category === selectedCategory);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-zinc-950/85 backdrop-blur-md"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative z-10 w-full max-w-4xl bg-[#141416] border border-zinc-800 rounded-2xl p-5 sm:p-7 shadow-2xl space-y-5 max-h-[92vh] flex flex-col"
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition border border-zinc-700/60"
            title="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Cabecera & Barra Global de Progreso */}
          <div className="space-y-4 pr-10 shrink-0">
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-amber-500/15 border border-amber-500/30 rounded-xl text-amber-400">
                <Trophy className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Galería de Desafíos & Medallas
                </span>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-zinc-100">
                  Logros Desbloqueados ({unlockedCount} / {totalCount})
                </h2>
              </div>
            </div>

            {/* Barra de Progreso y XP */}
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-zinc-300">
                  <span>Progreso de Colección</span>
                  <span className="font-mono text-amber-400">{percentComplete}%</span>
                </div>
                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500"
                    style={{ width: `${percentComplete}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-zinc-300">
                  XP de Logros: <strong className="text-cyan-300 font-mono">+{earnedXp} XP</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Filtro por Categorías */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 shrink-0">
            {CATEGORIES.map(cat => {
              const countInCat = cat.key === 'all'
                ? totalCount
                : achievementsProgress.filter(a => a.achievement.category === cat.key).length;
              const unlockedInCat = cat.key === 'all'
                ? unlockedCount
                : achievementsProgress.filter(a => a.achievement.category === cat.key && a.unlocked).length;

              const isSelected = selectedCategory === cat.key;

              return (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 border shrink-0 ${
                    isSelected
                      ? 'bg-zinc-100 text-zinc-950 border-zinc-200 font-bold shadow-sm'
                      : 'bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:bg-zinc-800/60'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                  <span className={`text-[10px] font-mono ml-0.5 px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-zinc-900 text-zinc-100' : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {unlockedInCat}/{countInCat}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Grid de Logros (Scrollable) */}
          <div className="flex-1 overflow-y-auto pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2">
              {filtered.map(({ achievement: ach, unlocked, progressPercent, currentValue, targetValue }) => {
                const tierStyle = TIER_COLORS[ach.tier];

                return (
                  <div
                    key={ach.id}
                    className={`p-3.5 rounded-xl border flex items-start gap-3 transition-all relative overflow-hidden ${
                      unlocked
                        ? `${tierStyle.bg} ${tierStyle.border} shadow-sm`
                        : 'bg-[#121214] border-zinc-800/80 opacity-65'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 border ${
                      unlocked ? 'bg-zinc-900 border-zinc-700' : 'bg-zinc-900/60 border-zinc-800'
                    }`}>
                      {unlocked ? ach.icon : <Lock className="w-4 h-4 text-zinc-600" />}
                    </div>

                    <div className="flex-1 min-w-0 font-sans space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className={`text-xs sm:text-sm font-bold truncate ${unlocked ? 'text-zinc-100' : 'text-zinc-400'}`}>
                          {ach.title}
                        </h4>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${tierStyle.badge}`}>
                            +{ach.xpReward} XP
                          </span>
                          {unlocked && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                        </div>
                      </div>

                      <p className="text-[11px] text-zinc-400 leading-tight">
                        {ach.description}
                      </p>

                      {/* Barra de Progreso si no está desbloqueado */}
                      {!unlocked && targetValue > 1 && (
                        <div className="pt-1">
                          <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 rounded-full"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                          <span className="text-[9px] font-mono text-zinc-500 mt-0.5 block">
                            {currentValue} / {targetValue} ({progressPercent}%)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
