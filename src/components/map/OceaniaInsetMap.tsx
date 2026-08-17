import React, { useMemo } from 'react';
import { Country, CountryMapStatus } from '../../types/country';
import { countriesService } from '../../services/countriesService';

interface OceaniaInsetMapProps {
  countryStatuses?: Record<string, CountryMapStatus>;
  selectedCountryCode?: string | null;
  targetCountryCode?: string | null;
  pulsingCountryCode?: string | null;
  onCountryClick?: (country: Country, cca3: string) => void;
  isGeekMode?: boolean;
}

interface PacificIslandBox {
  code: string;
  name: string;
  dotX: number;
  dotY: number;
  // Polígono delimitador del sector marítimo / ZEE
  polyPoints: string;
  isGeekOnly?: boolean;
}

// Coordenadas de sectores marítimos e islas del Pacífico (Calibradas para cero solapamiento)
const PACIFIC_ISLANDS: PacificIslandBox[] = [
  // Micronesia
  {
    code: 'PLW',
    name: 'Palaos',
    dotX: 52,
    dotY: 65,
    polyPoints: '35,45 70,45 70,85 35,85'
  },
  {
    code: 'GUM',
    name: 'Guam',
    dotX: 72,
    dotY: 28,
    polyPoints: '60,15 95,15 95,45 60,45',
    isGeekOnly: true
  },
  {
    code: 'MNP',
    name: 'Islas Marianas del Norte',
    dotX: 75,
    dotY: 10,
    polyPoints: '60,0 95,0 95,15 60,15',
    isGeekOnly: true
  },
  {
    code: 'FSM',
    name: 'Micronesia (Estados Federados)',
    dotX: 110,
    dotY: 68,
    polyPoints: '70,45 155,45 155,90 70,90'
  },
  {
    code: 'MHL',
    name: 'Islas Marshall',
    dotX: 175,
    dotY: 55,
    polyPoints: '155,30 200,30 200,80 155,80'
  },
  {
    code: 'NRU',
    name: 'Nauru',
    dotX: 172,
    dotY: 96,
    polyPoints: '160,85 188,85 188,110 160,110'
  },
  {
    code: 'KIR',
    name: 'Kiribati (Gilbert & Phoenix)',
    dotX: 220,
    dotY: 95,
    polyPoints: '200,75 255,75 255,120 200,120'
  },

  // Melanesia
  {
    code: 'SLB',
    name: 'Islas Salomón',
    dotX: 118,
    dotY: 122,
    polyPoints: '95,108 145,108 145,140 95,140'
  },
  {
    code: 'VUT',
    name: 'Vanuatu',
    dotX: 155,
    dotY: 155,
    polyPoints: '142,138 172,138 172,175 142,175'
  },
  {
    code: 'NCL',
    name: 'Nueva Caledonia',
    dotX: 130,
    dotY: 180,
    polyPoints: '110,165 142,165 142,198 110,198',
    isGeekOnly: true
  },
  {
    code: 'FJI',
    name: 'Fiyi',
    dotX: 198,
    dotY: 160,
    polyPoints: '178,140 218,140 218,180 178,180'
  },

  // Polinesia
  {
    code: 'TUV',
    name: 'Tuvalu',
    dotX: 202,
    dotY: 118,
    polyPoints: '188,105 220,105 220,135 188,135'
  },
  {
    code: 'WLF',
    name: 'Wallis y Futuna',
    dotX: 226,
    dotY: 146,
    polyPoints: '218,135 238,135 238,158 218,158',
    isGeekOnly: true
  },
  {
    code: 'WSM',
    name: 'Samoa',
    dotX: 250,
    dotY: 145,
    polyPoints: '238,130 270,130 270,160 238,160'
  },
  {
    code: 'ASM',
    name: 'Samoa Americana',
    dotX: 278,
    dotY: 148,
    polyPoints: '270,135 292,135 292,162 270,162',
    isGeekOnly: true
  },
  {
    code: 'TON',
    name: 'Tonga',
    dotX: 248,
    dotY: 180,
    polyPoints: '235,165 265,165 265,200 235,200'
  },
  {
    code: 'NIU',
    name: 'Niue',
    dotX: 280,
    dotY: 178,
    polyPoints: '270,165 295,165 295,195 270,195',
    isGeekOnly: true
  },
  {
    code: 'COK',
    name: 'Islas Cook',
    dotX: 312,
    dotY: 175,
    polyPoints: '298,150 338,150 338,205 298,205',
    isGeekOnly: true
  },
  {
    code: 'PYF',
    name: 'Polinesia Francesa',
    dotX: 368,
    dotY: 165,
    polyPoints: '342,130 405,130 405,210 342,210',
    isGeekOnly: true
  }
];

export const OceaniaInsetMap: React.FC<OceaniaInsetMapProps> = ({
  countryStatuses = {},
  selectedCountryCode = null,
  targetCountryCode = null,
  pulsingCountryCode = null,
  onCountryClick,
  isGeekMode = false
}) => {
  const visibleIslands = useMemo(() => {
    return PACIFIC_ISLANDS.filter(island => isGeekMode || !island.isGeekOnly);
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
        <span>🌊</span>
        <span>Oceanía & Pacífico</span>
      </div>

      {/* SVG del Mapa Regional del Pacífico */}
      <svg
        viewBox="0 0 415 245"
        className="w-full h-full select-none"
        style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.5))' }}
      >
        {/* Fondo Marítimo */}
        <rect width="415" height="245" fill="#0E1729" />

        {/* Siluetas Geográficas Continentales (Australia, PNG, Nueva Zelanda) */}
        <g fill="#162035" stroke="#1E2D4A" strokeWidth="0.8">
          {/* Australia (Esquina Suroeste) */}
          <path d="M 0 160 Q 25 150 55 170 Q 75 190 70 245 L 0 245 Z" />
          {/* Papúa Nueva Guinea */}
          <path
            d="M 25 110 Q 55 98 85 118 Q 75 135 35 125 Z"
            fill="#1E293B"
            stroke="#334155"
            className="hover:fill-cyan-700 cursor-pointer transition-colors"
            onClick={() => handleMarkerClick('PNG')}
          />
          {/* Nueva Zelanda (Esquina Sureste) */}
          <path
            d="M 180 230 L 195 210 L 205 220 L 190 245 Z M 165 245 L 180 230 L 175 245 Z"
            fill="#1E293B"
            stroke="#334155"
            className="hover:fill-cyan-700 cursor-pointer transition-colors"
            onClick={() => handleMarkerClick('NZL')}
          />
        </g>

        {/* Cajas de Delimitación Territorial Marítima Discontinua (Estilo Seterra) */}
        <g stroke="#38BDF8" strokeWidth="0.75" strokeDasharray="3 2" fill="none" opacity="0.5">
          {visibleIslands.map((island) => (
            <polygon key={`poly_${island.code}`} points={island.polyPoints} />
          ))}
        </g>

        {/* Puntos y Marcadores Interactivos para cada Nación / Territorio */}
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
                  cx={island.dotX}
                  cy={island.dotY}
                  r={8}
                  fill="rgba(239, 68, 68, 0.4)"
                  className="animate-ping"
                />
              )}

              {/* Zona amplia de clic sensible */}
              <circle
                cx={island.dotX}
                cy={island.dotY}
                r={radius + 4}
                fill="transparent"
                className="group-hover:fill-cyan-500/30 transition-colors"
              />

              {/* Punto circular visible */}
              <circle
                cx={island.dotX}
                cy={island.dotY}
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
