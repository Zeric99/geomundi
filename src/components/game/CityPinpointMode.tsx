import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Target, MapPin, Award, Compass, ArrowRight, RotateCcw, Sparkles, Trophy, Globe, Info, Zap, Navigation, Share2, Check, Layers } from 'lucide-react';
import { Continent } from '../../types/country';
import { CityTarget, PinpointResult, GameSummary } from '../../types/game';
import { getRandomCities, CityThemeCategory } from '../../data/citiesData';
import { calculateHaversineDistance, calculatePinpointScore, checkCountryAndContinentMatch } from '../../utils/haversineScoring';
import { PinpointWorldMap } from '../map/PinpointWorldMap';
import { generateShareText, copyToClipboard } from '../../utils/shareUtils';
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

  const currentCity = citiesList[currentIndex];

  // Reiniciar partida
  const handleRestartGame = useCallback(() => {
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

    // Ref para temporizador de avance automático
    if (nextTimerRef.current) clearTimeout(nextTimerRef.current);
    nextTimerRef.current = setTimeout(() => {
      handleNextCity(result);
    }, 1400);
  }, [currentCity, isEvaluated, isGameOver, currentIndex, citiesList.length]);

  const nextTimerRef = useRef<any>(null);

  const handleNextCity = (resultToSave?: PinpointResult) => {
    if (nextTimerRef.current) clearTimeout(nextTimerRef.current);
    const res = resultToSave || currentResult;
    if (!res) return;

    setResultsHistory(prev => {
      // Evitar duplicados si ya se guardó
      if (prev.length > currentIndex) return prev;
      return [...prev, res];
    });

    if (currentIndex + 1 < citiesList.length) {
      setCurrentIndex(prev => prev + 1);
      setClickedCoords(null);
      setIsEvaluated(false);
      setCurrentResult(null);
    } else {
      setIsGameOver(true);
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
      <div className="bg-[#141d28]/95 backdrop-blur-md border border-cyan-900/40 rounded-xl p-4 sm:p-5 shadow-card-subtle flex items-center justify-between gap-4 flex-wrap relative overflow-hidden border-l-4 border-l-cyan-500">
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

        {/* Puntuación Acumulada */}
        <div className="flex items-center gap-3 flex-wrap">
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

      {/* Mapa Interactivo de Puntería */}
      <div className="relative flex-1 min-h-[380px] h-[calc(100vh-230px)] max-h-[calc(100vh-230px)] w-full rounded-xl overflow-hidden shadow-2xl border border-zinc-800">
        <PinpointWorldMap
          clickedCoords={clickedCoords}
          targetCoords={currentCity.coordinates}
          onMapClick={handleMapClick}
          isEvaluated={isEvaluated}
          continent={continent}
          cityName={currentCity.nameEs}
        />

        {/* Modal / Tarjeta de Evaluación al hacer clic */}
        {isEvaluated && currentResult && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-[420px] bg-[#141d2b]/95 backdrop-blur-xl border border-cyan-800/70 rounded-2xl p-5 shadow-2xl z-30 animate-in slide-in-from-bottom-6 duration-300">
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
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3.5 mb-4 text-xs text-zinc-300 space-y-1">
              <div className="font-semibold text-cyan-300 flex items-center gap-1.5 mb-1">
                <Info className="w-3.5 h-3.5 text-cyan-400" />
                <span>¿Sabías que...?</span>
              </div>
              <p className="leading-relaxed text-zinc-300">
                {currentCity.triviaFact}
              </p>
            </div>

            {/* Botón Siguiente */}
            <button
              onClick={() => handleNextCity()}
              className="w-full py-3 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 text-sm"
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
