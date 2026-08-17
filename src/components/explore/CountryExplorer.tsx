import React, { useState } from 'react';
import { Compass, Users, MapPin, Landmark, Globe, Layers, ArrowRight, X, Play } from 'lucide-react';
import { Continent, Country } from '../../types/country';
import { WorldMap } from '../map/WorldMap';
import { countriesService } from '../../services/countriesService';

interface CountryExplorerProps {
  onStartQuizWithCountry?: (country: Country) => void;
  continent?: Continent;
  onSelectContinent?: (continent: Continent) => void;
}

export const CountryExplorer: React.FC<CountryExplorerProps> = ({
  onStartQuizWithCountry,
  continent = 'World',
  onSelectContinent
}) => {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);

  const handleCountryClick = (country: Country) => {
    setSelectedCountry(country);
  };

  const handleBorderClick = (borderCca3: string) => {
    const neighbor = countriesService.getCountryByCode(borderCca3);
    if (neighbor) {
      setSelectedCountry(neighbor);
    }
  };

  return (
    <div className="space-y-4">
      {/* Banner Superior de Instrucción */}
      <div className="bg-[#131C2E]/90 backdrop-blur-md border border-amber-500/30 rounded-2xl p-4 shadow-xl flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-300">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-white text-base">
              Modo Explorador Libre
            </h3>
            <p className="text-xs text-slate-300">
              Haz clic en cualquier país del mapa para inspeccionar sus datos geográficos, capital, bandera y fronteras.
            </p>
          </div>
        </div>

        {selectedCountry && (
          <div className="text-xs text-cyan-300 bg-cyan-500/10 px-3 py-1.5 rounded-xl border border-cyan-500/30 font-semibold flex items-center gap-2">
            <span>Inspeccionando: <strong>{selectedCountry.nameEs}</strong></span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Mapa Interactivo */}
        <div className={`${selectedCountry ? 'lg:col-span-3' : 'lg:col-span-4'} h-[540px] sm:h-[620px] transition-all`}>
          <WorldMap
            continent={continent}
            onSelectContinent={onSelectContinent}
            onCountryClick={handleCountryClick}
            selectedCountryCode={selectedCountry?.cca3 || null}
            interactive={true}
          />
        </div>

        {/* Ficha Detallada del País Seleccionado */}
        {selectedCountry && (
          <div className="lg:col-span-1 bg-[#131C2E]/95 backdrop-blur-md border border-slate-750 rounded-2xl p-5 shadow-2xl flex flex-col justify-between animate-in fade-in slide-in-from-right-4 duration-200">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
                <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider font-mono">
                  {selectedCountry.cca3} • {selectedCountry.cca2}
                </span>
                <button
                  onClick={() => setSelectedCountry(null)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Bandera y Título */}
              <div className="mt-4 flex items-center gap-3">
                <img
                  src={selectedCountry.flagSvg}
                  alt={`Bandera de ${selectedCountry.nameEs}`}
                  className="w-14 h-10 object-cover rounded-lg shadow border border-slate-700"
                />
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
              <div className="mt-5 space-y-3 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Landmark className="w-4 h-4 text-purple-400" />
                    <span>Capital</span>
                  </div>
                  <span className="font-bold text-white text-sm">
                    {selectedCountry.capital || 'N/A'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Globe className="w-4 h-4 text-cyan-400" />
                    <span>Continente</span>
                  </div>
                  <span className="font-semibold text-slate-200">
                    {selectedCountry.continentEs}
                  </span>
                </div>

                {selectedCountry.subregionEs && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Layers className="w-4 h-4 text-sky-400" />
                      <span>Subregión</span>
                    </div>
                    <span className="font-semibold text-slate-200">
                      {selectedCountry.subregionEs}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
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
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCountry.borderCodes.map((code) => {
                      const neighbor = countriesService.getCountryByCode(code);
                      return (
                        <button
                          key={code}
                          onClick={() => handleBorderClick(code)}
                          className="px-2 py-1 bg-slate-800/80 hover:bg-cyan-500/20 hover:text-cyan-300 border border-slate-700 rounded-lg text-[11px] font-semibold text-slate-300 transition-colors flex items-center gap-1"
                        >
                          <span>{neighbor ? neighbor.nameEs : code}</span>
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
                  className="w-full py-2.5 px-3 bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 font-bold text-xs rounded-xl shadow-glow-cyan transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-3.5 h-3.5 fill-slate-950" />
                  <span>Jugar con {selectedCountry.nameEs}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
