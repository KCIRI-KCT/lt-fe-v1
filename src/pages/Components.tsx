export const Components = () => (
  <div className="container-fluid px-3 px-lg-4 py-4">
    <div className="page-heading">
      <div className="page-heading-copy">
        <span className="page-icon"><i className="bi bi-grid-3x3-gap" aria-hidden="true" /></span>
        <div>
          <p className="eyebrow mb-1">UI Kit</p>
          <h1 className="h3 mb-1">Components</h1>
          <p className="text-muted mb-0">Reusable UI components, badges, progress bars, and more.</p>
        </div>
      </div>
    </div>

    <div className="row g-3 mt-1">
      <div className="col-12 col-xl-6">
        <div className="panel">
          <h2 className="h5 mb-3 section-title"><i className="bi bi-tags" aria-hidden="true" /><span>Badges</span></h2>
          <div className="d-flex flex-wrap gap-2">
            <span className="badge text-bg-primary">Primary</span>
            <span className="badge text-bg-success">Success</span>
            <span className="badge text-bg-warning">Warning</span>
            <span className="badge text-bg-danger">Danger</span>
            <span className="badge text-bg-info">Info</span>
            <span className="badge text-bg-secondary">Secondary</span>
            <span className="badge text-bg-dark">Dark</span>
          </div>
        </div>
      </div>

      <div className="col-12 col-xl-6">
        <div className="panel">
          <h2 className="h5 mb-3 section-title"><i className="bi bi-bar-chart" aria-hidden="true" /><span>Progress Bars</span></h2>
          <div className="d-grid gap-3">
            <div>
              <div className="d-flex justify-content-between mb-1"><small className="fw-bold">Sales</small><small className="fw-bold">72%</small></div>
              <div className="progress"><div className="progress-bar bg-primary progress-72" role="progressbar" aria-valuenow={72} aria-valuemin={0} aria-valuemax={100} /></div>
            </div>
            <div>
              <div className="d-flex justify-content-between mb-1"><small className="fw-bold">Revenue</small><small className="fw-bold">58%</small></div>
              <div className="progress"><div className="progress-bar bg-success progress-58" role="progressbar" aria-valuenow={58} aria-valuemin={0} aria-valuemax={100} /></div>
            </div>
            <div>
              <div className="d-flex justify-content-between mb-1"><small className="fw-bold">Users</small><small className="fw-bold">42%</small></div>
              <div className="progress"><div className="progress-bar bg-warning progress-42" role="progressbar" aria-valuenow={42} aria-valuemin={0} aria-valuemax={100} /></div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-12 col-xl-6">
        <div className="panel">
          <h2 className="h5 mb-3 section-title"><i className="bi bi-layout-text-window" aria-hidden="true" /><span>Accordion</span></h2>
          <div className="accordion" id="sampleAccordion">
            <div className="accordion-item">
              <h3 className="accordion-header">
                <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true">
                  Accordion Item #1
                </button>
              </h3>
              <div id="collapseOne" className="accordion-collapse collapse show" data-bs-parent="#sampleAccordion">
                <div className="accordion-body">This is the first item's accordion body.</div>
              </div>
            </div>
            <div className="accordion-item">
              <h3 className="accordion-header">
                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo">
                  Accordion Item #2
                </button>
              </h3>
              <div id="collapseTwo" className="accordion-collapse collapse" data-bs-parent="#sampleAccordion">
                <div className="accordion-body">This is the second item's accordion body.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-12 col-xl-6">
        <div className="panel">
          <h2 className="h5 mb-3 section-title"><i className="bi bi-info-circle" aria-hidden="true" /><span>Mini Info Cards</span></h2>
          <div className="row g-3">
            <div className="col-6">
              <div className="mini-card text-center">
                <span>Total Projects</span>
                <strong>128</strong>
              </div>
            </div>
            <div className="col-6">
              <div className="mini-card text-center">
                <span>Team Members</span>
                <strong>24</strong>
              </div>
            </div>
            <div className="col-6">
              <div className="mini-card text-center">
                <span>Open Tasks</span>
                <strong>16</strong>
              </div>
            </div>
            <div className="col-6">
              <div className="mini-card text-center">
                <span>Completed</span>
                <strong>342</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);