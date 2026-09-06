export interface ShareOptions {
  score: number;
  maxScore: number;
  gameTitle: string;
  results?: Array<{ distanceKm?: number; score?: number; userSuccess?: boolean }>;
  totalDistanceKm?: number;
}

export const WEBSITE_URL = 'https://zeric99.github.io/geomundi/';

/**
 * Genera una representación con emojis estilo Wordle/MapTap del resultado de la partida
 */
export function generateEmojiGrid(
  results: Array<{ distanceKm?: number; score?: number; userSuccess?: boolean }>
): string {
  return results
    .map(r => {
      if (r.distanceKm !== undefined) {
        if (r.distanceKm <= 25) return '🎯';
        if (r.distanceKm <= 150) return '🟩';
        if (r.distanceKm <= 500) return '🟨';
        if (r.distanceKm <= 1500) return '🟧';
        return '🟥';
      }
      return r.userSuccess ? '🟩' : '🟥';
    })
    .join(' ');
}

/**
 * Genera el texto copiable listo para redes sociales y mensajería
 */
export function generateShareText(options: ShareOptions): string {
  const { score, maxScore, gameTitle, results, totalDistanceKm } = options;

  let text = `🎯 GeoStrike - ${gameTitle}\n`;
  text += `Puntuación: ${score.toLocaleString()} / ${maxScore.toLocaleString()} pts\n`;

  if (results && results.length > 0) {
    text += `${generateEmojiGrid(results)}\n`;
  }

  if (totalDistanceKm !== undefined && totalDistanceKm > 0) {
    text += `📏 Distancia total: ${totalDistanceKm.toLocaleString()} km\n`;
  }

  text += `🌐 ${WEBSITE_URL}`;
  return text;
}

/**
 * Copia el texto al portapapeles y retorna true si tuvo éxito
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (e) {}

  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (e) {
    return false;
  }
}
