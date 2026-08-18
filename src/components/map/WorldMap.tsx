import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
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
import { CaribbeanInsetMap } from './CaribbeanInsetMap';
import { OceaniaInsetMap } from './OceaniaInsetMap';
import { countriesService } from '../../services/countriesService';
import { FALLBACK_MAP_URL, FALLBACK_COUNTRIES, GEEK_TERRITORIES } from '../../data/fallbackCountries';
import { Maximize2, Minimize2, Eye, EyeOff } from 'lucide-react';

// Mapa de alta resolución 1:50,000,000 con todos los contornos geográficos reales
const LOCAL_GEO_URL = `${import.meta.env.BASE_URL}data/world-50m.json`;

// Paleta de estilos de alto rendimiento optimizada para renderizado GPU sin cuellos de botella
const BASE_STYLES = {
  correct: { fill: '#10B981', stroke: '#34D399', strokeWidth: 0.5 },
  wrong: { fill: '#EF4444', stroke: '#F87171', strokeWidth: 0.6 },
  hint: { fill: '#F59E0B', stroke: '#FDE047', strokeWidth: 0.6 },
  selected: { fill: '#8B5CF6', stroke: '#C4B5FD', strokeWidth: 0.7 },
  neutral: { fill: '#24344D', stroke: '#3B4F6E', strokeWidth: 0.35 },
  hover: { fill: '#0284C7', stroke: '#38BDF8', strokeWidth: 0.6 }
};

// Códigos de islas gestionadas por las ventanas Inset para evitar duplicación y solapamiento en el mapa global
const INSET_CARIBBEAN_CODES = new Set([
  'BHS', 'TCA', 'CUB', 'JAM', 'HTI', 'DOM', 'PRI', 'CYM', 'VGB', 'VIR',
  'AIA', 'SXM', 'BLM', 'KNA', 'ATG', 'MSR', 'GLP', 'DMA', 'MTQ', 'LCA',
  'BRB', 'VCT', 'GRD', 'TTO', 'ABW', 'CUW', 'BES'
]);

const INSET_PACIFIC_CODES = new Set([
  'PLW', 'GUM', 'MNP', 'FSM', 'MHL', 'NRU', 'KIR', 'SLB', 'VUT', 'NCL',
  'FJI', 'TUV', 'WLF', 'WSM', 'ASM', 'TON', 'NIU', 'COK', 'PYF',
  'CXR', 'CCK', 'NFK', 'PCN', 'TKL', 'HMD'
]);

// Coordenadas calibradas con separación para microestados contiguos (Hong Kong, Macao, etc.)
const MICROSTATE_OFFSETS: Record<string, [number, number]> = {
  HKG: [114.32, 22.38], // Hong Kong (Este del Delta del Río Perla)
  MAC: [113.35, 22.02], // Macao (Oeste del Delta del Río Perla)
  GIB: [-5.35, 36.14],
  MCO: [7.42, 43.73],
  SMR: [12.45, 43.94],
  VAT: [12.45, 41.90],
  AND: [1.52, 42.50],
  LIE: [9.55, 47.16],
  LUX: [6.13, 49.81],
  MLT: [14.37, 35.93],
  BHR: [50.55, 26.06],
  SGP: [103.82, 1.35],
  BRN: [114.94, 4.53],
  MDV: [73.50, 4.17]
};

interface WorldMapProps {
  countryStatuses?: Record<string, CountryMapStatus>;
  selectedCountryCode?: string | null;
  targetCountryCode?: string | null; // País a encontrar o pista activa
  pulsingCountryCode?: string | null; // País a resaltar con parpadeo y centrado de cámara
  onCountryClick?: (country: Country, cca3: string) => void;
  continent?: Continent;
  enableTooltip?: boolean;
  interactive?: boolean;
  className?: string;
  onSelectContinent?: (continent: Continent) => void;
  isGeekMode?: boolean;
}

