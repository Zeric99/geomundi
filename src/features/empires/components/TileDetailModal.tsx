import React, { useState } from 'react';
import { GridTile, UserEmpire, TileRole, IslandSpecialization, CIVIC_PROJECTS_CATALOG, getCountryWonder } from '../types';
import { empireStorageService } from '../services/empireStorageService';
import { geoGridService } from '../services/geoGridService';
import { empireSound } from '../services/empireSoundService';
import { X, MapPin, Coins, Wheat, Edit2, Check, Hammer, Landmark } from 'lucide-react';

interface TileDetailModalProps {
  tile: GridTile;
  empire: UserEmpire;
  onClose: () => void;
  onStartNavalExpedition?: (originTileId: string) => void;
}

const ROLE_LABELS: Record<TileRole, { icon: string; name: string; desc: string }> = {
  empty:      { icon: '🟩', name: 'Terreno Libre',    desc: 'Sin desarrollar' },
  settlement: { icon: '⛺', name: 'Asentamiento',     desc: 'Núcleo de población' },
  crops:      { icon: '🌾', name: 'Campos Agrícolas', desc: '+15 Comida / turno' },
  resources:  { icon: '🌲', name: 'Bosque / Cantera', desc: '+10 Materiales / turno' },
  energy:     { icon: '⚡', name: 'Central Energética', desc: '+10 Energía / turno' },
  port:       { icon: '⚓', name: 'Puerto',            desc: 'Expediciones navales' },
  hotel:      { icon: '🏖️', name: 'Resort Turístico', desc: '+Felicidad' },
  bank:       { icon: '🏦', name: 'Banco Offshore',   desc: '+Ingresos' },
};

const SETTLEMENT_TIERS = ['—', '⛺ Aldea', '🏡 Pueblo', '🏙️ Ciudad', '🌆 Megaciudad'];

