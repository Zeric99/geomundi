import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Country, CountryMapStatus, Continent } from '../../types/country';
import { WorldMap } from '../map/WorldMap';
import { useAudioFeedback } from '../../hooks/useAudioFeedback';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Search, 
  Trophy, 
  Flame, 
  Sparkles, 
  RotateCcw, 
  Target,
  ArrowRight,
  Filter,
  Brain
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { GEEK_TERRITORIES } from '../../data/fallbackCountries';

interface ListSelectModeProps {
  countries: Country[];
  continent: Continent;
  onQuit: () => void;
}

type CountryResultStatus = 'pending' | 'correct' | 'second_try' | 'wrong';

interface CountryItemState {
  country: Country;
  status: CountryResultStatus;
  attempts: number;
}

export const ListSelectMode: React.FC<ListSelectModeProps> = ({
  countries,
  continent,
  onQuit
}) => {
  const { playCorrectSound, playWrongSound, playVictorySound } = useAudioFeedback();

  // Opción Modo Friki (incluye dependencias, islas especiales y estados con reconocimiento limitado)
  const [isGeekMode, setIsGeekMode] = useState<boolean>(false);

  // Filtrar países y territorios según continente y modo friki
  const baseCountries = useMemo(() => {
    let list = [...countries];
    if (isGeekMode) {
      list = [...list, ...GEEK_TERRITORIES];
    }
    if (continent !== 'World') {
      list = list.filter(c => c.continent === continent);
    }
    return list.sort((a, b) => a.nameEs.localeCompare(b.nameEs));
  }, [countries, continent, isGeekMode]);

  // Estado de cada país en el modo lista
  const [itemsState, setItemsState] = useState<Record<string, CountryItemState>>(() => {
    const initial: Record<string, CountryItemState> = {};
    baseCountries.forEach(c => {
      initial[c.cca3.toUpperCase()] = {
        country: c,
        status: 'pending',
        attempts: 0
      };
    });
    return initial;
  });

  // Reiniciar estado de lista cuando se alterna el modo friki o cambia el continente
  useEffect(() => {
    const nextState: Record<string, CountryItemState> = {};
    baseCountries.forEach(c => {
      nextState[c.cca3.toUpperCase()] = {
        country: c,
        status: 'pending',
        attempts: 0
      };
    });
    setItemsState(nextState);
    setSelectedCountryCode(null);
    setPulsingFailedCountryCode(null);
  }, [baseCountries]);

  const [selectedCountryCode, setSelectedCountryCode] = useState<string | null>(null);
  const [pulsingFailedCountryCode, setPulsingFailedCountryCode] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'correct' | 'wrong'>('all');
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [bannerMessage, setBannerMessage] = useState<{ text: string; type: 'info' | 'success' | 'warning' | 'error' } | null>(null);

  // Mapear estados a los colores del mapa (correct=verde, hint=amarillo, wrong=rojo)
  const mapCountryStatuses = useMemo(() => {
    const statuses: Record<string, CountryMapStatus> = {};
    Object.entries(itemsState).forEach(([cca3, item]) => {
      if (item.status === 'correct') {
        statuses[cca3] = 'correct'; // Verde
      } else if (item.status === 'second_try') {
        statuses[cca3] = 'hint';    // Amarillo / Ámbar
      } else if (item.status === 'wrong') {
        statuses[cca3] = 'wrong';   // Rojo
      }
    });
    return statuses;
  }, [itemsState]);

  // Contadores de progreso
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

  // País seleccionado actualmente como objetivo
  const targetCountry = useMemo(() => {
    if (!selectedCountryCode) return null;
    return itemsState[selectedCountryCode]?.country || null;
  }, [selectedCountryCode, itemsState]);

  // Comprobar victoria/completado
  useEffect(() => {
    if (counts.total > 0 && counts.completed === counts.total) {
      playVictorySound();
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (e) {}
    }
  }, [counts.completed, counts.total, playVictorySound]);

  // Manejar clic en país del mapa
  const handleMapCountryClick = useCallback((clickedCountry: Country, clickedCca3: string) => {
    const upperClicked = clickedCca3.toUpperCase();
    const clickedItem = itemsState[upperClicked];

    // Si el usuario hace clic en un país ya resuelto (verde, amarillo o rojo), le mostramos su nombre para orientarse
    if (clickedItem && clickedItem.status !== 'pending') {
      const statusLabel = 
        clickedItem.status === 'correct' ? '✅ Acertado a la 1ª' :
        clickedItem.status === 'second_try' ? '⚡ Acertado a la 2ª' : '❌ Fallado';
      setBannerMessage({
        text: `📍 ${clickedCountry.flagEmoji} ${clickedCountry.nameEs} (Capital: ${clickedCountry.capital}) · ${statusLabel}`,
        type: 'info'
      });
      return;
    }

    // Si no hay país seleccionado de la lista, avisamos al usuario que elija uno
    if (!selectedCountryCode) {
      if (clickedItem && clickedItem.status === 'pending') {
        setPulsingFailedCountryCode(null);
        setSelectedCountryCode(upperClicked);
        setBannerMessage({
          text: `Has seleccionado ${clickedCountry.nameEs}. ¡Busca y confírmalo en el mapa!`,
          type: 'info'
        });
      } else {
        setBannerMessage({
          text: `Haz clic en un país de la lista superior para seleccionarlo como objetivo.`,
          type: 'info'
        });
      }
      return;
    }

    const currentTarget = itemsState[selectedCountryCode];
    if (!currentTarget || currentTarget.status !== 'pending') {
      return;
    }

    const isMatch = upperClicked === selectedCountryCode;

    if (isMatch) {
      // --- ACIERTO ---
      setPulsingFailedCountryCode(null);
      if (currentTarget.attempts === 0) {
        // Acierto al 1er intento -> VERDE
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
            status: 'correct' as CountryResultStatus,
            attempts: 1
          }
        };
        setItemsState(updated);
        setBannerMessage({
          text: `¡Excelente! Has ubicado ${currentTarget.country.nameEs} a la primera. Elige el siguiente país de la lista.`,
          type: 'success'
        });
        setSelectedCountryCode(null); // Tras acertar, limpiar para que el usuario elija
      } else {
        // Acierto al 2º intento -> AMARILLO
        setScore(prev => prev + 50);
        playCorrectSound(1);

        const updated = {
          ...itemsState,
          [selectedCountryCode]: {
            ...currentTarget,
            status: 'second_try' as CountryResultStatus,
            attempts: 2
          }
        };
        setItemsState(updated);
        setBannerMessage({
          text: `¡Bien! Has ubicado ${currentTarget.country.nameEs} al segundo intento. Elige el siguiente país.`,
          type: 'warning'
        });
        setSelectedCountryCode(null); // Tras acertar, limpiar para que el usuario elija
      }
    } else {
      // --- FALLO ---
      playWrongSound();
      setStreak(0);

      if (currentTarget.attempts === 0) {
        // Primer fallo: mantener el mismo país seleccionado sin dar pistas de qué país se ha pulsado
        setItemsState(prev => ({
          ...prev,
          [selectedCountryCode]: {
            ...currentTarget,
            attempts: 1
          }
        }));
        setBannerMessage({
          text: `❌ Ubicación incorrecta. Te queda 1 intento.`,
          type: 'warning'
        });
      } else {
        // Segundo fallo -> ROJO (fallo definitivo)
        // El mapa hace parpadeo y enfoca la cámara al país para aprender dónde está
        const failedCode = selectedCountryCode;
        const updated = {
          ...itemsState,
          [failedCode]: {
            ...currentTarget,
            status: 'wrong' as CountryResultStatus,
            attempts: 2
          }
        };
        setItemsState(updated);
        setPulsingFailedCountryCode(failedCode);
        setBannerMessage({
          text: `❌ Agotaste los 2 intentos para ${currentTarget.country.nameEs}. Ubicación resaltada en el mapa. Selecciona otro país de la lista.`,
          type: 'error'
        });
        setSelectedCountryCode(null); // DESPUÉS DE UN FALLO NO SE SELECCIONA NADA SOLO
      }
    }
  }, [
    selectedCountryCode, 
    itemsState, 
    streak, 
    maxStreak, 
    playCorrectSound, 
    playWrongSound
  ]);

  // Lista filtrada para la visualización de los chips superiores
  const filteredCountryItems = useMemo(() => {
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
        const matchesName = c.nameEs.toLowerCase().includes(query);
        const matchesCapital = c.capital.toLowerCase().includes(query);
        const matchesAlt = c.altSpellings ? c.altSpellings.some(s => s.toLowerCase().includes(query)) : false;
        return matchesName || matchesCapital || matchesAlt;
      }

      return true;
    });
  }, [baseCountries, itemsState, activeFilter, searchQuery]);

  return (
    <div className="flex flex-col h-full gap-4 max-w-7xl mx-auto w-full px-2 sm:px-4">
      {/* 1. Barra de Estadísticas y Puntuación */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-slate-800 shadow-xl">
        {/* Progreso Total y Botón Modo Friki */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xl">📋</span>
            <div>
              <h3 className="text-sm font-bold text-white leading-tight">
                Modo Lista y Ubicación
              </h3>
              <p className="text-[11px] text-slate-400">
                {isGeekMode ? '🧠 Modo Friki Activo (+40 Territorios)' : 'Países soberanos del atlas mundial'}
              </p>
            </div>
          </div>

          {/* Toggle Modo Friki */}
          <button
            onClick={() => {
              setIsGeekMode(prev => !prev);
              setSelectedCountryCode(null);
              setPulsingFailedCountryCode(null);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border shadow-sm active:scale-95 ${
              isGeekMode
                ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 border-purple-400 text-white shadow-glow-purple ring-1 ring-purple-400/50'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-purple-300 hover:text-purple-200'
            }`}
          >
            <Brain className="w-3.5 h-3.5 text-purple-300" />
            <span>Modo Friki (+40 Territorios)</span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black ${
              isGeekMode ? 'bg-emerald-400 text-slate-950' : 'bg-slate-700 text-slate-400'
            }`}>
              {isGeekMode ? 'ON' : 'OFF'}
            </span>
          </button>
        </div>

        {/* Resumen de Resultados en vivo */}
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          {/* Verde: 1er intento */}
          <div className="flex items-center gap-1.5 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-1 rounded-xl text-emerald-300 text-xs font-bold shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{counts.correct}</span>
            <span className="text-[10px] opacity-70 hidden sm:inline">1º Intento</span>
          </div>

          {/* Amarillo: 2º intento */}
          <div className="flex items-center gap-1.5 bg-amber-950/40 border border-amber-800/40 px-2.5 py-1 rounded-xl text-amber-300 text-xs font-bold shadow-sm">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>{counts.secondTry}</span>
            <span className="text-[10px] opacity-70 hidden sm:inline">2º Intento</span>
          </div>

          {/* Rojo: Fallados */}
          <div className="flex items-center gap-1.5 bg-rose-950/40 border border-rose-800/40 px-2.5 py-1 rounded-xl text-rose-300 text-xs font-bold shadow-sm">
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>{counts.wrong}</span>
            <span className="text-[10px] opacity-70 hidden sm:inline">Fallos</span>
          </div>

          {/* Racha */}
          {streak > 1 && (
            <div className="flex items-center gap-1 bg-amber-500/20 border border-amber-500/40 px-2.5 py-1 rounded-xl text-amber-400 font-bold text-xs">
              <Flame className="w-4 h-4 fill-amber-400 animate-pulse" />
              <span>x{streak}</span>
            </div>
          )}

          {/* Puntos */}
          <div className="text-right pl-2 border-l border-slate-800">
            <span className="text-[9px] uppercase text-slate-400 font-bold tracking-wider block">Puntos</span>
            <span className="text-base font-black text-emerald-400 font-mono tracking-tight">{score}</span>
          </div>

          <button
            onClick={onQuit}
            className="text-xs text-slate-400 hover:text-slate-200 px-2.5 py-1 rounded-lg hover:bg-slate-800 transition"
          >
            Salir
          </button>
        </div>
      </div>

      {/* 2. Banner Objetivo Activo */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-indigo-500/30 shadow-lg flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/20 border border-indigo-400/30 rounded-xl text-indigo-300">
            <Target className="w-5 h-5 animate-pulse" />
          </div>

          {targetCountry ? (
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400">
                  Objetivo Actual
                </span>
                {itemsState[targetCountry.cca3.toUpperCase()]?.attempts === 1 && (
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                    Último Intento
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xl">{targetCountry.flagEmoji}</span>
                <h2 className="text-lg sm:text-xl font-black text-white">
                  {targetCountry.nameEs}
                </h2>
                <span className="text-xs text-slate-400 hidden sm:inline">
                  (Capital: {targetCountry.capital})
                </span>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-300">
                {counts.completed === counts.total 
                  ? '🎉 ¡Enhorabuena! Has completado todos los países y territorios de la lista.'
                  : '👆 Haz clic en cualquier país de la lista de abajo para seleccionarlo'}
              </h2>
            </div>
          )}
        </div>

        {/* Mensaje de retroalimentación temporal */}
        {bannerMessage && (
          <div className={`text-xs px-3 py-1.5 rounded-xl border font-semibold ${
            bannerMessage.type === 'success' ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300' :
            bannerMessage.type === 'warning' ? 'bg-amber-950/50 border-amber-500/50 text-amber-300' :
            bannerMessage.type === 'error' ? 'bg-rose-950/50 border-rose-500/50 text-rose-300' :
            'bg-indigo-950/50 border-indigo-500/50 text-indigo-300'
          }`}>
            {bannerMessage.text}
          </div>
        )}
      </div>

      {/* 3. Bandeja Superior / Mosaico de Países con Filtros */}
      <div className="bg-slate-900/90 backdrop-blur-md p-3 rounded-2xl border border-slate-800 shadow-xl space-y-2.5">
        {/* Barra de Filtros y Búsqueda */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                activeFilter === 'all'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-glow-cyan'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Todos ({counts.total})
            </button>
            <button
              onClick={() => setActiveFilter('pending')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                activeFilter === 'pending'
                  ? 'bg-slate-200 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Pendientes ({counts.pending})
            </button>
            <button
              onClick={() => setActiveFilter('correct')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                activeFilter === 'correct'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-emerald-400 hover:bg-slate-700'
              }`}
            >
              Acertados ({counts.correct + counts.secondTry})
            </button>
            <button
              onClick={() => setActiveFilter('wrong')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                activeFilter === 'wrong'
                  ? 'bg-rose-500 text-white font-bold'
                  : 'bg-slate-800 text-rose-400 hover:bg-slate-700'
              }`}
            >
              Fallados ({counts.wrong})
            </button>
          </div>

          {/* Campo de Búsqueda */}
          <div className="relative flex-1 sm:max-w-xs min-w-[180px]">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar país o territorio..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950/70 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
            />
          </div>
        </div>

        {/* Mosaico de Chips de Países y Territorios */}
        <div className="max-h-44 sm:max-h-52 overflow-y-auto pr-1 flex flex-wrap gap-1.5 custom-scrollbar">
          {filteredCountryItems.map((country) => {
            const cca3 = country.cca3.toUpperCase();
            const item = itemsState[cca3];
            const isSelected = selectedCountryCode === cca3;
            const status = item?.status || 'pending';

            // Estilos según el estado solicitado
            let chipStyle = 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-slate-300';
            let icon = null;

            if (isSelected) {
              chipStyle = 'bg-purple-600/30 border-purple-400 text-purple-200 ring-2 ring-purple-500 shadow-glow-purple font-bold';
            } else if (status === 'correct') {
              chipStyle = 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 font-bold';
              icon = <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />;
            } else if (status === 'second_try') {
              chipStyle = 'bg-amber-950/40 border-amber-500/50 text-amber-300 font-bold';
              icon = <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />;
            } else if (status === 'wrong') {
              chipStyle = 'bg-rose-950/40 border-rose-600/50 text-rose-400 font-semibold line-through opacity-75';
              icon = <XCircle className="w-3 h-3 text-rose-400 shrink-0" />;
            }

            return (
              <button
                key={cca3}
                onClick={() => {
                  if (status === 'pending') {
                    setPulsingFailedCountryCode(null);
                    setSelectedCountryCode(cca3);
                  }
                }}
                disabled={status !== 'pending'}
                className={`px-2.5 py-1 rounded-xl border text-xs transition-all flex items-center gap-1.5 active:scale-95 ${chipStyle} ${
                  status !== 'pending' ? 'cursor-default' : 'cursor-pointer'
                }`}
              >
                <span>{country.flagEmoji}</span>
                <span>{country.nameEs}</span>
                {icon}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Mapa Interactivo Principal (Sin revelar la ubicación antes de hacer clic, con radar para país fallado) */}
      <div className="relative flex-1 min-h-[460px] rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
        <WorldMap
          countryStatuses={mapCountryStatuses}
          selectedCountryCode={null}
          targetCountryCode={null}
          pulsingCountryCode={pulsingFailedCountryCode}
          continent={continent}
          onCountryClick={handleMapCountryClick}
          interactive={true}
          enableTooltip={false}
        />
      </div>
    </div>
  );
};
