import { CityTarget } from '../types/game';

export type CityThemeCategory = 'all' | 'megacities' | 'historic' | 'islands_coastal' | 'usa' | 'europe';

export interface CityTargetExtended extends CityTarget {
  weight?: number; // Peso de probabilidad (1.0 base, 1.8-2.5 para grandes hubs)
  themeCategory?: CityThemeCategory;
}

export const CITIES_DATASET: CityTargetExtended[] = [
  // ==========================================
  // ESTADOS UNIDOS Y CANADÁ
  // ==========================================
  { id: 'us-new-york', nameEs: 'Nueva York', nameEn: 'New York City', countryNameEs: 'Estados Unidos', cca3: 'USA', continent: 'Americas', coordinates: [-74.0060, 40.7128], population: 8800000, triviaFact: 'La metrópoli más grande de EE. UU., famosa por Times Square y Central Park.', flagEmoji: '🇺🇸', weight: 2.5, themeCategory: 'megacities' },
  { id: 'us-los-angeles', nameEs: 'Los Ángeles', nameEn: 'Los Angeles', countryNameEs: 'Estados Unidos', cca3: 'USA', continent: 'Americas', coordinates: [-118.2437, 34.0522], population: 3890000, triviaFact: 'Epicentro mundial del cine en Hollywood y las playas de Venice Beach.', flagEmoji: '🇺🇸', weight: 2.5, themeCategory: 'usa' },
  { id: 'us-chicago', nameEs: 'Chicago', nameEn: 'Chicago', countryNameEs: 'Estados Unidos', cca3: 'USA', continent: 'Americas', coordinates: [-87.6298, 41.8781], population: 2740000, triviaFact: 'La "Ciudad de los Vientos" a orillas del Lago Míchigan.', flagEmoji: '🇺🇸', weight: 2.0, themeCategory: 'usa' },
  { id: 'us-miami', nameEs: 'Miami', nameEn: 'Miami', countryNameEs: 'Estados Unidos', cca3: 'USA', continent: 'Americas', coordinates: [-80.1918, 25.7617], population: 442000, triviaFact: 'Famosa por su distrito Art Déco en South Beach y su ambiente latino.', flagEmoji: '🇺🇸', weight: 2.2, themeCategory: 'islands_coastal' },
  { id: 'us-san-francisco', nameEs: 'San Francisco', nameEn: 'San Francisco', countryNameEs: 'Estados Unidos', cca3: 'USA', continent: 'Americas', coordinates: [-122.4194, 37.7749], population: 873000, triviaFact: 'Conocida por el puente Golden Gate y sus tranvías históricos.', flagEmoji: '🇺🇸', weight: 2.2, themeCategory: 'usa' },
  { id: 'us-las-vegas', nameEs: 'Las Vegas', nameEn: 'Las Vegas', countryNameEs: 'Estados Unidos', cca3: 'USA', continent: 'Americas', coordinates: [-115.1398, 36.1699], population: 641000, triviaFact: 'La capital mundial del entretenimiento en el desierto de Nevada.', flagEmoji: '🇺🇸', weight: 2.2, themeCategory: 'usa' },
  { id: 'us-washington-dc', nameEs: 'Washington D. C.', nameEn: 'Washington D.C.', countryNameEs: 'Estados Unidos', cca3: 'USA', continent: 'Americas', coordinates: [-77.0369, 38.9072], population: 690000, triviaFact: 'Capital federal de EE. UU., sede del Capitolio y la Casa Blanca.', flagEmoji: '🇺🇸', weight: 2.0, themeCategory: 'historic' },
  { id: 'us-seattle', nameEs: 'Seattle', nameEn: 'Seattle', countryNameEs: 'Estados Unidos', cca3: 'USA', continent: 'Americas', coordinates: [-122.3321, 47.6062], population: 737000, triviaFact: 'Cuna del café Starbucks y la icónica torre Space Needle.', flagEmoji: '🇺🇸', weight: 1.8, themeCategory: 'usa' },
  { id: 'us-boston', nameEs: 'Boston', nameEn: 'Boston', countryNameEs: 'Estados Unidos', cca3: 'USA', continent: 'Americas', coordinates: [-71.0589, 42.3601], population: 675000, triviaFact: 'Sede histórica de la revolución americana y de la Universidad de Harvard.', flagEmoji: '🇺🇸', weight: 1.8, themeCategory: 'historic' },
  { id: 'us-new-orleans', nameEs: 'Nueva Orleans', nameEn: 'New Orleans', countryNameEs: 'Estados Unidos', cca3: 'USA', continent: 'Americas', coordinates: [-90.0715, 29.9511], population: 383000, triviaFact: 'Cuna del Jazz en Luisiana, famosa por el Barrio Francés y Mardi Gras.', flagEmoji: '🇺🇸', weight: 1.8, themeCategory: 'historic' },
  { id: 'us-honolulu', nameEs: 'Honolulú', nameEn: 'Honolulu', countryNameEs: 'Estados Unidos', cca3: 'USA', continent: 'Americas', coordinates: [-157.8583, 21.3069], population: 350000, triviaFact: 'Capital de Hawái en la isla de Oahu, famosa por la playa de Waikiki.', flagEmoji: '🇺🇸', weight: 2.0, themeCategory: 'islands_coastal' },
  { id: 'ca-toronto', nameEs: 'Toronto', nameEn: 'Toronto', countryNameEs: 'Canadá', cca3: 'CAN', continent: 'Americas', coordinates: [-79.3832, 43.6532], population: 2790000, triviaFact: 'La metrópoli más grande de Canadá, dominada por la CN Tower.', flagEmoji: '🇨🇦', weight: 2.0, themeCategory: 'megacities' },
  { id: 'ca-vancouver', nameEs: 'Vancouver', nameEn: 'Vancouver', countryNameEs: 'Canadá', cca3: 'CAN', continent: 'Americas', coordinates: [-123.1207, 49.2827], population: 675000, triviaFact: 'Ciudad costera del Pacífico canadiense rodeada de montañas y naturaleza.', flagEmoji: '🇨🇦', weight: 2.0, themeCategory: 'islands_coastal' },

  // ==========================================
  // MÉXICO, AMÉRICA CENTRAL Y EL CARIBE
  // ==========================================
  { id: 'mx-cdmx', nameEs: 'Ciudad de México', nameEn: 'Mexico City', countryNameEs: 'México', cca3: 'MEX', continent: 'Americas', coordinates: [-99.1332, 19.4326], population: 9200000, triviaFact: 'Construida sobre la antigua Tenochtitlan azteca en el valle de México.', flagEmoji: '🇲🇽', weight: 2.2, themeCategory: 'megacities' },
  { id: 'mx-cancun', nameEs: 'Cancún', nameEn: 'Cancun', countryNameEs: 'México', cca3: 'MEX', continent: 'Americas', coordinates: [-86.8515, 21.1619], population: 880000, triviaFact: 'Paraíso del Caribe mexicano con playas turquesa y ruinas mayas cercanas.', flagEmoji: '🇲🇽', weight: 2.0, themeCategory: 'islands_coastal' },
  { id: 'mx-oaxaca', nameEs: 'Oaxaca de Juárez', nameEn: 'Oaxaca', countryNameEs: 'México', cca3: 'MEX', continent: 'Americas', coordinates: [-96.7266, 17.0732], population: 300000, triviaFact: 'Meca gastronómica famosa por sus mezcales y la zona zapoteca.', flagEmoji: '🇲🇽', weight: 1.6, themeCategory: 'historic' },
  { id: 'gt-antigua', nameEs: 'Antigua Guatemala', nameEn: 'Antigua Guatemala', countryNameEs: 'Guatemala', cca3: 'GTM', continent: 'Americas', coordinates: [-90.7338, 14.5586], population: 46000, triviaFact: 'Rodeada por tres volcanes imponentes y famosa por sus ruinas barrocas.', flagEmoji: '🇬🇹', weight: 1.5, themeCategory: 'historic' },
  { id: 'cu-havana', nameEs: 'La Habana', nameEn: 'Havana', countryNameEs: 'Cuba', cca3: 'CUB', continent: 'Americas', coordinates: [-82.3666, 23.1136], population: 2130000, triviaFact: 'Famosa por sus autos clásicos de los 50 y la arquitectura del Malecón.', flagEmoji: '🇨🇺', weight: 2.0, themeCategory: 'historic' },

  // ==========================================
  // AMÉRICA DEL SUR
  // ==========================================
  { id: 'br-rio', nameEs: 'Río de Janeiro', nameEn: 'Rio de Janeiro', countryNameEs: 'Brasil', cca3: 'BRA', continent: 'Americas', coordinates: [-43.1729, -22.9068], population: 6740000, triviaFact: 'Custodiada por el Cristo Redentor y las icónicas playas de Copacabana.', flagEmoji: '🇧🇷', weight: 2.5, themeCategory: 'islands_coastal' },
  { id: 'br-sao-paulo', nameEs: 'São Paulo', nameEn: 'Sao Paulo', countryNameEs: 'Brasil', cca3: 'BRA', continent: 'Americas', coordinates: [-46.6333, -23.5505], population: 12300000, triviaFact: 'La metrópoli más grande de Sudamérica y centro económico brasileño.', flagEmoji: '🇧🇷', weight: 2.0, themeCategory: 'megacities' },
  { id: 'ar-buenos-aires', nameEs: 'Buenos Aires', nameEn: 'Buenos Aires', countryNameEs: 'Argentina', cca3: 'ARG', continent: 'Americas', coordinates: [-58.3816, -34.6037], population: 3070000, triviaFact: 'La cuna del Tango con su célebre Obelisco y el barrio de La Boca.', flagEmoji: '🇦🇷', weight: 2.2, themeCategory: 'historic' },
  { id: 'ar-ushuaia', nameEs: 'Ushuaia', nameEn: 'Ushuaia', countryNameEs: 'Argentina', cca3: 'ARG', continent: 'Americas', coordinates: [-68.3030, -54.8019], population: 82000, triviaFact: 'Conocida como "El Fin del Mundo", la ciudad más austral del planeta.', flagEmoji: '🇦🇷', weight: 2.0, themeCategory: 'islands_coastal' },
  { id: 'pe-cusco', nameEs: 'Cusco', nameEn: 'Cusco', countryNameEs: 'Perú', cca3: 'PER', continent: 'Americas', coordinates: [-71.9675, -13.5319], population: 428000, triviaFact: 'Antigua capital del Imperio Inca a 3,400 metros de altitud en los Andes.', flagEmoji: '🇵🇪', weight: 2.2, themeCategory: 'historic' },
  { id: 'co-cartagena', nameEs: 'Cartagena de Indias', nameEn: 'Cartagena', countryNameEs: 'Colombia', cca3: 'COL', continent: 'Americas', coordinates: [-75.5144, 10.3910], population: 1020000, triviaFact: 'Joya del Caribe colonial protegida por murallas del Imperio Español.', flagEmoji: '🇨🇴', weight: 2.0, themeCategory: 'islands_coastal' },
  { id: 'ec-galapagos', nameEs: 'Puerto Ayora (Galápagos)', nameEn: 'Galapagos', countryNameEs: 'Ecuador', cca3: 'ECU', continent: 'Americas', coordinates: [-90.3138, -0.7436], population: 12000, triviaFact: 'El archipiélago volcánico que inspiró la Teoría de la Evolución de Darwin.', flagEmoji: '🇪🇨', weight: 2.0, themeCategory: 'islands_coastal' },

  // ==========================================
  // EUROPA
  // ==========================================
  { id: 'es-madrid', nameEs: 'Madrid', nameEn: 'Madrid', countryNameEs: 'España', cca3: 'ESP', continent: 'Europe', coordinates: [-3.7038, 40.4168], population: 3300000, triviaFact: 'Capital de España en el centro de la península, hogar del Museo del Prado.', flagEmoji: '🇪🇸', weight: 2.2, themeCategory: 'europe' },
  { id: 'es-barcelona', nameEs: 'Barcelona', nameEn: 'Barcelona', countryNameEs: 'España', cca3: 'ESP', continent: 'Europe', coordinates: [2.1734, 41.3851], population: 1620000, triviaFact: 'Famosa por las obras maestras modernistas de Gaudí como la Sagrada Familia.', flagEmoji: '🇪🇸', weight: 2.2, themeCategory: 'europe' },
  { id: 'fr-paris', nameEs: 'París', nameEn: 'Paris', countryNameEs: 'Francia', cca3: 'FRA', continent: 'Europe', coordinates: [2.3522, 48.8566], population: 2160000, triviaFact: 'La "Ciudad de la Luz", célebre por la Torre Eiffel y el Museo del Louvre.', flagEmoji: '🇫🇷', weight: 2.5, themeCategory: 'historic' },
  { id: 'it-rome', nameEs: 'Roma', nameEn: 'Rome', countryNameEs: 'Italia', cca3: 'ITA', continent: 'Europe', coordinates: [12.4964, 41.9028], population: 2870000, triviaFact: 'La "Ciudad Eterna", centro del antiguo Imperio Romano con el Coliseo.', flagEmoji: '🇮🇹', weight: 2.5, themeCategory: 'historic' },
  { id: 'it-venice', nameEs: 'Venecia', nameEn: 'Venice', countryNameEs: 'Italia', cca3: 'ITA', continent: 'Europe', coordinates: [12.3155, 45.4408], population: 260000, triviaFact: 'Construida sobre 118 islas interconectadas por canales y puentes.', flagEmoji: '🇮🇹', weight: 2.2, themeCategory: 'islands_coastal' },
  { id: 'gb-london', nameEs: 'Londres', nameEn: 'London', countryNameEs: 'Reino Unido', cca3: 'GBR', continent: 'Europe', coordinates: [-0.1276, 51.5074], population: 8980000, triviaFact: 'Capital británica a orillas del Támesis, hogar del Big Ben y el Tower Bridge.', flagEmoji: '🇬🇧', weight: 2.5, themeCategory: 'megacities' },
  { id: 'de-berlin', nameEs: 'Berlín', nameEn: 'Berlin', countryNameEs: 'Alemania', cca3: 'DEU', continent: 'Europe', coordinates: [13.4050, 52.5200], population: 3660000, triviaFact: 'Famosa por la Puerta de Brandeburgo y los restos del Muro de Berlín.', flagEmoji: '🇩🇪', weight: 2.2, themeCategory: 'europe' },
  { id: 'gr-athens', nameEs: 'Atenas', nameEn: 'Athens', countryNameEs: 'Grecia', cca3: 'GRC', continent: 'Europe', coordinates: [23.7275, 37.9838], population: 664000, triviaFact: 'La cuna de la democracia occidental presidida por la Acrópolis.', flagEmoji: '🇬🇷', weight: 2.2, themeCategory: 'historic' },
  { id: 'gr-santorini', nameEs: 'Santorini', nameEn: 'Santorini', countryNameEs: 'Grecia', cca3: 'GRC', continent: 'Europe', coordinates: [25.4317, 36.3932], population: 15500, triviaFact: 'Isla volcánica del Egeo con casas blancas y cúpulas azules.', flagEmoji: '🇬🇷', weight: 2.0, themeCategory: 'islands_coastal' },
  { id: 'is-reykjavik', nameEs: 'Reikiavik', nameEn: 'Reykjavik', countryNameEs: 'Islandia', cca3: 'ISL', continent: 'Europe', coordinates: [-21.9426, 64.1466], population: 139000, triviaFact: 'La capital soberana más septentrional alimentada por geotermia.', flagEmoji: '🇮🇸', weight: 2.0, themeCategory: 'islands_coastal' },
  { id: 'ge-batumi', nameEs: 'Batumi', nameEn: 'Batumi', countryNameEs: 'Georgia', cca3: 'GEO', continent: 'Europe', coordinates: [41.6168, 41.6434], population: 170000, triviaFact: 'Puerto en la costa georgiana del Mar Negro famoso por su arquitectura.', flagEmoji: '🇬🇪', weight: 1.8, themeCategory: 'islands_coastal' },
  { id: 'tr-istanbul', nameEs: 'Estambul', nameEn: 'Istanbul', countryNameEs: 'Turquía', cca3: 'TUR', continent: 'Europe', coordinates: [28.9784, 41.0082], population: 15500000, triviaFact: 'Única metrópoli asentada sobre dos continentes (Europa y Asia).', flagEmoji: '🇹🇷', weight: 2.5, themeCategory: 'megacities' },

  // ==========================================
  // ASIA, ORIENTE MEDIO, ÁFRICA Y OCEANÍA
  // ==========================================
  { id: 'jp-tokyo', nameEs: 'Tokio', nameEn: 'Tokyo', countryNameEs: 'Japón', cca3: 'JPN', continent: 'Asia', coordinates: [139.6917, 35.6895], population: 14000000, triviaFact: 'La área metropolitana más poblada del planeta (37 millones).', flagEmoji: '🇯🇵', weight: 2.5, themeCategory: 'megacities' },
  { id: 'cn-beijing', nameEs: 'Pekín', nameEn: 'Beijing', countryNameEs: 'China', cca3: 'CHN', continent: 'Asia', coordinates: [116.4074, 39.9042], population: 21800000, triviaFact: 'Capital imperial china sede de la Ciudad Prohibida.', flagEmoji: '🇨🇳', weight: 2.2, themeCategory: 'megacities' },
  { id: 'cn-shanghai', nameEs: 'Shanghái', nameEn: 'Shanghai', countryNameEs: 'China', cca3: 'CHN', continent: 'Asia', coordinates: [121.4737, 31.2304], population: 24800000, triviaFact: 'Corazón financiero con el futurista skyline de Pudong.', flagEmoji: '🇨🇳', weight: 2.2, themeCategory: 'megacities' },
  { id: 'ae-dubai', nameEs: 'Dubái', nameEn: 'Dubai', countryNameEs: 'Emiratos Árabes Unidos', cca3: 'ARE', continent: 'Asia', coordinates: [55.2708, 25.2048], population: 3300000, triviaFact: 'Famosa por el rascacielos Burj Khalifa (828m) e islas artificiales.', flagEmoji: '🇦🇪', weight: 2.5, themeCategory: 'megacities' },
  { id: 'jo-petra', nameEs: 'Wadi Musa (Petra)', nameEn: 'Petra', countryNameEs: 'Jordania', cca3: 'JOR', continent: 'Asia', coordinates: [35.4801, 30.3285], population: 35000, triviaFact: 'Mítica capital nabatea labrada directamente en la roca rosa del desierto.', flagEmoji: '🇯🇴', weight: 2.0, themeCategory: 'historic' },
  { id: 'uz-samarkand', nameEs: 'Samarcanda', nameEn: 'Samarkand', countryNameEs: 'Uzbekistán', cca3: 'UZB', continent: 'Asia', coordinates: [66.9750, 39.6542], population: 550000, triviaFact: 'La joya de la Ruta de la Seda con cúpulas turquesa y la plaza Registán.', flagEmoji: '🇺🇿', weight: 1.8, themeCategory: 'historic' },
  { id: 'eg-cairo', nameEs: 'El Cairo', nameEn: 'Cairo', countryNameEs: 'Egipto', cca3: 'EGY', continent: 'Africa', coordinates: [31.2357, 30.0444], population: 10000000, triviaFact: 'Metrópoli a orillas del Nilo célebre por las Pirámides de Guiza.', flagEmoji: '🇪🇬', weight: 2.5, themeCategory: 'megacities' },
  { id: 'ma-marrakesh', nameEs: 'Marrakech', nameEn: 'Marrakesh', countryNameEs: 'Marruecos', cca3: 'MAR', continent: 'Africa', coordinates: [-7.9892, 31.6295], population: 1000000, triviaFact: 'La "Ciudad Roja" custodiada por el Atlas y la plaza Jemaa el-Fna.', flagEmoji: '🇲🇦', weight: 2.0, themeCategory: 'historic' },
  { id: 'tz-zanzibar', nameEs: 'Zanzíbar', nameEn: 'Zanzibar', countryNameEs: 'Tanzania', cca3: 'TZA', continent: 'Africa', coordinates: [39.1921, -6.1659], population: 223000, triviaFact: 'Isla de especias en el Índico con el laberíntico barrio Stone Town.', flagEmoji: '🇹🇿', weight: 1.8, themeCategory: 'islands_coastal' },
  { id: 'au-sydney', nameEs: 'Sídney', nameEn: 'Sydney', countryNameEs: 'Australia', cca3: 'AUS', continent: 'Oceania', coordinates: [151.2093, -33.8688], population: 5300000, triviaFact: 'Famosa por la Ópera de Sídney y el puente Harbour Bridge.', flagEmoji: '🇦🇺', weight: 2.5, themeCategory: 'islands_coastal' },
  { id: 'nz-queenstown', nameEs: 'Queenstown', nameEn: 'Queenstown', countryNameEs: 'Nueva Zelanda', cca3: 'NZL', continent: 'Oceania', coordinates: [168.6626, -45.0312], population: 15800, triviaFact: 'La capital mundial de la aventura a orillas del lago Wakatipu.', flagEmoji: '🇳🇿', weight: 1.8, themeCategory: 'islands_coastal' },
  { id: 'pf-tahiti', nameEs: 'Papeete (Tahití)', nameEn: 'Papeete', countryNameEs: 'Polinesia Francesa', cca3: 'PYF', continent: 'Oceania', coordinates: [-149.5696, -17.5516], population: 26000, triviaFact: 'Isla volcánica tropical famosa por sus lagunas de agua cristalina.', flagEmoji: '🇵🇫', weight: 1.6, themeCategory: 'islands_coastal' }
];

