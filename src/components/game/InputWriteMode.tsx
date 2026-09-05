import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Type, 
  Send, 
  SkipForward, 
  Lightbulb, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Flame, 
  Trophy, 
  ZoomIn, 
  Sparkles, 
  ArrowRight,
  HelpCircle,
  Clock,
  Layers,
  MapPin
} from 'lucide-react';
import { Continent, Country, CountryMapStatus } from '../../types/country';
import { GameSummary, GameRoundResult } from '../../types/game';
import { WorldMap } from '../map/WorldMap';
import { useAudioFeedback } from '../../hooks/useAudioFeedback';
import { checkCountryNameMatch } from '../../services/stringMatcher';
import confetti from 'canvas-confetti';

interface InputWriteModeProps {
  initialCountries: Country[];
  onFinishGame: (summary: GameSummary) => void;
  onQuit: () => void;
  isGeekMode?: boolean;
  continent?: Continent;
  onOpenFlagModal?: (country: Country) => void;
}

interface WriteAttemptRecord {
  country: Country;
  roundSolved: number;
  attempts: number;
  solved: boolean;
  timeSpentMs: number;
}

export const InputWriteMode: React.FC<InputWriteModeProps> = ({
  initialCountries,
  onFinishGame,
  onQuit,
  isGeekMode = false,
  continent = 'World',
  onOpenFlagModal
}) => {
  const { playCorrectSound, playWrongSound, playHintSound, playVictorySound } = useAudioFeedback();

  // Cola activa de países para la ronda actual
  const [currentQueue, setCurrentQueue] = useState<Country[]>([]);
  // Cola de países saltados que pasan a la 2ª ronda
  const [skippedQueue, setSkippedQueue] = useState<Country[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [roundNumber, setRoundNumber] = useState<number>(1);

  // Formulario y estado de evaluación
  const [inputValue, setInputValue] = useState<string>('');
  const [countryStatuses, setCountryStatuses] = useState<Record<string, CountryMapStatus>>({});
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [activeHint, setActiveHint] = useState<string | null>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [solvedCount, setSolvedCount] = useState<number>(0);

  // Registro de resultados
  const [gameRecords, setGameRecords] = useState<Record<string, WriteAttemptRecord>>({});

  // Modales y Toasts
  const [showRoundTransitionModal, setShowRoundTransitionModal] = useState<boolean>(false);
  const [feedbackToast, setFeedbackToast] = useState<{ 
    text: string; 
    type: 'correct' | 'wrong' | 'skip' | 'close'; 
    country?: Country 
  } | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const questionStartTimeRef = useRef<number>(Date.now());

  // Inicializar partida
  useEffect(() => {
    const shuffled = [...initialCountries].sort(() => 0.5 - Math.random());
    setCurrentQueue(shuffled);
    setSkippedQueue([]);
    setCurrentIndex(0);
    setRoundNumber(1);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setSolvedCount(0);
    setCountryStatuses({});
    setInputValue('');
    startTimeRef.current = Date.now();
    questionStartTimeRef.current = Date.now();
  }, [initialCountries]);

  const currentCountry = currentQueue[currentIndex] || null;
  const totalUniqueCountries = initialCountries.length;

  // Auto-enfocar el input cuando cambie el país actual
  useEffect(() => {
    setInputValue('');
    setActiveHint(null);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 150);
  }, [currentIndex, roundNumber]);

  // Acción: Pasar / Saltar país para la siguiente ronda
  const handleSkipCountry = () => {
    if (!currentCountry || isEvaluating) return;

    playHintSound();
    const skipped = currentCountry;

    setSkippedQueue(prev => {
      if (!prev.some(c => c.cca3 === skipped.cca3)) {
        return [...prev, skipped];
      }
      return prev;
    });

    setFeedbackToast({
      text: `"${skipped.nameEs}" pospuesto para la 2ª Ronda ⏭️`,
      type: 'skip',
      country: skipped
    });

    setTimeout(() => {
      setFeedbackToast(null);
    }, 1800);

    advanceNext();
  };

  // Avanzar a la siguiente pregunta o ronda
  const advanceNext = () => {
    setActiveHint(null);
    setIsEvaluating(false);
    setInputValue('');
    questionStartTimeRef.current = Date.now();

    const nextIdx = currentIndex + 1;
    if (nextIdx < currentQueue.length) {
      setCurrentIndex(nextIdx);
    } else {
      if (skippedQueue.length > 0) {
        setShowRoundTransitionModal(true);
      } else {
        finishSession();
      }
    }
  };

  // Envío de respuesta escrita
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentCountry || isEvaluating) return;

    const trimmed = inputValue.trim();
    if (!trimmed) {
      // Si pulsa Enter con el campo vacío, permitir pasar
      handleSkipCountry();
      return;
    }

    setIsEvaluating(true);
    const timeSpent = Date.now() - questionStartTimeRef.current;
    const matchResult = checkCountryNameMatch(trimmed, {
      nameEs: currentCountry.nameEs,
      nameEn: currentCountry.nameEn,
      officialNameEs: currentCountry.officialNameEs,
      altSpellings: currentCountry.altSpellings
    });

    const upper = currentCountry.cca3.toUpperCase();
    const prevRecord = gameRecords[upper] || {
      country: currentCountry,
      roundSolved: roundNumber,
      attempts: 0,
      solved: false,
      timeSpentMs: 0
    };

    if (matchResult.matched) {
      // ¡ACIERTO!
      const newStreak = streak + 1;
      const newMaxStreak = Math.max(maxStreak, newStreak);
      const pointsBase = roundNumber === 1 ? 150 : 75;
      const points = Math.round(pointsBase * (1 + Math.min(newStreak * 0.1, 1.5)));

      playCorrectSound(1 + Math.min(newStreak * 0.08, 0.6));
      setScore(prev => prev + points);
      setStreak(newStreak);
      setMaxStreak(newMaxStreak);
      setSolvedCount(prev => prev + 1);

      // Pintar en verde el país en el mapa
      setCountryStatuses(prev => ({
        ...prev,
        [upper]: 'correct'
      }));

      // Quitar de la cola de saltados si estaba
      setSkippedQueue(prev => prev.filter(c => c.cca3 !== currentCountry.cca3));

      setGameRecords(prev => ({
        ...prev,
        [upper]: {
          ...prevRecord,
          attempts: prevRecord.attempts + 1,
          solved: true,
          roundSolved: roundNumber,
          timeSpentMs: prevRecord.timeSpentMs + timeSpent
        }
      }));

      setFeedbackToast({
        text: `¡Correcto! ${currentCountry.flagEmoji} ${currentCountry.nameEs} (+${points} pts)`,
        type: 'correct',
        country: currentCountry
      });

      setTimeout(() => {
        setFeedbackToast(null);
        advanceNext();
      }, 1100);
    } else if (matchResult.isClose) {
      // MUY CERCA (Ortografía / Typo)
      playWrongSound();
      setStreak(0);
      setIsEvaluating(false);

      setFeedbackToast({
        text: `¡Casi! Revisa la ortografía de "${currentCountry.nameEs.slice(0, 3)}..."`,
        type: 'close',
        country: currentCountry
      });

      setTimeout(() => {
        setFeedbackToast(null);
      }, 2000);
    } else {
      // ERROR
      playWrongSound();
      setStreak(0);

      setGameRecords(prev => ({
        ...prev,
        [upper]: {
          ...prevRecord,
          attempts: prevRecord.attempts + 1,
          solved: false,
          timeSpentMs: prevRecord.timeSpentMs + timeSpent
        }
      }));

      setFeedbackToast({
        text: `No coincide. Si dudas, pulsa "Pasar" para dejarlo para la 2ª ronda.`,
        type: 'wrong',
        country: currentCountry
      });

      setTimeout(() => {
        setFeedbackToast(null);
        setIsEvaluating(false);
      }, 1500);
    }
  };

  // Pedir Pista
  const handleUseHint = () => {
    if (!currentCountry || activeHint || isEvaluating) return;
    playHintSound();
    setActiveHint(`Empieza por "${currentCountry.nameEs.slice(0, 2).toUpperCase()}..." | Capital: ${currentCountry.capital}`);
  };

  // Iniciar siguiente ronda con los pospuestos
  const handleStartNextRound = () => {
    setShowRoundTransitionModal(false);
    setRoundNumber(prev => prev + 1);
    const nextShuffled = [...skippedQueue].sort(() => 0.5 - Math.random());
    setCurrentQueue(nextShuffled);
    setSkippedQueue([]);
    setCurrentIndex(0);
    setIsEvaluating(false);
    setActiveHint(null);
    questionStartTimeRef.current = Date.now();
  };

  // Finalizar toda la partida
  const finishSession = () => {
    const totalDuration = Math.round((Date.now() - startTimeRef.current) / 1000);
    const recordsList = Object.values(gameRecords);
    const correctCount = recordsList.filter(r => r.solved).length;
    const firstTryCount = recordsList.filter(r => r.solved && r.roundSolved === 1 && r.attempts === 1).length;
    const accuracy = totalUniqueCountries > 0 ? Math.round((correctCount / totalUniqueCountries) * 100) : 0;

    if (accuracy >= 75) {
      playVictorySound();
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.6 }
      });
    }

    const roundResults: GameRoundResult[] = initialCountries.map(c => {
      const rec = gameRecords[c.cca3.toUpperCase()];
      return {
        question: {
          id: `write_${c.cca3}`,
          country: c,
          questionType: 'name',
          promptText: `Escribir ${c.nameEs}`,
          hintUsed: false,
          attempts: rec ? rec.attempts : 1
        },
        userSuccess: rec ? rec.solved : false,
        attemptsUsed: rec ? rec.attempts : 1,
        timeSpentMs: rec ? rec.timeSpentMs : 2000,
        pointsEarned: rec?.solved ? (rec.roundSolved === 1 ? 150 : 75) : 0,
        firstTry: rec ? (rec.solved && rec.roundSolved === 1 && rec.attempts === 1) : false
      };
    });

    const summary: GameSummary = {
      mode: 'input-write',
      continent: initialCountries[0]?.continent || 'World',
      totalQuestions: totalUniqueCountries,
      correctCount,
      firstTryCount,
      wrongCount: totalUniqueCountries - correctCount,
      score,
      maxStreak,
      accuracy,
      durationSeconds: totalDuration,
      playedAt: new Date().toISOString(),
      results: roundResults
    };

    onFinishGame(summary);
  };

  const progressPercent = totalUniqueCountries > 0 
    ? Math.round((solvedCount / totalUniqueCountries) * 100) 
    : 0;

  return (
    <div className="space-y-4">
      {/* Cabecera de Estadísticas en Vivo */}
      <div className="bg-[#18181B]/95 backdrop-blur-md border border-zinc-800 rounded-xl p-4 sm:p-5 shadow-card-subtle flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-indigo-400">
            <Type className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase px-2.5 py-0.5 rounded-md bg-zinc-800 text-indigo-300 border border-zinc-700 font-medium">
                Ronda {roundNumber}
              </span>
              {skippedQueue.length > 0 && (
                <span className="text-xs font-mono uppercase px-2.5 py-0.5 rounded-md bg-zinc-800 text-amber-300 border border-zinc-700 font-medium">
                  {skippedQueue.length} Pospuestos
                </span>
              )}
            </div>
            <h2 className="text-base sm:text-lg font-display font-semibold text-zinc-100 mt-1 tracking-wide">
              Escribir Países: <span className="text-teal-400">{solvedCount} de {totalUniqueCountries} acertados</span>
            </h2>
          </div>
        </div>

        {/* Barra de Progreso */}
        <div className="flex-1 max-w-xs hidden md:block">
          <div className="flex justify-between text-xs text-zinc-400 font-mono mb-1">
            <span>Progreso General</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700/60">
            <div
              className="h-full bg-teal-500 transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Combo, Puntuación y Salir */}
        <div className="flex items-center gap-4">
          {streak > 1 && (
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1.5 px-3 py-1 bg-amber-950/40 border border-amber-800/50 rounded-lg text-amber-300 text-xs font-medium shadow-sm"
            >
              <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>x{streak} combo</span>
            </motion.div>
          )}

          <div className="text-right">
            <span className="text-[10px] uppercase text-zinc-500 font-mono tracking-wider block">Puntos</span>
            <span className="text-lg font-normal text-emerald-400 font-mono tracking-tight">{score}</span>
          </div>

          <button
            onClick={onQuit}
            className="text-xs text-zinc-400 hover:text-zinc-200 px-2.5 py-1 rounded-md hover:bg-zinc-800 transition font-mono"
          >
            Salir
          </button>
        </div>
      </div>

      {/* Tarjeta de Pregunta Activa con Formulario y Botón de Pasar */}
      {currentCountry && (
        <div className="bg-[#18181B]/95 backdrop-blur-md border border-zinc-800 rounded-xl p-4 sm:p-5 shadow-card-subtle space-y-4 relative overflow-hidden border-l-4 border-l-teal-500">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3.5">
              <div
                onClick={() => onOpenFlagModal?.(currentCountry)}
                title="🔍 Haz clic para ampliar la bandera en alta definición"
                className="w-16 h-11 sm:w-20 sm:h-13 rounded-lg overflow-hidden shadow-sm border border-zinc-700/80 bg-zinc-900 flex-shrink-0 cursor-zoom-in hover:border-teal-500 hover:ring-1 hover:ring-teal-500/50 transition-all active:scale-95 group relative"
              >
                <img
                  src={currentCountry.flagSvg}
                  alt={currentCountry.nameEs}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <ZoomIn className="w-4 h-4 text-white drop-shadow" />
                </div>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-teal-300 bg-teal-950/60 px-2 py-0.5 rounded border border-teal-800/60 inline-block mb-1">
                  País #{currentIndex + 1} de {currentQueue.length} (Ronda {roundNumber})
                </span>
                <h3 className="text-base sm:text-xl font-display font-bold text-zinc-100 tracking-wide">
                  ¿Cómo se llama el país resaltado en <span className="text-amber-300 font-bold">ámbar</span> en el mapa?
                </h3>
              </div>
            </div>

            {/* Botones de Acción: Pista y Saltar/Pasar */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleUseHint}
                disabled={Boolean(activeHint) || isEvaluating}
                className={`px-3.5 py-2 rounded-lg border text-xs font-medium transition-all flex items-center gap-1.5 ${
                  activeHint
                    ? 'bg-zinc-800/60 border-zinc-700 text-zinc-500 cursor-not-allowed'
                    : 'bg-amber-950/40 hover:bg-amber-900/50 border-amber-800/50 text-amber-200 active:scale-95'
                }`}
              >
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <span>{activeHint ? 'Pista Activa' : 'Pista'}</span>
              </button>

              {/* BOTÓN PASAR / SALTAR PAÍS */}
              <button
                type="button"
                onClick={handleSkipCountry}
                disabled={isEvaluating}
                className="px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-sans font-medium text-xs shadow-sm transition-all flex items-center gap-2 active:scale-95 border border-zinc-700"
                title="Pospone este país para escribirlo en la 2ª ronda"
              >
                <span>Pasar (Dejar para luego)</span>
                <SkipForward className="w-4 h-4 text-zinc-400" />
              </button>
            </div>
          </div>

          {/* Formulario de Input de Escritura */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isEvaluating}
                placeholder="Escribe el nombre del país (ej. Alemania, Canadá, Tailandia)... o pulsa Pasar"
                className="w-full bg-[#121214] border border-zinc-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 rounded-lg px-4 py-2.5 text-zinc-100 text-base font-sans placeholder-zinc-500 transition-all outline-none"
              />
              {activeHint && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-amber-200 bg-amber-950/90 px-2 py-0.5 rounded border border-amber-800/60">
                  {activeHint}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={isEvaluating}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg shadow-sm transition-all transform active:scale-95 flex items-center gap-2 shrink-0 text-sm"
            >
              <span>Enviar</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Toast Flotante de Feedback */}
      <AnimatePresence>
        {feedbackToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-3 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-2.5 shadow-md border ${
              feedbackToast.type === 'correct'
                ? 'bg-emerald-950/90 text-emerald-200 border-emerald-800/60'
                : feedbackToast.type === 'skip'
                ? 'bg-zinc-900/90 text-zinc-200 border-zinc-700/60'
                : feedbackToast.type === 'close'
                ? 'bg-amber-950/90 text-amber-200 border-amber-800/60'
                : 'bg-rose-950/90 text-rose-200 border-rose-800/60'
            }`}
          >
            {feedbackToast.type === 'correct' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
            {feedbackToast.type === 'skip' && <SkipForward className="w-5 h-5 text-zinc-400 shrink-0" />}
            {feedbackToast.type === 'close' && <HelpCircle className="w-5 h-5 text-amber-400 shrink-0" />}
            {feedbackToast.type === 'wrong' && <XCircle className="w-5 h-5 text-rose-400 shrink-0" />}
            <span>{feedbackToast.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mapa Interactivo con el país resaltado en ámbar */}
      <div className="relative flex-1 min-h-[360px] h-[calc(100vh-230px)] max-h-[calc(100vh-230px)] rounded-xl overflow-hidden shadow-lg border border-zinc-800">
        <WorldMap
          countryStatuses={{
            ...countryStatuses,
            ...(currentCountry ? { [currentCountry.cca3.toUpperCase()]: 'hint' } : {})
          }}
          targetCountryCode={currentCountry?.cca3}
          continent={continent}
          interactive={false}
          isGeekMode={isGeekMode}
          enableTooltip={false}
        />
      </div>

      {/* Modal de Transición a la Ronda 2 (Países Pospuestos) */}
      {showRoundTransitionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#18181B] border border-zinc-800 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-5">
            <div className="inline-flex p-4 rounded-xl bg-zinc-800 border border-zinc-700 text-indigo-400 shadow-sm">
              <RotateCcw className="w-8 h-8 animate-spin-slow" />
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-300 bg-indigo-950/60 px-2.5 py-0.5 rounded-md border border-indigo-800/60 font-medium">
                ¡Ronda {roundNumber} Finalizada!
              </span>
              <h3 className="text-2xl font-serif font-normal text-zinc-100 mt-2">
                Comienza la Ronda {roundNumber + 1}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1 leading-relaxed font-sans">
                Has saltado <strong>{skippedQueue.length} países</strong>. Te los volvemos a mostrar en el mapa para que intentes escribirlos y completes el 100% de la partida.
              </p>
            </div>

            {/* Países en cola */}
            <div className="flex items-center justify-center gap-1.5 flex-wrap p-3 bg-[#121214] rounded-xl border border-zinc-800 max-h-28 overflow-y-auto">
              {skippedQueue.map((c) => (
                <div
                  key={c.cca3}
                  className="flex items-center gap-1 px-2.5 py-1 bg-zinc-900 border border-zinc-700/80 rounded-md text-xs text-zinc-200 font-sans"
                >
                  <span>{c.flagEmoji}</span>
                  <span className="font-medium">{c.nameEs}</span>
                </div>
              ))}
            </div>

            <button
              onClick={handleStartNextRound}
              className="w-full py-3 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-sans font-medium text-sm shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <span>¡Comenzar Ronda {roundNumber + 1}!</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