export const TileDetailModal: React.FC<TileDetailModalProps> = ({ 
  tile, 
  empire, 
  onClose,
  onStartNavalExpedition 
}) => {
  const isOwned = Boolean(empire.colonizedTiles[tile.id]);
  const ownedData = empire.colonizedTiles[tile.id];

  const adjacentTiles = geoGridService.getAdjacentLandTiles(tile.id);
  const isAdjacentToOwned = adjacentTiles.some(adj => empire.colonizedTiles[adj.id]);
  const cost = empireStorageService.getNextTileCost();

  // Lógica de Islas y Agrupación Insular
  const islandTiles = tile.islandGroupId ? geoGridService.getTilesByIslandGroup(tile.islandGroupId) : [];
  const islandSettlement = islandTiles.find(t => {
    const col = empire.colonizedTiles[t.id];
    return col && (col.role === 'settlement' || (col.settlementTier && col.settlementTier > 0));
  });
  const isSecondaryIslandTile = Boolean(tile.isSmallIsland && islandSettlement && islandSettlement.id !== tile.id);
  const islandSpec = tile.islandGroupId ? empire.islandSpecializations?.[tile.islandGroupId] : null;
  const isNavalHub = islandSpec === 'naval_hub';

  const [isEditingCity, setIsEditingCity] = useState(false);
  const [cityNameInput, setCityNameInput] = useState(ownedData?.cityName || '');
  const [newCityName, setNewCityName] = useState(
    `${tile.countryName || 'Poblado'} ${Object.values(empire.colonizedTiles).filter(t => t.role === 'settlement').length + 1}`
  );
  const [selectedRole, setSelectedRole] = useState<TileRole>(isSecondaryIslandTile ? 'crops' : 'settlement');
  const [islandError, setIslandError] = useState<string | null>(null);
  const [civicError, setCivicError] = useState<string | null>(null);
  const [wonderError, setWonderError] = useState<string | null>(null);
  const [resourceError, setResourceError] = useState<string | null>(null);
  const [annexError, setAnnexError] = useState<string | null>(null);

  const hasCoins = empire.coins >= cost;
  const hasMaterialsForVillage = selectedRole !== 'settlement' || (empire.nationalMaterials >= 15);
  const hasFoodForVillage = selectedRole !== 'settlement' || (empire.nationalFood >= 7);
  const canAfford = hasCoins && hasMaterialsForVillage && hasFoodForVillage;

  const handleBuy = () => {
    if (empireStorageService.buyTile(tile.id, selectedRole, selectedRole === 'settlement' ? newCityName : undefined)) {
      empireSound.playBuild();
      onClose();
    }
  };

  const handleConvertToSettlement = () => {
    if (empireStorageService.convertToSettlement(tile.id)) {
      empireSound.playBuild();
      onClose();
    }
  };

  const handleSaveCityName = () => {
    if (cityNameInput.trim()) empireStorageService.renameCity(tile.id, cityNameInput.trim());
    setIsEditingCity(false);
  };

  const currentRole: TileRole = (ownedData?.role as TileRole) || 'empty';
  const roleInfo = ROLE_LABELS[currentRole] || ROLE_LABELS.empty;
  const isCapital = tile.id === empire.capitalTileId;
  const isSettlement = currentRole === 'settlement';
  const tier = (ownedData?.settlementTier as number) || 0;
  // Si la isla es Hub Naval y es un asentamiento insular, el puerto está automáticamente activo
  const hasPort = Boolean(ownedData?.hasPort) || (isSettlement && isNavalHub);

  // Muelles y expediciones
  const maxDocks = 1;
  const activeExps = (empire.expeditions || []).filter(e => e.status === 'sailing' && e.originTileId === tile.id);
  const docksAvailable = Math.max(0, maxDocks - activeExps.length);

  // Costes y requisitos de mejora por nivel actual
  const UPGRADE_COSTS: Record<number, number> = { 1: 30, 2: 80, 3: 200 };
  const upgradeCost = UPGRADE_COSTS[tier] ?? null;
  const upgradeCheck = isSettlement && tier < 4
    ? empireStorageService.checkUpgradeRequirements(tile.id)
    : null;
  const canUpgrade = Boolean(upgradeCheck?.canUpgrade);
  const canBuildPort = isSettlement && tier >= 3 && tile.isCoast && !hasPort && empire.coins >= 50;

  // Calcular recursos dentro del radio de influencia (Mecánica Buscaminas Fase 3)
  const nearbyResources = React.useMemo(() => {
    if (!isSettlement) return { crops: 0, resources: 0, radius: 1 };
    const radius = tier === 1 ? 1 : tier === 2 ? 2 : 3;
    let cropsCount = 0;
    let resCount = 0;

    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        if (dx === 0 && dy === 0) continue;
        const adjTile = geoGridService.getTileByXY(tile.x + dx, tile.y + dy);
        if (adjTile && empire.colonizedTiles[adjTile.id]) {
          const role = empire.colonizedTiles[adjTile.id]?.role;
          if (role === 'crops') cropsCount++;
          if (role === 'resources') resCount++;
        }
      }
    }
    return { crops: cropsCount, resources: resCount, radius };
  }, [tile.x, tile.y, isSettlement, tier, empire.colonizedTiles]);

  const handleUpgrade = () => {
    const nextTier = (tier || 1) + 1;
    if (empireStorageService.upgradeSettlement(tile.id)) {
      if (nextTier >= 4) {
        empireSound.playMegacityFanfare();
      } else {
        empireSound.playUpgrade();
      }
    }
  };

  const handleBuildPort = () => {
    if (empireStorageService.buildPort(tile.id)) {
      empireSound.playBuild();
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-zinc-950/95 overflow-hidden select-none">
      {/* Cabecera de la Casilla */}
      <div className="p-3.5 bg-gradient-to-r from-indigo-950/40 via-zinc-900/70 to-zinc-950 border-b border-zinc-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-black text-white truncate">
              {isSettlement && ownedData?.cityName ? ownedData.cityName : (tile.countryName || 'Territorio')}
            </h3>
            <span className="text-[10.5px] text-zinc-400 font-mono block truncate">
              {tile.lat.toFixed(1)}°, {tile.lon.toFixed(1)}°
              {tile.isCoast ? ' · 🌊 Costa' : ''}
              {tile.isSmallIsland ? ' · 🏝️ Isla' : ''}
            </span>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors shrink-0"
          title="Cerrar detalle de casilla"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Contenido con scroll vertical propio */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3.5 space-y-3.5 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
        {isOwned ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-zinc-800/80 p-2.5 rounded-xl border border-zinc-700/50">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{roleInfo.icon}</span>
                <div>
                  {isSettlement ? (
                    isEditingCity ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={cityNameInput}
                          onChange={e => setCityNameInput(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') handleSaveCityName(); }}
                          className="bg-zinc-700 text-xs px-2 py-0.5 rounded text-white font-bold w-32 focus:outline-none"
                          autoFocus
                        />
                        <button onClick={handleSaveCityName} className="p-0.5 text-emerald-400">
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 group cursor-pointer" onClick={() => setIsEditingCity(true)}>
                        <span className="text-xs font-bold text-white">{ownedData?.cityName || 'Sin nombre'}</span>
                        <Edit2 className="w-3 h-3 text-zinc-500 group-hover:text-zinc-300" />
                      </div>
                    )
                  ) : (
                    <span className="text-xs font-bold text-white">{roleInfo.name}</span>
                  )}
                  <span className="text-[10px] text-zinc-400 block">{roleInfo.desc}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                {isCapital && (
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    ⭐ Capital
                  </span>
                )}
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Colonizada
                </span>
              </div>
            </div>

            {/* ─── Panel de Asentamiento ─── */}
            {isSettlement && (
              <div className="bg-zinc-800/50 rounded-xl border border-zinc-700/40 p-3 space-y-3">
                {/* Nivel actual */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">Nivel</span>
                  <span className="text-sm font-bold text-indigo-300">{SETTLEMENT_TIERS[tier] || SETTLEMENT_TIERS[1]}</span>
                </div>

                {/* Barra de progresión visual */}
                <div className="flex items-center gap-1">
                  {[1,2,3,4].map(t => (
                    <div
                      key={t}
                      className={`flex-1 h-1.5 rounded-full transition-all ${
                        t <= tier ? 'bg-indigo-500' : 'bg-zinc-700'
                      }`}
                    />
                  ))}
                </div>

                {/* Balance Espacial en su Radio (Mecánica Buscaminas Fase 3) */}
                <div className="bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-700/50 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1">
                      <span>🎯 Radio de Influencia:</span>
                      <span className="text-indigo-400 font-mono">Radio {nearbyResources.radius}</span>
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-zinc-800/80 p-1.5 rounded-lg border border-zinc-700/50 flex items-center gap-1.5">
                      <span>🌾</span>
                      <div>
                        <span className="font-bold text-emerald-400 font-mono">{nearbyResources.crops}</span>
                        <span className="text-[10px] text-zinc-400 block">+{nearbyResources.crops * 15} comida</span>
                      </div>
                    </div>
                    <div className="bg-zinc-800/80 p-1.5 rounded-lg border border-zinc-700/50 flex items-center gap-1.5">
                      <span>🌲</span>
                      <div>
                        <span className="font-bold text-amber-400 font-mono">{nearbyResources.resources}</span>
                        <span className="text-[10px] text-zinc-400 block">+{nearbyResources.resources * 10} piedra</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Puerto construido */}
                {hasPort && (
                  <div className="bg-blue-950/40 border border-blue-500/30 rounded-xl p-3 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">⚓</span>
                        <div>
                          <p className="text-xs font-bold text-blue-300">Puerto Marítimo Activo</p>
                          <p className="text-[10px] text-zinc-400">
                            {isNavalHub ? 'Hub Naval (3 muelles simultáneos)' : 'Muelle comercial y de ultramar'}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 font-bold">
                        {docksAvailable} / {maxDocks} libres
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-blue-200 bg-blue-900/30 px-2.5 py-1.5 rounded-lg border border-blue-500/20">
                      <span>Rango Náutico:</span>
                      <span className="font-bold font-mono text-blue-300">
                        {isFinite(empireStorageService.getMaxNavalRange(tile.id))
                          ? `${empireStorageService.getMaxNavalRange(tile.id)} casillas`
                          : 'Ilimitado 🌐'}
                      </span>
                    </div>

                    {(empire.freeExpeditions || 0) > 0 && (
                      <div className="text-[10px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 px-2 py-1 rounded-lg font-bold flex items-center gap-1.5">
                        <span>🎁</span>
                        <span>¡Expedición gratis disponible ({empire.freeExpeditions}) por Hub Naval!</span>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        if (onStartNavalExpedition) {
                          onStartNavalExpedition(tile.id);
                          onClose();
                        }
                      }}
                      disabled={docksAvailable <= 0}
                      className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
                        docksAvailable > 0
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-600/20 cursor-pointer'
                          : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                      }`}
                    >
                      <span>⛵</span>
                      <span>
                        {docksAvailable > 0 
                          ? ((empire.freeExpeditions || 0) > 0 ? 'Fletar Expedición (¡GRATIS!)' : 'Fletar Expedición Marítima') 
                          : 'Muelle Ocupado (Barco Navegando)'}
                      </span>
                    </button>
                  </div>
                )}

                {/* Puerto disponible para construir */}
                {!hasPort && tile.isCoast && tier >= 3 && (
                  <button
                    onClick={handleBuildPort}
                    disabled={!canBuildPort}
                    className={`w-full py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                      canBuildPort
                        ? 'bg-blue-600/80 hover:bg-blue-500/80 text-white border border-blue-500/50'
                        : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                    }`}
                  >
                    <span>⚓</span>
                    <span>Construir Puerto — 50 monedas</span>
                  </button>
                )}

                {/* Indicador de cuántos pasos faltan para el puerto */}
                {!hasPort && tile.isCoast && tier < 3 && (
                  <div className="flex items-center gap-2 bg-zinc-900/50 border border-zinc-700/50 rounded-lg px-3 py-2">
                    <span className="text-base opacity-40">⚓</span>
                    <div>
                      <p className="text-xs font-bold text-zinc-500">Puerto bloqueado</p>
                      <p className="text-[10px] text-zinc-600">
                        Mejora a 🏙️ Ciudad ({3 - tier} nivel{3 - tier > 1 ? 'es' : ''} más) para desbloquear el Puerto
                      </p>
                    </div>
                  </div>
                )}

                {/* Monumentos y Proyectos Cívicos */}
                <div className="bg-zinc-900/80 p-3 rounded-xl border border-purple-500/30 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300">
                      <Landmark className="w-3.5 h-3.5 text-purple-400" />
                      <span>Monumentos Urbanos</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-purple-500/15 text-purple-300 px-2 py-0.5 rounded border border-purple-500/25">
                      {(ownedData?.civicProjects || []).length} / {tier} slots
                    </span>
                  </div>

                  {civicError && (
                    <div className="p-1.5 bg-amber-500/15 border border-amber-500/30 rounded-lg text-[10px] text-amber-300">
                      ⚠️ {civicError}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    {CIVIC_PROJECTS_CATALOG.map(proj => {
                      const builtProjects = ownedData?.civicProjects || [];
                      const isBuilt = builtProjects.includes(proj.id);
                      const meetsTier = tier >= proj.minTier;
                      const hasSlot = builtProjects.length < tier;
                      const canAffordProj = empire.coins >= proj.coinCost && empire.nationalMaterials >= proj.materialCost;
                      const canBuild = !isBuilt && meetsTier && hasSlot && canAffordProj;

                      return (
                        <div
                          key={proj.id}
                          className={`p-2 rounded-lg border text-xs flex items-center justify-between gap-2 transition-all ${
                            isBuilt
                              ? 'bg-purple-950/30 border-purple-500/40 text-purple-200'
                              : meetsTier && hasSlot
                              ? 'bg-zinc-800/80 border-zinc-700/60 text-zinc-300'
                              : 'bg-zinc-900/40 border-zinc-800/60 text-zinc-500 opacity-60'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-base shrink-0">{proj.icon}</span>
                            <div className="min-w-0">
                              <p className="text-[11px] font-bold truncate leading-tight">{proj.name}</p>
                              <p className="text-[9px] text-zinc-400">
                                +{proj.happinessBonus}% Felicidad · {proj.coinCost}🪙 {proj.materialCost}🧱
                              </p>
                            </div>
                          </div>

                          <div className="shrink-0">
                            {isBuilt ? (
                              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                ✓ Activo
                              </span>
                            ) : !meetsTier ? (
                              <span className="text-[9px] text-zinc-500 font-mono">
                                Nivel {proj.minTier}+
                              </span>
                            ) : !hasSlot ? (
                              <span className="text-[9px] text-zinc-500">
                                Sin slots
                              </span>
                            ) : (
                              <button
                                onClick={() => {
                                  const res = empireStorageService.buildCivicProject(tile.id, proj.id);
                                  if (!res.success) {
                                    setCivicError(res.error || 'Error al construir monumento');
                                  } else {
                                    setCivicError(null);
                                  }
                                }}
                                disabled={!canBuild}
                                className={`text-[10px] font-bold px-2.5 py-1 rounded transition-all ${
                                  canBuild
                                    ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-sm cursor-pointer'
                                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                                }`}
                              >
                                Erigir
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Requisitos para subir de nivel (Mecánica Buscaminas Fase 3 y Megaciudad) */}
                {tier < 4 && upgradeCheck && (
                  <div className="bg-zinc-900/80 p-2.5 rounded-xl border border-zinc-700/60 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-zinc-300">
                      <span>Requisitos para {SETTLEMENT_TIERS[tier + 1]}:</span>
                      <span className="text-[10px] text-amber-400 font-mono bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                        Radio {upgradeCheck.radius}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      {/* Monedas */}
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-400 flex items-center gap-1 text-[11px]">
                          <Coins className="w-3 h-3 text-amber-400" />
                          Tesoro Imperial:
                        </span>
                        <span className={`font-mono font-bold text-[11px] ${upgradeCheck.hasEnoughCoins ? 'text-emerald-400' : 'text-red-400'}`}>
                          {empire.coins} / {upgradeCheck.coinCost} 🪙 {upgradeCheck.hasEnoughCoins ? '✓' : '✗'}
                        </span>
                      </div>

                      {/* Materiales */}
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-400 flex items-center gap-1 text-[11px]">
                          <Hammer className="w-3 h-3 text-amber-500" />
                          Materiales de Construcción:
                        </span>
                        <span className={`font-mono font-bold text-[11px] ${upgradeCheck.hasEnoughMaterials ? 'text-emerald-400' : 'text-red-400'}`}>
                          {empire.nationalMaterials} / {upgradeCheck.materialCost} 🧱 {upgradeCheck.hasEnoughMaterials ? '✓' : '✗'}
                        </span>
                      </div>

                      {/* Comida */}
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-400 flex items-center gap-1 text-[11px]">
                          <Wheat className="w-3 h-3 text-emerald-400" />
                          Superávit de Comida requerido:
                        </span>
                        <span className={`font-mono font-bold text-[11px] ${upgradeCheck.hasEnoughFoodSurplus ? 'text-emerald-400' : 'text-red-400'}`}>
                          +{empire.nationalFood} / +{upgradeCheck.requiredFoodSurplus} 🌾 {upgradeCheck.hasEnoughFoodSurplus ? '✓' : '✗'}
                        </span>
                      </div>

                      {/* Huertos */}
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-400 flex items-center gap-1 text-[11px]">
                          <span>🌾</span>
                          Huertos en radio {upgradeCheck.radius}:
                        </span>
                        <span className={`font-mono font-bold text-[11px] ${upgradeCheck.hasEnoughCrops ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {upgradeCheck.currentCrops} / {upgradeCheck.requiredCrops} {upgradeCheck.hasEnoughCrops ? '✓' : '✗'}
                        </span>
                      </div>

                      {/* Canteras */}
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-400 flex items-center gap-1 text-[11px]">
                          <span>🌲</span>
                          Canteras en radio {upgradeCheck.radius}:
                        </span>
                        <span className={`font-mono font-bold text-[11px] ${upgradeCheck.hasEnoughResources ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {upgradeCheck.currentResources} / {upgradeCheck.requiredResources} {upgradeCheck.hasEnoughResources ? '✓' : '✗'}
                        </span>
                      </div>

                      {/* Asentamientos vecinos si aplica */}
                      {upgradeCheck.requiredSettlements > 0 && upgradeCheck.nextTier < 4 && (
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-400 flex items-center gap-1 text-[11px]">
                            <span>🏘️</span>
                            Pueblos en radio {upgradeCheck.radius}:
                          </span>
                          <span className={`font-mono font-bold text-[11px] ${upgradeCheck.hasEnoughSettlements ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {upgradeCheck.currentSettlements} / {upgradeCheck.requiredSettlements} {upgradeCheck.hasEnoughSettlements ? '✓' : '✗'}
                          </span>
                        </div>
                      )}

                      {/* Requisitos exclusivos de Megaciudad (Tier 4) */}
                      {upgradeCheck.nextTier === 4 && (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-zinc-400 flex items-center gap-1 text-[11px]">
                              <span>🏙️</span>
                              Ciudades satélite (Tier ≥ 3):
                            </span>
                            <span className={`font-mono font-bold text-[11px] ${upgradeCheck.hasEnoughSurroundingCities ? 'text-emerald-400' : 'text-red-400'}`}>
                              {upgradeCheck.currentSurroundingCities} / {upgradeCheck.requiredSurroundingCities} {upgradeCheck.hasEnoughSurroundingCities ? '✓' : '✗'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-zinc-400 flex items-center gap-1 text-[11px]">
                              <span>📐</span>
                              Separación Megaciudades (≥5):
                            </span>
                            <span className={`font-mono font-bold text-[11px] ${upgradeCheck.hasMegacityDistanceCheck ? 'text-emerald-400' : 'text-red-400'}`}>
                              {upgradeCheck.hasMegacityDistanceCheck ? 'Despejado ✓' : 'Muy cerca ✗'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-zinc-400 flex items-center gap-1 text-[11px]">
                              <span>👑</span>
                              Megaciudad única en {tile.countryName || 'país'}:
                            </span>
                            <span className={`font-mono font-bold text-[11px] ${upgradeCheck.hasSingleMegacityPerCountry ? 'text-emerald-400' : 'text-red-400'}`}>
                              {upgradeCheck.hasSingleMegacityPerCountry ? 'Disponible (0/1) ✓' : 'Ya existe una (1/1) ✗'}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Botón de mejora */}
                {tier < 4 && upgradeCheck && (
                  <button
                    onClick={handleUpgrade}
                    disabled={!canUpgrade}
                    className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                      canUpgrade
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-lg shadow-indigo-600/30'
                        : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                    }`}
                  >
                    <span>⬆️</span>
                    <span>
                      {canUpgrade
                        ? `Mejorar a ${SETTLEMENT_TIERS[tier + 1]} — ${upgradeCheck.coinCost} 🪙 + ${upgradeCheck.materialCost} 🧱`
                        : `Faltan requisitos para ${SETTLEMENT_TIERS[tier + 1]}`}
                    </span>
                  </button>
                )}

                {/* Sección de Megaciudad y Maravilla Nacional */}
                {tier >= 4 && (
                  <div className="bg-gradient-to-b from-amber-500/10 via-zinc-900/90 to-zinc-900/90 rounded-2xl border border-amber-500/30 p-3.5 space-y-3 shadow-lg shadow-amber-500/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🏆</span>
                        <div>
                          <p className="text-xs font-bold text-amber-300">Maravilla Nacional</p>
                          <p className="text-[10px] text-zinc-400">Patrimonio exclusivo de {tile.countryName || 'este país'}</p>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold font-mono">
                        {ownedData?.nationalWonderBuilt ? 'Erigida ✓' : 'Disponible'}
                      </span>
                    </div>

                    {(() => {
                      const wonder = getCountryWonder(tile.countryCode, tile.countryName);
                      const isBuilt = Boolean(ownedData?.nationalWonderBuilt);
                      const countryCode = tile.countryCode || '';
                      const isCountryAnnexed = (empire.annexedCountries || []).includes(countryCode);
                      const annexStatus = empireStorageService.getCountryAnnexationStatus(countryCode);
                      const canAffordWonder = empire.coins >= wonder.coinCost && empire.nationalMaterials >= wonder.materialCost;

                      return (
                        <div className="space-y-2.5">
                          <div className="bg-zinc-800/80 p-2.5 rounded-xl border border-zinc-700/60 flex items-center gap-3">
                            <span className="text-2xl shrink-0 p-1.5 bg-amber-500/10 rounded-lg border border-amber-500/20">
                              {wonder.icon}
                            </span>
                            <div className="min-w-0 flex-1">
                              <h4 className="text-xs font-bold text-white leading-tight">{wonder.name}</h4>
                              <p className="text-[9px] text-zinc-400 leading-snug mt-0.5">{wonder.description}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] font-bold text-emerald-400 font-mono">
                                  +{wonder.happinessBonus}% Felicidad Imperial
                                </span>
                                <span className="text-[10px] text-zinc-500 font-mono">
                                  · {wonder.coinCost}🪙 {wonder.materialCost}🧱
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Requisito de Anexión Soberana al 90%+ */}
                          {!isCountryAnnexed ? (
                            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2">
                              <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                                <span className="flex items-center gap-1.5">
                                  <span>👑</span>
                                  <span>Reclamación de Soberanía Requerida</span>
                                </span>
                                <span className="font-mono text-[11px]">
                                  {annexStatus.percentage}% / 90%
                                </span>
                              </div>
                              <p className="text-[10px] text-zinc-300 leading-relaxed">
                                Para erigir la Gran Maravilla de {tile.countryName || 'este país'}, primero debes anexionar formalmente el territorio nacional conquistando al menos el 90% de sus casillas geográficas.
                              </p>

                              {/* Barra de progreso */}
                              <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden border border-zinc-700">
                                <div 
                                  className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-300"
                                  style={{ width: `${Math.min(100, (annexStatus.percentage / 90) * 100)}%` }}
                                />
                              </div>
                              <div className="flex justify-between text-[9px] text-zinc-400 font-mono">
                                <span>Control: {annexStatus.ownedCount} / {annexStatus.totalCount} casillas</span>
                                <span>{annexStatus.canAnnex ? '¡Territorio Listo!' : `Faltan ${Math.max(0, Math.ceil(annexStatus.totalCount * 0.9) - annexStatus.ownedCount)} casillas`}</span>
                              </div>

                              {annexError && (
                                <div className="p-1.5 bg-red-500/15 border border-red-500/30 rounded text-[10px] text-red-300">
                                  ⚠️ {annexError}
                                </div>
                              )}

                              {annexStatus.canAnnex && (
                                <button
                                  onClick={() => {
                                    const res = empireStorageService.annexCountry(countryCode);
                                    if (!res.success) setAnnexError(res.error || 'Error al anexionar');
                                    else setAnnexError(null);
                                  }}
                                  className="w-full mt-1 py-2 px-3 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 cursor-pointer transition-all"
                                >
                                  <span>👑</span>
                                  <span>Proclamar Anexión Soberana y Sello Oficial</span>
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between text-emerald-400 text-xs font-bold">
                                <span className="flex items-center gap-1.5">
                                  <span>👑</span>
                                  <span>País Anexionado Soberanamente</span>
                                </span>
                                <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30 font-mono">
                                  Sello Oficial ✓
                                </span>
                              </div>

                              {wonderError && (
                                <div className="p-2 bg-amber-500/15 border border-amber-500/30 rounded-lg text-[10px] text-amber-300">
                                  ⚠️ {wonderError}
                                </div>
                              )}

                              {isBuilt ? (
                                <div className="w-full py-2 px-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold text-xs flex items-center justify-center gap-2">
                                  <span>✨</span>
                                  <span>{wonder.name} Erigida (+{wonder.happinessBonus}% Felicidad Activa)</span>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    const res = empireStorageService.buildNationalWonder(tile.id);
                                    if (!res.success) {
                                      setWonderError(res.error || 'Error al erigir maravilla');
                                    } else {
                                      setWonderError(null);
                                      empireSound.playMegacityFanfare();
                                    }
                                  }}
                                  disabled={!canAffordWonder}
                                  className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
                                    canAffordWonder
                                      ? 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white shadow-amber-600/30 cursor-pointer'
                                      : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                                  }`}
                                >
                                  <span>🏛️</span>
                                  <span>
                                    {canAffordWonder
                                      ? `Erigir ${wonder.name} — ${wonder.coinCost} 🪙 + ${wonder.materialCost} 🧱`
                                      : `Faltan recursos (${wonder.coinCost}🪙, ${wonder.materialCost}🧱)`}
                                  </span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}

            {/* Si no es asentamiento (huerto, cantera o tierra libre) */}
            {!isSettlement && (
              <div className="bg-zinc-800/50 rounded-xl border border-zinc-700/40 p-3 space-y-3">
                {/* Cabecera del recurso con su nivel actual */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{currentRole === 'crops' ? '🌾' : currentRole === 'resources' ? '🌲' : '🗺️'}</span>
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        {currentRole === 'crops' ? 'Huerto Agrícola' : currentRole === 'resources' ? 'Cantera de Materiales' : roleInfo.name}
                        {(currentRole === 'crops' || currentRole === 'resources') && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-700 text-amber-300 font-bold border border-zinc-600">
                            Nivel {ownedData?.resourceTier || 1} / 3
                          </span>
                        )}
                      </h4>
                      <p className="text-[10px] text-zinc-400">
                        {currentRole === 'crops'
                          ? (ownedData?.resourceTier === 3
                              ? 'Complejo Hidropónico (+75 🌾 comida)'
                              : ownedData?.resourceTier === 2
                              ? 'Invernaderos y Riego (+35 🌾 comida)'
                              : 'Huerto Tradicional (+15 🌾 comida)')
                          : currentRole === 'resources'
                          ? (ownedData?.resourceTier === 3
                              ? 'Complejo Industrial Minero (+75 🧱 fijos extra)'
                              : ownedData?.resourceTier === 2
                              ? 'Mina Mecanizada (+35 🧱 fijos extra)'
                              : 'Aserradero y Cantera (+20 🧱 fijos)')
                          : roleInfo.desc}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tarjeta de Mejora de Nivel para Huerto o Cantera (Nivel 1 -> 2 -> 3) */}
                {(currentRole === 'crops' || currentRole === 'resources') && (() => {
                  const check = empireStorageService.checkResourceUpgradeRequirements(tile.id);
                  const rTier = ownedData?.resourceTier || 1;
                  const isMax = rTier >= 3;
                  const nextRTier = rTier + 1;
                  const upgradeCost = check?.coinCost || (currentRole === 'crops'
                    ? (nextRTier === 2 ? 25 : 60)
                    : (nextRTier === 2 ? 30 : 75));
                  const nextBenefit = currentRole === 'crops'
                    ? (nextRTier === 2 ? '+35 🌾 (+20 extra)' : '+75 🌾 (+40 extra)')
                    : (nextRTier === 2 ? '+35 🧱 fijos extra' : '+75 🧱 fijos extra');
                  const nextTitle = currentRole === 'crops'
                    ? (nextRTier === 2 ? 'Invernaderos y Riego' : 'Complejo Hidropónico')
                    : (nextRTier === 2 ? 'Mina Mecanizada' : 'Complejo Industrial');
                  
                  const sameTypeCount = check?.sameTypeNeighbors ?? 0;
                  const requiredCount = check?.requiredNeighbors ?? (nextRTier === 2 ? 2 : 8);
                  const hasNeighbors = check?.hasRequiredNeighbors ?? false;
                  const hasCoins = check?.hasEnoughCoins ?? (empire.coins >= upgradeCost);
                  const canUpgrade = Boolean(check?.canUpgrade);
                  const roleNamePlural = currentRole === 'crops' ? 'huertos' : 'bosques';
                  const roleIcon = currentRole === 'crops' ? '🌾' : '🌲';

                  return (
                    <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-700/70 space-y-2.5 shadow-inner">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-zinc-200 flex items-center gap-1.5">
                          <span>⬆️</span>
                          <span>{isMax ? 'Nivel Máximo de Rendimiento' : `Mejora a Nivel ${nextRTier}: ${nextTitle}`}</span>
                        </span>
                        {!isMax && (
                          <span className="font-mono text-emerald-400 font-bold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                            {nextBenefit}
                          </span>
                        )}
                      </div>

                      {/* Requisitos Espaciales y Económicos */}
                      {!isMax && (
                        <div className="space-y-1.5 bg-black/40 p-2.5 rounded-lg border border-zinc-800 text-[11px]">
                          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                            <span>📋 Requisitos para Nivel {nextRTier}:</span>
                          </div>

                          {/* Requisito de Monedas */}
                          <div className="flex items-center justify-between">
                            <span className="text-zinc-300 flex items-center gap-1.5">
                              <span>🪙</span>
                              <span>Coste de mejora:</span>
                            </span>
                            <div className="flex items-center gap-1.5 font-mono">
                              <span className={hasCoins ? 'text-zinc-200' : 'text-red-400'}>
                                {empire.coins} / {upgradeCost} 🪙
                              </span>
                              <span className={hasCoins ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                                {hasCoins ? '✓' : '✗'}
                              </span>
                            </div>
                          </div>

                          {/* Requisito Espacial: Nivel 2 (2 vecinos) o Nivel 3 (todo el 3x3) */}
                          <div className="space-y-0.5 pt-1 border-t border-zinc-800/80">
                            <div className="flex items-center justify-between">
                              <span className="text-zinc-300 flex items-center gap-1.5">
                                <span>{roleIcon}</span>
                                <span>
                                  {nextRTier === 2
                                    ? `Vecinos contiguos (${roleNamePlural}):`
                                    : `Centro de gran bosque/campo 3x3:`}
                                </span>
                              </span>
                              <div className="flex items-center gap-1.5 font-mono">
                                <span className={hasNeighbors ? 'text-zinc-200' : 'text-amber-400'}>
                                  {sameTypeCount} / {requiredCount}
                                </span>
                                <span className={hasNeighbors ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                                  {hasNeighbors ? '✓' : '✗'}
                                </span>
                              </div>
                            </div>
                            <p className="text-[9.5px] text-zinc-500 pl-5">
                              {nextRTier === 2
                                ? `Requiere al menos 2 ${roleNamePlural} a su alrededor.`
                                : `Las 8 casillas del 3x3 de alrededor deben ser ${roleNamePlural}.`}
                            </p>
                          </div>
                        </div>
                      )}

                      {resourceError && (
                        <div className="p-2 bg-red-500/15 border border-red-500/30 rounded-lg text-[10.5px] text-red-300 flex items-start gap-1.5">
                          <span>⚠️</span>
                          <span>{resourceError}</span>
                        </div>
                      )}

                      {isMax ? (
                        <div className="w-full py-2 text-center text-amber-300 font-bold text-xs bg-amber-500/10 rounded-lg border border-amber-500/30 font-mono flex items-center justify-center gap-1.5">
                          <span>⭐</span>
                          <span>Máxima Eficiencia Alcanzada (Nivel 3)</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            const res = empireStorageService.upgradeResourceTile(tile.id);
                            if (!res.success) {
                              setResourceError(res.error || 'Error al mejorar');
                            } else {
                              setResourceError(null);
                              empireSound.playUpgrade();
                            }
                          }}
                          disabled={!canUpgrade}
                          className={`w-full py-2.5 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md ${
                            canUpgrade
                              ? 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white cursor-pointer shadow-amber-600/20 active:scale-[0.99]'
                              : 'bg-zinc-800/90 text-zinc-500 cursor-not-allowed border border-zinc-700/60'
                          }`}
                        >
                          <span>⬆️</span>
                          <span>
                            {canUpgrade
                              ? `Mejorar a Nivel ${nextRTier} — ${upgradeCost} 🪙`
                              : !hasNeighbors
                              ? (nextRTier === 2
                                  ? `Faltan vecinos contiguos (${sameTypeCount}/2)`
                                  : `Requiere centro 3x3 completo (${sameTypeCount}/8)`)
                              : `Faltan monedas (${empire.coins}/${upgradeCost} 🪙)`}
                          </span>
                        </button>
                      )}
                    </div>
                  );
                })()}

                {/* Reconvertir función de la casilla */}
                <div className="pt-0.5">
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Reconvertir función de esta casilla:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => empireStorageService.convertTileRole(tile.id, 'crops')}
                      disabled={currentRole === 'crops'}
                      className={`py-2 px-2.5 rounded-lg border text-center text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        currentRole === 'crops'
                          ? 'border-yellow-500 bg-yellow-500/20 text-yellow-300 ring-1 ring-yellow-500/30'
                          : 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-700/50 cursor-pointer'
                      }`}
                    >
                      <span>🌾</span>
                      <span>Huerto (Niv 1: +15)</span>
                    </button>
                    <button
                      onClick={() => empireStorageService.convertTileRole(tile.id, 'resources')}
                      disabled={currentRole === 'resources'}
                      className={`py-2 px-2.5 rounded-lg border text-center text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        currentRole === 'resources'
                          ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30'
                          : 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-700/50 cursor-pointer'
                      }`}
                    >
                      <span>🌲</span>
                      <span>Cantera (Niv 1: +20 🧱)</span>
                    </button>
                  </div>
                </div>

                {!isSecondaryIslandTile && (
                  <div className="pt-1.5 border-t border-zinc-700/50 space-y-1.5">
                    {empire.nationalFood < 7 && (
                      <p className="text-[10px] text-amber-400 font-medium">
                        ⚠️ Déficit de comida (+{empire.nationalFood}/7 🌾): Necesitas al menos +7 de superávit para alimentar a una nueva población.
                      </p>
                    )}
                    <button
                      onClick={handleConvertToSettlement}
                      disabled={empire.coins < 20 || empire.nationalMaterials < 15 || empire.nationalFood < 7}
                      className={`w-full py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                        empire.coins >= 20 && empire.nationalMaterials >= 15 && empire.nationalFood >= 7
                          ? 'bg-indigo-600/80 hover:bg-indigo-500/80 text-white border border-indigo-500/50 cursor-pointer'
                          : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                      }`}
                    >
                      <span>⛺</span>
                      <span>Fundar Poblado aquí — 20 🪙 + 15 🧱 (+7🌾)</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Especialización de Isla Pequeña (GDD Fase 4 con restricciones de distancia 7x7 y cupos) */}
            {tile.isSmallIsland && tile.islandGroupId && (
              isSecondaryIslandTile ? (
                <div className="bg-zinc-900/80 rounded-xl border border-emerald-500/30 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                      <span>🏝️</span>
                      <span>Isla Especializada</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-mono">
                      {islandSpec === 'naval_hub'
                        ? '⚓ Hub Naval'
                        : islandSpec === 'tourist_resort'
                        ? '🏖️ Resort'
                        : islandSpec === 'fiscal_paradise'
                        ? '🏦 Banco'
                        : 'Sin especializar'}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400 leading-relaxed">
                    Toda la isla comparte esta misma especialización activa en su capital. Esta casilla secundaria sirve de apoyo agrícola (🌾 Huerto) o de extracción (🌲 Cantera).
                  </p>
                </div>
              ) : (
                <div className="bg-zinc-900/80 rounded-xl border border-emerald-500/30 p-3 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                      <span>🏝️</span>
                      <span>Especialización Insular:</span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono">
                      Microisla
                    </span>
                  </div>

                  <p className="text-[10px] text-zinc-400">
                    Cupo de {empireStorageService.getIslandSpecializationLimits().maxAllowed} por especialización (siguiente hito a los {empireStorageService.getIslandSpecializationLimits().nextPopRequired.toLocaleString()} hab.) y separación mínima de 7x7 con otras islas:
                  </p>

                  {islandError && (
                    <div className="p-2 bg-amber-500/15 border border-amber-500/30 rounded-xl text-[10px] text-amber-300 font-medium">
                      ⚠️ {islandError}
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                    {[
                      { key: 'tourist_resort' as IslandSpecialization, label: 'Resort 🏖️', desc: '+40 🪙/día pasivos' },
                      { key: 'fiscal_paradise' as IslandSpecialization, label: 'Banco 🏦', desc: '+15% oro en duelos' },
                      { key: 'naval_hub' as IslandSpecialization, label: 'Hub Naval ⚓', desc: 'Barco gratis + escala' },
                    ].map(spec => {
                      const isCurrent = islandSpec === spec.key;
                      const limits = empireStorageService.getIslandSpecializationLimits();
                      const count = limits.counts[spec.key] || 0;

                      return (
                        <button
                          key={spec.key}
                          onClick={() => {
                            const res = empireStorageService.setIslandSpecialization(tile.islandGroupId!, spec.key);
                            if (!res.success) {
                              setIslandError(res.error || 'No se puede especializar');
                            } else {
                              setIslandError(null);
                            }
                          }}
                          className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-between min-h-[66px] ${
                            isCurrent
                              ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-400/40'
                              : 'bg-zinc-800/60 border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
                          }`}
                        >
                          <div>
                            <span className="text-[11px] font-bold block">{spec.label}</span>
                            <span className="text-[8px] text-zinc-400 block mt-0.5 leading-tight">{spec.desc}</span>
                          </div>
                          <span className={`text-[8px] font-mono px-1 py-0.5 rounded mt-1 ${
                            isCurrent ? 'bg-emerald-400/20 text-emerald-300 font-bold' : 'text-zinc-500'
                          }`}>
                            {count} / {limits.maxAllowed}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {isAdjacentToOwned ? (
              <>
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-zinc-300">Coste de Anexión:</span>
                  <div className="flex items-center gap-1 text-amber-400">
                    <Coins className="w-4 h-4" />
                    <span className="font-mono text-sm">{cost} monedas</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                    ¿Qué deseas construir aquí?
                  </label>
                  <div className={`grid ${isSecondaryIslandTile ? 'grid-cols-2' : 'grid-cols-3'} gap-1.5`}>
                    {/* Opción 1: Poblado / Asentamiento (oculto si la isla ya tiene capital insular) */}
                    {!isSecondaryIslandTile && (
                      <button
                        type="button"
                        onClick={() => setSelectedRole('settlement')}
                        className={`p-2 rounded-lg border text-center transition-all ${
                          selectedRole === 'settlement'
                            ? 'border-slate-400 bg-slate-500/25 text-white shadow-sm ring-1 ring-slate-400/30'
                            : 'border-zinc-700 bg-zinc-800/60 text-zinc-400 hover:border-zinc-600'
                        }`}
                      >
                        <span className="text-base block mb-0.5">⛺</span>
                        <span className="text-[10px] font-bold block">Poblado</span>
                        <span className="text-[9px] text-zinc-400">+15 Pob (15 🧱)</span>
                      </button>
                    )}

                    {/* Opción 2: Huerto */}
                    <button
                      type="button"
                      onClick={() => setSelectedRole('crops')}
                      className={`p-2 rounded-lg border text-center transition-all ${
                        selectedRole === 'crops'
                          ? 'border-yellow-500 bg-yellow-500/20 text-white shadow-sm ring-1 ring-yellow-500/30'
                          : 'border-zinc-700 bg-zinc-800/60 text-zinc-400 hover:border-zinc-600'
                      }`}
                    >
                      <Wheat className="w-4 h-4 mx-auto mb-1 text-yellow-400" />
                      <span className="text-[10px] font-bold block">Huerto</span>
                      <span className="text-[9px] text-yellow-400 font-medium">+15 🌾 (0 🧱)</span>
                    </button>

                    {/* Opción 3: Cantera */}
                    <button
                      type="button"
                      onClick={() => setSelectedRole('resources')}
                      className={`p-2 rounded-lg border text-center transition-all ${
                        selectedRole === 'resources'
                          ? 'border-emerald-500 bg-emerald-500/20 text-white shadow-sm ring-1 ring-emerald-500/30'
                          : 'border-zinc-700 bg-zinc-800/60 text-zinc-400 hover:border-zinc-600'
                      }`}
                    >
                      <span className="text-base block mb-0.5">🌲</span>
                      <span className="text-[10px] font-bold block">Cantera</span>
                      <span className="text-[9px] text-emerald-400 font-medium">+20 🧱 fijos (0 🧱)</span>
                    </button>
                  </div>

                  {/* Input de nombre de ciudad cuando se elige Poblado */}
                  {selectedRole === 'settlement' && (
                    <div className="mt-2.5 p-2.5 bg-zinc-800/80 border border-zinc-700/60 rounded-xl space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-300 block">
                        Nombre del nuevo poblado:
                      </label>
                      <input
                        type="text"
                        value={newCityName}
                        onChange={e => setNewCityName(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-bold"
                        placeholder="Nombre de la ciudad"
                      />
                      {empire.nationalMaterials < 15 && (
                        <p className="text-[10px] text-amber-400 font-medium pt-0.5">
                          ⚠️ Faltan materiales (tienes {empire.nationalMaterials}/15 🧱). Construye o mejora Canteras 🌲 para obtener materiales fijos.
                        </p>
                      )}
                      {empire.nationalFood < 7 && (
                        <p className="text-[10px] text-red-400 font-medium pt-0.5">
                          ⚠️ Comida insuficiente (+{empire.nationalFood}/7 🌾). Necesitas al menos +7 de superávit de comida para alimentar a los nuevos colonos.
                        </p>
                      )}
                      {tile.isCoast && (
                        <p className="text-[10px] text-blue-400/90 pt-0.5 leading-relaxed">
                          🌊 <strong>Poblado Costero:</strong> Al mejorar este asentamiento a 🏙️ Ciudad, podrás construir en él un ⚓ Puerto comercial.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleBuy}
                  disabled={!canAfford}
                  className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg ${
                    canAfford
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-emerald-600/30 cursor-pointer'
                      : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                  }`}
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>
                    {canAfford
                      ? `Anexar Casilla — ${cost} 🪙 ${selectedRole === 'settlement' ? '+ 15 🧱' : ''}`
                      : (!hasCoins
                          ? 'Monedas insuficientes'
                          : (!hasMaterialsForVillage
                              ? 'Materiales insuficientes (requiere 15 🧱)'
                              : 'Comida insuficiente (requiere superávit +7 🌾)'))}
                  </span>
                </button>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Esta casilla está demasiado lejos de tus fronteras. Solo puedes anexionar casillas adyacentes a las que ya posees.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
