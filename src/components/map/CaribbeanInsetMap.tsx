import React, { useMemo } from 'react';
import { Country, CountryMapStatus } from '../../types/country';
import { countriesService } from '../../services/countriesService';

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
  x: number; // SVG coordinates (0-400, 0-250)
  y: number;
  labelPosition?: 'top' | 'bottom' | 'left' | 'right';
  isMajorIsland?: boolean;
  isGeekOnly?: boolean;
}

// Coordenadas calibradas del Caribe para evitar CUALQUIER solapamiento
const CARIBBEAN_ISLANDS: IslandMarkerDef[] = [
  // Bahamas y Lucayas (Norte)
  { code: 'BHS', name: 'Bahamas', x: 140, y: 55, labelPosition: 'top' },
  { code: 'TCA', name: 'Turcas y Caicos', x: 210, y: 65, labelPosition: 'top', isGeekOnly: true },

  // Grandes Antillas
  { code: 'CUB', name: 'Cuba', x: 110, y: 95, isMajorIsland: true },
  { code: 'JAM', name: 'Jamaica', x: 125, y: 145, isMajorIsland: true },
  { code: 'HTI', name: 'Haití', x: 190, y: 125, isMajorIsland: true },
  { code: 'DOM', name: 'Rep. Dominicana', x: 220, y: 120, isMajorIsland: true },
  { code: 'PRI', name: 'Puerto Rico', x: 260, y: 125, isMajorIsland: true },
  { code: 'CYM', name: 'Islas Caimán', x: 75, y: 120, labelPosition: 'bottom', isGeekOnly: true },

  // Arco de Pequeñas Antillas (Espaciado vertical y en curva)
  { code: 'VGB', name: 'Islas Vírgenes Británicas', x: 282, y: 118, labelPosition: 'right', isGeekOnly: true },
  { code: 'VIR', name: 'Islas Vírgenes de EE.UU.', x: 282, y: 128, labelPosition: 'right', isGeekOnly: true },
  { code: 'AIA', name: 'Anguila', x: 295, y: 115, labelPosition: 'right', isGeekOnly: true },
  { code: 'SXM', name: 'San Martín', x: 298, y: 125, labelPosition: 'right', isGeekOnly: true },
  { code: 'BLM', name: 'San Bartolomé', x: 302, y: 133, labelPosition: 'right', isGeekOnly: true },
  { code: 'KNA', name: 'San Cristóbal y Nieves', x: 295, y: 142, labelPosition: 'right' },
  { code: 'ATG', name: 'Antigua y Barbuda', x: 312, y: 140, labelPosition: 'right' },
  { code: 'MSR', name: 'Montserrat', x: 298, y: 152, labelPosition: 'right', isGeekOnly: true },
  { code: 'GLP', name: 'Guadalupe', x: 312, y: 152, labelPosition: 'right', isGeekOnly: true },
  { code: 'DMA', name: 'Dominica', x: 308, y: 164, labelPosition: 'right' },
  { code: 'MTQ', name: 'Martinica', x: 312, y: 175, labelPosition: 'right', isGeekOnly: true },
  { code: 'LCA', name: 'Santa Lucía', x: 310, y: 186, labelPosition: 'right' },
  { code: 'BRB', name: 'Barbados', x: 332, y: 184, labelPosition: 'right' },
  { code: 'VCT', name: 'San Vicente y las Granadinas', x: 310, y: 198, labelPosition: 'right' },
  { code: 'GRD', name: 'Granada', x: 310, y: 210, labelPosition: 'right' },
  { code: 'TTO', name: 'Trinidad y Tobago', x: 315, y: 226, labelPosition: 'right' },

  // Antillas del Sur
  { code: 'ABW', name: 'Aruba', x: 195, y: 215, labelPosition: 'top', isGeekOnly: true },
  { code: 'CUW', name: 'Curazao', x: 212, y: 215, labelPosition: 'top', isGeekOnly: true },
  { code: 'BES', name: 'Bonaire', x: 226, y: 215, labelPosition: 'top', isGeekOnly: true }
];

