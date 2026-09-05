import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Trophy, Loader2, Zap, ShieldAlert, CheckCircle2, User } from 'lucide-react';
import { PlayerProfile, MultiplayerType, DuelMode } from '../../types/multiplayer';
import { multiplayerService } from '../../services/multiplayerService';

interface MatchmakingModalProps {
  isOpen: boolean;
  type: MultiplayerType;
  duelMode: DuelMode;
  playerProfile: PlayerProfile;
  onMatchFound: (rival: PlayerProfile) => void;
  onCancel: () => void;
}

const DUEL_TITLES: Record<DuelMode, string> = {
  countries: '10 Países en el Mapa',
  flags: '10 Banderas del Mundo',
  capitals: '10 Capitales del Mundo'
};

export const MatchmakingModal: React.FC<MatchmakingModalProps> = ({
  isOpen,
  type,
  duelMode,
  playerProfile,
  onMatchFound,
  onCancel
}) => {
  const [searchingText, setSearchingText] = useState<string>('Buscando oponente en tu rango de ELO...');
  const [rival, setRival] = useState<PlayerProfile | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setRival(null);
      return;
    }

    setSearchingText('Analizando rango y tiempo de respuesta...');

    const timer1 = setTimeout(() => {
      setSearchingText('¡Oponente encontrado! Preparando sala de duelo...');
      const generatedRival = multiplayerService.generateRival(playerProfile.elo);
      setRival(generatedRival);
    }, 1800);

    const timer2 = setTimeout(() => {
      if (rival) {
        onMatchFound(rival);
      }
    }, 3600);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [isOpen, playerProfile.elo]);

  useEffect(() => {
    if (rival) {
      const timer = setTimeout(() => {
        onMatchFound(rival);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [rival, onMatchFound]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-gradient-to-b from-[#131C2E] via-[#0F172A] to-[#0A101C] border border-cyan-500/50 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-[0_0_50px_rgba(6,182,212,0.3)] text-center space-y-6 relative overflow-hidden"
        >
          {/* Header Badge */}
          <div>
            <span className={`text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${
              type === 'ranked'
                ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                : 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300'
            }`}>
              {type === 'ranked' ? '🏆 Partida Clasificatoria (Ranked)' : '⚔️ Partida Amistosa 1v1'}
            </span>
            <h3 className="text-2xl font-serif font-bold text-white mt-2">
              {DUEL_TITLES[duelMode]}
            </h3>
          </div>

          {/* Enfrentamiento VS */}
          <div className="grid grid-cols-5 items-center bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            {/* Jugador */}
            <div className="col-span-2 space-y-1">
              <div className="w-14 h-14 rounded-2xl bg-indigo-950/60 border border-indigo-500/50 mx-auto flex items-center justify-center text-3xl shadow-sm">
                {playerProfile.avatar}
              </div>
              <div className="font-bold text-sm text-zinc-100 truncate">{playerProfile.name}</div>
              <div className="text-[11px] font-mono text-amber-400 font-bold">
                {playerProfile.rank.icon} {playerProfile.elo} ELO
              </div>
            </div>

            {/* VS */}
            <div className="col-span-1 flex flex-col items-center justify-center">
              <div className="p-2.5 rounded-full bg-gradient-to-br from-cyan-500 to-indigo-600 text-slate-950 shadow-glow-cyan">
                <Swords className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono font-extrabold text-cyan-400 mt-1">VS</span>
            </div>

            {/* Rival */}
            <div className="col-span-2 space-y-1">
              {rival ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="space-y-1"
                >
                  <div className="w-14 h-14 rounded-2xl bg-rose-950/60 border border-rose-500/50 mx-auto flex items-center justify-center text-3xl shadow-sm animate-pulse">
                    {rival.avatar}
                  </div>
                  <div className="font-bold text-sm text-zinc-100 truncate">{rival.name}</div>
                  <div className="text-[11px] font-mono text-amber-400 font-bold">
                    {rival.rank.icon} {rival.elo} ELO
                  </div>
                </motion.div>
              ) : (
                <div className="space-y-1">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 mx-auto flex items-center justify-center text-slate-600">
                    <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
                  </div>
                  <div className="text-xs font-mono text-slate-400">Buscando...</div>
                </div>
              )}
            </div>
          </div>

          {/* Mensaje de estado */}
          <div className="flex items-center justify-center gap-2 text-xs font-mono text-slate-300">
            <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
            <span>{searchingText}</span>
          </div>

          {/* Botón Cancelar */}
          {!rival && (
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all border border-slate-700"
            >
              Cancelar Búsqueda
            </button>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
