import React from 'react';
import { Globe2, Brain, Compass, Gamepad2, Volume2, VolumeX, Trophy } from 'lucide-react';
import { useAudioFeedback } from '../../hooks/useAudioFeedback';

export type ActiveTab = 'game' | 'explore' | 'tutor';

interface NavbarProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  totalScore: number;
  bestStreak: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onChangeTab,
  totalScore,
  bestStreak
}) => {
  const { soundEnabled, toggleSound } = useAudioFeedback();

  return (
    <header className="sticky top-0 z-40 w-full bg-[#121214]/95 backdrop-blur-md border-b border-zinc-800/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-4">
        {/* Logo & Marca Editorial */}
        <div
          onClick={() => onChangeTab('game')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="p-2 sm:p-2.5 rounded-xl bg-zinc-800/80 border border-zinc-700/60 text-indigo-400 group-hover:border-zinc-500 transition-all">
            <Globe2 className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif font-black text-xl sm:text-2xl tracking-tight text-zinc-100">
                Map<span className="text-indigo-400 italic">Tap</span>
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-medium hidden sm:block">
              Geografía interactiva y repetición espaciada
            </p>
          </div>
        </div>

        {/* Selector de Pestañas Principales */}
        <nav className="flex items-center bg-[#18181B] p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => onChangeTab('game')}
            className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'game'
                ? 'bg-zinc-100 text-zinc-950 shadow-sm font-bold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            <span>Jugar</span>
          </button>

          <button
            onClick={() => onChangeTab('explore')}
            className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'explore'
                ? 'bg-zinc-100 text-zinc-950 shadow-sm font-bold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Explorar</span>
          </button>

          <button
            onClick={() => onChangeTab('tutor')}
            className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'tutor'
                ? 'bg-indigo-600 text-white shadow-sm font-bold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Brain className="w-4 h-4" />
            <span>Tutor</span>
          </button>
        </nav>

        {/* Puntuación y Sonido */}
        <div className="flex items-center gap-2 sm:gap-3">
          {totalScore > 0 && (
            <div className="hidden md:flex items-center gap-2 bg-[#18181B] border border-zinc-800 px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-emerald-400">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>{totalScore.toLocaleString('es-ES')} pts</span>
            </div>
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
