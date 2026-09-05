import { countriesService } from '../services/countriesService';

/**
 * Calcula la distancia ortodrómica entre dos coordenadas geográficas en kilómetros.
 * Fórmula de Haversine: d = 2R * asin(sqrt(sin^2(dLat/2) + cos(lat1)*cos(lat2)*sin^2(dLon/2)))
 */
export function calculateHaversineDistance(
  coord1: [number, number], // [lng, lat]
  coord2: [number, number]  // [lng, lat]
): number {
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;

  const R = 6371; // Radio medio de la Tierra en kilómetros
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c); // Distancia redondeada a km
}

/**
 * Calcula la puntuación en base a la distancia y las reglas de suelos por país/continente.
 * Fórmula exponencial: Score = 1000 * e^(-distancia / 2000)
 */
export function calculatePinpointScore(
  distanceKm: number,
  isSameCountry: boolean,
  isSameContinent: boolean
): { score: number; badgeTitle: string } {
  const MAX_SCORE = 1000;

  // Menos de 25 km es considerado excelente
  if (distanceKm <= 25) {
    const perfectScore = Math.max(980, Math.round(MAX_SCORE - distanceKm * 0.8));
    return {
      score: perfectScore,
      badgeTitle: '🎯 Francotirador'
    };
  }

  // Decaimiento exponencial
  let score = Math.round(MAX_SCORE * Math.exp(-distanceKm / 2000));

  // Regla de Suelos (Scoring Floors) de MapTap
  if (isSameCountry && score < 25) {
    score = 25; // Suelo de país
  } else if (isSameContinent && score < 10) {
    score = 10; // Suelo de continente
  }

  score = Math.min(MAX_SCORE, Math.max(0, score));

  // Asignar título de logro / insignia según precisión
  let badgeTitle = '✈️ A otro continente';
  if (distanceKm <= 150) {
    badgeTitle = '🌟 Impresionante';
  } else if (distanceKm <= 500) {
    badgeTitle = '📍 Muy Cerca';
  } else if (distanceKm <= 1500) {
    badgeTitle = '🧭 En la Región';
  } else if (isSameContinent) {
    badgeTitle = '🌍 Mismo Continente';
  }

  return { score, badgeTitle };
}

/**
 * Comprueba si unas coordenadas [lng, lat] pertenecen al país objetivo o a su continente
 */
export function checkCountryAndContinentMatch(
  clickedCoords: [number, number],
  targetCca3: string,
  targetContinent: string
): { isSameCountry: boolean; isSameContinent: boolean } {
  const targetCountry = countriesService.getCountryByCode(targetCca3);
  
  let isSameCountry = false;
  let isSameContinent = false;

  if (targetCountry) {
    if (targetCountry.continent === targetContinent) {
      isSameContinent = true;
    }
  }

  return { isSameCountry, isSameContinent };
}
