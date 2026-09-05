import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Continent, Country, CountryMapStatus } from '../../types/country';
import { Question } from '../../types/game';
import { WorldMap } from '../map/WorldMap';
import { 
  Sparkles, 
  HelpCircle, 
  Flame, 
  Heart, 
  Trophy, 
  Compass, 
  Mountain, 
  Landmark, 
  BookOpen, 
  ArrowRight,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Target,
  Check
} from 'lucide-react';

interface TriviaCuriositiesModeProps {
  currentQuestion: Question | null;
  currentIndex: number;
  totalQuestions: number;
  lives: number;
  score: number;
  streak: number;
  countryStatuses: Record<string, CountryMapStatus>;
  isEvaluating: boolean;
  activeHint: string | null;
  onCountrySelect: (country: Country) => void;
  onUseHint: () => void;
  onQuit: () => void;
  onNextQuestion?: () => void;
  isGeekMode?: boolean;
  continent?: Continent;
}

const CATEGORY_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  records: { label: 'Récord Mundial', icon: Trophy, color: 'text-amber-400', bg: 'bg-amber-500/15 border-amber-500/30' },
  nature: { label: 'Naturaleza y Geografía', icon: Mountain, color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30' },
  history: { label: 'Historia y Civilizaciones', icon: Landmark, color: 'text-blue-400', bg: 'bg-blue-500/15 border-blue-500/30' },
  culture: { label: 'Cultura y Tradición', icon: Sparkles, color: 'text-purple-400', bg: 'bg-purple-500/15 border-purple-500/30' },
  geography: { label: 'Geografía Insólita', icon: Compass, color: 'text-cyan-400', bg: 'bg-cyan-500/15 border-cyan-500/30' }
};

