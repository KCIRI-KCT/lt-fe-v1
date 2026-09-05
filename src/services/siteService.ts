// ============================================================================
// Site & Chainage Service
// ============================================================================

import api from './api';
import type { Site, Chainage, Country, State, City } from '../types';

function normalizeSite(raw: Record<string, unknown>): Site {
  const id = String(raw.site_id || raw.id || '');
  const proj = raw.project ?? raw.project_id ?? raw.projectId ?? '';
  return {
    id,
    name: String(raw.name || ''),
    code: String(raw.code || ''),
    projectId: String(proj || ''),
    projectName: String(raw.project_name || raw.projectName || ''),
    location: String(raw.location || ''),
    latitude: Number(raw.latitude || 0),
    longitude: Number(raw.longitude || 0),
    status: String(raw.status || 'active').toLowerCase() as Site['status'],
    supervisorId: String(raw.supervisor_id || raw.supervisorId || raw.supervisor || ''),
    supervisorName: String(raw.supervisor_name || raw.supervisorName || ''),
    startDate: String(raw.start_date || raw.startDate || ''),
    chainages: Number(raw.chainages_count ?? raw.chainages ?? 0),
    activeCameras: Number(raw.active_cameras ?? raw.activeCameras ?? 0),
    workerCount: Number(raw.worker_count ?? raw.workerCount ?? 0),
    safetyScore: Number(raw.safety_score ?? raw.safetyScore ?? 100),
  } as Site;
}

function normalizeChainage(raw: Record<string, unknown>): Chainage {
  const siteVal = raw.site ?? raw.site_id ?? raw.siteId ?? '';
  return {
    id: String(raw.chainage_id || raw.id || ''),
    name: String(raw.name || ''),
    site: Number(siteVal || 0),
    siteId: String(siteVal || ''),
    siteName: String(raw.site_name || raw.siteName || ''),
    projectId: String(raw.project_id || raw.projectId || ''),
    projectName: String(raw.project_name || raw.projectName || ''),
    km_marker: String(raw.km_marker || raw.kmMarker || ''),
    kmMarker: String(raw.km_marker || raw.kmMarker || ''),
    description: String(raw.description || ''),
    status: String(raw.status || 'active').toLowerCase() as Chainage['status'],
    progress: Number(raw.progress ?? 0),
    workers_count: Number(raw.workers_count ?? 0),
    safety_score: Number(raw.safety_score ?? 100),
  } as unknown as Chainage;
}

export const siteService = {
  async getSites(params?: Record<string, unknown>): Promise<Site[]> {
    const response = await api.get('sites/', { params });
    const data = response.data?.data || response.data;
    const items: Record<string, unknown>[] = Array.isArray(data) ? data : data?.results || [];
    return items.map(normalizeSite);
  },

  async getSite(id: string): Promise<Site> {
    const response = await api.get(`sites/${id}/`);
    const raw = response.data?.data || response.data;
    return normalizeSite(raw as Record<string, unknown>);
  },

  async createSite(siteData: Partial<Site>): Promise<Site> {
    const response = await api.post('sites/', siteData);
    return response.data?.data || response.data;
  },

  async updateSite(id: string, siteData: Partial<Site>): Promise<Site> {
    const response = await api.put(`sites/${id}/`, siteData);
    return response.data?.data || response.data;
  },

  async deleteSite(id: string): Promise<{ message: string }> {
    const response = await api.delete(`sites/${id}/`);
    return response.data;
  },

  async getChainages(params?: { siteId?: string; projectId?: string }): Promise<Chainage[]> {
    const queryParams: Record<string, unknown> = {};
    if (params?.siteId) {
      queryParams.siteId = params.siteId;
      queryParams.site_id = params.siteId;
      queryParams.site = params.siteId;
    }
    if (params?.projectId) {
      queryParams.projectId = params.projectId;
      queryParams.project_id = params.projectId;
      queryParams.project = params.projectId;
    }
    const response = await api.get('chainages/', { params: Object.keys(queryParams).length > 0 ? queryParams : undefined });
    const data = response.data?.data || response.data;
    const items: Record<string, unknown>[] = Array.isArray(data) ? data : data?.results || [];
    return items.map(normalizeChainage);
  },

  async createChainage(chainageData: Partial<Chainage>): Promise<Chainage> {
    const response = await api.post('chainages/', chainageData);
    return response.data?.data || response.data;
  },

  // Master location methods
  async getCountries(): Promise<Country[]> {
    const response = await api.get('countries/');
    const data = response.data?.data || response.data;
    return Array.isArray(data) ? data : [];
  },

  async getStates(countryId?: string): Promise<State[]> {
    const response = await api.get('states/', { params: { countryId } });
    const data = response.data?.data || response.data;
    return Array.isArray(data) ? data : [];
  },

  async getCities(stateId?: string): Promise<City[]> {
    const response = await api.get('cities/', { params: { stateId } });
    const data = response.data?.data || response.data;
    return Array.isArray(data) ? data : [];
  },
};

export default siteService;
