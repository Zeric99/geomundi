import { useState, useCallback, useRef } from 'react';
import { Country, CountryMapStatus } from '../types/country';
import { GameConfig, GameRoundResult, GameSummary, Question, QuestionType } from '../types/game';
import { useAudioFeedback } from './useAudioFeedback';
import { getAllTriviaPool } from '../data/triviaPool';
import { GEEK_TERRITORIES } from '../data/fallbackCountries';
import confetti from 'canvas-confetti';

interface UseGameStateProps {
  countries: Country[];
  onGameComplete?: (summary: GameSummary) => void;
}

export function useGameState({ countries, onGameComplete }: UseGameStateProps) {
  const { playCorrectSound, playWrongSound, playHintSound, playVictorySound } = useAudioFeedback();

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [config, setConfig] = useState<GameConfig>({
    mode: 'click-find',
    continent: 'World',
    questionType: 'name',
    totalQuestions: 10,
    allowHints: true,
    isGeekMode: false
  });

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [countryStatuses, setCountryStatuses] = useState<Record<string, CountryMapStatus>>({});
  const [roundResults, setRoundResults] = useState<GameRoundResult[]>([]);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [activeHint, setActiveHint] = useState<string | null>(null);

  const startTimeRef = useRef<number>(Date.now());
  const questionStartTimeRef = useRef<number>(Date.now());
  const advanceTimerRef = useRef<any>(null);

  const currentQuestion = questions[currentIndex] || null;

  // Generador de preguntas barajadas
  const generateQuestions = useCallback((cfg: GameConfig): Question[] => {
    const fullCountryList = cfg.isGeekMode ? [...countries, ...GEEK_TERRITORIES] : countries;

    // Si estamos en Modo Trivia de Curiosidades
    if (cfg.mode === 'trivia-curiosities') {
      const countryMap = new Map(fullCountryList.map(c => [c.cca3.toUpperCase(), c]));
      let triviaPool = getAllTriviaPool(fullCountryList);

      if (cfg.continent !== 'World') {
        triviaPool = triviaPool.filter(t => {
          const c = countryMap.get(t.countryCode.toUpperCase());
          return c && c.continent === cfg.continent;
        });
      }

      // Barajar trivia pool
      const shuffledTrivia = [...triviaPool].sort(() => Math.random() - 0.5);
      const triviaCount = Math.min(cfg.totalQuestions || 10, shuffledTrivia.length);
      const selectedTrivia = shuffledTrivia.slice(0, triviaCount);

      return selectedTrivia.map((trivia, idx) => {
        const country = countryMap.get(trivia.countryCode.toUpperCase()) || fullCountryList[0];
        return {
          id: `q_trivia_${trivia.id}_${idx}`,
          country,
          questionType: 'trivia',
          promptText: trivia.question,
          hintUsed: false,
          attempts: 0,
          triviaItem: trivia
        };
      });
    }

    // Modo Estándar (Click & Find, Input Write, Match Cards, List Select)
    let pool: Country[] = [];

    if (cfg.focusedPracticeCodes && cfg.focusedPracticeCodes.length > 0) {
      const codeSet = new Set(cfg.focusedPracticeCodes.map(c => c.toUpperCase()));
      pool = fullCountryList.filter(c => codeSet.has(c.cca3.toUpperCase()));
    } else if (cfg.continent === 'World') {
      pool = [...fullCountryList];
    } else {
      pool = fullCountryList.filter(c => c.continent === cfg.continent);
    }

    if (pool.length === 0) pool = [...fullCountryList];

    // Barajar Fisher-Yates
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    // Si totalQuestions >= 190, 999, 0 o es maratón completo, jugar TODOS los países del pool de la región
    const isAll = cfg.totalQuestions >= 190 || cfg.totalQuestions === 999 || cfg.totalQuestions === 0 || cfg.isAllCountriesMarathon;
    const count = isAll 
      ? shuffled.length 
      : Math.min(cfg.totalQuestions || 10, shuffled.length);
    const selected = shuffled.slice(0, count);

    const questionTypes: QuestionType[] = ['name', 'flag', 'capital'];

    return selected.map((country, idx) => {
      const qType = cfg.questionType === 'mixed'
        ? questionTypes[idx % questionTypes.length]
        : cfg.questionType;

      let promptText = `Ubica ${country.nameEs}`;
      if (qType === 'capital') {
        promptText = `¿Qué país tiene por capital ${country.capital}?`;
      } else if (qType === 'flag') {
        promptText = `Identifica el país de esta bandera`;
      }

      return {
        id: `q_${country.cca3}_${idx}`,
        country,
        questionType: qType,
        promptText,
        hintUsed: false,
        attempts: 0
      };
    });
  }, [countries]);

  // Iniciar nueva partida
  const startGame = useCallback((newConfig?: Partial<GameConfig>) => {
    const finalConfig: GameConfig = {
      ...config,
      ...(newConfig || {})
    };
    setConfig(finalConfig);

    const newQuestions = generateQuestions(finalConfig);
    setQuestions(newQuestions);
    setCurrentIndex(0);
    setLives(3);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setCountryStatuses({});
    setRoundResults([]);
    setIsEvaluating(false);
    setActiveHint(null);
    setIsGameOver(false);
    setIsPlaying(true);

    startTimeRef.current = Date.now();
    questionStartTimeRef.current = Date.now();
  }, [config, generateQuestions]);

  // Finalizar partida
  const finishGame = useCallback((finalResults: GameRoundResult[], finalScore: number, finalMaxStreak: number) => {
    setIsPlaying(false);
    setIsGameOver(true);

    const durationSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
    const correctCount = finalResults.filter(r => r.userSuccess).length;
    const firstTryCount = finalResults.filter(r => r.firstTry).length;
    const wrongCount = finalResults.length - correctCount;
    const accuracy = finalResults.length > 0 ? Math.round((firstTryCount / finalResults.length) * 100) : 0;

    const summary: GameSummary = {
      mode: config.mode,
      continent: config.continent,
      totalQuestions: finalResults.length,
      correctCount,
      firstTryCount,
      wrongCount,
      score: finalScore,
      maxStreak: finalMaxStreak,
      accuracy,
      durationSeconds,
      playedAt: new Date().toISOString(),
      results: finalResults
    };

    if (accuracy >= 80) {
      playVictorySound();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}
    }

    if (onGameComplete) {
      onGameComplete(summary);
    }
  }, [config, onGameComplete, playVictorySound]);

  // Avanzar a la siguiente pregunta
  const advanceToNextQuestion = useCallback((currentResults: GameRoundResult[], currentScore: number, currentMaxStreak: number) => {
    const nextIdx = currentIndex + 1;
    if (nextIdx >= questions.length || (lives <= 0 && config.mode !== 'explore')) {
      finishGame(currentResults, currentScore, currentMaxStreak);
    } else {
      setCurrentIndex(nextIdx);
      setIsEvaluating(false);
      setActiveHint(null);
      questionStartTimeRef.current = Date.now();
    }
  }, [currentIndex, questions.length, lives, config.mode, finishGame]);

  // Procesar respuesta del usuario
  const submitAnswer = useCallback((selectedCountry: Country) => {
    if (!currentQuestion || isEvaluating || isGameOver) return;

    const isCorrect = selectedCountry.cca3.toUpperCase() === currentQuestion.country.cca3.toUpperCase();
    const timeSpentMs = Date.now() - questionStartTimeRef.current;
    const isFirstTry = currentQuestion.attempts === 0;

    setIsEvaluating(true);

    if (isCorrect) {
      // Éxito
      const newStreak = streak + 1;
      const newMaxStreak = Math.max(maxStreak, newStreak);
      const comboMultiplier = 1 + Math.min(streak * 0.2, 2.0);
      const points = Math.round((isFirstTry ? 100 : 50) * comboMultiplier);
      const newScore = score + points;

      setStreak(newStreak);
      setMaxStreak(newMaxStreak);
      setScore(newScore);

      playCorrectSound(comboMultiplier);

      // Colorear verde en el mapa
      setCountryStatuses(prev => ({
        ...prev,
        [selectedCountry.cca3.toUpperCase()]: 'correct'
      }));

      const result: GameRoundResult = {
        question: currentQuestion,
        userSuccess: true,
        firstTry: isFirstTry,
        attemptsUsed: currentQuestion.attempts + 1,
        timeSpentMs,
        pointsEarned: points
      };

      const updatedResults = [...roundResults, result];
      setRoundResults(updatedResults);

      if (config.mode !== 'trivia-curiosities') {
        advanceTimerRef.current = setTimeout(() => {
          advanceToNextQuestion(updatedResults, newScore, newMaxStreak);
        }, 1000);
      }
    } else {
      // Fallo
      playWrongSound();
      const newStreak = 0;
      setStreak(0);

      // Marcar país incorrecto de rojo momentáneamente
      setCountryStatuses(prev => ({
        ...prev,
        [selectedCountry.cca3.toUpperCase()]: 'wrong'
      }));

      const newAttempts = currentQuestion.attempts + 1;
      currentQuestion.attempts = newAttempts;

      if (newAttempts >= 2 || config.mode === 'match-cards' || config.mode === 'trivia-curiosities') {
        // Fallo definitivo en esta pregunta: revelar el país correcto
        const newLives = Math.max(0, lives - 1);
        setLives(newLives);

        setCountryStatuses(prev => ({
          ...prev,
          [currentQuestion.country.cca3.toUpperCase()]: 'hint'
        }));

        const result: GameRoundResult = {
          question: currentQuestion,
          userSuccess: false,
          firstTry: false,
          attemptsUsed: newAttempts,
          timeSpentMs,
          pointsEarned: 0
        };

        const updatedResults = [...roundResults, result];
        setRoundResults(updatedResults);

        if (config.mode !== 'trivia-curiosities') {
          advanceTimerRef.current = setTimeout(() => {
            advanceToNextQuestion(updatedResults, score, maxStreak);
          }, 1800);
        }
      } else {
        // Oportunidad de segundo intento con pista
        advanceTimerRef.current = setTimeout(() => {
          setIsEvaluating(false);
        }, 800);
      }
    }
  }, [
    currentQuestion,
    isEvaluating,
    isGameOver,
    streak,
    maxStreak,
    score,
    lives,
    roundResults,
    config.mode,
    playCorrectSound,
    playWrongSound,
    advanceToNextQuestion
  ]);

  // Usar Pista
  const useHint = useCallback(() => {
    if (!currentQuestion || currentQuestion.hintUsed || !config.allowHints) return;

    currentQuestion.hintUsed = true;
    playHintSound();

    // Resaltar área/subregión o pista textual
    const c = currentQuestion.country;
    let hintMsg = `Se encuentra en ${c.continentEs}`;
    if (c.subregionEs) {
      hintMsg += ` (${c.subregionEs})`;
    }
    if (c.capital && c.capital !== 'N/A' && currentQuestion.questionType !== 'capital') {
      hintMsg += `. Su capital es ${c.capital}`;
    }

    setActiveHint(hintMsg);

    // Resaltar el país en ámbar
    setCountryStatuses(prev => ({
      ...prev,
      [c.cca3.toUpperCase()]: 'hint'
    }));
  }, [currentQuestion, config.allowHints, playHintSound]);

  const updateConfig = useCallback((newConfig: Partial<GameConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  const quitGame = useCallback(() => {
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
    setIsPlaying(false);
    setIsGameOver(false);
  }, []);

  const skipWaitAndAdvance = useCallback(() => {
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
    const nextIdx = currentIndex + 1;
    if (nextIdx >= questions.length || (lives <= 0 && config.mode !== 'explore')) {
      finishGame(roundResults, score, maxStreak);
    } else {
      setCurrentIndex(nextIdx);
      setIsEvaluating(false);
      setActiveHint(null);
      questionStartTimeRef.current = Date.now();
    }
  }, [currentIndex, questions.length, lives, config.mode, finishGame, roundResults, score, maxStreak]);

  return {
    isPlaying,
    isGameOver,
    config,
    questions,
    currentQuestion,
    currentIndex,
    lives,
    score,
    streak,
    maxStreak,
    countryStatuses,
    roundResults,
    isEvaluating,
    activeHint,
    updateConfig,
    startGame,
    submitAnswer,
    useHint,
    quitGame,
    skipWaitAndAdvance
  };
}
