/**
 * Protocol Service for HabitPulse
 * Handles protocol operations, element logging, and leaderboards
 */

import { api } from './api';

export interface ProtocolElement {
  id: number;
  title: string;
  description?: string;
  type: 'check' | 'number' | 'range' | 'timer' | 'text';
  unit?: string;
  goal?: number;
  minValue?: number;
  maxValue?: number;
  points: number;
  frequency: string;
  isRequired: boolean;
  // Today's log data
  completed?: boolean;
  value?: number;
  textValue?: string;
  pointsEarned?: number;
}

export interface Protocol {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  status: string;
  organizationId?: number;
  organizationName?: string;
  elements: ProtocolElement[];
  createdAt: string;
}

export interface ProtocolProgress {
  protocol: {
    id: number;
    name: string;
    description?: string;
    icon?: string;
  };
  date: string;
  elements: ProtocolElement[];
  todayProgress: {
    completed: number;
    total: number;
    required: number;
    pointsEarned: number;
    percentage: number;
  };
  stats?: {
    totalPoints: number;
    totalCompletions: number;
    currentStreak: number;
    longestStreak: number;
    lastActivityDate?: string;
  };
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatarUrl?: string;
  totalPoints: number;
  activeDays: number;
  isCurrentUser: boolean;
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  myRank?: {
    rank: number;
    totalPoints: number;
  };
  myPrivacy: string;
}

export interface OrganizationLeaderboardResponse extends LeaderboardResponse {
  organization: {
    name: string;
    logo_url?: string;
  };
}

class ProtocolService {
  /**
   * Get list of protocols assigned to the current user
   */
  async getMyProtocols(options?: { organization_id?: number; status?: string }): Promise<Protocol[]> {
    const params = new URLSearchParams();
    if (options?.organization_id) params.append('organization_id', String(options.organization_id));
    if (options?.status) params.append('status', options.status);
    
    const queryString = params.toString();
    return api.get<Protocol[]>(`/api/protocols${queryString ? '?' + queryString : ''}`);
  }

  /**
   * Get a single protocol by ID
   */
  async getProtocol(protocolId: number): Promise<Protocol> {
    return api.get<Protocol>(`/api/protocols/${protocolId}`);
  }

  /**
   * Get user's progress for a specific protocol (with today's logs)
   */
  async getMyProgress(protocolId: number, date?: string): Promise<ProtocolProgress> {
    const params = date ? `?date=${date}` : '';
    return api.get<ProtocolProgress>(`/api/protocols/${protocolId}/my-progress${params}`);
  }

  /**
   * Log an element completion
   */
  async logElement(
    protocolId: number, 
    elementId: number, 
    data: {
      completed?: boolean;
      value?: number;
      text_value?: string;
      log_date?: string;
    }
  ): Promise<{ pointsEarned: number }> {
    return api.post(`/api/protocols/${protocolId}/log`, {
      element_id: elementId,
      ...data
    });
  }

  /**
   * Get protocol leaderboard
   */
  async getProtocolLeaderboard(
    protocolId: number, 
    options?: { limit?: number; offset?: number; period?: string }
  ): Promise<LeaderboardResponse> {
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', String(options.limit));
    if (options?.offset) params.append('offset', String(options.offset));
    if (options?.period) params.append('period', options.period);
    
    const queryString = params.toString();
    return api.get<LeaderboardResponse>(`/api/protocols/${protocolId}/leaderboard${queryString ? '?' + queryString : ''}`);
  }

  /**
   * Get organization leaderboard
   */
  async getOrganizationLeaderboard(
    organizationId: number,
    options?: { limit?: number; offset?: number; period?: string }
  ): Promise<OrganizationLeaderboardResponse> {
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', String(options.limit));
    if (options?.offset) params.append('offset', String(options.offset));
    if (options?.period) params.append('period', options.period);
    
    const queryString = params.toString();
    return api.get<OrganizationLeaderboardResponse>(`/api/organizations/${organizationId}/leaderboard${queryString ? '?' + queryString : ''}`);
  }

  /**
   * Get protocols for an organization
   */
  async getOrganizationProtocols(organizationId: number): Promise<Protocol[]> {
    return api.get<Protocol[]>(`/api/organizations/${organizationId}/protocols`);
  }
}

export const protocolService = new ProtocolService();
