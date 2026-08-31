// ============================================================================
// Message Service — Broadcast & Internal Communications
// ============================================================================

import api from './api';
import type { Message } from '../types';

export const messageService = {
  async getMessages(params?: Record<string, unknown>): Promise<Message[]> {
    const response = await api.get('messages/', { params });
    const data = response.data?.data || response.data;
    return Array.isArray(data) ? data : data?.results || [];
  },

  async getMessage(id: string): Promise<Message> {
    const response = await api.get(`messages/${id}/`);
    return response.data?.data || response.data;
  },

  async createMessage(messageData: Partial<Message>): Promise<Message> {
    const response = await api.post('messages/', messageData);
    return response.data?.data || response.data;
  },

  async updateMessage(id: string, messageData: Partial<Message>): Promise<Message> {
    const response = await api.put(`messages/${id}/`, messageData);
    return response.data?.data || response.data;
  },

  async deleteMessage(id: string): Promise<{ message: string }> {
    const response = await api.delete(`messages/${id}/`);
    return response.data;
  },
};

export default messageService;
