import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Sparkles, X } from 'lucide-react';
import { Achievement } from '../../types/achievements';

interface AchievementToastProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export const AchievementToast: React.FC<AchievementToastProps> = ({ achievement, onClose }) => {
  useEffect(() => {
    if (achievement) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [achievement, onClose]);

  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          initial={{ opacity: 0, y: 25, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 15, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-auto max-w-[320px] sm:max-w-sm bg-zinc-900/95 backdrop-blur-md border border-amber-500/50 rounded-xl p-3 shadow-xl flex items-center justify-between gap-3 select-none"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-lg shrink-0 shadow-inner">
              {achievement.icon}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1 text-[9px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                <Sparkles className="w-2.5 h-2.5 fill-amber-400 shrink-0" />
                <span>Logro Desbloqueado</span>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-zinc-100 truncate">
                {achievement.title}
              </h4>
              <p className="text-[11px] text-zinc-400 line-clamp-1">
                {achievement.description}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition shrink-0"
            title="Cerrar"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
