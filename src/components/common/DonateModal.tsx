import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Coffee, Sparkles, X, CheckCircle2, ShieldCheck } from 'lucide-react';

interface DonateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DonateModal: React.FC<DonateModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative z-10 w-full max-w-lg bg-[#18181B] border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 text-center"
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition border border-zinc-700"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Icono Principal */}
          <div className="inline-flex p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shadow-sm">
            <Coffee className="w-10 h-10" />
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold bg-amber-950/60 px-2.5 py-0.5 rounded border border-amber-800/60">
              100% Gratuito y sin anuncios molestos
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-zinc-100 mt-2">
              Apoya el Proyecto GeoStrike ☕
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 mt-2 leading-relaxed font-sans">
              GeoStrike nació con la misión de ser un recurso educativo, divertido y apto para toda la familia. Queremos mantener esta plataforma siempre **100% gratuita y libre de publicidad intrusiva**.
            </p>
          </div>

          {/* Compromisos de MapTap */}
          <div className="bg-[#121214] border border-zinc-800 rounded-xl p-4 space-y-2 text-left text-xs text-zinc-300 font-sans">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Acceso ilimitado a todas las modalidades y mapa mundial.</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Tutor personal con repetición espaciada (SRS).</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Sin compras dentro de la app ni barreras de pago.</span>
            </div>
          </div>

          {/* Opciones de Donación */}
          <div className="space-y-3 pt-2">
            <a
              href="https://ko-fi.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Coffee className="w-4 h-4 fill-zinc-950" />
              <span>Invítanos a un café en Ko-fi</span>
            </a>

            <a
              href="https://paypal.me"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-sm border border-zinc-700 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
              <span>Hacer una donación con PayPal</span>
            </a>
          </div>

          <p className="text-[11px] text-zinc-500 font-mono">
            ¡Muchas gracias por apoyar la educación geográfica! ❤️
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
