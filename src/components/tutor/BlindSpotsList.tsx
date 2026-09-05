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
    <div className="bg-[#18181B] border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-card-subtle space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-zinc-800 border border-zinc-700 text-amber-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-normal text-zinc-100 text-base sm:text-lg">
              Detección de Puntos Ciegos
            </h3>
            <p className="text-xs text-zinc-400 font-sans">
              Países donde sueles dudar o fallar recurrentemente
            </p>
          </div>
        </div>

        {blindSpots.length > 0 && (
          <button
            onClick={() => onStartFocusedPractice(blindSpots.map(b => b.cca3))}
            className="px-3.5 py-1.5 rounded-lg bg-amber-950/40 hover:bg-amber-900/50 border border-amber-800/60 text-amber-200 font-sans font-medium text-xs shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Practicar Todos ({blindSpots.length})</span>
          </button>
        )}
      </div>

      {blindSpots.length === 0 ? (
        <div className="text-center py-8 space-y-2 bg-[#121214] rounded-xl border border-zinc-800">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto opacity-90" />
          <h4 className="font-serif font-normal text-zinc-100 text-sm">
            ¡No tienes puntos ciegos críticos!
          </h4>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto font-sans">
            Sigue jugando para calibrar tu precisión y detectar automáticamente áreas de mejora.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {blindSpots.map((item) => (
            <div
              key={item.cca3}
              className="bg-[#121214] border border-zinc-800 hover:border-amber-800/60 rounded-xl p-3.5 flex items-center justify-between gap-3 transition-all"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <img
                  src={item.flagSvg}
                  alt={item.nameEs}
                  className="w-10 h-7 object-cover rounded shadow-sm border border-zinc-700 flex-shrink-0"
                />
                <div className="overflow-hidden">
                  <h4 className="font-serif font-normal text-zinc-100 text-sm truncate">
                    {item.nameEs}
                  </h4>
                  <div className="text-[11px] text-zinc-400 truncate font-sans">
                    Cap: <span className="text-zinc-300 font-medium">{item.capital}</span> • {item.continentEs}
                  </div>
                </div>
              </div>

              <div className="text-right flex flex-col items-end flex-shrink-0">
                <span className="text-xs font-mono text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-800/40">
                  {item.mistakes} fallos ({item.mistakeRate}%)
                </span>
                <button
                  onClick={() => onStartFocusedPractice([item.cca3])}
                  className="mt-1.5 text-[11px] font-sans font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 transition-colors"
                >
                  <span>Reforzar</span>
                  <ArrowRight className="w-3 h-3 text-indigo-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
