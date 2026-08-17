import { Country } from '../types/country';

export const FALLBACK_COUNTRIES: Country[] = [
  // --- EUROPA ---
  {
    cca2: "ES", cca3: "ESP", ccn3: "724", nameEs: "España", nameEn: "Spain",
    officialNameEs: "Reino de España", capital: "Madrid", continent: "Europe", continentEs: "Europa",
    subregion: "Southern Europe", subregionEs: "Europa del Sur", population: 47351567,
    flagSvg: "https://flagcdn.com/es.svg", flagEmoji: "🇪🇸", latlng: [40.4637, -3.7492],
    altSpellings: ["Espana", "Reino de Espana", "Spain", "Spanien"]
  },
  {
    cca2: "FR", cca3: "FRA", ccn3: "250", nameEs: "Francia", nameEn: "France",
    officialNameEs: "República Francesa", capital: "París", continent: "Europe", continentEs: "Europa",
    subregion: "Western Europe", subregionEs: "Europa Occidental", population: 67391582,
    flagSvg: "https://flagcdn.com/fr.svg", flagEmoji: "🇫🇷", latlng: [46.2276, 2.2137],
    altSpellings: ["France", "Republique Francaise", "Franca"]
  },
  {
    cca2: "DE", cca3: "DEU", ccn3: "276", nameEs: "Alemania", nameEn: "Germany",
    officialNameEs: "República Federal de Alemania", capital: "Berlín", continent: "Europe", continentEs: "Europa",
    subregion: "Western Europe", subregionEs: "Europa Occidental", population: 83240525,
    flagSvg: "https://flagcdn.com/de.svg", flagEmoji: "🇩🇪", latlng: [51.1657, 10.4515],
    altSpellings: ["Germany", "Deutschland", "Alemania"]
  },
  {
    cca2: "IT", cca3: "ITA", ccn3: "380", nameEs: "Italia", nameEn: "Italy",
    officialNameEs: "República Italiana", capital: "Roma", continent: "Europe", continentEs: "Europa",
    subregion: "Southern Europe", subregionEs: "Europa del Sur", population: 59554023,
    flagSvg: "https://flagcdn.com/it.svg", flagEmoji: "🇮🇹", latlng: [41.8719, 12.5674],
    altSpellings: ["Italy", "Italia", "Repubblica Italiana"]
  },
  {
    cca2: "PT", cca3: "PRT", ccn3: "620", nameEs: "Portugal", nameEn: "Portugal",
    officialNameEs: "República Portuguesa", capital: "Lisboa", continent: "Europe", continentEs: "Europa",
    subregion: "Southern Europe", subregionEs: "Europa del Sur", population: 10305564,
    flagSvg: "https://flagcdn.com/pt.svg", flagEmoji: "🇵🇹", latlng: [39.3999, -8.2245],
    altSpellings: ["Portugal", "Republica Portuguesa"]
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
    altSpellings: ["Greece", "Hellas", "Grecia"]
  },
  {
    cca2: "CZ", cca3: "CZE", ccn3: "203", nameEs: "República Checa", nameEn: "Czechia",
    officialNameEs: "República Checa", capital: "Praga", continent: "Europe", continentEs: "Europa",
    subregion: "Central Europe", subregionEs: "Europa Central", population: 10698896,
    flagSvg: "https://flagcdn.com/cz.svg", flagEmoji: "🇨🇿", latlng: [49.8175, 15.4730],
    altSpellings: ["Czechia", "Chequia", "Czech Republic"]
  },
  {
    cca2: "HU", cca3: "HUN", ccn3: "348", nameEs: "Hungría", nameEn: "Hungary",
    officialNameEs: "Hungría", capital: "Budapest", continent: "Europe", continentEs: "Europa",
    subregion: "Central Europe", subregionEs: "Europa Central", population: 9749763,
    flagSvg: "https://flagcdn.com/hu.svg", flagEmoji: "🇭🇺", latlng: [47.1625, 19.5033],
    altSpellings: ["Hungary", "Magyarorszag"]
  },
  {
    cca2: "RO", cca3: "ROU", ccn3: "642", nameEs: "Rumania", nameEn: "Romania",
    officialNameEs: "Rumania", capital: "Bucarest", continent: "Europe", continentEs: "Europa",
    subregion: "Eastern Europe", subregionEs: "Europa del Este", population: 19286123,
    flagSvg: "https://flagcdn.com/ro.svg", flagEmoji: "🇷🇴", latlng: [45.9432, 24.9668],
    altSpellings: ["Romania", "Rumania", "Rumanía"]
  },
  {
    cca2: "UA", cca3: "UKR", ccn3: "804", nameEs: "Ucrania", nameEn: "Ukraine",
    officialNameEs: "Ucrania", capital: "Kiev", continent: "Europe", continentEs: "Europa",
    subregion: "Eastern Europe", subregionEs: "Europa del Este", population: 44134693,
    flagSvg: "https://flagcdn.com/ua.svg", flagEmoji: "🇺🇦", latlng: [48.3794, 31.1656],
    altSpellings: ["Ukraine", "Ukrayina"]
  },
  {
    cca2: "HR", cca3: "HRV", ccn3: "191", nameEs: "Croacia", nameEn: "Croatia",
    officialNameEs: "República de Croacia", capital: "Zagreb", continent: "Europe", continentEs: "Europa",
    subregion: "Southeast Europe", subregionEs: "Sureste de Europa", population: 4047200,
    flagSvg: "https://flagcdn.com/hr.svg", flagEmoji: "🇭🇷", latlng: [45.1, 15.2],
    altSpellings: ["Croatia", "Hrvatska"]
  },
  {
    cca2: "RS", cca3: "SRB", ccn3: "688", nameEs: "Serbia", nameEn: "Serbia",
    officialNameEs: "República de Serbia", capital: "Belgrado", continent: "Europe", continentEs: "Europa",
    subregion: "Southeast Europe", subregionEs: "Sureste de Europa", population: 6908224,
    flagSvg: "https://flagcdn.com/rs.svg", flagEmoji: "🇷🇸", latlng: [44.0165, 21.0059],
    altSpellings: ["Serbia", "Srbija"]
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
    altSpellings: ["Slovakia", "Slovensko"]
  },
  {
    cca2: "SI", cca3: "SVN", ccn3: "705", nameEs: "Eslovenia", nameEn: "Slovenia",
    officialNameEs: "República de Eslovenia", capital: "Liubliana", continent: "Europe", continentEs: "Europa",
    subregion: "Central Europe", subregionEs: "Europa Central", population: 2100126,
    flagSvg: "https://flagcdn.com/si.svg", flagEmoji: "🇸🇮", latlng: [46.1512, 14.9955],
    altSpellings: ["Slovenia", "Slovenija"]
  },
  {
    cca2: "EE", cca3: "EST", ccn3: "233", nameEs: "Estonia", nameEn: "Estonia",
    officialNameEs: "República de Estonia", capital: "Tallin", continent: "Europe", continentEs: "Europa",
    subregion: "Northern Europe", subregionEs: "Bálticos", population: 1331057,
    flagSvg: "https://flagcdn.com/ee.svg", flagEmoji: "🇪🇪", latlng: [58.5953, 25.0136],
    altSpellings: ["Estonia", "Eesti"]
  },
  {
    cca2: "LV", cca3: "LVA", ccn3: "428", nameEs: "Letonia", nameEn: "Latvia",
    officialNameEs: "República de Letonia", capital: "Riga", continent: "Europe", continentEs: "Europa",
    subregion: "Northern Europe", subregionEs: "Bálticos", population: 1901548,
    flagSvg: "https://flagcdn.com/lv.svg", flagEmoji: "🇱🇻", latlng: [56.8796, 24.6032],
    altSpellings: ["Latvia", "Latvija"]
  },
  {
    cca2: "LT", cca3: "LTU", ccn3: "440", nameEs: "Lituania", nameEn: "Lithuania",
    officialNameEs: "República de Lituania", capital: "Vilna", continent: "Europe", continentEs: "Europa",
    subregion: "Northern Europe", subregionEs: "Bálticos", population: 2794700,
    flagSvg: "https://flagcdn.com/lt.svg", flagEmoji: "🇱🇹", latlng: [55.1694, 23.8813],
    altSpellings: ["Lithuania", "Lietuva"]
  },
  {
    cca2: "AL", cca3: "ALB", ccn3: "008", nameEs: "Albania", nameEn: "Albania",
    officialNameEs: "República de Albania", capital: "Tirana", continent: "Europe", continentEs: "Europa",
    subregion: "Southeast Europe", subregionEs: "Balcanes", population: 2837743,
    flagSvg: "https://flagcdn.com/al.svg", flagEmoji: "🇦🇱", latlng: [41.1533, 20.1683],
    altSpellings: ["Albania", "Shqiperia"]
  },
  {
    cca2: "BA", cca3: "BIH", ccn3: "070", nameEs: "Bosnia y Herzegovina", nameEn: "Bosnia and Herzegovina",
    officialNameEs: "Bosnia y Herzegovina", capital: "Sarajevo", continent: "Europe", continentEs: "Europa",
    subregion: "Southeast Europe", subregionEs: "Balcanes", population: 3280815,
    flagSvg: "https://flagcdn.com/ba.svg", flagEmoji: "🇧🇦", latlng: [43.9159, 17.6791],
    altSpellings: ["Bosnia", "Bosnia Herzegovina", "Bosna"]
  },
  {
    cca2: "MK", cca3: "MKD", ccn3: "807", nameEs: "Macedonia del Norte", nameEn: "North Macedonia",
    officialNameEs: "República de Macedonia del Norte", capital: "Skopie", continent: "Europe", continentEs: "Europa",
    subregion: "Southeast Europe", subregionEs: "Balcanes", population: 2077132,
    flagSvg: "https://flagcdn.com/mk.svg", flagEmoji: "🇲🇰", latlng: [41.6086, 21.7453],
    altSpellings: ["Macedonia", "North Macedonia"]
  },
  {
    cca2: "ME", cca3: "MNE", ccn3: "499", nameEs: "Montenegro", nameEn: "Montenegro",
    officialNameEs: "Montenegro", capital: "Podgorica", continent: "Europe", continentEs: "Europa",
    subregion: "Southeast Europe", subregionEs: "Balcanes", population: 621718,
    flagSvg: "https://flagcdn.com/me.svg", flagEmoji: "🇲🇪", latlng: [42.7087, 19.3744],
    altSpellings: ["Montenegro", "Crna Gora"]
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
    altSpellings: ["Belarus", "Bielorrusia"]
  },
  {
    cca2: "LU", cca3: "LUX", ccn3: "442", nameEs: "Luxemburgo", nameEn: "Luxembourg",
    officialNameEs: "Gran Ducado de Luxemburgo", capital: "Luxemburgo", continent: "Europe", continentEs: "Europa",
    subregion: "Western Europe", subregionEs: "Europa Occidental", population: 632275,
    flagSvg: "https://flagcdn.com/lu.svg", flagEmoji: "🇱🇺", latlng: [49.8153, 6.1296],
    altSpellings: ["Luxembourg", "Luxemburgo"]
  },
  {
    cca2: "CY", cca3: "CYP", ccn3: "196", nameEs: "Chipre", nameEn: "Cyprus",
    officialNameEs: "República de Chipre", capital: "Nicosia", continent: "Europe", continentEs: "Europa",
    subregion: "Southern Europe", subregionEs: "Mediterráneo", population: 1207361,
    flagSvg: "https://flagcdn.com/cy.svg", flagEmoji: "🇨🇾", latlng: [35.1264, 33.4299],
    altSpellings: ["Cyprus", "Chipre"]
  },

  // --- AMÉRICAS ---
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
    altSpellings: ["Dominicana", "Dominican Republic"]
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
    altSpellings: ["El Salvador", "Salvador"]
  },
  {
    cca2: "NI", cca3: "NIC", ccn3: "558", nameEs: "Nicaragua", nameEn: "Nicaragua",
    officialNameEs: "República de Nicaragua", capital: "Managua", continent: "Americas", continentEs: "América",
    subregion: "Central America", subregionEs: "América Central", population: 6624554,
    flagSvg: "https://flagcdn.com/ni.svg", flagEmoji: "🇳🇮", latlng: [12.8654, -85.2072],
    altSpellings: ["Nicaragua"]
  },

  // --- ASIA ---
  {
    cca2: "CN", cca3: "CHN", ccn3: "156", nameEs: "China", nameEn: "China",
    officialNameEs: "República Popular China", capital: "Pekín", continent: "Asia", continentEs: "Asia",
    subregion: "Eastern Asia", subregionEs: "Asia Oriental", population: 1402112000,
    flagSvg: "https://flagcdn.com/cn.svg", flagEmoji: "🇨🇳", latlng: [35.8617, 104.1954],
    altSpellings: ["China", "Beijing", "Zhongguo"]
  },
  {
    cca2: "JP", cca3: "JPN", ccn3: "392", nameEs: "Japón", nameEn: "Japan",
    officialNameEs: "Japón", capital: "Tokio", continent: "Asia", continentEs: "Asia",
    subregion: "Eastern Asia", subregionEs: "Asia Oriental", population: 125836021,
    flagSvg: "https://flagcdn.com/jp.svg", flagEmoji: "🇯🇵", latlng: [36.2048, 138.2529],
    altSpellings: ["Japan", "Nippon", "Nihon", "Japon"]
  },
  {
    cca2: "IN", cca3: "IND", ccn3: "356", nameEs: "India", nameEn: "India",
    officialNameEs: "República de la India", capital: "Nueva Delhi", continent: "Asia", continentEs: "Asia",
    subregion: "Southern Asia", subregionEs: "Asia del Sur", population: 1380004385,
    flagSvg: "https://flagcdn.com/in.svg", flagEmoji: "🇮🇳", latlng: [20.5937, 78.9629],
    altSpellings: ["India", "Bharat"]
  },
  {
    cca2: "RU", cca3: "RUS", ccn3: "643", nameEs: "Rusia", nameEn: "Russia",
    officialNameEs: "Federación Rusa", capital: "Moscú", continent: "Asia", continentEs: "Asia",
    subregion: "Eastern Europe", subregionEs: "Eurasia", population: 144104080,
    flagSvg: "https://flagcdn.com/ru.svg", flagEmoji: "🇷🇺", latlng: [61.524, 105.3188],
    altSpellings: ["Russia", "Rossiya", "Rusia"]
  },
  {
    cca2: "KR", cca3: "KOR", ccn3: "410", nameEs: "Corea del Sur", nameEn: "South Korea",
    officialNameEs: "República de Corea", capital: "Seúl", continent: "Asia", continentEs: "Asia",
    subregion: "Eastern Asia", subregionEs: "Asia Oriental", population: 51780579,
    flagSvg: "https://flagcdn.com/kr.svg", flagEmoji: "🇰🇷", latlng: [35.9078, 127.7669],
    altSpellings: ["South Korea", "Corea", "Korea"]
  },
  {
    cca2: "KP", cca3: "PRK", ccn3: "408", nameEs: "Corea del Norte", nameEn: "North Korea",
    officialNameEs: "República Popular Democrática de Corea", capital: "Pionyang", continent: "Asia", continentEs: "Asia",
    subregion: "Eastern Asia", subregionEs: "Asia Oriental", population: 25778815,
    flagSvg: "https://flagcdn.com/kp.svg", flagEmoji: "🇰🇵", latlng: [40.3399, 127.5101],
    altSpellings: ["North Korea", "Corea del Norte"]
  },
  {
    cca2: "ID", cca3: "IDN", ccn3: "360", nameEs: "Indonesia", nameEn: "Indonesia",
    officialNameEs: "República de Indonesia", capital: "Yakarta", continent: "Asia", continentEs: "Asia",
    subregion: "South-Eastern Asia", subregionEs: "Sudeste Asiático", population: 273523621,
    flagSvg: "https://flagcdn.com/id.svg", flagEmoji: "🇮🇩", latlng: [-0.7893, 113.9213],
    altSpellings: ["Indonesia"]
  },
  {
    cca2: "SA", cca3: "SAU", ccn3: "682", nameEs: "Arabia Saudita", nameEn: "Saudi Arabia",
    officialNameEs: "Reino de Arabia Saudita", capital: "Riad", continent: "Asia", continentEs: "Asia",
    subregion: "Western Asia", subregionEs: "Medio Oriente", population: 34813867,
    flagSvg: "https://flagcdn.com/sa.svg", flagEmoji: "🇸🇦", latlng: [23.8859, 45.0792],
    altSpellings: ["Saudi Arabia", "Arabia Saudí", "Arabia Saudita"]
  },
  {
    cca2: "TR", cca3: "TUR", ccn3: "792", nameEs: "Turquía", nameEn: "Turkey",
    officialNameEs: "República de Turquía", capital: "Ankara", continent: "Asia", continentEs: "Asia",
    subregion: "Western Asia", subregionEs: "Medio Oriente", population: 84339067,
    flagSvg: "https://flagcdn.com/tr.svg", flagEmoji: "🇹🇷", latlng: [38.9637, 35.2433],
    altSpellings: ["Turkey", "Turkiye", "Turquía"]
  },
  {
    cca2: "IR", cca3: "IRN", ccn3: "364", nameEs: "Irán", nameEn: "Iran",
    officialNameEs: "República Islámica de Irán", capital: "Teherán", continent: "Asia", continentEs: "Asia",
    subregion: "Southern Asia", subregionEs: "Medio Oriente", population: 83992953,
    flagSvg: "https://flagcdn.com/ir.svg", flagEmoji: "🇮🇷", latlng: [32.4279, 53.688],
    altSpellings: ["Iran", "Persia", "Irán"]
  },
  {
    cca2: "TH", cca3: "THA", ccn3: "764", nameEs: "Tailandia", nameEn: "Thailand",
    officialNameEs: "Reino de Tailandia", capital: "Bangkok", continent: "Asia", continentEs: "Asia",
    subregion: "South-Eastern Asia", subregionEs: "Sudeste Asiático", population: 69799978,
    flagSvg: "https://flagcdn.com/th.svg", flagEmoji: "🇹🇭", latlng: [15.87, 100.9925],
    altSpellings: ["Thailand", "Siam", "Tailandia"]
  },
  {
    cca2: "VN", cca3: "VNM", ccn3: "704", nameEs: "Vietnam", nameEn: "Vietnam",
    officialNameEs: "República Socialista de Vietnam", capital: "Hanói", continent: "Asia", continentEs: "Asia",
    subregion: "South-Eastern Asia", subregionEs: "Sudeste Asiático", population: 97338583,
    flagSvg: "https://flagcdn.com/vn.svg", flagEmoji: "🇻🇳", latlng: [14.0583, 108.2772],
    altSpellings: ["Vietnam", "Viet Nam"]
  },
  {
    cca2: "PH", cca3: "PHL", ccn3: "608", nameEs: "Filipinas", nameEn: "Philippines",
    officialNameEs: "República de Filipinas", capital: "Manila", continent: "Asia", continentEs: "Asia",
    subregion: "South-Eastern Asia", subregionEs: "Sudeste Asiático", population: 109581085,
    flagSvg: "https://flagcdn.com/ph.svg", flagEmoji: "🇵🇭", latlng: [12.8797, 121.774],
    altSpellings: ["Philippines", "Filipinas", "Pilipinas"]
  },
  {
    cca2: "PK", cca3: "PAK", ccn3: "586", nameEs: "Pakistán", nameEn: "Pakistan",
    officialNameEs: "República Islámica de Pakistán", capital: "Islamabad", continent: "Asia", continentEs: "Asia",
    subregion: "Southern Asia", subregionEs: "Asia del Sur", population: 220892331,
    flagSvg: "https://flagcdn.com/pk.svg", flagEmoji: "🇵🇰", latlng: [30.3753, 69.3451],
    altSpellings: ["Pakistan", "Pakistán"]
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
    altSpellings: ["UAE", "Emiratos Arabes", "Dubai", "Abu Dhabi"]
  },
  {
    cca2: "SG", cca3: "SGP", ccn3: "702", nameEs: "Singapur", nameEn: "Singapore",
    officialNameEs: "República de Singapur", capital: "Singapur", continent: "Asia", continentEs: "Asia",
    subregion: "South-Eastern Asia", subregionEs: "Sudeste Asiático", population: 5685807,
    flagSvg: "https://flagcdn.com/sg.svg", flagEmoji: "🇸🇬", latlng: [1.3521, 103.8198],
    altSpellings: ["Singapore", "Singapur"]
  },
  {
    cca2: "MY", cca3: "MYS", ccn3: "458", nameEs: "Malasia", nameEn: "Malaysia",
    officialNameEs: "Malasia", capital: "Kuala Lumpur", continent: "Asia", continentEs: "Asia",
    subregion: "South-Eastern Asia", subregionEs: "Sudeste Asiático", population: 32365998,
    flagSvg: "https://flagcdn.com/my.svg", flagEmoji: "🇲🇾", latlng: [4.2105, 101.9758],
    altSpellings: ["Malaysia", "Malasia"]
  },
  {
    cca2: "IQ", cca3: "IRQ", ccn3: "368", nameEs: "Irak", nameEn: "Iraq",
    officialNameEs: "República de Irak", capital: "Bagdad", continent: "Asia", continentEs: "Asia",
    subregion: "Western Asia", subregionEs: "Medio Oriente", population: 40222503,
    flagSvg: "https://flagcdn.com/iq.svg", flagEmoji: "🇮🇶", latlng: [33.2232, 43.6793],
    altSpellings: ["Iraq", "Irak"]
  },

  // --- ÁFRICA ---
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
    altSpellings: ["South Africa", "Sudafrica"]
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
    altSpellings: ["Morocco", "Marruecos", "Maroc"]
  },
  {
    cca2: "DZ", cca3: "DZA", ccn3: "012", nameEs: "Argelia", nameEn: "Algeria",
    officialNameEs: "República Argelina Democrática y Popular", capital: "Argel", continent: "Africa", continentEs: "África",
    subregion: "Northern Africa", subregionEs: "Magreb", population: 44700000,
    flagSvg: "https://flagcdn.com/dz.svg", flagEmoji: "🇩🇿", latlng: [28.0339, 1.6596],
    altSpellings: ["Algeria", "Argelia"]
  },
  {
    cca2: "KE", cca3: "KEN", ccn3: "404", nameEs: "Kenia", nameEn: "Kenya",
    officialNameEs: "República de Kenia", capital: "Nairobi", continent: "Africa", continentEs: "África",
    subregion: "Eastern Africa", subregionEs: "África Oriental", population: 53771300,
    flagSvg: "https://flagcdn.com/ke.svg", flagEmoji: "🇰🇪", latlng: [-0.0236, 37.9062],
    altSpellings: ["Kenya", "Kenia"]
  },
  {
    cca2: "ET", cca3: "ETH", ccn3: "231", nameEs: "Etiopía", nameEn: "Ethiopia",
    officialNameEs: "República Democrática Federal de Etiopía", capital: "Adís Abeba", continent: "Africa", continentEs: "África",
    subregion: "Eastern Africa", subregionEs: "Cuerno de África", population: 114963583,
    flagSvg: "https://flagcdn.com/et.svg", flagEmoji: "🇪🇹", latlng: [9.145, 40.4897],
    altSpellings: ["Ethiopia", "Etiopia"]
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
    altSpellings: ["Ivory Coast", "Cote d'Ivoire", "Costa de Marfil"]
  },
  {
    cca2: "CD", cca3: "COD", ccn3: "180", nameEs: "República Democrática del Congo", nameEn: "DR Congo",
    officialNameEs: "República Democrática del Congo", capital: "Kinshasa", continent: "Africa", continentEs: "África",
    subregion: "Middle Africa", subregionEs: "África Central", population: 89561404,
    flagSvg: "https://flagcdn.com/cd.svg", flagEmoji: "🇨🇩", latlng: [-4.0383, 21.7587],
    altSpellings: ["Congo RDC", "DR Congo", "Zaire", "RDC"]
  },
  {
    cca2: "CM", cca3: "CMR", ccn3: "120", nameEs: "Camerún", nameEn: "Cameroon",
    officialNameEs: "República de Camerún", capital: "Yaundé", continent: "Africa", continentEs: "África",
    subregion: "Middle Africa", subregionEs: "África Central", population: 26545864,
    flagSvg: "https://flagcdn.com/cm.svg", flagEmoji: "🇨🇲", latlng: [7.3697, 12.3547],
    altSpellings: ["Cameroon", "Camerun"]
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
    altSpellings: ["Tunisia", "Tunez"]
  },

  // --- OCEANÍA ---
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
    altSpellings: ["New Zealand", "Aotearoa", "Nueva Zelanda"]
  },
  {
    cca2: "PG", cca3: "PNG", ccn3: "598", nameEs: "Papúa Nueva Guinea", nameEn: "Papua New Guinea",
    officialNameEs: "Estado Independiente de Papúa Nueva Guinea", capital: "Port Moresby", continent: "Oceania", continentEs: "Oceanía",
    subregion: "Melanesia", subregionEs: "Melanesia", population: 8947027,
    flagSvg: "https://flagcdn.com/pg.svg", flagEmoji: "🇵🇬", latlng: [-6.315, 143.9555],
    altSpellings: ["Papua New Guinea", "Papua Nueva Guinea"]
  },
  {
    cca2: "FJ", cca3: "FJI", ccn3: "242", nameEs: "Fiyi", nameEn: "Fiji",
    officialNameEs: "República de Fiyi", capital: "Suva", continent: "Oceania", continentEs: "Oceanía",
    subregion: "Melanesia", subregionEs: "Melanesia", population: 896444,
    flagSvg: "https://flagcdn.com/fj.svg", flagEmoji: "🇫🇯", latlng: [-17.7134, 178.065],
    altSpellings: ["Fiji", "Fiyi"]
  }
];

export const FALLBACK_MAP_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
