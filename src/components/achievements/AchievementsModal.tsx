import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Award, Lock, CheckCircle2, X, Sparkles, Zap, BarChart3, Swords, Compass } from 'lucide-react';
import { UserStatsState } from '../../types/stats';
import { achievementService } from '../../services/achievementService';
import { AchievementCategory, AchievementTier } from '../../types/achievements';
import { dailyChallengeService } from '../../services/dailyChallengeService';
import { multiplayerService, MODE_ELO_CONFIGS } from '../../services/multiplayerService';
import { useAuth } from '../../contexts/AuthContext';
import { DuelMode } from '../../types/multiplayer';

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
  const { profile } = useAuth();
  const [modalTab, setModalTab] = useState<'stats' | 'achievements'>('stats');
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

  // Datos para pestaña de Estadísticas
  const modeStats = stats.modeStats || {};
  const streakState = dailyChallengeService.getStreakState();
  const playerProfile = multiplayerService.getPlayerProfile();

  const pinpointGames = (modeStats['city-pinpoint']?.gamesPlayed || 0) + (modeStats['pinpoint']?.gamesPlayed || 0);
  const flagGames = (modeStats['flag-skip-chain']?.gamesPlayed || 0) + (modeStats['flags']?.gamesPlayed || 0);
  const clickGames = (modeStats['click-find']?.gamesPlayed || 0) + (modeStats['click_find']?.gamesPlayed || 0);
  const typingGames = (modeStats['input-write']?.gamesPlayed || 0) + (modeStats['typing']?.gamesPlayed || 0);
  const triviaGames = (modeStats['trivia-curiosities']?.gamesPlayed || 0) + (modeStats['trivia']?.gamesPlayed || 0);
  const matchCardsGames = modeStats['match-cards']?.gamesPlayed || 0;
  const geekGames = modeStats['geek_mode']?.gamesPlayed || 0;

  const duelWins = profile?.wins ?? playerProfile.wins ?? 0;
  const duelLosses = profile?.losses ?? playerProfile.losses ?? 0;
  const totalDuels = profile?.total_duels ?? (playerProfile.wins + playerProfile.losses);
  const duelWinRate = totalDuels > 0 ? Math.round((duelWins / totalDuels) * 100) : 0;

  const playerElos: Record<DuelMode, number> = {
    pinpoint: profile?.elo_pinpoint ?? playerProfile.elos?.pinpoint ?? 1200,
    countries: profile?.elo_countries ?? playerProfile.elos?.countries ?? 1200,
    capitals: profile?.elo_capitals ?? playerProfile.elos?.capitals ?? 1200,
    flags: profile?.elo_flags ?? playerProfile.elos?.flags ?? 1200
  };

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
          className="relative z-10 w-full max-w-4xl bg-[#141416] border border-zinc-800 rounded-2xl p-5 sm:p-7 shadow-2xl space-y-4 max-h-[92vh] flex flex-col"
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition border border-zinc-700/60 z-20"
            title="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Cabecera & Selector de Pestaña Principal */}
          <div className="space-y-3 pr-10 shrink-0">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/15 border border-amber-500/30 rounded-xl text-amber-400">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Centro de Progresión
                  </span>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-zinc-100">
                    Logros y Estadísticas
                  </h2>
                </div>
              </div>

              {/* Botones de Pestaña Superior */}
              <div className="flex items-center bg-zinc-900 p-1 rounded-xl border border-zinc-800 gap-1">
                <button
                  onClick={() => setModalTab('stats')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    modalTab === 'stats'
                      ? 'bg-zinc-100 text-zinc-950 font-bold shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Estadísticas por Modo</span>
                </button>

                <button
                  onClick={() => setModalTab('achievements')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    modalTab === 'achievements'
                      ? 'bg-zinc-100 text-zinc-950 font-bold shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                  }`}
                >
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span>Logros ({unlockedCount}/{totalCount})</span>
                </button>
              </div>
            </div>

            {/* Barra de Progreso y XP (visible en ambas pestañas) */}
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold text-zinc-300">
                  <span>Progreso de Colección de Logros</span>
                  <span className="font-mono text-amber-400">{percentComplete}% ({unlockedCount}/{totalCount})</span>
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
                  XP Acumulada: <strong className="text-cyan-300 font-mono">+{earnedXp} XP</strong>
                </span>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* PESTAÑA 1: ESTADÍSTICAS POR MINIJUEGO */}
          {/* ========================================================= */}
          {modalTab === 'stats' && (
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {/* Resumen Global Rápido */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-zinc-900/60 border border-zinc-800/80 p-3 rounded-xl text-center">
                  <span className="text-[11px] text-zinc-400 block">Partidas Totales</span>
                  <span className="font-mono font-bold text-lg text-zinc-100">{stats.totalGamesPlayed}</span>
                </div>
                <div className="bg-zinc-900/60 border border-zinc-800/80 p-3 rounded-xl text-center">
                  <span className="text-[11px] text-zinc-400 block">Puntos Acumulados</span>
                  <span className="font-mono font-bold text-lg text-emerald-400">{stats.totalScore.toLocaleString('es-ES')}</span>
                </div>
                <div className="bg-zinc-900/60 border border-zinc-800/80 p-3 rounded-xl text-center">
                  <span className="text-[11px] text-zinc-400 block">Mejor Racha Global</span>
                  <span className="font-mono font-bold text-lg text-amber-400">{stats.bestStreak} 🔥</span>
                </div>
                <div className="bg-zinc-900/60 border border-zinc-800/80 p-3 rounded-xl text-center">
                  <span className="text-[11px] text-zinc-400 block">Países Practicados</span>
                  <span className="font-mono font-bold text-lg text-cyan-400">{Object.keys(stats.countries || {}).length}</span>
                </div>
              </div>

              {/* Minijuegos Individuales (Desglose) */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2.5 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Actividad y Rendimiento por Minijuego</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {/* 1. Puntería Geográfica */}
                  <div className="bg-zinc-900/50 border border-cyan-500/30 rounded-xl p-3.5 space-y-2 hover:border-cyan-500/60 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-xl">🎯</span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                        Puntería 3D
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-zinc-200">Puntería Geográfica</h4>
                      <p className="text-[11px] text-zinc-400">Localizar ciudades por coordenadas GPS</p>
                    </div>
                    <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs font-mono">
                      <span className="text-zinc-400">Partidas: <strong className="text-zinc-100">{pinpointGames}</strong></span>
                      <span className="text-cyan-400 font-bold">Récord: {modeStats['city-pinpoint']?.bestScore || 0} pts</span>
                    </div>
                  </div>

                  {/* 2. Banderas del Mundo */}
                  <div className="bg-zinc-900/50 border border-amber-500/30 rounded-xl p-3.5 space-y-2 hover:border-amber-500/60 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-xl">🚩</span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/60">
                        Vexilología
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-zinc-200">Banderas del Mundo</h4>
                      <p className="text-[11px] text-zinc-400">Cadena de banderas sin fallar</p>
                    </div>
                    <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs font-mono">
                      <span className="text-zinc-400">Partidas: <strong className="text-zinc-100">{flagGames}</strong></span>
                      <span className="text-amber-400 font-bold">Aciertos: {modeStats['flag-skip-chain']?.correctCount || 0}</span>
                    </div>
                  </div>

                  {/* 3. Localizar País (Clic Mapa) */}
                  <div className="bg-zinc-900/50 border border-indigo-500/30 rounded-xl p-3.5 space-y-2 hover:border-indigo-500/60 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-xl">🗺️</span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60">
                        Haz Clic
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-zinc-200">Localizar en el Mapa</h4>
                      <p className="text-[11px] text-zinc-400">Pulsa la frontera del país pedido</p>
                    </div>
                    <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs font-mono">
                      <span className="text-zinc-400">Partidas: <strong className="text-zinc-100">{clickGames}</strong></span>
                      <span className="text-indigo-400 font-bold">Récord: {modeStats['click-find']?.bestScore || 0} pts</span>
                    </div>
                  </div>

                  {/* 4. Escribir País */}
                  <div className="bg-zinc-900/50 border border-teal-500/30 rounded-xl p-3.5 space-y-2 hover:border-teal-500/60 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-xl">✍️</span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800/60">
                        Escritura
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-zinc-200">Escribir Nombre</h4>
                      <p className="text-[11px] text-zinc-400">Escribe el nombre con ortografía exacta</p>
                    </div>
                    <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs font-mono">
                      <span className="text-zinc-400">Partidas: <strong className="text-zinc-100">{typingGames}</strong></span>
                      <span className="text-teal-400 font-bold">Récord: {modeStats['input-write']?.bestScore || 0} pts</span>
                    </div>
                  </div>

                  {/* 5. Trivia y Curiosidades */}
                  <div className="bg-zinc-900/50 border border-purple-500/30 rounded-xl p-3.5 space-y-2 hover:border-purple-500/60 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-xl">💡</span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/60">
                        Curiosidades
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-zinc-200">Trivia Geográfica</h4>
                      <p className="text-[11px] text-zinc-400">Cultura, récords mundiales y naturaleza</p>
                    </div>
                    <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs font-mono">
                      <span className="text-zinc-400">Partidas: <strong className="text-zinc-100">{triviaGames}</strong></span>
                      <span className="text-purple-400 font-bold">Aciertos: {modeStats['trivia-curiosities']?.correctCount || 0}</span>
                    </div>
                  </div>

                  {/* 6. Modo Friki */}
                  <div className="bg-zinc-900/50 border border-pink-500/30 rounded-xl p-3.5 space-y-2 hover:border-pink-500/60 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-xl">🤓</span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-pink-950 text-pink-300 border border-pink-800/60">
                        Territorios
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-zinc-200">Modo Friki</h4>
                      <p className="text-[11px] text-zinc-400">Territorios autónomos e islas independientes</p>
                    </div>
                    <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs font-mono">
                      <span className="text-zinc-400">Partidas: <strong className="text-zinc-100">{geekGames}</strong></span>
                      <span className="text-pink-400 font-bold">Completadas</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Multijugador y Duelos 1v1 con los 4 ELOs */}
              <div className="bg-[#18181B] border border-zinc-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                    <Swords className="w-4 h-4 text-cyan-400" />
                    <span>Duelos Multijugador 1v1 & Calificaciones ELO</span>
                  </h3>
                  <span className="text-xs font-mono text-amber-400 font-bold">
                    {duelWins}V / {duelLosses}D ({duelWinRate}% winrate)
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {(Object.keys(MODE_ELO_CONFIGS) as DuelMode[]).map(modeKey => {
                    const cfg = MODE_ELO_CONFIGS[modeKey];
                    const modeElo = playerElos[modeKey];

                    return (
                      <div
                        key={modeKey}
                        className={`p-3 rounded-xl border ${cfg.borderClass} ${cfg.bgClass} flex flex-col justify-between`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-lg">{cfg.icon}</span>
                          <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${cfg.badgeClass}`}>
                            {modeKey.toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-[11px] text-zinc-400 truncate">{cfg.name}</p>
                          <p className={`text-lg font-mono font-bold ${cfg.textClass}`}>
                            {modeElo} Elo
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* PESTAÑA 2: GALERÍA DE LOGROS */}
          {/* ========================================================= */}
          {modalTab === 'achievements' && (
            <div className="flex-1 flex flex-col space-y-3 min-h-0">
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
                            : 'bg-[#121214] border-zinc-800/80 opacity-70'
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

                          {/* Barra de Progreso en Vivo */}
                          {!unlocked && targetValue > 1 && (
                            <div className="pt-1">
                              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                                  style={{ width: `${progressPercent}%` }}
                                />
                              </div>
                              <span className="text-[9px] font-mono text-zinc-400 mt-0.5 block">
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
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
