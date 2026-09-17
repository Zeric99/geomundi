import React, { useState, useMemo, useEffect } from 'react';
import { UserEmpire, GridTile } from '../types';
import { empireStorageService } from '../services/empireStorageService';
import { geoGridService } from '../services/geoGridService';
import { empireSound } from '../services/empireSoundService';
import { X, Anchor, Compass, Clock, Coins, Navigation, ArrowRight, ShieldCheck } from 'lucide-react';

interface LaunchExpeditionModalProps {
  originTileId: string;
  initialDestId?: string | null;
  empire: UserEmpire;
  onClose: () => void;
  onSelectOnMap: (originTileId: string) => void;
  onLaunched: () => void;
}

export const LaunchExpeditionModal: React.FC<LaunchExpeditionModalProps> = ({
  originTileId,
  initialDestId,
  empire,
  onClose,
  onSelectOnMap,
  onLaunched
}) => {
  const originTile = geoGridService.getTile(originTileId);
  const originColData = empire.colonizedTiles[originTileId];
  const [selectedDestId, setSelectedDestId] = useState<string | null>(initialDestId || null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialDestId) {
      setSelectedDestId(initialDestId);
    }
  }, [initialDestId]);

  // Buscar destinos recomendados: prefiltrar rápidamente por distancia euclídea antes de calcular rutas
  const recommendedDestinations = useMemo(() => {
    if (!originTile) return [];
    const allLand = geoGridService.getAllLandTiles();
    const validCoasts: { tile: GridTile; approxDist: number }[] = [];

    // 1. Filtrar costas válidas no colonizadas en otros países o islas
    allLand.forEach(tile => {
      if (tile.isCoast && !empire.colonizedTiles[tile.id]) {
        const isDifferentCountry = tile.countryCode !== originTile.countryCode;
        if (isDifferentCountry || tile.isSmallIsland) {
          const approxDist = Math.hypot(tile.x - originTile.x, tile.y - originTile.y);
          validCoasts.push({ tile, approxDist });
        }
      }
    });

    // 2. Ordenar por cercanía euclídea (tarda 0.1ms) y tomar los 15 más prometedores
    validCoasts.sort((a, b) => a.approxDist - b.approxDist);
    const topCandidates = validCoasts.slice(0, 15);

    // 3. Calcular la ruta marítima detallada únicamente para los candidatos prefiltrados
    const candidates: { tile: GridTile; distance: number; params: any }[] = [];
    const seenKeys = new Set<string>();

    for (const c of topCandidates) {
      const key = `${c.tile.countryCode}_${c.tile.isSmallIsland ? 'island' : 'main'}`;
      if (!seenKeys.has(key)) {
        const params = empireStorageService.calculateExpeditionParams(originTileId, c.tile.id);
        if (params) {
          seenKeys.add(key);
          candidates.push({ tile: c.tile, distance: params.distance, params });
          if (candidates.length >= 6) break;
        }
      }
    }

    return candidates;
  }, [originTileId, originTile, empire.colonizedTiles]);

  // Destino activo: SOLO el que el usuario o el mapa hayan seleccionado explícitamente (NUNCA auto-seleccionar por defecto)
  const activeDestId = selectedDestId;
  const activeParams = activeDestId ? empireStorageService.calculateExpeditionParams(originTileId, activeDestId) : null;
  const activeDestTile = activeDestId ? geoGridService.getTile(activeDestId) : null;

  const handleLaunch = () => {
    if (!activeDestId) return;
    setErrorMsg(null);
    const res = empireStorageService.launchExpedition(originTileId, activeDestId);
    if (res.success) {
      empireSound.playShipHorn();
      onLaunched();
      onClose();
    } else {
      setErrorMsg(res.error || 'No se pudo fletar la expedición');
    }
  };

  if (!originTile) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-zinc-950 border border-blue-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera Náutica */}
        <div className="px-5 py-4 border-b border-zinc-800 bg-gradient-to-r from-blue-950/50 via-zinc-900 to-zinc-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-500/20 border border-blue-400/30 text-blue-400">
              <Anchor className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                <span>Fletar Expedición Marítima</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 font-mono uppercase">
                  Ultramar
                </span>
              </h2>
              <p className="text-xs text-zinc-400 flex items-center gap-1.5 mt-0.5">
                <span>Desde:</span>
                <span className="font-bold text-blue-300">{originColData?.cityName || originTile.countryName || 'Puerto'}</span>
                <span className="text-zinc-600">•</span>
                <span className="text-zinc-400">{originTile.countryName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl text-xs text-red-400">
              {errorMsg}
            </div>
          )}

          {/* Botón de selección libre en mapa táctico */}
          <div className="p-3.5 rounded-2xl bg-blue-950/30 border border-blue-500/30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Compass className="w-4 h-4 text-blue-400" />
              <div>
                <p className="text-xs font-bold text-zinc-200">Exploración Libre en Mapa</p>
                <p className="text-[10px] text-zinc-400">Haz clic en cualquier costa del mundo para enviar tu barco</p>
              </div>
            </div>
            <button
              onClick={() => {
                onSelectOnMap(originTileId);
              }}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors shadow-lg shadow-blue-600/20 flex items-center gap-1.5 shrink-0"
            >
              <span>Elegir en Mapa</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Destinos Recomendados */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
              Costas e Islas Cercanas Recomendadas:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {recommendedDestinations.map(item => {
                const isSelected = activeDestId === item.tile.id;
                return (
                  <button
                    key={item.tile.id}
                    onClick={() => setSelectedDestId(item.tile.id)}
                    className={`p-2.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-400 text-white shadow-lg shadow-blue-500/10'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-xs truncate">
                        {item.tile.isSmallIsland ? '🏝️ ' : '🚩 '}
                        {item.tile.countryName}
                      </span>
                      {item.tile.isSmallIsland && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold shrink-0">
                          Isla
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-2 font-mono">
                      <span>{item.params.coinCost} 🪙</span>
                      <span>⏱️ {item.params.durationSec}s</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Resumen de la Travesía Seleccionada */}
          {activeDestTile && activeParams ? (
            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-zinc-300 flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-blue-400" />
                  Ruta Náutica: <span className="text-white font-black">{activeDestTile.countryName}</span>
                </span>
                <span className="text-[11px] font-mono text-zinc-400">
                  {activeParams.distance} millas náuticas
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="bg-zinc-800/60 p-2.5 rounded-xl border border-zinc-700/50">
                  <span className="text-[10px] text-zinc-400 block">Coste de Travesía</span>
                  <span className={`text-sm font-bold font-mono flex items-center gap-1 mt-0.5 ${
                    activeParams.isFree ? 'text-emerald-400' : empire.coins >= activeParams.coinCost ? 'text-amber-400' : 'text-red-400'
                  }`}>
                    <Coins className="w-4 h-4" />
                    {activeParams.isFree ? '¡GRATIS!' : `${activeParams.coinCost} 🪙`}
                  </span>
                </div>
                <div className="bg-zinc-800/60 p-2.5 rounded-xl border border-zinc-700/50">
                  <span className="text-[10px] text-zinc-400 block">Tiempo de Navegación</span>
                  <span className="text-sm font-bold font-mono text-blue-400 flex items-center gap-1 mt-0.5">
                    <Clock className="w-4 h-4" />
                    {activeParams.durationSec} seg
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-200 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <p>
                  Al arribar, se fundará una nueva <b>Aldea Costera (⛺)</b> del color de tu imperio, permitiendo comprar casillas adyacentes terrestres desde allí.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-zinc-900/40 border border-dashed border-zinc-800 text-center space-y-1.5 py-5">
              <Compass className="w-6 h-6 text-blue-400/60 mx-auto" />
              <p className="text-xs font-bold text-zinc-300">Ningún destino seleccionado</p>
              <p className="text-[11px] text-zinc-500 max-w-xs mx-auto">
                Selecciona una de las costas recomendadas abajo o pulsa &quot;Elegir en Mapa&quot; para trazar tu rumbo.
              </p>
            </div>
          )}
        </div>

        {/* Pie: Botón de Zarpar */}
        <div className="p-5 border-t border-zinc-800 bg-zinc-950 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-400 hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleLaunch}
            disabled={!activeDestId || !activeParams || (!activeParams.isFree && empire.coins < activeParams.coinCost)}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg flex items-center gap-2 ${
              activeDestId && activeParams && (activeParams.isFree || empire.coins >= activeParams.coinCost)
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-600/30 cursor-pointer'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
            }`}
          >
            <span>⛵</span>
            <span>{activeDestId ? 'Zarpar Expedición' : 'Selecciona un destino'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
