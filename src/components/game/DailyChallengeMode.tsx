import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapPin, Flag, Landmark, Edit3, HelpCircle, CheckCircle2, XCircle, Clock, Trophy, ArrowRight, Sparkles, Send, Share2, Copy, Check, Flame, Award, BarChart2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Country, CountryMapStatus } from '../../types/country';
import { DailyStageQuestion, dailyChallengeService } from '../../services/dailyChallengeService';
import { WorldMap } from '../map/WorldMap';
import { useCountriesData } from '../../hooks/useCountriesData';
import { copyToClipboard } from '../../utils/shareUtils';

interface DailyChallengeModeProps {
  questions: DailyStageQuestion[];
  onFinishChallenge: (score: number, accuracy: number, durationSeconds: number) => void;
  onQuit: () => void;
  onOpenFlagModal?: (country: Country) => void;
}

interface ChallengeFinalSummary {
  correctCount: number;
  totalQuestions: number;
  score: number;
  accuracy: number;
  durationSeconds: number;
  stageResults: boolean[];
  streak: number;
}

export const DailyChallengeMode: React.FC<DailyChallengeModeProps> = ({
  questions,
  onFinishChallenge,
  onQuit,
  onOpenFlagModal
}) => {
  const { countries } = useCountriesData();
  const [currentStageIdx, setCurrentStageIdx] = useState<number>(0);
  const [stageResults, setStageResults] = useState<{ success: boolean; timeMs: number }[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string; answerName?: string } | null>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [totalSeconds, setTotalSeconds] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [finalSummary, setFinalSummary] = useState<ChallengeFinalSummary | null>(null);
  const [copiedTweet, setCopiedTweet] = useState<boolean>(false);

  const currentQuestion = questions[currentStageIdx] || questions[0];
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const stageStartTimeRef = useRef<number>(Date.now());

  // Reloj general del reto diario
  useEffect(() => {
    if (isCompleted) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTotalSeconds(prev => prev + 1);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isCompleted]);

  // Reiniciar tiempo por etapa al cambiar de pregunta
  useEffect(() => {
    stageStartTimeRef.current = Date.now();
    setFeedback(null);
    setInputText('');
    setIsEvaluating(false);
  }, [currentStageIdx]);

  // Estado visual de países en el mapa
  const countryStatuses = useMemo(() => {
    const statuses: Record<string, CountryMapStatus> = {};
    if (!currentQuestion) return statuses;

    if (currentQuestion.stageType === 'map-to-input') {
      // En la etapa 4, el país objetivo se resalta claramente en amarillo en el mapa
      statuses[currentQuestion.country.cca3] = 'hint';
    }

    if (feedback) {
      if (feedback.isCorrect) {
        statuses[currentQuestion.country.cca3] = 'correct';
      } else {
        statuses[currentQuestion.country.cca3] = 'wrong';
      }
    }

    return statuses;
  }, [currentQuestion, feedback]);

  // Avanzar a la siguiente etapa o finalizar
  const advanceToNext = (isCorrect: boolean) => {
    const timeSpentMs = Date.now() - stageStartTimeRef.current;
    const updatedResults = [...stageResults, { success: isCorrect, timeMs: timeSpentMs }];
    setStageResults(updatedResults);

    if (currentStageIdx < questions.length - 1) {
      setCurrentStageIdx(prev => prev + 1);
    } else {
      // Fin del Desafío Diario
      const correctCount = updatedResults.filter(r => r.success).length;
      const accuracy = Math.round((correctCount / questions.length) * 100);
      const score = correctCount * 200 + Math.max(0, 500 - totalSeconds * 10);
      const stageSuccessBools = updatedResults.map(r => r.success);

      // Guardar el registro en el almacenamiento local
      const streakState = dailyChallengeService.recordDailyCompletion(score, accuracy, totalSeconds);

      if (correctCount >= 3) {
        try {
          confetti({
            particleCount: 90,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (e) {}
      }

      setFinalSummary({
        correctCount,
        totalQuestions: questions.length,
        score,
        accuracy,
        durationSeconds: totalSeconds,
        stageResults: stageSuccessBools,
        streak: streakState.currentStreak
      });
      setIsCompleted(true);
    }
  };

  // Manejar clic en mapa (para etapas 1, 2, 3, 5)
  const handleCountryClick = (clickedCountry: Country) => {
    if (isEvaluating || !currentQuestion || currentQuestion.stageType === 'map-to-input') return;

    setIsEvaluating(true);
    const isCorrect = clickedCountry.cca3 === currentQuestion.country.cca3;

    if (isCorrect) {
      setFeedback({
        isCorrect: true,
        message: '¡Excelente! Has localizado el país correctamente.'
      });
    } else {
      setFeedback({
        isCorrect: false,
        message: `Incorrecto. Has marcado ${clickedCountry.nameEs}.`,
        answerName: currentQuestion.country.nameEs
      });
    }

    setTimeout(() => {
      advanceToNext(isCorrect);
    }, 1800);
  };

  // Normalizar texto para comparación sin acentos ni mayúsculas
  const normalizeStr = (str: string) => {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  };

  // Manejar respuesta escrita (para etapa 4: mapa -> escribir)
  const handleInputSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isEvaluating || !inputText.trim() || !currentQuestion) return;

    setIsEvaluating(true);
    const userClean = normalizeStr(inputText);
    const targetNameEs = normalizeStr(currentQuestion.country.nameEs);
    const targetNameEn = normalizeStr(currentQuestion.country.nameEn);

    const isCorrect = userClean === targetNameEs || userClean === targetNameEn;

    if (isCorrect) {
      setFeedback({
        isCorrect: true,
        message: `¡Correcto! Es ${currentQuestion.country.nameEs}.`
      });
    } else {
      setFeedback({
        isCorrect: false,
        message: `Incorrecto. El país es ${currentQuestion.country.nameEs}.`,
        answerName: currentQuestion.country.nameEs
      });
    }

    setTimeout(() => {
      advanceToNext(isCorrect);
    }, 1800);
  };

  // Copiar resumen con formato tweet para X (Twitter)
  const handleCopyTweet = async () => {
    if (!finalSummary) return;
    const tweetText = dailyChallengeService.generateDailyTweetText(
      finalSummary.correctCount,
      finalSummary.totalQuestions,
      finalSummary.score,
      finalSummary.durationSeconds,
      finalSummary.stageResults
    );

    const success = await copyToClipboard(tweetText);
    if (success) {
      setCopiedTweet(true);
      setTimeout(() => setCopiedTweet(false), 2500);
    }
  };

  // Abrir ventana directa para publicar en X / Twitter
  const handleTweetIntent = () => {
    if (!finalSummary) return;
    const tweetText = dailyChallengeService.generateDailyTweetText(
      finalSummary.correctCount,
      finalSummary.totalQuestions,
      finalSummary.score,
      finalSummary.durationSeconds,
      finalSummary.stageResults
    );
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(tweetUrl, '_blank', 'noopener,noreferrer');
  };

  // PANTALLA DE FINALIZACIÓN DEL RETO DIARIO
  if (isCompleted && finalSummary) {
    const isPerfect = finalSummary.correctCount === finalSummary.totalQuestions;
    const isGood = finalSummary.correctCount >= 3;

    return (
      <div className="w-full max-w-2xl mx-auto py-4 px-2 sm:px-4 animate-in fade-in zoom-in-95 duration-300">
        <div className="bg-[#18181B] border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
          {/* Luz ambiental decorativa */}
          <div className="absolute -top-24 -right-24 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Encabezado */}
          <div className="text-center space-y-2 relative z-10">
            <div className="inline-flex p-3.5 bg-amber-500/15 border border-amber-500/30 rounded-2xl text-amber-400 mb-1 shadow-inner">
              <Trophy className="w-9 h-9" />
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest bg-amber-950/60 text-amber-400 border border-amber-800/60 px-2.5 py-0.5 rounded-full">
                Desafío Diario Completado
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-zinc-100">
              {isPerfect ? '¡Rendimiento Legendario!' : isGood ? '¡Bien jugado!' : '¡Reto Finalizado!'}
            </h2>
            <p className="text-sm text-zinc-400">
              {isPerfect
                ? '¡Has acertado todas las pruebas del reto de hoy!'
                : 'Buen trabajo completando las 5 pruebas de geografía del día.'}
            </p>
          </div>

          {/* Banner central de Aciertos */}
          <div className="bg-gradient-to-r from-indigo-950/40 via-[#141416] to-purple-950/40 border border-zinc-800 rounded-2xl p-5 text-center relative z-10 shadow-card-subtle">
            <p className="text-xs font-mono uppercase tracking-wider text-zinc-400">Balance del Día</p>
            <div className="flex items-center justify-center gap-3 mt-1">
              <span className="text-4xl sm:text-5xl font-black font-mono text-white tracking-tight">
                {finalSummary.correctCount}
                <span className="text-zinc-500 text-3xl sm:text-4xl font-normal"> / {finalSummary.totalQuestions}</span>
              </span>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono uppercase ${
                finalSummary.accuracy >= 80 ? 'bg-emerald-950/70 border border-emerald-500/50 text-emerald-300' :
                finalSummary.accuracy >= 50 ? 'bg-amber-950/70 border border-amber-500/50 text-amber-300' :
                'bg-rose-950/70 border border-rose-500/50 text-rose-300'
              }`}>
                {finalSummary.accuracy}% aciertos
              </span>
            </div>
          </div>

          {/* Cuadrícula de las 5 etapas con resultado detallado */}
          <div className="space-y-2 relative z-10">
            <p className="text-xs font-mono uppercase tracking-wider text-zinc-400 px-1">Detalle por Prueba:</p>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const isSuccess = finalSummary.stageResults[idx];
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border flex sm:flex-col items-center justify-between sm:justify-center text-center gap-2 transition-all ${
                      isSuccess
                        ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300'
                        : 'bg-rose-950/30 border-rose-800/60 text-rose-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 sm:flex-col">
                      <span className="text-base">{isSuccess ? '🟩' : '🟥'}</span>
                      <span className="text-xs font-mono font-bold uppercase text-zinc-300">
                        Prueba {q.stage}
                      </span>
                    </div>
                    <span className="text-xs truncate max-w-[120px] font-medium text-zinc-300">
                      {q.country.nameEs}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Estadísticas de la partida */}
          <div className="grid grid-cols-3 gap-3 relative z-10">
            <div className="bg-[#121214] border border-zinc-800/80 rounded-2xl p-3.5 text-center">
              <div className="flex items-center justify-center gap-1.5 text-amber-400 mb-1">
                <Trophy className="w-4 h-4" />
                <span className="text-xs font-mono uppercase text-zinc-400">Puntos</span>
              </div>
              <div className="text-lg sm:text-xl font-bold font-mono text-zinc-100">
                {finalSummary.score.toLocaleString()}
              </div>
            </div>

            <div className="bg-[#121214] border border-zinc-800/80 rounded-2xl p-3.5 text-center">
              <div className="flex items-center justify-center gap-1.5 text-cyan-400 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-mono uppercase text-zinc-400">Tiempo</span>
              </div>
              <div className="text-lg sm:text-xl font-bold font-mono text-zinc-100">
                {finalSummary.durationSeconds}s
              </div>
            </div>

            <div className="bg-[#121214] border border-zinc-800/80 rounded-2xl p-3.5 text-center">
              <div className="flex items-center justify-center gap-1.5 text-orange-400 mb-1">
                <Flame className="w-4 h-4" />
                <span className="text-xs font-mono uppercase text-zinc-400">Racha</span>
              </div>
              <div className="text-lg sm:text-xl font-bold font-mono text-zinc-100">
                {finalSummary.streak} {finalSummary.streak === 1 ? 'día' : 'días'}
              </div>
            </div>
          </div>

          {/* Sección de compartir en X / Twitter */}
          <div className="bg-[#141416] border border-zinc-800/90 rounded-2xl p-4 sm:p-5 space-y-3 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-white">𝕏</span>
                <span className="text-xs sm:text-sm font-semibold text-zinc-200">
                  Comparte tu resultado en X (Twitter)
                </span>
              </div>
              <span className="text-[11px] font-mono text-zinc-400">#GeoStrike</span>
            </div>

            {/* Vista previa del Tweet */}
            <div className="bg-[#0e0e10] border border-zinc-800 rounded-xl p-3 font-mono text-xs text-zinc-300 space-y-1 select-all">
              <p>🌍 Reto Diario GeoStrike #{dailyChallengeService.getTodayDateString()}</p>
              <p className="font-bold text-emerald-400">
                📊 Aciertos: {finalSummary.correctCount}/{finalSummary.totalQuestions} ({finalSummary.accuracy}%)
              </p>
              <p className="tracking-widest text-sm py-0.5">
                {finalSummary.stageResults.map(r => r ? '🟩' : '🟥').join('')}
              </p>
              <p className="text-zinc-400">⏱️ {finalSummary.durationSeconds}s | 🏆 {finalSummary.score.toLocaleString()} pts</p>
            </div>

            {/* Botones de acción para X */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <button
                onClick={handleCopyTweet}
                className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all border ${
                  copiedTweet
                    ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 shadow-emerald-950/30'
                    : 'bg-zinc-800/80 hover:bg-zinc-700/80 border-zinc-700 text-zinc-100 hover:border-zinc-600'
                }`}
              >
                {copiedTweet ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>¡Copiado para el Tuit!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-zinc-300" />
                    <span>Copiar texto para Tuit</span>
                  </>
                )}
              </button>

              <button
                onClick={handleTweetIntent}
                className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all bg-sky-500 hover:bg-sky-400 text-zinc-950 font-sans shadow-sm"
              >
                <span className="font-black text-sm">𝕏</span>
                <span>Publicar directamente en X</span>
              </button>
            </div>
          </div>

          {/* Botones finales de navegación */}
          <div className="flex items-center justify-between gap-3 pt-2 relative z-10 flex-wrap sm:flex-nowrap">
            <button
              onClick={onQuit}
              className="w-full sm:w-auto py-2.5 px-4 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition-all text-center"
            >
              Volver al Menú
            </button>

            <button
              onClick={() => onFinishChallenge(finalSummary.score, finalSummary.accuracy, finalSummary.durationSeconds)}
              className="w-full sm:w-auto py-2.5 px-5 rounded-xl text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <BarChart2 className="w-4 h-4" />
              <span>Ver Clasificación Diaria</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4 animate-in fade-in duration-200">
      {/* BARRA SUPERIOR: STEPPER Y TIMER */}
      <div className="bg-[#18181B] border border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-card-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/15 border border-indigo-500/30 rounded-xl text-indigo-400 font-bold shrink-0">
            <Trophy className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest bg-amber-950/60 text-amber-400 border border-amber-800/60 px-2 py-0.5 rounded">
                Desafío Diario Oficial
              </span>
              <span className="text-xs font-mono text-zinc-400">
                5 Pruebas Diarias
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-serif font-bold text-zinc-100 mt-0.5">
              {currentQuestion.stageTitle}
            </h2>
          </div>
        </div>

        {/* Reloj y Botón Salir */}
        <div className="flex items-center justify-between md:justify-end gap-3">
          <div className="flex items-center gap-2 bg-[#121214] border border-zinc-800 px-3.5 py-1.5 rounded-xl font-mono text-xs">
            <Clock className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="text-zinc-400">Tiempo:</span>
            <span className="text-cyan-300 font-bold text-sm">{totalSeconds}s</span>
          </div>

          <button
            onClick={onQuit}
            className="text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 px-3 py-1.5 rounded-lg transition-all"
          >
            Salir
          </button>
        </div>
      </div>

      {/* STEPPER DE 5 ETAPAS */}
      <div className="grid grid-cols-5 gap-2">
        {questions.map((q, idx) => {
          const isDone = idx < currentStageIdx;
          const isCurrent = idx === currentStageIdx;
          const isSuccess = stageResults[idx]?.success;

          return (
            <div
              key={idx}
              className={`p-2.5 rounded-xl border text-center transition-all ${
                isCurrent
                  ? 'bg-indigo-950/40 border-indigo-500 shadow-md ring-1 ring-indigo-500/50 text-white'
                  : isDone
                  ? isSuccess
                    ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300'
                    : 'bg-rose-950/30 border-rose-800/60 text-rose-300'
                  : 'bg-[#18181B] border-zinc-800/60 text-zinc-500 opacity-60'
              }`}
            >
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider mb-0.5">
                Prueba {q.stage}
              </div>
              <div className="text-xs font-semibold truncate flex items-center justify-center gap-1">
                {q.stageType === 'name-to-map' && <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                {q.stageType === 'flag-to-map' && <Flag className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                {q.stageType === 'capital-to-map' && <Landmark className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                {q.stageType === 'map-to-input' && <Edit3 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                {q.stageType === 'trivia-to-country' && <HelpCircle className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
                <span className="hidden sm:inline">
                  {q.stageType === 'name-to-map' ? 'Nombre' :
                   q.stageType === 'flag-to-map' ? 'Bandera' :
                   q.stageType === 'capital-to-map' ? 'Capital' :
                   q.stageType === 'map-to-input' ? 'Escribir' : 'Trivia'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* TARJETA DE CONSIGNA DE LA PREGUNTA */}
      <div className="bg-[#18181B] border border-zinc-800 rounded-2xl p-5 shadow-card-subtle space-y-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            {/* Icono de tipo de pregunta */}
            {currentQuestion.stageType === 'name-to-map' && (
              <div className="p-3 bg-cyan-500/15 border border-cyan-500/30 rounded-xl text-cyan-400">
                <MapPin className="w-6 h-6" />
              </div>
            )}

            {currentQuestion.stageType === 'flag-to-map' && (
              <div
                onClick={() => onOpenFlagModal?.(currentQuestion.country)}
                className="w-16 h-11 rounded-lg overflow-hidden border border-zinc-700 bg-zinc-900 cursor-pointer hover:scale-105 transition-transform"
                title="Ampliar Bandera"
              >
                <img
                  src={currentQuestion.country.flagSvg}
                  alt="Bandera"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {currentQuestion.stageType === 'capital-to-map' && (
              <div className="p-3 bg-amber-500/15 border border-amber-500/30 rounded-xl text-amber-400 font-bold">
                <Landmark className="w-6 h-6" />
              </div>
            )}

            {currentQuestion.stageType === 'map-to-input' && (
              <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-400">
                <Edit3 className="w-6 h-6" />
              </div>
            )}

            {currentQuestion.stageType === 'trivia-to-country' && (
              <div className="p-3 bg-purple-500/15 border border-purple-500/30 rounded-xl text-purple-400">
                <HelpCircle className="w-6 h-6" />
              </div>
            )}

            <div>
              <p className="text-xs text-zinc-400 font-mono uppercase tracking-wider">
                {currentQuestion.stageSubtitle}
              </p>
              <h3 className="text-base sm:text-lg font-bold text-zinc-100 mt-0.5">
                {currentQuestion.promptText}
              </h3>
            </div>
          </div>

          {/* Detalles específicos */}
          {currentQuestion.stageType === 'capital-to-map' && (
            <div className="px-4 py-2 bg-amber-950/40 border border-amber-500/30 rounded-xl font-serif text-amber-300 font-bold text-sm sm:text-base">
              Capital: {currentQuestion.country.capital}
            </div>
          )}
        </div>

        {/* FEEDBACK VISUAL DE RESPUESTA */}
        {feedback && (
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold animate-in fade-in duration-200 ${
              feedback.isCorrect
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
                : 'bg-rose-950/60 border-rose-500/50 text-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.isCorrect ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
            <span className="text-xs font-mono opacity-80">Avanzando...</span>
          </div>
        )}

        {/* FORMULARIO DE TEXTO PARA ETAPA 4 (MAPA ➔ ESCRIBIR) */}
        {currentQuestion.stageType === 'map-to-input' && !feedback && (
          <form onSubmit={handleInputSubmit} className="pt-2 flex items-center gap-3">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Escribe aquí el nombre del país (ej. España, Argentina)..."
              disabled={isEvaluating}
              autoFocus
              className="flex-1 bg-[#121214] border border-zinc-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-all"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isEvaluating}
              className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 font-bold px-5 py-2.5 rounded-xl text-sm transition-all flex items-center gap-2 shrink-0 shadow-sm"
            >
              <span>Confirmar</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>

      {/* CONTENEDOR DEL MAPA MUNDIAL */}
      <div className="bg-[#18181B] border border-zinc-800 rounded-2xl p-2 sm:p-4 shadow-card-subtle relative overflow-hidden h-[420px] sm:h-[500px]">
        <WorldMap
          continent="World"
          countryStatuses={countryStatuses}
          onCountryClick={(country) => handleCountryClick(country)}
        />
      </div>
    </div>
  );
};
