import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Target, MapPin, Award, Compass, ArrowRight, RotateCcw, Sparkles, Trophy, Globe, Info, Zap, Navigation, Share2, Check, Layers } from 'lucide-react';
import { Continent } from '../../types/country';
import { CityTarget, PinpointResult, GameSummary } from '../../types/game';
import { getRandomCities, CityThemeCategory } from '../../data/citiesData';
import { calculateHaversineDistance, calculatePinpointScore, checkCountryAndContinentMatch } from '../../utils/haversineScoring';
import { PinpointWorldMap, PinHistoryItem } from '../map/PinpointWorldMap';
import { generateShareText, copyToClipboard } from '../../utils/shareUtils';
import { achievementService } from '../../services/achievementService';
import { useAudioFeedback } from '../../hooks/useAudioFeedback';
import confetti from 'canvas-confetti';

interface CityPinpointModeProps {
  continent?: Continent;
  themeCategory?: CityThemeCategory;
  onFinishGame?: (summary: GameSummary) => void;
  onReturnToMenu?: () => void;
}

export const CityPinpointMode: React.FC<CityPinpointModeProps> = ({
  continent = 'World',
  themeCategory = 'all',
  onFinishGame,
  onReturnToMenu
}) => {
  const { playCorrectSound, playWrongSound } = useAudioFeedback();

  // Inicializar conjunto de 5 ciudades para la partida
  const [citiesList, setCitiesList] = useState<CityTarget[]>(() => getRandomCities(5, continent, themeCategory));
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  
  const [clickedCoords, setClickedCoords] = useState<[number, number] | null>(null);
  const [isEvaluated, setIsEvaluated] = useState<boolean>(false);
  const [currentResult, setCurrentResult] = useState<PinpointResult | null>(null);
  const [resultsHistory, setResultsHistory] = useState<PinpointResult[]>([]);
  const [totalScore, setTotalScore] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);

  // Modo rápido (avance automático sin requerir clic manual en Siguiente Ciudad)
  const [isFastMode, setIsFastMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('geostrike_pinpoint_fast_mode');
      return saved !== null ? saved === 'true' : false; // Por defecto manual para leer la curiosidad
    } catch (e) {
      return false;
    }
  });

  const toggleFastMode = useCallback(() => {
    setIsFastMode(prev => {
      const next = !prev;
      try {
        localStorage.setItem('geostrike_pinpoint_fast_mode', String(next));
      } catch (e) {}
      return next;
    });
  }, []);

  // Toast flotante del último tiro completado (igual que en multijugador)
  const [lastResultToast, setLastResultToast] = useState<{
    cityName: string;
    score: number;
    distanceKm: number;
    badgeTitle: string;
  } | null>(null);

  const nextTimerRef = useRef<any>(null);

  // Cancelar temporizador de auto-avance si el usuario desactiva el modo rápido mientras está evaluando
  useEffect(() => {
    if (!isFastMode && nextTimerRef.current) {
      clearTimeout(nextTimerRef.current);
      nextTimerRef.current = null;
    }
  }, [isFastMode]);

  // Historial de pines para dibujarlos en el Globo 3D (igual que en multijugador)
  const previousPins = useMemo<PinHistoryItem[]>(() => {
    return resultsHistory.map(r => ({
      clickedCoords: r.clickedCoordinates,
      targetCoords: r.city.coordinates,
      distanceKm: r.distanceKm,
      score: r.score,
      cityName: r.city.nameEs
    }));
  }, [resultsHistory]);

  const currentCity = citiesList[currentIndex];

  // Reiniciar partida
  const handleRestartGame = useCallback(() => {
    if (nextTimerRef.current) clearTimeout(nextTimerRef.current);
    const newCities = getRandomCities(5, continent, themeCategory);
    setCitiesList(newCities);
    setCurrentIndex(0);
    setClickedCoords(null);
    setIsEvaluated(false);
    setCurrentResult(null);
    setResultsHistory([]);
    setTotalScore(0);
    setIsGameOver(false);
    setCopiedShare(false);
    setLastResultToast(null);
  }, [continent, themeCategory]);

  // Manejar el clic en el mapa
  const handleMapClick = useCallback((coords: [number, number]) => {
    if (isEvaluated || isGameOver || !currentCity) return;

    setClickedCoords(coords);
    
    // 1. Calcular distancia en kilómetros
    const distanceKm = calculateHaversineDistance(coords, currentCity.coordinates);
    
    // 2. Comprobar coincidencia de país o continente
    const { isSameCountry, isSameContinent } = checkCountryAndContinentMatch(
      coords,
      currentCity.cca3,
      currentCity.continent
    );

    // 3. Calcular puntos y medalla
    const { score, badgeTitle } = calculatePinpointScore(distanceKm, isSameCountry, isSameContinent);

    // Audio feedback táctico
    if (score >= 400) {
      playCorrectSound();
    } else {
      playWrongSound();
    }

    const result: PinpointResult = {
      city: currentCity,
      clickedCoordinates: coords,
      distanceKm,
      score,
      isSameCountry,
      isSameContinent,
      badgeTitle
    };

    setCurrentResult(result);
    setIsEvaluated(true);
    setTotalScore(prev => prev + score);

    // Disparar confeti si logra puntuación perfecta (< 30 km o >= 970 pts)
    if (score >= 970) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch (e) {}
    }

    // Si está activo el Modo Rápido, dar tiempo suficiente para ver la animación 3D completa
    // del rayo láser, la explosión y la distancia en km, y luego avanzar solo
    if (nextTimerRef.current) clearTimeout(nextTimerRef.current);
    if (isFastMode) {
      nextTimerRef.current = setTimeout(() => {
        handleNextCity(result);
      }, 2600);
    }

    // Evaluar logros de puntería inmediata (ej. cirujano < 50km, francotirador 1000 pts)
    achievementService.evaluateAchievements(
      { totalGamesPlayed: 0, totalScore: score, bestStreak: 0 },
      { mode: 'city_pinpoint', distanceKm, pinpointScore: score, correctCount: isSameCountry ? 1 : 0 }
    );
  }, [currentCity, isEvaluated, isGameOver, isFastMode, playCorrectSound, playWrongSound]);

  const handleNextCity = (resultToSave?: PinpointResult) => {
    if (nextTimerRef.current) clearTimeout(nextTimerRef.current);
    const res = resultToSave || currentResult;
    if (!res) return;

    // Toast flotante del tiro que acaba de terminar (como en multijugador)
    setLastResultToast({
      cityName: res.city.nameEs,
      score: res.score,
      distanceKm: res.distanceKm,
      badgeTitle: res.badgeTitle
    });

    const newHistory = [...resultsHistory, res];
    setResultsHistory(prev => {
      // Evitar duplicados si ya se guardó
      if (prev.length > currentIndex) return prev;
      return newHistory;
    });

    if (currentIndex + 1 < citiesList.length) {
      setCurrentIndex(prev => prev + 1);
      setClickedCoords(null);
      setIsEvaluated(false);
      setCurrentResult(null);
    } else {
      setIsGameOver(true);
      // Evaluar logros de final de partida de puntería
      const finalScore = newHistory.reduce((acc, r) => acc + r.score, 0);
      achievementService.evaluateAchievements(
        { totalGamesPlayed: 1, totalScore: finalScore, bestStreak: 0 },
        { 
          mode: 'city_pinpoint', 
          score: finalScore, 
          totalQuestions: citiesList.length, 
          correctCount: newHistory.filter(r => r.isSameCountry).length 
        }
      );
    }
  };

  const handleShareScore = async () => {
    const totalDist = resultsHistory.reduce((acc, r) => acc + r.distanceKm, 0);
    const text = generateShareText({
      score: totalScore,
      maxScore: citiesList.length * 1000,
      gameTitle: 'Puntería Geográfica',
      results: resultsHistory,
      totalDistanceKm: totalDist
    });

    const success = await copyToClipboard(text);
    if (success) {
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  // Renderizar la pantalla de fin de partida (Game Over Summary)
  if (isGameOver) {
    const maxPossible = citiesList.length * 1000;
    const percentage = Math.round((totalScore / maxPossible) * 100);

    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-300">
        {/* Tarjeta Principal de Resumen */}
        <div className="bg-[#18181B]/95 backdrop-blur-md border border-zinc-800 rounded-2xl p-6 sm:p-8 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="inline-flex items-center justify-center p-3 bg-cyan-950/60 border border-cyan-800/60 rounded-2xl mb-4 text-cyan-400">
            <Trophy className="w-10 h-10 animate-bounce" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-display font-bold text-zinc-100 mb-2 tracking-wide">
            ¡Desafío de Puntería Completado!
          </h2>
          <p className="text-sm text-zinc-400 mb-6">
            Has localizado las 5 ciudades del mapa con una precisión del {percentage}%
          </p>

          {/* Gran Medidor de Puntuación */}
          <div className="inline-block bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-900 border border-zinc-800 rounded-2xl px-8 py-4 mb-8 shadow-inner">
            <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-1">
              Puntuación Total Obtenida
            </div>
            <div className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 font-display">
              {totalScore.toLocaleString()} <span className="text-2xl text-zinc-500 font-normal">/ {maxPossible}</span>
            </div>
          </div>

          {/* Desglose Ciudad por Ciudad */}
          <div className="space-y-3 text-left mb-8">
            <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>Desglose por Ciudades</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {resultsHistory.map((res, idx) => (
                <div 
                  key={idx}
                  className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-3.5 flex items-center justify-between gap-3 shadow-sm hover:border-zinc-700 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{res.city.flagEmoji}</span>
                    <div>
                      <h4 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
                        <span>{res.city.nameEs}</span>
                        <span className="text-xs font-normal text-zinc-400">({res.city.countryNameEs})</span>
                      </h4>
                      <p className="text-xs text-zinc-400 font-mono mt-0.5">
                        📏 {res.distanceKm.toLocaleString()} km de distancia
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="text-base font-extrabold text-emerald-400 font-mono">
                      +{res.score} pts
                    </div>
                    <div className="text-[10px] font-medium text-zinc-400">
                      {res.badgeTitle}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Acciones con Botón de Compartir Emojis */}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button
              onClick={handleShareScore}
              className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 border ${
                copiedShare
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                  : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-200'
              }`}
            >
              {copiedShare ? <Check className="w-5 h-5 text-emerald-400" /> : <Share2 className="w-5 h-5 text-cyan-400" />}
              <span>{copiedShare ? '¡Puntuación Copiada!' : '📋 Compartir Resultado'}</span>
            </button>

            <button
              onClick={() => handleRestartGame()}
              className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-semibold rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Jugar Otra Vez</span>
            </button>

            {onReturnToMenu && (
              <button
                onClick={onReturnToMenu}
                className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium rounded-xl border border-zinc-700 transition-all active:scale-95"
              >
                Menú Principal
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Target Radar HUD (Cabecera Táctica) */}
      <div className="bg-[#141d28] border border-cyan-900/40 rounded-xl p-4 sm:p-5 shadow-card-subtle flex items-center justify-between gap-4 flex-wrap relative overflow-hidden border-l-4 border-l-cyan-500">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-cyan-950/60 border border-cyan-800/60 rounded-xl text-cyan-400 shadow-inner">
            <Target className="w-7 h-7 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-medium text-cyan-400/90 uppercase tracking-widest mb-0.5">
              <span>Localiza en el mapa</span>
              <span>•</span>
              <span>Ronda {currentIndex + 1} de {citiesList.length}</span>
            </div>

            <div className="flex items-center gap-3">
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-zinc-100 tracking-wide drop-shadow-sm">
                {currentCity.nameEs}
              </h2>
              <span className="text-xl sm:text-2xl" title={currentCity.countryNameEs}>
                {currentCity.flagEmoji}
              </span>
              <span className="text-xs bg-zinc-800/80 border border-zinc-700 text-zinc-300 px-2.5 py-1 rounded-md font-medium">
                {currentCity.countryNameEs}
              </span>
            </div>
          </div>
        </div>

        {/* Acciones del HUD: Modo Rápido Switch + Puntuación Acumulada */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Botón de Modo Rápido en el Banner Superior */}
          <button
            type="button"
            onClick={toggleFastMode}
            className={`px-3 py-2 rounded-xl border text-xs font-mono font-bold flex items-center gap-2 transition-all shadow-sm cursor-pointer ${
              isFastMode
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 hover:bg-amber-500/30'
                : 'bg-zinc-900/90 border-zinc-700/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600'
            }`}
            title={isFastMode ? 'Modo Rápido activado: avanzará automáticamente tras cada tiro' : 'Modo Lectura activado: pulsa "Siguiente Ciudad" para avanzar a tu ritmo'}
          >
            <Zap className={`w-3.5 h-3.5 ${isFastMode ? 'text-amber-400 fill-amber-400' : 'text-zinc-500'}`} />
            <span>{isFastMode ? 'Modo Rápido: ON' : 'Modo Rápido: OFF'}</span>
          </button>

          <div className="flex items-center gap-3 bg-zinc-900/90 border border-zinc-800 px-4 py-2 rounded-xl shadow-inner">
            <Award className="w-5 h-5 text-amber-400" />
            <div>
              <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                Puntos Acumulados
              </div>
              <div className="text-xl font-bold text-amber-300 font-mono">
                {totalScore.toLocaleString()} <span className="text-xs text-zinc-500 font-normal">pts</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Banner Toast del Tiro Anterior (Muestra distancia y puntos obtenidos mientras juegas la siguiente ronda) */}
      {lastResultToast && !isEvaluated && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#141d2b]/95 border border-cyan-500/40 px-4 py-2.5 rounded-xl text-xs flex items-center justify-between gap-3 shadow-lg text-zinc-200 font-mono"
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

      {/* Mapa Interactivo de Puntería */}
      <div className="relative flex-1 min-h-[380px] h-[calc(100vh-230px)] max-h-[calc(100vh-230px)] w-full rounded-xl overflow-hidden shadow-2xl border border-zinc-800 bg-[#050b14]">
        <PinpointWorldMap
          clickedCoords={clickedCoords}
          targetCoords={currentCity.coordinates}
          onMapClick={handleMapClick}
          isEvaluated={isEvaluated}
          previousPins={previousPins}
          continent={continent}
          cityName={currentCity.nameEs}
          enableCinematicZoom={false}
        />

        {/* Modal / Tarjeta de Evaluación al hacer clic */}
        {isEvaluated && currentResult && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-[420px] bg-[#141d2b]/95 backdrop-blur-md border border-cyan-800/80 rounded-2xl p-5 shadow-2xl z-30 animate-in slide-in-from-bottom-6 duration-300">
            <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <Sparkles className="w-4 h-4" />
                <span>{currentResult.badgeTitle}</span>
              </div>

              <div className="text-2xl font-black text-emerald-400 font-mono">
                +{currentResult.score} <span className="text-xs text-emerald-300 font-normal">pts</span>
              </div>
            </div>

            {/* Distancia y Suelos */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-xs bg-zinc-900/80 p-2.5 rounded-lg border border-zinc-800">
                <span className="text-zinc-400 flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Distancia al objetivo:</span>
                </span>
                <span className="font-bold font-mono text-zinc-100">
                  {currentResult.distanceKm.toLocaleString()} km
                </span>
              </div>

              {currentResult.isSameCountry && (
                <div className="text-[11px] text-teal-300 bg-teal-950/40 border border-teal-800/50 p-2 rounded-lg flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                  <span>¡Acertaste el país correcto! (+25 pts de suelo asegurado)</span>
                </div>
              )}
            </div>

            {/* Sabías que... Dato Curioso */}
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3.5 mb-3.5 text-xs text-zinc-300 space-y-1">
              <div className="font-semibold text-cyan-300 flex items-center gap-1.5 mb-1">
                <Info className="w-3.5 h-3.5 text-cyan-400" />
                <span>¿Sabías que...?</span>
              </div>
              <p className="leading-relaxed text-zinc-300">
                {currentCity.triviaFact}
              </p>
            </div>

            {/* Selector de Modo Rápido dentro de la propia tarjeta */}
            <div className="flex items-center justify-between gap-2 mb-3.5 px-3 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs">
              <div className="flex items-center gap-2 text-zinc-300">
                <Zap className={`w-3.5 h-3.5 ${isFastMode ? 'text-amber-400 fill-amber-400' : 'text-zinc-500'}`} />
                <span className="text-[11px] font-sans">Avance automático</span>
              </div>
              <button
                type="button"
                onClick={toggleFastMode}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border transition-all cursor-pointer ${
                  isFastMode
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                    : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700 hover:text-zinc-200'
                }`}
              >
                {isFastMode ? 'ACTIVADO (RÁPIDO)' : 'DESACTIVADO (MANUAL)'}
              </button>
            </div>

            {isFastMode && (
              <div className="text-[11px] font-mono text-amber-400/90 text-center mb-2.5 animate-pulse flex items-center justify-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Avanzando automáticamente a la siguiente ciudad...</span>
              </div>
            )}

            {/* Botón Siguiente */}
            <button
              onClick={() => handleNextCity()}
              className="w-full py-3 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              <span>{currentIndex + 1 < citiesList.length ? 'Siguiente Ciudad' : 'Ver Resultados Finales'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
