export interface ShareOptions {
  score: number;
  maxScore: number;
  gameTitle: string;
  results?: Array<{ distanceKm?: number; score?: number; userSuccess?: boolean }>;
  totalDistanceKm?: number;
}

export interface DailyShareOptions {
  dateStr: string;
  correctCount: number;
  totalQuestions: number;
  accuracy: number;
  score: number;
  durationSeconds: number;
  stageResults: boolean[];
}

export interface DuelShareOptions {
  modeName: string;
  playerScore: number;
  rivalScore: number;
  isWinner: boolean;
  isTie: boolean;
  rivalName: string;
  durationSeconds: number;
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
 * Genera texto viral específico para el Reto Diario estilo Wordle
 */
export function generateDailyShareText(options: DailyShareOptions): string {
  const { dateStr, correctCount, totalQuestions, accuracy, score, durationSeconds, stageResults } = options;
  const emojiGrid = stageResults.map(r => r ? '🟩' : '🟥').join('');

  return `🌍 GeoStrike Reto Diario #${dateStr}
📊 Aciertos: ${correctCount}/${totalQuestions} (${accuracy}%)
${emojiGrid}
⏱️ ${durationSeconds}s | 🏆 ${score.toLocaleString()} pts
¿Podrás superarme?
${WEBSITE_URL}`;
}

/**
 * Genera texto para compartir el resultado de un duelo 1v1
 */
export function generateDuelShareText(options: DuelShareOptions): string {
  const { modeName, playerScore, rivalScore, isWinner, isTie, rivalName, durationSeconds } = options;
  const resultHeader = isWinner
    ? `🏆 ¡Victoria épica en GeoStrike!`
    : isTie
    ? `🤝 ¡Empate reñido en GeoStrike!`
    : `⚔️ Duelo disputado en GeoStrike`;

  return `${resultHeader}
🎮 Modo: ${modeName}
Tú: ${playerScore} pts vs ${rivalName}: ${rivalScore} pts
⏱️ Duración: ${durationSeconds}s
¡Desafíame tú también!
${WEBSITE_URL}`;
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

/**
 * Comparte directamente en WhatsApp
 */
export function shareToWhatsApp(text: string): void {
  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Comparte directamente en Twitter / X
 */
export function shareToTwitter(text: string): void {
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Verifica si el navegador soporta compartir de forma nativa
 */
export function canNativeShare(): boolean {
  return typeof navigator !== 'undefined' && Boolean(navigator.share);
}

/**
 * Llama a la API nativa de compartir del dispositivo móvil
 */
export async function shareNative(data: { title: string; text: string; url?: string }): Promise<boolean> {
  if (canNativeShare()) {
    try {
      await navigator.share({
        title: data.title,
        text: data.text,
        url: data.url || WEBSITE_URL
      });
      return true;
    } catch (e) {
      // Si el usuario canceló el diálogo no hacemos nada
      return false;
    }
  }
  return copyToClipboard(data.text);
}
