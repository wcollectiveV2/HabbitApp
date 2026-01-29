
import React, { useState, useEffect } from 'react';
import { generateHabitTip } from '../lib/gemini';
import { Task } from '../types';

interface HomeViewProps {
  tasks: Task[];
}

const HomeView: React.FC<HomeViewProps> = ({ tasks }) => {
  const [tip, setTip] = useState<string>("Loading your personalized tip...");
  const [isLoadingTip, setIsLoadingTip] = useState(true);

  useEffect(() => {
    const fetchTip = async () => {
      setIsLoadingTip(true);
      const activeTaskTitles = tasks.map(t => t.title);
      const aiTip = await generateHabitTip(activeTaskTitles);
      setTip(aiTip);
      setIsLoadingTip(false);
    };
    fetchTip();
  }, [tasks.length]);

  const stats = [
    { label: 'Streak', value: '12', unit: 'Days', icon: 'local_fire_department', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
    { label: 'Points', value: '2.1k', unit: 'XP', icon: 'stars', color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
    { label: 'Completed', value: '85', unit: '%', icon: 'task_alt', color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
  ];

  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const today = 3; // Wednesday

  return (
    <div className="px-6 space-y-8 animate-in fade-in duration-500 pb-10">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight">Morning, <span className="text-primary">Alex</span></h2>
        <p className="text-slate-400 font-medium">You're closer to your goal today!</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-card-dark p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center">
            <div className={`w-10 h-10 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-3`}>
              <span className="material-symbols-outlined">{stat.icon}</span>
            </div>
            <span className="text-lg font-black">{stat.value}</span>
            <span className="text-[10px] font-bold uppercase text-slate-400">{stat.unit}</span>
          </div>
        ))}
      </div>

      <section className="bg-slate-900 rounded-[2rem] p-6 text-white overflow-hidden relative">
        <div className="relative z-10">
          <h3 className="text-lg font-bold mb-4">Weekly Activity</h3>
          <div className="flex justify-between items-center">
            {days.map((day, i) => (
              <div key={i} className="flex flex-col items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  i === today ? 'bg-primary text-white' : i < today ? 'bg-primary/20 text-primary' : 'bg-white/10 text-white/40'
                }`}>
                  {i < today ? <span className="material-symbols-outlined text-sm">check</span> : day}
                </div>
                <span className={`text-[10px] font-bold ${i === today ? 'text-white' : 'text-white/30'}`}>
                  {day}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[60px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
      </section>

      <div className={`bg-blue-50 dark:bg-blue-900/10 p-5 rounded-3xl border border-blue-100 dark:border-blue-900/30 flex items-center gap-4 transition-all ${isLoadingTip ? 'animate-pulse opacity-70' : ''}`}>
        <div className="w-12 h-12 bg-blue-500 rounded-full flex-shrink-0 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
          <span className="material-symbols-outlined">auto_awesome</span>
        </div>
        <div>
          <h4 className="font-bold text-blue-900 dark:text-blue-300 text-sm uppercase tracking-tighter">AI Pulse Insight</h4>
          <p className="text-sm text-blue-700 dark:text-blue-400/80 leading-snug">
            {tip}
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomeView;
