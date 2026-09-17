export type TerrainType = 'plain' | 'mountain' | 'coast' | 'desert';

export type TileRole = 
  | 'empty'        // Casilla no desarrollada aún
  | 'settlement'   // Asentamiento (Aldea, Pueblo, Ciudad, Megaciudad)
  | 'crops'        // 🌾 Cultivos / Comida
  | 'resources'    // 🌲 Bosque / Cantera / Materiales
  | 'energy'       // ⚡ Central Eléctrica
  | 'port'         // ⚓ Puerto Comercial / Pesca
  | 'hotel'        // 🏖️ Resort / Hotel (Isla Turística)
  | 'bank';        // 🏦 Banco Offshore (Isla Fiscal)

export type SettlementTier = 0 | 1 | 2 | 3 | 4; 
// 0: Ninguno, 1: Aldea ⛺, 2: Pueblo 🏡, 3: Ciudad 🏙️, 4: Megaciudad 🌆

export interface CivicProject {
  id: string;
  name: string;
  icon: string;
  category: 'culture' | 'monument' | 'entertainment';
  happinessBonus: number; // Ej: +5, +8, +12, +20 (%)
  coinCost: number;       // Monedas requeridas
  materialCost: number;   // Materiales de construcción requeridos
  minTier: SettlementTier;// Nivel mínimo de ciudad requerido
  description: string;
}

export const CIVIC_PROJECTS_CATALOG: CivicProject[] = [
  {
    id: 'village_square',
    name: 'Plaza Mayor',
    icon: '⛲',
    category: 'culture',
    happinessBonus: 5,
    coinCost: 30,
    materialCost: 15,
    minTier: 1,
    description: 'Punto de reunión comunal y ferias locales. +5% Felicidad.'
  },
  {
    id: 'founder_statue',
    name: 'Estatua Imperial',
    icon: '🏛️',
    category: 'monument',
    happinessBonus: 8,
    coinCost: 75,
    materialCost: 35,
    minTier: 2,
    description: 'Monumento en honor a los pioneros del imperio. +8% Felicidad.'
  },
  {
    id: 'grand_theater',
    name: 'Gran Teatro y Ópera',
    icon: '🎭',
    category: 'entertainment',
    happinessBonus: 12,
    coinCost: 160,
    materialCost: 70,
    minTier: 3,
    description: 'Centro cultural de gala y festivales cívicos. +12% Felicidad.'
  },
  {
    id: 'triumphal_obelisk',
    name: 'Obelisco de la Victoria',
    icon: '🗼',
    category: 'monument',
    happinessBonus: 20,
    coinCost: 320,
    materialCost: 140,
    minTier: 4,
    description: 'Maravilla metropolitana y faro del imperio. +20% Felicidad.'
  }
];

export interface NationalWonder {
  countryCode: string;
  name: string;
  icon: string;
  description: string;
  happinessBonus: number;
  coinCost: number;
  materialCost: number;
}

