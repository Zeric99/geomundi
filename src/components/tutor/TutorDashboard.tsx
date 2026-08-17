import React from 'react';
import { Brain, Trophy, Flame, Target, BookOpen, RotateCcw, Zap, Sparkles } from 'lucide-react';
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
  const masteredCount = Object.values(stats.countries).filter(
    c => c.totalAttempts >= 2 && (c.firstTrySuccesses / c.totalAttempts) >= 0.75
  ).length;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header del Tutor IA */}
      <div className="bg-gradient-to-r from-[#1E2B48] via-[#131C2E] to-[#1E2B48] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/40 rounded-2xl text-purple-300 shadow-glow-purple flex-shrink-0">
              <Brain className="w-10 h-10 animate-float" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
                  Tutor Inteligente de Geografía
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-black text-white mt-1">
                Diagnóstico y Rendimiento
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                Análisis heurístico de memoria espacial, tasas de retención por continente y recomendaciones personalizadas.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => onStartFocusedPractice()}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-sm shadow-glow-amber transition-all transform active:scale-95 flex items-center gap-2"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>Práctica Focalizada</span>
            </button>

            <button
              onClick={() => {
                if (window.confirm('¿Deseas reiniciar todas tus estadísticas y progreso?')) {
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
              <span>Países Dominados</span>
            </div>
            <div className="text-xl sm:text-2xl font-display font-black text-purple-400">
              {masteredCount} <span className="text-xs text-slate-500 font-normal">/ {totalReviewed}</span>
            </div>
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
