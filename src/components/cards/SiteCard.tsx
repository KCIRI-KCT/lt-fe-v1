import type { Site } from '../../types';
import { STATUS_BADGES } from '../../constants';

interface SiteCardProps {
  site: Site;
  onView?: (id: string) => void;
  onManage?: (id: string) => void;
}

export const SiteCard = ({ site, onView, onManage }: SiteCardProps) => {
  const statusBadge = STATUS_BADGES[site.status] || 'text-bg-secondary';
  const safetyColor = site.safetyScore >= 90 ? '#22c55e' : site.safetyScore >= 75 ? '#d97706' : '#dc2626';

  return (
    <div className="panel">
      <div className="d-flex align-items-start justify-content-between mb-3">
        <div>
          <h6 className="fw-bold mb-1">{site.name}</h6>
          <small className="text-muted">{site.code}</small>
        </div>
        <span className={`badge ${statusBadge}`}>{site.status}</span>
      </div>

      <div className="d-flex flex-wrap gap-3 small text-muted mb-3">
        <span><i className="bi bi-geo-alt me-1" />{site.location}</span>
        <span><i className="bi bi-building me-1" />{site.projectName || 'N/A'}</span>
      </div>

      <div className="row g-2 mb-3">
        <div className="col-6">
          <div className="mini-card text-center p-2">
            <span className="small">Workers</span>
            <strong className="fs-6">{site.workerCount}</strong>
          </div>
        </div>
        <div className="col-6">
          <div className="mini-card text-center p-2">
            <span className="small">Cameras</span>
            <strong className="fs-6">{site.activeCameras}</strong>
          </div>
        </div>
        <div className="col-6">
          <div className="mini-card text-center p-2">
            <span className="small">Chainages</span>
            <strong className="fs-6">{site.chainages}</strong>
          </div>
        </div>
        <div className="col-6">
          <div className="mini-card text-center p-2">
            <span className="small">Safety</span>
            <strong className="fs-6" style={{ color: safetyColor }}>{site.safetyScore}%</strong>
          </div>
        </div>
      </div>

      <div className="d-flex gap-2">
        {onView && (
          <button className="btn btn-sm btn-outline-secondary flex-grow-1" onClick={() => onView(site.id)}>
            <i className="bi bi-eye me-1" />View Details
          </button>
        )}
        {onManage && (
          <button className="btn btn-sm btn-primary flex-grow-1" onClick={() => onManage(site.id)}>
            <i className="bi bi-gear me-1" />Manage
          </button>
        )}
      </div>
    </div>
  );
};