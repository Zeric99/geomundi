import React, { useState } from 'react';
import { GridTile } from '../types';
import { EMPIRE_COLORS, empireStorageService } from '../services/empireStorageService';
import { Crown, Sparkles, MapPin, X } from 'lucide-react';

interface FoundCapitalModalProps {
  tile: GridTile;
  onClose: () => void;
  onSuccess: () => void;
}

export const FoundCapitalModal: React.FC<FoundCapitalModalProps> = ({
  tile,
  onClose,
  onSuccess
}) => {
  const [empireName, setEmpireName] = useState(`Imperio de ${tile.countryName || 'la Tierra'}`);
  const [cityName, setCityName] = useState(`${tile.countryName || 'Nueva'} Central`);
  const [selectedColor, setSelectedColor] = useState(EMPIRE_COLORS[0].hex);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = empireStorageService.foundCapital(
      tile.id,
      empireName,
      selectedColor,
      cityName
    );
    if (success) {
      onSuccess();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Cabecera decorativa */}
        <div className="relative p-6 pb-4 bg-gradient-to-b from-indigo-950/60 to-zinc-900 border-b border-zinc-800/80">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white font-display tracking-wide">
                Fundar tu Capital
              </h2>
              <div className="flex items-center gap-1.5 text-xs text-indigo-300 mt-0.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>{tile.countryName || 'Territorio Neutral'} ({tile.lat.toFixed(1)}°, {tile.lon.toFixed(1)}°)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nombre del Imperio */}
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
              Nombre de tu Civilización
            </label>
            <input
              type="text"
              value={empireName}
              onChange={(e) => setEmpireName(e.target.value)}
              required
              maxLength={30}
              placeholder="Ej. Imperio Ericiano"
              className="w-full bg-zinc-800/90 text-white font-semibold px-3.5 py-2.5 rounded-xl border border-zinc-700 focus:border-indigo-500 focus:outline-none text-sm transition-colors"
            />
          </div>

          {/* Nombre de la Primera Ciudad */}
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
              Nombre de la Capital
            </label>
            <input
              type="text"
              value={cityName}
              onChange={(e) => setCityName(e.target.value)}
              required
              maxLength={30}
              placeholder="Ej. Toledo Imperial"
              className="w-full bg-zinc-800/90 text-white font-semibold px-3.5 py-2.5 rounded-xl border border-zinc-700 focus:border-indigo-500 focus:outline-none text-sm transition-colors"
            />
          </div>

          {/* Selector de Color del Imperio */}
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
              Color Distintivo del Imperio
            </label>
            <div className="flex items-center gap-2.5">
              {EMPIRE_COLORS.map(c => (
                <button
                  type="button"
                  key={c.hex}
                  onClick={() => setSelectedColor(c.hex)}
                  className={`w-8 h-8 rounded-full transition-transform ${
                    selectedColor === c.hex ? 'scale-125 ring-2 ring-white shadow-lg' : 'hover:scale-110 opacity-75 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* Botón Fundar */}
          <div className="pt-3">
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Plantar Capital y Comenzar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
