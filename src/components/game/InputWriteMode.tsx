import React, { useState, useEffect, useRef } from 'react';
import { Send, Lightbulb, AlertCircle, CheckCircle2, HelpCircle } from 'lucide-react';
import { Country, CountryMapStatus } from '../../types/country';
import { Question } from '../../types/game';
import { WorldMap } from '../map/WorldMap';
import { checkCountryNameMatch } from '../../services/stringMatcher';

interface InputWriteModeProps {
  question: Question;
  countryStatuses: Record<string, CountryMapStatus>;
  onSubmitAnswer: (country: Country) => void;
  onUseHint: () => void;
  activeHint: string | null;
  isEvaluating: boolean;
}

export const InputWriteMode: React.FC<InputWriteModeProps> = ({
  question,
  countryStatuses,
  onSubmitAnswer,
  onUseHint,
  activeHint,
  isEvaluating
}) => {
  const [inputValue, setInputValue] = useState<string>('');
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'info' | 'warn' | 'error' } | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const { country } = question;

  // Auto-enfocar el input cuando cambie de pregunta
  useEffect(() => {
    setInputValue('');
    setFeedbackMsg(null);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 150);
  }, [question.id]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isEvaluating) return;

    const matchResult = checkCountryNameMatch(inputValue, {
      nameEs: country.nameEs,
      nameEn: country.nameEn,
      officialNameEs: country.officialNameEs,
      altSpellings: country.altSpellings
    });

    if (matchResult.matched) {
      setFeedbackMsg({
        text: `¡Correcto! Es ${country.nameEs}`,
        type: 'info'
      });
      onSubmitAnswer(country);
    } else if (matchResult.isClose) {
      setFeedbackMsg({
        text: `Muy cerca... Revisa la ortografía de "${country.nameEs.slice(0, 3)}..."`,
        type: 'warn'
      });
      // Contar como fallo si el usuario gasta intentos
      onSubmitAnswer({ ...country, cca3: 'WRONG_TEMP' });
    } else {
      setFeedbackMsg({
        text: `Incorrecto. No coincide con el país resaltado.`,
        type: 'error'
      });
      onSubmitAnswer({ ...country, cca3: 'WRONG_TEMP' });
    }
  };

  return (
    <div className="space-y-4">
      {/* Panel Superior de Escritura */}
      <div className="bg-[#131C2E]/95 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <img
              src={country.flagSvg}
              alt="Bandera del país resaltado"
              className="w-12 h-8 rounded-lg object-cover shadow border border-slate-700"
            />
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Modo Escritura Ortográfica
              </span>
              <h3 className="text-lg sm:text-xl font-display font-bold text-white">
                ¿Cómo se llama el país resaltado en <span className="text-amber-400 font-bold">ámbar</span> en el mapa?
              </h3>
            </div>
          </div>

          <button
            onClick={onUseHint}
            disabled={question.hintUsed || isEvaluating}
            className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 ${
              question.hintUsed
                ? 'bg-slate-800/60 border-slate-700 text-slate-500 cursor-not-allowed'
                : 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/40 text-amber-300 active:scale-95'
            }`}
          >
            <Lightbulb className="w-4 h-4 text-amber-400" />
            {question.hintUsed ? 'Pista Activa' : 'Revelar Pista'}
          </button>
        </div>

        {/* Formulario de Input */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isEvaluating}
              placeholder="Escribe el nombre del país (ej. Alemania, España, Perú)..."
              className="w-full bg-[#0B0F19] border-2 border-slate-700 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/20 rounded-xl px-4 py-3 text-white text-base sm:text-lg font-medium placeholder-slate-500 transition-all outline-none"
            />
            {question.hintUsed && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-amber-400 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/30">
                Empieza por: {country.nameEs.charAt(0)}...
              </span>
            )}
          </div>
          <button
            type="submit"
            disabled={!inputValue.trim() || isEvaluating}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 font-display font-extrabold rounded-xl shadow-glow-cyan transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 active:scale-95"
          >
            <span>Validar</span>
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* Mensaje de Feedback */}
        {feedbackMsg && (
          <div className={`p-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-1 ${
            feedbackMsg.type === 'info'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : feedbackMsg.type === 'warn'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
          }`}>
            {feedbackMsg.type === 'info' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            {feedbackMsg.type === 'warn' && <AlertCircle className="w-4 h-4 text-amber-400" />}
            {feedbackMsg.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}
            <span>{feedbackMsg.text}</span>
          </div>
        )}

        {/* Pista adicional */}
        {activeHint && (
          <div className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-xl p-2.5">
            <strong>Pista del Tutor:</strong> {activeHint}
          </div>
        )}
      </div>

      {/* Mapa Resaltando el país a escribir */}
      <div className="h-[480px] sm:h-[560px] w-full">
        <WorldMap
          countryStatuses={{
            ...countryStatuses,
            [country.cca3.toUpperCase()]: 'hint'
          }}
          targetCountryCode={country.cca3}
          continent={country.continent}
          interactive={false}
        />
      </div>
    </div>
  );
};
