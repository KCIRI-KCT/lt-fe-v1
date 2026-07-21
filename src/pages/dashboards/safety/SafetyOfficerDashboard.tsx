// ============================================================================
// Safety Officer Dashboard
// Purpose: Displays PPE violation notifications that are acknowledged by
//          Project Manager, Site Manager, Site Engineer, and Safety Manager.
//          Safety Officer can view details and resolve through PPE HITL.
//
// Flow: Acknowledger acknowledges → Notification sent here → Safety Officer resolves
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../../hooks/useApp';
import { MobilePageWrapper } from '../../../components/common/MobilePageWrapper';
import {
  getAllPPENotifications,
  updatePPENotificationStatus,
  getPendingPPENotifications,
} from '../../../services/ppeNotificationService';
import type { PPENotification } from '../../../types';

// ============================================================================
// Helper: Format date for display
// ============================================================================
const formatDate = (iso: string): string => {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
};

// ============================================================================
// Helper: Get status badge class
// ============================================================================
const getStatusBadge = (status: PPENotification['status']): string => {
  const map: Record<string, string> = {
    pending_review: 'text-bg-warning',
    in_progress: 'text-bg-info',
    resolved: 'text-bg-success',
  };
  return map[status] || 'text-bg-secondary';
};

// ============================================================================
// Helper: Get status label
// ============================================================================
const getStatusLabel = (status: PPENotification['status']): string => {
  const map: Record<string, string> = {
    pending_review: 'Pending Review',
    in_progress: 'In Progress',
    resolved: 'Resolved',
  };
  return map[status] || status;
};

