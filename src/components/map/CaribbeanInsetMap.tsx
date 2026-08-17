import React, { useState, useMemo } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
  Marker
} from 'react-simple-maps';
import { Country, CountryMapStatus } from '../../types/country';
import { countriesService } from '../../services/countriesService';
import { FALLBACK_MAP_URL } from '../../data/fallbackCountries';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, Minimize2, X } from 'lucide-react';

const LOCAL_GEO_URL = `${import.meta.env.BASE_URL}data/world-50m.json`;

interface CaribbeanInsetMapProps {
  countryStatuses?: Record<string, CountryMapStatus>;
  selectedCountryCode?: string | null;
  targetCountryCode?: string | null;
  pulsingCountryCode?: string | null;
  onCountryClick?: (country: Country, cca3: string) => void;
  isGeekMode?: boolean;
}

interface IslandMarkerDef {
  code: string;
  name: string;
  coords: [number, number]; // [longitude, latitude]
  isGeekOnly?: boolean;
}

// Coordenadas geográficas reales calibradas para el Caribe (Sin solapamientos)
const CARIBBEAN_MARKERS: IslandMarkerDef[] = [
  // Lucayas
  { code: 'BHS', name: 'Bahamas', coords: [-77.39, 25.03] },
  { code: 'TCA', name: 'Turcas y Caicos', coords: [-71.79, 21.69], isGeekOnly: true },

  // Grandes Antillas
  { code: 'CUB', name: 'Cuba', coords: [-79.5, 21.8] },
  { code: 'JAM', name: 'Jamaica', coords: [-77.29, 18.10] },
  { code: 'HTI', name: 'Haití', coords: [-72.28, 18.97] },
  { code: 'DOM', name: 'Rep. Dominicana', coords: [-70.16, 18.73] },
  { code: 'PRI', name: 'Puerto Rico', coords: [-66.59, 18.22] },
  { code: 'CYM', name: 'Islas Caimán', coords: [-81.25, 19.31], isGeekOnly: true },

  // Pequeñas Antillas (Arco oriental)
  { code: 'VGB', name: 'Islas Vírgenes (UK)', coords: [-64.63, 18.42], isGeekOnly: true },
  { code: 'VIR', name: 'Islas Vírgenes (EE.UU.)', coords: [-64.89, 18.33], isGeekOnly: true },
  { code: 'AIA', name: 'Anguila', coords: [-63.06, 18.22], isGeekOnly: true },
  { code: 'SXM', name: 'San Martín', coords: [-63.05, 18.04], isGeekOnly: true },
  { code: 'BLM', name: 'San Bartolomé', coords: [-62.83, 17.90], isGeekOnly: true },
  { code: 'KNA', name: 'San Cristóbal y Nieves', coords: [-62.78, 17.35] },
  { code: 'ATG', name: 'Antigua y Barbuda', coords: [-61.79, 17.06] },
  { code: 'MSR', name: 'Montserrat', coords: [-62.18, 16.74], isGeekOnly: true },
  { code: 'GLP', name: 'Guadalupe', coords: [-61.55, 16.26], isGeekOnly: true },
  { code: 'DMA', name: 'Dominica', coords: [-61.37, 15.41] },
  { code: 'MTQ', name: 'Martinica', coords: [-61.02, 14.64], isGeekOnly: true },
  { code: 'LCA', name: 'Santa Lucía', coords: [-60.97, 13.90] },
  { code: 'BRB', name: 'Barbados', coords: [-59.54, 13.19] },
  { code: 'VCT', name: 'San Vicente y Granadinas', coords: [-61.28, 12.98] },
  { code: 'GRD', name: 'Granada', coords: [-61.68, 12.11] },
  { code: 'TTO', name: 'Trinidad y Tobago', coords: [-61.22, 10.69] },

  // Antillas del Sur
  { code: 'ABW', name: 'Aruba', coords: [-69.96, 12.52], isGeekOnly: true },
  { code: 'CUW', name: 'Curazao', coords: [-68.99, 12.16], isGeekOnly: true },
  { code: 'BES', name: 'Bonaire', coords: [-68.23, 12.20], isGeekOnly: true }
];

