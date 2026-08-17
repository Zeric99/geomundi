import React from 'react';
import { Globe, MapPin, Type, Layers, Compass, Sparkles, Flag, Landmark, Zap, Flame, Trophy, ListChecks } from 'lucide-react';
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
  const continents: { id: Continent; label: string; icon: string }[] = [
    { id: 'World', label: 'Mundo Entero', icon: '🌍' },
    { id: 'Europe', label: 'Europa', icon: '🏰' },
    { id: 'Americas', label: 'América', icon: '🌎' },
    { id: 'Africa', label: 'África', icon: '🦁' },
    { id: 'Asia', label: 'Asia', icon: '🏯' },
    { id: 'Oceania', label: 'Oceanía', icon: '🏝️' },
  ];

  const modes: { id: GameMode; title: string; desc: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'list-select',
      title: 'Lista & Mapa (Colores)',
      desc: 'Pulsa el nombre de un país de la lista y ubícalo: Verde (1º), Amarillo (2º), Rojo (Fallo).',
      icon: <ListChecks className="w-5 h-5 text-emerald-400" />,
      badge: '¡Nuevo!'
    },
    {
      id: 'trivia-curiosities',
      title: 'Trivia y Curiosidades',
      desc: 'Preguntas de récords mundiales, curiosidades insólitas y datos únicos de cada país.',
      icon: <Trophy className="w-5 h-5 text-indigo-400" />,
      badge: 'Popular'
    },
    {
      id: 'click-find',
      title: 'Click & Find',
      desc: 'Te damos un país, bandera o capital y tú lo ubicas en el mapa.',
      icon: <MapPin className="w-5 h-5 text-cyan-400" />
    },
    {
      id: 'input-write',
      title: 'Modo Escribir',
      desc: 'El mapa resalta un país y escribes su nombre con tolerancia a tildes.',
      icon: <Type className="w-5 h-5 text-teal-400" />
    },
    {
      id: 'match-cards',
      title: 'Match / Emparejar',
      desc: 'Empareja 5 tarjetas interactivas con sus países en el mapa.',
      icon: <Layers className="w-5 h-5 text-purple-400" />
    },
    {
      id: 'explore',
      title: 'Modo Explorador',
      desc: 'Navegación libre: haz clic en cualquier país para aprender datos.',
      icon: <Compass className="w-5 h-5 text-amber-400" />
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
    { count: 195, label: '🌍 Todos (195+)', desc: 'Mundo Entero' },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
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
            Iniciar Práctica Focalizada
          </button>
        </div>
      )}

      {/* 1. Selector de Modo de Juego */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
          1. Selecciona Modalidad de Juego
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {modes.map((m) => {
            const isSelected = config.mode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => onChangeConfig({ mode: m.id })}
                className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'bg-gradient-to-b from-[#1E2B48] to-[#131C2E] border-cyan-500/80 shadow-glow-cyan scale-[1.02]'
                    : 'bg-[#131C2E]/70 hover:bg-[#1A2740] border-slate-800 text-slate-300'
                }`}
              >
                {m.badge && (
                  <span className={`absolute top-2.5 right-2.5 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                    m.id === 'trivia-curiosities'
                      ? 'bg-indigo-500/30 text-indigo-300 border-indigo-500/50 animate-pulse'
                      : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  }`}>
                    {m.badge}
                  </span>
                )}
                <div>
                  <div className="p-2.5 bg-slate-900/60 rounded-xl w-fit mb-3 border border-slate-700/60">
                    {m.icon}
                  </div>
                  <h4 className="font-display font-bold text-white text-base mb-1">
                    {m.title}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {m.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Selector de Continente */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
          2. Selecciona Región / Continente
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {continents.map((c) => {
            const isSelected = config.continent === c.id;
            return (
              <button
                key={c.id}
                onClick={() => onChangeConfig({ continent: c.id })}
                className={`py-3 px-3 rounded-xl border text-center font-semibold text-sm transition-all flex flex-col items-center gap-1.5 ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-glow-cyan'
                    : 'bg-[#131C2E] hover:bg-[#1A2740] border-slate-800 text-slate-200'
                }`}
              >
                <span className="text-xl">{c.icon}</span>
                <span className="text-xs">{c.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Selector de Preguntas & Cantidad (Solo si no es explorador ni trivia) */}
      {config.mode !== 'explore' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tipo de Pregunta (Solo para modos estándar) */}
          {config.mode !== 'trivia-curiosities' ? (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                3. ¿Qué deseas identificar?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {questionTypes.map((q) => {
                  const isSelected = config.questionType === q.id;
                  return (
                    <button
                      key={q.id}
                      onClick={() => onChangeConfig({ questionType: q.id })}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                        isSelected
                          ? 'bg-purple-600 text-white border-purple-400 shadow-glow-purple'
                          : 'bg-[#131C2E] hover:bg-[#1A2740] border-slate-800 text-slate-300'
                      }`}
                    >
                      {q.icon}
                      <span>{q.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                3. Tipo de Trivia
              </label>
              <div className="p-3 bg-indigo-950/30 border border-indigo-800/40 rounded-xl text-xs text-indigo-200 flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-indigo-400 shrink-0" />
                <span>Rondas de <strong>10 preguntas aleatorias</strong> extraídas de la pool completa de más de 200 curiosidades mundiales.</span>
              </div>
            </div>
          )}

          {/* Cantidad de Preguntas / Modo Todos los Países */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              4. Duración de la Partida
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {questionCounts.map((item) => {
                const isSelected = config.totalQuestions === item.count;
                return (
                  <button
                    key={item.count}
                    onClick={() => onChangeConfig({ totalQuestions: item.count })}
                    className={`py-2 px-1.5 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-400 shadow-glow-emerald'
                        : 'bg-[#131C2E] hover:bg-[#1A2740] border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="text-[11px] font-bold truncate">{item.label}</div>
                    <div className="text-[9px] opacity-70 truncate">{item.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Botón de Inicio Principal */}
      <div className="pt-2">
        <button
          onClick={() => onStartGame()}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-display font-extrabold text-lg tracking-wide shadow-glow-cyan transition-all transform active:scale-[0.99] flex items-center justify-center gap-3"
        >
          <Sparkles className="w-5 h-5 fill-slate-950" />
          {config.mode === 'explore' 
            ? 'Comenzar a Explorar el Mundo' 
            : config.mode === 'trivia-curiosities'
            ? '¡Jugar Trivia de Curiosidades (10 Preguntas)!'
            : config.totalQuestions >= 190
            ? '¡Comenzar Desafío Completo: Mundo Entero (195+ Países)!'
            : '¡Comenzar Desafío!'}
        </button>
      </div>
    </div>
  );
};
