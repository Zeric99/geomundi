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
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={`relative z-10 w-full ${
            hideDetails ? 'max-w-xl' : 'max-w-2xl'
          } bg-gradient-to-b from-[#131C2E] via-[#0F172A] to-[#0B1120] border border-cyan-500/40 rounded-3xl p-6 sm:p-7 shadow-[0_0_50px_rgba(6,182,212,0.35)] overflow-hidden space-y-5`}
        >
          {/* Glow de acento superior */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-500 shadow-glow-cyan" />

          {/* Botón de Cierre (X) */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all active:scale-95 shadow-md border border-slate-700"
            title="Cerrar (Esc)"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Cabecera: Si está en modo juego, título neutral sin spoilers */}
          {hideDetails ? (
            <div className="flex items-center gap-2.5 pr-10">
              <div className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
                <Flag className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-400">
                  Visor de Banderas HD
                </span>
                <h3 className="text-lg font-black text-white">
                  Inspección de Bandera
                </h3>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 pr-10">
              <span className="text-3xl sm:text-4xl">{country.flagEmoji}</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-extrabold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
                    {country.cca3}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {country.continentEs}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black font-display text-white mt-0.5">
                  {country.nameEs}
                </h2>
              </div>
            </div>
          )}

          {/* Imagen de Bandera en Alta Definición */}
          <div className="relative w-full aspect-[3/2] max-h-[360px] rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-700 bg-slate-950/90 flex items-center justify-center group">
            <img
              src={country.flagSvg}
              alt="Bandera en alta definición"
              className="w-full h-full object-contain drop-shadow-[0_8px_25px_rgba(0,0,0,0.8)] transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md border border-slate-700 text-[11px] font-semibold text-slate-300 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <ZoomIn className="w-3.5 h-3.5 text-cyan-400" />
              <span>Máxima Resolución</span>
            </div>
          </div>

          {/* Datos Rápidos del País (ÚNICAMENTE en Modo Explorador, NUNCA en partidas de adivinar) */}
          {!hideDetails && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center gap-2.5">
                <Landmark className="w-4 h-4 text-purple-400 shrink-0" />
                <div className="overflow-hidden">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Capital</span>
                  <span className="text-xs sm:text-sm font-bold text-white truncate block">{country.capital}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-cyan-400 shrink-0" />
                <div className="overflow-hidden">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Región</span>
                  <span className="text-xs sm:text-sm font-bold text-white truncate block">{country.subregionEs || country.continentEs}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center gap-2.5 col-span-2 sm:col-span-1">
                <Users className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="overflow-hidden">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Población</span>
                  <span className="text-xs sm:text-sm font-bold text-white truncate block">
                    {country.population ? country.population.toLocaleString('es-ES') : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Pie informativo */}
          <div className="text-center pt-1">
            <span className="text-xs text-slate-400">
              Pulsa fuera o presiona <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[11px]">Esc</kbd> para volver al juego.
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
