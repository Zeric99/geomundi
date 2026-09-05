import React, { useState, useEffect } from 'react';
import { Layers, CheckCircle2, XCircle, Sparkles, HelpCircle, ZoomIn } from 'lucide-react';
import { Country, CountryMapStatus } from '../../types/country';
import { MatchPair, Question } from '../../types/game';
import { WorldMap } from '../map/WorldMap';

interface MatchCardsModeProps {
  questions: Question[];
  onFinishRound: (matchedCount: number, errorCount: number) => void;
  onSingleMatchSuccess: (country: Country) => void;
  onSingleMatchError: (selectedCardCountry: Country, clickedCountry: Country) => void;
  lives: number;
  isGeekMode?: boolean;
  onOpenFlagModal?: (country: Country) => void;
}

export const MatchCardsMode: React.FC<MatchCardsModeProps> = ({
  questions,
  onFinishRound,
  onSingleMatchSuccess,
  onSingleMatchError,
  lives,
  isGeekMode = false,
  onOpenFlagModal
}) => {
  const [pairs, setPairs] = useState<MatchPair[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [mapStatuses, setMapStatuses] = useState<Record<string, CountryMapStatus>>({});
  const [errorFlashId, setErrorFlashId] = useState<string | null>(null);
  const [orientationMsg, setOrientationMsg] = useState<string | null>(null);

  // Inicializar las 5 tarjetas de la ronda actual
  useEffect(() => {
    const subset = questions.slice(0, 5);
    const initialPairs: MatchPair[] = subset.map((q) => ({
      id: `pair_${q.country.cca3}`,
      country: q.country,
      matched: false,
      selected: false
    }));

    setPairs(initialPairs);
    setSelectedCardId(initialPairs[0]?.id || null);
    setMapStatuses({});
    setOrientationMsg(null);
  }, [questions]);

  // Selección de tarjeta
  const handleSelectCard = (pairId: string) => {
    const targetPair = pairs.find(p => p.id === pairId);
    if (targetPair?.matched) return;
    setSelectedCardId(pairId);
  };

  // Clic en país del mapa
  const handleCountryClick = (clickedCountry: Country, cca3: string) => {
    // Si el país ya fue emparejado, mostrar su info para orientarse sin contar como fallo
    const isAlreadyMatched = mapStatuses[clickedCountry.cca3.toUpperCase()] === 'correct';
    if (isAlreadyMatched) {
      setOrientationMsg(`📍 ${clickedCountry.flagEmoji} ${clickedCountry.nameEs} (Capital: ${clickedCountry.capital}) · Ya emparejado`);
      return;
    }

    if (!selectedCardId) return;

    const currentPair = pairs.find(p => p.id === selectedCardId);
    if (!currentPair || currentPair.matched) return;

    const isMatch = currentPair.country.cca3.toUpperCase() === clickedCountry.cca3.toUpperCase();

    if (isMatch) {
      // Éxito: Marcar tarjeta y polígono como acertados
      setOrientationMsg(null);
      setPairs(prev =>
        prev.map(p => (p.id === selectedCardId ? { ...p, matched: true, selected: false } : p))
      );

      setMapStatuses(prev => ({
        ...prev,
        [clickedCountry.cca3.toUpperCase()]: 'correct'
      }));

      onSingleMatchSuccess(clickedCountry);

      // Auto-seleccionar la siguiente tarjeta no emparejada
      const remaining = pairs.filter(p => p.id !== selectedCardId && !p.matched);
      if (remaining.length > 0) {
        setSelectedCardId(remaining[0].id);
      } else {
        setSelectedCardId(null);
      }
    } else {
      // Error: Destello rojo en tarjeta y país
      setErrorFlashId(selectedCardId);
      setMapStatuses(prev => ({
        ...prev,
        [clickedCountry.cca3.toUpperCase()]: 'wrong'
      }));

      onSingleMatchError(currentPair.country, clickedCountry);

      setTimeout(() => {
        setErrorFlashId(null);
        setMapStatuses(prev => {
          const next = { ...prev };
          delete next[clickedCountry.cca3.toUpperCase()];
          return next;
        });
      }, 700);
    }
  };

  const allMatched = pairs.length > 0 && pairs.every(p => p.matched);

  return (
    <div className="space-y-4">
      {/* Barra de Instrucción */}
      <div className="bg-[#18181B]/95 backdrop-blur-md border border-zinc-800 rounded-xl p-4 shadow-card-subtle flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-indigo-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-normal text-zinc-100 text-base">
              Modo Emparejar (Match 5 Países)
            </h3>
            <p className="text-xs text-zinc-400 font-sans">
              Selecciona una tarjeta y haz clic en su país correspondiente en el mapa. Puedes pulsar las banderas para ampliarlas.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {orientationMsg && (
            <div className="text-xs px-3 py-1 bg-zinc-800 border border-zinc-700 text-indigo-300 rounded-lg font-sans">
              {orientationMsg}
            </div>
          )}
          <div className="text-xs font-mono text-indigo-300 bg-indigo-950/60 px-3 py-1.5 rounded-lg border border-indigo-800/60 font-medium">
            {pairs.filter(p => p.matched).length} / {pairs.length} Emparejados
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Columna de 5 Tarjetas */}
        <div className="lg:col-span-1 space-y-2.5">
          {pairs.map((pair, idx) => {
            const isSelected = selectedCardId === pair.id;
            const isFlashingError = errorFlashId === pair.id;

            return (
              <div
                key={pair.id}
                onClick={() => handleSelectCard(pair.id)}
                className={`w-full p-3 rounded-xl border text-left transition-all relative flex items-center gap-3 cursor-pointer ${
                  pair.matched
                    ? 'bg-emerald-950/30 border-emerald-800/50 opacity-80 cursor-default'
                    : isFlashingError
                    ? 'bg-rose-950/60 border-rose-600 animate-shake'
                    : isSelected
                    ? 'bg-zinc-800 border-indigo-500 shadow-sm ring-1 ring-indigo-500'
                    : 'bg-[#18181B] hover:bg-zinc-800/80 border-zinc-800 text-zinc-300'
                }`}
              >
                {/* Bandera con soporte de ampliación */}
                <div
                  onClick={(e) => {
                    if (onOpenFlagModal) {
                      e.stopPropagation();
                      onOpenFlagModal(pair.country);
                    }
                  }}
                  title="🔍 Clic para ampliar bandera"
                  className="relative cursor-zoom-in group/flag shrink-0 rounded overflow-hidden"
                >
                  <img
                    src={pair.country.flagSvg}
                    alt={pair.country.nameEs}
                    className="w-10 h-7 object-cover rounded shadow-sm border border-zinc-700 group-hover/flag:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/flag:opacity-100 flex items-center justify-center transition-opacity">
                    <ZoomIn className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>

                <div className="overflow-hidden flex-1 font-sans">
                  <div className="font-serif font-normal text-zinc-100 text-sm truncate">
                    {pair.country.nameEs}
                  </div>
                  <div className="text-[11px] text-zinc-400 truncate">
                    Cap: {pair.country.capital}
                  </div>
                </div>

                {pair.matched && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                )}
                {isSelected && !pair.matched && (
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 flex-shrink-0 animate-ping" />
                )}
              </div>
            );
          })}
        </div>

        {/* Mapa Interactivo */}
        <div className="lg:col-span-3 h-[520px] sm:h-[580px] rounded-xl overflow-hidden shadow-lg border border-zinc-800">
          <WorldMap
            countryStatuses={mapStatuses}
            onCountryClick={handleCountryClick}
            continent={pairs[0]?.country.continent || 'World'}
            interactive={!allMatched && lives > 0}
            isGeekMode={isGeekMode}
          />
        </div>
      </div>
    </div>
  );
};
