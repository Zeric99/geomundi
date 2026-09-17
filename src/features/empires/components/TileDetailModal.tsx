import React, { useState } from 'react';
import { GridTile, UserEmpire, TileRole, IslandSpecialization, CIVIC_PROJECTS_CATALOG, getCountryWonder } from '../types';
import { empireStorageService } from '../services/empireStorageService';
import { geoGridService } from '../services/geoGridService';
import { empireSound } from '../services/empireSoundService';
import { 
  X, 
  MapPin, 
  Coins, 
  Wheat, 
  Edit2, 
  Check, 
  Hammer, 
  Landmark, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Anchor, 
  Compass, 
  ArrowUpRight 
} from 'lucide-react';

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
  resources:  { icon: '🌲', name: 'Bosque / Cantera', desc: '+20 Materiales / turno' },
  energy:     { icon: '⚡', name: 'Central Energética', desc: '+10 Energía / turno' },
  port:       { icon: '⚓', name: 'Puerto',            desc: 'Expediciones navales' },
  hotel:      { icon: '🏖️', name: 'Resort Turístico', desc: '+Felicidad' },
  bank:       { icon: '🏦', name: 'Banco Offshore',   desc: '+Ingresos' },
};

const SETTLEMENT_TIERS = ['—', '⛺ Aldea', '🏡 Pueblo', '🏙️ Ciudad', '🌆 Megaciudad'];

