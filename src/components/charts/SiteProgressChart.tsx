import type { SiteProgress } from '../../types';

interface SiteProgressChartProps {
  data: SiteProgress[];
  className?: string;
}

export const SiteProgressChart = ({ data, className = '' }: SiteProgressChartProps) => {
  const maxVal = Math.max(...data.map((d) => Math.max(d.planned, d.actual)));

  return (
    <div className={`panel ${className}`}>
      <div className="panel-header">
        <div>
          <h2 className="h5 mb-1 section-title">
            <i className="bi bi-bar-chart" aria-hidden="true" />
            <span>Site Progress</span>
          </h2>
          <p className="text-muted mb-0">Planned vs actual progress by site</p>
        </div>
      </div>
      <div className="d-grid gap-3">
        {data.map((site) => (
          <div key={site.siteId}>
            <div className="d-flex justify-content-between mb-1">
              <small className="fw-bold">{site.siteName}</small>
              <small className={`fw-bold ${site.variance < 0 ? 'text-danger' : 'text-success'}`}>
                {site.variance > 0 ? '+' : ''}{site.variance}%
              </small>
            </div>
            <div className="position-relative" style={{ height: '28px' }}>
              <div className="progress h-100">
                <div
                  className="progress-bar bg-secondary"
                  style={{ width: `${(site.planned / maxVal) * 100}%` }}
                  role="progressbar"
                  title={`Planned: ${site.planned}%`}
                />
              </div>
              <div
                className="progress position-absolute top-0 start-0 h-100"
                style={{ background: 'transparent', width: `${(site.actual / maxVal) * 100}%` }}
              >
                <div
                  className="progress-bar"
                  style={{
                    background: site.variance >= 0 ? '#22c55e' : '#dc2626',
                    width: '100%',
                  }}
                  role="progressbar"
                  title={`Actual: ${site.actual}%`}
                />
              </div>
            </div>
            <div className="d-flex justify-content-between small text-muted mt-1">
              <span>Planned: {site.planned}%</span>
              <span>Actual: {site.actual}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};