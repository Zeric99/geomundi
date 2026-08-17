import { useState, useCallback, useMemo } from 'react';
import { storageService } from '../services/storageService';
import { tutorEngine } from '../services/tutorEngine';
import { BlindSpotItem, ContinentMastery, TutorAdvice, UserStatsState } from '../types/stats';
import { GameSummary } from '../types/game';
import { Country } from '../types/country';

export function useStatsManager(countries: Country[]) {
  const [stats, setStats] = useState<UserStatsState>(() => storageService.getUserStats());

  const countriesMap = useMemo(() => {
    return new Map(countries.map(c => [c.cca3.toUpperCase(), c]));
  }, [countries]);

  const continentalMastery: ContinentMastery[] = useMemo(() => {
    return tutorEngine.calculateContinentalMastery(stats, countries);
  }, [stats, countries]);

  const blindSpots: BlindSpotItem[] = useMemo(() => {
    return tutorEngine.identifyBlindSpots(stats, countriesMap);
  }, [stats, countriesMap]);

  const smartAdvice: TutorAdvice[] = useMemo(() => {
    return tutorEngine.generateSmartAdvice(stats, continentalMastery, blindSpots);
  }, [stats, continentalMastery, blindSpots]);

  const recordGame = useCallback((gameSummary: GameSummary) => {
    const updated = storageService.recordGameResults(gameSummary);
    setStats(updated);
  }, []);

  const resetStats = useCallback(() => {
    storageService.resetStats();
    setStats(storageService.getUserStats());
  }, []);

  const getFocusedPracticeCountries = useCallback((limit: number = 10): Country[] => {
    return tutorEngine.getFocusedPracticeCountries(stats, countries, limit);
  }, [stats, countries]);

  return {
    stats,
    continentalMastery,
    blindSpots,
    smartAdvice,
    recordGame,
    resetStats,
    getFocusedPracticeCountries
  };
}