export const WorldMap: React.FC<WorldMapProps> = ({
  countryStatuses = {},
  selectedCountryCode = null,
  targetCountryCode = null,
  pulsingCountryCode = null,
  onCountryClick,
  continent = 'World',
  enableTooltip = true,
  interactive = true,
  className = '',
  onSelectContinent,
  isGeekMode = false
}) => {
  const [geoUrl, setGeoUrl] = useState<string>(LOCAL_GEO_URL);
  const [hoveredCountry, setHoveredCountry] = useState<Country | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);

  // Estados de visibilidad de las ventanas de Inset (Caribe y Oceanía)
  const [showCaribbeanInset, setShowCaribbeanInset] = useState<boolean>(true);
  const [showOceaniaInset, setShowOceaniaInset] = useState<boolean>(true);
  const [expandedInset, setExpandedInset] = useState<'caribbean' | 'oceania' | null>(null);

  // Detección de arrastre vs. clic optimizada
  const pointerDownPos = useRef<{ x: number; y: number; time: number } | null>(null);
  const isDraggingRef = useRef<boolean>(false);

  // Estado persistido de visualización de nombres/capitales en hover
  const [tooltipsEnabled, setTooltipsEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('geomundi_show_tooltips');
      return saved !== null ? saved === 'true' : true;
    } catch (e) {
      return true;
    }
  });

  const toggleTooltips = useCallback(() => {
    setTooltipsEnabled(prev => {
      const next = !prev;
      try {
        localStorage.setItem('geomundi_show_tooltips', String(next));
      } catch (e) {}
      if (!next) {
        setHoveredCountry(null);
        setHoverPosition(null);
      }
      return next;
    });
  }, []);
  
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

  // Centrar cámara automáticamente en país que se pide resaltar (por fallo)
  useEffect(() => {
    if (pulsingCountryCode) {
      const country = countriesService.getCountryByCode(pulsingCountryCode);
      if (country && country.latlng && country.latlng.length === 2) {
        setPosition(prev => ({
          coordinates: [country.latlng[1], country.latlng[0]],
          zoom: Math.max(prev.zoom, 3.4)
        }));
      }
    }
  }, [pulsingCountryCode]);

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

  // Manejadores para discernir entre clic y arrastre (pan)
  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0]?.clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0]?.clientY : (e as React.MouseEvent).clientY;
    if (clientX !== undefined && clientY !== undefined) {
      pointerDownPos.current = { x: clientX, y: clientY, time: Date.now() };
      isDraggingRef.current = false;
    }
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0]?.clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0]?.clientY : (e as React.MouseEvent).clientY;
    if (pointerDownPos.current && clientX !== undefined && clientY !== undefined) {
      const dist = Math.hypot(clientX - pointerDownPos.current.x, clientY - pointerDownPos.current.y);
      if (dist > 12) {
        isDraggingRef.current = true;
      }
    }
    // Durante el arrastre NO actualizamos coordenadas de tooltip para evitar re-renderizados continuos
    if (!isDraggingRef.current && 'clientX' in e) {
      handleMouseMove(e as React.MouseEvent);
    }
  };

  const handlePointerUp = () => {
    if (pointerDownPos.current && Date.now() - pointerDownPos.current.time < 300) {
      isDraggingRef.current = false;
    }
    setTimeout(() => {
      isDraggingRef.current = false;
      pointerDownPos.current = null;
    }, 50);
  };

  // Obtiene el color de relleno y borde ultra-optimizado (sin filtros CSS pesados)
  const getCountryStyles = useCallback((cca3: string | null) => {
    if (!cca3) {
      return BASE_STYLES.neutral;
    }

    const upper = cca3.toUpperCase();
    const isPulsing = pulsingCountryCode?.toUpperCase() === upper;
    const status = countryStatuses[upper];
    const isSelected = selectedCountryCode?.toUpperCase() === upper;
    const isTarget = targetCountryCode?.toUpperCase() === upper;

    if (isPulsing) {
      return { fill: '#EF4444', stroke: '#FEE2E2', strokeWidth: 0.9 };
    }
    if (status === 'correct') {
      return BASE_STYLES.correct;
    }
    if (status === 'wrong') {
      return BASE_STYLES.wrong;
    }
    if (status === 'hint' || isTarget) {
      return BASE_STYLES.hint;
    }
    if (status === 'selected' || isSelected) {
      return BASE_STYLES.selected;
    }

    return BASE_STYLES.neutral;
  }, [countryStatuses, selectedCountryCode, targetCountryCode, pulsingCountryCode]);

  const handleGeographyClick = (geo: any) => {
    if (!interactive || !onCountryClick || isDraggingRef.current) return;
    const cca3 = countriesService.resolveGeoCode(geo.properties, geo.id);
    if (cca3) {
      const country = countriesService.getCountryByCode(cca3) || ({
        cca2: '',
        cca3,
        ccn3: '',
        nameEs: geo.properties?.name || cca3,
        nameEn: geo.properties?.name || cca3,
        officialNameEs: geo.properties?.name || cca3,
        capital: 'N/A',
        continent: 'World',
        continentEs: 'Mundo',
        population: 0,
        flagSvg: '',
        flagEmoji: '🏳️',
        latlng: [0, 0],
        altSpellings: []
      } as Country);
      onCountryClick(country, cca3);
    }
  };

  const handleDirectCountryClick = (country: Country) => {
    if (!interactive || !onCountryClick || isDraggingRef.current) return;
    onCountryClick(country, country.cca3);
  };

  const handleMouseEnter = (geo: any, e: React.MouseEvent) => {
    if (!enableTooltip || !tooltipsEnabled || isDraggingRef.current) return;
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
    if (!enableTooltip || !tooltipsEnabled || !hoveredCountry || isDraggingRef.current) return;
    setHoverPosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseLeave = () => {
    setHoveredCountry(null);
    setHoverPosition(null);
  };

  // Microestados a renderizar en el mapa global (excluyendo Caribe y Pacífico para que no se solapen con las ventanas Inset)
  const microstateCountries = useMemo(() => {
    const all = isGeekMode ? [...FALLBACK_COUNTRIES, ...GEEK_TERRITORIES] : FALLBACK_COUNTRIES;
    return all.filter(c => {
      const upper = c.cca3.toUpperCase();
      const isMicro = MICROSTATE_CODES.has(upper);
      if (!isMicro) return false;
      
      // Si estamos en vista Mundial o en América/Oceanía, las islas del Caribe y Pacífico se gestionan en las ventanas Inset
      if (INSET_CARIBBEAN_CODES.has(upper) || INSET_PACIFIC_CODES.has(upper)) {
        return false;
      }

      if (continent === 'World') return true;
      return c.continent === continent;
    });
  }, [continent, isGeekMode]);

  // País actualmente parpadeando por fallo
  const pulsingCountry = useMemo(() => {
    if (!pulsingCountryCode) return null;
    return countriesService.getCountryByCode(pulsingCountryCode);
  }, [pulsingCountryCode]);

  // Determinar si mostramos los recuadros Inset
  const showCaribbean = (continent === 'World' || continent === 'Americas') && showCaribbeanInset;
  const showOceania = (continent === 'World' || continent === 'Oceania') && showOceaniaInset;

  return (
    <div
      className={`relative w-full h-full min-h-[440px] bg-gradient-to-b from-[#090D16] via-[#0D1524] to-[#0A101C] rounded-2xl overflow-hidden border border-slate-800/80 shadow-2xl select-none ${className}`}
      onMouseDown={handlePointerDown}
      onMouseMove={handlePointerMove}
      onMouseUp={handlePointerUp}
      onTouchStart={handlePointerDown}
      onTouchMove={handlePointerMove}
      onTouchEnd={handlePointerUp}
      style={{ transform: 'translateZ(0)', willChange: 'transform' }}
    >
      {/* Rejilla de Fondo / Efecto de Coordenadas */}
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

      {/* Controles de Zoom, Centrado y Toggle de Tooltips */}
      <MapControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleReset}
        currentContinent={continent}
        onSelectContinent={onSelectContinent}
        zoomLevel={position.zoom}
        tooltipsEnabled={tooltipsEnabled}
        onToggleTooltips={toggleTooltips}
      />

      {/* Leyenda rápida interactiva (esquina superior central) */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 hidden lg:flex items-center gap-3 bg-[#131C2E]/85 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-700/60 text-[11px] text-slate-300 font-medium shadow-lg">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span>Acierto</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span>Fallo</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span>Pista</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
          <span>Selección</span>
        </div>
      </div>

      {/* RECUADRO INSET: EL CARIBE & ANTILLAS */}
      {showCaribbean && expandedInset !== 'oceania' && (
        <div className={`transition-all duration-300 ${
          expandedInset === 'caribbean'
            ? 'absolute inset-2 sm:inset-4 z-40 shadow-2xl rounded-2xl overflow-hidden'
            : 'absolute bottom-3 left-3 z-30 w-56 sm:w-72 md:w-80 h-40 sm:h-48 shadow-2xl rounded-2xl overflow-hidden'
        }`}>
          <CaribbeanInsetMap
            countryStatuses={countryStatuses}
            selectedCountryCode={selectedCountryCode}
            targetCountryCode={targetCountryCode}
            pulsingCountryCode={pulsingCountryCode}
            onCountryClick={onCountryClick}
            isGeekMode={isGeekMode}
            isExpanded={expandedInset === 'caribbean'}
            onToggleExpand={() => setExpandedInset(expandedInset === 'caribbean' ? null : 'caribbean')}
          />
          {expandedInset !== 'caribbean' && (
            <button
              onClick={() => setShowCaribbeanInset(false)}
              className="absolute top-1 right-1 p-1 bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white rounded-md transition-colors"
              title="Minimizar recuadro del Caribe"
            >
              <EyeOff className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* RECUADRO INSET: OCEANÍA & PACÍFICO */}
      {showOceania && expandedInset !== 'caribbean' && (
        <div className={`transition-all duration-300 ${
          expandedInset === 'oceania'
            ? 'absolute inset-2 sm:inset-4 z-40 shadow-2xl rounded-2xl overflow-hidden'
            : 'absolute bottom-3 right-3 z-30 w-60 sm:w-80 md:w-96 h-40 sm:h-48 shadow-2xl rounded-2xl overflow-hidden'
        }`}>
          <OceaniaInsetMap
            countryStatuses={countryStatuses}
            selectedCountryCode={selectedCountryCode}
            targetCountryCode={targetCountryCode}
            pulsingCountryCode={pulsingCountryCode}
            onCountryClick={onCountryClick}
            isGeekMode={isGeekMode}
            isExpanded={expandedInset === 'oceania'}
            onToggleExpand={() => setExpandedInset(expandedInset === 'oceania' ? null : 'oceania')}
          />
          {expandedInset !== 'oceania' && (
            <button
              onClick={() => setShowOceaniaInset(false)}
              className="absolute top-1 right-1 p-1 bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white rounded-md transition-colors"
              title="Minimizar recuadro de Oceanía"
            >
              <EyeOff className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Botones para restaurar los recuadros si se cerraron */}
      {(!showCaribbeanInset || !showOceaniaInset) && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 shadow-xl">
          {!showCaribbeanInset && (
            <button
              onClick={() => setShowCaribbeanInset(true)}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-cyan-300 rounded-lg flex items-center gap-1 border border-slate-600"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Ver Caribe</span>
            </button>
          )}
          {!showOceaniaInset && (
            <button
              onClick={() => setShowOceaniaInset(true)}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-cyan-300 rounded-lg flex items-center gap-1 border border-slate-600"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Ver Oceanía</span>
            </button>
          )}
        </div>
      )}

      {/* Mapa Vectorial SVG en Alta Resolución 50m con aceleración por hardware */}
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
          maxZoom={14}
        >
          {/* Polígonos Geográficos Reales de Países e Islas (50m High-Res) */}
          <Geographies
            geography={geoUrl}
            onError={() => {
              console.warn('Fallo cargando GeoJSON 50m local, intentando CDN...');
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
                        fill: isHovered && styles.fill === '#24344D' ? BASE_STYLES.hover.fill : styles.fill,
                        stroke: isHovered ? BASE_STYLES.hover.stroke : styles.stroke,
                        strokeWidth: isHovered ? BASE_STYLES.hover.strokeWidth : styles.strokeWidth,
                        outline: 'none',
                        vectorEffect: 'non-scaling-stroke'
                      },
                      hover: {
                        fill: BASE_STYLES.hover.fill,
                        stroke: BASE_STYLES.hover.stroke,
                        strokeWidth: BASE_STYLES.hover.strokeWidth,
                        outline: 'none',
                        cursor: interactive ? 'pointer' : 'default',
                        vectorEffect: 'non-scaling-stroke'
                      },
                      pressed: {
                        fill: '#0369A1',
                        stroke: '#7DD3FC',
                        strokeWidth: 0.7,
                        outline: 'none',
                        vectorEffect: 'non-scaling-stroke'
                      }
                    }}
                  />
                );
              })
            }
          </Geographies>

          {/* Marcadores para Microestados de Europa, África y Asia (excluyendo Caribe y Pacífico que van en los Insets) */}
          {microstateCountries.map((country) => {
            const cca3 = country.cca3.toUpperCase();
            const styles = getCountryStyles(cca3);
            const isHovered = hoveredCountry?.cca3?.toUpperCase() === cca3;
            const isPulsing = pulsingCountryCode?.toUpperCase() === cca3;
            const isResolved = styles.fill !== '#24344D';
            
            const dotFill = isPulsing ? '#EF4444' : isResolved ? styles.fill : isHovered ? '#38BDF8' : '#FFFFFF';
            const haloFill = isPulsing ? '#EF4444' : isResolved ? styles.fill : isHovered ? '#38BDF8' : '#FFFFFF';
            const dotStroke = isPulsing ? '#FEE2E2' : isResolved ? styles.stroke : isHovered ? '#0284C7' : '#64748B';
            
            const coords: [number, number] = MICROSTATE_OFFSETS[cca3] || [country.latlng[1], country.latlng[0]];
            
            const baseR = Math.max(0.65, 1.3 / Math.sqrt(position.zoom));
            const haloR = baseR * 1.3;
            const hitR = Math.max(2.2, 4.0 / Math.sqrt(position.zoom));

            return (
              <Marker
                key={`microstate_${cca3}`}
                coordinates={coords}
              >
                <g
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDirectCountryClick(country);
                  }}
                  onMouseEnter={(e: any) => {
                    if (enableTooltip && tooltipsEnabled && !isDraggingRef.current) {
                      setHoveredCountry(country);
                      setHoverPosition({ x: e.clientX, y: e.clientY });
                    }
                  }}
                  onMouseLeave={handleMouseLeave}
                  className="cursor-pointer"
                >
                  {/* Halo sutil */}
                  <circle
                    r={haloR}
                    fill={haloFill}
                    opacity={isPulsing ? 0.9 : isHovered ? 0.7 : isResolved ? 0.3 : 0.15}
                  />

                  {/* Punto central */}
                  <circle
                    r={baseR}
                    fill={dotFill}
                    stroke={dotStroke}
                    strokeWidth={0.4}
                  />

                  {/* Zona de impacto táctil */}
                  <circle
                    r={hitR}
                    fill="transparent"
                  />
                </g>
              </Marker>
            );
          })}

          {/* Baliza Radar Superpuesta para País Fallado */}
          {pulsingCountry && (
            <Marker coordinates={[pulsingCountry.latlng[1], pulsingCountry.latlng[0]]}>
              <g className="pointer-events-none">
                <circle
                  r={Math.max(6, 16 / Math.sqrt(position.zoom))}
                  fill="rgba(239, 68, 68, 0.25)"
                  stroke="#EF4444"
                  strokeWidth={0.8}
                  className="animate-ping"
                />
                <circle
                  r={Math.max(2.5, 6 / Math.sqrt(position.zoom))}
                  fill="#EF4444"
                  stroke="#FFFFFF"
                  strokeWidth={0.5}
                />
                <g transform={`translate(0, -${Math.max(5, 12 / Math.sqrt(position.zoom))})`}>
                  <text
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize={Math.max(2.5, 4.8 / Math.sqrt(position.zoom))}
                    fontWeight="900"
                    className="select-none drop-shadow-[0_2px_4px_rgba(0,0,0,1)]"
                  >
                    📍 {pulsingCountry.flagEmoji} {pulsingCountry.nameEs}
                  </text>
                </g>
              </g>
            </Marker>
          )}
        </ZoomableGroup>
      </ComposableMap>

      {/* Tooltip con información del país al pasar el cursor */}
      {enableTooltip && tooltipsEnabled && !isDraggingRef.current && (
        <MapTooltip
          country={hoveredCountry}
          position={hoverPosition}
          status={hoveredCountry ? countryStatuses[hoveredCountry.cca3.toUpperCase()] : undefined}
        />
      )}
    </div>
  );
};