export const NATIONAL_WONDERS_CATALOG: Record<string, Omit<NationalWonder, 'countryCode'>> = {
  ESP: {
    name: 'La Sagrada Familia',
    icon: '⛪',
    description: 'Obra maestra modernista de Gaudí. Símbolo espiritual y joya arquitectónica universal.',
    happinessBonus: 25,
    coinCost: 300,
    materialCost: 120
  },
  FRA: {
    name: 'Torre Eiffel',
    icon: '🗼',
    description: 'Icono mundial de la Ilustración, el arte y la ingeniería universal.',
    happinessBonus: 25,
    coinCost: 300,
    materialCost: 120
  },
  ITA: {
    name: 'Coliseo Romano',
    icon: '🏛️',
    description: 'El mayor anfiteatro del Imperio Romano y maravilla imperecedera del mundo.',
    happinessBonus: 25,
    coinCost: 300,
    materialCost: 120
  },
  USA: {
    name: 'Estatua de la Libertad',
    icon: '🗽',
    description: 'Faro universal de la libertad y esperanza de todos los pueblos.',
    happinessBonus: 25,
    coinCost: 300,
    materialCost: 120
  },
  GBR: {
    name: 'Big Ben y Parlamento',
    icon: '🕰️',
    description: 'Corazón parlamentario y reloj histórico del imperio naval británico.',
    happinessBonus: 25,
    coinCost: 300,
    materialCost: 120
  },
  DEU: {
    name: 'Puerta de Brandeburgo',
    icon: '🏛️',
    description: 'Monumento neoclásico a la paz y la unificación de los pueblos de Europa.',
    happinessBonus: 25,
    coinCost: 300,
    materialCost: 120
  },
  JPN: {
    name: 'Monte Fuji y Templo Senso-ji',
    icon: '⛩️',
    description: 'Santuario milenario de serenidad y espíritu ancestral nipón.',
    happinessBonus: 25,
    coinCost: 300,
    materialCost: 120
  },
  CHN: {
    name: 'Gran Muralla China',
    icon: '🏯',
    description: 'Imponente fortificación de miles de kilómetros a lo largo de las cordilleras.',
    happinessBonus: 25,
    coinCost: 300,
    materialCost: 120
  },
  IND: {
    name: 'Taj Mahal',
    icon: '🕌',
    description: 'Monumento funerario de mármol blanco, joya cumbre del arte mogol.',
    happinessBonus: 25,
    coinCost: 300,
    materialCost: 120
  },
  EGY: {
    name: 'Grandes Pirámides de Guiza',
    icon: '🏺',
    description: 'La única maravilla del mundo antiguo que aún desafía el paso de los milenios.',
    happinessBonus: 25,
    coinCost: 300,
    materialCost: 120
  },
  BRA: {
    name: 'Cristo Redentor',
    icon: '🗿',
    description: 'Estatua colosal art déco que abraza la bahía desde la cumbre del Corcovado.',
    happinessBonus: 25,
    coinCost: 300,
    materialCost: 120
  },
  MEX: {
    name: 'Chichén Itzá',
    icon: '🏺',
    description: 'Pirámide de Kukulcán, prodigio astronómico y templo sagrado de la civilización maya.',
    happinessBonus: 25,
    coinCost: 300,
    materialCost: 120
  },
  GRC: {
    name: 'Partenón de Atenas',
    icon: '🏛️',
    description: 'Cuna de la democracia, la filosofía y el arte clásico en la Acrópolis.',
    happinessBonus: 25,
    coinCost: 300,
    materialCost: 120
  },
  PER: {
    name: 'Machu Picchu',
    icon: '🏔️',
    description: 'Ciudadela incaica en las nubes de los Andes orientales.',
    happinessBonus: 25,
    coinCost: 300,
    materialCost: 120
  },
  AUS: {
    name: 'Ópera de Sídney',
    icon: '🎭',
    description: 'Diseño vanguardista de conchas y velas sobre las aguas de la bahía oceánica.',
    happinessBonus: 25,
    coinCost: 300,
    materialCost: 120
  },
  MAR: {
    name: 'Mezquita Hassan II',
    icon: '🕌',
    description: 'Majestuoso minarete de Casablanca con vistas panorámicas al océano Atlántico.',
    happinessBonus: 25,
    coinCost: 300,
    materialCost: 120
  },
  ARG: {
    name: 'Obelisco de Buenos Aires',
    icon: '🏛️',
    description: 'Emblema urbano porteño en la histórica avenida 9 de Julio.',
    happinessBonus: 25,
    coinCost: 300,
    materialCost: 120
  },
  PRT: {
    name: 'Torre de Belém',
    icon: '🏰',
    description: 'Faro de la era de los descubrimientos marítimos mundiales junto al Tajo.',
    happinessBonus: 25,
    coinCost: 300,
    materialCost: 120
  },
  CAN: {
    name: 'Torre CN',
    icon: '🗼',
    description: 'Hito icónico de Toronto y prodigio de la ingeniería y telecomunicaciones modernas.',
    happinessBonus: 25,
    coinCost: 300,
    materialCost: 120
  },
  NLD: {
    name: 'Molinos de Kinderdijk',
    icon: '🌊',
    description: 'Ingeniería hidráulica histórica de canales ganados al mar del Norte.',
    happinessBonus: 25,
    coinCost: 300,
    materialCost: 120
  },
  TUR: {
    name: 'Santa Sofía',
    icon: '🕌',
    description: 'Basílica y mezquita legendaria en el cruce de Europa y Asia en el Bósforo.',
    happinessBonus: 25,
    coinCost: 300,
    materialCost: 120
  },
  CHE: {
    name: 'El Cervino / Matterhorn',
    icon: '🏔️',
    description: 'El pico alpino piramidal más emblemático y desafiante de los Alpes.',
    happinessBonus: 25,
    coinCost: 300,
    materialCost: 120
  },
  RUS: {
    name: 'Catedral de San Basilio',
    icon: '🏰',
    description: 'Coloridas cúpulas bulbosas en el corazón histórico de la Plaza Roja.',
    happinessBonus: 25,
    coinCost: 300,
    materialCost: 120
  }
};

