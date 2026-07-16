interface ProgressItem {
  projectId: string;
  projectName: string;
  planned: number;
  actual: number;
  workers: number;
  status: 'on_track' | 'delayed' | 'ahead';
}

interface ConstructionProgressCardProps {
  data: ProgressItem[];
  className?: string;
}

const STATUS_MAP: Record<string, { label: string; cls: string; badge: string }> = {
  on_track: { label: 'On Track', cls: 'text-success', badge: 'text-bg-success' },
  delayed:  { label: 'Delayed',  cls: 'text-danger',  badge: 'text-bg-danger'  },
  ahead:    { label: 'Ahead',    cls: 'text-primary',  badge: 'text-bg-primary' },
};

export const ConstructionProgressCard = ({ data, className = '' }: ConstructionProgressCardProps) => {
  return (
    <div className={`panel ${className}`}>
      <div className="panel-header">
        <div>
          <h2 className="h5 mb-1 section-title">
            <i className="bi bi-building-fill-gear" aria-hidden="true" />
            <span>Construction Progress</span>
          </h2>
          <p className="text-muted mb-0">Planned vs actual per project</p>
        </div>
      </div>
      <div className="d-grid gap-4">
        {data.map((item) => {
          const st = STATUS_MAP[item.status] ?? STATUS_MAP.on_track;
          const variance = item.actual - item.planned;
          return (
            <div key={item.projectId}>
              {/* Header row */}
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <p className="fw-semibold mb-0 small">{item.projectName}</p>
                  <small className="text-muted">
                    <i className="bi bi-people me-1" />
                    {item.workers.toLocaleString()} workers
                  </small>
                </div>
                <span className={`badge ${st.badge}`}>{st.label}</span>
              </div>

              {/* Planned bar */}
              <div className="d-flex align-items-center gap-2 mb-1">
                <small className="text-muted" style={{ width: 60, flexShrink: 0 }}>Planned</small>
                <div className="progress flex-grow-1" style={{ height: 8 }}>
                  <div
                    className="progress-bar bg-secondary"
                    style={{ width: `${item.planned}%` }}
                    role="progressbar"
                    aria-valuenow={item.planned}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    title={`Planned: ${item.planned}%`}
                  />
                </div>
                <small className="fw-bold text-muted" style={{ width: 36, textAlign: 'right' }}>{item.planned}%</small>
              </div>

              {/* Actual bar */}
              <div className="d-flex align-items-center gap-2">
                <small className="text-muted" style={{ width: 60, flexShrink: 0 }}>Actual</small>
                <div className="progress flex-grow-1" style={{ height: 8 }}>
                  <div
                    className="progress-bar"
                    style={{
                      width: `${item.actual}%`,
                      background: variance >= 0 ? '#16a34a' : '#dc2626',
                    }}
                    role="progressbar"
                    aria-valuenow={item.actual}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    title={`Actual: ${item.actual}%`}
                  />
                </div>
                <small className={`fw-bold ${st.cls}`} style={{ width: 36, textAlign: 'right' }}>{item.actual}%</small>
              </div>

              {/* Variance chip */}
              <div className="mt-1 text-end">
                <small className={`fw-semibold ${variance >= 0 ? 'text-success' : 'text-danger'}`}>
                  {variance >= 0 ? '+' : ''}{variance}% variance
                </small>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
