import type { AIAlert } from '../../types';
import { SEVERITY_BADGES, AI_ALERT_CONFIG } from '../../constants';

interface AIAlertCardProps {
  alert: AIAlert;
  onAcknowledge?: (id: string, alert: AIAlert) => void;
  onResolve?: (id: string) => void;
  onView?: (id: string) => void;
  onSolve?: (id: string) => void;
  userRole?: string;
}

export const AIAlertCard = ({ alert, onAcknowledge, onResolve, onView, onSolve }: AIAlertCardProps) => {
  const config = AI_ALERT_CONFIG[alert.type] || { label: alert.type, icon: 'bi bi-exclamation-triangle', color: '#6b7280' };
  const timeAgo = getTimeAgo(alert.timestamp);
  const severityKey = (alert.severity || 'critical').toLowerCase();
  const severityBadge = SEVERITY_BADGES[severityKey] || SEVERITY_BADGES[alert.severity] || 'text-bg-danger';
  const locationLabel = alert.siteCode || alert.siteName || 'N/A';
  const chainageLabel = alert.chainageLabel || alert.chainageId;

  return (
    <div className="panel mb-3" style={{ borderLeft: `4px solid ${config.color}`, padding: '16px' }}>
      <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-3">
        <div className="d-flex align-items-center gap-3 flex-grow-1 min-width-0">
          <span className="metric-icon" style={{ background: `${config.color}20`, color: config.color, width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}>
            <i className={config.icon} aria-hidden="true" style={{ fontSize: '20px' }} />
          </span>
          <div className="flex-grow-1 min-width-0">
            <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
              <h6 className="fw-bold mb-0">{config.label}</h6>
              <span className={`badge ${severityBadge}`}>{severityKey}</span>
              <span className={`badge ${alert.status === 'new' ? 'text-bg-danger' : alert.status === 'acknowledged' ? 'text-bg-info' : 'text-bg-success'}`}>
                {alert.status}
              </span>
            </div>
            <p className="text-muted small mb-1">{alert.description}</p>
            <div className="d-flex flex-wrap align-items-center gap-3 small text-muted">
              {alert.cameraName && <span><i className="bi bi-camera-video me-1" />{alert.cameraName}</span>}
              <span><i className="bi bi-geo-alt me-1" />{locationLabel}</span>
              {chainageLabel && <span><i className="bi bi-signpost-split me-1" />{chainageLabel}</span>}
              <span><i className="bi bi-clock me-1" />{timeAgo}</span>
            </div>
          </div>
        </div>
        <div className="d-flex gap-2 mt-2 mt-md-0 ms-md-auto align-self-start align-self-md-center">
          {onView && (
            <button className="btn btn-sm btn-outline-secondary" onClick={() => onView(alert.id)}>
              <i className="bi bi-eye me-1" />View
            </button>
          )}

          {alert.status === 'new' && onAcknowledge && (
            <button className="btn btn-sm btn-outline-info" onClick={() => onAcknowledge(alert.id, alert)}>
              <i className="bi bi-check-circle me-1" />Acknowledge
            </button>
          )}

          {(alert.status === 'acknowledged' || alert.status === 'new') && (
            <button
              className="btn btn-sm btn-success"
              onClick={() => (onSolve ? onSolve(alert.id) : onResolve?.(alert.id))}
            >
              <i className="bi bi-check2-circle me-1" />Solve
            </button>
          )}

          {alert.status === 'resolved' && (
            <span className="badge text-bg-success d-flex align-items-center gap-1 py-1.5 px-3">
              <i className="bi bi-check-all" /> Resolved
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

function getTimeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