export function getCountryWonder(countryCode?: string, countryName?: string): NationalWonder {
  const code = (countryCode || 'DES').toUpperCase();
  const found = NATIONAL_WONDERS_CATALOG[code];
  if (found) {
    return {
      countryCode: code,
      ...found
    };
  }

  // Fallback elegante para cualquier otro país del mundo
  const name = countryName || code;
  return {
    countryCode: code,
    name: `Maravilla Nacional de ${name}`,
    icon: '🏛️',
    description: `Monumento nacional de máxima gloria cívica, artística e histórica de ${name}.`,
    happinessBonus: 25,
    coinCost: 300,
    materialCost: 120
  };
}

export interface BuildingSlot {
  id: string;
  name: string;
  category: 'housing' | 'economy' | 'social' | 'production';
  effectDescription: string;
  populationProvided: number;
}

export interface GridTile {
  id: string;              // "x,y"
  x: number;               // Índice de columna
  y: number;               // Índice de fila
  lat: number;             // Latitud central
  lon: number;             // Longitud central
  countryCode?: string;    // Código ISO del país al que pertenece
  countryName?: string;    // Nombre en español del país
  terrainType: TerrainType;
  isCoast: boolean;
  isSmallIsland: boolean;  // Masa de tierra <= 8 casillas
  islandGroupId?: string;  // Identificador de grupo insular
  
  // Propiedades cuando está colonizada por el jugador:
  isOwned?: boolean;
  settlementTier?: SettlementTier;
  cityName?: string;
  role?: TileRole;
  slots?: BuildingSlot[];
  civicProjects?: string[]; // IDs de monumentos cívicos construidos
  nationalWonderBuilt?: boolean; // Si erigió la maravilla nacional única de este país
  nationalWonderName?: string;
  resourceTier?: number; // 1, 2, 3 para huertos (crops) y canteras (resources)
  maxSlots?: number;
  hasPort?: boolean;
}

export type IslandSpecialization = 'fiscal_paradise' | 'tourist_resort' | 'naval_hub';

export interface UserEmpire {
  id: string;
  empireName: string;
  colorHex: string;
  createdAt: string;
  
  // Balances globales
  totalPopulation: number;
  nationalFood: number;        // Superávit/Déficit
  nationalMaterials: number;   // Madera / Piedra acumulada
  happinessPct: number;        // 0 a 100
  coins: number;               // Monedas disponibles

  // Expediciones gratis otorgadas por Hubs Navales
  freeExpeditions?: number;

  // Censo local por país: { "ESP": 152000, "FRA": 2000, ... }
  localCensusByCountry: Record<string, number>;

  // Casillas colonizadas: id -> datos
  colonizedTiles: Record<string, Partial<GridTile>>;
  capitalTileId?: string;

