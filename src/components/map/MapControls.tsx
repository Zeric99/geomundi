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
      <div className="flex flex-col bg-[#18181B]/95 backdrop-blur-md border border-zinc-700/80 rounded-lg overflow-hidden shadow-md">
        <button
          onClick={onZoomIn}
          title="Acercar mapa (+)"
          className="p-2 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors border-b border-zinc-800 active:scale-95"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={onZoomOut}
          title="Alejar mapa (-)"
          className="p-2 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors border-b border-zinc-800 active:scale-95"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={onReset}
          title="Reajustar vista del mapa"
          className="p-2 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Botón para Activar/Desactivar Tooltips */}
      {onToggleTooltips && (
        <button
          onClick={onToggleTooltips}
          title={tooltipsEnabled ? 'Ocultar nombres y capitales al pasar el ratón' : 'Mostrar nombres y capitales al pasar el ratón'}
          className={`p-2 sm:px-3 sm:py-1.5 rounded-lg border backdrop-blur-md transition-all flex items-center gap-1.5 text-xs font-mono shadow-sm active:scale-95 ${
            tooltipsEnabled
              ? 'bg-indigo-950/60 text-indigo-300 border-indigo-800/60 font-medium'
              : 'bg-[#18181B]/90 text-zinc-400 border-zinc-800 hover:text-zinc-200'
          }`}
        >
          {tooltipsEnabled ? (
            <>
              <Eye className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Pistas: ON</span>
            </>
          ) : (
            <>
              <EyeOff className="w-3.5 h-3.5 text-zinc-500" />
              <span className="hidden sm:inline">Pistas: OFF</span>
            </>
          )}
        </button>
      )}

      {/* Indicador de nivel de Zoom */}
      <div className="bg-[#18181B]/90 backdrop-blur-sm border border-zinc-800 px-2 py-0.5 rounded text-[11px] font-mono text-zinc-400 shadow-sm">
        {zoomLevel.toFixed(1)}x
      </div>

      {/* Píldoras de Acceso Rápido a Continentes */}
      {onSelectContinent && (
        <div className="hidden lg:flex flex-col gap-1 mt-1 bg-[#18181B]/90 backdrop-blur-md border border-zinc-800 p-1.5 rounded-lg shadow-md font-sans">
          <div className="flex items-center gap-1 px-2 py-0.5 text-[10px] uppercase font-mono text-zinc-500">
            <Compass className="w-3 h-3 text-indigo-400" />
            <span>Enfocar</span>
          </div>
          {continents.map(c => (
            <button
              key={c.id}
              onClick={() => onSelectContinent(c.id)}
              className={`px-2.5 py-1 rounded text-xs text-left transition-colors font-sans ${
                currentContinent === c.id
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
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
