import { TriviaItem } from '../types/game';
import { Country } from '../types/country';

export const TRIVIA_POOL: TriviaItem[] = [
  // ==========================================
  // --- RÉCORDS MUNDIALES EXTRA ---
  // ==========================================
  {
    id: "rec_biggest_country",
    countryCode: "RUS",
    question: "¿Cuál es el país más grande del mundo por superficie territorial?",
    factExplanation: "Rusia abarca más de 17 millones de km², cubriendo más de una novena parte de la superficie continental de la Tierra.",
    category: "records",
    hint: "Se extiende a través de 11 husos horarios entre Europa y Asia."
  },
  {
    id: "rec_smallest_country",
    countryCode: "VAT",
    question: "¿Cuál es el país independiente más pequeño del mundo tanto en superficie como en población?",
    factExplanation: "La Ciudad del Vaticano tiene solo 0,49 km² y una población de aproximadamente 800 habitantes.",
    category: "records",
    hint: "Es un enclave amurallado dentro de la ciudad de Roma."
  },
  {
    id: "rec_highest_mountain",
    countryCode: "NPL",
    question: "¿En qué país se encuentra el Monte Everest (8.848 m), el pico más alto del planeta?",
    factExplanation: "El Everest se sitúa en la cordillera del Himalaya, en la frontera de Nepal con el Tíbet.",
    category: "nature",
    hint: "Su capital es Katmandú y su bandera no es rectangular."
  },
  {
    id: "rec_highest_waterfall",
    countryCode: "VEN",
    question: "¿Qué país alberga el Salto Ángel, la cascada ininterrumpida más alta del mundo (979 metros)?",
    factExplanation: "El Salto Ángel se encuentra en el Parque Nacional Canaima sobre el tepuy Auyantepui.",
    category: "records",
    hint: "País sudamericano con costas en el Caribe y capital en Caracas."
  },
  {
    id: "rec_most_islands",
    countryCode: "SWE",
    question: "¿Cuál es el país con mayor número de islas en el mundo (más de 267.000 islas)?",
    factExplanation: "Suecia posee más de 267.570 islas registradas, de las cuales solo unas mil están habitadas.",
    category: "records",
    hint: "País escandinavo cuya capital es Estocolmo."
  },
  {
    id: "rec_most_lakes",
    countryCode: "CAN",
    question: "¿Qué país posee más del 60% de todos los lagos naturales del planeta y la costa más larga?",
    factExplanation: "Canadá alberga más de 2 millones de lagos y su litoral supera los 202.000 kilómetros de longitud.",
    category: "nature",
    hint: "El segundo país más grande del mundo, su capital es Ottawa."
  },
  {
    id: "rec_driest_desert",
    countryCode: "CHL",
    question: "¿Qué país alberga el Desierto de Atacama, considerado el lugar no polar más árido de la Tierra?",
    factExplanation: "En algunas estaciones meteorológicas de Atacama jamás se ha registrado una sola gota de lluvia.",
    category: "nature",
    hint: "El país más largo y estrecho del mundo, flanqueado por los Andes."
  },
  {
    id: "rec_most_pyramids",
    countryCode: "SDN",
    question: "¿Qué país tiene más pirámides antiguas en su territorio que Egipto (más de 200 pirámides nubias)?",
    factExplanation: "Sudán alberga las famosas pirámides del Reino de Kush en Meroe, superando en cantidad a las de Egipto.",
    category: "history",
    hint: "Situado al sur de Egipto, su capital es Jartum."
  },
  {
    id: "rec_no_rivers",
    countryCode: "SAU",
    question: "¿Cuál es el país más grande del mundo que no cuenta con ningún río permanente de agua dulce?",
    factExplanation: "Arabia Saudita depende completamente de plantas desalinizadoras de agua de mar y acuíferos subterráneos.",
    category: "geography",
    hint: "Ocupa la mayor parte de la Península Arábiga y su capital es Riad."
  },
  {
    id: "rec_most_densely_populated",
    countryCode: "MCO",
    question: "¿Cuál es el país soberano con mayor densidad de población del planeta (más de 19.000 hab/km²)?",
    factExplanation: "El Principado de Mónaco concentra a casi 40.000 habitantes en apenas 2 kilómetros cuadrados.",
    category: "records",
    hint: "Famoso por su circuito urbano de F1 y el Casino de Montecarlo."
  },
  {
    id: "rec_longest_border",
    countryCode: "USA",
    question: "¿Qué país comparte la frontera terrestre no militarizada más larga del mundo con su vecino del norte?",
    factExplanation: "La frontera entre Estados Unidos y Canadá mide 8.891 kilómetros.",
    category: "geography",
    hint: "Tercer país más poblado del mundo, su capital es Washington D.C."
  },
  {
    id: "rec_most_languages",
    countryCode: "PNG",
    question: "¿Qué país tiene la mayor diversidad lingüística del mundo, con más de 800 lenguas indígenas habladas?",
    factExplanation: "Papúa Nueva Guinea alberga cerca del 12% de todos los idiomas que existen en el planeta.",
    category: "culture",
    hint: "Comparte una gran isla al norte de Australia, su capital es Port Moresby."
  },

  // ==========================================
  // --- EUROPA ---
  // ==========================================
  {
    id: "eur_esp",
    countryCode: "ESP",
    question: "¿En qué país se encuentra el restaurante más antiguo del mundo aún en funcionamiento (Sobrino de Botín, fundado en 1725)?",
    factExplanation: "El restaurante Sobrino de Botín en Madrid ostenta el récord Guinness oficial desde hace siglos.",
    category: "culture",
    hint: "Ocupa la mayor parte de la Península Ibérica."
  },
  {
    id: "eur_fra",
    countryCode: "FRA",
    question: "¿Cuál es el país más visitado del mundo por turistas internacionales y el que abarca más husos horarios gracias a sus territorios de ultramar?",
    factExplanation: "Francia cuenta con 12 husos horarios oficiales debido a sus departamentos y territorios repartidos por el globo.",
    category: "records",
    hint: "Hogar de la Torre Eiffel y el Museo del Louvre."
  },
  {
    id: "eur_deu",
    countryCode: "DEU",
    question: "¿Qué país es famoso por sus autopistas sin límite de velocidad genérico ('Autobahn') y por ser el mayor fabricante de cerveza de Europa?",
    factExplanation: "Alemania cuenta con más de 1.500 cervecerías y su famosa 'Ley de Pureza' de 1516.",
    category: "culture",
    hint: "Su capital es Berlín y es la mayor economía de la Unión Europea."
  },
  {
    id: "eur_ita",
    countryCode: "ITA",
    question: "¿Qué país con forma de bota tiene el mayor número de sitios declarados Patrimonio de la Humanidad por la UNESCO?",
    factExplanation: "Italia cuenta con 59 sitios Patrimonio de la Humanidad reconocidos por la UNESCO.",
    category: "history",
    hint: "Cuna del Imperio Romano y del Renacimiento."
  },
  {
    id: "eur_prt",
    countryCode: "PRT",
    question: "¿En qué país se encuentra la librería más antigua del mundo en funcionamiento (Livraria Bertrand en Lisboa, 1732)?",
    factExplanation: "La Livraria Bertrand en el barrio de Chiado de Lisboa tiene el récord Guinness desde 1732.",
    category: "culture",
    hint: "El país más occidental de la Europa continental."
  },
  {
    id: "eur_gbr",
    countryCode: "GBR",
    question: "¿Qué país no tiene una constitución escrita formal en un solo documento y vio nacer la Revolución Industrial?",
    factExplanation: "El Reino Unido opera bajo un sistema de derecho común, convenciones y estatutos históricos como la Carta Magna de 1215.",
    category: "history",
    hint: "Su capital es Londres y está formado por 4 naciones constitutivas."
  },
  {
    id: "eur_irl",
    countryCode: "IRL",
    question: "¿En qué país no existen serpientes en estado salvaje y es apodado 'La Isla Esmeralda'?",
    factExplanation: "Irlanda quedó aislada tras la última glaciación antes de que las serpientes pudieran colonizar la isla.",
    category: "nature",
    hint: "Famoso por el Día de San Patricio y su capital Dublín."
  },
  {
    id: "eur_and",
    countryCode: "AND",
    question: "¿Qué coprincipado en los Pirineos es el único país del mundo cuyo único idioma oficial a nivel estatal es el catalán?",
    factExplanation: "Andorra tiene como jefes de Estado conjuntos al Obispo de Urgel y al Presidente de la República Francesa.",
    category: "culture",
    hint: "Microestado montañoso entre España y Francia."
  },
  {
    id: "eur_smr",
    countryCode: "SMR",
    question: "¿Cuál es la república constitucional y el estado soberano más antiguo del mundo que aún existe (fundada en el año 301 d.C.)?",
    factExplanation: "San Marino fue fundado por San Marino Diácono en el Monte Titano en el año 301 d.C.",
    category: "history",
    hint: "Enclave completamente rodeado por el territorio de Italia."
  },
  {
    id: "eur_lie",
    countryCode: "LIE",
    question: "¿Qué principado alpino es, junto con Uzbekistán, uno de los únicos dos países 'doblemente aislados del mar' en el mundo?",
    factExplanation: "Un país 'doblemente aislado' está rodeado únicamente por países que tampoco tienen salida al mar (Suiza y Austria).",
    category: "geography",
    hint: "Su capital es Vaduz y su moneda oficial es el franco suizo."
  },
  {
    id: "eur_mlt",
    countryCode: "MLT",
    question: "¿Qué país insular alberga templos megalíticos (como Ġgantija) que son más antiguos que las Pirámides de Egipto y Stonehenge?",
    factExplanation: "Los templos de Malta fueron construidos entre el 3600 y el 2500 a.C.",
    category: "history",
    hint: "Archipiélago en el centro del mar Mediterráneo, al sur de Sicilia."
  },
  {
    id: "eur_lux",
    countryCode: "LUX",
    question: "¿Qué país es el único Gran Ducado soberano del mundo y el primero en ofrecer transporte público gratuito en todo su territorio?",
    factExplanation: "Luxemburgo eliminó las tarifas de trenes, tranvías y autobuses en todo el país en 2020.",
    category: "records",
    hint: "Sede de numerosas instituciones europeas, fronterizo con Bélgica, Francia y Alemania."
  },
  {
    id: "eur_bel",
    countryCode: "BEL",
    question: "¿En qué país se inventaron las patatas fritas ('French Fries') y el cómic de Tintín?",
    factExplanation: "A pesar del nombre en inglés, los historiadores sitúan el origen de las patatas fritas en el valle del Mosa en Bélgica.",
    category: "culture",
    hint: "Sede de la Unión Europea y la OTAN en Bruselas."
  },
  {
    id: "eur_nld",
    countryCode: "NLD",
    question: "¿Qué país tiene más bicicletas que habitantes y aproximadamente un tercio de su territorio por debajo del nivel del mar?",
    factExplanation: "Los Países Bajos cuentan con más de 23 millones de bicicletas para 17,5 millones de personas.",
    category: "geography",
    hint: "Famoso por sus diques, molinos de viento y canales de Ámsterdam."
  },
  {
    id: "eur_che",
    countryCode: "CHE",
    question: "¿Qué país no tiene un único presidente sino un Consejo Federal de 7 miembros y no ha participado en una guerra exterior desde 1815?",
    factExplanation: "Suiza mantiene una política de neutralidad armada perpetua reconocida internacionalmente.",
    category: "history",
    hint: "Famoso por sus relojes, chocolates y los Alpes."
  },
  {
    id: "eur_aut",
    countryCode: "AUT",
    question: "¿Qué país fue la cuna de compositores como Mozart, Strauss, Schubert y Haydn?",
    factExplanation: "Viena fue la capital musical indiscutible de Europa durante los periodos clásico y romántico.",
    category: "culture",
    hint: "País alpino centroeuropeo con capital en Viena."
  },
  {
    id: "eur_nor",
    countryCode: "NOR",
    question: "¿Qué país es conocido como la 'Tierra del Sol de Medianoche' y posee los fiordos más espectaculares del planeta?",
    factExplanation: "En el norte de Noruega, el sol no se pone durante más de 2 meses en los meses de verano.",
    category: "nature",
    hint: "País escandinavo cuya capital es Oslo."
  },
  {
    id: "eur_dnk",
    countryCode: "DNK",
    question: "¿Qué país es el lugar de origen de los bloques de construcción LEGO y la monarquía continua más antigua de Europa?",
    factExplanation: "LEGO fue fundado en 1932 en Billund por el carpintero Ole Kirk Christiansen.",
    category: "culture",
    hint: "Su capital es Copenhague y la estatua de La Sirenita es su símbolo."
  },
  {
    id: "eur_fin",
    countryCode: "FIN",
    question: "¿Qué país tiene más de 3 millones de saunas (más de una por cada dos habitantes) y es catalogado el país más feliz del mundo?",
    factExplanation: "La sauna es una parte fundamental de la cultura finlandesa, presente en la mayoría de hogares.",
    category: "culture",
    hint: "Hogar de la región de Laponia y de Papá Noel (Santa Claus)."
  },
  {
    id: "eur_isl",
    countryCode: "ISL",
    question: "¿Qué país volcánico no tiene mosquitos, no tiene ejército permanente y obtiene el 100% de su electricidad de energías renovables?",
    factExplanation: "Islandia se encuentra sobre la dorsal mesoatlántica y aprovecha la energía geotérmica e hidroeléctrica para toda su red.",
    category: "nature",
    hint: "Isla de hielo y fuego en el Atlántico Norte, capital Reikiavik."
  },
  {
    id: "eur_pol",
    countryCode: "POL",
    question: "¿Qué país alberga el castillo más grande del mundo por superficie terrestre (el Castillo de Malbork)?",
    factExplanation: "El Castillo de Malbork fue construido por los Caballeros Teutónicos en el siglo XIII.",
    category: "history",
    hint: "Patria de Nicolás Copérnico y Marie Curie, capital Varsovia."
  },
  {
    id: "eur_grc",
    countryCode: "GRC",
    question: "¿En qué país nacieron la democracia, la filosofía occidental, el teatro y los Juegos Olímpicos de la Antigüedad?",
    factExplanation: "Los primeros Juegos Olímpicos se celebraron en Olimpia en el año 776 a.C.",
    category: "history",
    hint: "Cuna de la civilización helénica, con capital en Atenas."
  },
  {
    id: "eur_cze",
    countryCode: "CZE",
    question: "¿Qué país tiene el mayor consumo per cápita de cerveza del mundo de forma ininterrumpida desde hace 30 años?",
    factExplanation: "En la República Checa se consumen más de 140 litros de cerveza por persona al año.",
    category: "records",
    hint: "Hogar del histórico Castillo de Praga y la región de Bohemia."
  },
  {
    id: "eur_hun",
    countryCode: "HUN",
    question: "¿En qué país se inventaron el Cubo de Rubik, el bolígrafo (birome) y la vitamina C aislada?",
    factExplanation: "Ernő Rubik inventó el cubo mágico en Budapest en 1974, y László Bíró patentó el bolígrafo moderno.",
    category: "culture",
    hint: "País centroeuropeo atravesado por el río Danubio, capital Budapest."
  },
  {
    id: "eur_rou",
    countryCode: "ROU",
    question: "¿En qué país se encuentra la legendaria región de Transilvania y el Castillo de Bran, asociado a la leyenda de Drácula?",
    factExplanation: "El personaje de Bram Stoker se inspiró en el príncipe Vlad Tepes 'El Empalador' de Valaquia.",
    category: "history",
    hint: "País de Europa del Este con salida al Mar Negro y capital en Bucarest."
  },
  {
    id: "eur_ukr",
    countryCode: "UKR",
    question: "¿Qué país es el más extenso situado íntegramente dentro del continente europeo y es apodado 'el granero de Europa'?",
    factExplanation: "Ucrania posee más de 600.000 km² de territorio con unas de las tierras negras más fértiles del mundo.",
    category: "geography",
    hint: "Su capital es Kiev y es el lugar del histórico reactor de Chernóbil."
  },
  {
    id: "eur_hrv",
    countryCode: "HRV",
    question: "¿En qué país se inventó la corbata moderna y es el origen de la raza de perros Dálmata?",
    factExplanation: "La corbata proviene de los pañuelos al cuello que usaban los soldados croatas en el siglo XVII.",
    category: "culture",
    hint: "Famoso por su costa dálmata y la ciudad amurallada de Dubrovnik."
  },
  {
    id: "eur_srb",
    countryCode: "SRB",
    question: "¿En qué país nació el célebre inventor Nikola Tesla (en la localidad de Smiljan, de etnia serbia)?",
    factExplanation: "El Museo Nikola Tesla se encuentra en Belgrado y alberga sus cenizas e inventos originales.",
    category: "history",
    hint: "País de los Balcanes con capital en Belgrado."
  },
  {
    id: "eur_bgr",
    countryCode: "BGR",
    question: "¿Qué país es el mayor productor mundial de aceite de rosas (usado en la alta perfumería) y cuna del yogur con Lactobacillus bulgaricus?",
    factExplanation: "El 'Valle de las Rosas' de Bulgaria produce casi la mitad del aceite esencial de rosas del planeta.",
    category: "nature",
    hint: "País balcánico con capital en Sofía."
  },
  {
    id: "eur_svk",
    countryCode: "SVK",
    question: "¿Qué país tiene la mayor densidad de castillos y fortalezas per cápita de Europa (más de 180 castillos)?",
    factExplanation: "Eslovaquia cuenta con fortalezas medievales imponentes como el Castillo de Spiš.",
    category: "history",
    hint: "Se separó pacíficamente de Chequia en 1993, capital Bratislava."
  },
  {
    id: "eur_svn",
    countryCode: "SVN",
    question: "¿Qué país tiene más de la mitad de su territorio cubierto de bosque y el idílico lago alpino de Bled con una iglesia en su isla?",
    factExplanation: "Eslovenia es uno de los países más verdes y con mayor biodiversidad protegida de Europa.",
    category: "nature",
    hint: "Su capital es Liubliana y tiene salida al mar Adriático en Piran."
  },
  {
    id: "eur_est",
    countryCode: "EST",
    question: "¿Qué país báltico fue el primero del mundo en permitir el voto por Internet en elecciones nacionales y vio nacer Skype?",
    factExplanation: "Estonia es considerada la sociedad digital más avanzada del mundo con su programa e-Residency.",
    category: "records",
    hint: "El más septentrional de los Estados Bálticos, capital Tallin."
  },
  {
    id: "eur_lva",
    countryCode: "LVA",
    question: "¿En qué país báltico se inventaron los vaqueros modernos de tela de jeans (por Jacob Davis, sastre nacido en Riga)?",
    factExplanation: "Jacob Davis nació en Riga y luego se asoció con Levi Strauss en EE.UU. para patentar los remaches de cobre.",
    category: "culture",
    hint: "Situado entre Estonia y Lituania, su capital es Riga."
  },
  {
    id: "eur_ltu",
    countryCode: "LTU",
    question: "¿Qué país báltico fue el estado más extenso de Europa en el siglo XV (Gran Ducado de Lituania) y tiene la 'Colina de las Cruces'?",
    factExplanation: "El Gran Ducado de Lituania llegó a extenderse desde el mar Báltico hasta el mar Negro.",
    category: "history",
    hint: "El más meridional de los Países Bálticos, capital Vilna."
  },
  {
    id: "eur_alb",
    countryCode: "ALB",
    question: "¿Qué país tiene más de 170.000 búnkeres de hormigón construidos durante la dictadura de Enver Hoxha?",
    factExplanation: "Durante la Guerra Fría, el régimen construyó búnkeres por todo el territorio por temor a invasiones.",
    category: "history",
    hint: "País balcánico con costas jónicas y adriáticas, capital Tirana."
  },
  {
    id: "eur_bih",
    countryCode: "BIH",
    question: "¿En qué capital de este país balcánico fue asesinado el archiduque Francisco Fernando en 1914, desencadenando la Primera Guerra Mundial?",
    factExplanation: "El atentado de Sarajevo del 28 de junio de 1914 provocó la crisis que desató la Gran Guerra.",
    category: "history",
    hint: "Famoso por el Puente Viejo de Mostar y su capital Sarajevo."
  },
  {
    id: "eur_mkd",
    countryCode: "MKD",
    question: "¿En qué país nació la Madre Teresa de Calcuta (en su capital Skopie en 1910)?",
    factExplanation: "Agnes Gonxha Bojaxhiu (Madre Teresa) nació en Skopie, cuando formaba parte del Imperio Otomano.",
    category: "history",
    hint: "País de los Balcanes sin salida al mar con capital en Skopie."
  },
  {
    id: "eur_mne",
    countryCode: "MNE",
    question: "¿Qué país alberga la Bahía de Kotor, a menudo descrita como el fiordo más meridional de Europa?",
    factExplanation: "Las Bocas de Kotor en Montenegro son Patrimonio de la Humanidad por su belleza paisajística.",
    category: "nature",
    hint: "Pequeño país balcánico en la costa adriática, capital Podgorica."
  },
  {
    id: "eur_mda",
    countryCode: "MDA",
    question: "¿Qué país alberga 'Mileștii Mici', la bodega subterránea de vino más grande del mundo con más de 200 km de túneles?",
    factExplanation: "Mileștii Mici tiene el récord Guinness por albergar casi 2 millones de botellas de vino en sus galerías.",
    category: "records",
    hint: "País sin litoral encajado entre Rumania y Ucrania, capital Chisináu."
  },
  {
    id: "eur_blr",
    countryCode: "BLR",
    question: "¿Qué país conserva el bosque primario de Białowieża, el último vestigio del bosque virgen que cubría la llanura europea y hogar del bisonte europeo?",
    factExplanation: "El bosque de Białowieża se extiende entre la frontera de este país y Polonia.",
    category: "nature",
    hint: "Su capital es Minsk y no tiene salida al mar."
  },
  {
    id: "eur_cyp",
    countryCode: "CYP",
    question: "¿Qué isla mediterránea es el legendario lugar de nacimiento de la diosa Afrodita y cuya capital está dividida por una línea verde?",
    factExplanation: "Nicosia es la última capital dividida de Europa entre la República de Chipre y la zona norte.",
    category: "history",
    hint: "Isla en el Mediterráneo oriental, su capital es Nicosia."
  },

  // ==========================================
  // --- AMÉRICAS ---
  // ==========================================
  {
    id: "ame_bra",
    countryCode: "BRA",
    question: "¿Qué país alberga la mayor parte de la Selva Amazónica y es el mayor productor de café del mundo desde hace más de 150 años?",
    factExplanation: "Brasil produce aproximadamente un tercio de todo el café comercializado en el planeta.",
    category: "nature",
    hint: "El país más grande de Sudamérica, su capital es Brasilia."
  },
  {
    id: "ame_arg",
    countryCode: "ARG",
    question: "¿Qué país alberga el Aconcagua (6.961 m), la montaña más alta de América y del hemisferio sur y occidental?",
    factExplanation: "El Aconcagua se encuentra en la provincia de Mendoza, en la cordillera de los Andes.",
    category: "records",
    hint: "Cuna del Tango, el mate y las cataratas del Iguazú, capital Buenos Aires."
  },
  {
    id: "ame_mex",
    countryCode: "MEX",
    question: "¿Qué país introdujo al mundo el chocolate, el maíz, el tomate, el aguacate y la vainilla?",
    factExplanation: "El cacao fue cultivado y transformado en bebida ceremonial por las civilizaciones maya y mexica.",
    category: "culture",
    hint: "Hogar de las pirámides de Chichén Itzá y Teotihuacán."
  },
  {
    id: "ame_col",
    countryCode: "COL",
    question: "¿Qué país es el mayor productor mundial de esmeraldas de alta calidad y el país con más especies de aves del planeta?",
    factExplanation: "Colombia alberga más de 1.900 especies de aves registradas, más que cualquier otra nación.",
    category: "nature",
    hint: "Único país de Sudamérica con costas en el océano Pacífico y el mar Caribe."
  },
  {
    id: "ame_per",
    countryCode: "PER",
    question: "¿Qué país alberga la ciudadela inca de Machu Picchu y es el lugar de origen de más de 4.000 variedades de patatas nativas?",
    factExplanation: "Machu Picchu fue construida en el siglo XV a más de 2.400 metros de altura en los Andes peruanos.",
    category: "history",
    hint: "Antiguo centro del Imperio Inca, su capital es Lima."
  },
  {
    id: "ame_bol",
    countryCode: "BOL",
    question: "¿Qué país alberga el Salar de Uyuni, el mayor desierto de sal continuo y la mayor reserva de litio del planeta?",
    factExplanation: "El Salar de Uyuni tiene más de 10.500 km² y en época de lluvias se convierte en el espejo natural más grande del mundo.",
    category: "records",
    hint: "País sudamericano sin salida al mar con capital constitucional en Sucre."
  },
  {
    id: "ame_ecu",
    countryCode: "ECU",
    question: "¿Qué país alberga las Islas Galápagos (que inspiraron la teoría de la evolución de Darwin) y el punto más cercano al Sol en la Tierra (el volcán Chimborazo)?",
    factExplanation: "Debido al abultamiento ecuatorial de la Tierra, la cumbre del Chimborazo es el punto más alejado del centro del planeta.",
    category: "nature",
    hint: "Debe su nombre a la línea ecuatorial que lo cruza, capital Quito."
  },
  {
    id: "ame_pry",
    countryCode: "PRY",
    question: "¿Qué país genera casi el 100% de su electricidad con energía hidroeléctrica gracias a la colosal represa de Itaipú?",
    factExplanation: "Paraguay es uno de los mayores exportadores netos de energía limpia renovable del mundo.",
    category: "records",
    hint: "País bilingüe español-guaraní en el corazón de Sudamérica."
  },
  {
    id: "ame_ury",
    countryCode: "URY",
    question: "¿Qué país fue el primero del mundo en ganar la primera Copa Mundial de Fútbol de la FIFA (1930) en el Estadio Centenario?",
    factExplanation: "Uruguay venció a Argentina 4-2 en la final de 1930 en Montevideo.",
    category: "history",
    hint: "País rioplatense con capital en Montevideo."
  },
  {
    id: "ame_cub",
    countryCode: "CUB",
    question: "¿Qué país insular es la mayor isla de las Antillas, famoso por sus coches clásicos de los años 50 ('almendrones') y sus puros habanos?",
    factExplanation: "Cuba cuenta con miles de automóviles clásicos estadounidenses preservados durante más de 70 años.",
    category: "culture",
    hint: "Su capital es La Habana y el baile del son y la salsa son iconos mundiales."
  },
  {
    id: "ame_dom",
    countryCode: "DOM",
    question: "¿Qué país alberga la primera catedral, el primer hospital y la primera universidad de América en su Ciudad Colonial?",
    factExplanation: "La Catedral de Santa María la Menor en Santo Domingo fue consagrada en 1541.",
    category: "history",
    hint: "Comparte la isla de La Española y es la cuna del merengue y la bachata."
  },
  {
    id: "ame_cri",
    countryCode: "CRI",
    question: "¿Qué país abolió constitucionalmente su ejército en 1948 y alberga cerca del 5% de la biodiversidad mundial en apenas 0,03% de la superficie del planeta?",
    factExplanation: "Costa Rica redirigió el presupuesto militar hacia la educación, la salud y la protección de parques nacionales.",
    category: "nature",
    hint: "Famoso por su lema 'Pura Vida', capital San José."
  },
  {
    id: "ame_pan",
    countryCode: "PAN",
    question: "¿Qué país alberga el canal interoceánico que conecta los océanos Atlántico y Pacífico a través de un sistema de esclusas?",
    factExplanation: "Por el Canal de Panamá transita aproximadamente el 6% de todo el comercio marítimo mundial.",
    category: "geography",
    hint: "Istmo que une Centroamérica con Sudamérica."
  },
  {
    id: "ame_gtm",
    countryCode: "GTM",
    question: "¿Qué país alberga las ruinas mayas de Tikal inmersas en la selva del Petén y el lago de Atitlán rodeado de tres volcanes?",
    factExplanation: "Tikal fue una de las capitales más poderosas del Imperio Maya durante el periodo clásico.",
    category: "history",
    hint: "País centroamericano cuya capital lleva el mismo nombre."
  },
  {
    id: "ame_hti",
    countryCode: "HTI",
    question: "¿Qué país fue la primera república negra independiente del mundo y la primera nación de América Latina en abolir la esclavitud (1804)?",
    factExplanation: "La Revolución Haitiana liderada por Toussaint Louverture y Jean-Jacques Dessalines triunfó en 1804.",
    category: "history",
    hint: "Ocupa el tercio occidental de la isla La Española, capital Puerto Príncipe."
  },
  {
    id: "ame_jam",
    countryCode: "JAM",
    question: "¿Qué país caribeño es la cuna del género musical Reggae, de Bob Marley y del velocista más rápido de la historia (Usain Bolt)?",
    factExplanation: "El reggae de Jamaica fue declarado Patrimonio Cultural Inmaterial de la Humanidad por la UNESCO.",
    category: "culture",
    hint: "Isla caribeña al sur de Cuba con capital en Kingston."
  },
  {
    id: "ame_bhs",
    countryCode: "BHS",
    question: "¿En qué archipiélago de más de 700 islas tocó tierra Cristóbal Colón por primera vez en América en 1492 (isla de Guanahani)?",
    factExplanation: "Colón desembarcó el 12 de octubre de 1492 en la isla que llamó San Salvador, en las Bahamas.",
    category: "history",
    hint: "Archipiélago atlántico al norte de Cuba, capital Nasáu."
  },
  {
    id: "ame_brb",
    countryCode: "BRB",
    question: "¿Qué país insular del Caribe es el lugar de origen de la cantante Rihanna y del ron comercial más antiguo del mundo (Mount Gay, 1703)?",
    factExplanation: "Mount Gay Rum en Barbados produce ron ininterrumpidamente desde hace más de 300 años.",
    category: "culture",
    hint: "Isla más oriental de las Antillas Menores, capital Bridgetown."
  },

  // ==========================================
  // --- ASIA ---
  // ==========================================
  {
    id: "asi_chn",
    countryCode: "CHN",
    question: "¿Qué país construyó la Gran Muralla (con más de 21.000 km de ramales) e inventó el papel, la pólvora, la brújula y la imprenta?",
    factExplanation: "Las 'Cuatro Grandes Invenciones' de la antigua China cambiaron el curso de la historia universal.",
    category: "history",
    hint: "País con capital en Pekín y hogar de los Guerreros de Terracota."
  },
  {
    id: "asi_jpn",
    countryCode: "JPN",
    question: "¿Qué país archipiélago tiene la mayor esperanza de vida del mundo, el tren bala Shinkansen y el Monte Fuji?",
    factExplanation: "Japón cuenta con más de 90.000 personas centenarias registradas.",
    category: "culture",
    hint: "Conocido como el País del Sol Naciente, capital Tokio."
  },
  {
    id: "asi_ind",
    countryCode: "IND",
    question: "¿Qué país es el lugar de nacimiento del Yoga, el ajedrez (Chaturanga), el sistema decimal con el número cero y el Taj Mahal?",
    factExplanation: "El matemático indio Brahmagupta formalizó el uso del cero como número en el siglo VII.",
    category: "history",
    hint: "El país más poblado del planeta, con capital en Nueva Delhi."
  },
  {
    id: "asi_kor",
    countryCode: "KOR",
    question: "¿Qué país es el líder mundial en velocidad de internet móvil, pionero del fenómeno cultural K-Pop y de los eSports?",
    factExplanation: "Corea del Sur fue el primer país del mundo en desplegar redes comerciales 5G a nivel nacional.",
    category: "culture",
    hint: "Ocupa la mitad sur de la península coreana, capital Seúl."
  },
  {
    id: "asi_idn",
    countryCode: "IDN",
    question: "¿Cuál es el país insular más grande del mundo (más de 17.500 islas) y el que alberga al dragón de Komodo, el lagarto más grande de la Tierra?",
    factExplanation: "El dragón de Komodo es endémico de las islas de Komodo, Rinca y Flores en Indonesia.",
    category: "nature",
    hint: "País del sudeste asiático con capital en Yakarta (y futura Nusantara)."
  },
  {
    id: "asi_sgp",
    countryCode: "SGP",
    question: "¿Qué ciudad-estado insular es uno de los únicos tres países del mundo sin capital separada y es famoso por su aeropuerto con cascada interior (Jewel Changi)?",
    factExplanation: "Singapur es a la vez una ciudad, una isla y una república soberana.",
    category: "records",
    hint: "Situado en el extremo sur de la península de Malaca."
  },
  {
    id: "asi_tha",
    countryCode: "THA",
    question: "¿Qué país del sudeste asiático es el único de su región que jamás fue colonizado por potencias europeas (antiguo Reino de Siam)?",
    factExplanation: "El nombre 'Thailand' significa literalmente 'Tierra de los Libres' (Prathet Thai).",
    category: "history",
    hint: "Famoso por sus templos budistas dorados y su capital Bangkok."
  },
  {
    id: "asi_pse",
    countryCode: "PSE",
    question: "¿Qué país histórico de Oriente Próximo alberga ciudades milenarias como Jericó (una de las más antiguas continuamente habitadas) y Belén?",
    factExplanation: "Jericó cuenta con asentamientos arqueológicos de más de 11.000 años de antigüedad.",
    category: "history",
    hint: "Su capital proclamada es Jerusalén Este y cuenta con la bandera tricolor con triángulo rojo."
  },
  {
    id: "asi_tur",
    countryCode: "TUR",
    question: "¿Qué país transcontinental alberga la única ciudad del mundo situada sobre dos continentes a la vez (Estambul, entre Europa y Asia)?",
    factExplanation: "Estambul está dividida por el estrecho del Bósforo que separa Europa de Asia.",
    category: "geography",
    hint: "Hogar de la basílica de Santa Sofía y los paisajes de Capadocia, capital Ankara."
  },
  {
    id: "asi_are",
    countryCode: "ARE",
    question: "¿Qué país alberga el edificio más alto construido por el ser humano (el Burj Khalifa, con 828 metros de altura)?",
    factExplanation: "El Burj Khalifa en Dubái tiene 163 pisos habitables y superó todos los récords de altura mundiales.",
    category: "records",
    hint: "Federación de siete emiratos en el Golfo Pérsico, capital Abu Dabi."
  },
  {
    id: "asi_btn",
    countryCode: "BTN",
    question: "¿Qué reino en el Himalaya mide el progreso de su nación a través del índice de 'Felicidad Nacional Bruta' en lugar del PIB y es carbono negativo?",
    factExplanation: "Bután absorbe más dióxido de carbono del que emite gracias a su estricta cobertura forestal del 70%.",
    category: "records",
    hint: "Conocido como la Tierra del Dragón del Trueno, capital Timbu."
  },
  {
    id: "asi_mdv",
    countryCode: "MDV",
    question: "¿Cuál es el país más plano y con menor altitud promedio del mundo (apenas 1,5 metros sobre el nivel del mar)?",
    factExplanation: "Las Maldivas están formadas por 26 atolones de coral y su punto natural más alto mide solo 2,4 metros.",
    category: "records",
    hint: "Archipiélago paradisíaco en el océano Índico, capital Malé."
  },
  {
    id: "asi_mng",
    countryCode: "MNG",
    question: "¿Cuál es el país independiente con menor densidad de población del planeta (apenas 2 habitantes por km²)?",
    factExplanation: "Mongolia tiene más de 1,5 millones de km² para poco más de 3 millones de personas, con una fuerte tradición nómada.",
    category: "records",
    hint: "Cuna de Gengis Kan y del Imperio Mongol, capital Ulán Bator."
  },
  {
    id: "asi_phl",
    countryCode: "PHL",
    question: "¿Qué país archipiélago de más de 7.000 islas fue bautizado en honor al rey Felipe II de España en el siglo XVI?",
    factExplanation: "Ruy López de Villalobos dio nombre a las islas en 1543 en honor al entonces príncipe de Asturias Felipe II.",
    category: "history",
    hint: "País del sudeste asiático con capital en Manila."
  },

  // ==========================================
  // --- ÁFRICA ---
  // ==========================================
  {
    id: "afr_egy",
    countryCode: "EGY",
    question: "¿En qué país se construyó la Gran Pirámide de Guiza, la única de las Siete Maravillas del Mundo Antiguo que sigue en pie?",
    factExplanation: "La Gran Pirámide de Keops fue la estructura más alta del mundo durante más de 3.800 años.",
    category: "history",
    hint: "El río Nilo recorre su territorio hacia el Mediterráneo, capital El Cairo."
  },
  {
    id: "afr_zaf",
    countryCode: "ZAF",
    question: "¿Qué país tiene tres capitales oficiales diferentes (Pretoria ejecutiva, Ciudad del Cabo legislativa y Bloemfontein judicial)?",
    factExplanation: "Sudáfrica dividió los tres poderes del Estado en tres ciudades distintas tras la Unión de 1910.",
    category: "records",
    hint: "Patria de Nelson Mandela, situada en el extremo sur del continente africano."
  },
  {
    id: "afr_nga",
    countryCode: "NGA",
    question: "¿Cuál es el país más poblado de África y el hogar de 'Nollywood', la segunda industria de cine más prolífica del mundo?",
    factExplanation: "Nigeria supera los 210 millones de habitantes y produce más de 2.000 películas al año.",
    category: "records",
    hint: "Potencia de África Occidental con capital en Abuya."
  },
  {
    id: "afr_mar",
    countryCode: "MAR",
    question: "¿En qué país se fundó la Universidad de al-Qarawiyyin (en Fez, 859 d.C.), la institución universitaria más antigua del mundo en funcionamiento continuo?",
    factExplanation: "La universidad fue fundada por Fátima al-Fihri y está reconocida por la UNESCO y el Récord Guinness.",
    category: "history",
    hint: "Reino en el norte de África separado de Europa por el Estrecho de Gibraltar."
  },
  {
    id: "afr_tza",
    countryCode: "TZA",
    question: "¿Qué país alberga el Monte Kilimanjaro (5.895 m), la montaña independiente y volcán más alto de África, y el Parque Serengeti?",
    factExplanation: "El Kilimanjaro tiene nieves perpetuas en la cumbre a pesar de estar a escasos grados del ecuador.",
    category: "nature",
    hint: "País de África Oriental que incluye el archipiélago de Zanzíbar, capital Dodoma."
  },
  {
    id: "afr_ken",
    countryCode: "KEN",
    question: "¿Qué país es famoso por ser la cuna de los mejores corredores de fondo y maratón de la historia y por el Valle del Gran Rift?",
    factExplanation: "Atletas de la etnia kalenjin de Kenia ostentan la gran mayoría de récords mundiales en carreras de media y larga distancia.",
    category: "records",
    hint: "País del este africano atravesado por el ecuador, capital Nairobi."
  },
  {
    id: "afr_eth",
    countryCode: "ETH",
    question: "¿Qué país es el lugar de origen biológico del café (región de Kaffa) y el único país africano con su propio calendario de 13 meses?",
    factExplanation: "El calendario etíope tiene 12 meses de 30 días y un decimotercer mes de 5 o 6 días ('Pagume').",
    category: "culture",
    hint: "País del Cuerno de África con capital en Adís Abeba."
  },
  {
    id: "afr_mdg",
    countryCode: "MDG",
    question: "¿Qué gran isla tiene más del 90% de su fauna y flora endémica (que no existe en ningún otro lugar), incluyendo todos los lémures salvajes?",
    factExplanation: "Madagascar se separó del subcontinente indio hace 88 millones de años, evolucionando en aislamiento total.",
    category: "nature",
    hint: "La cuarta isla más grande del mundo, frente a la costa de Mozambique."
  },
  {
    id: "afr_bwa",
    countryCode: "BWA",
    question: "¿Qué país alberga la mayor población de elefantes salvajes de África y el delta del Okavango (un delta que desemboca en un desierto)?",
    factExplanation: "El río Okavango nunca llega al mar; sus aguas se evaporan en las arenas del desierto de Kalahari.",
    category: "nature",
    hint: "País del sur de África con capital en Gaborone."
  },
  {
    id: "afr_nam",
    countryCode: "NAM",
    question: "¿Qué país alberga el Desierto de Namib, considerado el desierto más antiguo del mundo (con más de 55 millones de años) y dunas rojas gigantes?",
    factExplanation: "Las dunas de Sossusvlei en el Namib se encuentran entre las más altas del planeta, superando los 300 metros.",
    category: "nature",
    hint: "País del suroeste africano en la costa atlántica, capital Windhoek."
  },
  {
    id: "afr_dza",
    countryCode: "DZA",
    question: "¿Cuál es el país más extenso de todo el continente africano y del mundo árabe?",
    factExplanation: "Argelia tiene más de 2,38 millones de km², de los cuales más del 80% están cubiertos por el desierto del Sáhara.",
    category: "geography",
    hint: "País del norte de África cuya capital es Argel."
  },
  {
    id: "afr_sen",
    countryCode: "SEN",
    question: "¿Qué país alberga el punto más occidental de la África continental (la península de Cabo Verde) y el lago rosa Retba?",
    factExplanation: "El Lago Retba adquiere su color rosado debido a la alta concentración de sal y la microalga Dunaliella salina.",
    category: "geography",
    hint: "Histórica meta del Rally París-Dakar, capital Dakar."
  },

  // ==========================================
  // --- OCEANÍA ---
  // ==========================================
  {
    id: "oce_aus",
    countryCode: "AUS",
    question: "¿Qué país-continente alberga la Gran Barrera de Coral (la estructura viva más grande del planeta) y animales únicos como canguros y koalas?",
    factExplanation: "La Gran Barrera de Coral se extiende a lo largo de más de 2.300 kilómetros y es visible desde el espacio.",
    category: "nature",
    hint: "El sexto país más grande del mundo, su capital es Camberra."
  },
  {
    id: "oce_nzl",
    countryCode: "NZL",
    question: "¿Qué país fue el primero del mundo en otorgar el sufragio universal a las mujeres (1893) y fue el escenario del rodaje de 'El Señor de los Anillos'?",
    factExplanation: "Nueva Zelanda aprobó el derecho al voto femenino en 1893 gracias al liderazgo de Kate Sheppard.",
    category: "history",
    hint: "Compuesto por dos islas principales (Norte y Sur), capital Wellington."
  },
  {
    id: "oce_fji",
    countryCode: "FJI",
    question: "¿Qué país archipiélago del Pacífico está situado justo sobre el meridiano 180° y es famoso por su dominio mundial en rugby a siete?",
    factExplanation: "El meridiano 180° atraviesa la isla de Taveuni en Fiyi.",
    category: "geography",
    hint: "Archipiélago de más de 300 islas en Melanesia, capital Suva."
  },
  {
    id: "oce_kir",
    countryCode: "KIR",
    question: "¿Cuál es el único país del mundo cuyo territorio se extiende simultáneamente por los cuatro hemisferios (Norte, Sur, Este y Oeste)?",
    factExplanation: "Las 33 islas y atolones de Kiribati están atravesadas tanto por la línea del ecuador como por el antimeridiano.",
    category: "records",
    hint: "El primer país habitado en recibir el Año Nuevo cada primero de enero."
  },
  {
    id: "oce_nru",
    countryCode: "NRU",
    question: "¿Cuál es la república independiente más pequeña del mundo (21 km²) y el único estado soberano sin una capital oficial designada?",
    factExplanation: "Nauru no tiene ciudad capital; el distrito de Yaren actúa de facto como sede de gobierno.",
    category: "records",
    hint: "Isla de Micronesia en el Pacífico central."
  },
  {
    id: "oce_tuv",
    countryCode: "TUV",
    question: "¿Qué país insular obtiene una gran parte de sus ingresos nacionales gracias a la licencia de su dominio de internet '.tv'?",
    factExplanation: "Tuvalu vendió los derechos del codiciado dominio '.tv' a empresas de televisión e internet por millones de dólares.",
    category: "records",
    hint: "Uno de los países con menor altitud y población del Pacífico, capital Funafuti."
  },
  {
    id: "oce_plw",
    countryCode: "PLW",
    question: "¿Qué país alberga el famoso 'Lago de las Medusas' (Jellyfish Lake), donde millones de medusas doradas no pican a los humanos?",
    factExplanation: "Las medusas de Palaos perdieron su capacidad urticante al evolucionar durante milenios sin depredadores en el lago.",
    category: "nature",
    hint: "Nación insular de Micronesia con capital en Ngerulmud."
  },
  {
    id: "oce_wsm",
    countryCode: "WSM",
    question: "¿Qué país insular de Polinesia 'saltó' un día completo en el calendario (el 30 de diciembre de 2011) para alinearse con sus socios comerciales de Asia y Oceanía?",
    factExplanation: "Samoa cambió de lado de la línea internacional de cambio de fecha, pasando directamente del 29 al 31 de diciembre.",
    category: "history",
    hint: "Cuna de la cultura Fa'a Samoa en Polinesia, capital Apia."
  }
];

