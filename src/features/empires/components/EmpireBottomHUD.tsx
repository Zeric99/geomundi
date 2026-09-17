import React, { useState, useEffect } from 'react';
import { UserEmpire, GridTile } from '../types';
import { TUTORIAL_MISSIONS, empireStorageService } from '../services/empireStorageService';
import { empireEconomyService } from '../services/empireEconomyService';
import { X, Trophy, Crown } from 'lucide-react';

interface EmpireBottomHUDProps {
  empire: UserEmpire;
  activeRightTab: 'missions' | 'edicts' | 'tile';
  isRightSidebarCollapsed: boolean;
  selectedTile: GridTile | null;
  onToggleMissions: () => void;
  onToggleEdicts: () => void;
  onOpenTributes: () => void;
  onOpenSovereignty: () => void;
  onToggleTile: () => void;
  onDeselectTile?: () => void;
}

export const EmpireBottomHUD: React.FC<EmpireBottomHUDProps> = ({
  empire,
  activeRightTab,
  isRightSidebarCollapsed,
  selectedTile,
  onToggleMissions,
  onToggleEdicts,
  onOpenTributes,
  onOpenSovereignty,
  onToggleTile,
  onDeselectTile
}) => {
  const [pendingCoins, setPendingCoins] = useState<number>(empireEconomyService.getTotalPendingCoins());

  useEffect(() => {
    const unsub = empireEconomyService.subscribe(() => {
      setPendingCoins(empireEconomyService.getTotalPendingCoins());
    });
    return unsub;
  }, []);

  const missions = TUTORIAL_MISSIONS;
  const claimedCount = missions.filter(m => empireStorageService.isMissionClaimed(m.id)).length;
  const hasClaimableMissions = missions.some(
    m => empireStorageService.isMissionCompleted(m.id) && !empireStorageService.isMissionClaimed(m.id)
  );

  const activeEdictsCount = (empire.activeEdicts || []).length;
  const countryCount = Object.keys(empire.localCensusByCountry).length || (empire.capitalTileId ? 1 : 0);

  const isMissionsOpen = !isRightSidebarCollapsed && activeRightTab === 'missions';
  const isEdictsOpen = !isRightSidebarCollapsed && activeRightTab === 'edicts';
  const isTileOpen = !isRightSidebarCollapsed && activeRightTab === 'tile';

  // Datos para la casilla seleccionada si existe
  const selectedTileData = selectedTile ? empire.colonizedTiles[selectedTile.id] : null;
  const isSettlement = selectedTileData?.role === 'settlement';
  const tileIcon = !selectedTile
    ? '📍'
    : selectedTileData?.role === 'crops'
    ? '🌾'
    : selectedTileData?.role === 'resources'
    ? '🌲'
    : isSettlement
    ? (selectedTileData?.settlementTier && selectedTileData.settlementTier >= 3 ? '🏙️' : '⛺')
    : selectedTileData?.hasPort || selectedTileData?.role === 'port'
    ? '⚓'
    : selectedTileData
    ? '🟩'
    : '🗺️';

  const tileLabel = !selectedTile
    ? 'Casilla'
    : isSettlement && selectedTileData?.cityName
    ? selectedTileData.cityName
    : selectedTileData?.role === 'crops'
    ? `Huerto N${selectedTileData?.resourceTier || 1}`
    : selectedTileData?.role === 'resources'
    ? `Cantera N${selectedTileData?.resourceTier || 1}`
    : selectedTile.countryName || 'Casilla';

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 pointer-events-auto select-none max-w-[95vw]">
      <div className="flex items-center gap-1.5 p-1.5 bg-[#0b0f17]/95 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-md">
        
        {/* BOTÓN 1: MISIONES */}
        <button
          onClick={onToggleMissions}
          className={`px-3 py-1.5 text-xs rounded-xl transition-all flex items-center gap-2 border font-sans font-bold tracking-wider uppercase ${
            isMissionsOpen
              ? 'bg-amber-500/25 text-amber-300 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)] ring-1 ring-amber-400/50'
              : 'bg-[#121927] hover:bg-[#182235] text-slate-200 hover:text-amber-300 border-slate-700/80 hover:border-amber-500/50'
          }`}
          title={isMissionsOpen ? 'Ocultar Misiones' : 'Abrir Misiones Guiadas'}
        >
          <div className="relative flex items-center justify-center text-sm">
            <span>📜</span>
            {hasClaimableMissions && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            )}
          </div>
          <span className="hidden sm:inline">Misiones</span>
          {hasClaimableMissions ? (
            <span className="font-mono text-[10.5px] font-black text-amber-400 bg-amber-500/20 px-1.5 py-0.2 rounded border border-amber-500/40 animate-pulse">
              ¡Reclamar!
            </span>
          ) : (
            <span className="font-mono text-[10.5px] text-amber-400/80 font-bold">
              {claimedCount}/{missions.length}
            </span>
          )}
        </button>

        {/* BOTÓN 2: DECRETOS IMPERIALES */}
        <button
          onClick={onToggleEdicts}
          className={`px-3 py-1.5 text-xs rounded-xl transition-all flex items-center gap-2 border font-sans font-bold tracking-wider uppercase ${
            isEdictsOpen
              ? 'bg-purple-500/25 text-purple-300 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)] ring-1 ring-purple-400/50'
              : 'bg-[#121927] hover:bg-[#182235] text-slate-200 hover:text-purple-300 border-slate-700/80 hover:border-purple-500/50'
          }`}
          title={isEdictsOpen ? 'Ocultar Leyes y Decretos' : 'Abrir Decretos y Leyes Imperiales'}
        >
          <span className="text-sm">⚖️</span>
          <span className="hidden sm:inline">Decretos</span>
          <span className="font-mono text-[10.5px] text-purple-400 font-bold bg-purple-500/15 px-1.5 py-0.2 rounded border border-purple-500/30">
            {activeEdictsCount}/8
          </span>
        </button>

        {/* BOTÓN 3: TESORO NACIONAL */}
        <button
          onClick={onOpenTributes}
          className="px-3 py-1.5 text-xs rounded-xl transition-all flex items-center gap-2 border font-sans font-bold tracking-wider uppercase bg-[#121927] hover:bg-[#182235] text-amber-300 border-slate-700/80 hover:border-amber-400 shadow-sm group"
          title="Abrir Tesoro Nacional (Desafío Diario y Buzón de Guerra)"
        >
          <Trophy className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform shrink-0" />
          <span className="hidden sm:inline">Tesoro</span>
          {pendingCoins > 0 ? (
            <span className="flex items-center gap-1 font-mono text-[10.5px] font-black text-amber-300 bg-amber-500/20 px-1.5 py-0.2 rounded border border-amber-400/50 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              +{pendingCoins}🪙
            </span>
          ) : (
            <span className="text-[10px] text-amber-400/70 font-mono">
              Oro
            </span>
          )}
        </button>

        {/* BOTÓN 4: NACIONES Y SOBERANÍA */}
        <button
          onClick={onOpenSovereignty}
          className="px-3 py-1.5 text-xs rounded-xl transition-all flex items-center gap-2 border font-sans font-bold tracking-wider uppercase bg-[#121927] hover:bg-[#182235] text-sky-300 border-slate-700/80 hover:border-sky-400 shadow-sm group"
          title="Ver Soberanía Territorial, Países Colonizados y Reclamar Tierras"
        >
          <Crown className="w-3.5 h-3.5 text-sky-400 group-hover:scale-110 transition-transform shrink-0" />
          <span className="hidden sm:inline">Naciones</span>
          <span className="font-mono text-[10.5px] text-sky-300 font-bold bg-sky-500/15 px-1.5 py-0.2 rounded border border-sky-500/30">
            {countryCount}
          </span>
        </button>

        {/* BOTÓN 5: CASILLA SELECCIONADA (Aparece únicamente al clicar sobre una casilla) */}
        {selectedTile && (
          <>
            <div className="w-px h-5 bg-slate-700/80 mx-0.5" />
            <div className="flex items-center gap-1">
              <button
                onClick={onToggleTile}
                className={`px-3 py-1.5 text-xs rounded-xl transition-all flex items-center gap-2 border font-sans font-bold tracking-wide max-w-[170px] sm:max-w-[210px] ${
                  isTileOpen
                    ? 'bg-emerald-500/25 text-emerald-300 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] ring-1 ring-emerald-400/50'
                    : 'bg-[#121927] hover:bg-[#182235] text-emerald-300 border-slate-700/80 hover:border-emerald-500/50'
                }`}
                title={isTileOpen ? 'Ocultar Detalle de Casilla' : 'Ver Detalle de Casilla'}
              >
                <span className="text-sm shrink-0">{tileIcon}</span>
                <span className="truncate">{tileLabel}</span>
              </button>

              {onDeselectTile && (
                <button
                  onClick={onDeselectTile}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                  title="Deseleccionar Casilla y cerrar panel"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
