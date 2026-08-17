import React from 'react';
import { Trophy, RotateCcw, Sparkles, Brain, CheckCircle2, XCircle, Flame, ArrowRight, Home, X } from 'lucide-react';
import { GameSummary } from '../../types/game';

interface GameOverModalProps {
  summary: GameSummary;
  onPlayAgain: () => void;
  onGoToTutor: () => void;
  onReturnToMenu?: () => void;
  onPracticeMistakes?: (mistakeCodes: string[]) => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  summary,
  onPlayAgain,
  onGoToTutor,
  onReturnToMenu,
  onPracticeMistakes
}) => {
  const isPerfect = summary.accuracy === 100;
  const isGood = summary.accuracy >= 70;

  const mistakes = summary.results.filter(r => !r.userSuccess || !r.firstTry);
  const mistakeCodes = mistakes.map(m => m.question.country.cca3);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#131C2E] border border-cyan-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Glow de fondo */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Botón de cierre directo al menú */}
        {onReturnToMenu && (
          <button
            onClick={onReturnToMenu}
            className="absolute top-5 right-5 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all border border-slate-700 active:scale-95"
            title="Volver al Menú Principal"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Encabezado con Icono */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-400 shadow-glow-amber mb-2">
            <Trophy className="w-10 h-10" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-black text-white">
            {isPerfect ? '¡Desempeño Perfecto!' : isGood ? '¡Excelente Partida!' : '¡Buen Intento!'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Resumen de tu desempeño en {summary.continent === 'World' ? 'el Mundo' : summary.continent}
          </p>
        </div>

        {/* Métricas Principales */}
        <div className="grid grid-cols-3 gap-3 my-6">
          <div className="bg-slate-900/70 border border-slate-800 p-3 rounded-2xl text-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Puntos
            </span>
            <span className="text-lg sm:text-xl font-display font-black text-emerald-400">
              {summary.score.toLocaleString('es-ES')}
            </span>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 p-3 rounded-2xl text-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Precisión
            </span>
            <span className={`text-lg sm:text-xl font-display font-black ${
              isGood ? 'text-cyan-400' : 'text-amber-400'
            }`}>
              {summary.accuracy}%
            </span>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 p-3 rounded-2xl text-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Mejor Racha
            </span>
            <span className="text-lg sm:text-xl font-display font-black text-orange-400 flex items-center justify-center gap-1">
              <Flame className="w-4 h-4" />
              {summary.maxStreak}
            </span>
          </div>
        </div>

        {/* Desglose de Respuestas */}
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 mb-6 max-h-40 overflow-y-auto space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Revisión de Países:</span>
            <span>{summary.firstTryCount}/{summary.totalQuestions} al primer intento</span>
          </div>
          {summary.results.map((r, i) => (
            <div key={i} className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-950/40">
              <div className="flex items-center gap-2">
                <img
                  src={r.question.country.flagSvg}
                  alt={r.question.country.nameEs}
                  className="w-5 h-3.5 object-cover rounded shadow"
                />
                <span className="font-semibold text-slate-200">{r.question.country.nameEs}</span>
              </div>
              <div>
                {r.firstTry ? (
                  <span className="text-emerald-400 flex items-center gap-1 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> +{r.pointsEarned}
                  </span>
                ) : r.userSuccess ? (
                  <span className="text-amber-400 flex items-center gap-1 font-bold">
                    💡 2do intento (+{r.pointsEarned})
                  </span>
                ) : (
                  <span className="text-rose-400 flex items-center gap-1 font-bold">
                    <XCircle className="w-3.5 h-3.5" /> Fallado
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Botones de Acción */}
        <div className="space-y-2.5">
          <div className="flex gap-2.5">
            <button
              onClick={onPlayAgain}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 font-display font-extrabold text-sm shadow-glow-cyan transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Jugar de Nuevo</span>
            </button>

            {mistakes.length > 0 && onPracticeMistakes && (
              <button
                onClick={() => onPracticeMistakes(mistakeCodes)}
                className="py-3 px-4 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs transition-all flex items-center gap-1.5 active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>Repasar Fallos ({mistakes.length})</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {onReturnToMenu && (
              <button
                onClick={onReturnToMenu}
                className="py-2.5 px-3 rounded-xl bg-slate-800/90 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm"
              >
                <Home className="w-4 h-4 text-cyan-400" />
                <span>Menú Principal</span>
              </button>
            )}

            <button
              onClick={onGoToTutor}
              className={`py-2.5 px-3 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 text-purple-200 hover:text-purple-100 border border-purple-800/60 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                !onReturnToMenu ? 'sm:col-span-2' : ''
              }`}
            >
              <Brain className="w-3.5 h-3.5 text-purple-400" />
              <span>Tutor IA</span>
              <ArrowRight className="w-3 h-3 text-purple-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
