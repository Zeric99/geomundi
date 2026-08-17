import { Continent, ContinentEs, Country } from '../types/country';
import { BlindSpotItem, ContinentMastery, CountryPerformance, TutorAdvice, UserStatsState } from '../types/stats';
import { CONTINENT_NAMES_ES } from '../data/geoAliases';

export class TutorEngine {
  /**
   * Calcula el dominio y precisión por continente
   */
  calculateContinentalMastery(
    userStats: UserStatsState,
    allCountries: Country[]
  ): ContinentMastery[] {
    const continents: Continent[] = ['Europe', 'Americas', 'Africa', 'Asia', 'Oceania'];

    return continents.map(continent => {
      const continentCountries = allCountries.filter(c => c.continent === continent);
      const totalCountries = continentCountries.length;
      
      let playedCountries = 0;
      let masteredCountries = 0;
      let totalAttempts = 0;
      let totalFirstTry = 0;
      let totalMistakes = 0;

      for (const country of continentCountries) {
        const perf = userStats.countries[country.cca3.toUpperCase()];
        if (perf && perf.totalAttempts > 0) {
          playedCountries++;
          totalAttempts += perf.totalAttempts;
          totalFirstTry += perf.firstTrySuccesses;
          totalMistakes += perf.mistakes;

          const rate = perf.firstTrySuccesses / perf.totalAttempts;
          if (rate >= 0.75 && perf.totalAttempts >= 2) {
            masteredCountries++;
          }
        }
      }

      const accuracyPercentage = totalAttempts > 0
        ? Math.round((totalFirstTry / totalAttempts) * 100)
        : 0;

      let level: ContinentMastery['level'] = 'Novato';
      if (accuracyPercentage >= 90 && playedCountries >= Math.min(15, totalCountries)) {
        level = 'Maestro';
      } else if (accuracyPercentage >= 75 && playedCountries >= Math.min(10, totalCountries)) {
        level = 'Experto';
      } else if (accuracyPercentage >= 60 || playedCountries >= 8) {
        level = 'Avanzado';
      } else if (playedCountries > 0) {
        level = 'Aprendiz';
      }

      return {
        continent,
        continentEs: (CONTINENT_NAMES_ES[continent] || continent) as ContinentEs,
        totalCountries,
        playedCountries,
        masteredCountries,
        accuracyPercentage,
        totalAttempts,
        totalMistakes,
        level
      };
    });
  }

  /**
   * Identifica los puntos ciegos (países con mayor tasa de error o fallos reiterados)
   */
  identifyBlindSpots(
    userStats: UserStatsState,
    countriesMap: Map<string, Country>
  ): BlindSpotItem[] {
    const blindSpots: BlindSpotItem[] = [];

    for (const [cca3, perf] of Object.entries(userStats.countries)) {
      if (perf.totalAttempts >= 1) {
        const mistakeRate = Math.round((perf.mistakes / perf.totalAttempts) * 100);
        const country = countriesMap.get(cca3.toUpperCase());

        if (country && (mistakeRate >= 35 || perf.mistakes >= 2)) {
          blindSpots.push({
            cca3: country.cca3,
            nameEs: country.nameEs,
            capital: country.capital,
            continent: country.continent,
            continentEs: country.continentEs,
            flagSvg: country.flagSvg,
            mistakeRate,
            totalAttempts: perf.totalAttempts,
            mistakes: perf.mistakes,
            confusionWith: perf.confusionCountries
          });
        }
      }
    }

    // Ordenar de mayor a menor gravedad (más fallos y mayor porcentaje)
    return blindSpots.sort((a, b) => (b.mistakes * 2 + b.mistakeRate) - (a.mistakes * 2 + a.mistakeRate));
  }

  /**
   * Obtiene la lista de códigos cca3 prioritarios para "Práctica Focalizada"
   */
  getFocusedPracticeCountries(
    userStats: UserStatsState,
    allCountries: Country[],
    limit: number = 10
  ): Country[] {
    const countriesMap = new Map(allCountries.map(c => [c.cca3.toUpperCase(), c]));
    const blindSpots = this.identifyBlindSpots(userStats, countriesMap);

    if (blindSpots.length >= 4) {
      return blindSpots
        .slice(0, limit)
        .map(b => countriesMap.get(b.cca3.toUpperCase()))
        .filter((c): c is Country => Boolean(c));
    }

    // Si aún no tiene suficientes puntos ciegos registrados, seleccionar países menos practicados
    const playedCodes = new Set(Object.keys(userStats.countries));
    const unplayedOrWeak = allCountries
      .slice()
      .sort((a, b) => {
        const perfA = userStats.countries[a.cca3.toUpperCase()];
        const perfB = userStats.countries[b.cca3.toUpperCase()];
        const attemptsA = perfA ? perfA.totalAttempts : 0;
        const attemptsB = perfB ? perfB.totalAttempts : 0;
        return attemptsA - attemptsB;
      });

    return unplayedOrWeak.slice(0, limit);
  }

