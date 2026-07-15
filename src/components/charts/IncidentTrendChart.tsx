import type { IncidentTrend } from '../../types';

interface IncidentTrendChartProps {
  data: IncidentTrend[];
  className?: string;
}

export const IncidentTrendChart = ({ data, className = '' }: IncidentTrendChartProps) => {
  const maxValue = Math.max(...data.flatMap((d) => [d.critical, d.major, d.minor, d.observation]));

  return (
    <div className={`panel ${className}`}>
      <div className="panel-header">
        <div>
          <h2 className="h5 mb-1 section-title">
            <i className="bi bi-graph-down" aria-hidden="true" />
            <span>Incident Trends</span>
          </h2>
          <p className="text-muted mb-0">Monthly incident breakdown by severity</p>
        </div>
      </div>
      <div className="table-responsive">
        <table className="table table-sm align-middle mb-0">
          <thead>
            <tr>
              <th>Month</th>
              <th>Critical</th>
              <th>Major</th>
              <th>Minor</th>
              <th>Observation</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.date}>
                <td className="fw-bold">{row.date}</td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <div className="progress flex-grow-1" style={{ height: '6px' }}>
                      <div className="progress-bar bg-danger" style={{ width: `${(row.critical / maxValue) * 100}%` }} />
                    </div>
                    <small className="fw-bold text-danger">{row.critical}</small>
                  </div>
                </td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <div className="progress flex-grow-1" style={{ height: '6px' }}>
                      <div className="progress-bar bg-warning" style={{ width: `${(row.major / maxValue) * 100}%` }} />
                    </div>
                    <small className="fw-bold text-warning">{row.major}</small>
                  </div>
                </td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <div className="progress flex-grow-1" style={{ height: '6px' }}>
                      <div className="progress-bar bg-primary" style={{ width: `${(row.minor / maxValue) * 100}%` }} />
                    </div>
                    <small className="fw-bold text-primary">{row.minor}</small>
                  </div>
                </td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <div className="progress flex-grow-1" style={{ height: '6px' }}>
                      <div className="progress-bar bg-secondary" style={{ width: `${(row.observation / maxValue) * 100}%` }} />
                    </div>
                    <small className="fw-bold text-secondary">{row.observation}</small>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};