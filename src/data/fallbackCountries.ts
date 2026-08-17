import { Country } from '../types/country';

export const FALLBACK_COUNTRIES: Country[] = [
  // ==========================================
  // --- EUROPA (50 países y microestados) ---
  // ==========================================
  {
    cca2: "ES", cca3: "ESP", ccn3: "724", nameEs: "España", nameEn: "Spain",
    officialNameEs: "Reino de España", capital: "Madrid", continent: "Europe", continentEs: "Europa",
    subregion: "Southern Europe", subregionEs: "Europa del Sur", population: 47351567,
    flagSvg: "https://flagcdn.com/es.svg", flagEmoji: "🇪🇸", latlng: [40.4637, -3.7492],
    altSpellings: ["Espana", "Reino de Espana", "Spain"]
  },
  {
    cca2: "FR", cca3: "FRA", ccn3: "250", nameEs: "Francia", nameEn: "France",
    officialNameEs: "República Francesa", capital: "París", continent: "Europe", continentEs: "Europa",
    subregion: "Western Europe", subregionEs: "Europa Occidental", population: 67391582,
    flagSvg: "https://flagcdn.com/fr.svg", flagEmoji: "🇫🇷", latlng: [46.2276, 2.2137],
    altSpellings: ["France", "Republique Francaise"]
  },
  {
    cca2: "DE", cca3: "DEU", ccn3: "276", nameEs: "Alemania", nameEn: "Germany",
    officialNameEs: "República Federal de Alemania", capital: "Berlín", continent: "Europe", continentEs: "Europa",
    subregion: "Western Europe", subregionEs: "Europa Occidental", population: 83240525,
    flagSvg: "https://flagcdn.com/de.svg", flagEmoji: "🇩🇪", latlng: [51.1657, 10.4515],
    altSpellings: ["Germany", "Deutschland"]
  },
  {
    cca2: "IT", cca3: "ITA", ccn3: "380", nameEs: "Italia", nameEn: "Italy",
    officialNameEs: "República Italiana", capital: "Roma", continent: "Europe", continentEs: "Europa",
    subregion: "Southern Europe", subregionEs: "Europa del Sur", population: 59554023,
    flagSvg: "https://flagcdn.com/it.svg", flagEmoji: "🇮🇹", latlng: [41.8719, 12.5674],
    altSpellings: ["Italy", "Italia"]
  },
  {
    cca2: "PT", cca3: "PRT", ccn3: "620", nameEs: "Portugal", nameEn: "Portugal",
    officialNameEs: "República Portuguesa", capital: "Lisboa", continent: "Europe", continentEs: "Europa",
    subregion: "Southern Europe", subregionEs: "Europa del Sur", population: 10305564,
    flagSvg: "https://flagcdn.com/pt.svg", flagEmoji: "🇵🇹", latlng: [39.3999, -8.2245],
    altSpellings: ["Portugal"]
  },
  {
    cca2: "GB", cca3: "GBR", ccn3: "826", nameEs: "Reino Unido", nameEn: "United Kingdom",
    officialNameEs: "Reino Unido de Gran Bretaña e Irlanda del Norte", capital: "Londres", continent: "Europe", continentEs: "Europa",
    subregion: "Northern Europe", subregionEs: "Europa del Norte", population: 67215293,
    flagSvg: "https://flagcdn.com/gb.svg", flagEmoji: "🇬🇧", latlng: [55.3781, -3.4360],
    altSpellings: ["UK", "Gran Bretaña", "Inglaterra", "Great Britain", "England"]
  },
  {
    cca2: "IE", cca3: "IRL", ccn3: "372", nameEs: "Irlanda", nameEn: "Ireland",
    officialNameEs: "República de Irlanda", capital: "Dublín", continent: "Europe", continentEs: "Europa",
    subregion: "Northern Europe", subregionEs: "Europa del Norte", population: 4994724,
    flagSvg: "https://flagcdn.com/ie.svg", flagEmoji: "🇮🇪", latlng: [53.1424, -7.6921],
    altSpellings: ["Ireland", "Eire"]
  },
  {
    cca2: "AD", cca3: "AND", ccn3: "020", nameEs: "Andorra", nameEn: "Andorra",
    officialNameEs: "Principado de Andorra", capital: "Andorra la Vieja", continent: "Europe", continentEs: "Europa",
    subregion: "Southern Europe", subregionEs: "Pirineos", population: 77265,
    flagSvg: "https://flagcdn.com/ad.svg", flagEmoji: "🇦🇩", latlng: [42.5063, 1.5218],
    altSpellings: ["Andorra", "Andorra la Vella"]
  },
  {
    cca2: "VA", cca3: "VAT", ccn3: "336", nameEs: "Ciudad del Vaticano", nameEn: "Vatican City",
    officialNameEs: "Estado de la Ciudad del Vaticano", capital: "Ciudad del Vaticano", continent: "Europe", continentEs: "Europa",
    subregion: "Southern Europe", subregionEs: "Europa del Sur", population: 800,
    flagSvg: "https://flagcdn.com/va.svg", flagEmoji: "🇻🇦", latlng: [41.9029, 12.4534],
    altSpellings: ["Vaticano", "Santa Sede", "Holy See", "Vatican City"]
  },
  {
    cca2: "SM", cca3: "SMR", ccn3: "674", nameEs: "San Marino", nameEn: "San Marino",
    officialNameEs: "Serenísima República de San Marino", capital: "San Marino", continent: "Europe", continentEs: "Europa",
    subregion: "Southern Europe", subregionEs: "Europa del Sur", population: 33931,
    flagSvg: "https://flagcdn.com/sm.svg", flagEmoji: "🇸🇲", latlng: [43.9424, 12.4578],
    altSpellings: ["San Marino"]
  },
  {
    cca2: "MC", cca3: "MCO", ccn3: "492", nameEs: "Mónaco", nameEn: "Monaco",
    officialNameEs: "Principado de Mónaco", capital: "Mónaco", continent: "Europe", continentEs: "Europa",
    subregion: "Western Europe", subregionEs: "Europa Occidental", population: 39242,
    flagSvg: "https://flagcdn.com/mc.svg", flagEmoji: "🇲🇨", latlng: [43.7384, 7.4246],
    altSpellings: ["Monaco", "Mónaco"]
  },
  {
    cca2: "LI", cca3: "LIE", ccn3: "438", nameEs: "Liechtenstein", nameEn: "Liechtenstein",
    officialNameEs: "Principado de Liechtenstein", capital: "Vaduz", continent: "Europe", continentEs: "Europa",
    subregion: "Central Europe", subregionEs: "Europa Central", population: 38128,
    flagSvg: "https://flagcdn.com/li.svg", flagEmoji: "🇱🇮", latlng: [47.166, 9.5554],
    altSpellings: ["Liechtenstein"]
  },
  {
    cca2: "MT", cca3: "MLT", ccn3: "470", nameEs: "Malta", nameEn: "Malta",
    officialNameEs: "República de Malta", capital: "La Valeta", continent: "Europe", continentEs: "Europa",
    subregion: "Southern Europe", subregionEs: "Mediterráneo", population: 525285,
    flagSvg: "https://flagcdn.com/mt.svg", flagEmoji: "🇲🇹", latlng: [35.9375, 14.3754],
    altSpellings: ["Malta", "Valletta"]
  },
  {
    cca2: "LU", cca3: "LUX", ccn3: "442", nameEs: "Luxemburgo", nameEn: "Luxembourg",
    officialNameEs: "Gran Ducado de Luxemburgo", capital: "Luxemburgo", continent: "Europe", continentEs: "Europa",
    subregion: "Western Europe", subregionEs: "Europa Occidental", population: 632275,
    flagSvg: "https://flagcdn.com/lu.svg", flagEmoji: "🇱🇺", latlng: [49.8153, 6.1296],
    altSpellings: ["Luxembourg", "Luxemburgo"]
  },
  {
    cca2: "BE", cca3: "BEL", ccn3: "056", nameEs: "Bélgica", nameEn: "Belgium",
    officialNameEs: "Reino de Bélgica", capital: "Bruselas", continent: "Europe", continentEs: "Europa",
    subregion: "Western Europe", subregionEs: "Europa Occidental", population: 11589623,
    flagSvg: "https://flagcdn.com/be.svg", flagEmoji: "🇧🇪", latlng: [50.5039, 4.4699],
    altSpellings: ["Belgium", "Belgique", "Belgie"]
  },
  {
    cca2: "NL", cca3: "NLD", ccn3: "528", nameEs: "Países Bajos", nameEn: "Netherlands",
    officialNameEs: "Reino de los Países Bajos", capital: "Ámsterdam", continent: "Europe", continentEs: "Europa",
    subregion: "Western Europe", subregionEs: "Europa Occidental", population: 17441139,
    flagSvg: "https://flagcdn.com/nl.svg", flagEmoji: "🇳🇱", latlng: [52.1326, 5.2913],
    altSpellings: ["Netherlands", "Holanda", "Nederland"]
  },
  {
    cca2: "CH", cca3: "CHE", ccn3: "756", nameEs: "Suiza", nameEn: "Switzerland",
    officialNameEs: "Confederación Suiza", capital: "Berna", continent: "Europe", continentEs: "Europa",
    subregion: "Western Europe", subregionEs: "Europa Occidental", population: 8654622,
    flagSvg: "https://flagcdn.com/ch.svg", flagEmoji: "🇨🇭", latlng: [46.8182, 8.2275],
    altSpellings: ["Switzerland", "Schweiz", "Suisse"]
  },
  {
    cca2: "AT", cca3: "AUT", ccn3: "040", nameEs: "Austria", nameEn: "Austria",
    officialNameEs: "República de Austria", capital: "Viena", continent: "Europe", continentEs: "Europa",
    subregion: "Central Europe", subregionEs: "Europa Central", population: 8917205,
    flagSvg: "https://flagcdn.com/at.svg", flagEmoji: "🇦🇹", latlng: [47.5162, 14.5501],
    altSpellings: ["Austria", "Osterreich"]
  },
  {
    cca2: "SE", cca3: "SWE", ccn3: "752", nameEs: "Suecia", nameEn: "Sweden",
    officialNameEs: "Reino de Suecia", capital: "Estocolmo", continent: "Europe", continentEs: "Europa",
    subregion: "Northern Europe", subregionEs: "Europa del Norte", population: 10353442,
    flagSvg: "https://flagcdn.com/se.svg", flagEmoji: "🇸🇪", latlng: [60.1282, 18.6435],
    altSpellings: ["Sweden", "Sverige"]
  },
  {
    cca2: "NO", cca3: "NOR", ccn3: "578", nameEs: "Noruega", nameEn: "Norway",
    officialNameEs: "Reino de Noruega", capital: "Oslo", continent: "Europe", continentEs: "Europa",
    subregion: "Northern Europe", subregionEs: "Europa del Norte", population: 5379475,
    flagSvg: "https://flagcdn.com/no.svg", flagEmoji: "🇳🇴", latlng: [60.4720, 8.4689],
    altSpellings: ["Norway", "Norge"]
  },
  {
    cca2: "DK", cca3: "DNK", ccn3: "208", nameEs: "Dinamarca", nameEn: "Denmark",
    officialNameEs: "Reino de Dinamarca", capital: "Copenhague", continent: "Europe", continentEs: "Europa",
    subregion: "Northern Europe", subregionEs: "Europa del Norte", population: 5831404,
    flagSvg: "https://flagcdn.com/dk.svg", flagEmoji: "🇩🇰", latlng: [56.2639, 9.5018],
    altSpellings: ["Denmark", "Danmark"]
  },
  {
    cca2: "FI", cca3: "FIN", ccn3: "246", nameEs: "Finlandia", nameEn: "Finland",
    officialNameEs: "República de Finlandia", capital: "Helsinki", continent: "Europe", continentEs: "Europa",
    subregion: "Northern Europe", subregionEs: "Europa del Norte", population: 5530719,
    flagSvg: "https://flagcdn.com/fi.svg", flagEmoji: "🇫🇮", latlng: [61.9241, 25.7482],
    altSpellings: ["Finland", "Suomi"]
  },
  {
    cca2: "IS", cca3: "ISL", ccn3: "352", nameEs: "Islandia", nameEn: "Iceland",
    officialNameEs: "Islandia", capital: "Reikiavik", continent: "Europe", continentEs: "Europa",
    subregion: "Northern Europe", subregionEs: "Europa del Norte", population: 366425,
    flagSvg: "https://flagcdn.com/is.svg", flagEmoji: "🇮🇸", latlng: [64.9631, -19.0208],
    altSpellings: ["Iceland", "Island"]
  },
  {
    cca2: "PL", cca3: "POL", ccn3: "616", nameEs: "Polonia", nameEn: "Poland",
    officialNameEs: "República de Polonia", capital: "Varsovia", continent: "Europe", continentEs: "Europa",
    subregion: "Eastern Europe", subregionEs: "Europa del Este", population: 37950802,
    flagSvg: "https://flagcdn.com/pl.svg", flagEmoji: "🇵🇱", latlng: [51.9194, 19.1451],
    altSpellings: ["Poland", "Polska"]
  },
  {
    cca2: "GR", cca3: "GRC", ccn3: "300", nameEs: "Grecia", nameEn: "Greece",
    officialNameEs: "República Helénica", capital: "Atenas", continent: "Europe", continentEs: "Europa",
    subregion: "Southern Europe", subregionEs: "Europa del Sur", population: 10715549,
    flagSvg: "https://flagcdn.com/gr.svg", flagEmoji: "🇬🇷", latlng: [39.0742, 21.8243],
    altSpellings: ["Greece", "Hellas"]
  },
  {
    cca2: "CZ", cca3: "CZE", ccn3: "203", nameEs: "República Checa", nameEn: "Czechia",
    officialNameEs: "República Checa", capital: "Praga", continent: "Europe", continentEs: "Europa",
    subregion: "Central Europe", subregionEs: "Europa Central", population: 10698896,
    flagSvg: "https://flagcdn.com/cz.svg", flagEmoji: "🇨🇿", latlng: [49.8175, 15.4730],
    altSpellings: ["Czechia", "Chequia"]
  },
  {
    cca2: "HU", cca3: "HUN", ccn3: "348", nameEs: "Hungría", nameEn: "Hungary",
    officialNameEs: "Hungría", capital: "Budapest", continent: "Europe", continentEs: "Europa",
    subregion: "Central Europe", subregionEs: "Europa Central", population: 9749763,
    flagSvg: "https://flagcdn.com/hu.svg", flagEmoji: "🇭🇺", latlng: [47.1625, 19.5033],
    altSpellings: ["Hungary"]
  },
  {
    cca2: "RO", cca3: "ROU", ccn3: "642", nameEs: "Rumania", nameEn: "Romania",
    officialNameEs: "Rumania", capital: "Bucarest", continent: "Europe", continentEs: "Europa",
    subregion: "Eastern Europe", subregionEs: "Europa del Este", population: 19286123,
    flagSvg: "https://flagcdn.com/ro.svg", flagEmoji: "🇷🇴", latlng: [45.9432, 24.9668],
    altSpellings: ["Romania", "Rumanía"]
  },
  {
    cca2: "UA", cca3: "UKR", ccn3: "804", nameEs: "Ucrania", nameEn: "Ukraine",
    officialNameEs: "Ucrania", capital: "Kiev", continent: "Europe", continentEs: "Europa",
    subregion: "Eastern Europe", subregionEs: "Europa del Este", population: 44134693,
    flagSvg: "https://flagcdn.com/ua.svg", flagEmoji: "🇺🇦", latlng: [48.3794, 31.1656],
    altSpellings: ["Ukraine"]
  },
  {
    cca2: "HR", cca3: "HRV", ccn3: "191", nameEs: "Croacia", nameEn: "Croatia",
    officialNameEs: "República de Croacia", capital: "Zagreb", continent: "Europe", continentEs: "Europa",
    subregion: "Southeast Europe", subregionEs: "Sureste de Europa", population: 4047200,
    flagSvg: "https://flagcdn.com/hr.svg", flagEmoji: "🇭🇷", latlng: [45.1, 15.2],
    altSpellings: ["Croatia"]
  },
  {
    cca2: "RS", cca3: "SRB", ccn3: "688", nameEs: "Serbia", nameEn: "Serbia",
    officialNameEs: "República de Serbia", capital: "Belgrado", continent: "Europe", continentEs: "Europa",
    subregion: "Southeast Europe", subregionEs: "Sureste de Europa", population: 6908224,
    flagSvg: "https://flagcdn.com/rs.svg", flagEmoji: "🇷🇸", latlng: [44.0165, 21.0059],
    altSpellings: ["Serbia"]
  },
  {
    cca2: "BG", cca3: "BGR", ccn3: "100", nameEs: "Bulgaria", nameEn: "Bulgaria",
    officialNameEs: "República de Bulgaria", capital: "Sofía", continent: "Europe", continentEs: "Europa",
    subregion: "Southeast Europe", subregionEs: "Sureste de Europa", population: 6927288,
    flagSvg: "https://flagcdn.com/bg.svg", flagEmoji: "🇧🇬", latlng: [42.7339, 25.4858],
    altSpellings: ["Bulgaria"]
  },
  {
    cca2: "SK", cca3: "SVK", ccn3: "703", nameEs: "Eslovaquia", nameEn: "Slovakia",
    officialNameEs: "República Eslovaca", capital: "Bratislava", continent: "Europe", continentEs: "Europa",
    subregion: "Central Europe", subregionEs: "Europa Central", population: 5458827,
    flagSvg: "https://flagcdn.com/sk.svg", flagEmoji: "🇸🇰", latlng: [48.669, 19.699],
    altSpellings: ["Slovakia"]
  },
  {
    cca2: "SI", cca3: "SVN", ccn3: "705", nameEs: "Eslovenia", nameEn: "Slovenia",
    officialNameEs: "República de Eslovenia", capital: "Liubliana", continent: "Europe", continentEs: "Europa",
    subregion: "Central Europe", subregionEs: "Europa Central", population: 2100126,
    flagSvg: "https://flagcdn.com/si.svg", flagEmoji: "🇸🇮", latlng: [46.1512, 14.9955],
    altSpellings: ["Slovenia"]
  },
  {
    cca2: "EE", cca3: "EST", ccn3: "233", nameEs: "Estonia", nameEn: "Estonia",
    officialNameEs: "República de Estonia", capital: "Tallin", continent: "Europe", continentEs: "Europa",
    subregion: "Northern Europe", subregionEs: "Bálticos", population: 1331057,
    flagSvg: "https://flagcdn.com/ee.svg", flagEmoji: "🇪🇪", latlng: [58.5953, 25.0136],
    altSpellings: ["Estonia"]
  },
  {
    cca2: "LV", cca3: "LVA", ccn3: "428", nameEs: "Letonia", nameEn: "Latvia",
    officialNameEs: "República de Letonia", capital: "Riga", continent: "Europe", continentEs: "Europa",
    subregion: "Northern Europe", subregionEs: "Bálticos", population: 1901548,
    flagSvg: "https://flagcdn.com/lv.svg", flagEmoji: "🇱🇻", latlng: [56.8796, 24.6032],
    altSpellings: ["Latvia"]
  },
  {
    cca2: "LT", cca3: "LTU", ccn3: "440", nameEs: "Lituania", nameEn: "Lithuania",
    officialNameEs: "República de Lituania", capital: "Vilna", continent: "Europe", continentEs: "Europa",
    subregion: "Northern Europe", subregionEs: "Bálticos", population: 2794700,
    flagSvg: "https://flagcdn.com/lt.svg", flagEmoji: "🇱🇹", latlng: [55.1694, 23.8813],
    altSpellings: ["Lithuania"]
  },
  {
    cca2: "AL", cca3: "ALB", ccn3: "008", nameEs: "Albania", nameEn: "Albania",
    officialNameEs: "República de Albania", capital: "Tirana", continent: "Europe", continentEs: "Europa",
    subregion: "Southeast Europe", subregionEs: "Balcanes", population: 2837743,
    flagSvg: "https://flagcdn.com/al.svg", flagEmoji: "🇦🇱", latlng: [41.1533, 20.1683],
    altSpellings: ["Albania"]
  },
  {
    cca2: "BA", cca3: "BIH", ccn3: "070", nameEs: "Bosnia y Herzegovina", nameEn: "Bosnia and Herzegovina",
    officialNameEs: "Bosnia y Herzegovina", capital: "Sarajevo", continent: "Europe", continentEs: "Europa",
    subregion: "Southeast Europe", subregionEs: "Balcanes", population: 3280815,
    flagSvg: "https://flagcdn.com/ba.svg", flagEmoji: "🇧🇦", latlng: [43.9159, 17.6791],
    altSpellings: ["Bosnia"]
  },
  {
    cca2: "MK", cca3: "MKD", ccn3: "807", nameEs: "Macedonia del Norte", nameEn: "North Macedonia",
    officialNameEs: "República de Macedonia del Norte", capital: "Skopie", continent: "Europe", continentEs: "Europa",
    subregion: "Southeast Europe", subregionEs: "Balcanes", population: 2077132,
    flagSvg: "https://flagcdn.com/mk.svg", flagEmoji: "🇲🇰", latlng: [41.6086, 21.7453],
    altSpellings: ["Macedonia"]
  },
  {
    cca2: "ME", cca3: "MNE", ccn3: "499", nameEs: "Montenegro", nameEn: "Montenegro",
    officialNameEs: "Montenegro", capital: "Podgorica", continent: "Europe", continentEs: "Europa",
    subregion: "Southeast Europe", subregionEs: "Balcanes", population: 621718,
    flagSvg: "https://flagcdn.com/me.svg", flagEmoji: "🇲🇪", latlng: [42.7087, 19.3744],
    altSpellings: ["Montenegro"]
  },
  {
    cca2: "MD", cca3: "MDA", ccn3: "498", nameEs: "Moldavia", nameEn: "Moldova",
    officialNameEs: "República de Moldavia", capital: "Chisináu", continent: "Europe", continentEs: "Europa",
    subregion: "Eastern Europe", subregionEs: "Europa del Este", population: 2617820,
    flagSvg: "https://flagcdn.com/md.svg", flagEmoji: "🇲🇩", latlng: [47.4116, 28.3699],
    altSpellings: ["Moldova", "Moldavia"]
  },
  {
    cca2: "BY", cca3: "BLR", ccn3: "112", nameEs: "Bielorrusia", nameEn: "Belarus",
    officialNameEs: "República de Bielorrusia", capital: "Minsk", continent: "Europe", continentEs: "Europa",
    subregion: "Eastern Europe", subregionEs: "Europa del Este", population: 9398861,
    flagSvg: "https://flagcdn.com/by.svg", flagEmoji: "🇧🇾", latlng: [53.7098, 27.9534],
    altSpellings: ["Belarus"]
  },
  {
    cca2: "CY", cca3: "CYP", ccn3: "196", nameEs: "Chipre", nameEn: "Cyprus",
    officialNameEs: "República de Chipre", capital: "Nicosia", continent: "Europe", continentEs: "Europa",
    subregion: "Southern Europe", subregionEs: "Mediterráneo", population: 1207361,
    flagSvg: "https://flagcdn.com/cy.svg", flagEmoji: "🇨🇾", latlng: [35.1264, 33.4299],
    altSpellings: ["Chipre", "Cyprus"]
  },
  {
    cca2: "XK", cca3: "XKX", ccn3: "983", nameEs: "Kosovo", nameEn: "Kosovo",
    officialNameEs: "República de Kosovo", capital: "Pristina", continent: "Europe", continentEs: "Europa",
    subregion: "Southeast Europe", subregionEs: "Balcanes", population: 1873000,
    flagSvg: "https://flagcdn.com/xk.svg", flagEmoji: "🇽🇰", latlng: [42.6026, 20.9030],
    altSpellings: ["Kosovo", "Kosova", "Pristina"]
  },

  // ==========================================
  // --- AMÉRICAS (35 países soberanos) ---
  // ==========================================
  {
    cca2: "US", cca3: "USA", ccn3: "840", nameEs: "Estados Unidos", nameEn: "United States",
    officialNameEs: "Estados Unidos de América", capital: "Washington D.C.", continent: "Americas", continentEs: "América",
    subregion: "North America", subregionEs: "América del Norte", population: 329484123,
    flagSvg: "https://flagcdn.com/us.svg", flagEmoji: "🇺🇸", latlng: [37.0902, -95.7129],
    altSpellings: ["USA", "EEUU", "EE.UU.", "United States of America", "America"]
  },
  {
    cca2: "CA", cca3: "CAN", ccn3: "124", nameEs: "Canadá", nameEn: "Canada",
    officialNameEs: "Canadá", capital: "Ottawa", continent: "Americas", continentEs: "América",
    subregion: "North America", subregionEs: "América del Norte", population: 38005238,
    flagSvg: "https://flagcdn.com/ca.svg", flagEmoji: "🇨🇦", latlng: [56.1304, -106.3468],
    altSpellings: ["Canada", "Canadá"]
  },
  {
    cca2: "MX", cca3: "MEX", ccn3: "484", nameEs: "México", nameEn: "Mexico",
    officialNameEs: "Estados Unidos Mexicanos", capital: "Ciudad de México", continent: "Americas", continentEs: "América",
    subregion: "North America", subregionEs: "América del Norte", population: 128932753,
    flagSvg: "https://flagcdn.com/mx.svg", flagEmoji: "🇲🇽", latlng: [23.6345, -102.5528],
    altSpellings: ["Mexico", "México", "CDMX"]
  },
  {
    cca2: "BR", cca3: "BRA", ccn3: "076", nameEs: "Brasil", nameEn: "Brazil",
    officialNameEs: "República Federativa de Brasil", capital: "Brasilia", continent: "Americas", continentEs: "América",
    subregion: "South America", subregionEs: "América del Sur", population: 212559409,
    flagSvg: "https://flagcdn.com/br.svg", flagEmoji: "🇧🇷", latlng: [-14.235, -51.9253],
    altSpellings: ["Brazil", "Brasil"]
  },
  {
    cca2: "AR", cca3: "ARG", ccn3: "032", nameEs: "Argentina", nameEn: "Argentina",
    officialNameEs: "República Argentina", capital: "Buenos Aires", continent: "Americas", continentEs: "América",
    subregion: "South America", subregionEs: "América del Sur", population: 45376763,
    flagSvg: "https://flagcdn.com/ar.svg", flagEmoji: "🇦🇷", latlng: [-38.4161, -63.6167],
    altSpellings: ["Argentina"]
  },
  {
    cca2: "CO", cca3: "COL", ccn3: "170", nameEs: "Colombia", nameEn: "Colombia",
    officialNameEs: "República de Colombia", capital: "Bogotá", continent: "Americas", continentEs: "América",
    subregion: "South America", subregionEs: "América del Sur", population: 50882884,
    flagSvg: "https://flagcdn.com/co.svg", flagEmoji: "🇨🇴", latlng: [4.5709, -74.2973],
    altSpellings: ["Colombia"]
  },
  {
    cca2: "CL", cca3: "CHL", ccn3: "152", nameEs: "Chile", nameEn: "Chile",
    officialNameEs: "República de Chile", capital: "Santiago", continent: "Americas", continentEs: "América",
    subregion: "South America", subregionEs: "América del Sur", population: 19116209,
    flagSvg: "https://flagcdn.com/cl.svg", flagEmoji: "🇨🇱", latlng: [-35.6751, -71.543],
    altSpellings: ["Chile"]
  },
  {
    cca2: "PE", cca3: "PER", ccn3: "604", nameEs: "Perú", nameEn: "Peru",
    officialNameEs: "República del Perú", capital: "Lima", continent: "Americas", continentEs: "América",
    subregion: "South America", subregionEs: "América del Sur", population: 32971846,
    flagSvg: "https://flagcdn.com/pe.svg", flagEmoji: "🇵🇪", latlng: [-9.1899, -75.0152],
    altSpellings: ["Peru", "Perú"]
  },
  {
    cca2: "VE", cca3: "VEN", ccn3: "862", nameEs: "Venezuela", nameEn: "Venezuela",
    officialNameEs: "República Bolivariana de Venezuela", capital: "Caracas", continent: "Americas", continentEs: "América",
    subregion: "South America", subregionEs: "América del Sur", population: 28435943,
    flagSvg: "https://flagcdn.com/ve.svg", flagEmoji: "🇻🇪", latlng: [6.4238, -66.5897],
    altSpellings: ["Venezuela"]
  },
  {
    cca2: "EC", cca3: "ECU", ccn3: "218", nameEs: "Ecuador", nameEn: "Ecuador",
    officialNameEs: "República del Ecuador", capital: "Quito", continent: "Americas", continentEs: "América",
    subregion: "South America", subregionEs: "América del Sur", population: 17643060,
    flagSvg: "https://flagcdn.com/ec.svg", flagEmoji: "🇪🇨", latlng: [-1.8312, -78.1834],
    altSpellings: ["Ecuador"]
  },
  {
    cca2: "BO", cca3: "BOL", ccn3: "068", nameEs: "Bolivia", nameEn: "Bolivia",
    officialNameEs: "Estado Plurinacional de Bolivia", capital: "Sucre", continent: "Americas", continentEs: "América",
    subregion: "South America", subregionEs: "América del Sur", population: 11673029,
    flagSvg: "https://flagcdn.com/bo.svg", flagEmoji: "🇧🇴", latlng: [-16.2902, -63.5887],
    altSpellings: ["Bolivia", "La Paz"]
  },
  {
    cca2: "PY", cca3: "PRY", ccn3: "600", nameEs: "Paraguay", nameEn: "Paraguay",
    officialNameEs: "República del Paraguay", capital: "Asunción", continent: "Americas", continentEs: "América",
    subregion: "South America", subregionEs: "América del Sur", population: 7132530,
    flagSvg: "https://flagcdn.com/py.svg", flagEmoji: "🇵🇾", latlng: [-23.4425, -58.4438],
    altSpellings: ["Paraguay"]
  },
  {
    cca2: "UY", cca3: "URY", ccn3: "858", nameEs: "Uruguay", nameEn: "Uruguay",
    officialNameEs: "República Oriental del Uruguay", capital: "Montevideo", continent: "Americas", continentEs: "América",
    subregion: "South America", subregionEs: "América del Sur", population: 3473727,
    flagSvg: "https://flagcdn.com/uy.svg", flagEmoji: "🇺🇾", latlng: [-32.5228, -55.7658],
    altSpellings: ["Uruguay"]
  },
  {
    cca2: "GY", cca3: "GUY", ccn3: "328", nameEs: "Guyana", nameEn: "Guyana",
    officialNameEs: "República Cooperativa de Guyana", capital: "Georgetown", continent: "Americas", continentEs: "América",
    subregion: "South America", subregionEs: "América del Sur", population: 786559,
    flagSvg: "https://flagcdn.com/gy.svg", flagEmoji: "🇬🇾", latlng: [4.8604, -58.9302],
    altSpellings: ["Guyana"]
  },
  {
    cca2: "SR", cca3: "SUR", ccn3: "740", nameEs: "Surinam", nameEn: "Suriname",
    officialNameEs: "República de Surinam", capital: "Paramaribo", continent: "Americas", continentEs: "América",
    subregion: "South America", subregionEs: "América del Sur", population: 586634,
    flagSvg: "https://flagcdn.com/sr.svg", flagEmoji: "🇸🇷", latlng: [3.9193, -56.0278],
    altSpellings: ["Surinam", "Suriname"]
  },
  {
    cca2: "CU", cca3: "CUB", ccn3: "192", nameEs: "Cuba", nameEn: "Cuba",
    officialNameEs: "República de Cuba", capital: "La Habana", continent: "Americas", continentEs: "América",
    subregion: "Caribbean", subregionEs: "Caribe", population: 11326616,
    flagSvg: "https://flagcdn.com/cu.svg", flagEmoji: "🇨🇺", latlng: [21.5218, -77.7812],
    altSpellings: ["Cuba"]
  },
  {
    cca2: "DO", cca3: "DOM", ccn3: "214", nameEs: "República Dominicana", nameEn: "Dominican Republic",
    officialNameEs: "República Dominicana", capital: "Santo Domingo", continent: "Americas", continentEs: "América",
    subregion: "Caribbean", subregionEs: "Caribe", population: 10847904,
    flagSvg: "https://flagcdn.com/do.svg", flagEmoji: "🇩🇴", latlng: [18.7357, -70.1627],
    altSpellings: ["Dominicana"]
  },
  {
    cca2: "HT", cca3: "HTI", ccn3: "332", nameEs: "Haití", nameEn: "Haiti",
    officialNameEs: "República de Haití", capital: "Puerto Príncipe", continent: "Americas", continentEs: "América",
    subregion: "Caribbean", subregionEs: "Caribe", population: 11402533,
    flagSvg: "https://flagcdn.com/ht.svg", flagEmoji: "🇭🇹", latlng: [18.9712, -72.2852],
    altSpellings: ["Haiti", "Haití"]
  },
  {
    cca2: "JM", cca3: "JAM", ccn3: "388", nameEs: "Jamaica", nameEn: "Jamaica",
    officialNameEs: "Jamaica", capital: "Kingston", continent: "Americas", continentEs: "América",
    subregion: "Caribbean", subregionEs: "Caribe", population: 2961161,
    flagSvg: "https://flagcdn.com/jm.svg", flagEmoji: "🇯🇲", latlng: [18.1096, -77.2975],
    altSpellings: ["Jamaica"]
  },
  {
    cca2: "BS", cca3: "BHS", ccn3: "044", nameEs: "Bahamas", nameEn: "Bahamas",
    officialNameEs: "Mancomunidad de las Bahamas", capital: "Nasáu", continent: "Americas", continentEs: "América",
    subregion: "Caribbean", subregionEs: "Caribe", population: 393248,
    flagSvg: "https://flagcdn.com/bs.svg", flagEmoji: "🇧🇸", latlng: [25.0343, -77.3963],
    altSpellings: ["Bahamas", "Nassau"]
  },
  {
    cca2: "BB", cca3: "BRB", ccn3: "052", nameEs: "Barbados", nameEn: "Barbados",
    officialNameEs: "Barbados", capital: "Bridgetown", continent: "Americas", continentEs: "América",
    subregion: "Caribbean", subregionEs: "Caribe", population: 287371,
    flagSvg: "https://flagcdn.com/bb.svg", flagEmoji: "🇧🇧", latlng: [13.1939, -59.5432],
    altSpellings: ["Barbados"]
  },
  {
    cca2: "LC", cca3: "LCA", ccn3: "662", nameEs: "Santa Lucía", nameEn: "Saint Lucia",
    officialNameEs: "Santa Lucía", capital: "Castries", continent: "Americas", continentEs: "América",
    subregion: "Caribbean", subregionEs: "Caribe", population: 183629,
    flagSvg: "https://flagcdn.com/lc.svg", flagEmoji: "🇱🇨", latlng: [13.9094, -60.9789],
    altSpellings: ["Saint Lucia", "Santa Lucia"]
  },
  {
    cca2: "VC", cca3: "VCT", ccn3: "670", nameEs: "San Vicente y las Granadinas", nameEn: "Saint Vincent and the Grenadines",
    officialNameEs: "San Vicente y las Granadinas", capital: "Kingstown", continent: "Americas", continentEs: "América",
    subregion: "Caribbean", subregionEs: "Caribe", population: 110947,
    flagSvg: "https://flagcdn.com/vc.svg", flagEmoji: "🇻🇨", latlng: [13.2528, -61.1971],
    altSpellings: ["San Vicente", "Saint Vincent"]
  },
  {
    cca2: "GD", cca3: "GRD", ccn3: "308", nameEs: "Granada", nameEn: "Grenada",
    officialNameEs: "Granada", capital: "Saint George", continent: "Americas", continentEs: "América",
    subregion: "Caribbean", subregionEs: "Caribe", population: 112519,
    flagSvg: "https://flagcdn.com/gd.svg", flagEmoji: "🇬🇩", latlng: [12.1165, -61.679],
    altSpellings: ["Grenada", "Granada"]
  },
  {
    cca2: "AG", cca3: "ATG", ccn3: "028", nameEs: "Antigua y Barbuda", nameEn: "Antigua and Barbuda",
    officialNameEs: "Antigua y Barbuda", capital: "Saint John", continent: "Americas", continentEs: "América",
    subregion: "Caribbean", subregionEs: "Caribe", population: 97928,
    flagSvg: "https://flagcdn.com/ag.svg", flagEmoji: "🇦🇬", latlng: [17.0608, -61.7964],
    altSpellings: ["Antigua and Barbuda", "Antigua"]
  },
  {
    cca2: "DM", cca3: "DMA", ccn3: "212", nameEs: "Dominica", nameEn: "Dominica",
    officialNameEs: "Mancomunidad de Dominica", capital: "Roseau", continent: "Americas", continentEs: "América",
    subregion: "Caribbean", subregionEs: "Caribe", population: 71991,
    flagSvg: "https://flagcdn.com/dm.svg", flagEmoji: "🇩🇲", latlng: [15.415, -61.371],
    altSpellings: ["Dominica"]
  },
  {
    cca2: "KN", cca3: "KNA", ccn3: "659", nameEs: "San Cristóbal y Nieves", nameEn: "Saint Kitts and Nevis",
    officialNameEs: "Federación de San Cristóbal y Nieves", capital: "Basseterre", continent: "Americas", continentEs: "América",
    subregion: "Caribbean", subregionEs: "Caribe", population: 53192,
    flagSvg: "https://flagcdn.com/kn.svg", flagEmoji: "🇰🇳", latlng: [17.3578, -62.783],
    altSpellings: ["Saint Kitts", "San Cristobal y Nieves"]
  },
  {
    cca2: "TT", cca3: "TTO", ccn3: "780", nameEs: "Trinidad y Tobago", nameEn: "Trinidad and Tobago",
    officialNameEs: "República de Trinidad y Tobago", capital: "Puerto España", continent: "Americas", continentEs: "América",
    subregion: "Caribbean", subregionEs: "Caribe", population: 1399491,
    flagSvg: "https://flagcdn.com/tt.svg", flagEmoji: "🇹🇹", latlng: [10.6918, -61.2225],
    altSpellings: ["Trinidad and Tobago", "Trinidad"]
  },
  {
    cca2: "BZ", cca3: "BLZ", ccn3: "084", nameEs: "Belice", nameEn: "Belize",
    officialNameEs: "Belice", capital: "Belmopán", continent: "Americas", continentEs: "América",
    subregion: "Central America", subregionEs: "América Central", population: 397621,
    flagSvg: "https://flagcdn.com/bz.svg", flagEmoji: "🇧🇿", latlng: [17.1899, -88.4976],
    altSpellings: ["Belize", "Belice"]
  },
  {
    cca2: "GT", cca3: "GTM", ccn3: "320", nameEs: "Guatemala", nameEn: "Guatemala",
    officialNameEs: "República de Guatemala", capital: "Ciudad de Guatemala", continent: "Americas", continentEs: "América",
    subregion: "Central America", subregionEs: "América Central", population: 16858333,
    flagSvg: "https://flagcdn.com/gt.svg", flagEmoji: "🇬🇹", latlng: [15.7835, -90.2308],
    altSpellings: ["Guatemala"]
  },
  {
    cca2: "CR", cca3: "CRI", ccn3: "188", nameEs: "Costa Rica", nameEn: "Costa Rica",
    officialNameEs: "República de Costa Rica", capital: "San José", continent: "Americas", continentEs: "América",
    subregion: "Central America", subregionEs: "América Central", population: 5094114,
    flagSvg: "https://flagcdn.com/cr.svg", flagEmoji: "🇨🇷", latlng: [9.7489, -83.7534],
    altSpellings: ["Costa Rica"]
  },
  {
    cca2: "PA", cca3: "PAN", ccn3: "591", nameEs: "Panamá", nameEn: "Panama",
    officialNameEs: "República de Panamá", capital: "Ciudad de Panamá", continent: "Americas", continentEs: "América",
    subregion: "Central America", subregionEs: "América Central", population: 4314768,
    flagSvg: "https://flagcdn.com/pa.svg", flagEmoji: "🇵🇦", latlng: [8.538, -80.7821],
    altSpellings: ["Panama", "Panamá"]
  },
  {
    cca2: "HN", cca3: "HND", ccn3: "340", nameEs: "Honduras", nameEn: "Honduras",
    officialNameEs: "República de Honduras", capital: "Tegucigalpa", continent: "Americas", continentEs: "América",
    subregion: "Central America", subregionEs: "América Central", population: 9904608,
    flagSvg: "https://flagcdn.com/hn.svg", flagEmoji: "🇭🇳", latlng: [15.2, -86.2419],
    altSpellings: ["Honduras"]
  },
  {
    cca2: "SV", cca3: "SLV", ccn3: "222", nameEs: "El Salvador", nameEn: "El Salvador",
    officialNameEs: "República de El Salvador", capital: "San Salvador", continent: "Americas", continentEs: "América",
    subregion: "Central America", subregionEs: "América Central", population: 6486201,
    flagSvg: "https://flagcdn.com/sv.svg", flagEmoji: "🇸🇻", latlng: [13.7942, -88.8965],
    altSpellings: ["El Salvador"]
  },
  {
    cca2: "NI", cca3: "NIC", ccn3: "558", nameEs: "Nicaragua", nameEn: "Nicaragua",
    officialNameEs: "República de Nicaragua", capital: "Managua", continent: "Americas", continentEs: "América",
    subregion: "Central America", subregionEs: "América Central", population: 6624554,
    flagSvg: "https://flagcdn.com/ni.svg", flagEmoji: "🇳🇮", latlng: [12.8654, -85.2072],
    altSpellings: ["Nicaragua"]
  },

  // ==========================================
  // --- ASIA (49 países y microestados) ---
  // ==========================================
  {
    cca2: "CN", cca3: "CHN", ccn3: "156", nameEs: "China", nameEn: "China",
    officialNameEs: "República Popular China", capital: "Pekín", continent: "Asia", continentEs: "Asia",
    subregion: "Eastern Asia", subregionEs: "Asia Oriental", population: 1402112000,
    flagSvg: "https://flagcdn.com/cn.svg", flagEmoji: "🇨🇳", latlng: [35.8617, 104.1954],
    altSpellings: ["China", "Beijing"]
  },
  {
    cca2: "TW", cca3: "TWN", ccn3: "158", nameEs: "Taiwán", nameEn: "Taiwan",
    officialNameEs: "República de China (Taiwán)", capital: "Taipéi", continent: "Asia", continentEs: "Asia",
    subregion: "Eastern Asia", subregionEs: "Asia Oriental", population: 23570000,
    flagSvg: "https://flagcdn.com/tw.svg", flagEmoji: "🇹🇼", latlng: [23.6978, 120.9605],
    altSpellings: ["Taiwan", "Taipei", "Formosa", "Republic of China"]
  },
  {
    cca2: "JP", cca3: "JPN", ccn3: "392", nameEs: "Japón", nameEn: "Japan",
    officialNameEs: "Japón", capital: "Tokio", continent: "Asia", continentEs: "Asia",
    subregion: "Eastern Asia", subregionEs: "Asia Oriental", population: 125836021,
    flagSvg: "https://flagcdn.com/jp.svg", flagEmoji: "🇯🇵", latlng: [36.2048, 138.2529],
    altSpellings: ["Japan", "Nippon"]
  },
  {
    cca2: "IN", cca3: "IND", ccn3: "356", nameEs: "India", nameEn: "India",
    officialNameEs: "República de la India", capital: "Nueva Delhi", continent: "Asia", continentEs: "Asia",
    subregion: "Southern Asia", subregionEs: "Asia del Sur", population: 1380004385,
    flagSvg: "https://flagcdn.com/in.svg", flagEmoji: "🇮🇳", latlng: [20.5937, 78.9629],
    altSpellings: ["India"]
  },
  {
    cca2: "RU", cca3: "RUS", ccn3: "643", nameEs: "Rusia", nameEn: "Russia",
    officialNameEs: "Federación Rusa", capital: "Moscú", continent: "Asia", continentEs: "Asia",
    subregion: "Eastern Europe", subregionEs: "Eurasia", population: 144104080,
    flagSvg: "https://flagcdn.com/ru.svg", flagEmoji: "🇷🇺", latlng: [61.524, 105.3188],
    altSpellings: ["Russia", "Rusia"]
  },
  {
    cca2: "KR", cca3: "KOR", ccn3: "410", nameEs: "Corea del Sur", nameEn: "South Korea",
    officialNameEs: "República de Corea", capital: "Seúl", continent: "Asia", continentEs: "Asia",
    subregion: "Eastern Asia", subregionEs: "Asia Oriental", population: 51780579,
    flagSvg: "https://flagcdn.com/kr.svg", flagEmoji: "🇰🇷", latlng: [35.9078, 127.7669],
    altSpellings: ["South Korea", "Corea"]
  },
  {
    cca2: "KP", cca3: "PRK", ccn3: "408", nameEs: "Corea del Norte", nameEn: "North Korea",
    officialNameEs: "República Popular Democrática de Corea", capital: "Pionyang", continent: "Asia", continentEs: "Asia",
    subregion: "Eastern Asia", subregionEs: "Asia Oriental", population: 25778815,
    flagSvg: "https://flagcdn.com/kp.svg", flagEmoji: "🇰🇵", latlng: [40.3399, 127.5101],
    altSpellings: ["North Korea"]
  },
  {
    cca2: "ID", cca3: "IDN", ccn3: "360", nameEs: "Indonesia", nameEn: "Indonesia",
    officialNameEs: "República de Indonesia", capital: "Yakarta", continent: "Asia", continentEs: "Asia",
    subregion: "South-Eastern Asia", subregionEs: "Sudeste Asiático", population: 273523621,
    flagSvg: "https://flagcdn.com/id.svg", flagEmoji: "🇮🇩", latlng: [-0.7893, 113.9213],
    altSpellings: ["Indonesia"]
  },
  {
    cca2: "SG", cca3: "SGP", ccn3: "702", nameEs: "Singapur", nameEn: "Singapore",
    officialNameEs: "República de Singapur", capital: "Singapur", continent: "Asia", continentEs: "Asia",
    subregion: "South-Eastern Asia", subregionEs: "Sudeste Asiático", population: 5685807,
    flagSvg: "https://flagcdn.com/sg.svg", flagEmoji: "🇸🇬", latlng: [1.3521, 103.8198],
    altSpellings: ["Singapore", "Singapur"]
  },
  {
    cca2: "BH", cca3: "BHR", ccn3: "048", nameEs: "Baréin", nameEn: "Bahrain",
    officialNameEs: "Reino de Baréin", capital: "Manama", continent: "Asia", continentEs: "Asia",
    subregion: "Western Asia", subregionEs: "Golfo Pérsico", population: 1701583,
    flagSvg: "https://flagcdn.com/bh.svg", flagEmoji: "🇧🇭", latlng: [26.0667, 50.5577],
    altSpellings: ["Bahrain", "Barein"]
  },
  {
    cca2: "MV", cca3: "MDV", ccn3: "462", nameEs: "Maldivas", nameEn: "Maldives",
    officialNameEs: "República de Maldivas", capital: "Malé", continent: "Asia", continentEs: "Asia",
    subregion: "Southern Asia", subregionEs: "Océano Índico", population: 540542,
    flagSvg: "https://flagcdn.com/mv.svg", flagEmoji: "🇲🇻", latlng: [3.2028, 73.2207],
    altSpellings: ["Maldives", "Maldivas"]
  },
  {
    cca2: "BN", cca3: "BRN", ccn3: "096", nameEs: "Brunéi", nameEn: "Brunei",
    officialNameEs: "Nación de Brunéi, Morada de la Paz", capital: "Bandar Seri Begawan", continent: "Asia", continentEs: "Asia",
    subregion: "South-Eastern Asia", subregionEs: "Sudeste Asiático", population: 437483,
    flagSvg: "https://flagcdn.com/bn.svg", flagEmoji: "🇧🇳", latlng: [4.5353, 114.7277],
    altSpellings: ["Brunei", "Brunei Darussalam"]
  },
  {
    cca2: "QA", cca3: "QAT", ccn3: "634", nameEs: "Catar", nameEn: "Qatar",
    officialNameEs: "Estado de Catar", capital: "Doha", continent: "Asia", continentEs: "Asia",
    subregion: "Western Asia", subregionEs: "Golfo Pérsico", population: 2881060,
    flagSvg: "https://flagcdn.com/qa.svg", flagEmoji: "🇶🇦", latlng: [25.3548, 51.1839],
    altSpellings: ["Qatar", "Catar"]
  },
  {
    cca2: "KW", cca3: "KWT", ccn3: "414", nameEs: "Kuwait", nameEn: "Kuwait",
    officialNameEs: "Estado de Kuwait", capital: "Ciudad de Kuwait", continent: "Asia", continentEs: "Asia",
    subregion: "Western Asia", subregionEs: "Golfo Pérsico", population: 4270563,
    flagSvg: "https://flagcdn.com/kw.svg", flagEmoji: "🇰🇼", latlng: [29.3117, 47.4818],
    altSpellings: ["Kuwait"]
  },
  {
    cca2: "LB", cca3: "LBN", ccn3: "422", nameEs: "Líbano", nameEn: "Lebanon",
    officialNameEs: "República Libanesa", capital: "Beirut", continent: "Asia", continentEs: "Asia",
    subregion: "Western Asia", subregionEs: "Medio Oriente", population: 6825442,
    flagSvg: "https://flagcdn.com/lb.svg", flagEmoji: "🇱🇧", latlng: [33.8547, 35.8623],
    altSpellings: ["Lebanon", "Libano"]
  },
  {
    cca2: "TL", cca3: "TLS", ccn3: "626", nameEs: "Timor Oriental", nameEn: "East Timor",
    officialNameEs: "República Democrática de Timor-Leste", capital: "Dili", continent: "Asia", continentEs: "Asia",
    subregion: "South-Eastern Asia", subregionEs: "Sudeste Asiático", population: 1318442,
    flagSvg: "https://flagcdn.com/tl.svg", flagEmoji: "🇹🇱", latlng: [-8.8742, 125.7275],
    altSpellings: ["East Timor", "Timor-Leste"]
  },
  {
    cca2: "BT", cca3: "BTN", ccn3: "064", nameEs: "Bután", nameEn: "Bhutan",
    officialNameEs: "Reino de Bután", capital: "Timbu", continent: "Asia", continentEs: "Asia",
    subregion: "Southern Asia", subregionEs: "Himalaya", population: 771612,
    flagSvg: "https://flagcdn.com/bt.svg", flagEmoji: "🇧🇹", latlng: [27.5142, 90.4336],
    altSpellings: ["Bhutan", "Butan", "Thimphu"]
  },
  {
    cca2: "SA", cca3: "SAU", ccn3: "682", nameEs: "Arabia Saudita", nameEn: "Saudi Arabia",
    officialNameEs: "Reino de Arabia Saudita", capital: "Riad", continent: "Asia", continentEs: "Asia",
    subregion: "Western Asia", subregionEs: "Medio Oriente", population: 34813867,
    flagSvg: "https://flagcdn.com/sa.svg", flagEmoji: "🇸🇦", latlng: [23.8859, 45.0792],
    altSpellings: ["Saudi Arabia", "Arabia Saudí"]
  },
  {
    cca2: "TR", cca3: "TUR", ccn3: "792", nameEs: "Turquía", nameEn: "Turkey",
    officialNameEs: "República de Turquía", capital: "Ankara", continent: "Asia", continentEs: "Asia",
    subregion: "Western Asia", subregionEs: "Medio Oriente", population: 84339067,
    flagSvg: "https://flagcdn.com/tr.svg", flagEmoji: "🇹🇷", latlng: [38.9637, 35.2433],
    altSpellings: ["Turkey", "Turkiye"]
  },
  {
    cca2: "IR", cca3: "IRN", ccn3: "364", nameEs: "Irán", nameEn: "Iran",
    officialNameEs: "República Islámica de Irán", capital: "Teherán", continent: "Asia", continentEs: "Asia",
    subregion: "Southern Asia", subregionEs: "Medio Oriente", population: 83992953,
    flagSvg: "https://flagcdn.com/ir.svg", flagEmoji: "🇮🇷", latlng: [32.4279, 53.688],
    altSpellings: ["Iran", "Persia"]
  },
  {
    cca2: "TH", cca3: "THA", ccn3: "764", nameEs: "Tailandia", nameEn: "Thailand",
    officialNameEs: "Reino de Tailandia", capital: "Bangkok", continent: "Asia", continentEs: "Asia",
    subregion: "South-Eastern Asia", subregionEs: "Sudeste Asiático", population: 69799978,
    flagSvg: "https://flagcdn.com/th.svg", flagEmoji: "🇹🇭", latlng: [15.87, 100.9925],
    altSpellings: ["Thailand", "Siam"]
  },
  {
    cca2: "VN", cca3: "VNM", ccn3: "704", nameEs: "Vietnam", nameEn: "Vietnam",
    officialNameEs: "República Socialista de Vietnam", capital: "Hanói", continent: "Asia", continentEs: "Asia",
    subregion: "South-Eastern Asia", subregionEs: "Sudeste Asiático", population: 97338583,
    flagSvg: "https://flagcdn.com/vn.svg", flagEmoji: "🇻🇳", latlng: [14.0583, 108.2772],
    altSpellings: ["Vietnam"]
  },
  {
    cca2: "PH", cca3: "PHL", ccn3: "608", nameEs: "Filipinas", nameEn: "Philippines",
    officialNameEs: "República de Filipinas", capital: "Manila", continent: "Asia", continentEs: "Asia",
    subregion: "South-Eastern Asia", subregionEs: "Sudeste Asiático", population: 109581085,
    flagSvg: "https://flagcdn.com/ph.svg", flagEmoji: "🇵🇭", latlng: [12.8797, 121.774],
    altSpellings: ["Philippines"]
  },
  {
    cca2: "PK", cca3: "PAK", ccn3: "586", nameEs: "Pakistán", nameEn: "Pakistan",
    officialNameEs: "República Islámica de Pakistán", capital: "Islamabad", continent: "Asia", continentEs: "Asia",
    subregion: "Southern Asia", subregionEs: "Asia del Sur", population: 220892331,
    flagSvg: "https://flagcdn.com/pk.svg", flagEmoji: "🇵🇰", latlng: [30.3753, 69.3451],
    altSpellings: ["Pakistan"]
  },
  {
    cca2: "IL", cca3: "ISR", ccn3: "376", nameEs: "Israel", nameEn: "Israel",
    officialNameEs: "Estado de Israel", capital: "Jerusalén", continent: "Asia", continentEs: "Asia",
    subregion: "Western Asia", subregionEs: "Medio Oriente", population: 9216900,
    flagSvg: "https://flagcdn.com/il.svg", flagEmoji: "🇮🇱", latlng: [31.0461, 34.8516],
    altSpellings: ["Israel"]
  },
  {
    cca2: "AE", cca3: "ARE", ccn3: "784", nameEs: "Emiratos Árabes Unidos", nameEn: "United Arab Emirates",
    officialNameEs: "Emiratos Árabes Unidos", capital: "Abu Dabi", continent: "Asia", continentEs: "Asia",
    subregion: "Western Asia", subregionEs: "Medio Oriente", population: 9890400,
    flagSvg: "https://flagcdn.com/ae.svg", flagEmoji: "🇦🇪", latlng: [23.4241, 53.8478],
    altSpellings: ["UAE", "Dubai", "Abu Dhabi"]
  },
  {
    cca2: "MY", cca3: "MYS", ccn3: "458", nameEs: "Malasia", nameEn: "Malaysia",
    officialNameEs: "Malasia", capital: "Kuala Lumpur", continent: "Asia", continentEs: "Asia",
    subregion: "South-Eastern Asia", subregionEs: "Sudeste Asiático", population: 32365998,
    flagSvg: "https://flagcdn.com/my.svg", flagEmoji: "🇲🇾", latlng: [4.2105, 101.9758],
    altSpellings: ["Malaysia"]
  },
  {
    cca2: "IQ", cca3: "IRQ", ccn3: "368", nameEs: "Irak", nameEn: "Iraq",
    officialNameEs: "República de Irak", capital: "Bagdad", continent: "Asia", continentEs: "Asia",
    subregion: "Western Asia", subregionEs: "Medio Oriente", population: 40222503,
    flagSvg: "https://flagcdn.com/iq.svg", flagEmoji: "🇮🇶", latlng: [33.2232, 43.6793],
    altSpellings: ["Iraq", "Irak"]
  },
  {
    cca2: "AF", cca3: "AFG", ccn3: "004", nameEs: "Afganistán", nameEn: "Afghanistan",
    officialNameEs: "Emirato Islámico de Afganistán", capital: "Kabul", continent: "Asia", continentEs: "Asia",
    subregion: "Southern Asia", subregionEs: "Asia del Sur", population: 38928341,
    flagSvg: "https://flagcdn.com/af.svg", flagEmoji: "🇦🇫", latlng: [33.9391, 67.71],
    altSpellings: ["Afghanistan"]
  },
  {
    cca2: "KZ", cca3: "KAZ", ccn3: "398", nameEs: "Kazajistán", nameEn: "Kazakhstan",
    officialNameEs: "República de Kazajistán", capital: "Astaná", continent: "Asia", continentEs: "Asia",
    subregion: "Central Asia", subregionEs: "Asia Central", population: 18754440,
    flagSvg: "https://flagcdn.com/kz.svg", flagEmoji: "🇰🇿", latlng: [48.0196, 66.9237],
    altSpellings: ["Kazakhstan", "Kazajistan", "Astana"]
  },
  {
    cca2: "UZ", cca3: "UZB", ccn3: "860", nameEs: "Uzbekistán", nameEn: "Uzbekistan",
    officialNameEs: "República de Uzbekistán", capital: "Taskent", continent: "Asia", continentEs: "Asia",
    subregion: "Central Asia", subregionEs: "Asia Central", population: 34232050,
    flagSvg: "https://flagcdn.com/uz.svg", flagEmoji: "🇺🇿", latlng: [41.3775, 64.5853],
    altSpellings: ["Uzbekistan", "Tashkent"]
  },
  {
    cca2: "TM", cca3: "TKM", ccn3: "795", nameEs: "Turkmenistán", nameEn: "Turkmenistan",
    officialNameEs: "Turkmenistán", capital: "Asjabad", continent: "Asia", continentEs: "Asia",
    subregion: "Central Asia", subregionEs: "Asia Central", population: 6031187,
    flagSvg: "https://flagcdn.com/tm.svg", flagEmoji: "🇹🇲", latlng: [38.9697, 59.5563],
    altSpellings: ["Turkmenistan"]
  },
  {
    cca2: "KG", cca3: "KGZ", ccn3: "417", nameEs: "Kirguistán", nameEn: "Kyrgyzstan",
    officialNameEs: "República Kirguisa", capital: "Biskek", continent: "Asia", continentEs: "Asia",
    subregion: "Central Asia", subregionEs: "Asia Central", population: 6591600,
    flagSvg: "https://flagcdn.com/kg.svg", flagEmoji: "🇰🇬", latlng: [41.2044, 74.7661],
    altSpellings: ["Kyrgyzstan", "Bishkek"]
  },
  {
    cca2: "TJ", cca3: "TJK", ccn3: "762", nameEs: "Tayikistán", nameEn: "Tajikistan",
    officialNameEs: "República de Tayikistán", capital: "Dusambé", continent: "Asia", continentEs: "Asia",
    subregion: "Central Asia", subregionEs: "Asia Central", population: 9537642,
    flagSvg: "https://flagcdn.com/tj.svg", flagEmoji: "🇹🇯", latlng: [38.861, 71.2761],
    altSpellings: ["Tajikistan", "Dushanbe"]
  },
  {
    cca2: "GE", cca3: "GEO", ccn3: "268", nameEs: "Georgia", nameEn: "Georgia",
    officialNameEs: "Georgia", capital: "Tiflis", continent: "Asia", continentEs: "Asia",
    subregion: "Western Asia", subregionEs: "Cáucaso", population: 3714000,
    flagSvg: "https://flagcdn.com/ge.svg", flagEmoji: "🇬🇪", latlng: [42.3154, 43.3569],
    altSpellings: ["Georgia", "Tbilisi"]
  },
  {
    cca2: "AM", cca3: "ARM", ccn3: "051", nameEs: "Armenia", nameEn: "Armenia",
    officialNameEs: "República de Armenia", capital: "Ereván", continent: "Asia", continentEs: "Asia",
    subregion: "Western Asia", subregionEs: "Cáucaso", population: 2963234,
    flagSvg: "https://flagcdn.com/am.svg", flagEmoji: "🇦🇲", latlng: [40.0691, 45.0382],
    altSpellings: ["Armenia", "Yerevan"]
  },
  {
    cca2: "AZ", cca3: "AZE", ccn3: "031", nameEs: "Azerbaiyán", nameEn: "Azerbaijan",
    officialNameEs: "República de Azerbaiyán", capital: "Bakú", continent: "Asia", continentEs: "Asia",
    subregion: "Western Asia", subregionEs: "Cáucaso", population: 10139175,
    flagSvg: "https://flagcdn.com/az.svg", flagEmoji: "🇦🇿", latlng: [40.1431, 47.5769],
    altSpellings: ["Azerbaijan", "Baku"]
  },
  {
    cca2: "MN", cca3: "MNG", ccn3: "496", nameEs: "Mongolia", nameEn: "Mongolia",
    officialNameEs: "Mongolia", capital: "Ulán Bator", continent: "Asia", continentEs: "Asia",
    subregion: "Eastern Asia", subregionEs: "Asia Oriental", population: 3278292,
    flagSvg: "https://flagcdn.com/mn.svg", flagEmoji: "🇲🇳", latlng: [46.8625, 103.8467],
    altSpellings: ["Mongolia", "Ulaanbaatar"]
  },
  {
    cca2: "NP", cca3: "NPL", ccn3: "524", nameEs: "Nepal", nameEn: "Nepal",
    officialNameEs: "República Democrática Federal de Nepal", capital: "Katmandú", continent: "Asia", continentEs: "Asia",
    subregion: "Southern Asia", subregionEs: "Himalaya", population: 29136808,
    flagSvg: "https://flagcdn.com/np.svg", flagEmoji: "🇳🇵", latlng: [28.3949, 84.124],
    altSpellings: ["Nepal", "Kathmandu"]
  },
  {
    cca2: "LK", cca3: "LKA", ccn3: "144", nameEs: "Sri Lanka", nameEn: "Sri Lanka",
    officialNameEs: "República Democrática Socialista de Sri Lanka", capital: "Colombo", continent: "Asia", continentEs: "Asia",
    subregion: "Southern Asia", subregionEs: "Océano Índico", population: 21919000,
    flagSvg: "https://flagcdn.com/lk.svg", flagEmoji: "🇱🇰", latlng: [7.8731, 80.7718],
    altSpellings: ["Sri Lanka", "Ceilan"]
  },
  {
    cca2: "BD", cca3: "BGD", ccn3: "050", nameEs: "Bangladés", nameEn: "Bangladesh",
    officialNameEs: "República Popular de Bangladés", capital: "Daca", continent: "Asia", continentEs: "Asia",
    subregion: "Southern Asia", subregionEs: "Asia del Sur", population: 164689383,
    flagSvg: "https://flagcdn.com/bd.svg", flagEmoji: "🇧🇩", latlng: [23.685, 90.3563],
    altSpellings: ["Bangladesh", "Dhaka"]
  },
  {
    cca2: "MM", cca3: "MMR", ccn3: "104", nameEs: "Birmania", nameEn: "Myanmar",
    officialNameEs: "República de la Unión de Myanmar", capital: "Naipyidó", continent: "Asia", continentEs: "Asia",
    subregion: "South-Eastern Asia", subregionEs: "Sudeste Asiático", population: 54409794,
    flagSvg: "https://flagcdn.com/mm.svg", flagEmoji: "🇲🇲", latlng: [21.9162, 95.956],
    altSpellings: ["Myanmar", "Birmania", "Burma"]
  },
  {
    cca2: "LA", cca3: "LAO", ccn3: "418", nameEs: "Laos", nameEn: "Laos",
    officialNameEs: "República Democrática Popular Lao", capital: "Vientián", continent: "Asia", continentEs: "Asia",
    subregion: "South-Eastern Asia", subregionEs: "Sudeste Asiático", population: 7275556,
    flagSvg: "https://flagcdn.com/la.svg", flagEmoji: "🇱🇦", latlng: [19.8563, 102.4955],
    altSpellings: ["Laos", "Vientiane"]
  },
  {
    cca2: "KH", cca3: "KHM", ccn3: "116", nameEs: "Camboya", nameEn: "Cambodia",
    officialNameEs: "Reino de Camboya", capital: "Nom Pen", continent: "Asia", continentEs: "Asia",
    subregion: "South-Eastern Asia", subregionEs: "Sudeste Asiático", population: 16718971,
    flagSvg: "https://flagcdn.com/kh.svg", flagEmoji: "🇰🇭", latlng: [12.5657, 104.991],
    altSpellings: ["Cambodia", "Camboya", "Phnom Penh"]
  },
  {
    cca2: "JO", cca3: "JOR", ccn3: "400", nameEs: "Jordania", nameEn: "Jordan",
    officialNameEs: "Reino Hachemita de Jordania", capital: "Amán", continent: "Asia", continentEs: "Asia",
    subregion: "Western Asia", subregionEs: "Medio Oriente", population: 10203140,
    flagSvg: "https://flagcdn.com/jo.svg", flagEmoji: "🇯🇴", latlng: [30.5852, 36.2384],
    altSpellings: ["Jordan", "Amman"]
  },
  {
    cca2: "OM", cca3: "OMN", ccn3: "512", nameEs: "Omán", nameEn: "Oman",
    officialNameEs: "Sultanato de Omán", capital: "Mascate", continent: "Asia", continentEs: "Asia",
    subregion: "Western Asia", subregionEs: "Medio Oriente", population: 5106627,
    flagSvg: "https://flagcdn.com/om.svg", flagEmoji: "🇴🇲", latlng: [21.5126, 55.9233],
    altSpellings: ["Oman", "Muscat"]
  },
  {
    cca2: "YE", cca3: "YEM", ccn3: "887", nameEs: "Yemen", nameEn: "Yemen",
    officialNameEs: "República de Yemen", capital: "Saná", continent: "Asia", continentEs: "Asia",
    subregion: "Western Asia", subregionEs: "Medio Oriente", population: 29825968,
    flagSvg: "https://flagcdn.com/ye.svg", flagEmoji: "🇾🇪", latlng: [15.5527, 48.5164],
    altSpellings: ["Yemen", "Sanaa"]
  },
  {
    cca2: "SY", cca3: "SYR", ccn3: "760", nameEs: "Siria", nameEn: "Syria",
    officialNameEs: "República Árabe Siria", capital: "Damasco", continent: "Asia", continentEs: "Asia",
    subregion: "Western Asia", subregionEs: "Medio Oriente", population: 17500657,
    flagSvg: "https://flagcdn.com/sy.svg", flagEmoji: "🇸🇾", latlng: [34.8021, 38.9968],
    altSpellings: ["Syria", "Damascus"]
  },
  {
    cca2: "PS", cca3: "PSE", ccn3: "275", nameEs: "Palestina", nameEn: "Palestine",
    officialNameEs: "Estado de Palestina", capital: "Jerusalén Este", continent: "Asia", continentEs: "Asia",
    subregion: "Western Asia", subregionEs: "Medio Oriente", population: 5101414,
    flagSvg: "https://flagcdn.com/ps.svg", flagEmoji: "🇵🇸", latlng: [31.9522, 35.2332],
    altSpellings: ["Palestine", "Palestina", "State of Palestine", "Cisjordania", "Gaza", "Jerusalen"]
  },

  // ==========================================
  // --- ÁFRICA (54 países y microestados) ---
  // ==========================================
  {
    cca2: "EG", cca3: "EGY", ccn3: "818", nameEs: "Egipto", nameEn: "Egypt",
    officialNameEs: "República Árabe de Egipto", capital: "El Cairo", continent: "Africa", continentEs: "África",
    subregion: "Northern Africa", subregionEs: "Norte de África", population: 102334403,
    flagSvg: "https://flagcdn.com/eg.svg", flagEmoji: "🇪🇬", latlng: [26.8206, 30.8025],
    altSpellings: ["Egypt", "Egipto", "Misr"]
  },
  {
    cca2: "ZA", cca3: "ZAF", ccn3: "710", nameEs: "Sudáfrica", nameEn: "South Africa",
    officialNameEs: "República de Sudáfrica", capital: "Pretoria", continent: "Africa", continentEs: "África",
    subregion: "Southern Africa", subregionEs: "Sur de África", population: 59308690,
    flagSvg: "https://flagcdn.com/za.svg", flagEmoji: "🇿🇦", latlng: [-30.5595, 22.9375],
    altSpellings: ["South Africa"]
  },
  {
    cca2: "NG", cca3: "NGA", ccn3: "566", nameEs: "Nigeria", nameEn: "Nigeria",
    officialNameEs: "República Federal de Nigeria", capital: "Abuya", continent: "Africa", continentEs: "África",
    subregion: "Western Africa", subregionEs: "África Occidental", population: 206139587,
    flagSvg: "https://flagcdn.com/ng.svg", flagEmoji: "🇳🇬", latlng: [9.082, 8.6753],
    altSpellings: ["Nigeria"]
  },
  {
    cca2: "MA", cca3: "MAR", ccn3: "504", nameEs: "Marruecos", nameEn: "Morocco",
    officialNameEs: "Reino de Marruecos", capital: "Rabat", continent: "Africa", continentEs: "África",
    subregion: "Northern Africa", subregionEs: "Magreb", population: 36910558,
    flagSvg: "https://flagcdn.com/ma.svg", flagEmoji: "🇲🇦", latlng: [31.7917, -7.0926],
    altSpellings: ["Morocco", "Maroc"]
  },
  {
    cca2: "DZ", cca3: "DZA", ccn3: "012", nameEs: "Argelia", nameEn: "Algeria",
    officialNameEs: "República Argelina Democrática y Popular", capital: "Argel", continent: "Africa", continentEs: "África",
    subregion: "Northern Africa", subregionEs: "Magreb", population: 44700000,
    flagSvg: "https://flagcdn.com/dz.svg", flagEmoji: "🇩🇿", latlng: [28.0339, 1.6596],
    altSpellings: ["Algeria"]
  },
  {
    cca2: "KE", cca3: "KEN", ccn3: "404", nameEs: "Kenia", nameEn: "Kenya",
    officialNameEs: "República de Kenia", capital: "Nairobi", continent: "Africa", continentEs: "África",
    subregion: "Eastern Africa", subregionEs: "África Oriental", population: 53771300,
    flagSvg: "https://flagcdn.com/ke.svg", flagEmoji: "🇰🇪", latlng: [-0.0236, 37.9062],
    altSpellings: ["Kenya"]
  },
  {
    cca2: "ET", cca3: "ETH", ccn3: "231", nameEs: "Etiopía", nameEn: "Ethiopia",
    officialNameEs: "República Democrática Federal de Etiopía", capital: "Adís Abeba", continent: "Africa", continentEs: "África",
    subregion: "Eastern Africa", subregionEs: "Cuerno de África", population: 114963583,
    flagSvg: "https://flagcdn.com/et.svg", flagEmoji: "🇪🇹", latlng: [9.145, 40.4897],
    altSpellings: ["Ethiopia"]
  },
  {
    cca2: "GH", cca3: "GHA", ccn3: "288", nameEs: "Ghana", nameEn: "Ghana",
    officialNameEs: "República de Ghana", capital: "Acra", continent: "Africa", continentEs: "África",
    subregion: "Western Africa", subregionEs: "África Occidental", population: 31072945,
    flagSvg: "https://flagcdn.com/gh.svg", flagEmoji: "🇬🇭", latlng: [7.9465, -1.0232],
    altSpellings: ["Ghana"]
  },
  {
    cca2: "TZ", cca3: "TZA", ccn3: "834", nameEs: "Tanzania", nameEn: "Tanzania",
    officialNameEs: "República Unida de Tanzania", capital: "Dodoma", continent: "Africa", continentEs: "África",
    subregion: "Eastern Africa", subregionEs: "África Oriental", population: 59734213,
    flagSvg: "https://flagcdn.com/tz.svg", flagEmoji: "🇹🇿", latlng: [-6.369, 34.8888],
    altSpellings: ["Tanzania"]
  },
  {
    cca2: "SN", cca3: "SEN", ccn3: "686", nameEs: "Senegal", nameEn: "Senegal",
    officialNameEs: "República de Senegal", capital: "Dakar", continent: "Africa", continentEs: "África",
    subregion: "Western Africa", subregionEs: "África Occidental", population: 16743930,
    flagSvg: "https://flagcdn.com/sn.svg", flagEmoji: "🇸🇳", latlng: [14.4974, -14.4524],
    altSpellings: ["Senegal"]
  },
  {
    cca2: "CI", cca3: "CIV", ccn3: "384", nameEs: "Costa de Marfil", nameEn: "Ivory Coast",
    officialNameEs: "República de Costa de Marfil", capital: "Yamusukro", continent: "Africa", continentEs: "África",
    subregion: "Western Africa", subregionEs: "África Occidental", population: 26378275,
    flagSvg: "https://flagcdn.com/ci.svg", flagEmoji: "🇨🇮", latlng: [7.54, -5.5471],
    altSpellings: ["Ivory Coast", "Cote d'Ivoire"]
  },
  {
    cca2: "CD", cca3: "COD", ccn3: "180", nameEs: "República Democrática del Congo", nameEn: "DR Congo",
    officialNameEs: "República Democrática del Congo", capital: "Kinshasa", continent: "Africa", continentEs: "África",
    subregion: "Middle Africa", subregionEs: "África Central", population: 89561404,
    flagSvg: "https://flagcdn.com/cd.svg", flagEmoji: "🇨🇩", latlng: [-4.0383, 21.7587],
    altSpellings: ["DR Congo", "Congo RDC", "Zaire"]
  },
  {
    cca2: "CG", cca3: "COG", ccn3: "178", nameEs: "República del Congo", nameEn: "Republic of the Congo",
    officialNameEs: "República del Congo", capital: "Brazzaville", continent: "Africa", continentEs: "África",
    subregion: "Middle Africa", subregionEs: "África Central", population: 5518092,
    flagSvg: "https://flagcdn.com/cg.svg", flagEmoji: "🇨🇬", latlng: [-0.228, 15.8277],
    altSpellings: ["Congo", "Congo-Brazzaville"]
  },
  {
    cca2: "CM", cca3: "CMR", ccn3: "120", nameEs: "Camerún", nameEn: "Cameroon",
    officialNameEs: "República de Camerún", capital: "Yaundé", continent: "Africa", continentEs: "África",
    subregion: "Middle Africa", subregionEs: "África Central", population: 26545864,
    flagSvg: "https://flagcdn.com/cm.svg", flagEmoji: "🇨🇲", latlng: [7.3697, 12.3547],
    altSpellings: ["Cameroon"]
  },
  {
    cca2: "MG", cca3: "MDG", ccn3: "450", nameEs: "Madagascar", nameEn: "Madagascar",
    officialNameEs: "República de Madagascar", capital: "Antananarivo", continent: "Africa", continentEs: "África",
    subregion: "Eastern Africa", subregionEs: "África Oriental", population: 27691019,
    flagSvg: "https://flagcdn.com/mg.svg", flagEmoji: "🇲🇬", latlng: [-18.7669, 46.8691],
    altSpellings: ["Madagascar"]
  },
  {
    cca2: "TN", cca3: "TUN", ccn3: "788", nameEs: "Túnez", nameEn: "Tunisia",
    officialNameEs: "República Tunecina", capital: "Túnez", continent: "Africa", continentEs: "África",
    subregion: "Northern Africa", subregionEs: "Magreb", population: 11818618,
    flagSvg: "https://flagcdn.com/tn.svg", flagEmoji: "🇹🇳", latlng: [33.8869, 9.5375],
    altSpellings: ["Tunisia"]
  },
  {
    cca2: "CV", cca3: "CPV", ccn3: "132", nameEs: "Cabo Verde", nameEn: "Cape Verde",
    officialNameEs: "República de Cabo Verde", capital: "Praia", continent: "Africa", continentEs: "África",
    subregion: "Western Africa", subregionEs: "Atlántico", population: 555988,
    flagSvg: "https://flagcdn.com/cv.svg", flagEmoji: "🇨🇻", latlng: [16.5388, -23.0418],
    altSpellings: ["Cape Verde", "Cabo Verde"]
  },
  {
    cca2: "KM", cca3: "COM", ccn3: "174", nameEs: "Comoras", nameEn: "Comoros",
    officialNameEs: "Unión de las Comoras", capital: "Moroni", continent: "Africa", continentEs: "África",
    subregion: "Eastern Africa", subregionEs: "Océano Índico", population: 869595,
    flagSvg: "https://flagcdn.com/km.svg", flagEmoji: "🇰🇲", latlng: [-11.6455, 43.3333],
    altSpellings: ["Comoros", "Comoras"]
  },
  {
    cca2: "MU", cca3: "MUS", ccn3: "480", nameEs: "Mauricio", nameEn: "Mauritius",
    officialNameEs: "República de Mauricio", capital: "Port Louis", continent: "Africa", continentEs: "África",
    subregion: "Eastern Africa", subregionEs: "Océano Índico", population: 1265740,
    flagSvg: "https://flagcdn.com/mu.svg", flagEmoji: "🇲🇺", latlng: [-20.3484, 57.5522],
    altSpellings: ["Mauritius", "Mauricio"]
  },
  {
    cca2: "ST", cca3: "STP", ccn3: "678", nameEs: "Santo Tomé y Príncipe", nameEn: "Sao Tome and Principe",
    officialNameEs: "República Democrática de Santo Tomé y Príncipe", capital: "Santo Tomé", continent: "Africa", continentEs: "África",
    subregion: "Middle Africa", subregionEs: "Golfo de Guinea", population: 219161,
    flagSvg: "https://flagcdn.com/st.svg", flagEmoji: "🇸🇹", latlng: [0.1864, 6.6131],
    altSpellings: ["Sao Tome", "Santo Tome"]
  },
  {
    cca2: "SC", cca3: "SYC", ccn3: "690", nameEs: "Seychelles", nameEn: "Seychelles",
    officialNameEs: "República de las Seychelles", capital: "Victoria", continent: "Africa", continentEs: "África",
    subregion: "Eastern Africa", subregionEs: "Océano Índico", population: 98462,
    flagSvg: "https://flagcdn.com/sc.svg", flagEmoji: "🇸🇨", latlng: [-4.6796, 55.492],
    altSpellings: ["Seychelles"]
  },
  {
    cca2: "DJ", cca3: "DJI", ccn3: "262", nameEs: "Yibuti", nameEn: "Djibouti",
    officialNameEs: "República de Yibuti", capital: "Yibuti", continent: "Africa", continentEs: "África",
    subregion: "Eastern Africa", subregionEs: "Cuerno de África", population: 988002,
    flagSvg: "https://flagcdn.com/dj.svg", flagEmoji: "🇩🇯", latlng: [11.8251, 42.5903],
    altSpellings: ["Djibouti", "Yibuti"]
  },
  {
    cca2: "SZ", cca3: "SWZ", ccn3: "748", nameEs: "Esuatini", nameEn: "Eswatini",
    officialNameEs: "Reino de Esuatini", capital: "Mbabane", continent: "Africa", continentEs: "África",
    subregion: "Southern Africa", subregionEs: "Sur de África", population: 1160164,
    flagSvg: "https://flagcdn.com/sz.svg", flagEmoji: "🇸🇿", latlng: [-26.5225, 31.4659],
    altSpellings: ["Eswatini", "Suazilandia", "Swaziland"]
  },
  {
    cca2: "LS", cca3: "LSO", ccn3: "426", nameEs: "Lesoto", nameEn: "Lesotho",
    officialNameEs: "Reino de Lesoto", capital: "Maseru", continent: "Africa", continentEs: "África",
    subregion: "Southern Africa", subregionEs: "Sur de África", population: 2142252,
    flagSvg: "https://flagcdn.com/ls.svg", flagEmoji: "🇱🇸", latlng: [-29.61, 28.2336],
    altSpellings: ["Lesotho", "Lesoto"]
  },
  {
    cca2: "GM", cca3: "GMB", ccn3: "270", nameEs: "Gambia", nameEn: "Gambia",
    officialNameEs: "República de Gambia", capital: "Banjul", continent: "Africa", continentEs: "África",
    subregion: "Western Africa", subregionEs: "África Occidental", population: 2416664,
    flagSvg: "https://flagcdn.com/gm.svg", flagEmoji: "🇬🇲", latlng: [13.4432, -15.3101],
    altSpellings: ["Gambia"]
  },
  {
    cca2: "GW", cca3: "GNB", ccn3: "624", nameEs: "Guinea-Bisáu", nameEn: "Guinea-Bissau",
    officialNameEs: "República de Guinea-Bisáu", capital: "Bisáu", continent: "Africa", continentEs: "África",
    subregion: "Western Africa", subregionEs: "África Occidental", population: 1967998,
    flagSvg: "https://flagcdn.com/gw.svg", flagEmoji: "🇬🇼", latlng: [11.8037, -15.1804],
    altSpellings: ["Guinea-Bissau", "Guinea Bisau"]
  },
  {
    cca2: "GQ", cca3: "GNQ", ccn3: "226", nameEs: "Guinea Ecuatorial", nameEn: "Equatorial Guinea",
    officialNameEs: "República de Guinea Ecuatorial", capital: "Malabo", continent: "Africa", continentEs: "África",
    subregion: "Middle Africa", subregionEs: "Golfo de Guinea", population: 1402985,
    flagSvg: "https://flagcdn.com/gq.svg", flagEmoji: "🇬🇶", latlng: [1.6508, 10.2679],
    altSpellings: ["Equatorial Guinea", "Guinea Ecuatorial"]
  },
  {
    cca2: "GN", cca3: "GIN", ccn3: "324", nameEs: "Guinea", nameEn: "Guinea",
    officialNameEs: "República de Guinea", capital: "Conakri", continent: "Africa", continentEs: "África",
    subregion: "Western Africa", subregionEs: "África Occidental", population: 13132792,
    flagSvg: "https://flagcdn.com/gn.svg", flagEmoji: "🇬🇳", latlng: [9.9456, -9.6966],
    altSpellings: ["Guinea", "Conakry"]
  },
  {
    cca2: "GA", cca3: "GAB", ccn3: "266", nameEs: "Gabón", nameEn: "Gabon",
    officialNameEs: "República Gabonesa", capital: "Libreville", continent: "Africa", continentEs: "África",
    subregion: "Middle Africa", subregionEs: "África Central", population: 2225728,
    flagSvg: "https://flagcdn.com/ga.svg", flagEmoji: "🇬🇦", latlng: [-0.8037, 11.6094],
    altSpellings: ["Gabon", "Gabón"]
  },
  {
    cca2: "AO", cca3: "AGO", ccn3: "024", nameEs: "Angola", nameEn: "Angola",
    officialNameEs: "República de Angola", capital: "Luanda", continent: "Africa", continentEs: "África",
    subregion: "Middle Africa", subregionEs: "África Central", population: 32866268,
    flagSvg: "https://flagcdn.com/ao.svg", flagEmoji: "🇦🇴", latlng: [-11.2027, 17.8739],
    altSpellings: ["Angola"]
  },
  {
    cca2: "MZ", cca3: "MOZ", ccn3: "508", nameEs: "Mozambique", nameEn: "Mozambique",
    officialNameEs: "República de Mozambique", capital: "Maputo", continent: "Africa", continentEs: "África",
    subregion: "Eastern Africa", subregionEs: "África Oriental", population: 31255435,
    flagSvg: "https://flagcdn.com/mz.svg", flagEmoji: "🇲🇿", latlng: [-18.6657, 35.5296],
    altSpellings: ["Mozambique"]
  },
  {
    cca2: "ZM", cca3: "ZMB", ccn3: "894", nameEs: "Zambia", nameEn: "Zambia",
    officialNameEs: "República de Zambia", capital: "Lusaka", continent: "Africa", continentEs: "África",
    subregion: "Eastern Africa", subregionEs: "África Oriental", population: 18383956,
    flagSvg: "https://flagcdn.com/zm.svg", flagEmoji: "🇿🇲", latlng: [-13.1339, 27.8493],
    altSpellings: ["Zambia"]
  },
  {
    cca2: "ZW", cca3: "ZWE", ccn3: "716", nameEs: "Zimbabue", nameEn: "Zimbabwe",
    officialNameEs: "República de Zimbabue", capital: "Harare", continent: "Africa", continentEs: "África",
    subregion: "Eastern Africa", subregionEs: "África Oriental", population: 14862927,
    flagSvg: "https://flagcdn.com/zw.svg", flagEmoji: "🇿🇼", latlng: [-19.0154, 29.1549],
    altSpellings: ["Zimbabwe", "Zimbabue"]
  },
  {
    cca2: "BW", cca3: "BWA", ccn3: "072", nameEs: "Botsuana", nameEn: "Botswana",
    officialNameEs: "República de Botsuana", capital: "Gaborone", continent: "Africa", continentEs: "África",
    subregion: "Southern Africa", subregionEs: "Sur de África", population: 2351625,
    flagSvg: "https://flagcdn.com/bw.svg", flagEmoji: "🇧🇼", latlng: [-22.3285, 24.6849],
    altSpellings: ["Botswana", "Botsuana"]
  },
  {
    cca2: "NA", cca3: "NAM", ccn3: "516", nameEs: "Namibia", nameEn: "Namibia",
    officialNameEs: "República de Namibia", capital: "Windhoek", continent: "Africa", continentEs: "África",
    subregion: "Southern Africa", subregionEs: "Sur de África", population: 2540916,
    flagSvg: "https://flagcdn.com/na.svg", flagEmoji: "🇳🇦", latlng: [-22.9576, 18.4904],
    altSpellings: ["Namibia"]
  },
  {
    cca2: "MW", cca3: "MWI", ccn3: "454", nameEs: "Malaui", nameEn: "Malawi",
    officialNameEs: "República de Malaui", capital: "Lilongüe", continent: "Africa", continentEs: "África",
    subregion: "Eastern Africa", subregionEs: "África Oriental", population: 19129955,
    flagSvg: "https://flagcdn.com/mw.svg", flagEmoji: "🇲🇼", latlng: [-13.2543, 34.3015],
    altSpellings: ["Malawi", "Malaui"]
  },
  {
    cca2: "UG", cca3: "UGA", ccn3: "800", nameEs: "Uganda", nameEn: "Uganda",
    officialNameEs: "República de Uganda", capital: "Kampala", continent: "Africa", continentEs: "África",
    subregion: "Eastern Africa", subregionEs: "África Oriental", population: 45741000,
    flagSvg: "https://flagcdn.com/ug.svg", flagEmoji: "🇺🇬", latlng: [1.3733, 32.2903],
    altSpellings: ["Uganda"]
  },
  {
    cca2: "RW", cca3: "RWA", ccn3: "646", nameEs: "Ruanda", nameEn: "Rwanda",
    officialNameEs: "República de Ruanda", capital: "Kigali", continent: "Africa", continentEs: "África",
    subregion: "Eastern Africa", subregionEs: "África Oriental", population: 12952209,
    flagSvg: "https://flagcdn.com/rw.svg", flagEmoji: "🇷🇼", latlng: [-1.9403, 29.8739],
    altSpellings: ["Rwanda", "Ruanda"]
  },
  {
    cca2: "BI", cca3: "BDI", ccn3: "108", nameEs: "Burundi", nameEn: "Burundi",
    officialNameEs: "República de Burundi", capital: "Gitega", continent: "Africa", continentEs: "África",
    subregion: "Eastern Africa", subregionEs: "África Oriental", population: 11890781,
    flagSvg: "https://flagcdn.com/bi.svg", flagEmoji: "🇧🇮", latlng: [-3.3731, 29.9189],
    altSpellings: ["Burundi"]
  },
  {
    cca2: "SS", cca3: "SSD", ccn3: "728", nameEs: "Sudán del Sur", nameEn: "South Sudan",
    officialNameEs: "República de Sudán del Sur", capital: "Yuba", continent: "Africa", continentEs: "África",
    subregion: "Middle Africa", subregionEs: "África Central", population: 11193729,
    flagSvg: "https://flagcdn.com/ss.svg", flagEmoji: "🇸🇸", latlng: [6.877, 31.307],
    altSpellings: ["South Sudan", "Sudan del Sur", "Juba"]
  },
  {
    cca2: "SD", cca3: "SDN", ccn3: "729", nameEs: "Sudán", nameEn: "Sudan",
    officialNameEs: "República del Sudán", capital: "Jartum", continent: "Africa", continentEs: "África",
    subregion: "Northern Africa", subregionEs: "Norte de África", population: 43849269,
    flagSvg: "https://flagcdn.com/sd.svg", flagEmoji: "🇸🇩", latlng: [12.8628, 30.2176],
    altSpellings: ["Sudan", "Khartoum"]
  },
  {
    cca2: "TD", cca3: "TCD", ccn3: "148", nameEs: "Chad", nameEn: "Chad",
    officialNameEs: "República de Chad", capital: "Yamena", continent: "Africa", continentEs: "África",
    subregion: "Middle Africa", subregionEs: "Sahel", population: 16425859,
    flagSvg: "https://flagcdn.com/td.svg", flagEmoji: "🇹🇩", latlng: [15.4542, 18.7322],
    altSpellings: ["Chad", "N'Djamena"]
  },
  {
    cca2: "NE", cca3: "NER", ccn3: "562", nameEs: "Níger", nameEn: "Niger",
    officialNameEs: "República de Níger", capital: "Niamey", continent: "Africa", continentEs: "África",
    subregion: "Western Africa", subregionEs: "Sahel", population: 24206636,
    flagSvg: "https://flagcdn.com/ne.svg", flagEmoji: "🇳🇪", latlng: [17.6078, 8.0817],
    altSpellings: ["Niger", "Níger"]
  },
  {
    cca2: "ML", cca3: "MLI", ccn3: "466", nameEs: "Malí", nameEn: "Mali",
    officialNameEs: "República de Malí", capital: "Bamako", continent: "Africa", continentEs: "África",
    subregion: "Western Africa", subregionEs: "Sahel", population: 20250834,
    flagSvg: "https://flagcdn.com/ml.svg", flagEmoji: "🇲🇱", latlng: [17.5707, -3.9962],
    altSpellings: ["Mali", "Malí"]
  },
  {
    cca2: "BF", cca3: "BFA", ccn3: "854", nameEs: "Burkina Faso", nameEn: "Burkina Faso",
    officialNameEs: "Burkina Faso", capital: "Uagadugú", continent: "Africa", continentEs: "África",
    subregion: "Western Africa", subregionEs: "África Occidental", population: 20903278,
    flagSvg: "https://flagcdn.com/bf.svg", flagEmoji: "🇧🇫", latlng: [12.2383, -1.5616],
    altSpellings: ["Burkina Faso", "Ouagadougou"]
  },
  {
    cca2: "MR", cca3: "MRT", ccn3: "478", nameEs: "Mauritania", nameEn: "Mauritania",
    officialNameEs: "República Islámica de Mauritania", capital: "Nuakchot", continent: "Africa", continentEs: "África",
    subregion: "Western Africa", subregionEs: "Sahel", population: 4649660,
    flagSvg: "https://flagcdn.com/mr.svg", flagEmoji: "🇲🇷", latlng: [21.0079, -10.9408],
    altSpellings: ["Mauritania"]
  },
  {
    cca2: "BJ", cca3: "BEN", ccn3: "204", nameEs: "Benín", nameEn: "Benin",
    officialNameEs: "República de Benín", capital: "Porto Novo", continent: "Africa", continentEs: "África",
    subregion: "Western Africa", subregionEs: "África Occidental", population: 12123198,
    flagSvg: "https://flagcdn.com/bj.svg", flagEmoji: "🇧🇯", latlng: [9.3077, 2.3158],
    altSpellings: ["Benin", "Benín"]
  },
  {
    cca2: "TG", cca3: "TGO", ccn3: "768", nameEs: "Togo", nameEn: "Togo",
    officialNameEs: "República Togolesa", capital: "Lomé", continent: "Africa", continentEs: "África",
    subregion: "Western Africa", subregionEs: "África Occidental", population: 8278737,
    flagSvg: "https://flagcdn.com/tg.svg", flagEmoji: "🇹🇬", latlng: [8.6195, 0.8248],
    altSpellings: ["Togo", "Lome"]
  },
  {
    cca2: "LR", cca3: "LBR", ccn3: "430", nameEs: "Liberia", nameEn: "Liberia",
    officialNameEs: "República de Liberia", capital: "Monrovia", continent: "Africa", continentEs: "África",
    subregion: "Western Africa", subregionEs: "África Occidental", population: 5057677,
    flagSvg: "https://flagcdn.com/lr.svg", flagEmoji: "🇱🇷", latlng: [6.4281, -9.4295],
    altSpellings: ["Liberia"]
  },
  {
    cca2: "SL", cca3: "SLE", ccn3: "694", nameEs: "Sierra Leona", nameEn: "Sierra Leone",
    officialNameEs: "República de Sierra Leona", capital: "Freetown", continent: "Africa", continentEs: "África",
    subregion: "Western Africa", subregionEs: "África Occidental", population: 7976985,
    flagSvg: "https://flagcdn.com/sl.svg", flagEmoji: "🇸🇱", latlng: [8.4606, -11.7799],
    altSpellings: ["Sierra Leone", "Sierra Leona"]
  },
  {
    cca2: "CF", cca3: "CAF", ccn3: "140", nameEs: "República Centroafricana", nameEn: "Central African Republic",
    officialNameEs: "República Centroafricana", capital: "Bangui", continent: "Africa", continentEs: "África",
    subregion: "Middle Africa", subregionEs: "África Central", population: 4829764,
    flagSvg: "https://flagcdn.com/cf.svg", flagEmoji: "🇨🇫", latlng: [6.6111, 20.9394],
    altSpellings: ["Central African Republic", "Centroafrica"]
  },
  {
    cca2: "SO", cca3: "SOM", ccn3: "706", nameEs: "Somalia", nameEn: "Somalia",
    officialNameEs: "República Federal de Somalia", capital: "Mogadiscio", continent: "Africa", continentEs: "África",
    subregion: "Eastern Africa", subregionEs: "Cuerno de África", population: 15893219,
    flagSvg: "https://flagcdn.com/so.svg", flagEmoji: "🇸🇴", latlng: [5.1521, 46.1996],
    altSpellings: ["Somalia", "Mogadishu"]
  },
  {
    cca2: "ER", cca3: "ERI", ccn3: "232", nameEs: "Eritrea", nameEn: "Eritrea",
    officialNameEs: "Estado de Eritrea", capital: "Asmara", continent: "Africa", continentEs: "África",
    subregion: "Eastern Africa", subregionEs: "Cuerno de África", population: 3546427,
    flagSvg: "https://flagcdn.com/er.svg", flagEmoji: "🇪🇷", latlng: [15.1794, 39.7823],
    altSpellings: ["Eritrea"]
  },
  {
    cca2: "LY", cca3: "LBY", ccn3: "434", nameEs: "Libia", nameEn: "Libya",
    officialNameEs: "Estado de Libia", capital: "Trípoli", continent: "Africa", continentEs: "África",
    subregion: "Northern Africa", subregionEs: "Norte de África", population: 6871287,
    flagSvg: "https://flagcdn.com/ly.svg", flagEmoji: "🇱🇾", latlng: [26.3351, 17.2283],
    altSpellings: ["Libya", "Libia"]
  },

  // ==========================================
  // --- OCEANÍA (14 países e islas) ---
  // ==========================================
  {
    cca2: "AU", cca3: "AUS", ccn3: "036", nameEs: "Australia", nameEn: "Australia",
    officialNameEs: "Mancomunidad de Australia", capital: "Camberra", continent: "Oceania", continentEs: "Oceanía",
    subregion: "Australia and New Zealand", subregionEs: "Australasia", population: 25687041,
    flagSvg: "https://flagcdn.com/au.svg", flagEmoji: "🇦🇺", latlng: [-25.2744, 133.7751],
    altSpellings: ["Australia", "Canberra"]
  },
  {
    cca2: "NZ", cca3: "NZL", ccn3: "554", nameEs: "Nueva Zelanda", nameEn: "New Zealand",
    officialNameEs: "Nueva Zelanda", capital: "Wellington", continent: "Oceania", continentEs: "Oceanía",
    subregion: "Australia and New Zealand", subregionEs: "Australasia", population: 5084300,
    flagSvg: "https://flagcdn.com/nz.svg", flagEmoji: "🇳🇿", latlng: [-40.9006, 174.886],
    altSpellings: ["New Zealand", "Aotearoa"]
  },
  {
    cca2: "PG", cca3: "PNG", ccn3: "598", nameEs: "Papúa Nueva Guinea", nameEn: "Papua New Guinea",
    officialNameEs: "Estado Independiente de Papúa Nueva Guinea", capital: "Port Moresby", continent: "Oceania", continentEs: "Oceanía",
    subregion: "Melanesia", subregionEs: "Melanesia", population: 8947027,
    flagSvg: "https://flagcdn.com/pg.svg", flagEmoji: "🇵🇬", latlng: [-6.315, 143.9555],
    altSpellings: ["Papua New Guinea"]
  },
  {
    cca2: "FJ", cca3: "FJI", ccn3: "242", nameEs: "Fiyi", nameEn: "Fiji",
    officialNameEs: "República de Fiyi", capital: "Suva", continent: "Oceania", continentEs: "Oceanía",
    subregion: "Melanesia", subregionEs: "Melanesia", population: 896444,
    flagSvg: "https://flagcdn.com/fj.svg", flagEmoji: "🇫🇯", latlng: [-17.7134, 178.065],
    altSpellings: ["Fiji", "Fiyi"]
  },
  {
    cca2: "SB", cca3: "SLB", ccn3: "090", nameEs: "Islas Salomón", nameEn: "Solomon Islands",
    officialNameEs: "Islas Salomón", capital: "Honiara", continent: "Oceania", continentEs: "Oceanía",
    subregion: "Melanesia", subregionEs: "Melanesia", population: 686878,
    flagSvg: "https://flagcdn.com/sb.svg", flagEmoji: "🇸🇧", latlng: [-9.6457, 160.1562],
    altSpellings: ["Solomon Islands", "Islas Salomon"]
  },
  {
    cca2: "VU", cca3: "VUT", ccn3: "548", nameEs: "Vanuatu", nameEn: "Vanuatu",
    officialNameEs: "República de Vanuatu", capital: "Port Vila", continent: "Oceania", continentEs: "Oceanía",
    subregion: "Melanesia", subregionEs: "Melanesia", population: 307150,
    flagSvg: "https://flagcdn.com/vu.svg", flagEmoji: "🇻🇺", latlng: [-15.3767, 166.9592],
    altSpellings: ["Vanuatu"]
  },
  {
    cca2: "WS", cca3: "WSM", ccn3: "882", nameEs: "Samoa", nameEn: "Samoa",
    officialNameEs: "Estado Independiente de Samoa", capital: "Apia", continent: "Oceania", continentEs: "Oceanía",
    subregion: "Polynesia", subregionEs: "Polinesia", population: 198410,
    flagSvg: "https://flagcdn.com/ws.svg", flagEmoji: "🇼🇸", latlng: [-13.759, -172.1046],
    altSpellings: ["Samoa"]
  },
  {
    cca2: "TO", cca3: "TON", ccn3: "776", nameEs: "Tonga", nameEn: "Tonga",
    officialNameEs: "Reino de Tonga", capital: "Nukualofa", continent: "Oceania", continentEs: "Oceanía",
    subregion: "Polynesia", subregionEs: "Polinesia", population: 105697,
    flagSvg: "https://flagcdn.com/to.svg", flagEmoji: "🇹🇴", latlng: [-21.179, -175.1982],
    altSpellings: ["Tonga", "Nuku'alofa"]
  },
  {
    cca2: "KI", cca3: "KIR", ccn3: "296", nameEs: "Kiribati", nameEn: "Kiribati",
    officialNameEs: "República de Kiribati", capital: "Tarawa Sur", continent: "Oceania", continentEs: "Oceanía",
    subregion: "Micronesia", subregionEs: "Micronesia", population: 119446,
    flagSvg: "https://flagcdn.com/ki.svg", flagEmoji: "🇰🇮", latlng: [1.8709, -157.3631],
    altSpellings: ["Kiribati", "Tarawa"]
  },
  {
    cca2: "FM", cca3: "FSM", ccn3: "583", nameEs: "Micronesia", nameEn: "Micronesia",
    officialNameEs: "Estados Federados de Micronesia", capital: "Palikir", continent: "Oceania", continentEs: "Oceanía",
    subregion: "Micronesia", subregionEs: "Micronesia", population: 115021,
    flagSvg: "https://flagcdn.com/fm.svg", flagEmoji: "🇫🇲", latlng: [7.4256, 150.5508],
    altSpellings: ["Micronesia", "Palikir"]
  },
  {
    cca2: "MH", cca3: "MHL", ccn3: "584", nameEs: "Islas Marshall", nameEn: "Marshall Islands",
    officialNameEs: "República de las Islas Marshall", capital: "Majuro", continent: "Oceania", continentEs: "Oceanía",
    subregion: "Micronesia", subregionEs: "Micronesia", population: 59194,
    flagSvg: "https://flagcdn.com/mh.svg", flagEmoji: "🇲🇭", latlng: [7.1315, 171.1845],
    altSpellings: ["Marshall Islands", "Islas Marshall"]
  },
  {
    cca2: "PW", cca3: "PLW", ccn3: "585", nameEs: "Palaos", nameEn: "Palau",
    officialNameEs: "República de Palaos", capital: "Ngerulmud", continent: "Oceania", continentEs: "Oceanía",
    subregion: "Micronesia", subregionEs: "Micronesia", population: 18092,
    flagSvg: "https://flagcdn.com/pw.svg", flagEmoji: "🇵🇼", latlng: [7.515, 134.5825],
    altSpellings: ["Palau", "Palaos"]
  },
  {
    cca2: "NR", cca3: "NRU", ccn3: "520", nameEs: "Nauru", nameEn: "Nauru",
    officialNameEs: "República de Nauru", capital: "Yaren", continent: "Oceania", continentEs: "Oceanía",
    subregion: "Micronesia", subregionEs: "Micronesia", population: 10834,
    flagSvg: "https://flagcdn.com/nr.svg", flagEmoji: "🇳🇷", latlng: [-0.5228, 166.9315],
    altSpellings: ["Nauru"]
  },
  {
    cca2: "TV", cca3: "TUV", ccn3: "798", nameEs: "Tuvalu", nameEn: "Tuvalu",
    officialNameEs: "Tuvalu", capital: "Funafuti", continent: "Oceania", continentEs: "Oceanía",
    subregion: "Polynesia", subregionEs: "Polinesia", population: 11792,
    flagSvg: "https://flagcdn.com/tv.svg", flagEmoji: "🇹🇻", latlng: [-7.1095, 177.6493],
    altSpellings: ["Tuvalu"]
  }
];