  /**
   * Genera consejos diagnósticos contextuales basados en el rendimiento
   */
  generateSmartAdvice(
    userStats: UserStatsState,
    continentalMastery: ContinentMastery[],
    blindSpots: BlindSpotItem[]
  ): TutorAdvice[] {
    const advice: TutorAdvice[] = [];

    // Caso 1: Nuevo usuario
    if (userStats.totalGamesPlayed === 0) {
      advice.push({
        id: 'welcome_advice',
        type: 'recommendation',
        title: '¡Bienvenido a tu Academia Geográfica!',
        description: 'Empieza con una sesión de "Click & Find" en Europa o América para calibrar tu nivel inicial y desbloquear diagnósticos.',
        actionLabel: 'Iniciar primera partida'
      });
      return advice;
    }

    // Caso 2: Puntos ciegos críticos detectados
    if (blindSpots.length > 0) {
      const worst = blindSpots.slice(0, 3).map(b => b.nameEs).join(', ');
      advice.push({
        id: 'blind_spots_critical',
        type: 'warning',
        title: 'Puntos ciegos prioritarios detectados',
        description: `Hemos detectado dificultades recurrentes en: ${worst}. Te recomendamos hacer una sesión focalizada para reforzar su ubicación y banderas.`,
        targetCountries: blindSpots.slice(0, 5).map(b => b.cca3),
        actionLabel: 'Practicar puntos ciegos'
      });
    }

    // Caso 3: Desbalance continental
    const sortedByAccuracy = [...continentalMastery]
      .filter(m => m.totalAttempts > 0)
      .sort((a, b) => b.accuracyPercentage - a.accuracyPercentage);

    if (sortedByAccuracy.length >= 2) {
      const best = sortedByAccuracy[0];
      const worst = sortedByAccuracy[sortedByAccuracy.length - 1];

      if (best.accuracyPercentage - worst.accuracyPercentage >= 25 && worst.totalAttempts >= 3) {
        advice.push({
          id: 'continental_imbalance',
          type: 'recommendation',
          title: `Desbalance detectado: ${best.continentEs} vs ${worst.continentEs}`,
          description: `Tienes dominada ${best.continentEs} con un ${best.accuracyPercentage}% de acierto, pero en ${worst.continentEs} tu precisión es del ${worst.accuracyPercentage}%. Enfócate en esta región para equilibrar tu dominio global.`,
          targetContinent: worst.continent,
          actionLabel: `Explorar ${worst.continentEs}`
        });
      }
    }

    // Caso 4: Región sin explorar
    const unplayedContinents = continentalMastery.filter(m => m.totalAttempts === 0);
    if (unplayedContinents.length > 0) {
      const target = unplayedContinents[0];
      advice.push({
        id: `unplayed_${target.continent}`,
        type: 'tip',
        title: `Territorio inexplorado: ${target.continentEs}`,
        description: `Aún no has jugado partidas en ${target.continentEs}. ¡Atrévete a descubrir sus ${target.totalCountries} países y capitales!`,
        targetContinent: target.continent,
        actionLabel: `Jugar ${target.continentEs}`
      });
    }

    // Caso 5: Elogio de racha alta o precisión sobresaliente
    if (userStats.bestStreak >= 8) {
      advice.push({
        id: 'streak_praise',
        type: 'praise',
        title: `¡Memoria prodigiosa! Racha récord de ${userStats.bestStreak} aciertos`,
        description: 'Tu velocidad de reconocimiento visual está en nivel avanzado. Intenta el modo "Escribir" para poner a prueba tu ortografía de capitales.',
        actionLabel: 'Probar Modo Escribir'
      });
    }

    // Consejo nemotécnico estándar si no hay suficientes
    if (advice.length < 3) {
      advice.push({
        id: 'geography_tip_baltics',
        type: 'tip',
        title: 'Consejo nemotécnico: Países Bálticos',
        description: 'Recuerda el orden de Norte a Sur de los países bálticos por orden alfabético: Estonia (E), Letonia / Latvia (L), Lituania (L-i).',
      });
      advice.push({
        id: 'geography_tip_guineas',
        type: 'tip',
        title: 'Consejo nemotécnico: Las Guineas de África',
        description: 'En el Golfo de Guinea: Guinea y Guinea-Bisáu están en África Occidental, mientras que Guinea Ecuatorial está junto a Gabón y Camerún.',
      });
    }

    return advice;
  }
}

export const tutorEngine = new TutorEngine();
