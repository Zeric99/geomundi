import React, { useState } from 'react';
import { Copy, Check, Share2, MessageCircle } from 'lucide-react';
import { copyToClipboard, shareToWhatsApp, shareToTwitter, canNativeShare, shareNative } from '../../utils/shareUtils';

interface ShareButtonsBarProps {
  shareText: string;
  shareTitle?: string;
  className?: string;
}

export const ShareButtonsBar: React.FC<ShareButtonsBarProps> = ({
  shareText,
  shareTitle = 'GeoStrike',
  className = ''
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const hasNative = canNativeShare();

  const handleCopy = async () => {
    const success = await copyToClipboard(shareText);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleWhatsApp = () => {
    shareToWhatsApp(shareText);
  };

  const handleTwitter = () => {
    shareToTwitter(shareText);
  };

  const handleNative = async () => {
    await shareNative({
      title: shareTitle,
      text: shareText
    });
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {/* 1. Botón Copiar al Portapapeles */}
        <button
          onClick={handleCopy}
          className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all border shadow-sm ${
            copied
              ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300'
              : 'bg-zinc-900/90 hover:bg-zinc-800 border-zinc-700 text-zinc-100 hover:border-zinc-500'
          }`}
          title="Copiar resultado al portapapeles"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>¡Copiado!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-zinc-300 shrink-0" />
              <span>Copiar</span>
            </>
          )}
        </button>

        {/* 2. Botón WhatsApp */}
        <button
          onClick={handleWhatsApp}
          className="py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all bg-[#25D366] hover:bg-[#20ba59] text-white shadow-sm font-sans"
          title="Compartir en WhatsApp"
        >
          <MessageCircle className="w-4 h-4 fill-white shrink-0" />
          <span>WhatsApp</span>
        </button>

        {/* 3. Botón Twitter / X */}
        <button
          onClick={handleTwitter}
          className="py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all bg-zinc-950 hover:bg-zinc-900 text-white border border-zinc-700 shadow-sm"
          title="Publicar en X (Twitter)"
        >
          <span className="font-black text-sm">𝕏</span>
          <span>Compartir en X</span>
        </button>

        {/* 4. Botón Nativo (solo si el móvil soporta Share API) */}
        {hasNative && (
          <button
            onClick={handleNative}
            className="col-span-2 sm:col-span-3 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all bg-indigo-950/60 hover:bg-indigo-900/70 text-indigo-300 border border-indigo-700/50"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Más opciones de compartir (Móvil)</span>
          </button>
        )}
      </div>
    </div>
  );
};
