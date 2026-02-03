
import React, { useState, useEffect } from 'react';
import { socialService } from '../services';
import { LeaderboardSkeleton, FeedItemSkeleton } from './ui/Skeleton';
import EmptyState from './ui/EmptyState';

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
    <div className="px-6 space-y-8 animate-in slide-in-from-right-4 duration-500 pb-10">
      <section>
        <div className="flex justify-between items-center mb-4">
          {/* Fixed contrast: text-slate-400 -> text-slate-600 */}
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Leaderboard</h2>
          <button 
            onClick={toggleLeaderboardType}
            className="text-primary text-xs font-bold uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded px-2 py-1"
            aria-label={`Switch to ${leaderboardType === 'global' ? 'friends' : 'global'} leaderboard`}
          >
            {leaderboardType === 'global' ? 'Global' : 'Friends'}
          </button>
        </div>
        
        {isLoadingLeaderboard ? (
          <LeaderboardSkeleton />
        ) : leaderboard.length > 0 ? (
          <div 
            className="bg-white dark:bg-card-dark rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden"
            role="list"
            aria-label="Leaderboard rankings"
          >
            {leaderboard.map((user) => (
              <div 
                key={user.rank} 
                className={`p-4 flex items-center justify-between ${user.isCurrentUser ? 'bg-primary/5' : ''}`}
                role="listitem"
              >
                <div className="flex items-center gap-4">
                  <div 
                    className={`w-8 h-8 flex items-center justify-center font-black text-sm rounded-full ${
                      user.rank === 1 ? 'bg-yellow-400 text-white' : 
                      user.rank === 2 ? 'bg-slate-300 text-slate-700' :
                      user.rank === 3 ? 'bg-orange-400 text-white' : 'text-slate-500 dark:text-slate-400'
                    }`}
                    aria-label={`Rank ${user.rank}`}
                  >
                    {user.rank}
                  </div>
                  <img 
                    src={user.avatar} 
                    className="w-10 h-10 rounded-full bg-slate-100 object-cover" 
                    alt={`${user.name}'s avatar`}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://i.pravatar.cc/100?u=${user.userId}`;
                    }}
                  />
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{user.name}</h4>
                    {/* Fixed contrast: text-slate-400 -> text-slate-600 */}
                    <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">{user.points.toLocaleString()} Points</p>
                  </div>
                </div>
                {user.isCurrentUser && (
                  <span className="bg-primary/20 text-primary text-[8px] font-black px-2 py-1 rounded-full uppercase">You</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon="leaderboard"
            title="No rankings yet"
            description="Be the first to climb the leaderboard! Complete challenges and earn points."
            illustration="social"
          />
        )}
      </section>

      <section>
        {/* Fixed contrast: text-slate-400 -> text-slate-600 */}
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-4">Recent Activity</h2>
        {isLoadingFeed ? (
          <div className="space-y-4">
            <FeedItemSkeleton />
            <FeedItemSkeleton />
            <FeedItemSkeleton />
          </div>
        ) : feed.length > 0 ? (
          <div className="space-y-4" role="feed" aria-label="Activity feed">
            {feed.map((item) => (
              <article 
                key={item.id} 
                className="flex gap-4 p-4 rounded-3xl bg-slate-50 dark:bg-slate-900/50"
                aria-label={`${item.userName} ${item.action} ${item.target}`}
              >
                <img 
                  src={item.userAvatar} 
                  className="w-10 h-10 rounded-full object-cover bg-slate-200" 
                  alt=""
                  aria-hidden="true"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://i.pravatar.cc/100?u=${item.userId}`;
                  }}
                />
                <div>
                  <p className="text-sm leading-snug">
                    <span className="font-bold text-slate-900 dark:text-white">{item.userName}</span>{' '}
                    {/* Fixed contrast: text-slate-500 -> text-slate-600 */}
                    <span className="text-slate-600 dark:text-slate-400">{item.action}</span>{' '}
                    <span className="font-semibold text-primary">{item.target}</span>
                  </p>
                  {/* Fixed contrast: text-slate-400 -> text-slate-500 */}
                  <span className="text-[10px] text-slate-500 dark:text-slate-500 font-medium">{item.timestamp}</span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            icon="forum"
            title="No activity yet"
            description="When you and others complete challenges, the activity will show up here."
            illustration="social"
          />
        )}
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
