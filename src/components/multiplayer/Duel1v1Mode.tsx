import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Clock, Trophy, CheckCircle2, XCircle, Flame, ArrowRight, Zap, Target } from 'lucide-react';
import { Country, CountryMapStatus } from '../../types/country';
import { DuelMode, DuelQuestion, DuelState, PlayerProfile, PlayerRoundResult } from '../../types/multiplayer';
import { WorldMap } from '../map/WorldMap';
import { PinpointWorldMap } from '../map/PinpointWorldMap';
import { calculateHaversineDistance, calculatePinpointScore } from '../../utils/haversineScoring';
import { useAudioFeedback } from '../../hooks/useAudioFeedback';
import { multiplayerService } from '../../services/multiplayerService';
import confetti from 'canvas-confetti';

interface Duel1v1ModeProps {
  questions: DuelQuestion[];
  playerProfile: PlayerProfile;
  rivalProfile: PlayerProfile;
  duelMode: DuelMode;
  isRanked: boolean;
  onFinishDuel: (duelState: DuelState) => void;
  onQuit: () => void;
  isGeekMode?: boolean;
}

export const Duel1v1Mode: React.FC<Duel1v1ModeProps> = ({
  questions,
  playerProfile,
  rivalProfile,
  duelMode,
  isRanked,
  onFinishDuel,
  onQuit,
  isGeekMode = false
}) => {
  const { playCorrectSound, playWrongSound, playVictorySound } = useAudioFeedback();

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [playerResults, setPlayerResults] = useState<PlayerRoundResult[]>([]);
  const [playerScore, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [countryStatuses, setCountryStatuses] = useState<Record<string, CountryMapStatus>>({});
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(isRanked ? 25 : 15);
  const [lastPinpointClick, setLastPinpointClick] = useState<[number, number] | null>(null);

  const questionStartTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<any>(null);

  // Generar las respuestas simuladas del rival al inicio del duelo
  const rivalResults = useRef<PlayerRoundResult[]>(
    multiplayerService.simulateRivalPerformance(questions, rivalProfile.elo)
  ).current;

  const rivalScore = rivalResults
    .slice(0, currentIndex + 1)
    .reduce((acc, r) => acc + r.points, 0);

  const currentQuestion = questions[currentIndex] || null;

  // Temporizador regresivo: 25s TOTALES para modo Ranked, 15s POR PREGUNTA para modo Amistoso
  useEffect(() => {
    questionStartTimeRef.current = Date.now();

    if (isRanked) {
      if (currentIndex === 0) {
        setTimeLeft(25);
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
          setTimeLeft(prev => {
            if (prev <= 1) {
              clearInterval(timerRef.current);
              handleRankedTimeOut();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } else {
      setTimeLeft(15);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleTimeOut();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (!isRanked && timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, isRanked]);

  // Manejar agotamiento total del tiempo en modo Ranked (25 segundos finalizados)
  const handleRankedTimeOut = () => {
    playWrongSound();
    setPlayerResults(prevResults => {
      const finalResults = [...prevResults];
      for (let i = finalResults.length; i < questions.length; i++) {
        finalResults.push({
          questionIndex: i,
          userSuccess: false,
          timeSpentMs: 5000,
          points: 0
        });
      }
      finishDuel(finalResults);
      return finalResults;
    });
  };

  // Manejar tiempo agotado en una pregunta individual (Modo Amistoso)
  const handleTimeOut = () => {
    if (isEvaluating) return;
    setIsEvaluating(true);
    playWrongSound();
    setStreak(0);

    const timeSpentMs = 15000;
    const newResult: PlayerRoundResult = {
      questionIndex: currentIndex,
      userSuccess: false,
      timeSpentMs,
      points: 0
    };

    const updatedResults = [...playerResults, newResult];
    setPlayerResults(updatedResults);

    setTimeout(() => {
      advanceNext(updatedResults);
    }, 1000);
  };

  // Clic en el globo 3D (Modo Puntería)
  const handlePinpointClick = (coords: [number, number]) => {
    if (!currentQuestion || isEvaluating) return;

    setLastPinpointClick(coords);
    const targetCoords: [number, number] = currentQuestion.cityTarget?.coordinates || [currentQuestion.country.latlng[1], currentQuestion.country.latlng[0]];
    const distanceKm = calculateHaversineDistance(coords, targetCoords);
    const { score } = calculatePinpointScore(distanceKm, false, false);

    const timeSpentMs = Date.now() - questionStartTimeRef.current;
    playCorrectSound();

    const newScore = playerScore + score;
    setScore(newScore);

    const newResult: PlayerRoundResult = {
      questionIndex: currentIndex,
      userSuccess: score > 300,
      timeSpentMs,
      points: score,
      distanceKm
    };

    const updatedResults = [...playerResults, newResult];
    setPlayerResults(updatedResults);

    // Avance inmediato en Ranked / Puntería sin delay ("nada más pulsar ya te sale el siguiente")
    const nextIdx = currentIndex + 1;
    if (nextIdx < questions.length) {
      setCurrentIndex(nextIdx);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      finishDuel(updatedResults);
    }
  };

  // Clic en país del mapa 2D (Modos Banderas, Capitales, Países)
  const handleCountryClick = (clickedCountry: Country) => {
    if (!currentQuestion || isEvaluating) return;

    const timeSpentMs = Date.now() - questionStartTimeRef.current;
    const isCorrect = clickedCountry.cca3.toUpperCase() === currentQuestion.country.cca3.toUpperCase();

    let points = 0;
    if (isCorrect) {
      playCorrectSound();
      const speedBonus = Math.max(0, Math.round(100 - (timeSpentMs / 1000) * 5));
      points = 100 + speedBonus;
      setScore(prev => prev + points);
      setStreak(prev => prev + 1);
    } else {
      playWrongSound();
      setStreak(0);
    }

    const newResult: PlayerRoundResult = {
      questionIndex: currentIndex,
      userSuccess: isCorrect,
      timeSpentMs,
      points
    };

    const updatedResults = [...playerResults, newResult];
    setPlayerResults(updatedResults);

    if (isRanked) {
      // Avance inmediato en Ranked
      const nextIdx = currentIndex + 1;
      if (nextIdx < questions.length) {
        setCurrentIndex(nextIdx);
      } else {
        if (timerRef.current) clearInterval(timerRef.current);
        finishDuel(updatedResults);
      }
    } else {
      // Modo casual con breve feedback de color
      setIsEvaluating(true);
      setCountryStatuses({
        [clickedCountry.cca3.toUpperCase()]: isCorrect ? 'correct' : 'wrong',
        ...(isCorrect ? {} : { [currentQuestion.country.cca3.toUpperCase()]: 'hint' })
      });

      setTimeout(() => {
        setIsEvaluating(false);
        setCountryStatuses({});
        const nextIdx = currentIndex + 1;
        if (nextIdx < questions.length) {
          setCurrentIndex(nextIdx);
        } else {
          finishDuel(updatedResults);
        }
      }, 1000);
    }
  };

  // Avanzar a la siguiente pregunta o finalizar el duelo
  const advanceNext = (currentResults: PlayerRoundResult[]) => {
    setIsEvaluating(false);
    setCountryStatuses({});

    const nextIdx = currentIndex + 1;
    if (nextIdx < questions.length) {
      setCurrentIndex(nextIdx);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      finishDuel(currentResults);
    }
  };

  // Finalizar duelo y procesar ELO
  const finishDuel = (finalResults: PlayerRoundResult[]) => {
    if (timerRef.current) clearInterval(timerRef.current);

    const playerTotalScore = finalResults.reduce((acc, r) => acc + r.points, 0);
    const playerTotalTime = finalResults.reduce((acc, r) => acc + r.timeSpentMs, 0);
    const rivalTotalScore = rivalResults.reduce((acc, r) => acc + r.points, 0);
    const rivalTotalTime = rivalResults.reduce((acc, r) => acc + r.timeSpentMs, 0);

    const { updatedProfile, eloChange, winner, xpEarned } = multiplayerService.processDuelResult(
      playerTotalScore,
      rivalTotalScore,
      playerTotalTime,
      rivalTotalTime,
      isRanked
    );

    if (winner === 'player') {
      playVictorySound();
      try {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      } catch (e) {}
    }

    const state: DuelState = {
      id: `duel_${Date.now()}`,
      type: isRanked ? 'ranked' : 'friendly',
      duelMode,
      questions,
      player: updatedProfile,
      rival: rivalProfile,
      playerResults: finalResults,
      rivalResults,
      playerScore: playerTotalScore,
      rivalScore: rivalTotalScore,
      playerTimeTotalMs: playerTotalTime,
      rivalTimeTotalMs: rivalTotalTime,
      winner,
      eloChange,
      xpEarned
    };

    onFinishDuel(state);
  };

  if (!currentQuestion) return null;

  // Estilos del temporizador según el tiempo restante (Normal > 10s | Amarillo <= 10s | Rojo <= 3s)
  let timerBadgeStyle = 'bg-zinc-900 border-zinc-700 text-cyan-300';
  if (timeLeft <= 3) {
    timerBadgeStyle = 'bg-rose-950/90 border-rose-600 text-red-500 animate-pulse';
  } else if (timeLeft <= 10) {
    timerBadgeStyle = 'bg-amber-950/80 border-amber-500 text-yellow-400';
  }

  return (
    <div className="flex flex-col h-full min-h-0 gap-3 max-w-7xl mx-auto w-full px-1 sm:px-2 overflow-hidden select-none">
      {/* 1. Marcador Comparativo 1v1 Superior */}
      <div className="bg-[#18181B] border border-zinc-800 p-3.5 sm:p-4 rounded-2xl shadow-card-subtle flex items-center justify-between gap-4 flex-wrap shrink-0">
        {/* Jugador */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-950/60 border border-indigo-500/50 flex items-center justify-center text-xl shrink-0">
            {playerProfile.avatar}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs sm:text-sm text-zinc-100">{playerProfile.name}</span>
              <span className="text-[10px] font-mono text-amber-400 font-bold bg-zinc-900 px-1.5 py-0.5 rounded">
                {playerProfile.rank.icon} {playerProfile.elo}
              </span>
            </div>
            <div className="text-lg font-mono font-black text-emerald-400 leading-none mt-0.5">
              {playerScore} <span className="text-xs text-zinc-500 font-sans">pts</span>
            </div>
          </div>
        </div>

        {/* Centro: Reloj y Pregunta */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 bg-zinc-900 rounded-xl border border-zinc-800 font-mono text-xs font-bold text-zinc-300">
            Ubicación <span className="text-indigo-400 text-sm">{currentIndex + 1}</span> / {questions.length}
          </div>

          <div className={`px-3 py-1 rounded-xl border font-mono text-sm font-bold flex items-center gap-1.5 ${timerBadgeStyle}`}>
            <Clock className="w-4 h-4" />
            <span>{timeLeft}s</span>
          </div>
        </div>

        {/* Rival */}
        <div className="flex items-center gap-3 text-right">
          <div>
            <div className="flex items-center justify-end gap-1.5">
              <span className="text-[10px] font-mono text-amber-400 font-bold bg-zinc-900 px-1.5 py-0.5 rounded">
                {rivalProfile.rank.icon} {rivalProfile.elo}
              </span>
              <span className="font-bold text-xs sm:text-sm text-zinc-100">{rivalProfile.name}</span>
            </div>
            <div className="text-lg font-mono font-black text-amber-400 leading-none mt-0.5">
              {rivalScore} <span className="text-xs text-zinc-500 font-sans">pts</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-950/60 border border-rose-500/50 flex items-center justify-center text-xl shrink-0">
            {rivalProfile.avatar}
          </div>
        </div>
      </div>

      {/* 2. Pregunta Activa */}
      <div className="bg-[#18181B] border border-zinc-800 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-4 flex-wrap shrink-0 border-l-4 border-l-indigo-500">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-950/50 border border-indigo-800/60 rounded-xl text-indigo-400 shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-bold">
              {duelMode === 'flags' ? 'Adivina la Bandera 🚩' : duelMode === 'capitals' ? 'Capitales del Mundo 🏛️' : 'Localiza en el Mapa 🗺️'}
            </span>
            <h3 className="text-base sm:text-lg font-serif font-bold text-zinc-100 mt-0.5">
              {currentQuestion.promptText}
            </h3>
          </div>
        </div>

        {/* Si es pregunta de Bandera, mostrar la bandera */}
        {currentQuestion.questionType === 'flag' && (
          <div className="w-20 h-13 rounded-lg overflow-hidden border border-zinc-700 shadow-sm shrink-0">
            <img src={currentQuestion.country.flagSvg} alt="Bandera" className="w-full h-full object-cover" />
          </div>
        )}

        <button
          onClick={onQuit}
          className="text-xs text-zinc-400 hover:text-zinc-200 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition"
        >
          Abandonar
        </button>
      </div>

      {/* 3. Mapa Interactivo Principal (Globo 3D para Pinpoint, Mapa 2D para Países/Banderas) */}
      <div className="relative flex-1 min-h-[360px] h-[calc(100vh-250px)] max-h-[calc(100vh-250px)] rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
        {duelMode === 'pinpoint' ? (
          <PinpointWorldMap
            clickedCoords={lastPinpointClick}
            targetCoords={currentQuestion.cityTarget?.coordinates || [currentQuestion.country.latlng[1], currentQuestion.country.latlng[0]]}
            onMapClick={handlePinpointClick}
            isEvaluated={false}
          />
        ) : (
          <WorldMap
            countryStatuses={countryStatuses}
            continent="World"
            onCountryClick={handleCountryClick}
            interactive={!isEvaluating}
            isGeekMode={isGeekMode}
            enableTooltip={true}
          />
        )}
      </div>
    </div>
  );
};