/**
 * Devuelve la pool completa garantizando al menos una pregunta para cada país del mundo
 * más todos los récords mundiales y curiosidades especiales.
 */
export function getAllTriviaPool(allCountries: Country[]): TriviaItem[] {
  const fullPool: TriviaItem[] = [...TRIVIA_POOL];
  const coveredCodes = new Set(TRIVIA_POOL.map(t => t.countryCode.toUpperCase()));

  for (const country of allCountries) {
    const cca3 = country.cca3.toUpperCase();
    if (!coveredCodes.has(cca3)) {
      // Generar pregunta geográfica contextual para países restantes
      let question = `¿Qué país tiene por capital ${country.capital} y se ubica en ${country.continentEs}?`;
      let factExplanation = `${country.nameEs} es un estado soberano en ${country.subregionEs || country.continentEs} con capital en ${country.capital}.`;
      
      if (country.subregionEs) {
        question = `¿Qué país de ${country.subregionEs} tiene como capital oficial ${country.capital}?`;
      }

      fullPool.push({
        id: `gen_trivia_${cca3}`,
        countryCode: cca3,
        question,
        factExplanation,
        category: 'geography',
        hint: `Su capital es ${country.capital} y su código internacional es ${cca3}.`
      });
      coveredCodes.add(cca3);
    }
  }

  return fullPool;
}
