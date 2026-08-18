import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Flag, 
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
  Layers
} from 'lucide-react';
import { Continent, Country, CountryMapStatus } from '../../types/country';
import { GameSummary, GameRoundResult, Question } from '../../types/game';
import { WorldMap } from '../map/WorldMap';
import { useAudioFeedback } from '../../hooks/useAudioFeedback';
import confetti from 'canvas-confetti';

interface FlagSkipChainModeProps {
  initialCountries: Country[];
  onFinishGame: (summary: GameSummary) => void;
  onQuit: () => void;
  isGeekMode?: boolean;
  continent?: Continent;
  onOpenFlagModal?: (country: Country) => void;
}

interface FlagAttemptRecord {
  country: Country;
  roundSolved: number; // 1 = primera vuelta, 2 = segunda vuelta (tras saltar)
  attempts: number;
  solved: boolean;
  timeSpentMs: number;
}

export const FlagSkipChainMode: React.FC<FlagSkipChainModeProps> = ({
  initialCountries,
  onFinishGame,
  onQuit,
  isGeekMode = false,
  continent = 'World',
  onOpenFlagModal
}) => {
  const { playCorrectSound, playWrongSound, playHintSound, playVictorySound } = useAudioFeedback();

  // Cola activa de banderas para la ronda actual
  const [currentQueue, setCurrentQueue] = useState<Country[]>([]);
  // Cola de banderas saltadas que pasan a la siguiente ronda
  const [skippedQueue, setSkippedQueue] = useState<Country[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [roundNumber, setRoundNumber] = useState<number>(1);
  
  // Estado de evaluación y mapa
  const [countryStatuses, setCountryStatuses] = useState<Record<string, CountryMapStatus>>({});
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [activeHint, setActiveHint] = useState<string | null>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [solvedCount, setSolvedCount] = useState<number>(0);

  // Registro de resultados para estadísticas finales
  const [gameRecords, setGameRecords] = useState<Record<string, FlagAttemptRecord>>({});
  
  // Modal de transición entre rondas
  const [showRoundTransitionModal, setShowRoundTransitionModal] = useState<boolean>(false);
  const [feedbackToast, setFeedbackToast] = useState<{ text: string; type: 'correct' | 'wrong' | 'skip'; country?: Country } | null>(null);

  const startTimeRef = useRef<number>(Date.now());
  const questionStartTimeRef = useRef<number>(Date.now());

  // Inicializar la partida
  useEffect(() => {
    // Barajar países
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
    startTimeRef.current = Date.now();
    questionStartTimeRef.current = Date.now();
  }, [initialCountries]);

  const currentCountry = currentQueue[currentIndex] || null;
  const totalUniqueFlags = initialCountries.length;

  // Acción: Saltar Bandera para la siguiente ronda
  const handleSkipFlag = () => {
    if (!currentCountry || isEvaluating) return;

    playHintSound();
    const skipped = currentCountry;

    // Agregar a la cola de pospuestas para la 2da ronda si aún no está
    setSkippedQueue(prev => [...prev, skipped]);

    setFeedbackToast({
      text: `Bandera de ${skipped.nameEs} pospuesta para la 2ª Ronda ⏭️`,
      type: 'skip',
      country: skipped
    });

    setTimeout(() => {
      setFeedbackToast(null);
    }, 1800);

    advanceNext();
  };

  // Avanzar a la siguiente bandera de la cola actual o iniciar siguiente ronda
  const advanceNext = () => {
    setActiveHint(null);
    setIsEvaluating(false);
    questionStartTimeRef.current = Date.now();

    const nextIdx = currentIndex + 1;

    if (nextIdx < currentQueue.length) {
      setCurrentIndex(nextIdx);
    } else {
      // Fin de la ronda actual
      if (skippedQueue.length > 0) {
        // Pasar a la siguiente ronda con las banderas pospuestas
        setShowRoundTransitionModal(true);
      } else {
        // ¡Todas las banderas han sido completadas!
        finishSession();
      }
    }
  };

  // Comenzar la siguiente ronda con las banderas saltadas
  const handleStartNextRound = () => {
    const nextRoundQueue = [...skippedQueue];
    setCurrentQueue(nextRoundQueue);
    setSkippedQueue([]);
    setCurrentIndex(0);
    setRoundNumber(prev => prev + 1);
    setShowRoundTransitionModal(false);
    questionStartTimeRef.current = Date.now();
  };

  // Clic en país del mapa
  const handleCountryClick = (clickedCountry: Country, cca3: string) => {
    if (!currentCountry || isEvaluating) return;

    const isMatch = currentCountry.cca3.toUpperCase() === clickedCountry.cca3.toUpperCase();
    const timeSpentMs = Date.now() - questionStartTimeRef.current;

    setIsEvaluating(true);

    if (isMatch) {
      // ACIERTO
      playCorrectSound();
      const points = roundNumber === 1 ? 100 : Math.max(40, 100 - (roundNumber - 1) * 20);
      const newScore = score + points;
      const newStreak = streak + 1;
      setScore(newScore);
      setStreak(newStreak);
      if (newStreak > maxStreak) setMaxStreak(newStreak);
      setSolvedCount(prev => prev + 1);

      // Marcar país en verde
      setCountryStatuses(prev => ({
        ...prev,
        [clickedCountry.cca3.toUpperCase()]: 'correct'
      }));

      // Guardar registro
      setGameRecords(prev => ({
        ...prev,
        [currentCountry.cca3]: {
          country: currentCountry,
          roundSolved: roundNumber,
          attempts: 1,
          solved: true,
          timeSpentMs
        }
      }));

      setFeedbackToast({
        text: `¡Correcto! Es ${currentCountry.flagEmoji} ${currentCountry.nameEs} (Capital: ${currentCountry.capital})`,
        type: 'correct',
        country: currentCountry
      });

      setTimeout(() => {
        setFeedbackToast(null);
        advanceNext();
      }, 1400);
    } else {
      // FALLO
      playWrongSound();
      setStreak(0);

      // Marcar país pulsado en rojo momentáneamente
      setCountryStatuses(prev => ({
        ...prev,
        [clickedCountry.cca3.toUpperCase()]: 'wrong'
      }));

      setFeedbackToast({
        text: `Has pulsado ${clickedCountry.nameEs}. ¡Inténtalo de nuevo o salta la bandera!`,
        type: 'wrong',
        country: clickedCountry
      });

      setTimeout(() => {
        setCountryStatuses(prev => {
          const next = { ...prev };
          delete next[clickedCountry.cca3.toUpperCase()];
          return next;
        });
        setIsEvaluating(false);
      }, 800);
    }
  };

  // Pedir pista
  const handleUseHint = () => {
    if (!currentCountry || activeHint) return;
    playHintSound();
    setActiveHint(`Continente: ${currentCountry.continentEs} · Capital: ${currentCountry.capital}`);
  };

  // Finalizar sesión y generar resumen
  const finishSession = () => {
    playVictorySound();
    try {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    } catch (e) {}

    const totalTimeMs = Date.now() - startTimeRef.current;
    const durationSeconds = Math.max(1, Math.round(totalTimeMs / 1000));
    const results: GameRoundResult[] = Object.values(gameRecords).map(rec => ({
      question: {
        id: `flag_${rec.country.cca3}`,
        country: rec.country,
        questionType: 'flag',
        promptText: `Bandera de ${rec.country.nameEs}`,
        hintUsed: false,
        attempts: rec.attempts
      },
      userSuccess: rec.solved,
      firstTry: rec.roundSolved === 1,
      attemptsUsed: rec.attempts,
      timeSpentMs: rec.timeSpentMs,
      pointsEarned: rec.roundSolved === 1 ? 100 : 60
    }));

    const accuracy = totalUniqueFlags > 0 ? Math.round((solvedCount / totalUniqueFlags) * 100) : 100;
    const firstTryCount = results.filter(r => r.firstTry).length;
    const wrongCount = totalUniqueFlags - solvedCount;

    onFinishGame({
      mode: 'flag-skip-chain',
      continent: 'World',
      totalQuestions: totalUniqueFlags,
      correctCount: solvedCount,
      firstTryCount,
      wrongCount,
      score,
      maxStreak,
      accuracy,
      durationSeconds,
      playedAt: new Date().toISOString(),
      results
    });
  };

  if (!currentCountry && !showRoundTransitionModal) return null;

  return (
    <div className="flex flex-col h-full gap-4 max-w-7xl mx-auto w-full px-2 sm:px-4">
      {/* Barra Superior: Ronda, Progreso, Pospuestas, Puntos */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Badge de Ronda */}
          <div className="px-3 py-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-xl border border-amber-500/40 text-xs font-bold text-amber-300 flex items-center gap-1.5 shadow-sm">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>Ronda {roundNumber}</span>
          </div>

          {/* Progreso de la ronda actual */}
          <div className="px-3 py-1 bg-slate-800 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300">
            Bandera <span className="text-cyan-400 font-bold text-sm">{currentIndex + 1}</span> / {currentQueue.length}
          </div>

          {/* Contador de Pospuestas en cola */}
          {skippedQueue.length > 0 && (
            <div className="px-2.5 py-1 bg-sky-950/50 rounded-xl border border-sky-600/40 text-xs font-bold text-sky-300 flex items-center gap-1.5 animate-pulse">
              <SkipForward className="w-3.5 h-3.5 text-sky-400" />
              <span>{skippedQueue.length} en 2ª Ronda</span>
            </div>
          )}
        </div>

        {/* Marcadores de Aciertos, Racha y Puntos */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-1 rounded-xl">
            <CheckCircle2 className="w-4 h-4" />
            <span>{solvedCount} / {totalUniqueFlags} Resueltas</span>
          </div>

          {streak > 1 && (
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 bg-amber-500/20 border border-amber-500/40 px-2.5 py-1 rounded-xl text-amber-400 font-bold text-xs"
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

      {/* Tarjeta de Bandera Activa y Botón de Saltar */}
      {currentCountry && (
        <div className="bg-[#131C2E]/95 backdrop-blur-md border border-cyan-500/40 rounded-2xl p-4 sm:p-5 shadow-2xl flex items-center justify-between gap-4 flex-wrap relative overflow-hidden">
          <div className="flex items-center gap-4">
            {/* Visualizador de Bandera con opción de zoom */}
            <div
              onClick={() => onOpenFlagModal?.(currentCountry)}
              title="🔍 Haz clic para ampliar la bandera en alta definición"
              className="w-24 h-16 sm:w-28 sm:h-18 rounded-xl overflow-hidden shadow-xl border-2 border-slate-700 bg-slate-950/80 flex-shrink-0 cursor-zoom-in hover:border-cyan-400 hover:ring-2 hover:ring-cyan-500/50 transition-all active:scale-95 group relative"
            >
              <img
                src={currentCountry.flagSvg}
                alt="Bandera a adivinar"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <ZoomIn className="w-5 h-5 text-white drop-shadow" />
              </div>
            </div>

            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30 inline-block mb-1">
                ¿A qué país pertenece esta bandera?
              </span>
              <h2 className="text-lg sm:text-xl font-display font-black text-white">
                Haz clic en el país en el mapa
              </h2>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                <span>Si no la sabes, puedes saltarla y te saldrá en la siguiente ronda.</span>
              </p>
            </div>
          </div>

          {/* Botones de Acción: Saltar y Pista */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
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

            {/* BOTÓN PRINCIPAL: SALTAR BANDERA */}
            <button
              onClick={handleSkipFlag}
              disabled={isEvaluating}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-display font-bold text-xs shadow-glow-cyan transition-all flex items-center gap-2 active:scale-95 border border-sky-400/40"
              title="Pospone esta bandera para resolverla en la 2ª ronda"
            >
              <span>Saltar (Dejar para luego)</span>
              <SkipForward className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Pista activa */}
      {activeHint && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-950/40 border border-amber-500/40 rounded-xl px-4 py-2.5 text-amber-200 text-xs sm:text-sm flex items-center gap-2"
        >
          <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span><strong>Pista:</strong> {activeHint}</span>
        </motion.div>
      )}

      {/* Feedback Toast */}
      <AnimatePresence>
        {feedbackToast && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className={`p-3 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5 shadow-xl border ${
              feedbackToast.type === 'correct'
                ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                : feedbackToast.type === 'skip'
                ? 'bg-sky-950/90 text-sky-200 border-sky-500/60 shadow-[0_0_20px_rgba(56,189,248,0.3)]'
                : 'bg-rose-950/90 text-rose-200 border-rose-500/60 shadow-[0_0_20px_rgba(244,63,94,0.3)]'
            }`}
          >
            {feedbackToast.type === 'correct' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            {feedbackToast.type === 'skip' && <SkipForward className="w-5 h-5 text-sky-400" />}
            {feedbackToast.type === 'wrong' && <XCircle className="w-5 h-5 text-rose-400" />}
            <span>{feedbackToast.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mapa Interactivo */}
      <div className="relative flex-1 min-h-[360px] h-[calc(100vh-230px)] max-h-[calc(100vh-230px)] rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
        <WorldMap
          countryStatuses={countryStatuses}
          continent={continent}
          onCountryClick={handleCountryClick}
          interactive={!isEvaluating}
          isGeekMode={isGeekMode}
          enableTooltip={true}
        />
      </div>

      {/* Modal de Transición a la Ronda 2 (Banderas Pospuestas) */}
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
                Has saltado <strong>{skippedQueue.length} banderas</strong>. Te las volvemos a poner para que intentes adivinarlas y completes el 100% de la partida.
              </p>
            </div>

            {/* Banderas en cola */}
            <div className="flex items-center justify-center gap-1.5 flex-wrap p-3 bg-slate-950/60 rounded-2xl border border-slate-800 max-h-28 overflow-y-auto">
              {skippedQueue.map((c) => (
                <img
                  key={c.cca3}
                  src={c.flagSvg}
                  alt={c.nameEs}
                  title={c.nameEs}
                  className="w-7 h-5 object-cover rounded shadow border border-slate-700"
                />
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
