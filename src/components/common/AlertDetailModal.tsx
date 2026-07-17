import type { AIAlert } from '../../types';
import { AI_ALERT_CONFIG, SEVERITY_BADGES } from '../../constants';

interface AlertDetailModalProps {
  alert: AIAlert | null;
  onClose: () => void;
}

export const AlertDetailModal = ({ alert, onClose }: AlertDetailModalProps) => {
  if (!alert) return null;

  const config = AI_ALERT_CONFIG[alert.type] || {
    label: alert.type,
    icon: 'bi bi-exclamation-triangle',
    color: '#6b7280',
  };
  const severityBadge = SEVERITY_BADGES[alert.severity] || 'text-bg-secondary';
  const detailMap = new Map((alert.detailFields || []).map((field) => [field.label.toLowerCase(), field.value]));
  const cameraValue = detailMap.get('camera') || (alert.cameraId ? `Camera ${alert.cameraId}` : alert.cameraName || 'N/A');

  const rows = [
    { label: 'Site', value: alert.siteCode || alert.siteName || 'N/A' },
    { label: 'Chainage', value: alert.chainageLabel || alert.chainageId || 'N/A' },
    { label: 'Site Engineer', value: detailMap.get('site engineer') || 'N/A' },
    { label: 'Camera', value: cameraValue },
    { label: 'Date', value: detailMap.get('date') || 'N/A' },
    { label: 'Time', value: detailMap.get('time') || 'N/A' },
  ];

  return (
    <>
      <div className="modal-backdrop fade show" onClick={onClose} />
      <div className="modal fade show d-block" tabIndex={-1} role="dialog" aria-modal="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title d-flex align-items-center gap-2 fw-bold mb-0">
                <i className={config.icon} style={{ color: config.color }} aria-hidden="true" />
                {config.label}
                <span className={`badge ${severityBadge}`}>{alert.severity}</span>
              </h5>
              <button type="button" className="btn-close" aria-label="Close" onClick={onClose} />
            </div>

            <div className="modal-body">
              <p className="mb-2 text-body fw-medium">{alert.description}</p>
              <div className="d-grid gap-2 mt-3">
                {rows.map((row) => (
                  <div key={row.label} className="d-flex justify-content-between gap-3 border-bottom pb-1">
                    <span className="text-muted small">{row.label}</span>
                    <span className="small fw-semibold text-end">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
