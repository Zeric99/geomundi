import React from 'react';
import { Globe2, Brain, Compass, Gamepad2, Volume2, VolumeX, Trophy, Award, Coffee, Swords, User } from 'lucide-react';
import { useAudioFeedback } from '../../hooks/useAudioFeedback';
import { UserMenu } from '../auth/UserMenu';

export type ActiveTab = 'game' | 'singleplayer' | 'multiplayer' | 'explore' | 'tutor' | 'leaderboard';

interface NavbarProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  totalScore: number;
  bestStreak: number;
  onOpenAchievements?: () => void;
  onOpenDonate?: () => void;
  onOpenLeaderboard?: () => void;
  onOpenProfile?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onChangeTab,
  totalScore,
  bestStreak,
  onOpenAchievements,
  onOpenDonate,
  onOpenLeaderboard,
  onOpenProfile
}) => {
  const { soundEnabled, toggleSound } = useAudioFeedback();
  const isSingle = activeTab === 'game' || activeTab === 'singleplayer';

  return (
    <header className="sticky top-0 z-40 w-full bg-black border-b border-zinc-800 shadow-md">
      <div className="w-full px-3 sm:px-6 lg:px-8 xl:px-10 h-16 sm:h-20 flex items-center justify-between gap-3 lg:gap-6">
        {/* Logo & Marca */}
        <div
          onClick={() => onChangeTab('singleplayer')}
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group shrink-0"
        >
          <div className="p-2 sm:p-2.5 rounded-xl bg-zinc-800/80 border border-zinc-700/60 text-indigo-400 group-hover:border-zinc-500 transition-all">
            <Globe2 className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold text-lg sm:text-xl md:text-2xl tracking-wide text-zinc-100">
                Geo<span className="text-cyan-400">Strike</span>
              </span>
            </div>
            <p className="hidden md:block text-[11px] text-zinc-400 font-sans leading-tight">
              Geografía interactiva
            </p>
          </div>
        </div>

        {/* Selector de Pestañas Principales (Espacioso y sin slider incómodo) */}
        <nav className="flex items-center bg-[#18181B] p-1 sm:p-1.5 rounded-xl border border-zinc-800 overflow-x-auto no-scrollbar shrink-0 shadow-inner">
          {/* Pestaña Un Jugador */}
          <button
            onClick={() => onChangeTab('singleplayer')}
            className={`px-2.5 sm:px-3.5 lg:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
              isSingle
                ? 'bg-zinc-100 text-zinc-950 shadow-sm font-bold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <User className="w-4 h-4 shrink-0" />
            <span>Un Jugador</span>
          </button>

          {/* Pestaña Multijugador */}
          <button
            onClick={() => onChangeTab('multiplayer')}
            className={`px-2.5 sm:px-3.5 lg:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
              activeTab === 'multiplayer'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-zinc-950 shadow-sm font-bold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Swords className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Multijugador</span>
          </button>

          {/* Explorar */}
          <button
            onClick={() => onChangeTab('explore')}
            className={`px-2.5 sm:px-3.5 lg:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
              activeTab === 'explore'
                ? 'bg-zinc-100 text-zinc-950 shadow-sm font-bold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Compass className="w-4 h-4 shrink-0" />
            <span>Explorar</span>
          </button>

          {/* Tutor */}
          <button
            onClick={() => onChangeTab('tutor')}
            className={`px-2.5 sm:px-3.5 lg:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
              activeTab === 'tutor'
                ? 'bg-indigo-600 text-white shadow-sm font-bold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Brain className="w-4 h-4 shrink-0" />
            <span>Tutor</span>
          </button>

          {/* Récords */}
          <button
            onClick={() => onChangeTab('leaderboard')}
            className={`px-2.5 sm:px-3.5 lg:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
              activeTab === 'leaderboard'
                ? 'bg-amber-500 text-zinc-950 shadow-sm font-bold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Récords</span>
          </button>
        </nav>

        {/* Logros, Donar, Sonido y Cuenta */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {onOpenAchievements && (
            <button
              onClick={onOpenAchievements}
              title="Ver Galería de Logros y Medallas"
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-[#18181B] hover:bg-zinc-800 text-amber-400 border border-zinc-800 transition-colors flex items-center gap-1.5 text-xs font-bold shrink-0"
            >
              <Award className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="hidden xl:inline">Logros</span>
            </button>
          )}

          {onOpenDonate && (
            <button
              onClick={onOpenDonate}
              title="Apoya MapTap (Donar / Invitar a un café)"
              className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition-all flex items-center gap-1.5 text-xs font-bold shrink-0"
            >
              <Coffee className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="hidden lg:inline">Apoyar ☕</span>
            </button>
          )}

          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Silenciar audio' : 'Activar efectos de sonido'}
            className="p-2 sm:p-2.5 rounded-xl bg-[#18181B] hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition-colors shrink-0"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-zinc-300" /> : <VolumeX className="w-4 h-4 text-zinc-500" />}
          </button>

          {/* Menú de Usuario y Google Auth */}
          <UserMenu onOpenLeaderboard={onOpenLeaderboard} onOpenProfile={onOpenProfile} />
        </div>
      </div>
    </header>
  );
};
