import React, { useState } from 'react';
import { UserEmpire, GridTile } from '../types';
import { Globe, Map as MapIcon, Edit2, Check, Coins, Users, Wheat, Hammer, Smile, RotateCcw, Anchor, Volume2, VolumeX, Music } from 'lucide-react';
import { empireStorageService } from '../services/empireStorageService';
import { empireSound } from '../services/empireSoundService';

interface EmpireTopBarProps {
  empire: UserEmpire;
  cameraMode: '2d' | '3d';
  onToggleCameraMode: (mode: '2d' | '3d') => void;
  selectedTile?: GridTile | null;
  isRightSidebarCollapsed?: boolean;
  onToggleRightSidebar?: () => void;
}

export const EmpireTopBar: React.FC<EmpireTopBarProps> = ({
  empire,
  cameraMode,
  onToggleCameraMode,
  selectedTile = null,
  isRightSidebarCollapsed = false,
  onToggleRightSidebar
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(empire.empireName);
  const [isMuted, setIsMuted] = useState<boolean>(empireSound.getMuted());
  const [isMusicActive, setIsMusicActive] = useState<boolean>(empireSound.isMusicActive());

  const handleSaveName = () => {
    if (nameInput.trim()) {
      empireStorageService.renameEmpire(nameInput.trim());
    }
    setIsEditingName(false);
  };

  return (
    <header className="w-full bg-[#0a0e17]/95 border-b border-slate-800 px-3 sm:px-5 py-2 flex flex-wrap items-center justify-between gap-2.5 shadow-2xl z-30 select-none">
      {/* ─── Identidad Imperial (Izquierda) ─── */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div 
          className="w-4 h-4 rounded-md shadow-md border border-amber-400/70 shrink-0" 
          style={{ backgroundColor: empire.colorHex }}
          title="Estandarte de tu Imperio"
        />
        {isEditingName ? (
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              maxLength={26}
              className="bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded border border-amber-400/80 focus:outline-none focus:border-amber-300 font-sans tracking-wide"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
            />
            <button
              onClick={handleSaveName}
              className="tactical-btn-cta p-1 text-xs text-black rounded"
              title="Guardar nombre"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div 
            className="flex items-center gap-1.5 group cursor-pointer" 
            onClick={() => setIsEditingName(true)}
            title="Clic para renombrar tu imperio"
          >
            <span className="text-white font-black text-sm tracking-wider uppercase flex items-center gap-1.5 font-sans">
              {empire.empireName}
            </span>
            <Edit2 className="w-3 h-3 text-slate-500 group-hover:text-amber-400 transition-colors" />
          </div>
        )}
      </div>

      {/* ─── Zona Central: Bahía Unificada de Recursos Nacionales (Dinero, Habitantes, Comida, Suministros, Felicidad) ─── */}
      <div className="flex items-center gap-2.5 overflow-x-auto py-0.5 scrollbar-none">
        <div className="flex items-center bg-[#0d131f] border border-slate-800 rounded-xl px-3 py-1 gap-3 shadow-inner shrink-0">
          
          {/* 1. Dinero / Oro */}
          <div 
            className="flex items-center gap-1.5 cursor-help"
            title="Tesoro Imperial. Los impuestos de tus ciudades se acumulan en el Baúl de Impuestos (abrible cada 24h tras 5 rankeds). Durante el día ganas monedas en Rankeds, el Desafío Diario y Misiones."
          >
            <Coins className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-xs sm:text-sm font-black text-amber-300 font-mono tabular-nums">
              {empire.coins.toLocaleString()}
            </span>
            <button
              onClick={() => empireStorageService.addCheatCoins(100)}
              className="text-[10px] font-mono px-1.5 py-0.5 text-amber-400 hover:text-amber-200 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 rounded font-bold ml-0.5 transition-colors"
              title="Añadir +100 monedas para pruebas de desarrollo"
            >
              +100
            </button>
          </div>

          <div className="w-px h-4 bg-slate-800" />

          {/* 2. Habitantes / Población */}
          <div 
            className="flex items-center gap-1.5 cursor-help" 
            title="Población Imperial Total"
          >
            <Users className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-xs font-bold text-cyan-200 font-mono tabular-nums">
              {empire.totalPopulation.toLocaleString()}
            </span>
            <span className="text-[9.5px] text-cyan-400/80 font-mono uppercase font-bold">hab</span>
          </div>

          <div className="w-px h-4 bg-slate-800" />

          {/* 3. Comida / Alimentos */}
          {(() => {
            const cropsTiles = Object.values(empire.colonizedTiles).filter(t => t.role === 'crops');
            let foodProd = 0;
            cropsTiles.forEach(t => {
              const tier = t.resourceTier || 1;
              let base = tier === 3 ? 75 : tier === 2 ? 35 : 15;
              if (t.id) {
                const cluster = empireStorageService.getResourceClusterInfo(t.id);
                if (cluster.bonusPct > 0) {
                  base = Math.round(base * (1 + cluster.bonusPct / 100));
                }
              }
              foodProd += base;
            });
            const foodCons = Math.floor(empire.totalPopulation * 0.5);
            return (
              <div 
                className="flex items-center gap-1.5 cursor-help" 
                title={`Suministro Agrícola: +${empire.nationalFood} 🌾 (Producción: +${foodProd} de ${cropsTiles.length} huertos · Consumo: -${foodCons} por ${empire.totalPopulation} hab.)`}
              >
                <Wheat className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs font-bold font-mono text-emerald-300 tabular-nums">
                  +{empire.nationalFood}
                </span>
              </div>
            );
          })()}

          <div className="w-px h-4 bg-slate-800" />

          {/* 4. Suministros / Materiales */}
          {(() => {
            const quarryTiles = Object.values(empire.colonizedTiles).filter(t => t.role === 'resources');
            const forestBonus = empire.appliedForestBonus || 0;
            return (
              <div 
                className="flex items-center gap-1.5 cursor-help" 
                title={`Suministros de Construcción: ${empire.nationalMaterials} 🧱 (Obtenidos de ${quarryTiles.length} canteras/bosques${forestBonus > 0 ? ` [incluye +${forestBonus} por Grandes Bosques]` : ''})`}
              >
                <Hammer className="w-4 h-4 text-orange-400 shrink-0" />
                <span className="text-xs font-bold text-orange-300 font-mono tabular-nums">
                  {empire.nationalMaterials}
                </span>
              </div>
            );
          })()}

          <div className="w-px h-4 bg-slate-800" />

          {/* 5. Felicidad */}
          <div 
            className="flex items-center gap-1.5 cursor-help" 
            title={`Felicidad Nacional: ${empire.happinessPct}% (Aumenta la acumulación de impuestos en el Baúl Nacional y la bonificación cívica)`}
          >
            <Smile className="w-4 h-4 text-yellow-400 shrink-0" />
            <span className="text-xs font-bold text-yellow-300 font-mono tabular-nums">
              {empire.happinessPct}%
            </span>
          </div>

          {/* Flota Activa si existe */}
          {(empire.expeditions || []).some(e => e.status === 'sailing') && (
            <>
              <div className="w-px h-4 bg-slate-800" />
              <div className="flex items-center gap-1.5 text-sky-300 font-bold text-xs">
                <Anchor className="w-3.5 h-3.5 text-sky-400 shrink-0 animate-pulse" />
                <span className="font-mono text-[11px] text-sky-200">
                  ⛵ {(empire.expeditions || []).filter(e => e.status === 'sailing').length} en mar
                </span>
                <button
                  onClick={() => {
                    const active = (empire.expeditions || []).find(e => e.status === 'sailing');
                    if (active) empireStorageService.speedUpExpedition(active.id);
                  }}
                  className="tactical-btn text-[10px] px-1.5 py-0.5 text-sky-300 border-sky-600/60"
                  title="Acelerar travesía y desembarcar ya (Modo Test)"
                >
                  Arribar
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ─── Zona Derecha: Bahía de Operaciones de Teatro & Sistema ─── */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center bg-[#0d131f] border border-slate-800 rounded-xl px-2 py-1 gap-2 shadow-inner">
          {/* Selector 2D / 3D */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onToggleCameraMode('2d')}
              className={`px-2 py-1 text-[11px] rounded font-bold uppercase transition-all flex items-center gap-1 ${
                cameraMode === '2d'
                  ? 'bg-slate-700 text-white border border-slate-600 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Modo Táctico 2D (Jugar y Comprar)"
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">2D</span>
            </button>

            <button
              onClick={() => onToggleCameraMode('3d')}
              className={`px-2 py-1 text-[11px] rounded font-bold uppercase transition-all flex items-center gap-1 ${
                cameraMode === '3d'
                  ? 'bg-slate-700 text-white border border-slate-600 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Modo Globo 3D (Vitrina)"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">3D</span>
            </button>
          </div>

          <div className="w-px h-4 bg-slate-800" />

          {/* Controles de Audio */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                const muted = empireSound.toggleMute();
                setIsMuted(muted);
                if (muted) setIsMusicActive(false);
              }}
              className="p-1 text-slate-400 hover:text-white rounded transition-colors"
              title={isMuted ? 'Activar Efectos de Sonido' : 'Silenciar Efectos de Sonido'}
            >
              {!isMuted ? <Volume2 className="w-3.5 h-3.5 text-slate-300" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
            </button>

            <button
              onClick={() => {
                const active = empireSound.toggleAmbientMusic();
                setIsMusicActive(active);
              }}
              className={`px-2 py-1 text-[11px] font-bold rounded flex items-center gap-1 transition-all ${
                isMusicActive ? 'text-amber-300 bg-amber-500/20 border border-amber-400/50' : 'text-slate-400 hover:text-slate-200'
              }`}
              title={isMusicActive ? 'Detener Música Zen' : 'Reproducir Música Zen Procedimental'}
            >
              <Music className={`w-3.5 h-3.5 ${isMusicActive ? 'text-amber-400 animate-pulse' : ''}`} />
              <span className="hidden md:inline">Música</span>
            </button>
          </div>

          <div className="w-px h-4 bg-slate-800" />

          {/* Botón de Reinicio (Test) */}
          <button
            onClick={() => {
              if (window.confirm('¿Reiniciar tu imperio para empezar de nuevo?')) {
                empireStorageService.resetEmpire();
              }
            }}
            className="p-1 text-slate-500 hover:text-red-400 rounded transition-colors"
            title="Reiniciar Imperio (Test)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
