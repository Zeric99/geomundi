import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Country, CountryMapStatus, Continent } from '../../types/country';
import { WorldMap } from '../map/WorldMap';
import { useAudioFeedback } from '../../hooks/useAudioFeedback';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Search, 
  Flame, 
  Landmark,
  ArrowRight,
  Zap,
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { GEEK_TERRITORIES } from '../../data/fallbackCountries';
import { GameSummary, GameRoundResult } from '../../types/game';
import { GameOverModal } from './GameOverModal';

interface CapitalsListModeProps {
  countries: Country[];
  continent: Continent;
  totalQuestions?: number;
  onFinishGame?: (summary: GameSummary) => void;
  onQuit: () => void;
  isGeekMode?: boolean;
  onOpenFlagModal?: (country: Country) => void;
}

type CapitalResultStatus = 'pending' | 'correct' | 'second_try' | 'wrong';

interface CapitalItemState {
  country: Country;
  capitalName: string;
  status: CapitalResultStatus;
  attempts: number;
  timeSpentMs?: number;
}

export const CapitalsListMode: React.FC<CapitalsListModeProps> = ({
  countries,
  continent,
  totalQuestions = 999,
  onFinishGame,
  onQuit,
  isGeekMode = false,
  onOpenFlagModal
}) => {
  const { playCorrectSound, playWrongSound, playVictorySound } = useAudioFeedback();

  // Filtrar y preparar países con capital válida
  const baseCountries = useMemo(() => {
    let list = [...countries];
    if (isGeekMode) {
      list = [...list, ...GEEK_TERRITORIES];
    }
    if (continent !== 'World') {
      list = list.filter(c => c.continent === continent);
    }
    // Solo países con capital definida
    list = list.filter(c => c.capital && c.capital !== 'N/A' && c.capital.trim() !== '');

    // Aplicar límite si no es "todos"
    const isAll = totalQuestions >= 190 || totalQuestions === 999 || totalQuestions === 0;
    if (!isAll && totalQuestions < list.length) {
      list = [...list].sort(() => Math.random() - 0.5).slice(0, totalQuestions);
    }

    // Ordenar alfabéticamente por nombre de la capital para fácil navegación
    return list.sort((a, b) => a.capital.localeCompare(b.capital, 'es', { sensitivity: 'base' }));
  }, [countries, continent, isGeekMode, totalQuestions]);

  // Estado de cada capital
  const [itemsState, setItemsState] = useState<Record<string, CapitalItemState>>(() => {
    const initial: Record<string, CapitalItemState> = {};
    baseCountries.forEach(c => {
      initial[c.cca3.toUpperCase()] = {
        country: c,
        capitalName: c.capital,
        status: 'pending',
        attempts: 0
      };
    });
    return initial;
  });

  // Reiniciar estado si cambia el pool base
  useEffect(() => {
    const nextState: Record<string, CapitalItemState> = {};
    baseCountries.forEach(c => {
      nextState[c.cca3.toUpperCase()] = {
        country: c,
        capitalName: c.capital,
        status: 'pending',
        attempts: 0
      };
    });
    setItemsState(nextState);
    setSelectedCountryCode(null);
    setPulsingFailedCountryCode(null);
    setTappedPreviewCountry(null);
  }, [baseCountries]);

  const [selectedCountryCode, setSelectedCountryCode] = useState<string | null>(null);
  const [pulsingFailedCountryCode, setPulsingFailedCountryCode] = useState<string | null>(null);
  const [tappedPreviewCountry, setTappedPreviewCountry] = useState<Country | null>(null);

  // Modo Auto-avance (selecciona la siguiente capital pendiente al acertar)
  const [isAutoAdvance, setIsAutoAdvance] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('geomundi_capitals_autoadvance');
      return saved !== null ? saved === 'true' : true;
    } catch (e) {
      return true;
    }
  });

  const toggleAutoAdvance = useCallback(() => {
    setIsAutoAdvance(prev => {
      const next = !prev;
      try {
        localStorage.setItem('geomundi_capitals_autoadvance', String(next));
      } catch (e) {}
      return next;
    });
  }, []);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'correct' | 'wrong'>('all');
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [bannerMessage, setBannerMessage] = useState<{ text: string; type: 'info' | 'success' | 'warning' | 'error' } | null>(null);
  const [finishedSummary, setFinishedSummary] = useState<GameSummary | null>(null);

  const startTimeRef = useRef<number>(Date.now());
  const hasReportedRef = useRef<boolean>(false);

  // Mapear estados a los colores del mapa (correct=verde, second_try=amarillo, wrong=rojo)
  const mapCountryStatuses = useMemo(() => {
    const statuses: Record<string, CountryMapStatus> = {};
    Object.entries(itemsState).forEach(([cca3, item]) => {
      if (item.status === 'correct') {
        statuses[cca3] = 'correct';
      } else if (item.status === 'second_try') {
        statuses[cca3] = 'hint';
      } else if (item.status === 'wrong') {
        statuses[cca3] = 'wrong';
      }
    });
    return statuses;
  }, [itemsState]);

  // Contadores
  const counts = useMemo(() => {
    let correct = 0;
    let secondTry = 0;
    let wrong = 0;
    let pending = 0;

    Object.values(itemsState).forEach(item => {
      if (item.status === 'correct') correct++;
      else if (item.status === 'second_try') secondTry++;
      else if (item.status === 'wrong') wrong++;
      else pending++;
    });

    const total = baseCountries.length;
    const completed = correct + secondTry + wrong;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { correct, secondTry, wrong, pending, total, completed, percent };
  }, [itemsState, baseCountries]);

  // Capital/País objetivo actual
  const targetItem = useMemo(() => {
    if (!selectedCountryCode) return null;
    return itemsState[selectedCountryCode] || null;
  }, [selectedCountryCode, itemsState]);

  // Obtener la siguiente capital pendiente
  const getNextPendingCountryCode = useCallback((currentCode: string | null, excludeCode?: string): string | null => {
    const pending = baseCountries.filter(c => {
      const upper = c.cca3.toUpperCase();
      if (excludeCode && upper === excludeCode.toUpperCase()) return false;
      return itemsState[upper]?.status === 'pending';
    });

    if (pending.length === 0) return null;
    if (!currentCode) return pending[0].cca3.toUpperCase();

    const currentIndex = pending.findIndex(c => c.cca3.toUpperCase() === currentCode.toUpperCase());
    if (currentIndex === -1 || currentIndex >= pending.length - 1) {
      return pending[0].cca3.toUpperCase();
    }
    return pending[currentIndex + 1].cca3.toUpperCase();
  }, [baseCountries, itemsState]);

  // Auto-seleccionar la primera capital pendiente al iniciar si auto-avance está activo
  useEffect(() => {
    if (isAutoAdvance && !selectedCountryCode && baseCountries.length > 0) {
      const first = baseCountries.find(c => itemsState[c.cca3.toUpperCase()]?.status === 'pending');
      if (first) {
        setSelectedCountryCode(first.cca3.toUpperCase());
      }
    }
  }, [isAutoAdvance, selectedCountryCode, baseCountries, itemsState]);

  // Botón Saltar al siguiente
  const handleSkipTarget = useCallback(() => {
    const nextCode = getNextPendingCountryCode(selectedCountryCode);
    if (nextCode && nextCode !== selectedCountryCode) {
      setSelectedCountryCode(nextCode);
      setTappedPreviewCountry(null);
      const nextItem = itemsState[nextCode];
      if (nextItem) {
        setBannerMessage({
          text: `⏭️ Saltado. Ahora busca el país de la capital: ${nextItem.capitalName}`,
          type: 'info'
        });
      }
    }
  }, [selectedCountryCode, getNextPendingCountryCode, itemsState]);

  // Finalizar partida
  const finishSession = useCallback(() => {
    if (hasReportedRef.current) return;
    hasReportedRef.current = true;

    const durationSeconds = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
    const results: GameRoundResult[] = baseCountries.map(c => {
      const item = itemsState[c.cca3.toUpperCase()];
      const status = item ? item.status : 'pending';
      const isSuccess = status === 'correct' || status === 'second_try';
      const isFirstTry = status === 'correct';

      return {
        question: {
          id: `capital_${c.cca3}`,
          country: c,
          questionType: 'capital',
          promptText: `¿Qué país tiene por capital ${c.capital}?`,
          hintUsed: status === 'second_try',
          attempts: item ? item.attempts : 0
        },
        userSuccess: isSuccess,
        firstTry: isFirstTry,
        attemptsUsed: item ? item.attempts : 1,
        timeSpentMs: item?.timeSpentMs || 2000,
        pointsEarned: isFirstTry ? 100 : (status === 'second_try' ? 50 : 0)
      };
    });

    const accuracy = counts.total > 0 ? Math.round((counts.correct / counts.total) * 100) : 0;

    const summary: GameSummary = {
      mode: 'capitals-list',
      continent,
      totalQuestions: counts.total,
      correctCount: counts.correct + counts.secondTry,
      firstTryCount: counts.correct,
      wrongCount: counts.wrong,
      score,
      maxStreak,
      accuracy,
      durationSeconds,
      playedAt: new Date().toISOString(),
      results
    };

    setFinishedSummary(summary);
    if (onFinishGame) {
      onFinishGame(summary);
    }
  }, [baseCountries, itemsState, counts, continent, score, maxStreak, onFinishGame]);

  // Detección de completado
  useEffect(() => {
    if (counts.total > 0 && counts.completed === counts.total && !hasReportedRef.current) {
      playVictorySound();
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (e) {}
      finishSession();
    }
  }, [counts.completed, counts.total, playVictorySound, finishSession]);

  // Manejador de Clic en el Mapa (con soporte de confirmación por doble toque en pantallas táctiles)
  const handleMapCountryClick = useCallback((clickedCountry: Country, clickedCca3: string) => {
    const upperClicked = clickedCca3.toUpperCase();
    const clickedItem = itemsState[upperClicked];

    // Si ya está resuelto, mostramos información pedagógica
    if (clickedItem && clickedItem.status !== 'pending') {
      const statusLabel = 
        clickedItem.status === 'correct' ? '✅ Acertada a la 1ª' :
        clickedItem.status === 'second_try' ? '⚡ Acertada a la 2ª' : '❌ Fallada';
      setBannerMessage({
        text: `📍 ${clickedCountry.flagEmoji} ${clickedCountry.nameEs} (Capital: ${clickedCountry.capital}) · ${statusLabel}`,
        type: 'info'
      });
      return;
    }

    if (!selectedCountryCode) {
      setBannerMessage({
        text: `👆 Primero selecciona una capital en la bandeja superior para buscar su país en el mapa.`,
        type: 'info'
      });
      return;
    }

    // Comprobación de móvil/pantalla táctil para doble toque
    const isTouchDevice = typeof window !== 'undefined' && (
      window.matchMedia('(pointer: coarse)').matches || 
      (navigator.maxTouchPoints && navigator.maxTouchPoints > 0)
    );

    if (isTouchDevice) {
      // Si es el primer toque en este país, se muestra como previsualización
      if (tappedPreviewCountry?.cca3.toUpperCase() !== upperClicked) {
        setTappedPreviewCountry(clickedCountry);
        setBannerMessage({
          text: `📍 ${clickedCountry.flagEmoji} Has marcado ${clickedCountry.nameEs}. ¡Toca de nuevo para confirmar respuesta!`,
          type: 'info'
        });
        return;
      }
      // Segundo toque consecutivo en el mismo país: se procede con la validación
      setTappedPreviewCountry(null);
    }

    const currentTarget = itemsState[selectedCountryCode];
    if (!currentTarget || currentTarget.status !== 'pending') {
      return;
    }

    const isMatch = upperClicked === selectedCountryCode;

    if (isMatch) {
      // --- ACIERTO ---
      setPulsingFailedCountryCode(null);
      setTappedPreviewCountry(null);

      if (currentTarget.attempts === 0) {
        // Acierto al primer intento
        const newStreak = streak + 1;
        const newMaxStreak = Math.max(maxStreak, newStreak);
        const pts = 100 * (1 + Math.min(streak * 0.1, 1.5));
        setScore(prev => Math.round(prev + pts));
        setStreak(newStreak);
        setMaxStreak(newMaxStreak);
        playCorrectSound(1 + newStreak * 0.1);

        const updated = {
          ...itemsState,
          [selectedCountryCode]: {
            ...currentTarget,
            status: 'correct' as CapitalResultStatus,
            attempts: 1
          }
        };
        setItemsState(updated);

        const nextCode = isAutoAdvance ? getNextPendingCountryCode(selectedCountryCode, selectedCountryCode) : null;
        if (isAutoAdvance && nextCode) {
          setSelectedCountryCode(nextCode);
          const nextItem = itemsState[nextCode];
          setBannerMessage({
            text: `¡Correcto! ${currentTarget.capitalName} es la capital de ${currentTarget.country.nameEs}. Siguiente: ${nextItem ? nextItem.capitalName : ''}`,
            type: 'success'
          });
        } else {
          setSelectedCountryCode(null);
          setBannerMessage({
            text: `¡Correcto! ${currentTarget.capitalName} es la capital de ${currentTarget.country.nameEs}. Elige la siguiente capital.`,
            type: 'success'
          });
        }
      } else {
        // Acierto al segundo intento
        setScore(prev => prev + 50);
        playCorrectSound(1);

        const updated = {
          ...itemsState,
          [selectedCountryCode]: {
            ...currentTarget,
            status: 'second_try' as CapitalResultStatus,
            attempts: 2
          }
        };
        setItemsState(updated);

        const nextCode = isAutoAdvance ? getNextPendingCountryCode(selectedCountryCode, selectedCountryCode) : null;
        if (isAutoAdvance && nextCode) {
          setSelectedCountryCode(nextCode);
          const nextItem = itemsState[nextCode];
          setBannerMessage({
            text: `¡Bien! ${currentTarget.capitalName} es la capital de ${currentTarget.country.nameEs} (2º intento). Siguiente: ${nextItem ? nextItem.capitalName : ''}`,
            type: 'warning'
          });
        } else {
          setSelectedCountryCode(null);
          setBannerMessage({
            text: `¡Bien! ${currentTarget.capitalName} es la capital de ${currentTarget.country.nameEs}. Elige la siguiente capital.`,
            type: 'warning'
          });
        }
      }
    } else {
      // --- FALLO ---
      playWrongSound();
      setStreak(0);

      if (currentTarget.attempts === 0) {
        // Primer intento fallido
        setItemsState(prev => ({
          ...prev,
          [selectedCountryCode]: {
            ...currentTarget,
            attempts: 1
          }
        }));
        setBannerMessage({
          text: `❌ Casi. ${currentTarget.capitalName} NO es la capital de ${clickedCountry.nameEs}. Te queda 1 intento.`,
          type: 'warning'
        });
      } else {
        // Segundo intento fallido (fallo definitivo)
        const failedCode = selectedCountryCode;
        const updated = {
          ...itemsState,
          [failedCode]: {
            ...currentTarget,
            status: 'wrong' as CapitalResultStatus,
            attempts: 2
          }
        };
        setItemsState(updated);
        setPulsingFailedCountryCode(failedCode);
        setBannerMessage({
          text: `❌ Agotaste los intentos. La capital de ${currentTarget.country.nameEs} es ${currentTarget.capitalName}. Ubicación resaltada en el mapa.`,
          type: 'error'
        });
        setSelectedCountryCode(null);
      }
    }
  }, [
    selectedCountryCode,
    itemsState,
    streak,
    maxStreak,
    playCorrectSound,
    playWrongSound,
    isAutoAdvance,
    getNextPendingCountryCode,
    tappedPreviewCountry
  ]);

  // Filtrar lista de capitales según búsqueda y pestaña activa
  const filteredItems = useMemo(() => {
    return baseCountries.filter(c => {
      const item = itemsState[c.cca3.toUpperCase()];
      if (!item) return false;

      // Filtro de estado
      if (activeFilter === 'pending' && item.status !== 'pending') return false;
      if (activeFilter === 'correct' && item.status !== 'correct' && item.status !== 'second_try') return false;
      if (activeFilter === 'wrong' && item.status !== 'wrong') return false;

      // Filtro de búsqueda
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesCapital = item.capitalName.toLowerCase().includes(query);
        const matchesCountry = c.nameEs.toLowerCase().includes(query);
        return matchesCapital || matchesCountry;
      }

      return true;
    });
  }, [baseCountries, itemsState, activeFilter, searchQuery]);

  return (
    <div className="flex flex-col h-full min-h-0 gap-1.5 max-w-7xl mx-auto w-full px-1 sm:px-2 overflow-hidden">
      {/* 1. Barra Superior Compacta: Objetivo Activo + Estadísticas */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-[#18181B] px-3.5 py-2 rounded-xl border border-zinc-800 shadow-card-subtle shrink-0">
        {/* Objetivo Activo o Instrucción */}
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-zinc-800 border border-zinc-700 rounded-lg text-amber-400 shrink-0">
            <Landmark className="w-4 h-4" />
          </div>

          {targetItem ? (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-medium uppercase tracking-wider text-amber-400">
                Capital Objetivo:
              </span>
              <span className="text-base sm:text-lg font-display font-bold text-zinc-100 tracking-wide bg-zinc-900 px-2.5 py-0.5 rounded-lg border border-zinc-700">
                🏛️ {targetItem.capitalName}
              </span>

              {targetItem.attempts === 1 && (
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-950/50 text-amber-300 border border-amber-800/60 font-medium">
                  2º Intento
                </span>
              )}

              {/* Botón de Saltar */}
              {counts.pending > 1 && (
                <button
                  type="button"
                  onClick={handleSkipTarget}
                  className="ml-1.5 px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-300 hover:text-white rounded-md text-[11px] font-sans font-medium flex items-center gap-1 transition border border-zinc-700 shadow-sm"
                  title="Pasar a la siguiente capital sin penalizar"
                >
                  <span>Saltar</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          ) : (
            <div className="text-xs sm:text-sm font-sans font-medium text-zinc-300">
              {counts.completed === counts.total 
                ? '🎉 ¡Todas las capitales completadas!'
                : '👆 Elige una capital en la lista superior para ubicar su país'}
            </div>
          )}
        </div>

        {/* Resumen de Resultados + Puntos + Salir */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Verde: 1er intento */}
          <div className="flex items-center gap-1 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded-md text-emerald-300 text-xs font-mono shadow-sm">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>{counts.correct}</span>
            <span className="text-[9px] opacity-70 hidden sm:inline">1º</span>
          </div>

          {/* Amarillo: 2º intento */}
          <div className="flex items-center gap-1 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded-md text-amber-300 text-xs font-mono shadow-sm">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            <span>{counts.secondTry}</span>
            <span className="text-[9px] opacity-70 hidden sm:inline">2º</span>
          </div>

          {/* Rojo: Fallados */}
          <div className="flex items-center gap-1 bg-rose-950/40 border border-rose-800/40 px-2 py-0.5 rounded-md text-rose-300 text-xs font-mono shadow-sm">
            <XCircle className="w-3 h-3 text-rose-400" />
            <span>{counts.wrong}</span>
            <span className="text-[9px] opacity-70 hidden sm:inline">Fallos</span>
          </div>

          {/* Racha */}
          {streak > 1 && (
            <div className="flex items-center gap-1 bg-amber-950/40 border border-amber-800/50 px-2 py-0.5 rounded-md text-amber-300 font-mono text-xs">
              <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>x{streak}</span>
            </div>
          )}

          {/* Puntos */}
          <div className="text-right pl-2 border-l border-zinc-800 font-mono">
            <span className="text-xs sm:text-sm font-normal text-emerald-400">{score} pts</span>
          </div>

          <button
            onClick={onQuit}
            className="text-xs text-zinc-400 hover:text-white px-2 py-1 rounded-md hover:bg-zinc-800 transition font-mono"
          >
            Salir
          </button>
        </div>
      </div>

      {/* Mensaje de retroalimentación temporal */}
      {bannerMessage && (
        <div className={`text-xs px-3 py-1 rounded-lg border font-sans animate-in fade-in duration-150 ${
          bannerMessage.type === 'success' ? 'bg-emerald-950/80 border-emerald-800/60 text-emerald-300' :
          bannerMessage.type === 'warning' ? 'bg-amber-950/80 border-amber-800/60 text-amber-300' :
          bannerMessage.type === 'error' ? 'bg-rose-950/80 border-rose-800/60 text-rose-300' :
          'bg-indigo-950/80 border-indigo-800/60 text-indigo-300'
        }`}>
          {bannerMessage.text}
        </div>
      )}

      {/* 2. Bandeja Compacta de Chips de Capitales */}
      <div className="bg-[#18181B]/95 backdrop-blur-md px-3 py-2 rounded-xl border border-zinc-800 shadow-card-subtle space-y-1.5 shrink-0">
        {/* Barra de Filtros y Búsqueda */}
        <div className="flex flex-wrap items-center justify-between gap-1.5">
          <div className="flex items-center gap-1 overflow-x-auto font-sans">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition ${
                activeFilter === 'all'
                  ? 'bg-amber-600 text-white font-medium shadow-sm'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              Todas ({counts.total})
            </button>
            <button
              onClick={() => setActiveFilter('pending')}
              className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition ${
                activeFilter === 'pending'
                  ? 'bg-zinc-200 text-zinc-950 font-medium'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              Pendientes ({counts.pending})
            </button>
            <button
              onClick={() => setActiveFilter('correct')}
              className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition ${
                activeFilter === 'correct'
                  ? 'bg-emerald-600 text-white font-medium'
                  : 'bg-zinc-800 text-emerald-400 hover:bg-zinc-700'
              }`}
            >
              Acertadas ({counts.correct + counts.secondTry})
            </button>
            <button
              onClick={() => setActiveFilter('wrong')}
              className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition ${
                activeFilter === 'wrong'
                  ? 'bg-rose-600 text-white font-medium'
                  : 'bg-zinc-800 text-rose-400 hover:bg-zinc-700'
              }`}
            >
              Falladas ({counts.wrong})
            </button>

            {/* Conmutador de Auto-avance */}
            <button
              type="button"
              onClick={toggleAutoAdvance}
              className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold transition flex items-center gap-1 border ml-1 ${
                isAutoAdvance
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                  : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-zinc-200'
              }`}
              title="Al acertar, selecciona automáticamente la siguiente capital de la lista"
            >
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Auto: {isAutoAdvance ? 'ON' : 'OFF'}</span>
            </button>
          </div>

          {/* Campo de Búsqueda */}
          <div className="relative flex-1 sm:max-w-xs min-w-[130px]">
            <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar capital o país..."
              className="w-full pl-7 pr-2.5 py-0.5 bg-[#121214] border border-zinc-700 rounded-md text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition font-sans"
            />
          </div>
        </div>

        {/* Mosaico de Chips de Capitales */}
        <div className="max-h-[52px] sm:max-h-[60px] overflow-y-auto pr-1 flex flex-wrap gap-1 custom-scrollbar font-sans">
          {filteredItems.map((country) => {
            const cca3 = country.cca3.toUpperCase();
            const item = itemsState[cca3];
            const isSelected = selectedCountryCode === cca3;
            const status = item ? item.status : 'pending';

            return (
              <button
                key={cca3}
                onClick={() => {
                  setSelectedCountryCode(cca3);
                  setTappedPreviewCountry(null);
                  setPulsingFailedCountryCode(null);
                  setBannerMessage({
                    text: `🏛️ Capital seleccionada: ${country.capital}. Encuentra su país en el mapa.`,
                    type: 'info'
                  });
                }}
                className={`px-2 py-0.5 rounded text-xs transition flex items-center gap-1 font-medium border ${
                  isSelected
                    ? 'bg-amber-500 text-zinc-950 font-bold border-amber-400 shadow-sm ring-1 ring-amber-300'
                    : status === 'correct'
                    ? 'bg-emerald-950/70 border-emerald-800/80 text-emerald-300 opacity-70'
                    : status === 'second_try'
                    ? 'bg-amber-950/70 border-amber-800/80 text-amber-300 opacity-70'
                    : status === 'wrong'
                    ? 'bg-rose-950/70 border-rose-800/80 text-rose-400 opacity-70'
                    : 'bg-[#121214] border-zinc-700/80 text-zinc-200 hover:border-amber-500/70 hover:bg-zinc-800'
                }`}
              >
                <span>{country.capital}</span>
                {status === 'correct' && <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />}
                {status === 'second_try' && <AlertTriangle className="w-2.5 h-2.5 text-amber-400" />}
                {status === 'wrong' && <XCircle className="w-2.5 h-2.5 text-rose-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Mapa Mundial con Hover de Nombres de Países (sin revelar capitales) */}
      <div className="flex-1 min-h-0 relative rounded-2xl overflow-hidden border border-zinc-800 bg-[#0B101B]">
        <WorldMap
          countryStatuses={mapCountryStatuses}
          selectedCountryCode={selectedCountryCode}
          pulsingCountryCode={pulsingFailedCountryCode}
          onCountryClick={handleMapCountryClick}
          continent={continent}
          tooltipMode="country-only"
          enableTooltip={true}
          isGeekMode={isGeekMode}
          className="w-full h-full"
        />

        {/* Indicador flotante táctil en móvil cuando se hace el 1er toque */}
        {tappedPreviewCountry && (
          <div className="absolute bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 z-40 bg-zinc-950/95 border border-cyan-500/80 px-4 py-2 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in zoom-in-95 pointer-events-none">
            <span className="text-xl">{tappedPreviewCountry.flagEmoji}</span>
            <div>
              <div className="text-[10px] uppercase font-mono font-bold text-cyan-400">
                País seleccionado
              </div>
              <div className="text-sm font-bold text-white">
                {tappedPreviewCountry.nameEs}
              </div>
            </div>
            <span className="text-[10px] font-mono text-zinc-400 pl-2 border-l border-zinc-800">
              Toca de nuevo para confirmar
            </span>
          </div>
        )}
      </div>

      {/* Modal de Fin de Partida */}
      {finishedSummary && (
        <GameOverModal
          summary={finishedSummary}
          onGoToTutor={() => onQuit()}
          onPlayAgain={() => {
            setFinishedSummary(null);
            hasReportedRef.current = false;
            startTimeRef.current = Date.now();
            const reset: Record<string, CapitalItemState> = {};
            baseCountries.forEach(c => {
              reset[c.cca3.toUpperCase()] = {
                country: c,
                capitalName: c.capital,
                status: 'pending',
                attempts: 0
              };
            });
            setItemsState(reset);
            setSelectedCountryCode(isAutoAdvance && baseCountries.length > 0 ? baseCountries[0].cca3.toUpperCase() : null);
            setPulsingFailedCountryCode(null);
            setScore(0);
            setStreak(0);
            setMaxStreak(0);
          }}
          onReturnToMenu={onQuit}
        />
      )}
    </div>
  );
};
