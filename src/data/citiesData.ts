import { CityTarget } from '../types/game';

export interface CityTargetExtended extends CityTarget {
  weight?: number; // Peso de probabilidad (1.0 base, 1.8-2.5 para grandes hubs)
}

export const CITIES_DATASET: CityTargetExtended[] = [
  // ==========================================
  // AMÉRICA DEL NORTE (EE. UU. Y CANADÁ)
  // ==========================================
  { id: 'us-new-york', nameEs: 'Nueva York', nameEn: 'New York City', countryNameEs: 'Estados Unidos', cca3: 'USA', continent: 'Americas', coordinates: [-74.0060, 40.7128], population: 8800000, triviaFact: 'La metrópoli más grande de EE. UU., famosa por Times Square y Central Park.', flagEmoji: '🇺🇸', weight: 2.5 },
  { id: 'us-los-angeles', nameEs: 'Los Ángeles', nameEn: 'Los Angeles', countryNameEs: 'Estados Unidos', cca3: 'USA', continent: 'Americas', coordinates: [-118.2437, 34.0522], population: 3890000, triviaFact: 'Epicentro mundial del cine en Hollywood y las playas de Venice Beach.', flagEmoji: '🇺🇸', weight: 2.5 },
  { id: 'us-chicago', nameEs: 'Chicago', nameEn: 'Chicago', countryNameEs: 'Estados Unidos', cca3: 'USA', continent: 'Americas', coordinates: [-87.6298, 41.8781], population: 2740000, triviaFact: 'La "Ciudad de los Vientos" a orillas del Lago Míchigan.', flagEmoji: '🇺🇸', weight: 2.0 },
  { id: 'us-miami', nameEs: 'Miami', nameEn: 'Miami', countryNameEs: 'Estados Unidos', cca3: 'USA', continent: 'Americas', coordinates: [-80.1918, 25.7617], population: 442000, triviaFact: 'Famosa por su distrito Art Déco en South Beach y su ambiente latino.', flagEmoji: '🇺🇸', weight: 2.2 },
  { id: 'us-san-francisco', nameEs: 'San Francisco', nameEn: 'San Francisco', countryNameEs: 'Estados Unidos', cca3: 'USA', continent: 'Americas', coordinates: [-122.4194, 37.7749], population: 873000, triviaFact: 'Conocida por el puente Golden Gate y sus tranvías históricos.', flagEmoji: '🇺🇸', weight: 2.2 },
  { id: 'us-las-vegas', nameEs: 'Las Vegas', nameEn: 'Las Vegas', countryNameEs: 'Estados Unidos', cca3: 'USA', continent: 'Americas', coordinates: [-115.1398, 36.1699], population: 641000, triviaFact: 'La capital mundial del entretenimiento en el desierto de Nevada.', flagEmoji: '🇺🇸', weight: 2.2 },
  { id: 'us-washington-dc', nameEs: 'Washington D. C.', nameEn: 'Washington D.C.', countryNameEs: 'Estados Unidos', cca3: 'USA', continent: 'Americas', coordinates: [-77.0369, 38.9072], population: 690000, triviaFact: 'Capital federal de EE. UU., sede del Capitolio y la Casa Blanca.', flagEmoji: '🇺🇸', weight: 2.0 },
  { id: 'us-seattle', nameEs: 'Seattle', nameEn: 'Seattle', countryNameEs: 'Estados Unidos', cca3: 'USA', continent: 'Americas', coordinates: [-122.3321, 47.6062], population: 737000, triviaFact: 'Cuna del café Starbucks y la icónica torre Space Needle.', flagEmoji: '🇺🇸', weight: 1.8 },
  { id: 'us-boston', nameEs: 'Boston', nameEn: 'Boston', countryNameEs: 'Estados Unidos', cca3: 'USA', continent: 'Americas', coordinates: [-71.0589, 42.3601], population: 675000, triviaFact: 'Sede histórica de la revolución americana y de la Universidad de Harvard.', flagEmoji: '🇺🇸', weight: 1.8 },
  { id: 'us-new-orleans', nameEs: 'Nueva Orleans', nameEn: 'New Orleans', countryNameEs: 'Estados Unidos', cca3: 'USA', continent: 'Americas', coordinates: [-90.0715, 29.9511], population: 383000, triviaFact: 'Cuna del Jazz en Luisiana, famosa por el Barrio Francés y Mardi Gras.', flagEmoji: '🇺🇸', weight: 1.8 },
  { id: 'us-austin', nameEs: 'Austin', nameEn: 'Austin', countryNameEs: 'Estados Unidos', cca3: 'USA', continent: 'Americas', coordinates: [-97.7431, 30.2672], population: 961000, triviaFact: 'Capital de Texas y meca de la música en vivo y la tecnología.', flagEmoji: '🇺🇸', weight: 1.6 },
  { id: 'us-denver', nameEs: 'Denver', nameEn: 'Denver', countryNameEs: 'Estados Unidos', cca3: 'USA', continent: 'Americas', coordinates: [-104.9903, 39.7392], population: 715000, triviaFact: 'Conocida como la "Mile High City" a exactamente 1.609m de altitud.', flagEmoji: '🇺🇸', weight: 1.6 },
  { id: 'us-honolulu', nameEs: 'Honolulú', nameEn: 'Honolulu', countryNameEs: 'Estados Unidos', cca3: 'USA', continent: 'Americas', coordinates: [-157.8583, 21.3069], population: 350000, triviaFact: 'Capital de Hawái en la isla de Oahu, famosa por la playa de Waikiki.', flagEmoji: '🇺🇸', weight: 2.0 },
  { id: 'us-anchorage', nameEs: 'Anchorage', nameEn: 'Anchorage', countryNameEs: 'Estados Unidos', cca3: 'USA', continent: 'Americas', coordinates: [-149.9003, 61.2181], population: 291000, triviaFact: 'La ciudad más grande de Alaska rodeada de glaciares e imponentes fiordos.', flagEmoji: '🇺🇸', weight: 1.6 },
  { id: 'ca-toronto', nameEs: 'Toronto', nameEn: 'Toronto', countryNameEs: 'Canadá', cca3: 'CAN', continent: 'Americas', coordinates: [-79.3832, 43.6532], population: 2790000, triviaFact: 'La metrópoli más grande de Canadá, dominada por la CN Tower.', flagEmoji: '🇨🇦', weight: 2.0 },
  { id: 'ca-vancouver', nameEs: 'Vancouver', nameEn: 'Vancouver', countryNameEs: 'Canadá', cca3: 'CAN', continent: 'Americas', coordinates: [-123.1207, 49.2827], population: 675000, triviaFact: 'Ciudad costera del Pacífico canadiense rodeada de montañas y naturaleza.', flagEmoji: '🇨🇦', weight: 2.0 },
  { id: 'ca-montreal', nameEs: 'Montreal', nameEn: 'Montreal', countryNameEs: 'Canadá', cca3: 'CAN', continent: 'Americas', coordinates: [-73.5673, 45.5017], population: 1780000, triviaFact: 'La metrópoli francófona de Quebec famosa por su centro histórico.', flagEmoji: '🇨🇦', weight: 1.8 },
  { id: 'ca-banff', nameEs: 'Banff', nameEn: 'Banff', countryNameEs: 'Canadá', cca3: 'CAN', continent: 'Americas', coordinates: [-115.5708, 51.1784], population: 7800, triviaFact: 'Ubicada en el parque nacional más antiguo de las Montañas Rocosas.', flagEmoji: '🇨🇦', weight: 1.8 },

  // ==========================================
  // MÉXICO, AMÉRICA CENTRAL Y EL CARIBE
  // ==========================================
  { id: 'mx-cdmx', nameEs: 'Ciudad de México', nameEn: 'Mexico City', countryNameEs: 'México', cca3: 'MEX', continent: 'Americas', coordinates: [-99.1332, 19.4326], population: 9200000, triviaFact: 'Construida sobre la antigua Tenochtitlan azteca en el valle de México.', flagEmoji: '🇲🇽', weight: 2.2 },
  { id: 'mx-cancun', nameEs: 'Cancún', nameEn: 'Cancun', countryNameEs: 'México', cca3: 'MEX', continent: 'Americas', coordinates: [-86.8515, 21.1619], population: 880000, triviaFact: 'Paraíso del Caribe mexicano con playas turquesa y ruinas mayas cercanas.', flagEmoji: '🇲🇽', weight: 2.0 },
  { id: 'mx-guadalajara', nameEs: 'Guadalajara', nameEn: 'Guadalajara', countryNameEs: 'México', cca3: 'MEX', continent: 'Americas', coordinates: [-103.3496, 20.6597], population: 1380000, triviaFact: 'La tierra del Mariachi y del Tequila en el estado de Jalisco.', flagEmoji: '🇲🇽', weight: 1.6 },
  { id: 'mx-oaxaca', nameEs: 'Oaxaca de Juárez', nameEn: 'Oaxaca', countryNameEs: 'México', cca3: 'MEX', continent: 'Americas', coordinates: [-96.7266, 17.0732], population: 300000, triviaFact: 'Meca gastronómica famosa por sus mezcales y la zona azteca/zapoteca.', flagEmoji: '🇲🇽', weight: 1.6 },
  { id: 'gt-antigua', nameEs: 'Antigua Guatemala', nameEn: 'Antigua Guatemala', countryNameEs: 'Guatemala', cca3: 'GTM', continent: 'Americas', coordinates: [-90.7338, 14.5586], population: 46000, triviaFact: 'Rodeada por tres volcanes imponentes y famosa por sus ruinas barrocas.', flagEmoji: '🇬🇹', weight: 1.5 },
  { id: 'cr-san-jose', nameEs: 'San José', nameEn: 'San Jose', countryNameEs: 'Costa Rica', cca3: 'CRI', continent: 'Americas', coordinates: [-84.0907, 9.9281], population: 340000, triviaFact: 'Capital de Costa Rica en el Valle Central, puerta a la biodiversidad pura.', flagEmoji: '🇨🇷', weight: 1.5 },
  { id: 'pa-panama-city', nameEs: 'Ciudad de Panamá', nameEn: 'Panama City', countryNameEs: 'Panamá', cca3: 'PAN', continent: 'Americas', coordinates: [-79.5197, 8.9824], population: 880000, triviaFact: 'Metrópoli de rascacielos junto al histórico Canal de Panamá.', flagEmoji: '🇵🇦', weight: 1.8 },
  { id: 'cu-havana', nameEs: 'La Habana', nameEn: 'Havana', countryNameEs: 'Cuba', cca3: 'CUB', continent: 'Americas', coordinates: [-82.3666, 23.1136], population: 2130000, triviaFact: 'Famosa por sus autos clásicos de los 50 y la arquitectura del Malecón.', flagEmoji: '🇨🇺', weight: 2.0 },
  { id: 'do-santo-domingo', nameEs: 'Santo Domingo', nameEn: 'Santo Domingo', countryNameEs: 'República Dominicana', cca3: 'DOM', continent: 'Americas', coordinates: [-69.9312, 18.4861], population: 1000000, triviaFact: 'El asentamiento europeo más antiguo de América, fundado en 1496.', flagEmoji: '🇩🇴', weight: 1.6 },
  { id: 'pr-san-juan', nameEs: 'San Juan', nameEn: 'San Juan', countryNameEs: 'Puerto Rico', cca3: 'PRI', continent: 'Americas', coordinates: [-66.1057, 18.4655], population: 340000, triviaFact: 'Famosa por la fortaleza del Castillo San Felipe del Morro en el Viejo San Juan.', flagEmoji: '🇵🇷', weight: 1.6 },

  // ==========================================
  // AMÉRICA DEL SUR
  // ==========================================
  { id: 'br-rio', nameEs: 'Río de Janeiro', nameEn: 'Rio de Janeiro', countryNameEs: 'Brasil', cca3: 'BRA', continent: 'Americas', coordinates: [-43.1729, -22.9068], population: 6740000, triviaFact: 'Custodiada por el Cristo Redentor y las icónicas playas de Copacabana.', flagEmoji: '🇧🇷', weight: 2.5 },
  { id: 'br-sao-paulo', nameEs: 'São Paulo', nameEn: 'Sao Paulo', countryNameEs: 'Brasil', cca3: 'BRA', continent: 'Americas', coordinates: [-46.6333, -23.5505], population: 12300000, triviaFact: 'La metrópoli más grande de Sudamérica y centro económico brasileño.', flagEmoji: '🇧🇷', weight: 2.0 },
  { id: 'br-salvador', nameEs: 'Salvador de Bahía', nameEn: 'Salvador', countryNameEs: 'Brasil', cca3: 'BRA', continent: 'Americas', coordinates: [-38.5108, -12.9777], population: 2900000, triviaFact: 'Epicentro afrobrasileño famoso por el barrio colonial Pelourinho.', flagEmoji: '🇧🇷', weight: 1.6 },
  { id: 'br-manaus', nameEs: 'Manaos', nameEn: 'Manaus', countryNameEs: 'Brasil', cca3: 'BRA', continent: 'Americas', coordinates: [-60.0217, -3.1190], population: 2200000, triviaFact: 'La gran metrópoli en el corazón de la selva amazónica junto al Río Negro.', flagEmoji: '🇧🇷', weight: 1.8 },
  { id: 'ar-buenos-aires', nameEs: 'Buenos Aires', nameEn: 'Buenos Aires', countryNameEs: 'Argentina', cca3: 'ARG', continent: 'Americas', coordinates: [-58.3816, -34.6037], population: 3070000, triviaFact: 'La cuna del Tango con su célebre Obelisco y el barrio de La Boca.', flagEmoji: '🇦🇷', weight: 2.2 },
  { id: 'ar-ushuaia', nameEs: 'Ushuaia', nameEn: 'Ushuaia', countryNameEs: 'Argentina', cca3: 'ARG', continent: 'Americas', coordinates: [-68.3030, -54.8019], population: 82000, triviaFact: 'Conocida como "El Fin del Mundo", la ciudad más austral del planeta.', flagEmoji: '🇦🇷', weight: 2.0 },
  { id: 'ar-bariloche', nameEs: 'Bariloche', nameEn: 'Bariloche', countryNameEs: 'Argentina', cca3: 'ARG', continent: 'Americas', coordinates: [-71.3103, -41.1335], population: 130000, triviaFact: 'La "Suiza argentina" a orillas del lago Nahuel Huapi en la Patagonia.', flagEmoji: '🇦🇷', weight: 1.6 },
  { id: 'ar-mendoza', nameEs: 'Mendoza', nameEn: 'Mendoza', countryNameEs: 'Argentina', cca3: 'ARG', continent: 'Americas', coordinates: [-68.8458, -32.8895], population: 115000, triviaFact: 'Capital del vino argentino a los pies del imponente cerro Aconcagua.', flagEmoji: '🇦🇷', weight: 1.5 },
  { id: 'pe-cusco', nameEs: 'Cusco', nameEn: 'Cusco', countryNameEs: 'Perú', cca3: 'PER', continent: 'Americas', coordinates: [-71.9675, -13.5319], population: 428000, triviaFact: 'Antigua capital del Imperio Inca a 3,400 metros de altitud en los Andes.', flagEmoji: '🇵🇪', weight: 2.2 },
  { id: 'pe-lima', nameEs: 'Lima', nameEn: 'Lima', countryNameEs: 'Perú', cca3: 'PER', continent: 'Americas', coordinates: [-77.0428, -12.0464], population: 9700000, triviaFact: 'Capital gastronómica de Sudamérica frente al Océano Pacífico.', flagEmoji: '🇵🇪', weight: 1.8 },
  { id: 'pe-iquitos', nameEs: 'Iquitos', nameEn: 'Iquitos', countryNameEs: 'Perú', cca3: 'PER', continent: 'Americas', coordinates: [-73.2516, -3.7491], population: 470000, triviaFact: 'La ciudad continental más grande del mundo sin acceso por carretera.', flagEmoji: '🇵🇪', weight: 1.6 },
  { id: 'co-cartagena', nameEs: 'Cartagena de Indias', nameEn: 'Cartagena', countryNameEs: 'Colombia', cca3: 'COL', continent: 'Americas', coordinates: [-75.5144, 10.3910], population: 1020000, triviaFact: 'Joya del Caribe colonial protegida por murallas del Imperio Español.', flagEmoji: '🇨🇴', weight: 2.0 },
  { id: 'co-bogota', nameEs: 'Bogotá', nameEn: 'Bogota', countryNameEs: 'Colombia', cca3: 'COL', continent: 'Americas', coordinates: [-74.0721, 4.7110], population: 7700000, triviaFact: 'Capital colombiana situada en una sabana andina a 2,640 metros.', flagEmoji: '🇨🇴', weight: 1.8 },
  { id: 'co-medellin', nameEs: 'Medellín', nameEn: 'Medellin', countryNameEs: 'Colombia', cca3: 'COL', continent: 'Americas', coordinates: [-75.5636, 6.2518], population: 2500000, triviaFact: 'La "Ciudad de la Eterna Primavera" rodeada por el Valle de Aburrá.', flagEmoji: '🇨🇴', weight: 1.8 },
  { id: 'cl-santiago', nameEs: 'Santiago de Chile', nameEn: 'Santiago', countryNameEs: 'Chile', cca3: 'CHL', continent: 'Americas', coordinates: [-70.6693, -33.4489], population: 6250000, triviaFact: 'Enmarcada por la imponente cordillera de los Andes nevada.', flagEmoji: '🇨🇱', weight: 1.8 },
  { id: 'cl-punta-arenas', nameEs: 'Punta Arenas', nameEn: 'Punta Arenas', countryNameEs: 'Chile', cca3: 'CHL', continent: 'Americas', coordinates: [-70.9171, -53.1638], population: 131000, triviaFact: 'Puerta de entrada al Estrecho de Magallanes en la Patagonia chilena.', flagEmoji: '🇨🇱', weight: 1.6 },
  { id: 'ec-quito', nameEs: 'Quito', nameEn: 'Quito', countryNameEs: 'Ecuador', cca3: 'ECU', continent: 'Americas', coordinates: [-78.4678, -0.1807], population: 2000000, triviaFact: 'La capital oficial más cercana a la línea ecuatorial a 2,850m de altitud.', flagEmoji: '🇪🇨', weight: 1.8 },
  { id: 'ec-galapagos', nameEs: 'Puerto Ayora (Galápagos)', nameEn: 'Galapagos', countryNameEs: 'Ecuador', cca3: 'ECU', continent: 'Americas', coordinates: [-90.3138, -0.7436], population: 12000, triviaFact: 'El archipiélago volcánico que inspiró la Teoría de la Evolución de Darwin.', flagEmoji: '🇪🇨', weight: 2.0 },
  { id: 'bo-la-paz', nameEs: 'La Paz', nameEn: 'La Paz', countryNameEs: 'Bolivia', cca3: 'BOL', continent: 'Americas', coordinates: [-68.1193, -16.4897], population: 800000, triviaFact: 'Sede de gobierno a 3,640m con la red de teleféricos urbanos más alta.', flagEmoji: '🇧🇴', weight: 1.8 },
  { id: 'uy-montevideo', nameEs: 'Montevideo', nameEn: 'Montevideo', countryNameEs: 'Uruguay', cca3: 'URY', continent: 'Americas', coordinates: [-56.1645, -34.9011], population: 1380000, triviaFact: 'Capital uruguaya a orillas del Río de la Plata con su extensa Rambla.', flagEmoji: '🇺🇾', weight: 1.6 },

  // ==========================================
  // EUROPA OCCIDENTAL Y MEDITERRÁNEA
  // ==========================================
  { id: 'es-madrid', nameEs: 'Madrid', nameEn: 'Madrid', countryNameEs: 'España', cca3: 'ESP', continent: 'Europe', coordinates: [-3.7038, 40.4168], population: 3300000, triviaFact: 'Capital de España en el centro de la península, hogar del Museo del Prado.', flagEmoji: '🇪🇸', weight: 2.2 },
  { id: 'es-barcelona', nameEs: 'Barcelona', nameEn: 'Barcelona', countryNameEs: 'España', cca3: 'ESP', continent: 'Europe', coordinates: [2.1734, 41.3851], population: 1620000, triviaFact: 'Famosa por las obras maestras modernistas de Gaudí como la Sagrada Familia.', flagEmoji: '🇪🇸', weight: 2.2 },
  { id: 'es-sevilla', nameEs: 'Sevilla', nameEn: 'Seville', countryNameEs: 'España', cca3: 'ESP', continent: 'Europe', coordinates: [-5.9845, 37.3891], population: 688000, triviaFact: 'Capital andaluza con la Giralda, el Real Alcázar y la Plaza de España.', flagEmoji: '🇪🇸', weight: 1.8 },
  { id: 'es-bilbao', nameEs: 'Bilbao', nameEn: 'Bilbao', countryNameEs: 'España', cca3: 'ESP', continent: 'Europe', coordinates: [-2.9350, 43.2630], population: 345000, triviaFact: 'Capital del País Vasco revolucionada por el museo Guggenheim de titanio.', flagEmoji: '🇪🇸', weight: 1.6 },
  { id: 'es-canarias', nameEs: 'Las Palmas de Gran Canaria', nameEn: 'Las Palmas', countryNameEs: 'España', cca3: 'ESP', continent: 'Europe', coordinates: [-15.4363, 28.1235], population: 380000, triviaFact: 'Ciudad insular atlántica con la playa urbana de Las Canteras.', flagEmoji: '🇪🇸', weight: 1.6 },
  { id: 'fr-paris', nameEs: 'París', nameEn: 'Paris', countryNameEs: 'Francia', cca3: 'FRA', continent: 'Europe', coordinates: [2.3522, 48.8566], population: 2160000, triviaFact: 'La "Ciudad de la Luz", célebre por la Torre Eiffel y el Museo del Louvre.', flagEmoji: '🇫🇷', weight: 2.5 },
  { id: 'fr-nice', nameEs: 'Niza', nameEn: 'Nice', countryNameEs: 'Francia', cca3: 'FRA', continent: 'Europe', coordinates: [7.2620, 43.7102], population: 340000, triviaFact: 'Joya de la Costa Azul a orillas del mar Mediterráneo.', flagEmoji: '🇫🇷', weight: 1.8 },
  { id: 'it-rome', nameEs: 'Roma', nameEn: 'Rome', countryNameEs: 'Italia', cca3: 'ITA', continent: 'Europe', coordinates: [12.4964, 41.9028], population: 2870000, triviaFact: 'La "Ciudad Eterna", centro del antiguo Imperio Romano con el Coliseo.', flagEmoji: '🇮🇹', weight: 2.5 },
  { id: 'it-venice', nameEs: 'Venecia', nameEn: 'Venice', countryNameEs: 'Italia', cca3: 'ITA', continent: 'Europe', coordinates: [12.3155, 45.4408], population: 260000, triviaFact: 'Construida sobre 118 islas interconectadas por canales y puentes.', flagEmoji: '🇮🇹', weight: 2.2 },
  { id: 'it-florence', nameEs: 'Florencia', nameEn: 'Florence', countryNameEs: 'Italia', cca3: 'ITA', continent: 'Europe', coordinates: [11.2558, 43.7696], population: 360000, triviaFact: 'Cuna del Renacimiento italiano con la cúpula de Brunelleschi.', flagEmoji: '🇮🇹', weight: 2.0 },
  { id: 'it-naples', nameEs: 'Nápoles', nameEn: 'Naples', countryNameEs: 'Italia', cca3: 'ITA', continent: 'Europe', coordinates: [14.2681, 40.8518], population: 960000, triviaFact: 'Cuna de la pizza Margherita a los pies del volcán Vesubio y Pompeya.', flagEmoji: '🇮🇹', weight: 1.8 },
  { id: 'gb-london', nameEs: 'Londres', nameEn: 'London', countryNameEs: 'Reino Unido', cca3: 'GBR', continent: 'Europe', coordinates: [-0.1276, 51.5074], population: 8980000, triviaFact: 'Capital británica a orillas del Támesis, hogar del Big Ben y el Tower Bridge.', flagEmoji: '🇬🇧', weight: 2.5 },
  { id: 'gb-edinburgh', nameEs: 'Edimburgo', nameEn: 'Edinburgh', countryNameEs: 'Reino Unido', cca3: 'GBR', continent: 'Europe', coordinates: [-3.1883, 55.9533], population: 527000, triviaFact: 'Capital escocesa dominada por su castillo en un volcán extinto.', flagEmoji: '🇬🇧', weight: 1.8 },
  { id: 'de-berlin', nameEs: 'Berlín', nameEn: 'Berlin', countryNameEs: 'Alemania', cca3: 'DEU', continent: 'Europe', coordinates: [13.4050, 52.5200], population: 3660000, triviaFact: 'Famosa por la Puerta de Brandeburgo y los restos del Muro de Berlín.', flagEmoji: '🇩🇪', weight: 2.2 },
  { id: 'de-munich', nameEs: 'Múnich', nameEn: 'Munich', countryNameEs: 'Alemania', cca3: 'DEU', continent: 'Europe', coordinates: [11.5820, 48.1351], population: 1480000, triviaFact: 'Capital de Baviera célebre por el festival del Oktoberfest.', flagEmoji: '🇩🇪', weight: 2.0 },
  { id: 'pt-lisbon', nameEs: 'Lisboa', nameEn: 'Lisbon', countryNameEs: 'Portugal', cca3: 'PRT', continent: 'Europe', coordinates: [-9.1393, 38.7223], population: 505000, triviaFact: 'Construida sobre siete colinas junto al Tajo con tranvías amarillos.', flagEmoji: '🇵🇹', weight: 2.0 },
  { id: 'nl-amsterdam', nameEs: 'Ámsterdam', nameEn: 'Amsterdam', countryNameEs: 'Países Bajos', cca3: 'NLD', continent: 'Europe', coordinates: [4.9041, 52.3676], population: 872000, triviaFact: 'Conocida como la "Venecia del Norte" por sus canales concéntricos.', flagEmoji: '🇳🇱', weight: 2.2 },
  { id: 'gr-athens', nameEs: 'Atenas', nameEn: 'Athens', countryNameEs: 'Grecia', cca3: 'GRC', continent: 'Europe', coordinates: [23.7275, 37.9838], population: 664000, triviaFact: 'La cuna de la democracia occidental presidida por la Acrópolis.', flagEmoji: '🇬🇷', weight: 2.2 },
  { id: 'gr-santorini', nameEs: 'Santorini', nameEn: 'Santorini', countryNameEs: 'Grecia', cca3: 'GRC', continent: 'Europe', coordinates: [25.4317, 36.3932], population: 15500, triviaFact: 'Isla volcánica del Egeo con casas blancas y cúpulas azules.', flagEmoji: '🇬🇷', weight: 2.0 },
  { id: 'cz-prague', nameEs: 'Praga', nameEn: 'Prague', countryNameEs: 'Chequia', cca3: 'CZE', continent: 'Europe', coordinates: [14.4378, 50.0755], population: 1300000, triviaFact: 'La "Ciudad de las Cien Torres", famosa por el Puente de Carlos.', flagEmoji: '🇨🇿', weight: 2.0 },
  { id: 'at-vienna', nameEs: 'Viena', nameEn: 'Vienna', countryNameEs: 'Austria', cca3: 'AUT', continent: 'Europe', coordinates: [16.3738, 48.2082], population: 1900000, triviaFact: 'Capital imperial de la música clásica a orillas del Danubio.', flagEmoji: '🇦🇹', weight: 2.0 },
  { id: 'hu-budapest', nameEs: 'Budapest', nameEn: 'Budapest', countryNameEs: 'Hungría', cca3: 'HUN', continent: 'Europe', coordinates: [19.0402, 47.4979], population: 1750000, triviaFact: 'Formada por la unión de Buda y Pest divididas por el río Danubio.', flagEmoji: '🇭🇺', weight: 2.0 },

  // ==========================================
  // EUROPA DEL ESTE, NÓRDICOS Y CÁUCASO
  // ==========================================
  { id: 'is-reykjavik', nameEs: 'Reikiavik', nameEn: 'Reykjavik', countryNameEs: 'Islandia', cca3: 'ISL', continent: 'Europe', coordinates: [-21.9426, 64.1466], population: 139000, triviaFact: 'La capital soberana más septentrional alimentada por geotermia.', flagEmoji: '🇮🇸', weight: 2.0 },
  { id: 'no-oslo', nameEs: 'Oslo', nameEn: 'Oslo', countryNameEs: 'Noruega', cca3: 'NOR', continent: 'Europe', coordinates: [10.7522, 59.9139], population: 695000, triviaFact: 'Capital noruega rodeada de fiordos, sede del Nobel de la Paz.', flagEmoji: '🇳🇴', weight: 1.8 },
  { id: 'no-tromso', nameEs: 'Tromsø', nameEn: 'Tromso', countryNameEs: 'Noruega', cca3: 'NOR', continent: 'Europe', coordinates: [18.9553, 69.6492], population: 77000, triviaFact: 'La capital del Ártico ideal para contemplar Auroras Boreales.', flagEmoji: '🇳🇴', weight: 1.6 },
  { id: 'se-stockholm', nameEs: 'Estocolmo', nameEn: 'Stockholm', countryNameEs: 'Suecia', cca3: 'SWE', continent: 'Europe', coordinates: [18.0686, 59.3293], population: 975000, triviaFact: 'Construida sobre 14 islas donde el lago se une al Mar Báltico.', flagEmoji: '🇸🇪', weight: 1.8 },
  { id: 'fi-helsinki', nameEs: 'Helsinki', nameEn: 'Helsinki', countryNameEs: 'Finlandia', cca3: 'FIN', continent: 'Europe', coordinates: [24.9458, 60.1699], population: 650000, triviaFact: 'Ciudad costera del Báltico famosa por su diseño neoclásico y saunas.', flagEmoji: '🇫🇮', weight: 1.8 },
  { id: 'pl-krakow', nameEs: 'Cracovia', nameEn: 'Krakow', countryNameEs: 'Polonia', cca3: 'POL', continent: 'Europe', coordinates: [19.9450, 50.0647], population: 800000, triviaFact: 'Antigua capital polaca con su centro histórico medieval intocado.', flagEmoji: '🇵🇱', weight: 1.6 },
  { id: 'ro-brasov', nameEs: 'Brașov (Transilvania)', nameEn: 'Brasov', countryNameEs: 'Rumanía', cca3: 'ROU', continent: 'Europe', coordinates: [25.6012, 45.6580], population: 250000, triviaFact: 'En el corazón de Transilvania junto al legendario Castillo de Bran.', flagEmoji: '🇷🇴', weight: 1.5 },
  { id: 'ge-batumi', nameEs: 'Batumi', nameEn: 'Batumi', countryNameEs: 'Georgia', cca3: 'GEO', continent: 'Europe', coordinates: [41.6168, 41.6434], population: 170000, triviaFact: 'Puerto en la costa georgiana del Mar Negro famoso por su arquitectura.', flagEmoji: '🇬🇪', weight: 1.8 },
  { id: 'ge-tbilisi', nameEs: 'Tiflis', nameEn: 'Tbilisi', countryNameEs: 'Georgia', cca3: 'GEO', continent: 'Europe', coordinates: [44.8271, 41.7151], population: 1150000, triviaFact: 'Capital del Cáucaso famosa por sus baños sulfurosos históricos.', flagEmoji: '🇬🇪', weight: 1.6 },
  { id: 'tr-istanbul', nameEs: 'Estambul', nameEn: 'Istanbul', countryNameEs: 'Turquía', cca3: 'TUR', continent: 'Europe', coordinates: [28.9784, 41.0082], population: 15500000, triviaFact: 'Única metrópoli asentada sobre dos continentes (Europa y Asia).', flagEmoji: '🇹🇷', weight: 2.5 },
  { id: 'tr-cappadocia', nameEs: 'Göreme (Capadocia)', nameEn: 'Cappadocia', countryNameEs: 'Turquía', cca3: 'TUR', continent: 'Asia', coordinates: [34.8289, 38.6431], population: 2000, triviaFact: 'Paisaje surrealista de "chimeneas de hadas" famoso por globos aerostáticos.', flagEmoji: '🇹🇷', weight: 2.0 },

  // ==========================================
  // ASIA (ORIENTAL, SUDESTE, SUR Y CENTRAL)
  // ==========================================
  { id: 'jp-tokyo', nameEs: 'Tokio', nameEn: 'Tokyo', countryNameEs: 'Japón', cca3: 'JPN', continent: 'Asia', coordinates: [139.6917, 35.6895], population: 14000000, triviaFact: 'La área metropolitana más poblada del planeta (37 millones).', flagEmoji: '🇯🇵', weight: 2.5 },
  { id: 'jp-kyoto', nameEs: 'Kioto', nameEn: 'Kyoto', countryNameEs: 'Japón', cca3: 'JPN', continent: 'Asia', coordinates: [135.7681, 35.0116], population: 1460000, triviaFact: 'La capital imperial de Japón durante más de mil años.', flagEmoji: '🇯🇵', weight: 2.0 },
  { id: 'jp-osaka', nameEs: 'Osaka', nameEn: 'Osaka', countryNameEs: 'Japón', cca3: 'JPN', continent: 'Asia', coordinates: [135.5023, 34.6937], population: 2750000, triviaFact: 'Famosa por su gastronomía callejera en el barrio neón de Dotonbori.', flagEmoji: '🇯🇵', weight: 1.8 },
  { id: 'cn-beijing', nameEs: 'Pekín', nameEn: 'Beijing', countryNameEs: 'China', cca3: 'CHN', continent: 'Asia', coordinates: [116.4074, 39.9042], population: 21800000, triviaFact: 'Capital imperial china sede de la Ciudad Prohibida.', flagEmoji: '🇨🇳', weight: 2.2 },
  { id: 'cn-shanghai', nameEs: 'Shanghái', nameEn: 'Shanghai', countryNameEs: 'China', cca3: 'CHN', continent: 'Asia', coordinates: [121.4737, 31.2304], population: 24800000, triviaFact: 'Corazón financiero con el futurista skyline de Pudong.', flagEmoji: '🇨🇳', weight: 2.2 },
  { id: 'cn-xian', nameEs: 'Xi\'an', nameEn: 'Xi\'an', countryNameEs: 'China', cca3: 'CHN', continent: 'Asia', coordinates: [108.9398, 34.3416], population: 12900000, triviaFact: 'Inicio de la Ruta de la Seda y hogar de los Guerreros de Terracota.', flagEmoji: '🇨🇳', weight: 1.8 },
  { id: 'hk-hong-kong', nameEs: 'Hong Kong', nameEn: 'Hong Kong', countryNameEs: 'Hong Kong', cca3: 'HKG', continent: 'Asia', coordinates: [114.1694, 22.3193], population: 7400000, triviaFact: 'Imponente puerto de rascacielos frente a la Bahía de Victoria.', flagEmoji: '🇭🇰', weight: 2.2 },
  { id: 'kr-seoul', nameEs: 'Seúl', nameEn: 'Seoul', countryNameEs: 'Corea del Sur', cca3: 'KOR', continent: 'Asia', coordinates: [126.9780, 37.5665], population: 9700000, triviaFact: 'Mezcla de rascacielos ultra tecnológicos y palacios reales de la dinastía Joseon.', flagEmoji: '🇰🇷', weight: 2.2 },
  { id: 'tw-taipei', nameEs: 'Taipéi', nameEn: 'Taipei', countryNameEs: 'Taiwán', cca3: 'TWN', continent: 'Asia', coordinates: [121.5654, 25.0330], population: 2600000, triviaFact: 'Dominada por la icónica torre bambú Taipei 101 y mercados nocturnos.', flagEmoji: '🇹🇼', weight: 1.8 },
  { id: 'in-mumbai', nameEs: 'Bombay', nameEn: 'Mumbai', countryNameEs: 'India', cca3: 'IND', continent: 'Asia', coordinates: [72.8777, 19.0760], population: 12500000, triviaFact: 'Capital financiera y del cine Bollywood en la costa oeste india.', flagEmoji: '🇮🇳', weight: 2.0 },
  { id: 'in-jaipur', nameEs: 'Jaipur', nameEn: 'Jaipur', countryNameEs: 'India', cca3: 'IND', continent: 'Asia', coordinates: [75.7873, 26.9124], population: 3100000, triviaFact: 'Conocida como la "Ciudad Rosa" por el color de sus monumentos.', flagEmoji: '🇮🇳', weight: 1.8 },
  { id: 'in-varanasi', nameEs: 'Varanasi', nameEn: 'Varanasi', countryNameEs: 'India', cca3: 'IND', continent: 'Asia', coordinates: [83.0086, 25.3176], population: 1200000, triviaFact: 'La ciudad sagrada a orillas del río Ganges con escalinatas Ghats.', flagEmoji: '🇮🇳', weight: 1.8 },
  { id: 'th-bangkok', nameEs: 'Bangkok', nameEn: 'Bangkok', countryNameEs: 'Tailandia', cca3: 'THA', continent: 'Asia', coordinates: [100.5018, 13.7563], population: 10500000, triviaFact: 'Famosa por sus templos dorados como Wat Arun y sus canales.', flagEmoji: '🇹🇭', weight: 2.2 },
  { id: 'th-phuket', nameEs: 'Phuket', nameEn: 'Phuket', countryNameEs: 'Tailandia', cca3: 'THA', continent: 'Asia', coordinates: [98.3923, 7.8804], population: 400000, triviaFact: 'La isla más grande de Tailandia con playas kársticas del Mar de Andamán.', flagEmoji: '🇹🇭', weight: 1.8 },
  { id: 'vn-hanoi', nameEs: 'Hanói', nameEn: 'Hanoi', countryNameEs: 'Vietnam', cca3: 'VNM', continent: 'Asia', coordinates: [105.8342, 21.0278], population: 8000000, triviaFact: 'Famosa por su arquitectura colonial francesa y la bahía de Ha Long cercana.', flagEmoji: '🇻🇳', weight: 1.8 },
  { id: 'kh-siem-reap', nameEs: 'Siem Reap (Angkor Wat)', nameEn: 'Siem Reap', countryNameEs: 'Camboya', cca3: 'KHM', continent: 'Asia', coordinates: [103.8590, 13.3671], population: 245000, triviaFact: 'Puerta de entrada al complejo arqueológico de Angkor Wat en la selva.', flagEmoji: '🇰🇭', weight: 2.0 },
  { id: 'id-bali', nameEs: 'Ubud (Bali)', nameEn: 'Bali', countryNameEs: 'Indonesia', cca3: 'IDN', continent: 'Asia', coordinates: [115.2625, -8.5069], population: 74000, triviaFact: 'El corazón cultural e idílico de terrazas de arroz en la isla de Bali.', flagEmoji: '🇮🇩', weight: 2.2 },
  { id: 'sg-singapore', nameEs: 'Singapur', nameEn: 'Singapore', countryNameEs: 'Singapur', cca3: 'SGP', continent: 'Asia', coordinates: [103.8198, 1.3521], population: 5600000, triviaFact: 'Ciudad-Estado futurista famosa por sus Jardines junto a la Bahía.', flagEmoji: '🇸🇬', weight: 2.2 },
  { id: 'uz-samarkand', nameEs: 'Samarcanda', nameEn: 'Samarkand', countryNameEs: 'Uzbekistán', cca3: 'UZB', continent: 'Asia', coordinates: [66.9750, 39.6542], population: 550000, triviaFact: 'La joya de la Ruta de la Seda con cúpulas turquesa y la plaza Registán.', flagEmoji: '🇺🇿', weight: 1.8 },

  // ==========================================
  // ORIENTE MEDIO
  // ==========================================
  { id: 'ae-dubai', nameEs: 'Dubái', nameEn: 'Dubai', countryNameEs: 'Emiratos Árabes Unidos', cca3: 'ARE', continent: 'Asia', coordinates: [55.2708, 25.2048], population: 3300000, triviaFact: 'Famosa por el rascacielos Burj Khalifa (828m) e islas artificiales.', flagEmoji: '🇦🇪', weight: 2.5 },
  { id: 'jo-petra', nameEs: 'Wadi Musa (Petra)', nameEn: 'Petra', countryNameEs: 'Jordania', cca3: 'JOR', continent: 'Asia', coordinates: [35.4801, 30.3285], population: 35000, triviaFact: 'Mítica capital nabatea labrada directamente en la roca rosa del desierto.', flagEmoji: '🇯🇴', weight: 2.0 },
  { id: 'il-jerusalem', nameEs: 'Jerusalén', nameEn: 'Jerusalem', countryNameEs: 'Israel', cca3: 'ISR', continent: 'Asia', coordinates: [35.2137, 31.7683], population: 930000, triviaFact: 'Ciudad milenaria sagrada para las tres principales religiones monoteístas.', flagEmoji: '🇮🇱', weight: 2.0 },
  { id: 'om-muscat', nameEs: 'Mascate', nameEn: 'Muscat', countryNameEs: 'Omán', cca3: 'OMN', continent: 'Asia', coordinates: [58.5922, 23.5880], population: 1400000, triviaFact: 'Capital del sultanato flanqueada por las cumbres del árido cañón de Hajar.', flagEmoji: '🇴🇲', weight: 1.6 },

  // ==========================================
  // ÁFRICA
  // ==========================================
  { id: 'eg-cairo', nameEs: 'El Cairo', nameEn: 'Cairo', countryNameEs: 'Egipto', cca3: 'EGY', continent: 'Africa', coordinates: [31.2357, 30.0444], population: 10000000, triviaFact: 'Metrópoli a orillas del Nilo célebre por las Pirámides de Guiza.', flagEmoji: '🇪🇬', weight: 2.5 },
  { id: 'eg-luxor', nameEs: 'Lúxor', nameEn: 'Luxor', countryNameEs: 'Egipto', cca3: 'EGY', continent: 'Africa', coordinates: [32.6396, 25.6872], population: 500000, triviaFact: 'El museo al aire libre más grande del mundo en la antigua Tebas.', flagEmoji: '🇪🇬', weight: 1.8 },
  { id: 'ma-marrakesh', nameEs: 'Marrakech', nameEn: 'Marrakesh', countryNameEs: 'Marruecos', cca3: 'MAR', continent: 'Africa', coordinates: [-7.9892, 31.6295], population: 1000000, triviaFact: 'La "Ciudad Roja" custodiada por el Atlas y la plaza Jemaa el-Fna.', flagEmoji: '🇲🇦', weight: 2.0 },
  { id: 'za-cape-town', nameEs: 'Ciudad del Cabo', nameEn: 'Cape Town', countryNameEs: 'Sudáfrica', cca3: 'ZAF', continent: 'Africa', coordinates: [18.4241, -33.9249], population: 4600000, triviaFact: 'Enmarcada por Table Mountain entre los océanos Atlántico e Índico.', flagEmoji: '🇿🇦', weight: 2.2 },
  { id: 'tz-zanzibar', nameEs: 'Zanzíbar', nameEn: 'Zanzibar', countryNameEs: 'Tanzania', cca3: 'TZA', continent: 'Africa', coordinates: [39.1921, -6.1659], population: 223000, triviaFact: 'Isla de especias en el Índico con el laberíntico barrio Stone Town.', flagEmoji: '🇹🇿', weight: 1.8 },
  { id: 'ke-nairobi', nameEs: 'Nairobi', nameEn: 'Nairobi', countryNameEs: 'Kenia', cca3: 'KEN', continent: 'Africa', coordinates: [36.8219, -1.2921], population: 4300000, triviaFact: 'La única capital del mundo con un parque nacional con leones salvajes.', flagEmoji: '🇰🇪', weight: 1.8 },
  { id: 'sen-dakar', nameEs: 'Dakar', nameEn: 'Dakar', countryNameEs: 'Senegal', cca3: 'SEN', continent: 'Africa', coordinates: [-17.4677, 14.7167], population: 1140000, triviaFact: 'El punto más occidental del África continental frente al Atlántico.', flagEmoji: '🇸🇳', weight: 1.6 },

  // ==========================================
  // OCEANÍA Y EL PACÍFICO
  // ==========================================
  { id: 'au-sydney', nameEs: 'Sídney', nameEn: 'Sydney', countryNameEs: 'Australia', cca3: 'AUS', continent: 'Oceania', coordinates: [151.2093, -33.8688], population: 5300000, triviaFact: 'Famosa por la Ópera de Sídney y el puente Harbour Bridge.', flagEmoji: '🇦🇺', weight: 2.5 },
  { id: 'au-melbourne', nameEs: 'Melbourne', nameEn: 'Melbourne', countryNameEs: 'Australia', cca3: 'AUS', continent: 'Oceania', coordinates: [144.9631, -37.8136], population: 5000000, triviaFact: 'La capital cultural australiana famosa por sus pasajes artísticos.', flagEmoji: '🇦🇺', weight: 2.0 },
  { id: 'au-cairns', nameEs: 'Cairns', nameEn: 'Cairns', countryNameEs: 'Australia', cca3: 'AUS', continent: 'Oceania', coordinates: [145.7781, -16.9186], population: 153000, triviaFact: 'La puerta principal de acceso a la Gran Barrera de Coral.', flagEmoji: '🇦🇺', weight: 1.8 },
  { id: 'nz-auckland', nameEs: 'Auckland', nameEn: 'Auckland', countryNameEs: 'Nueva Zelanda', cca3: 'NZL', continent: 'Oceania', coordinates: [174.7633, -36.8485], population: 1650000, triviaFact: 'La "Ciudad de las Velas" rodeada por dos grandes puertos naturales.', flagEmoji: '🇳🇿', weight: 2.0 },
  { id: 'nz-queenstown', nameEs: 'Queenstown', nameEn: 'Queenstown', countryNameEs: 'Nueva Zelanda', cca3: 'NZL', continent: 'Oceania', coordinates: [168.6626, -45.0312], population: 15800, triviaFact: 'La capital mundial de la aventura a orillas del lago Wakatipu.', flagEmoji: '🇳🇿', weight: 1.8 },
  { id: 'fj-suva', nameEs: 'Suva', nameEn: 'Suva', countryNameEs: 'Fiyi', cca3: 'FJI', continent: 'Oceania', coordinates: [178.4419, -18.1416], population: 94000, triviaFact: 'El gran centro político y cultural insular del Pacífico Sur.', flagEmoji: '🇫🇯', weight: 1.6 },
  { id: 'pf-tahiti', nameEs: 'Papeete (Tahití)', nameEn: 'Papeete', countryNameEs: 'Polinesia Francesa', cca3: 'PYF', continent: 'Oceania', coordinates: [-149.5696, -17.5516], population: 26000, triviaFact: 'Isla volcánica tropical famosa por sus lagunas de agua cristalina.', flagEmoji: '🇵🇫', weight: 1.6 }
];

/**
 * Retorna N ciudades aleatorias ponderadas para garantizar máxima rejugabilidad y distribución global
 */
export function getRandomCities(count: number = 5, continentFilter: string = 'World'): CityTarget[] {
  let pool = CITIES_DATASET;

  if (continentFilter !== 'World') {
    const filtered = CITIES_DATASET.filter(c => c.continent === continentFilter);
    if (filtered.length >= count) {
      pool = filtered;
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
