import React from 'react';
import { Lightbulb, HelpCircle, MapPin, Flag, Landmark } from 'lucide-react';
import { Country, CountryMapStatus } from '../../types/country';
import { Question } from '../../types/game';
import { WorldMap } from '../map/WorldMap';

interface ClickAndFindModeProps {
  question: Question;
  countryStatuses: Record<string, CountryMapStatus>;
  onCountryClick: (country: Country, cca3: string) => void;
  onUseHint: () => void;
  activeHint: string | null;
  isEvaluating: boolean;
}

export const ClickAndFindMode: React.FC<ClickAndFindModeProps> = ({
  question,
  countryStatuses,
  onCountryClick,
  onUseHint,
  activeHint,
  isEvaluating
}) => {
  const { country, questionType } = question;

  return (
    <div className="space-y-4">
      {/* Tarjeta de Pregunta Activa */}
      <div className="bg-[#131C2E]/90 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-4 sm:p-6 shadow-2xl flex items-center justify-between gap-4 flex-wrap relative overflow-hidden">
        {/* Glow de acento */}
        <div className="absolute top-0 left-0 w-2 h-full bg-cyan-400 shadow-glow-cyan" />

        <div className="flex items-center gap-4">
          {/* Visual según tipo de pregunta */}
          {questionType === 'flag' && (
            <div className="w-20 h-14 sm:w-24 sm:h-16 rounded-xl overflow-hidden shadow-lg border border-slate-700 bg-slate-900 flex-shrink-0">
              <img
                src={country.flagSvg}
                alt="Bandera a adivinar"
                className="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-200"
              />
            </div>
          )}

          {questionType === 'name' && (
            <div className="p-3 sm:p-4 bg-cyan-500/15 border border-cyan-500/30 rounded-2xl text-cyan-300">
              <MapPin className="w-8 h-8" />
            </div>
          )}

          {questionType === 'capital' && (
            <div className="p-3 sm:p-4 bg-purple-500/15 border border-purple-500/30 rounded-2xl text-purple-300">
              <Landmark className="w-8 h-8" />
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              <span>{question.promptText}</span>
            </div>

            {questionType === 'name' && (
              <h2 className="text-2xl sm:text-3xl font-display font-black text-white tracking-wide">
                {country.nameEs}
              </h2>
            )}

            {questionType === 'capital' && (
              <div>
                <h2 className="text-2xl sm:text-3xl font-display font-black text-white">
                  {country.capital}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Haz clic en el país correspondiente en el mapa
                </p>
              </div>
            )}

            {questionType === 'flag' && (
              <div>
                <h2 className="text-lg sm:text-xl font-display font-bold text-slate-200">
                  ¿A qué país pertenece esta bandera?
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Localízalo en el mapa interactivo
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Botón de Pista */}
        <div className="flex items-center gap-2">
          <button
            onClick={onUseHint}
            disabled={question.hintUsed || isEvaluating}
            className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 ${
              question.hintUsed
                ? 'bg-slate-800/60 border-slate-700 text-slate-500 cursor-not-allowed'
                : 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/40 text-amber-300 shadow-glow-amber active:scale-95'
            }`}
          >
            <Lightbulb className="w-4 h-4 text-amber-400" />
            {question.hintUsed ? 'Pista Utilizada' : 'Pedir Pista'}
          </button>
        </div>
      </div>

      {/* Banner de Pista Activa si fue usada */}
      {activeHint && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-2.5 text-amber-200 text-xs sm:text-sm flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2">
          <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span><strong>Pista:</strong> {activeHint}</span>
        </div>
      )}

      {/* Mapa Interactivo */}
      <div className="h-[520px] sm:h-[600px] w-full">
        <WorldMap
          countryStatuses={countryStatuses}
          onCountryClick={onCountryClick}
          continent={country.continent}
          targetCountryCode={question.hintUsed ? country.cca3 : null}
          interactive={!isEvaluating}
        />
      </div>
    </div>
  );
};
