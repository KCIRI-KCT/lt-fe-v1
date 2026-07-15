import type { StateWiseAnalytics } from '../../types';

interface StateWiseAnalyticsChartProps {
  data: StateWiseAnalytics[];
  className?: string;
}

const COLORS = ['#2563eb', '#0f766e', '#d97706', '#dc2626', '#0891b2', '#7c3aed', '#be185d'];

export const StateWiseAnalyticsChart = ({ data, className = '' }: StateWiseAnalyticsChartProps) => {
  return (
    <div className={`panel ${className}`}>
      <div className="panel-header">
        <div>
          <h2 className="h5 mb-1 section-title">
            <i className="bi bi-globe" aria-hidden="true" />
            <span>State-wise Analytics</span>
          </h2>
          <p className="text-muted mb-0">Projects, sites, and compliance by state</p>
        </div>
      </div>
      <div className="table-responsive">
        <table className="table align-middle mb-0">
          <thead>
            <tr>
              <th>State</th>
              <th className="text-center">Projects</th>
              <th className="text-center">Sites</th>
              <th className="text-center">Workers</th>
              <th className="text-center">Incidents</th>
              <th className="text-center">Compliance</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={row.state}>
                <td>
                  <span
                    className="legend-dot d-inline-block me-2"
                    style={{ background: COLORS[i % COLORS.length] }}
                  />
                  <span className="fw-bold">{row.state}</span>
                </td>
                <td className="text-center">{row.projects}</td>
                <td className="text-center">{row.sites}</td>
                <td className="text-center">{row.workers.toLocaleString()}</td>
                <td className="text-center">
                  <span className={`badge ${row.incidents > 15 ? 'text-bg-danger' : row.incidents > 10 ? 'text-bg-warning' : 'text-bg-success'}`}>
                    {row.incidents}
                  </span>
                </td>
                <td className="text-center">
                  <div className="d-flex align-items-center gap-2">
                    <div className="progress flex-grow-1" style={{ height: '8px' }}>
                      <div
                        className="progress-bar"
                        style={{
                          width: `${row.compliance}%`,
                          background: row.compliance >= 90 ? '#22c55e' : row.compliance >= 80 ? '#d97706' : '#dc2626',
                        }}
                      />
                    </div>
                    <small className="fw-bold" style={{ color: row.compliance >= 90 ? '#22c55e' : row.compliance >= 80 ? '#d97706' : '#dc2626' }}>
                      {row.compliance}%
                    </small>
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