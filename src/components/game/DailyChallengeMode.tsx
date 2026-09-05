import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapPin, Flag, Landmark, Edit3, HelpCircle, CheckCircle2, XCircle, Clock, Trophy, ArrowRight, Sparkles, Send } from 'lucide-react';
import { Country, CountryMapStatus } from '../../types/country';
import { DailyStageQuestion } from '../../services/dailyChallengeService';
import { WorldMap } from '../map/WorldMap';
import { useCountriesData } from '../../hooks/useCountriesData';

interface DailyChallengeModeProps {
  questions: DailyStageQuestion[];
  onFinishChallenge: (score: number, accuracy: number, durationSeconds: number) => void;
  onQuit: () => void;
  onOpenFlagModal?: (country: Country) => void;
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

  const currentQuestion = questions[currentStageIdx];
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const stageStartTimeRef = useRef<number>(Date.now());

  // Reloj general del reto diario
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTotalSeconds(prev => prev + 1);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

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
      onFinishChallenge(score, accuracy, totalSeconds);
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
