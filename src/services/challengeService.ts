import { GameMode, QuestionType } from '../types/game';

export interface ChallengePayload {
  version: number;
  creatorName: string;
  creatorScore: number;
  creatorAccuracy: number;
  mode: GameMode;
  continent: string;
  questionType: QuestionType;
  countryCodes: string[]; // cca3 codes
  createdAt: string;
}

export class ChallengeService {
  /**
   * Codifica un reto en una cadena Base64URL segura
   */
  encodeChallenge(payload: Omit<ChallengePayload, 'version' | 'createdAt'>): string {
    const fullPayload: ChallengePayload = {
      ...payload,
      version: 1,
      createdAt: new Date().toISOString()
    };

    try {
      const jsonStr = JSON.stringify(fullPayload);
      const base64 = btoa(encodeURIComponent(jsonStr));
      return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    } catch (e) {
      console.error('Error codificando el reto:', e);
      return '';
    }
  }

  /**
   * Decodifica la cadena del reto recibida por URL o parámetro
   */
  decodeChallenge(code: string): ChallengePayload | null {
    try {
      let base64 = code.replace(/-/g, '+').replace(/_/g, '/');
      while (base64.length % 4) {
        base64 += '=';
      }
      const jsonStr = decodeURIComponent(atob(base64));
      const parsed = JSON.parse(jsonStr);

      if (parsed && Array.isArray(parsed.countryCodes) && parsed.countryCodes.length > 0) {
        return parsed as ChallengePayload;
      }
      return null;
    } catch (e) {
      console.error('Error decodificando el reto:', e);
      return null;
    }
  }

  /**
   * Genera el enlace completo para retar a un amigo
   */
  generateChallengeUrl(code: string): string {
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?challenge=${code}`;
  }

  /**
   * Genera el mensaje para compartir en WhatsApp o redes sociales
   */
  generateShareSnippet(creatorName: string, creatorScore: number, url: string): string {
    return `⚔️ ¡${creatorName || 'Un amigo'} te ha desafiado en MapTap!
🏆 Puntuación a superar: ${creatorScore} pts

¿Puedes superarlo? Juega gratis aquí:
${url}`;
  }
}

export const challengeService = new ChallengeService();