// Memoria persistente del último tipo de casilla anexada para agilizar compras en cadena
let lastAnnexRole: TileRole = (() => {
  try {
    return (localStorage.getItem('geostrike_last_annex_role') as TileRole) || 'settlement';
  } catch {
    return 'settlement';
  }
})();

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

  React.useEffect(() => {
    setNewCityName(
      `${tile.countryName || 'Poblado'} ${Object.values(empire.colonizedTiles).filter(t => t.role === 'settlement').length + 1}`
    );
    setCityNameInput(ownedData?.cityName || '');
  }, [tile.id, tile.countryName, ownedData?.cityName]);

  const [selectedRole, setSelectedRole] = useState<TileRole>(() => {
    if (isSecondaryIslandTile) {
      return lastAnnexRole === 'resources' ? 'resources' : 'crops';
    }
    return lastAnnexRole || 'settlement';
  });

  // Divulgación progresiva: paneles colapsables para no saturar de buenas a primeras
  const [showUpgradeDetails, setShowUpgradeDetails] = useState(false);
  const [showMonuments, setShowMonuments] = useState(false);
  const [showInfluence, setShowInfluence] = useState(false);
  const [showResourceUpgradeReqs, setShowResourceUpgradeReqs] = useState(false);
  const [showClusterInfo, setShowClusterInfo] = useState(false);
  const [showSecondaryActions, setShowSecondaryActions] = useState(false);
  const [showIslandSpec, setShowIslandSpec] = useState(false);

  const [islandError, setIslandError] = useState<string | null>(null);
  const [civicError, setCivicError] = useState<string | null>(null);
  const [wonderError, setWonderError] = useState<string | null>(null);
  const [resourceError, setResourceError] = useState<string | null>(null);
  const [annexError, setAnnexError] = useState<string | null>(null);

  const handleSelectRole = (role: TileRole) => {
    setSelectedRole(role);
    lastAnnexRole = role;
    try {
      localStorage.setItem('geostrike_last_annex_role', role);
    } catch {
      // ignore
    }
  };

  const hasCoins = empire.coins >= cost;
  const hasMaterialsForVillage = selectedRole !== 'settlement' || (empire.nationalMaterials >= 15);
  const hasFoodForVillage = selectedRole !== 'settlement' || (empire.nationalFood >= 7);
  const canAfford = hasCoins && hasMaterialsForVillage && hasFoodForVillage;

  const handleBuy = () => {
    lastAnnexRole = selectedRole;
    try {
      localStorage.setItem('geostrike_last_annex_role', selectedRole);
    } catch {
      // ignore
    }
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

  const upgradeCheck = isSettlement && tier < 4
    ? empireStorageService.checkUpgradeRequirements(tile.id)
    : null;
  const canUpgrade = Boolean(upgradeCheck?.canUpgrade);

  const missingUpgradeReason = React.useMemo(() => {
    if (!upgradeCheck || canUpgrade) return '';
    if (!upgradeCheck.hasEnoughCoins) return `Faltan monedas (${empire.coins}/${upgradeCheck.coinCost}🪙)`;
    if (!upgradeCheck.hasEnoughMaterials) return `Faltan materiales (${empire.nationalMaterials}/${upgradeCheck.materialCost}🧱)`;
    if (!upgradeCheck.hasEnoughFoodSurplus) return `Falta comida (+${empire.nationalFood}/+${upgradeCheck.requiredFoodSurplus}🌾)`;
    if (!upgradeCheck.hasEnoughCrops) return `Faltan huertos (${upgradeCheck.currentCrops}/${upgradeCheck.requiredCrops}🌾)`;
    if (!upgradeCheck.hasEnoughResources) return `Faltan canteras (${upgradeCheck.currentResources}/${upgradeCheck.requiredResources}🌲)`;
    if (!upgradeCheck.hasEnoughSettlements) return `Faltan pueblos vecinos (${upgradeCheck.currentSettlements}/${upgradeCheck.requiredSettlements}⛺)`;
    if (!upgradeCheck.hasEnoughSurroundingCities) return `Faltan ciudades satélite (${upgradeCheck.currentSurroundingCities}/${upgradeCheck.requiredSurroundingCities}🏙️)`;
    if (!upgradeCheck.hasMegacityDistanceCheck) return 'Megaciudad muy cerca (< 5 casillas)';
    if (!upgradeCheck.hasSingleMegacityPerCountry) return 'Ya hay 1 Megaciudad en este país';
    return 'Faltan requisitos';
  }, [upgradeCheck, canUpgrade, empire.coins, empire.nationalMaterials, empire.nationalFood]);

  const canBuildPort = isSettlement && tier >= 3 && tile.isCoast && !hasPort && empire.coins >= 50;

  // Calcular recursos dentro del radio de influencia (Mecánica Buscaminas)
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
    <div className="w-full h-full flex flex-col bg-[#0b0f17] text-slate-100 overflow-hidden select-none">
      {/* Cabecera Táctica de la Casilla */}
      <div className="px-3.5 py-3 bg-[#0d131f] border-b border-slate-800 flex items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#141d2e] border border-slate-700/80 text-amber-400 flex items-center justify-center shrink-0 shadow-sm">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-black text-white tracking-wide uppercase font-sans truncate">
              {isSettlement && ownedData?.cityName ? ownedData.cityName : (tile.countryName || 'Territorio Libre')}
            </h3>
            <span className="text-[11px] text-slate-400 font-mono block truncate">
              {tile.lat.toFixed(1)}°, {tile.lon.toFixed(1)}°
              {tile.isCoast ? ' · 🌊 Costa' : ''}
              {tile.isSmallIsland ? ' · 🏝️ Isla' : ''}
            </span>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="tactical-btn p-1.5 text-slate-400 hover:text-white rounded-lg"
          title="Cerrar detalle de casilla"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Contenido con scroll vertical propio */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3.5 space-y-3.5 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {isOwned ? (
          <div className="space-y-3">
            {/* ─── TARJETA PRINCIPAL (HÉROE) DE LA CASILLA POSEÍDA ─── */}
            <div className="tactical-card p-3 flex items-center justify-between border-slate-700/70 shadow-lg">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-2xl p-2 rounded-lg bg-[#141d2e] border border-slate-700/60 shrink-0">
                  {roleInfo.icon}
                </span>
                <div className="min-w-0">
                  {isSettlement ? (
                    isEditingCity ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={cityNameInput}
                          onChange={e => setCityNameInput(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') handleSaveCityName(); }}
                          className="bg-slate-900 border border-slate-700 text-xs px-2 py-1 rounded text-white font-bold w-36 focus:outline-none focus:border-amber-400"
                          autoFocus
                        />
                        <button onClick={handleSaveCityName} className="p-1.5 tactical-btn-cta text-black rounded">
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 group cursor-pointer" onClick={() => setIsEditingCity(true)}>
                        <span className="text-xs font-bold text-white tracking-wide truncate">{ownedData?.cityName || 'Sin nombre'}</span>
                        <Edit2 className="w-3 h-3 text-slate-400 group-hover:text-amber-400 transition-colors shrink-0" />
                      </div>
                    )
                  ) : (
                    <span className="text-xs font-bold text-white tracking-wide block truncate">{roleInfo.name}</span>
                  )}
                  
                  {/* Resumen en 1 sola línea */}
                  <span className="text-[10.5px] text-slate-300 block font-mono mt-0.5">
                    {isSettlement 
                      ? `${SETTLEMENT_TIERS[tier]} · ${(tier || 1) * 15} Habitantes`
                      : currentRole === 'crops'
                      ? `Nivel ${ownedData?.resourceTier || 1} · +${ownedData?.resourceTier === 3 ? 75 : ownedData?.resourceTier === 2 ? 35 : 15} 🌾 / turno`
                      : currentRole === 'resources'
                      ? `Nivel ${ownedData?.resourceTier || 1} · +${ownedData?.resourceTier === 3 ? 75 : ownedData?.resourceTier === 2 ? 35 : 20} 🧱 fijos`
                      : roleInfo.desc}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1 shrink-0">
                {isCapital && (
                  <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">
                    ⭐ Capital
                  </span>
                )}
                <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                  ✓ Bajo Control
                </span>
              </div>
            </div>

            {/* ════════════════════════════════════════════════════════════
                SECCIÓN DE ASENTAMIENTO (Aldea / Pueblo / Ciudad / Megaciudad)
                ════════════════════════════════════════════════════════════ */}
            {isSettlement && (
              <div className="space-y-3">
                {/* Progresión de nivel visual */}
                <div className="tactical-card p-3 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Nivel Urbano</span>
                    <span className="font-bold text-amber-400 font-mono">{SETTLEMENT_TIERS[tier] || SETTLEMENT_TIERS[1]}</span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5">
                    {[1, 2, 3, 4].map(t => (
                      <div
                        key={t}
                        className={`h-1.5 rounded-full transition-all ${
                          t <= tier ? 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-slate-800'
                        }`}
                      />
                    ))}
                  </div>

                  {/* ACCIÓN PRINCIPAL: Botón Directo de Mejora */}
                  {tier < 4 && upgradeCheck && (
                    <div className="pt-1 space-y-2">
                      <button
                        onClick={handleUpgrade}
                        disabled={!canUpgrade}
                        className={`w-full py-2.5 px-3 text-xs tracking-wider uppercase font-black transition-all rounded-lg flex items-center justify-center gap-2 ${
                          canUpgrade
                            ? 'tactical-btn-cta text-black'
                            : 'tactical-btn text-slate-400 opacity-60 cursor-not-allowed'
                        }`}
                      >
                        <ArrowUpRight className="w-4 h-4 shrink-0" />
                        <span>
                          {canUpgrade
                            ? `Mejorar a ${SETTLEMENT_TIERS[tier + 1]} — ${upgradeCheck.coinCost}🪙 ${upgradeCheck.materialCost}🧱`
                            : `Mejorar a ${SETTLEMENT_TIERS[tier + 1]} (${missingUpgradeReason})`}
                        </span>
                      </button>

                      {/* Desplegable para ver requisitos detallados si el usuario los busca */}
                      <button
                        onClick={() => setShowUpgradeDetails(prev => !prev)}
                        className="w-full py-1.5 px-2.5 rounded-md bg-[#0d131f] hover:bg-[#151e2f] border border-slate-800 text-[11px] font-mono text-slate-300 hover:text-white flex items-center justify-between transition-colors"
                      >
                        <span className="flex items-center gap-1.5">
                          <span className={canUpgrade ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                            {canUpgrade ? '✓ Requisitos Listos' : '⚠️ Ver requisitos pendientes'}
                          </span>
                        </span>
                        {showUpgradeDetails ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                      </button>

                      {/* Checklist de requisitos detallados (solo visible si se despliega) */}
                      {showUpgradeDetails && (
                        <div className="p-3 bg-[#0a0e17] border border-slate-800 rounded-lg space-y-2 text-xs">
                          <div className="flex items-center justify-between text-slate-300">
                            <span className="flex items-center gap-1.5">
                              <Coins className="w-3.5 h-3.5 text-amber-400" />
                              <span>Tesoro Imperial:</span>
                            </span>
                            <span className={`font-mono font-bold ${upgradeCheck.hasEnoughCoins ? 'text-emerald-400' : 'text-red-400'}`}>
                              {empire.coins} / {upgradeCheck.coinCost} 🪙 {upgradeCheck.hasEnoughCoins ? '✓' : '✗'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-slate-300">
                            <span className="flex items-center gap-1.5">
                              <Hammer className="w-3.5 h-3.5 text-orange-400" />
                              <span>Materiales:</span>
                            </span>
                            <span className={`font-mono font-bold ${upgradeCheck.hasEnoughMaterials ? 'text-emerald-400' : 'text-red-400'}`}>
                              {empire.nationalMaterials} / {upgradeCheck.materialCost} 🧱 {upgradeCheck.hasEnoughMaterials ? '✓' : '✗'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-slate-300">
                            <span className="flex items-center gap-1.5">
                              <Wheat className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Superávit de Comida:</span>
                            </span>
                            <span className={`font-mono font-bold ${upgradeCheck.hasEnoughFoodSurplus ? 'text-emerald-400' : 'text-red-400'}`}>
                              +{empire.nationalFood} / +{upgradeCheck.requiredFoodSurplus} 🌾 {upgradeCheck.hasEnoughFoodSurplus ? '✓' : '✗'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-slate-300">
                            <span>🌾 Huertos en radio {upgradeCheck.radius}:</span>
                            <span className={`font-mono font-bold ${upgradeCheck.hasEnoughCrops ? 'text-emerald-400' : 'text-amber-400'}`}>
                              {upgradeCheck.currentCrops} / {upgradeCheck.requiredCrops} {upgradeCheck.hasEnoughCrops ? '✓' : '✗'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-slate-300">
                            <span>🌲 Canteras en radio {upgradeCheck.radius}:</span>
                            <span className={`font-mono font-bold ${upgradeCheck.hasEnoughResources ? 'text-emerald-400' : 'text-amber-400'}`}>
                              {upgradeCheck.currentResources} / {upgradeCheck.requiredResources} {upgradeCheck.hasEnoughResources ? '✓' : '✗'}
                            </span>
                          </div>

                          {/* Requisito de Asentamientos Vecinos */}
                          {upgradeCheck.requiredSettlements > 0 && (
                            <div className="flex items-center justify-between text-slate-300">
                              <span>🏘️ Asentamientos en radio {upgradeCheck.radius}:</span>
                              <span className={`font-mono font-bold ${upgradeCheck.hasEnoughSettlements ? 'text-emerald-400' : 'text-amber-400'}`}>
                                {upgradeCheck.currentSettlements} / {upgradeCheck.requiredSettlements} {upgradeCheck.hasEnoughSettlements ? '✓' : '✗'}
                              </span>
                            </div>
                          )}

                          {/* Requisitos de Megaciudad si aplica */}
                          {upgradeCheck.nextTier === 4 && (
                            <div className="pt-2 border-t border-slate-800 space-y-1.5 text-[11px]">
                              <div className="flex items-center justify-between">
                                <span>🏙️ Ciudades satélite (Tier 3):</span>
                                <span className={`font-mono font-bold ${upgradeCheck.hasEnoughSurroundingCities ? 'text-emerald-400' : 'text-red-400'}`}>
                                  {upgradeCheck.currentSurroundingCities} / {upgradeCheck.requiredSurroundingCities}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span>📐 Separación Megaciudades (≥5):</span>
                                <span className={`font-mono font-bold ${upgradeCheck.hasMegacityDistanceCheck ? 'text-emerald-400' : 'text-red-400'}`}>
                                  {upgradeCheck.hasMegacityDistanceCheck ? 'Correcta ✓' : 'Muy cerca ✗'}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span>👑 Megaciudad única en {tile.countryName}:</span>
                                <span className={`font-mono font-bold ${upgradeCheck.hasSingleMegacityPerCountry ? 'text-emerald-400' : 'text-red-400'}`}>
                                  {upgradeCheck.hasSingleMegacityPerCountry ? 'Disponible ✓' : 'Ya existe una ✗'}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* PUERTO MARÍTIMO (Si ya está construido o si puede construirse) */}
                {hasPort ? (
                  <div className="tactical-card p-3 space-y-2.5 border-sky-800/40 bg-[#0d1626]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">⚓</span>
                        <div>
                          <p className="text-xs font-bold text-sky-200">Puerto Marítimo Activo</p>
                          <p className="text-[10px] text-sky-400/80">
                            {isNavalHub ? 'Hub Naval (Expediciones ultrarrápidas)' : 'Muelle comercial y de ultramar'}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-sky-300 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800/50">
                        {docksAvailable} / {maxDocks} libre
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        if (onStartNavalExpedition) {
                          onStartNavalExpedition(tile.id);
                          onClose();
                        }
                      }}
                      disabled={docksAvailable <= 0}
                      className={`w-full py-2.5 px-3 text-xs tracking-wider uppercase font-black transition-all rounded-lg flex items-center justify-center gap-2 ${
                        docksAvailable > 0
                          ? 'tactical-btn-cta text-black'
                          : 'tactical-btn text-slate-400 opacity-60 cursor-not-allowed'
                      }`}
                    >
                      <Compass className="w-4 h-4 shrink-0" />
                      <span>
                        {docksAvailable > 0 
                          ? ((empire.freeExpeditions || 0) > 0 ? 'Fletar Barco (Bonificado)' : 'Fletar Barco a Nuevas Tierras') 
                          : 'Muelle Ocupado (Barco Navegando)'}
                      </span>
                    </button>
                  </div>
                ) : tile.isCoast && tier >= 3 ? (
                  <button
                    onClick={handleBuildPort}
                    disabled={!canBuildPort}
                    className={`w-full py-2.5 px-3 text-xs tracking-wider uppercase font-black transition-all rounded-lg flex items-center justify-center gap-2 ${
                      canBuildPort
                        ? 'tactical-btn-cta text-black'
                        : 'tactical-btn text-slate-400 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <Anchor className="w-4 h-4" />
                    <span>Construir Puerto Marítimo — 50 🪙</span>
                  </button>
                ) : tile.isCoast && tier < 3 ? (
                  <div className="px-3 py-2 bg-[#0c121e] border border-slate-800/80 rounded-lg flex items-center gap-2.5 text-slate-400">
                    <span className="text-base opacity-40">⚓</span>
                    <span className="text-[11px]">
                      Puerto disponible al ascender a <strong className="text-slate-300">🏙️ Ciudad (Nivel 3)</strong>.
                    </span>
                  </div>
                ) : null}

                {/* ─── ACORDEÓN: MONUMENTOS URBANOS (Colapsado por defecto) ─── */}
                <div className="tactical-card p-0 overflow-hidden border-slate-800">
                  <button
                    onClick={() => setShowMonuments(prev => !prev)}
                    className="w-full p-3 flex items-center justify-between text-xs font-bold text-slate-200 hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Landmark className="w-4 h-4 text-amber-400" />
                      <span>Monumentos Urbanos</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/25">
                        {(ownedData?.civicProjects || []).length} / {tier} ranuras
                      </span>
                      {showMonuments ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </button>

                  {showMonuments && (
                    <div className="p-3 pt-0 border-t border-slate-800/80 space-y-2">
                      {civicError && (
                        <div className="p-2 bg-red-950/40 border border-red-800/50 rounded text-[11px] text-red-300 mt-2">
                          ⚠️ {civicError}
                        </div>
                      )}
                      <div className="space-y-1.5 mt-2">
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
                              className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-2.5 transition-all ${
                                isBuilt
                                  ? 'bg-[#131d2e] border-slate-700 text-slate-200'
                                  : meetsTier && hasSlot
                                  ? 'bg-[#0f1522] border-slate-800 hover:border-slate-700 text-slate-300'
                                  : 'bg-[#0a0e17] border-slate-900 text-slate-500 opacity-60'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className="text-xl shrink-0">{proj.icon}</span>
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-white leading-tight truncate">{proj.name}</p>
                                  <p className="text-[10px] text-slate-400 font-mono">
                                    +{proj.happinessBonus}% Felicidad · {proj.coinCost}🪙 {proj.materialCost}🧱
                                  </p>
                                </div>
                              </div>

                              <div className="shrink-0">
                                {isBuilt ? (
                                  <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/50">
                                    ✓ Erigido
                                  </span>
                                ) : !meetsTier ? (
                                  <span className="text-[10px] text-slate-500 font-mono">Niv {proj.minTier}+</span>
                                ) : !hasSlot ? (
                                  <span className="text-[10px] text-slate-500 font-mono">Lleno</span>
                                ) : (
                                  <button
                                    onClick={() => {
                                      const res = empireStorageService.buildCivicProject(tile.id, proj.id);
                                      if (!res.success) setCivicError(res.error || 'Error al construir');
                                      else setCivicError(null);
                                    }}
                                    disabled={!canBuild}
                                    className={`text-[10.5px] font-black px-2.5 py-1 rounded transition-all ${
                                      canBuild
                                        ? 'tactical-btn-cta text-black'
                                        : 'tactical-btn text-slate-400 opacity-60 cursor-not-allowed'
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
                  )}
                </div>

                {/* ─── ACORDEÓN: RADIO DE INFLUENCIA (Colapsado por defecto) ─── */}
                <div className="tactical-card p-0 overflow-hidden border-slate-800">
                  <button
                    onClick={() => setShowInfluence(prev => !prev)}
                    className="w-full p-3 flex items-center justify-between text-xs font-bold text-slate-200 hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span>🎯</span>
                      <span>Radio de Influencia (Radio {nearbyResources.radius})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-400">
                        +{nearbyResources.crops * 15}🌾 · +{nearbyResources.resources * 10}🧱
                      </span>
                      {showInfluence ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </button>

                  {showInfluence && (
                    <div className="p-3 pt-0 border-t border-slate-800/80 mt-1">
                      <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                        <div className="bg-[#0c121e] p-2.5 rounded-lg border border-slate-800 flex items-center gap-2.5">
                          <span className="text-xl">🌾</span>
                          <div>
                            <span className="font-bold text-white font-mono text-xs">{nearbyResources.crops} huertos</span>
                            <span className="text-[10px] text-emerald-400 block font-mono">+{nearbyResources.crops * 15} comida/t</span>
                          </div>
                        </div>
                        <div className="bg-[#0c121e] p-2.5 rounded-lg border border-slate-800 flex items-center gap-2.5">
                          <span className="text-xl">🌲</span>
                          <div>
                            <span className="font-bold text-white font-mono text-xs">{nearbyResources.resources} canteras</span>
                            <span className="text-[10px] text-amber-400 block font-mono">+{nearbyResources.resources * 10} materiales/t</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* ─── MARAVILLA NACIONAL (Para Megaciudades Tier 4) ─── */}
                {tier >= 4 && (
                  <div className="tactical-card p-3 space-y-2.5 border-amber-500/40 bg-[#161a12]">
                    {(() => {
                      const wonder = getCountryWonder(tile.countryCode, tile.countryName);
                      const isBuilt = Boolean(ownedData?.nationalWonderBuilt);
                      const countryCode = tile.countryCode || '';
                      const isCountryAnnexed = (empire.annexedCountries || []).includes(countryCode);
                      const annexStatus = empireStorageService.getCountryAnnexationStatus(countryCode);
                      const canAffordWonder = empire.coins >= wonder.coinCost && empire.nationalMaterials >= wonder.materialCost;

                      return (
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{wonder.icon}</span>
                              <div>
                                <h4 className="text-xs font-black text-amber-300 uppercase">{wonder.name}</h4>
                                <p className="text-[10px] text-slate-300">Maravilla Nacional de {tile.countryName}</p>
                              </div>
                            </div>
                            <span className="text-[10px] font-mono font-bold text-amber-400">
                              +{wonder.happinessBonus}% Felicidad
                            </span>
                          </div>

                          {!isCountryAnnexed ? (
                            <div className="p-2.5 bg-[#0d131f] rounded-lg border border-slate-800 space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-300">Soberanía Nacional:</span>
                                <span className="font-mono text-amber-400 font-bold">{annexStatus.percentage}% / 90%</span>
                              </div>
                              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-amber-400 transition-all duration-300"
                                  style={{ width: `${Math.min(100, (annexStatus.percentage / 90) * 100)}%` }}
                                />
                              </div>
                              {annexStatus.canAnnex && (
                                <button
                                  onClick={() => {
                                    const res = empireStorageService.annexCountry(countryCode);
                                    if (!res.success) setAnnexError(res.error || 'Error al anexionar');
                                    else setAnnexError(null);
                                  }}
                                  className="tactical-btn-cta w-full py-2 text-xs text-black"
                                >
                                  👑 Proclamar Soberanía de {tile.countryName}
                                </button>
                              )}
                            </div>
                          ) : (
                            <div>
                              {isBuilt ? (
                                <div className="py-2 text-center text-xs font-bold text-amber-300 bg-amber-500/10 rounded border border-amber-500/30 font-mono">
                                  ✓ Maravilla Nacional Erigida (+{wonder.happinessBonus}% Felicidad Activa)
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    const res = empireStorageService.buildNationalWonder(tile.id);
                                    if (!res.success) setWonderError(res.error || 'Error al erigir');
                                    else {
                                      setWonderError(null);
                                      empireSound.playMegacityFanfare();
                                    }
                                  }}
                                  disabled={!canAffordWonder}
                                  className={`w-full py-2.5 text-xs uppercase font-black rounded-lg ${
                                    canAffordWonder ? 'tactical-btn-cta text-black' : 'tactical-btn text-slate-400 opacity-60'
                                  }`}
                                >
                                  🏛️ Erigir Maravilla — {wonder.coinCost}🪙 {wonder.materialCost}🧱
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

            {/* ════════════════════════════════════════════════════════════
                SECCIÓN DE HUERTO O CANTERA (Casilla de Recursos)
                ════════════════════════════════════════════════════════════ */}
            {!isSettlement && (
              <div className="space-y-3">
                {/* Cabecera y Nivel de Producción */}
                <div className="tactical-card p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{currentRole === 'crops' ? '🌾' : '🌲'}</span>
                      <div>
                        <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                          {currentRole === 'crops' ? 'Huerto Agrícola' : 'Cantera de Piedra'}
                          <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                            Nivel {ownedData?.resourceTier || 1} / 3
                          </span>
                        </h4>
                        <p className="text-[10.5px] text-slate-300 mt-0.5 font-mono">
                          {currentRole === 'crops'
                            ? (ownedData?.resourceTier === 3
                                ? '+75 🌾 comida por turno'
                                : ownedData?.resourceTier === 2
                                ? '+35 🌾 comida por turno'
                                : '+15 🌾 comida por turno')
                            : (ownedData?.resourceTier === 3
                                ? '+75 🧱 materiales fijos'
                                : ownedData?.resourceTier === 2
                                ? '+35 🧱 materiales fijos'
                                : '+20 🧱 materiales fijos')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bonificación de Clúster Contiguo (Gran Bosque o Complejo Agrícola) */}
                  {(() => {
                    const cluster = empireStorageService.getResourceClusterInfo(tile.id);
                    const isCrops = currentRole === 'crops';
                    const clusterTitle = isCrops ? 'Complejo Agrícola' : 'Gran Bosque';

                    return cluster.isLargeCluster ? (
                      <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/50 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span className="font-bold text-emerald-300">{clusterTitle} Activo</span>
                        </div>
                        <span className="font-mono font-bold text-emerald-400 text-xs">
                          +{cluster.bonusPct}% Producción
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowClusterInfo(prev => !prev)}
                        className="w-full py-1.5 px-2 rounded bg-[#0d131f] border border-slate-800 text-[11px] font-mono text-slate-400 hover:text-slate-200 flex items-center justify-between"
                      >
                        <span>{isCrops ? '🌾' : '🌲'} Clúster Contiguo ({cluster.clusterSize} / 6 unidas)</span>
                        {showClusterInfo ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    );
                  })()}

                  {/* Detalle del clúster si el usuario lo desplegó */}
                  {showClusterInfo && (
                    <p className="text-[10px] text-slate-400 bg-[#0a0e17] p-2.5 rounded border border-slate-800 leading-relaxed">
                      Conecta 6 o más casillas del mismo tipo tocando lado con lado (sin diagonales) para activar el multiplicador continuo de producción territorial (+1% a +15%).
                    </p>
                  )}

                  {/* MEJORA DE NIVEL DEL RECURSO */}
                  {(() => {
                    const check = empireStorageService.checkResourceUpgradeRequirements(tile.id);
                    const rTier = ownedData?.resourceTier || 1;
                    const isMax = rTier >= 3;
                    const nextRTier = rTier + 1;
                    const upgradeCost = check?.coinCost || (currentRole === 'crops'
                      ? (nextRTier === 2 ? 25 : 60)
                      : (nextRTier === 2 ? 30 : 75));
                    const canUpgrade = Boolean(check?.canUpgrade);

                    if (isMax) {
                      return (
                        <div className="py-2 text-center text-xs font-bold text-slate-300 bg-[#0c121e] rounded-lg border border-slate-800 font-mono">
                          ⭐ Rendimiento Máximo Alcanzado (Nivel 3)
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-2 pt-1">
                        <button
                          onClick={() => {
                            const res = empireStorageService.upgradeResourceTile(tile.id);
                            if (!res.success) setResourceError(res.error || 'Error al mejorar');
                            else {
                              setResourceError(null);
                              empireSound.playUpgrade();
                            }
                          }}
                          disabled={!canUpgrade}
                          className={`w-full py-2.5 px-3 text-xs tracking-wider uppercase font-black transition-all rounded-lg flex items-center justify-center gap-2 ${
                            canUpgrade
                              ? 'tactical-btn-cta text-black'
                              : 'tactical-btn text-slate-400 opacity-60 cursor-not-allowed'
                          }`}
                        >
                          <ArrowUpRight className="w-4 h-4" />
                          <span>
                            {canUpgrade
                              ? `Mejorar a Nivel ${nextRTier} — ${upgradeCost} 🪙`
                              : `Mejorar a Nivel ${nextRTier} (Requisitos pendientes)`}
                          </span>
                        </button>

                        <button
                          onClick={() => setShowResourceUpgradeReqs(prev => !prev)}
                          className="w-full py-1 px-2 text-[10.5px] font-mono text-slate-400 hover:text-slate-300 flex items-center justify-between"
                        >
                          <span>{canUpgrade ? '✓ Requisitos cumplidos' : '📋 Ver requisitos de mejora'}</span>
                          {showResourceUpgradeReqs ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>

                        {showResourceUpgradeReqs && check && (
                          <div className="p-2.5 bg-[#0a0e17] border border-slate-800 rounded-lg text-xs space-y-1.5 font-mono">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">Coste de mejora:</span>
                              <span className={check.hasEnoughCoins ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                                {empire.coins} / {upgradeCost} 🪙 {check.hasEnoughCoins ? '✓' : '✗'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">
                                {nextRTier === 2 ? 'Vecinos contiguos requeridos:' : 'Centro 3x3 completo:'}
                              </span>
                              <span className={check.hasRequiredNeighbors ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                                {check.sameTypeNeighbors} / {check.requiredNeighbors} {check.hasRequiredNeighbors ? '✓' : '✗'}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* ACCIONES SECUNDARIAS: Reconvertir / Fundar Poblado (Colapsado por defecto) */}
                <div className="tactical-card p-0 overflow-hidden border-slate-800">
                  <button
                    onClick={() => setShowSecondaryActions(prev => !prev)}
                    className="w-full p-3 flex items-center justify-between text-xs font-bold text-slate-300 hover:bg-slate-800/40 transition-colors"
                  >
                    <span>⚙️ Reconvertir función o Fundar Asentamiento</span>
                    {showSecondaryActions ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>

                  {showSecondaryActions && (
                    <div className="p-3 pt-0 border-t border-slate-800/80 space-y-2.5 mt-1">
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <button
                          onClick={() => empireStorageService.convertTileRole(tile.id, 'crops')}
                          disabled={currentRole === 'crops'}
                          className={`p-2 rounded-lg text-xs font-bold transition-all border ${
                            currentRole === 'crops'
                              ? 'tactical-btn-active text-amber-300 border-amber-400'
                              : 'tactical-btn text-slate-300'
                          }`}
                        >
                          🌾 Huerto (+15🌾)
                        </button>
                        <button
                          onClick={() => empireStorageService.convertTileRole(tile.id, 'resources')}
                          disabled={currentRole === 'resources'}
                          className={`p-2 rounded-lg text-xs font-bold transition-all border ${
                            currentRole === 'resources'
                              ? 'tactical-btn-active text-amber-300 border-amber-400'
                              : 'tactical-btn text-slate-300'
                          }`}
                        >
                          🌲 Cantera (+20🧱)
                        </button>
                      </div>

                      {!isSecondaryIslandTile && (
                        <div className="pt-2 border-t border-slate-800/80">
                          <button
                            onClick={handleConvertToSettlement}
                            disabled={empire.coins < 20 || empire.nationalMaterials < 15 || empire.nationalFood < 7}
                            className={`w-full py-2 px-3 text-xs tracking-wider uppercase font-black transition-all rounded-lg ${
                              empire.coins >= 20 && empire.nationalMaterials >= 15 && empire.nationalFood >= 7
                                ? 'tactical-btn-cta text-black'
                                : 'tactical-btn text-slate-400 opacity-60 cursor-not-allowed'
                            }`}
                          >
                            ⛺ Fundar Poblado aquí — 20🪙 + 15🧱 (+7🌾)
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* ESPECIALIZACIÓN INSULAR SI CORRESPONDE */}
                {tile.isSmallIsland && tile.islandGroupId && (
                  <div className="tactical-card p-0 overflow-hidden border-slate-800">
                    <button
                      onClick={() => setShowIslandSpec(prev => !prev)}
                      className="w-full p-3 flex items-center justify-between text-xs font-bold text-slate-300 hover:bg-slate-800/40 transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>🏝️</span>
                        <span>Especialización Insular: <strong className="text-amber-300 font-mono">{islandSpec || 'Sin asignar'}</strong></span>
                      </div>
                      {showIslandSpec ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </button>

                    {showIslandSpec && (
                      <div className="p-3 pt-0 border-t border-slate-800/80 space-y-2 mt-1">
                        {islandError && (
                          <div className="p-2 bg-red-950/40 border border-red-800/50 rounded text-[11px] text-red-300 mt-2">
                            ⚠️ {islandError}
                          </div>
                        )}
                        <div className="grid grid-cols-3 gap-1.5 mt-2">
                          {[
                            { key: 'tourist_resort' as IslandSpecialization, label: 'Resort 🏖️', desc: '+40 🪙/día' },
                            { key: 'fiscal_paradise' as IslandSpecialization, label: 'Banco 🏦', desc: '+15% oro duelos' },
                            { key: 'naval_hub' as IslandSpecialization, label: 'Hub Naval ⚓', desc: 'Barco bonificado' },
                          ].map(spec => (
                            <button
                              key={spec.key}
                              onClick={() => {
                                const res = empireStorageService.setIslandSpecialization(tile.islandGroupId!, spec.key);
                                if (!res.success) setIslandError(res.error || 'No se puede especializar');
                                else setIslandError(null);
                              }}
                              className={`p-2 rounded-lg border text-center transition-all flex flex-col items-center justify-between min-h-[60px] ${
                                islandSpec === spec.key
                                  ? 'tactical-btn-active text-amber-300 border-amber-400'
                                  : 'tactical-btn text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              <span className="text-[11px] font-bold block">{spec.label}</span>
                              <span className="text-[9px] text-slate-400 block font-mono">{spec.desc}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* ══════════════════════════════════════════════════════════════════
              CASILLA NO POSEÍDA: "¿QUÉ DESEAS CONSTRUIR AQUÍ?"
              Tarjetas verticales, limpias, visuales y sin sobrecarga
              ══════════════════════════════════════════════════════════════════ */
          <div className="space-y-3.5">
            {/* Cabecera del Territorio */}
            <div className="tactical-card p-3 flex items-center justify-between shadow-md">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block font-mono">Nación / Soberanía</span>
                <span className="text-sm font-black text-white">{tile.countryName || 'Tierra Libre'}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block font-mono">Coordenadas</span>
                <span className="text-xs font-mono text-amber-300 font-bold">{tile.lat.toFixed(1)}°, {tile.lon.toFixed(1)}°</span>
              </div>
            </div>

            {isAdjacentToOwned ? (
              <div className="space-y-3">
                {/* Barra de Coste y Saldo */}
                <div className="tactical-card p-2.5 flex items-center justify-between bg-[#0d131f] border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs text-slate-300">
                    <Coins className="w-4 h-4 text-amber-400" />
                    <span className="font-mono">Coste de anexión:</span>
                    <strong className="text-amber-300 font-mono text-sm">{cost} 🪙</strong>
                  </div>
                  <div className="text-xs font-mono text-slate-400">
                    Tu saldo: <span className={hasCoins ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>{empire.coins} 🪙</span>
                  </div>
                </div>

                {/* Título de la Selección */}
                <div>
                  <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-300 font-sans mb-2 flex items-center gap-1.5">
                    <span>¿Qué deseas construir aquí?</span>
                  </h4>

                  {/* Tarjetas de Selección por Filas Verticales (Limpias, Espaciosas y con Jerarquía) */}
                  <div className="space-y-2">
                    {/* OPCIÓN 1: POBLADO (Si no es isla secundaria) */}
                    {!isSecondaryIslandTile && (
                      <div
                        onClick={() => handleSelectRole('settlement')}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          selectedRole === 'settlement'
                            ? 'bg-[#151f33] border-amber-400/90 shadow-[0_0_15px_rgba(245,158,11,0.2)] ring-1 ring-amber-400/50'
                            : 'bg-[#0f1422] border-slate-800/80 hover:border-slate-700 hover:bg-[#131929]'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0 border ${
                            selectedRole === 'settlement'
                              ? 'bg-amber-500/20 border-amber-400/60'
                              : 'bg-slate-800/50 border-slate-700/60'
                          }`}>
                            ⛺
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-white tracking-wide">Poblado</span>
                              <span className="text-[10px] font-mono text-amber-300 bg-amber-500/15 px-1.5 py-0.2 rounded border border-amber-500/30">
                                +15 Hab
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                              Establece un centro urbano para fundar y expandir ciudades
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          <span className="text-xs font-mono font-bold text-orange-300 block">
                            +15 🧱
                          </span>
                          <span className="text-[9.5px] font-mono text-emerald-400 block">
                            +7 🌾
                          </span>
                        </div>
                      </div>
                    )}

                    {/* OPCIÓN 2: HUERTO AGRÍCOLA */}
                    <div
                      onClick={() => handleSelectRole('crops')}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        selectedRole === 'crops'
                          ? 'bg-[#151f33] border-amber-400/90 shadow-[0_0_15px_rgba(245,158,11,0.2)] ring-1 ring-amber-400/50'
                          : 'bg-[#0f1422] border-slate-800/80 hover:border-slate-700 hover:bg-[#131929]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0 border ${
                          selectedRole === 'crops'
                            ? 'bg-emerald-500/20 border-emerald-400/60'
                            : 'bg-slate-800/50 border-slate-700/60'
                        }`}>
                          🌾
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-white tracking-wide">Huerto Agrícola</span>
                            <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/15 px-1.5 py-0.2 rounded border border-emerald-500/30">
                              +15 🌾 / turno
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                            Produce alimento para sustentar el crecimiento de tus ciudades
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
                          0 🧱 Gratis
                        </span>
                      </div>
                    </div>

                    {/* OPCIÓN 3: CANTERA / BOSQUE */}
                    <div
                      onClick={() => handleSelectRole('resources')}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        selectedRole === 'resources'
                          ? 'bg-[#151f33] border-amber-400/90 shadow-[0_0_15px_rgba(245,158,11,0.2)] ring-1 ring-amber-400/50'
                          : 'bg-[#0f1422] border-slate-800/80 hover:border-slate-700 hover:bg-[#131929]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0 border ${
                          selectedRole === 'resources'
                            ? 'bg-amber-500/20 border-amber-400/60'
                            : 'bg-slate-800/50 border-slate-700/60'
                        }`}>
                          🌲
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-white tracking-wide">Cantera / Bosque</span>
                            <span className="text-[10px] font-mono text-amber-300 bg-amber-500/15 px-1.5 py-0.2 rounded border border-amber-500/30">
                              +20 🧱 fijos
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                            Extrae materiales indispensables para construir y mejorar
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
                          0 🧱 Gratis
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Campo de Nombre si se selecciona Poblado */}
                  {selectedRole === 'settlement' && (
                    <div className="mt-2.5 p-3 bg-[#0d131f] border border-slate-800 rounded-xl space-y-2">
                      <label className="text-[10.5px] font-bold text-slate-300 uppercase tracking-wider block font-mono">
                        Nombre del nuevo asentamiento:
                      </label>
                      <input
                        type="text"
                        value={newCityName}
                        onChange={e => setNewCityName(e.target.value)}
                        className="w-full bg-[#070a10] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 font-bold"
                        placeholder="Nombre de la fundación"
                      />
                      {!hasMaterialsForVillage && (
                        <p className="text-[11px] text-red-400 font-medium">
                          ⚠️ Faltan materiales ({empire.nationalMaterials}/15 🧱). Construye o mejora Canteras 🌲 para obtener materiales fijos.
                        </p>
                      )}
                      {!hasFoodForVillage && (
                        <p className="text-[11px] text-red-400 font-medium">
                          ⚠️ Comida insuficiente (+{empire.nationalFood}/7 🌾). Necesitas al menos +7 de superávit de comida.
                        </p>
                      )}
                      {tile.isCoast && (
                        <p className="text-[10.5px] text-sky-400/90 leading-tight">
                          🌊 <strong>Poblado Costero:</strong> Al ascender a 🏙️ Ciudad podrás construir un ⚓ Puerto aquí.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* BOTÓN DEFINITIVO DE ANEXIÓN */}
                <button
                  onClick={handleBuy}
                  disabled={!canAfford}
                  className={`w-full py-3 px-4 text-xs font-black tracking-wider uppercase transition-all rounded-xl flex items-center justify-center gap-2 shadow-xl ${
                    canAfford
                      ? 'tactical-btn-cta text-black'
                      : 'tactical-btn text-slate-400 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <Coins className="w-4 h-4" />
                  <span>
                    {canAfford
                      ? `Anexar Casilla — ${cost} 🪙 ${selectedRole === 'settlement' ? '+ 15 🧱' : ''}`
                      : !hasCoins
                      ? `Faltan monedas (${empire.coins}/${cost} 🪙)`
                      : !hasMaterialsForVillage
                      ? `Faltan materiales (${empire.nationalMaterials}/15 🧱)`
                      : `Comida insuficiente (+${empire.nationalFood}/7 🌾)`}
                  </span>
                </button>
              </div>
            ) : (
              /* Casilla lejana */
              <div className="text-center py-8 px-4 bg-[#0d131f] border border-slate-800 rounded-xl space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700 text-amber-400 mx-auto flex items-center justify-center text-lg shadow-inner">
                  ⚠️
                </div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-200 font-sans">
                  Casilla fuera de alcance
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                  Esta casilla no tiene frontera directa con tu territorio actual. Anexiona casillas contiguas o fleta barcos desde un puerto marítimo ⚓ para llegar por mar.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
