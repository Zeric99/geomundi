import { Continent, ContinentEs, Country, GeoFeatureProperties } from '../types/country';
import { FALLBACK_COUNTRIES, GEEK_TERRITORIES } from '../data/fallbackCountries';
import { GEO_ALIASES, NUMERIC_TO_CCA3 } from '../data/geoAliases';

const CACHE_KEY = 'GEOMUNDI_COUNTRIES_CACHE_V2';
const CACHE_EXPIRY_MS = 1000 * 60 * 60 * 24 * 7; // 7 días

const CONTINENT_MAP: Record<string, { en: Continent; es: ContinentEs }> = {
  'Europe': { en: 'Europe', es: 'Europa' },
  'Americas': { en: 'Americas', es: 'América' },
  'North America': { en: 'Americas', es: 'América' },
  'South America': { en: 'Americas', es: 'América' },
  'Asia': { en: 'Asia', es: 'Asia' },
  'Africa': { en: 'Africa', es: 'África' },
  'Oceania': { en: 'Oceania', es: 'Oceanía' },
  'Antarctic': { en: 'World', es: 'Mundo' },
};

/**
 * Traduce regiones a continentes principales
 */
function normalizeContinent(regionStr?: string): { continent: Continent; continentEs: ContinentEs } {
  if (!regionStr) return { continent: 'World', continentEs: 'Mundo' };
  const found = CONTINENT_MAP[regionStr];
  if (found) return { continent: found.en, continentEs: found.es };
  return { continent: 'World', continentEs: 'Mundo' };
}

/**
 * Parsea un objeto crudo de REST Countries v3.1 a nuestro modelo tipado
 */
function parseRestCountry(raw: any): Country | null {
  try {
    if (!raw || !raw.cca3) return null;
    const nameEs = raw.translations?.spa?.common || raw.name?.common || 'Desconocido';
    const officialNameEs = raw.translations?.spa?.official || raw.name?.official;
    const nameEn = raw.name?.common || 'Unknown';
    const capital = Array.isArray(raw.capital) && raw.capital.length > 0 ? raw.capital[0] : 'N/A';
    
    // Continente
    const rawRegion = raw.region || (Array.isArray(raw.continents) ? raw.continents[0] : 'World');
    const { continent, continentEs } = normalizeContinent(rawRegion);

    const latlng: [number, number] = Array.isArray(raw.latlng) && raw.latlng.length >= 2 
      ? [raw.latlng[0], raw.latlng[1]] 
      : [0, 0];

    const flagSvg = raw.flags?.svg || raw.flags?.png || `https://flagcdn.com/${(raw.cca2 || 'xx').toLowerCase()}.svg`;
    const flagEmoji = raw.flag || '🏳️';

    return {
      cca2: raw.cca2 || '',
      cca3: raw.cca3,
      ccn3: raw.ccn3,
      nameEs,
      nameEn,
      officialNameEs,
      capital,
      continent,
      continentEs,
      subregion: raw.subregion,
      subregionEs: raw.subregion,
      population: raw.population || 0,
      flagSvg,
      flagEmoji,
      latlng,
      area: raw.area,
      altSpellings: raw.altSpellings || [],
      borderCodes: raw.borders || []
    };
  } catch (err) {
    console.warn('Error parseando país:', raw?.cca3, err);
    return null;
  }
}

class CountriesService {
  private countriesCache: Country[] | null = null;
  private countriesMap: Map<string, Country> = new Map();

