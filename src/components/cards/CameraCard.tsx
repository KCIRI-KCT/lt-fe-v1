import type { Camera } from '../../types';

interface CameraCardProps {
  camera: Camera;
  onView?: (id: string) => void;
}

export const CameraCard = ({ camera, onView }: CameraCardProps) => {
  const statusStr = String(camera.status).toLowerCase();
  const isOnline = statusStr === 'online' || statusStr === 'active';
  const statusLabel = isOnline ? 'ONLINE' : 'OFFLINE';
  const statusBadgeClass = isOnline ? 'bg-success text-white' : 'bg-danger text-white';
  const effectiveHealth = isOnline ? (camera.healthScore ?? 95) : 0;
  const healthColor = effectiveHealth >= 80 ? '#22c55e' : effectiveHealth >= 50 ? '#d97706' : '#dc2626';

  return (
    <div className="panel h-100 d-flex flex-column justify-content-between">
      <div>
        <div className="d-flex align-items-start justify-content-between mb-2">
          <div className="d-flex align-items-center gap-2">
            <span className="metric-icon" style={{ background: '#eaf2ff', color: '#2563eb' }}>
              <i className="bi bi-camera-video-fill" aria-hidden="true" />
            </span>
            <div>
              <h6 className="fw-bold mb-0 text-truncate" style={{ maxWidth: '180px' }}>{camera.name}</h6>
              <small className="text-muted">{camera.location || 'Site Camera'}</small>
            </div>
          </div>
          <span className={`badge ${statusBadgeClass}`}>{statusLabel}</span>
        </div>

        <div className="d-flex flex-wrap gap-2 small text-muted mb-3">
          <span><i className="bi bi-geo-alt me-1" />{camera.siteName || 'N/A'}</span>
          <span className="badge text-bg-light border text-uppercase" style={{ fontSize: '10px' }}>{camera.type}</span>
          {camera.lastOnline && (
            <span><i className="bi bi-clock me-1" />{camera.lastOnline}</span>
          )}
        </div>

        {camera.healthScore !== undefined && (
          <div className="d-flex align-items-center gap-2 mb-3">
            <span className="small fw-bold text-muted">Connection Health:</span>
            <div className="progress flex-grow-1" style={{ height: '6px' }}>
              <div
                className="progress-bar"
                style={{ width: `${effectiveHealth}%`, background: healthColor }}
                role="progressbar"
                aria-valuenow={effectiveHealth}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
            <small className="fw-bold" style={{ color: healthColor }}>{effectiveHealth}%</small>
          </div>
        )}
      </div>

      <div className="d-flex align-items-center gap-2 pt-2 border-top">
        {onView && (
          <button
            className="btn btn-sm btn-primary flex-grow-1 d-flex align-items-center justify-content-center gap-1"
            onClick={() => onView(camera.id)}
          >
            <i className="bi bi-play-btn-fill" /> View &amp; Control Stream
          </button>
        )}
      </div>
    </div>
  );
};