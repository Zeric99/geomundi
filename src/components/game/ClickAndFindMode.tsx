import React from 'react';
import { Lightbulb, HelpCircle, MapPin, Flag, Landmark, ZoomIn } from 'lucide-react';
import { Continent, Country, CountryMapStatus } from '../../types/country';
import { Question } from '../../types/game';
import { WorldMap } from '../map/WorldMap';

interface ClickAndFindModeProps {
  question: Question;
  countryStatuses: Record<string, CountryMapStatus>;
  onCountryClick: (country: Country, cca3: string) => void;
  onUseHint: () => void;
  activeHint: string | null;
  isEvaluating: boolean;
  isGeekMode?: boolean;
  continent?: Continent;
  onOpenFlagModal?: (country: Country) => void;
}

export const ClickAndFindMode: React.FC<ClickAndFindModeProps> = ({
  question,
  countryStatuses,
  onCountryClick,
  onUseHint,
  activeHint,
  isEvaluating,
  isGeekMode = false,
  continent = 'World',
  onOpenFlagModal
}) => {
  const { country, questionType } = question;

  return (
    <div className="space-y-4">
      {/* Tarjeta de Pregunta Activa */}
      <div className="bg-[#18181B]/95 backdrop-blur-md border border-zinc-800 rounded-xl p-4 sm:p-5 shadow-card-subtle flex items-center justify-between gap-4 flex-wrap relative overflow-hidden border-l-4 border-l-indigo-500">
        <div className="flex items-center gap-4">
          {/* Visual según tipo de pregunta con soporte para ampliación de bandera */}
          {questionType === 'flag' && (
            <div 
              onClick={() => onOpenFlagModal?.(country)}
              title="🔍 Haz clic para ampliar la bandera en alta definición"
              className="w-20 h-14 sm:w-24 sm:h-16 rounded-lg overflow-hidden shadow-sm border border-zinc-700/80 bg-zinc-900 flex-shrink-0 cursor-zoom-in hover:border-indigo-500/80 hover:ring-1 hover:ring-indigo-500/50 transition-all active:scale-95 group relative"
            >
              <img
                src={country.flagSvg}
                alt="Bandera a adivinar"
                className="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-200 group-hover:scale-105 transition-transform"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <ZoomIn className="w-5 h-5 text-white drop-shadow" />
              </div>
            </div>
          )}

          {questionType === 'name' && (
            <div className="p-3 sm:p-3.5 bg-indigo-950/40 border border-indigo-800/50 rounded-xl text-indigo-400">
              <MapPin className="w-7 h-7" />
            </div>
          )}

          {questionType === 'capital' && (
            <div className="p-3 sm:p-3.5 bg-purple-950/40 border border-purple-800/50 rounded-xl text-purple-300">
              <Landmark className="w-7 h-7" />
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-medium text-zinc-400 uppercase tracking-wider mb-0.5">
              <span>{question.promptText}</span>
            </div>

            {questionType === 'name' && (
              <div className="flex items-center gap-2.5">
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-zinc-100 tracking-wide">
                  {country.nameEs}
                </h2>
                {onOpenFlagModal && (
                  <button
                    onClick={() => onOpenFlagModal(country)}
                    title="🔍 Ampliar bandera oficial"
                    className="text-xl hover:scale-110 transition-transform p-1 rounded-md hover:bg-zinc-800"
                  >
                    {country.flagEmoji}
                  </button>
                )}
              </div>
            )}

            {questionType === 'capital' && (
              <div>
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-zinc-100 tracking-wide">
                  {country.capital}
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5 font-sans">
                  Haz clic en el país correspondiente en el mapa
                </p>
              </div>
            )}

            {questionType === 'flag' && (
              <div>
                <h2 className="text-lg sm:text-xl font-display font-semibold text-zinc-200 tracking-wide">
                  ¿A qué país pertenece esta bandera?
                </h2>
                <p className="text-xs text-indigo-400 mt-0.5 flex items-center gap-1 font-sans">
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>Haz clic en la bandera para verla en pantalla completa</span>
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
            className={`px-4 py-2 rounded-lg border text-xs font-medium transition-all flex items-center gap-2 ${
              question.hintUsed
                ? 'bg-zinc-800/60 border-zinc-700 text-zinc-500 cursor-not-allowed'
                : 'bg-amber-950/40 hover:bg-amber-900/50 border-amber-800/60 text-amber-200 shadow-sm active:scale-95'
            }`}
          >
            <Lightbulb className="w-4 h-4 text-amber-400" />
            {question.hintUsed ? 'Pista Utilizada' : 'Pedir Pista'}
          </button>
        </div>
      </div>

      {/* Banner de Pista Activa si fue usada */}
      {activeHint && (
        <div className="bg-amber-950/30 border border-amber-800/50 rounded-lg px-4 py-2.5 text-amber-200 text-xs sm:text-sm flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2">
          <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span><strong>Pista:</strong> {activeHint}</span>
        </div>
      )}

      {/* Mapa Interactivo */}
      <div className="relative flex-1 min-h-[360px] h-[calc(100vh-210px)] max-h-[calc(100vh-210px)] w-full rounded-xl overflow-hidden shadow-lg border border-zinc-800">
        <WorldMap
          countryStatuses={countryStatuses}
          onCountryClick={onCountryClick}
          continent={continent}
          targetCountryCode={question.hintUsed ? country.cca3 : null}
          interactive={!isEvaluating}
          isGeekMode={isGeekMode}
        />
      </div>
    </div>
  );
};
