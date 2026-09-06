import React, { useState } from 'react';
import { Trophy, RotateCcw, Sparkles, Brain, CheckCircle2, XCircle, Flame, ArrowRight, Home, X, Share2, Swords, Copy, Check } from 'lucide-react';
import { GameSummary } from '../../types/game';
import { challengeService } from '../../services/challengeService';
import { dailyChallengeService } from '../../services/dailyChallengeService';

interface GameOverModalProps {
  summary: GameSummary;
  onPlayAgain: () => void;
  onGoToTutor: () => void;
  onReturnToMenu?: () => void;
  onPracticeMistakes?: (mistakeCodes: string[]) => void;
  isDailyChallenge?: boolean;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  summary,
  onPlayAgain,
  onGoToTutor,
  onReturnToMenu,
  onPracticeMistakes,
  isDailyChallenge = false
}) => {
  const [copiedState, setCopiedState] = useState<'challenge' | 'share' | null>(null);

  const isPerfect = summary.accuracy === 100;
  const isGood = summary.accuracy >= 70;

  const mistakes = summary.results.filter(r => !r.userSuccess || !r.firstTry);
  const mistakeCodes = mistakes.map(m => m.question.country.cca3);

  // Compartir resultado por WhatsApp/Texto
  const handleShareResult = () => {
    let snippet = '';
    if (isDailyChallenge) {
      snippet = dailyChallengeService.generateShareSnippet(summary.score, summary.accuracy, summary.results);
    } else {
      const blocks = summary.results.map(r => r.firstTry ? '🟩' : (r.userSuccess ? '🟨' : '🟥')).join('');
      snippet = `🌍 Partida de GeoStrike (${summary.continent === 'World' ? 'Mundo' : summary.continent})
🎯 Precisión: ${summary.accuracy}% | 🏆 Puntos: ${summary.score} pts
${blocks}

¡Juega gratis en GeoStrike! 🗺️✨`;
    }

    try {
      navigator.clipboard.writeText(snippet);
      setCopiedState('share');
      setTimeout(() => setCopiedState(null), 2500);
    } catch (e) {}
  };

  // Crear y copiar enlace de reto a un amigo
  const handleCreateChallenge = () => {
    const countryCodes = summary.results.map(r => r.question.country.cca3);
    const code = challengeService.encodeChallenge({
      creatorName: 'Tu Amigo',
      creatorScore: summary.score,
      creatorAccuracy: summary.accuracy,
      mode: summary.mode,
      continent: summary.continent,
      questionType: summary.results[0]?.question.questionType || 'name',
      countryCodes
    });

    const url = challengeService.generateChallengeUrl(code);
    const text = challengeService.generateShareSnippet('Tu Amigo', summary.score, url);

    try {
      navigator.clipboard.writeText(text);
      setCopiedState('challenge');
      setTimeout(() => setCopiedState(null), 2500);
    } catch (e) {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#18181B] border border-zinc-800 rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200 space-y-5">
        {/* Botón de cierre directo al menú */}
        {onReturnToMenu && (
          <button
            onClick={onReturnToMenu}
            className="absolute top-5 right-5 p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all border border-zinc-700 active:scale-95"
            title="Volver al Menú Principal"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Encabezado con Icono */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-400 shadow-sm mb-1">
            <Trophy className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-normal text-zinc-100">
            {isPerfect ? '¡Desempeño Perfecto!' : isGood ? '¡Excelente Partida!' : '¡Buen Intento!'}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 font-sans">
            Resumen de tu desempeño en {summary.continent === 'World' ? 'el Mundo' : summary.continent}
          </p>
        </div>

        {/* Métricas Principales */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[#121214] border border-zinc-800/80 p-3 rounded-xl text-center">
            <span className="text-[10px] font-mono font-medium text-zinc-500 uppercase tracking-wider block">
              Puntos
            </span>
            <span className="text-lg sm:text-xl font-mono text-emerald-400">
              {summary.score.toLocaleString('es-ES')}
            </span>
          </div>

          <div className="bg-[#121214] border border-zinc-800/80 p-3 rounded-xl text-center">
            <span className="text-[10px] font-mono font-medium text-zinc-500 uppercase tracking-wider block">
              Precisión
            </span>
            <span className={`text-lg sm:text-xl font-mono ${
              isGood ? 'text-indigo-400' : 'text-amber-400'
            }`}>
              {summary.accuracy}%
            </span>
          </div>

          <div className="bg-[#121214] border border-zinc-800/80 p-3 rounded-xl text-center">
            <span className="text-[10px] font-mono font-medium text-zinc-500 uppercase tracking-wider block">
              Mejor Racha
            </span>
            <span className="text-lg sm:text-xl font-mono text-amber-400 flex items-center justify-center gap-1">
              <Flame className="w-4 h-4 text-amber-400" />
              {summary.maxStreak}
            </span>
          </div>
        </div>

        {/* Desglose de Respuestas */}
        <div className="bg-[#121214] border border-zinc-800 rounded-xl p-3.5 max-h-36 overflow-y-auto space-y-2">
          <div className="text-xs font-mono font-medium text-zinc-400 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Revisión de Países:</span>
            <span>{summary.firstTryCount}/{summary.totalQuestions} al primer intento</span>
          </div>
          {summary.results.map((r, i) => (
            <div key={i} className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/50">
              <div className="flex items-center gap-2">
                <img
                  src={r.question.country.flagSvg}
                  alt={r.question.country.nameEs}
                  className="w-5 h-3.5 object-cover rounded shadow-sm"
                />
                <span className="font-sans font-medium text-zinc-200">{r.question.country.nameEs}</span>
              </div>
              <div>
                {r.firstTry ? (
                  <span className="text-emerald-400 flex items-center gap-1 font-mono text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" /> +{r.pointsEarned}
                  </span>
                ) : r.userSuccess ? (
                  <span className="text-amber-400 flex items-center gap-1 font-mono text-[11px]">
                    💡 2do intento (+{r.pointsEarned})
                  </span>
                ) : (
                  <span className="text-rose-400 flex items-center gap-1 font-mono text-[11px]">
                    <XCircle className="w-3.5 h-3.5" /> Fallado
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Botones Sociales / Retar a Amigo / Compartir */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleCreateChallenge}
            className="py-2.5 px-3 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-500/40 text-indigo-200 font-sans font-bold text-xs transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm"
          >
            {copiedState === 'challenge' ? <Check className="w-4 h-4 text-emerald-400" /> : <Swords className="w-4 h-4 text-indigo-400" />}
            <span>{copiedState === 'challenge' ? '¡Reto Copiado!' : 'Retar a un Amigo ⚔️'}</span>
          </button>

          <button
            onClick={handleShareResult}
            className="py-2.5 px-3 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-200 font-sans font-bold text-xs transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm"
          >
            {copiedState === 'share' ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-emerald-400" />}
            <span>{copiedState === 'share' ? '¡Resultado Copiado!' : 'Compartir Emojis 📲'}</span>
          </button>
        </div>

        {/* Botones de Acción */}
        <div className="space-y-2 pt-1 border-t border-zinc-800">
          <div className="flex gap-2.5">
            <button
              onClick={onPlayAgain}
              className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-sans font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Jugar de Nuevo</span>
            </button>

            {mistakes.length > 0 && onPracticeMistakes && (
              <button
                onClick={() => onPracticeMistakes(mistakeCodes)}
                className="py-2.5 px-3.5 rounded-xl bg-amber-950/40 hover:bg-amber-900/50 border border-amber-800/60 text-amber-200 font-sans font-bold text-xs transition-all flex items-center gap-1.5 active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Repasar Fallos ({mistakes.length})</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {onReturnToMenu && (
              <button
                onClick={onReturnToMenu}
                className="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-zinc-700 text-xs font-sans font-medium transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm"
              >
                <Home className="w-4 h-4 text-zinc-400" />
                <span>Menú Principal</span>
              </button>
            )}

            <button
              onClick={onGoToTutor}
              className={`py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-indigo-300 hover:text-indigo-200 border border-zinc-700 text-xs font-sans font-medium transition-all flex items-center justify-center gap-1.5 ${
                !onReturnToMenu ? 'sm:col-span-2' : ''
              }`}
            >
              <Brain className="w-3.5 h-3.5 text-indigo-400" />
              <span>Tutor de Repaso</span>
              <ArrowRight className="w-3 h-3 text-indigo-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
