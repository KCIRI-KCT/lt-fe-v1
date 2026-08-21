import type { AIAlert } from '../../types';
import { AI_ALERT_CONFIG, SEVERITY_BADGES } from '../../constants';

interface AlertDetailModalProps {
  alert: AIAlert | null;
  onClose: () => void;
  onResolve?: (id: string) => void;
}

export const AlertDetailModal = ({ alert, onClose, onResolve }: AlertDetailModalProps) => {
  if (!alert) return null;

  const config = AI_ALERT_CONFIG[alert.type] || {
    label: alert.type,
    icon: 'bi bi-exclamation-triangle',
    color: '#6b7280',
  };
  const severityKey = (alert.severity || 'critical').toLowerCase();
  const severityBadge = SEVERITY_BADGES[severityKey] || SEVERITY_BADGES[alert.severity] || 'text-bg-secondary';
  const detailMap = new Map((alert.detailFields || []).map((field) => [field.label.toLowerCase(), field.value]));
  const cameraValue = alert.cameraName || detailMap.get('camera') || (alert.cameraId ? `Camera #${alert.cameraId}` : 'N/A');

  const rows = [
    { label: 'Alert ID', value: `#${alert.id}` },
    { label: 'Violation Type', value: config.label },
    { label: 'Severity Level', value: alert.severity ? alert.severity.toUpperCase() : 'CRITICAL' },
    { label: 'Current Status', value: alert.status ? alert.status.toUpperCase() : 'OPEN' },
    { label: 'Site / Location', value: alert.siteCode || alert.siteName || 'N/A' },
    { label: 'Chainage Corridor', value: alert.chainageLabel || alert.chainageId || 'N/A' },
    { label: 'Camera Telemetry', value: cameraValue },
    { label: 'Timestamp (ISO)', value: alert.timestamp ? new Date(alert.timestamp).toLocaleString('en-IN') : 'N/A' },
    { label: 'Assigned Engineer', value: alert.assignedTo || 'Unassigned' },
    { label: 'Acknowledged By', value: alert.acknowledgedBy || 'Pending' },
  ];

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1050 }} onClick={onClose} />
      <div className="modal fade show d-block" style={{ zIndex: 1055 }} tabIndex={-1} role="dialog" aria-modal="true">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content border-0 shadow-lg overflow-hidden">
            
            {/* Modal Header */}
            <div className="modal-header bg-dark text-white p-3">
              <h5 className="modal-title d-flex align-items-center gap-2 fw-bold mb-0 text-white" style={{ fontSize: '16px' }}>
                <i className={config.icon} style={{ color: config.color }} aria-hidden="true" />
                {config.label}
                <span className={`badge ${severityBadge} text-uppercase`} style={{ fontSize: '10px' }}>{alert.severity}</span>
                <span className="badge bg-secondary font-monospace" style={{ fontSize: '10px' }}>#{alert.id}</span>
              </h5>
              <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={onClose} />
            </div>

            <div className="modal-body p-4 bg-light-subtle">
              
              {/* High-Resolution Snapshot Preview with Timestamp Overlay */}
              {alert.snapshot ? (
                <div className="position-relative rounded overflow-hidden shadow-sm mb-4 bg-dark" style={{ minHeight: '260px', maxHeight: '420px' }}>
                  <img 
                    src={alert.snapshot} 
                    alt={config.label}
                    className="w-100 h-100 object-fit-contain d-block"
                  />
                  {/* Camera Timestamp Overlay */}
                  <div className="position-absolute bottom-0 start-0 w-100 p-2 bg-dark bg-opacity-75 text-white d-flex justify-content-between align-items-center font-monospace" style={{ fontSize: '11px' }}>
                    <span><i className="bi bi-camera-video-fill text-danger me-1.5" />CAM: {cameraValue}</span>
                    <span><i className="bi bi-clock-fill text-warning me-1.5" />{new Date(alert.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              ) : (
                <div className="rounded p-4 text-center bg-white border mb-4">
                  <i className="bi bi-camera-video-off fs-1 text-muted d-block mb-2" />
                  <span className="text-muted small">No snapshot image payload attached to this alert detection.</span>
                </div>
              )}

              {/* Description Alert Header */}
              <div className="alert alert-warning border-warning d-flex align-items-center gap-2 mb-4 py-2 px-3">
                <i className="bi bi-exclamation-triangle-fill fs-5 text-warning flex-shrink-0" />
                <div className="small fw-semibold text-dark">{alert.description}</div>
              </div>

              {/* Telemetry Grid */}
              <h6 className="fw-bold text-uppercase text-muted mb-3" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>
                AI Telemetry & Location Attributes
              </h6>
              <div className="row g-2">
                {rows.map((row) => (
                  <div key={row.label} className="col-12 col-md-6">
                    <div className="p-2.5 bg-white border rounded d-flex justify-content-between align-items-center gap-2">
                      <span className="text-muted small fw-medium">{row.label}</span>
                      <span className="small fw-semibold text-dark text-truncate font-monospace" style={{ maxWidth: '180px' }}>
                        {row.value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer bg-white border-top p-3 d-flex justify-content-between align-items-center">
              <span className="small text-muted font-monospace">L&T AMS AI Detection Engine v2.4</span>
              <div className="d-flex gap-2">
                <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onClose}>
                  Close
                </button>
                {onResolve && alert.status !== 'resolved' && (
                  <button 
                    type="button" 
                    className="btn btn-success btn-sm d-flex align-items-center gap-1"
                    onClick={() => {
                      onResolve(alert.id);
                      onClose();
                    }}
                  >
                    <i className="bi bi-check-circle-fill" /> Resolve Alert
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};
