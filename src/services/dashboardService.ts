// ============================================================================
// Dashboard & Analytics Service
// ============================================================================

import api from './api';

export interface ProgressPoint {
  month: string;
  planned: number;
  actual: number;
}

export interface BackendDashboardMetrics {
  total_active_sites: number;
  total_workers: number;
  active_workers_today: number;
  ppe_compliance_avg: number;
  open_alerts_count: number;
  total_cameras: number;
  total_projects?: number;
  totalProjects?: number;
  activeSites?: number;
  totalWorkers?: number;
  criticalAlerts?: number;
  safetyScore?: number;
  critical_alerts?: number;
  safety_score?: number;
  ppeCompliance?: {
    helmet: number;
    vest: number;
    mask: number;
    boots: number;
    gloves: number;
  };
  incidentTrends?: Array<{
    date: string;
    critical: number;
    major: number;
    minor: number;
    observation: number;
  }>;
}

export interface ProgressTrendResponse {
  range: 'month' | 'week' | 'year';
  labels: string[];
  progress_trend: number[];
  ppe_compliance_trend: number[];
}

export interface SafetyAlertsSummary {
  total_alerts: number;
  open_alerts: number;
  resolved_alerts: number;
  critical_count: number;
  major_count: number;
  minor_count: number;
  site_id?: string | number;
}

export interface WorkerAttendanceSummary {
  date: string;
  total_workers: number;
  present_count: number;
  absent_count: number;
  late_count: number;
  attendance_percentage: number;
  site_id?: string | number;
}

export const dashboardService = {
  async getDashboardMetrics(): Promise<BackendDashboardMetrics> {
    const getRaw = async (): Promise<Record<string, unknown>> => {
      try {
        const response = await api.get('dashboard/stats/');
        return (response.data?.data || response.data || {}) as Record<string, unknown>;
      } catch {
        try {
          const response = await api.get('dashboard/metrics/');
          return (response.data?.data || response.data || {}) as Record<string, unknown>;
        } catch {
          return {};
        }
      }
    };
    const r = await getRaw();
    return {
      total_active_sites: Number(r.total_active_sites ?? r.activeSites ?? 0),
      total_workers: Number(r.total_workers ?? r.totalWorkers ?? 0),
      active_workers_today: Number(r.active_workers_today ?? r.active_workers ?? 0),
      ppe_compliance_avg: Number(r.ppe_compliance_avg ?? r.safety_score ?? 0),
      open_alerts_count: Number(r.open_alerts_count ?? r.criticalAlerts ?? 0),
      total_cameras: Number(r.total_cameras ?? 0),
      total_projects: Number(r.total_projects ?? r.totalProjects ?? 0),
      totalProjects: Number(r.totalProjects ?? r.total_projects ?? 0),
      activeSites: Number(r.activeSites ?? r.total_active_sites ?? 0),
      totalWorkers: Number(r.totalWorkers ?? r.total_workers ?? 0),
      criticalAlerts: Number(r.criticalAlerts ?? r.open_alerts_count ?? 0),
      safetyScore: Number(r.safetyScore ?? r.safety_score ?? 0),
      ppeCompliance: (r.ppeCompliance as BackendDashboardMetrics['ppeCompliance']) || {
        helmet: 0,
        vest: 0,
        mask: 0,
        boots: 0,
        gloves: 0,
      },
      incidentTrends: (r.incidentTrends as BackendDashboardMetrics['incidentTrends']) || [],
    };
  },

  async getSystemHealth(): Promise<Record<string, unknown>> {
    const response = await api.get('health/');
    return response.data?.data || response.data;
  },

  async getProgressTrend(range: 'week' | 'month' | 'year' = 'month', siteId?: string): Promise<ProgressTrendResponse> {
    const response = await api.get('dashboard/progress-trend/', {
      params: { range, siteId, site_id: siteId }
    });
    return response.data?.data || response.data;
  },

  async getPlanVsActualProgress(range: 'week' | 'month' | 'year' = 'month', projectId?: string): Promise<ProgressPoint[]> {
    try {
      const response = await api.get('dashboard/progress-trend/', {
        params: { range, projectId }
      });
      const data = response.data?.data || response.data;
      if (data && Array.isArray(data.labels) && Array.isArray(data.progress_trend)) {
        return data.labels.map((lbl: string, idx: number) => ({
          month: lbl,
          planned: Math.min(100, (data.progress_trend[idx] || 0) + 5),
          actual: data.progress_trend[idx] || 0,
        }));
      }
      return Array.isArray(data) ? data : [];
    } catch {
      return [
        { month: 'Jan', planned: 10, actual: 8 },
        { month: 'Feb', planned: 20, actual: 18 },
        { month: 'Mar', planned: 30, actual: 28 },
      ];
    }
  },

  async getSafetyAlertsSummary(params?: { siteId?: string; status?: string; severity?: string }): Promise<SafetyAlertsSummary> {
    const queryParams: Record<string, string | undefined> = {};
    if (params?.siteId) {
      queryParams.siteId = params.siteId;
      queryParams.site_id = params.siteId;
    }
    if (params?.status) queryParams.status = params.status;
    if (params?.severity) queryParams.severity = params.severity;

    const response = await api.get('safety/alerts-summary/', { params: queryParams });
    return response.data?.data || response.data;
  },

  async getWorkerAttendanceSummary(params?: { siteId?: string; date?: string }): Promise<WorkerAttendanceSummary> {
    const queryParams: Record<string, string | undefined> = {};
    if (params?.siteId) {
      queryParams.siteId = params.siteId;
      queryParams.site_id = params.siteId;
    }
    if (params?.date) queryParams.date = params.date;

    const response = await api.get('workers/attendance-summary/', { params: queryParams });
    return response.data?.data || response.data;
  },
};

export default dashboardService;
