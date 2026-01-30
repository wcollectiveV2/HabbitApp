import React, { useState, useEffect } from 'react';
import { challengeService } from '../services';
import type { Challenge, ChallengeParticipant } from '../services/challengeService';

interface ChallengeDetailViewProps {
  challengeId: number;
  onBack: () => void;
  onUpdate?: () => void;
}

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatar: string;
  progress: number;
  points: number;
  isCurrentUser?: boolean;
}

interface DailyLog {
  date: string;
  completed: boolean;
  value?: number;
}

const ChallengeDetailView: React.FC<ChallengeDetailViewProps> = ({ challengeId, onBack, onUpdate }) => {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [participants, setParticipants] = useState<ChallengeParticipant[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isJoined, setIsJoined] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'progress' | 'leaderboard'>('progress');
  const [joining, setJoining] = useState(false);
  
  // Progress tracking state
  const [myProgress, setMyProgress] = useState({ progress: 0, completedDays: 0, currentStreak: 0 });
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [todayCompleted, setTodayCompleted] = useState(false);
  const [isLogging, setIsLogging] = useState(false);

  useEffect(() => {
    const fetchChallengeDetails = async () => {
      setLoading(true);
      try {
        const data = await challengeService.getChallenge(challengeId);
        setChallenge(data.challenge);
        setParticipants(data.participants || []);
        setIsJoined(data.isJoined);

        // Map participants to leaderboard entries
        const leaderboardData = (data.participants || [])
          .sort((a, b) => b.progress - a.progress)
          .map((p, index) => ({
            rank: index + 1,
            userId: String(p.userId),
            name: p.userName || 'Anonymous',
            avatar: p.userAvatar || `https://i.pravatar.cc/150?u=${p.userId}`,
            progress: p.progress || 0,
            points: Math.round((p.progress || 0) * 25), // Estimate points from progress
            isCurrentUser: false // Will be determined by comparing with current user
          }));
        setLeaderboard(leaderboardData);

        // If joined, fetch personal progress
        if (data.isJoined) {
          await fetchMyProgress();
        }
      } catch (err) {
        console.error('Failed to fetch challenge details:', err);
      }
      setLoading(false);
    };

    fetchChallengeDetails();
  }, [challengeId]);

  const fetchMyProgress = async () => {
    try {
      const progressData = await challengeService.getProgress(challengeId);
      setMyProgress({
        progress: progressData.participant?.progress || 0,
        completedDays: progressData.participant?.completed_days || progressData.participant?.completedDays || 0,
        currentStreak: progressData.participant?.current_streak || progressData.participant?.currentStreak || 0
      });
      setDailyLogs(progressData.dailyLogs || []);
      
      // Check if today is completed
      const today = new Date().toISOString().split('T')[0];
      const todayLog = (progressData.dailyLogs || []).find((log: DailyLog) => log.date === today);
      setTodayCompleted(todayLog?.completed || false);
    } catch (err) {
      console.error('Failed to fetch progress:', err);
    }
  };

  const handleLogToday = async () => {
    if (!isJoined) return;
    
    setIsLogging(true);
    try {
      const result = await challengeService.logProgress(challengeId, { 
        completed: !todayCompleted 
      });
      setTodayCompleted(!todayCompleted);
      setMyProgress(prev => ({
        ...prev,
        progress: result.progress,
        completedDays: result.completedDays
      }));
      
      // Update daily logs
      const today = new Date().toISOString().split('T')[0];
      setDailyLogs(prev => {
        const filtered = prev.filter(l => l.date !== today);
        return [...filtered, { date: today, completed: !todayCompleted }];
      });
      
      onUpdate?.();
    } catch (err) {
      console.error('Failed to log progress:', err);
    }
    setIsLogging(false);
  };

  // Generate last 7 days for weekly view
  const getLast7Days = () => {
    const days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const log = dailyLogs.find(l => l.date === dateStr);
      days.push({
        date: dateStr,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: date.getDate(),
        completed: log?.completed || false,
        isToday: i === 0
      });
    }
    return days;
  };
      } catch (err) {
        console.error('Failed to fetch challenge details:', err);
      }
      setLoading(false);
    };

    fetchChallengeDetails();
  }, [challengeId]);

  const handleJoin = async () => {
    setJoining(true);
    try {
      await challengeService.joinChallenge(challengeId);
      setIsJoined(true);
      // Refresh challenge data
      const data = await challengeService.getChallenge(challengeId);
      setChallenge(data.challenge);
      setParticipants(data.participants || []);
      // Fetch progress for newly joined challenge
      await fetchMyProgress();
      onUpdate?.();
    } catch (err) {
      console.error('Failed to join challenge:', err);
    }
    setJoining(false);
  };

  const handleLeave = async () => {
    try {
      await challengeService.leaveChallenge(challengeId);
      setIsJoined(false);
      setMyProgress({ progress: 0, completedDays: 0, currentStreak: 0 });
      setDailyLogs([]);
      onUpdate?.();
    } catch (err) {
      console.error('Failed to leave challenge:', err);
    }
  };

  const getDaysRemaining = () => {
    if (!challenge?.endDate) return 0;
    const end = new Date(challenge.endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  const getTypeIcon = (type?: string) => {
    switch (type) {
      case 'individual': return 'person';
      case 'group': return 'groups';
      case 'competitive': return 'emoji_events';
      default: return 'flag';
    }
  };

  if (loading) {
    return (
      <div className="animate-in fade-in duration-300">
        <div className="px-6 py-4">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-500 font-medium mb-4">
            <span className="material-symbols-outlined">arrow_back</span>
            Back
          </button>
        </div>
        <div className="px-6 space-y-4">
          <div className="h-48 bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse" />
          <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse" />
          <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="px-6 py-4">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 font-medium mb-4">
          <span className="material-symbols-outlined">arrow_back</span>
          Back
        </button>
        <div className="text-center py-12">
          <p className="text-slate-400">Challenge not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in slide-in-from-right-4 duration-500 pb-10">
      {/* Back Button */}
      <div className="px-6 py-4">
        <button 
          onClick={onBack} 
          className="flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Back to Challenges
        </button>
      </div>

      {/* Challenge Header Card */}
      <div className="px-6">
        <div className="bg-gradient-to-br from-primary to-primary/80 rounded-[2rem] p-6 text-white relative overflow-hidden shadow-xl shadow-primary/30">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 blur-2xl rounded-full -translate-x-1/2 translate-y-1/2" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-full bg-white/20">
                Active Challenge
              </span>
              <span className="text-white/70 text-[10px] font-bold uppercase flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">{getTypeIcon(challenge.type)}</span>
                {challenge.type}
              </span>
            </div>

            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h1 className="text-2xl font-extrabold leading-tight">{challenge.title}</h1>
                <p className="text-white/70 text-sm mt-2 leading-relaxed">{challenge.description}</p>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0 ml-4">
                <span className="material-symbols-outlined text-3xl">
                  {challenge.icon || 'emoji_events'}
                </span>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-white/20">
              <div>
                <p className="text-[10px] font-bold uppercase text-white/50">Remaining</p>
                <p className="text-xl font-black">{getDaysRemaining()} Days Left</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-white/50">Participants</p>
                <p className="text-xl font-black">{challenge.participantCount?.toLocaleString() || participants.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 mt-6">
        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-2xl p-1">
          <button
            onClick={() => setActiveTab('progress')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'progress'
                ? 'bg-white dark:bg-card-dark text-primary shadow-sm'
                : 'text-slate-500'
            }`}
          >
            My Progress
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'leaderboard'
                ? 'bg-white dark:bg-card-dark text-primary shadow-sm'
                : 'text-slate-500'
            }`}
          >
            Leaderboard
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-6 mt-6">
        {activeTab === 'leaderboard' ? (
          <div className="bg-white dark:bg-card-dark rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            {leaderboard.length > 0 ? (
              leaderboard.map((entry, index) => (
                <div 
                  key={entry.userId} 
                  className={`p-4 flex items-center justify-between ${
                    entry.isCurrentUser 
                      ? 'bg-primary/5 border-l-4 border-primary' 
                      : index < leaderboard.length - 1 ? 'border-b border-slate-50 dark:border-slate-800' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 flex items-center justify-center font-black text-sm rounded-full ${
                      entry.rank === 1 ? 'bg-yellow-400 text-white' : 
                      entry.rank === 2 ? 'bg-slate-300 text-slate-600' :
                      entry.rank === 3 ? 'bg-orange-300 text-white' : 'text-slate-400'
                    }`}>
                      {entry.rank <= 3 ? (
                        <span className="material-symbols-outlined text-sm">
                          {entry.rank === 1 ? 'looks_one' : entry.rank === 2 ? 'looks_two' : 'looks_3'}
                        </span>
                      ) : entry.rank}
                    </div>
                    <img 
                      src={entry.avatar} 
                      className="w-10 h-10 rounded-full bg-slate-100" 
                      alt={entry.name} 
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm">{entry.name}</h4>
                        {entry.isCurrentUser && (
                          <span className="bg-primary/20 text-primary text-[8px] font-black px-2 py-0.5 rounded-full uppercase">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] font-bold text-primary">{entry.progress}% Done</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-slate-400">#{entry.rank}</span>
                    <p className="text-[10px] font-bold text-slate-400">{entry.points.toLocaleString()} pts</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">group</span>
                <p className="text-slate-400 text-sm">No participants yet</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Today's Action Button */}
            {isJoined && (
              <button
                onClick={handleLogToday}
                disabled={isLogging}
                className={`w-full p-5 rounded-3xl shadow-lg flex items-center justify-between transition-all active:scale-[0.98] ${
                  todayCompleted 
                    ? 'bg-green-500 text-white' 
                    : 'bg-white dark:bg-card-dark text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    todayCompleted ? 'bg-white/20' : 'bg-primary/10'
                  }`}>
                    <span className={`material-symbols-outlined text-2xl ${
                      todayCompleted ? 'text-white' : 'text-primary'
                    }`}>
                      {todayCompleted ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-lg">
                      {todayCompleted ? "Completed!" : "Today's Action"}
                    </h3>
                    <p className={`text-sm ${todayCompleted ? 'text-white/70' : 'text-slate-500'}`}>
                      {challenge?.daily_action || challenge?.habitTemplate || 'Complete your daily goal'}
                    </p>
                    {todayCompleted && (
                      <p className="text-xs text-white/50 mt-1">Tap to undo</p>
                    )}
                  </div>
                </div>
                {isLogging && (
                  <div className="w-6 h-6 border-2 border-current/30 border-t-current rounded-full animate-spin"></div>
                )}
              </button>
            )}

            {/* Weekly Progress */}
            {isJoined && (
              <div className="bg-white dark:bg-card-dark rounded-3xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm">
                <h4 className="text-xs font-bold uppercase text-slate-400 mb-4">This Week</h4>
                <div className="flex justify-between">
                  {getLast7Days().map((day) => (
                    <div key={day.date} className="flex flex-col items-center gap-2">
                      <span className={`text-xs font-bold ${day.isToday ? 'text-primary' : 'text-slate-400'}`}>
                        {day.dayName}
                      </span>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                        day.completed 
                          ? 'bg-green-500 text-white' 
                          : day.isToday 
                            ? 'bg-primary/10 text-primary border-2 border-primary' 
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                      }`}>
                        {day.completed ? (
                          <span className="material-symbols-outlined text-lg">check</span>
                        ) : (
                          day.dayNum
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Progress Stats */}
            {isJoined ? (
              <>
                <div className="bg-white dark:bg-card-dark rounded-3xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
                  <h3 className="font-bold text-sm uppercase text-slate-400 mb-4">Your Progress</h3>
                  <div className="flex items-center gap-4">
                    <div className="relative w-20 h-20">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle 
                          className="text-slate-100 dark:text-slate-700" 
                          cx="40" cy="40" fill="transparent" r="32" 
                          stroke="currentColor" strokeWidth="8" 
                        />
                        <circle 
                          className="text-primary" 
                          cx="40" cy="40" fill="transparent" r="32" 
                          stroke="currentColor" strokeWidth="8" 
                          strokeDasharray={2 * Math.PI * 32}
                          strokeDashoffset={2 * Math.PI * 32 * (1 - myProgress.progress / 100)}
                          strokeLinecap="round"
                          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-lg font-black text-primary">
                        {myProgress.progress}%
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-2xl font-black">{myProgress.completedDays} / {challenge?.targetDays || 30}</p>
                      <p className="text-sm text-slate-400">Days Completed</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-card-dark rounded-2xl border border-slate-100 dark:border-slate-800 p-4 shadow-sm">
                    <span className="material-symbols-outlined text-orange-500 text-2xl">local_fire_department</span>
                    <p className="text-2xl font-black mt-2">{myProgress.currentStreak}</p>
                    <p className="text-xs text-slate-400 font-medium">Current Streak</p>
                  </div>
                  <div className="bg-white dark:bg-card-dark rounded-2xl border border-slate-100 dark:border-slate-800 p-4 shadow-sm">
                    <span className="material-symbols-outlined text-yellow-500 text-2xl">stars</span>
                    <p className="text-2xl font-black mt-2">{Math.round(myProgress.progress * 25)}</p>
                    <p className="text-xs text-slate-400 font-medium">Points Earned</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-8 text-center">
                <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">lock</span>
                <h3 className="font-bold text-lg mb-2">Join to Track Progress</h3>
                <p className="text-slate-400 text-sm mb-4">Join this challenge to start tracking your progress and compete with others.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Challenge Info Section */}
      <div className="px-6 mt-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Challenge Details</h3>
        <div className="bg-white dark:bg-card-dark rounded-3xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">person</span>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Created by</p>
              <p className="font-bold">HabitPulse Team</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-green-500">calendar_today</span>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Duration</p>
              <p className="font-bold">{challenge.targetDays || 30} Days</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-yellow-500">emoji_events</span>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Rewards</p>
              <p className="font-bold">{challenge.rewards?.xp || 500} XP + Badge</p>
            </div>
          </div>

          {challenge.habitTemplate && (
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-500">checklist</span>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Daily Task</p>
                <p className="font-bold">{challenge.habitTemplate.title}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Button */}
      <div className="px-6 mt-6">
        {isJoined ? (
          <button
            onClick={handleLeave}
            className="w-full py-4 rounded-2xl font-bold text-sm uppercase tracking-wide bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400 transition-all active:scale-[0.98]"
          >
            Leave Challenge
          </button>
        ) : (
          <button
            onClick={handleJoin}
            disabled={joining}
            className="w-full py-4 rounded-2xl font-bold text-sm uppercase tracking-wide bg-primary text-white shadow-lg shadow-primary/30 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {joining ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Joining...
              </span>
            ) : (
              'Join Challenge'
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default ChallengeDetailView;
