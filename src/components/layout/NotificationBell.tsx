// ============================================================================
// NotificationBell — global notification drawer (top navigation bar)
// ----------------------------------------------------------------------------
// Two-tab segmented view replacing legacy PPE notifications:
//
// - "Camera Alerts": GET /api/v1/logs/?is_alert=true&severity=CRITICAL +
//   GET /api/ai-alerts/ → click navigates to /cameras or /cameras/{camera_id}.
// - "System": GET /api/messages/?is_read=false → click marks read via
//   PATCH /api/messages/{message_id}/ { is_read: true }.
//
// No hooks, listeners, or references to /api/ppe-notifications/ or
// /api/ppe-acknowledgements/ exist in this component.
// ============================================================================

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useApp } from '../../hooks/useApp';
import { useNotificationBell } from '../../hooks/useNotificationBell';
import type { CameraNotification, SystemNotification } from '../../services/notificationService';

type BellTab = 'camera' | 'system';

const SEVERITY_BADGE: Record<string, { label: string; background: string; color: string }> = {
  critical: { label: 'CRITICAL', background: '#fee2e2', color: '#dc2626' },
  high: { label: 'HIGH', background: '#fef9c3', color: '#d97706' },
  medium: { label: 'MEDIUM', background: '#eff6ff', color: '#2563eb' },
  low: { label: 'LOW', background: '#f3f4f6', color: '#6b7280' },
};

const PRIORITY_BADGE: Record<string, { label: string; background: string; color: string }> = {
  urgent: { label: 'URGENT', background: '#fee2e2', color: '#dc2626' },
  high: { label: 'HIGH', background: '#fee2e2', color: '#dc2626' },
  medium: { label: 'MEDIUM', background: '#eff6ff', color: '#2563eb' },
  normal: { label: 'NORMAL', background: '#eff6ff', color: '#2563eb' },
  low: { label: 'LOW', background: '#f3f4f6', color: '#6b7280' },
};

