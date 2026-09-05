import React from 'react';
import { TutorAdvice } from '../../types/stats';
import { Sparkles, AlertCircle, Lightbulb, CheckCircle2, ArrowRight } from 'lucide-react';
import { Continent } from '../../types/country';

interface SmartAdviceCardProps {
  advice: TutorAdvice;
  onActionClick?: (advice: TutorAdvice) => void;
}

export const SmartAdviceCard: React.FC<SmartAdviceCardProps> = ({ advice, onActionClick }) => {
  const getStyles = () => {
    switch (advice.type) {
      case 'warning':
        return {
          border: 'border-amber-800/50',
          bg: 'bg-[#18181B]',
          iconBg: 'bg-amber-950/50 text-amber-300 border-amber-800/60',
          icon: <AlertCircle className="w-5 h-5 text-amber-400" />,
          btn: 'bg-amber-950/60 hover:bg-amber-900/80 text-amber-200 border border-amber-800/60'
        };
      case 'praise':
        return {
          border: 'border-emerald-800/50',
          bg: 'bg-[#18181B]',
          iconBg: 'bg-emerald-950/50 text-emerald-300 border-emerald-800/60',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
          btn: 'bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-200 border border-emerald-800/60'
        };
      case 'recommendation':
        return {
          border: 'border-indigo-800/50',
          bg: 'bg-[#18181B]',
          iconBg: 'bg-indigo-950/50 text-indigo-300 border-indigo-800/60',
          icon: <Sparkles className="w-5 h-5 text-indigo-400" />,
          btn: 'bg-indigo-600 hover:bg-indigo-500 text-white'
        };
      default: // tip
        return {
          border: 'border-purple-800/50',
          bg: 'bg-[#18181B]',
          iconBg: 'bg-purple-950/50 text-purple-300 border-purple-800/60',
          icon: <Lightbulb className="w-5 h-5 text-purple-400" />,
          btn: 'bg-purple-950/60 hover:bg-purple-900/80 text-purple-200 border border-purple-800/60'
        };
    }
  };

  const styles = getStyles();

  return (
    <div className={`p-4 sm:p-5 rounded-xl border ${styles.border} ${styles.bg} backdrop-blur-md shadow-card-subtle flex flex-col justify-between space-y-3 transition-all hover:border-zinc-700`}>
      <div className="flex items-start gap-3">
        <div className={`p-2.5 rounded-lg border ${styles.iconBg} flex-shrink-0 mt-0.5`}>
          {styles.icon}
        </div>
        <div className="space-y-1">
          <h4 className="font-serif font-normal text-zinc-100 text-sm sm:text-base leading-snug">
            {advice.title}
          </h4>
          <p className="text-xs text-zinc-400 font-sans leading-relaxed">
            {advice.description}
          </p>
        </div>
      </div>

      {advice.actionLabel && onActionClick && (
        <div className="pt-2 flex justify-end">
          <button
            onClick={() => onActionClick(advice)}
            className={`px-3.5 py-1.5 rounded-lg font-sans font-medium text-xs transition-all flex items-center gap-1.5 active:scale-95 shadow-sm ${styles.btn}`}
          >
            <span>{advice.actionLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