export const TriviaCuriositiesMode: React.FC<TriviaCuriositiesModeProps> = ({
  currentQuestion,
  currentIndex,
  totalQuestions,
  lives,
  score,
  streak,
  countryStatuses,
  isEvaluating,
  activeHint,
  onCountrySelect,
  onUseHint,
  onQuit,
  onNextQuestion,
  isGeekMode = false,
  continent = 'World'
}) => {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [showFactModal, setShowFactModal] = useState<boolean>(false);
  const [lastFactAnswer, setLastFactAnswer] = useState<{ 
    isCorrect: boolean; 
    fact: string; 
    countryName: string; 
    capital: string; 
    flag: string;
    flagEmoji: string;
  } | null>(null);

  const trivia = currentQuestion?.triviaItem;
  const categoryInfo = trivia ? CATEGORY_CONFIG[trivia.category] || CATEGORY_CONFIG.records : CATEGORY_CONFIG.records;
  const CategoryIcon = categoryInfo.icon;

  // Reiniciar selección local al cambiar de pregunta
  useEffect(() => {
    setSelectedCountry(null);
    setShowFactModal(false);
  }, [currentQuestion?.id]);

  // Detectar evaluación para mostrar el modal de explicación de la curiosidad
  useEffect(() => {
    if (isEvaluating && currentQuestion) {
      const correctCca3 = currentQuestion.country.cca3.toUpperCase();
      const status = countryStatuses[correctCca3];

      if (status === 'correct' || status === 'hint' || status === 'wrong') {
        const isCorrect = status === 'correct';
        setLastFactAnswer({
          isCorrect,
          fact: trivia?.factExplanation || `Dato: ${currentQuestion.country.nameEs} es el país al que corresponde esta curiosidad.`,
          countryName: currentQuestion.country.nameEs,
          capital: currentQuestion.country.capital,
          flag: currentQuestion.country.flagSvg,
          flagEmoji: currentQuestion.country.flagEmoji
        });
        setShowFactModal(true);
      }
    }
  }, [isEvaluating, currentQuestion, countryStatuses, trivia]);

  const handleMapClick = (country: Country) => {
    if (!isEvaluating) {
      setSelectedCountry(country);
    }
  };

  const handleConfirmAnswer = () => {
    if (selectedCountry && !isEvaluating) {
      onCountrySelect(selectedCountry);
    }
  };

  const handleNext = () => {
    setShowFactModal(false);
    setSelectedCountry(null);
    if (onNextQuestion) {
      onNextQuestion();
    }
  };

  if (!currentQuestion) return null;

  return (
    <div className="flex flex-col h-full min-h-0 gap-2 max-w-7xl mx-auto w-full px-1 sm:px-2 overflow-hidden">
      {/* Barra Superior: Categoría, Vidas, Racha, Puntuación */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-[#18181B]/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-zinc-800 shadow-card-subtle shrink-0">
        {/* Contador y Badge de Categoría */}
        <div className="flex items-center gap-2.5">
          <div className="px-2.5 py-0.5 bg-zinc-800 rounded-md border border-zinc-700 text-xs font-mono font-medium text-zinc-300">
            Pregunta <span className="text-indigo-400 font-bold">{currentIndex + 1}</span> / {totalQuestions}
          </div>

          <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border text-xs font-mono font-medium ${categoryInfo.bg} ${categoryInfo.color}`}>
            <CategoryIcon className="w-3.5 h-3.5" />
            <span>{categoryInfo.label}</span>
          </div>
        </div>

        {/* Vidas y Racha */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-rose-950/30 border border-rose-800/40 px-2 py-0.5 rounded-md">
            {[...Array(3)].map((_, i) => (
              <Heart
                key={i}
                className={`w-3.5 h-3.5 transition-all duration-300 ${
                  i < lives
                    ? 'fill-rose-500 text-rose-500'
                    : 'text-zinc-700 opacity-40'
                }`}
              />
            ))}
          </div>

          {streak > 1 && (
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 bg-amber-950/40 border border-amber-800/50 px-2 py-0.5 rounded-md text-amber-300 font-mono text-xs"
            >
              <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>x{streak}</span>
            </motion.div>
          )}

          <div className="text-right font-mono">
            <span className="text-[10px] uppercase text-zinc-500 font-medium tracking-wider mr-1">Pts:</span>
            <span className="text-base font-normal text-emerald-400">{score}</span>
          </div>

          <button
            onClick={onQuit}
            className="text-xs text-zinc-400 hover:text-zinc-200 px-2 py-1 rounded-md hover:bg-zinc-800 transition font-mono"
          >
            Salir
          </button>
        </div>
      </div>

      {/* Tarjeta de Pregunta de Trivia / Curiosidad */}
      <motion.div
        key={currentQuestion.id}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-[#18181B]/95 backdrop-blur-md p-3 sm:p-4 rounded-xl border border-zinc-800 shadow-card-subtle shrink-0 border-l-4 border-l-indigo-500"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2.5">
          <div className="flex items-start gap-2.5 max-w-4xl">
            <div className="p-2 bg-indigo-950/50 border border-indigo-800/60 rounded-lg shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-indigo-400">Curiosidad Geográfica</span>
                <span className="text-zinc-600">•</span>
                <span className="text-[11px] text-zinc-400 font-sans">Toca un país para ver su nombre y confírmalo</span>
              </div>
              <h2 className="text-sm sm:text-base md:text-lg font-serif font-normal text-zinc-100 leading-snug">
                {currentQuestion.promptText}
              </h2>
            </div>
          </div>

          {/* Botón de Pista */}
          <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
            <button
              onClick={onUseHint}
              disabled={currentQuestion.hintUsed || isEvaluating}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentQuestion.hintUsed
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                  : 'bg-amber-950/40 hover:bg-amber-900/50 text-amber-200 border border-amber-800/60 shadow-sm'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>{currentQuestion.hintUsed ? 'Pista usada' : 'Pedir Pista'}</span>
            </button>
          </div>
        </div>

        {/* Pista Activa */}
        <AnimatePresence>
          {(activeHint || (currentQuestion.hintUsed && trivia?.hint)) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 p-2 bg-amber-950/30 border border-amber-800/50 rounded-lg text-amber-200 text-xs flex items-center gap-2 font-sans"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span><strong>Pista:</strong> {trivia?.hint || activeHint}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Barra Interactiva de Selección y Confirmación */}
      {!isEvaluating && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 rounded-xl border bg-[#18181B]/95 backdrop-blur-md shrink-0 border-zinc-800 shadow-sm">
          {selectedCountry ? (
            <div className="flex items-center gap-2 flex-wrap font-sans">
              <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-indigo-400 flex items-center gap-1">
                <Target className="w-3.5 h-3.5" /> Seleccionado:
              </span>
              <span className="text-base">{selectedCountry.flagEmoji}</span>
              <strong className="text-zinc-100 text-xs sm:text-sm font-medium">{selectedCountry.nameEs}</strong>
              <span className="text-zinc-400 text-xs font-sans">(Capital: {selectedCountry.capital || 'N/A'})</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-zinc-400 font-sans">
              <HelpCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>Haz clic en cualquier país del mapa para seleccionarlo y ver su nombre</span>
            </div>
          )}

          <button
            onClick={handleConfirmAnswer}
            disabled={!selectedCountry || isEvaluating}
            className={`px-4 py-1.5 rounded-lg font-medium text-xs transition-all flex items-center gap-1.5 shrink-0 active:scale-95 ${
              selectedCountry
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>Confirmar {selectedCountry ? `(${selectedCountry.nameEs})` : 'Respuesta'}</span>
          </button>
        </div>
      )}

      {/* Mapa Interactivo Principal */}
      <div className="relative flex-1 min-h-0 w-full rounded-xl overflow-hidden shadow-lg border border-zinc-800">
        <WorldMap
          countryStatuses={countryStatuses}
          selectedCountryCode={!isEvaluating && selectedCountry ? selectedCountry.cca3 : null}
          continent={continent}
          onCountryClick={handleMapClick}
          interactive={!isEvaluating}
          enableTooltip={true}
          isGeekMode={isGeekMode}
        />

        {/* Modal Flotante de Explicación de la Curiosidad */}
        <AnimatePresence>
          {showFactModal && lastFactAnswer && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-xl bg-[#18181B] p-4 sm:p-5 rounded-2xl border border-zinc-700 shadow-2xl space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-lg border shrink-0 ${
                    lastFactAnswer.isCorrect 
                      ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-400' 
                      : 'bg-amber-950/60 border-amber-800/60 text-amber-400'
                  }`}>
                    {lastFactAnswer.isCorrect ? <CheckCircle2 className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                  </div>

                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-300">
                      {lastFactAnswer.isCorrect ? '✓ ¡Acertaste!' : '📍 País Correcto'}
                    </span>
                    <div className="flex items-center gap-2 flex-wrap mt-0.5">
                      <span className="text-xl">{lastFactAnswer.flagEmoji}</span>
                      <h3 className="text-base sm:text-lg font-serif font-normal text-zinc-100">
                        {lastFactAnswer.countryName}
                      </h3>
                      <span className="text-[11px] text-zinc-400 font-mono bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">
                        Capital: {lastFactAnswer.capital}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Botón Siguiente Pregunta */}
                <button
                  onClick={handleNext}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-sm transition-all flex items-center gap-1.5 shrink-0 active:scale-95"
                >
                  <span>Siguiente Pregunta</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Explicación de la Curiosidad */}
              <div className="p-3 bg-[#121214] rounded-lg border border-zinc-800 text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">
                <span className="font-mono text-indigo-400 block mb-1">📖 Curiosidad explicada:</span>
                {lastFactAnswer.fact}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
