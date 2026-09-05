import type { Site } from '../../types';
import { getStatusBadgeClass } from '../../constants';
import { safeValue, safeFormatNumber, safeFormatPercent } from '../../utils/formatUtils';

interface SiteCardProps {
  site: Site;
  onView?: (id: string) => void;
  onManage?: (id: string) => void;
}

export const SiteCard = ({ site, onView, onManage }: SiteCardProps) => {
  const statusBadge = getStatusBadgeClass(site.status);
  const scoreNum = typeof site.safetyScore === 'number' && !isNaN(site.safetyScore) ? site.safetyScore : 0;
  const safetyColor = scoreNum >= 90 ? '#22c55e' : scoreNum >= 75 ? '#d97706' : scoreNum > 0 ? '#dc2626' : '#6b7280';

  return (
    <div className="panel">
      <div className="d-flex align-items-start justify-content-between mb-3">
        <div>
          <h6 className="fw-bold mb-1">{safeValue(site.name, '-')}</h6>
          <small className="text-muted">{safeValue(site.code, '-')}</small>
        </div>
        <span className={`badge ${statusBadge}`}>{safeValue(site.status, 'Active')}</span>
      </div>

      <div className="d-flex flex-wrap gap-3 small text-muted mb-3">
        <span><i className="bi bi-geo-alt me-1" />{safeValue(site.location, '-')}</span>
        <span><i className="bi bi-building me-1" />{safeValue(site.projectName, '-')}</span>
      </div>

      <div className="row g-2 mb-3">
        <div className="col-6">
          <div className="mini-card text-center p-2">
            <span className="small">Workers</span>
            <strong className="fs-6">{safeFormatNumber(site.workerCount, 0, '-')}</strong>
          </div>
        </div>
        <div className="col-6">
          <div className="mini-card text-center p-2">
            <span className="small">Cameras</span>
            <strong className="fs-6">{safeFormatNumber(site.activeCameras, 0, '-')}</strong>
          </div>
        </div>
        <div className="col-6">
          <div className="mini-card text-center p-2">
            <span className="small">Chainages</span>
            <strong className="fs-6">{safeFormatNumber(site.chainages, 0, '-')}</strong>
          </div>
        </div>
        <div className="col-6">
          <div className="mini-card text-center p-2">
            <span className="small">Safety</span>
            <strong className="fs-6" style={{ color: safetyColor }}>{safeFormatPercent(site.safetyScore, '-')}</strong>
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