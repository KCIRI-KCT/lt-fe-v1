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
  const statusNormalized = (alert.status || 'open').toLowerCase();

  return (
    <div className="card mb-3 border-0 shadow-sm overflow-hidden" style={{ borderLeft: `5px solid ${config.color}` }}>
      <div className="card-body p-3">
        <div className="d-flex flex-column flex-md-row align-items-start gap-3">
          
          {/* Base64 / URL Snapshot Preview Thumbnail */}
          {alert.snapshot ? (
            <div 
              className="position-relative flex-shrink-0 rounded overflow-hidden cursor-pointer group shadow-xs" 
              style={{ width: '100px', height: '70px', background: '#000' }}
              onClick={() => onView?.(alert.id)}
            >
              <img 
                src={alert.snapshot} 
                alt={config.label}
                className="w-100 h-100 object-fit-cover opacity-90 hover-opacity-100 transition-all"
              />
              <div className="position-absolute bottom-0 start-0 w-100 p-1 text-center bg-dark bg-opacity-75 text-white fw-semibold" style={{ fontSize: '9px' }}>
                <i className="bi bi-camera-fill me-1" />Preview
              </div>
            </div>
          ) : (
            <div 
              className="flex-shrink-0 rounded d-flex align-items-center justify-content-center"
              style={{ width: '48px', height: '48px', background: `${config.color}18`, color: config.color }}
            >
              <i className={config.icon} aria-hidden="true" style={{ fontSize: '22px' }} />
            </div>
          )}

          {/* Alert Telemetry Details */}
          <div className="flex-grow-1 min-width-0">
            <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
              <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '15px' }}>{config.label}</h6>
              <span className="badge bg-light text-secondary border font-monospace" style={{ fontSize: '10px' }}>#{alert.id}</span>
              <span className={`badge text-uppercase ${severityBadge}`} style={{ fontSize: '10px' }}>{severityKey}</span>
              <span className={`badge ${statusNormalized === 'open' ? 'text-bg-danger' : statusNormalized === 'acknowledged' ? 'text-bg-warning text-dark' : 'text-bg-success'}`} style={{ fontSize: '10px' }}>
                {statusNormalized}
              </span>
            </div>

            <p className="text-muted small mb-2 text-truncate-2" style={{ fontSize: '13px' }}>{alert.description}</p>

            <div className="d-flex flex-wrap align-items-center gap-3 text-muted" style={{ fontSize: '12px' }}>
              {alert.cameraName && <span className="fw-medium text-dark"><i className="bi bi-camera-video me-1 text-primary" />{alert.cameraName}</span>}
              <span><i className="bi bi-geo-alt me-1 text-danger" />{locationLabel}</span>
              {chainageLabel && <span><i className="bi bi-signpost-split me-1 text-info" />{chainageLabel}</span>}
              <span><i className="bi bi-clock me-1 text-secondary" />{timeAgo}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="d-flex flex-wrap gap-2 mt-2 mt-md-0 ms-md-auto align-self-stretch align-self-md-center justify-content-end">
            {onView && (
              <button className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1" onClick={() => onView(alert.id)}>
                <i className="bi bi-eye-fill" /> View Detail
              </button>
            )}

            {(statusNormalized === 'open' || statusNormalized === 'new') && onAcknowledge && (
              <button className="btn btn-sm btn-outline-warning text-dark d-flex align-items-center gap-1" onClick={() => onAcknowledge(alert.id, alert)}>
                <i className="bi bi-shield-check" /> Acknowledge
              </button>
            )}

            {(statusNormalized === 'acknowledged' || statusNormalized === 'open' || statusNormalized === 'new') && (
              <button
                className="btn btn-sm btn-success d-flex align-items-center gap-1"
                onClick={() => (onSolve ? onSolve(alert.id) : onResolve?.(alert.id))}
              >
                <i className="bi bi-check-circle-fill" /> Resolve Violation
              </button>
            )}

            {statusNormalized === 'resolved' && (
              <span className="badge text-bg-success-subtle text-success border border-success d-flex align-items-center gap-1 py-1.5 px-3">
                <i className="bi bi-check-all fs-6" /> Resolved
              </span>
            )}
          </div>
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
