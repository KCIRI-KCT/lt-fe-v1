import { Link } from 'react-router-dom';
import { MetricCard } from '../components/ui/MetricCard';
import { MOCK_DASHBOARD_METRICS } from '../services/mockData';
import { MOCK_PROJECTS } from '../services/mockData';

export const Dashboard = () => {
  const metrics = MOCK_DASHBOARD_METRICS.admin;

  return (
    <div className="container-fluid px-3 px-lg-4 py-4">
      <div className="page-heading">
        <div className="page-heading-copy">
          <span className="page-icon"><i className="bi bi-speedometer2" aria-hidden="true" /></span>
          <div>
            <p className="eyebrow mb-1">Overview</p>
            <h1 className="h3 mb-1">Dashboard</h1>
            <p className="text-muted mb-0">Monitor all construction operations from one clean workspace.</p>
          </div>
        </div>
        <div className="heading-actions">
          <button className="btn btn-outline-secondary btn-sm"><i className="bi bi-download" /> Export</button>
          <Link className="btn btn-primary btn-sm" to="/projects"><i className="bi bi-plus-lg" /> Create Report</Link>
        </div>
      </div>

      <section className="row g-3 mt-1" aria-label="Dashboard metrics">
        {metrics.map((card, i) => (
          <div key={i} className="col-12 col-sm-6 col-xl-3">
            <MetricCard card={card} />
          </div>
        ))}
      </section>

      <section className="panel mt-3">
        <div className="panel-header">
          <div>
            <h2 className="h5 mb-1 section-title"><i className="bi bi-building" /><span>Active Projects</span></h2>
            <p className="text-muted mb-0">Overview of all ongoing construction projects.</p>
          </div>
          <Link className="btn btn-outline-secondary btn-sm" to="/projects">Manage Projects</Link>
        </div>
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th scope="col">Project</th>
                <th scope="col">Location</th>
                <th scope="col">Status</th>
                <th scope="col" className="text-center">Sites</th>
                <th scope="col" className="text-center">Workers</th>
                <th scope="col" className="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_PROJECTS.filter((p) => p.status === 'active').map((p) => (
                <tr key={p.id}>
                  <td><div><p className="fw-semibold mb-0">{p.name}</p><small className="text-muted">{p.code}</small></div></td>
                  <td>{p.cityName || 'N/A'}</td>
                  <td><span className="badge text-bg-success">Active</span></td>
                  <td className="text-center">{p.siteCount}</td>
                  <td className="text-center">{p.workerCount?.toLocaleString()}</td>
                  <td className="text-end"><Link className="btn btn-light btn-sm" to={`/projects/${p.id}`}>View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};