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
      <div className="bg-gradient-to-r from-[#1E2B48] via-[#131C2E] to-[#1E2B48] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/40 rounded-2xl text-purple-300 shadow-glow-purple flex-shrink-0">
              <Layers className="w-10 h-10 animate-float" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
                  Sistema de Repetición Espaciada (SRS)
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-black text-white mt-1">
                Tutor de Repaso y Memorización
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                Los países que fallas o dudas vuelven a salir con alta frecuencia (Nivel 1), y a medida que los vas acertando se distancian cada vez más hasta fijarse en tu memoria a largo plazo.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => onStartFocusedPractice()}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-sm shadow-glow-amber transition-all transform active:scale-95 flex items-center gap-2"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>Iniciar Repaso Espaciado</span>
            </button>

            <button
              onClick={() => {
                if (window.confirm('¿Deseas reiniciar todas tus estadísticas y progreso de tarjetas?')) {
                  onResetStats();
                }
              }}
              title="Reiniciar estadísticas"
              className="p-3 rounded-xl bg-slate-850 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tarjetas de Estadísticas Globales */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-slate-700/60">
          <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-2xl text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 font-bold uppercase mb-1">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Puntaje Total</span>
            </div>
            <div className="text-xl sm:text-2xl font-display font-black text-emerald-400">
              {stats.totalScore.toLocaleString('es-ES')}
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-2xl text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 font-bold uppercase mb-1">
              <Flame className="w-4 h-4 text-orange-400" />
              <span>Mejor Racha</span>
            </div>
            <div className="text-xl sm:text-2xl font-display font-black text-orange-400">
              {stats.bestStreak} aciertos
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-2xl text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 font-bold uppercase mb-1">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>Partidas</span>
            </div>
            <div className="text-xl sm:text-2xl font-display font-black text-cyan-400">
              {stats.totalGamesPlayed}
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-2xl text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 font-bold uppercase mb-1">
              <Target className="w-4 h-4 text-purple-400" />
              <span>Memoria a Largo Plazo</span>
            </div>
            <div className="text-xl sm:text-2xl font-display font-black text-purple-400">
              {masteredCount} <span className="text-xs text-slate-500 font-normal">/ {totalReviewed}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mazo de Tarjetas por Niveles de Repetición Espaciada */}
      <div className="bg-[#131C2E]/90 backdrop-blur-md border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-700/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-white text-base sm:text-lg">
                Mazo de Tarjetas (Repetición Espaciada)
              </h3>
              <p className="text-xs text-slate-400">
                Estado de memorización de tus países según la frecuencia de repaso
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Nivel 1 */}
          <div className="p-4 bg-rose-950/20 border border-rose-500/40 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" /> Nivel 1: Inmediato
              </span>
              <span className="text-lg font-mono font-black text-rose-300">{srsLevels.level1}</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Fallos recientes o dudas. Aparecen en cada sesión de repaso hasta superarlos.
            </p>
          </div>

          {/* Nivel 2 */}
          <div className="p-4 bg-amber-950/20 border border-amber-500/40 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> Nivel 2: Consolidación
              </span>
              <span className="text-lg font-mono font-black text-amber-300">{srsLevels.level2}</span>
            </div>
            <p className="text-[11px] text-slate-300">
              En proceso de aprendizaje. Necesitan 1-2 aciertos seguidos para subir.
            </p>
          </div>

          {/* Nivel 3 */}
          <div className="p-4 bg-sky-950/20 border border-sky-500/40 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" /> Nivel 3: Repaso Medio
              </span>
              <span className="text-lg font-mono font-black text-sky-300">{srsLevels.level3}</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Memorizados recientemente. Se distancian las repeticiones periódicamente.
            </p>
          </div>

          {/* Nivel 4 */}
          <div className="p-4 bg-emerald-950/20 border border-emerald-500/40 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Nivel 4: Largo Plazo
              </span>
              <span className="text-lg font-mono font-black text-emerald-300">{srsLevels.level4}</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Fijados en tu memoria a largo plazo. Dominados con alto porcentaje de acierto.
            </p>
          </div>
        </div>
      </div>

      {/* Sección de Consejos y Diagnósticos del Tutor */}
      {smartAdvice.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
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