  // Países soberanamente anexionados (control >= 90% de sus casillas)
  annexedCountries?: string[];

  // Misiones guiadas completadas / reclamadas
  claimedMissions?: string[];

  // Especializaciones de islas pequeñas: islandGroupId -> 'fiscal_paradise' | 'tourist_resort' | 'naval_hub'
  islandSpecializations: Record<string, IslandSpecialization>;

  // Expediciones marítimas activas y archivadas
  expeditions?: NavalExpedition[];
}

export interface TutorialMission {
  id: string;
  stepNumber: number;
  title: string;
  category: 'foundation' | 'economy' | 'production' | 'expansion' | 'naval' | 'wonder';
  icon: string;
  description: string;
  howTo: string[];
  reward: {
    coins: number;
    materials?: number;
    food?: number;
    freeExpeditions?: number;
  };
}

export interface NavalExpedition {
  id: string;
  originTileId: string;
  destinationTileId: string;
  destCountryName?: string;
  originCoords: { x: number; y: number };
  destCoords: { x: number; y: number };
  departureTime: number; // timestamp
  arrivalTime: number;   // timestamp
  status: 'sailing' | 'arrived' | 'claimed';
  route?: { x: number; y: number }[]; // Trayecto casilla a casilla por agua (A*)
  totalDistance?: number;             // Casillas totales de agua
  completedAt?: number;               // Momento de llegada para disipar la estela desde el origen
  viaHubId?: string;                  // Si hizo escala en un Hub Naval intermedio
}

/**
 * Obtiene el color temático de la casilla según la distribución visual del imperio:
 * - Granjas / Huertos: Color amarillo trigo (progresión según nivel)
 * - Bosques / Canteras: Color verde forestal (progresión según nivel)
 * - Ciudades / Pueblos / Megaciudades / Puertos: Tonos de gris según su nivel (Aldea -> Megaciudad)
 */
export function getTileVisualColor(tileData?: Partial<GridTile> | null): string {
  if (!tileData) return '#182438'; // Tierra neutral uniforme

  const role = tileData.role;

  // 1. Granjas / Huertos: Tonos amarillos de campo de trigo
  if (role === 'crops') {
    const tier = tileData.resourceTier || 1;
    if (tier === 3) return '#facc15'; // Nivel 3: Amarillo oro vibrante
    if (tier === 2) return '#eab308'; // Nivel 2: Amarillo trigo dorado
    return '#ca8a04';                 // Nivel 1: Amarillo ocre tradicional
  }

  // 2. Bosques / Canteras: Tonos verdes forestales
  if (role === 'resources') {
    const tier = tileData.resourceTier || 1;
    if (tier === 3) return '#16a34a'; // Nivel 3: Verde esmeralda vivo
    if (tier === 2) return '#15803d'; // Nivel 2: Verde bosque natural
    return '#166534';                 // Nivel 1: Verde bosque profundo
  }

  // 3. Ciudades, pueblos, megaciudades y puertos: Escala de grises por nivel urbano
  if (role === 'settlement' || (tileData.settlementTier && tileData.settlementTier > 0)) {
    const tier = tileData.settlementTier || 1;
    if (tileData.hasPort) {
      return '#475569'; // Puerto marítimo: Gris pizarra naval
    }
    if (tier === 4) return '#1e293b'; // Megaciudad: Gris carbón grafito metropolitano
    if (tier === 3) return '#475569'; // Ciudad: Gris piedra oscuro
    if (tier === 2) return '#64748b'; // Pueblo: Gris medio
    return '#94a3b8';                 // Aldea: Gris claro
  }

  if (role === 'port') {
    return '#475569'; // Puerto: Gris pizarra naval
  }

  if (role === 'energy') {
    return '#0284c7'; // Azul eléctrico
  }

  if (role === 'hotel') {
    return '#0ea5e9'; // Azul turquesa
  }

  if (role === 'bank') {
    return '#7c3aed'; // Púrpura bancario
  }

  return '#64748b'; // Gris neutro por defecto
}


