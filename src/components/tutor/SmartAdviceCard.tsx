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
          border: 'border-amber-500/40',
          bg: 'bg-amber-950/20',
          iconBg: 'bg-amber-500/20 text-amber-300',
          icon: <AlertCircle className="w-5 h-5" />,
          btn: 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-glow-amber hover:from-amber-400 hover:to-orange-400'
        };
      case 'praise':
        return {
          border: 'border-emerald-500/40',
          bg: 'bg-emerald-950/20',
          iconBg: 'bg-emerald-500/20 text-emerald-300',
          icon: <CheckCircle2 className="w-5 h-5" />,
          btn: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-glow-emerald hover:from-emerald-400 hover:to-teal-400'
        };
      case 'recommendation':
        return {
          border: 'border-cyan-500/40',
          bg: 'bg-cyan-950/20',
          iconBg: 'bg-cyan-500/20 text-cyan-300',
          icon: <Sparkles className="w-5 h-5" />,
          btn: 'bg-gradient-to-r from-cyan-500 to-sky-500 text-slate-950 shadow-glow-cyan hover:from-cyan-400 hover:to-sky-400'
        };
      default: // tip
        return {
          border: 'border-purple-500/40',
          bg: 'bg-purple-950/20',
          iconBg: 'bg-purple-500/20 text-purple-300',
          icon: <Lightbulb className="w-5 h-5" />,
          btn: 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-glow-purple hover:from-purple-400 hover:to-indigo-400'
        };
    }
  };

  const styles = getStyles();

  return (
    <div className={`p-4 sm:p-5 rounded-2xl border ${styles.border} ${styles.bg} backdrop-blur-md shadow-lg flex flex-col justify-between space-y-3 transition-all hover:scale-[1.01]`}>
      <div className="flex items-start gap-3">
        <div className={`p-2.5 rounded-xl border border-white/10 ${styles.iconBg} flex-shrink-0 mt-0.5`}>
          {styles.icon}
        </div>
        <div className="space-y-1">
          <h4 className="font-display font-bold text-white text-sm sm:text-base leading-snug">
            {advice.title}
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            {advice.description}
          </p>
        </div>
      </div>

      {advice.actionLabel && onActionClick && (
        <div className="pt-2 flex justify-end">
          <button
            onClick={() => onActionClick(advice)}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 active:scale-95 ${styles.btn}`}
          >
            <span>{advice.actionLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
