import React, { useMemo } from 'react';
import { Brain, Trophy, Flame, Target, BookOpen, RotateCcw, Zap, Sparkles, Layers, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { BlindSpotItem, ContinentMastery, TutorAdvice, UserStatsState } from '../../types/stats';
import { MasteryRadar } from './MasteryRadar';
import { BlindSpotsList } from './BlindSpotsList';
import { SmartAdviceCard } from './SmartAdviceCard';
import { Country } from '../../types/country';

interface TutorDashboardProps {
  stats: UserStatsState;
  continentalMastery: ContinentMastery[];
  blindSpots: BlindSpotItem[];
  smartAdvice: TutorAdvice[];
  onStartFocusedPractice: (countryCodes?: string[]) => void;
  onAdviceAction: (advice: TutorAdvice) => void;
  onResetStats: () => void;
}

export const TutorDashboard: React.FC<TutorDashboardProps> = ({
  stats,
  continentalMastery,
  blindSpots,
  smartAdvice,
  onStartFocusedPractice,
  onAdviceAction,
  onResetStats
}) => {
  const totalReviewed = Object.keys(stats.countries).length;
  
  // Clasificación de Países por Niveles de Repetición Espaciada (SRS)
  const srsLevels = useMemo(() => {
    let level1 = 0; // Repaso Inmediato (Fallos o 1er intento fallado)
    let level2 = 0; // En Consolidación (50-74% aciertos)
    let level3 = 0; // Repaso Medio (75-89% aciertos)
    let level4 = 0; // Largo Plazo / Dominados (>=90% aciertos)

    for (const perf of Object.values(stats.countries)) {
      if (!perf || perf.totalAttempts === 0) continue;
      const rate = perf.firstTrySuccesses / perf.totalAttempts;
      if (perf.mistakes >= 2 || rate < 0.5) {
        level1++;
      } else if (rate < 0.75) {
        level2++;
      } else if (rate < 0.9) {
        level3++;
      } else {
        level4++;
      }
    }

    return { level1, level2, level3, level4 };
  }, [stats.countries]);

  const masteredCount = srsLevels.level4;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header del Tutor de Repaso Espaciado */}
      <div className="bg-[#18181B] border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-card-subtle relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-zinc-800 border border-zinc-700 rounded-xl text-indigo-400 shadow-sm flex-shrink-0">
              <Layers className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-indigo-300 uppercase tracking-widest bg-indigo-950/60 px-2.5 py-0.5 rounded border border-indigo-800/60">
                  Sistema de Repetición Espaciada (SRS)
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-normal text-zinc-100 mt-1">
                Tutor de Repaso y Memorización
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl font-sans">
                Los países que fallas o dudas vuelven a salir con alta frecuencia (Nivel 1), y a medida que los vas acertando se distancian cada vez más hasta fijarse en tu memoria a largo plazo.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => onStartFocusedPractice()}
              className="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-sans font-medium text-sm shadow-sm transition-all transform active:scale-95 flex items-center gap-2"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>Iniciar Repaso Espaciado</span>
            </button>

            <button
              onClick={() => {
                if (window.confirm('¿Deseas reiniciar todas tus estadísticas y progreso de tarjetas?')) {
                  onResetStats();
                }
              }}
              title="Reiniciar estadísticas"
              className="p-2.5 rounded-lg bg-zinc-800 hover:bg-rose-950/40 text-zinc-400 hover:text-rose-400 border border-zinc-700 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tarjetas de Estadísticas Globales */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-zinc-800">
          <div className="bg-[#121214] border border-zinc-800 p-3.5 rounded-xl text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-400 font-mono uppercase mb-1">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Puntaje Total</span>
            </div>
            <div className="text-xl sm:text-2xl font-mono text-emerald-400">
              {stats.totalScore.toLocaleString('es-ES')}
            </div>
          </div>

          <div className="bg-[#121214] border border-zinc-800 p-3.5 rounded-xl text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-400 font-mono uppercase mb-1">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Mejor Racha</span>
            </div>
            <div className="text-xl sm:text-2xl font-mono text-amber-400">
              {stats.bestStreak} aciertos
            </div>
          </div>

          <div className="bg-[#121214] border border-zinc-800 p-3.5 rounded-xl text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-400 font-mono uppercase mb-1">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>Partidas</span>
            </div>
            <div className="text-xl sm:text-2xl font-mono text-indigo-400">
              {stats.totalGamesPlayed}
            </div>
          </div>

          <div className="bg-[#121214] border border-zinc-800 p-3.5 rounded-xl text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-400 font-mono uppercase mb-1">
              <Target className="w-4 h-4 text-purple-400" />
              <span>Memoria Largo Plazo</span>
            </div>
            <div className="text-xl sm:text-2xl font-mono text-purple-400">
              {masteredCount} <span className="text-xs text-zinc-500 font-sans">/ {totalReviewed}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mazo de Tarjetas por Niveles de Repetición Espaciada */}
      <div className="bg-[#18181B] border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-card-subtle space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-zinc-800 border border-zinc-700 text-indigo-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-normal text-zinc-100 text-base sm:text-lg">
                Mazo de Tarjetas (Repetición Espaciada)
              </h3>
              <p className="text-xs text-zinc-400 font-sans">
                Estado de memorización de tus países según la frecuencia de repaso
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Nivel 1 */}
          <div className="p-4 bg-[#121214] border border-rose-900/50 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-medium text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" /> Nivel 1: Inmediato
              </span>
              <span className="text-lg font-mono text-rose-300">{srsLevels.level1}</span>
            </div>
            <p className="text-[11px] text-zinc-400 font-sans">
              Fallos recientes o dudas. Aparecen en cada sesión de repaso hasta superarlos.
            </p>
          </div>

          {/* Nivel 2 */}
          <div className="p-4 bg-[#121214] border border-amber-900/50 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-medium text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> Nivel 2: Consolidación
              </span>
              <span className="text-lg font-mono text-amber-300">{srsLevels.level2}</span>
            </div>
            <p className="text-[11px] text-zinc-400 font-sans">
              En proceso de aprendizaje. Necesitan 1-2 aciertos seguidos para subir.
            </p>
          </div>

          {/* Nivel 3 */}
          <div className="p-4 bg-[#121214] border border-indigo-900/50 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-medium text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" /> Nivel 3: Repaso Medio
              </span>
              <span className="text-lg font-mono text-indigo-300">{srsLevels.level3}</span>
            </div>
            <p className="text-[11px] text-zinc-400 font-sans">
              Memorizados recientemente. Se distancian las repeticiones periódicamente.
            </p>
          </div>

          {/* Nivel 4 */}
          <div className="p-4 bg-[#121214] border border-emerald-900/50 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-medium text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Nivel 4: Largo Plazo
              </span>
              <span className="text-lg font-mono text-emerald-300">{srsLevels.level4}</span>
            </div>
            <p className="text-[11px] text-zinc-400 font-sans">
              Fijados en tu memoria a largo plazo. Dominados con alto porcentaje de acierto.
            </p>
          </div>
        </div>
      </div>

      {/* Sección de Consejos y Diagnósticos del Tutor */}
      {smartAdvice.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-mono font-medium uppercase tracking-wider text-zinc-400">
              Recomendaciones del Tutor
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {smartAdvice.map((advice) => (
              <SmartAdviceCard
                key={advice.id}
                advice={advice}
                onActionClick={onAdviceAction}
              />
            ))}
          </div>
        </div>
      )}

      {/* Dominio Continental y Puntos Ciegos en 2 Columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MasteryRadar masteryList={continentalMastery} />
        <BlindSpotsList
          blindSpots={blindSpots}
          onStartFocusedPractice={onStartFocusedPractice}
        />
      </div>
    </div>
  );
};
