import { UserEmpire, GridTile, TileRole, SettlementTier, IslandSpecialization, NavalExpedition, CivicProject, CIVIC_PROJECTS_CATALOG, getCountryWonder, TutorialMission } from '../types';
import { geoGridService } from './geoGridService';
import { empireSound } from './empireSoundService';
import { supabase, isSupabaseConfigured } from '../../../lib/supabase';

const EMPIRE_STORAGE_KEY = 'geostrike_user_empire_v1';

// Catálogo pedagógico de misiones iniciales guiadas (Tutorial paso a paso)
export const TUTORIAL_MISSIONS: TutorialMission[] = [
  {
    id: 'mission_1_capital',
    stepNumber: 1,
    title: 'El Amanecer del Imperio',
    category: 'foundation',
    icon: '👑',
    description: 'Funda tu Capital en cualquier casilla de tu país de origen.',
    howTo: [
      'Haz clic en una casilla continental o costera de tu país.',
      'Pulsa el botón "Fundar Asentamiento / Capital".',
      'Tu capital empezará a generar población y tributos para tu imperio.'
    ],
    reward: { coins: 100, materials: 30, food: 25 }
  },
  {
    id: 'mission_2_crops',
    stepNumber: 2,
    title: 'El Sustento del Pueblo',
    category: 'economy',
    icon: '🌾',
    description: 'Crea tu primer Huerto Agrícola para alimentar a tus ciudadanos.',
    howTo: [
      'Selecciona una casilla contigua a tu territorio.',
      'Elige la opción "Especializar: Huerto (+10 Comida/s)".',
      '¡La comida positiva garantiza que tu población siga creciendo!'
    ],
    reward: { coins: 60, materials: 20 }
  },
  {
    id: 'mission_3_quarry',
    stepNumber: 3,
    title: 'Cimientos de Piedra y Madera',
    category: 'production',
    icon: '🌲',
    description: 'Establece una Cantera / Aserradero para obtener materiales.',
    howTo: [
      'Selecciona otra casilla vecina dentro de tus fronteras.',
      'Elige "Especializar: Cantera (+20 🧱 fijos)".',
      'Los materiales son indispensables para fundar y mejorar ciudades.'
    ],
    reward: { coins: 60, food: 20 }
  },
  {
    id: 'mission_4_crop_upgrade',
    stepNumber: 4,
    title: 'Revolución Agraria',
    category: 'economy',
    icon: '🚜',
    description: 'Mejora un Huerto al Nivel 2 rodeándolo de al menos 2 huertos vecinos.',
    howTo: [
      'Construye al menos 2 huertos contiguos al que quieres mejorar.',
      'Haz clic sobre el huerto y abre el panel de detalle.',
      'Pulsa "Mejorar a Nivel 2" teniendo los 2 vecinos contiguos y las monedas.'
    ],
    reward: { coins: 80, materials: 25 }
  },
  {
    id: 'mission_5_town',
    stepNumber: 5,
    title: 'De Aldea a Pueblo',
    category: 'expansion',
    icon: '🏡',
    description: 'Evoluciona tu capital o aldea a Pueblo superando el Buscaminas.',
    howTo: [
      'Haz clic en tu Capital o Aldea.',
      'Pulsa el botón "Evolucionar Asentamiento".',
      'Despeja el tablero de Buscaminas sin tocar minas para ascender al Nivel 2.'
    ],
    reward: { coins: 120, materials: 40 }
  },
  {
    id: 'mission_6_port',
    stepNumber: 6,
    title: 'Apertura al Mar',
    category: 'naval',
    icon: '⚓',
    description: 'Construye un Puerto en una casilla costera o Hub Naval.',
    howTo: [
      'Selecciona una casilla contigua que tenga orilla marítima.',
      'Fúndala y añade el muelle pesquero o mejórala a Puerto Marítimo.',
      'Los puertos desbloquean el flete de barcos y rutas oceánicas.'
    ],
    reward: { coins: 150, freeExpeditions: 1 }
  },
  {
    id: 'mission_7_expedition',
    stepNumber: 7,
    title: 'Rumbo a Ultramar',
    category: 'naval',
    icon: '⛵',
    description: 'Fleta tu primera expedición marítima a otro continente.',
    howTo: [
      'Haz clic en el botón "Expedición Naval" (o en un Puerto activo).',
      'Selecciona una casilla de destino costera en el mapa exterior.',
      'Asigna tripulación, paga la tasa y zarpa surcando los mares.'
    ],
    reward: { coins: 200, materials: 50, food: 50 }
  },
  {
    id: 'mission_8_wonder',
    stepNumber: 8,
    title: 'Maravilla Nacional y Soberanía',
    category: 'wonder',
    icon: '🏛️',
    description: 'Construye una Maravilla o anexa formalmente un país soberano.',
    howTo: [
      'Evoluciona tu metrópolis a Megaciudad para desbloquear la Maravilla Nacional.',
      'O bien coloniza la mayoría de casillas de un país para reclamar su soberanía en el Censo.',
      '¡Coronará tu imperio en la historia universal!'
    ],
    reward: { coins: 300, materials: 100, food: 100 }
  }
];

// Paleta de colores imperiales personalizables
export const EMPIRE_COLORS = [
  { name: 'Azul Real', hex: '#3B82F6' },
  { name: 'Rojo Imperial', hex: '#EF4444' },
  { name: 'Verde Esmeralda', hex: '#10B981' },
  { name: 'Púrpura Soberano', hex: '#8B5CF6' },
  { name: 'Ámbar Dorado', hex: '#F59E0B' },
  { name: 'Cian Neón', hex: '#06B6D4' },
  { name: 'Rosa Magia', hex: '#EC4899' },
];

export class EmpireStorageService {
  private empire: UserEmpire | null = null;
  private listeners: Set<(empire: UserEmpire) => void> = new Set();
  private saveTimer: any = null;
  private tickerCycleCount = 0;

  constructor() {
    this.initEmpire();
    this.startExpeditionTicker();
  }

