import { CityTarget } from '../types/game';

export const CITIES_DATASET: CityTarget[] = [
  // EUROPA
  {
    id: 'batumi',
    nameEs: 'Batumi',
    nameEn: 'Batumi',
    countryNameEs: 'Georgia',
    cca3: 'GEO',
    continent: 'Europe',
    coordinates: [41.6168, 41.6434], // [lng, lat]
    population: 170000,
    triviaFact: 'Batumi es la capital de Ayaria en Georgia y un próspero puerto en la costa del Mar Negro famoso por sus rascacielos ultramodernos.',
    flagEmoji: '🇬🇪'
  },
  {
    id: 'dubrovnik',
    nameEs: 'Dubrovnik',
    nameEn: 'Dubrovnik',
    countryNameEs: 'Croacia',
    cca3: 'HRV',
    continent: 'Europe',
    coordinates: [18.0944, 42.6507],
    population: 41000,
    triviaFact: 'Conocida como la "Perla del Adriático", sus murallas medievales intactas del siglo XVI bordean el mar.',
    flagEmoji: '🇭🇷'
  },
  {
    id: 'reykjavik',
    nameEs: 'Reikiavik',
    nameEn: 'Reykjavik',
    countryNameEs: 'Islandia',
    cca3: 'ISL',
    continent: 'Europe',
    coordinates: [-21.9426, 64.1466],
    population: 139000,
    triviaFact: 'Es la capital soberana más septentrional del mundo, alimentada casi al 100% por energía geotérmica limpia.',
    flagEmoji: '🇮🇸'
  },
  {
    id: 'edinburgh',
    nameEs: 'Edimburgo',
    nameEn: 'Edinburgh',
    countryNameEs: 'Reino Unido',
    cca3: 'GBR',
    continent: 'Europe',
    coordinates: [-3.1883, 55.9533],
    population: 527000,
    triviaFact: 'Dominada por su histórico castillo erigido sobre un volcán extinto conocido como la "Silla de Arturo".',
    flagEmoji: '🇬🇧'
  },
  {
    id: 'florence',
    nameEs: 'Florencia',
    nameEn: 'Florence',
    countryNameEs: 'Italia',
    cca3: 'ITA',
    continent: 'Europe',
    coordinates: [11.2558, 43.7696],
    population: 360000,
    triviaFact: 'La cuna del Renacimiento italiano, hogar de la cúpula de Brunelleschi y el David de Miguel Ángel.',
    flagEmoji: '🇮🇹'
  },
  {
    id: 'santorini',
    nameEs: 'Santorini (Fira)',
    nameEn: 'Santorini',
    countryNameEs: 'Grecia',
    cca3: 'GRC',
    continent: 'Europe',
    coordinates: [25.4317, 36.3932],
    population: 15500,
    triviaFact: 'Una deslumbrante caldera volcánica en el mar Egeo con casas blancas encaramadas al acantilado.',
    flagEmoji: '🇬🇷'
  },
  {
    id: 'krakow',
    nameEs: 'Cracovia',
    nameEn: 'Krakow',
    countryNameEs: 'Polonia',
    cca3: 'POL',
    continent: 'Europe',
    coordinates: [19.9450, 50.0647],
    population: 800000,
    triviaFact: 'Antigua capital de Polonia cuyo centro histórico medieval sobrevivió intacto a la Segunda Guerra Mundial.',
    flagEmoji: '🇵🇱'
  },
  {
    id: 'bergen',
    nameEs: 'Bergen',
    nameEn: 'Bergen',
    countryNameEs: 'Noruega',
    cca3: 'NOR',
    continent: 'Europe',
    coordinates: [5.3221, 60.3913],
    population: 289000,
    triviaFact: 'Rodeada de siete montañas y la puerta de entrada principal a los espectaculares fiordos noruegos.',
    flagEmoji: '🇳🇴'
  },
  {
    id: 'valletta',
    nameEs: 'La Valeta',
    nameEn: 'Valletta',
    countryNameEs: 'Malta',
    cca3: 'MLT',
    continent: 'Europe',
    coordinates: [14.5146, 35.8989],
    population: 5800,
    triviaFact: 'Una de las capitales más pequeñas del mundo construida íntegramente por los Caballeros de San Juan.',
    flagEmoji: '🇲🇹'
  },
  {
    id: 'porto',
    nameEs: 'Oporto',
    nameEn: 'Porto',
    countryNameEs: 'Portugal',
    cca3: 'PRT',
    continent: 'Europe',
    coordinates: [-8.6110, 41.1579],
    population: 231000,
    triviaFact: 'Famosa por sus puentes imponentes sobre el río Duero y la producción mundial del legendario vino de Oporto.',
    flagEmoji: '🇵🇹'
  },

  // ASIA
  {
    id: 'samarkand',
    nameEs: 'Samarcanda',
    nameEn: 'Samarkand',
    countryNameEs: 'Uzbekistán',
    cca3: 'UZB',
    continent: 'Asia',
    coordinates: [66.9750, 39.6542],
    population: 550000,
    triviaFact: 'Una de las ciudades habitadas más antiguas del mundo y la joya principal de la legendaria Ruta de la Seda.',
    flagEmoji: '🇺🇿'
  },
  {
    id: 'kyoto',
    nameEs: 'Kioto',
    nameEn: 'Kyoto',
    countryNameEs: 'Japón',
    cca3: 'JPN',
    continent: 'Asia',
    coordinates: [135.7681, 35.0116],
    population: 1460000,
    triviaFact: 'La capital imperial de Japón durante más de mil años, albergando miles de templos budistas clásicos.',
    flagEmoji: '🇯🇵'
  },
  {
    id: 'kathmandu',
    nameEs: 'Katmandú',
    nameEn: 'Kathmandu',
    countryNameEs: 'Nepal',
    cca3: 'NPL',
    continent: 'Asia',
    coordinates: [85.3240, 27.7172],
    population: 1440000,
    triviaFact: 'Situada en un gran valle rodeado por las cumbres más altas del Himalaya.',
    flagEmoji: '🇳🇵'
  },
  {
    id: 'chiang-mai',
    nameEs: 'Chiang Mai',
    nameEn: 'Chiang Mai',
    countryNameEs: 'Tailandia',
    cca3: 'THA',
    continent: 'Asia',
    coordinates: [98.9853, 18.7883],
    population: 130000,
    triviaFact: 'Capital del antiguo Reino Lanna rodeada por fosos y montañas nevadas al norte de Tailandia.',
    flagEmoji: '🇹🇭'
  },
  {
    id: 'almaty',
    nameEs: 'Almaty',
    nameEn: 'Almaty',
    countryNameEs: 'Kazajistán',
    cca3: 'KAZ',
    continent: 'Asia',
    coordinates: [76.8512, 43.2220],
    population: 2000000,
    triviaFact: 'La ciudad más grande de Kazajistán, situada a los pies de las imponentes montañas de Tian Shan.',
    flagEmoji: '🇰🇿'
  },
  {
    id: 'xi-an',
    nameEs: 'Xi\'an',
    nameEn: 'Xi\'an',
    countryNameEs: 'China',
    cca3: 'CHN',
    continent: 'Asia',
    coordinates: [108.9398, 34.3416],
    population: 12900000,
    triviaFact: 'Punto de partida de la Ruta de la Seda y hogar del deslumbrante ejército de Guerreros de Terracota.',
    flagEmoji: '🇨🇳'
  },
  {
    id: 'jaipur',
    nameEs: 'Jaipur',
    nameEn: 'Jaipur',
    countryNameEs: 'India',
    cca3: 'IND',
    continent: 'Asia',
    coordinates: [75.7873, 26.9124],
    population: 3100000,
    triviaFact: 'Conocida como la "Ciudad Rosa" del Rajastán debido a la fachada distintiva de sus monumentos históricos.',
    flagEmoji: '🇮🇳'
  },
  {
    id: 'luang-prabang',
    nameEs: 'Luang Prabang',
    nameEn: 'Luang Prabang',
    countryNameEs: 'Laos',
    cca3: 'LAO',
    continent: 'Asia',
    coordinates: [102.1347, 19.8893],
    population: 55000,
    triviaFact: 'Ciudad patrimonio de la UNESCO rodeada por los ríos Mekong y Nam Khan con templos budistas dorados.',
    flagEmoji: '🇱🇦'
  },
  {
    id: 'bukhara',
    nameEs: 'Bujará',
    nameEn: 'Bukhara',
    countryNameEs: 'Uzbekistán',
    cca3: 'UZB',
    continent: 'Asia',
    coordinates: [64.4216, 39.7747],
    population: 280000,
    triviaFact: 'Un museo vivo del Islam medieval con más de 140 monumentos arquitectónicos protegidos.',
    flagEmoji: '🇺🇿'
  },
  {
    id: 'petra-wadi-musa',
    nameEs: 'Wadi Musa (Petra)',
    nameEn: 'Petra',
    countryNameEs: 'Jordania',
    cca3: 'JOR',
    continent: 'Asia',
    coordinates: [35.4801, 30.3285],
    population: 35000,
    triviaFact: 'La mítica capital del reino nabateo labrada directamente en la roca de arenisca rosa.',
    flagEmoji: '🇯🇴'
  },

  // AMÉRICA
  {
    id: 'cusco',
    nameEs: 'Cusco',
    nameEn: 'Cusco',
    countryNameEs: 'Perú',
    cca3: 'PER',
    continent: 'Americas',
    coordinates: [-71.9675, -13.5319],
    population: 428000,
    triviaFact: 'Antigua capital del Imperio Inca situada a 3,400 metros sobre el nivel del mar en los Andes.',
    flagEmoji: '🇵🇪'
  },
  {
    id: 'banff',
    nameEs: 'Banff',
    nameEn: 'Banff',
    countryNameEs: 'Canadá',
    cca3: 'CAN',
    continent: 'Americas',
    coordinates: [-115.5708, 51.1784],
    population: 7800,
    triviaFact: 'Ubicada dentro del Parque Nacional más antiguo de Canadá en el corazón de las Montañas Rocosas.',
    flagEmoji: '🇨🇦'
  },
  {
    id: 'ushuaia',
    nameEs: 'Ushuaia',
    nameEn: 'Ushuaia',
    countryNameEs: 'Argentina',
    cca3: 'ARG',
    continent: 'Americas',
    coordinates: [-68.3030, -54.8019],
    population: 82000,
    triviaFact: 'Conocida mundialmente como "El Fin del Mundo", la ciudad más austral del planeta.',
    flagEmoji: '🇦🇷'
  },
  {
    id: 'oaxaca',
    nameEs: 'Oaxaca de Juárez',
    nameEn: 'Oaxaca',
    countryNameEs: 'México',
    cca3: 'MEX',
    continent: 'Americas',
    coordinates: [-96.7266, 17.0732],
    population: 300000,
    triviaFact: 'Meca gastronómica y cultural de México famosa por sus mezcales, textiles y la zona zapoteca de Monte Albán.',
    flagEmoji: '🇲🇽'
  },
  {
    id: 'cartagena',
    nameEs: 'Cartagena de Indias',
    nameEn: 'Cartagena',
    countryNameEs: 'Colombia',
    cca3: 'COL',
    continent: 'Americas',
    coordinates: [-75.5144, 10.3910],
    population: 1020000,
    triviaFact: 'Joya del Caribe colonial protegida por fortificaciones construidas en la época del Imperio Español.',
    flagEmoji: '🇨🇴'
  },
  {
    id: 'antigua-guatemala',
    nameEs: 'Antigua Guatemala',
    nameEn: 'Antigua Guatemala',
    countryNameEs: 'Guatemala',
    cca3: 'GTM',
    continent: 'Americas',
    coordinates: [-90.7338, 14.5586],
    population: 46000,
    triviaFact: 'Rodeada por tres volcanes imponentes y famosa por su arquitectura barroca colonial conservada.',
    flagEmoji: '🇬🇹'
  },
  {
    id: 'bariloche',
    nameEs: 'San Carlos de Bariloche',
    nameEn: 'Bariloche',
    countryNameEs: 'Argentina',
    cca3: 'ARG',
    continent: 'Americas',
    coordinates: [-71.3103, -41.1335],
    population: 130000,
    triviaFact: 'Conocida como la "Suiza argentina" a orillas del lago Nahuel Huapi con tradición chocolatera única.',
    flagEmoji: '🇦🇷'
  },
  {
    id: 'valparaiso',
    nameEs: 'Valparaíso',
    nameEn: 'Valparaiso',
    countryNameEs: 'Chile',
    cca3: 'CHL',
    continent: 'Americas',
    coordinates: [-71.6127, -33.0472],
    population: 296000,
    triviaFact: 'Construida sobre 42 cerros colorados frente al Pacífico con funiculares históricos todavía en uso.',
    flagEmoji: '🇨🇱'
  },
  {
    id: 'salvador-bahia',
    nameEs: 'Salvador de Bahía',
    nameEn: 'Salvador',
    countryNameEs: 'Brasil',
    cca3: 'BRA',
    continent: 'Americas',
    coordinates: [-38.5108, -12.9777],
    population: 2900000,
    triviaFact: 'La primera capital de Brasil, epicentro de la cultura afrobrasileña, capoeira y el barrio Pelourinho.',
    flagEmoji: '🇧🇷'
  },

  // ÁFRICA Y OCEANÍA
  {
    id: 'zanzibar-city',
    nameEs: 'Zanzíbar (Stone Town)',
    nameEn: 'Zanzibar City',
    countryNameEs: 'Tanzania',
    cca3: 'TZA',
    continent: 'Africa',
    coordinates: [39.1921, -6.1659],
    population: 223000,
    triviaFact: 'Un crisol cultural en el Océano Índico famoso por sus laberínticas calles y el comercio histórico de especias.',
    flagEmoji: '🇹🇿'
  },
  {
    id: 'marrakesh',
    nameEs: 'Marrakech',
    nameEn: 'Marrakesh',
    countryNameEs: 'Marruecos',
    cca3: 'MAR',
    continent: 'Africa',
    coordinates: [-7.9892, 31.6295],
    population: 1000000,
    triviaFact: 'La "Ciudad Roja" custodiada por las cumbres del Alto Atlas y la mítica plaza Jemaa el-Fna.',
    flagEmoji: '🇲🇦'
  },
  {
    id: 'luxor',
    nameEs: 'Lúxor',
    nameEn: 'Luxor',
    countryNameEs: 'Egipto',
    cca3: 'EGY',
    continent: 'Africa',
    coordinates: [32.6396, 25.6872],
    population: 500000,
    triviaFact: 'El museo al aire libre más grande del mundo construido en el sitio de la antigua Tebas egipcia.',
    flagEmoji: '🇪🇬'
  },
  {
    id: 'queenstown',
    nameEs: 'Queenstown',
    nameEn: 'Queenstown',
    countryNameEs: 'Nueva Zelanda',
    cca3: 'NZL',
    continent: 'Oceania',
    coordinates: [168.6626, -45.0312],
    population: 15800,
    triviaFact: 'La capital mundial de los deportes de aventura a orillas del lago Wakatipu en la Isla del Sur.',
    flagEmoji: '🇳🇿'
  },
  {
    id: 'suva',
    nameEs: 'Suva',
    nameEn: 'Suva',
    countryNameEs: 'Fiyi',
    cca3: 'FJI',
    continent: 'Oceania',
    coordinates: [178.4419, -18.1416],
    population: 94000,
    triviaFact: 'El centro político y económico del Pacífico Sur situado en la isla de Viti Levu.',
    flagEmoji: '🇫🇯'
  },
  {
    id: 'cairns',
    nameEs: 'Cairns',
    nameEn: 'Cairns',
    countryNameEs: 'Australia',
    cca3: 'AUS',
    continent: 'Oceania',
    coordinates: [145.7781, -16.9186],
    population: 153000,
    triviaFact: 'La puerta principal de acceso a la Gran Barrera de Coral australiana.',
    flagEmoji: '🇦🇺'
  }
];

export function getRandomCities(count: number = 5, continentFilter: string = 'World'): CityTarget[] {
  let filtered = CITIES_DATASET;
  if (continentFilter !== 'World') {
    filtered = CITIES_DATASET.filter(c => c.continent === continentFilter);
    if (filtered.length < count) {
      filtered = CITIES_DATASET;
    }
  }

  const shuffled = [...filtered].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
