import React from 'react';
import { AlertTriangle, Zap, CheckCircle2, ArrowRight } from 'lucide-react';
import { BlindSpotItem } from '../../types/stats';

interface BlindSpotsListProps {
  blindSpots: BlindSpotItem[];
  onStartFocusedPractice: (countryCodes?: string[]) => void;
}

export const BlindSpotsList: React.FC<BlindSpotsListProps> = ({
  blindSpots,
  onStartFocusedPractice
}) => {
  return (
    <div className="bg-[#131C2E]/90 backdrop-blur-md border border-slate-750 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-700/60 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-white text-base sm:text-lg">
              Detección de Puntos Ciegos
            </h3>
            <p className="text-xs text-slate-400">
              Países donde sueles dudar o fallar recurrentemente
            </p>
          </div>
        </div>

        {blindSpots.length > 0 && (
          <button
            onClick={() => onStartFocusedPractice(blindSpots.map(b => b.cca3))}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-glow-amber transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Zap className="w-3.5 h-3.5 fill-slate-950" />
            <span>Practicar Todos ({blindSpots.length})</span>
          </button>
        )}
      </div>

      {blindSpots.length === 0 ? (
        <div className="text-center py-8 space-y-2 bg-slate-900/40 rounded-xl border border-slate-800">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto opacity-90" />
          <h4 className="font-display font-bold text-white text-sm">
            ¡No tienes puntos ciegos críticos!
          </h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Sigue jugando para calibrar tu precisión y detectar automáticamente áreas de mejora.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {blindSpots.map((item) => (
            <div
              key={item.cca3}
              className="bg-slate-900/70 border border-slate-800 hover:border-amber-500/40 rounded-xl p-3.5 flex items-center justify-between gap-3 transition-all"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <img
                  src={item.flagSvg}
                  alt={item.nameEs}
                  className="w-10 h-7 object-cover rounded shadow border border-slate-700 flex-shrink-0"
                />
                <div className="overflow-hidden">
                  <h4 className="font-display font-bold text-white text-sm truncate">
                    {item.nameEs}
                  </h4>
                  <div className="text-[11px] text-slate-400 truncate">
                    Cap: <span className="text-slate-300 font-medium">{item.capital}</span> • {item.continentEs}
                  </div>
                </div>
              </div>

              <div className="text-right flex flex-col items-end flex-shrink-0">
                <span className="text-xs font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                  {item.mistakes} fallos ({item.mistakeRate}%)
                </span>
                <button
                  onClick={() => onStartFocusedPractice([item.cca3])}
                  className="mt-1.5 text-[11px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5 transition-colors"
                >
                  <span>Reforzar</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
