/**
 * Challenge Service - Manages challenges
 */
import { api } from './api';

export interface Challenge {
  id: number;
  title: string;
  description?: string;
  type: 'individual' | 'group' | 'competitive';
  status: 'upcoming' | 'active' | 'completed';
  icon?: string;
  coverImage?: string;
  creatorId: number;
  startDate: string;
  endDate: string;
  targetDays: number;
  isPublic: boolean;
  maxParticipants?: number;
  participantCount: number;
  habitTemplate?: {
    title: string;
    type: 'check' | 'counter' | 'log';
    goal?: number;
    unit?: string;
  };
  rewards?: {
    xp: number;
    badge?: string;
  };
  createdAt: string;
}

export interface ChallengeParticipant {
  id: number;
  challengeId: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  joinedAt: string;
  progress: number;
  completedDays: number;
  currentStreak: number;
}

export interface ChallengeProgress {
  challenge: Challenge;
  participant: ChallengeParticipant;
  dailyLogs: {
    date: string;
    completed: boolean;
    value?: number;
  }[];
  daysRemaining: number;
  isOnTrack: boolean;
}

export const challengeService = {
  async getActiveChallenges(): Promise<Challenge[]> {
    return api.get<Challenge[]>('/challenges/active');
  },

  async discoverChallenges(filters?: {
    type?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ challenges: Challenge[]; total: number }> {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.limit) params.append('limit', String(filters.limit));
    if (filters?.offset) params.append('offset', String(filters.offset));
    const query = params.toString() ? `?${params.toString()}` : '';
    return api.get(`/challenges/discover${query}`);
  },

  async getChallenge(challengeId: number): Promise<{
    challenge: Challenge;
    participants: ChallengeParticipant[];
    isJoined: boolean;
  }> {
    return api.get(`/challenges/${challengeId}`);
  },

  async createChallenge(data: Partial<Challenge>): Promise<Challenge> {
    return api.post<Challenge>('/challenges', data);
  },

  async joinChallenge(challengeId: number): Promise<{ success: boolean; participant: ChallengeParticipant }> {
    return api.post(`/challenges/${challengeId}/join`);
  },

  async leaveChallenge(challengeId: number): Promise<{ success: boolean }> {
    return api.delete(`/challenges/${challengeId}/leave`);
  },

  async getProgress(challengeId: number): Promise<ChallengeProgress> {
    return api.get(`/challenges/${challengeId}/progress`);
  },

  async logProgress(challengeId: number, data: { completed: boolean; value?: number }): Promise<{
    success: boolean;
    progress: number;
    completedDays: number;
  }> {
    return api.post(`/challenges/${challengeId}/log`, data);
  },

  async getLeaderboard(challengeId: number): Promise<ChallengeParticipant[]> {
    return api.get(`/challenges/${challengeId}/leaderboard`);
  }
};
