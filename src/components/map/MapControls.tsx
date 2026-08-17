import React from 'react';
import { Plus, Minus, RotateCcw, Compass, Eye, EyeOff } from 'lucide-react';
import { Continent } from '../../types/country';

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  currentContinent?: Continent;
  onSelectContinent?: (continent: Continent) => void;
  zoomLevel: number;
  tooltipsEnabled?: boolean;
  onToggleTooltips?: () => void;
}

export const MapControls: React.FC<MapControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onReset,
  currentContinent = 'World',
  onSelectContinent,
  zoomLevel,
  tooltipsEnabled = true,
  onToggleTooltips
}) => {
  const continents: { id: Continent; label: string }[] = [
    { id: 'World', label: 'Mundo' },
    { id: 'Europe', label: 'Europa' },
    { id: 'Americas', label: 'América' },
    { id: 'Africa', label: 'África' },
    { id: 'Asia', label: 'Asia' },
    { id: 'Oceania', label: 'Oceanía' },
  ];

  return (
    <div className="absolute top-4 right-4 z-30 flex flex-col items-end gap-2 pointer-events-auto">
      {/* Botones de Zoom Vertical */}
      <div className="flex flex-col bg-[#131C2E]/90 backdrop-blur-md border border-slate-700/80 rounded-xl overflow-hidden shadow-xl">
        <button
          onClick={onZoomIn}
          title="Acercar mapa (+)"
          className="p-2.5 hover:bg-cyan-500/20 text-slate-200 hover:text-cyan-300 transition-colors border-b border-slate-700/60 active:scale-95"
        >
          <Plus className="w-5 h-5" />
        </button>
        <button
          onClick={onZoomOut}
          title="Alejar mapa (-)"
          className="p-2.5 hover:bg-cyan-500/20 text-slate-200 hover:text-cyan-300 transition-colors border-b border-slate-700/60 active:scale-95"
        >
          <Minus className="w-5 h-5" />
        </button>
        <button
          onClick={onReset}
          title="Reajustar vista del mapa"
          className="p-2.5 hover:bg-cyan-500/20 text-slate-200 hover:text-cyan-300 transition-colors active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Botón para Activar/Desactivar Nombres y Capitales al Pasar el Ratón (Tooltips) */}
      {onToggleTooltips && (
        <button
          onClick={onToggleTooltips}
          title={tooltipsEnabled ? 'Ocultar nombres y capitales al pasar el ratón (Modo Experto)' : 'Mostrar nombres y capitales al pasar el ratón'}
          className={`p-2 sm:px-3 sm:py-1.5 rounded-xl border backdrop-blur-md transition-all flex items-center gap-1.5 text-xs font-bold shadow-lg active:scale-95 ${
            tooltipsEnabled
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-glow-cyan'
              : 'bg-slate-900/90 text-slate-400 border-slate-700 hover:text-slate-200 hover:border-slate-500'
          }`}
        >
          {tooltipsEnabled ? (
            <>
              <Eye className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Pistas Hover: ON</span>
            </>
          ) : (
            <>
              <EyeOff className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Pistas Hover: OFF</span>
            </>
          )}
        </button>
      )}

      {/* Indicador de nivel de Zoom */}
      <div className="bg-[#131C2E]/80 backdrop-blur-sm border border-slate-700/60 px-2.5 py-1 rounded-lg text-[11px] font-mono text-cyan-300 font-bold shadow">
        {zoomLevel.toFixed(1)}x
      </div>

      {/* Píldoras de Acceso Rápido a Continentes */}
      {onSelectContinent && (
        <div className="hidden lg:flex flex-col gap-1 mt-2 bg-[#131C2E]/80 backdrop-blur-md border border-slate-700/60 p-1.5 rounded-xl shadow-lg">
          <div className="flex items-center gap-1 px-2 py-1 text-[10px] uppercase font-bold text-slate-400">
            <Compass className="w-3 h-3 text-cyan-400" />
            <span>Enfocar</span>
          </div>
          {continents.map(c => (
            <button
              key={c.id}
              onClick={() => onSelectContinent(c.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold text-left transition-all ${
                currentContinent === c.id
                  ? 'bg-cyan-500 text-white shadow-glow-cyan'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
