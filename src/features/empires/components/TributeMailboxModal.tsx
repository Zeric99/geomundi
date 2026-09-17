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
  ArrowRight,
  Flame,
  Zap,
  HelpCircle
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
    (econState.unclaimedWarLoot); // aprox recaudación diaria

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative flex flex-col scrollbar-thin scrollbar-thumb-zinc-800">
        
        {/* Cabecera */}
        <div className="p-5 sm:p-6 bg-gradient-to-b from-amber-500/10 via-zinc-900/40 to-transparent border-b border-zinc-800 flex items-center justify-between relative">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                Tributos y Tesoro Nacional
                <span className="text-[11px] font-mono font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                  1.100 🪙/día
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Financia la expansión de tu Imperio jugando el Desafío Diario y Duelos 1v1
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

        {/* Notificación de feedback */}
        {claimFeedback && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{claimFeedback}</span>
          </div>
        )}

        {/* Contenido Principal */}
        <div className="p-5 sm:p-6 space-y-4">

          {/* BENEFICIOS DE ESPECIALIZACIONES INSULARES */}
          {(bankCount > 0 || resortCount > 0 || navalHubCount > 0) && (
            <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <span>🏝️</span>
                  <span>Especializaciones Insulares Activas</span>
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                {bankCount > 0 && (
                  <div className="bg-zinc-900/80 p-2 rounded-xl border border-zinc-800 flex items-center gap-2">
                    <span className="text-base">🏦</span>
                    <div>
                      <span className="font-bold text-white block">{bankCount} Banco{bankCount > 1 ? 's' : ''} Offshore</span>
                      <span className="text-amber-400 font-mono text-[10px]">+{bankCount * 15}% oro en duelos y baúl</span>
                    </div>
                  </div>
                )}
                {resortCount > 0 && (
                  <div className="bg-zinc-900/80 p-2 rounded-xl border border-zinc-800 flex items-center gap-2">
                    <span className="text-base">🏖️</span>
                    <div>
                      <span className="font-bold text-white block">{resortCount} Resort{resortCount > 1 ? 's' : ''}</span>
                      <span className="text-emerald-400 font-mono text-[10px]">+{resortCount * 40}🪙/día · +{resortCount * 10}% Felicidad</span>
                    </div>
                  </div>
                )}
                {navalHubCount > 0 && (
                  <div className="bg-zinc-900/80 p-2 rounded-xl border border-zinc-800 flex items-center gap-2">
                    <span className="text-base">⚓</span>
                    <div>
                      <span className="font-bold text-white block">{navalHubCount} Hub{navalHubCount > 1 ? 's' : ''} Naval{navalHubCount > 1 ? 'es' : ''}</span>
                      <span className="text-blue-300 font-mono text-[10px]">Escala y expediciones gratis</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TARJETA 1: DESAFÍO DIARIO (650 🪙) */}
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4 transition-all hover:border-zinc-700 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    Desafío Diario
                    <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                      650 🪙
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-400">
                    El gran presupuesto nacional otorgado por tu racha geográfica
                  </p>
                </div>
              </div>

              {econState.dailyChallengeClaimed ? (
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1.5 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Reclamado
                </span>
              ) : isDailyDone ? (
                <button
                  onClick={handleClaimDaily}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 transition-all shrink-0 animate-pulse"
                >
                  <Coins className="w-3.5 h-3.5" />
                  Reclamar 650 🪙
                </button>
              ) : (
                <button
                  onClick={() => {
                    onClose();
                    if (onNavigateToDaily) onNavigateToDaily();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs border border-zinc-700 flex items-center gap-1.5 transition-all shrink-0"
                >
                  <span>Jugar Ahora</span>
                  <ArrowRight className="w-3 h-3 text-zinc-400" />
                </button>
              )}
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-zinc-800/80 text-[11px] text-zinc-500">
              <span>Estado hoy: {isDailyDone ? '✅ Completado con éxito' : '⏳ Pendiente de jugar'}</span>
              <span>1 vez al día</span>
            </div>
          </div>

          {/* TARJETA 2: BUZÓN DE BOTÍN DE GUERRA (RANKEDS 1v1) */}
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4 transition-all hover:border-zinc-700 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
                  <Swords className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    Buzón de Guerra (Rankeds 1v1)
                    <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-400/10 px-2 py-0.5 rounded-md border border-cyan-400/20">
                      300 🪙/día
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Gana +75 🪙 por victoria (+125 con racha) en tus primeros 5 duelos
                  </p>
                </div>
              </div>

              {econState.unclaimedWarLoot > 0 ? (
                <button
                  onClick={handleClaimWarLoot}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold text-xs shadow-lg shadow-amber-600/30 flex items-center gap-1.5 transition-all shrink-0 animate-pulse"
                >
                  <Coins className="w-3.5 h-3.5" />
                  Reclamar {econState.unclaimedWarLoot} 🪙
                </button>
              ) : (
                <button
                  onClick={() => {
                    onClose();
                    if (onNavigateToRanked) onNavigateToRanked();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs border border-zinc-700 flex items-center gap-1.5 transition-all shrink-0"
                >
                  <span>Ir a Duelos</span>
                  <ArrowRight className="w-3 h-3 text-zinc-400" />
                </button>
              )}
            </div>

            {/* Progreso del cupo de 5 duelos óptimos */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Cupo óptimo diario:</span>
                <span className="font-mono font-bold text-white">
                  {Math.min(5, econState.rankedPlayedToday)} / 5 duelos
                </span>
              </div>
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-500 rounded-full"
                  style={{ width: `${Math.min(100, (econState.rankedPlayedToday / 5) * 100)}%` }}
                />
              </div>
            </div>

            {/* Resumen de botín acumulado y botón de simulación */}
            <div className="flex items-center justify-between pt-1 border-t border-zinc-800/80 text-[11px] text-zinc-400">
              <div className="flex items-center gap-1 text-amber-400 font-bold">
                <Coins className="w-3.5 h-3.5" />
                <span>En el buzón: {econState.unclaimedWarLoot} 🪙</span>
              </div>
              <button
                onClick={handleSimulateWin}
                className="text-[10px] text-zinc-500 hover:text-zinc-300 underline transition-colors"
                title="Simula un duelo ganado para probar la economía"
              >
                + Simular Duelo (+75🪙)
              </button>
            </div>
          </div>

          {/* TARJETA 3: BAÚL DE IMPUESTOS (150 🪙) */}
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4 transition-all hover:border-zinc-700 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl border ${
                  econState.taxChestClaimed
                    ? 'bg-zinc-800 border-zinc-700 text-zinc-500'
                    : econState.rankedPlayedToday >= 5
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                    : 'bg-zinc-800/60 border-zinc-700/60 text-zinc-500'
                }`}>
                  {econState.taxChestClaimed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : econState.rankedPlayedToday >= 5 ? (
                    <Unlock className="w-5 h-5 text-amber-400 animate-bounce" />
                  ) : (
                    <Lock className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    Baúl de Impuestos Imperial
                    <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                      {taxChestAmount} 🪙
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Se desbloquea al completar tus 5 partidas Rankeds del día
                    {bankCount > 0 && ` · +${bankCount * 15}% por ${bankCount} Banco(s) Offshore`}
                  </p>
                </div>
              </div>

              {econState.taxChestClaimed ? (
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1.5 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Cobrado
                </span>
              ) : econState.rankedPlayedToday >= 5 ? (
                <button
                  onClick={handleClaimTaxChest}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold text-xs shadow-lg shadow-amber-600/30 flex items-center gap-1.5 transition-all shrink-0 animate-pulse"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  Abrir Baúl ({taxChestAmount} 🪙)
                </button>
              ) : (
                <span className="text-xs font-mono text-zinc-500 bg-zinc-800/80 px-2.5 py-1 rounded-lg border border-zinc-700/60 flex items-center gap-1 shrink-0">
                  <Lock className="w-3 h-3" />
                  {5 - econState.rankedPlayedToday} restantes
                </span>
              )}
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-zinc-800/80 text-[11px] text-zinc-500">
              <span>
                {econState.rankedPlayedToday >= 5 
                  ? '🔓 Candado abierto: ¡listo para recaudar!'
                  : `🔒 Juega ${5 - econState.rankedPlayedToday} duelo(s) más para abrir el candado`}
              </span>
              <span>{taxChestAmount} 🪙 {bankCount > 0 ? `(+${bankCount * 15}% Bancos)` : 'fijas'}</span>
            </div>
          </div>

        </div>

        {/* Pie: Resumen total */}
        <div className="p-4 bg-zinc-900/50 border-t border-zinc-800 flex items-center justify-between text-xs">
          <span className="text-zinc-400">
            Recaudación estimada del día: <strong className="text-amber-400 font-mono">{totalCollectedToday} / 1.100 🪙</strong>
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
