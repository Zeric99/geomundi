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
      <div className="bg-[#131C2E]/90 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-4 sm:p-5 shadow-2xl flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-teal-500/20 border border-teal-500/40 rounded-xl text-teal-400">
            <Type className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
                Ronda {roundNumber}
              </span>
              {skippedQueue.length > 0 && (
                <span className="text-xs font-mono uppercase px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold">
                  {skippedQueue.length} Pospuestos
                </span>
              )}
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white mt-1">
              Escribir Países: <span className="text-cyan-300">{solvedCount} de {totalUniqueCountries} acertados</span>
            </h2>
          </div>
        </div>

        {/* Barra de Progreso */}
        <div className="flex-1 max-w-xs hidden md:block">
          <div className="flex justify-between text-xs text-slate-400 font-mono mb-1">
            <span>Progreso General</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/60">
            <div
              className="h-full bg-gradient-to-r from-teal-500 via-cyan-500 to-sky-400 transition-all duration-300 rounded-full"
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
              className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-300 text-xs font-extrabold shadow-glow-amber"
            >
              <Flame className="w-4 h-4 fill-amber-400 animate-pulse" />
              <span>x{streak} combo</span>
            </motion.div>
          )}

          <div className="text-right">
            <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider block">Puntos</span>
            <span className="text-lg font-black text-emerald-400 font-mono tracking-tight">{score}</span>
          </div>

          <button
            onClick={onQuit}
            className="text-xs text-slate-400 hover:text-slate-200 px-2.5 py-1 rounded-lg hover:bg-slate-800 transition"
          >
            Salir
          </button>
        </div>
      </div>

      {/* Tarjeta de Pregunta Activa con Formulario y Botón de Pasar */}
      {currentCountry && (
        <div className="bg-[#131C2E]/95 backdrop-blur-md border border-cyan-500/40 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3.5">
              <div
                onClick={() => onOpenFlagModal?.(currentCountry)}
                title="🔍 Haz clic para ampliar la bandera en alta definición"
                className="w-16 h-11 sm:w-20 sm:h-13 rounded-xl overflow-hidden shadow-lg border-2 border-slate-700 bg-slate-950 flex-shrink-0 cursor-zoom-in hover:border-cyan-400 hover:ring-2 hover:ring-cyan-500/50 transition-all active:scale-95 group relative"
              >
                <img
                  src={currentCountry.flagSvg}
                  alt={currentCountry.nameEs}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <ZoomIn className="w-4 h-4 text-white drop-shadow" />
                </div>
              </div>

              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30 inline-block mb-1">
                  País #{currentIndex + 1} de {currentQueue.length} (Ronda {roundNumber})
                </span>
                <h3 className="text-base sm:text-xl font-display font-bold text-white">
                  ¿Cómo se llama el país resaltado en <span className="text-amber-400 font-black">ámbar</span> en el mapa?
                </h3>
              </div>
            </div>

            {/* Botones de Acción: Pista y Saltar/Pasar */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleUseHint}
                disabled={Boolean(activeHint) || isEvaluating}
                className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeHint
                    ? 'bg-slate-800/60 border-slate-700 text-slate-500 cursor-not-allowed'
                    : 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/40 text-amber-300 active:scale-95'
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
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-display font-bold text-xs shadow-glow-cyan transition-all flex items-center gap-2 active:scale-95 border border-sky-400/40"
                title="Pospone este país para escribirlo en la 2ª ronda"
              >
                <span>Pasar (Dejar para luego)</span>
                <SkipForward className="w-4 h-4" />
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
                className="w-full bg-[#0B0F19] border-2 border-slate-700 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/20 rounded-xl px-4 py-3 text-white text-base sm:text-lg font-medium placeholder-slate-500 transition-all outline-none"
              />
              {activeHint && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-amber-300 bg-amber-950/80 px-2 py-1 rounded border border-amber-500/40">
                  {activeHint}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={isEvaluating}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl shadow-glow-emerald transition-all transform active:scale-95 flex items-center gap-2 shrink-0"
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
            className={`p-3 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5 shadow-xl border ${
              feedbackToast.type === 'correct'
                ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                : feedbackToast.type === 'skip'
                ? 'bg-sky-950/90 text-sky-200 border-sky-500/60 shadow-[0_0_20px_rgba(56,189,248,0.3)]'
                : feedbackToast.type === 'close'
                ? 'bg-amber-950/90 text-amber-200 border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                : 'bg-rose-950/90 text-rose-200 border-rose-500/60 shadow-[0_0_20px_rgba(244,63,94,0.3)]'
            }`}
          >
            {feedbackToast.type === 'correct' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
            {feedbackToast.type === 'skip' && <SkipForward className="w-5 h-5 text-sky-400 shrink-0" />}
            {feedbackToast.type === 'close' && <HelpCircle className="w-5 h-5 text-amber-400 shrink-0" />}
            {feedbackToast.type === 'wrong' && <XCircle className="w-5 h-5 text-rose-400 shrink-0" />}
            <span>{feedbackToast.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mapa Interactivo con el país resaltado en ámbar */}
      <div className="relative flex-1 min-h-[360px] h-[calc(100vh-230px)] max-h-[calc(100vh-230px)] rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-gradient-to-b from-[#131C2E] via-[#0F172A] to-[#0A101C] border border-cyan-500/50 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-[0_0_50px_rgba(6,182,212,0.35)] text-center space-y-5">
            <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-sky-500/20 to-indigo-500/20 border border-sky-500/40 text-sky-400 shadow-glow-cyan">
              <RotateCcw className="w-10 h-10 animate-spin-slow" />
            </div>

            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
                ¡Ronda {roundNumber} Finalizada!
              </span>
              <h3 className="text-2xl font-black text-white mt-2">
                Comienza la Ronda {roundNumber + 1}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                Has saltado <strong>{skippedQueue.length} países</strong>. Te los volvemos a mostrar en el mapa para que intentes escribirlos y completes el 100% de la partida.
              </p>
            </div>

            {/* Países en cola */}
            <div className="flex items-center justify-center gap-1.5 flex-wrap p-3 bg-slate-950/60 rounded-2xl border border-slate-800 max-h-28 overflow-y-auto">
              {skippedQueue.map((c) => (
                <div
                  key={c.cca3}
                  className="flex items-center gap-1 px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200"
                >
                  <span>{c.flagEmoji}</span>
                  <span className="font-semibold">{c.nameEs}</span>
                </div>
              ))}
            </div>

            <button
              onClick={handleStartNextRound}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 font-display font-extrabold text-sm shadow-glow-cyan transition-all flex items-center justify-center gap-2 active:scale-95"
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
