import React from 'react';
import { X, Sparkles, Landmark, Globe, Users } from 'lucide-react';
import { Country, CountryMapStatus } from '../../types/country';

interface MapTooltipProps {
  country: Country | null;
  status?: CountryMapStatus;
  onClose?: () => void;
  isPinned?: boolean;
}

export const MapTooltip: React.FC<MapTooltipProps> = ({
  country,
  status,
  onClose,
  isPinned = false
}) => {
  if (!country) return null;

  return (
    <div
      aria-label={`Ficha informativa de ${country.nameEs}`}
      className="absolute top-3 left-3 sm:top-4 sm:left-4 z-40 max-w-[270px] sm:max-w-[310px] w-full pointer-events-auto select-none animate-in fade-in slide-in-from-top-2 duration-150 shadow-2xl"
    >
      <div className="bg-[#18181B]/95 backdrop-blur-md border border-cyan-500/40 hover:border-cyan-400/70 rounded-2xl p-3 sm:p-3.5 shadow-2xl space-y-2.5 transition-all text-zinc-100">
        {/* Cabecera con indicador de Pista y botón cerrar */}
        <div className="flex items-center justify-between gap-2 border-b border-zinc-800/80 pb-2">
          <div className="flex items-center gap-1.5">
            <span className="flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-950/80 text-cyan-300 border border-cyan-700/50 px-2 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Pista de País</span>
            </span>
            {isPinned && (
              <span className="text-[10px] font-mono text-zinc-400">
                (Fijada)
              </span>
            )}
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 rounded-lg transition-colors"
              title="Cerrar ficha de pista"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Ficha Principal con Bandera y Nombres */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-6 sm:w-10 sm:h-7 rounded overflow-hidden border border-zinc-700/90 shadow-sm shrink-0 bg-zinc-900">
            <img
              src={country.flagSvg}
              alt={`Bandera de ${country.nameEs}`}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-serif font-bold text-zinc-100 text-sm sm:text-base leading-tight truncate">
              {country.nameEs}
            </h4>
            <p className="text-[11px] text-zinc-400 font-sans truncate">
              {country.nameEn} · <span className="font-mono text-cyan-400 font-bold">{country.cca3}</span>
            </p>
          </div>
        </div>

        {/* Detalles Geográficos */}
        <div className="space-y-1 text-xs font-sans bg-[#0c111c]/60 rounded-xl p-2 border border-zinc-800/60">
          <div className="flex justify-between items-center text-zinc-300">
            <span className="text-zinc-400 flex items-center gap-1">
              <Landmark className="w-3 h-3 text-amber-400 shrink-0" />
              <span>Capital:</span>
            </span>
            <span className="font-serif font-bold text-amber-200 truncate max-w-[140px]">
              {country.capital || 'N/A'}
            </span>
          </div>

          <div className="flex justify-between items-center text-zinc-300">
            <span className="text-zinc-400 flex items-center gap-1">
              <Globe className="w-3 h-3 text-cyan-400 shrink-0" />
              <span>Continente:</span>
            </span>
            <span className="font-medium text-zinc-200">
              {country.continentEs}
            </span>
          </div>

          {country.population > 0 && (
            <div className="flex justify-between items-center text-zinc-300">
              <span className="text-zinc-400 flex items-center gap-1">
                <Users className="w-3 h-3 text-indigo-400 shrink-0" />
                <span>Población:</span>
              </span>
              <span className="font-mono text-zinc-300">
                {country.population.toLocaleString('es-ES')}
              </span>
            </div>
          )}
        </div>

        {/* Estado en el juego si procede */}
        {status && status !== 'neutral' && status !== 'hover' && (
          <div className="pt-1.5 border-t border-zinc-800/80 flex items-center justify-center">
            {status === 'correct' && (
              <span className="text-[11px] font-mono font-bold text-emerald-400 flex items-center gap-1">
                ✓ Acierto confirmado
              </span>
            )}
            {status === 'wrong' && (
              <span className="text-[11px] font-bold text-rose-400 flex items-center gap-1">
                ✗ Fallado
              </span>
            )}
            {status === 'hint' && (
              <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                💡 Objetivo / Pista
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
