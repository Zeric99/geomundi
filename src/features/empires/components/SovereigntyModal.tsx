import React, { useState } from 'react';
import { empireStorageService, CountrySovereigntyInfo } from '../services/empireStorageService';
import { UserEmpire } from '../types';
import { X, Globe2, Crown, MapPin, Users, Anchor, Award, Sparkles } from 'lucide-react';

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
  const [claimFeedback, setClaimFeedback] = useState<string | null>(null);
  const sovereigntyList: CountrySovereigntyInfo[] = empireStorageService.getSovereigntyStats();
  const totalCountries = sovereigntyList.length;
  const totalAnnexed = sovereigntyList.filter(s => s.isAnnexed).length;

  const handleClaimSovereignty = (countryCode: string, countryName: string) => {
    const res = empireStorageService.claimCountrySovereignty(countryCode);
    if (res.success) {
      setClaimFeedback(`¡Enhorabuena! Has anexionado ${countryName} (${countryCode}). Ahora es territorio propio con Soberanía Dorada.`);
      setTimeout(() => setClaimFeedback(null), 4500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="bg-[#0b101d] border border-sky-500/40 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative flex flex-col scrollbar-thin scrollbar-thumb-slate-700">
        
        {/* Cabecera Soberana Real */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#121c2e] via-[#172033] to-[#121c2e] border-b border-slate-800 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/60 text-amber-300 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.25)]">
              <Crown className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wider font-sans">
                  Soberanía Territorial y Naciones
                </h2>
                <span className="text-xs font-mono text-amber-300 font-bold bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-400/40">
                  {totalAnnexed} Propias / {totalCountries} Colonizadas
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5 font-sans">
                Estados y territorios bajo el control de {empire.empireName}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="tactical-btn p-1.5 text-slate-400 hover:text-white rounded-lg"
            title="Cerrar panel de naciones"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notificación de feedback al reclamar */}
        {claimFeedback && (
          <div className="mx-4 sm:mx-5 mt-3 p-3 rounded-xl bg-amber-500/15 border border-amber-400/60 text-amber-200 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-2 shadow-lg">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{claimFeedback}</span>
          </div>
        )}

        {/* Criterios de Soberanía (Banner Explicativo con Medallas Tácticas) */}
        <div className="mx-4 sm:mx-5 mt-3.5 p-3.5 rounded-xl bg-[#0f172a] border border-slate-700/80 text-[11px] text-slate-200 space-y-2.5 shadow-md">
          <div className="font-bold text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span className="font-sans font-black uppercase tracking-wider text-xs text-amber-300">
                Rangos de Reconocimiento Territorial
              </span>
            </div>
            <span className="text-[10.5px] text-slate-400 font-mono">Tier 1 → Tier 3</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
            {/* Tier 1 */}
            <div className="p-2.5 rounded-lg bg-[#181512] border border-amber-800/50 flex flex-col justify-between">
              <span className="font-bold text-amber-300 font-mono block">🥉 01 · Colono</span>
              <span className="text-slate-300 mt-1 leading-snug text-[10.5px]">
                Presencia colonial inicial (al menos 1 casilla en el país)
              </span>
            </div>

            {/* Tier 2 */}
            <div className="p-2.5 rounded-lg bg-[#111c2e] border border-sky-600/50 flex flex-col justify-between">
              <span className="font-bold text-sky-300 font-mono block">🥈 02 · Desarrollado</span>
              <span className="text-slate-300 mt-1 leading-snug text-[10.5px]">
                5+ casillas y al menos un 🏡 Pueblo (Nivel 2) establecido
              </span>
            </div>

            {/* Tier 3 */}
            <div className="p-2.5 rounded-lg bg-[#1f1a0d] border border-amber-400/80 flex flex-col justify-between shadow-[0_0_12px_rgba(245,158,11,0.2)]">
              <span className="font-bold text-amber-300 font-mono block flex items-center gap-1">
                🥇 03 · Soberanía Dorada
              </span>
              <span className="text-amber-200/90 mt-1 leading-snug text-[10.5px]">
                ≥90% casillas + 🌆 Megaciudad. ¡Proclama el país como territorio propio!
              </span>
            </div>
          </div>
        </div>

        {/* Lista de Países Colonizados */}
        <div className="p-4 sm:p-5 space-y-3">
          {sovereigntyList.length === 0 ? (
            <div className="text-center py-10 text-slate-400 space-y-2">
              <Globe2 className="w-10 h-10 mx-auto text-slate-500" />
              <p className="text-xs">Aún no has colonizado ningún país. Funda tu primera Capital para comenzar tu imperio.</p>
            </div>
          ) : (
            sovereigntyList.map(item => {
              const hasNinetyPercent = item.controlPercentage >= 90;
              const hasMegacity = item.highestTier >= 4;

              return (
                <div 
                  key={item.countryCode}
                  className={`border rounded-xl p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 shadow-md ${
                    item.isAnnexed
                      ? 'bg-[#121c2c] border-amber-400/80 shadow-[0_0_15px_rgba(245,158,11,0.2)] ring-1 ring-amber-400/40'
                      : item.canClaimSovereignty
                      ? 'bg-[#151f33] border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                      : 'bg-[#0e1422] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Info País */}
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm font-mono shrink-0 border ${
                      item.isAnnexed
                        ? 'bg-amber-500/20 text-amber-300 border-amber-400/60 shadow-sm'
                        : 'bg-slate-800 text-sky-300 border-slate-700'
                    }`}>
                      {item.countryCode}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-black text-white tracking-wide uppercase font-sans truncate">
                          {item.countryName}
                        </h4>

                        {item.isAnnexed ? (
                          <span className="text-[11px] font-mono font-black text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-400/50 flex items-center gap-1 shadow-sm">
                            <Crown className="w-3.5 h-3.5 text-amber-400" />
                            <span>Soberanía Dorada · Territorio Propio</span>
                          </span>
                        ) : (
                          <span className="text-[11px] font-mono font-bold text-sky-300 bg-sky-500/15 px-2 py-0.5 rounded border border-sky-500/30">
                            {item.rankLabel}
                          </span>
                        )}
                      </div>

                      {/* Estadísticas de control y población */}
                      <div className="flex items-center gap-3.5 text-xs text-slate-300 mt-1.5 flex-wrap font-mono">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-amber-400" />
                          <strong className={hasNinetyPercent ? 'text-amber-300 font-bold' : 'text-white'}>
                            {item.tileCount} / {item.totalCountryTiles}
                          </strong>
                          <span className={hasNinetyPercent ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                            ({item.controlPercentage}%)
                          </span>
                        </span>

                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-cyan-400" />
                          <strong className="text-cyan-200">{item.population.toLocaleString()}</strong> hab.
                        </span>

                        {item.hasPort && (
                          <span className="flex items-center gap-1 text-sky-300 font-bold" title="Tiene puerto marítimo activo">
                            <Anchor className="w-3.5 h-3.5 text-sky-400" />
                            Puerto
                          </span>
                        )}
                      </div>

                      {/* Requisitos para Soberanía Dorada si aún no es anexionado */}
                      {!item.isAnnexed && (
                        <div className="flex items-center gap-2 mt-2 text-[10.5px] font-mono flex-wrap">
                          <span className={`px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                            hasNinetyPercent
                              ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40 font-bold'
                              : 'bg-slate-900 text-slate-400 border-slate-800'
                          }`}>
                            {hasNinetyPercent ? '✓' : '○'} Control ≥90% ({item.controlPercentage}%)
                          </span>
                          <span className={`px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                            hasMegacity
                              ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40 font-bold'
                              : 'bg-slate-900 text-slate-400 border-slate-800'
                          }`}>
                            {hasMegacity ? '✓' : '○'} Megaciudad ({TIER_LABELS[item.highestTier] || 'Ninguna'})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Botón de Acción o Estado Máximo */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 border-slate-800 pt-2 sm:pt-0 shrink-0">
                    {item.canClaimSovereignty ? (
                      <button
                        onClick={() => handleClaimSovereignty(item.countryCode, item.countryName)}
                        className="tactical-btn-cta px-3.5 py-2 text-xs flex items-center gap-1.5 cursor-pointer uppercase tracking-wider text-black font-black animate-pulse rounded-lg shadow-lg"
                        title="Reclamar soberanía plena y proclamar territorio propio"
                      >
                        <Crown className="w-4 h-4" />
                        <span>Reclamar Territorio</span>
                      </button>
                    ) : item.isAnnexed ? (
                      <div className="text-right">
                        <span className="text-[10px] text-amber-400/80 uppercase tracking-wider block font-mono font-bold">Estado Soberano</span>
                        <span className="text-xs font-black text-amber-300 font-mono inline-flex items-center gap-1">
                          ✓ Territorio Propio
                        </span>
                      </div>
                    ) : (
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-mono">Núcleo</span>
                        <span className="text-xs font-bold text-slate-200 font-mono">
                          {TIER_LABELS[item.highestTier] || TIER_LABELS[0]}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pie */}
        <div className="p-4 bg-[#0d131f] border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-300 font-mono text-xs">
            Casillas colonizadas en total: <strong className="text-amber-300 font-mono text-sm">{Object.keys(empire.colonizedTiles).length}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors border border-slate-700"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
