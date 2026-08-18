import React, { useState, useCallback } from 'react';
import { Navbar, ActiveTab } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { GameFilters } from './components/game/GameFilters';
import { GameHeader } from './components/game/GameHeader';
import { ClickAndFindMode } from './components/game/ClickAndFindMode';
import { InputWriteMode } from './components/game/InputWriteMode';
import { TriviaCuriositiesMode } from './components/game/TriviaCuriositiesMode';
import { ListSelectMode } from './components/game/ListSelectMode';
import { FlagSkipChainMode } from './components/game/FlagSkipChainMode';
import { CountryExplorer } from './components/explore/CountryExplorer';
import { TutorDashboard } from './components/tutor/TutorDashboard';
import { GameOverModal } from './components/game/GameOverModal';
import { FlagModal } from './components/common/FlagModal';
import { useCountriesData } from './hooks/useCountriesData';
import { useStatsManager } from './hooks/useStatsManager';
import { useGameState } from './hooks/useGameState';
import { Country } from './types/country';
import { GameConfig, GameSummary } from './types/game';
import { TutorAdvice } from './types/stats';
import { GEEK_TERRITORIES } from './data/fallbackCountries';
import { Loader2 } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('game');
  const [explorerContinent, setExplorerContinent] = useState<any>('World');
  const [previewFlagCountry, setPreviewFlagCountry] = useState<Country | null>(null);

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
  }, [recordGame]);

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
      <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center text-white space-y-4">
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
    <div className="min-h-screen flex flex-col bg-[#0B0F19] text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
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
      />

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        {/* PESTAÑA 1: JUGAR */}
        {activeTab === 'game' && (
          <div>
            {!isPlaying ? (
              <GameFilters
                config={config}
                onChangeConfig={(newCfg) => updateConfig(newCfg)}
                onStartGame={(overrideCfg) => startGame(overrideCfg)}
                blindSpots={blindSpots}
                onStartFocusedPractice={() => handleStartFocusedPractice()}
              />
            ) : (
              <div className="space-y-4">
                {/* 1. Modo Adivina la Bandera */}
                {config.mode === 'flag-skip-chain' && (() => {
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
                    <FlagSkipChainMode
                      initialCountries={selectedList}
                      onFinishGame={handleGameComplete}
                      onQuit={quitGame}
                      isGeekMode={config.isGeekMode}
                      onOpenFlagModal={(c) => setPreviewFlagCountry(c)}
                    />
                  );
                })()}

                {/* 2. Modo Lista & Mapa (Colores) */}
                {config.mode === 'list-select' && (
                  <ListSelectMode
                    countries={countries}
                    continent={config.continent}
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
                      onOpenFlagModal={(c) => setPreviewFlagCountry(c)}
                    />
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* PESTAÑA 2: EXPLORAR */}
        {activeTab === 'explore' && (
          <CountryExplorer
            continent={explorerContinent}
            onSelectContinent={(c) => setExplorerContinent(c)}
            onStartQuizWithCountry={handleStartQuizWithCountry}
            onOpenFlagModal={(c) => setPreviewFlagCountry(c)}
          />
        )}

        {/* PESTAÑA 3: TUTOR IA & ESTADÍSTICAS */}
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
      </main>

      {/* Modal de Ampliación de Bandera en Alta Definición */}
      <FlagModal
        country={previewFlagCountry}
        isOpen={Boolean(previewFlagCountry)}
        onClose={() => setPreviewFlagCountry(null)}
        hideDetails={activeTab === 'game'}
      />

      {/* Modal de Fin de Partida */}
      {isGameOver && lastGameSummary && (
        <GameOverModal
          summary={lastGameSummary}
          onPlayAgain={() => startGame()}
          onReturnToMenu={() => {
            quitGame();
            setActiveTab('game');
          }}
          onGoToTutor={() => {
            quitGame();
            setActiveTab('tutor');
          }}
          onPracticeMistakes={(mistakeCodes) => handleStartFocusedPractice(mistakeCodes)}
        />
      )}

      {/* Pie de Página */}
      <Footer />
    </div>
  );
}

export default App;
