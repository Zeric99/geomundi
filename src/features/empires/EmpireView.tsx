import React, { useState, useEffect } from 'react';
import { UserEmpire, GridTile } from './types';
import { geoGridService } from './services/geoGridService';
import { empireStorageService } from './services/empireStorageService';
import { EmpireTopBar } from './components/EmpireTopBar';
import { EmpireTacticalCanvas } from './components/EmpireTacticalCanvas';
import { EmpireGlobe3D } from './components/EmpireGlobe3D';
import { FoundCapitalModal } from './components/FoundCapitalModal';
import { TributeMailboxModal } from './components/TributeMailboxModal';
import { SovereigntyModal } from './components/SovereigntyModal';
import { LaunchExpeditionModal } from './components/LaunchExpeditionModal';
import { EmpireRightSidebar } from './components/EmpireRightSidebar';
import { Loader2 } from 'lucide-react';

interface EmpireViewProps {
  onNavigateToDaily?: () => void;
  onNavigateToRanked?: () => void;
}

export const EmpireView: React.FC<EmpireViewProps> = ({
  onNavigateToDaily,
  onNavigateToRanked
}) => {
  const [empire, setEmpire] = useState<UserEmpire>(empireStorageService.getEmpire());
  const [cameraMode, setCameraMode] = useState<'2d' | '3d'>('2d');
  const [selectedTile, setSelectedTile] = useState<GridTile | null>(null);
  const [foundingTile, setFoundingTile] = useState<GridTile | null>(null);
  const [isTributeModalOpen, setIsTributeModalOpen] = useState(false);
  const [isSovereigntyModalOpen, setIsSovereigntyModalOpen] = useState(false);
  const [isGridReady, setIsGridReady] = useState(false);
  const [activeRightTab, setActiveRightTab] = useState<'missions' | 'tile'>('missions');
  const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(false);

  // Estados de Fletado y Navegación Marítima (Fase 4)
  const [launchingPortId, setLaunchingPortId] = useState<string | null>(null);
  const [launchingDestId, setLaunchingDestId] = useState<string | null>(null);
  const [expeditionOriginTileId, setExpeditionOriginTileId] = useState<string | null>(null);

  // 1. Suscribirse a cambios del imperio
  useEffect(() => {
    const unsubscribe = empireStorageService.subscribe((updated) => {
      setEmpire({ ...updated });
    });
    return unsubscribe;
  }, []);

  // 2. Inicializar la cuadrícula geográfica
  useEffect(() => {
    let isMounted = true;
    geoGridService.initializeGrid().then(() => {
      if (isMounted) setIsGridReady(true);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSelectTile = (tile: GridTile | null) => {
    setSelectedTile(tile);
    if (tile && empire.capitalTileId) {
      setActiveRightTab('tile');
      setIsRightSidebarCollapsed(false);
    }
  };

  if (!isGridReady) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950 text-zinc-300 gap-3">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <div className="text-center">
          <p className="text-sm font-bold tracking-wide text-zinc-100">Cargando Cuadrícula Geográfica...</p>
          <p className="text-xs text-zinc-500 font-mono mt-0.5">Discretizando 20.000 casillas mundiales y costas</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-black select-none">
      {/* Barra Superior del Imperio (Fija en la parte superior, nunca se oculta) */}
      <EmpireTopBar
        empire={empire}
        cameraMode={cameraMode}
        onToggleCameraMode={setCameraMode}
        onOpenTributes={() => setIsTributeModalOpen(true)}
        onOpenSovereignty={() => setIsSovereigntyModalOpen(true)}
        activeRightTab={activeRightTab}
        onSelectRightTab={(tab) => {
          setActiveRightTab(tab);
          setIsRightSidebarCollapsed(false);
        }}
        selectedTile={selectedTile}
        isRightSidebarCollapsed={isRightSidebarCollapsed}
        onToggleRightSidebar={() => setIsRightSidebarCollapsed(prev => !prev)}
      />

      {/* Contenedor Principal: Mapa a la izquierda + Panel Lateral Unificado a la derecha (Fuera del Canvas) */}
      <div className="flex-1 min-h-0 w-full flex flex-row overflow-hidden relative">
        {/* Área del Mapa: Táctico 2D vs Globo 3D */}
        <div className="flex-1 min-w-0 h-full relative overflow-hidden">
          {cameraMode === '2d' ? (
            <EmpireTacticalCanvas
              empire={empire}
              selectedTile={selectedTile}
              onSelectTile={handleSelectTile}
              onRequestFoundCapital={setFoundingTile}
              expeditionOriginTileId={expeditionOriginTileId}
              onSelectExpeditionDest={(destTileId) => {
                setLaunchingDestId(destTileId);
                setLaunchingPortId(expeditionOriginTileId);
                setExpeditionOriginTileId(null);
              }}
              onCancelExpeditionMode={() => {
                setExpeditionOriginTileId(null);
                setLaunchingDestId(null);
                setLaunchingPortId(null);
              }}
            />
          ) : (
            <EmpireGlobe3D empire={empire} />
          )}
        </div>

        {/* Panel Lateral Derecho: Misiones Guiadas y Gestión Fija de Casillas (Fuera del Canvas) */}
        <EmpireRightSidebar
          empire={empire}
          activeTab={activeRightTab}
          onChangeTab={setActiveRightTab}
          selectedTile={selectedTile}
          onCloseTile={() => {
            setSelectedTile(null);
            setActiveRightTab('missions');
          }}
          onStartNavalExpedition={(originTileId) => {
            setSelectedTile(null);
            setLaunchingDestId(null);
            setExpeditionOriginTileId(null);
            setLaunchingPortId(originTileId);
          }}
          isCollapsed={isRightSidebarCollapsed}
          onToggleCollapse={() => setIsRightSidebarCollapsed(prev => !prev)}
        />
      </div>

      {/* Modal para Fundar Capital (si aún no tiene) */}
      {foundingTile && (
        <FoundCapitalModal
          tile={foundingTile}
          onClose={() => setFoundingTile(null)}
          onSuccess={() => {
            setFoundingTile(null);
            setSelectedTile(null);
          }}
        />
      )}

      {/* Modal de Fletar Expedición Marítima (Fase 4) */}
      {launchingPortId && (
        <LaunchExpeditionModal
          originTileId={launchingPortId}
          initialDestId={launchingDestId}
          empire={empire}
          onClose={() => {
            setLaunchingPortId(null);
            setLaunchingDestId(null);
            setExpeditionOriginTileId(null);
          }}
          onSelectOnMap={(originId) => {
            setLaunchingDestId(null);
            setLaunchingPortId(null);
            setExpeditionOriginTileId(originId);
          }}
          onLaunched={() => {
            setLaunchingPortId(null);
            setLaunchingDestId(null);
            setExpeditionOriginTileId(null);
          }}
        />
      )}

      {/* Modal de Tributos y Tesoro Nacional (Fase 2) */}
      {isTributeModalOpen && (
        <TributeMailboxModal
          onClose={() => setIsTributeModalOpen(false)}
          onNavigateToDaily={onNavigateToDaily}
          onNavigateToRanked={onNavigateToRanked}
        />
      )}

      {/* Modal de Soberanía y Censo Nacional (Fase 3) */}
      {isSovereigntyModalOpen && (
        <SovereigntyModal
          empire={empire}
          onClose={() => setIsSovereigntyModalOpen(false)}
        />
      )}
    </div>
  );
};
