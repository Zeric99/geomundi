import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
  Marker
} from 'react-simple-maps';
import { Continent, Country, CountryMapStatus } from '../../types/country';
import { CONTINENT_VIEWPORTS, MICROSTATE_CODES } from '../../data/geoAliases';
import { MapTooltip } from './MapTooltip';
import { MapControls } from './MapControls';
import { countriesService } from '../../services/countriesService';
import { FALLBACK_MAP_URL, FALLBACK_COUNTRIES } from '../../data/fallbackCountries';

// Ruta local relativa compatible con GitHub Pages y fallback CDN
const LOCAL_GEO_URL = `${import.meta.env.BASE_URL}data/world-110m.json`;

interface WorldMapProps {
  countryStatuses?: Record<string, CountryMapStatus>;
  selectedCountryCode?: string | null;
  targetCountryCode?: string | null; // País a encontrar o pista activa
  onCountryClick?: (country: Country, cca3: string) => void;
  continent?: Continent;
  enableTooltip?: boolean;
  interactive?: boolean;
  className?: string;
  onSelectContinent?: (continent: Continent) => void;
}

export const WorldMap: React.FC<WorldMapProps> = ({
  countryStatuses = {},
  selectedCountryCode = null,
  targetCountryCode = null,
  onCountryClick,
  continent = 'World',
  enableTooltip = true,
  interactive = true,
  className = '',
  onSelectContinent
}) => {
  const [geoUrl, setGeoUrl] = useState<string>(LOCAL_GEO_URL);
  const [hoveredCountry, setHoveredCountry] = useState<Country | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);
  
  // Coordenadas y nivel de zoom
  const viewport = CONTINENT_VIEWPORTS[continent] || CONTINENT_VIEWPORTS.World;
  const [position, setPosition] = useState<{ coordinates: [number, number]; zoom: number }>({
    coordinates: viewport.center,
    zoom: viewport.zoom
  });

  // Reenfocar suavemente cuando cambie el continente seleccionado
  useEffect(() => {
    const targetVp = CONTINENT_VIEWPORTS[continent] || CONTINENT_VIEWPORTS.World;
    setPosition({
      coordinates: targetVp.center,
      zoom: targetVp.zoom
    });
  }, [continent]);

  const handleZoomIn = () => {
    setPosition(prev => ({
      ...prev,
      zoom: Math.min(prev.zoom * 1.4, 12)
    }));
  };

  const handleZoomOut = () => {
    setPosition(prev => ({
      ...prev,
      zoom: Math.max(prev.zoom / 1.4, 0.9)
    }));
  };

  const handleReset = () => {
    const targetVp = CONTINENT_VIEWPORTS[continent] || CONTINENT_VIEWPORTS.World;
    setPosition({
      coordinates: targetVp.center,
      zoom: targetVp.zoom
    });
  };

  const handleMoveEnd = (pos: { coordinates: [number, number]; zoom: number }) => {
    setPosition(pos);
  };

  // Obtiene el color de relleno y borde según el estado del país
  const getCountryStyles = useCallback((cca3: string | null) => {
    if (!cca3) {
      return {
        fill: '#1E293B',
        stroke: '#334155',
        strokeWidth: 0.5,
        cursor: 'default'
      };
    }

    const upper = cca3.toUpperCase();
    const status = countryStatuses[upper];
    const isSelected = selectedCountryCode?.toUpperCase() === upper;
    const isTarget = targetCountryCode?.toUpperCase() === upper;

    if (status === 'correct') {
      return {
        fill: '#10B981', // Verde esmeralda brillante
        stroke: '#34D399',
        strokeWidth: 1.2,
        cursor: interactive ? 'pointer' : 'default',
        filter: 'drop-shadow(0 0 6px rgba(16, 185, 129, 0.8))'
      };
    }

    if (status === 'wrong') {
      return {
        fill: '#EF4444', // Rojo coral
        stroke: '#F87171',
        strokeWidth: 1.2,
        cursor: interactive ? 'pointer' : 'default',
        filter: 'drop-shadow(0 0 6px rgba(239, 68, 68, 0.8))'
      };
    }

    if (status === 'hint' || isTarget) {
      return {
        fill: '#F59E0B', // Ámbar neón
        stroke: '#FDE047',
        strokeWidth: 1.4,
        cursor: interactive ? 'pointer' : 'default',
        filter: 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.9))'
      };
    }

    if (status === 'selected' || isSelected) {
      return {
        fill: '#8B5CF6', // Púrpura eléctrico
        stroke: '#C4B5FD',
        strokeWidth: 1.4,
        cursor: interactive ? 'pointer' : 'default',
        filter: 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.9))'
      };
    }

    // Estado Neutral por defecto
    return {
      fill: '#24344D',
      stroke: '#3B4F6E',
      strokeWidth: 0.6,
      cursor: interactive ? 'pointer' : 'default'
    };
  }, [countryStatuses, selectedCountryCode, targetCountryCode, interactive]);

  const handleGeographyClick = (geo: any) => {
    if (!interactive || !onCountryClick) return;
    const cca3 = countriesService.resolveGeoCode(geo.properties, geo.id);
    if (cca3) {
      const country = countriesService.getCountryByCode(cca3);
      if (country) {
        onCountryClick(country, cca3);
      }
    }
  };

  const handleDirectCountryClick = (country: Country) => {
    if (!interactive || !onCountryClick) return;
    onCountryClick(country, country.cca3);
  };

  const handleMouseEnter = (geo: any, e: React.MouseEvent) => {
    if (!enableTooltip) return;
    const cca3 = countriesService.resolveGeoCode(geo.properties, geo.id);
    if (cca3) {
      const country = countriesService.getCountryByCode(cca3);
      if (country) {
        setHoveredCountry(country);
        setHoverPosition({ x: e.clientX, y: e.clientY });
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!enableTooltip || !hoveredCountry) return;
    setHoverPosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseLeave = () => {
    setHoveredCountry(null);
    setHoverPosition(null);
  };

  // Microestados a renderizar con marcadores interactivos
  const microstateCountries = useMemo(() => {
    const all = FALLBACK_COUNTRIES;
    return all.filter(c => {
      const isMicro = MICROSTATE_CODES.has(c.cca3.toUpperCase());
      if (!isMicro) return false;
      if (continent === 'World') return true;
      return c.continent === continent;
    });
  }, [continent]);

  return (
    <div
      className={`relative w-full h-full min-h-[420px] bg-gradient-to-b from-[#090D16] via-[#0D1524] to-[#0A101C] rounded-2xl overflow-hidden border border-slate-800/80 shadow-2xl select-none ${className}`}
      onMouseMove={handleMouseMove}
    >
      {/* Rejilla de Fondo / Efecto de Coordenadas de Radar */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.15) 0%, transparent 70%),
            linear-gradient(to right, rgba(56, 189, 248, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(56, 189, 248, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 40px 40px, 40px 40px'
        }}
      />

      {/* Controles de Zoom y Centrado */}
      <MapControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleReset}
        currentContinent={continent}
        onSelectContinent={onSelectContinent}
        zoomLevel={position.zoom}
      />

      {/* Leyenda rápida interactiva */}
      <div className="absolute bottom-3 left-3 z-20 hidden sm:flex items-center gap-3 bg-[#131C2E]/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60 text-[11px] text-slate-300 font-medium">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-glow-emerald" />
          <span>Acierto</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-glow-rose" />
          <span>Fallo</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-glow-amber" />
          <span>Pista</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-glow-purple" />
          <span>Selección</span>
        </div>
        <div className="flex items-center gap-1.5 pl-1 border-l border-slate-700">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-cyan-300">📍 Microestados/Islas</span>
        </div>
      </div>

      {/* Mapa Vectorial SVG */}
      <ComposableMap
        projection="geoEqualEarth"
        projectionConfig={{
          scale: 160,
        }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        <ZoomableGroup
          zoom={position.zoom}
          center={position.coordinates}
          onMoveEnd={handleMoveEnd}
          minZoom={0.8}
          maxZoom={12}
        >
          {/* Polígonos de Países Principales */}
          <Geographies
            geography={geoUrl}
            onError={() => {
              console.warn('Fallo cargando GeoJSON local, intentando CDN...');
              if (geoUrl !== FALLBACK_MAP_URL) {
                setGeoUrl(FALLBACK_MAP_URL);
              }
            }}
          >
            {({ geographies }: { geographies: any[] }) =>
              geographies.map((geo: any) => {
                const cca3 = countriesService.resolveGeoCode(geo.properties, geo.id);
                const styles = getCountryStyles(cca3);
                const isHovered = hoveredCountry?.cca3?.toUpperCase() === cca3?.toUpperCase();

                return (
                  <Geography
                    key={geo.rsmKey || geo.id || cca3}
                    geography={geo}
                    onClick={() => handleGeographyClick(geo)}
                    onMouseEnter={(e: any) => handleMouseEnter(geo, e)}
                    onMouseLeave={handleMouseLeave}
                    style={{
                      default: {
                        fill: styles.fill,
                        stroke: styles.stroke,
                        strokeWidth: styles.strokeWidth,
                        outline: 'none',
                        transition: 'all 200ms ease-out',
                        filter: styles.filter || 'none'
                      },
                      hover: {
                        fill: isHovered && styles.fill === '#24344D' ? '#0284C7' : styles.fill,
                        stroke: '#38BDF8',
                        strokeWidth: 1.5,
                        outline: 'none',
                        cursor: styles.cursor,
                        filter: 'drop-shadow(0 0 6px rgba(56, 189, 248, 0.8))'
                      },
                      pressed: {
                        fill: '#0369A1',
                        stroke: '#7DD3FC',
                        strokeWidth: 1.8,
                        outline: 'none',
                      }
                    }}
                  />
                );
              })
            }
          </Geographies>

          {/* Marcadores Interactivos para Microestados e Islas Pequeñas */}
          {microstateCountries.map((country) => {
            const cca3 = country.cca3.toUpperCase();
            const styles = getCountryStyles(cca3);
            const isHovered = hoveredCountry?.cca3?.toUpperCase() === cca3;
            const isTarget = targetCountryCode?.toUpperCase() === cca3;
            
            // Coordenadas [longitud, latitud] requeridas por react-simple-maps
            const coords: [number, number] = [country.latlng[1], country.latlng[0]];
            
            // Radio adaptativo que se mantiene cómodo y nítido con el zoom
            const baseR = Math.max(2.5, 4.5 / Math.sqrt(position.zoom));
            const haloR = baseR * 1.8;

            return (
              <Marker
                key={`microstate_${cca3}`}
                coordinates={coords}
              >
                <g
                  onClick={() => handleDirectCountryClick(country)}
                  onMouseEnter={(e: any) => {
                    if (enableTooltip) {
                      setHoveredCountry(country);
                      setHoverPosition({ x: e.clientX, y: e.clientY });
                    }
                  }}
                  onMouseLeave={handleMouseLeave}
                  className="cursor-pointer transition-transform duration-150 hover:scale-125"
                >
                  {/* Halo exterior pulsante para microestados / pistas */}
                  <circle
                    r={haloR}
                    fill={isTarget ? '#F59E0B' : styles.fill !== '#24344D' ? styles.fill : '#06B6D4'}
                    opacity={isHovered ? 0.6 : isTarget ? 0.7 : 0.25}
                    className={isTarget ? 'animate-ping' : ''}
                  />

                  {/* Círculo central táctil */}
                  <circle
                    r={baseR}
                    fill={styles.fill !== '#24344D' ? styles.fill : isHovered ? '#38BDF8' : '#06B6D4'}
                    stroke={styles.stroke !== '#3B4F6E' ? styles.stroke : '#CFFAFE'}
                    strokeWidth={Math.max(0.6, 1.2 / Math.sqrt(position.zoom))}
                    style={{
                      filter: isHovered || isTarget ? 'drop-shadow(0 0 4px #38BDF8)' : 'none'
                    }}
                  />

                  {/* Zona de impacto táctil invisible más grande para facilitar el clic en móviles */}
                  <circle
                    r={Math.max(8, 12 / Math.sqrt(position.zoom))}
                    fill="transparent"
                  />
                </g>
              </Marker>
            );
          })}
        </ZoomableGroup>
      </ComposableMap>

      {/* Tooltip con información del país */}
      {enableTooltip && (
        <MapTooltip
          country={hoveredCountry}
          position={hoverPosition}
          status={hoveredCountry ? countryStatuses[hoveredCountry.cca3.toUpperCase()] : undefined}
        />
      )}
    </div>
  );
};
