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
  CheckCircle2
} from 'lucide-react';
import { Continent } from '../../types/country';
import { GameConfig, GameMode, QuestionType } from '../../types/game';
import { BlindSpotItem } from '../../types/stats';

interface GameFiltersProps {
  config: GameConfig;
  onChangeConfig: (newConfig: Partial<GameConfig>) => void;
  onStartGame: (overrideConfig?: Partial<GameConfig>) => void;
  blindSpots: BlindSpotItem[];
  onStartFocusedPractice: () => void;
}

export const GameFilters: React.FC<GameFiltersProps> = ({
  config,
  onChangeConfig,
  onStartGame,
  blindSpots,
  onStartFocusedPractice
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
    icon: React.ReactNode; 
    badge?: string; 
    accentColor: string; 
    borderGlow: string;
    highlights: string[];
  }[] = [
    {
      id: 'list-select',
      title: 'Modo Clásico: Adivinar Países',
      desc: 'Elige un país de la lista superior y encuéntralo en el mapa. Verde (1º intento), Amarillo (2º intento), Rojo (Fallo).',
      icon: <ListChecks className="w-6 h-6 text-emerald-400" />,
      badge: '⭐ Modo Clásico',
      accentColor: 'from-emerald-500/20 to-teal-600/10',
      borderGlow: 'hover:border-emerald-500/80 hover:shadow-[0_0_30px_rgba(16,185,129,0.25)]',
      highlights: ['Lista completa en pantalla', 'Código de colores', 'Ideal para aprender']
    },
    {
      id: 'flag-skip-chain',
      title: 'Adivina la Bandera',
      desc: 'Descubre el país de cada bandera. Si dudas con alguna puedes saltarla y te volverá a salir en la 2ª ronda hasta completarlas todas.',
      icon: <Flag className="w-6 h-6 text-sky-400" />,
      badge: 'Con Salto & 2ª Vuelta',
      accentColor: 'from-sky-500/20 to-blue-600/10',
      borderGlow: 'hover:border-sky-500/80 hover:shadow-[0_0_30px_rgba(56,189,248,0.25)]',
      highlights: ['Salto de banderas', 'Segunda vuelta automática', 'Banderas en HD']
    },
    {
      id: 'click-find',
      title: 'Localiza en el Mapa',
      desc: 'Te damos un país, bandera o capital y debes localizar su posición exacta directamente sobre el mapa.',
      icon: <MapPin className="w-6 h-6 text-cyan-400" />,
      accentColor: 'from-cyan-500/20 to-sky-600/10',
      borderGlow: 'hover:border-cyan-500/80 hover:shadow-[0_0_30px_rgba(6,182,212,0.25)]',
      highlights: ['Nombres, banderas o capitales', 'Duración configurable', 'Pistas de radar']
    },
    {
      id: 'input-write',
      title: 'Escribir Países',
      desc: 'El mapa ilumina un país en ámbar y debes escribir su nombre exacto en el teclado con tolerancia ortográfica.',
      icon: <Type className="w-6 h-6 text-teal-400" />,
      accentColor: 'from-teal-500/20 to-emerald-600/10',
      borderGlow: 'hover:border-teal-500/80 hover:shadow-[0_0_30px_rgba(20,184,166,0.25)]',
      highlights: ['Escritura con teclado', 'Tolerancia de tildes', 'Memoria activa']
    },
    {
      id: 'trivia-curiosities',
      title: 'Trivia y Curiosidades',
      desc: 'Preguntas de récords mundiales, curiosidades insólitas y hechos geográficos únicos para responder sobre el mapa.',
      icon: <Trophy className="w-6 h-6 text-indigo-400" />,
      badge: 'Trivia',
      accentColor: 'from-indigo-500/20 to-purple-600/10',
      borderGlow: 'hover:border-indigo-500/80 hover:shadow-[0_0_30px_rgba(99,102,241,0.25)]',
      highlights: ['Récords del planeta', 'Cultura e historia', 'Aprende jugando']
    },
    {
      id: 'explore',
      title: 'Modo Explorador',
      desc: 'Navegación libre por el globo: haz clic en cualquier país o isla para ver su ficha, capital, bandera y fronteras.',
      icon: <Compass className="w-6 h-6 text-amber-400" />,
      accentColor: 'from-amber-500/20 to-orange-600/10',
      borderGlow: 'hover:border-amber-500/80 hover:shadow-[0_0_30px_rgba(245,158,11,0.25)]',
      highlights: ['Buscador inteligente', 'Inspección de fronteras', 'Sin límites de tiempo']
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
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Banner de Práctica Focalizada (Tutor IA) si hay puntos ciegos */}
      {blindSpots.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/15 via-purple-500/15 to-cyan-500/15 border border-amber-500/30 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 flex-wrap shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-300">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-display font-bold text-white flex items-center gap-2">
                Sesión de Refuerzo Personalizada
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-amber-500/30 text-amber-300 rounded-full border border-amber-500/40 font-bold">
                  {blindSpots.length} Puntos Ciegos
                </span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                Tu tutor IA ha preparado una ronda rápida con tus países con mayor tasa de error.
              </p>
            </div>
          </div>
          <button
            onClick={onStartFocusedPractice}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-sm shadow-glow-amber transition-all transform active:scale-95 flex items-center gap-2"
          >
            <Zap className="w-4 h-4 fill-slate-950" />
            <span>Iniciar Práctica Focalizada</span>
          </button>
        </div>
      )}

      {/* Título de Selección de Modalidades */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-black font-display text-white">
            Elige una Modalidad de Juego
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Selecciona el modo que prefieras y configúralo a tu medida antes de jugar.
          </p>
        </div>
      </div>

      {/* Grid Principal de Tarjetas de Modos de Juego */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modes.map((m) => (
          <div
            key={m.id}
            onClick={() => handleOpenModeConfig(m.id)}
            className={`cursor-pointer p-5 sm:p-6 rounded-3xl border border-slate-800 bg-gradient-to-b ${m.accentColor} bg-[#111827]/90 backdrop-blur-md transition-all duration-200 transform hover:-translate-y-1 ${m.borderGlow} flex flex-col justify-between group relative overflow-hidden`}
          >
            {/* Badge destacado */}
            {m.badge && (
              <span className="absolute top-4 right-4 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm">
                {m.badge}
              </span>
            )}

            <div>
              <div className="p-3 bg-slate-900/80 rounded-2xl w-fit mb-4 border border-slate-700/80 shadow-md group-hover:scale-110 transition-transform">
                {m.icon}
              </div>

              <h3 className="font-display font-black text-white text-lg sm:text-xl mb-1.5 group-hover:text-cyan-300 transition-colors">
                {m.title}
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
                {m.desc}
              </p>

              {/* Puntos destacados */}
              <div className="flex flex-wrap gap-1.5 mb-5">
                {m.highlights.map((h, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-semibold text-slate-400 bg-slate-900/60 px-2 py-0.5 rounded-lg border border-slate-800"
                  >
                    • {h}
                  </span>
                ))}
              </div>
            </div>

            {/* Botón de acción */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-cyan-400 group-hover:text-cyan-300">
              <span>Configurar y Jugar</span>
              <div className="p-1.5 rounded-xl bg-slate-800/80 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-all">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        ))}
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
              className="absolute inset-0 bg-slate-950/85 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative z-10 w-full max-w-2xl bg-gradient-to-b from-[#131C2E] via-[#0F172A] to-[#0A101C] border border-cyan-500/50 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(6,182,212,0.3)] overflow-hidden space-y-6 max-h-[90vh] overflow-y-auto"
            >
              {/* Glow superior */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-500 shadow-glow-cyan" />

              {/* Botón Cerrar (X) */}
              <button
                onClick={() => setActiveConfigMode(null)}
                className="absolute top-5 right-5 p-2.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all active:scale-95 border border-slate-700"
                title="Cerrar (Esc)"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Cabecera del Modo */}
              <div className="flex items-center gap-3.5 pr-10">
                <div className="p-3 bg-slate-900 rounded-2xl border border-slate-700 text-cyan-400">
                  {activeModeData.icon}
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider font-extrabold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
                    Ajustes de Partida
                  </span>
                  <h2 className="text-2xl font-black font-display text-white mt-0.5">
                    {activeModeData.title}
                  </h2>
                </div>
              </div>

              {/* OPCIÓN 1: CONTINENTE (Para todos los modos) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                  1. Selecciona Región o Continente
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {continents.map((c) => {
                    const isSelected = config.continent === c.id;
                    return (
                      <button
                        key={c.id}
                        onClick={() => onChangeConfig({ continent: c.id })}
                        className={`p-3 rounded-2xl border text-center font-semibold text-xs transition-all flex items-center justify-center gap-2 ${
                          isSelected
                            ? 'bg-gradient-to-r from-cyan-500 to-sky-500 text-slate-950 font-bold border-cyan-400 shadow-glow-cyan scale-[1.02]'
                            : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-slate-200'
                        }`}
                      >
                        <span className="text-base">{c.icon}</span>
                        <span>{c.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* OPCIÓN 2: QUÉ DESEAS IDENTIFICAR (ÚNICAMENTE para Click & Find) */}
              {activeConfigMode === 'click-find' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
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
                              ? 'bg-purple-600 text-white border-purple-400 shadow-glow-purple'
                              : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-slate-300'
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

              {/* OPCIÓN 3: DURACIÓN / CANTIDAD DE PAÍSES (Para Banderas con Salto, Click & Find, Modo Escribir) */}
              {(activeConfigMode === 'flag-skip-chain' || 
                activeConfigMode === 'click-find' || 
                activeConfigMode === 'input-write') && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
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
                              ? 'bg-emerald-600 text-white border-emerald-400 shadow-glow-emerald font-bold'
                              : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-slate-300'
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

              {/* OPCIÓN 4: MODO FRIKI (Para todos los modos excepto Trivia) */}
              {activeConfigMode !== 'trivia-curiosities' && activeConfigMode !== 'explore' && (
                <div className="bg-slate-900/90 border border-purple-500/40 rounded-2xl p-4 flex items-center justify-between gap-4 flex-wrap shadow-md">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl border ${
                      config.isGeekMode
                        ? 'bg-purple-500/20 border-purple-400/50 text-purple-300 shadow-glow-purple'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}>
                      <Brain className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">
                        🧠 Modo Friki (+40 Territorios Especiales & Estados de Facto)
                      </h4>
                      <p className="text-[11px] text-slate-300 mt-0.5 max-w-md">
                        Incluye Puerto Rico, Groenlandia, Bermudas, Caimán, Malvinas, Somalilandia, Cook, etc.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onChangeConfig({ isGeekMode: !config.isGeekMode })}
                    className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all border ${
                      config.isGeekMode
                        ? 'bg-purple-600 border-purple-400 text-white shadow-glow-purple'
                        : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-300'
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
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-display font-extrabold text-base sm:text-lg tracking-wide shadow-glow-cyan transition-all transform active:scale-[0.99] flex items-center justify-center gap-3"
                >
                  <Sparkles className="w-5 h-5 fill-slate-950" />
                  <span>
                    {activeConfigMode === 'flag-skip-chain'
                      ? '¡Comenzar Desafío de Banderas!'
                      : activeConfigMode === 'list-select'
                      ? '¡Comenzar Lista y Mapa!'
                      : activeConfigMode === 'trivia-curiosities'
                      ? '¡Comenzar Trivia (10 Curiosidades)!'
                      : activeConfigMode === 'explore'
                      ? '¡Comenzar a Explorar!'
                      : '¡Comenzar Partida!'}
                  </span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
