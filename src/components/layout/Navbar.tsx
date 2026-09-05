import React from 'react';
import { Globe2, Brain, Compass, Gamepad2, Volume2, VolumeX, Trophy, Award, Coffee, Swords, User } from 'lucide-react';
import { useAudioFeedback } from '../../hooks/useAudioFeedback';

export type ActiveTab = 'game' | 'singleplayer' | 'multiplayer' | 'explore' | 'tutor' | 'leaderboard';

interface NavbarProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  totalScore: number;
  bestStreak: number;
  onOpenAchievements?: () => void;
  onOpenDonate?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onChangeTab,
  totalScore,
  bestStreak,
  onOpenAchievements,
  onOpenDonate
}) => {
  const { soundEnabled, toggleSound } = useAudioFeedback();
  const isSingle = activeTab === 'game' || activeTab === 'singleplayer';

  return (
    <header className="sticky top-0 z-40 w-full bg-[#121214]/95 backdrop-blur-md border-b border-zinc-800/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-3">
        {/* Logo & Marca */}
        <div
          onClick={() => onChangeTab('singleplayer')}
          className="flex items-center gap-3 cursor-pointer group shrink-0"
        >
          <div className="p-2 sm:p-2.5 rounded-xl bg-zinc-800/80 border border-zinc-700/60 text-indigo-400 group-hover:border-zinc-500 transition-all">
            <Globe2 className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold text-xl sm:text-2xl tracking-wide text-zinc-100">
                Map<span className="text-indigo-400">Tap</span>
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-sans">
              Geografía interactiva y repetición espaciada
            </p>
          </div>
        </div>

        {/* Selector de Pestañas Principales */}
        <nav className="flex items-center bg-[#18181B] p-1 rounded-xl border border-zinc-800 overflow-x-auto">
          {/* Pestaña Un Jugador */}
          <button
            onClick={() => onChangeTab('singleplayer')}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
              isSingle
                ? 'bg-zinc-100 text-zinc-950 shadow-sm font-bold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Un Jugador</span>
          </button>

          {/* Pestaña Multijugador */}
          <button
            onClick={() => onChangeTab('multiplayer')}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'multiplayer'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-zinc-950 shadow-sm font-bold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Swords className="w-4 h-4 text-amber-400" />
            <span>Multijugador ⚔️</span>
          </button>

          {/* Explorar */}
          <button
            onClick={() => onChangeTab('explore')}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'explore'
                ? 'bg-zinc-100 text-zinc-950 shadow-sm font-bold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span className="hidden sm:inline">Explorar</span>
          </button>

          {/* Tutor */}
          <button
            onClick={() => onChangeTab('tutor')}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'tutor'
                ? 'bg-indigo-600 text-white shadow-sm font-bold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Brain className="w-4 h-4" />
            <span>Tutor</span>
          </button>

          {/* Récords */}
          <button
            onClick={() => onChangeTab('leaderboard')}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'leaderboard'
                ? 'bg-amber-500 text-zinc-950 shadow-sm font-bold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="hidden md:inline">Récords</span>
          </button>
        </nav>

        {/* Logros, Donar y Sonido */}
        <div className="flex items-center gap-2">
          {onOpenAchievements && (
            <button
              onClick={onOpenAchievements}
              title="Ver Galería de Logros y Medallas"
              className="p-2 sm:p-2.5 rounded-xl bg-[#18181B] hover:bg-zinc-800 text-amber-400 border border-zinc-800 transition-colors flex items-center gap-1.5 text-xs font-bold"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span className="hidden lg:inline">Logros</span>
            </button>
          )}

          {onOpenDonate && (
            <button
              onClick={onOpenDonate}
              title="Apoya MapTap (Donar / Invitar a un café)"
              className="px-3 py-2 sm:py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition-all flex items-center gap-1.5 text-xs font-bold"
            >
              <Coffee className="w-4 h-4 text-amber-400" />
              <span className="hidden md:inline">Apoyar ☕</span>
            </button>
          )}

          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Silenciar audio' : 'Activar efectos de sonido'}
            className="p-2 sm:p-2.5 rounded-xl bg-[#18181B] hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-zinc-300" /> : <VolumeX className="w-4 h-4 text-zinc-500" />}
          </button>
        </div>
      </div>
    </header>
  );
};
