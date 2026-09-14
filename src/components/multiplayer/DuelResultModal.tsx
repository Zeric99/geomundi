import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Swords, CheckCircle2, XCircle, Flame, ArrowRight, Home, RotateCcw, Zap, Crown } from 'lucide-react';
import { DuelState } from '../../types/multiplayer';
import { MODE_ELO_CONFIGS } from '../../services/multiplayerService';
import { PlayerAvatar } from '../common/PlayerAvatar';
import { ShareButtonsBar } from '../common/ShareButtonsBar';
import { generateDuelShareText } from '../../utils/shareUtils';

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
  const isCreation = duelState.isChallengeCreation;
  const isWinner = duelState.winner === 'player';
  const isTie = duelState.winner === 'tie';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="bg-[#18181B] border border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative overflow-hidden space-y-6 animate-in zoom-in-95 duration-200 text-center">
        {/* Cabecera de Resultado */}
        <div className="space-y-2">
          <div className={`inline-flex p-4 rounded-2xl border ${
            isCreation
              ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400'
              : isWinner
              ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
              : isTie
              ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400'
              : 'bg-rose-500/15 border-rose-500/30 text-rose-400'
          }`}>
            {isCreation ? <Trophy className="w-10 h-10 text-cyan-400" /> : isWinner ? <Trophy className="w-10 h-10" /> : <Swords className="w-10 h-10" />}
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-zinc-100">
            {isCreation
              ? '¡DESAFÍO PUBLICADO!'
              : isWinner
              ? '¡VICTORIA EN EL DUELO!'
              : isTie
              ? '¡EMPATE TÉCNICO!'
              : 'DERROTA'}
          </h2>

          {isCreation ? (
            <p className="text-xs text-zinc-300 max-w-sm mx-auto leading-relaxed">
              Tu partida se ha publicado en el tablón a ciegas (nadie sabrá tu puntuación). Cuando otro jugador acepte tu reto y termine su partida, se resolverá el duelo y recibirás o perderás ELO según el resultado.
            </p>
          ) : (
            duelState.type === 'ranked' && (() => {
              const modeCfg = MODE_ELO_CONFIGS[duelState.duelMode];
              const modeElo = duelState.player.elos?.[duelState.duelMode] ?? duelState.player.elo;
              return (
                <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full font-mono text-xs sm:text-sm font-bold border ${modeCfg ? modeCfg.borderClass : 'border-zinc-700'} ${modeCfg ? modeCfg.bgClass : 'bg-zinc-900'}`}>
                  <span>{modeCfg?.icon}</span>
                  <span className="text-zinc-300">{modeCfg?.name}:</span>
                  <span className={duelState.eloChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                    {duelState.eloChange >= 0 ? `+${duelState.eloChange}` : duelState.eloChange} ELO
                  </span>
                  <span className={`${modeCfg ? modeCfg.textClass : 'text-amber-400'} ml-1`}>
                    ({modeElo} Elo)
                  </span>
                </div>
              );
            })()
          )}
        </div>

        {/* Comparación o Resumen de Partida */}
        {isCreation ? (
          <div className="bg-[#121214] p-5 rounded-2xl border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400 border-b border-zinc-800 pb-2">
              <span>MODALIDAD:</span>
              <span className="text-cyan-400 font-bold uppercase">{duelState.duelMode}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center pt-1">
              <div>
                <span className="text-[10px] font-mono uppercase text-zinc-500 block">Puntuación Total</span>
                <span className="text-2xl font-mono font-black text-emerald-400">{duelState.playerScore} pts</span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-zinc-500 block">Tiempo Total</span>
                <span className="text-2xl font-mono font-black text-cyan-400">{Math.round(duelState.playerTimeTotalMs / 1000)}s</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-5 items-center bg-[#121214] p-4 rounded-2xl border border-zinc-800">
            {/* Jugador */}
            <div className="col-span-2 space-y-1 text-center">
              <PlayerAvatar
                avatar={duelState.player.avatar}
                name={duelState.player.name}
                className="w-12 h-12 rounded-xl bg-indigo-950/60 border border-indigo-500/50 mx-auto text-2xl shadow-sm"
              />
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
              <PlayerAvatar
                avatar={duelState.rival.avatar}
                name={duelState.rival.name}
                fallbackIcon="👤"
                className="w-12 h-12 rounded-xl bg-rose-950/60 border border-rose-500/50 mx-auto text-2xl shadow-sm"
              />
              <div className="font-bold text-xs sm:text-sm text-zinc-100 truncate">{duelState.rival.name}</div>
              <div className="text-lg font-mono font-bold text-amber-400">
                {duelState.rivalScore} pts
              </div>
              <div className="text-[10px] font-mono text-zinc-400">
                ⏱️ {Math.round(duelState.rivalTimeTotalMs / 1000)}s
              </div>
            </div>
          </div>
        )}

        {/* Compartir resultado del duelo */}
        <div className="bg-[#121214] border border-zinc-800 p-3.5 rounded-2xl space-y-2 text-left">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-300">
              {isCreation ? 'Comparte tu desafío con amigos' : 'Comparte tu resultado'}
            </span>
            <span className="text-[10px] font-mono text-zinc-500">#GeoStrike1v1</span>
          </div>
          <ShareButtonsBar
            shareText={generateDuelShareText({
              modeName: MODE_ELO_CONFIGS[duelState.duelMode]?.name || 'Duelo 1v1',
              playerScore: duelState.playerScore,
              rivalScore: duelState.rivalScore,
              isWinner: duelState.winner === 'player',
              isTie: duelState.winner === 'tie',
              rivalName: duelState.rival.name,
              durationSeconds: Math.round(duelState.playerTimeTotalMs / 1000)
            })}
            shareTitle={`Duelo en GeoStrike - ${MODE_ELO_CONFIGS[duelState.duelMode]?.name || '1v1'}`}
          />
        </div>

        {/* Botones de Acción */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={onReturnToMenu}
            className="py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs transition-all flex items-center justify-center gap-2 border border-zinc-700"
          >
            <Home className="w-4 h-4 text-zinc-400" />
            <span>Volver al Tablón</span>
          </button>

          <button
            onClick={onPlayAgain}
            className="py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 border border-indigo-500"
          >
            <Swords className="w-4 h-4" />
            <span>{isCreation ? 'Crear Otro Desafío' : 'Siguiente Duelo'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

