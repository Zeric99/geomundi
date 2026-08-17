export type Continent = 'Europe' | 'Americas' | 'Asia' | 'Africa' | 'Oceania' | 'World';

export type ContinentEs = 'Europa' | 'América' | 'Asia' | 'África' | 'Oceanía' | 'Mundo';

export interface Country {
  cca2: string;            // e.g. "ES"
  cca3: string;            // e.g. "ESP"
  ccn3?: string;           // numeric ISO e.g. "724"
  nameEs: string;          // e.g. "España"
  nameEn: string;          // e.g. "Spain"
  officialNameEs?: string; // e.g. "Reino de España"
  capital: string;         // e.g. "Madrid"
  continent: Continent;    // e.g. "Europe"
  continentEs: ContinentEs;// e.g. "Europa"
  subregion?: string;      // e.g. "Southern Europe"
  subregionEs?: string;    // e.g. "Europa del Sur"
  population: number;      // e.g. 47351567
  flagSvg: string;         // e.g. "https://flagcdn.com/es.svg"
  flagEmoji: string;       // e.g. "🇪🇸"
  latlng: [number, number];// [latitude, longitude]
  area?: number;           // in sq km
  altSpellings?: string[]; // e.g. ["Espana", "Reino de Espana", "Spain"]
  borderCodes?: string[];  // cca3 of bordering countries
}

export type CountryMapStatus = 
  | 'neutral'
  | 'hover'
  | 'selected'
  | 'correct'
  | 'wrong'
  | 'hint'
  | 'target'
  | 'disabled';

export interface GeoFeatureProperties {
  id?: string;
  name?: string;
  ISO_A3?: string;
  iso_a3?: string;
  iso_a2?: string;
  ADM0_A3?: string;
  cca3?: string;
  [key: string]: any;
}
