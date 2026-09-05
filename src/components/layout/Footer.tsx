import React from 'react';
import { Globe } from 'lucide-react';

interface FooterProps {
  isCompact?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ isCompact = false }) => {
  return (
    <footer className={`w-full shrink-0 text-[10px] sm:text-[11px] border-t border-zinc-800/80 bg-[#121214]/95 backdrop-blur-sm ${
      isCompact ? 'py-1 px-2.5 mt-0.5' : 'py-2 px-4 mt-4'
    }`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 flex-wrap text-zinc-400 font-sans">
        <div className="flex items-center gap-1.5">
          <Globe className="w-3 h-3 text-indigo-400 shrink-0" />
          <span className="font-bold text-zinc-200">MapTap</span>
          <span className="hidden sm:inline">— Plataforma Gamificada de Aprendizaje Geográfico</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap text-[10px] font-mono">
          <span>Datos: <strong className="text-zinc-300 font-semibold">REST Countries API</strong></span>
          <span className="text-zinc-700">•</span>
          <span>Mapas: <strong className="text-zinc-300 font-semibold">Natural Earth / TopoJSON</strong></span>
          <span className="text-zinc-700">•</span>
          <span className="text-indigo-400 font-bold">Created by: halfo99</span>
        </div>
      </div>
    </footer>
  );
};
