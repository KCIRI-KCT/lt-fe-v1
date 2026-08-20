// ============================================================================
// Site & Chainage Service
// ============================================================================

import api from './api';
import type { Site, Chainage, Country, State, City } from '../types';

export const siteService = {
  async getSites(params?: Record<string, unknown>): Promise<Site[]> {
    const response = await api.get('sites/', { params });
    const data = response.data?.data || response.data;
    return Array.isArray(data) ? data : data?.results || [];
  },

  async getSite(id: string): Promise<Site> {
    const response = await api.get(`sites/${id}/`);
    return response.data?.data || response.data;
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

  async getChainages(siteId?: string): Promise<Chainage[]> {
    const response = await api.get('chainages/', { params: { siteId } });
    const data = response.data?.data || response.data;
    return Array.isArray(data) ? data : data?.results || [];
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
