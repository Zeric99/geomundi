import React, { useState } from 'react';
import { UserEmpire, GridTile } from '../types';
import { empireStorageService, TUTORIAL_MISSIONS } from '../services/empireStorageService';
import { empireSound } from '../services/empireSoundService';
import { TileDetailModal } from './TileDetailModal';
import { ImperialEdictsPanel } from './ImperialEdictsPanel';
import { 
  X,
  Check, 
  ChevronDown, 
  ChevronUp, 
  Coins, 
  Wheat, 
  Hammer, 
  Anchor
} from 'lucide-react';

interface EmpireRightSidebarProps {
  empire: UserEmpire;
  activeTab: 'missions' | 'edicts' | 'tile';
  onChangeTab: (tab: 'missions' | 'edicts' | 'tile') => void;
  selectedTile: GridTile | null;
  onCloseTile: () => void;
  onStartNavalExpedition?: (originTileId: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const EmpireRightSidebar: React.FC<EmpireRightSidebarProps> = ({
  empire,
  activeTab,
  onChangeTab,
  selectedTile,
  onCloseTile,
  onStartNavalExpedition,
  isCollapsed,
  onToggleCollapse
}) => {
  const [expandedMissionId, setExpandedMissionId] = useState<string | null>(null);

  // SI ESTÁ CERRADO, NO RENDERIZAR NADA (0 ANCHO, PANTALLA 100% PARA EL MAPA)
  if (isCollapsed) {
    return null;
  }

  // Si la pestaña activa es 'tile' pero no hay casilla seleccionada, ocultar
  if (activeTab === 'tile' && !selectedTile) {
    return null;
  }

  const missions = TUTORIAL_MISSIONS;
  const claimedCount = missions.filter(m => empireStorageService.isMissionClaimed(m.id)).length;
  const claimableMissions = missions.filter(
    m => empireStorageService.isMissionCompleted(m.id) && !empireStorageService.isMissionClaimed(m.id)
  );

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

  return (
    <aside className="w-80 sm:w-84 md:w-88 lg:w-96 shrink-0 h-full border-l border-slate-800 bg-[#0a0e17] flex flex-col overflow-hidden z-20 select-none shadow-2xl transition-all duration-300">
      {/* ─── CASILLA SELECCIONADA ─── */}
      {activeTab === 'tile' && selectedTile && (
        <TileDetailModal
          key={selectedTile.id}
          tile={selectedTile}
          empire={empire}
          onClose={onCloseTile}
          onStartNavalExpedition={onStartNavalExpedition}
        />
      )}

      {/* ─── DECRETOS IMPERIALES ─── */}
      {activeTab === 'edicts' && (
        <ImperialEdictsPanel 
          empire={empire} 
          onClose={onToggleCollapse} 
        />
      )}

      {/* ─── MISIONES GUIADAS ─── */}
      {activeTab === 'missions' && (
        <div className="w-full h-full flex flex-col overflow-hidden">
          {/* Cabecera Táctica de Misiones con Botón de Cierre [X] */}
          <div className="px-3.5 py-3 bg-[#0d131f] border-b border-slate-800 flex items-center justify-between shrink-0 shadow-md">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#141d2e] border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0 shadow-sm text-base">
                📜
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider font-sans truncate">
                    Misiones Guiadas
                  </h3>
                  <span className="text-[10.5px] font-mono font-bold text-amber-400 bg-amber-500/15 px-1.5 py-0.2 rounded border border-amber-500/30 shrink-0">
                    {claimedCount}/{missions.length}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight mt-0.5 font-mono truncate">
                  Campaña y objetivos de expansión imperial
                </p>
              </div>
            </div>

            <button 
              onClick={onToggleCollapse} 
              className="tactical-btn p-1.5 text-slate-400 hover:text-white rounded-lg"
              title="Cerrar panel de misiones"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Barra de Progreso General */}
          <div className="px-3.5 py-2.5 bg-[#0b0f17] border-b border-slate-800/80 flex flex-col gap-1.5 shrink-0">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Progreso de Campaña</span>
              <span className="font-bold text-amber-300 font-mono text-xs">
                {claimedCount} / {missions.length} completadas
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-amber-500 to-amber-400 h-full transition-all duration-500"
                style={{ width: `${(claimedCount / missions.length) * 100}%` }}
              />
            </div>
            {claimableMissions.length > 0 ? (
              <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5 pt-0.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>{claimableMissions.length} recompensa(s) lista(s) para reclamar</span>
              </div>
            ) : currentActiveMission ? (
              <div className="text-xs text-slate-400 truncate">
                <span className="text-slate-300 font-semibold">Siguiente:</span> Paso {currentActiveMission.stepNumber} - {currentActiveMission.title}
              </div>
            ) : (
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> ¡Todas las misiones completadas!
              </div>
            )}
          </div>

          {/* Lista de Misiones con Scroll Interno Propio */}
          <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2.5 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
            {missions.map((mission) => {
              const isCompleted = empireStorageService.isMissionCompleted(mission.id);
              const isClaimed = empireStorageService.isMissionClaimed(mission.id);
              const isClaimable = isCompleted && !isClaimed;
              const isExpanded = expandedMissionId === mission.id;

              return (
                <div
                  key={mission.id}
                  className={`rounded-xl border transition-all duration-150 overflow-hidden ${
                    isClaimed
                      ? 'bg-[#0f141f]/70 border-slate-800/60 opacity-60'
                      : isClaimable
                      ? 'bg-[#1a2336] border-amber-400/80 shadow-[0_0_15px_rgba(245,158,11,0.2)] ring-1 ring-amber-400/50'
                      : 'bg-[#121824] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div 
                    onClick={() => toggleExpand(mission.id)}
                    className="p-3 cursor-pointer flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Icono con marco de juego */}
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0 border ${
                        isClaimed
                          ? 'bg-slate-900 border-slate-800 text-slate-500'
                          : isClaimable
                          ? 'bg-amber-500/20 border-amber-400/60 text-amber-300'
                          : 'bg-slate-800/80 border-slate-700 text-white'
                      }`}>
                        {isClaimed ? <Check className="w-4 h-4 text-slate-400" /> : mission.icon}
                      </div>

                      {/* Título y Recompensa Visual Directa */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10.5px] font-mono text-slate-400 font-bold">
                            #{mission.stepNumber}
                          </span>
                          <h4 className={`text-xs sm:text-sm font-bold truncate ${
                            isClaimed ? 'text-slate-500 line-through' : 'text-slate-100'
                          }`}>
                            {mission.title}
                          </h4>
                        </div>

                        {/* Recompensas en chips limpios */}
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] font-mono font-bold">
                          {mission.reward.coins > 0 && (
                            <span className="text-amber-400 flex items-center gap-0.5">
                              🪙 +{mission.reward.coins}
                            </span>
                          )}
                          {mission.reward.materials && mission.reward.materials > 0 && (
                            <span className="text-orange-400 flex items-center gap-0.5">
                              🧱 +{mission.reward.materials}
                            </span>
                          )}
                          {mission.reward.food && mission.reward.food > 0 && (
                            <span className="text-emerald-400 flex items-center gap-0.5">
                              🌾 +{mission.reward.food}
                            </span>
                          )}
                          {mission.reward.freeExpeditions && mission.reward.freeExpeditions > 0 && (
                            <span className="text-sky-400 flex items-center gap-0.5">
                              ⚓ +{mission.reward.freeExpeditions}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Acción derecha */}
                    <div className="flex items-center gap-2 shrink-0">
                      {isClaimable ? (
                        <button
                          onClick={(e) => handleClaim(e, mission.id)}
                          className="tactical-btn-cta px-3 py-1.5 text-xs text-black animate-pulse"
                        >
                          Reclamar
                        </button>
                      ) : isClaimed ? (
                        <span className="text-xs font-mono font-bold text-slate-500">
                          ✓ Hecha
                        </span>
                      ) : (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(mission.id);
                          }}
                          className="p-1 text-slate-400 hover:text-slate-200"
                          title="Ver ayuda de la misión"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Instrucciones desplegables: solo si el usuario las consulta */}
                  {isExpanded && !isClaimed && (
                    <div className="px-3 pb-3 pt-1 border-t border-slate-800/80 bg-black/40 text-xs space-y-2">
                      <p className="text-slate-300 text-xs leading-relaxed font-sans">
                        {mission.description}
                      </p>
                      <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 space-y-1 text-xs">
                        {mission.howTo.map((step, idx) => (
                          <div key={idx} className="flex items-start gap-1.5 text-slate-300">
                            <span className="text-amber-400 font-bold font-mono shrink-0">{idx + 1}.</span>
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
};
