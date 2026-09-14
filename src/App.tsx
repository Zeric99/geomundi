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
import { MultiplayerDashboard } from './components/multiplayer/MultiplayerDashboard';
import { Duel1v1Mode } from './components/multiplayer/Duel1v1Mode';

import { DuelResultModal } from './components/multiplayer/DuelResultModal';
import { GameOverModal } from './components/game/GameOverModal';
import { FlagModal } from './components/common/FlagModal';
import { WireframeGlobe } from './components/common/WireframeGlobe';
import { BackgroundStardust } from './components/common/BackgroundStardust';
import { useCountriesData } from './hooks/useCountriesData';
import { useStatsManager } from './hooks/useStatsManager';
import { useGameState } from './hooks/useGameState';
import { Country } from './types/country';
import { GameConfig, GameSummary } from './types/game';
import { TutorAdvice, UserStatsState } from './types/stats';
import { Achievement } from './types/achievements';
import { CommunityChallenge, CustomRoomConfig, DuelMode, DuelQuestion, DuelState, MultiplayerType, PlayerProfile, PlayerRoundResult } from './types/multiplayer';

// Carga diferida (lazy-loading) de modales secundarios para acelerar la carga en móvil
const AchievementsModal = React.lazy(() => import('./components/achievements/AchievementsModal').then(m => ({ default: m.AchievementsModal })));
const DonateModal = React.lazy(() => import('./components/common/DonateModal').then(m => ({ default: m.DonateModal })));
const DailyArchiveModal = React.lazy(() => import('./components/daily/DailyArchiveModal').then(m => ({ default: m.DailyArchiveModal })));
const LeaderboardModal = React.lazy(() => import('./components/leaderboard/LeaderboardModal').then(m => ({ default: m.LeaderboardModal })));
const UserProfileModal = React.lazy(() => import('./components/profile/UserProfileModal').then(m => ({ default: m.UserProfileModal })));
import { FALLBACK_COUNTRIES, GEEK_TERRITORIES } from './data/fallbackCountries';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { achievementService } from './services/achievementService';
import { dailyChallengeService, DailyStageQuestion } from './services/dailyChallengeService';
import { challengeService } from './services/challengeService';
import { multiplayerService } from './services/multiplayerService';
import { authService } from './services/authService';
import { cloudSyncService } from './services/cloudSyncService';
import { storageService } from './services/storageService';
import { customRoomService } from './services/customRoomService';
import { useAuth } from './contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export function App() {
  const { user, profile, refreshProfile } = useAuth();

  // Detectar si el usuario entra mediante un enlace de invitación a sala (#room=GEO-XXXX o ?room=GEO-XXXX)
  const initialRoomCode = useMemo(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const qRoom = urlParams.get('room');
      if (qRoom) return qRoom.toUpperCase().trim();

      const hash = window.location.hash;
      if (hash.includes('room=')) {
        const match = hash.match(/room=([A-Za-z0-9_-]+)/);
        if (match && match[1]) return match[1].toUpperCase().trim();
      }
    } catch (e) {}
    return undefined;
  }, []);

  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    return initialRoomCode ? 'multiplayer' : 'singleplayer';
  });

  const [explorerContinent, setExplorerContinent] = useState<any>('World');

  const [previewFlagCountry, setPreviewFlagCountry] = useState<Country | null>(null);

  // Sincronizar logros con la nube si el usuario inicia sesion
  useEffect(() => {
    if (user?.id) {
      achievementService.syncWithSupabase(user.id);
    }
  }, [user?.id]);

  // Modales y Toasts de Nuevas Funcionalidades
  const [unlockedAchievement, setUnlockedAchievement] = useState<Achievement | null>(null);
  const [isAchievementsModalOpen, setIsAchievementsModalOpen] = useState<boolean>(false);
  const [isDonateModalOpen, setIsDonateModalOpen] = useState<boolean>(false);
  const [isLeaderboardModalOpen, setIsLeaderboardModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isDailyChallengeActive, setIsDailyChallengeActive] = useState<boolean>(false);
  const [isDailyArchiveOpen, setIsDailyArchiveOpen] = useState<boolean>(false);
  const [activeDailyQuestions, setActiveDailyQuestions] = useState<DailyStageQuestion[]>([]);
  const [activeDailyDateStr, setActiveDailyDateStr] = useState<string>('');

  // Estado del Modo Multijugador y Ranked ELO
  const [playerProfile, setPlayerProfile] = useState<PlayerProfile>(() => multiplayerService.getPlayerProfile());
  const [isMatchmakingOpen, setIsMatchmakingOpen] = useState<boolean>(false);
  const [matchmakingType, setMatchmakingType] = useState<MultiplayerType>('ranked');
  const [matchmakingMode, setMatchmakingMode] = useState<DuelMode>('countries');
  const [activeDuelQuestions, setActiveDuelQuestions] = useState<DuelQuestion[]>([]);
  const [activeRivalProfile, setActiveRivalProfile] = useState<PlayerProfile | null>(null);
  const [activeRecordedResults, setActiveRecordedResults] = useState<PlayerRoundResult[]>([]);
  const [isChallengeCreation, setIsChallengeCreation] = useState<boolean>(false);
  const [activeChallengeId, setActiveChallengeId] = useState<string | undefined>(undefined);
  const [activeCommunityChallenge, setActiveCommunityChallenge] = useState<CommunityChallenge | null>(null);
  const [activeDuelState, setActiveDuelState] = useState<DuelState | null>(null);
  const [finishedDuelResult, setFinishedDuelResult] = useState<DuelState | null>(null);
  const [activeRoomCode, setActiveRoomCode] = useState<string | null>(null);

  // Sincronizar el perfil multijugador con el usuario autenticado de Supabase
  useEffect(() => {
    if (profile) {
      setPlayerProfile({
        id: profile.id,
        name: profile.nickname || user?.user_metadata?.full_name || 'Tú',
        avatar: profile.avatar_url || user?.user_metadata?.avatar_url || '🎓',
        elo: profile.elo || 1200,
        rank: multiplayerService.getRankInfo(profile.elo || 1200),
        wins: profile.wins || 0,
        losses: profile.losses || 0,
        streak: profile.win_streak || 0,
        xp: profile.xp || 0,
        level: profile.level || 1
      });
    }
  }, [profile, user]);


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
    const newAchievements = achievementService.evaluateAchievements(
      stats,
      {
        mode: summary.mode,
        continent: summary.continent,
        accuracy: summary.accuracy,
        maxStreak: summary.maxStreak,
        score: summary.score,
        totalQuestions: summary.results.length,
        correctCount: summary.results.filter(r => r.userSuccess).length,
        isGeekMode: summary.isGeekMode,
        isDaily: isDailyChallengeActive
      },
      user?.id
    );

    if (newAchievements.length > 0) {
      setUnlockedAchievement(newAchievements[0]);
    }
  }, [recordGame, isDailyChallengeActive, stats, user?.id]);

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
  const handleStartDailyChallenge = useCallback((dateStr?: string | unknown) => {
    const safeDateStr = (typeof dateStr === 'string' && dateStr.trim().length >= 8)
      ? dateStr.trim()
      : dailyChallengeService.getTodayDateString();
    const list = (countries && countries.length >= 5) ? countries : FALLBACK_COUNTRIES;
    const dailyQuestions = dailyChallengeService.generateDailyQuestions(list, safeDateStr);
    setActiveDailyQuestions(dailyQuestions);
    setActiveDailyDateStr(safeDateStr);
    setIsDailyChallengeActive(true);
    setActiveTab('singleplayer');
  }, [countries]);

  // Finalizar Desafío Diario y sincronizar con la nube
  const handleFinishDailyChallenge = useCallback(async (score: number, accuracy: number, durationSeconds: number) => {
    const activeDate = activeDailyDateStr || dailyChallengeService.getTodayDateString();
    const streakState = dailyChallengeService.recordDailyCompletion(score, accuracy, durationSeconds, activeDate);
    const record = streakState.history[activeDate];
    
    // Si el usuario está autenticado, sincronizar con Supabase
    try {
      const user = await authService.getCurrentUser();
      if (user && record) {
        await cloudSyncService.saveDailyChallengeAttempt(user.id, record);
      }
    } catch (e) {
      console.warn('No se pudo sincronizar el reto diario con Supabase:', e);
    }

    setIsDailyChallengeActive(false);
    setActiveDailyQuestions([]);
    setActiveDailyDateStr('');
    setActiveTab('leaderboard');
  }, [activeDailyDateStr]);

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

  // Iniciar creación de desafío propio (grabar partida a 5 rondas)
  const handleCreateChallenge = useCallback((duelMode: DuelMode) => {
    setMatchmakingMode(duelMode);
    setMatchmakingType('ranked');
    const duelQuestions = multiplayerService.generateDuelQuestions(countries, duelMode, 5);
    setActiveDuelQuestions(duelQuestions);
    setActiveRivalProfile(null);
    setActiveRecordedResults([]);
    setIsChallengeCreation(true);
    setActiveChallengeId(undefined);
    setActiveCommunityChallenge(null);
  }, [countries]);

  // Desafiar una partida grabada de otro jugador de la comunidad
  const handleStartChallenge = useCallback((challenge: CommunityChallenge) => {
    setMatchmakingMode(challenge.mode);
    setMatchmakingType('ranked');
    setActiveDuelQuestions(challenge.questions);
    setActiveRivalProfile({
      id: challenge.creatorId,
      name: challenge.creatorName,
      avatar: challenge.creatorAvatar || '🎓',
      elo: challenge.creatorElo,
      rank: multiplayerService.getRankInfo(challenge.creatorElo),
      wins: 0,
      losses: 0,
      streak: 0,
      xp: 0,
      level: 1
    });
    setActiveRecordedResults(challenge.roundResults);
    setIsChallengeCreation(false);
    setActiveChallengeId(challenge.id);
    setActiveCommunityChallenge(challenge);
  }, []);

  // Iniciar búsqueda de duelo 1v1 o sala personalizada
  const handleStartDuel = useCallback((
    type: MultiplayerType,
    duelMode: DuelMode,
    customConfig?: CustomRoomConfig,
    customQuestions?: DuelQuestion[],
    rivalProfile?: PlayerProfile | null,
    recordedRivalResults?: PlayerRoundResult[]
  ) => {
    setMatchmakingType(type);
    setMatchmakingMode(duelMode);
    setActiveCommunityChallenge(null);

    if (type === 'custom_room') {
      const questions = customQuestions && customQuestions.length > 0
        ? customQuestions
        : multiplayerService.generateDuelQuestions(countries, duelMode, customConfig?.totalRounds || 5);

      setActiveRoomCode(customConfig?.roomCode || null);
      setActiveRivalProfile(rivalProfile || null);
      setActiveRecordedResults(recordedRivalResults || []);
      setIsChallengeCreation(false);
      setActiveDuelQuestions(questions);
    } else {
      setActiveRoomCode(null);
      handleCreateChallenge(duelMode);
    }
  }, [countries, handleCreateChallenge]);


  // Finalizar Duelo 1v1 y mostrar resultados (otorgar XP, guardar en Supabase y actualizar ELO)
  const handleFinishDuel = useCallback(async (duelState: DuelState) => {
    // Si era una partida en sala privada, registrar el reto para el amigo
    if (activeRoomCode) {
      customRoomService.saveRoomChallenge({
        roomCode: activeRoomCode,
        creatorProfile: playerProfile,
        mode: duelState.duelMode,
        questions: duelState.questions,
        roundResults: duelState.playerResults,
        score: duelState.playerScore,
        totalTimeMs: duelState.playerTimeTotalMs
      });
    }

    setActiveDuelQuestions([]);
    setActiveRivalProfile(null);
    setActiveRecordedResults([]);
    setIsChallengeCreation(false);
    setFinishedDuelResult(duelState);

    // 1. Si era una grabación de desafío propio:
    if (duelState.isChallengeCreation) {
      const creatorName = profile?.nickname || user?.user_metadata?.full_name || 'GeoStriker';
      const creatorAvatar = profile?.avatar_url || user?.user_metadata?.avatar_url || '🎓';
      const creatorElo = profile?.elo || playerProfile.elo || 1200;
      const creatorId = user?.id || 'player_local';

      const newChallenge: CommunityChallenge = {
        id: `chal_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        creatorId,
        creatorName,
        creatorAvatar,
        creatorElo,
        mode: duelState.duelMode,
        score: duelState.playerScore,
        totalTimeMs: duelState.playerTimeTotalMs,
        questions: duelState.questions,
        roundResults: duelState.playerResults,
        createdAt: new Date().toISOString(),
        status: 'open'
      };

      await multiplayerService.saveCommunityChallenge(newChallenge);
    }

    // Si estábamos respondiendo al desafío de otro jugador de la comunidad:
    if (activeCommunityChallenge && !duelState.isChallengeCreation) {
      try {
        await multiplayerService.resolveCommunityChallenge({
          challenge: activeCommunityChallenge,
          challengerProfile: playerProfile,
          challengerScore: duelState.playerScore,
          challengerTimeMs: duelState.playerTimeTotalMs,
          challengerResults: duelState.playerResults
        });
      } catch (e) {
        console.error('Error resolviendo community challenge:', e);
      }
      setActiveCommunityChallenge(null);
    }

    // 2. Si era un desafío contra otro jugador (Ranked):
    if (!duelState.isChallengeCreation && duelState.type === 'ranked') {
      const isWin = duelState.winner === 'player';
      const isDraw = duelState.winner === 'tie';
      const currentModeElo = (profile as any)?.[`elo_${duelState.duelMode}`] 
        ?? playerProfile.elos?.[duelState.duelMode] 
        ?? 1200;
      const rivalElo = duelState.rival?.elo || 1200;

      const eloChange = multiplayerService.calculateEloChange(
        currentModeElo,
        rivalElo,
        duelState.winner || 'tie',
        duelState.playerScore,
        duelState.rivalScore
      );
      const newModeElo = Math.max(500, currentModeElo + eloChange);

      const updatedElos: Record<DuelMode, number> = {
        pinpoint: (profile as any)?.elo_pinpoint ?? playerProfile.elos?.pinpoint ?? 1200,
        countries: (profile as any)?.elo_countries ?? playerProfile.elos?.countries ?? 1200,
        capitals: (profile as any)?.elo_capitals ?? playerProfile.elos?.capitals ?? 1200,
        flags: (profile as any)?.elo_flags ?? playerProfile.elos?.flags ?? 1200,
        [duelState.duelMode]: newModeElo
      };

      const newGeneralElo = Math.round(
        (updatedElos.pinpoint + updatedElos.countries + updatedElos.capitals + updatedElos.flags) / 4
      );
      const rankTier = multiplayerService.getRankInfo(newGeneralElo).tier;

      if (user) {
        await authService.updateDuelStats(
          user.id,
          newGeneralElo,
          isWin,
          isDraw,
          duelState.xpEarned || 150,
          rankTier,
          duelState.duelMode,
          newModeElo
        );
        await refreshProfile();
      }

      setPlayerProfile(prev => ({
        ...prev,
        elo: newGeneralElo,
        rank: multiplayerService.getRankInfo(newGeneralElo),
        wins: prev.wins + (isWin ? 1 : 0),
        losses: prev.losses + (!isWin && !isDraw ? 1 : 0),
        streak: isWin ? prev.streak + 1 : 0,
        elos: updatedElos
      }));
    }

    // Actualizar contador en stats.modeStats para los logros y visualización
    const updatedStats = storageService.getUserStats();
    const prevMultiStats = updatedStats.modeStats?.['multiplayer'] || { gamesPlayed: 0, totalScore: 0, bestScore: 0 };
    const newStatsWithDuel: UserStatsState = {
      ...updatedStats,
      modeStats: {
        ...(updatedStats.modeStats || {}),
        multiplayer: {
          gamesPlayed: prevMultiStats.gamesPlayed + 1,
          totalScore: prevMultiStats.totalScore + duelState.playerScore,
          bestScore: Math.max(prevMultiStats.bestScore, duelState.playerScore)
        }
      }
    };
    storageService.saveUserStats(newStatsWithDuel);

    // Evaluar logros tras el duelo multijugador
    const isWin = duelState.winner === 'player';
    const totalDuelCount = (profile?.total_duels || 0) + 1;
    const newAchievements = achievementService.evaluateAchievements(
      newStatsWithDuel,
      {
        mode: 'multiplayer',
        accuracy: Math.round((duelState.playerScore / 500) * 100),
        maxStreak: duelState.player.streak,
        duelResult: isWin ? 'win' : (duelState.winner === 'rival' ? 'loss' : 'draw'),
        duelStreak: duelState.player.streak,
        elo: duelState.player.elo,
        isDaily: false,
        totalQuestions: 5
      },
      user?.id
    );

    if (newAchievements.length > 0) {
      setUnlockedAchievement(newAchievements[0]);
    }
  }, [profile, user, playerProfile.elos, refreshProfile, stats]);


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

  // El planeta 3D Wireframe se muestra EXCLUSIVAMENTE en el menú de Un Jugador para no entorpecer los mapas y textos
  // Ocultar estrictamente en Multijugador, Explorar, Tutor, Récords y durante cualquier partida
  const isInsideGame = isPlaying || isDailyChallengeActive || activeDuelQuestions.length > 0;
  const showGlobeInSingleplayerMenu = (activeTab === 'singleplayer' || activeTab === 'game') && !isInsideGame;

  return (
    <div className={`relative flex flex-col bg-black text-slate-100 selection:bg-cyan-500 selection:text-slate-950 ${
      isPlaying ? 'h-screen max-h-screen overflow-hidden' : 'min-h-screen'
    }`}>
      {/* Partículas de Polvo Estelar en Movimiento por Toda la Pantalla */}
      {!isInsideGame && <BackgroundStardust />}

      {/* Globo Terráqueo 3D Wireframe en el Lateral Derecho (Exclusivo en Menú Un Jugador) */}
      {showGlobeInSingleplayerMenu && (
        <div className="fixed -top-12 -right-36 sm:-right-28 md:-right-20 lg:-right-10 pointer-events-none z-0 opacity-90 overflow-visible select-none">
          <WireframeGlobe size={680} />
        </div>
      )}

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
        onOpenLeaderboard={() => setIsLeaderboardModalOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      {/* Contenido Principal con Z-Index sólido */}
      <main className={`relative z-10 flex-1 min-h-0 max-w-7xl w-full mx-auto flex flex-col ${
        isPlaying ? 'px-1 sm:px-2 pt-1 pb-1 overflow-hidden' : isDailyChallengeActive ? 'px-2 sm:px-4 pt-3 pb-8 overflow-y-auto' : 'px-4 sm:px-6 pt-6 sm:pt-8 pb-8'
      }`}>
        {/* PESTAÑA 1: UN JUGADOR (SINGLEPLAYER) */}
        {(activeTab === 'game' || activeTab === 'singleplayer') && (
          <div className={isPlaying ? 'h-full flex flex-col min-h-0 overflow-hidden' : isDailyChallengeActive ? 'w-full flex-1 flex flex-col min-h-0' : ''}>
            {isDailyChallengeActive && activeDailyQuestions.length > 0 ? (
              <ErrorBoundary onReset={() => {
                setIsDailyChallengeActive(false);
                setActiveDailyQuestions([]);
              }}>
                <DailyChallengeMode
                  questions={activeDailyQuestions}
                  targetDateStr={activeDailyDateStr || undefined}
                  onFinishChallenge={handleFinishDailyChallenge}
                  onQuit={() => {
                    setIsDailyChallengeActive(false);
                    setActiveDailyQuestions([]);
                  }}
                  onOpenFlagModal={(c) => setPreviewFlagCountry(c)}
                />
              </ErrorBoundary>
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
                onStartDaily={() => handleStartDailyChallenge()}
                onOpenDailyArchive={() => setIsDailyArchiveOpen(true)}
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
                    themeCategory={config.cityTheme || 'all'}
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
            {activeDuelQuestions.length > 0 ? (
              <Duel1v1Mode
                questions={activeDuelQuestions}
                playerProfile={playerProfile}
                rivalProfile={activeRivalProfile}
                recordedRivalResults={activeRecordedResults}
                duelMode={matchmakingMode}
                isRanked={matchmakingType === 'ranked'}
                isChallengeCreation={isChallengeCreation}
                challengeId={activeChallengeId}
                onFinishDuel={handleFinishDuel}
                onQuit={() => {
                  setActiveDuelQuestions([]);
                  setActiveRivalProfile(null);
                  setActiveRecordedResults([]);
                  setIsChallengeCreation(false);
                }}
              />
            ) : (
              <MultiplayerDashboard
                playerProfile={playerProfile}
                countries={countries}
                initialRoomCode={initialRoomCode}
                onStartDuel={handleStartDuel}
                onStartChallenge={handleStartChallenge}
                onCreateChallenge={handleCreateChallenge}
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

      {/* Modales secundarios cargados bajo demanda */}
      <React.Suspense fallback={null}>
        {isAchievementsModalOpen && (
          <AchievementsModal
            isOpen={isAchievementsModalOpen}
            onClose={() => setIsAchievementsModalOpen(false)}
            stats={stats}
          />
        )}

        {isDonateModalOpen && (
          <DonateModal
            isOpen={isDonateModalOpen}
            onClose={() => setIsDonateModalOpen(false)}
          />
        )}

        {isDailyArchiveOpen && (
          <DailyArchiveModal
            isOpen={isDailyArchiveOpen}
            onClose={() => setIsDailyArchiveOpen(false)}
            onSelectDateToPlay={(dateStr) => {
              setIsDailyArchiveOpen(false);
              handleStartDailyChallenge(dateStr);
            }}
          />
        )}

        {isLeaderboardModalOpen && (
          <LeaderboardModal
            isOpen={isLeaderboardModalOpen}
            onClose={() => setIsLeaderboardModalOpen(false)}
          />
        )}

        {isProfileModalOpen && (
          <UserProfileModal
            isOpen={isProfileModalOpen}
            onClose={() => setIsProfileModalOpen(false)}
            onOpenLeaderboard={() => {
              setIsProfileModalOpen(false);
              setIsLeaderboardModalOpen(true);
            }}
          />
        )}
      </React.Suspense>

      {/* Pie de Página */}
      <Footer isCompact={isPlaying || activeDuelQuestions.length > 0} />
    </div>
  );
}

export default App;
