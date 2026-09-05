import React, { useState } from 'react';
import { Swords, Trophy, Crown, Zap, Flame, Shield, ArrowRight, Share2, Copy, Check, Target, Flag, Landmark } from 'lucide-react';
import { DuelMode, MultiplayerType, PlayerProfile } from '../../types/multiplayer';
import { multiplayerService, RANKS } from '../../services/multiplayerService';
import { challengeService } from '../../services/challengeService';

interface MultiplayerDashboardProps {
  playerProfile: PlayerProfile;
  onStartDuel: (type: MultiplayerType, duelMode: DuelMode) => void;
}

export const MultiplayerDashboard: React.FC<MultiplayerDashboardProps> = ({
  playerProfile,
  onStartDuel
}) => {
  const [selectedType, setSelectedType] = useState<MultiplayerType>('ranked');
  const [selectedDuelMode, setSelectedDuelMode] = useState<DuelMode>('countries');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const handleCopyFriendChallenge = () => {
    const sampleCode = challengeService.encodeChallenge({
      creatorName: playerProfile.name,
      creatorScore: 1000,
      creatorAccuracy: 100,
      mode: 'click-find',
      continent: 'World',
      questionType: 'mixed',
      countryCodes: ['ESP', 'FRA', 'DEU', 'ITA', 'BRA', 'ARG', 'JPN', 'CAN', 'AUS', 'EGY']
    });

    const url = challengeService.generateChallengeUrl(sampleCode);
    const text = challengeService.generateShareSnippet(playerProfile.name, 1000, url);

    try {
      navigator.clipboard.writeText(text);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (e) {}
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Tarjeta de Rango ELO del Jugador */}
      <div className={`p-6 sm:p-8 rounded-3xl border ${playerProfile.rank.border} ${playerProfile.rank.bg} relative overflow-hidden shadow-lg`}>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900/80 border border-zinc-700/80 flex items-center justify-center text-4xl shadow-md shrink-0">
              {playerProfile.rank.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded border bg-zinc-900 ${playerProfile.rank.color} ${playerProfile.rank.border}`}>
                  Rango {playerProfile.rank.label}
                </span>
                {playerProfile.streak > 0 && (
                  <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30 flex items-center gap-1">
                    <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
                    Racha {playerProfile.streak}
                  </span>
                )}
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-zinc-100 mt-1">
                {playerProfile.name}
              </h2>
              <p className="text-xs text-zinc-400 font-sans mt-0.5">
                Victorias: <strong className="text-emerald-400">{playerProfile.wins}</strong> · Derrotas: <strong className="text-rose-400">{playerProfile.losses}</strong>
              </p>
            </div>
          </div>

          <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-2xl text-center min-w-[140px]">
            <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold block">Puntuación Clasificatoria</span>
            <span className="text-3xl font-mono font-black text-amber-400">{playerProfile.elo}</span>
            <span className="text-[10px] font-mono text-zinc-400 block mt-0.5">Puntos ELO</span>
          </div>
        </div>
      </div>

      {/* 1. Selector de Tipo de Partida: Amistosa vs Ranked */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Ranked */}
        <div
          onClick={() => setSelectedType('ranked')}
          className={`p-5 rounded-2xl border cursor-pointer transition-all ${
            selectedType === 'ranked'
              ? 'bg-amber-950/30 border-amber-500/70 shadow-[0_0_25px_rgba(245,158,11,0.2)]'
              : 'bg-[#18181B] border-zinc-800 hover:border-zinc-700 opacity-70'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/15 border border-amber-500/30 rounded-xl text-amber-400 shrink-0">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-zinc-100">Partida Clasificatoria (Ranked ELO)</h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Compite contra oponentes de tu rango. Las victorias suman ELO y suben tu rango.
              </p>
            </div>
          </div>
        </div>

        {/* Amistosa */}
        <div
          onClick={() => setSelectedType('friendly')}
          className={`p-5 rounded-2xl border cursor-pointer transition-all ${
            selectedType === 'friendly'
              ? 'bg-indigo-950/30 border-indigo-500/70 shadow-[0_0_25px_rgba(99,102,241,0.2)]'
              : 'bg-[#18181B] border-zinc-800 hover:border-zinc-700 opacity-70'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-500/15 border border-indigo-500/30 rounded-xl text-indigo-400 shrink-0">
              <Swords className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-zinc-100">Partida Amistosa (Amigos)</h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Juega sin riesgo de perder ELO y genera enlaces para retar a tus amigos.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Selector de Modalidad Estándar 1v1 */}
      <div className="bg-[#18181B] border border-zinc-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-zinc-300">
          Elige la Modalidad del Duelo (10 Preguntas Rápidas)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => setSelectedDuelMode('countries')}
            className={`p-4 rounded-xl border text-left transition-all ${
              selectedDuelMode === 'countries'
                ? 'bg-indigo-600/20 border-indigo-500 text-white font-bold'
                : 'bg-[#121214] border-zinc-800 text-zinc-400 hover:bg-zinc-800'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-indigo-400" />
              <span className="text-sm">10 Países</span>
            </div>
            <p className="text-xs opacity-70 font-sans font-normal">Ubicar 10 países en el mapa mundial.</p>
          </button>

          <button
            onClick={() => setSelectedDuelMode('flags')}
            className={`p-4 rounded-xl border text-left transition-all ${
              selectedDuelMode === 'flags'
                ? 'bg-sky-600/20 border-sky-500 text-white font-bold'
                : 'bg-[#121214] border-zinc-800 text-zinc-400 hover:bg-zinc-800'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Flag className="w-4 h-4 text-sky-400" />
              <span className="text-sm">10 Banderas</span>
            </div>
            <p className="text-xs opacity-70 font-sans font-normal">Adivinar 10 banderas en el mapa.</p>
          </button>

          <button
            onClick={() => setSelectedDuelMode('capitals')}
            className={`p-4 rounded-xl border text-left transition-all ${
              selectedDuelMode === 'capitals'
                ? 'bg-amber-600/20 border-amber-500 text-white font-bold'
                : 'bg-[#121214] border-zinc-800 text-zinc-400 hover:bg-zinc-800'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Landmark className="w-4 h-4 text-amber-400" />
              <span className="text-sm">10 Capitales</span>
            </div>
            <p className="text-xs opacity-70 font-sans font-normal">Ubicar países por sus capitales.</p>
          </button>
        </div>

        {/* Botón Buscar Partida 1v1 */}
        <div className="pt-2">
          <button
            onClick={() => onStartDuel(selectedType, selectedDuelMode)}
            className={`w-full py-4 px-6 rounded-xl font-bold text-base shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98 ${
              selectedType === 'ranked'
                ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-amber-500/20'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20'
            }`}
          >
            <Swords className="w-5 h-5" />
            <span>
              {selectedType === 'ranked' ? '¡Buscar Partida Clasificatoria (Ranked)!' : '¡Iniciar Duelo Amistoso 1v1!'}
            </span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Retar a un amigo por enlace */}
      <div className="bg-[#18181B] border border-zinc-800 rounded-2xl p-5 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-indigo-400">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-zinc-100">Crea un enlace para retar a cualquier amigo</h4>
            <p className="text-xs text-zinc-400 mt-0.5">Copia el reto para enviarlo por WhatsApp o redes sociales.</p>
          </div>
        </div>

        <button
          onClick={handleCopyFriendChallenge}
          className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-all flex items-center gap-2 border border-zinc-700"
        >
          {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-zinc-400" />}
          <span>{copiedLink ? '¡Enlace de Reto Copiado!' : 'Copiar Enlace de Reto'}</span>
        </button>
      </div>
    </div>
  );
};
