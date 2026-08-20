// ============================================================================
// Safety, AI Alert & Incident Service
// ============================================================================

import api from './api';
import type { AIAlert, PPEAcknowledgement, PPENotification, Incident } from '../types';

export const safetyService = {
  async getAIAlerts(params?: Record<string, unknown>): Promise<AIAlert[]> {
    const response = await api.get('ai-alerts/', { params });
    const data = response.data?.data || response.data;
    return Array.isArray(data) ? data : data?.results || [];
  },

  async updateAIAlertStatus(id: string, status: string): Promise<AIAlert> {
    const response = await api.patch(`ai-alerts/${id}/`, { status });
    return response.data?.data || response.data;
  },

  async acknowledgePPE(acknowledgement: Partial<PPEAcknowledgement>): Promise<PPEAcknowledgement> {
    const response = await api.post('ppe-acknowledgements/', acknowledgement);
    return response.data?.data || response.data;
  },

  async getPPENotifications(): Promise<PPENotification[]> {
    const response = await api.get('ppe-notifications/');
    const data = response.data?.data || response.data;
    return Array.isArray(data) ? data : data?.results || [];
  },

  async getIncidents(params?: Record<string, unknown>): Promise<Incident[]> {
    const response = await api.get('incidents/', { params });
    const data = response.data?.data || response.data;
    return Array.isArray(data) ? data : data?.results || [];
  },

  async createIncident(incidentData: Partial<Incident>): Promise<Incident> {
    const response = await api.post('incidents/', incidentData);
    return response.data?.data || response.data;
  },

  async updateIncident(id: string, incidentData: Partial<Incident>): Promise<Incident> {
    const response = await api.put(`incidents/${id}/`, incidentData);
    return response.data?.data || response.data;
  },
};

export default safetyService;
