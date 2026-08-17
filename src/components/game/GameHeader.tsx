import React from 'react';
import { Heart, Flame, Volume2, VolumeX, X, Trophy } from 'lucide-react';
import { useAudioFeedback } from '../../hooks/useAudioFeedback';

interface GameHeaderProps {
  currentIndex: number;
  totalQuestions: number;
  lives: number;
  score: number;
  streak: number;
  onQuit: () => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  currentIndex,
  totalQuestions,
  lives,
  score,
  streak,
  onQuit
}) => {
  const { soundEnabled, toggleSound } = useAudioFeedback();
  const progressPercent = totalQuestions > 0 ? ((currentIndex) / totalQuestions) * 100 : 0;
  const comboMultiplier = 1 + Math.min(streak * 0.2, 2.0);

  return (
    <div className="w-full bg-[#131C2E]/90 backdrop-blur-md border border-slate-750 rounded-2xl p-3 sm:p-4 shadow-xl mb-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        {/* Progreso de Preguntas */}
        <div className="flex items-center gap-3">
          <button
            onClick={onQuit}
            title="Salir de la partida"
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Progreso
            </div>
            <div className="text-sm sm:text-base font-display font-black text-cyan-300">
              {Math.min(currentIndex + 1, totalQuestions)} <span className="text-slate-500 text-xs font-normal">/ {totalQuestions}</span>
            </div>
          </div>
        </div>

        {/* Vidas / Corazones */}
        <div className="flex items-center gap-1.5 bg-[#0B0F19]/80 px-3 py-1.5 rounded-xl border border-slate-800">
          {[...Array(3)].map((_, i) => (
            <Heart
              key={i}
              className={`w-4 h-4 transition-all duration-300 ${
                i < lives
                  ? 'text-rose-500 fill-rose-500 scale-100 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]'
                  : 'text-slate-700 fill-slate-800 scale-90 opacity-40'
              }`}
            />
          ))}
        </div>

        {/* Racha & Multiplicador Combo */}
        {streak > 1 && (
          <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 px-3 py-1 rounded-xl text-amber-300 shadow-glow-amber animate-pulse">
            <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />
            <span className="text-xs font-black tracking-wide">
              {streak}x Combo ({comboMultiplier.toFixed(1)}x pts)
            </span>
          </div>
        )}

        {/* Puntuación */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-end gap-1">
              <Trophy className="w-3 h-3 text-amber-400" />
              Puntos
            </div>
            <div className="text-base sm:text-lg font-display font-black text-emerald-400">
              {score.toLocaleString('es-ES')}
            </div>
          </div>

          {/* Toggle de Sonido */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Silenciar sonidos' : 'Activar efectos de sonido'}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-slate-700 transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>
        </div>
      </div>

      {/* Barra de Progreso Continua */}
      <div className="w-full bg-slate-800/80 rounded-full h-2 mt-3 overflow-hidden border border-slate-700/50">
        <div
          className="bg-gradient-to-r from-cyan-500 via-sky-400 to-emerald-400 h-full rounded-full transition-all duration-500 ease-out shadow-glow-cyan"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};
