import { useState, useEffect, useMemo } from 'react';
import { Country } from '../types/country';
import { countriesService } from '../services/countriesService';
import { FALLBACK_COUNTRIES } from '../data/fallbackCountries';

export function useCountriesData() {
  const [countries, setCountries] = useState<Country[]>(FALLBACK_COUNTRIES);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function init() {
      try {
        setIsLoading(true);
        const data = await countriesService.loadCountries();
        if (isMounted) {
          setCountries(data);
          setIsLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Error cargando datos');
          setIsLoading(false);
        }
      }
    }
    init();
    return () => { isMounted = false; };
  }, []);

  const countriesMap = useMemo(() => {
    const map = new Map<string, Country>();
    for (const c of countries) {
      map.set(c.cca3.toUpperCase(), c);
    }
    return map;
  }, [countries]);

  return {
    countries,
    countriesMap,
    isLoading,
    error,
    getCountryByCode: (code: string) => countriesService.getCountryByCode(code),
    resolveGeoCode: (props: any, id?: any) => countriesService.resolveGeoCode(props, id),
    getCountriesByContinent: (continent: any) => countriesService.getCountriesByContinent(continent),
  };
}
