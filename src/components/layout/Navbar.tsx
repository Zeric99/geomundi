import React, { useState, useRef, useEffect } from 'react';
import { Globe2, Brain, Compass, Gamepad2, Volume2, Volume1, VolumeX, Trophy, Award, Coffee, Swords, User, Smartphone, Lock, Crown } from 'lucide-react';
import { useAudioFeedback } from '../../hooks/useAudioFeedback';
import { UserMenu } from '../auth/UserMenu';
import { useAuth } from '../../contexts/AuthContext';

export type ActiveTab = 'game' | 'singleplayer' | 'multiplayer' | 'explore' | 'tutor' | 'leaderboard' | 'empires';

interface NavbarProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  totalScore: number;
  bestStreak: number;
  onOpenAchievements?: () => void;
  onOpenDonate?: () => void;
  onOpenLeaderboard?: () => void;
  onOpenProfile?: () => void;
  isInsideGame?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onChangeTab,
  totalScore,
  bestStreak,
  onOpenAchievements,
  onOpenDonate,
  onOpenLeaderboard,
  onOpenProfile,
  isInsideGame = false
}) => {
  const { user } = useAuth();
  const { soundEnabled, toggleSound, volume, setVolume, hapticsEnabled, toggleHaptics, playClickSound } = useAudioFeedback();
  const [isAudioMenuOpen, setIsAudioMenuOpen] = useState<boolean>(false);
  const audioMenuRef = useRef<HTMLDivElement>(null);
  const isSingle = activeTab === 'game' || activeTab === 'singleplayer';

  // Cerrar popover al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (audioMenuRef.current && !audioMenuRef.current.contains(e.target as Node)) {
        setIsAudioMenuOpen(false);
      }
    };
    if (isAudioMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAudioMenuOpen]);

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-black border-b border-zinc-800 shadow-md shrink-0">
        {/* Banner Superior Destacado del Modo Imperio (solo visible cuando no estamos en imperios) */}
        {activeTab !== 'empires' && (
          <div 
            onClick={() => onChangeTab('empires')}
            className="w-full bg-gradient-to-r from-amber-600/30 via-indigo-600/40 to-purple-600/30 border-b border-indigo-500/40 px-3 py-1.5 flex items-center justify-center gap-2 cursor-pointer hover:bg-indigo-600/30 transition-all text-xs text-zinc-100 font-bold shadow-inner group"
          >
            <span className="flex items-center gap-1 text-amber-300">
              <Crown className="w-4 h-4 animate-bounce text-amber-400 shrink-0" />
              <span className="bg-amber-500/20 text-amber-300 text-[10px] px-1.5 py-0.5 rounded border border-amber-500/40 uppercase tracking-widest font-mono">NUEVO</span>
            </span>
            <span className="tracking-wide text-xs sm:text-sm">
              ¡Modo Secundario: <strong className="text-amber-300 font-black">GeoStrike Imperios</strong> (Fase 1 Beta)!
            </span>
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 group-hover:from-indigo-500 group-hover:to-purple-500 text-white text-[11px] px-3 py-0.5 rounded-full font-bold shadow-md transition-all ml-1 flex items-center gap-1 shrink-0">
              <span>Entrar al Modo Imperio</span> →
            </span>
          </div>
        )}

        <div className={`w-full px-3 sm:px-6 lg:px-8 xl:px-10 flex items-center justify-between gap-3 lg:gap-6 ${
          activeTab === 'empires' ? 'h-14 sm:h-16' : 'h-16 sm:h-20'
        }`}>
          {/* Logo & Marca */}
          <div
            onClick={() => onChangeTab('singleplayer')}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group shrink-0"
          >
            <div className="p-2 sm:p-2.5 rounded-xl bg-zinc-800/80 border border-zinc-700/60 text-indigo-400 group-hover:border-zinc-500 transition-all">
              <Globe2 className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <span className="font-display font-black text-base sm:text-xl text-zinc-100 tracking-wider flex items-center gap-1.5">
                GEO<span className="text-indigo-400">STRIKE</span>
              </span>
              <span className="text-[10px] text-zinc-400 font-mono tracking-widest uppercase block -mt-1">
                WORLD CHALLENGE
              </span>
            </div>
          </div>

          {/* NAVEGACIÓN PRINCIPAL ENTRE MODOS (Desktop: visible. Móvil: barra inferior ergonómica) */}
          <nav className="hidden md:flex items-center gap-1 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800 shadow-inner">
          {/* Pestaña Un Jugador */}
          <button
            onClick={() => onChangeTab('singleplayer')}
            className={`px-2.5 sm:px-3.5 lg:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
              isSingle
                ? 'bg-zinc-100 text-zinc-950 shadow-sm font-bold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <User className="w-4 h-4 shrink-0" />
            <span>Un Jugador</span>
          </button>

          {/* Pestaña Multijugador */}
          <button
            onClick={() => onChangeTab('multiplayer')}
            className={`px-2.5 sm:px-3.5 lg:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
              activeTab === 'multiplayer'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-zinc-950 shadow-sm font-bold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Swords className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Multijugador</span>
            {!user && <Lock className="w-3 h-3 text-zinc-500 shrink-0 ml-0.5" />}
          </button>

          {/* Explorar */}
          <button
            onClick={() => onChangeTab('explore')}
            className={`px-2.5 sm:px-3.5 lg:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
              activeTab === 'explore'
                ? 'bg-zinc-100 text-zinc-950 shadow-sm font-bold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Compass className="w-4 h-4 shrink-0" />
            <span>Explorar</span>
          </button>

          {/* Tutor */}
          <button
            onClick={() => onChangeTab('tutor')}
            className={`px-2.5 sm:px-3.5 lg:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
              activeTab === 'tutor'
                ? 'bg-indigo-600 text-white shadow-sm font-bold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Brain className="w-4 h-4 shrink-0" />
            <span>Tutor</span>
            {!user && <Lock className="w-3 h-3 text-zinc-500 shrink-0 ml-0.5" />}
          </button>

          {/* Récords */}
          <button
            onClick={() => onChangeTab('leaderboard')}
            className={`px-2.5 sm:px-3.5 lg:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
              activeTab === 'leaderboard'
                ? 'bg-amber-500 text-zinc-950 shadow-sm font-bold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Récords</span>
            {!user && <Lock className="w-3 h-3 text-zinc-500 shrink-0 ml-0.5" />}
          </button>

          {/* Modo Imperio (Beta) */}
          <button
            onClick={() => onChangeTab('empires')}
            className={`px-2.5 sm:px-3.5 lg:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
              activeTab === 'empires'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm font-bold'
                : 'text-indigo-400 hover:text-indigo-300 hover:bg-zinc-800/60'
            }`}
          >
            <Crown className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Imperio</span>
            <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1 py-0.2 rounded font-mono uppercase">Beta</span>
          </button>
        </nav>

        {/* Logros, Donar, Sonido y Cuenta */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {onOpenAchievements && (
            <button
              onClick={onOpenAchievements}
              title="Ver Galería de Logros y Estadísticas Detalladas"
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-[#18181B] hover:bg-zinc-800 text-amber-400 border border-zinc-800 transition-colors flex items-center gap-1.5 text-xs font-bold shrink-0"
            >
              <Award className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="hidden lg:inline">Logros y Estadísticas</span>
            </button>
          )}

          {onOpenDonate && (
            <button
              onClick={onOpenDonate}
              title="Apoya GeoStrike (Donar / Invitar a un café)"
              className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition-all flex items-center gap-1.5 text-xs font-bold shrink-0"
            >
              <Coffee className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="hidden lg:inline">Apoyar ☕</span>
            </button>
          )}

          {/* Menú Flotante de Audio y Vibración Háptica */}
          <div className="relative" ref={audioMenuRef}>
            <button
              onClick={() => setIsAudioMenuOpen(prev => !prev)}
              title={soundEnabled ? `Volumen: ${Math.round(volume * 100)}%` : 'Audio Silenciado'}
              className={`p-2 sm:p-2.5 rounded-xl border transition-all flex items-center justify-center shrink-0 ${
                isAudioMenuOpen
                  ? 'bg-cyan-950/70 border-cyan-500/60 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                  : soundEnabled
                  ? 'bg-[#18181B] hover:bg-zinc-800 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                  : 'bg-[#18181B] hover:bg-zinc-800 text-zinc-500 border-zinc-800'
              }`}
            >
              {!soundEnabled || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-zinc-500" />
              ) : volume < 0.5 ? (
                <Volume1 className="w-4 h-4 text-cyan-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-cyan-300" />
              )}
            </button>

            {/* Popover desplegable de configuración de audio y háptica */}
            {isAudioMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-[#18181B] border border-zinc-700/80 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-4 backdrop-blur-xl">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                  <span className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4 text-cyan-400" />
                    <span>Efectos y Audio</span>
                  </span>
                  <button
                    onClick={() => {
                      toggleSound();
                      playClickSound();
                    }}
                    className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md border transition-all ${
                      soundEnabled
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                        : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                    }`}
                  >
                    {soundEnabled ? 'ACTIVO' : 'MUTE'}
                  </button>
                </div>

                {/* Slider de Volumen */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                    <span>Volumen</span>
                    <span className="text-cyan-400 font-bold">
                      {soundEnabled ? `${Math.round(volume * 100)}%` : '0%'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={soundEnabled ? volume : 0}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setVolume(val);
                      playClickSound();
                    }}
                    className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>

                {/* Toggle de Vibración Háptica (Móviles) */}
                <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-zinc-400" />
                    <div>
                      <span className="text-xs font-bold text-zinc-200 block leading-tight">Vibración</span>
                      <span className="text-[10px] text-zinc-500">Tacto al acertar / fallar</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      toggleHaptics();
                      playClickSound();
                    }}
                    className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
                      hapticsEnabled ? 'bg-cyan-500' : 'bg-zinc-800'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        hapticsEnabled ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Botón Destacado Modo Imperio */}
          <button
            onClick={() => onChangeTab('empires')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shrink-0 ${
              activeTab === 'empires'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-zinc-950 ring-2 ring-amber-400 font-black'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white border border-indigo-400/40'
            }`}
            title="Entrar al Modo Imperio"
          >
            <Crown className="w-4 h-4 text-amber-300 shrink-0" />
            <span className="hidden sm:inline">Modo Imperio</span>
            <span className="sm:hidden">Imperio</span>
          </button>

          {/* Menú de Usuario y Google Auth */}
          <UserMenu onOpenLeaderboard={onOpenLeaderboard} onOpenProfile={onOpenProfile} />
        </div>
      </div>
    </header>

      {/* Barra de Navegación Ergonómica Inferior para Móvil (Solo visible en dispositivos < md y fuera de partidas) */}
      {!isInsideGame && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#121214]/95 backdrop-blur-md border-t border-zinc-800/80 px-2 py-1.5 flex items-center justify-around shadow-2xl safe-area-bottom">
          <button
            onClick={() => onChangeTab('singleplayer')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-all ${
              isSingle ? 'text-indigo-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">Un Jugador</span>
          </button>

          <button
            onClick={() => onChangeTab('multiplayer')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-all relative ${
              activeTab === 'multiplayer' ? 'text-amber-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Swords className="w-5 h-5 text-amber-400" />
            <span className="text-[10px] tracking-tight">Duelos 1v1</span>
            {!user && <Lock className="w-2.5 h-2.5 text-zinc-500 absolute top-1 right-2" />}
          </button>

          <button
            onClick={() => onChangeTab('explore')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-all ${
              activeTab === 'explore' ? 'text-cyan-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Compass className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">Explorar</span>
          </button>

          <button
            onClick={() => onChangeTab('tutor')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-all relative ${
              activeTab === 'tutor' ? 'text-indigo-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Brain className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">Tutor SRS</span>
            {!user && <Lock className="w-2.5 h-2.5 text-zinc-500 absolute top-1 right-2" />}
          </button>

          <button
            onClick={() => onChangeTab('leaderboard')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-all relative ${
              activeTab === 'leaderboard' ? 'text-amber-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Trophy className="w-5 h-5 text-amber-400" />
            <span className="text-[10px] tracking-tight">Récords</span>
            {!user && <Lock className="w-2.5 h-2.5 text-zinc-500 absolute top-1 right-2" />}
          </button>

          <button
            onClick={() => onChangeTab('empires')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-all relative ${
              activeTab === 'empires' ? 'text-amber-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Crown className="w-5 h-5 text-amber-400" />
            <span className="text-[10px] tracking-tight">Imperio</span>
          </button>
        </nav>
      )}
    </>
  );
};
