/**
 * Social Service - Leaderboard, feed, follows
 */
import { api } from './api';

export interface LeaderboardEntry {
  rank: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  points: number;
  streakDays: number;
  isCurrentUser?: boolean;
}

export interface Leaderboard {
  entries: LeaderboardEntry[];
  currentUserRank?: LeaderboardEntry;
  total: number;
}

export interface FeedItem {
  id: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  type: 'challenge_joined' | 'challenge_completed' | 'streak_milestone' | 'level_up' | 'badge_earned';
  data: {
    challengeId?: number;
    challengeTitle?: string;
    streakDays?: number;
    level?: number;
    badge?: string;
  };
  createdAt: string;
}

export interface FollowUser {
  id: number;
  externalId: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
  streakCount: number;
  totalPoints: number;
  level: number;
  isFollowing?: boolean;
  isFollowedBy?: boolean;
}

export interface FollowStats {
  followers: number;
  following: number;
  isFollowing: boolean;
  isFollowedBy: boolean;
}

export const socialService = {
  async getLeaderboard(params?: {
    scope?: 'global' | 'friends';
    period?: 'daily' | 'weekly' | 'monthly' | 'allTime';
    limit?: number;
    offset?: number;
  } | 'global' | 'friends', limitParam?: number): Promise<Leaderboard> {
    // Handle both old and new API signatures
    const queryParams = new URLSearchParams();
    if (typeof params === 'string') {
      queryParams.append('scope', params);
      if (limitParam) queryParams.append('limit', String(limitParam));
    } else if (params) {
      if (params.scope) queryParams.append('scope', params.scope);
      if (params.period) queryParams.append('period', params.period);
      if (params.limit) queryParams.append('limit', String(params.limit));
      if (params.offset) queryParams.append('offset', String(params.offset));
    }
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return api.get<Leaderboard>(`/api/social/leaderboard${query}`);
  },

  async getFeed(params?: {
    scope?: 'global' | 'following';
    limit?: number;
    offset?: number;
  } | number): Promise<{ items: FeedItem[]; hasMore: boolean }> {
    // Handle both old and new API signatures
    const queryParams = new URLSearchParams();
    if (typeof params === 'number') {
      queryParams.append('limit', String(params));
    } else if (params) {
      if (params.scope) queryParams.append('scope', params.scope);
      if (params.limit) queryParams.append('limit', String(params.limit));
      if (params.offset) queryParams.append('offset', String(params.offset));
    }
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return api.get(`/api/social/feed${query}`);
  },

  async toggleFollow(userId: number): Promise<{ isFollowing: boolean }> {
    return api.post(`/api/social/follow/${userId}`);
  },

  async getFollowers(userId: number): Promise<FollowUser[]> {
    return api.get(`/api/social/followers/${userId}`);
  },

  async getFollowing(userId: number): Promise<FollowUser[]> {
    return api.get(`/api/social/following/${userId}`);
  },

  async getFollowStats(userId: number): Promise<FollowStats> {
    return api.get(`/api/social/stats/${userId}`);
  },

  async getUserProfile(userId: string): Promise<any> {
    return api.get(`/api/users/${userId}/profile`);
  },

  async followUser(userId: string): Promise<{ success: boolean }> {
    return api.post(`/api/social/follow/${userId}`);
  },

  async unfollowUser(userId: string): Promise<{ success: boolean }> {
    return api.delete(`/api/social/follow/${userId}`);
  },

  async blockUser(userId: string, reason?: string): Promise<{ success: boolean }> {
    return api.post(`/api/users/${userId}/block`, { reason });
  },

  async unblockUser(userId: string): Promise<{ success: boolean }> {
    return api.delete(`/api/users/${userId}/block`);
  },

  async getBlockedUsers(): Promise<{ id: string; name: string; blockedAt: string }[]> {
    return api.get('/api/users/blocked');
  }
};
