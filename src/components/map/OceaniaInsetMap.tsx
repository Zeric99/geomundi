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

interface OceaniaInsetMapProps {
  countryStatuses?: Record<string, CountryMapStatus>;
  selectedCountryCode?: string | null;
  targetCountryCode?: string | null;
  pulsingCountryCode?: string | null;
  onCountryClick?: (country: Country, cca3: string) => void;
  isGeekMode?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

interface PacificMarkerDef {
  code: string;
  name: string;
  islandName: string;
  coords: [number, number]; // [longitude, latitude]
  isGeekOnly?: boolean;
}

// Coordenadas cartográficas continuas para situar todas las islas del Pacífico a la derecha de Australia
const PACIFIC_MARKERS: PacificMarkerDef[] = [
  // Micronesia (Estados Federados de Micronesia) - 4 Estados
  { code: 'FSM', name: 'Micronesia (FSM)', islandName: 'Pohnpei', coords: [158.21, 6.92] },
  { code: 'FSM', name: 'Micronesia (FSM)', islandName: 'Chuuk', coords: [151.84, 7.42] },
  { code: 'FSM', name: 'Micronesia (FSM)', islandName: 'Yap', coords: [138.12, 9.53] },
  { code: 'FSM', name: 'Micronesia (FSM)', islandName: 'Kosrae', coords: [162.98, 5.31] },

  // Kiribati - 3 Grupos de Islas (Gilbert, Phoenix, Línea)
  { code: 'KIR', name: 'Kiribati', islandName: 'Islas Gilbert (Tarawa)', coords: [172.97, 1.45] },
  { code: 'KIR', name: 'Kiribati', islandName: 'Islas Phoenix (Kanton)', coords: [188.30, -3.10] },
  { code: 'KIR', name: 'Kiribati', islandName: 'Islas de la Línea (Kiritimati)', coords: [202.65, 1.85] },

  // Islas Marshall - 2 Cadenas
  { code: 'MHL', name: 'Islas Marshall', islandName: 'Cadena Ratak (Majuro)', coords: [171.37, 7.10] },
  { code: 'MHL', name: 'Islas Marshall', islandName: 'Cadena Ralik (Kwajalein)', coords: [167.73, 8.71] },

  // Palaos
  { code: 'PLW', name: 'Palaos', islandName: 'Babeldaob & Koror', coords: [134.58, 7.51] },

  // Nauru
  { code: 'NRU', name: 'Nauru', islandName: 'Nauru', coords: [166.93, -0.52] },

  // Tuvalu
  { code: 'TUV', name: 'Tuvalu', islandName: 'Funafuti', coords: [179.20, -8.52] },
  { code: 'TUV', name: 'Tuvalu', islandName: 'Islas del Norte (Nanumea)', coords: [177.64, -7.10] },

  // Islas Salomón
  { code: 'SLB', name: 'Islas Salomón', islandName: 'Guadalcanal', coords: [160.15, -9.64] },
  { code: 'SLB', name: 'Islas Salomón', islandName: 'Malaita', coords: [160.70, -8.90] },
  { code: 'SLB', name: 'Islas Salomón', islandName: 'Nueva Georgia', coords: [157.60, -8.20] },

  // Vanuatu
  { code: 'VUT', name: 'Vanuatu', islandName: 'Éfaté (Port Vila)', coords: [168.32, -17.73] },
  { code: 'VUT', name: 'Vanuatu', islandName: 'Espiritu Santo', coords: [166.85, -15.35] },
  { code: 'VUT', name: 'Vanuatu', islandName: 'Malakula & Tanna', coords: [169.35, -19.50] },

  // Fiyi
  { code: 'FJI', name: 'Fiyi', islandName: 'Viti Levu (Suva)', coords: [178.06, -17.71] },
  { code: 'FJI', name: 'Fiyi', islandName: 'Vanua Levu', coords: [179.30, -16.60] },

  // Samoa & Samoa Americana (Polinesia - Este de Fiyi)
  { code: 'WSM', name: 'Samoa', islandName: 'Upolu (Apia)', coords: [188.25, -13.90] },
  { code: 'WSM', name: 'Samoa', islandName: "Savai'i", coords: [187.55, -13.55] },
  { code: 'ASM', name: 'Samoa Americana', islandName: 'Tutuila (Pago Pago)', coords: [189.30, -14.27], isGeekOnly: true },

  // Tonga
  { code: 'TON', name: 'Tonga', islandName: "Tongatapu (Nuku'alofa)", coords: [184.81, -21.17] },
  { code: 'TON', name: 'Tonga', islandName: "Ha'apai & Vava'u", coords: [185.85, -19.20] },

  // Polinesia Francesa
  { code: 'PYF', name: 'Polinesia Francesa', islandName: 'Tahití (Sociedad)', coords: [210.60, -17.67], isGeekOnly: true },
  { code: 'PYF', name: 'Polinesia Francesa', islandName: 'Islas Tuamotu', coords: [219.25, -16.00], isGeekOnly: true },
  { code: 'PYF', name: 'Polinesia Francesa', islandName: 'Islas Marquesas', coords: [220.50, -9.00], isGeekOnly: true },

  // Islas Cook & Niue
  { code: 'COK', name: 'Islas Cook', islandName: 'Rarotonga', coords: [200.23, -21.23], isGeekOnly: true },
  { code: 'COK', name: 'Islas Cook', islandName: 'Aitutaki', coords: [200.22, -18.85], isGeekOnly: true },
  { code: 'NIU', name: 'Niue', islandName: 'Niue', coords: [190.14, -19.05], isGeekOnly: true },

  // Tokelau & Wallis y Futuna
  { code: 'TKL', name: 'Tokelau', islandName: 'Tokelau', coords: [188.15, -9.20], isGeekOnly: true },
  { code: 'WLF', name: 'Wallis y Futuna', islandName: 'Wallis & Futuna', coords: [183.80, -13.30], isGeekOnly: true },

  // Pitcairn & Norfolk
  { code: 'PCN', name: 'Islas Pitcairn', islandName: 'Pitcairn', coords: [229.90, -25.07], isGeekOnly: true },
  { code: 'NFK', name: 'Isla Norfolk', islandName: 'Norfolk', coords: [167.95, -29.04], isGeekOnly: true },

  // Islas Australianas del Océano Índico
  { code: 'CXR', name: 'Isla de Navidad', islandName: 'Isla de Navidad (Christmas Island)', coords: [105.69, -10.45], isGeekOnly: true },
  { code: 'CCK', name: 'Islas Cocos', islandName: 'Islas Cocos (Keeling)', coords: [96.87, -12.16], isGeekOnly: true },

  // Guam & Marianas del Norte
  { code: 'GUM', name: 'Guam', islandName: 'Guam', coords: [144.79, 13.44], isGeekOnly: true },
  { code: 'MNP', name: 'Islas Marianas', islandName: 'Saipán & Tinian', coords: [145.75, 15.18], isGeekOnly: true },

  // Nueva Caledonia
  { code: 'NCL', name: 'Nueva Caledonia', islandName: 'Grande Terre (Nouméa)', coords: [165.61, -20.90], isGeekOnly: true },
  { code: 'NCL', name: 'Nueva Caledonia', islandName: 'Islas de la Lealtad (Lifou)', coords: [167.25, -20.90], isGeekOnly: true },

  // Papúa Nueva Guinea
  { code: 'PNG', name: 'Papúa Nueva Guinea', islandName: 'Nueva Guinea', coords: [143.95, -6.31] },
  { code: 'PNG', name: 'Papúa Nueva Guinea', islandName: 'Nueva Bretaña & Bougainville', coords: [152.50, -5.50] },

  // Australia & Nueva Zelanda
  { code: 'AUS', name: 'Australia', islandName: 'Australia', coords: [133.77, -25.27] },
  { code: 'AUS', name: 'Australia', islandName: 'Tasmania', coords: [146.80, -42.00] },
  { code: 'NZL', name: 'Nueva Zelanda', islandName: 'Isla Norte & Isla Sur', coords: [174.88, -40.90] }
];

export const OceaniaInsetMap: React.FC<OceaniaInsetMapProps> = ({
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
    coordinates: isExpanded ? [172, -14] : [170, -14],
    zoom: isExpanded ? 5.8 : 3.2
  });

