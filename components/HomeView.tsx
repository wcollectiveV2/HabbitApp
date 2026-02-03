import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import { aiService, userService } from '../services';
import type { UserProfile } from '../services';
import Skeleton from './ui/Skeleton';
import { WeeklyCalendar } from './ui';

interface HomeViewProps {
  tasks: Task[];
  profile?: UserProfile | null;
}

const HomeView: React.FC<HomeViewProps> = ({ tasks, profile }) => {
  const [tip, setTip] = useState<string>("Loading your personalized tip...");
  const [isLoadingTip, setIsLoadingTip] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
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
      setIsLoadingStats(true);
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
      setIsLoadingStats(false);
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
        // Fallback to empty activity if API fails - NO MOCK DATA
        setActivity([]);
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
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {getGreeting()}, <span className="text-primary">{firstName}</span>
        </h2>
        {/* Fixed contrast: text-slate-400 -> text-slate-600 */}
        <p className="text-slate-600 dark:text-slate-400 font-medium">You're closer to your goal today!</p>
      </div>

      <div className="grid grid-cols-3 gap-3" role="region" aria-label="Your stats">
        {isLoadingStats ? (
          <>
            <Skeleton variant="card" className="h-28" />
            <Skeleton variant="card" className="h-28" />
            <Skeleton variant="card" className="h-28" />
          </>
        ) : (
          displayStats.map((stat, i) => (
            <div 
              key={i} 
              className="bg-white dark:bg-card-dark p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center"
              role="group"
              aria-label={`${stat.label}: ${stat.value} ${stat.unit}`}
            >
              <div className={`w-10 h-10 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-3`} aria-hidden="true">
                <span className="material-symbols-outlined">{stat.icon}</span>
              </div>
              <span className="text-lg font-black text-slate-900 dark:text-white">{stat.value}</span>
              {/* Fixed contrast: text-slate-400 -> text-slate-600 */}
              <span className="text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400">{stat.unit}</span>
            </div>
          ))
        )}
      </div>

      <WeeklyCalendar onDayClick={(date, activity) => console.log('Day clicked:', date, activity)} />

      <div 
        className={`bg-blue-50 dark:bg-blue-900/10 p-5 rounded-3xl border border-blue-200 dark:border-blue-900/30 flex items-center gap-4 transition-all ${isLoadingTip ? 'animate-pulse opacity-70' : ''}`}
        role="region"
        aria-label="Habit insight"
      >
        <div className="w-12 h-12 bg-blue-500 rounded-full flex-shrink-0 flex items-center justify-center text-white shadow-lg shadow-blue-500/30" aria-hidden="true">
          <span className="material-symbols-outlined">auto_awesome</span>
        </div>
        <div>
          {/* Fixed contrast */}
          <h4 className="font-bold text-blue-900 dark:text-blue-300 text-sm uppercase tracking-tighter">Habit Insight</h4>
          <p className="text-sm text-blue-800 dark:text-blue-400 leading-snug">
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
