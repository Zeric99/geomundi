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
        className="flex items-center gap-2 px-3 sm:px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-full text-xs sm:text-sm font-semibold shadow-md hover:shadow-indigo-500/20 transition-all border border-blue-400/30"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>Entrar con Google</span>
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
