// ============================================================================
// Worker & Attendance Service
// ============================================================================

import api from './api';
import type { Worker, Attendance } from '../types';

export const workerService = {
  async getWorkers(params?: Record<string, unknown>): Promise<Worker[]> {
    const response = await api.get('workers/', { params });
    const data = response.data?.data || response.data;
    return Array.isArray(data) ? data : data?.results || [];
  },

  async getWorker(id: string): Promise<Worker> {
    const response = await api.get(`workers/${id}/`);
    return response.data?.data || response.data;
  },

  async createWorker(workerData: Partial<Worker>): Promise<Worker> {
    const response = await api.post('workers/', workerData);
    return response.data?.data || response.data;
  },

  async updateWorker(id: string, workerData: Partial<Worker>): Promise<Worker> {
    const response = await api.put(`workers/${id}/`, workerData);
    return response.data?.data || response.data;
  },

  async deleteWorker(id: string): Promise<{ message: string }> {
    const response = await api.delete(`workers/${id}/`);
    return response.data;
  },

  async getAttendances(params?: Record<string, unknown>): Promise<Attendance[]> {
    const response = await api.get('attendances/', { params });
    const data = response.data?.data || response.data;
    return Array.isArray(data) ? data : data?.results || [];
  },

  async createAttendance(attendanceData: Partial<Attendance>): Promise<Attendance> {
    const response = await api.post('attendances/', attendanceData);
    return response.data?.data || response.data;
  },
};

export default workerService;
