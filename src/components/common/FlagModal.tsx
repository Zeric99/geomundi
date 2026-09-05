import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, Globe, Landmark, Users, Flag } from 'lucide-react';
import { Country } from '../../types/country';

interface FlagModalProps {
  country: Country | null;
  isOpen: boolean;
  onClose: () => void;
  hideDetails?: boolean; // true = en partidas para no revelar el país/capital (sin spoilers)
}

export const FlagModal: React.FC<FlagModalProps> = ({
  country,
  isOpen,
  onClose,
  hideDetails = false
}) => {
  // Cerrar al presionar la tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !country) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none">
        {/* Fondo con desenfoque */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/85 backdrop-blur-md"
        />

        {/* Contenedor del Modal de Bandera */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={`relative z-10 w-full ${
            hideDetails ? 'max-w-xl' : 'max-w-2xl'
          } bg-[#18181B] border border-zinc-800 rounded-2xl p-6 sm:p-7 shadow-2xl overflow-hidden space-y-5`}
        >
          {/* Botón de Cierre (X) */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all active:scale-95 shadow-sm border border-zinc-700"
            title="Cerrar (Esc)"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Cabecera: Si está en modo juego, título neutral sin spoilers */}
          {hideDetails ? (
            <div className="flex items-center gap-2.5 pr-10">
              <div className="p-2 rounded-lg bg-zinc-800 border border-zinc-700 text-indigo-400">
                <Flag className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-300">
                  Visor de Banderas HD
                </span>
                <h3 className="text-lg font-serif font-normal text-zinc-100">
                  Inspección de Bandera
                </h3>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 pr-10">
              <span className="text-3xl sm:text-4xl">{country.flagEmoji}</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/60">
                    {country.cca3}
                  </span>
                  <span className="text-xs text-zinc-400 font-sans">
                    {country.continentEs}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif font-normal text-zinc-100 mt-0.5">
                  {country.nameEs}
                </h2>
              </div>
            </div>
          )}

          {/* Imagen de Bandera en Alta Definición */}
          <div className="relative w-full aspect-[3/2] max-h-[360px] rounded-xl overflow-hidden shadow-lg border border-zinc-700/80 bg-zinc-900 flex items-center justify-center group">
            <img
              src={country.flagSvg}
              alt="Bandera en alta definición"
              className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-zinc-700 text-[11px] font-sans font-medium text-zinc-300 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <ZoomIn className="w-3.5 h-3.5 text-indigo-400" />
              <span>Máxima Resolución</span>
            </div>
          </div>

          {/* Datos Rápidos del País */}
          {!hideDetails && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3 bg-[#121214] rounded-xl border border-zinc-800 flex items-center gap-2.5">
                <Landmark className="w-4 h-4 text-purple-400 shrink-0" />
                <div className="overflow-hidden">
                  <span className="text-[10px] uppercase font-mono text-zinc-500 block">Capital</span>
                  <span className="text-xs sm:text-sm font-serif font-normal text-zinc-100 truncate block">{country.capital}</span>
                </div>
              </div>

              <div className="p-3 bg-[#121214] rounded-xl border border-zinc-800 flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-indigo-400 shrink-0" />
                <div className="overflow-hidden">
                  <span className="text-[10px] uppercase font-mono text-zinc-500 block">Región</span>
                  <span className="text-xs sm:text-sm font-sans font-medium text-zinc-200 truncate block">{country.subregionEs || country.continentEs}</span>
                </div>
              </div>

              <div className="p-3 bg-[#121214] rounded-xl border border-zinc-800 flex items-center gap-2.5 col-span-2 sm:col-span-1">
                <Users className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="overflow-hidden">
                  <span className="text-[10px] uppercase font-mono text-zinc-500 block">Población</span>
                  <span className="text-xs sm:text-sm font-mono text-emerald-400 truncate block">
                    {country.population ? country.population.toLocaleString('es-ES') : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Pie informativo */}
          <div className="text-center pt-1">
            <span className="text-xs text-zinc-500 font-sans">
              Pulsa fuera o presiona <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono text-[11px]">Esc</kbd> para volver al juego.
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