  // Ajustar coordenadas y zoom al expandir o reducir
  useEffect(() => {
    if (isExpanded) {
      setPosition({ coordinates: [172, -14], zoom: 5.8 });
    } else {
      setPosition({ coordinates: [170, -14], zoom: 3.2 });
    }
  }, [isExpanded]);

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
        <span className="text-base">🌊</span>
        <span>Oceanía & Pacífico {isExpanded ? '(Vista Ampliada)' : ''}</span>
      </div>

      {/* Controles de Zoom del Inset */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-1 bg-slate-900/95 backdrop-blur-md p-1.5 rounded-xl border border-slate-700 shadow-xl">
        <button
          onClick={() => setPosition(p => ({ ...p, zoom: Math.min(p.zoom * 1.35, 25) }))}
          className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition"
          title="Zoom +"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setPosition(p => ({ ...p, zoom: Math.max(p.zoom / 1.35, 1.2) }))}
          className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition"
          title="Zoom -"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => setPosition({ coordinates: [170, -14], zoom: isExpanded ? 5.8 : 3.2 })}
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

      {/* Mapa Vectorial del Pacífico */}
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
                    onMouseEnter={() => {
                      if (cca3) setHoveredCountryCode(cca3);
                    }}
                    onMouseLeave={() => setHoveredCountryCode(null)}
                    style={{
                      default: {
                        fill: styles.fill,
                        stroke: styles.stroke,
                        strokeWidth: styles.strokeWidth / Math.sqrt(position.zoom / 3.2),
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

          {/* Marcadores Circulares Nítidos e Interactivos para TODAS las islas de los Archipiélagos */}
          {visibleMarkers.map((island, idx) => {
            const styles = getStyleForCode(island.code);
            const isPulsing = pulsingCountryCode?.toUpperCase() === island.code.toUpperCase();
            const isTarget = targetCountryCode?.toUpperCase() === island.code.toUpperCase();
            const isHovered = hoveredCountryCode?.toUpperCase() === island.code.toUpperCase();
            const isResolved = styles.fill !== '#24344D';

            // Al pasar el ratón sobre cualquier punto de un país, TODOS los puntos de ese país se iluminan juntos
            const dotFill = isPulsing ? '#EF4444' : isHovered ? '#38BDF8' : isResolved ? styles.fill : '#FFFFFF';
            const dotStroke = isPulsing ? '#FEE2E2' : isHovered ? '#FFFFFF' : isResolved ? styles.stroke : '#0F172A';
            const radius = Math.max(0.4, (isHovered ? 1.5 : 1.3) / Math.sqrt(position.zoom / 3.2));
            const haloRadius = radius * (isHovered ? 2.3 : 1.8);
            const hitRadius = Math.max(1.8, 4.2 / Math.sqrt(position.zoom / 3.2));

            return (
              <Marker
                key={`pacific_m_${island.code}_${idx}`}
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
