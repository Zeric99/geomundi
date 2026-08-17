import React from 'react';
import { ContinentMastery } from '../../types/stats';
import { Award, ShieldCheck, TrendingUp, HelpCircle } from 'lucide-react';

interface MasteryRadarProps {
  masteryList: ContinentMastery[];
}

export const MasteryRadar: React.FC<MasteryRadarProps> = ({ masteryList }) => {
  const getLevelBadge = (level: ContinentMastery['level']) => {
    switch (level) {
      case 'Maestro':
        return { label: 'Maestro 👑', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      case 'Experto':
        return { label: 'Experto 🌟', bg: 'bg-purple-500/20 text-purple-300 border-purple-500/40' };
      case 'Avanzado':
        return { label: 'Avanzado ⚡', bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' };
      case 'Aprendiz':
        return { label: 'Aprendiz 🌱', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
      default:
        return { label: 'Novato', bg: 'bg-slate-800 text-slate-400 border-slate-700' };
    }
  };

  return (
    <div className="bg-[#131C2E]/90 backdrop-blur-md border border-slate-750 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-white text-base sm:text-lg">
              Dominio por Continente
            </h3>
            <p className="text-xs text-slate-400">
              Precisión de reconocimiento al primer intento desglosada por región
            </p>
          </div>
        </div>
      </div>

      {/* Grid de Barras Continentales */}
      <div className="space-y-4">
        {masteryList.map((m) => {
          const badge = getLevelBadge(m.level);
          const hasData = m.totalAttempts > 0;

          return (
            <div key={m.continent} className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold text-white text-sm">
                    {m.continentEs}
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${badge.bg}`}>
                    {badge.label}
                  </span>
                </div>

                <div className="text-right">
                  <span className={`text-sm font-black font-display ${
                    m.accuracyPercentage >= 80
                      ? 'text-emerald-400'
                      : m.accuracyPercentage >= 50
                      ? 'text-cyan-400'
                      : hasData
                      ? 'text-amber-400'
                      : 'text-slate-500'
                  }`}>
                    {hasData ? `${m.accuracyPercentage}%` : 'Sin datos'}
                  </span>
                  {hasData && (
                    <span className="text-[10px] text-slate-500 ml-1.5 font-normal">
                      ({m.playedCountries} países jugados)
                    </span>
                  )}
                </div>
              </div>

              {/* Barra de Progreso */}
              <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden border border-slate-700/40">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${
                    m.accuracyPercentage >= 80
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-glow-emerald'
                      : m.accuracyPercentage >= 50
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 shadow-glow-cyan'
                      : 'bg-gradient-to-r from-amber-500 to-orange-500'
                  }`}
                  style={{ width: `${m.accuracyPercentage}%` }}
                />
              </div>

              {/* Métricas secundarias */}
              {hasData && (
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                  <span>Intentos: <strong>{m.totalAttempts}</strong></span>
                  <span>Fallos: <strong className="text-rose-400">{m.totalMistakes}</strong></span>
                  <span>Dominados: <strong className="text-emerald-400">{m.masteredCountries}</strong></span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
