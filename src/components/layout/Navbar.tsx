import React from 'react';
import { Globe2, Brain, Compass, Gamepad2, Volume2, VolumeX, Trophy, Flame } from 'lucide-react';
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
    <header className="sticky top-0 z-40 w-full bg-[#0B0F19]/90 backdrop-blur-xl border-b border-slate-800 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-4">
        {/* Logo & Marca */}
        <div
          onClick={() => onChangeTab('game')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="p-2.5 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 text-cyan-400 group-hover:shadow-glow-cyan transition-all">
            <Globe2 className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-black text-xl sm:text-2xl tracking-tight text-white">
                Geo<span className="text-cyan-400">Mundi</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
              Aprende geografía mundial interactiva
            </p>
          </div>
        </div>

        {/* Selector de Pestañas Principales */}
        <nav className="flex items-center bg-[#131C2E] p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => onChangeTab('game')}
            className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'game'
                ? 'bg-cyan-500 text-slate-950 shadow-glow-cyan font-extrabold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            <span>Jugar</span>
          </button>

          <button
            onClick={() => onChangeTab('explore')}
            className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'explore'
                ? 'bg-amber-500 text-slate-950 shadow-glow-amber font-extrabold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Explorar</span>
          </button>

          <button
            onClick={() => onChangeTab('tutor')}
            className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'tutor'
                ? 'bg-purple-600 text-white shadow-glow-purple font-extrabold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Brain className="w-4 h-4" />
            <span className="hidden sm:inline">Tutor IA</span>
            <span className="sm:hidden">Tutor</span>
          </button>
        </nav>

        {/* Puntuación y Sonido */}
        <div className="flex items-center gap-2 sm:gap-3">
          {totalScore > 0 && (
            <div className="hidden md:flex items-center gap-2 bg-[#131C2E] border border-slate-800 px-3 py-1.5 rounded-xl">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-display font-black text-emerald-400">
                {totalScore.toLocaleString('es-ES')} pts
              </span>
            </div>
          )}

          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Silenciar audio' : 'Activar efectos de sonido'}
            className="p-2.5 rounded-xl bg-[#131C2E] hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-slate-800 transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>
        </div>
      </div>
    </header>
  );
};
