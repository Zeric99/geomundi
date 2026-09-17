import React, { useRef, useEffect, useState, useCallback } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, Crown, Building } from 'lucide-react';
import { UserEmpire, GridTile } from '../../features/empires/types';
import { geoGridService, GRID_COLS, GRID_ROWS } from '../../features/empires/services/geoGridService';

interface EmpireShowcaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  empire: UserEmpire;
}

export const EmpireShowcaseModal: React.FC<EmpireShowcaseModalProps> = ({
  isOpen,
  onClose,
  empire
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Lista de asentamientos (ciudades/capital)
  const settlements = Object.values(empire.colonizedTiles || {}).filter(
    (t): t is Partial<GridTile> & { id: string } => 
      Boolean(t && t.id && (t.role === 'settlement' || t.id === empire.capitalTileId))
  );

  const colonizedTileKeys = Object.keys(empire.colonizedTiles || {});
  const colonizedCount = colonizedTileKeys.length;
  const conquestPct = ((colonizedCount / 20000) * 100).toFixed(2);

  // Inicializar cuadrícula si es necesario y redibujar
  useEffect(() => {
    if (!isOpen) return;
    let isCancelled = false;

    const render = async () => {
      await geoGridService.initializeGrid();
      if (isCancelled) return;
      drawMap();
    };

    render();

    return () => {
      isCancelled = true;
    };
  }, [isOpen, zoom, offset, empire]);

  // Dibujar el mapa completo y las colonias
  const drawMap = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // 1. Limpiar fondo oceánico profundo
    ctx.fillStyle = '#0a101d';
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    // Aplicar transformación Pan & Zoom
    ctx.translate(offset.x, offset.y);
    ctx.scale(zoom, zoom);

    // 2. Dibujar lienzo base del mundo (tierras y fronteras)
    const baseCanvas = geoGridService.getBaseWorldCanvas();
    if (baseCanvas) {
      ctx.drawImage(baseCanvas, 0, 0, width, height);
    } else {
      const landTiles = geoGridService.getAllLandTiles();
      ctx.fillStyle = '#182438';
      const tileW = width / GRID_COLS;
      const tileH = height / GRID_ROWS;
      for (const t of landTiles) {
        ctx.fillRect(t.x * tileW, t.y * tileH, tileW + 0.2, tileH + 0.2);
      }
    }

    const tileW = width / GRID_COLS;
    const tileH = height / GRID_ROWS;

    // 3. Dibujar las casillas colonizadas del imperio
    for (const tileId of colonizedTileKeys) {
      const parts = tileId.split(',');
      const x = parseInt(parts[0], 10);
      const y = parseInt(parts[1], 10);
      if (isNaN(x) || isNaN(y)) continue;

      const px = x * tileW;
      const py = y * tileH;

      ctx.fillStyle = '#10b981'; // Esmeralda base
      ctx.fillRect(px, py, tileW, tileH);

      // Resplandor ligero
      ctx.fillStyle = 'rgba(52, 211, 153, 0.4)';
      ctx.fillRect(px - 0.5, py - 0.5, tileW + 1, tileH + 1);
    }

    // 4. Dibujar Expediciones / Rutas marítimas
    if (empire.expeditions && empire.expeditions.length > 0) {
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.65)';
      ctx.lineWidth = 1.5 / zoom;
      ctx.setLineDash([3 / zoom, 3 / zoom]);

      for (const exp of empire.expeditions) {
        const ox = (exp.originCoords.x + 0.5) * tileW;
        const oy = (exp.originCoords.y + 0.5) * tileH;
        const dx = (exp.destCoords.x + 0.5) * tileW;
        const dy = (exp.destCoords.y + 0.5) * tileH;

        ctx.beginPath();
        ctx.moveTo(ox, oy);
        ctx.lineTo(dx, dy);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }

    // 5. Dibujar Ciudades y Asentamientos
    for (const s of settlements) {
      const parts = s.id.split(',');
      const cx = (parseInt(parts[0], 10) + 0.5) * tileW;
      const cy = (parseInt(parts[1], 10) + 0.5) * tileH;

      const isCapital = s.id === empire.capitalTileId;
      const radius = (isCapital ? 5 : 3.5) / Math.sqrt(zoom);

      // Halo
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 2, 0, Math.PI * 2);
      ctx.fillStyle = isCapital ? 'rgba(245, 158, 11, 0.35)' : 'rgba(59, 130, 246, 0.35)';
      ctx.fill();

      // Punto central
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = isCapital ? '#fbbf24' : '#60a5fa';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1 / zoom;
      ctx.stroke();

      // Nombre de la ciudad si el zoom es suficiente o es la capital
      if (zoom >= 1.4 || isCapital) {
        const cityName = s.cityName || (isCapital ? 'Capital Imperial' : 'Asentamiento');
        ctx.font = `bold ${Math.max(9, Math.min(13, 11 / Math.sqrt(zoom)))}px sans-serif`;
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0,0,0,0.9)';
        ctx.shadowBlur = 4;
        ctx.fillText(cityName, cx, cy - radius - 3);
        ctx.shadowBlur = 0;
      }
    }

    ctx.restore();
  }, [offset, zoom, empire, colonizedTileKeys, settlements]);

  // Manejo de Pan y Zoom con ratón
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.2 : 0.85;
    setZoom(prev => Math.max(1, Math.min(8, prev * zoomFactor)));
  };

  const resetView = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const centerOnSettlement = (tileId: string) => {
    const parts = tileId.split(',');
    const x = parseInt(parts[0], 10);
    const y = parseInt(parts[1], 10);
    if (isNaN(x) || isNaN(y) || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const targetZoom = 3.5;
    setZoom(targetZoom);

    const tileW = canvas.width / GRID_COLS;
    const tileH = canvas.height / GRID_ROWS;
    const cx = (x + 0.5) * tileW;
    const cy = (y + 0.5) * tileH;

    setOffset({
      x: canvas.width / 2 - cx * targetZoom,
      y: canvas.height / 2 - cy * targetZoom
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-lg animate-in fade-in duration-200">
      <div className="bg-[#0f1422] border border-zinc-800 rounded-3xl w-full max-w-5xl h-[92vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Cabecera del Visor */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-950/40 via-zinc-900/70 to-indigo-950/40 border-b border-zinc-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif font-black text-lg sm:text-xl text-zinc-100">
                  Vitrina Imperial · {empire.empireName || 'Imperio Soberano'}
                </h2>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Cartografía Oficial
                </span>
              </div>
              <p className="text-xs text-zinc-400 flex items-center gap-2">
                <span>Planeta Tierra #01</span>
                <span>·</span>
                <span className="text-amber-400 font-bold">{conquestPct}% Soberanía Global</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetView}
              className="p-2 text-zinc-400 hover:text-zinc-200 bg-zinc-900/80 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-colors"
              title="Restablecer vista"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom(z => Math.min(8, z * 1.3))}
              className="p-2 text-zinc-400 hover:text-zinc-200 bg-zinc-900/80 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-colors"
              title="Acercar mapa"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom(z => Math.max(1, z * 0.75))}
              className="p-2 text-zinc-400 hover:text-zinc-200 bg-zinc-900/80 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-colors"
              title="Alejar mapa"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white bg-zinc-900/80 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Métricas destacadas en barra compacta */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-3 bg-zinc-950/70 border-b border-zinc-800/80 text-center text-xs">
          <div className="p-1.5 rounded-lg bg-zinc-900/50 border border-zinc-800/60">
            <span className="text-[10px] text-zinc-500 block uppercase">Planeta Conquistado</span>
            <span className="font-mono font-bold text-amber-300 text-sm">{conquestPct}%</span>
            <span className="text-[10px] text-zinc-400 block">({colonizedCount.toLocaleString()} casillas)</span>
          </div>
          <div className="p-1.5 rounded-lg bg-zinc-900/50 border border-zinc-800/60">
            <span className="text-[10px] text-zinc-500 block uppercase">Censo Poblacional</span>
            <span className="font-mono font-bold text-cyan-300 text-sm">{empire.totalPopulation.toLocaleString()}</span>
            <span className="text-[10px] text-zinc-400 block">habitantes</span>
          </div>
          <div className="p-1.5 rounded-lg bg-zinc-900/50 border border-zinc-800/60">
            <span className="text-[10px] text-zinc-500 block uppercase">Asentamientos</span>
            <span className="font-mono font-bold text-emerald-300 text-sm">{settlements.length}</span>
            <span className="text-[10px] text-zinc-400 block">ciudades/villas</span>
          </div>
          <div className="p-1.5 rounded-lg bg-zinc-900/50 border border-zinc-800/60">
            <span className="text-[10px] text-zinc-500 block uppercase">Soberanía Total</span>
            <span className="font-mono font-bold text-indigo-300 text-sm">{(empire.annexedCountries || []).length}</span>
            <span className="text-[10px] text-zinc-400 block">países anexionados</span>
          </div>
          <div className="p-1.5 rounded-lg bg-zinc-900/50 border border-zinc-800/60 col-span-2 sm:col-span-1">
            <span className="text-[10px] text-zinc-500 block uppercase">Decretos Promulgados</span>
            <span className="font-mono font-bold text-purple-300 text-sm">{(empire.activeEdicts || []).length} / 8</span>
            <span className="text-[10px] text-zinc-400 block">leyes activas</span>
          </div>
        </div>

        {/* Contenedor del Mapa Interactivo */}
        <div className="flex-1 relative overflow-hidden bg-black flex items-center justify-center cursor-grab active:cursor-grabbing">
          <canvas
            ref={canvasRef}
            width={1200}
            height={600}
            className="w-full h-full object-contain"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          />

          {/* Badge flotante de ayuda */}
          <div className="absolute bottom-3 left-3 bg-zinc-950/80 backdrop-blur-md border border-zinc-800/80 rounded-xl px-3 py-1.5 text-[11px] text-zinc-400 pointer-events-none flex items-center gap-2">
            <span>🖱️ Arrastra para explorar</span>
            <span>·</span>
            <span>Rueda para zoom ({zoom.toFixed(1)}x)</span>
          </div>
        </div>

        {/* Barra inferior: Lista de Asentamientos para navegación rápida */}
        <div className="p-3 bg-zinc-950/90 border-t border-zinc-800 flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1 shrink-0 pl-1">
            <Building className="w-3.5 h-3.5 text-indigo-400" />
            <span>Asentamientos:</span>
          </span>

          <div className="flex items-center gap-2">
            {settlements.map((s) => {
              const isCapital = s.id === empire.capitalTileId;
              const name = s.cityName || (isCapital ? 'Capital Imperial' : 'Asentamiento');
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    centerOnSettlement(s.id);
                  }}
                  className={`px-2.5 py-1 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all whitespace-nowrap ${
                    isCapital
                      ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                      : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <span>{isCapital ? '👑' : '🏙️'}</span>
                  <span>{name}</span>
                  <span className="text-[10px] text-zinc-500 font-mono">Niv.{s.settlementTier || 1}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