export const CaribbeanInsetMap: React.FC<CaribbeanInsetMapProps> = ({
  countryStatuses = {},
  selectedCountryCode = null,
  targetCountryCode = null,
  pulsingCountryCode = null,
  onCountryClick,
  isGeekMode = false
}) => {
  const [geoUrl, setGeoUrl] = useState<string>(LOCAL_GEO_URL);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [position, setPosition] = useState<{ coordinates: [number, number]; zoom: number }>({
    coordinates: [-70, 16.5],
    zoom: 4.8
  });

  const visibleMarkers = useMemo(() => {
    return CARIBBEAN_MARKERS.filter(m => isGeekMode || !m.isGeekOnly);
  }, [isGeekMode]);

  const handleToggleExpand = () => {
    if (!isExpanded) {
      setIsExpanded(true);
      setPosition({ coordinates: [-67.5, 15.8], zoom: 8.5 });
    } else {
      setIsExpanded(false);
      setPosition({ coordinates: [-70, 16.5], zoom: 4.8 });
    }
  };

  const handleCountrySelect = (code: string) => {
    if (!onCountryClick) return;
    const country = countriesService.getCountryByCode(code);
    if (country) {
      onCountryClick(country, code);
    }
  };

  const handleGeographyClick = (geo: any) => {
    if (!onCountryClick) return;
    const cca3 = countriesService.resolveGeoCode(geo.properties, geo.id);
    if (cca3) {
      handleCountrySelect(cca3);
    }
  };

  const getStyleForCode = (code: string) => {
    const upper = code.toUpperCase();
    const isPulsing = pulsingCountryCode?.toUpperCase() === upper;
    const status = countryStatuses[upper];
    const isSelected = selectedCountryCode?.toUpperCase() === upper;
    const isTarget = targetCountryCode?.toUpperCase() === upper;

    if (isPulsing) return { fill: '#EF4444', stroke: '#FEE2E2', strokeWidth: 0.9 };
    if (status === 'correct') return { fill: '#10B981', stroke: '#34D399', strokeWidth: 0.6 };
    if (status === 'wrong') return { fill: '#EF4444', stroke: '#F87171', strokeWidth: 0.6 };
    if (status === 'hint' || isTarget) return { fill: '#F59E0B', stroke: '#FDE047', strokeWidth: 0.7 };
    if (status === 'selected' || isSelected) return { fill: '#8B5CF6', stroke: '#C4B5FD', strokeWidth: 0.8 };

    return { fill: '#24344D', stroke: '#3B4F6E', strokeWidth: 0.4 };
  };

  return (
    <div className={`relative bg-[#0B1220] border-2 border-cyan-500/60 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 ${
      isExpanded 
        ? 'absolute inset-0 z-40 w-full h-full shadow-[0_0_50px_rgba(6,182,212,0.4)]' 
        : 'w-full h-full'
    }`}>
      {/* Barra de Título */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2 bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-cyan-500/50 text-xs font-bold text-cyan-300 shadow-xl">
        <span className="text-base">🏝️</span>
        <span>Caribe & Antillas {isExpanded ? '(Vista Ampliada)' : ''}</span>
      </div>

      {/* Controles de Zoom del Inset */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-1 bg-slate-900/95 backdrop-blur-md p-1.5 rounded-xl border border-slate-700 shadow-xl">
        <button
          onClick={() => setPosition(p => ({ ...p, zoom: Math.min(p.zoom * 1.35, 30) }))}
          className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition"
          title="Zoom +"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setPosition(p => ({ ...p, zoom: Math.max(p.zoom / 1.35, 2.0) }))}
          className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition"
          title="Zoom -"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => setPosition({ coordinates: isExpanded ? [-67.5, 15.8] : [-70, 16.5], zoom: isExpanded ? 8.5 : 4.8 })}
          className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition"
          title="Restablecer vista"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={handleToggleExpand}
          className="px-2.5 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 hover:text-white rounded-lg transition font-bold text-xs flex items-center gap-1 border border-cyan-500/40 ml-1 shadow-sm active:scale-95"
          title={isExpanded ? "Volver a la vista recuadro" : "Ampliar a todo el mapa"}
        >
          {isExpanded ? (
            <>
              <Minimize2 className="w-3.5 h-3.5" />
              <span>Reducir</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Ampliar</span>
            </>
          )}
        </button>
      </div>

      {/* Mapa Vectorial Interactivo del Caribe con Geometría 50m Real */}
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 160,
        }}
        className="w-full h-full cursor-grab active:cursor-grabbing bg-[#0A101C]"
      >
        <ZoomableGroup
          zoom={position.zoom}
          center={position.coordinates}
          onMoveEnd={(pos) => setPosition(pos)}
          minZoom={2.0}
          maxZoom={30}
        >
          {/* Polígonos Geográficos Reales de las Islas y Costas */}
          <Geographies
            geography={geoUrl}
            onError={() => setGeoUrl(FALLBACK_MAP_URL)}
          >
            {({ geographies }: { geographies: any[] }) =>
              geographies.map((geo: any) => {
                const cca3 = countriesService.resolveGeoCode(geo.properties, geo.id);
                const styles = getStyleForCode(cca3 || '');

                return (
                  <Geography
                    key={geo.rsmKey || geo.id || cca3}
                    geography={geo}
                    onClick={() => handleGeographyClick(geo)}
                    style={{
                      default: {
                        fill: styles.fill,
                        stroke: styles.stroke,
                        strokeWidth: styles.strokeWidth / Math.sqrt(position.zoom / 4.8),
                        outline: 'none',
                        vectorEffect: 'non-scaling-stroke'
                      },
                      hover: {
                        fill: '#0284C7',
                        stroke: '#38BDF8',
                        strokeWidth: 0.8,
                        outline: 'none',
                        cursor: 'pointer',
                        vectorEffect: 'non-scaling-stroke'
                      },
                      pressed: {
                        fill: '#0369A1',
                        stroke: '#7DD3FC',
                        strokeWidth: 0.9,
                        outline: 'none',
                        vectorEffect: 'non-scaling-stroke'
                      }
                    }}
                  />
                );
              })
            }
          </Geographies>

          {/* Marcadores Circulares Nítidos e Interactivos para cada Isla (SIN NOMBRES DE PISTAS) */}
          {visibleMarkers.map((island) => {
            const styles = getStyleForCode(island.code);
            const isPulsing = pulsingCountryCode?.toUpperCase() === island.code.toUpperCase();
            const isTarget = targetCountryCode?.toUpperCase() === island.code.toUpperCase();
            const isResolved = styles.fill !== '#24344D';

            const dotFill = isPulsing ? '#EF4444' : isResolved ? styles.fill : '#FFFFFF';
            const dotStroke = isPulsing ? '#FEE2E2' : isResolved ? styles.stroke : '#0F172A';
            const radius = Math.max(0.4, 1.3 / Math.sqrt(position.zoom));
            const haloRadius = radius * 1.8;
            const hitRadius = Math.max(1.8, 3.8 / Math.sqrt(position.zoom));

            return (
              <Marker
                key={`carib_m_${island.code}`}
                coordinates={island.coords}
              >
                <g
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCountrySelect(island.code);
                  }}
                  className="cursor-pointer group"
                >
                  {/* Radar animado en fallo */}
                  {isPulsing && (
                    <circle
                      r={haloRadius * 2.5}
                      fill="rgba(239, 68, 68, 0.35)"
                      className="animate-ping"
                    />
                  )}

                  {/* Halo sutil */}
                  <circle
                    r={haloRadius}
                    fill={isPulsing ? '#EF4444' : isTarget ? '#F59E0B' : dotFill}
                    opacity={isPulsing ? 0.9 : isResolved ? 0.4 : 0.2}
                  />

                  {/* Punto central */}
                  <circle
                    r={radius}
                    fill={dotFill}
                    stroke={dotStroke}
                    strokeWidth={0.25}
                    className="group-hover:scale-125 transition-transform origin-center"
                  />

                  {/* Zona táctil invisible amplia */}
                  <circle
                    r={hitRadius}
                    fill="transparent"
                  />
                </g>
              </Marker>
            );
          })}
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
};
