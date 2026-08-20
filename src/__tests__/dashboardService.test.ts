import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '../services/api';
import dashboardService from '../services/dashboardService';

vi.mock('../services/api', () => {
  const mockAxios = {
    get: vi.fn(),
    post: vi.fn(),
  };
  return { default: mockAxios };
});

describe('dashboardService API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch dashboard metrics matching LT AMS schema envelope', async () => {
    const mockMetricsEnvelope = {
      data: {
        status: 'success',
        data: {
          total_active_sites: 12,
          total_workers: 350,
          active_workers_today: 298,
          ppe_compliance_avg: 94.5,
          open_alerts_count: 5,
          total_cameras: 48,
        },
      },
    };

    (api.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockMetricsEnvelope);

    const metrics = await dashboardService.getDashboardMetrics();

    expect(api.get).toHaveBeenCalledWith('dashboard/stats/');
    expect(metrics.total_active_sites).toBe(12);
    expect(metrics.active_workers_today).toBe(298);
    expect(metrics.ppe_compliance_avg).toBe(94.5);
  });

  it('should fetch system health via GET /api/health/', async () => {
    (api.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { status: 'success', data: { status: 'healthy' } },
    });

    const health = await dashboardService.getSystemHealth();
    expect(api.get).toHaveBeenCalledWith('health/');
    expect(health).toEqual({ status: 'healthy' });
  });

  it('should fetch progress trend data passing range query parameter', async () => {
    const mockTrendEnvelope = {
      data: {
        status: 'success',
        data: {
          range: 'month',
          labels: ['Jan', 'Feb', 'Mar'],
          progress_trend: [55.0, 58.2, 62.0],
          ppe_compliance_trend: [85.0, 87.2, 88.5],
        },
      },
    };

    (api.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockTrendEnvelope);

    const trend = await dashboardService.getProgressTrend('month');

    expect(api.get).toHaveBeenCalledWith('dashboard/progress-trend/', {
      params: { range: 'month', siteId: undefined, site_id: undefined },
    });
    expect(trend.range).toBe('month');
    expect(trend.labels).toHaveLength(3);
  });

  it('should parse plan vs actual progress from labels and trend array', async () => {
    (api.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        status: 'success',
        data: {
          labels: ['Jan', 'Feb'],
          progress_trend: [40, 50],
        },
      },
    });

    const points = await dashboardService.getPlanVsActualProgress('month', 'proj-1');
    expect(api.get).toHaveBeenCalledWith('dashboard/progress-trend/', {
      params: { range: 'month', projectId: 'proj-1' },
    });
    expect(points).toEqual([
      { month: 'Jan', planned: 45, actual: 40 },
      { month: 'Feb', planned: 55, actual: 50 },
    ]);
  });

  it('should return default fallback array if getPlanVsActualProgress API fails', async () => {
    (api.get as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('API error'));
    const points = await dashboardService.getPlanVsActualProgress('month');
    expect(points).toHaveLength(3);
  });

  it('should fetch safety alerts summary with siteId, status, and severity filters', async () => {
    (api.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        status: 'success',
        data: { total_alerts: 10, open_alerts: 2, critical_count: 1 },
      },
    });

    const summary = await dashboardService.getSafetyAlertsSummary({ siteId: '1', status: 'OPEN', severity: 'HIGH' });

    expect(api.get).toHaveBeenCalledWith('safety/alerts-summary/', {
      params: { siteId: '1', site_id: '1', status: 'OPEN', severity: 'HIGH' },
    });
    expect(summary.total_alerts).toBe(10);
  });

  it('should fetch worker attendance summary by siteId and date', async () => {
    (api.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        status: 'success',
        data: { date: '2026-08-17', total_workers: 50, present_count: 48, attendance_percentage: 96.0 },
      },
    });

    const att = await dashboardService.getWorkerAttendanceSummary({ siteId: '2', date: '2026-08-17' });

    expect(api.get).toHaveBeenCalledWith('workers/attendance-summary/', {
      params: { siteId: '2', site_id: '2', date: '2026-08-17' },
    });
    expect(att.attendance_percentage).toBe(96.0);
  });
});