  private initEmpire(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(EMPIRE_STORAGE_KEY);
      if (stored) {
        this.empire = JSON.parse(stored);
        this.recalculateMetrics();
      } else {
        this.empire = this.createDefaultEmpire();
        this.saveEmpire();
      }
    } catch (e) {
      console.error('Error cargando imperio de localStorage, reiniciando:', e);
      this.empire = this.createDefaultEmpire();
      this.saveEmpire();
    }
  }

  private saveEmpire(): void {
    this.saveToStorage();
  }

  private startExpeditionTicker(): void {
    setInterval(() => {
      this.tickerCycleCount++;
      let changed = false;

      // 1. Cada 1s: comprobar estado de expediciones navales
      const expChanged = this.checkAndUpdateExpeditions();
      if (expChanged) changed = true;

      // 2. Cada 10s: recaudación tributaria y actualización de felicidad (sin sumar materiales por segundo)
      if (this.tickerCycleCount % 10 === 0 && this.empire) {
        let baseTax = 0;
        Object.values(this.empire.colonizedTiles).forEach(t => {
          if (t.role === 'settlement' || (t.settlementTier && t.settlementTier > 0)) {
            const tier = t.settlementTier || 1;
            const tierTaxes: Record<number, number> = { 1: 1, 2: 3, 3: 8, 4: 25 };
            baseTax += tierTaxes[tier] || 1;
          }
        });

        // Ingresos de resorts turísticos
        const resortCount = Object.values(this.empire.islandSpecializations || {}).filter(s => s === 'tourist_resort').length;
        baseTax += resortCount * 40;

        if (baseTax > 0) {
          const mult = 0.5 + (this.empire.happinessPct / 100);
          const earned = Math.max(1, Math.round(baseTax * mult));
          this.empire.coins += earned;
          changed = true;
        }

        this.recalculateMetrics();
        changed = true;
      }

      if (changed) {
        this.notify();
      }
    }, 1000);
  }

  public subscribe(listener: (empire: UserEmpire) => void): () => void {
    this.listeners.add(listener);
    if (this.empire) listener(this.empire);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    if (!this.empire) return;
    this.debouncedSave();
    this.listeners.forEach(l => l(this.empire!));
  }

  public debouncedSave(immediate = false): void {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
      this.saveTimer = null;
    }
    if (immediate) {
      this.saveToStorage();
      return;
    }
    this.saveTimer = setTimeout(() => {
      this.saveToStorage();
    }, 1000);
  }

  public flushSave(): void {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
      this.saveTimer = null;
    }
    this.saveToStorage();
  }

  private isProductionEnvironment(): boolean {
    if (typeof window === 'undefined') return false;
    const host = window.location.hostname;
    return host !== 'localhost' && host !== '127.0.0.1' && !host.startsWith('192.168.') && !host.endsWith('.local');
  }

  private loadFromStorage(): void {
    try {
      const raw = localStorage.getItem(EMPIRE_STORAGE_KEY);
      if (raw) {
        this.empire = JSON.parse(raw);
        if (this.empire) {
          if (!this.empire.expeditions) this.empire.expeditions = [];
          if (!this.empire.islandSpecializations) this.empire.islandSpecializations = {};
          if (this.empire.freeExpeditions === undefined) this.empire.freeExpeditions = 0;
          if (!this.empire.claimedMissions) this.empire.claimedMissions = [];

          // Reestablecer tesorería equilibrada si venía de pruebas con 999.999 monedas
          if (this.empire.coins >= 999999) {
            this.empire.coins = 150;
          }
          if (this.empire.nationalMaterials === undefined || this.empire.nationalMaterials < 30) {
            this.empire.nationalMaterials = 60;
          }

          // Si hay islas con Hub Naval, asegurar que su puerto esté activo y desbloqueado
          Object.entries(this.empire.islandSpecializations || {}).forEach(([groupId, spec]) => {
            if (spec === 'naval_hub') {
              const islandTiles = geoGridService.getTilesByIslandGroup(groupId);
              const st = islandTiles.find(t => this.empire?.colonizedTiles[t.id]?.role === 'settlement')
                || islandTiles.find(t => this.empire?.colonizedTiles[t.id]);
              if (st && this.empire?.colonizedTiles[st.id]) {
                const colData = this.empire.colonizedTiles[st.id];
                colData.role = 'settlement';
                colData.hasPort = true;
                if (!colData.settlementTier || colData.settlementTier < 2) colData.settlementTier = 2;
                if (!colData.cityName || colData.cityName.includes('Costera')) {
                  colData.cityName = `${st.countryName} Hub Naval`;
                }
              }
            }
          });

          this.recalculateMetrics();
          this.checkAndUpdateExpeditions();
          return;
        }
      }
    } catch (e) {
      console.warn('[EmpireStorageService] Error cargando datos:', e);
    }
    this.empire = this.createDefaultEmpire();
  }

  private async saveToStorage(): Promise<void> {
    if (!this.empire) return;
    try {
      localStorage.setItem(EMPIRE_STORAGE_KEY, JSON.stringify(this.empire));
    } catch (e) {
      console.error('[EmpireStorageService] Error guardando imperio en localStorage:', e);
    }

    // Sincronización con Supabase: ÚNICAMENTE se ejecuta en el entorno real de producción
    if (this.isProductionEnvironment() && isSupabaseConfigured && supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('profiles').update({
            empire_data: this.empire,
            updated_at: new Date().toISOString()
          }).eq('id', user.id);
        }
      } catch (err) {
        console.warn('[EmpireStorageService] Error sincronizando con Supabase:', err);
      }
    }
  }

  private createDefaultEmpire(): UserEmpire {
    return {
      id: `emp_${Date.now()}`,
      empireName: 'Nueva Civilización',
      colorHex: '#3B82F6',
      createdAt: new Date().toISOString(),
      totalPopulation: 0,
      nationalFood: 15,
      nationalMaterials: 60,
      happinessPct: 80,
      coins: 120, // Tesorería inicial equilibrada
      freeExpeditions: 0,
      localCensusByCountry: {},
      colonizedTiles: {},
      claimedMissions: [],
      islandSpecializations: {},
      expeditions: []
    };
  }

  /**
   * Recalcula dinámicamente el balance de comida (producción - consumo) y la felicidad imperial
   */
  public recalculateMetrics(): void {
    if (!this.empire) return;
    const emp = this.empire;

    // 1. Comida: Huertos producen según su nivel (Tier 1: +15, Tier 2: +35, Tier 3: +75)
    // La población consume (Math.floor(población * 0.5))
    let foodProduced = 0;
    Object.values(emp.colonizedTiles).forEach(t => {
      if (t.role === 'crops') {
        const tier = t.resourceTier || 1;
        if (tier === 3) foodProduced += 75;
        else if (tier === 2) foodProduced += 35;
        else foodProduced += 15;
      }
    });

    const foodConsumed = Math.floor(emp.totalPopulation * 0.5);
    const rawFoodBalance = foodProduced - foodConsumed;
    // La comida nunca queda en números negativos
    emp.nationalFood = Math.max(0, rawFoodBalance);
    // Los materiales nunca quedan en números negativos
    emp.nationalMaterials = Math.max(0, emp.nationalMaterials);

    // 2. Felicidad: Base 70%
    let happiness = 70;

    // Proyectos cívicos construidos en las ciudades
    Object.values(emp.colonizedTiles).forEach(t => {
      if (t.civicProjects && t.civicProjects.length > 0) {
        t.civicProjects.forEach(projId => {
          const proj = CIVIC_PROJECTS_CATALOG.find(p => p.id === projId);
          if (proj) happiness += proj.happinessBonus;
        });
      }
    });

    // Bonificación por superávit de comida
    if (rawFoodBalance >= 10) {
      happiness += 10;
    } else if (rawFoodBalance < 0) {
      // Si la demanda sobrepasa la producción, penalización proporcional
      happiness -= Math.min(45, Math.abs(rawFoodBalance) * 2);
    }

    // Bonificación de resorts turísticos (+10% de felicidad por cada isla con resort)
    const resortCount = Object.values(emp.islandSpecializations || {}).filter(s => s === 'tourist_resort').length;
    happiness += resortCount * 10;

    // Bonificación de Maravillas Nacionales erigidas en Megaciudades (+25% de felicidad por maravilla)
    Object.values(emp.colonizedTiles).forEach(t => {
      if (t.nationalWonderBuilt) {
        happiness += 25;
      }
    });

    // Penalización si no quedan materiales de construcción
    if (emp.nationalMaterials <= 0) {
      happiness -= 10;
    }

    emp.happinessPct = Math.max(0, Math.min(100, Math.round(happiness)));
  }

  /**
   * Construye un proyecto cívico o monumento en un asentamiento
   */
  public buildCivicProject(tileId: string, projectId: string): { success: boolean; error?: string } {
    const emp = this.getEmpire();
    const tile = emp.colonizedTiles[tileId];
    if (!tile || tile.role !== 'settlement') {
      return { success: false, error: 'Esta casilla no es una ciudad o asentamiento.' };
    }

    const tier = (tile.settlementTier as number) || 1;
    const proj = CIVIC_PROJECTS_CATALOG.find(p => p.id === projectId);
    if (!proj) {
      return { success: false, error: 'Proyecto cívico no encontrado.' };
    }

    if (tier < proj.minTier) {
      return { success: false, error: `Requiere asentamiento de Nivel ${proj.minTier} o superior.` };
    }

    if (!tile.civicProjects) tile.civicProjects = [];
    if (tile.civicProjects.includes(projectId)) {
      return { success: false, error: 'Este monumento ya está construido en esta ciudad.' };
    }

    const maxSlots = tier; // 1 en Aldea, 2 en Pueblo, 3 en Ciudad, 4 en Megaciudad
    if (tile.civicProjects.length >= maxSlots) {
      return { success: false, error: `Capacidad máxima alcanzada (${maxSlots}/${maxSlots}). Mejora la ciudad para más slots.` };
    }

    if (emp.coins < proj.coinCost) {
      return { success: false, error: `Monedas insuficientes. Necesitas ${proj.coinCost} 🪙.` };
    }

    if (emp.nationalMaterials < proj.materialCost) {
      return { success: false, error: `Materiales insuficientes. Necesitas ${proj.materialCost} 🧱 (Tienes ${emp.nationalMaterials}).` };
    }

    // Cobrar costes
    emp.coins -= proj.coinCost;
    emp.nationalMaterials -= proj.materialCost;
    tile.civicProjects.push(projectId);

    this.recalculateMetrics();
    this.notify();
    return { success: true };
  }

  /**
   * Erige la Maravilla Nacional única de este país en una Megaciudad
   */
  public buildNationalWonder(tileId: string): { success: boolean; error?: string } {
    const emp = this.getEmpire();
    const tile = emp.colonizedTiles[tileId];
    const baseTile = geoGridService.getTile(tileId);
    if (!tile || tile.role !== 'settlement') {
      return { success: false, error: 'Esta casilla no es un asentamiento.' };
    }

    if ((tile.settlementTier as number) < 4) {
      return { success: false, error: 'Solo se pueden erigir Maravillas Nacionales en Megaciudades (Nivel 4).' };
    }

    if (tile.nationalWonderBuilt) {
      return { success: false, error: 'La Maravilla Nacional de este país ya ha sido erigida en esta Megaciudad.' };
    }

    const countryCode = baseTile?.countryCode || tile.countryCode || '';
    const isAnnexed = (emp.annexedCountries || []).includes(countryCode);
    if (!isAnnexed) {
      return {
        success: false,
        error: 'Debes proclamar la Anexión Soberana de este país (controlando al menos el 90% de sus casillas) antes de erigir su Maravilla Nacional.'
      };
    }

    const wonder = getCountryWonder(countryCode, baseTile?.countryName || tile.countryName);

    if (emp.coins < wonder.coinCost) {
      return { success: false, error: `Monedas insuficientes. Necesitas ${wonder.coinCost} 🪙.` };
    }

    if (emp.nationalMaterials < wonder.materialCost) {
      return { success: false, error: `Materiales insuficientes. Necesitas ${wonder.materialCost} 🧱 (Tienes ${emp.nationalMaterials}).` };
    }

    emp.coins -= wonder.coinCost;
    emp.nationalMaterials = Math.max(0, emp.nationalMaterials - wonder.materialCost);
    tile.nationalWonderBuilt = true;
    tile.nationalWonderName = wonder.name;

    this.recalculateMetrics();
    this.notify();
    return { success: true };
  }

  /**
   * Añade monedas de prueba si el usuario pulsa manualmente el botón de desarrollo
   */
  public addCheatCoins(amount: number = 100): void {
    const emp = this.getEmpire();
    emp.coins += amount;
    this.notify();
  }

  public getEmpire(): UserEmpire {
    if (!this.empire) {
      this.empire = this.createDefaultEmpire();
    }
    return this.empire;
  }

  /**
   * Calcula el coste de compra de la siguiente casilla de tierra según el progreso
   */
  public getNextTileCost(): number {
    const ownedCount = Object.keys(this.empire?.colonizedTiles || {}).length;
    if (ownedCount === 0) return 0; // La capital es gratis
    if (ownedCount < 10) return 5;
    if (ownedCount < 50) return 8;
    if (ownedCount < 200) return 12;
    if (ownedCount < 500) return 15;
    if (ownedCount < 2000) return 18;
    return 22;
  }

  /**
   * Funda la primera capital del jugador
   */
  public foundCapital(tileId: string, empireName: string, colorHex: string, cityName?: string): boolean {
    const baseTile = geoGridService.getTile(tileId);
    if (!baseTile) return false;

    const emp = this.getEmpire();
    emp.empireName = empireName.trim() || 'Mi Imperio';
    emp.colorHex = colorHex;
    emp.capitalTileId = tileId;
    emp.totalPopulation = 25; // Primeros pobladores
    emp.happinessPct = 85;

    const finalCityName = cityName?.trim() || `${baseTile.countryName || 'Ciudad'} Central`;

    emp.colonizedTiles[tileId] = {
      id: tileId,
      x: baseTile.x,
      y: baseTile.y,
      lat: baseTile.lat,
      lon: baseTile.lon,
      countryCode: baseTile.countryCode,
      countryName: baseTile.countryName,
      terrainType: baseTile.terrainType,
      isCoast: baseTile.isCoast,
      isSmallIsland: baseTile.isSmallIsland,
      islandGroupId: baseTile.islandGroupId,
      isOwned: true,
      settlementTier: 1, // Aldea inicial
      cityName: finalCityName,
      role: 'settlement',
      hasPort: false, // El puerto se debe construir tras subir a Ciudad
      slots: [
        {
          id: 'slot_1',
          name: 'Tienda de Campaña',
          category: 'housing',
          effectDescription: '+15 Población',
          populationProvided: 15
        }
      ],
      maxSlots: 2
    };

    if (baseTile.countryCode) {
      emp.localCensusByCountry[baseTile.countryCode] = 25;
    }

    this.notify();
    return true;
  }

  /**
   * Compra y anexa una casilla vecina a las que ya se poseen
   */
  /**
   * Compra y anexa una casilla vecina a las que ya se poseen
   */
  public buyTile(tileId: string, role: TileRole = 'settlement', cityName?: string): boolean {
    const emp = this.getEmpire();
    if (!emp.capitalTileId) return false;

    const baseTile = geoGridService.getTile(tileId);
    if (!baseTile) return false;
    if (emp.colonizedTiles[tileId]) return false; // Ya la posee

    // Comprobar adyacencia estricta
    const adjacent = geoGridService.getAdjacentLandTiles(tileId);
    const isAdjacentToOwned = adjacent.some(adj => emp.colonizedTiles[adj.id]);
    if (!isAdjacentToOwned) return false;

    const cost = this.getNextTileCost();
    if (emp.coins < cost) return false;

    const assignedRole = role;
    const isSettlement = assignedRole === 'settlement';

    // Fundar un nuevo poblado consume 15 materiales de construcción y requiere superávit alimentario (al menos +7 🌾)
    if (isSettlement) {
      if (emp.nationalFood < 7) return false;
      if (emp.nationalMaterials < 15) return false;
      emp.nationalMaterials = Math.max(0, emp.nationalMaterials - 15);
    }

    // Cobrar coste en monedas
    emp.coins -= cost;

    const settlementCount = Object.values(emp.colonizedTiles).filter(t => t.role === 'settlement').length;
    const defaultCityName = `${baseTile.countryName || 'Poblado'} ${settlementCount + 1}`;
    const finalCityName = isSettlement ? (cityName?.trim() || defaultCityName) : undefined;

    emp.colonizedTiles[tileId] = {
      id: tileId,
      x: baseTile.x,
      y: baseTile.y,
      lat: baseTile.lat,
      lon: baseTile.lon,
      countryCode: baseTile.countryCode,
      countryName: baseTile.countryName,
      terrainType: baseTile.terrainType,
      isCoast: baseTile.isCoast,
      isSmallIsland: baseTile.isSmallIsland,
      islandGroupId: baseTile.islandGroupId,
      isOwned: true,
      settlementTier: isSettlement ? 1 : 0,
      resourceTier: isSettlement ? undefined : 1,
      cityName: finalCityName,
      role: assignedRole,
      hasPort: false
    };

    if (assignedRole === 'settlement') {
      emp.totalPopulation += 15;
      if (baseTile.countryCode) {
        emp.localCensusByCountry[baseTile.countryCode] = (emp.localCensusByCountry[baseTile.countryCode] || 0) + 15;
      }
    } else if (assignedRole === 'resources') {
      // Cada cantera otorga +20 materiales fijos directamente al fundarse
      emp.nationalMaterials += 20;
    }

    this.recalculateMetrics();
    this.notify();
    return true;
  }

  /**
   * Renombra el Imperio
   */
  public renameEmpire(newName: string): void {
    const emp = this.getEmpire();
    emp.empireName = newName.trim() || 'Mi Imperio';
    this.notify();
  }

  /**
   * Renombra una ciudad específica
   */
  public renameCity(tileId: string, newCityName: string): void {
    const emp = this.getEmpire();
    if (emp.colonizedTiles[tileId]) {
      emp.colonizedTiles[tileId].cityName = newCityName.trim() || 'Ciudad';
      this.notify();
    }
  }

  /**
   * Comprueba los requisitos espaciales (Buscaminas) y económicos para mejorar un asentamiento
   */
  public checkUpgradeRequirements(tileId: string): UpgradeRequirementCheck | null {
    const emp = this.getEmpire();
    const tile = emp.colonizedTiles[tileId];
    if (!tile || tile.role !== 'settlement') return null;

    const currentTier = (tile.settlementTier as number) || 1;
    if (currentTier >= 4) return null; // Ya es Megaciudad

    const nextTier = currentTier + 1;

    // Costes balanceados de mejora: Monedas y Materiales
    const upgradeCosts: Record<number, { coins: number; materials: number }> = {
      1: { coins: 35, materials: 20 },   // Aldea -> Pueblo
      2: { coins: 100, materials: 60 },  // Pueblo -> Ciudad
      3: { coins: 350, materials: 180 }  // Ciudad -> Megaciudad
    };

    const costData = upgradeCosts[currentTier] ?? { coins: 999, materials: 999 };
    const coinCost = costData.coins;
    const materialCost = costData.materials;

    // Requisitos según nivel objetivo
    // Aldea -> Pueblo (req: 1 huerto, 1 cantera en radio 1)
    // Pueblo -> Ciudad (req: 2 huertos, 2 canteras, 2 asentamientos vecinos en radio 2)
    // Ciudad -> Megaciudad (req: 4 huertos, 3 canteras, 5 Ciudades Tier >= 3 en radio 2)
    const reqsByTier: Record<number, { radius: number; crops: number; resources: number; settlements: number; surroundingCities: number }> = {
      2: { radius: 1, crops: 1, resources: 1, settlements: 0, surroundingCities: 0 },
      3: { radius: 2, crops: 2, resources: 2, settlements: 2, surroundingCities: 0 },
      4: { radius: 2, crops: 4, resources: 3, settlements: 5, surroundingCities: 5 }
    };

    const req = reqsByTier[nextTier] || { radius: 1, crops: 1, resources: 1, settlements: 0, surroundingCities: 0 };

    let cropsCount = 0;
    let resCount = 0;
    let settlementsCount = 0;
    let surroundingCitiesCount = 0;

    const tx = tile.x ?? 0;
    const ty = tile.y ?? 0;

    for (let dx = -req.radius; dx <= req.radius; dx++) {
      for (let dy = -req.radius; dy <= req.radius; dy++) {
        if (dx === 0 && dy === 0) continue; // No contarse a sí mismo
        const adj = geoGridService.getTileByXY(tx + dx, ty + dy);
        if (adj && emp.colonizedTiles[adj.id]) {
          const adjTile = emp.colonizedTiles[adj.id];
          const role = adjTile?.role;
          if (role === 'crops') cropsCount++;
          if (role === 'resources') resCount++;
          if (role === 'settlement') {
            settlementsCount++;
            if ((adjTile?.settlementTier || 0) >= 3) {
              surroundingCitiesCount++;
            }
          }
        }
      }
    }

    // Para Megaciudad:
    // 1. Separación con otras Megaciudades (mínimo 5 casillas)
    // 2. Máximo 1 Megaciudad por país real (countryCode)
    let hasMegacityDistanceCheck = true;
    let hasSingleMegacityPerCountry = true;
    if (nextTier === 4) {
      const currentCountry = tile.countryCode;
      for (const otherTile of Object.values(emp.colonizedTiles)) {
        if (otherTile.id !== tileId && otherTile.role === 'settlement' && otherTile.settlementTier === 4) {
          const dist = Math.hypot((otherTile.x ?? 0) - tx, (otherTile.y ?? 0) - ty);
          if (dist <= 5) {
            hasMegacityDistanceCheck = false;
          }
          if (currentCountry && otherTile.countryCode === currentCountry) {
            hasSingleMegacityPerCountry = false;
          }
        }
      }
    }

    // Requisito de superávit de comida por nuevo salto demográfico (+25 hab -> 12 🌾, +60 hab -> 30 🌾, +150 hab -> 75 🌾)
    const foodSurplusNeededByTier: Record<number, number> = { 2: 12, 3: 30, 4: 75 };
    const requiredFoodSurplus = foodSurplusNeededByTier[nextTier] || 12;
    const hasEnoughFoodSurplus = emp.nationalFood >= requiredFoodSurplus;

    const hasEnoughCoins = emp.coins >= coinCost;
    const hasEnoughMaterials = emp.nationalMaterials >= materialCost;
    const hasNoFoodDeficit = emp.nationalFood >= 0;
    const hasEnoughCrops = cropsCount >= req.crops;
    const hasEnoughResources = resCount >= req.resources;
    const hasEnoughSettlements = settlementsCount >= req.settlements;
    const hasEnoughSurroundingCities = surroundingCitiesCount >= req.surroundingCities;

    const canUpgrade = hasEnoughCoins &&
      hasEnoughMaterials &&
      hasEnoughFoodSurplus &&
      hasNoFoodDeficit &&
      hasEnoughCrops &&
      hasEnoughResources &&
      hasEnoughSettlements &&
      hasEnoughSurroundingCities &&
      hasMegacityDistanceCheck &&
      hasSingleMegacityPerCountry;

    return {
      currentTier,
      nextTier,
      coinCost,
      hasEnoughCoins,
      materialCost,
      hasEnoughMaterials,
      hasNoFoodDeficit,
      requiredFoodSurplus,
      currentFoodSurplus: emp.nationalFood,
      hasEnoughFoodSurplus,
      requiredCrops: req.crops,
      currentCrops: cropsCount,
      hasEnoughCrops,
      requiredResources: req.resources,
      currentResources: resCount,
      hasEnoughResources,
      requiredSettlements: req.settlements,
      currentSettlements: settlementsCount,
      hasEnoughSettlements,
      requiredSurroundingCities: req.surroundingCities,
      currentSurroundingCities: surroundingCitiesCount,
      hasEnoughSurroundingCities,
      hasMegacityDistanceCheck,
      hasSingleMegacityPerCountry,
      canUpgrade,
      radius: req.radius
    };
  }

  /**
   * Mejora un asentamiento al siguiente nivel si cumple los requisitos espaciales y de monedas
   */
  public upgradeSettlement(tileId: string): boolean {
    const check = this.checkUpgradeRequirements(tileId);
    if (!check || !check.canUpgrade) return false;

    const emp = this.getEmpire();
    const tile = emp.colonizedTiles[tileId];
    if (!tile) return false;

    emp.coins -= check.coinCost;
    emp.nationalMaterials = Math.max(0, emp.nationalMaterials - check.materialCost);
    tile.settlementTier = check.nextTier as 1 | 2 | 3 | 4;

    // Bonificación de censo de población al subir nivel urbano
    const popBonusByTier: Record<number, number> = { 2: 25, 3: 60, 4: 150 };
    const bonus = popBonusByTier[check.nextTier] || 25;
    emp.totalPopulation += bonus;
    if (tile.countryCode) {
      emp.localCensusByCountry[tile.countryCode] = (emp.localCensusByCountry[tile.countryCode] || 0) + bonus;
    }

    this.recalculateMetrics();
    this.notify();
    return true;
  }

  /**
   * Convierte cualquier casilla colonizada no-asentamiento (huerto, cantera o tierra libre) en un Asentamiento (Aldea).
   */
  public convertToSettlement(tileId: string, cityName?: string): boolean {
    const emp = this.getEmpire();
    const tileData = emp.colonizedTiles[tileId];
    const baseTile = geoGridService.getTile(tileId);
    if (!tileData || !baseTile || tileData.role === 'settlement') return false;

    const cost = 20; // Coste de fundar un asentamiento
    if (emp.coins < cost) return false;
    if (emp.nationalFood < 7) return false; // Requiere superávit alimentario para los 15 nuevos pobladores
    if (emp.nationalMaterials < 15) return false; // Requiere 15 materiales de obra

    emp.coins -= cost;
    emp.nationalMaterials = Math.max(0, emp.nationalMaterials - 15);
    tileData.role = 'settlement';
    tileData.settlementTier = 1;
    tileData.resourceTier = undefined;
    tileData.hasPort = false;
    tileData.cityName = cityName?.trim() || `${baseTile.countryName || 'Poblado'} ${Object.values(emp.colonizedTiles).filter(t => t.role === 'settlement').length + 1}`;
    emp.totalPopulation += 15;
    if (baseTile.countryCode) {
      emp.localCensusByCountry[baseTile.countryCode] = (emp.localCensusByCountry[baseTile.countryCode] || 0) + 15;
    }

    this.recalculateMetrics();
    this.notify();
    return true;
  }

  /**
   * Construye un Puerto en una Ciudad costera (tier >= 3)
   */
  public buildPort(tileId: string): boolean {
    const emp = this.getEmpire();
    const tile = emp.colonizedTiles[tileId];
    const baseTile = geoGridService.getTile(tileId);
    if (!tile || !baseTile) return false;
    if (tile.role !== 'settlement') return false;
    if ((tile.settlementTier as number) < 3) return false; // Mínimo Ciudad
    if (!baseTile.isCoast) return false;
    if (tile.hasPort) return false; // Ya tiene puerto

    const cost = 50;
    if (emp.coins < cost) return false;

    emp.coins -= cost;
    tile.hasPort = true;

    this.notify();
    return true;
  }

  /**
   * Obtiene las estadísticas de soberanía y censo desglosadas por país
   */
  public getSovereigntyStats(): CountrySovereigntyInfo[] {
    const emp = this.getEmpire();
    const map: Record<string, CountrySovereigntyInfo> = {};

    Object.values(emp.colonizedTiles).forEach(tile => {
      const code = tile.countryCode || 'DESCONOCIDO';
      const name = tile.countryName || 'Territorio Libre';

      if (!map[code]) {
        map[code] = {
          countryCode: code,
          countryName: name,
          tileCount: 0,
          population: 0,
          highestTier: 0,
          settlementsCount: 0,
          hasPort: false,
          sovereigntyRank: 1,
          rankLabel: '🥉 Reclamado'
        };
      }

      map[code].tileCount += 1;
      if (tile.hasPort) map[code].hasPort = true;

      if (tile.role === 'settlement' || (tile.settlementTier && tile.settlementTier > 0)) {
        map[code].settlementsCount += 1;
        const tier = tile.settlementTier || 1;
        if (tier > map[code].highestTier) {
          map[code].highestTier = tier;
        }
      }
    });

    Object.keys(map).forEach(code => {
      map[code].population = emp.localCensusByCountry[code] || (map[code].settlementsCount * 15);

      if (map[code].tileCount >= 15 && map[code].highestTier >= 3) {
        map[code].sovereigntyRank = 3;
        map[code].rankLabel = '🥇 Soberanía Dorada';
      } else if (map[code].tileCount >= 5 && map[code].highestTier >= 2) {
        map[code].sovereigntyRank = 2;
        map[code].rankLabel = '🥈 Desarrollado';
      } else {
        map[code].sovereigntyRank = 1;
        map[code].rankLabel = '🥉 Reclamado';
      }
    });

    return Object.values(map).sort((a, b) => b.tileCount - a.tileCount);
  }

  /**
   * Añade monedas al tesoro (para recompensas de rankeds/diario)
   */
  public addCoins(amount: number): void {
    const emp = this.getEmpire();
    emp.coins += amount;
    this.notify();
  }

  /**
   * Obtiene los límites y cupos actuales de especialización insular basados en la escala progresiva de población
   */
  public getIslandSpecializationLimits(): {
    counts: Record<IslandSpecialization, number>;
    maxAllowed: number;
    nextPopRequired: number;
  } {
    const emp = this.getEmpire();
    const counts: Record<IslandSpecialization, number> = {
      tourist_resort: 0,
      fiscal_paradise: 0,
      naval_hub: 0
    };

    Object.values(emp.islandSpecializations || {}).forEach(spec => {
      if (counts[spec] !== undefined) {
        counts[spec] += 1;
      }
    });

    // Escala progresiva y exigente de hitos poblacionales
    const POPULATION_THRESHOLDS = [150, 1200, 3000, 7500, 15000, 30000, 60000, 100000];
    let maxAllowed = 0;
    let nextPopRequired = POPULATION_THRESHOLDS[0];

    for (let i = 0; i < POPULATION_THRESHOLDS.length; i++) {
      if (emp.totalPopulation >= POPULATION_THRESHOLDS[i]) {
        maxAllowed = i + 1;
        nextPopRequired = POPULATION_THRESHOLDS[i + 1] ?? 999999;
      } else {
        nextPopRequired = POPULATION_THRESHOLDS[i];
        break;
      }
    }

    return { counts, maxAllowed, nextPopRequired };
  }

  /**
   * Comprueba si una isla puede adoptar una especialización cumpliendo:
   * 1. Restricción 7x7: ninguna otra isla especializada a <= 7 casillas de distancia.
   * 2. Cupo por población imperial (1 cada 50 habitantes).
   */
  public canSetIslandSpecialization(islandGroupId: string, spec: IslandSpecialization): { canSet: boolean; reason?: string } {
    const emp = this.getEmpire();
    const currentSpec = emp.islandSpecializations?.[islandGroupId];
    if (currentSpec === spec) {
      return { canSet: true };
    }

    // 1. Restricción espacial 7x7 entre islas especializadas
    const currentIslandTiles = geoGridService.getTilesByIslandGroup(islandGroupId);
    const existingGroupIds = Object.keys(emp.islandSpecializations || {}).filter(id => id !== islandGroupId);

    for (const otherGroupId of existingGroupIds) {
      const otherTiles = geoGridService.getTilesByIslandGroup(otherGroupId);
      for (const t1 of currentIslandTiles) {
        for (const t2 of otherTiles) {
          const dx = Math.abs(t1.x - t2.x);
          const dy = Math.abs(t1.y - t2.y);
          if (dx <= 7 && dy <= 7) {
            return {
              canSet: false,
              reason: 'Existe otra isla especializada a menos de 7 casillas de distancia (se requiere separación de 7x7).'
            };
          }
        }
      }
    }

    // 2. Restricción de cupo por población
    const { counts, maxAllowed, nextPopRequired } = this.getIslandSpecializationLimits();
    const currentCount = counts[spec] || 0;
    if (currentCount >= maxAllowed) {
      return {
        canSet: false,
        reason: `Límite alcanzado (${currentCount}/${maxAllowed}). Necesitas ${nextPopRequired} habitantes en tu imperio para construir otro.`
      };
    }

    return { canSet: true };
  }

  /**
   * Fija la especialización de una isla pequeña si cumple todas las reglas
   */
  public setIslandSpecialization(islandGroupId: string, spec: IslandSpecialization): { success: boolean; error?: string } {
    const check = this.canSetIslandSpecialization(islandGroupId, spec);
    if (!check.canSet) {
      return { success: false, error: check.reason };
    }

    const emp = this.getEmpire();
    if (!emp.islandSpecializations) emp.islandSpecializations = {};
    emp.islandSpecializations[islandGroupId] = spec;

    // En islas pequeñas, la especialización activa directamente el asentamiento principal
    const islandTiles = geoGridService.getTilesByIslandGroup(islandGroupId);
    let mainSettlement = islandTiles.find(t => emp.colonizedTiles[t.id]?.role === 'settlement')
      || islandTiles.find(t => emp.colonizedTiles[t.id]);

    if (mainSettlement && emp.colonizedTiles[mainSettlement.id]) {
      const colData = emp.colonizedTiles[mainSettlement.id];
      colData.role = 'settlement';
      if (!colData.settlementTier || colData.settlementTier < 2) {
        colData.settlementTier = 2; // Pueblo insular portuario
      }
      if (spec === 'naval_hub') {
        colData.hasPort = true; // Puerto desbloqueado y activo con 3 muelles
        emp.freeExpeditions = (emp.freeExpeditions || 0) + 1; // 1 expedición gratis!
        if (!colData.cityName || colData.cityName.includes('Costera') || colData.cityName.includes('Poblado')) {
          colData.cityName = `${mainSettlement.countryName} Hub Naval`;
        }
      } else if (spec === 'tourist_resort') {
        if (!colData.cityName || colData.cityName.includes('Costera') || colData.cityName.includes('Poblado')) {
          colData.cityName = `${mainSettlement.countryName} Resort`;
        }
      } else if (spec === 'fiscal_paradise') {
        if (!colData.cityName || colData.cityName.includes('Costera') || colData.cityName.includes('Poblado')) {
          colData.cityName = `${mainSettlement.countryName} Banco Offshore`;
        }
      }
    }

    this.recalculateMetrics();
    this.notify();
    return { success: true };
  }

  /**
   * Convierte el rol de una casilla colonizada (por ejemplo a Huerto 🌾, Cantera 🌲 o Central ⚡)
   */
  public convertTileRole(tileId: string, newRole: TileRole): boolean {
    const emp = this.getEmpire();
    const tileData = emp.colonizedTiles[tileId];
    if (!tileData || tileData.role === newRole) return false;

    // No permitir desmantelar la capital imperial
    if (tileId === emp.capitalTileId && newRole !== 'settlement') return false;

    // Si se quiere convertir a asentamiento, exigir superávit alimentario
    if (newRole === 'settlement' && emp.nationalFood < 7) return false;

    // Restar balances del rol anterior
    if (tileData.role === 'crops') {
      emp.nationalFood = Math.max(0, emp.nationalFood - 15);
    } else if (tileData.role === 'resources') {
      const rTier = tileData.resourceTier || 1;
      const matDeduction = rTier === 3 ? 130 : rTier === 2 ? 55 : 20;
      emp.nationalMaterials = Math.max(0, emp.nationalMaterials - matDeduction);
    } else if (tileData.role === 'settlement') {
      emp.totalPopulation = Math.max(0, emp.totalPopulation - 15);
      if (tileData.countryCode) {
        emp.localCensusByCountry[tileData.countryCode] = Math.max(0, (emp.localCensusByCountry[tileData.countryCode] || 15) - 15);
      }
    }

    // Sumar balances del nuevo rol
    if (newRole === 'crops') {
      emp.nationalFood += 15;
    } else if (newRole === 'resources') {
      emp.nationalMaterials += 20; // +20 materiales fijos directos
    } else if (newRole === 'settlement') {
      emp.totalPopulation += 15;
      if (tileData.countryCode) {
        emp.localCensusByCountry[tileData.countryCode] = (emp.localCensusByCountry[tileData.countryCode] || 0) + 15;
      }
    }

    tileData.role = newRole;
    if (newRole !== 'settlement') {
      tileData.settlementTier = 0;
      tileData.hasPort = false;
      tileData.resourceTier = 1;
    } else {
      if (!tileData.settlementTier) tileData.settlementTier = 1;
      tileData.resourceTier = undefined;
    }

    this.recalculateMetrics();
    this.notify();
    return true;
  }

  /**
   * Comprueba los requisitos espaciales (vecinos contiguos / 3x3) y económicos para mejorar un Huerto o Cantera
   * - Nivel 2: Requiere al menos 2 casillas vecinas del mismo tipo (alrededor).
   * - Nivel 3: Requiere que todo el área 3x3 de alrededor (8 casillas contiguas) sea del mismo tipo.
   */
  public checkResourceUpgradeRequirements(tileId: string): ResourceUpgradeCheck | null {
    const emp = this.getEmpire();
    const tile = emp.colonizedTiles[tileId];
    if (!tile) return null;
    if (tile.role !== 'crops' && tile.role !== 'resources') return null;

    const role = tile.role;
    const currentTier = tile.resourceTier || 1;
    if (currentTier >= 3) {
      return {
        currentTier,
        nextTier: 3,
        coinCost: 0,
        hasEnoughCoins: true,
        sameTypeNeighbors: 8,
        requiredNeighbors: 8,
        hasRequiredNeighbors: true,
        canUpgrade: false,
        role,
        error: 'Esta casilla ya está en su nivel máximo (Nivel 3).'
      };
    }

    const nextTier = currentTier + 1;
    const coinCost = role === 'crops'
      ? (nextTier === 2 ? 25 : 60)
      : (nextTier === 2 ? 30 : 75);

    const hasEnoughCoins = emp.coins >= coinCost;

    // Contar vecinos del mismo tipo en el radio 1 (8 casillas alrededor en cuadrícula 3x3)
    const tx = tile.x ?? 0;
    const ty = tile.y ?? 0;
    let sameTypeNeighbors = 0;

    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;
        const adj = geoGridService.getTileByXY(tx + dx, ty + dy);
        if (adj && emp.colonizedTiles[adj.id]) {
          const adjTile = emp.colonizedTiles[adj.id];
          if (adjTile?.role === role) {
            sameTypeNeighbors++;
          }
        }
      }
    }

    const requiredNeighbors = nextTier === 2 ? 2 : 8;
    const hasRequiredNeighbors = sameTypeNeighbors >= requiredNeighbors;
    const canUpgrade = hasEnoughCoins && hasRequiredNeighbors;

    let error: string | undefined;
    if (!hasRequiredNeighbors) {
      const typeName = role === 'crops' ? 'huertos' : 'bosques/canteras';
      if (nextTier === 2) {
        error = `Requiere al menos 2 ${typeName} contiguos alrededor (tienes ${sameTypeNeighbors}/2).`;
      } else {
        error = `Requiere estar en el centro de un 3x3 completo de ${typeName} (tienes ${sameTypeNeighbors}/8 alrededor).`;
      }
    } else if (!hasEnoughCoins) {
      error = `Monedas insuficientes. Necesitas ${coinCost} 🪙 (tienes ${emp.coins} 🪙).`;
    }

    return {
      currentTier,
      nextTier,
      coinCost,
      hasEnoughCoins,
      sameTypeNeighbors,
      requiredNeighbors,
      hasRequiredNeighbors,
      canUpgrade,
      role,
      error
    };
  }

  /**
   * Mejora un Huerto (🌾 crops) o Cantera (🌲 resources) a Nivel 2 o Nivel 3
   */
  public upgradeResourceTile(tileId: string): { success: boolean; error?: string } {
    const check = this.checkResourceUpgradeRequirements(tileId);
    if (!check) {
      return { success: false, error: 'Casilla no colonizada o no es Huerto ni Cantera.' };
    }

    if (!check.canUpgrade) {
      return { success: false, error: check.error || 'No cumple los requisitos para mejorar.' };
    }

    const emp = this.getEmpire();
    const tile = emp.colonizedTiles[tileId];
    if (!tile) {
      return { success: false, error: 'Casilla no colonizada.' };
    }

    emp.coins -= check.coinCost;
    if (tile.role === 'resources') {
      const addedMaterials = check.nextTier === 2 ? 35 : 75;
      emp.nationalMaterials += addedMaterials;
    }
    tile.resourceTier = check.nextTier as 1 | 2 | 3;

    this.recalculateMetrics();
    this.notify();
    return { success: true };
  }

  /**
   * Obtiene el estado de soberanía y progreso de anexión formal de un país real
   */
  public getCountryAnnexationStatus(countryCode?: string): {
    countryCode: string;
    totalCount: number;
    ownedCount: number;
    percentage: number;
    isAnnexed: boolean;
    canAnnex: boolean;
  } {
    if (!countryCode) {
      return { countryCode: '', totalCount: 0, ownedCount: 0, percentage: 0, isAnnexed: false, canAnnex: false };
    }

    const emp = this.getEmpire();
    const isAnnexed = (emp.annexedCountries || []).includes(countryCode);
    const totalCount = geoGridService.getCountryTotalTiles(countryCode) || 1;

    let ownedCount = 0;
    Object.values(emp.colonizedTiles).forEach(t => {
      if (t.countryCode === countryCode) {
        ownedCount++;
      }
    });

    const percentage = Math.min(100, Math.round((ownedCount / totalCount) * 100));
    const canAnnex = !isAnnexed && (ownedCount / totalCount) >= 0.90;

    return {
      countryCode,
      totalCount,
      ownedCount,
      percentage,
      isAnnexed,
      canAnnex
    };
  }

  /**
   * Proclama formalmente la Anexión Soberana de un país (requiere controlar >= 90% de sus casillas)
   */
  public annexCountry(countryCode: string): { success: boolean; error?: string } {
    const status = this.getCountryAnnexationStatus(countryCode);
    if (status.isAnnexed) {
      return { success: false, error: 'Este país ya ha sido formalmente anexionado.' };
    }
    if (!status.canAnnex) {
      return { success: false, error: `Se requiere controlar al menos el 90% de las casillas del país (progreso actual: ${status.percentage}%).` };
    }

    const emp = this.getEmpire();
    if (!emp.annexedCountries) emp.annexedCountries = [];
    emp.annexedCountries.push(countryCode);

    this.recalculateMetrics();
    this.notify();
    return { success: true };
  }

  /**
   * Obtiene la especialización de una isla
   */
  public getIslandSpecialization(islandGroupId: string): IslandSpecialization | undefined {
    return this.getEmpire().islandSpecializations?.[islandGroupId];
  }

  /**
   * Obtiene el rango máximo de navegación (en casillas de agua) según el nivel del asentamiento de origen
   */
  public getMaxNavalRange(tileId: string): number {
    const emp = this.getEmpire();
    const tile = emp.colonizedTiles[tileId];
    if (!tile) return 20;

    const tier = (tile.settlementTier as number) || 1;
    if (tier >= 4) return Infinity; // Megaciudad: Ilimitado global
    if (tier >= 3) return 45;       // Ciudad: 45 casillas de agua

    return 20; // Pueblo portuario / Hub Naval: 20 casillas
  }

  /**
   * Obtiene la lista de todos los puertos construidos del jugador
   */
  public getAllPorts(): {
    tileId: string;
    tile: GridTile;
    cityName: string;
    docksAvailable: number;
    maxDocks: number;
    isNavalHub: boolean;
  }[] {
    const emp = this.getEmpire();
    const ports: any[] = [];
    const activeExps = (emp.expeditions || []).filter(e => e.status === 'sailing');

    Object.entries(emp.colonizedTiles).forEach(([id, tileData]) => {
      if (tileData.hasPort) {
        const baseTile = geoGridService.getTile(id);
        if (baseTile) {
          const isNavalHub = baseTile.islandGroupId 
            ? emp.islandSpecializations?.[baseTile.islandGroupId] === 'naval_hub'
            : false;
          const maxDocks = isNavalHub ? 3 : 1;
          const occupied = activeExps.filter(e => e.originTileId === id).length;

          ports.push({
            tileId: id,
            tile: { ...baseTile, ...tileData },
            cityName: tileData.cityName || baseTile.countryName || 'Puerto',
            docksAvailable: Math.max(0, maxDocks - occupied),
            maxDocks,
            isNavalHub
          });
        }
      }
    });

    return ports;
  }

  /**
   * Calcula los parámetros de coste, ruta y tiempo de una expedición entre dos casillas
   */
  public calculateExpeditionParams(originTileId: string, destTileId: string): {
    distance: number;
    coinCost: number;
    durationSec: number;
    durationMs: number;
    route: { x: number; y: number }[];
    outOfRange: boolean;
    maxRange: number;
    isFree: boolean;
    viaHubId?: string;
  } | null {
    const origin = geoGridService.getTile(originTileId);
    const dest = geoGridService.getTile(destTileId);
    if (!origin || !dest) return null;

    const emp = this.getEmpire();
    const maxRange = this.getMaxNavalRange(originTileId);

    // 1. Intentar ruta A* marítima directa
    let route = geoGridService.findSeaRoute(origin.x, origin.y, dest.x, dest.y);
    let viaHubId: string | undefined = undefined;

    if (!route) {
      return null;
    }

    let dist = route.length;
    let outOfRange = dist > maxRange;

    // 2. Si excede el rango, comprobar si puede hacer escala en un Hub Naval que posea el jugador
    if (outOfRange) {
      const ownedHubs = Object.values(emp.colonizedTiles).filter(t => {
        if (!t.hasPort || !t.islandGroupId) return false;
        return emp.islandSpecializations?.[t.islandGroupId] === 'naval_hub' && t.id !== originTileId && t.id !== destTileId;
      });

      for (const hub of ownedHubs) {
        const leg1 = geoGridService.findSeaRoute(origin.x, origin.y, hub.x ?? 0, hub.y ?? 0);
        if (leg1 && leg1.length <= maxRange) {
          const leg2 = geoGridService.findSeaRoute(hub.x ?? 0, hub.y ?? 0, dest.x, dest.y);
          if (leg2 && leg2.length <= maxRange) {
            // Escala exitosa: el Hub Naval resetea el contador de casillas
            route = [...leg1, ...leg2.slice(1)];
            dist = route.length;
            viaHubId = hub.id;
            outOfRange = false;
            break;
          }
        }
      }
    }

    const isFree = (emp.freeExpeditions || 0) > 0;
    const coinCost = isFree ? 0 : Math.min(150, Math.max(25, Math.round(20 + dist * 0.5)));
    // Navegación náutica pausada "de chill": navegación suave a ~1.1s por celda de mar
    const durationSec = Math.min(85, Math.max(22, Math.round(18 + dist * 1.1)));

    return {
      distance: dist,
      coinCost,
      durationSec,
      durationMs: durationSec * 1000,
      route,
      outOfRange,
      maxRange,
      isFree,
      viaHubId
    };
  }

  /**
   * Fleta una expedición naval desde un puerto hacia una casilla costera
   */
  public launchExpedition(originTileId: string, destTileId: string): {
    success: boolean;
    error?: string;
    expedition?: NavalExpedition;
  } {
    const emp = this.getEmpire();
    const originTile = geoGridService.getTile(originTileId);
    const destTile = geoGridService.getTile(destTileId);

    if (!originTile || !destTile) {
      return { success: false, error: 'Casillas no encontradas en el mapa geográfico' };
    }

    const originColData = emp.colonizedTiles[originTileId];
    if (!originColData?.hasPort) {
      return { success: false, error: 'El punto de origen debe ser una ciudad con Puerto construido' };
    }

    if (!destTile.isCoast && !destTile.isSmallIsland) {
      return { success: false, error: 'La casilla de destino debe tener acceso al mar (ser costa o isla)' };
    }

    if (emp.colonizedTiles[destTileId]) {
      return { success: false, error: 'La casilla de destino ya pertenece a tu imperio' };
    }

    // Verificar muelles libres
    const ports = this.getAllPorts();
    const currentPort = ports.find(p => p.tileId === originTileId);
    if (!currentPort || currentPort.docksAvailable <= 0) {
      return { success: false, error: 'Todos los muelles de este puerto están ocupados con barcos fletados' };
    }

    const params = this.calculateExpeditionParams(originTileId, destTileId);
    if (!params) return { success: false, error: 'No existe una ruta de agua navegable hacia este destino.' };

    if (params.outOfRange) {
      const rangeText = isFinite(params.maxRange) ? `${params.maxRange} casillas` : 'Ilimitado';
      return {
        success: false,
        error: `Destino fuera de alcance (${params.distance} casillas navegadas, máx: ${rangeText}). Establece un Hub Naval intermedio como escala o mejora el asentamiento a Megaciudad.`
      };
    }

    if (!params.isFree && emp.coins < params.coinCost) {
      return { success: false, error: `Monedas insuficientes. Necesitas ${params.coinCost} 🪙` };
    }

    if (params.isFree) {
      emp.freeExpeditions = Math.max(0, (emp.freeExpeditions || 1) - 1);
    } else {
      emp.coins -= params.coinCost;
    }

    const now = Date.now();
    const expedition: NavalExpedition = {
      id: `exp_${now}_${Math.random().toString(36).substring(2, 6)}`,
      originTileId,
      destinationTileId: destTileId,
      destCountryName: destTile.countryName || 'Ultramar',
      originCoords: { x: originTile.x, y: originTile.y },
      destCoords: { x: destTile.x, y: destTile.y },
      departureTime: now,
      arrivalTime: now + params.durationMs,
      status: 'sailing',
      route: params.route,
      totalDistance: params.distance,
      viaHubId: params.viaHubId
    };

    if (!emp.expeditions) emp.expeditions = [];
    emp.expeditions.push(expedition);

    this.notify();
    return { success: true, expedition };
  }

  /**
   * Comprueba el estado de las expediciones y coloniza automáticamente al llegar
   */
  public checkAndUpdateExpeditions(): boolean {
    const emp = this.getEmpire();
    if (!emp.expeditions || emp.expeditions.length === 0) return false;

    let hasChanges = false;
    const now = Date.now();

    emp.expeditions.forEach(exp => {
      if (exp.status === 'sailing' && now >= exp.arrivalTime) {
        exp.status = 'arrived';
        exp.completedAt = now;
        hasChanges = true;

        // Colonizar casilla de destino como nuevo asentamiento costero (Tier 1)
        const destTile = geoGridService.getTile(exp.destinationTileId);
        if (destTile && !emp.colonizedTiles[exp.destinationTileId]) {
          emp.colonizedTiles[exp.destinationTileId] = {
            id: exp.destinationTileId,
            x: destTile.x,
            y: destTile.y,
            lat: destTile.lat,
            lon: destTile.lon,
            countryCode: destTile.countryCode,
            countryName: destTile.countryName,
            terrainType: destTile.terrainType,
            isCoast: destTile.isCoast,
            isSmallIsland: destTile.isSmallIsland,
            islandGroupId: destTile.islandGroupId,
            isOwned: true,
            role: 'settlement',
            settlementTier: 1,
            cityName: `${destTile.countryName || 'Nueva'} Costera`,
            hasPort: false,
            slots: []
          };

          // Aumentar población y censo
          emp.totalPopulation += 15;
          const code = destTile.countryCode || 'DESCONOCIDO';
          emp.localCensusByCountry[code] = (emp.localCensusByCountry[code] || 0) + 15;
          this.recalculateMetrics();
        }
      } else if (exp.status === 'arrived' && exp.completedAt && (now - exp.completedAt >= 5000)) {
        // Una vez que la estela se ha desvanecido desde el origen (5s), limpiar
        exp.status = 'claimed';
        hasChanges = true;
      }
    });

    // Limpiar expediciones claimed que hayan completado el desvanecimiento
    const prevCount = emp.expeditions.length;
    emp.expeditions = emp.expeditions.filter(e => e.status !== 'claimed' || (e.completedAt && (now - e.completedAt < 6000)));
    if (emp.expeditions.length !== prevCount) {
      hasChanges = true;
    }

    if (hasChanges) {
      this.notify();
    }
    return hasChanges;
  }

  /**
   * Acelera una expedición naval para que complete su viaje de inmediato
   */
  public speedUpExpedition(expeditionId: string): boolean {
    const emp = this.getEmpire();
    const exp = (emp.expeditions || []).find(e => e.id === expeditionId);
    if (!exp || exp.status !== 'sailing') return false;

    exp.arrivalTime = Date.now() - 1000;
    return this.checkAndUpdateExpeditions();
  }

  /**
   * Reestablece el imperio para pruebas
   */
  public resetEmpire(): void {
    this.empire = this.createDefaultEmpire();
    this.notify();
  }

  // --- SISTEMA DE MISIONES GUIADAS (TUTORIAL PASO A PASO) ---

  public getTutorialMissions(): TutorialMission[] {
    return TUTORIAL_MISSIONS;
  }

  public isMissionCompleted(missionId: string): boolean {
    if (!this.empire) return false;
    const tiles = Object.values(this.empire.colonizedTiles || {});

    switch (missionId) {
      case 'mission_1_capital':
        return Boolean(this.empire.capitalTileId) || tiles.length > 0;
      case 'mission_2_crops':
        return tiles.some(t => t.role === 'crops');
      case 'mission_3_quarry':
        return tiles.some(t => t.role === 'resources');
      case 'mission_4_crop_upgrade':
        return tiles.some(t => t.role === 'crops' && (t.resourceTier || 1) >= 2);
      case 'mission_5_town':
        return tiles.some(t => (t.role === 'settlement' || (t.settlementTier && t.settlementTier >= 2)) && (t.settlementTier || 1) >= 2);
      case 'mission_6_port':
        return tiles.some(t => t.hasPort || t.role === 'port');
      case 'mission_7_expedition':
        return Boolean(this.empire.expeditions && this.empire.expeditions.length > 0);
      case 'mission_8_wonder':
        return Boolean(this.empire.annexedCountries && this.empire.annexedCountries.length > 0) ||
               tiles.some(t => t.nationalWonderBuilt || t.settlementTier === 4);
      default:
        return false;
    }
  }

  public isMissionClaimed(missionId: string): boolean {
    return Boolean(this.empire?.claimedMissions?.includes(missionId));
  }

  public claimMissionReward(missionId: string): boolean {
    if (!this.empire) return false;
    if (this.isMissionClaimed(missionId)) return false;
    if (!this.isMissionCompleted(missionId)) return false;

    const mission = TUTORIAL_MISSIONS.find(m => m.id === missionId);
    if (!mission) return false;

    if (!this.empire.claimedMissions) this.empire.claimedMissions = [];
    this.empire.claimedMissions.push(missionId);

    // Otorgar recompensas
    this.empire.coins += mission.reward.coins;
    if (mission.reward.materials) {
      this.empire.nationalMaterials += mission.reward.materials;
    }
    if (mission.reward.food) {
      this.empire.nationalFood += mission.reward.food;
    }
    if (mission.reward.freeExpeditions) {
      this.empire.freeExpeditions = (this.empire.freeExpeditions || 0) + mission.reward.freeExpeditions;
    }

    // Efectos de sonido
    empireSound.playMissionSuccess();
    setTimeout(() => empireSound.playCoinClink(), 300);

    this.debouncedSave(true);
    this.notify();
    return true;
  }
}