export const CaribbeanInsetMap: React.FC<CaribbeanInsetMapProps> = ({
  countryStatuses = {},
  selectedCountryCode = null,
  targetCountryCode = null,
  pulsingCountryCode = null,
  onCountryClick,
  isGeekMode = false
}) => {
  const visibleIslands = useMemo(() => {
    return CARIBBEAN_ISLANDS.filter(island => isGeekMode || !island.isGeekOnly);
  }, [isGeekMode]);

  const handleMarkerClick = (code: string) => {
    if (!onCountryClick) return;
    const country = countriesService.getCountryByCode(code);
    if (country) {
      onCountryClick(country, code);
    }
  };

  return (
    <div className="relative w-full h-full bg-[#0B1220] border-2 border-cyan-500/50 rounded-xl overflow-hidden shadow-2xl flex flex-col justify-between">
      {/* Etiqueta de la Ventana Inset */}
      <div className="absolute top-1.5 left-2 z-10 flex items-center gap-1.5 bg-slate-900/90 px-2 py-0.5 rounded-md border border-cyan-500/30 text-[10px] font-bold text-cyan-300">
        <span>🏝️</span>
        <span>Caribe & Antillas</span>
      </div>

      {/* SVG del Mapa Regional del Caribe */}
      <svg
        viewBox="0 0 360 245"
        className="w-full h-full select-none"
        style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.5))' }}
      >
        {/* Fondo Marítimo */}
        <rect width="360" height="245" fill="#0E1729" />

        {/* Siluetas Continentales de Fondo (Florida, Centroamérica, Sudamérica) */}
        <g fill="#162035" stroke="#1E2D4A" strokeWidth="0.8">
          {/* Florida */}
          <path d="M 85 0 L 95 30 L 110 40 L 112 55 L 102 60 L 95 45 L 80 35 L 75 0 Z" />
          {/* Península de Yucatán */}
          <path d="M 0 65 L 25 65 L 35 80 L 30 115 L 0 120 Z" />
          {/* Centroamérica */}
          <path d="M 0 120 L 30 115 L 35 150 L 50 170 L 40 210 L 0 210 Z" />
          {/* Norte de Colombia y Venezuela */}
          <path d="M 50 215 L 90 205 L 140 220 L 175 210 L 210 230 L 260 225 L 330 240 L 360 245 L 360 245 L 0 245 L 0 215 Z" />
        </g>

        {/* Cajas de agrupación y líneas discontinuas para archipiélagos */}
        <g stroke="#38BDF8" strokeWidth="0.7" strokeDasharray="3 2" fill="none" opacity="0.45">
          {/* Caja Bahamas */}
          <path d="M 125 40 L 230 48 L 225 80 L 125 70 Z" />
          {/* Caja Puerto Rico e Islas Vírgenes */}
          <rect x="250" y="112" width="40" height="24" rx="3" />
          {/* Cadena Curvada de las Pequeñas Antillas */}
          <path d="M 290 112 Q 325 150 320 235" />
          {/* Línea Antillas del Sur (ABC) */}
          <path d="M 188 208 L 236 208 L 236 226 L 188 226 Z" />
        </g>

        {/* Siluetas vectoriales de Grandes Antillas */}
        <g stroke="#334155" strokeWidth="0.6">
          {/* Cuba */}
          <path
            d="M 65 92 Q 100 85 145 105 Q 115 110 80 102 Z"
            fill="#1E293B"
            className="hover:fill-cyan-700 cursor-pointer transition-colors"
            onClick={() => handleMarkerClick('CUB')}
          />
          {/* La Española (Haití / Rep. Dominicana) */}
          <path
            d="M 175 120 Q 205 110 245 125 Q 230 140 185 135 Z"
            fill="#1E293B"
            className="hover:fill-cyan-700 cursor-pointer transition-colors"
            onClick={() => handleMarkerClick('DOM')}
          />
          {/* Jamaica */}
          <ellipse
            cx="125"
            cy="145"
            rx="16"
            ry="7"
            fill="#1E293B"
            className="hover:fill-cyan-700 cursor-pointer transition-colors"
            onClick={() => handleMarkerClick('JAM')}
          />
          {/* Puerto Rico */}
          <rect
            x="254"
            y="120"
            width="15"
            height="9"
            rx="2"
            fill="#1E293B"
            className="hover:fill-cyan-700 cursor-pointer transition-colors"
            onClick={() => handleMarkerClick('PRI')}
          />
        </g>

        {/* Puntos y Marcadores Interactivos de cada País / Isla */}
        {visibleIslands.map((island) => {
          const status = countryStatuses[island.code.toUpperCase()];
          const isPulsing = pulsingCountryCode?.toUpperCase() === island.code.toUpperCase();
          const isSelected = selectedCountryCode?.toUpperCase() === island.code.toUpperCase();
          const isTarget = targetCountryCode?.toUpperCase() === island.code.toUpperCase();

          // Colores de estado
          let fill = '#FFFFFF';
          let stroke = '#0F172A';
          let radius = 3.6;

          if (isPulsing) {
            fill = '#EF4444';
            stroke = '#FEE2E2';
            radius = 5.0;
          } else if (status === 'correct') {
            fill = '#10B981';
            stroke = '#064E3B';
          } else if (status === 'hint' || isTarget) {
            fill = '#F59E0B';
            stroke = '#78350F';
          } else if (status === 'wrong') {
            fill = '#EF4444';
            stroke = '#7F1D1D';
          } else if (status === 'selected' || isSelected) {
            fill = '#8B5CF6';
            stroke = '#4C1D95';
            radius = 4.5;
          }

          return (
            <g
              key={island.code}
              className="cursor-pointer group"
              onClick={(e) => {
                e.stopPropagation();
                handleMarkerClick(island.code);
              }}
            >
              {/* Radar de pulso si está activo */}
              {isPulsing && (
                <circle
                  cx={island.x}
                  cy={island.y}
                  r={8}
                  fill="rgba(239, 68, 68, 0.4)"
                  className="animate-ping"
                />
              )}

              {/* Halo en hover */}
              <circle
                cx={island.x}
                cy={island.y}
                r={radius + 3}
                fill="transparent"
                className="group-hover:fill-cyan-500/30 transition-colors"
              />

              {/* Punto circular visible */}
              <circle
                cx={island.x}
                cy={island.y}
                r={radius}
                fill={fill}
                stroke={stroke}
                strokeWidth="1.0"
                className="group-hover:scale-125 transition-transform origin-center"
              />

              {/* Nombre / Tooltip flotante */}
              <title>{island.name}</title>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
