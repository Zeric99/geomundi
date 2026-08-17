/**
 * Mapeo exhaustivo de códigos numéricos ISO 3166-1 (usados por TopoJSON / Natural Earth / world-atlas)
 * a códigos alfa-3 (ISO 3166-1 alpha-3 / cca3) utilizados por REST Countries.
 */
export const NUMERIC_TO_CCA3: Record<string, string> = {
  "004": "AFG", "008": "ALB", "012": "DZA", "020": "AND", "024": "AGO", "028": "ATG",
  "032": "ARG", "051": "ARM", "036": "AUS", "040": "AUT", "031": "AZE", "044": "BHS",
  "048": "BHR", "050": "BGD", "052": "BRB", "112": "BLR", "056": "BEL", "084": "BLZ",
  "204": "BEN", "064": "BTN", "068": "BOL", "070": "BIH", "072": "BWA", "076": "BRA",
  "096": "BRN", "100": "BGR", "854": "BFA", "108": "BDI", "116": "KHM", "120": "CMR",
  "124": "CAN", "132": "CPV", "140": "CAF", "148": "TCD", "152": "CHL", "156": "CHN",
  "170": "COL", "174": "COM", "178": "COG", "180": "COD", "188": "CRI", "384": "CIV",
  "191": "HRV", "192": "CUB", "196": "CYP", "203": "CZE", "208": "DNK", "262": "DJI",
  "212": "DMA", "214": "DOM", "218": "ECU", "818": "EGY", "222": "SLV", "226": "GNQ",
  "232": "ERI", "233": "EST", "748": "SWZ", "231": "ETH", "242": "FJI", "246": "FIN",
  "250": "FRA", "266": "GAB", "270": "GMB", "268": "GEO", "276": "DEU", "288": "GHA",
  "300": "GRC", "308": "GRD", "320": "GTM", "324": "GIN", "624": "GNB", "328": "GUY",
  "332": "HTI", "340": "HND", "348": "HUN", "352": "ISL", "356": "IND", "360": "IDN",
  "364": "IRN", "368": "IRQ", "372": "IRL", "376": "ISR", "380": "ITA", "388": "JAM",
  "392": "JPN", "400": "JOR", "398": "KAZ", "404": "KEN", "296": "KIR", "408": "PRK",
  "410": "KOR", "414": "KWT", "417": "KGZ", "418": "LAO", "428": "LVA", "422": "LBN",
  "426": "LSO", "430": "LBR", "434": "LBY", "438": "LIE", "440": "LTU", "442": "LUX",
  "807": "MKD", "450": "MDG", "454": "MWI", "458": "MYS", "462": "MDV", "466": "MLI",
  "470": "MLT", "584": "MHL", "478": "MRT", "480": "MUS", "484": "MEX", "583": "FSM",
  "498": "MDA", "492": "MCO", "496": "MNG", "499": "MNE", "504": "MAR", "508": "MOZ",
  "104": "MMR", "516": "NAM", "520": "NRU", "524": "NPL", "528": "NLD", "554": "NZL",
  "558": "NIC", "562": "NER", "566": "NGA", "578": "NOR", "512": "OMN", "586": "PAK",
  "585": "PLW", "591": "PAN", "598": "PNG", "600": "PRY", "604": "PER", "608": "PHL",
  "616": "POL", "620": "PRT", "634": "QAT", "642": "ROU", "643": "RUS", "646": "RWA",
  "659": "KNA", "662": "LCA", "670": "VCT", "882": "WSM", "674": "SMR", "678": "STP",
  "682": "SAU", "686": "SEN", "688": "SRB", "690": "SYC", "694": "SLE", "702": "SGP",
  "703": "SVK", "705": "SVN", "090": "SLB", "706": "SOM", "710": "ZAF", "728": "SSD",
  "724": "ESP", "144": "LKA", "729": "SDN", "740": "SUR", "752": "SWE", "756": "CHE",
  "760": "SYR", "762": "TJK", "834": "TZA", "764": "THA", "626": "TLS", "768": "TGO",
  "776": "TON", "780": "TTO", "788": "TUN", "792": "TUR", "795": "TKM", "798": "TUV",
  "800": "UGA", "804": "UKR", "784": "ARE", "826": "GBR", "840": "USA", "858": "URY",
  "860": "UZB", "548": "VUT", "336": "VAT", "862": "VEN", "704": "VNM", "887": "YEM",
  "894": "ZMB", "716": "ZWE",
  // Territorios y especiales
  "158": "TWN", "275": "PSE", "983": "XKX", "630": "PRI", "304": "GRL"
};

/**
 * Alias y correcciones para compatibilidad entre diferentes datasets GeoJSON/TopoJSON
 */
export const GEO_ALIASES: Record<string, string> = {
  "-99": "CYP",     // Chipre del norte / Disputas
  "SDS": "SSD",     // South Sudan
  "SAH": "ESH",     // Western Sahara
  "KOS": "XKX",     // Kosovo
  "PSX": "PSE",     // Palestina
  "SOL": "SLB",     // Solomon Islands
  "SOM": "SOM",     // Somaliland mapeado a Somalia
  "NCL": "NCL",     // New Caledonia
  "PRI": "PRI",     // Puerto Rico
  "GRL": "GRL",     // Groenlandia
};

/**
 * Conjunto completo de microestados e islas pequeñas con marcadores interactivos visibles en el mapa
 */
export const MICROSTATE_CODES = new Set([
  // Europa
  'AND', 'VAT', 'SMR', 'MCO', 'LIE', 'MLT', 'LUX',
  // América y Caribe (Todas las islas y microestados)
  'ATG', 'BHS', 'BRB', 'DMA', 'GRD', 'KNA', 'LCA', 'VCT', 'TTO', 'JAM', 'HTI', 'DOM', 'CUB',
  // África
  'CPV', 'COM', 'MUS', 'STP', 'SYC', 'SWZ', 'LSO', 'DJI', 'GMB', 'STP',
  // Asia
  'SGP', 'BHR', 'MDV', 'BRN', 'QAT', 'KWT', 'LBN', 'TLS', 'BTN', 'PSE',
  // Oceanía (Todas las islas)
  'FJI', 'KIR', 'MHL', 'FSM', 'NRU', 'PLW', 'WSM', 'SLB', 'TON', 'TUV', 'VUT'
]);

/**
 * Centros geográficos y niveles de zoom sugeridos por continente y regiones especiales
 */
export const CONTINENT_VIEWPORTS: Record<string, { center: [number, number]; zoom: number }> = {
  World: { center: [10, 0], zoom: 1 },
  Europe: { center: [15, 52], zoom: 3.5 },
  Americas: { center: [-75, 10], zoom: 1.6 },
  Africa: { center: [20, 2], zoom: 2.2 },
  Asia: { center: [95, 30], zoom: 1.9 },
  Oceania: { center: [140, -22], zoom: 2.4 },
  // Regiones especiales de microestados e islas
  Caribbean: { center: [-68, 16], zoom: 4.8 },
  PacificIslands: { center: [168, -4], zoom: 2.8 },
  EuropeMicro: { center: [12, 44], zoom: 5.5 },
};

/**
 * Traduce y normaliza nombres de continentes
 */
export const CONTINENT_NAMES_ES: Record<string, string> = {
  World: 'Mundo',
  Europe: 'Europa',
  Americas: 'América',
  Africa: 'África',
  Asia: 'Asia',
  Oceania: 'Oceanía',
  Caribbean: 'Caribe e Islas',
  PacificIslands: 'Islas de Oceanía',
  EuropeMicro: 'Microestados de Europa',
};
