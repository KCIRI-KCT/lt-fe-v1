export const Alerts = () => (
  <div className="container-fluid px-3 px-lg-4 py-4">
    <div className="page-heading">
      <div className="page-heading-copy">
        <span className="page-icon"><i className="bi bi-exclamation-triangle" aria-hidden="true" /></span>
        <div>
          <p className="eyebrow mb-1">Feedback</p>
          <h1 className="h3 mb-1">Alerts</h1>
          <p className="text-muted mb-0">Alert components for user notifications and system messages.</p>
        </div>
      </div>
    </div>
    <div className="panel mt-1">
      <h2 className="h5 mb-3 section-title"><i className="bi bi-bell" aria-hidden="true" /><span>Alert Variants</span></h2>
      <div className="alert alert-primary" role="alert">Primary alert — simple contextual message.</div>
      <div className="alert alert-success" role="alert">Success alert — operation completed successfully.</div>
      <div className="alert alert-warning" role="alert">Warning alert — caution advised before proceeding.</div>
      <div className="alert alert-danger" role="alert">Danger alert — critical error or action required.</div>
      <div className="alert alert-info" role="alert">Info alert — general informational message.</div>
    </div>
  </div>
);