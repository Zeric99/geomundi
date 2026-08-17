/**
 * Normaliza una cadena de texto para comparación geográfica tolerante:
 * - Convierte a minúsculas
 * - Elimina acentos y diacríticos (á -> a, é -> e, etc.)
 * - Remueve caracteres no alfanuméricos redundantes
 * - Colapsa espacios múltiples
 */
export function normalizeGeoString(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quita tildes y diacríticos
    .replace(/[.,\-_/()]/g, ' ')     // Reemplaza puntuación por espacios
    .replace(/\s+/g, ' ')            // Colapsa espacios
    .trim();
}

/**
 * Calcula la distancia de Levenshtein entre dos cadenas
 */
export function levenshteinDistance(a: string, b: string): number {
  const an = a ? a.length : 0;
  const bn = b ? b.length : 0;
  if (an === 0) return bn;
  if (bn === 0) return an;

  const matrix = Array.from({ length: bn + 1 }, (_, i) => [i]);
  for (let j = 0; j <= an; j++) matrix[0][j] = j;

  for (let i = 1; i <= bn; i++) {
    for (let j = 1; j <= an; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // sustitución
          matrix[i][j - 1] + 1,     // inserción
          matrix[i - 1][j] + 1      // borrado
        );
      }
    }
  }

  return matrix[bn][an];
}

/**
 * Comprueba si la respuesta del usuario coincide con el país esperado
 * Soporta variantes, nombres en español, nombres en inglés y altSpellings.
 */
export function checkCountryNameMatch(
  userInput: string,
  targetCountry: {
    nameEs: string;
    nameEn?: string;
    officialNameEs?: string;
    altSpellings?: string[];
  }
): { matched: boolean; isClose: boolean; matchedName?: string } {
  const cleanInput = normalizeGeoString(userInput);
  if (!cleanInput) return { matched: false, isClose: false };

  const candidates: string[] = [
    targetCountry.nameEs,
    targetCountry.nameEn || '',
    targetCountry.officialNameEs || '',
    ...(targetCountry.altSpellings || [])
  ].filter(Boolean);

  // 1. Coincidencia exacta normalizada
  for (const candidate of candidates) {
    const cleanCandidate = normalizeGeoString(candidate);
    if (cleanInput === cleanCandidate) {
      return { matched: true, isClose: false, matchedName: candidate };
    }
  }

  // 2. Coincidencia fuzzy / tolerancia a pequeñas erratas (1 o 2 letras según longitud)
  for (const candidate of candidates) {
    const cleanCandidate = normalizeGeoString(candidate);
    const dist = levenshteinDistance(cleanInput, cleanCandidate);
    const maxAllowedDist = cleanCandidate.length > 7 ? 2 : cleanCandidate.length > 4 ? 1 : 0;

    if (dist <= maxAllowedDist && dist > 0) {
      return { matched: true, isClose: true, matchedName: candidate };
    }
  }

  return { matched: false, isClose: false };
}
