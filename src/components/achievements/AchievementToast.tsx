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
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [achievement, onClose]);

  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md bg-[#18181B] border-2 border-amber-500/80 rounded-2xl p-4 shadow-[0_0_35px_rgba(245,158,11,0.35)] flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-2xl shadow-md shrink-0 animate-bounce">
              {achievement.icon}
            </div>

            <div>
              <div className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                <Sparkles className="w-3 h-3 fill-amber-400" />
                <span>¡Nuevo Logro Desbloqueado!</span>
              </div>
              <h4 className="text-base font-serif font-bold text-zinc-100 leading-tight">
                {achievement.title}
              </h4>
              <p className="text-xs text-zinc-300 font-sans mt-0.5">
                {achievement.description}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
