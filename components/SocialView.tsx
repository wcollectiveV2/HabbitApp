
import React, { useState, useEffect } from 'react';
import { socialService } from '../services';
import { LeaderboardSkeleton, FeedItemSkeleton } from './ui/Skeleton';
import EmptyState from './ui/EmptyState';
import { colors, spacing, borderRadius, typography, shadows } from '../theme/designSystem';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatar: string;
  points: number;
  isCurrentUser?: boolean;
  isFollowing?: boolean;
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
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'allTime'>('weekly');
  const [followLoading, setFollowLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoadingLeaderboard(true);
      try {
        const data = await socialService.getLeaderboard({ 
          scope: leaderboardType, 
          period: leaderboardPeriod,
          limit: 10 
        });
        const mapped = data.entries?.map((entry: any, index: number) => ({
          rank: entry.rank || index + 1,
          userId: String(entry.userId || entry.user_id),
          name: entry.name || entry.userName || entry.user_name || 'Anonymous',
          avatar: entry.avatar || entry.userAvatar || entry.user_avatar || `https://i.pravatar.cc/150?u=${entry.userId || entry.user_id}`,
          points: entry.points || entry.totalPoints || 0,
          isCurrentUser: entry.isCurrentUser || entry.is_current_user || false,
          isFollowing: entry.isFollowing ?? false
        })) || [];
        setLeaderboard(mapped);
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
        setLeaderboard([]);
      }
      setIsLoadingLeaderboard(false);
    };
    fetchLeaderboard();
  }, [leaderboardType, leaderboardPeriod]);

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

  const handleFollow = async (userId: string) => {
    if (followLoading[userId]) return;
    
    setFollowLoading(prev => ({ ...prev, [userId]: true }));
    try {
      const result = await socialService.toggleFollow(Number(userId));
      setLeaderboard(prev => prev.map(u => 
        u.userId === userId ? { ...u, isFollowing: result.isFollowing } : u
      ));
    } catch (err) {
      console.error('Failed to toggle follow:', err);
    }
    setFollowLoading(prev => ({ ...prev, [userId]: false }));
  };

  const toggleLeaderboardType = () => {
    setLeaderboardType(prev => prev === 'global' ? 'friends' : 'global');
  };

  const styles = {
    container: {
      padding: `0 ${spacing[6]}`,
      paddingBottom: spacing[10],
    } as React.CSSProperties,
    section: {
      marginBottom: spacing[8],
    } as React.CSSProperties,
    sectionTitle: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.bold,
      textTransform: 'uppercase' as const,
      letterSpacing: typography.letterSpacing.wider,
      color: colors.text.secondary,
      marginBottom: spacing[4],
    } as React.CSSProperties,
    periodTabs: {
      display: 'flex',
      padding: spacing[1],
      backgroundColor: colors.gray[100],
      borderRadius: borderRadius.lg,
      marginBottom: spacing[4],
    } as React.CSSProperties,
    periodTab: (active: boolean) => ({
      flex: 1,
      padding: `${spacing[2]} ${spacing[2]}`,
      fontSize: '10px',
      fontWeight: typography.fontWeight.bold,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.5px',
      borderRadius: borderRadius.md,
      border: 'none',
      cursor: 'pointer',
      backgroundColor: active ? colors.white : 'transparent',
      color: active ? colors.primary : colors.text.secondary,
      boxShadow: active ? shadows.sm : 'none',
      transition: 'all 0.2s ease',
    } as React.CSSProperties),
    leaderboardCard: {
      backgroundColor: colors.white,
      borderRadius: borderRadius['3xl'],
      border: `1px solid ${colors.gray[100]}`,
      boxShadow: shadows.sm,
      overflow: 'hidden',
    } as React.CSSProperties,
    leaderboardItem: (isCurrentUser: boolean) => ({
      padding: spacing[4],
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: `1px solid ${colors.gray[100]}`,
      backgroundColor: isCurrentUser ? colors.primaryAlpha(0.05) : 'transparent',
    } as React.CSSProperties),
    rankBadge: (rank: number) => ({
      width: '32px',
      height: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: typography.fontWeight.black,
      fontSize: typography.fontSize.sm,
      borderRadius: borderRadius.full,
      backgroundColor: rank === 1 ? '#FBBF24' : rank === 2 ? '#CBD5E1' : rank === 3 ? '#FB923C' : 'transparent',
      color: rank <= 3 ? colors.white : colors.text.secondary,
    } as React.CSSProperties),
    followBtn: (isFollowing: boolean) => ({
      padding: `${spacing[1]} ${spacing[3]}`,
      borderRadius: borderRadius.full,
      fontSize: '10px',
      fontWeight: typography.fontWeight.bold,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.5px',
      border: isFollowing ? `1px solid ${colors.gray[200]}` : 'none',
      backgroundColor: isFollowing ? colors.gray[100] : colors.primary,
      color: isFollowing ? colors.text.secondary : colors.white,
      boxShadow: isFollowing ? 'none' : shadows.primarySm,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    } as React.CSSProperties),
    youBadge: {
      backgroundColor: colors.primaryAlpha(0.2),
      color: colors.primary,
      fontSize: '8px',
      fontWeight: typography.fontWeight.black,
      padding: `${spacing[1]} ${spacing[2]}`,
      borderRadius: borderRadius.full,
      textTransform: 'uppercase' as const,
    } as React.CSSProperties,
    feedItem: {
      display: 'flex',
      gap: spacing[4],
      padding: spacing[4],
      borderRadius: borderRadius['3xl'],
      backgroundColor: colors.gray[50],
      marginBottom: spacing[4],
    } as React.CSSProperties,
    feedAvatar: {
      width: '40px',
      height: '40px',
      borderRadius: borderRadius.full,
      objectFit: 'cover' as const,
      backgroundColor: colors.gray[200],
    } as React.CSSProperties,
  };

  return (
    <div style={styles.container}>
      <section style={styles.section}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[4], marginBottom: spacing[4] }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={styles.sectionTitle}>Leaderboard</h2>
            <button 
              onClick={toggleLeaderboardType}
              style={{
                color: colors.primary,
                fontSize: typography.fontSize.xs,
                fontWeight: typography.fontWeight.bold,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: `${spacing[1]} ${spacing[2]}`,
              }}
              aria-label={`Switch to ${leaderboardType === 'global' ? 'friends' : 'global'} leaderboard`}
            >
              {leaderboardType === 'global' ? 'Global' : 'Friends'}
            </button>
          </div>
          
          <div style={styles.periodTabs}>
            {(['daily', 'weekly', 'monthly', 'allTime'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setLeaderboardPeriod(period)}
                style={styles.periodTab(leaderboardPeriod === period)}
              >
                {period === 'allTime' ? 'All Time' : period}
              </button>
            ))}
          </div>
        </div>
        
        {isLoadingLeaderboard ? (
          <LeaderboardSkeleton />
        ) : leaderboard.length > 0 ? (
          <div style={styles.leaderboardCard} role="list" aria-label="Leaderboard rankings">
            {leaderboard.map((user, index) => (
              <div 
                key={user.rank} 
                style={{
                  ...styles.leaderboardItem(user.isCurrentUser || false),
                  borderBottom: index === leaderboard.length - 1 ? 'none' : `1px solid ${colors.gray[100]}`,
                }}
                role="listitem"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing[4] }}>
                  <div style={styles.rankBadge(user.rank)} aria-label={`Rank ${user.rank}`}>
                    {user.rank}
                  </div>
                  <img 
                    src={user.avatar} 
                    style={{ width: '40px', height: '40px', borderRadius: borderRadius.full, backgroundColor: colors.gray[100], objectFit: 'cover' }}
                    alt={`${user.name}'s avatar`}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://i.pravatar.cc/100?u=${user.userId}`;
                    }}
                  />
                  <div>
                    <h4 style={{ fontWeight: typography.fontWeight.bold, fontSize: typography.fontSize.sm, color: colors.text.primary, margin: 0 }}>{user.name}</h4>
                    <p style={{ fontSize: '10px', fontWeight: typography.fontWeight.bold, color: colors.text.secondary, textTransform: 'uppercase', margin: 0 }}>{user.points.toLocaleString()} Points</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                  {!user.isCurrentUser && (
                    <button 
                      onClick={() => handleFollow(user.userId)}
                      disabled={followLoading[user.userId]}
                      style={{ ...styles.followBtn(user.isFollowing || false), opacity: followLoading[user.userId] ? 0.5 : 1 }}
                    >
                      {followLoading[user.userId] ? '...' : (user.isFollowing ? 'Following' : 'Follow')}
                    </button>
                  )}
                  {user.isCurrentUser && (
                    <span style={styles.youBadge}>You</span>
                  )}
                </div>
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
        <h2 style={styles.sectionTitle}>Recent Activity</h2>
        {isLoadingFeed ? (
          <div>
            <FeedItemSkeleton />
            <FeedItemSkeleton />
            <FeedItemSkeleton />
          </div>
        ) : feed.length > 0 ? (
          <div role="feed" aria-label="Activity feed">
            {feed.map((item) => (
              <article 
                key={item.id} 
                style={styles.feedItem}
                aria-label={`${item.userName} ${item.action} ${item.target}`}
              >
                <img 
                  src={item.userAvatar} 
                  style={styles.feedAvatar}
                  alt=""
                  aria-hidden="true"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://i.pravatar.cc/100?u=${item.userId}`;
                  }}
                />
                <div>
                  <p style={{ fontSize: typography.fontSize.sm, lineHeight: typography.lineHeight.snug, margin: 0 }}>
                    <span style={{ fontWeight: typography.fontWeight.bold, color: colors.text.primary }}>{item.userName}</span>{' '}
                    <span style={{ color: colors.text.secondary }}>{item.action}</span>{' '}
                    <span style={{ fontWeight: typography.fontWeight.semibold, color: colors.primary }}>{item.target}</span>
                  </p>
                  <span style={{ fontSize: '10px', color: colors.text.secondary, fontWeight: typography.fontWeight.medium }}>{item.timestamp}</span>
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
