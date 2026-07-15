import { MetricCard } from '../../components/ui/MetricCard';
import { MOCK_DASHBOARD_METRICS, MOCK_SITE_PROGRESS, MOCK_STATE_WISE, MOCK_INCIDENT_TRENDS, MOCK_PPE_COMPLIANCE, MOCK_PROJECTS } from '../../services/mockData';
import { SiteProgressChart } from '../../components/charts/SiteProgressChart';
import { StateWiseAnalyticsChart } from '../../components/charts/StateWiseAnalyticsChart';
import { IncidentTrendChart } from '../../components/charts/IncidentTrendChart';
import { PPEComplianceChart } from '../../components/charts/PPEComplianceChart';
import { Link } from 'react-router-dom';

export const SuperAdminDashboard = () => {
  const metrics = MOCK_DASHBOARD_METRICS.admin;

  return (
    <div className="container-fluid px-3 px-lg-4 py-4">
      <div className="page-heading">
        <div className="page-heading-copy">
          <span className="page-icon"><i className="bi bi-speedometer2" aria-hidden="true" /></span>
          <div>
            <p className="eyebrow mb-1">Admin Overview</p>
            <h1 className="h3 mb-1">Enterprise Dashboard</h1>
            <p className="text-muted mb-0">
              Monitor all projects, sites, workforce, and AI monitoring across the organization.
            </p>
          </div>
        </div>
        <div className="heading-actions">
          <Link className="btn btn-outline-secondary btn-sm" to="/reports">
            <i className="bi bi-file-earmark-bar-graph" aria-hidden="true" /> Reports
          </Link>
          <Link className="btn btn-primary btn-sm" to="/projects">
            <i className="bi bi-plus-lg" aria-hidden="true" /> New Project
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <section className="row g-3 mt-1" aria-label="Enterprise metrics">
        {metrics.map((card, i) => (
          <div key={i} className="col-12 col-sm-6 col-xl-4">
            <MetricCard card={card} />
          </div>
        ))}
      </section>

      {/* Charts Row */}
      <div className="row g-3 mt-1">
        <div className="col-12 col-xl-6">
          <SiteProgressChart data={MOCK_SITE_PROGRESS} />
        </div>
        <div className="col-12 col-xl-6">
          <PPEComplianceChart data={MOCK_PPE_COMPLIANCE} />
        </div>
      </div>

      <div className="row g-3 mt-1">
        <div className="col-12 col-xl-7">
          <StateWiseAnalyticsChart data={MOCK_STATE_WISE} />
        </div>
        <div className="col-12 col-xl-5">
          <IncidentTrendChart data={MOCK_INCIDENT_TRENDS} />
        </div>
      </div>

      {/* Active Projects */}
      <section className="panel mt-3">
        <div className="panel-header">
          <div>
            <h2 className="h5 mb-1 section-title">
              <i className="bi bi-building" aria-hidden="true" />
              <span>Active Projects</span>
            </h2>
            <p className="text-muted mb-0">Overview of all ongoing construction projects</p>
          </div>
          <Link className="btn btn-outline-secondary btn-sm" to="/projects">View All</Link>
        </div>
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>Project</th>
                <th>Location</th>
                <th>Status</th>
                <th className="text-center">Sites</th>
                <th className="text-center">Workers</th>
                <th className="text-center">Progress</th>
                <th className="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_PROJECTS.filter((p) => p.status === 'active').map((p) => (
                <tr key={p.id}>
                  <td>
                    <div>
                      <p className="fw-semibold mb-0">{p.name}</p>
                      <small className="text-muted">{p.code}</small>
                    </div>
                  </td>
                  <td>{p.cityName || 'N/A'}</td>
                  <td><span className="badge text-bg-success">Active</span></td>
                  <td className="text-center">{p.siteCount}</td>
                  <td className="text-center">{p.workerCount?.toLocaleString()}</td>
                  <td className="text-center">
                    <div className="d-flex align-items-center gap-2">
                      <div className="progress flex-grow-1" style={{ height: '8px' }}>
                        <div className="progress-bar" style={{ width: `${p.progress}%` }} />
                      </div>
                      <small className="fw-bold">{p.progress}%</small>
                    </div>
                  </td>
                  <td className="text-end">
                    <Link className="btn btn-light btn-sm" to={`/projects/${p.id}`}>View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};