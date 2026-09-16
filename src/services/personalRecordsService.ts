import { GameMode, GameSummary } from '../types/game';
import { Continent } from '../types/country';
import { supabase } from '../lib/supabase';

export interface PersonalRecord {
  id?: string;
  userId?: string;
  mode: GameMode;
  continent: Continent;
  correctCount: number;
  totalQuestions: number;
  accuracyPct: number;
  timeSeconds: number;
  score: number;
  date: string;
}

const STORAGE_KEY = 'GEOMUNDI_PERSONAL_RECORDS_V1';

export class PersonalRecordsService {
  private memoryCache: Record<string, PersonalRecord> | null = null;

  private makeKey(mode: GameMode, continent: Continent): string {
    return `${mode}_${continent}`;
  }

  /**
   * Obtiene todos los récords personales almacenados en local (y memoria)
   */
  getAllRecords(): Record<string, PersonalRecord> {
    if (this.memoryCache) return this.memoryCache;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        this.memoryCache = JSON.parse(raw);
        return this.memoryCache || {};
      }
    } catch (e) {
      console.warn('Error leyendo récords personales de localStorage:', e);
    }
    this.memoryCache = {};
    return {};
  }

  /**
   * Obtiene el récord personal para un modo y continente específico
   */
  getRecord(mode: GameMode, continent: Continent): PersonalRecord | null {
    const records = this.getAllRecords();
    const key = this.makeKey(mode, continent);
    return records[key] || null;
  }

  /**
   * Evalúa si una partida finalizada supone un nuevo récord personal.
   * Aplica a partidas con 20 o más países, o maratones completas de continentes/mundo.
   */
  async evaluateAndSave(
    summary: GameSummary,
    durationSeconds: number,
    userId?: string
  ): Promise<{ isNewRecord: boolean; previous?: PersonalRecord; current: PersonalRecord } | null> {
    // Si la partida tiene menos de 15 preguntas, no se considera récord de mapa completo
    if (!summary.results || summary.results.length < 15) {
      return null;
    }

    const totalQuestions = summary.results.length;
    const correctCount = summary.results.filter(r => r.firstTry || r.userSuccess).length;
    const accuracyPct = Math.round((correctCount / totalQuestions) * 100 * 10) / 10;

    const existing = this.getRecord(summary.mode, summary.continent);
    const key = this.makeKey(summary.mode, summary.continent);

    let isNew = false;

    if (!existing) {
      isNew = true;
    } else {
      // Es nuevo récord si:
      // 1. Acertó más países
      // 2. O acertó los mismos pero con mejor precisión o en menor tiempo
      if (correctCount > existing.correctCount) {
        isNew = true;
      } else if (correctCount === existing.correctCount) {
        if (accuracyPct > existing.accuracyPct) {
          isNew = true;
        } else if (accuracyPct === existing.accuracyPct && durationSeconds > 0 && durationSeconds < existing.timeSeconds) {
          isNew = true;
        }
      }
    }

    if (!isNew && existing) {
      return { isNewRecord: false, previous: existing, current: existing };
    }

    const newRecord: PersonalRecord = {
      mode: summary.mode,
      continent: summary.continent,
      correctCount,
      totalQuestions,
      accuracyPct,
      timeSeconds: durationSeconds,
      score: summary.score,
      date: new Date().toISOString()
    };

    // Guardar en local
    const all = this.getAllRecords();
    all[key] = newRecord;
    this.memoryCache = all;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    } catch (e) {}

    // Sincronizar con Supabase si está logueado
    if (userId && supabase) {
      try {
        await supabase.from('personal_records').upsert({
          user_id: userId,
          game_mode: summary.mode,
          continent: summary.continent,
          correct_count: correctCount,
          total_countries: totalQuestions,
          accuracy_pct: accuracyPct,
          time_seconds: durationSeconds,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,game_mode,continent' });
      } catch (err) {
        console.warn('No se pudo guardar récord en Supabase:', err);
      }
    }

    return {
      isNewRecord: true,
      previous: existing || undefined,
      current: newRecord
    };
  }

  /**
   * Carga y sincroniza los récords desde Supabase para el usuario actual
   */
  async syncFromSupabase(userId: string): Promise<Record<string, PersonalRecord>> {
    if (!supabase || !userId) return this.getAllRecords();
    try {
      const { data, error } = await supabase
        .from('personal_records')
        .select('*')
        .eq('user_id', userId);

      if (!error && data && data.length > 0) {
        const local = this.getAllRecords();
        for (const row of data) {
          const key = this.makeKey(row.game_mode, row.continent);
          local[key] = {
            id: row.id,
            userId: row.user_id,
            mode: row.game_mode,
            continent: row.continent,
            correctCount: row.correct_count,
            totalQuestions: row.total_countries,
            accuracyPct: Number(row.accuracy_pct),
            timeSeconds: row.time_seconds,
            score: 0,
            date: row.updated_at
          };
        }
        this.memoryCache = local;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(local));
      }
    } catch (e) {
      console.warn('Error sincronizando récords desde Supabase:', e);
    }
    return this.getAllRecords();
  }
  /**
   * Resetea todos los récords en memoria y en localStorage
   */
  resetRecords(): void {
    this.memoryCache = {};
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  }
}

export const personalRecordsService = new PersonalRecordsService();