/**
 * Retorna N ciudades aleatorias ponderadas y filtradas por continente o pack temático
 */
export function getRandomCities(
  count: number = 5,
  continentFilter: string = 'World',
  themeFilter: CityThemeCategory = 'all'
): CityTarget[] {
  let pool = CITIES_DATASET;

  // 1. Filtrar por Continente si aplica
  if (continentFilter !== 'World') {
    const filtered = pool.filter(c => c.continent === continentFilter);
    if (filtered.length >= count) {
      pool = filtered;
    }
  }

  // 2. Filtrar por Pack Temático si aplica
  if (themeFilter !== 'all') {
    const filteredTheme = pool.filter(c => {
      if (themeFilter === 'megacities') return (c.population || 0) >= 2500000 || c.themeCategory === 'megacities';
      if (themeFilter === 'historic') return c.themeCategory === 'historic';
      if (themeFilter === 'islands_coastal') return c.themeCategory === 'islands_coastal';
      if (themeFilter === 'usa') return c.cca3 === 'USA';
      if (themeFilter === 'europe') return c.continent === 'Europe';
      return true;
    });

    if (filteredTheme.length >= count) {
      pool = filteredTheme;
    }
  }

  // Algoritmo de selección ponderada sin repetición
  const selected: CityTarget[] = [];
  const poolCopy = [...pool];

  while (selected.length < count && poolCopy.length > 0) {
    const totalWeight = poolCopy.reduce((acc, c) => acc + (c.weight || 1.0), 0);
    let randomNum = Math.random() * totalWeight;

    let chosenIndex = 0;
    for (let i = 0; i < poolCopy.length; i++) {
      const w = poolCopy[i].weight || 1.0;
      if (randomNum < w) {
        chosenIndex = i;
        break;
      }
      randomNum -= w;
    }

    selected.push(poolCopy[chosenIndex]);
    poolCopy.splice(chosenIndex, 1);
  }

  return selected;
}
