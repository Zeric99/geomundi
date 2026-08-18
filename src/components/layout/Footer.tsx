import React from 'react';
import { Globe } from 'lucide-react';

interface FooterProps {
  isCompact?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ isCompact = false }) => {
  return (
    <footer className={`w-full shrink-0 text-[10px] sm:text-[11px] border-t border-slate-800/60 bg-[#080C14]/95 backdrop-blur-sm ${
      isCompact ? 'py-1 px-2.5 mt-0.5' : 'py-2 px-4 mt-4'
    }`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 flex-wrap text-slate-400">
        <div className="flex items-center gap-1.5">
          <Globe className="w-3 h-3 text-cyan-400 shrink-0" />
          <span className="font-bold text-slate-300">MapTap</span>
          <span className="hidden sm:inline">— Plataforma Gamificada de Aprendizaje Geográfico</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap text-[10px]">
          <span>Datos: <strong className="text-slate-300 font-semibold">REST Countries API</strong></span>
          <span>•</span>
          <span>Mapas: <strong className="text-slate-300 font-semibold">Natural Earth / TopoJSON</strong></span>
          <span>•</span>
          <span className="text-cyan-400 font-bold">Created by: halfo99</span>
        </div>
      </div>
    </footer>
  );
};
