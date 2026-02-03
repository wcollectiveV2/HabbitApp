import { api } from './api';

export interface Habit {
  id: string;
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'custom';
  targetCount: number;
  category: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  completedToday?: boolean;
  icon?: string;
  color?: string;
  streak?: number;
}

export interface HabitLog {
  id: string;
  habitId: string;
  userId: string;
  completedAt: string;
  notes?: string;
}

export interface HabitStats {
  totalCompletions: number;
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
  lastSevenDays: boolean[];
}

export interface CreateHabitData {
  name: string;
  description?: string;
  frequency?: 'daily' | 'weekly' | 'custom';
  target_count?: number;
  category?: string;
  icon?: string;
  color?: string;
}

export interface UpdateHabitData {
  name?: string;
  description?: string;
  frequency?: 'daily' | 'weekly' | 'custom';
  target_count?: number;
  category?: string;
  is_active?: boolean;
  icon?: string;
  color?: string;
}

class HabitService {
  async getHabits(): Promise<Habit[]> {
    const response = await api.get('/habits');
    return response.habits || [];
  }

  async getHabit(id: string): Promise<Habit> {
    const response = await api.get(`/habits/${id}`);
    return response.habit;
  }

  async createHabit(data: CreateHabitData): Promise<Habit> {
    const response = await api.post('/habits', data);
    return response.habit;
  }

  async updateHabit(id: string, data: UpdateHabitData): Promise<Habit> {
    const response = await api.patch(`/habits/${id}`, data);
    return response.habit;
  }

  async deleteHabit(id: string): Promise<void> {
    await api.delete(`/habits/${id}`);
  }

  async completeHabit(id: string, notes?: string): Promise<{ success: boolean; streak?: number }> {
    const response = await api.post(`/habits/${id}/complete`, { notes });
    return response;
  }

  async uncompleteHabit(id: string): Promise<void> {
    await api.delete(`/habits/${id}/complete`);
  }

  async getHabitLogs(id: string, startDate?: string, endDate?: string): Promise<HabitLog[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const response = await api.get(`/habits/${id}/logs?${params.toString()}`);
    return response.logs || [];
  }

  async getHabitStats(id: string): Promise<HabitStats> {
    const response = await api.get(`/habits/${id}/stats`);
    return response.stats || {
      totalCompletions: 0,
      currentStreak: 0,
      longestStreak: 0,
      completionRate: 0,
      lastSevenDays: [false, false, false, false, false, false, false]
    };
  }

  // Get all habits with their completion status for today
  async getTodayHabits(): Promise<Habit[]> {
    const response = await api.get('/habits?include_today=true');
    return response.habits || [];
  }
}

export const habitService = new HabitService();