  /**
   * Carga la lista completa de países:
   * 1. Revisa memoria
   * 2. Revisa LocalStorage
   * 3. Hace fetch a REST Countries con timeout
   * 4. Utiliza dataset fallback local si falla
   */
  async loadCountries(): Promise<Country[]> {
    if (this.countriesCache && this.countriesCache.length > 0) {
      return this.countriesCache;
    }

    // 1. Verificar LocalStorage
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { timestamp, data } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_EXPIRY_MS && Array.isArray(data) && data.length > 100) {
          this.setCountries(data);
          return data;
        }
      }
    } catch (e) {
      console.warn('No se pudo leer caché de LocalStorage:', e);
    }

    // 2. Fetch de REST Countries v3.1
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

      const res = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,cca3,ccn3,capital,region,subregion,continents,population,flags,flag,latlng,area,altSpellings,borders,translations', {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const rawList = await res.json();
        if (Array.isArray(rawList) && rawList.length > 0) {
          const parsedList = rawList
            .map(parseRestCountry)
            .filter((c): c is Country => c !== null);

          // Combinar con fallback para asegurar que ningún país clave falte
          const merged = this.mergeWithFallback(parsedList);
          this.setCountries(merged);

          // Guardar en caché
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify({
              timestamp: Date.now(),
              data: merged
            }));
          } catch (storageErr) {
            console.warn('Error guardando países en localStorage:', storageErr);
          }

          return merged;
        }
      }
    } catch (networkErr) {
      console.warn('Error o timeout al conectar con REST Countries. Usando fallback offline:', networkErr);
    }

    // 3. Fallback Offline instantáneo
    this.setCountries(FALLBACK_COUNTRIES);
    return FALLBACK_COUNTRIES;
  }

  /**
   * Resuelve el código cca3 desde una característica del mapa TopoJSON/GeoJSON
   */
  resolveGeoCode(featureProperties: GeoFeatureProperties, featureId?: string | number): string | null {
    // Si viene id numérico ("032", "840", etc.)
    const idStr = String(featureId || featureProperties?.id || '').padStart(3, '0');
    if (NUMERIC_TO_CCA3[idStr]) {
      return NUMERIC_TO_CCA3[idStr];
    }

    // Si viene como ISO_A3 o cca3
    const directCode = featureProperties?.ISO_A3 || featureProperties?.iso_a3 || featureProperties?.ADM0_A3 || featureProperties?.cca3;
    if (directCode && directCode !== '-99') {
      const upper = directCode.toUpperCase();
      if (GEO_ALIASES[upper]) return GEO_ALIASES[upper];
      return upper;
    }

    if (GEO_ALIASES[idStr]) return GEO_ALIASES[idStr];

    return null;
  }

  /**
   * Obtiene un país por su código cca3 (ej: 'ESP', 'ARG', 'FRA')
   */
  getCountryByCode(cca3: string): Country | undefined {
    if (!cca3) return undefined;
    const upper = cca3.toUpperCase();
    const resolved = GEO_ALIASES[upper] || upper;
    return this.countriesMap.get(resolved);
  }

  /**
   * Obtiene todos los países
   */
  getAllCountries(): Country[] {
    return this.getCountriesByContinent('World');
  }

  /**
   * Filtra países por continente
   */
  getCountriesByContinent(continent: Continent): Country[] {
    const all = this.countriesCache || FALLBACK_COUNTRIES;
    if (continent === 'World') return all;
    return all.filter(c => c.continent === continent);
  }

  private setCountries(list: Country[]) {
    this.countriesCache = list;
    this.countriesMap.clear();
    for (const c of list) {
      this.countriesMap.set(c.cca3.toUpperCase(), c);
      if (c.cca2) this.countriesMap.set(c.cca2.toUpperCase(), c);
      if (c.ccn3) this.countriesMap.set(c.ccn3, c);
    }
    // Indexar también territorios especiales y estados de facto
    for (const t of GEEK_TERRITORIES) {
      if (!this.countriesMap.has(t.cca3.toUpperCase())) {
        this.countriesMap.set(t.cca3.toUpperCase(), t);
        if (t.cca2) this.countriesMap.set(t.cca2.toUpperCase(), t);
        if (t.ccn3) this.countriesMap.set(t.ccn3, t);
      }
    }
  }

  private mergeWithFallback(fetched: Country[]): Country[] {
    const map = new Map<string, Country>();
    for (const f of FALLBACK_COUNTRIES) {
      map.set(f.cca3.toUpperCase(), f);
    }
    for (const c of fetched) {
      const existing = map.get(c.cca3.toUpperCase());
      if (existing) {
        // Enriquecer con traducciones existentes si hiciera falta
        map.set(c.cca3.toUpperCase(), {
          ...existing,
          ...c,
          nameEs: c.nameEs && c.nameEs !== 'Desconocido' ? c.nameEs : existing.nameEs,
          capital: c.capital && c.capital !== 'N/A' ? c.capital : existing.capital,
          flagSvg: c.flagSvg || existing.flagSvg,
          altSpellings: Array.from(new Set([...(existing.altSpellings || []), ...(c.altSpellings || [])]))
        });
      } else {
        map.set(c.cca3.toUpperCase(), c);
      }
    }
    return Array.from(map.values());
  }
}

export const countriesService = new CountriesService();
