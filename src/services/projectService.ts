// ============================================================================
// Project Service
// ============================================================================

import api from './api';
import type { Project, ProjectRoleAssignment, ProjectStatus } from '../types';

export const projectService = {
  async getProjects(params?: Record<string, unknown>): Promise<Project[]> {
    const response = await api.get('projects/', { params });
    const rawData = response.data?.data || response.data;
    const items: Array<Record<string, unknown>> = Array.isArray(rawData) ? rawData : rawData?.results || [];

    return items.map((p, idx) => {
      const idVal = String(p.id || p.project_id || p.pk || p.code || p.project_code || `proj-${idx + 1}`);
      return {
        ...p,
        id: idVal,
        project_id: p.project_id || p.id || idVal,
        name: (p.name || p.project_name || p.title || 'Unnamed Project') as string,
        code: (p.code || p.project_code || `PRJ-${idVal}`) as string,
        cityName: (p.cityName || p.city_name || p.city || 'N/A') as string,
        stateName: (p.stateName || p.state_name || p.state || 'N/A') as string,
        startDate: (p.startDate || p.start_date || 'N/A') as string,
        endDate: (p.endDate || p.end_date || 'N/A') as string,
        deleteRequested: Boolean(p.deleteRequested || p.delete_requested),
      } as Project;
    });
  },

  async getProject(id: string): Promise<Project> {
    let p: Record<string, unknown> | null = null;
    try {
      const response = await api.get(`projects/${id}/`);
      p = response.data?.data || response.data;
    } catch {
      try {
        const all = await this.getProjects();
        const found = all.find((item) => String(item.id) === String(id) || String(item.project_id) === String(id) || item.code === id);
        if (found) return found;
      } catch {
        // Ignore fallback error
      }
    }

    if (!p) {
      throw new Error(`Project with ID ${id} not found`);
    }

    const idVal = String(p.id || p.project_id || p.pk || id);

    const rawSites = (p.sites || p.site_list) as Record<string, unknown>[] | undefined;
    const sites = Array.isArray(rawSites) ? rawSites.map((s, idx) => ({
      id: String(s.id || s.site_id || idx + 1),
      siteName: String(s.siteName || s.site_name || s.name || `Site ${idx + 1}`),
      siteNumber: String(s.siteNumber || s.site_number || s.code || `S-${idx + 1}`),
      chainageName: String(s.chainageName || s.chainage_name || s.chainage || 'N/A'),
      chainageKm: Number(s.chainageKm || s.chainage_km || s.km || 0),
    })) : [];

    const rawRoles = (p.roleAssignments || p.role_assignments) as Record<string, unknown>[] | undefined;
    const roleAssignments = Array.isArray(rawRoles)
      ? rawRoles.map((ra) => ({
          role: (ra.role || ra.designation) as ProjectRoleAssignment['role'],
          userId: String(ra.userId || ra.user_id || ra.user || ''),
          userName: String(ra.userName || ra.user_name || ra.name || ''),
          siteId: String(ra.siteId || ra.site_id || ra.site || ''),
          siteName: String(ra.siteName || ra.site_name || ''),
        }))
      : [];

    return {
      ...p,
      id: idVal,
      project_id: p.project_id || p.id || idVal,
      name: String(p.name || p.project_name || p.title || 'Unnamed Project'),
      code: String(p.code || p.project_code || `PRJ-${idVal}`),
      description: String(p.description || p.desc || ''),
      cityId: String(p.cityId || p.city_id || p.city || ''),
      cityName: String(p.cityName || p.city_name || p.city || 'N/A'),
      stateName: String(p.stateName || p.state_name || p.state || 'N/A'),
      startDate: String(p.startDate || p.start_date || ''),
      endDate: String(p.endDate || p.end_date || ''),
      status: String(p.status || 'active').toLowerCase() as ProjectStatus,
      budget: Number(p.budget || 10000000),
      progress: Number(p.progress || 0),
      managerId: String(p.managerId || p.manager_id || ''),
      managerName: String(p.managerName || p.manager_name || 'N/A'),
      supervisorId: String(p.supervisorId || p.supervisor_id || ''),
      supervisorName: String(p.supervisorName || p.supervisor_name || 'N/A'),
      engineerId: String(p.engineerId || p.engineer_id || ''),
      engineerName: String(p.engineerName || p.engineer_name || 'N/A'),
      siteCount: sites.length,
      sites,
      roleAssignments,
      deleteRequested: Boolean(p.deleteRequested || p.delete_requested),
    } as Project;
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
