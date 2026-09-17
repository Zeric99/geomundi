import React, { useState, useEffect } from 'react';
import { UserEmpire, GridTile } from '../types';
import { Globe, Map as MapIcon, Edit2, Check, Coins, Users, Wheat, Hammer, Smile, RotateCcw, Trophy, Crown, Anchor, Volume2, VolumeX, Music } from 'lucide-react';
import { empireStorageService, TUTORIAL_MISSIONS } from '../services/empireStorageService';
import { empireEconomyService } from '../services/empireEconomyService';
import { empireSound } from '../services/empireSoundService';

interface EmpireTopBarProps {
  empire: UserEmpire;
  cameraMode: '2d' | '3d';
  onToggleCameraMode: (mode: '2d' | '3d') => void;
  onOpenTributes?: () => void;
  onOpenSovereignty?: () => void;
  activeRightTab?: 'missions' | 'tile';
  onSelectRightTab?: (tab: 'missions' | 'tile') => void;
  selectedTile?: GridTile | null;
  isRightSidebarCollapsed?: boolean;
  onToggleRightSidebar?: () => void;
}

export const EmpireTopBar: React.FC<EmpireTopBarProps> = ({
  empire,
  cameraMode,
  onToggleCameraMode,
  onOpenTributes,
  onOpenSovereignty,
  activeRightTab = 'missions',
  onSelectRightTab,
  selectedTile = null,
  isRightSidebarCollapsed = false,
  onToggleRightSidebar
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(empire.empireName);
  const [pendingCoins, setPendingCoins] = useState<number>(empireEconomyService.getTotalPendingCoins());
  const [isMuted, setIsMuted] = useState<boolean>(empireSound.getMuted());
  const [isMusicActive, setIsMusicActive] = useState<boolean>(empireSound.isMusicActive());

  useEffect(() => {
    const unsub = empireEconomyService.subscribe(() => {
      setPendingCoins(empireEconomyService.getTotalPendingCoins());
    });
    return unsub;
  }, []);

  const handleSaveName = () => {
    if (nameInput.trim()) {
      empireStorageService.renameEmpire(nameInput.trim());
    }
    setIsEditingName(false);
  };

  return (
    <header className="w-full bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80 px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-lg z-30 select-none">
      {/* Nombre del Imperio y Personalización */}
      <div className="flex items-center gap-2.5">
        <div 
          className="w-4 h-4 rounded-full shadow-md border border-white/20 shrink-0" 
          style={{ backgroundColor: empire.colorHex }}
          title="Color de tu Imperio"
        />
        {isEditingName ? (
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              maxLength={26}
              className="bg-zinc-800 text-zinc-100 text-xs sm:text-sm font-bold px-2 py-1 rounded border border-zinc-600 focus:outline-none focus:border-indigo-400"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
            />
            <button
              onClick={handleSaveName}
              className="p-1 rounded bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 group cursor-pointer" onClick={() => setIsEditingName(true)}>
            <span className="text-zinc-100 font-black text-sm sm:text-base tracking-wide flex items-center gap-1.5 font-display">
              {empire.empireName}
            </span>
            <Edit2 className="w-3 h-3 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
          </div>
        )}
      </div>

      {/* Marcador Económico y Balances Nacionales */}
      <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto py-1 scrollbar-none">
        {/* Monedas */}
        <div 
          className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/25 px-2.5 py-1 rounded-lg"
          title="Tesoro Imperial (Monedas de Oro acumuladas)"
        >
          <Coins className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="text-xs sm:text-sm font-bold text-amber-300 font-mono">
            {empire.coins.toLocaleString()}
          </span>
          <button
            onClick={() => empireStorageService.addCheatCoins(100)}
            className="text-[9px] bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 font-bold px-1.5 py-0.5 rounded ml-1 transition-colors border border-amber-500/30 cursor-pointer"
            title="Añadir +100 monedas para pruebas de desarrollo"
          >
            +100 🪙
          </button>
        </div>

        {/* Botón de Tributos / Buzón Imperial */}
        <button
          onClick={onOpenTributes}
          className="relative flex items-center gap-1.5 bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 border border-amber-500/40 px-2.5 py-1 rounded-lg text-amber-300 font-bold text-xs transition-all shadow-sm shrink-0"
          title="Abrir Tesoro Nacional, Desafío Diario y Buzón de Duelos"
        >
          <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="hidden sm:inline">Tributos</span>
          {pendingCoins > 0 ? (
            <span className="bg-amber-500 text-zinc-950 text-[10px] font-black px-1.5 py-0.5 rounded-full animate-pulse shadow-sm leading-none">
              +{pendingCoins}
            </span>
          ) : (
            <span className="text-[10px] text-zinc-400 font-mono hidden md:inline">1.100🪙</span>
          )}
        </button>

        {/* Botón de Soberanía Territorial / Censo */}
        <button
          onClick={onOpenSovereignty}
          className="flex items-center gap-1.5 bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/35 px-2.5 py-1 rounded-lg text-indigo-300 font-bold text-xs transition-all shadow-sm shrink-0"
          title="Ver Censo Nacional y Reconocimiento de Soberanía"
        >
          <Crown className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span className="hidden sm:inline">Naciones</span>
          <span className="text-[10px] font-mono font-bold text-indigo-300 bg-indigo-950/80 px-1.5 py-0.5 rounded border border-indigo-700/50">
            {Object.keys(empire.localCensusByCountry).length || (empire.capitalTileId ? 1 : 0)}
          </span>
        </button>

        {/* Badge de Expediciones Marítimas Activas */}
        {(empire.expeditions || []).some(e => e.status === 'sailing') && (
          <div className="flex items-center gap-1.5 bg-blue-500/20 border border-blue-400/40 px-2.5 py-1 rounded-lg text-blue-300 font-bold text-xs shrink-0 animate-pulse">
            <Anchor className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="hidden sm:inline">Flota:</span>
            <span className="font-mono text-[11px] text-blue-200">
              ⛵ {(empire.expeditions || []).filter(e => e.status === 'sailing').length} en alta mar
            </span>
            <button
              onClick={() => {
                const active = (empire.expeditions || []).find(e => e.status === 'sailing');
                if (active) empireStorageService.speedUpExpedition(active.id);
              }}
              className="text-[9px] bg-blue-600 hover:bg-blue-500 text-white font-bold px-1.5 py-0.5 rounded ml-1 transition-colors"
              title="Acelerar travesía y desembarcar ya (Modo Test)"
            >
              ⏩ Arribar ya
            </button>
          </div>
        )}

        {/* Población Total */}
        <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-lg" title="Población Imperial Total">
          <Users className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span className="text-xs sm:text-sm font-bold text-zinc-200 font-mono">
            {empire.totalPopulation.toLocaleString()}
          </span>
        </div>

        {/* Comida */}
        {(() => {
          const cropsTiles = Object.values(empire.colonizedTiles).filter(t => t.role === 'crops');
          let foodProd = 0;
          cropsTiles.forEach(t => {
            const tier = t.resourceTier || 1;
            if (tier === 3) foodProd += 75;
            else if (tier === 2) foodProd += 35;
            else foodProd += 15;
          });
          const foodCons = Math.floor(empire.totalPopulation * 0.5);
          return (
            <div 
              className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-lg cursor-help" 
              title={`Suministro Agrícola: +${empire.nationalFood} 🌾 (Producción: +${foodProd} de ${cropsTiles.length} huertos · Consumo: -${foodCons} por ${empire.totalPopulation} hab.)`}
            >
              <Wheat className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
              <span className="text-xs sm:text-sm font-bold font-mono text-emerald-300">
                +{empire.nationalFood}
              </span>
            </div>
          );
        })()}

        {/* Materiales */}
        {(() => {
          const quarryTiles = Object.values(empire.colonizedTiles).filter(t => t.role === 'resources');
          return (
            <div 
              className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-lg cursor-help" 
              title={`Materiales de Construcción: ${empire.nationalMaterials} 🧱 (Obtenidos de ${quarryTiles.length} canteras. Se gastan al fundar o mejorar asentamientos y erigir monumentos)`}
            >
              <Hammer className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="text-xs sm:text-sm font-bold text-zinc-200 font-mono">
                {empire.nationalMaterials}
              </span>
            </div>
          );
        })()}

        {/* Felicidad */}
        <div 
          className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-lg cursor-help" 
          title={`Felicidad Nacional: ${empire.happinessPct}% (Multiplicador de oro pasivo y tributos: x${(0.5 + empire.happinessPct / 100).toFixed(2)}. Sube erigiendo monumentos y evitando hambrunas)`}
        >
          <Smile className={`w-3.5 h-3.5 shrink-0 ${empire.happinessPct >= 70 ? 'text-emerald-400' : 'text-amber-400'}`} />
          <span className="text-xs sm:text-sm font-bold text-zinc-200 font-mono">
            {empire.happinessPct}%
          </span>
        </div>
      </div>

      {/* ─── Zona Derecha: Controles (desplazados a la izquierda) + Títulos del Panel Lateral ─── */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Controles de Vista: Táctico 2D vs Globo 3D */}
        <div className="flex items-center bg-zinc-900 p-0.5 rounded-lg border border-zinc-800">
          <button
            onClick={() => onToggleCameraMode('2d')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
              cameraMode === '2d'
                ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Modo Táctico 2D (Jugar y Comprar)"
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Táctico 2D</span>
          </button>

          <button
            onClick={() => onToggleCameraMode('3d')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
              cameraMode === '3d'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Modo Globo 3D (Vitrina)"
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Globo 3D</span>
          </button>
        </div>

        {/* Controles de Audio: SFX y Música Zen */}
        <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded-lg border border-zinc-800">
          <button
            onClick={() => {
              const muted = empireSound.toggleMute();
              setIsMuted(muted);
              if (muted) setIsMusicActive(false);
            }}
            className={`p-1.5 rounded-md text-xs font-bold transition-all ${
              !isMuted
                ? 'text-amber-400 hover:text-amber-300 hover:bg-zinc-800'
                : 'text-zinc-500 hover:text-zinc-400 bg-zinc-800/40'
            }`}
            title={isMuted ? 'Activar Efectos de Sonido' : 'Silenciar Efectos de Sonido'}
          >
            {!isMuted ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => {
              const active = empireSound.toggleAmbientMusic();
              setIsMusicActive(active);
            }}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold transition-all ${
              isMusicActive
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
            title={isMusicActive ? 'Detener Música Zen' : 'Reproducir Música Zen Procedimental'}
          >
            <Music className={`w-3.5 h-3.5 ${isMusicActive ? 'animate-bounce text-amber-400' : ''}`} />
            <span className="hidden md:inline text-[11px]">{isMusicActive ? 'Música' : 'Música'}</span>
          </button>
        </div>

        {/* Reiniciar (para pruebas) */}
        <button
          onClick={() => {
            if (window.confirm('¿Reiniciar tu imperio para empezar de nuevo?')) {
              empireStorageService.resetEmpire();
            }
          }}
          className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 border border-zinc-800 transition-colors"
          title="Reiniciar Imperio (Test)"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* ─── TÍTULOS / PESTAÑAS DE LA COLUMNA LATERAL (Encima de la columna de misiones/casillas) ─── */}
        {(() => {
          const selectedTileData = selectedTile ? empire.colonizedTiles[selectedTile.id] : null;
          const isSettlement = selectedTileData?.role === 'settlement';
          const tileHeaderIcon = !selectedTile
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

          const tileHeaderLabel = !selectedTile
            ? 'Casilla'
            : isSettlement && selectedTileData?.cityName
            ? selectedTileData.cityName
            : selectedTileData?.role === 'crops'
            ? `Huerto N${selectedTileData?.resourceTier || 1}`
            : selectedTileData?.role === 'resources'
            ? `Cantera N${selectedTileData?.resourceTier || 1}`
            : selectedTile.countryName || 'Casilla';

          const hasClaimableMissions = TUTORIAL_MISSIONS.some(
            m => empireStorageService.isMissionCompleted(m.id) && !empireStorageService.isMissionClaimed(m.id)
          );

          return (
            <div className="flex items-center gap-1 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800 pl-1.5 pr-1.5 shadow-inner">
              {/* Título/Pestaña: Misiones */}
              <button
                onClick={() => onSelectRightTab?.('missions')}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeRightTab === 'missions'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                }`}
                title="Ver Misiones Guiadas y Tutorial"
              >
                <span>📜</span>
                <span className="hidden sm:inline">Misiones</span>
                {hasClaimableMissions && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                )}
              </button>

              {/* Título/Pestaña: Casilla */}
              <button
                onClick={() => onSelectRightTab?.('tile')}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeRightTab === 'tile'
                    ? 'bg-indigo-500/25 text-indigo-300 border border-indigo-500/40 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                }`}
                title={selectedTile ? 'Ver Detalle de la Casilla' : 'Selecciona una casilla en el mapa'}
              >
                <span>{tileHeaderIcon}</span>
                <span className="max-w-[110px] truncate">
                  {tileHeaderLabel}
                </span>
                {selectedTile && (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                )}
              </button>
            </div>
          );
        })()}
      </div>
    </header>
  );
};
