import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Navbar, ActiveTab } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { GameFilters } from './components/game/GameFilters';
import { GameHeader } from './components/game/GameHeader';
import { ClickAndFindMode } from './components/game/ClickAndFindMode';
import { InputWriteMode } from './components/game/InputWriteMode';
import { TriviaCuriositiesMode } from './components/game/TriviaCuriositiesMode';
import { ListSelectMode } from './components/game/ListSelectMode';
import { FlagSkipChainMode } from './components/game/FlagSkipChainMode';
import { DailyChallengeMode } from './components/game/DailyChallengeMode';
import { CityPinpointMode } from './components/game/CityPinpointMode';
import { CountryExplorer } from './components/explore/CountryExplorer';
import { TutorDashboard } from './components/tutor/TutorDashboard';
import { LeaderboardView } from './components/leaderboard/LeaderboardView';
import { AchievementToast } from './components/achievements/AchievementToast';
import { AchievementsModal } from './components/achievements/AchievementsModal';
import { DonateModal } from './components/common/DonateModal';
import { MultiplayerDashboard } from './components/multiplayer/MultiplayerDashboard';
import { MatchmakingModal } from './components/multiplayer/MatchmakingModal';
import { Duel1v1Mode } from './components/multiplayer/Duel1v1Mode';
import { DuelResultModal } from './components/multiplayer/DuelResultModal';
import { GameOverModal } from './components/game/GameOverModal';
import { FlagModal } from './components/common/FlagModal';
import { useCountriesData } from './hooks/useCountriesData';
import { useStatsManager } from './hooks/useStatsManager';
import { useGameState } from './hooks/useGameState';
import { Country } from './types/country';
import { GameConfig, GameSummary } from './types/game';
import { TutorAdvice } from './types/stats';
import { Achievement } from './types/achievements';
import { DuelMode, DuelQuestion, DuelState, MultiplayerType, PlayerProfile } from './types/multiplayer';
import { GEEK_TERRITORIES } from './data/fallbackCountries';
import { achievementService } from './services/achievementService';
import { dailyChallengeService, DailyStageQuestion } from './services/dailyChallengeService';
import { challengeService } from './services/challengeService';
import { multiplayerService } from './services/multiplayerService';
import { Loader2 } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('singleplayer');
  const [explorerContinent, setExplorerContinent] = useState<any>('World');
  const [previewFlagCountry, setPreviewFlagCountry] = useState<Country | null>(null);

  // Modales y Toasts de Nuevas Funcionalidades
  const [unlockedAchievement, setUnlockedAchievement] = useState<Achievement | null>(null);
  const [isAchievementsModalOpen, setIsAchievementsModalOpen] = useState<boolean>(false);
  const [isDonateModalOpen, setIsDonateModalOpen] = useState<boolean>(false);
  const [isDailyChallengeActive, setIsDailyChallengeActive] = useState<boolean>(false);
  const [activeDailyQuestions, setActiveDailyQuestions] = useState<DailyStageQuestion[]>([]);

  // Estado del Modo Multijugador y Ranked ELO
  const [playerProfile, setPlayerProfile] = useState<PlayerProfile>(() => multiplayerService.getPlayerProfile());
  const [isMatchmakingOpen, setIsMatchmakingOpen] = useState<boolean>(false);
  const [matchmakingType, setMatchmakingType] = useState<MultiplayerType>('ranked');
  const [matchmakingMode, setMatchmakingMode] = useState<DuelMode>('countries');
  const [activeDuelQuestions, setActiveDuelQuestions] = useState<DuelQuestion[]>([]);
  const [activeRivalProfile, setActiveRivalProfile] = useState<PlayerProfile | null>(null);
  const [activeDuelState, setActiveDuelState] = useState<DuelState | null>(null);
  const [finishedDuelResult, setFinishedDuelResult] = useState<DuelState | null>(null);

  // Carga de Países
  const { countries, isLoading } = useCountriesData();

  // Motor de Estadísticas y Tutor IA
  const {
    stats,
    continentalMastery,
    blindSpots,
    smartAdvice,
    recordGame,
    resetStats,
    getFocusedPracticeCountries
  } = useStatsManager(countries);

  // Hook de Juego
  const handleGameComplete = useCallback((summary: GameSummary) => {
    recordGame(summary);

    if (isDailyChallengeActive) {
      dailyChallengeService.recordDailyCompletion(summary.score, summary.accuracy, summary.durationSeconds || 30);
    }

    // Evaluar si se desbloqueó algún logro
    const newAchievements = achievementService.evaluateAchievements(stats, {
      accuracy: summary.accuracy,
      maxStreak: summary.maxStreak,
      isDaily: isDailyChallengeActive
    });

    if (newAchievements.length > 0) {
      setUnlockedAchievement(newAchievements[0]);
    }
  }, [recordGame, isDailyChallengeActive, stats]);

  const {
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
  } = useGameState({
    countries,
    onGameComplete: handleGameComplete
  });

  // Generar lista de países de banderas estable para la sesión activa
  const flagChainCountries = useMemo(() => {
    if (!isPlaying || config.mode !== 'flag-skip-chain') return [];
    const fullList = config.isGeekMode
      ? [...countries, ...GEEK_TERRITORIES]
      : countries;
    const continentList = config.continent === 'World'
      ? fullList
      : fullList.filter(c => c.continent === config.continent);
    const isAll = config.totalQuestions >= 190 || config.totalQuestions === 999 || config.totalQuestions === 0;
    const count = isAll
      ? continentList.length
      : Math.min(config.totalQuestions || 10, continentList.length);
    return [...continentList].sort(() => Math.random() - 0.5).slice(0, count);
  }, [isPlaying, config.mode, config.continent, config.isGeekMode, config.totalQuestions, countries]);

  // Iniciar Práctica Focalizada desde el Tutor o Banner
  const handleStartFocusedPractice = useCallback((customCodes?: string[]) => {
    let targetCodes: string[] = [];
    if (customCodes && customCodes.length > 0) {
      targetCodes = customCodes;
    } else {
      const weakCountries = getFocusedPracticeCountries(10);
      targetCodes = weakCountries.map(c => c.cca3);
    }

    setActiveTab('game');
    startGame({
      mode: 'click-find',
      continent: 'World',
      questionType: 'mixed',
      totalQuestions: Math.max(5, targetCodes.length),
      focusedPracticeCodes: targetCodes
    });
  }, [getFocusedPracticeCountries, startGame]);

  // Iniciar Desafío Diario
  const handleStartDailyChallenge = useCallback(() => {
    if (countries.length === 0) return;
    const dailyQuestions = dailyChallengeService.generateDailyQuestions(countries);
    setActiveDailyQuestions(dailyQuestions);
    setIsDailyChallengeActive(true);
    setActiveTab('singleplayer');
  }, [countries]);

  // Finalizar Desafío Diario y mostrar leaderboard
  const handleFinishDailyChallenge = useCallback((score: number, accuracy: number, durationSeconds: number) => {
    dailyChallengeService.recordDailyCompletion(score, accuracy, durationSeconds);
    setIsDailyChallengeActive(false);
    setActiveDailyQuestions([]);
    setActiveTab('leaderboard');
  }, []);

  // Detectar Reto recibido por URL (?challenge=...)
  useEffect(() => {
    if (countries.length === 0) return;
    const params = new URLSearchParams(window.location.search);
    const challengeCode = params.get('challenge');
    if (challengeCode) {
      const decoded = challengeService.decodeChallenge(challengeCode);
      if (decoded) {
        window.history.replaceState({}, document.title, window.location.pathname);
        alert(`⚔️ ¡Has aceptado el reto de ${decoded.creatorName || 'un amigo'}! Puntuación a superar: ${decoded.creatorScore} pts.`);
        setIsDailyChallengeActive(false);
        setActiveTab('game');
        startGame({
          mode: decoded.mode || 'click-find',
          continent: (decoded.continent as any) || 'World',
          questionType: decoded.questionType || 'mixed',
          totalQuestions: decoded.countryCodes.length,
          focusedPracticeCodes: decoded.countryCodes
        });
      }
    }
  }, [countries, startGame]);

  // Iniciar búsqueda de duelo 1v1
  const handleStartDuel = useCallback((type: MultiplayerType, duelMode: DuelMode) => {
    setMatchmakingType(type);
    setMatchmakingMode(duelMode);
    setIsMatchmakingOpen(true);
  }, []);

  // Oponente encontrado -> Iniciar Duelo 1v1
  const handleMatchFound = useCallback((rival: PlayerProfile) => {
    const duelQuestions = multiplayerService.generateDuelQuestions(countries, matchmakingMode);
    setActiveDuelQuestions(duelQuestions);
    setActiveRivalProfile(rival);
    setIsMatchmakingOpen(false);
  }, [countries, matchmakingMode]);

  // Finalizar Duelo 1v1 y mostrar resultados
  const handleFinishDuel = useCallback((duelState: DuelState) => {
    setActiveDuelQuestions([]);
    setActiveRivalProfile(null);
    setFinishedDuelResult(duelState);
    setPlayerProfile(duelState.player);
  }, []);

  // Manejar acción desde tarjeta del Tutor
  const handleAdviceAction = useCallback((advice: TutorAdvice) => {
    if (advice.targetCountries && advice.targetCountries.length > 0) {
      handleStartFocusedPractice(advice.targetCountries);
    } else if (advice.targetContinent) {
      setActiveTab('game');
      startGame({
        continent: advice.targetContinent,
        mode: 'click-find',
        questionType: 'name'
      });
    } else if (advice.id === 'streak_praise') {
      setActiveTab('game');
      startGame({
        mode: 'input-write',
        continent: 'World'
      });
    } else {
      setActiveTab('game');
      startGame();
    }
  }, [handleStartFocusedPractice, startGame]);

  // Iniciar Quiz desde el modo explorador
  const handleStartQuizWithCountry = useCallback((country: Country) => {
    setActiveTab('game');
    startGame({
      mode: 'click-find',
      continent: country.continent,
      totalQuestions: 10,
      focusedPracticeCodes: [country.cca3]
    });
  }, [startGame]);

  // Manejar emparejamiento individual en Match Cards
  const handleSingleMatchSuccess = useCallback((country: Country) => {
    submitAnswer(country);
  }, [submitAnswer]);

  const handleSingleMatchError = useCallback((targetCountry: Country, clickedCountry: Country) => {
    submitAnswer({ ...targetCountry, cca3: 'WRONG_MATCH' });
  }, [submitAnswer]);

  if (isLoading && countries.length === 0) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white space-y-4">
        <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
        <h2 className="text-xl font-display font-bold">Cargando Atlas Mundial...</h2>
        <p className="text-xs text-slate-400">Sincronizando polígonos y datos de países</p>
      </div>
    );
  }

  // Resumen de fin de juego
  const lastGameSummary: GameSummary | null = isGameOver && roundResults.length > 0
    ? {
        mode: config.mode,
        continent: config.continent,
        totalQuestions: roundResults.length,
        correctCount: roundResults.filter(r => r.userSuccess).length,
        firstTryCount: roundResults.filter(r => r.firstTry).length,
        wrongCount: roundResults.length - roundResults.filter(r => r.userSuccess).length,
        score,
        maxStreak,
        accuracy: roundResults.length > 0
          ? Math.round((roundResults.filter(r => r.firstTry).length / roundResults.length) * 100)
          : 0,
        durationSeconds: 0,
        playedAt: new Date().toISOString(),
        results: roundResults
      }
    : null;

  return (
    <div className={`flex flex-col bg-black text-slate-100 selection:bg-cyan-500 selection:text-slate-950 ${
      isPlaying ? 'h-screen max-h-screen overflow-hidden' : 'min-h-screen'
    }`}>
      {/* Barra de Navegación */}
      <Navbar
        activeTab={activeTab}
        onChangeTab={(tab) => {
          if (isPlaying) {
            if (window.confirm('Hay una partida en curso. ¿Deseas salir?')) {
              quitGame();
              setActiveTab(tab);
            }
          } else {
            setActiveTab(tab);
          }
        }}
        totalScore={stats.totalScore}
        bestStreak={stats.bestStreak}
        onOpenAchievements={() => setIsAchievementsModalOpen(true)}
        onOpenDonate={() => setIsDonateModalOpen(true)}
      />

      {/* Contenido Principal */}
      <main className={`flex-1 min-h-0 max-w-7xl w-full mx-auto flex flex-col ${
        isPlaying ? 'px-1 sm:px-2 pt-1 pb-1 overflow-hidden' : 'px-4 sm:px-6 pt-6 sm:pt-8 pb-8'
      }`}>
        {/* PESTAÑA 1: UN JUGADOR (SINGLEPLAYER) */}
        {(activeTab === 'game' || activeTab === 'singleplayer') && (
          <div className={isPlaying || isDailyChallengeActive ? 'h-full flex flex-col min-h-0 overflow-hidden' : ''}>
            {isDailyChallengeActive && activeDailyQuestions.length > 0 ? (
              <DailyChallengeMode
                questions={activeDailyQuestions}
                onFinishChallenge={handleFinishDailyChallenge}
                onQuit={() => {
                  setIsDailyChallengeActive(false);
                  setActiveDailyQuestions([]);
                }}
                onOpenFlagModal={(c) => setPreviewFlagCountry(c)}
              />
            ) : !isPlaying ? (
              <GameFilters
                config={config}
                onChangeConfig={(newCfg) => updateConfig(newCfg)}
                onStartGame={(overrideCfg) => {
                  setIsDailyChallengeActive(false);
                  startGame(overrideCfg);
                }}
                blindSpots={blindSpots}
                onStartFocusedPractice={() => handleStartFocusedPractice()}
                onGoToTutor={() => setActiveTab('tutor')}
                onStartDaily={handleStartDailyChallenge}
              />
            ) : (
              <div className="h-full flex flex-col min-h-0 overflow-hidden space-y-1.5">
                {/* 1. Modo Adivina la Bandera */}
                {config.mode === 'flag-skip-chain' && (
                  <FlagSkipChainMode
                    initialCountries={flagChainCountries}
                    continent={config.continent}
                    onFinishGame={handleGameComplete}
                    onQuit={quitGame}
                    onGoToTutor={() => {
                      quitGame();
                      setActiveTab('tutor');
                    }}
                    isGeekMode={config.isGeekMode}
                    onOpenFlagModal={(c) => setPreviewFlagCountry(c)}
                  />
                )}

                {/* 2. Modo Lista & Mapa (Colores) */}
                {config.mode === 'list-select' && (
                  <ListSelectMode
                    countries={countries}
                    continent={config.continent}
                    onFinishGame={handleGameComplete}
                    onQuit={quitGame}
                    isGeekMode={config.isGeekMode}
                  />
                )}

                {/* 3. Modo Trivia de Curiosidades */}
                {config.mode === 'trivia-curiosities' && (
                  <TriviaCuriositiesMode
                    currentQuestion={currentQuestion}
                    currentIndex={currentIndex}
                    totalQuestions={questions.length}
                    lives={lives}
                    score={score}
                    streak={streak}
                    continent={config.continent}
                    countryStatuses={countryStatuses}
                    isEvaluating={isEvaluating}
                    activeHint={activeHint}
                    onCountrySelect={submitAnswer}
                    onUseHint={useHint}
                    onQuit={quitGame}
                    onNextQuestion={skipWaitAndAdvance}
                    isGeekMode={config.isGeekMode}
                  />
                )}

                {/* 4. Modo Escribir Países (Con Salto & 2ª Ronda) */}
                {config.mode === 'input-write' && (() => {
                  const fullList = config.isGeekMode
                    ? [...countries, ...GEEK_TERRITORIES]
                    : countries;
                  const continentList = config.continent === 'World'
                    ? fullList
                    : fullList.filter(c => c.continent === config.continent);
                  const isAll = config.totalQuestions >= 190 || config.totalQuestions === 999 || config.totalQuestions === 0;
                  const count = isAll
                    ? continentList.length
                    : Math.min(config.totalQuestions || 10, continentList.length);
                  const selectedList = [...continentList].sort(() => Math.random() - 0.5).slice(0, count);

                  return (
                    <InputWriteMode
                      initialCountries={selectedList}
                      continent={config.continent}
                      onFinishGame={handleGameComplete}
                      onQuit={quitGame}
                      isGeekMode={config.isGeekMode}
                      onOpenFlagModal={(c) => setPreviewFlagCountry(c)}
                    />
                  );
                })()}

                {/* 5. Modo Localiza en el Mapa (Click & Find) */}
                {config.mode === 'click-find' && currentQuestion && (
                  <>
                    <GameHeader
                      currentIndex={currentIndex}
                      totalQuestions={questions.length}
                      lives={lives}
                      score={score}
                      streak={streak}
                      onQuit={quitGame}
                    />
                    <ClickAndFindMode
                      question={currentQuestion}
                      countryStatuses={countryStatuses}
                      onCountryClick={submitAnswer}
                      onUseHint={useHint}
                      activeHint={activeHint}
                      isEvaluating={isEvaluating}
                      isGeekMode={config.isGeekMode}
                      continent={config.continent}
                      onOpenFlagModal={(c) => setPreviewFlagCountry(c)}
                    />
                  </>
                )}

                {/* 6. Modo Explorador Libre */}
                {config.mode === 'explore' && (
                  <CountryExplorer
                    continent={config.continent}
                    onSelectContinent={(c) => updateConfig({ continent: c })}
                    onStartQuizWithCountry={handleStartQuizWithCountry}
                    onOpenFlagModal={(c) => setPreviewFlagCountry(c)}
                    onQuit={quitGame}
                    isGeekMode={config.isGeekMode}
                  />
                )}

                {/* 7. Modo Puntería Geográfica (City Pinpoint) */}
                {config.mode === 'city-pinpoint' && (
                  <CityPinpointMode
                    continent={config.continent}
                    onFinishGame={handleGameComplete}
                    onReturnToMenu={quitGame}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* PESTAÑA 2: MULTIJUGADOR ⚔️ (RANKED & AMISTOSO) */}
        {activeTab === 'multiplayer' && (
          <div className="h-full flex flex-col min-h-0 overflow-hidden">
            {activeDuelQuestions.length > 0 && activeRivalProfile ? (
              <Duel1v1Mode
                questions={activeDuelQuestions}
                playerProfile={playerProfile}
                rivalProfile={activeRivalProfile}
                duelMode={matchmakingMode}
                isRanked={matchmakingType === 'ranked'}
                onFinishDuel={handleFinishDuel}
                onQuit={() => {
                  setActiveDuelQuestions([]);
                  setActiveRivalProfile(null);
                }}
              />
            ) : (
              <MultiplayerDashboard
                playerProfile={playerProfile}
                onStartDuel={handleStartDuel}
              />
            )}
          </div>
        )}

        {/* PESTAÑA 3: EXPLORAR */}
        {activeTab === 'explore' && (
          <CountryExplorer
            continent={explorerContinent}
            onSelectContinent={(c) => setExplorerContinent(c)}
            onStartQuizWithCountry={handleStartQuizWithCountry}
            onOpenFlagModal={(c) => setPreviewFlagCountry(c)}
          />
        )}

        {/* PESTAÑA 4: TUTOR IA & ESTADÍSTICAS */}
        {activeTab === 'tutor' && (
          <TutorDashboard
            stats={stats}
            continentalMastery={continentalMastery}
            blindSpots={blindSpots}
            smartAdvice={smartAdvice}
            onStartFocusedPractice={handleStartFocusedPractice}
            onAdviceAction={handleAdviceAction}
            onResetStats={resetStats}
          />
        )}

        {/* PESTAÑA 5: RÉCORDS & CLASIFICACIÓN */}
        {activeTab === 'leaderboard' && (
          <LeaderboardView stats={stats} />
        )}
      </main>

      {/* Modal de Ampliación de Bandera en Alta Definición */}
      <FlagModal
        country={previewFlagCountry}
        isOpen={Boolean(previewFlagCountry)}
        onClose={() => setPreviewFlagCountry(null)}
        hideDetails={activeTab === 'game' || activeTab === 'singleplayer'}
      />

      {/* Modal de Matchmaking VS 1v1 */}
      <MatchmakingModal
        isOpen={isMatchmakingOpen}
        type={matchmakingType}
        duelMode={matchmakingMode}
        playerProfile={playerProfile}
        onMatchFound={handleMatchFound}
        onCancel={() => setIsMatchmakingOpen(false)}
      />

      {/* Modal de Resultado de Duelo 1v1 */}
      {finishedDuelResult && (
        <DuelResultModal
          duelState={finishedDuelResult}
          onPlayAgain={() => {
            const res = finishedDuelResult;
            setFinishedDuelResult(null);
            handleStartDuel(res.type, res.duelMode);
          }}
          onReturnToMenu={() => setFinishedDuelResult(null)}
        />
      )}

      {/* Modal de Fin de Partida Singleplayer */}
      {isGameOver && lastGameSummary && (
        <GameOverModal
          summary={lastGameSummary}
          isDailyChallenge={isDailyChallengeActive}
          onPlayAgain={() => startGame()}
          onReturnToMenu={() => {
            quitGame();
            setActiveTab('singleplayer');
          }}
          onGoToTutor={() => {
            quitGame();
            setActiveTab('tutor');
          }}
          onPracticeMistakes={(mistakeCodes) => handleStartFocusedPractice(mistakeCodes)}
        />
      )}

      {/* Toast de Logro Desbloqueado */}
      <AchievementToast
        achievement={unlockedAchievement}
        onClose={() => setUnlockedAchievement(null)}
      />

      {/* Modal de Galería de Logros */}
      <AchievementsModal
        isOpen={isAchievementsModalOpen}
        onClose={() => setIsAchievementsModalOpen(false)}
        stats={stats}
      />

      {/* Modal de Donación y Apoyo al Proyecto */}
      <DonateModal
        isOpen={isDonateModalOpen}
        onClose={() => setIsDonateModalOpen(false)}
      />

      {/* Pie de Página */}
      <Footer isCompact={isPlaying || activeDuelQuestions.length > 0} />
    </div>
  );
}

export default App;
