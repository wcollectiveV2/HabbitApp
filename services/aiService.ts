/**
 * AI Coach Service - Daily tips and chat
 */
import { api } from './api';

export interface DailyTip {
  id: number;
  userId: number;
  content: string;
  category: 'motivation' | 'suggestion' | 'insight' | 'reminder';
  relatedHabits?: number[];
  date: string;
  createdAt: string;
}

export interface CoachMessage {
  id: number;
  conversationId: number;
  role: 'user' | 'assistant';
  content: string;
  metadata?: {
    habitContext?: number[];
    suggestedActions?: string[];
    sentiment?: 'positive' | 'neutral' | 'negative';
  };
  createdAt: string;
}

export interface Conversation {
  id: number;
  userId: number;
  title: string;
  lastMessageAt: string;
  messageCount: number;
  createdAt: string;
}

export const aiService = {
  async getDailyTip(): Promise<DailyTip> {
    return api.get<DailyTip>('/ai/daily-tip');
  },

  async chat(message: string, conversationId?: number): Promise<{
    message: CoachMessage;
    conversationId: number;
  }> {
    return api.post('/ai/coach/chat', { message, conversationId });
  },

  async getHistory(conversationId: number, params?: {
    limit?: number;
    before?: string;
  }): Promise<{ messages: CoachMessage[]; hasMore: boolean }> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', String(params.limit));
    if (params?.before) queryParams.append('before', params.before);
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return api.get(`/ai/coach/history?conversationId=${conversationId}${query ? '&' + query.slice(1) : ''}`);
  },

  async getConversations(): Promise<Conversation[]> {
    return api.get<Conversation[]>('/ai/coach/conversations');
  }
};
