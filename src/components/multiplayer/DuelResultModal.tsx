import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Swords, CheckCircle2, XCircle, Flame, ArrowRight, Home, RotateCcw, Zap, Crown } from 'lucide-react';
import { DuelState } from '../../types/multiplayer';

interface DuelResultModalProps {
  duelState: DuelState;
  onPlayAgain: () => void;
  onReturnToMenu: () => void;
}

export const DuelResultModal: React.FC<DuelResultModalProps> = ({
  duelState,
  onPlayAgain,
  onReturnToMenu
}) => {
  const isWinner = duelState.winner === 'player';
  const isTie = duelState.winner === 'tie';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="bg-[#18181B] border border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative overflow-hidden space-y-6 animate-in zoom-in-95 duration-200 text-center">
        {/* Cabecera de Resultado */}
        <div className="space-y-2">
          <div className={`inline-flex p-4 rounded-2xl border ${
            isWinner
              ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
              : isTie
              ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400'
              : 'bg-rose-500/15 border-rose-500/30 text-rose-400'
          }`}>
            {isWinner ? <Trophy className="w-10 h-10" /> : <Swords className="w-10 h-10" />}
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-zinc-100">
            {isWinner ? '¡VICTORIA EN EL DUELO!' : isTie ? '¡EMPATE TÉCNICO!' : 'DERROTA'}
          </h2>

          {/* Cambio de ELO */}
          {duelState.type === 'ranked' && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full font-mono text-sm font-bold border bg-zinc-900">
              <span className="text-zinc-400">Rango ELO:</span>
              <span className={duelState.eloChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                {duelState.eloChange >= 0 ? `+${duelState.eloChange}` : duelState.eloChange} ELO
              </span>
              <span className="text-amber-400 ml-1">({duelState.player.elo} ELO)</span>
            </div>
          )}
        </div>

        {/* Comparación Cara a Cara */}
        <div className="grid grid-cols-5 items-center bg-[#121214] p-4 rounded-2xl border border-zinc-800">
          {/* Jugador */}
          <div className="col-span-2 space-y-1 text-center">
            <div className="w-12 h-12 rounded-xl bg-indigo-950/60 border border-indigo-500/50 mx-auto flex items-center justify-center text-2xl shadow-sm">
              {duelState.player.avatar}
            </div>
            <div className="font-bold text-xs sm:text-sm text-zinc-100 truncate">{duelState.player.name}</div>
            <div className="text-lg font-mono font-bold text-emerald-400">
              {duelState.playerScore} pts
            </div>
            <div className="text-[10px] font-mono text-zinc-400">
              ⏱️ {Math.round(duelState.playerTimeTotalMs / 1000)}s
            </div>
          </div>

          {/* VS */}
          <div className="col-span-1 text-center font-mono font-extrabold text-xs text-zinc-500">
            VS
          </div>

          {/* Rival */}
          <div className="col-span-2 space-y-1 text-center">
            <div className="w-12 h-12 rounded-xl bg-rose-950/60 border border-rose-500/50 mx-auto flex items-center justify-center text-2xl shadow-sm">
              {duelState.rival.avatar}
            </div>
            <div className="font-bold text-xs sm:text-sm text-zinc-100 truncate">{duelState.rival.name}</div>
            <div className="text-lg font-mono font-bold text-amber-400">
              {duelState.rivalScore} pts
            </div>
            <div className="text-[10px] font-mono text-zinc-400">
              ⏱️ {Math.round(duelState.rivalTimeTotalMs / 1000)}s
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={onReturnToMenu}
            className="py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs transition-all flex items-center justify-center gap-2 border border-zinc-700"
          >
            <Home className="w-4 h-4 text-zinc-400" />
            <span>Volver al Menú</span>
          </button>

          <button
            onClick={onPlayAgain}
            className="py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 border border-indigo-500"
          >
            <Swords className="w-4 h-4" />
            <span>Siguiente Duelo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
