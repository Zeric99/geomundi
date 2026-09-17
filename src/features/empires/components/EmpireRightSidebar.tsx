import React, { useState } from 'react';
import { UserEmpire, GridTile } from '../types';
import { empireStorageService, TUTORIAL_MISSIONS } from '../services/empireStorageService';
import { empireSound } from '../services/empireSoundService';
import { TileDetailModal } from './TileDetailModal';
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Coins, 
  Wheat, 
  Hammer, 
  Anchor,
  Compass,
  MapPin
} from 'lucide-react';

interface EmpireRightSidebarProps {
  empire: UserEmpire;
  activeTab: 'missions' | 'tile';
  onChangeTab: (tab: 'missions' | 'tile') => void;
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
        title="Expandir panel lateral derecho"
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
          <span className="text-lg">{activeTab === 'tile' && selectedTile ? '📍' : '📜'}</span>
        )}

        <div className="flex-1 flex items-center justify-center">
          <span className="[writing-mode:vertical-rl] font-black text-[11px] uppercase tracking-widest text-zinc-400 group-hover:text-amber-300 transition-colors rotate-180">
            {activeTab === 'tile' && selectedTile ? 'Detalle de Casilla' : 'Misiones Guiadas'}
          </span>
        </div>

        <div className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-1.5 py-1 rounded-md">
          {claimedCount}/{missions.length}
        </div>
      </aside>
    );
  }

  // VISTA EXPANDIDA (Panel lateral fijo completo a la derecha, fuera del mapa)
  return (
    <aside className="w-80 sm:w-84 md:w-88 lg:w-96 shrink-0 h-full border-l border-zinc-800 bg-zinc-950/95 backdrop-blur-md flex flex-col overflow-hidden z-20 select-none shadow-2xl transition-all duration-300">
      {/* Barra interna de Pestañas / Títulos para alternar entre Misiones y Casilla */}
      <div className="p-2 bg-zinc-950 border-b border-zinc-800/80 flex items-center justify-between gap-1.5 shrink-0">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          {/* Pestaña: Misiones */}
          <button
            onClick={() => onChangeTab('missions')}
            className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 min-w-0 ${
              activeTab === 'missions'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent'
            }`}
          >
            <span className="text-sm">📜</span>
            <span className="truncate">Misiones</span>
            {claimableMissions.length > 0 ? (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
            ) : (
              <span className="text-[10px] font-mono font-bold text-amber-400/80 shrink-0">
                {claimedCount}/{missions.length}
              </span>
            )}
          </button>

          {/* Pestaña: Casilla */}
          <button
            onClick={() => onChangeTab('tile')}
            className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 min-w-0 ${
              activeTab === 'tile'
                ? 'bg-indigo-500/25 text-indigo-300 border border-indigo-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent'
            }`}
          >
            <span className="text-sm">{selectedTile ? '📍' : '🗺️'}</span>
            <span className="truncate">
              {selectedTile ? (
                empire.colonizedTiles[selectedTile.id]?.cityName || selectedTile.countryName || 'Casilla'
              ) : (
                'Casilla'
              )}
            </span>
            {selectedTile && (
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
            )}
          </button>
        </div>

        {/* Botón para colapsar el panel */}
        <button
          onClick={onToggleCollapse}
          className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-colors shrink-0"
          title="Colapsar panel derecho"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* CONTENIDO 1: Pestaña de Misiones Guiadas */}
      {activeTab === 'missions' && (
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
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

          {/* Lista de Misiones con Scroll Interno Propio */}
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
                        {isClaimed ? <Check className="w-4 h-4" /> : mission.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono text-zinc-500 font-bold">
                            #{mission.stepNumber}
                          </span>
                          <h4 className={`text-xs font-bold truncate ${
                            isClaimed ? 'text-zinc-400 line-through' : isClaimable ? 'text-amber-200 font-black' : 'text-zinc-200'
                          }`}>
                            {mission.title}
                          </h4>
                        </div>
                        <p className="text-[10.5px] text-zinc-400 line-clamp-1 leading-tight mt-0.5">
                          {mission.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isClaimable && (
                        <button
                          onClick={(e) => handleClaim(e, mission.id)}
                          className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-zinc-950 font-black text-[11px] shadow-md shadow-amber-500/20 flex items-center gap-1 animate-bounce"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Reclamar</span>
                        </button>
                      )}

                      {isClaimed && (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                          Listo
                        </span>
                      )}

                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(mission.id);
                        }}
                        className="text-zinc-500 hover:text-zinc-300 p-1"
                      >
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-3 pb-3 pt-1 border-t border-zinc-800/80 bg-black/20 text-xs space-y-2.5">
                      <p className="text-zinc-300 text-[11px] leading-relaxed">
                        {mission.description}
                      </p>

                      <div className="space-y-1 bg-zinc-900/90 p-2 rounded-lg border border-zinc-800">
                        <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block mb-1">
                          ¿Cómo completarla?:
                        </span>
                        {mission.howTo.map((step, idx) => (
                          <div key={idx} className="flex items-start gap-1.5 text-[10.5px] text-zinc-300">
                            <span className="text-amber-500 font-bold shrink-0">{idx + 1}.</span>
                            <span className="leading-snug">{step}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-zinc-400 uppercase font-bold">Recompensa:</span>
                          <div className="flex items-center gap-2 font-mono text-[11px] font-bold">
                            {mission.reward.coins > 0 && (
                              <span className="text-amber-300 flex items-center gap-1">
                                <Coins className="w-3 h-3 text-amber-400" />
                                +{mission.reward.coins}
                              </span>
                            )}
                            {mission.reward.materials && mission.reward.materials > 0 && (
                              <span className="text-amber-400 flex items-center gap-1">
                                <Hammer className="w-3 h-3 text-amber-500" />
                                +{mission.reward.materials}
                              </span>
                            )}
                            {mission.reward.food && mission.reward.food > 0 && (
                              <span className="text-emerald-400 flex items-center gap-1">
                                <Wheat className="w-3 h-3 text-emerald-500" />
                                +{mission.reward.food}
                              </span>
                            )}
                          </div>
                        </div>

                        {isClaimable && (
                          <button
                            onClick={(e) => handleClaim(e, mission.id)}
                            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-zinc-950 font-black text-xs shadow-md shadow-amber-500/30 flex items-center gap-1.5 cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Reclamar Recompensa</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CONTENIDO 2: Pestaña de Detalle de Casilla Seleccionada */}
      {activeTab === 'tile' && (
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {selectedTile ? (
            <TileDetailModal
              tile={selectedTile}
              empire={empire}
              onClose={onCloseTile}
              onStartNavalExpedition={onStartNavalExpedition}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-zinc-400 gap-3">
              <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-3xl shadow-inner text-indigo-400">
                📍
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-200">Ninguna Casilla Seleccionada</h4>
                <p className="text-xs text-zinc-500 mt-1 max-w-xs leading-relaxed">
                  Haz clic en cualquier ciudad, huerto, cantera o terreno en el mapa táctico para gestionarlo aquí fijo sin que tape el mapa.
                </p>
              </div>
              <button
                onClick={() => onChangeTab('missions')}
                className="mt-2 px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold hover:bg-amber-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>📜</span>
                <span>Ver Misiones Guiadas</span>
              </button>
            </div>
          )}
        </div>
      )}
    </aside>
  );
};