// ============================================================================
// Time ago helper
// ============================================================================
const getTimeAgo = (timestamp: string): string => {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

// ============================================================================
// Main Component
// ============================================================================
export const SafetyOfficerDashboard = () => {
  const navigate = useNavigate();
  const { user, theme } = useApp();
  const isDark = theme === 'dark';

  const [notifications, setNotifications] = useState<PPENotification[]>(() => getAllPPENotifications());
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Refresh notifications from storage
  const refreshNotifications = useCallback(() => {
    const updated = getAllPPENotifications();
    setNotifications(updated);
  }, []);

  // Poll for new notifications every 5 seconds
  useEffect(() => {
    const interval = setInterval(refreshNotifications, 5000);
    return () => clearInterval(interval);
  }, [refreshNotifications]);

  // Filter notifications
  const filteredNotifications = statusFilter === 'all'
    ? notifications
    : notifications.filter((n) => n.status === statusFilter);

  // Stats
  const pendingCount = getPendingPPENotifications().length;
  const inProgressCount = notifications.filter((n) => n.status === 'in_progress').length;
  const resolvedCount = notifications.filter((n) => n.status === 'resolved').length;

  // Mark as in-progress
  const handleMarkInProgress = (notif: PPENotification) => {
    updatePPENotificationStatus(notif.id, 'in_progress', user || undefined);
    refreshNotifications();
  };

  // Navigate to HITL for resolution
  const handleResolve = (notif: PPENotification) => {
    navigate(`/ai-monitoring?resolveAlert=${notif.alertId}`);
  };

  return (
    <MobilePageWrapper>
      {/* Page Header */}
      <div className="page-heading mb-4">
        <div className="page-heading-copy">
          <span className="page-icon">
            <i className="bi bi-shield-fill-check text-success" aria-hidden="true" />
          </span>
          <div>
            <p className="eyebrow mb-1">Safety Engineer</p>
            <h1 className="h3 mb-1">PPE Violation Notifications</h1>
            <p className="text-muted mb-0">
              Review and resolve PPE violations acknowledged by Project Managers, Site Engineers, Site Supervisors, and Safety Managers.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-md-3">
          <div className={`card border-0 shadow-sm h-100 ${isDark ? 'bg-dark text-white' : ''}`}>
            <div className="card-body d-flex align-items-center gap-3">
              <div className="rounded-circle bg-warning bg-opacity-15 p-3 d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                <i className="bi bi-clock-history fs-5 text-warning" />
              </div>
              <div>
                <h6 className={`fw-bold mb-0 ${isDark ? 'text-white' : 'text-dark'}`}>{pendingCount}</h6>
                <small className="text-muted">Pending Review</small>
              </div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-md-3">
          <div className={`card border-0 shadow-sm h-100 ${isDark ? 'bg-dark text-white' : ''}`}>
            <div className="card-body d-flex align-items-center gap-3">
              <div className="rounded-circle bg-info bg-opacity-15 p-3 d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                <i className="bi bi-arrow-repeat fs-5 text-info" />
              </div>
              <div>
                <h6 className={`fw-bold mb-0 ${isDark ? 'text-white' : 'text-dark'}`}>{inProgressCount}</h6>
                <small className="text-muted">In Progress</small>
              </div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-md-3">
          <div className={`card border-0 shadow-sm h-100 ${isDark ? 'bg-dark text-white' : ''}`}>
            <div className="card-body d-flex align-items-center gap-3">
              <div className="rounded-circle bg-success bg-opacity-15 p-3 d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                <i className="bi bi-check2-all fs-5 text-success" />
              </div>
              <div>
                <h6 className={`fw-bold mb-0 ${isDark ? 'text-white' : 'text-dark'}`}>{resolvedCount}</h6>
                <small className="text-muted">Resolved</small>
              </div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-md-3">
          <div className={`card border-0 shadow-sm h-100 ${isDark ? 'bg-dark text-white' : ''}`}>
            <div className="card-body d-flex align-items-center gap-3">
              <div className="rounded-circle bg-primary bg-opacity-15 p-3 d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                <i className="bi bi-bell fs-5 text-primary" />
              </div>
              <div>
                <h6 className={`fw-bold mb-0 ${isDark ? 'text-white' : 'text-dark'}`}>{notifications.length}</h6>
                <small className="text-muted">Total</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="d-flex flex-wrap gap-2 mb-4">
        {['all', 'pending_review', 'in_progress', 'resolved'].map((s) => (
          <button
            key={s}
            className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setStatusFilter(s)}
          >
            {s === 'all' ? 'All' : getStatusLabel(s as PPENotification['status'])}
            {s === 'pending_review' && pendingCount > 0 && (
              <span className="badge bg-danger ms-1">{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="panel blank-panel">
          <div className="blank-state">
            <i className="bi bi-check2-circle fs-1 text-success mb-3 d-block" />
            <h5 className="fw-bold mb-2">All Clear</h5>
            <p className="text-muted small mb-0">
              No PPE violation notifications {statusFilter !== 'all' ? 'in this status' : ''}.
            </p>
          </div>
        </div>
      ) : (
        <div className="d-grid gap-3">
          {filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className="panel mb-0"
              style={{ borderLeft: `4px solid ${notif.status === 'pending_review' ? '#ffc107' : notif.status === 'in_progress' ? '#0dcaf0' : '#198754'}`, padding: '16px' }}
            >
              <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-3">
                {/* Main content */}
                <div className="flex-grow-1 min-width-0">
                  <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                    <h6 className="fw-bold mb-0 d-flex align-items-center gap-2">
                      <i className="bi bi-shield-slash text-danger" />
                      PPE Violation
                    </h6>
                    <span className={`badge ${getStatusBadge(notif.status)}`}>
                      {getStatusLabel(notif.status)}
                    </span>
                    <span className="small text-muted">
                      <i className="bi bi-clock me-1" />
                      {getTimeAgo(notif.acknowledgedAt)}
                    </span>
                  </div>

                  <div className="mt-2">
                    {/* Acknowledged By info */}
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <i className="bi bi-person-check text-info" />
                      <span className="fw-semibold">{notif.acknowledgedByName}</span>
                      <span className="badge text-bg-light text-dark border">
                        {notif.acknowledgedByRole}
                      </span>
                    </div>

                    {/* Site & Chainage info */}
                    <div className="d-flex flex-wrap gap-3 small text-muted mt-2">
                      <span>
                        <i className="bi bi-geo-alt me-1 text-danger" />
                        Site: <strong>{notif.siteName}</strong>
                      </span>
                      <span>
                        <i className="bi bi-signpost-split me-1 text-warning" />
                        Chainage: <strong>{notif.chainageName}</strong>
                      </span>
                      <span>
                        <i className="bi bi-exclamation-triangle me-1 text-danger" />
                        Violation: <strong>{notif.alertDescription}</strong>
                      </span>
                    </div>

                    <div className="small text-muted mt-2">
                      <i className="bi bi-calendar me-1" />
                      Acknowledged at: {formatDate(notif.acknowledgedAt)}
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="d-flex gap-2 mt-2 mt-md-0 ms-md-auto align-self-start align-self-md-center">
                  {notif.status === 'pending_review' && (
                    <button
                      className="btn btn-sm btn-info text-white"
                      onClick={() => handleMarkInProgress(notif)}
                    >
                      <i className="bi bi-arrow-repeat me-1" />
                      Start Review
                    </button>
                  )}
                  {notif.status !== 'resolved' && (
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() => handleResolve(notif)}
                    >
                      <i className="bi bi-check2-circle me-1" />
                      Resolve via HITL
                    </button>
                  )}
                  {notif.status === 'resolved' && (
                    <span className="badge text-bg-success d-flex align-items-center gap-1 py-2 px-3">
                      <i className="bi bi-check2-all" /> Resolved
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </MobilePageWrapper>
  );
};

export default SafetyOfficerDashboard;
