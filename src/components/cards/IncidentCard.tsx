import type { Incident } from '../../types';
import { SEVERITY_BADGES, STATUS_BADGES } from '../../constants';

interface IncidentCardProps {
  incident: Incident;
  onView?: (id: string) => void;
  onAssign?: (id: string) => void;
  onResolve?: (id: string) => void;
}

const INCIDENT_ICONS: Record<string, string> = {
  safety_violation: 'bi bi-shield-exclamation',
  equipment_failure: 'bi bi-tools',
  structural_issue: 'bi bi-building-gear',
  fire: 'bi bi-fire',
  accident: 'bi bi-person-fill-exclamation',
  near_miss: 'bi bi-exclamation-circle',
  security_breach: 'bi bi-lock-fill',
  environmental: 'bi bi-tree',
  other: 'bi bi-three-dots',
};

export const IncidentCard = ({ incident, onView, onAssign, onResolve }: IncidentCardProps) => {
  const timeAgo = getTimeAgo(incident.reportedAt);
  const icon = INCIDENT_ICONS[incident.type] || 'bi bi-exclamation-triangle';

  return (
    <div className="panel mb-3">
      <div className="d-flex align-items-start gap-3">
        <span className="metric-icon" style={{ background: '#fff4df', color: '#d97706' }}>
          <i className={icon} aria-hidden="true" />
        </span>
        <div className="flex-grow-1 min-width-0">
          <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
            <h6 className="fw-bold mb-0">{incident.title}</h6>
            <span className={`badge ${SEVERITY_BADGES[incident.severity] || 'text-bg-secondary'}`}>{incident.severity}</span>
            <span className={`badge ${STATUS_BADGES[incident.status] || 'text-bg-secondary'}`}>{incident.status}</span>
          </div>
          <p className="text-muted small mb-1">{incident.description}</p>
          <div className="d-flex flex-wrap align-items-center gap-3 small text-muted">
            <span><i className="bi bi-geo-alt me-1" />{incident.siteName || incident.location || 'N/A'}</span>
            {incident.assignedToName && (
              <span><i className="bi bi-person me-1" />{incident.assignedToName}</span>
            )}
            <span><i className="bi bi-clock me-1" />{timeAgo}</span>
            {incident.isAIGenerated && (
              <span className="badge text-bg-info"><i className="bi bi-robot me-1" />AI Generated</span>
            )}
          </div>
          <div className="d-flex gap-2 mt-2">
            {onView && (
              <button className="btn btn-sm btn-outline-secondary" onClick={() => onView(incident.id)}>
                <i className="bi bi-eye me-1" />View
              </button>
            )}
            {incident.status === 'open' && onAssign && (
              <button className="btn btn-sm btn-outline-primary" onClick={() => onAssign(incident.id)}>
                <i className="bi bi-person-plus me-1" />Assign
              </button>
            )}
            {incident.status === 'investigating' && onResolve && (
              <button className="btn btn-sm btn-outline-success" onClick={() => onResolve(incident.id)}>
                <i className="bi bi-check2-all me-1" />Resolve
              </button>
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