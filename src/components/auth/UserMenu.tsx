import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogIn, LogOut, Trophy, Sparkles, AlertCircle, ChevronDown, CheckCircle2 } from 'lucide-react';

interface UserMenuProps {
  onOpenLeaderboard?: () => void;
  onOpenProfile?: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ onOpenLeaderboard, onOpenProfile }) => {
  const { user, profile, loading, isConfigured, signInWithGoogle, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showConfigHelp, setShowConfigHelp] = useState(false);

  if (loading) {
    return (
      <div className="h-9 w-24 bg-zinc-800/60 animate-pulse rounded-full" />
    );
  }

  // Si Supabase aún no tiene las claves puestas
  if (!isConfigured) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowConfigHelp(!showConfigHelp)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-semibold transition-all shadow-sm"
          title="Conectar Supabase"
        >
          <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
          <span>Conectar Nube</span>
        </button>

        {showConfigHelp && (
          <div className="absolute right-0 mt-2 w-80 bg-zinc-900 border border-zinc-700 rounded-2xl p-4 shadow-2xl z-50 text-xs text-zinc-300 space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="font-bold text-zinc-100 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Configura tu Supabase
              </span>
              <button 
                onClick={() => setShowConfigHelp(false)}
                className="text-zinc-500 hover:text-zinc-200"
              >
                ✕
              </button>
            </div>
            <p className="text-zinc-400 leading-relaxed">
              Hemos dejado listo el archivo <code className="text-cyan-300 font-mono bg-zinc-800 px-1 py-0.5 rounded">.env.local</code>. Solo necesitas pegar tu <strong>URL</strong> y <strong>anon key</strong> de Supabase para activar el login con Google y los rankings globales.
            </p>
            <div className="bg-zinc-950 p-2 rounded-xl border border-zinc-800 font-mono text-[11px] text-zinc-400">
              VITE_SUPABASE_URL=...<br />
              VITE_SUPABASE_ANON_KEY=...
            </div>
          </div>
        )}
      </div>
    );
  }

  // Usuario no autenticado
  if (!user) {
    return (
      <button
        onClick={signInWithGoogle}
        className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-zinc-100 hover:bg-white text-zinc-950 rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition-all border border-zinc-200/20 shrink-0 cursor-pointer"
        title="Iniciar sesión para guardar tu progreso y récords"
      >
        <LogIn className="w-4 h-4 text-zinc-700" />
        <span>Iniciar sesión</span>
      </button>
    );
  }

  // Usuario autenticado
  return (
    <div className="relative">
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2 px-2.5 py-1 bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700 rounded-full transition-all text-xs text-zinc-100"
      >
        {profile?.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.nickname}
            className="w-6 h-6 rounded-full object-cover border border-cyan-400"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-[10px]">
            {profile?.nickname?.charAt(0).toUpperCase() || 'U'}
          </div>
        )}
        <span className="font-semibold max-w-[100px] truncate hidden sm:inline">
          {profile?.nickname || 'GeoStriker'}
        </span>
        <span className="bg-cyan-950 text-cyan-300 font-mono text-[10px] px-1.5 py-0.5 rounded border border-cyan-700/50">
          {profile?.elo || 1200} Elo
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-[#18181B] border border-zinc-800 rounded-2xl p-3 shadow-2xl z-50 text-xs text-zinc-300 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Cabecera del usuario */}
          <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
            {profile?.avatar_url && (
              <img
                src={profile.avatar_url}
                alt={profile.nickname}
                className="w-10 h-10 rounded-full object-cover border-2 border-cyan-400"
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="font-bold text-zinc-100 truncate text-sm">
                {profile?.nickname}
              </p>
              <p className="text-[11px] text-zinc-500 truncate">{user.email}</p>
            </div>
          </div>

          {/* Estadísticas rápidas en la nube */}
          <div className="grid grid-cols-2 gap-2 bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800/60 text-center">
            <div>
              <p className="text-zinc-500 text-[10px]">Puntos Elo</p>
              <p className="font-mono font-bold text-cyan-400 text-sm">
                {profile?.elo || 1200}
              </p>
            </div>
            <div>
              <p className="text-zinc-500 text-[10px]">Racha Diaria</p>
              <p className="font-mono font-bold text-amber-400 text-sm">
                {profile?.daily_streak || 0} 🔥
              </p>
            </div>
          </div>

          {/* Acciones */}
          <div className="space-y-1 pt-1">
            {onOpenProfile && (
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  onOpenProfile();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-cyan-300 hover:bg-cyan-500/10 rounded-xl transition-colors text-left font-semibold"
              >
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Ver Mi Perfil & Récords</span>
              </button>
            )}

            {onOpenLeaderboard && (
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  onOpenLeaderboard();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-zinc-300 hover:text-white hover:bg-zinc-800/80 rounded-xl transition-colors text-left"
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Ver Clasificación Mundial</span>
              </button>
            )}

            <button
              onClick={() => {
                setDropdownOpen(false);
                signOut();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors text-left"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
