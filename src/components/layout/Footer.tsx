import React from 'react';
import { Globe, Heart, Shield, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#080C14] border-t border-slate-850 py-8 px-4 sm:px-6 mt-16 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-slate-300">GeoMundi</span>
          <span>— Plataforma Gamificada de Aprendizaje Geográfico</span>
        </div>

        <div className="flex items-center gap-4 flex-wrap justify-center text-[11px]">
          <span>Datos: <strong>REST Countries API</strong></span>
          <span>•</span>
          <span>Mapas: <strong>Natural Earth / TopoJSON</strong></span>
          <span>•</span>
          <span className="text-cyan-400 font-bold">Created by: halfo99</span>
        </div>
      </div>
    </footer>
  );
};
