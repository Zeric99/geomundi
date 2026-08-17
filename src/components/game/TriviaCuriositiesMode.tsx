import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Country, CountryMapStatus } from '../../types/country';
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
  Lightbulb
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
  onQuit
}) => {
  const [showFactModal, setShowFactModal] = useState<boolean>(false);
  const [lastFactAnswer, setLastFactAnswer] = useState<{ isCorrect: boolean; fact: string; countryName: string; flag: string } | null>(null);

  const trivia = currentQuestion?.triviaItem;
  const categoryInfo = trivia ? CATEGORY_CONFIG[trivia.category] || CATEGORY_CONFIG.records : CATEGORY_CONFIG.records;
  const CategoryIcon = categoryInfo.icon;

  // Detectar respuesta para mostrar el dato curioso
  useEffect(() => {
    if (isEvaluating && currentQuestion) {
      const correctCca3 = currentQuestion.country.cca3.toUpperCase();
      const status = countryStatuses[correctCca3];

      if (status === 'correct' || status === 'hint') {
        setLastFactAnswer({
          isCorrect: status === 'correct',
          fact: trivia?.factExplanation || `Dato: ${currentQuestion.country.nameEs} es la respuesta correcta.`,
          countryName: currentQuestion.country.nameEs,
          flag: currentQuestion.country.flagSvg
        });
        setShowFactModal(true);
      }
    } else {
      setShowFactModal(false);
    }
  }, [isEvaluating, currentQuestion, countryStatuses, trivia]);

  if (!currentQuestion) return null;

  return (
    <div className="flex flex-col h-full gap-4 max-w-7xl mx-auto w-full px-2 sm:px-4">
      {/* Barra Superior: Categoría, Vidas, Racha, Puntuación */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-slate-800 shadow-xl">
        {/* Contador y Badge de Categoría */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 bg-slate-800 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300">
            Pregunta <span className="text-cyan-400 font-bold text-sm">{currentIndex + 1}</span> / {totalQuestions}
          </div>

          <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-semibold ${categoryInfo.bg} ${categoryInfo.color}`}>
            <CategoryIcon className="w-3.5 h-3.5" />
            <span>{categoryInfo.label}</span>
          </div>
        </div>

        {/* Vidas y Racha */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 bg-rose-950/40 border border-rose-800/40 px-2.5 py-1 rounded-xl">
            {[...Array(3)].map((_, i) => (
              <Heart
                key={i}
                className={`w-4 h-4 transition-all duration-300 ${
                  i < lives
                    ? 'fill-rose-500 text-rose-500 drop-shadow-[0_0_6px_rgba(244,63,94,0.7)]'
                    : 'text-slate-600 opacity-40'
                }`}
              />
            ))}
          </div>

          {streak > 1 && (
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 bg-amber-500/20 border border-amber-500/40 px-2.5 py-1 rounded-xl text-amber-400 font-bold text-xs"
            >
              <Flame className="w-4 h-4 fill-amber-400 animate-pulse" />
              <span>x{streak} combo</span>
            </motion.div>
          )}

          <div className="text-right">
            <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider block">Puntos</span>
            <span className="text-lg font-black text-emerald-400 font-mono tracking-tight">{score}</span>
          </div>

          <button
            onClick={onQuit}
            className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded-lg hover:bg-slate-800 transition"
          >
            Salir
          </button>
        </div>
      </div>

      {/* Tarjeta de Pregunta de Trivia / Curiosidad */}
      <motion.div
        key={currentQuestion.id}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-r from-slate-900/95 via-indigo-950/40 to-slate-900/95 backdrop-blur-md p-4 sm:p-6 rounded-2xl border border-indigo-500/30 shadow-2xl overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5 max-w-4xl">
            <div className="p-3 bg-indigo-500/20 border border-indigo-400/30 rounded-2xl shrink-0 mt-0.5">
              <Sparkles className="w-6 h-6 text-indigo-400" />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Curiosidad Geográfica</span>
                <span className="text-slate-500">•</span>
                <span className="text-xs text-slate-400">Haz clic en el mapa en el país correspondiente</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-white leading-snug">
                {currentQuestion.promptText}
              </h2>
            </div>
          </div>

          {/* Botón de Pista */}
          <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
            <button
              onClick={onUseHint}
              disabled={currentQuestion.hintUsed || isEvaluating}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                currentQuestion.hintUsed
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 hover:shadow-glow-amber'
              }`}
            >
              <Lightbulb className="w-4 h-4" />
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
              className="mt-3 p-2.5 bg-amber-950/40 border border-amber-700/50 rounded-xl text-amber-200 text-xs flex items-center gap-2"
            >
              <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span><strong>Pista:</strong> {trivia?.hint || activeHint}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Mapa Interactivo Principal */}
      <div className="relative flex-1 min-h-[460px] rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
        <WorldMap
          countryStatuses={countryStatuses}
          continent="World"
          onCountryClick={onCountrySelect}
          interactive={!isEvaluating}
          enableTooltip={true}
        />

        {/* Modal Flotante de Explicación de la Curiosidad */}
        <AnimatePresence>
          {showFactModal && lastFactAnswer && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-[92%] max-w-lg bg-[#0F172A]/95 backdrop-blur-xl p-4 sm:p-5 rounded-2xl border border-cyan-500/40 shadow-[0_0_30px_rgba(6,182,212,0.25)]"
            >
              <div className="flex items-start gap-3.5">
                <div className={`p-2.5 rounded-xl border shrink-0 ${
                  lastFactAnswer.isCorrect 
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' 
                    : 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                }`}>
                  {lastFactAnswer.isCorrect ? <CheckCircle2 className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <img 
                      src={lastFactAnswer.flag} 
                      alt="" 
                      className="w-5 h-3.5 object-cover rounded shadow-sm"
                    />
                    <h4 className="font-bold text-white text-sm">
                      {lastFactAnswer.isCorrect ? '¡Correcto!' : 'Respuesta:'} <span className="text-cyan-400">{lastFactAnswer.countryName}</span>
                    </h4>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {lastFactAnswer.fact}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
