// ============================================================================
// Project Service
// ============================================================================

import api from './api';
import type { Project } from '../types';

export const projectService = {
  async getProjects(params?: Record<string, unknown>): Promise<Project[]> {
    const response = await api.get('projects/', { params });
    const data = response.data?.data || response.data;
    return Array.isArray(data) ? data : data?.results || [];
  },

  async getProject(id: string): Promise<Project> {
    const response = await api.get(`projects/${id}/`);
    return response.data?.data || response.data;
  },

  async createProject(projectData: Partial<Project>): Promise<Project> {
    const response = await api.post('projects/', projectData);
    return response.data?.data || response.data;
  },

  async updateProject(id: string, projectData: Partial<Project>): Promise<Project> {
    const response = await api.put(`projects/${id}/`, projectData);
    return response.data?.data || response.data;
  },

  async requestDeleteProject(id: string, reason?: string): Promise<{ message: string }> {
    const response = await api.post(`projects/${id}/request-delete/`, { reason });
    return response.data;
  },

  async confirmDeleteProject(id: string): Promise<{ message: string }> {
    const response = await api.delete(`projects/${id}/`);
    return response.data;
  },
};

export default projectService;
