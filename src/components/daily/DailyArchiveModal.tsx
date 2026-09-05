import React, { useState } from 'react';
import { Calendar as CalendarIcon, X, CheckCircle2, Play, Flame, Award, ChevronLeft, ChevronRight } from 'lucide-react';
import { dailyChallengeService, DailyStreakState } from '../../services/dailyChallengeService';

interface DailyArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDateToPlay: (dateStr: string) => void;
}

export const DailyArchiveModal: React.FC<DailyArchiveModalProps> = ({
  isOpen,
  onClose,
  onSelectDateToPlay
}) => {
  const [streakState] = useState<DailyStreakState>(() => dailyChallengeService.getStreakState());
  const now = new Date();

  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // Calcular días del mes actual
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Domingo

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  if (!isOpen) return null;

  const todayNum = now.getDate();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#18181B] border border-zinc-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 relative">
        {/* Cabecera */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-950/60 border border-amber-800/60 rounded-2xl text-amber-400">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-zinc-100">
                Archivo de Desafíos Diarios
              </h2>
              <p className="text-xs text-zinc-400">
                Juega días pasados para recuperar tu racha y ganar puntos
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Resumen de Racha Actual */}
        <div className="grid grid-cols-2 gap-3 bg-zinc-900/80 p-3.5 rounded-2xl border border-zinc-800 text-center">
          <div className="flex items-center justify-center gap-2">
            <Flame className="w-5 h-5 text-amber-400 fill-amber-400" />
            <div>
              <div className="text-[10px] font-mono uppercase text-zinc-400 font-bold">Racha Actual</div>
              <div className="text-lg font-bold text-amber-300 font-mono">{streakState.currentStreak} días</div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2">
            <Award className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="text-[10px] font-mono uppercase text-zinc-400 font-bold">Mejor Racha</div>
              <div className="text-lg font-bold text-emerald-300 font-mono">{streakState.bestStreak} días</div>
            </div>
          </div>
        </div>

        {/* Título del Mes */}
        <div className="text-center font-bold text-base text-zinc-200">
          {monthNames[currentMonth]} {currentYear}
        </div>

        {/* Grid de Días del Mes */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs">
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(dayName => (
            <div key={dayName} className="font-mono text-zinc-500 font-bold py-1">
              {dayName}
            </div>
          ))}

          {/* Espacios vacíos antes del primer día */}
          {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
            <div key={`empty-${idx}`} />
          ))}

          {/* Días del mes */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const monthStr = String(currentMonth + 1).padStart(2, '0');
            const dayStrFormatted = String(dayNum).padStart(2, '0');
            const dateStr = `${currentYear}-${monthStr}-${dayStrFormatted}`;

            const isFuture = dayNum > todayNum;
            const isToday = dayNum === todayNum;
            const record = streakState.history[dateStr];
            const isCompleted = Boolean(record?.completed);

            return (
              <button
                key={dateStr}
                disabled={isFuture}
                onClick={() => {
                  onSelectDateToPlay(dateStr);
                  onClose();
                }}
                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all ${
                  isCompleted
                    ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-300 hover:border-emerald-500'
                    : isToday
                    ? 'bg-amber-950/50 border-amber-500 text-amber-200 font-bold animate-pulse'
                    : isFuture
                    ? 'bg-zinc-900/30 border-zinc-800/40 text-zinc-600 cursor-not-allowed'
                    : 'bg-zinc-900 border-zinc-800 hover:border-amber-500/70 text-zinc-300'
                }`}
              >
                <span className="font-mono text-sm font-bold">{dayNum}</span>
                {isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-1" />
                ) : !isFuture ? (
                  <Play className="w-3 h-3 text-amber-400 fill-amber-400 mt-1" />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
