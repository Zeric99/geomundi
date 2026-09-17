import React, { useState, useEffect } from 'react';
import { empireEconomyService, DailyEconomyState } from '../services/empireEconomyService';
import { empireStorageService } from '../services/empireStorageService';
import { empireSound } from '../services/empireSoundService';
import { 
  X, 
  Coins, 
  Trophy, 
  Swords, 
  Sparkles, 
  Calendar, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  ArrowRight
} from 'lucide-react';

interface TributeMailboxModalProps {
  onClose: () => void;
  onNavigateToDaily?: () => void;
  onNavigateToRanked?: () => void;
}

export const TributeMailboxModal: React.FC<TributeMailboxModalProps> = ({
  onClose,
  onNavigateToDaily,
  onNavigateToRanked
}) => {
  const [econState, setEconState] = useState<DailyEconomyState>(empireEconomyService.getState());
  const [isDailyDone, setIsDailyDone] = useState<boolean>(empireEconomyService.isDailyChallengeCompletedToday());
  const [claimFeedback, setClaimFeedback] = useState<string | null>(null);

  const emp = empireStorageService.getEmpire();
  const bankCount = Object.values(emp.islandSpecializations || {}).filter(s => s === 'fiscal_paradise').length;
  const resortCount = Object.values(emp.islandSpecializations || {}).filter(s => s === 'tourist_resort').length;
  const navalHubCount = Object.values(emp.islandSpecializations || {}).filter(s => s === 'naval_hub').length;
  const taxChestAmount = 150 + Math.round(150 * (bankCount * 0.15));

  useEffect(() => {
    const unsub = empireEconomyService.subscribe(newState => {
      setEconState({ ...newState });
      setIsDailyDone(empireEconomyService.isDailyChallengeCompletedToday());
    });
    return unsub;
  }, []);

  const showFeedback = (msg: string) => {
    setClaimFeedback(msg);
    setTimeout(() => setClaimFeedback(null), 3000);
  };

  const handleClaimDaily = () => {
    if (empireEconomyService.claimDailyChallenge()) {
      empireSound.playCoinClink();
      showFeedback('¡+650 🪙 del Desafío Diario transferidas al Tesoro Imperial!');
    }
  };

  const handleClaimWarLoot = () => {
    const amount = empireEconomyService.claimWarLoot();
    if (amount > 0) {
      empireSound.playCoinClink();
      showFeedback(`¡+${amount} 🪙 de Botín de Guerra transferidas al Tesoro!`);
    }
  };

  const handleClaimTaxChest = () => {
    if (empireEconomyService.claimTaxChest()) {
      empireSound.playCoinClink();
      showFeedback('¡+150 🪙 del Baúl de Impuestos recaudadas!');
    }
  };

  const handleSimulateWin = () => {
    empireEconomyService.simulateRankedWin();
    showFeedback('+75 🪙 depositadas en el Buzón de Guerra');
  };

  const totalCollectedToday = 
    (econState.dailyChallengeClaimed ? 650 : 0) +
    (econState.taxChestClaimed ? 150 : 0) +
    (econState.unclaimedWarLoot);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="bg-[#0b0f17] border border-amber-500/40 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative flex flex-col scrollbar-thin scrollbar-thumb-slate-700">
        
        {/* Cabecera Imperial Dorada */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#141b29] via-[#1a1c14] to-[#141b29] border-b border-slate-800 flex items-center justify-between relative shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/60 text-amber-300 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.25)]">
              <Trophy className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wider font-sans">
                  Tesoro Nacional
                </h2>
                <span className="text-xs font-mono text-amber-300 font-bold bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-400/40">
                  1.100 🪙 / día
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5 font-sans">
                Financia la expansión de tu imperio jugando el Desafío Diario y Duelos 1v1
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="tactical-btn p-1.5 text-slate-400 hover:text-white rounded-lg"
            title="Cerrar Tesoro Nacional"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notificación de feedback */}
        {claimFeedback && (
          <div className="mx-4 sm:mx-5 mt-3 p-3 rounded-xl bg-amber-500/15 border border-amber-400/60 text-amber-200 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-2 shadow-lg">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{claimFeedback}</span>
          </div>
        )}

        {/* Contenido Principal */}
        <div className="p-4 sm:p-5 space-y-3.5">

          {/* BENEFICIOS DE ESPECIALIZACIONES INSULARES */}
          {(bankCount > 0 || resortCount > 0 || navalHubCount > 0) && (
            <div className="tactical-card p-3 space-y-2 border-slate-700/80 bg-[#0e1524]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider font-sans">
                  <span>🏝️</span>
                  <span>Especializaciones Insulares Activas</span>
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                {bankCount > 0 && (
                  <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-500/40 flex items-center gap-2">
                    <span className="text-xl">🏦</span>
                    <div>
                      <span className="font-bold text-amber-200 block">{bankCount} Banco{bankCount > 1 ? 's' : ''} Offshore</span>
                      <span className="text-amber-400/80 font-mono text-[10px]">+{bankCount * 15}% oro en duelos</span>
                    </div>
                  </div>
                )}
                {resortCount > 0 && (
                  <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/40 flex items-center gap-2">
                    <span className="text-xl">🏖️</span>
                    <div>
                      <span className="font-bold text-emerald-200 block">{resortCount} Resort{resortCount > 1 ? 's' : ''}</span>
                      <span className="text-emerald-400/80 font-mono text-[10px]">+{resortCount * 40}🪙/día</span>
                    </div>
                  </div>
                )}
                {navalHubCount > 0 && (
                  <div className="p-2.5 rounded-lg bg-sky-950/30 border border-sky-500/40 flex items-center gap-2">
                    <span className="text-xl">⚓</span>
                    <div>
                      <span className="font-bold text-sky-200 block">{navalHubCount} Hub{navalHubCount > 1 ? 's' : ''} Naval{navalHubCount > 1 ? 'es' : ''}</span>
                      <span className="text-sky-400/80 font-mono text-[10px]">Escala y barcos gratis</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TARJETA 1: DESAFÍO DIARIO (650 🪙) */}
          <div className="p-4 rounded-xl border border-amber-500/40 bg-[#131b29] space-y-3 shadow-lg">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/50 text-amber-300 flex items-center justify-center text-xl shrink-0 shadow-sm">
                  <Calendar className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-white uppercase tracking-wide font-sans">
                      Desafío Diario
                    </h3>
                    <span className="text-xs font-mono text-amber-300 font-bold bg-amber-500/20 px-2 py-0.2 rounded border border-amber-400/40">
                      +650 🪙
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Presupuesto nacional garantizado por tu racha geográfica diaria
                  </p>
                </div>
              </div>

              {econState.dailyChallengeClaimed ? (
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/50 px-2.5 py-1 rounded-lg border border-emerald-700/50 flex items-center gap-1.5 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Cobrado
                </span>
              ) : isDailyDone ? (
                <button
                  onClick={handleClaimDaily}
                  className="tactical-btn-cta px-3.5 py-2 text-xs flex items-center gap-1.5 shrink-0 text-black animate-pulse rounded-lg"
                >
                  <Coins className="w-4 h-4" />
                  <span>Reclamar 650 🪙</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    onClose();
                    if (onNavigateToDaily) onNavigateToDaily();
                  }}
                  className="px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/60 shrink-0 shadow-sm"
                >
                  <span>Jugar Ahora</span>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                </button>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] font-mono">
              <span className={isDailyDone ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                Estado: {isDailyDone ? 'Completado ✓' : 'Pendiente de jugar hoy'}
              </span>
              <span className="text-amber-400/80">1 vez cada 24 horas</span>
            </div>
          </div>

          {/* TARJETA 2: BUZÓN DE BOTÍN DE GUERRA (RANKEDS 1v1) */}
          <div className="p-4 rounded-xl border border-purple-500/40 bg-[#161324] space-y-3 shadow-lg">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/50 text-purple-300 flex items-center justify-center text-xl shrink-0 shadow-sm">
                  <Swords className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-white uppercase tracking-wide font-sans">
                      Buzón de Guerra (1v1)
                    </h3>
                    <span className="text-xs font-mono text-purple-300 font-bold bg-purple-500/20 px-2 py-0.2 rounded border border-purple-400/40">
                      300 🪙 / día
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Gana +75 🪙 por victoria (+125 con racha) en tus primeros 5 duelos
                  </p>
                </div>
              </div>

              {econState.unclaimedWarLoot > 0 ? (
                <button
                  onClick={handleClaimWarLoot}
                  className="tactical-btn-cta px-3.5 py-2 text-xs flex items-center gap-1.5 shrink-0 text-black animate-pulse rounded-lg"
                >
                  <Coins className="w-4 h-4" />
                  <span>Reclamar {econState.unclaimedWarLoot} 🪙</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    onClose();
                    if (onNavigateToRanked) onNavigateToRanked();
                  }}
                  className="px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-400/60 shrink-0 shadow-sm"
                >
                  <span>Ir a Duelos</span>
                  <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
                </button>
              )}
            </div>

            {/* Progreso del cupo de 5 duelos óptimos */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-400">Cupo óptimo diario:</span>
                <span className="font-bold text-purple-300">
                  {Math.min(5, econState.rankedPlayedToday)} / 5 duelos
                </span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-amber-400 transition-all duration-300"
                  style={{ width: `${Math.min(100, (econState.rankedPlayedToday / 5) * 100)}%` }}
                />
              </div>
            </div>

            {/* Resumen de botín acumulado y botón de simulación */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] font-mono">
              <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span>En buzón: {econState.unclaimedWarLoot} 🪙</span>
              </div>
              <button
                onClick={handleSimulateWin}
                className="text-[11px] text-amber-400 hover:text-amber-200 underline transition-colors"
                title="Simula un duelo ganado para probar la economía"
              >
                + Simular Victoria (+75🪙)
              </button>
            </div>
          </div>

          {/* TARJETA 3: BAÚL DE IMPUESTOS (150 🪙) */}
          <div className="p-4 rounded-xl border border-emerald-500/40 bg-[#121c1a] space-y-3 shadow-lg">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 flex items-center justify-center text-xl shrink-0 shadow-sm">
                  {econState.taxChestClaimed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : econState.rankedPlayedToday >= 5 ? (
                    <Unlock className="w-5 h-5 text-emerald-300" />
                  ) : (
                    <Lock className="w-5 h-5 text-slate-500" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-white uppercase tracking-wide font-sans">
                      Baúl de Impuestos
                    </h3>
                    <span className="text-xs font-mono text-emerald-300 font-bold bg-emerald-500/20 px-2 py-0.2 rounded border border-emerald-400/40">
                      +{taxChestAmount} 🪙
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Se desbloquea al completar tus 5 partidas Rankeds del día
                    {bankCount > 0 && ` · +${bankCount * 15}% por Bancos Insulares`}
                  </p>
                </div>
              </div>

              {econState.taxChestClaimed ? (
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/50 px-2.5 py-1 rounded-lg border border-emerald-700/50 flex items-center gap-1.5 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Recaudado
                </span>
              ) : econState.rankedPlayedToday >= 5 ? (
                <button
                  onClick={handleClaimTaxChest}
                  className="tactical-btn-cta px-3.5 py-2 text-xs flex items-center gap-1.5 shrink-0 text-black animate-pulse rounded-lg"
                >
                  <Unlock className="w-4 h-4" />
                  <span>Abrir Baúl ({taxChestAmount} 🪙)</span>
                </button>
              ) : (
                <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 flex items-center gap-1.5 shrink-0">
                  <Lock className="w-3.5 h-3.5" />
                  {5 - econState.rankedPlayedToday} restantes
                </span>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] font-mono">
              <span className={econState.rankedPlayedToday >= 5 ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                {econState.rankedPlayedToday >= 5 
                  ? '¡Listo para recaudar!'
                  : `Juega ${5 - econState.rankedPlayedToday} duelo(s) más para abrir`}
              </span>
              <span className="text-emerald-400 font-bold">{taxChestAmount} 🪙 {bankCount > 0 ? `(+${bankCount * 15}% Bancos)` : 'fijas'}</span>
            </div>
          </div>

        </div>

        {/* Pie: Resumen total */}
        <div className="p-4 bg-[#0d131f] border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-300 font-mono text-xs">
            Recaudación hoy: <strong className="text-amber-300 font-mono text-sm">{totalCollectedToday} / 1.100 🪙</strong>
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
