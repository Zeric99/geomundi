import React from 'react';
import { Country, CountryMapStatus } from '../../types/country';

interface MapTooltipProps {
  country: Country | null;
  position: { x: number; y: number } | null;
  status?: CountryMapStatus;
}

export const MapTooltip: React.FC<MapTooltipProps> = ({ country, position, status }) => {
  if (!country || !position) return null;

  return (
    <div
      className="fixed pointer-events-none z-50 transform -translate-x-1/2 -translate-y-full mb-3 transition-all duration-75"
      style={{
        left: `${position.x}px`,
        top: `${position.y - 12}px`,
      }}
    >
      <div className="bg-[#131C2E]/95 backdrop-blur-md border border-cyan-500/40 rounded-xl p-3 shadow-2xl min-w-[200px] max-w-[280px] animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-700/60">
          <img
            src={country.flagSvg}
            alt={`Bandera de ${country.nameEs}`}
            className="w-7 h-5 object-cover rounded shadow-sm border border-slate-700"
          />
          <div className="overflow-hidden">
            <h4 className="font-display font-bold text-white text-sm leading-tight truncate">
              {country.nameEs}
            </h4>
            <p className="text-[11px] text-slate-400 font-medium truncate">
              {country.nameEn}
            </p>
          </div>
        </div>

        <div className="mt-2 space-y-1 text-xs">
          <div className="flex justify-between items-center text-slate-300">
            <span className="text-slate-400">Capital:</span>
            <span className="font-semibold text-cyan-300">{country.capital || 'N/A'}</span>
          </div>
          <div className="flex justify-between items-center text-slate-300">
            <span className="text-slate-400">Continente:</span>
            <span className="font-medium text-slate-200">{country.continentEs}</span>
          </div>
          {country.population > 0 && (
            <div className="flex justify-between items-center text-slate-300">
              <span className="text-slate-400">Población:</span>
              <span className="font-medium text-slate-300">
                {country.population.toLocaleString('es-ES')}
              </span>
            </div>
          )}
        </div>

        {status && status !== 'neutral' && status !== 'hover' && (
          <div className="mt-2 pt-1.5 border-t border-slate-700/50 flex items-center justify-center">
            {status === 'correct' && (
              <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                ✓ Acierto confirmado
              </span>
            )}
            {status === 'wrong' && (
              <span className="text-[11px] font-bold text-rose-400 flex items-center gap-1">
                ✗ País fallado
              </span>
            )}
            {status === 'hint' && (
              <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                💡 Pista activa
              </span>
            )}
            {status === 'selected' && (
              <span className="text-[11px] font-bold text-purple-400 flex items-center gap-1">
                🎯 Seleccionado
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
