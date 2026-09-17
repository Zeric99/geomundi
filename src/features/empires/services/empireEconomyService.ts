import { empireStorageService } from './empireStorageService';
import { dailyChallengeService } from '../../../services/dailyChallengeService';

const ECONOMY_STORAGE_KEY = 'geostrike_empire_economy_v1';

export interface DailyEconomyState {
  dateStr: string; // YYYY-MM-DD
  rankedPlayedToday: number;
  unclaimedWarLoot: number; // Monedas acumuladas de rankeds
  dailyChallengeClaimed: boolean; // Si ya cobró los 650 🪙 del desafío diario
  taxChestClaimed: boolean; // Si ya cobró los 150 🪙 del baúl de impuestos
  recentLootHistory: Array<{
    id: string;
    timestamp: number;
    description: string;
    amount: number;
  }>;
}

function getTodayStr(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

class EmpireEconomyService {
  private state: DailyEconomyState | null = null;
  private listeners: Set<(state: DailyEconomyState) => void> = new Set();

  constructor() {
    this.loadState();
  }

  public subscribe(listener: (state: DailyEconomyState) => void): () => void {
    this.listeners.add(listener);
    if (this.state) listener(this.state);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    if (!this.state) return;
    this.saveState();
    this.listeners.forEach(l => l(this.state!));
  }

  private loadState(): void {
    const today = getTodayStr();
    try {
      const raw = localStorage.getItem(ECONOMY_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as DailyEconomyState;
        if (parsed.dateStr === today) {
          this.state = parsed;
          return;
        }
      }
    } catch (e) {
      console.warn('[EmpireEconomyService] Error cargando economía diaria:', e);
    }

    // Nuevo día natural: reset de cupo diario y baúles
    this.state = {
      dateStr: today,
      rankedPlayedToday: 0,
      unclaimedWarLoot: 0,
      dailyChallengeClaimed: false,
      taxChestClaimed: false,
      recentLootHistory: []
    };
    this.saveState();
  }

  private saveState(): void {
    if (!this.state) return;
    try {
      localStorage.setItem(ECONOMY_STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('[EmpireEconomyService] Error guardando economía:', e);
    }
  }

  public getState(): DailyEconomyState {
    const today = getTodayStr();
    if (!this.state || this.state.dateStr !== today) {
      this.loadState();
    }
    return this.state!;
  }

  /**
   * Comprueba si el Desafío Diario de hoy fue completado en el juego principal
   */
  public isDailyChallengeCompletedToday(): boolean {
    try {
      const streak = dailyChallengeService.getStreakState();
      const today = getTodayStr();
      return Boolean(streak.history[today]?.completed);
    } catch {
      return false;
    }
  }

  /**
   * Registra el resultado de una partida Ranked 1v1 y añade monedas al buzón
   * GDD:
   * - Partidas 1 a 5: Victoria = +75 (o +125 si racha), Derrota = +25
   * - Partidas 6 a 15: Victoria = +20
   * - Partidas 16+: Victoria = +5
   */
  public recordRankedMatch(isWin: boolean, streak: number = 0): { lootEarned: number; matchNumber: number } {
    const state = this.getState();
    state.rankedPlayedToday += 1;
    const matchNum = state.rankedPlayedToday;

    let loot = 0;
    let desc = '';

    if (matchNum <= 5) {
      if (isWin) {
        loot = streak >= 3 ? 125 : 75;
        desc = `Victoria Ranked #${matchNum} (${streak >= 3 ? 'Racha activa' : 'Normal'})`;
      } else {
        loot = 25;
        desc = `Derrota consolación #${matchNum}`;
      }
    } else if (matchNum <= 15) {
      loot = isWin ? 20 : 5;
      desc = `Duelo #${matchNum} (Rendimiento moderado)`;
    } else {
      loot = isWin ? 5 : 0;
      desc = `Duelo #${matchNum} (Grind intensivo)`;
    }

    // Bonificación de Bancos Offshore / Paraísos Fiscales (+15% de botín por banco insular)
    const emp = empireStorageService.getEmpire();
    const bankCount = Object.values(emp.islandSpecializations || {}).filter(s => s === 'fiscal_paradise').length;
    if (bankCount > 0 && loot > 0) {
      const bonusPct = bankCount * 15;
      const extraLoot = Math.max(1, Math.round(loot * (bonusPct / 100)));
      loot += extraLoot;
      desc += ` (+${bonusPct}% por ${bankCount} Banco${bankCount > 1 ? 's' : ''} Offshore 🏦)`;
    }

    state.unclaimedWarLoot += loot;
    state.recentLootHistory.unshift({
      id: `loot_${Date.now()}`,
      timestamp: Date.now(),
      description: desc,
      amount: loot
    });

    if (state.recentLootHistory.length > 20) {
      state.recentLootHistory = state.recentLootHistory.slice(0, 20);
    }

    this.notify();
    return { lootEarned: loot, matchNumber: matchNum };
  }

  /**
   * Cobra todo el botín acumulado en el Buzón de Guerra
   */
  public claimWarLoot(): number {
    const state = this.getState();
    const amount = state.unclaimedWarLoot;
    if (amount <= 0) return 0;

    empireStorageService.addCoins(amount);
    state.unclaimedWarLoot = 0;
    this.notify();
    return amount;
  }

  /**
   * Reclama el gran presupuesto del Desafío Diario (650 monedas)
   */
  public claimDailyChallenge(): boolean {
    const state = this.getState();
    if (state.dailyChallengeClaimed) return false;
    if (!this.isDailyChallengeCompletedToday()) return false;

    const reward = 650;
    empireStorageService.addCoins(reward);
    state.dailyChallengeClaimed = true;
    this.notify();
    return true;
  }

  /**
   * Reclama el Baúl de Impuestos Nacional (150 monedas base + 15% por cada Banco Offshore)
   * Condición GDD: Haber jugado las 5 partidas rankeds del día
   */
  public claimTaxChest(): boolean {
    const state = this.getState();
    if (state.taxChestClaimed) return false;
    if (state.rankedPlayedToday < 5) return false;

    const emp = empireStorageService.getEmpire();
    const bankCount = Object.values(emp.islandSpecializations || {}).filter(s => s === 'fiscal_paradise').length;
    let reward = 150;
    if (bankCount > 0) {
      reward += Math.round(reward * (bankCount * 0.15));
    }

    empireStorageService.addCoins(reward);
    state.taxChestClaimed = true;
    this.notify();
    return true;
  }

  /**
   * Total de monedas pendientes listas para ser reclamadas hoy
   */
  public getTotalPendingCoins(): number {
    const state = this.getState();
    let total = state.unclaimedWarLoot;
    if (!state.dailyChallengeClaimed && this.isDailyChallengeCompletedToday()) {
      total += 650;
    }
    if (!state.taxChestClaimed && state.rankedPlayedToday >= 5) {
      total += 150;
    }
    return total;
  }

  /**
   * Simula un duelo ganado (para pruebas rápidas en desarrollo)
   */
  public simulateRankedWin(): void {
    this.recordRankedMatch(true, 1);
  }
}

export const empireEconomyService = new EmpireEconomyService();
