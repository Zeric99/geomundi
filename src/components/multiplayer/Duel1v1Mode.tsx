import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Clock, Trophy, CheckCircle2, XCircle, Flame, ArrowRight, Zap, Target, Sparkles, Flag, AlertTriangle } from 'lucide-react';
import { Country, CountryMapStatus } from '../../types/country';
import { DuelMode, DuelQuestion, DuelState, PlayerProfile, PlayerRoundResult } from '../../types/multiplayer';
import { WorldMap } from '../map/WorldMap';
import { PinpointWorldMap, PinHistoryItem } from '../map/PinpointWorldMap';
import { calculateHaversineDistance, calculatePinpointScore } from '../../utils/haversineScoring';
import { useAudioFeedback } from '../../hooks/useAudioFeedback';
import { multiplayerService } from '../../services/multiplayerService';
import { CITIES_DATASET } from '../../data/citiesData';
import confetti from 'canvas-confetti';
import { PlayerAvatar } from '../common/PlayerAvatar';

interface Duel1v1ModeProps {
  questions: DuelQuestion[];
  playerProfile: PlayerProfile;
  rivalProfile?: PlayerProfile | null;
  recordedRivalResults?: PlayerRoundResult[];
  duelMode: DuelMode;
  isRanked: boolean;
  isChallengeCreation?: boolean;
  challengeId?: string;
  onFinishDuel: (duelState: DuelState) => void;
  onQuit: () => void;
  isGeekMode?: boolean;
}

