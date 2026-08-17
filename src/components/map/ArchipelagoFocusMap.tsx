import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, 
  Compass, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  X, 
  Maximize2, 
  ArrowLeft,
  Sparkles,
  Layers,
  ChevronRight
} from 'lucide-react';
import { Country, CountryMapStatus } from '../../types/country';
import { countriesService } from '../../services/countriesService';
import { FALLBACK_COUNTRIES, GEEK_TERRITORIES } from '../../data/fallbackCountries';

export type ArchipelagoRegion = 'caribbean' | 'pacific';

interface ArchipelagoFocusMapProps {
  region: ArchipelagoRegion;
  countryStatuses?: Record<string, CountryMapStatus>;
  selectedCountryCode?: string | null;
  targetCountryCode?: string | null;
  pulsingCountryCode?: string | null;
  onCountryClick?: (country: Country, cca3: string) => void;
  onClose: () => void;
  onSwitchRegion: (newRegion: ArchipelagoRegion) => void;
  isGeekMode?: boolean;
}

interface IslandSubgroup {
  title: string;
  desc: string;
  codes: string[];
}

export const ArchipelagoFocusMap: React.FC<ArchipelagoFocusMapProps> = ({
  region,
  countryStatuses = {},
  selectedCountryCode = null,
  targetCountryCode = null,
  pulsingCountryCode = null,
  onCountryClick,
  onClose,
  onSwitchRegion,
  isGeekMode = false
}) => {
  // Configuración de subgrupos por región para que NINGÚN país o isla se solape
  const config = useMemo(() => {
    if (region === 'caribbean') {
      const subgroups: IslandSubgroup[] = [
        {
          title: 'Grandes Antillas',
          desc: 'Las mayores islas del Caribe',
          codes: ['CUB', 'DOM', 'HTI', 'JAM', 'PRI', 'CYM']
        },
        {
          title: 'Archipiélago de Lucayas',
          desc: 'Norte del Caribe',
          codes: ['BHS', 'TCA']
        },
        {
          title: 'Pequeñas Antillas (Islas de Barlovento y Sotavento)',
          desc: 'Cadena oriental de islas',
          codes: ['KNA', 'ATG', 'DMA', 'LCA', 'VCT', 'BRB', 'GRD', 'TTO', 'AIA', 'MSR', 'VGB', 'VIR', 'BLM', 'SXM', 'GLP', 'MTQ']
        },
        {
          title: 'Antillas Holandesas e Islas del Sur',
          desc: 'Frente a las costas continentales',
          codes: ['ABW', 'CUW', 'BES']
        }
      ];

      return {
        title: '🏝️ Mapa Exclusivo: Caribe y Antillas',
        subtitle: 'Vista ampliada de alta legibilidad sin solapamiento de islas',
        subgroups
      };
    } else {
      const subgroups: IslandSubgroup[] = [
        {
          title: 'Polinesia',
          desc: 'Triángulo oriental del Pacífico',
          codes: ['WSM', 'TON', 'TUV', 'COK', 'NIU', 'PYF', 'ASM', 'WLF', 'TKL', 'NZL']
        },
        {
          title: 'Micronesia',
          desc: 'Archipiélagos del Pacífico Norte y Central',
          codes: ['FSM', 'MHL', 'PLW', 'NRU', 'KIR', 'GUM', 'MNP']
        },
        {
          title: 'Melanesia',
          desc: 'Suroeste del Pacífico',
          codes: ['FJI', 'SLB', 'VUT', 'PNG', 'NCL']
        },
        {
          title: 'Australasia',
          desc: 'Masas terrestres continentales de Oceanía',
          codes: ['AUS']
        }
      ];

      return {
        title: '🌊 Mapa Exclusivo: Oceanía y Pacífico',
        subtitle: 'Vista ampliada con todas las islas y naciones insulares espaciadas',
        subgroups
      };
    }
  }, [region]);

  const allAvailableCountries = useMemo(() => {
    return isGeekMode ? [...FALLBACK_COUNTRIES, ...GEEK_TERRITORIES] : FALLBACK_COUNTRIES;
  }, [isGeekMode]);

  const handleIslandClick = (country: Country) => {
    if (onCountryClick) {
      onCountryClick(country, country.cca3);
    }
  };

  return (
    <div className="relative w-full h-full min-h-[460px] bg-gradient-to-b from-[#090E18] via-[#0E1729] to-[#0A111F] rounded-2xl border border-cyan-500/40 shadow-2xl p-4 sm:p-5 flex flex-col justify-between overflow-hidden">
      {/* Fondo con rejilla sutil de navegación marítima */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.25) 0%, transparent 70%),
            linear-gradient(to right, rgba(56, 189, 248, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(56, 189, 248, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 36px 36px, 36px 36px'
        }}
      />

      {/* Cabecera y Selector de Región Exclusiva */}
      <div className="relative z-10 flex items-center justify-between gap-3 pb-3 border-b border-slate-700/80 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider font-extrabold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
              Vista Regional Detallada
            </span>
            <span className="text-xs text-slate-400">
              {region === 'caribbean' ? 'Caribe y Mar de las Antillas' : 'Pacífico y Océano Índico'}
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-display font-black text-white mt-0.5">
            {config.title}
          </h3>
        </div>

        {/* Botones de Cambio Rápido entre Caribe, Oceanía y Volver al Mapa Mundial */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-slate-900/90 rounded-xl p-1 border border-slate-700">
            <button
              onClick={() => onSwitchRegion('caribbean')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                region === 'caribbean'
                  ? 'bg-gradient-to-r from-cyan-500 to-sky-500 text-slate-950 shadow-glow-cyan'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>🏝️</span>
              <span>Caribe</span>
            </button>
            <button
              onClick={() => onSwitchRegion('pacific')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                region === 'pacific'
                  ? 'bg-gradient-to-r from-cyan-500 to-sky-500 text-slate-950 shadow-glow-cyan'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>🌊</span>
              <span>Oceanía</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold border border-slate-600 transition-all flex items-center gap-1.5 active:scale-95 shadow-md"
            title="Volver a la vista del mapa mundial global"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Mapa Mundial</span>
          </button>
        </div>
      </div>

      {/* Cuadrícula de Islas y Archipiélagos Espaciados (Cero solapamiento) */}
      <div className="relative z-10 flex-1 my-3 overflow-y-auto max-h-[460px] space-y-4 pr-1 custom-scrollbar">
        {config.subgroups.map((group, gIdx) => {
          // Filtrar países existentes en la base de datos
          const groupCountries = group.codes
            .map(code => countriesService.getCountryByCode(code) || allAvailableCountries.find(c => c.cca3 === code))
            .filter((c): c is Country => Boolean(c));

          if (groupCountries.length === 0) return null;

          return (
            <div 
              key={gIdx} 
              className="bg-slate-900/70 border border-slate-800/90 rounded-2xl p-3.5 sm:p-4 backdrop-blur-md shadow-lg"
            >
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <h4 className="font-display font-bold text-white text-sm sm:text-base">
                    {group.title}
                  </h4>
                  <span className="text-[11px] text-slate-400 hidden sm:inline">
                    — {group.desc}
                  </span>
                </div>
                <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
                  {groupCountries.length} {groupCountries.length === 1 ? 'isla/país' : 'islas/países'}
                </span>
              </div>

              {/* Botones de las Islas del Grupo */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {groupCountries.map((country) => {
                  const cca3 = country.cca3.toUpperCase();
                  const status = countryStatuses[cca3];
                  const isSelected = selectedCountryCode?.toUpperCase() === cca3;
                  const isTarget = targetCountryCode?.toUpperCase() === cca3;
                  const isPulsing = pulsingCountryCode?.toUpperCase() === cca3;

                  // Estilos por estado de juego
                  let cardStyle = 'bg-slate-850 hover:bg-slate-800 border-slate-700/80 text-slate-200 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]';
                  let badge = null;

                  if (isPulsing) {
                    cardStyle = 'bg-rose-950/90 border-rose-500 text-rose-200 ring-2 ring-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.5)] animate-pulse';
                    badge = <span className="text-[9px] font-black uppercase text-rose-300">¡Aquí!</span>;
                  } else if (status === 'correct') {
                    cardStyle = 'bg-emerald-950/80 border-emerald-500/70 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.3)]';
                    badge = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
                  } else if (status === 'hint' || isTarget) {
                    cardStyle = 'bg-amber-950/80 border-amber-500/70 text-amber-200 ring-2 ring-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.3)]';
                    badge = <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
                  } else if (status === 'wrong') {
                    cardStyle = 'bg-rose-950/60 border-rose-600/60 text-rose-300 line-through opacity-80';
                    badge = <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />;
                  } else if (status === 'selected' || isSelected) {
                    cardStyle = 'bg-purple-950/80 border-purple-500 text-purple-200 ring-2 ring-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]';
                    badge = <span className="text-[9px] font-bold uppercase text-purple-300">Seleccionado</span>;
                  }

                  return (
                    <button
                      key={cca3}
                      onClick={() => handleIslandClick(country)}
                      className={`p-2.5 rounded-xl border text-left transition-all duration-150 flex flex-col justify-between gap-1.5 active:scale-95 group relative ${cardStyle}`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xl shrink-0 group-hover:scale-110 transition-transform">
                          {country.flagEmoji}
                        </span>
                        {badge}
                      </div>

                      <div>
                        <div className="font-display font-bold text-xs leading-snug line-clamp-1 group-hover:text-white">
                          {country.nameEs}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate mt-0.5">
                          {country.capital || 'N/A'}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pie de navegación informativa */}
      <div className="relative z-10 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>Haz clic en cualquier isla para responder o seleccionarla en la partida actual.</span>
        </div>
        <button
          onClick={onClose}
          className="text-cyan-400 hover:text-cyan-300 font-bold underline cursor-pointer"
        >
          Volver a la vista del mapa mundial
        </button>
      </div>
    </div>
  );
};
