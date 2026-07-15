import type { Camera } from '../../types';
import { STATUS_BADGES } from '../../constants';

interface CameraCardProps {
  camera: Camera;
  onView?: (id: string) => void;
  onToggle?: (id: string) => void;
}

export const CameraCard = ({ camera, onView, onToggle }: CameraCardProps) => {
  const statusBadge = STATUS_BADGES[camera.status] || 'text-bg-secondary';
  const healthColor = camera.healthScore && camera.healthScore >= 80 ? '#22c55e' : camera.healthScore && camera.healthScore >= 50 ? '#d97706' : '#dc2626';

  return (
    <div className="panel">
      <div className="d-flex align-items-start justify-content-between mb-3">
        <div className="d-flex align-items-center gap-2">
          <span className="metric-icon" style={{ background: '#eaf2ff', color: '#2563eb' }}>
            <i className="bi bi-camera-video" aria-hidden="true" />
          </span>
          <div>
            <h6 className="fw-bold mb-0">{camera.name}</h6>
            <small className="text-muted">{camera.location}</small>
          </div>
        </div>
        <span className={`badge ${statusBadge}`}>{camera.status}</span>
      </div>

      <div className="d-flex flex-wrap gap-3 small text-muted mb-3">
        <span><i className="bi bi-geo-alt me-1" />{camera.siteName || 'N/A'}</span>
        <span><i className="bi bi-camera me-1" />{camera.type}</span>
        {camera.lastOnline && (
          <span><i className="bi bi-clock me-1" />{camera.lastOnline}</span>
        )}
      </div>

      {camera.healthScore !== undefined && (
        <div className="d-flex align-items-center gap-2 mb-3">
          <span className="small fw-bold">Health:</span>
          <div className="progress flex-grow-1" style={{ height: '6px' }}>
            <div
              className="progress-bar"
              style={{ width: `${camera.healthScore}%`, background: healthColor }}
              role="progressbar"
              aria-valuenow={camera.healthScore}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          <small className="fw-bold" style={{ color: healthColor }}>{camera.healthScore}%</small>
        </div>
      )}

      {camera.rtspUrl && (
        <div className="small text-muted mb-3">
          <i className="bi bi-link-45deg me-1" />
          <code className="small">{camera.rtspUrl}</code>
        </div>
      )}

      <div className="d-flex gap-2">
        {onView && (
          <button className="btn btn-sm btn-outline-secondary flex-grow-1" onClick={() => onView(camera.id)}>
            <i className="bi bi-eye me-1" />View Stream
          </button>
        )}
        {onToggle && (
          <button className="btn btn-sm btn-outline-primary" onClick={() => onToggle(camera.id)}>
            <i className={`bi ${camera.status === 'online' ? 'bi-pause-circle' : 'bi-play-circle'}`} />
          </button>
        )}
      </div>
    </div>
  );
};