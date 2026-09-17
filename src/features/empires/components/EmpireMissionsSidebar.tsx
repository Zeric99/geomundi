import React, { useState } from 'react';
import { UserEmpire } from '../types';
import { empireStorageService, TUTORIAL_MISSIONS } from '../services/empireStorageService';
import { empireSound } from '../services/empireSoundService';
import { ChevronLeft, ChevronRight, Check, Sparkles, ChevronDown, ChevronUp, Coins, Wheat, Hammer, Anchor } from 'lucide-react';

interface EmpireMissionsSidebarProps {
  empire: UserEmpire;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const EmpireMissionsSidebar: React.FC<EmpireMissionsSidebarProps> = ({
  empire,
  isCollapsed,
  onToggleCollapse
}) => {
  const [expandedMissionId, setExpandedMissionId] = useState<string | null>(null);

  const missions = TUTORIAL_MISSIONS;
  const claimedCount = missions.filter(m => empireStorageService.isMissionClaimed(m.id)).length;
  
  // Misiones listas para reclamar
  const claimableMissions = missions.filter(
    m => empireStorageService.isMissionCompleted(m.id) && !empireStorageService.isMissionClaimed(m.id)
  );

  // Misión activa actual (la primera no completada)
  const currentActiveMission = missions.find(m => !empireStorageService.isMissionCompleted(m.id)) 
    || missions.find(m => !empireStorageService.isMissionClaimed(m.id));

  const handleClaim = (e: React.MouseEvent, missionId: string) => {
    e.stopPropagation();
    empireStorageService.claimMissionReward(missionId);
    empireSound.playCoinClink();
    empireSound.playUpgrade();
  };

  const toggleExpand = (id: string) => {
    setExpandedMissionId(prev => (prev === id ? null : id));
  };

  // VISTA COLAPSADA (Tira delgada en el borde derecho)
  if (isCollapsed) {
    return (
      <aside 
        onClick={onToggleCollapse}
        className="w-12 shrink-0 h-full border-l border-zinc-800 bg-zinc-950 hover:bg-zinc-900/90 flex flex-col items-center py-3 gap-4 z-20 select-none cursor-pointer transition-colors shadow-2xl group"
        title="Abrir Tutorial y Misiones Guiadas"
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleCollapse();
          }}
          className="p-2 rounded-xl bg-zinc-900 group-hover:bg-zinc-800 text-amber-400 border border-zinc-800 group-hover:border-amber-500/50 transition-all shadow-md"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        </button>

        {/* Indicador de recompensas listas */}
        {claimableMissions.length > 0 ? (
          <div className="relative">
            <span className="animate-ping absolute -top-0.5 -right-0.5 inline-flex h-3 w-3 rounded-full bg-amber-400 opacity-75"></span>
            <span className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 flex items-center justify-center text-xs font-black shadow-lg shadow-amber-500/30 animate-pulse">
              !
            </span>
          </div>
        ) : (
          <span className="text-lg">📜</span>
        )}

        <div className="flex-1 flex items-center justify-center">
          <span className="[writing-mode:vertical-rl] font-black text-[11px] uppercase tracking-widest text-zinc-400 group-hover:text-amber-300 transition-colors rotate-180">
            Misiones Guiadas
          </span>
        </div>

        <div className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-1.5 py-1 rounded-md">
          {claimedCount}/{missions.length}
        </div>
      </aside>
    );
  }

  // VISTA EXPANDIDA (Panel lateral completo fuera del canvas)
  return (
    <aside className="w-80 sm:w-84 md:w-88 lg:w-96 shrink-0 h-full border-l border-zinc-800 bg-zinc-950/95 backdrop-blur-md flex flex-col overflow-hidden z-20 select-none shadow-2xl transition-all duration-300">
      {/* Cabecera del Sidebar */}
      <div className="p-3.5 bg-gradient-to-r from-amber-950/30 via-zinc-900/60 to-zinc-950 border-b border-zinc-800/90 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-base shrink-0">
            🧭
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-black text-amber-300 uppercase tracking-wide">
                Misiones Guiadas
              </h3>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {claimedCount}/{missions.length}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-tight mt-0.5">
              Tutorial paso a paso y recompensas
            </p>
          </div>
        </div>

        <button
          onClick={onToggleCollapse}
          className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-zinc-800/80 border border-transparent hover:border-zinc-700 transition-all flex items-center gap-1 text-xs"
          title="Ocultar panel lateral"
        >
          <span className="text-[10px] uppercase font-bold text-zinc-400 hidden sm:inline">Ocultar</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Barra de Progreso General */}
      <div className="px-3.5 py-2.5 bg-zinc-900/60 border-b border-zinc-800/80 flex flex-col gap-1.5 shrink-0">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-zinc-400 font-medium">Progreso del Tutorial</span>
          <span className="font-bold text-amber-400 font-mono">
            {claimedCount} de {missions.length} reclamadas
          </span>
        </div>
        <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden border border-zinc-700/50">
          <div 
            className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 h-full rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${(claimedCount / missions.length) * 100}%` }}
          />
        </div>
        {claimableMissions.length > 0 ? (
          <div className="text-[11px] font-bold text-amber-300 flex items-center gap-1 pt-0.5">
            <Sparkles className="w-3 h-3 text-amber-400 animate-spin" />
            <span>¡Tienes {claimableMissions.length} recompensa(s) lista(s) para reclamar!</span>
          </div>
        ) : currentActiveMission ? (
          <div className="text-[11px] text-zinc-400 truncate">
            <span className="text-amber-400 font-semibold">Siguiente:</span> Paso {currentActiveMission.stepNumber} - {currentActiveMission.title}
          </div>
        ) : (
          <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
            <Check className="w-3 h-3" /> ¡Completaste todo el tutorial inicial!
          </div>
        )}
      </div>

      {/* Lista de Misiones con Scroll Interno Propio (Sin afectar a la página) */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2.5 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
        {missions.map((mission) => {
          const isCompleted = empireStorageService.isMissionCompleted(mission.id);
          const isClaimed = empireStorageService.isMissionClaimed(mission.id);
          const isClaimable = isCompleted && !isClaimed;
          const isExpanded = expandedMissionId === mission.id || (!isCompleted && !isClaimed && expandedMissionId === null && mission.id === currentActiveMission?.id);

          return (
            <div
              key={mission.id}
              className={`rounded-xl border transition-all duration-200 ${
                isClaimed
                  ? 'bg-zinc-900/30 border-zinc-800/60 opacity-70'
                  : isClaimable
                  ? 'bg-amber-950/25 border-amber-500/70 shadow-lg shadow-amber-950/40'
                  : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div 
                onClick={() => toggleExpand(mission.id)}
                className="p-3 cursor-pointer flex items-center justify-between gap-2.5"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0 ${
                    isClaimed
                      ? 'bg-emerald-950/50 border border-emerald-500/40 text-emerald-400'
                      : isClaimable
                      ? 'bg-amber-500/20 border border-amber-400/50 text-amber-300 animate-pulse'
                      : 'bg-zinc-800 border border-zinc-700 text-zinc-300'
                  }`}>
                    {isClaimed ? '✓' : mission.icon}
                  </div>

                  <div className="min-w-0 text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        Paso {mission.stepNumber}
                      </span>
                      {isClaimed && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-900/50 text-emerald-400 border border-emerald-800">
                          Completada
                        </span>
                      )}
                    </div>
                    <h4 className={`text-xs font-bold truncate ${
                      isClaimed 
                        ? 'text-zinc-400 line-through' 
                        : isClaimable 
                        ? 'text-amber-200 font-black' 
                        : 'text-zinc-100'
                    }`}>
                      {mission.title}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isClaimable ? (
                    <button
                      onClick={(e) => handleClaim(e, mission.id)}
                      className="px-2.5 py-1 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-zinc-950 font-black text-xs rounded-lg shadow-md shadow-amber-500/30 active:scale-95 transition-transform animate-pulse"
                      title="Cobrar recompensa"
                    >
                      ¡Reclamar!
                    </button>
                  ) : (
                    <span className="text-zinc-500 hover:text-zinc-300 p-1">
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </span>
                  )}
                </div>
              </div>

              {/* Detalle Desplegable con Instrucciones */}
              {isExpanded && (
                <div className="px-3 pb-3 pt-1 border-t border-zinc-800/80 bg-zinc-950/60 text-left space-y-2">
                  <p className="text-[11px] text-zinc-300 leading-relaxed">
                    {mission.description}
                  </p>

                  {/* Viñetas paso a paso */}
                  <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-2.5">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1.5">
                      💡 ¿Cómo se hace?
                    </span>
                    <ul className="space-y-1.5">
                      {mission.howTo.map((step, idx) => (
                        <li key={idx} className="text-[11px] text-zinc-300 flex items-start gap-1.5">
                          <span className="text-amber-400 font-bold shrink-0">{idx + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Recompensas */}
                  <div className="flex items-center justify-between pt-1 text-[11px] border-t border-zinc-800/60">
                    <span className="text-zinc-400 font-medium">Recompensa:</span>
                    <div className="flex items-center gap-2 font-bold text-amber-300 font-mono">
                      {mission.reward.coins > 0 && (
                        <span className="flex items-center gap-0.5">
                          <Coins className="w-3 h-3 text-amber-400" />+{mission.reward.coins}
                        </span>
                      )}
                      {mission.reward.materials && (
                        <span className="flex items-center gap-0.5 text-orange-300">
                          <Hammer className="w-3 h-3 text-orange-400" />+{mission.reward.materials}
                        </span>
                      )}
                      {mission.reward.food && (
                        <span className="flex items-center gap-0.5 text-emerald-300">
                          <Wheat className="w-3 h-3 text-emerald-400" />+{mission.reward.food}
                        </span>
                      )}
                      {mission.reward.freeExpeditions && (
                        <span className="flex items-center gap-0.5 text-blue-300">
                          <Anchor className="w-3 h-3 text-blue-400" />+{mission.reward.freeExpeditions} Barco
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pie del Sidebar con Consejo Útil */}
      <div className="p-2.5 bg-zinc-900/80 border-t border-zinc-800 text-[11px] text-zinc-400 flex items-center justify-between shrink-0">
        <span className="text-zinc-400 truncate">
          🏆 Gana oro en Duelos 1v1 y el Desafío Diario
        </span>
        <span className="text-amber-400/80 font-mono text-[10px] shrink-0 font-bold">
          GeoStrike Beta
        </span>
      </div>
    </aside>
  );
};
