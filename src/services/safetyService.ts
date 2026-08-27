// ============================================================================
// Safety, AI Alert & Incident Service
// ============================================================================

import api from './api';
import type { AIAlert, PPEAcknowledgement, PPENotification, Incident, AlertSeverity, AlertStatus, AIAlertType } from '../types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeAIAlert(raw: any): AIAlert {
  if (!raw) return {} as AIAlert;
  const alertId = String(raw.alert_id || raw.id || Date.now());
  const rawSev = String(raw.severity || 'HIGH').toUpperCase();
  const rawStat = String(raw.status || 'OPEN').toUpperCase();

  const severityMap: Record<string, AlertSeverity> = {
    CRITICAL: 'critical',
    HIGH: 'high',
    MEDIUM: 'medium',
    LOW: 'low',
    critical: 'critical',
    high: 'high',
    medium: 'medium',
    low: 'low',
  };

  const statusMap: Record<string, AlertStatus> = {
    OPEN: 'open',
    ACKNOWLEDGED: 'acknowledged',
    RESOLVED: 'resolved',
    open: 'open',
    acknowledged: 'acknowledged',
    resolved: 'resolved',
  };

  const typeStr = (raw.type || raw.alert_type || 'helmet_violation') as AIAlertType;

  return {
    id: alertId,
    cameraId: String(raw.camera_id || raw.cameraId || '1'),
    cameraName: (raw.camera_name || raw.cameraName || 'AI Corridor Camera') as string,
    siteId: String(raw.site_id || raw.siteId || '1'),
    siteName: (raw.site_name || raw.siteName || 'Site Corridor') as string,
    siteCode: (raw.site_code || raw.siteCode) as string | undefined,
    projectId: String(raw.project_id || raw.projectId || '1'),
    chainageId: String(raw.chainage_id || raw.chainageId || '1'),
    chainageLabel: (raw.chainage_label || raw.chainageLabel) as string | undefined,
    type: typeStr,
    severity: severityMap[rawSev] || 'high',
    timestamp: String(raw.timestamp || new Date().toISOString()),
    snapshot: String(raw.snapshot || raw.image || raw.image_url || raw.imageUrl || ''),
    description: String(raw.description || `${typeStr.replace(/_/g, ' ')} detected at ${raw.site_name || 'site'}`),
    status: statusMap[rawStat] || 'open',
    assignedTo: (raw.assigned_to || raw.assignedTo) as string | undefined,
    acknowledgedBy: (raw.acknowledged_by || raw.acknowledgedBy) as string | undefined,
    acknowledgedAt: (raw.acknowledged_at || raw.acknowledgedAt) as string | undefined,
    resolvedAt: (raw.resolved_at || raw.resolvedAt) as string | undefined,
    detailFields: (raw.detail_fields || raw.detailFields) as { label: string; value: string }[] | undefined,
  };
}

export const safetyService = {
  async getAIAlerts(params?: Record<string, unknown>): Promise<AIAlert[]> {
    const queryParams = { page_size: 10000, ...params };
    const response = await api.get('ai-alerts/', { params: queryParams });
    const data = response.data?.data || response.data;
    const list = Array.isArray(data) ? data : data?.results || [];
    return list.map(normalizeAIAlert);
  },

  async updateAIAlertStatus(id: string, status: string): Promise<AIAlert> {
    const response = await api.patch(`ai-alerts/${id}/`, { status });
    const data = response.data?.data || response.data;
    return normalizeAIAlert(data);
  },

  async acknowledgePPE(acknowledgement: Partial<PPEAcknowledgement>): Promise<PPEAcknowledgement> {
    const response = await api.post('ppe-acknowledgements/', acknowledgement);
    return response.data?.data || response.data;
  },

  async getPPENotifications(): Promise<PPENotification[]> {
    const response = await api.get('ppe-notifications/', { params: { page_size: 10000 } });
    const data = response.data?.data || response.data;
    return Array.isArray(data) ? data : data?.results || [];
  },

  async getIncidents(params?: Record<string, unknown>): Promise<Incident[]> {
    const queryParams = { page_size: 10000, ...params };
    const response = await api.get('incidents/', { params: queryParams });
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