export const Duel1v1Mode: React.FC<Duel1v1ModeProps> = ({
  questions,
  playerProfile,
  rivalProfile = null,
  recordedRivalResults,
  duelMode,
  isRanked,
  isChallengeCreation = false,
  challengeId,
  onFinishDuel,
  onQuit,
  isGeekMode = false
}) => {
  const { playCorrectSound, playWrongSound, playVictorySound, playTickSound } = useAudioFeedback();

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [playerResults, setPlayerResults] = useState<PlayerRoundResult[]>([]);
  const [playerScore, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [countryStatuses, setCountryStatuses] = useState<Record<string, CountryMapStatus>>({});
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(isRanked ? 30 : 15);
  const [lastPinpointClick, setLastPinpointClick] = useState<[number, number] | null>(null);
  const [showSurrenderConfirm, setShowSurrenderConfirm] = useState<boolean>(false);

  // Historial de pines 3D y notificación del último resultado para el jugador en Ranked
  const [pinHistory, setPinHistory] = useState<PinHistoryItem[]>([]);
  const [lastResultToast, setLastResultToast] = useState<{
    cityName: string;
    score: number;
    distanceKm?: number;
    badgeTitle: string;
  } | null>(null);

  const questionStartTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<any>(null);

  // Resultados del rival (grabados de una partida real de otro jugador, o vacíos si es creación de reto)
  const rivalResults = useRef<PlayerRoundResult[]>(
    recordedRivalResults && recordedRivalResults.length > 0
      ? recordedRivalResults
      : []
  ).current;

  const rivalScore = rivalResults
    .slice(0, currentIndex + 1)
    .reduce((acc, r) => acc + r.points, 0);

  const currentQuestion = questions[currentIndex] || null;

  // Temporizador regresivo: 30s TOTALES para modo Ranked, 15s POR PREGUNTA para modo Amistoso
  useEffect(() => {
    questionStartTimeRef.current = Date.now();

    if (isRanked) {
      if (currentIndex === 0) {
        setTimeLeft(30);
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

  // Tick de reloj: reacciona a timeLeft directamente para evitar stale closure
  // Activo mientras el timer corre (timeLeft > 0) y no estamos evaluando
  useEffect(() => {
    if (timeLeft > 0 && !isEvaluating) {
      playTickSound(timeLeft <= 5);
    }
  }, [timeLeft]);

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
    const cityMatch = currentQuestion.cityTarget || CITIES_DATASET.find(c => c.cca3 === currentQuestion.country.cca3);
    const targetCoords: [number, number] = cityMatch?.coordinates || [
      currentQuestion.country.latlng[1],
      currentQuestion.country.latlng[0]
    ];
    const distanceKm = calculateHaversineDistance(coords, targetCoords);
    const { score, badgeTitle } = calculatePinpointScore(distanceKm, false, false);

    const timeSpentMs = Date.now() - questionStartTimeRef.current;
    playCorrectSound();

    const newScore = playerScore + score;
    setScore(newScore);

    const cityName = cityMatch?.nameEs || currentQuestion.country.nameEs;

    // Registrar en el historial de pines para que sigan visibles en el Globo 3D
    const historyItem: PinHistoryItem = {
      clickedCoords: coords,
      targetCoords,
      distanceKm,
      score,
      cityName
    };
    setPinHistory(prev => [...prev, historyItem]);

    // Toast flotante con la distancia y los puntos de esta ubicación
    setLastResultToast({
      cityName,
      score,
      distanceKm,
      badgeTitle
    });

    const newResult: PlayerRoundResult = {
      questionIndex: currentIndex,
      userSuccess: score > 300,
      timeSpentMs,
      points: score,
      distanceKm
    };

    const updatedResults = [...playerResults, newResult];
    setPlayerResults(updatedResults);

    // Avance inmediato en Ranked / Puntería
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

    // Feedback visual en el mapa: verde si acierta, rojo si falla
    setIsEvaluating(true);
    const clickedCode = clickedCountry.cca3.toUpperCase();
    setCountryStatuses({
      [clickedCode]: isCorrect ? 'correct' : 'wrong'
    });

    // Retardo ágil de 650ms para que se aprecie con claridad el verde o rojo antes de pasar a la siguiente
    setTimeout(() => {
      setIsEvaluating(false);
      setCountryStatuses({});

      const nextIdx = currentIndex + 1;
      if (nextIdx < questions.length) {
        setCurrentIndex(nextIdx);
        questionStartTimeRef.current = Date.now();
      } else {
        if (timerRef.current) clearInterval(timerRef.current);
        finishDuel(updatedResults);
      }
    }, 650);
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

    // Caso 1: Modo creación de desafío (grabar partida personal)
    if (isChallengeCreation) {
      playVictorySound();
      try {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      } catch (e) {}

      const state: DuelState = {
        id: `challenge_run_${Date.now()}`,
        type: 'ranked',
        duelMode,
        questions,
        player: playerProfile,
        rival: playerProfile,
        playerResults: finalResults,
        rivalResults: [],
        playerScore: playerTotalScore,
        rivalScore: 0,
        playerTimeTotalMs: playerTotalTime,
        rivalTimeTotalMs: 0,
        winner: 'player',
        eloChange: 0,
        xpEarned: 150,
        isChallengeCreation: true
      };

      onFinishDuel(state);
      return;
    }

    // Caso 2: Modo retar desafío / 1v1
    const effectiveRival = rivalProfile || {
      id: 'rival_unknown',
      name: 'Rival',
      avatar: '🎓',
      elo: 1200,
      rank: multiplayerService.getRankInfo(1200),
      wins: 0,
      losses: 0,
      streak: 0,
      xp: 0,
      level: 1
    };

    const { updatedProfile, eloChange, winner, xpEarned } = multiplayerService.processDuelResult(
      playerTotalScore,
      rivalTotalScore,
      playerTotalTime,
      rivalTotalTime,
      isRanked,
      false,
      effectiveRival.elo,
      duelMode,
      playerProfile
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
      rival: effectiveRival,
      playerResults: finalResults,
      rivalResults,
      playerScore: playerTotalScore,
      rivalScore: rivalTotalScore,
      playerTimeTotalMs: playerTotalTime,
      rivalTimeTotalMs: rivalTotalTime,
      winner,
      eloChange,
      xpEarned,
      challengeId
    };

    onFinishDuel(state);
  };

  // Prevenir abandono accidental o reinicio tramposo por recarga/cierre de pestaña
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      const msg = isChallengeCreation
        ? '¿Estás seguro de que quieres salir? Tu reto se publicará con los puntos que lleves hasta ahora.'
        : '¿Estás seguro de que quieres salir? Te contará como derrota.';
      e.returnValue = msg;
      return msg;
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isChallengeCreation]);

  // Confirmar rendición / abandono (cuenta como derrota en 1v1 o publica con puntos actuales en creación)
  const handleConfirmSurrender = () => {
    setShowSurrenderConfirm(false);
    if (timerRef.current) clearInterval(timerRef.current);

    if (isChallengeCreation) {
      // Para evitar trampas/reinicios, si el creador sale a medias, el reto se publica
      // igualmente con la puntuación que lleve (las preguntas restantes puntúan 0).
      const filledResults: PlayerRoundResult[] = [...playerResults];
      for (let i = playerResults.length; i < questions.length; i++) {
        filledResults.push({
          questionIndex: i,
          userSuccess: false,
          timeSpentMs: 0,
          points: 0
        });
      }

      const playerTotalScore = filledResults.reduce((acc, r) => acc + r.points, 0);
      const playerTotalTime = Math.max(
        filledResults.reduce((acc, r) => acc + r.timeSpentMs, 0),
        (30 - timeLeft) * 1000
      );

      const state: DuelState = {
        id: `challenge_run_${Date.now()}`,
        type: 'ranked',
        duelMode,
        questions,
        player: playerProfile,
        rival: playerProfile,
        playerResults: filledResults,
        rivalResults: [],
        playerScore: playerTotalScore,
        rivalScore: 0,
        playerTimeTotalMs: playerTotalTime,
        rivalTimeTotalMs: 0,
        winner: 'player',
        eloChange: 0,
        xpEarned: Math.max(25, Math.round(playerTotalScore / 30)),
        isChallengeCreation: true
      };

      onFinishDuel(state);
      return;
    }

    const effectiveRival = rivalProfile || {
      id: 'rival_unknown',
      name: 'Rival',
      avatar: '🎓',
      elo: 1200,
      rank: multiplayerService.getRankInfo(1200),
      wins: 0,
      losses: 0,
      streak: 0,
      xp: 0,
      level: 1
    };

    const playerTotalScore = playerResults.reduce((acc, r) => acc + r.points, 0);
    const playerTotalTime = playerResults.reduce((acc, r) => acc + r.timeSpentMs, 0);
    const rivalTotalScore = rivalResults.reduce((acc, r) => acc + r.points, 0);
    const rivalTotalTime = rivalResults.reduce((acc, r) => acc + r.timeSpentMs, 0);

    // El rival supera la puntuación para consolidar la derrota inequívoca
    const finalRivalScore = Math.max(rivalTotalScore, playerTotalScore + 1);

    const { updatedProfile, eloChange } = multiplayerService.processDuelResult(
      playerTotalScore,
      finalRivalScore,
      playerTotalTime,
      rivalTotalTime || 10000,
      isRanked,
      false,
      effectiveRival.elo,
      duelMode,
      playerProfile
    );

    const surrenderEloChange = Math.min(-16, -Math.abs(eloChange));

    const state: DuelState = {
      id: `surrender_${Date.now()}`,
      type: isRanked ? 'ranked' : 'friendly',
      duelMode,
      questions,
      player: {
        ...updatedProfile,
        losses: (playerProfile.losses || 0) + 1,
        streak: 0
      },
      rival: effectiveRival,
      playerResults,
      rivalResults,
      playerScore: playerTotalScore,
      rivalScore: finalRivalScore,
      playerTimeTotalMs: playerTotalTime,
      rivalTimeTotalMs: rivalTotalTime || 10000,
      winner: 'rival',
      eloChange: surrenderEloChange,
      xpEarned: 25,
      challengeId,
      isChallengeCreation: false,
      isSurrender: true
    };

    onFinishDuel(state);
  };

  if (!currentQuestion) return null;

  // Estilos del temporizador según el tiempo restante
  let timerBadgeStyle = 'bg-zinc-900 border-zinc-700 text-cyan-300';
  if (timeLeft <= 3) {
    timerBadgeStyle = 'bg-rose-950/90 border-rose-600 text-red-500 animate-pulse';
  } else if (timeLeft <= 10) {
    timerBadgeStyle = 'bg-amber-950/80 border-amber-500 text-yellow-400';
  }

  return (
    <div className="flex flex-col h-full max-h-full w-full gap-1.5 px-0.5 sm:px-1.5 py-1 overflow-hidden select-none">
      {/* BANNER ÚNICO UNIFICADO (Mockup media_1789603786563.png) */}
      <div className="bg-[#12141c] border border-zinc-800/90 rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 shadow-2xl flex items-center justify-between gap-3 shrink-0 text-white select-none relative overflow-hidden">
        {/* Acabado sutil con resplandor morado/cyan a la izquierda */}
        <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-cyan-500 via-purple-500 to-indigo-500 rounded-l-2xl" />

        {/* 1. Izquierda: Avatar + Nombre + ELO + Puntos */}
        <div className="flex items-center gap-2.5 shrink-0 pl-1">
          <PlayerAvatar
            avatar={playerProfile.avatar}
            name={playerProfile.name}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-bold text-lg flex items-center justify-center shrink-0 shadow-md"
          />
          <div className="flex flex-col justify-center leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs sm:text-sm text-zinc-100 truncate max-w-[90px] sm:max-w-[130px]">{playerProfile.name}</span>
              <span className="text-[10px] font-mono text-amber-400 font-bold bg-zinc-900/90 px-1.5 py-0.5 rounded border border-amber-500/30 flex items-center gap-1 shrink-0">
                {playerProfile.rank.icon} {playerProfile.elo}
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 mt-0.5">
              {playerScore} <span className="text-[10px] font-sans font-normal text-zinc-400">pts</span>
            </span>
          </div>
        </div>

        {/* 2. Centro: Icono Modo + Título Modo en rojo + Pregunta Prompt */}
        <div className="flex items-center gap-3 min-w-0 flex-1 px-3 border-l border-r border-zinc-800/80">
          <div className="w-9 h-9 rounded-xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0 shadow-sm">
            {duelMode === 'flags' ? (
              <Flag className="w-5 h-5 text-amber-400" />
            ) : duelMode === 'capitals' ? (
              <Target className="w-5 h-5 text-purple-400" />
            ) : (
              <Target className="w-5 h-5 text-cyan-400" />
            )}
          </div>

          <div className="flex flex-col justify-center min-w-0 leading-tight">
            <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-rose-500 flex items-center gap-1">
              {duelMode === 'flags' ? 'ADIVINA LA BANDERA' : duelMode === 'capitals' ? 'CAPITALES MUNDIALES' : duelMode === 'pinpoint' ? 'PUNTERÍA GEOGRÁFICA' : 'PAÍSES EN EL MAPA'}
              <span className="text-[8px] text-rose-400">►</span>
            </span>
            <h3 className="text-xs sm:text-sm md:text-base font-bold text-white truncate mt-0.5">
              {currentQuestion.promptText}
            </h3>
          </div>
        </div>

        {/* 3. Derecha: Ubicación + Reloj + Bandera/Recurso + Rival + Abandonar */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Ubicación Pill */}
          <div className="bg-[#181a26] border border-zinc-800 px-3 py-1.5 rounded-xl font-mono text-xs font-bold text-zinc-300 hidden sm:flex items-center gap-1">
            <span>Ubicación</span>
            <span className="text-cyan-400 text-sm font-black">{currentIndex + 1}</span>
            <span className="text-zinc-500">/ {questions.length}</span>
          </div>

          {/* Temporizador Pill */}
          <div className={`px-3 py-1.5 rounded-xl border font-mono text-xs sm:text-sm font-bold flex items-center gap-1.5 shrink-0 ${timerBadgeStyle}`}>
            <Clock className="w-4 h-4" />
            <span>{timeLeft}s</span>
          </div>

          {/* Bandera si es modo bandera */}
          {currentQuestion.questionType === 'flag' && (
            <div className="w-12 sm:w-14 h-8 sm:h-9 rounded-lg overflow-hidden border border-zinc-700 shadow-md shrink-0">
              <img src={currentQuestion.country.flagSvg} alt="Bandera" className="w-full h-full object-cover" />
            </div>
          )}

          {/* Estado de Rival si no es creación */}
          {!isChallengeCreation && rivalProfile && (
            <div className="hidden lg:flex items-center gap-2 bg-zinc-900/90 border border-zinc-800 px-2.5 py-1 rounded-xl shrink-0">
              <PlayerAvatar avatar={rivalProfile.avatar} name={rivalProfile.name} className="w-6 h-6 rounded-lg text-xs" />
              <span className="text-xs font-bold text-zinc-300 truncate max-w-[80px]">{rivalProfile.name}</span>
              <span className="text-xs font-mono font-bold text-amber-400">{rivalScore} pts</span>
            </div>
          )}

          {/* Botón Abandonar */}
          <button
            onClick={() => setShowSurrenderConfirm(true)}
            className="px-3.5 py-1.5 rounded-xl bg-zinc-800/90 hover:bg-zinc-700 text-zinc-300 hover:text-white font-bold text-xs border border-zinc-700 transition-all active:scale-95 shrink-0"
          >
            Abandonar
          </button>
        </div>
      </div>

      {/* Banner Toast flotante del Tiro Anterior (Puntería 3D) */}
      {lastResultToast && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#12141c] border border-cyan-500/40 px-4 py-1.5 rounded-xl text-xs flex items-center justify-between gap-3 shadow-lg text-zinc-200 font-mono shrink-0"
        >
          <div className="flex items-center gap-2">
            <span className="text-cyan-400 font-bold">📍 Tiro anterior ({lastResultToast.cityName}):</span>
            <span className="text-zinc-300">{lastResultToast.distanceKm?.toLocaleString()} km</span>
            <span className="text-zinc-500">•</span>
            <span className="text-cyan-300 font-sans">{lastResultToast.badgeTitle}</span>
          </div>
          <div className="text-emerald-400 font-extrabold text-sm font-mono">
            +{lastResultToast.score} pts
          </div>
        </motion.div>
      )}

      {/* 2. Mapa Interactivo Principal (Ocupa el 100% de la pantalla restante sin scroll) */}
      <div className="relative flex-1 min-h-0 w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-zinc-800/90 bg-[#050b14]">
        {duelMode === 'pinpoint' ? (
          <PinpointWorldMap
            clickedCoords={lastPinpointClick}
            targetCoords={(currentQuestion.cityTarget || CITIES_DATASET.find(c => c.cca3 === currentQuestion.country.cca3))?.coordinates || [currentQuestion.country.latlng[1], currentQuestion.country.latlng[0]]}
            onMapClick={handlePinpointClick}
            isEvaluated={false}
            previousPins={pinHistory}
            cityName={(currentQuestion.cityTarget || CITIES_DATASET.find(c => c.cca3 === currentQuestion.country.cca3))?.nameEs || currentQuestion.country.nameEs}
          />
        ) : (
          <WorldMap
            countryStatuses={countryStatuses}
            continent="World"
            onCountryClick={handleCountryClick}
            interactive={!isEvaluating}
            isGeekMode={isGeekMode}
            enableTooltip={false}
            isCompetitive={true}
          />
        )}
      </div>

      {/* Modal de Confirmación de Abandono */}
      <AnimatePresence>
        {showSurrenderConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150 select-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#18181b] border border-zinc-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center"
            >
              <div className={`w-12 h-12 rounded-full border flex items-center justify-center mx-auto ${
                isChallengeCreation 
                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' 
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
              }`}>
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-base sm:text-lg font-bold text-zinc-100 font-serif">
                  ¿Estás seguro de que quieres salir?
                </h3>
                {isChallengeCreation ? (
                  <div className="space-y-2">
                    <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl py-2 px-3 text-amber-300 font-bold text-xs">
                      ⚠️ Tu reto se publicará con tu puntuación actual
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Para garantizar el juego limpio y evitar reinicios fraudulentos, si sales ahora tu reto se publicará en la comunidad con los puntos que lleves hasta este momento (las preguntas restantes puntuarán 0).
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="bg-rose-500/10 border border-rose-500/25 rounded-xl py-2 px-3 text-rose-300 font-bold text-xs">
                      ⚠️ Te contará como derrota
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Abandonar la partida en curso te restará puntos de Elo y se romperá tu racha de victorias.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSurrenderConfirm(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs transition-colors"
                >
                  Seguir jugando
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSurrender}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-white font-bold text-xs transition-colors shadow-lg ${
                    isChallengeCreation 
                      ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-900/20' 
                      : 'bg-rose-600 hover:bg-rose-500 shadow-rose-900/20'
                  }`}
                >
                  {isChallengeCreation ? 'Salir y publicar' : 'Salir y rendirse'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