export interface CountrySovereigntyInfo {
  countryCode: string;
  countryName: string;
  tileCount: number;
  population: number;
  highestTier: number;
  settlementsCount: number;
  hasPort: boolean;
  sovereigntyRank: 1 | 2 | 3;
  rankLabel: string;
}

export interface UpgradeRequirementCheck {
  currentTier: number;
  nextTier: number;
  coinCost: number;
  hasEnoughCoins: boolean;
  materialCost: number;
  hasEnoughMaterials: boolean;
  hasNoFoodDeficit: boolean;
  requiredFoodSurplus: number;
  currentFoodSurplus: number;
  hasEnoughFoodSurplus: boolean;
  requiredCrops: number;
  currentCrops: number;
  hasEnoughCrops: boolean;
  requiredResources: number;
  currentResources: number;
  hasEnoughResources: boolean;
  requiredSettlements: number;
  currentSettlements: number;
  hasEnoughSettlements: boolean;
  requiredSurroundingCities: number;
  currentSurroundingCities: number;
  hasEnoughSurroundingCities: boolean;
  hasMegacityDistanceCheck: boolean;
  hasSingleMegacityPerCountry: boolean;
  canUpgrade: boolean;
  radius: number;
}

export interface ResourceUpgradeCheck {
  currentTier: number;
  nextTier: number;
  coinCost: number;
  hasEnoughCoins: boolean;
  sameTypeNeighbors: number;
  requiredNeighbors: number;
  hasRequiredNeighbors: boolean;
  canUpgrade: boolean;
  role: 'crops' | 'resources';
  error?: string;
}

export const empireStorageService = new EmpireStorageService();

