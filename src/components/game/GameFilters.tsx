import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, 
  MapPin, 
  Type, 
  Layers, 
  Compass, 
  Sparkles, 
  Flag, 
  Landmark, 
  Zap, 
  Flame, 
  Trophy, 
  ListChecks, 
  Brain,
  X,
  ArrowRight,
  SlidersHorizontal,
  } from 'lucide-react';
import { Continent } from '../../types/country';
import { GameConfig, GameMode, QuestionType } from '../../types/game';
import { BlindSpotItem } from '../../types/stats';
import { DailyChallengeCard } from '../daily/DailyChallengeCard';

interface GameFiltersProps {
  config: GameConfig;
  onChangeConfig: (newConfig: Partial<GameConfig>) => void;
  onStartGame: (overrideConfig?: Partial<GameConfig>) => void;
  blindSpots: BlindSpotItem[];
  onStartFocusedPractice: () => void;
  onGoToTutor: () => void;
  onStartDaily: () => void;
  onOpenDailyArchive?: () => void;
}

export const GameFilters: React.FC<GameFiltersProps> = ({
  config,
  onChangeConfig,
  onStartGame,
  blindSpots,
  onStartFocusedPractice,
  onGoToTutor,
  onStartDaily,
  onOpenDailyArchive
}) => {
  // Modal de configuración del modo seleccionado
  const [activeConfigMode, setActiveConfigMode] = useState<GameMode | null>(null);

  const continents: { id: Continent; label: string; icon: string }[] = [
    { id: 'World', label: 'Mundo Entero', icon: '🌍' },
    { id: 'Europe', label: 'Europa', icon: '🏰' },
    { id: 'Americas', label: 'América', icon: '🌎' },
    { id: 'Africa', label: 'África', icon: '🦁' },
    { id: 'Asia', label: 'Asia', icon: '🏯' },
    { id: 'Oceania', label: 'Oceanía', icon: '🏝️' },
  ];

  const modes: { 
    id: GameMode; 
    title: string; 
    desc: string; 
    bgEmoji: string;
    cardGradient: string;
    borderColor: string;
    hoverBorder: string;
    tagStyle: string;
    accentText: string;
    btnHover: string;
  }[] = [
    {
      id: 'city-pinpoint',
      title: '🎯 Puntería Geográfica (GeoStrike)',
      desc: 'Te damos una ciudad y debes hacer clic lo más cerca posible para ganar hasta 1,000 pts.',
      bgEmoji: '🎯',
      cardGradient: 'from-cyan-950/50 via-[#18181B] to-[#121214]',
      borderColor: 'border-cyan-700/60',
      hoverBorder: 'hover:border-cyan-400',
      tagStyle: 'bg-cyan-950/80 text-cyan-300 border-cyan-700/60',
      accentText: 'group-hover:text-cyan-300',
      btnHover: 'group-hover:bg-cyan-500 group-hover:text-black',
    },
    {
      id: 'list-select',
      title: 'Modo Clásico: Adivinar Países',
      desc: 'Elige un país de la lista superior y encuéntralo en el mapa.',
      bgEmoji: '🗺️',
      cardGradient: 'from-emerald-950/40 via-[#18181B] to-[#121214]',
      borderColor: 'border-emerald-800/50',
      hoverBorder: 'hover:border-emerald-500/70',
      tagStyle: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60',
      accentText: 'group-hover:text-emerald-300',
      btnHover: 'group-hover:bg-emerald-600 group-hover:text-white',
    },
    {
      id: 'flag-skip-chain',
      title: 'Adivina la Bandera',
      desc: 'Descubre a qué país pertenece cada bandera en el mapa.',
      bgEmoji: '🚩',
      cardGradient: 'from-rose-950/40 via-[#18181B] to-[#121214]',
      borderColor: 'border-rose-800/50',
      hoverBorder: 'hover:border-rose-500/70',
      tagStyle: 'bg-rose-950/80 text-rose-300 border-rose-700/60',
      accentText: 'group-hover:text-rose-300',
      btnHover: 'group-hover:bg-rose-600 group-hover:text-white',
    },
    {
      id: 'click-find',
      title: 'Localiza en el Mapa',
      desc: 'Te damos un país, bandera o capital para ubicarlo en el mapa.',
      bgEmoji: '📍',
      cardGradient: 'from-indigo-950/40 via-[#18181B] to-[#121214]',
      borderColor: 'border-indigo-800/50',
      hoverBorder: 'hover:border-indigo-500/70',
      tagStyle: 'bg-indigo-950/80 text-indigo-300 border-indigo-700/60',
      accentText: 'group-hover:text-indigo-300',
      btnHover: 'group-hover:bg-indigo-600 group-hover:text-white',
    },
    {
      id: 'input-write',
      title: 'Escribir Países',
      desc: 'El mapa ilumina un país y escribes su nombre con teclado.',
      bgEmoji: '⌨️',
      cardGradient: 'from-teal-950/40 via-[#18181B] to-[#121214]',
      borderColor: 'border-teal-800/50',
      hoverBorder: 'hover:border-teal-500/70',
      tagStyle: 'bg-teal-950/80 text-teal-300 border-teal-700/60',
      accentText: 'group-hover:text-teal-300',
      btnHover: 'group-hover:bg-teal-600 group-hover:text-white',
    },
    {
      id: 'trivia-curiosities',
      title: 'Trivia y Curiosidades',
      desc: 'Preguntas de récords mundiales y geografía sobre el mapa.',
      bgEmoji: '🏆',
      cardGradient: 'from-amber-950/40 via-[#18181B] to-[#121214]',
      borderColor: 'border-amber-800/50',
      hoverBorder: 'hover:border-amber-500/70',
      tagStyle: 'bg-amber-950/80 text-amber-300 border-amber-700/60',
      accentText: 'group-hover:text-amber-300',
      btnHover: 'group-hover:bg-amber-600 group-hover:text-zinc-950',
    },
    {
      id: 'explore',
      title: 'Modo Explorador',
      desc: 'Navegación libre: consulta datos, banderas y fronteras.',
      bgEmoji: '🧭',
      cardGradient: 'from-sky-950/40 via-[#18181B] to-[#121214]',
      borderColor: 'border-sky-800/50',
      hoverBorder: 'hover:border-sky-500/70',
      tagStyle: 'bg-sky-950/80 text-sky-300 border-sky-700/60',
      accentText: 'group-hover:text-sky-300',
      btnHover: 'group-hover:bg-sky-600 group-hover:text-white',
    },
  ];

  const questionTypes: { id: QuestionType; label: string; icon: React.ReactNode }[] = [
    { id: 'name', label: 'Nombres', icon: <Type className="w-4 h-4" /> },
    { id: 'flag', label: 'Banderas', icon: <Flag className="w-4 h-4" /> },
    { id: 'capital', label: 'Capitales', icon: <Landmark className="w-4 h-4" /> },
    { id: 'mixed', label: 'Mixto (Variado)', icon: <Zap className="w-4 h-4" /> },
  ];

  const questionCounts = [
    { count: 5, label: '5 Países', desc: 'Rápido' },
    { count: 10, label: '10 Países', desc: 'Estándar' },
    { count: 20, label: '20 Países', desc: 'Desafío' },
    { count: 50, label: '50 Países', desc: 'Maratón' },
    { count: 999, label: '🌍 Todos', desc: 'Todos los países' },
  ];

  const handleOpenModeConfig = (modeId: GameMode) => {
    onChangeConfig({ mode: modeId });
    setActiveConfigMode(modeId);
  };

  const handleStartFromModal = () => {
    setActiveConfigMode(null);
    onStartGame();
  };

  const activeModeData = modes.find(m => m.id === activeConfigMode) || modes[0];

  return (
    <div className="relative w-full max-w-6xl mx-auto space-y-6 overflow-visible">
      {/* Tarjeta Destacada: Desafío Diario */}
      <div className="relative z-10">
        <DailyChallengeCard onStartDaily={onStartDaily} onOpenArchive={onOpenDailyArchive} />
      </div>

      {/* Título de Selección de Modalidades */}
      <div className="relative z-10 flex items-center justify-between pt-2">
        <div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-zinc-100 tracking-wide">
            Elige una Modalidad de Juego
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 font-sans">
            Selecciona el modo de estudio o desafío que prefieras para calibrar tu aprendizaje.
          </p>
        </div>
      </div>

      {/* Grid Principal de Tarjetas de Modos de Juego */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {modes.map((m) => (
          <div
            key={m.id}
            onClick={() => handleOpenModeConfig(m.id)}
            className={`cursor-pointer p-5 sm:p-6 rounded-2xl border ${m.borderColor} ${m.hoverBorder} bg-gradient-to-br ${m.cardGradient} transition-all duration-200 transform hover:-translate-y-1 flex flex-col justify-between group relative overflow-hidden min-h-[175px] shadow-sm hover:shadow-md`}
          >
            {/* Emoji de fondo */}
            <div className="absolute top-4 right-4 text-5xl opacity-15 pointer-events-none select-none group-hover:opacity-30 transition-all duration-300 transform group-hover:scale-110 leading-none">
              {m.bgEmoji}
            </div>

            {/* Contenido Principal */}
            <div className="relative z-10 space-y-1.5 pr-6">
              <h3 className={`font-display font-bold text-zinc-100 text-lg sm:text-xl tracking-wide leading-snug transition-colors ${m.accentText}`}>
                {m.title}
              </h3>

              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-sans">
                {m.desc}
              </p>
            </div>

            {/* Botón Inferior: Configurar y Jugar */}
            <div className="relative z-10 pt-3.5 mt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs font-sans font-medium text-zinc-300 group-hover:text-white">
              <span>{m.id === 'city-pinpoint' ? '¡Jugar Ahora!' : 'Configurar y Jugar'}</span>
              <div className={`p-1.5 rounded-lg bg-zinc-800 transition-all ${m.btnHover}`}>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Banner de Tutor Personal: Sesión de Refuerzo Personalizada */}
      <div className="relative z-10 bg-[#18181B] border border-indigo-500/30 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 flex-wrap shadow-sm mt-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/15 border border-indigo-500/30 rounded-xl text-indigo-400">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-zinc-100 flex items-center gap-2">
              Tutor personal: Sesión de refuerzo personalizada
              {blindSpots.length > 0 && (
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30 font-bold">
                  {blindSpots.length} Países Prioritarios
                </span>
              )}
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
              Accede a la sección de Tutor para revisar tu mazo de tarjetas, consultar diagnósticos e iniciar la práctica de repaso.
            </p>
          </div>
        </div>
        <button
          onClick={onGoToTutor}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2 active:scale-95 border border-indigo-500"
        >
          <Brain className="w-4 h-4" />
          <span>Ir al Tutor Personal</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Modal de Configuración Específica del Modo Elegido */}
      <AnimatePresence>
        {activeConfigMode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveConfigMode(null)}
              className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.15 }}
              className="relative z-10 w-full max-w-xl bg-[#18181B] border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl overflow-hidden space-y-6 max-h-[90vh] overflow-y-auto"
            >
              {/* Botón Cerrar (X) */}
              <button
                onClick={() => setActiveConfigMode(null)}
                className="absolute top-5 right-5 p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all active:scale-95 border border-zinc-700"
                title="Cerrar (Esc)"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Cabecera del Modo */}
              <div className="flex items-center gap-3.5 pr-10">
                <div className="text-2xl p-2.5 bg-zinc-900 rounded-xl border border-zinc-800 select-none">
                  {activeModeData.bgEmoji}
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">
                    Ajustes de Partida
                  </span>
                  <h2 className="text-xl sm:text-2xl font-display font-semibold text-zinc-100 mt-1 tracking-wide">
                    {activeModeData.title}
                  </h2>
                </div>
              </div>

              {/* OPCIÓN 1: CONTINENTE */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2.5">
                  1. Selecciona Región o Continente
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {continents.map((c) => {
                    const isSelected = config.continent === c.id;
                    return (
                      <button
                        key={c.id}
                        onClick={() => onChangeConfig({ continent: c.id })}
                        className={`p-3 rounded-xl border text-center font-semibold text-xs transition-all flex items-center justify-center gap-2 ${
                          isSelected
                            ? 'bg-zinc-100 text-zinc-950 font-bold border-zinc-200 shadow-sm'
                            : 'bg-zinc-900/80 hover:bg-zinc-800 border-zinc-800 text-zinc-300'
                        }`}
                      >
                        <span className="text-base">{c.icon}</span>
                        <span>{c.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* OPCIÓN 2: QUÉ DESEAS IDENTIFICAR (Click & Find) */}
              {activeConfigMode === 'click-find' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2.5">
                    2. ¿Qué deseas identificar?
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {questionTypes.map((q) => {
                      const isSelected = config.questionType === q.id;
                      return (
                        <button
                          key={q.id}
                          onClick={() => onChangeConfig({ questionType: q.id })}
                          className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                            isSelected
                              ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                              : 'bg-zinc-900/80 hover:bg-zinc-800 border-zinc-800 text-zinc-300'
                          }`}
                        >
                          {q.icon}
                          <span>{q.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* OPCIÓN 3: DURACIÓN / CANTIDAD DE PAÍSES */}
              {(activeConfigMode === 'flag-skip-chain' || 
                activeConfigMode === 'click-find' || 
                activeConfigMode === 'input-write') && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2.5">
                    {activeConfigMode === 'flag-skip-chain' ? '2. Cantidad de Banderas en la Partida' : '3. Duración de la Partida'}
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {questionCounts.map((item) => {
                      const isSelected = config.totalQuestions === item.count;
                      return (
                        <button
                          key={item.count}
                          onClick={() => onChangeConfig({ totalQuestions: item.count })}
                          className={`p-2.5 rounded-xl border text-center transition-all ${
                            isSelected
                              ? 'bg-emerald-600 text-white border-emerald-500 font-bold shadow-sm'
                              : 'bg-zinc-900/80 hover:bg-zinc-800 border-zinc-800 text-zinc-300'
                          }`}
                        >
                          <div className="text-xs font-bold truncate">{item.label}</div>
                          <div className="text-[10px] opacity-70 truncate">{item.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* OPCIÓN: PACK TEMÁTICO DE CIUDADES (City Pinpoint) */}
              {activeConfigMode === 'city-pinpoint' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2.5">
                    2. Pack Temático de Ciudades (Opcional)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'all', label: '🌐 Mundo Entero', desc: 'Normal (Todas las ciudades)' },
                      { id: 'megacities', label: '🏙️ Megaciudades', desc: '> 5M habitantes' },
                      { id: 'historic', label: '🏛️ Históricas', desc: 'Atenas, Roma, Cuzco...' },
                      { id: 'islands_coastal', label: '🏝️ Islas & Costas', desc: 'Destinos turísticos' },
                      { id: 'usa', label: '🇺🇸 Solo EE. UU.', desc: 'Ciudades de EE. UU.' },
                      { id: 'europe', label: '🏰 Solo Europa', desc: 'Ciudades europeas' },
                    ].map((item) => {
                      const isSelected = (config.cityTheme || 'all') === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => onChangeConfig({ cityTheme: item.id as any })}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            isSelected
                              ? 'bg-cyan-600 text-white border-cyan-500 font-bold shadow-sm'
                              : 'bg-zinc-900/80 hover:bg-zinc-800 border-zinc-800 text-zinc-300'
                          }`}
                        >
                          <div className="text-xs font-bold">{item.label}</div>
                          <div className="text-[10px] opacity-75 mt-0.5">{item.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* OPCIÓN: CANTIDAD DE CURIOSIDADES */}
              {activeConfigMode === 'trivia-curiosities' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2.5">
                    2. Número de Curiosidades en la Partida
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { count: 10, label: '10 Curiosidades', desc: 'Partida Rápida' },
                      { count: 25, label: '25 Curiosidades', desc: 'Partida Estándar' },
                      { count: 50, label: '50 Curiosidades', desc: 'Gran Desafío' },
                    ].map((item) => {
                      const isSelected = (config.totalQuestions || 10) === item.count;
                      return (
                        <button
                          key={item.count}
                          type="button"
                          onClick={() => onChangeConfig({ totalQuestions: item.count })}
                          className={`p-3 rounded-xl border text-center transition-all ${
                            isSelected
                              ? 'bg-indigo-600 text-white border-indigo-500 font-bold shadow-sm'
                              : 'bg-zinc-900/80 hover:bg-zinc-800 border-zinc-800 text-zinc-300'
                          }`}
                        >
                          <div className="text-xs sm:text-sm font-bold">{item.label}</div>
                          <div className="text-[11px] opacity-80 mt-0.5">{item.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* OPCIÓN 4: MODO FRIKI */}
              {activeConfigMode !== 'trivia-curiosities' && activeConfigMode !== 'explore' && (
                <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg border ${
                      config.isGeekMode
                        ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                    }`}>
                      <Brain className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-100">
                        🧠 Modo Friki (+40 Territorios Especiales & Estados de Facto)
                      </h4>
                      <p className="text-[11px] text-zinc-400 mt-0.5 max-w-md">
                        Incluye Puerto Rico, Groenlandia, Bermudas, Caimán, Malvinas, Somalilandia, Cook, etc.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onChangeConfig({ isGeekMode: !config.isGeekMode })}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      config.isGeekMode
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
                        : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-300'
                    }`}
                  >
                    {config.isGeekMode ? 'ACTIVADO' : 'DESACTIVADO'}
                  </button>
                </div>
              )}

              {/* BOTÓN PRINCIPAL DE INICIO DE LA PARTIDA */}
              <div className="pt-2">
                <button
                  onClick={handleStartFromModal}
                  className="w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm sm:text-base shadow-sm transition-all flex items-center justify-center gap-2 active:scale-98"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {activeConfigMode === 'flag-skip-chain'
                      ? '¡Comenzar Desafío de Banderas!'
                      : activeConfigMode === 'list-select'
                      ? '¡Comenzar Lista y Mapa!'
                      : activeConfigMode === 'trivia-curiosities'
                      ? '¡Comenzar Trivia!'
                      : activeConfigMode === 'explore'
                      ? '¡Comenzar a Explorar!'
                      : '¡Comenzar Partida!'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
