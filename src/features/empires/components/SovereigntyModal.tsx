import React from 'react';
import { empireStorageService, CountrySovereigntyInfo } from '../services/empireStorageService';
import { UserEmpire } from '../types';
import { X, Globe2, Crown, MapPin, Users, Anchor, Award } from 'lucide-react';

interface SovereigntyModalProps {
  empire: UserEmpire;
  onClose: () => void;
}

const TIER_LABELS: Record<number, string> = {
  0: 'Sin Asentamiento',
  1: '⛺ Aldea',
  2: '🏡 Pueblo',
  3: '🏙️ Ciudad',
  4: '🌆 Megaciudad'
};

export const SovereigntyModal: React.FC<SovereigntyModalProps> = ({
  empire,
  onClose
}) => {
  const sovereigntyList: CountrySovereigntyInfo[] = empireStorageService.getSovereigntyStats();
  const totalCountries = sovereigntyList.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative flex flex-col scrollbar-thin scrollbar-thumb-zinc-800">
        
        {/* Cabecera */}
        <div className="p-5 sm:p-6 bg-gradient-to-b from-indigo-500/10 via-zinc-900/40 to-transparent border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                Soberanía Territorial y Censo
                <span className="text-[11px] font-mono font-bold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
                  {totalCountries} / 195 Países
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Estados y naciones bajo la soberanía de {empire.empireName}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Criterios de Soberanía (Mini Banner Explicativo) */}
        <div className="mx-5 sm:mx-6 mt-4 p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-[11px] text-zinc-300 space-y-1.5">
          <div className="font-bold text-zinc-200 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Niveles de Reconocimiento Internacional:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[10px]">
            <div className="bg-zinc-800/60 p-2 rounded-xl border border-zinc-700/50">
              <span className="font-bold text-amber-300 block">🥉 Reclamado</span>
              <span className="text-zinc-400">Presencia inicial (1+ casillas)</span>
            </div>
            <div className="bg-zinc-800/60 p-2 rounded-xl border border-zinc-700/50">
              <span className="font-bold text-slate-300 block">🥈 Desarrollado</span>
              <span className="text-zinc-400">5+ casillas y 🏡 Pueblo</span>
            </div>
            <div className="bg-zinc-800/60 p-2 rounded-xl border border-zinc-700/50">
              <span className="font-bold text-yellow-400 block">🥇 Soberanía Dorada</span>
              <span className="text-zinc-400">15+ casillas y 🏙️ Ciudad</span>
            </div>
          </div>
        </div>

        {/* Lista de Países Colonizados */}
        <div className="p-5 sm:p-6 space-y-3">
          {sovereigntyList.length === 0 ? (
            <div className="text-center py-10 text-zinc-500 space-y-2">
              <Globe2 className="w-8 h-8 mx-auto opacity-40" />
              <p className="text-xs">Aún no has colonizado ningún país. Funda tu primera Capital para comenzar tu imperio.</p>
            </div>
          ) : (
            sovereigntyList.map(item => (
              <div 
                key={item.countryCode}
                className="bg-zinc-900/70 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-3.5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                {/* Info País */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-800/80 border border-zinc-700/80 flex items-center justify-center font-bold text-sm text-zinc-200">
                    {item.countryCode}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white tracking-wide">
                        {item.countryName}
                      </h4>
                      {(empire.annexedCountries || []).includes(item.countryCode) && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)] flex items-center gap-1">
                          👑 Anexión Oficial
                        </span>
                      )}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        item.sovereigntyRank === 3
                          ? 'bg-yellow-500/15 border-yellow-500/40 text-yellow-300 shadow-[0_0_10px_rgba(234,179,8,0.2)]'
                          : item.sovereigntyRank === 2
                          ? 'bg-slate-400/15 border-slate-400/30 text-slate-300'
                          : 'bg-amber-700/15 border-amber-700/30 text-amber-400'
                      }`}>
                        {item.rankLabel}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-indigo-400" />
                        <strong className="text-zinc-200">{item.tileCount}</strong> casillas
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-emerald-400" />
                        <strong className="text-zinc-200">{item.population.toLocaleString()}</strong> hab.
                      </span>
                      {item.hasPort && (
                        <span className="flex items-center gap-0.5 text-blue-400 text-[11px]" title="Tiene puerto marítimo activo">
                          <Anchor className="w-3 h-3" />
                          Puerto
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Asentamiento máximo */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 border-zinc-800/80 pt-2 sm:pt-0">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Máx. Núcleo</span>
                  <span className="text-xs font-bold text-indigo-300 bg-indigo-950/40 px-2 py-0.5 rounded-lg border border-indigo-800/40">
                    {TIER_LABELS[item.highestTier] || TIER_LABELS[0]}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pie */}
        <div className="p-4 bg-zinc-900/50 border-t border-zinc-800 flex items-center justify-between text-xs">
          <span className="text-zinc-400">
            Total casillas soberanas: <strong className="text-white font-mono">{Object.keys(empire.colonizedTiles).length}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition-colors"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
