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
import { FALLBACK_MAP_URL, FALLBACK_COUNTRIES, GEEK_TERRITORIES } from '../../data/fallbackCountries';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, Minimize2 } from 'lucide-react';

const LOCAL_GEO_URL = `${import.meta.env.BASE_URL}data/world-50m.json`;

interface OceaniaInsetMapProps {
  countryStatuses?: Record<string, CountryMapStatus>;
  selectedCountryCode?: string | null;
  targetCountryCode?: string | null;
  pulsingCountryCode?: string | null;
  onCountryClick?: (country: Country, cca3: string) => void;
  isGeekMode?: boolean;
}

interface PacificMarkerDef {
  code: string;
  name: string;
  coords: [number, number]; // [longitude, latitude]
  isGeekOnly?: boolean;
}

// Coordenadas geográficas reales calibradas para el Pacífico
const PACIFIC_MARKERS: PacificMarkerDef[] = [
  // Micronesia
  { code: 'PLW', name: 'Palaos', coords: [134.58, 7.51] },
  { code: 'GUM', name: 'Guam', coords: [144.79, 13.44], isGeekOnly: true },
  { code: 'MNP', name: 'Islas Marianas del Norte', coords: [145.38, 15.09], isGeekOnly: true },
  { code: 'FSM', name: 'Micronesia', coords: [158.16, 6.92] },
  { code: 'MHL', name: 'Islas Marshall', coords: [171.18, 7.13] },
  { code: 'NRU', name: 'Nauru', coords: [166.93, -0.52] },
  { code: 'KIR', name: 'Kiribati', coords: [172.97, 1.45] },

  // Melanesia
  { code: 'PNG', name: 'Papúa Nueva Guinea', coords: [143.95, -6.31] },
  { code: 'SLB', name: 'Islas Salomón', coords: [160.15, -9.64] },
  { code: 'VUT', name: 'Vanuatu', coords: [168.32, -17.73] },
  { code: 'NCL', name: 'Nueva Caledonia', coords: [165.61, -20.90], isGeekOnly: true },
  { code: 'FJI', name: 'Fiyi', coords: [178.06, -17.71] },

  // Polinesia
  { code: 'TUV', name: 'Tuvalu', coords: [177.64, -7.10] },
  { code: 'WLF', name: 'Wallis y Futuna', coords: [-176.20, -13.30], isGeekOnly: true },
  { code: 'WSM', name: 'Samoa', coords: [-172.10, -13.75] },
  { code: 'ASM', name: 'Samoa Americana', coords: [-170.70, -14.27], isGeekOnly: true },
  { code: 'TON', name: 'Tonga', coords: [-175.19, -21.17] },
  { code: 'NIU', name: 'Niue', coords: [-169.86, -19.05], isGeekOnly: true },
  { code: 'COK', name: 'Islas Cook', coords: [-159.77, -21.23], isGeekOnly: true },
  { code: 'PYF', name: 'Polinesia Francesa', coords: [-149.40, -17.67], isGeekOnly: true },

  // Australasia
  { code: 'AUS', name: 'Australia', coords: [133.77, -25.27] },
  { code: 'NZL', name: 'Nueva Zelanda', coords: [174.88, -40.90] }
];

export const OceaniaInsetMap: React.FC<OceaniaInsetMapProps> = ({
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
    coordinates: [170, -8],
    zoom: 2.7
  });

  const visibleMarkers = useMemo(() => {
    return PACIFIC_MARKERS.filter(m => isGeekMode || !m.isGeekOnly);
  }, [isGeekMode]);

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
    <div className={`relative bg-[#0B1220] border-2 border-cyan-500/50 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 ${
      isExpanded ? 'fixed inset-4 sm:inset-10 z-50' : 'w-full h-full'
    }`}>
      {/* Barra de Título y Controles */}
      <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-xl border border-cyan-500/40 text-xs font-bold text-cyan-300 shadow-lg">
        <span>🌊</span>
        <span>Oceanía & Pacífico (Alta Resolución 50m)</span>
      </div>

      {/* Controles de Zoom del Inset */}
      <div className="absolute top-2 right-8 z-10 flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-700 shadow-lg">
        <button
          onClick={() => setPosition(p => ({ ...p, zoom: Math.min(p.zoom * 1.35, 25) }))}
          className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition"
          title="Zoom +"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setPosition(p => ({ ...p, zoom: Math.max(p.zoom / 1.35, 1.4) }))}
          className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition"
          title="Zoom -"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setPosition({ coordinates: [170, -8], zoom: 2.7 })}
          className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition"
          title="Restablecer vista"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1.5 hover:bg-cyan-500/20 text-cyan-400 hover:text-cyan-300 rounded-lg transition border-l border-slate-700 pl-2"
          title={isExpanded ? "Reducir ventana" : "Ampliar a pantalla grande"}
        >
          {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Mapa Vectorial Interactivo del Pacífico con Geometría 50m Real */}
      <ComposableMap
        projection="geoEqualEarth"
        projectionConfig={{
          scale: 160,
        }}
        className="w-full h-full cursor-grab active:cursor-grabbing bg-[#0A101C]"
      >
        <ZoomableGroup
          zoom={position.zoom}
          center={position.coordinates}
          onMoveEnd={(pos) => setPosition(pos)}
          minZoom={1.2}
          maxZoom={25}
        >
          {/* Polígonos Geográficos Reales de las Islas del Pacífico y Continentes */}
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
                        strokeWidth: styles.strokeWidth / Math.sqrt(position.zoom / 2.7),
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

          {/* Marcadores Circulares Nítidos e Interactivos para cada Isla / Nación */}
          {visibleMarkers.map((island) => {
            const styles = getStyleForCode(island.code);
            const isPulsing = pulsingCountryCode?.toUpperCase() === island.code.toUpperCase();
            const isTarget = targetCountryCode?.toUpperCase() === island.code.toUpperCase();
            const isResolved = styles.fill !== '#24344D';

            const dotFill = isPulsing ? '#EF4444' : isResolved ? styles.fill : '#FFFFFF';
            const dotStroke = isPulsing ? '#FEE2E2' : isResolved ? styles.stroke : '#0F172A';
            const radius = Math.max(0.45, 1.3 / Math.sqrt(position.zoom));
            const haloRadius = radius * 2.0;
            const hitRadius = Math.max(1.8, 4.0 / Math.sqrt(position.zoom));

            return (
              <Marker
                key={`pacific_m_${island.code}`}
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
                    strokeWidth={0.3}
                    className="group-hover:scale-125 transition-transform origin-center"
                  />

                  {/* Zona táctil invisible amplia */}
                  <circle
                    r={hitRadius}
                    fill="transparent"
                  />

                  <title>{island.name}</title>
                </g>
              </Marker>
            );
          })}
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
};
