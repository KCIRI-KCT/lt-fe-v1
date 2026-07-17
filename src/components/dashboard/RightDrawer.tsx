interface AlertItem {
  id: string;
  title: string;
  time: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

interface RightDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'danger',
  high: 'warning',
  medium: 'primary',
  low: 'secondary',
};

const MOCK_DRAWER_ALERTS: AlertItem[] = [
  { id: '1', title: 'Critical Fall Hazard near Pier 3 scaffolding', time: '2 mins ago', type: 'AI Incident', severity: 'critical' },
  { id: '2', title: 'Unauthorized person entered Piling area', time: '15 mins ago', type: 'PPE Intrusion', severity: 'high' },
  { id: '3', title: 'Dump Truck exceeding speed limit on access road', time: '40 mins ago', type: 'Speed Violation', severity: 'medium' },
  { id: '4', title: 'Daily Compaction Audit report is ready', time: '1 hr ago', type: 'Report Out', severity: 'low' },
  { id: '5', title: 'Concrete Cube strength test pending approval', time: '2 hrs ago', type: 'Quality Check', severity: 'high' },
];

export const RightDrawer = ({ isOpen, onClose }: RightDrawerProps) => {
  return (
    <>
      {/* Backdrop overlay */}
      {isOpen && (
        <div
          className="position-fixed inset-0"
          style={{ background: 'rgba(15, 23, 42, 0.3)', backdropFilter: 'blur(2px)', zIndex: 1070 }}
          onClick={onClose}
        />
      )}

      {/* Sliding Drawer element */}
      <div
        className="position-fixed top-0 end-0 h-100 bg-white shadow-lg border-start d-flex flex-column"
        style={{
          width: '360px',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 1080,
        }}
      >
        {/* Drawer Header */}
        <div className="p-3 bg-light border-bottom d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-primary-subtle text-primary p-1.5 rounded">
              <i className="bi bi-bell-fill" />
            </span>
            <h3 className="h6 mb-0 fw-bold">Notification Center</h3>
          </div>
          <button className="btn-close" onClick={onClose} aria-label="Close drawer" />
        </div>

        {/* Drawer Content */}
        <div className="flex-grow-1 p-3 overflow-y-auto d-flex flex-column gap-4">
          
          {/* Section: Pending Inspections */}
          <div>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="small fw-bold text-muted text-uppercase" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>
                Pending Quality Audits
              </span>
              <span className="badge bg-warning-subtle text-warning border" style={{ fontSize: '8px' }}>Action required</span>
            </div>
            <div className="d-grid gap-1.5">
              <div className="p-2 border rounded bg-light-subtle" style={{ fontSize: '11px' }}>
                <div className="d-flex justify-content-between font-semibold mb-0.5">
                  <span>Cube Strength Test</span>
                  <span className="text-danger">M40 Concrete</span>
                </div>
                <div className="text-muted">Required strength validation for Pier 5 Cap structure.</div>
              </div>
              <div className="p-2 border rounded bg-light-subtle" style={{ fontSize: '11px' }}>
                <div className="d-flex justify-content-between font-semibold mb-0.5">
                  <span>Subgrade compaction audit</span>
                  <span className="text-muted">Chainage 12.5</span>
                </div>
                <div className="text-muted">Proctor density report needs site engineer validation sign-off.</div>
              </div>
            </div>
          </div>

          {/* Section: Recent AI Alerts & Violations */}
          <div>
            <span className="small fw-bold text-muted text-uppercase d-block mb-2" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>
              Real-Time Severity Alerts
            </span>
            <div className="d-grid gap-2">
              {MOCK_DRAWER_ALERTS.map((alert) => {
                const color = SEVERITY_COLORS[alert.severity] || 'secondary';
                return (
                  <div
                    key={alert.id}
                    className="p-2 border-start border-3 rounded-end border-top border-bottom border-end bg-light-subtle d-flex flex-column gap-1"
                    style={{
                      borderLeftColor: `var(--admin-${color})`,
                      fontSize: '11px',
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-start gap-1">
                      <span className="fw-semibold text-body">{alert.title}</span>
                      <span className={`badge bg-${color}-subtle text-${color} border border-${color}-subtle`} style={{ fontSize: '8px' }}>
                        {alert.type}
                      </span>
                    </div>
                    <div className="text-muted text-end" style={{ fontSize: '9px' }}>
                      <i className="bi bi-clock me-1" />
                      {alert.time}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section: Recent Automated Reports */}
          <div>
            <span className="small fw-bold text-muted text-uppercase d-block mb-2" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>
              Latest Generated Reports
            </span>
            <div className="d-grid gap-1.5">
              <div className="d-flex align-items-center justify-content-between p-2 rounded border bg-light-subtle" style={{ fontSize: '11px' }}>
                <span className="d-flex align-items-center gap-1.5">
                  <i className="bi bi-file-earmark-pdf text-danger" />
                  Daily_Safety_Audit_CH05.pdf
                </span>
                <button
                  className="btn btn-xs btn-link p-0 text-primary fw-semibold"
                  style={{ fontSize: '10px' }}
                  onClick={() => alert('Downloading daily safety report')}
                >
                  Download
                </button>
              </div>
              <div className="d-flex align-items-center justify-content-between p-2 rounded border bg-light-subtle" style={{ fontSize: '11px' }}>
                <span className="d-flex align-items-center gap-1.5">
                  <i className="bi bi-file-earmark-excel text-success" />
                  Productivity_KPI_Week28.xlsx
                </span>
                <button
                  className="btn btn-xs btn-link p-0 text-primary fw-semibold"
                  style={{ fontSize: '10px' }}
                  onClick={() => alert('Downloading weekly productivity report')}
                >
                  Download
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Drawer Footer */}
        <div className="p-3 bg-light border-top d-flex justify-content-center">
          <button
            className="btn btn-primary btn-xs py-1 px-4"
            style={{ fontSize: '11px' }}
            onClick={() => {
              alert('Acknowledge all notifications clicked');
              onClose();
            }}
          >
            Clear All
          </button>
        </div>
      </div>
    </>
  );
};
