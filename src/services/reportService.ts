// ============================================================================
// Report Service
// ============================================================================

import api from './api';
import type { Report } from '../types';

export const reportService = {
  async getReports(params?: Record<string, unknown>): Promise<Report[]> {
    const response = await api.get('reports/', { params });
    const data = response.data?.data || response.data;
    return Array.isArray(data) ? data : data?.results || [];
  },

  async generateReport(params: { type: string; dateRange: { start: string; end: string }; format: string; siteId?: string; projectId?: string }): Promise<Report> {
    const response = await api.post('reports/generate/', params);
    return response.data?.data || response.data;
  },

  async downloadReport(id: string): Promise<Blob> {
    const response = await api.get(`reports/${id}/download/`, { responseType: 'blob' });
    return response.data;
  },
};

export default reportService;
