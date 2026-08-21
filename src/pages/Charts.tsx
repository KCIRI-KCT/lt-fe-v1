<<<<<<< HEAD
import { useState, useEffect } from 'react';
import { dashboardService, type ProgressPoint } from '../services/dashboardService';
import { safetyService } from '../services/safetyService';
import type { AIAlert } from '../types';

export const Charts = () => {
  const [progressData, setProgressData] = useState<ProgressPoint[]>([]);
  const [alerts, setAlerts] = useState<AIAlert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    Promise.allSettled([
      dashboardService.getPlanVsActualProgress('month'),
      safetyService.getAIAlerts(),
    ]).then(([progRes, alertRes]) => {
      if (!isMounted) return;
      if (progRes.status === 'fulfilled') setProgressData(progRes.value);
      if (alertRes.status === 'fulfilled') setAlerts(alertRes.value);
    }).finally(() => {
      if (isMounted) setLoading(false);
    });

    return () => { isMounted = false; };
  }, []);

  // Compute severity distribution percentages dynamically from fetched AI alerts
  const severityCounts = alerts.reduce(
    (acc, alert) => {
      const sev = alert.severity || 'low';
      acc[sev] = (acc[sev] || 0) + 1;
      return acc;
    },
    { critical: 0, high: 0, medium: 0, low: 0 } as Record<string, number>
  );

  const totalAlerts = alerts.length || 1;
  const criticalPct = Math.round((severityCounts.critical / totalAlerts) * 100);
  const highPct = Math.round((severityCounts.high / totalAlerts) * 100);
  const mediumPct = Math.round((severityCounts.medium / totalAlerts) * 100);
  const lowPct = Math.max(0, 100 - criticalPct - highPct - mediumPct);

  return (
    <div className="container-fluid px-3 px-lg-4 py-4">
      <div className="page-heading">
        <div className="page-heading-copy">
          <span className="page-icon"><i className="bi bi-bar-chart-line" aria-hidden="true" /></span>
          <div>
            <p className="eyebrow mb-1">Analytics</p>
            <h1 className="h3 mb-1">Charts &amp; Visualizations</h1>
            <p className="text-muted mb-0">Dynamic real-time trends for project execution and AI monitoring.</p>
=======
export const Charts = () => (
  <div className="container-fluid px-3 px-lg-4 py-4">
    <div className="page-heading">
      <div className="page-heading-copy">
        <span className="page-icon"><i className="bi bi-bar-chart-line" aria-hidden="true" /></span>
        <div>
          <p className="eyebrow mb-1">Analytics</p>
          <h1 className="h3 mb-1">Charts</h1>
          <p className="text-muted mb-0">Visualize revenue, user growth, and performance metrics.</p>
        </div>
      </div>
    </div>

    <div className="row g-3 mt-1">
      <div className="col-12 col-xl-6">
        <div className="panel">
          <div className="panel-header">
            <div>
              <h2 className="h5 mb-1 section-title"><i className="bi bi-graph-up-arrow" aria-hidden="true" /><span>Revenue Overview</span></h2>
              <p className="text-muted mb-0">Monthly revenue trend for the current year.</p>
            </div>
          </div>
          <div className="chart-bars" aria-label="Revenue chart">
            <div className="chart-column bar-42"><span /><small>Jan</small></div>
            <div className="chart-column bar-58"><span /><small>Feb</small></div>
            <div className="chart-column bar-51"><span /><small>Mar</small></div>
            <div className="chart-column bar-72"><span /><small>Apr</small></div>
            <div className="chart-column bar-66"><span /><small>May</small></div>
            <div className="chart-column bar-83"><span /><small>Jun</small></div>
            <div className="chart-column bar-78"><span /><small>Jul</small></div>
            <div className="chart-column bar-91"><span /><small>Aug</small></div>
>>>>>>> MS-ltfe-report
          </div>
        </div>
      </div>

<<<<<<< HEAD
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-2 text-muted">Calculating chart data...</p>
        </div>
      ) : (
        <div className="row g-3 mt-1">
          {/* Bar Chart Panel */}
          <div className="col-12 col-xl-6">
            <div className="panel h-100">
              <div className="panel-header">
                <div>
                  <h2 className="h5 mb-1 section-title">
                    <i className="bi bi-graph-up-arrow" aria-hidden="true" />
                    <span>Monthly Progress Trend</span>
                  </h2>
                  <p className="text-muted mb-0">Cumulative progress calculation per month.</p>
                </div>
              </div>

              <div className="d-flex align-items-end justify-content-between gap-2 mt-3 pt-3 border-top" style={{ height: '220px' }}>
                {progressData.slice(0, 12).map((item) => {
                  const barHeight = Math.max(10, Math.min(100, item.actual));
                  return (
                    <div key={item.month} className="d-flex flex-column align-items-center flex-grow-1 h-100 justify-content-end">
                      <small className="fw-bold mb-1 opacity-75" style={{ fontSize: '10px' }}>{item.actual}%</small>
                      <div
                        className="w-100 rounded-top"
                        style={{
                          height: `${barHeight}%`,
                          background: 'linear-gradient(180deg, #2563eb 0%, #1d4ed8 100%)',
                          transition: 'height 0.4s ease',
                          minWidth: '12px',
                          maxWidth: '36px',
                        }}
                        title={`Month: ${item.month} | Planned: ${item.planned}% | Actual: ${item.actual}%`}
                      />
                      <small className="text-muted mt-2 fw-semibold" style={{ fontSize: '11px' }}>{item.month}</small>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* AI Alert Severity Distribution Donut / Legend Panel */}
          <div className="col-12 col-xl-6">
            <div className="panel h-100">
              <div className="panel-header">
                <div>
                  <h2 className="h5 mb-1 section-title">
                    <i className="bi bi-pie-chart" aria-hidden="true" />
                    <span>AI Alert Severity Breakdown</span>
                  </h2>
                  <p className="text-muted mb-0">Percentage breakdown calculated from active surveillance alerts.</p>
                </div>
              </div>
              <div className="d-flex flex-column flex-lg-row align-items-center gap-4 mt-3">
                <div className="donut-chart" style={{ border: '8px solid var(--bs-primary, #2563eb)' }}>
                  <span>{alerts.length}</span>
                </div>
                <div className="legend-list flex-grow-1 w-100">
                  <div className="d-flex align-items-center justify-content-between py-1 border-bottom">
                    <span>
                      <span className="legend-dot" style={{ background: '#dc2626' }} /> Critical Severity
                    </span>
                    <span className="fw-bold text-danger">{criticalPct}% ({severityCounts.critical})</span>
                  </div>
                  <div className="d-flex align-items-center justify-content-between py-1 border-bottom">
                    <span>
                      <span className="legend-dot" style={{ background: '#d97706' }} /> High Severity
                    </span>
                    <span className="fw-bold text-warning">{highPct}% ({severityCounts.high})</span>
                  </div>
                  <div className="d-flex align-items-center justify-content-between py-1 border-bottom">
                    <span>
                      <span className="legend-dot" style={{ background: '#2563eb' }} /> Medium Severity
                    </span>
                    <span className="fw-bold text-primary">{mediumPct}% ({severityCounts.medium})</span>
                  </div>
                  <div className="d-flex align-items-center justify-content-between py-1">
                    <span>
                      <span className="legend-dot" style={{ background: '#16a34a' }} /> Low Severity
                    </span>
                    <span className="fw-bold text-success">{lowPct}% ({severityCounts.low})</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
=======
      <div className="col-12 col-xl-6">
        <div className="panel h-100">
          <div className="panel-header">
            <div>
              <h2 className="h5 mb-1 section-title"><i className="bi bi-pie-chart" aria-hidden="true" /><span>Traffic Sources</span></h2>
              <p className="text-muted mb-0">Breakdown of visitor acquisition channels.</p>
            </div>
          </div>
          <div className="d-flex flex-column flex-lg-row align-items-center gap-4 mt-2">
            <div className="donut-chart"><span>68%</span></div>
            <div className="legend-list flex-grow-1 w-100">
              <div><span className="legend-dot" style={{ background: 'var(--admin-primary)' }} /> Organic<span className="fw-bold">42%</span></div>
              <div><span className="legend-dot" style={{ background: 'var(--admin-success)' }} /> Referral<span className="fw-bold">26%</span></div>
              <div><span className="legend-dot" style={{ background: 'var(--admin-warning)' }} /> Social<span className="fw-bold">18%</span></div>
              <div><span className="legend-dot" style={{ background: 'var(--admin-danger)' }} /> Direct<span className="fw-bold">14%</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
>>>>>>> MS-ltfe-report
