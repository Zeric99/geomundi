import React, { useState } from 'react';
import { UserEmpire, TutorialMission } from '../types';
import { empireStorageService, TUTORIAL_MISSIONS } from '../services/empireStorageService';

interface EmpireMissionsWidgetProps {
  empire: UserEmpire;
}

export const EmpireMissionsWidget: React.FC<EmpireMissionsWidgetProps> = ({ empire }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedMissionId, setExpandedMissionId] = useState<string | null>(null);

  const missions = TUTORIAL_MISSIONS;
  const claimedCount = missions.filter(m => empireStorageService.isMissionClaimed(m.id)).length;
  
  // Calcular misiones listas para reclamar
  const claimableMissions = missions.filter(
    m => empireStorageService.isMissionCompleted(m.id) && !empireStorageService.isMissionClaimed(m.id)
  );

  // Misión activa actual (la primera no completada)
  const currentActiveMission = missions.find(m => !empireStorageService.isMissionCompleted(m.id)) 
    || missions.find(m => !empireStorageService.isMissionClaimed(m.id));

  const handleClaim = (e: React.MouseEvent, missionId: string) => {
    e.stopPropagation();
    empireStorageService.claimMissionReward(missionId);
  };

  const toggleExpand = (id: string) => {
    setExpandedMissionId(prev => (prev === id ? null : id));
  };

  return (
    <div className="absolute top-20 right-4 z-20 flex flex-col items-end pointer-events-auto select-none max-w-sm w-full">
      {/* Botón Flotante de Misiones / Tutorial */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2.5 px-4 py-2.5 bg-slate-900/90 hover:bg-slate-800/95 border border-amber-500/40 hover:border-amber-400 rounded-2xl shadow-xl backdrop-blur-md transition-all duration-300 transform active:scale-95"
      >
        <span className="text-xl animate-bounce">📜</span>
        <div className="text-left">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-amber-300">
              Misiones Guiadas
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
              {claimedCount}/{missions.length}
            </span>
          </div>
          <div className="text-[11px] text-slate-300 truncate max-w-[170px]">
            {claimableMissions.length > 0 
              ? '✨ ¡Recompensas listas!'
              : currentActiveMission 
                ? `Paso ${currentActiveMission.stepNumber}: ${currentActiveMission.title}`
                : '¡Todas completadas!'}
          </div>
        </div>

        {/* Badge de alerta de recompensas */}
        {claimableMissions.length > 0 && (
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
          </span>
        )}

        <svg 
          className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Panel Desplegable de Misiones */}
      {isOpen && (
        <div className="mt-2.5 w-full bg-slate-950/95 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden animate-in fade-in slide-in-from-top-3 duration-200">
          {/* Cabecera del Panel */}
          <div className="p-3.5 bg-gradient-to-r from-amber-950/40 via-slate-900/60 to-slate-900/40 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-amber-300 flex items-center gap-2">
                <span>🧭</span> Tutorial: Guía del Conquistador
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Aprende las mecánicas paso a paso y desbloquea recompensas iniciales.
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/60 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Barra de Progreso General */}
          <div className="px-4 py-2 bg-slate-900/50 border-b border-slate-800/80 flex items-center gap-3">
            <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700/50">
              <div 
                className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${(claimedCount / missions.length) * 100}%` }}
              />
            </div>
            <span className="text-[11px] font-bold text-amber-400 whitespace-nowrap">
              {claimedCount} / {missions.length} reclamadas
            </span>
          </div>

          {/* Lista de Misiones */}
          <div className="max-h-[60vh] overflow-y-auto p-3 space-y-2.5 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
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
                      ? 'bg-slate-900/40 border-slate-800/60 opacity-70'
                      : isClaimable
                      ? 'bg-amber-950/20 border-amber-500/60 shadow-lg shadow-amber-900/20'
                      : 'bg-slate-900/80 border-slate-700/80 hover:border-slate-600'
                  }`}
                >
                  <div 
                    onClick={() => toggleExpand(mission.id)}
                    className="p-3 cursor-pointer flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 ${
                        isClaimed
                          ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-400'
                          : isClaimable
                          ? 'bg-amber-500/20 border border-amber-400/40 text-amber-300 animate-pulse'
                          : 'bg-slate-800 border border-slate-700 text-slate-300'
                      }`}>
                        {isClaimed ? '✓' : mission.icon}
                      </div>

                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Paso {mission.stepNumber}
                          </span>
                          {isClaimed && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-900/40 text-emerald-400 border border-emerald-800">
                              Completada
                            </span>
                          )}
                        </div>
                        <h4 className={`text-xs font-bold ${
                          isClaimed 
                            ? 'text-slate-400 line-through' 
                            : isClaimable 
                            ? 'text-amber-200' 
                            : 'text-white'
                        }`}>
                          {mission.title}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isClaimable ? (
                        <button
                          onClick={(e) => handleClaim(e, mission.id)}
                          className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs rounded-lg shadow-md shadow-amber-500/30 active:scale-95 transition-transform"
                        >
                          ¡Reclamar!
                        </button>
                      ) : (
                        <span className="text-slate-500 text-xs">
                          {isExpanded ? '▲' : '▼'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Detalle y Guía Paso a Paso "¿Cómo se hace?" */}
                  {isExpanded && (
                    <div className="px-3 pb-3 pt-1 border-t border-slate-800/80 bg-slate-950/40 text-left space-y-2.5">
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {mission.description}
                      </p>

                      {/* Caja con viñetas paso a paso */}
                      <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5">
                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1.5">
                          💡 ¿Cómo se hace?
                        </span>
                        <ul className="space-y-1.5">
                          {mission.howTo.map((step, idx) => (
                            <li key={idx} className="text-[11px] text-slate-300 flex items-start gap-2">
                              <span className="text-amber-400 font-bold shrink-0">{idx + 1}.</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Recompensas */}
                      <div className="flex items-center justify-between pt-1 text-[11px]">
                        <span className="text-slate-400 font-medium">Recompensa:</span>
                        <div className="flex items-center gap-2 font-bold text-amber-300">
                          {mission.reward.coins > 0 && <span>🪙 +{mission.reward.coins}</span>}
                          {mission.reward.materials && <span>🪵 +{mission.reward.materials}</span>}
                          {mission.reward.food && <span>🌾 +{mission.reward.food}</span>}
                          {mission.reward.freeExpeditions && <span>⛵ +{mission.reward.freeExpeditions} Barco</span>}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmpireMissionsWidget;
