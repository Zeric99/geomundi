import React, { useState, useMemo } from 'react';
import { 
  Compass, 
  Users, 
  MapPin, 
  Landmark, 
  Globe, 
  Layers, 
  ArrowRight, 
  X, 
  Play, 
  Search, 
  ZoomIn, 
  Sparkles 
} from 'lucide-react';
import { Continent, Country } from '../../types/country';
import { WorldMap } from '../map/WorldMap';
import { countriesService } from '../../services/countriesService';
import { FALLBACK_COUNTRIES, GEEK_TERRITORIES } from '../../data/fallbackCountries';

interface CountryExplorerProps {
  onStartQuizWithCountry?: (country: Country) => void;
  continent?: Continent;
  onSelectContinent?: (continent: Continent) => void;
  onOpenFlagModal?: (country: Country) => void;
  onQuit?: () => void;
  isGeekMode?: boolean;
}

const normalize = (str: string) => 
  (str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

export const CountryExplorer: React.FC<CountryExplorerProps> = ({
  onStartQuizWithCountry,
  continent = 'World',
  onSelectContinent,
  onOpenFlagModal,
  onQuit,
  isGeekMode = false
}) => {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Todos los países y territorios disponibles en el sistema para búsqueda global
  const allCountriesList = useMemo(() => {
    const list = countriesService.getAllCountries();
    const base = list.length > 0 ? list : FALLBACK_COUNTRIES;
    return isGeekMode ? [...base, ...GEEK_TERRITORIES] : base;
  }, [isGeekMode]);

  // Búsqueda inteligente, insensible a acentos en nombre (ES/EN), capital y código
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = normalize(searchQuery);
    return allCountriesList
      .filter((c: Country) => {
        const nameEs = normalize(c.nameEs);
        const nameEn = normalize(c.nameEn);
        const capital = normalize(c.capital);
        const cca3 = normalize(c.cca3);
        const official = normalize(c.officialNameEs || '');
        const alt = (c.altSpellings || []).some((a: string) => normalize(a).includes(q));
        return nameEs.includes(q) || nameEn.includes(q) || capital.includes(q) || cca3.includes(q) || official.includes(q) || alt;
      })
      .slice(0, 12);
  }, [allCountriesList, searchQuery]);

  const handleCountryClick = (country: Country) => {
    setSelectedCountry(country);
  };

  const handleBorderClick = (borderCca3: string) => {
    const neighbor = countriesService.getCountryByCode(borderCca3);
    if (neighbor) {
      setSelectedCountry(neighbor);
    }
  };

  const handleSelectSearchResult = (c: Country) => {
    setSelectedCountry(c);
    setSearchQuery('');
    if (onSelectContinent && continent !== 'World' && c.continent !== continent) {
      onSelectContinent(c.continent);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 gap-2 w-full">
      {/* Banner Superior de Instrucción, Buscador y Salir (z-50 para que el dropdown flote por encima del mapa) */}
      <div className="relative z-50 bg-[#18181B]/95 backdrop-blur-md border border-zinc-800 rounded-xl p-3 sm:p-4 shadow-card-subtle flex items-center justify-between gap-3 flex-wrap shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-zinc-800 border border-zinc-700 rounded-lg text-amber-300">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-normal text-zinc-100 text-sm sm:text-base">
              Modo Explorador Libre
            </h3>
            <p className="text-[11px] text-zinc-400 font-sans">
              Haz clic en cualquier país o isla del mapa para inspeccionar sus datos, bandera y capital.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-end">
          {/* Buscador Rápido de Países y Capitales */}
          <div className="relative w-full sm:w-72">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar cualquier país, capital..."
                className="w-full bg-[#121214] border border-zinc-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 rounded-lg pl-8 pr-7 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 outline-none transition font-sans"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Resultados flotantes de búsqueda */}
            {searchResults.length > 0 && (
              <div className="absolute top-full right-0 sm:left-auto mt-1.5 w-[280px] sm:w-[320px] bg-[#18181B] border border-zinc-700 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto divide-y divide-zinc-800 custom-scrollbar">
                <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-indigo-300 bg-zinc-900 border-b border-zinc-800 flex justify-between items-center">
                  <span>{searchResults.length} resultados</span>
                  <span className="text-zinc-500 text-[9px] font-sans">Búsqueda mundial</span>
                </div>
                {searchResults.map((c: Country) => (
                  <button
                    key={c.cca3}
                    onClick={() => handleSelectSearchResult(c)}
                    className="w-full px-3.5 py-2 text-left hover:bg-zinc-800/80 flex items-center justify-between text-xs transition-colors group font-sans"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-base shrink-0">{c.flagEmoji}</span>
                      <div className="truncate">
                        <span className="font-medium text-zinc-100 group-hover:text-indigo-300 block truncate">{c.nameEs}</span>
                        <span className="text-[11px] text-zinc-400 block truncate font-sans">Cap: {c.capital || 'N/A'}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 shrink-0 ml-2">
                      {c.continentEs || c.continent}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Botón Salir si se ejecuta en modo partida */}
          {onQuit && (
            <button
              onClick={onQuit}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-zinc-300 hover:text-white rounded-lg border border-zinc-700 transition active:scale-95 shrink-0"
            >
              Salir
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 flex-1 min-h-0 overflow-hidden">
        {/* Mapa Interactivo */}
        <div className={`${selectedCountry ? 'lg:col-span-3' : 'lg:col-span-4'} h-full min-h-0 transition-all rounded-xl overflow-hidden shadow-lg border border-zinc-800`}>
          <WorldMap
            continent={continent}
            onSelectContinent={onSelectContinent}
            onCountryClick={handleCountryClick}
            selectedCountryCode={selectedCountry?.cca3 || null}
            interactive={true}
            enableTooltip={true}
            isGeekMode={isGeekMode}
          />
        </div>

        {/* Ficha Detallada del País Seleccionado */}
        {selectedCountry && (
          <div className="lg:col-span-1 bg-[#18181B]/95 backdrop-blur-md border border-zinc-800 rounded-xl p-5 shadow-card-subtle flex flex-col justify-between animate-in fade-in slide-in-from-right-4 duration-200">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <span className="text-[11px] font-mono text-indigo-300 uppercase tracking-wider bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/60">
                  {selectedCountry.cca3} • {selectedCountry.cca2}
                </span>
                <button
                  onClick={() => setSelectedCountry(null)}
                  className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
                  title="Cerrar ficha"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Bandera y Título */}
              <div className="mt-4 flex items-center gap-3">
                <div
                  onClick={() => onOpenFlagModal?.(selectedCountry)}
                  title="🔍 Clic para ampliar bandera en HD"
                  className="cursor-zoom-in group/flag shrink-0 rounded-lg overflow-hidden border border-zinc-700 shadow-sm relative w-16 h-11 bg-zinc-900 flex items-center justify-center"
                >
                  <img
                    src={selectedCountry.flagSvg}
                    alt={`Bandera de ${selectedCountry.nameEs}`}
                    className="w-full h-full object-cover group-hover/flag:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/flag:opacity-100 flex items-center justify-center transition-opacity">
                    <ZoomIn className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="font-serif font-normal text-zinc-100 text-xl leading-tight">
                    {selectedCountry.nameEs}
                  </h3>
                  <p className="text-xs text-zinc-400 font-sans">
                    {selectedCountry.nameEn}
                  </p>
                </div>
              </div>

              {/* Datos Geográficos */}
              <div className="mt-5 space-y-2 text-xs font-sans">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#121214] border border-zinc-800">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Landmark className="w-4 h-4 text-purple-400" />
                    <span>Capital</span>
                  </div>
                  <span className="font-serif font-normal text-zinc-100 text-sm">
                    {selectedCountry.capital || 'N/A'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#121214] border border-zinc-800">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Globe className="w-4 h-4 text-indigo-400" />
                    <span>Continente</span>
                  </div>
                  <span className="font-medium text-zinc-200">
                    {selectedCountry.continentEs}
                  </span>
                </div>

                {selectedCountry.subregionEs && (
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#121214] border border-zinc-800">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Layers className="w-4 h-4 text-sky-400" />
                      <span>Subregión</span>
                    </div>
                    <span className="font-medium text-zinc-200">
                      {selectedCountry.subregionEs}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#121214] border border-zinc-800">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Users className="w-4 h-4 text-emerald-400" />
                    <span>Población</span>
                  </div>
                  <span className="font-mono text-emerald-400">
                    {selectedCountry.population ? selectedCountry.population.toLocaleString('es-ES') : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Países Vecinos / Fronteras */}
              {selectedCountry.borderCodes && selectedCountry.borderCodes.length > 0 && (
                <div className="mt-4">
                  <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-1.5">
                    Fronteras ({selectedCountry.borderCodes.length}):
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    {selectedCountry.borderCodes.map((code) => {
                      const neighbor = countriesService.getCountryByCode(code);
                      return (
                        <button
                          key={code}
                          onClick={() => handleBorderClick(code)}
                          className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 rounded-md text-[11px] font-sans transition-colors flex items-center gap-1 active:scale-95"
                        >
                          <span>{neighbor ? `${neighbor.flagEmoji} ${neighbor.nameEs}` : code}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Acción de Quiz */}
            {onStartQuizWithCountry && (
              <div className="mt-5 pt-4 border-t border-zinc-800">
                <button
                  onClick={() => onStartQuizWithCountry(selectedCountry)}
                  className="w-full py-2.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-sans font-medium text-xs rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Jugar Partida con {selectedCountry.nameEs}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
