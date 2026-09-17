import React, { useState } from 'react';
import { UserEmpire, ImperialEdict, IMPERIAL_EDICTS_CATALOG } from '../types';
import { empireStorageService } from '../services/empireStorageService';
import { empireSound } from '../services/empireSoundService';
import { Scale, Check, Sparkles, Users, Coins, Hammer, AlertCircle, X } from 'lucide-react';

interface ImperialEdictsPanelProps {
  empire: UserEmpire;
  onClose?: () => void;
}

export const ImperialEdictsPanel: React.FC<ImperialEdictsPanelProps> = ({ empire, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const activeEdictsCount = (empire.activeEdicts || []).length;
  const totalEdicts = IMPERIAL_EDICTS_CATALOG.length;

  const categories = [
    { id: 'all', label: 'Todos', icon: '🏛️' },
    { id: 'agriculture', label: 'Agraria', icon: '🌾' },
    { id: 'industry', label: 'Industria', icon: '🌲' },
    { id: 'maritime', label: 'Naval', icon: '🧭' },
    { id: 'civic', label: 'Cívica', icon: '📜' }
  ];

  const filteredEdicts = selectedCategory === 'all'
    ? IMPERIAL_EDICTS_CATALOG
    : IMPERIAL_EDICTS_CATALOG.filter(e => e.category === selectedCategory);

  const handleUnlock = (edictId: string) => {
    const res = empireStorageService.unlockEdict(edictId);
    if (!res.success) {
      setErrorMessage(res.error || 'Error al promulgar el decreto');
      setTimeout(() => setErrorMessage(null), 4000);
    } else {
      setErrorMessage(null);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0b0f17] overflow-hidden select-none">
      {/* Cabecera del Árbol de Decretos */}
      <div className="p-3.5 bg-[#0d131f] border-b border-slate-800 flex items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#141d2e] border border-purple-500/40 text-purple-400 flex items-center justify-center shrink-0 shadow-sm">
            <Scale className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider font-sans truncate">
                Decretos Imperiales
              </h3>
              <span className="text-[10.5px] font-mono font-bold text-purple-400 bg-purple-500/15 px-1.5 py-0.2 rounded border border-purple-500/30 shrink-0">
                {activeEdictsCount}/{totalEdicts}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight mt-0.5 font-mono truncate">
              Leyes nacionales con mejoras permanentes
            </p>
          </div>
        </div>
        {onClose && (
          <button 
            onClick={onClose} 
            className="tactical-btn p-1.5 text-slate-400 hover:text-white rounded-lg"
            title="Cerrar panel de decretos"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Selector de Ramas / Categorías */}
      <div className="p-2 bg-zinc-900/60 border-b border-zinc-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-2.5 py-1 rounded-sm text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 border ${
              selectedCategory === cat.id
                ? 'tactical-btn-active border-zinc-200 shadow-sm'
                : 'tactical-btn text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Banner de error temporal */}
      {errorMessage && (
        <div className="mx-3 mt-2 p-2 bg-red-950/40 border border-red-800/40 rounded-sm text-xs text-red-300 flex items-center gap-2 shrink-0 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span className="text-[11px] leading-tight">{errorMessage}</span>
        </div>
      )}

      {/* Lista de Decretos con Scroll Interno Propio */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2.5 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
        {filteredEdicts.map(edict => {
          const isActive = empireStorageService.isEdictActive(edict.id);
          const hasPop = empire.totalPopulation >= edict.minPopulation;
          const hasCoins = empire.coins >= edict.coinCost;
          const hasMaterials = !edict.materialCost || empire.nationalMaterials >= edict.materialCost;
          const canUnlock = !isActive && hasPop && hasCoins && hasMaterials;

          return (
            <div
              key={edict.id}
              className={`p-3 rounded-sm border transition-all duration-200 space-y-2.5 ${
                isActive
                  ? 'bg-zinc-900 border-zinc-700 text-zinc-200'
                  : canUnlock
                  ? 'tactical-card border-zinc-600 shadow-sm'
                  : 'bg-zinc-950/40 border-zinc-900 text-zinc-500 opacity-60'
              }`}
            >
              {/* Título y Estado */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-2xl shrink-0">{edict.icon}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className={`text-xs font-bold truncate ${
                        isActive ? 'text-white font-black' : 'text-zinc-200'
                      }`}>
                        {edict.title}
                      </h4>
                      <span className="text-[9.5px] font-mono text-zinc-500">
                        · {edict.categoryLabel}
                      </span>
                    </div>
                    <p className="text-[10.5px] text-zinc-400 leading-tight mt-0.5">
                      {edict.description}
                    </p>
                  </div>
                </div>

                {isActive && (
                  <span className="text-[10px] font-mono font-bold text-zinc-200 shrink-0 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>Activo</span>
                  </span>
                )}
              </div>

              {/* Efecto del Edicto */}
              <div className="p-2 rounded-sm tactical-bay flex items-center justify-between text-xs">
                <span className="text-[10.5px] text-zinc-400 flex items-center gap-1 font-mono">
                  <Sparkles className="w-3 h-3 text-zinc-400 shrink-0" />
                  <span>Efecto:</span>
                </span>
                <span className={`font-mono font-bold text-[11px] ${
                  isActive ? 'text-zinc-200' : 'text-zinc-300'
                }`}>
                  {edict.effectLabel}
                </span>
              </div>

              {/* Requisitos y Botón de Promulgación */}
              {!isActive && (
                <div className="space-y-2 pt-0.5">
                  <div className="grid grid-cols-2 gap-1.5 text-[10.5px] font-mono">
                    {/* Requisito de Población */}
                    <div className={`p-1.5 rounded-sm border flex items-center justify-between ${
                      hasPop ? 'bg-zinc-900 border-zinc-800 text-zinc-300' : 'bg-red-950/20 border-red-800/40 text-red-300'
                    }`}>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-zinc-400" />
                        <span>Censo:</span>
                      </span>
                      <span className="font-bold">{empire.totalPopulation}/{edict.minPopulation}</span>
                    </div>

                    {/* Requisito de Monedas */}
                    <div className={`p-1.5 rounded-sm border flex items-center justify-between ${
                      hasCoins ? 'bg-zinc-900 border-zinc-800 text-zinc-300' : 'bg-red-950/20 border-red-800/40 text-red-300'
                    }`}>
                      <span className="flex items-center gap-1">
                        <Coins className="w-3 h-3 text-zinc-400" />
                        <span>Coste:</span>
                      </span>
                      <span className="font-bold">{empire.coins}/{edict.coinCost} 🪙</span>
                    </div>
                  </div>

                  {/* Botón de Promulgación */}
                  <button
                    onClick={() => handleUnlock(edict.id)}
                    disabled={!canUnlock}
                    className={`w-full py-2 px-3 rounded-sm font-bold text-xs flex items-center justify-center gap-1.5 transition-all uppercase tracking-wider ${
                      canUnlock
                        ? 'tactical-btn-cta'
                        : 'tactical-btn text-zinc-500 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <Scale className="w-3.5 h-3.5" />
                    <span>
                      {canUnlock
                        ? `Promulgar Decreto — ${edict.coinCost} 🪙`
                        : !hasPop
                        ? `Requiere censo de ${edict.minPopulation} hab`
                        : `Faltan monedas (${empire.coins}/${edict.coinCost} 🪙)`}
                    </span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