const formatTime = (timestamp: string): string => {
  const ms = new Date(timestamp).getTime();
  if (Number.isNaN(ms)) return 'Live';
  const diffMin = Math.max(1, Math.floor((Date.now() - ms) / 60000));
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const hours = Math.floor(diffMin / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const CameraAlertRow = ({ alert }: { alert: CameraNotification }) => {
  const badge = SEVERITY_BADGE[alert.severity] || SEVERITY_BADGE.high;
  return (
    <Link
      className="dropdown-item py-1.5 px-2 rounded hover-bg-light border-bottom border-light text-wrap"
      to={alert.route}
      style={{ fontSize: '0.8rem' }}
    >
      <div className="d-flex align-items-start justify-content-between gap-1">
        <div className="fw-semibold text-truncate" style={{ maxWidth: '180px' }}>
          {alert.cameraName}
        </div>
        <span
          className="badge"
          style={{ fontSize: '9px', background: badge.background, color: badge.color }}
        >
          {badge.label}
        </span>
      </div>
      <small className="text-muted d-block mt-0.5" style={{ fontSize: '11px' }}>
        {alert.type.replace(/_/g, ' ').toUpperCase()} • {alert.siteName}
      </small>
      <div className="d-flex align-items-center justify-content-between mt-0.5">
        {alert.snapshot ? (
          <img
            src={alert.snapshot}
            alt=""
            style={{ width: '48px', height: '28px', objectFit: 'cover', borderRadius: '4px' }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <span />
        )}
        <span className="badge bg-light text-muted font-monospace" style={{ fontSize: '9.5px' }}>
          {formatTime(alert.timestamp)}
        </span>
      </div>
    </Link>
  );
};

const SystemMessageRow = ({
  message,
  onOpen,
}: {
  message: SystemNotification;
  onOpen: (message: SystemNotification) => void;
}) => {
  const badge = PRIORITY_BADGE[message.priority] || PRIORITY_BADGE.normal;
  return (
    <button
      type="button"
      className="dropdown-item py-1.5 px-2 rounded hover-bg-light border-bottom border-light text-wrap text-start w-100"
      style={{ fontSize: '0.8rem', border: 'none', background: 'transparent', cursor: 'pointer' }}
      onClick={() => onOpen(message)}
    >
      <div className="d-flex align-items-start justify-content-between gap-1">
        <div className="fw-semibold text-truncate" style={{ maxWidth: '180px' }}>
          {message.subject}
        </div>
        <span
          className="badge"
          style={{ fontSize: '9px', background: badge.background, color: badge.color }}
        >
          {badge.label}
        </span>
      </div>
      <small className="text-muted d-block mt-0.5 text-truncate" style={{ fontSize: '11px' }}>
        {message.content || 'No preview available'}
      </small>
      <div className="d-flex align-items-center justify-content-between mt-0.5">
        <small className="text-muted" style={{ fontSize: '10px' }}>
          <i className="bi bi-person me-1" />
          {message.senderUsername}
        </small>
        <span className="badge bg-light text-muted font-monospace" style={{ fontSize: '9.5px' }}>
          {formatTime(message.timestamp)}
        </span>
      </div>
    </button>
  );
};

export const NotificationBell = () => {
  const [tab, setTab] = useState<BellTab>('camera');
  const navigate = useNavigate();
  // System (message) notifications are admin-only. All other roles
  // (project_manager, site_engineer, site_supervisor, safety_manager,
  // safety_officer) receive camera alerts only.
  const { user } = useApp();
  const isAdmin = user?.role === 'admin';
  const {
    cameraAlerts,
    systemMessages,
    unreadCount,
    activeCameraCount,
    unreadSystemCount,
    loading,
    refreshing,
    error,
    isUnauthorized,
    bellShake,
    refresh,
    clearCameraAlerts,
    markSystemRead,
  } = useNotificationBell(undefined, { includeSystem: isAdmin });

  const handleSystemOpen = async (message: SystemNotification) => {
    await markSystemRead(message.messageId);
    navigate('/messages');
  };

  return (
    <div className="dropdown">
      <button
        className="icon-button d-flex align-items-center justify-content-center position-relative"
        type="button"
        data-bs-toggle="dropdown"
        data-bs-auto-close="outside"
        aria-expanded="false"
        aria-label="Notifications"
      >
        {unreadCount > 0 && (
          <>
            <span
              className="notification-dot notification-dot-pulse"
              style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                background: '#dc2626',
                width: '9px',
                height: '9px',
                borderRadius: '50%',
                border: '1.5px solid #fff',
              }}
            />
            <span
              style={{
                position: 'absolute',
                top: '-2px',
                right: '-4px',
                background: '#dc2626',
                color: '#fff',
                fontSize: '9px',
                fontWeight: 700,
                borderRadius: '10px',
                padding: '1px 4px',
                lineHeight: 1.4,
                minWidth: '16px',
                textAlign: 'center',
                border: '1.5px solid #fff',
              }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </>
        )}
        <span className={bellShake ? 'bell-shake' : ''}>
          <Bell size={18} />
        </span>
      </button>

      <div
        className="dropdown-menu dropdown-menu-end notification-menu p-3 shadow-lg"
        style={{ width: '360px', maxHeight: '480px', overflowY: 'auto', borderRadius: '12px' }}
      >
        <div className="d-flex align-items-center justify-content-between border-bottom pb-2 mb-2 px-0">
          <span className="dropdown-header fw-bold text-body p-0 m-0">Notifications</span>
          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="btn btn-link btn-xs text-muted p-0 text-decoration-none"
              style={{ fontSize: '11.5px' }}
              onClick={refresh}
              disabled={refreshing}
              title="Refresh notifications"
            >
              <i className={`bi bi-arrow-clockwise${refreshing ? ' fa-spin' : ''}`} />
            </button>
            {tab === 'camera' && cameraAlerts.length > 0 && (
              <button
                type="button"
                className="btn btn-link btn-xs text-primary p-0 text-decoration-none fw-semibold"
                style={{ fontSize: '11.5px' }}
                onClick={clearCameraAlerts}
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Segmented two-tab view (System tab is admin-only) */}
        {isAdmin ? (
          <div className="btn-group w-100 mb-2" role="tablist" aria-label="Notification streams">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'camera'}
            className={`btn btn-sm ${tab === 'camera' ? 'btn-primary' : 'btn-outline-secondary'}`}
            style={{ fontSize: '12px' }}
            onClick={() => setTab('camera')}
          >
            Camera Alerts
            {activeCameraCount > 0 && (
              <span className="badge bg-danger ms-1" style={{ fontSize: '9px' }}>
                {activeCameraCount}
              </span>
            )}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'system'}
            className={`btn btn-sm ${tab === 'system' ? 'btn-primary' : 'btn-outline-secondary'}`}
            style={{ fontSize: '12px' }}
            onClick={() => setTab('system')}
          >
            System
            {unreadSystemCount > 0 && (
              <span className="badge bg-danger ms-1" style={{ fontSize: '9px' }}>
                {unreadSystemCount}
              </span>
            )}
          </button>
          </div>
        ) : (
          <div className="mb-2 px-0">
            <span className="small fw-bold text-muted text-uppercase" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>
              Camera Alerts
              {activeCameraCount > 0 && (
                <span className="badge bg-danger ms-1" style={{ fontSize: '9px' }}>
                  {activeCameraCount}
                </span>
              )}
            </span>
          </div>
        )}

        {isUnauthorized ? (
          <div className="alert alert-warning py-2 px-2 mb-0" style={{ fontSize: '12px' }}>
            <i className="bi bi-lock-fill me-1" />
            {error || 'Session expired. Please sign in again.'}
          </div>
        ) : error ? (
          <div className="alert alert-danger py-2 px-2 mb-2" style={{ fontSize: '12px' }}>
            <i className="bi bi-exclamation-triangle-fill me-1" />
            {error}{' '}
            <button type="button" className="btn btn-link btn-xs p-0" onClick={refresh}>
              Retry
            </button>
          </div>
        ) : null}

        {loading ? (
          <div className="d-grid gap-2" aria-busy="true" aria-label="Loading notifications">
            {[0, 1, 2].map((i) => (
              <div key={i} className="placeholder-glow">
                <span className="placeholder col-7" />
                <span className="placeholder col-10" />
              </div>
            ))}
          </div>
        ) : tab === 'camera' || !isAdmin ? (
          cameraAlerts.length === 0 ? (
            <div className="text-center py-4 text-muted">
              <i className="bi bi-camera-video fs-4 mb-2 d-block opacity-25" />
              <div className="small fw-semibold">No active camera alerts</div>
              <div className="text-muted" style={{ fontSize: '11px' }}>
                Critical camera events will appear here
              </div>
            </div>
          ) : (
            <div className="d-grid gap-2" role="tabpanel" aria-label="Camera alerts">
              {cameraAlerts.map((alert) => (
                <CameraAlertRow key={alert.id} alert={alert} />
              ))}
            </div>
          )
        ) : systemMessages.length === 0 ? (
          <div className="text-center py-4 text-muted">
            <i className="bi bi-chat-dots fs-4 mb-2 d-block opacity-25" />
            <div className="small fw-semibold">No system notifications</div>
            <div className="text-muted" style={{ fontSize: '11px' }}>
              Unread messages from the system will appear here
            </div>
          </div>
        ) : (
          <div className="d-grid gap-2" role="tabpanel" aria-label="System notifications">
            {systemMessages.map((message) => (
              <SystemMessageRow key={message.id} message={message} onOpen={handleSystemOpen} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationBell;
