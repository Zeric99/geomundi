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
import { FALLBACK_COUNTRIES } from '../../data/fallbackCountries';

interface CountryExplorerProps {
  onStartQuizWithCountry?: (country: Country) => void;
  continent?: Continent;
  onSelectContinent?: (continent: Continent) => void;
  onOpenFlagModal?: (country: Country) => void;
}

export const CountryExplorer: React.FC<CountryExplorerProps> = ({
  onStartQuizWithCountry,
  continent = 'World',
  onSelectContinent,
  onOpenFlagModal
}) => {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const allCountries = useMemo(() => {
    return countriesService.getCountriesByContinent(continent);
  }, [continent]);

  // Búsqueda rápida de países
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return allCountries
      .filter(c => 
        c.nameEs.toLowerCase().includes(q) || 
        c.nameEn.toLowerCase().includes(q) || 
        c.capital.toLowerCase().includes(q) ||
        c.cca3.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [allCountries, searchQuery]);

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
  };

  return (
    <div className="space-y-4">
      {/* Banner Superior de Instrucción y Buscador */}
      <div className="bg-[#131C2E]/90 backdrop-blur-md border border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-xl flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-300">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display font-bold text-white text-base sm:text-lg">
              Modo Explorador Libre
            </h3>
            <p className="text-xs text-slate-300">
              Haz clic en cualquier país o isla del mapa para inspeccionar sus datos, bandera, capital y fronteras.
            </p>
          </div>
        </div>

        {/* Buscador Rápido de Países */}
        <div className="relative w-full sm:w-72">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar país o capital..."
              className="w-full bg-slate-900/90 border border-slate-700 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Resultados flotantes de búsqueda */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-slate-900 border border-cyan-500/40 rounded-xl shadow-2xl z-40 max-h-56 overflow-y-auto divide-y divide-slate-800">
              {searchResults.map((c) => (
                <button
                  key={c.cca3}
                  onClick={() => handleSelectSearchResult(c)}
                  className="w-full px-3 py-2 text-left hover:bg-cyan-500/20 flex items-center justify-between text-xs transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{c.flagEmoji}</span>
                    <span className="font-bold text-white">{c.nameEs}</span>
                  </div>
                  <span className="text-slate-400 font-mono text-[11px]">{c.capital}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Mapa Interactivo */}
        <div className={`${selectedCountry ? 'lg:col-span-3' : 'lg:col-span-4'} h-[calc(100vh-190px)] min-h-[420px] transition-all`}>
          <WorldMap
            continent={continent}
            onSelectContinent={onSelectContinent}
            onCountryClick={handleCountryClick}
            selectedCountryCode={selectedCountry?.cca3 || null}
            interactive={true}
            enableTooltip={true}
          />
        </div>

        {/* Ficha Detallada del País Seleccionado */}
        {selectedCountry && (
          <div className="lg:col-span-1 bg-[#131C2E]/95 backdrop-blur-md border border-cyan-500/40 rounded-2xl p-5 shadow-2xl flex flex-col justify-between animate-in fade-in slide-in-from-right-4 duration-200">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
                <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider font-mono bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
                  {selectedCountry.cca3} • {selectedCountry.cca2}
                </span>
                <button
                  onClick={() => setSelectedCountry(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
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
                  className="cursor-zoom-in group/flag shrink-0 rounded-xl overflow-hidden border border-slate-700 shadow-md relative w-16 h-11 bg-slate-900 flex items-center justify-center"
                >
                  <img
                    src={selectedCountry.flagSvg}
                    alt={`Bandera de ${selectedCountry.nameEs}`}
                    className="w-full h-full object-cover group-hover/flag:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/flag:opacity-100 flex items-center justify-center transition-opacity">
                    <ZoomIn className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="font-display font-black text-white text-xl leading-tight">
                    {selectedCountry.nameEs}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    {selectedCountry.nameEn}
                  </p>
                </div>
              </div>

              {/* Datos Geográficos */}
              <div className="mt-5 space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/70 border border-slate-800">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Landmark className="w-4 h-4 text-purple-400" />
                    <span>Capital</span>
                  </div>
                  <span className="font-bold text-white text-sm">
                    {selectedCountry.capital || 'N/A'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/70 border border-slate-800">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Globe className="w-4 h-4 text-cyan-400" />
                    <span>Continente</span>
                  </div>
                  <span className="font-semibold text-slate-200">
                    {selectedCountry.continentEs}
                  </span>
                </div>

                {selectedCountry.subregionEs && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/70 border border-slate-800">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Layers className="w-4 h-4 text-sky-400" />
                      <span>Subregión</span>
                    </div>
                    <span className="font-semibold text-slate-200">
                      {selectedCountry.subregionEs}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/70 border border-slate-800">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Users className="w-4 h-4 text-emerald-400" />
                    <span>Población</span>
                  </div>
                  <span className="font-semibold text-emerald-300">
                    {selectedCountry.population ? selectedCountry.population.toLocaleString('es-ES') : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Países Vecinos / Fronteras */}
              {selectedCountry.borderCodes && selectedCountry.borderCodes.length > 0 && (
                <div className="mt-4">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Fronteras ({selectedCountry.borderCodes.length}):
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    {selectedCountry.borderCodes.map((code) => {
                      const neighbor = countriesService.getCountryByCode(code);
                      return (
                        <button
                          key={code}
                          onClick={() => handleBorderClick(code)}
                          className="px-2 py-1 bg-slate-800/90 hover:bg-cyan-500/20 hover:text-cyan-300 border border-slate-700 rounded-lg text-[11px] font-semibold text-slate-300 transition-colors flex items-center gap-1 active:scale-95"
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
              <div className="mt-5 pt-4 border-t border-slate-700/60">
                <button
                  onClick={() => onStartQuizWithCountry(selectedCountry)}
                  className="w-full py-2.5 px-3 bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 font-bold text-xs rounded-xl shadow-glow-cyan transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-slate-950" />
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
