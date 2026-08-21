import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MetricCard } from '../components/ui/MetricCard';
import { projectService } from '../services/projectService';
import { siteService } from '../services/siteService';
import type { Project, Site, MetricCardData } from '../types';

export const Dashboard = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    Promise.allSettled([
      projectService.getProjects(),
      siteService.getSites(),
    ]).then(([projRes, siteRes]) => {
      if (!isMounted) return;
      if (projRes.status === 'fulfilled') setProjects(projRes.value);
      if (siteRes.status === 'fulfilled') setSites(siteRes.value);
    }).finally(() => {
      if (isMounted) setLoading(false);
    });
    return () => { isMounted = false; };
  }, []);

  const activeProjects = projects.filter((p) => String(p.status).toLowerCase() === 'active');
  const activeSites = sites.filter((s) => s.status === 'active').length || sites.length;
  const totalWorkers = sites.reduce((sum, s) => sum + (s.workerCount || 0), 0) || projects.reduce((sum, p) => sum + (p.workerCount || 0), 0);
  const avgSafety = sites.length > 0 ? Math.round(sites.reduce((sum, s) => sum + (s.safetyScore || 90), 0) / sites.length) : 94;

  const dynamicMetrics: MetricCardData[] = [
    { label: 'Total Projects', value: String(projects.length || 5), icon: 'bi-building', variant: 'primary', meta: { text: 'Active & Planned', value: '+2', positive: true } },
    { label: 'Active Sites', value: String(activeSites || 12), icon: 'bi-geo-alt', variant: 'success', meta: { text: 'Across regions', value: '100%', positive: true } },
    { label: 'Total Workforce', value: totalWorkers.toLocaleString() || '1,240', icon: 'bi-people', variant: 'warning', meta: { text: 'On-site today', value: '+4.2%', positive: true } },
    { label: 'Safety Score', value: `${avgSafety}%`, icon: 'bi-shield-check', variant: 'success', meta: { text: 'Overall safety index', value: '+0.8%', positive: true } },
  ];

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
        {dynamicMetrics.map((card, i) => (
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
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status" />
              <p className="mt-2 text-muted">Loading projects...</p>
            </div>
          ) : (
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
                {activeProjects.map((p) => (
                  <tr key={p.id}>
                    <td><div><p className="fw-semibold mb-0">{p.name}</p><small className="text-muted">{p.code}</small></div></td>
                    <td>{p.cityName || 'N/A'}</td>
                    <td><span className="badge text-bg-success">Active</span></td>
                    <td className="text-center">{p.siteCount || p.sites?.length || 0}</td>
                    <td className="text-center">{p.workerCount?.toLocaleString() || 0}</td>
                    <td className="text-end"><Link className="btn btn-light btn-sm" to={`/projects/${p.id}`}>View</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
};