/**
 * =========================================================================
 * --- MODO FRIKI: TERRITORIOS DEPENDIENTES Y ESTADOS DE FACTO (+40) ---
 * =========================================================================
 */
export const GEEK_TERRITORIES: Country[] = [
  // 1. Estados libres asociados y de estatus especial
  {
    cca2: "PR", cca3: "PRI", ccn3: "630", nameEs: "Puerto Rico", nameEn: "Puerto Rico",
    officialNameEs: "Estado Libre Asociado de Puerto Rico", capital: "San Juan", continent: "Americas", continentEs: "América",
    subregion: "Caribbean", subregionEs: "Caribe", population: 3285874,
    flagSvg: "https://flagcdn.com/pr.svg", flagEmoji: "🇵🇷", latlng: [18.2208, -66.5901],
    altSpellings: ["Puerto Rico", "Borinquen"]
  },
  {
    cca2: "CK", cca3: "COK", ccn3: "184", nameEs: "Islas Cook", nameEn: "Cook Islands",
    officialNameEs: "Islas Cook", capital: "Avarua", continent: "Oceania", continentEs: "Oceanía",
    subregion: "Polynesia", subregionEs: "Polinesia", population: 17564,
    flagSvg: "https://flagcdn.com/ck.svg", flagEmoji: "🇨🇰", latlng: [-21.2367, -159.7777],
    altSpellings: ["Cook Islands", "Islas Cook"]
  },
  {
    cca2: "NU", cca3: "NIU", ccn3: "570", nameEs: "Niue", nameEn: "Niue",
    officialNameEs: "Niue", capital: "Alofi", continent: "Oceania", continentEs: "Oceanía",
    subregion: "Polynesia", subregionEs: "Polinesia", population: 1618,
    flagSvg: "https://flagcdn.com/nu.svg", flagEmoji: "🇳🇺", latlng: [-19.0544, -169.8672],
    altSpellings: ["Niue"]
  },

  // 2. Estados con reconocimiento internacional limitado o nulo
  {
    cca2: "SO", cca3: "SOL", ccn3: "991", nameEs: "Somalilandia", nameEn: "Somaliland",
    officialNameEs: "República de Somalilandia", capital: "Hargeisa", continent: "Africa", continentEs: "África",
    subregion: "Eastern Africa", subregionEs: "Cuerno de África", population: 3500000,
    flagSvg: "https://flagcdn.com/so.svg", flagEmoji: "🇸🇴", latlng: [9.5624, 44.0770],
    altSpellings: ["Somaliland", "Somalilandia", "Hargeisa"]
  },
  {
    cca2: "EH", cca3: "ESH", ccn3: "732", nameEs: "Sáhara Occidental", nameEn: "Western Sahara",
    officialNameEs: "República Árabe Saharaui Democrática", capital: "El Aaiún", continent: "Africa", continentEs: "África",
    subregion: "Northern Africa", subregionEs: "Magreb", population: 597339,
    flagSvg: "https://flagcdn.com/eh.svg", flagEmoji: "🇪🇭", latlng: [24.2155, -12.8858],
    altSpellings: ["Sahara Occidental", "Western Sahara", "RASD"]
  },
  {
    cca2: "CY", cca3: "CYN", ccn3: "992", nameEs: "Chipre del Norte", nameEn: "Northern Cyprus",
    officialNameEs: "República Turca del Norte de Chipre", capital: "Nicosia Norte", continent: "Europe", continentEs: "Europa",
    subregion: "Southern Europe", subregionEs: "Mediterráneo", population: 382836,
    flagSvg: "https://flagcdn.com/cy.svg", flagEmoji: "🇨🇾", latlng: [35.2500, 33.7500],
    altSpellings: ["Chipre del Norte", "Northern Cyprus", "TRNC"]
  },
  {
    cca2: "MD", cca3: "PMR", ccn3: "993", nameEs: "Transnistria", nameEn: "Transnistria",
    officialNameEs: "República Moldava Pridnestroviana", capital: "Tiráspol", continent: "Europe", continentEs: "Europa",
    subregion: "Eastern Europe", subregionEs: "Europa del Este", population: 465200,
    flagSvg: "https://flagcdn.com/md.svg", flagEmoji: "🇲🇩", latlng: [46.8403, 29.6433],
    altSpellings: ["Transnistria", "Pridnestrovie", "Tiraspol"]
  },
  {
    cca2: "GE", cca3: "ABK", ccn3: "994", nameEs: "Abjasia", nameEn: "Abkhazia",
    officialNameEs: "República de Abjasia", capital: "Sujumi", continent: "Asia", continentEs: "Asia",
    subregion: "Western Asia", subregionEs: "Cáucaso", population: 245424,
    flagSvg: "https://flagcdn.com/ge.svg", flagEmoji: "🇬🇪", latlng: [43.0016, 41.0234],
    altSpellings: ["Abjasia", "Abkhazia", "Sujumi"]
  },
  {
    cca2: "GE", cca3: "OST", ccn3: "995", nameEs: "Osetia del Sur", nameEn: "South Ossetia",
    officialNameEs: "República de Osetia del Sur", capital: "Tsjinvali", continent: "Asia", continentEs: "Asia",
    subregion: "Western Asia", subregionEs: "Cáucaso", population: 53532,
    flagSvg: "https://flagcdn.com/ge.svg", flagEmoji: "🇬🇪", latlng: [42.2289, 43.9712],
    altSpellings: ["Osetia del Sur", "South Ossetia", "Tsjinvali"]
  },

  // 3. Territorios del Reino Unido 🇬🇧
  {
    cca2: "BM", cca3: "BMU", ccn3: "060", nameEs: "Bermudas", nameEn: "Bermuda",
    officialNameEs: "Bermudas", capital: "Hamilton", continent: "Americas", continentEs: "América",
    subregion: "North America", subregionEs: "Atlántico Norte", population: 63903,
    flagSvg: "https://flagcdn.com/bm.svg", flagEmoji: "🇧🇲", latlng: [32.3078, -64.7505],
    altSpellings: ["Bermuda", "Bermudas"]
  },
  {
    cca2: "KY", cca3: "CYM", ccn3: "136", nameEs: "Islas Caimán", nameEn: "Cayman Islands",
    officialNameEs: "Islas Caimán", capital: "George Town", continent: "Americas", continentEs: "América",
    subregion: "Caribbean", subregionEs: "Caribe", population: 65720,
    flagSvg: "https://flagcdn.com/ky.svg", flagEmoji: "🇰🇾", latlng: [19.3133, -81.2546],
    altSpellings: ["Cayman Islands", "Islas Caiman"]
  },
  {
    cca2: "GI", cca3: "GIB", ccn3: "292", nameEs: "Gibraltar", nameEn: "Gibraltar",
    officialNameEs: "Gibraltar", capital: "Gibraltar", continent: "Europe", continentEs: "Europa",
    subregion: "Southern Europe", subregionEs: "Península Ibérica", population: 33691,
    flagSvg: "https://flagcdn.com/gi.svg", flagEmoji: "🇬🇮", latlng: [36.1408, -5.3536],
    altSpellings: ["Gibraltar"]
  },
  {
    cca2: "FK", cca3: "FLK", ccn3: "238", nameEs: "Islas Malvinas", nameEn: "Falkland Islands",
    officialNameEs: "Islas Malvinas", capital: "Puerto Argentino / Stanley", continent: "Americas", continentEs: "América",
    subregion: "South America", subregionEs: "Atlántico Sur", population: 3480,
    flagSvg: "https://flagcdn.com/fk.svg", flagEmoji: "🇫🇰", latlng: [-51.7963, -59.5236],
    altSpellings: ["Islas Malvinas", "Falkland Islands"]
  },
  {
    cca2: "MS", cca3: "MSR", ccn3: "500", nameEs: "Montserrat", nameEn: "Montserrat",
    officialNameEs: "Montserrat", capital: "Brades", continent: "Americas", continentEs: "América",
    subregion: "Caribbean", subregionEs: "Caribe", population: 4992,
    flagSvg: "https://flagcdn.com/ms.svg", flagEmoji: "🇲🇸", latlng: [16.7425, -62.1874],
    altSpellings: ["Montserrat", "Plymouth"]
  },
  {
    cca2: "AI", cca3: "AIA", ccn3: "660", nameEs: "Anguila", nameEn: "Anguilla",
    officialNameEs: "Anguila", capital: "El Valle", continent: "Americas", continentEs: "América",
    subregion: "Caribbean", subregionEs: "Caribe", population: 15003,
    flagSvg: "https://flagcdn.com/ai.svg", flagEmoji: "🇦🇮", latlng: [18.2206, -63.0686],
    altSpellings: ["Anguilla", "Anguila"]
  },
  {
    cca2: "VG", cca3: "VGB", ccn3: "092", nameEs: "Islas Vírgenes Británicas", nameEn: "British Virgin Islands",
    officialNameEs: "Islas Vírgenes Británicas", capital: "Road Town", continent: "Americas", continentEs: "América",
    subregion: "Caribbean", subregionEs: "Caribe", population: 30231,
    flagSvg: "https://flagcdn.com/vg.svg", flagEmoji: "🇻🇬", latlng: [18.4207, -64.6399],
    altSpellings: ["British Virgin Islands", "BVI"]
  },
  {
    cca2: "SH", cca3: "SHN", ccn3: "654", nameEs: "Santa Elena", nameEn: "Saint Helena",
    officialNameEs: "Santa Elena, Ascensión y Tristán de Acuña", capital: "Jamestown", continent: "Africa", continentEs: "África",
    subregion: "Western Africa", subregionEs: "Atlántico Sur", population: 6077,
    flagSvg: "https://flagcdn.com/sh.svg", flagEmoji: "🇸🇭", latlng: [-15.9650, -5.7089],
    altSpellings: ["Saint Helena", "Santa Elena", "Tristan da Cunha"]
  },
  {
    cca2: "TC", cca3: "TCA", ccn3: "796", nameEs: "Islas Turcas y Caicos", nameEn: "Turks and Caicos Islands",
    officialNameEs: "Islas Turcas y Caicos", capital: "Cockburn Town", continent: "Americas", continentEs: "América",
    subregion: "Caribbean", subregionEs: "Caribe", population: 38717,
    flagSvg: "https://flagcdn.com/tc.svg", flagEmoji: "🇹🇨", latlng: [21.6940, -71.7979],
    altSpellings: ["Turks and Caicos", "Islas Turcas y Caicos"]
  },
  {
    cca2: "PN", cca3: "PCN", ccn3: "612", nameEs: "Islas Pitcairn", nameEn: "Pitcairn Islands",
    officialNameEs: "Islas Pitcairn", capital: "Adamstown", continent: "Oceania", continentEs: "Oceanía",
    subregion: "Polynesia", subregionEs: "Polinesia", population: 50,
    flagSvg: "https://flagcdn.com/pn.svg", flagEmoji: "🇵🇳", latlng: [-25.0667, -130.1000],
    altSpellings: ["Pitcairn", "Islas Pitcairn"]
  },

  // 4. Territorios de Estados Unidos 🇺🇸
  {
    cca2: "GU", cca3: "GUM", ccn3: "316", nameEs: "Guam", nameEn: "Guam",
    officialNameEs: "Territorio de Guam", capital: "Agaña (Hagåtña)", continent: "Oceania", continentEs: "Oceanía",
    subregion: "Micronesia", subregionEs: "Micronesia", population: 168783,
    flagSvg: "https://flagcdn.com/gu.svg", flagEmoji: "🇬🇺", latlng: [13.4443, 144.7937],
    altSpellings: ["Guam", "Hagatna", "Agana"]
  },
  {
    cca2: "VI", cca3: "VIR", ccn3: "850", nameEs: "Islas Vírgenes de los EE. UU.", nameEn: "United States Virgin Islands",
    officialNameEs: "Islas Vírgenes de los Estados Unidos", capital: "Carlota Amalia", continent: "Americas", continentEs: "América",
    subregion: "Caribbean", subregionEs: "Caribe", population: 104425,
    flagSvg: "https://flagcdn.com/vi.svg", flagEmoji: "🇻🇮", latlng: [18.3358, -64.8963],
    altSpellings: ["US Virgin Islands", "Islas Virgenes EEUU"]
  },
  {
    cca2: "AS", cca3: "ASM", ccn3: "016", nameEs: "Samoa Americana", nameEn: "American Samoa",
    officialNameEs: "Territorio de Samoa Americana", capital: "Pago Pago", continent: "Oceania", continentEs: "Oceanía",
    subregion: "Polynesia", subregionEs: "Polinesia", population: 55197,
    flagSvg: "https://flagcdn.com/as.svg", flagEmoji: "🇦🇸", latlng: [-14.2710, -170.1322],
    altSpellings: ["American Samoa", "Samoa Americana", "Pago Pago"]
  },
  {
    cca2: "MP", cca3: "MNP", ccn3: "580", nameEs: "Islas Marianas del Norte", nameEn: "Northern Mariana Islands",
    officialNameEs: "Mancomunidad de las Islas Marianas del Norte", capital: "Saipán", continent: "Oceania", continentEs: "Oceanía",
    subregion: "Micronesia", subregionEs: "Micronesia", population: 57559,
    flagSvg: "https://flagcdn.com/mp.svg", flagEmoji: "🇲🇵", latlng: [15.0979, 145.6739],
    altSpellings: ["Northern Mariana Islands", "Saipan"]
  },

  // 5. Territorios y Departamentos de Francia 🇫🇷
  {
    cca2: "PF", cca3: "PYF", ccn3: "258", nameEs: "Polinesia Francesa", nameEn: "French Polynesia",
    officialNameEs: "Polinesia Francesa", capital: "Papeete", continent: "Oceania", continentEs: "Oceanía",
    subregion: "Polynesia", subregionEs: "Polinesia", population: 280904,
    flagSvg: "https://flagcdn.com/pf.svg", flagEmoji: "🇵🇫", latlng: [-17.6797, -149.4068],
    altSpellings: ["French Polynesia", "Polinesia Francesa", "Tahiti"]
  },
  {
    cca2: "NC", cca3: "NCL", ccn3: "540", nameEs: "Nueva Caledonia", nameEn: "New Caledonia",
    officialNameEs: "Nueva Caledonia", capital: "Numea", continent: "Oceania", continentEs: "Oceanía",
    subregion: "Melanesia", subregionEs: "Melanesia", population: 271960,
    flagSvg: "https://flagcdn.com/nc.svg", flagEmoji: "🇳🇨", latlng: [-20.9043, 165.6180],
    altSpellings: ["New Caledonia", "Nueva Caledonia", "Noumea"]
  },
  {
    cca2: "BL", cca3: "BLM", ccn3: "652", nameEs: "San Bartolomé", nameEn: "Saint Barthélemy",
    officialNameEs: "Colectividad de San Bartolomé", capital: "Gustavia", continent: "Americas", continentEs: "América",
    subregion: "Caribbean", subregionEs: "Caribe", population: 9885,
    flagSvg: "https://flagcdn.com/bl.svg", flagEmoji: "🇧🇱", latlng: [17.9000, -62.8333],
    altSpellings: ["Saint Barthelemy", "San Bartolome", "St Barts"]
  },
  {
    cca2: "MF", cca3: "MAF", ccn3: "663", nameEs: "San Martín (Francia)", nameEn: "Saint Martin",
    officialNameEs: "Colectividad de San Martín", capital: "Marigot", continent: "Americas", continentEs: "América",
    subregion: "Caribbean", subregionEs: "Caribe", population: 38659,
    flagSvg: "https://flagcdn.com/mf.svg", flagEmoji: "🇲🇫", latlng: [18.0708, -63.0501],
    altSpellings: ["Saint Martin", "San Martin"]
  },
  {
    cca2: "PM", cca3: "SPM", ccn3: "666", nameEs: "San Pedro y Miquelón", nameEn: "Saint Pierre and Miquelon",
    officialNameEs: "Colectividad de San Pedro y Miquelón", capital: "San Pedro", continent: "Americas", continentEs: "América",
    subregion: "North America", subregionEs: "Atlántico Norte", population: 6008,
    flagSvg: "https://flagcdn.com/pm.svg", flagEmoji: "🇵🇲", latlng: [46.8852, -56.3159],
    altSpellings: ["Saint Pierre and Miquelon", "San Pedro y Miquelon"]
  },
  {
    cca2: "WF", cca3: "WLF", ccn3: "876", nameEs: "Wallis y Futuna", nameEn: "Wallis and Futuna",
    officialNameEs: "Territorio de las Islas Wallis y Futuna", capital: "Mata-Utu", continent: "Oceania", continentEs: "Oceanía",
    subregion: "Polynesia", subregionEs: "Polinesia", population: 11246,
    flagSvg: "https://flagcdn.com/wf.svg", flagEmoji: "🇼🇫", latlng: [-13.2816, -176.1745],
    altSpellings: ["Wallis and Futuna", "Wallis y Futuna"]
  },
  {
    cca2: "GF", cca3: "GUF", ccn3: "254", nameEs: "Guayana Francesa", nameEn: "French Guiana",
    officialNameEs: "Guayana Francesa", capital: "Cayena", continent: "Americas", continentEs: "América",
    subregion: "South America", subregionEs: "América del Sur", population: 290691,
    flagSvg: "https://flagcdn.com/gf.svg", flagEmoji: "🇬🇫", latlng: [3.9339, -53.1258],
    altSpellings: ["French Guiana", "Guayana Francesa", "Cayenne"]
  },
  {
    cca2: "RE", cca3: "REU", ccn3: "638", nameEs: "Reunión", nameEn: "Réunion",
    officialNameEs: "Departamento de Reunión", capital: "Saint-Denis", continent: "Africa", continentEs: "África",
    subregion: "Eastern Africa", subregionEs: "Océano Índico", population: 859959,
    flagSvg: "https://flagcdn.com/re.svg", flagEmoji: "🇷🇪", latlng: [-21.1151, 55.5364],
    altSpellings: ["Reunion", "Reunión"]
  },
  {
    cca2: "GP", cca3: "GLP", ccn3: "312", nameEs: "Guadalupe", nameEn: "Guadeloupe",
    officialNameEs: "Guadalupe", capital: "Basse-Terre", continent: "Americas", continentEs: "América",
    subregion: "Caribbean", subregionEs: "Caribe", population: 395700,
    flagSvg: "https://flagcdn.com/gp.svg", flagEmoji: "🇬🇵", latlng: [16.2650, -61.5510],
    altSpellings: ["Guadeloupe", "Guadalupe"]
  },
  {
    cca2: "MQ", cca3: "MTQ", ccn3: "474", nameEs: "Martinica", nameEn: "Martinique",
    officialNameEs: "Martinica", capital: "Fort-de-France", continent: "Americas", continentEs: "América",
    subregion: "Caribbean", subregionEs: "Caribe", population: 376480,
    flagSvg: "https://flagcdn.com/mq.svg", flagEmoji: "🇲🇶", latlng: [14.6415, -61.0242],
    altSpellings: ["Martinique", "Martinica"]
  },
  {
    cca2: "YT", cca3: "MYT", ccn3: "175", nameEs: "Mayotte", nameEn: "Mayotte",
    officialNameEs: "Departamento de Mayotte", capital: "Mamoudzou", continent: "Africa", continentEs: "África",
    subregion: "Eastern Africa", subregionEs: "Canal de Mozambique", population: 279471,
    flagSvg: "https://flagcdn.com/yt.svg", flagEmoji: "🇾🇹", latlng: [-12.8275, 45.1662],
    altSpellings: ["Mayotte"]
  },

  // 6. Países Autónomos de Países Bajos 🇳🇱
  {
    cca2: "AW", cca3: "ABW", ccn3: "533", nameEs: "Aruba", nameEn: "Aruba",
    officialNameEs: "Aruba", capital: "Oranjestad", continent: "Americas", continentEs: "América",
    subregion: "Caribbean", subregionEs: "Caribe Sur", population: 106766,
    flagSvg: "https://flagcdn.com/aw.svg", flagEmoji: "🇦🇼", latlng: [12.5211, -69.9683],
    altSpellings: ["Aruba"]
  },
  {
    cca2: "CW", cca3: "CUW", ccn3: "531", nameEs: "Curazao", nameEn: "Curaçao",
    officialNameEs: "País de Curazao", capital: "Willemstad", continent: "Americas", continentEs: "América",
    subregion: "Caribbean", subregionEs: "Caribe Sur", population: 155014,
    flagSvg: "https://flagcdn.com/cw.svg", flagEmoji: "🇨🇼", latlng: [12.1696, -68.9900],
    altSpellings: ["Curacao", "Curazao"]
  },
  {
    cca2: "SX", cca3: "SXM", ccn3: "534", nameEs: "Sint Maarten (Países Bajos)", nameEn: "Sint Maarten",
    officialNameEs: "Sint Maarten", capital: "Philipsburg", continent: "Americas", continentEs: "América",
    subregion: "Caribbean", subregionEs: "Caribe", population: 42848,
    flagSvg: "https://flagcdn.com/sx.svg", flagEmoji: "🇸🇽", latlng: [18.0425, -63.0548],
    altSpellings: ["Sint Maarten", "San Martin Holandes"]
  },

  // 7. Territorios de Australia 🇦🇺
  {
    cca2: "CX", cca3: "CXR", ccn3: "162", nameEs: "Isla de Navidad", nameEn: "Christmas Island",
    officialNameEs: "Territorio de la Isla de Navidad", capital: "Flying Fish Cove", continent: "Oceania", continentEs: "Oceanía",
    subregion: "Australia and New Zealand", subregionEs: "Océano Índico", population: 1843,
    flagSvg: "https://flagcdn.com/cx.svg", flagEmoji: "🇨🇽", latlng: [-10.4475, 105.6904],
    altSpellings: ["Christmas Island", "Isla de Navidad"]
  },
  {
    cca2: "CC", cca3: "CCK", ccn3: "166", nameEs: "Islas Cocos (Keeling)", nameEn: "Cocos (Keeling) Islands",
    officialNameEs: "Territorio de las Islas Cocos", capital: "West Island", continent: "Oceania", continentEs: "Oceanía",
    subregion: "Australia and New Zealand", subregionEs: "Océano Índico", population: 544,
    flagSvg: "https://flagcdn.com/cc.svg", flagEmoji: "🇨🇨", latlng: [-12.1642, 96.8710],
    altSpellings: ["Cocos Islands", "Islas Cocos"]
  },

  // 8. Regiones Administrativas Especiales de China 🇨🇳
  {
    cca2: "HK", cca3: "HKG", ccn3: "344", nameEs: "Hong Kong", nameEn: "Hong Kong",
    officialNameEs: "Región Administrativa Especial de Hong Kong", capital: "Hong Kong", continent: "Asia", continentEs: "Asia",
    subregion: "Eastern Asia", subregionEs: "Asia Oriental", population: 7481800,
    flagSvg: "https://flagcdn.com/hk.svg", flagEmoji: "🇭🇰", latlng: [22.3193, 114.1694],
    altSpellings: ["Hong Kong", "HK"]
  },
  {
    cca2: "MO", cca3: "MAC", ccn3: "446", nameEs: "Macao", nameEn: "Macau",
    officialNameEs: "Región Administrativa Especial de Macao", capital: "Macao", continent: "Asia", continentEs: "Asia",
    subregion: "Eastern Asia", subregionEs: "Asia Oriental", population: 683218,
    flagSvg: "https://flagcdn.com/mo.svg", flagEmoji: "🇲🇴", latlng: [22.1987, 113.5439],
    altSpellings: ["Macau", "Macao"]
  },

  // 9. Otros territorios especiales
  {
    cca2: "GL", cca3: "GRL", ccn3: "304", nameEs: "Groenlandia", nameEn: "Greenland",
    officialNameEs: "Groenlandia", capital: "Nuuk", continent: "Americas", continentEs: "América",
    subregion: "North America", subregionEs: "Ártico", population: 56367,
    flagSvg: "https://flagcdn.com/gl.svg", flagEmoji: "🇬🇱", latlng: [71.7069, -42.6043],
    altSpellings: ["Greenland", "Groenlandia", "Kalaallit Nunaat"]
  },
  {
    cca2: "FO", cca3: "FRO", ccn3: "234", nameEs: "Islas Feroe", nameEn: "Faroe Islands",
    officialNameEs: "Islas Feroe", capital: "Tórshavn", continent: "Europe", continentEs: "Europa",
    subregion: "Northern Europe", subregionEs: "Atlántico Norte", population: 48865,
    flagSvg: "https://flagcdn.com/fo.svg", flagEmoji: "🇫🇴", latlng: [61.8926, -6.9118],
    altSpellings: ["Faroe Islands", "Islas Feroe"]
  }
];

export const FALLBACK_MAP_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json";
