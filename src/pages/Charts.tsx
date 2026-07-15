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
          </div>
        </div>
      </div>

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