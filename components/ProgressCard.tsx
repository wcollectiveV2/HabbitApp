
import React from 'react';
import { Challenge } from '../types';

interface ProgressCardProps {
  challenge: Challenge;
}

const ProgressCard: React.FC<ProgressCardProps> = ({ challenge }) => {
  const isDark = challenge.theme === 'dark';
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (challenge.progress / 100) * circumference;

  return (
    <div className={`min-w-[280px] snap-center p-5 rounded-3xl relative overflow-hidden shadow-xl ${
      isDark ? 'bg-slate-900 text-white shadow-slate-900/20' : 'bg-primary text-white shadow-primary/30'
    }`}>
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-xl leading-tight whitespace-pre-line">
              {challenge.title.replace(' ', '\n')}
            </h3>
            <p className={`text-xs mt-1 font-medium ${isDark ? 'text-white/50' : 'text-white/70'}`}>
              {challenge.timeLeft}
            </p>
          </div>
          <div className="relative w-16 h-16">
            <svg className="w-full h-full transform -rotate-90">
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
            <span className={`absolute inset-0 flex items-center justify-center text-[10px] font-black ${isDark ? 'text-primary' : 'text-white'}`}>
              {challenge.progress}%
            </span>
          </div>
        </div>
        
        <div className="mt-6 flex items-center gap-2">
          <div className="flex -space-x-2">
            {challenge.participants.map((p, i) => (
              <img 
                key={i}
                className={`w-6 h-6 rounded-full border-2 bg-slate-100 ${isDark ? 'border-slate-900' : 'border-primary'}`}
                src={p}
                alt="Participant"
              />
            ))}
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[8px] font-bold ${
              isDark ? 'border-slate-900 bg-slate-800' : 'border-primary bg-primary/50'
            }`}>
              +{challenge.extraParticipants}
            </div>
          </div>
          <span className={`text-[10px] font-bold uppercase tracking-tighter ${isDark ? 'opacity-50' : 'opacity-80'}`}>
            {challenge.joinedText}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProgressCard;
