import React, { ReactNode } from 'react';
import { Lock, LogIn } from 'lucide-react';

interface BenefitItem {
  icon: string;
  label: string;
}

interface AuthRequiredCardProps {
  title: string;
  subtitle: string;
  description?: string;
  mainIcon: ReactNode;
  accentColor?: 'amber' | 'indigo' | 'cyan' | 'emerald';
  benefits: BenefitItem[];
  onSignIn: () => void;
}

export const AuthRequiredCard: React.FC<AuthRequiredCardProps> = ({
  title,
  subtitle,
  description = 'Inicia sesión con Google para desbloquear esta sección, registrar tu progreso en la nube y competir por el podio mundial. Es gratis y tarda 5 segundos.',
  mainIcon,
  accentColor = 'amber',
  benefits,
  onSignIn
}) => {
  const glowColors = {
    amber: 'bg-amber-500/10',
    indigo: 'bg-indigo-500/10',
    cyan: 'bg-cyan-500/10',
    emerald: 'bg-emerald-500/10'
  };

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-[#18181B]/95 backdrop-blur-md border border-zinc-800 rounded-2xl p-6 sm:p-8 text-center shadow-2xl relative overflow-hidden">
        {/* Glow decorativo */}
        <div className={`absolute -top-24 -right-24 w-64 h-64 ${glowColors[accentColor]} rounded-full blur-3xl pointer-events-none`} />
        <div className={`absolute -bottom-24 -left-24 w-64 h-64 ${glowColors[accentColor]} rounded-full blur-3xl pointer-events-none`} />

        {/* Icono central con candado */}
        <div className="relative inline-flex items-center justify-center mb-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-zinc-900 border border-zinc-700/80 flex items-center justify-center shadow-inner">
            {mainIcon}
          </div>
          <div className="absolute -bottom-1 -right-1 bg-zinc-950 border border-amber-500/60 rounded-full p-2 shadow-md">
            <Lock className="w-4 h-4 text-amber-400" />
          </div>
        </div>

        {/* Textos */}
        <h2 className="text-xl sm:text-2xl font-display font-bold text-zinc-100 mb-2">
          {title}
        </h2>
        <p className="text-zinc-300 text-xs sm:text-sm font-medium leading-relaxed mb-2">
          {subtitle}
        </p>
        <p className="text-zinc-500 text-xs leading-relaxed mb-6">
          {description}
        </p>

        {/* Beneficios */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3 mb-6 sm:mb-8 text-xs">
          {benefits.map(({ icon, label }) => (
            <div
              key={label}
              className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-2.5 sm:p-3 flex flex-col items-center gap-1.5"
            >
              <span className="text-lg sm:text-xl">{icon}</span>
              <span className="text-zinc-400 font-medium text-[11px] sm:text-xs leading-tight">{label}</span>
            </div>
          ))}
        </div>

        {/* Botón de inicio de sesión con Google */}
        <button
          onClick={onSignIn}
          className="w-full flex items-center justify-center gap-3 py-3.5 bg-zinc-100 hover:bg-white text-zinc-950 font-bold rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95 text-sm cursor-pointer"
        >
          <LogIn className="w-5 h-5 text-zinc-900" />
          <span>Iniciar sesión con Google</span>
        </button>

        <p className="text-[11px] text-zinc-500 mt-3 font-medium">
          Gratis, seguro e instantáneo · Sin contraseñas
        </p>
      </div>
    </div>
  );
};
