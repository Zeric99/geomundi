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
      <div className="bg-[#18181B]/95 backdrop-blur-md border border-zinc-700/80 rounded-xl p-3 shadow-xl min-w-[200px] max-w-[280px] animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center gap-2.5 pb-2 border-b border-zinc-800">
          <img
            src={country.flagSvg}
            alt={`Bandera de ${country.nameEs}`}
            className="w-7 h-5 object-cover rounded shadow-sm border border-zinc-700"
          />
          <div className="overflow-hidden">
            <h4 className="font-serif font-normal text-zinc-100 text-sm leading-tight truncate">
              {country.nameEs}
            </h4>
            <p className="text-[11px] text-zinc-400 font-sans truncate">
              {country.nameEn}
            </p>
          </div>
        </div>

        <div className="mt-2 space-y-1 text-xs font-sans">
          <div className="flex justify-between items-center text-zinc-300">
            <span className="text-zinc-400">Capital:</span>
            <span className="font-serif font-normal text-zinc-100">{country.capital || 'N/A'}</span>
          </div>
          <div className="flex justify-between items-center text-zinc-300">
            <span className="text-zinc-400">Continente:</span>
            <span className="font-medium text-zinc-300">{country.continentEs}</span>
          </div>
          {country.population > 0 && (
            <div className="flex justify-between items-center text-zinc-300">
              <span className="text-zinc-400">Población:</span>
              <span className="font-mono text-zinc-300">
                {country.population.toLocaleString('es-ES')}
              </span>
            </div>
          )}
        </div>

        {status && status !== 'neutral' && status !== 'hover' && (
          <div className="mt-2 pt-1.5 border-t border-zinc-800 flex items-center justify-center">
            {status === 'correct' && (
              <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
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
