import React, { useState, useMemo, useEffect } from 'react';
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
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, Minimize2 } from 'lucide-react';

const LOCAL_GEO_URL = `${import.meta.env.BASE_URL}data/world-50m.json`;

interface CaribbeanInsetMapProps {
  countryStatuses?: Record<string, CountryMapStatus>;
  selectedCountryCode?: string | null;
  targetCountryCode?: string | null;
  pulsingCountryCode?: string | null;
  onCountryClick?: (country: Country, cca3: string) => void;
  isGeekMode?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

interface IslandMarkerDef {
  code: string;
  name: string;
  islandName: string;
  coords: [number, number]; // [longitude, latitude]
  isGeekOnly?: boolean;
}

// Coordenadas geográficas calibradas para todas las islas de los archipiélagos del Caribe
const CARIBBEAN_MARKERS: IslandMarkerDef[] = [
  // Bahamas (Archipiélago completo de Lucayas)
  { code: 'BHS', name: 'Bahamas', islandName: 'Nueva Providencia (Nasáu)', coords: [-77.35, 25.05] },
  { code: 'BHS', name: 'Bahamas', islandName: 'Gran Bahama', coords: [-78.60, 26.55] },
  { code: 'BHS', name: 'Bahamas', islandName: 'Ábaco', coords: [-77.20, 26.45] },
  { code: 'BHS', name: 'Bahamas', islandName: 'Andros', coords: [-77.90, 24.70] },
  { code: 'BHS', name: 'Bahamas', islandName: 'Eleuthera', coords: [-76.35, 25.15] },
  { code: 'BHS', name: 'Bahamas', islandName: 'Exuma', coords: [-75.80, 23.60] },

  // Turcas y Caicos
  { code: 'TCA', name: 'Turcas y Caicos', islandName: 'Islas Caicos', coords: [-71.90, 21.80], isGeekOnly: true },
  { code: 'TCA', name: 'Turcas y Caicos', islandName: 'Islas Turcas', coords: [-71.15, 21.45], isGeekOnly: true },

  // Cuba
  { code: 'CUB', name: 'Cuba', islandName: 'Isla de Cuba', coords: [-79.50, 21.80] },
  { code: 'CUB', name: 'Cuba', islandName: 'Isla de la Juventud', coords: [-82.80, 21.70] },

  // Jamaica
  { code: 'JAM', name: 'Jamaica', islandName: 'Jamaica', coords: [-77.29, 18.10] },

  // Haití y Rep. Dominicana
  { code: 'HTI', name: 'Haití', islandName: 'Haití', coords: [-72.28, 18.97] },
  { code: 'HTI', name: 'Haití', islandName: 'Isla de la Gonâve', coords: [-73.05, 18.83] },
  { code: 'DOM', name: 'Rep. Dominicana', islandName: 'República Dominicana', coords: [-70.16, 18.73] },
  { code: 'DOM', name: 'Rep. Dominicana', islandName: 'Isla Saona', coords: [-68.60, 18.15] },

  // Puerto Rico
  { code: 'PRI', name: 'Puerto Rico', islandName: 'Puerto Rico', coords: [-66.59, 18.22] },
  { code: 'PRI', name: 'Puerto Rico', islandName: 'Vieques & Culebra', coords: [-65.35, 18.20] },

  // Islas Caimán
  { code: 'CYM', name: 'Islas Caimán', islandName: 'Gran Caimán', coords: [-81.25, 19.31], isGeekOnly: true },
  { code: 'CYM', name: 'Islas Caimán', islandName: 'Caimán Brac', coords: [-79.85, 19.72], isGeekOnly: true },

  // Pequeñas Antillas - Vírgenes
  { code: 'VGB', name: 'Islas Vírgenes (UK)', islandName: 'Tórtola & Virgin Gorda', coords: [-64.55, 18.44], isGeekOnly: true },
  { code: 'VIR', name: 'Islas Vírgenes (EE.UU.)', islandName: 'St. Thomas & St. Croix', coords: [-64.82, 18.05], isGeekOnly: true },

  // Anguila, San Martín, San Bartolomé
  { code: 'AIA', name: 'Anguila', islandName: 'Anguila', coords: [-63.06, 18.22], isGeekOnly: true },
  { code: 'SXM', name: 'San Martín', islandName: 'Sint Maarten / Saint Martin', coords: [-63.05, 18.04], isGeekOnly: true },
  { code: 'BLM', name: 'San Bartolomé', islandName: 'San Bartolomé', coords: [-62.83, 17.90], isGeekOnly: true },

  // San Cristóbal y Nieves
  { code: 'KNA', name: 'San Cristóbal y Nieves', islandName: 'San Cristóbal', coords: [-62.78, 17.35] },
  { code: 'KNA', name: 'San Cristóbal y Nieves', islandName: 'Nieves', coords: [-62.58, 17.15] },

  // Antigua y Barbuda
  { code: 'ATG', name: 'Antigua y Barbuda', islandName: 'Antigua', coords: [-61.79, 17.06] },
  { code: 'ATG', name: 'Antigua y Barbuda', islandName: 'Barbuda', coords: [-61.80, 17.63] },

  // Montserrat, Guadalupe, Dominica, Martinica
  { code: 'MSR', name: 'Montserrat', islandName: 'Montserrat', coords: [-62.18, 16.74], isGeekOnly: true },
  { code: 'GLP', name: 'Guadalupe', islandName: 'Guadalupe (Basse-Terre & Grande-Terre)', coords: [-61.55, 16.26], isGeekOnly: true },
  { code: 'GLP', name: 'Guadalupe', islandName: 'Marie-Galante', coords: [-61.27, 15.93], isGeekOnly: true },
  { code: 'DMA', name: 'Dominica', islandName: 'Dominica', coords: [-61.37, 15.41] },
  { code: 'MTQ', name: 'Martinica', islandName: 'Martinica', coords: [-61.02, 14.64], isGeekOnly: true },

  // Santa Lucía, Barbados
  { code: 'LCA', name: 'Santa Lucía', islandName: 'Santa Lucía', coords: [-60.97, 13.90] },
  { code: 'BRB', name: 'Barbados', islandName: 'Barbados', coords: [-59.54, 13.19] },

  // San Vicente y las Granadinas
  { code: 'VCT', name: 'San Vicente y Granadinas', islandName: 'San Vicente', coords: [-61.18, 13.25] },
  { code: 'VCT', name: 'San Vicente y Granadinas', islandName: 'Las Granadinas (Bequia/Mustique)', coords: [-61.30, 12.85] },

  // Granada
  { code: 'GRD', name: 'Granada', islandName: 'Granada', coords: [-61.68, 12.11] },
  { code: 'GRD', name: 'Granada', islandName: 'Carriacou', coords: [-61.45, 12.48] },

  // Trinidad y Tobago
  { code: 'TTO', name: 'Trinidad y Tobago', islandName: 'Trinidad', coords: [-61.30, 10.45] },
  { code: 'TTO', name: 'Trinidad y Tobago', islandName: 'Tobago', coords: [-60.68, 11.24] },

  // Antillas del Sur (ABC)
  { code: 'ABW', name: 'Aruba', islandName: 'Aruba', coords: [-69.96, 12.52], isGeekOnly: true },
  { code: 'CUW', name: 'Curazao', islandName: 'Curazao', coords: [-68.99, 12.16], isGeekOnly: true },
  { code: 'BES', name: 'Bonaire', islandName: 'Bonaire', coords: [-68.23, 12.20], isGeekOnly: true }
];

export const CaribbeanInsetMap: React.FC<CaribbeanInsetMapProps> = ({
  countryStatuses = {},
  selectedCountryCode = null,
  targetCountryCode = null,
  pulsingCountryCode = null,
  onCountryClick,
  isGeekMode = false,
  isExpanded = false,
  onToggleExpand
}) => {
  const [geoUrl, setGeoUrl] = useState<string>(LOCAL_GEO_URL);
  const [hoveredCountryCode, setHoveredCountryCode] = useState<string | null>(null);
  const [position, setPosition] = useState<{ coordinates: [number, number]; zoom: number }>({
    coordinates: isExpanded ? [-67.5, 15.8] : [-70, 16.5],
    zoom: isExpanded ? 8.5 : 4.8
  });

  // Ajustar coordenadas y zoom al expandir o reducir
  useEffect(() => {
    if (isExpanded) {
      setPosition({ coordinates: [-67.5, 15.8], zoom: 8.5 });
    } else {
      setPosition({ coordinates: [-70, 16.5], zoom: 4.8 });
    }
  }, [isExpanded]);

  const visibleMarkers = useMemo(() => {
    return CARIBBEAN_MARKERS.filter(m => isGeekMode || !m.isGeekOnly);
  }, [isGeekMode]);

  const handleCountrySelect = (code: string) => {
    if (!onCountryClick) return;
    const country = countriesService.getCountryByCode(code) || {
      cca3: code,
      cca2: code.slice(0, 2),
      nameEs: code,
      nameEn: code,
      capital: '',
      continent: 'Americas',
      continentEs: 'América',
      population: 0,
      flagSvg: '',
      flagEmoji: '🏝️',
      latlng: [0, 0],
      altSpellings: []
    } as any;
    onCountryClick(country, code);
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
    const isHovered = hoveredCountryCode?.toUpperCase() === upper;

    if (isPulsing) return { fill: '#EF4444', stroke: '#FEE2E2', strokeWidth: 0.9 };
    if (status === 'correct') return { fill: '#10B981', stroke: '#34D399', strokeWidth: 0.6 };
    if (status === 'wrong') return { fill: '#EF4444', stroke: '#F87171', strokeWidth: 0.6 };
    if (status === 'hint' || isTarget) return { fill: '#F59E0B', stroke: '#FDE047', strokeWidth: 0.7 };
    if (status === 'selected' || isSelected) return { fill: '#8B5CF6', stroke: '#C4B5FD', strokeWidth: 0.8 };
    if (isHovered) return { fill: '#0284C7', stroke: '#38BDF8', strokeWidth: 0.8 };

    return { fill: '#24344D', stroke: '#3B4F6E', strokeWidth: 0.4 };
  };

  return (
    <div className="relative w-full h-full bg-[#0B1220] border-2 border-cyan-500/60 rounded-2xl overflow-hidden shadow-2xl">
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
        {onToggleExpand && (
          <button
            onClick={onToggleExpand}
            className="px-2.5 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 hover:text-white rounded-lg transition font-bold text-xs flex items-center gap-1 border border-cyan-500/40 ml-1 shadow-sm active:scale-95"
            title={isExpanded ? "Reducir a recuadro" : "Ampliar en todo el mapa"}
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
        )}
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
                    onMouseEnter={() => {
                      if (cca3) setHoveredCountryCode(cca3);
                    }}
                    onMouseLeave={() => setHoveredCountryCode(null)}
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

          {/* Marcadores Circulares Nítidos e Interactivos para TODAS las islas del Archipiélago */}
          {visibleMarkers.map((island, idx) => {
            const styles = getStyleForCode(island.code);
            const isPulsing = pulsingCountryCode?.toUpperCase() === island.code.toUpperCase();
            const isTarget = targetCountryCode?.toUpperCase() === island.code.toUpperCase();
            const isHovered = hoveredCountryCode?.toUpperCase() === island.code.toUpperCase();
            const isResolved = styles.fill !== '#24344D';

            // Al pasar el ratón sobre cualquier punto de un país, TODOS los puntos de ese país se iluminan juntos
            const dotFill = isPulsing ? '#EF4444' : isHovered ? '#38BDF8' : isResolved ? styles.fill : '#FFFFFF';
            const dotStroke = isPulsing ? '#FEE2E2' : isHovered ? '#FFFFFF' : isResolved ? styles.stroke : '#0F172A';
            const radius = Math.max(0.4, (isHovered ? 1.5 : 1.3) / Math.sqrt(position.zoom));
            const haloRadius = radius * (isHovered ? 2.3 : 1.8);
            const hitRadius = Math.max(1.8, 3.8 / Math.sqrt(position.zoom));

            return (
              <Marker
                key={`carib_m_${island.code}_${idx}`}
                coordinates={island.coords}
              >
                <g
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCountrySelect(island.code);
                  }}
                  onMouseEnter={() => setHoveredCountryCode(island.code)}
                  onMouseLeave={() => setHoveredCountryCode(null)}
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

                  {/* Halo sutil (Resaltado conjunto para todas las islas del mismo país) */}
                  <circle
                    r={haloRadius}
                    fill={isPulsing ? '#EF4444' : isHovered ? '#38BDF8' : isTarget ? '#F59E0B' : dotFill}
                    opacity={isPulsing ? 0.9 : isHovered ? 0.6 : isResolved ? 0.4 : 0.2}
                    className="transition-all duration-150"
                  />

                  {/* Punto central de la isla */}
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
