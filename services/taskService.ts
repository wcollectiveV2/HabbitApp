/**
 * Task Service - Manages daily tasks and habits
 */
import { api } from './api';

export type TaskStatus = 'pending' | 'completed' | 'skipped';
export type TaskType = 'check' | 'counter' | 'log';

export interface Task {
  id: string;
  userId: string;
  habitId: string;
  title: string;
  description?: string;
  icon: string;
  type: TaskType;
  unit?: string;
  goal?: number;
  step?: number;
  status: TaskStatus;
  currentValue: number;
  scheduledDate: string;
  completedAt?: string;
}

export interface DailyTaskSummary {
  date: string;
  tasks: Task[];
  completedCount: number;
  totalCount: number;
  streakDay: number;
}

export interface TaskHistory {
  date: string;
  completedCount: number;
  totalCount: number;
  tasks: {
    taskId: string;
    title: string;
    status: TaskStatus;
    value: number;
    goal?: number;
  }[];
}

export interface HeatmapData {
  date: string;
  count: number;
}

export interface Habit {
  id: string;
  userId: string;
  name: string;
  description?: string;
  icon?: string;
  category?: string;
  frequency: 'daily' | 'weekly' | 'custom';
  scheduledDays?: number[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const taskService = {
  async getTodayTasks(): Promise<DailyTaskSummary> {
    return api.get<DailyTaskSummary>('/api/tasks/today');
  },

  async updateTask(taskId: string, status: TaskStatus, value?: number): Promise<Task> {
    return api.patch<Task>(`/api/tasks/${taskId}`, { status, value });
  },

  async createTask(data: {
    title: string;
    description?: string;
    icon?: string;
    type: TaskType;
    unit?: string;
    goal?: number;
    step?: number;
    frequency?: 'daily' | 'weekly' | 'custom';
  }): Promise<Task> {
    return api.post<Task>('/api/tasks', data);
  },

  async getHistory(from?: string, to?: string): Promise<{ type: 'history'; data: TaskHistory[] }> {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    const query = params.toString() ? `?${params.toString()}` : '';
    return api.get(`/api/tasks/history${query}`);
  },

  async getHeatmapData(year?: number): Promise<{ type: 'heatmap'; data: HeatmapData[] }> {
    const targetYear = year || new Date().getFullYear();
    return api.get(`/api/tasks/history?year=${targetYear}`);
  },

  async deleteTask(taskId: string): Promise<{ success: boolean }> {
    return api.delete(`/api/tasks/${taskId}`);
  },

  async toggleComplete(task: Task): Promise<Task> {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    const newValue = task.type === 'check' 
      ? (newStatus === 'completed' ? 1 : 0)
      : task.currentValue;
    return this.updateTask(task.id, newStatus, newValue);
  },

  async incrementCounter(task: Task): Promise<Task> {
    const step = task.step || 1;
    const newValue = task.currentValue + step;
    const newStatus = task.goal && newValue >= task.goal ? 'completed' : task.status;
    return this.updateTask(task.id, newStatus, newValue);
  },

  // Habit Templates
  async getHabits(): Promise<Habit[]> {
    return api.get<Habit[]>('/api/habits');
  },

  async createHabit(data: {
    name: string;
    description?: string;
    icon?: string;
    category?: string;
    frequency: 'daily' | 'weekly' | 'custom';
    scheduledDays?: number[];
  }): Promise<Habit> {
    return api.post<Habit>('/api/habits', data);
  },

  async updateHabit(habitId: string, data: Partial<Habit>): Promise<Habit> {
    return api.put<Habit>(`/api/habits/${habitId}`, data);
  },

  async deleteHabit(habitId: string): Promise<{ success: boolean }> {
    return api.delete(`/api/habits/${habitId}`);
  }
};
