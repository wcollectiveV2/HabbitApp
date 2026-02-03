
import React from 'react';
import { Challenge } from '../types';

interface ProgressCardProps {
  challenge: Challenge;
  onClick?: () => void;
  currentIndex?: number;
  totalCount?: number;
  onQuickLog?: () => void;
}

const ProgressCard: React.FC<ProgressCardProps> = ({ 
  challenge, 
  onClick, 
  currentIndex = 0, 
  totalCount = 1,
  onQuickLog 
}) => {
  const isDark = challenge.theme === 'dark';
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (challenge.progress / 100) * circumference;

  return (
    <div 
      onClick={onClick}
      className={`min-w-[280px] snap-center p-5 rounded-3xl relative overflow-hidden shadow-xl cursor-pointer transition-all active:scale-[0.98] hover:shadow-2xl ${
        isDark ? 'bg-slate-900 text-white shadow-slate-900/20' : 'bg-primary text-white shadow-primary/30'
      }`}
      role="article"
      aria-label={`Challenge: ${challenge.title}, ${challenge.progress}% complete`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-xl leading-tight whitespace-pre-line">
              {challenge.title.replace(' ', '\n')}
            </h3>
            <p className={`text-xs mt-1 font-medium ${isDark ? 'text-white/60' : 'text-white/80'}`}>
              {challenge.timeLeft}
            </p>
          </div>
          {/* Progress circle with ARIA */}
          <div 
            className="relative w-16 h-16"
            role="progressbar"
            aria-valuenow={challenge.progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${challenge.progress}% complete`}
          >
            <svg className="w-full h-full transform -rotate-90" aria-hidden="true">
              <circle 
                className={isDark ? 'text-white/10' : 'text-white/20'} 
                cx="32" cy="32" fill="transparent" r={radius} 
                stroke="currentColor" strokeWidth="6" 
              />
              <circle 
                className={isDark ? 'text-primary' : 'text-white'} 
                cx="32" cy="32" fill="transparent" r={radius} 
                stroke="currentColor" strokeWidth="6" 
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.5s ease' }}
              />
            </svg>
            <span 
              className={`absolute inset-0 flex items-center justify-center text-[10px] font-black ${isDark ? 'text-primary' : 'text-white'}`}
              aria-hidden="true"
            >
              {challenge.progress}%
            </span>
          </div>
        </div>
        
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {challenge.participants.map((p, i) => (
                <img 
                  key={i}
                  className={`w-6 h-6 rounded-full border-2 bg-slate-100 object-cover ${isDark ? 'border-slate-900' : 'border-primary'}`}
                  src={p}
                  alt={`Participant ${i + 1}`}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://i.pravatar.cc/50?u=${i}`;
                  }}
                />
              ))}
              {challenge.extraParticipants > 0 && (
                <div 
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[8px] font-bold ${
                    isDark ? 'border-slate-900 bg-slate-800' : 'border-primary bg-primary/50'
                  }`}
                  aria-label={`And ${challenge.extraParticipants} more participants`}
                >
                  +{challenge.extraParticipants}
                </div>
              )}
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-tighter ${isDark ? 'opacity-60' : 'opacity-90'}`}>
              {challenge.joinedText}
            </span>
          </div>

          {/* Quick log button */}
          {onQuickLog && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickLog();
              }}
              className={`p-2 rounded-full transition-colors ${
                isDark ? 'hover:bg-white/10 active:bg-white/20' : 'hover:bg-white/20 active:bg-white/30'
              }`}
              aria-label="Quick log today's action"
            >
              <span className="material-symbols-outlined text-lg">add_task</span>
            </button>
          )}
        </div>

        {/* Pagination indicator */}
        {totalCount > 1 && (
          <div className="flex justify-center gap-1.5 mt-4" role="tablist" aria-label="Challenge cards">
            {Array.from({ length: totalCount }).map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all ${
                  i === currentIndex 
                    ? `w-4 ${isDark ? 'bg-primary' : 'bg-white'}` 
                    : `w-1 ${isDark ? 'bg-white/20' : 'bg-white/40'}`
                }`}
                role="tab"
                aria-selected={i === currentIndex}
                aria-label={`Card ${i + 1} of ${totalCount}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressCard;
