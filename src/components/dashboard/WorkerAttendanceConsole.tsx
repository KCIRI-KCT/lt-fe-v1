// ============================================================================
// Worker Attendance Console — real API driven (workers/attendance-summary/)
// ----------------------------------------------------------------------------
// Shows live attendance stats for the active project/site scope. No mock
// worker records, no fabricated trends, wages, or stub export actions.
// ============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import { Users, UserCheck, UserX, Clock } from 'lucide-react';
import { dashboardService, type WorkerAttendanceSummary } from '../../services/dashboardService';

interface WorkerAttendanceConsoleProps {
  selectedProject: string;
  selectedSite: string;
  selectedChainage: string;
  userRole?: string;
  siteId?: string;
}

const todayLabel = (): string => new Date().toISOString().slice(0, 10);

const toNumber = (value: unknown): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

const normalizeSummary = (raw: unknown): WorkerAttendanceSummary | null => {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  return {
    date: String(r.date ?? todayLabel()),
    total_workers: toNumber(r.total_workers ?? r.totalWorkers),
    present_count: toNumber(r.present_count ?? r.presentCount ?? r.active_workers_today),
    absent_count: toNumber(r.absent_count ?? r.absentCount),
    late_count: toNumber(r.late_count ?? r.lateCount),
    attendance_percentage: toNumber(r.attendance_percentage ?? r.attendancePercentage),
    site_id: (r.site_id ?? r.siteId) as string | number | undefined,
  };
};

export const WorkerAttendanceConsole: React.FC<WorkerAttendanceConsoleProps> = ({
  selectedProject,
  selectedSite,
  selectedChainage,
  siteId,
}) => {
  const [summary, setSummary] = useState<WorkerAttendanceSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    try {
      const raw = await dashboardService.getWorkerAttendanceSummary({
        siteId,
        date: todayLabel(),
      });
      const normalized = normalizeSummary(raw);
      if (!normalized) {
        setError('No attendance data returned for this scope.');
        setSummary(null);
      } else {
        setError(null);
        setSummary(normalized);
      }
    } catch {
      setError('Unable to load attendance data. Check your connection and retry.');
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [siteId]);

  useEffect(() => {
    let isMounted = true;
    const runFetch = async () => {
      await fetchSummary();
    };
    runFetch().catch(() => {
      if (isMounted) setError('Unable to load attendance data. Check your connection and retry.');
    });
    return () => {
      isMounted = false;
    };
  }, [fetchSummary]);

  const scopeLabel = selectedChainage
    ? `Chainage: ${selectedChainage}`
    : selectedSite
      ? `Site: ${selectedSite}`
      : selectedProject
        ? `Project: ${selectedProject}`
        : 'Enterprise Wide';

  const attendanceRate = summary?.attendance_percentage ?? 0;
  const isHealthy = attendanceRate >= 90;

  return (
    <div className="col-12 col-lg-6">
      <div
        className="card border-0 shadow-sm p-3 p-md-4 bg-white h-100 d-flex flex-column"
        style={{ minHeight: '320px', borderRadius: '12px' }}
      >
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-3">
          <div className="d-flex align-items-center gap-2">
            <Users className="text-primary" size={20} />
            <div>
              <h3 className="h6 mb-0 fw-bold">Worker Attendance Console</h3>
              <small className="text-muted" style={{ fontSize: '11px' }}>
                {scopeLabel} • {summary?.date || todayLabel()}
              </small>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm py-1 px-2"
            style={{ fontSize: '11px', borderRadius: '6px' }}
            onClick={fetchSummary}
            disabled={loading}
            title="Refresh attendance"
          >
            <i className={`bi bi-arrow-clockwise${loading ? ' fa-spin' : ''}`} />
          </button>
        </div>

        {loading ? (
          <div className="d-grid gap-2 flex-grow-1" aria-busy="true" aria-label="Loading attendance">
            <div className="placeholder-glow">
              <span className="placeholder col-5" />
              <span className="placeholder col-8" />
              <span className="placeholder col-6" />
            </div>
          </div>
        ) : error ? (
          <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center text-center py-4">
            <i className="bi bi-cloud-slash text-muted fs-4 mb-2" />
            <p className="text-muted small mb-2">{error}</p>
            <button
              type="button"
              className="btn btn-sm btn-outline-primary"
              onClick={fetchSummary}
            >
              Retry
            </button>
          </div>
        ) : summary ? (
          <div className="row g-3 flex-grow-1">
            <div className="col-6">
              <div className="p-3 border rounded bg-light-subtle h-100">
                <div className="d-flex align-items-center gap-2 text-muted small mb-1">
                  <UserCheck size={14} className="text-primary" />
                  <span>Attendance Rate</span>
                </div>
                <div className={`h4 fw-bold mb-0 ${isHealthy ? 'text-success' : 'text-warning'}`}>
                  {attendanceRate.toFixed(1)}%
                </div>
                <small className="text-muted">
                  {summary.present_count} of {summary.total_workers} present
                </small>
              </div>
            </div>
            <div className="col-6">
              <div className="p-3 border rounded bg-light-subtle h-100">
                <div className="d-flex align-items-center gap-2 text-muted small mb-1">
                  <UserCheck size={14} className="text-success" />
                  <span>Present</span>
                </div>
                <div className="h4 fw-bold mb-0 text-success">{summary.present_count}</div>
                <small className="text-muted">Checked in today</small>
              </div>
            </div>
            <div className="col-6">
              <div className="p-3 border rounded bg-light-subtle h-100">
                <div className="d-flex align-items-center gap-2 text-muted small mb-1">
                  <UserX size={14} className="text-danger" />
                  <span>Absent</span>
                </div>
                <div className="h4 fw-bold mb-0 text-danger">{summary.absent_count}</div>
                <small className="text-muted">Not checked in</small>
              </div>
            </div>
            <div className="col-6">
              <div className="p-3 border rounded bg-light-subtle h-100">
                <div className="d-flex align-items-center gap-2 text-muted small mb-1">
                  <Clock size={14} className="text-warning" />
                  <span>Late Arrivals</span>
                </div>
                <div className="h4 fw-bold mb-0 text-warning">{summary.late_count}</div>
                <small className="text-muted">After shift start</small>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-grow-1 d-flex align-items-center justify-content-center text-center py-4">
            <p className="text-muted small mb-0">No attendance records for this scope.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkerAttendanceConsole;
