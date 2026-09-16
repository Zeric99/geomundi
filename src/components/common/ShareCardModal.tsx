import React, { useRef, useState } from 'react';
import { X, Download, Copy, Check, Share2, Globe2, Trophy, Flame, Clock, Target, Swords, Sparkles } from 'lucide-react';
import { downloadElementAsImage, copyElementImageToClipboard } from '../../utils/imageExporter';

export interface ShareCardData {
  type: 'daily' | 'duel';
  title: string;
  subtitle: string;
  dateStr?: string;
  score: number;
  accuracy: number;
  durationSeconds: number;
  streak?: number;
  // Para Reto Diario
  stageResults?: boolean[];
  // Para Duelo 1v1
  isWinner?: boolean;
  isTie?: boolean;
  playerElo?: number;
  rivalName?: string;
  rivalScore?: number;
  rivalElo?: number;
  modeName?: string;
}

interface ShareCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ShareCardData;
}

export const ShareCardModal: React.FC<ShareCardModalProps> = ({ isOpen, onClose, data }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [copiedState, setCopiedState] = useState<'download' | 'copy' | null>(null);

  if (!isOpen) return null;

  const handleDownload = async () => {
    if (!cardRef.current || isExporting) return;
    setIsExporting(true);
    const fileName = `geostrike-${data.type}-${data.dateStr || 'resultado'}.png`;
    const success = await downloadElementAsImage(cardRef.current, fileName);
    setIsExporting(false);
    if (success) {
      setCopiedState('download');
      setTimeout(() => setCopiedState(null), 2500);
    }
  };

  const handleCopyImage = async () => {
    if (!cardRef.current || isExporting) return;
    setIsExporting(true);
    const success = await copyElementImageToClipboard(cardRef.current);
    setIsExporting(false);
    if (success) {
      setCopiedState('copy');
      setTimeout(() => setCopiedState(null), 2500);
    } else {
      // Fallback a descarga si el navegador bloquea el portapapeles
      handleDownload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#121214] border border-zinc-800 rounded-2xl shadow-2xl p-6 space-y-6">
        {/* Encabezado del Modal */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold text-zinc-100">
              Tarjeta de Resultado Viral
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TARJETA VISUAL COMPACTA QUE SE EXPORTARÁ COMO IMAGEN */}
        <div className="overflow-hidden rounded-xl border border-zinc-700/80 shadow-card-subtle bg-[#0B0F19] p-1">
          <div
            ref={cardRef}
            className="w-full bg-gradient-to-br from-[#0B0F19] via-[#121827] to-[#0F172A] p-6 text-zinc-100 font-sans space-y-5 rounded-lg relative overflow-hidden"
          >
            {/* Adorno de fondo neón */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Cabecera de la Tarjeta */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-500/20 border border-indigo-500/40 rounded-xl text-indigo-400">
                  <Globe2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="font-display font-black text-lg text-zinc-100 tracking-wider block">
                    GEO<span className="text-indigo-400">STRIKE</span>
                  </span>
                  <span className="text-[9px] text-zinc-400 font-mono tracking-widest uppercase block -mt-1">
                    WORLD CHALLENGE
                  </span>
                </div>
              </div>

              {data.dateStr && (
                <span className="text-xs font-mono bg-zinc-900/80 border border-zinc-800 text-amber-400 font-bold px-3 py-1 rounded-full">
                  #{data.dateStr}
                </span>
              )}
            </div>

            {/* Título de la Hazaña */}
            <div className="text-center space-y-1">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-indigo-400 bg-indigo-950/60 px-3 py-1 rounded-md border border-indigo-800/60 inline-block">
                {data.subtitle}
              </span>
              <h2 className="text-2xl font-serif font-extrabold text-zinc-100 mt-1">
                {data.title}
              </h2>
            </div>

            {/* Métricas Principales */}
            <div className="grid grid-cols-3 gap-2 bg-zinc-900/90 border border-zinc-800/90 rounded-xl p-3 text-center">
              <div>
                <span className="text-[10px] uppercase font-mono text-zinc-400 font-bold block">Puntos</span>
                <span className="text-base sm:text-lg font-mono font-bold text-amber-400">
                  {data.score.toLocaleString('es-ES')}
                </span>
              </div>
              <div className="border-x border-zinc-800">
                <span className="text-[10px] uppercase font-mono text-zinc-400 font-bold block">Precisión</span>
                <span className="text-base sm:text-lg font-mono font-bold text-emerald-400">
                  {data.accuracy}%
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono text-zinc-400 font-bold block">Tiempo</span>
                <span className="text-base sm:text-lg font-mono font-bold text-cyan-400">
                  {data.durationSeconds}s
                </span>
              </div>
            </div>

            {/* Bloque Específico según Modo */}
            {data.type === 'daily' && data.stageResults && (
              <div className="space-y-2">
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block text-center">
                  Desglose de las 5 Pruebas Diarias
                </span>
                <div className="grid grid-cols-5 gap-1.5">
                  {data.stageResults.map((isCorrect, idx) => (
                    <div
                      key={idx}
                      className={`p-2 rounded-lg border text-center font-mono font-bold text-xs ${
                        isCorrect
                          ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300'
                          : 'bg-rose-950/60 border-rose-500/60 text-rose-300'
                      }`}
                    >
                      <div>P{idx + 1}</div>
                      <div>{isCorrect ? '🟩' : '🟥'}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.type === 'duel' && (
              <div className="bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl flex items-center justify-around font-mono text-xs text-center">
                <div>
                  <span className="text-cyan-400 font-bold block">Tú (Jugador)</span>
                  <span className="text-base font-bold text-emerald-400">{data.score} pts</span>
                  {data.playerElo && <span className="text-[10px] text-zinc-400 block">{data.playerElo} ELO</span>}
                </div>
                <div className="text-zinc-500 font-bold text-sm">VS</div>
                <div>
                  <span className="text-amber-400 font-bold block">{data.rivalName || 'Rival'}</span>
                  <span className="text-base font-bold text-rose-400">{data.rivalScore || 0} pts</span>
                  {data.rivalElo && <span className="text-[10px] text-zinc-400 block">{data.rivalElo} ELO</span>}
                </div>
              </div>
            )}

            {/* Pie de la Tarjeta con Código QR / Call to Action */}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 text-[11px] text-zinc-400 font-mono">
              <span className="flex items-center gap-1 text-cyan-400 font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                geostrike.app
              </span>
              <span>¿Podrás superarme? 100% Gratis 🗺️</span>
            </div>
          </div>
        </div>

        {/* BOTONES DE ACCIÓN */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={handleDownload}
            disabled={isExporting}
            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
          >
            {copiedState === 'download' ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>¡Imagen Descargada!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Descargar Imagen PNG</span>
              </>
            )}
          </button>

          <button
            onClick={handleCopyImage}
            disabled={isExporting}
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 border border-zinc-700 disabled:opacity-50"
          >
            {copiedState === 'copy' ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>¡Copiada al Portapapeles!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-amber-400" />
                <span>Copiar Imagen</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
