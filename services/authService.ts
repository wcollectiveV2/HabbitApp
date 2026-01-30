/**
 * Authentication Service
 */
import { authApi, api } from './api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  image?: string;
  avatar?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface UserProfile {
  id: string;
  externalId: string;
  name: string;
  email: string;
  avatarUrl?: string;
  avatar?: string;
  bio?: string;
  streakCount: number;
  totalPoints: number;
  currentXp: number;
  level: number;
  privacyShowLeaderboard: boolean;
  privacyShowActivity: boolean;
  privacyAllowFollowers: boolean;
  privacyPublicLeaderboard?: 'visible' | 'anonymous' | 'hidden';
  privacyChallengeLeaderboard?: 'visible' | 'anonymous' | 'hidden';
}

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    return authApi.post<AuthResponse>('/api/auth/login', data);
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    return authApi.post<AuthResponse>('/api/auth/register', data);
  },

  async logout(): Promise<void> {
    try {
      await authApi.post('/api/auth/logout');
    } catch (e) {
      // Ignore logout errors
    }
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  storeAuth(response: AuthResponse): void {
    localStorage.setItem('token', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    localStorage.setItem('user', JSON.stringify(response.user));
  },

  getStoredUser(): AuthUser | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getStoredToken(): string | null {
    return localStorage.getItem('token');
  },

  isAuthenticated(): boolean {
    return !!this.getStoredToken();
  }
};

export const userService = {
  async getProfile(): Promise<UserProfile> {
    return api.get<UserProfile>('/api/user/profile');
  },

  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    return api.patch<UserProfile>('/api/user/profile', data);
  },

  async syncUser(data: { externalId: string; name: string; email: string; avatarUrl?: string }): Promise<UserProfile> {
    return api.post<UserProfile>('/api/user/sync', data);
  },

  async getActivity(): Promise<{ date: string; count: number }[]> {
    return api.get('/api/user/activity');
  },

  async getStats(): Promise<{
    streakCount: number;
    totalPoints: number;
    currentXp: number;
    level: number;
    completedToday: number;
    totalToday: number;
  }> {
    return api.get('/api/user/stats');
  }
};
