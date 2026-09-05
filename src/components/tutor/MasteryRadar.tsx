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
    <div className="bg-[#18181B] border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-card-subtle space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-zinc-800 border border-zinc-700 text-indigo-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-normal text-zinc-100 text-base sm:text-lg">
              Dominio por Continente
            </h3>
            <p className="text-xs text-zinc-400 font-sans">
              Precisión de reconocimiento al primer intento desglosada por región
            </p>
          </div>
        </div>
      </div>

      {/* Grid de Barras Continentales */}
      <div className="space-y-3.5">
        {masteryList.map((m) => {
          const badge = getLevelBadge(m.level);
          const hasData = m.totalAttempts > 0;

          return (
            <div key={m.continent} className="bg-[#121214] border border-zinc-800 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-serif font-normal text-zinc-100 text-sm">
                    {m.continentEs}
                  </span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${badge.bg}`}>
                    {badge.label}
                  </span>
                </div>

                <div className="text-right">
                  <span className={`text-sm font-mono ${
                    m.accuracyPercentage >= 80
                      ? 'text-emerald-400'
                      : m.accuracyPercentage >= 50
                      ? 'text-indigo-400'
                      : hasData
                      ? 'text-amber-400'
                      : 'text-zinc-500'
                  }`}>
                    {hasData ? `${m.accuracyPercentage}%` : 'Sin datos'}
                  </span>
                  {hasData && (
                    <span className="text-[10px] text-zinc-500 ml-1.5 font-sans">
                      ({m.playedCountries} países jugados)
                    </span>
                  )}
                </div>
              </div>

              {/* Barra de Progreso */}
              <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden border border-zinc-700/40">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${
                    m.accuracyPercentage >= 80
                      ? 'bg-emerald-500'
                      : m.accuracyPercentage >= 50
                      ? 'bg-indigo-500'
                      : 'bg-amber-500'
                  }`}
                  style={{ width: `${m.accuracyPercentage}%` }}
                />
              </div>

              {/* Métricas secundarias */}
              {hasData && (
                <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-0.5 font-sans">
                  <span>Intentos: <strong className="font-mono text-zinc-200">{m.totalAttempts}</strong></span>
                  <span>Fallos: <strong className="font-mono text-rose-400">{m.totalMistakes}</strong></span>
                  <span>Dominados: <strong className="font-mono text-emerald-400">{m.masteredCountries}</strong></span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
