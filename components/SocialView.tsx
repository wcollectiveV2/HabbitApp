
import React, { useState, useEffect } from 'react';
import { socialService } from '../services';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatar: string;
  points: number;
  isCurrentUser?: boolean;
}

interface FeedItem {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  action: string;
  target: string;
  timestamp: string;
}

const SocialView: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(true);
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);
  const [leaderboardType, setLeaderboardType] = useState<'global' | 'friends'>('global');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoadingLeaderboard(true);
      try {
        const data = await socialService.getLeaderboard({ scope: leaderboardType, limit: 10 });
        const mapped = data.entries?.map((entry: any, index: number) => ({
          rank: entry.rank || index + 1,
          userId: entry.userId || entry.user_id,
          name: entry.name || entry.userName || entry.user_name || 'Anonymous',
          avatar: entry.avatar || entry.userAvatar || entry.user_avatar || `https://i.pravatar.cc/150?u=${entry.userId || entry.user_id}`,
          points: entry.points || entry.totalPoints || 0,
          isCurrentUser: entry.isCurrentUser || entry.is_current_user || false
        })) || [];
        setLeaderboard(mapped);
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
        setLeaderboard([]);
      }
      setIsLoadingLeaderboard(false);
    };
    fetchLeaderboard();
  }, [leaderboardType]);

  useEffect(() => {
    const fetchFeed = async () => {
      setIsLoadingFeed(true);
      try {
        const data = await socialService.getFeed({ limit: 20 });
        const mapped = data.items?.map((item: any) => ({
          id: String(item.id),
          userId: item.userId || item.user_id,
          userName: item.userName || item.user_name || item.user?.name || 'Someone',
          userAvatar: item.userAvatar || item.user_avatar || item.user?.avatar || `https://i.pravatar.cc/150?u=${item.userId || item.user_id}`,
          action: item.action || getActionFromType(item.type),
          target: item.target || getTargetFromData(item),
          timestamp: formatTimestamp(item.createdAt || item.created_at || item.timestamp)
        })) || [];
        setFeed(mapped);
      } catch (err) {
        console.error('Failed to fetch feed:', err);
        setFeed([]);
      }
      setIsLoadingFeed(false);
    };
    fetchFeed();
  }, []);

  const toggleLeaderboardType = () => {
    setLeaderboardType(prev => prev === 'global' ? 'friends' : 'global');
  };

  return (
    <div className="px-6 space-y-8 animate-in slide-in-from-right-4 duration-500">
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Leaderboard</h2>
          <button 
            onClick={toggleLeaderboardType}
            className="text-primary text-xs font-bold uppercase tracking-widest"
          >
            {leaderboardType === 'global' ? 'Global' : 'Friends'}
          </button>
        </div>
        
        <div className={`bg-white dark:bg-card-dark rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm divide-y divide-slate-50 dark:divide-slate-800 overflow-hidden ${isLoadingLeaderboard ? 'animate-pulse opacity-70' : ''}`}>
          {leaderboard.map((user) => (
            <div key={user.rank} className={`p-4 flex items-center justify-between ${user.isCurrentUser ? 'bg-primary/5' : ''}`}>
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 flex items-center justify-center font-black text-sm rounded-full ${
                  user.rank === 1 ? 'bg-yellow-400 text-white' : 
                  user.rank === 2 ? 'bg-slate-300 text-slate-600' :
                  user.rank === 3 ? 'bg-orange-300 text-white' : 'text-slate-400'
                }`}>
                  {user.rank}
                </div>
                <img src={user.avatar} className="w-10 h-10 rounded-full bg-slate-100" alt={user.name} />
                <div>
                  <h4 className="font-bold text-sm">{user.name}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{user.points.toLocaleString()} Points</p>
                </div>
              </div>
              {user.isCurrentUser && (
                <span className="bg-primary/20 text-primary text-[8px] font-black px-2 py-1 rounded-full uppercase">You</span>
              )}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Recent Activity</h2>
        <div className={`space-y-4 ${isLoadingFeed ? 'animate-pulse opacity-70' : ''}`}>
          {feed.map((item) => (
            <div key={item.id} className="flex gap-4 p-4 rounded-3xl bg-slate-50 dark:bg-slate-900/50">
              <img src={item.userAvatar} className="w-10 h-10 rounded-full" alt="" />
              <div>
                <p className="text-sm leading-snug">
                  <span className="font-bold">{item.userName}</span>{' '}
                  <span className="text-slate-500">{item.action}</span>{' '}
                  <span className="font-semibold text-primary">{item.target}</span>
                </p>
                <span className="text-[10px] text-slate-400 font-medium">{item.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

function formatTimestamp(dateStr: string): string {
  if (!dateStr) return 'Just now';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function getActionFromType(type: string): string {
  switch (type) {
    case 'challenge_joined': return 'joined';
    case 'challenge_completed': return 'completed';
    case 'streak_milestone': return 'reached';
    case 'level_up': return 'reached';
    case 'badge_earned': return 'earned';
    default: return 'completed';
  }
}

function getTargetFromData(item: any): string {
  if (item.target) return item.target;
  if (item.data?.challengeTitle) return `${item.data.challengeTitle} challenge`;
  if (item.data?.streakDays) return `${item.data.streakDays} day streak!`;
  if (item.data?.level) return `Level ${item.data.level}!`;
  if (item.data?.badge) return `${item.data.badge} badge`;
  return 'a habit';
}

export default SocialView;
