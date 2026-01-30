import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import { aiService, userService } from '../services';
import type { UserProfile } from '../services';

interface HomeViewProps {
  tasks: Task[];
  profile?: UserProfile | null;
}

const HomeView: React.FC<HomeViewProps> = ({ tasks, profile }) => {
  const [tip, setTip] = useState<string>("Loading your personalized tip...");
  const [isLoadingTip, setIsLoadingTip] = useState(true);
  const [stats, setStats] = useState({
    streakCount: 0,
    totalPoints: 0,
    completedPercent: 0
  });
  const [activity, setActivity] = useState<{ date: string; completed: boolean }[]>([]);

  useEffect(() => {
    // AI Feature disabled
    setTip("Stay focused on your goals today!");
    setIsLoadingTip(false);
    /*
    const fetchTip = async () => {
      setIsLoadingTip(true);
      try {
        const dailyTip = await aiService.getDailyTip();
        setTip(dailyTip.content);
      } catch (err) {
        console.error('Failed to fetch daily tip:', err);
        setTip("Stay focused on your goals today!");
      }
      setIsLoadingTip(false);
    };
    fetchTip();
    */
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const userStats = await userService.getStats();
        const completed = tasks.filter(t => t.completed).length;
        const total = tasks.length || 1;
        setStats({
          streakCount: userStats.streakCount || profile?.streakCount || 0,
          totalPoints: userStats.totalPoints || profile?.totalPoints || 0,
          completedPercent: Math.round((completed / total) * 100)
        });
      } catch (err) {
        // Use profile data as fallback
        const completed = tasks.filter(t => t.completed).length;
        const total = tasks.length || 1;
        setStats({
          streakCount: profile?.streakCount || 0,
          totalPoints: profile?.totalPoints || 0,
          completedPercent: Math.round((completed / total) * 100)
        });
      }
    };
    fetchStats();
  }, [tasks, profile]);

  useEffect(() => {
    // Build weekly activity from tasks or fetch from API
    const fetchActivity = async () => {
      try {
        const activityData = await userService.getActivity();
        // Map to weekly format
        const today = new Date();
        const weekActivity = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          const dayData = activityData.find((a: any) => a.date === dateStr);
          weekActivity.push({
            date: dateStr,
            completed: dayData ? dayData.count > 0 : false
          });
        }
        setActivity(weekActivity);
      } catch {
        // Generate mock weekly data
        const today = new Date().getDay();
        setActivity(Array(7).fill(null).map((_, i) => ({
          date: '',
          completed: i < today
        })));
      }
    };
    fetchActivity();
  }, []);

  const displayStats = [
    { label: 'Streak', value: String(stats.streakCount), unit: 'Days', icon: 'local_fire_department', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
    { label: 'Points', value: stats.totalPoints >= 1000 ? `${(stats.totalPoints / 1000).toFixed(1)}k` : String(stats.totalPoints), unit: 'XP', icon: 'stars', color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
    { label: 'Completed', value: String(stats.completedPercent), unit: '%', icon: 'task_alt', color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
  ];

  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const today = new Date().getDay();

  const firstName = profile?.name?.split(' ')[0] || 'there';

  return (
    <div className="px-6 space-y-8 animate-in fade-in duration-500 pb-10">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight">
          {getGreeting()}, <span className="text-primary">{firstName}</span>
        </h2>
        <p className="text-slate-400 font-medium">You're closer to your goal today!</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {displayStats.map((stat, i) => (
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
                  i === today ? 'bg-primary text-white' : 
                  activity[i]?.completed ? 'bg-primary/20 text-primary' : 
                  'bg-white/10 text-white/40'
                }`}>
                  {activity[i]?.completed && i !== today ? (
                    <span className="material-symbols-outlined text-sm">check</span>
                  ) : day}
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
          <h4 className="font-bold text-blue-900 dark:text-blue-300 text-sm uppercase tracking-tighter">Habit Insight</h4>
          <p className="text-sm text-blue-700 dark:text-blue-400/80 leading-snug">
            {tip}
          </p>
        </div>
      </div>
    </div>
  );
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  return 'Evening';
}

export default HomeView;
