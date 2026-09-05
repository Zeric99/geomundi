import React, { useState, useRef, useCallback } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
  Marker
} from 'react-simple-maps';
import { MapControls } from './MapControls';
import { MapPin, Crosshair, Navigation } from 'lucide-react';
import { CONTINENT_VIEWPORTS } from '../../data/geoAliases';

const LOCAL_GEO_URL = `${import.meta.env.BASE_URL}data/world-50m.json`;

interface PinpointWorldMapProps {
  clickedCoords: [number, number] | null; // [lng, lat]
  targetCoords: [number, number] | null;  // [lng, lat]
  onMapClick: (coords: [number, number]) => void;
  isEvaluated: boolean;
  continent?: string;
}

export const PinpointWorldMap: React.FC<PinpointWorldMapProps> = ({
  clickedCoords,
  targetCoords,
  onMapClick,
  isEvaluated,
  continent = 'World'
}) => {
  const viewport = CONTINENT_VIEWPORTS[continent] || CONTINENT_VIEWPORTS.World;
  const [position, setPosition] = useState<{ coordinates: [number, number]; zoom: number }>({
    coordinates: viewport.center,
    zoom: viewport.zoom
  });

  const svgRef = useRef<SVGSVGElement | null>(null);

  // Zoom Controls
  const handleZoomIn = useCallback(() => {
    setPosition(prev => ({ ...prev, zoom: Math.min(prev.zoom * 1.4, 12) }));
  }, []);

  const handleZoomOut = useCallback(() => {
    setPosition(prev => ({ ...prev, zoom: Math.max(prev.zoom / 1.4, 1) }));
  }, []);

  const handleResetZoom = useCallback(() => {
    setPosition({ coordinates: viewport.center, zoom: viewport.zoom });
  }, [viewport]);

  return (
    <div className="relative w-full h-full bg-[#0d141e] rounded-xl overflow-hidden shadow-2xl border border-zinc-800 select-none">
      {/* Indicador de ayuda superior en el mapa */}
      <div className="absolute top-3 left-3 z-10 bg-zinc-900/90 backdrop-blur-md px-3.5 py-2 rounded-lg border border-zinc-800 text-xs text-zinc-300 flex items-center gap-2 shadow-lg">
        <Crosshair className="w-4 h-4 text-cyan-400 animate-pulse" />
        <span>
          {isEvaluated
            ? 'Resultado calculado. Haz clic en "Siguiente Ciudad" para continuar.'
            : 'Haz clic en el lugar exacto del mapa donde crees que se ubica la ciudad.'}
        </span>
      </div>

      <ComposableMap
        projection="geoEqualEarth"
        projectionConfig={{ scale: 160 }}
        className="w-full h-full cursor-crosshair"
      >
        <ZoomableGroup
          zoom={position.zoom}
          center={position.coordinates}
          onMoveEnd={pos => setPosition(pos)}
          maxZoom={14}
          minZoom={1}
        >
          <Geographies geography={LOCAL_GEO_URL}>
            {({ geographies }) => (
              <>
                {/* Países de fondo con textura táctica navy */}
                {geographies.map(geo => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => {
                      if (isEvaluated) return;
                      const coords: [number, number] = [
                        geo.properties?.longitude || 0,
                        geo.properties?.latitude || 0
                      ];
                      onMapClick(coords);
                    }}
                    style={{
                      default: {
                        fill: '#1a2736',
                        stroke: '#2c3e55',
                        strokeWidth: 0.4,
                        outline: 'none',
                        transition: 'fill 0.2s ease'
                      },
                      hover: {
                        fill: '#24374c',
                        stroke: '#38bdf8',
                        strokeWidth: 0.6,
                        outline: 'none',
                        cursor: isEvaluated ? 'default' : 'crosshair'
                      },
                      pressed: {
                        fill: '#0f1823',
                        outline: 'none'
                      }
                    }}
                  />
                ))}

                {/* Marcador del Clic del Usuario (Crosshair Táctico) */}
                {clickedCoords && (
                  <Marker coordinates={clickedCoords}>
                    <g transform="translate(-16, -16)" className="animate-in zoom-in duration-200">
                      {/* Efecto de pulso de radar */}
                      <circle
                        cx="16"
                        cy="16"
                        r="18"
                        className="fill-cyan-500/20 stroke-cyan-400 stroke-[1.5] animate-ping"
                      />
                      <circle cx="16" cy="16" r="12" className="fill-cyan-950/80 stroke-cyan-400 stroke-2" />
                      <circle cx="16" cy="16" r="4" className="fill-cyan-400" />
                      <line x1="16" y1="2" x2="16" y2="8" stroke="#38bdf8" strokeWidth="2" />
                      <line x1="16" y1="24" x2="16" y2="30" stroke="#38bdf8" strokeWidth="2" />
                      <line x1="2" y1="16" x2="8" y2="16" stroke="#38bdf8" strokeWidth="2" />
                      <line x1="24" y1="16" x2="30" y2="16" stroke="#38bdf8" strokeWidth="2" />
                    </g>
                  </Marker>
                )}

                {/* Marcador del Destino Real (Baliza Neón Verde / Emerald) */}
                {targetCoords && isEvaluated && (
                  <Marker coordinates={targetCoords}>
                    <g transform="translate(-14, -28)" className="animate-bounce duration-700">
                      <circle
                        cx="14"
                        cy="14"
                        r="14"
                        className="fill-emerald-500/30 stroke-emerald-400 stroke-2 animate-pulse"
                      />
                      <MapPin className="w-7 h-7 text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.9)]" />
                    </g>
                  </Marker>
                )}
              </>
            )}
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {/* Controles de Zoom */}
      <MapControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleResetZoom}
        zoomLevel={position.zoom}
      />
    </div>
  );
};
