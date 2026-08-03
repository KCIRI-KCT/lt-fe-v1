import { useState } from 'react';
import { IncidentCard } from '../components/cards/IncidentCard';
import { MOCK_INCIDENTS } from '../services/mockData';
import { SEVERITY_BADGES } from '../constants';

export const IncidentsPage = () => {
  const [filter, setFilter] = useState<string>('all');

  const filtered = MOCK_INCIDENTS.filter((i) => filter === 'all' || i.status === filter);

  return (
    <div className="container-fluid px-3 px-lg-4 py-4">
      <div className="page-heading">
        <div className="page-heading-copy">
          <span className="page-icon"><i className="bi bi-exclamation-triangle" aria-hidden="true" /></span>
          <div>
            <p className="eyebrow mb-1">Safety & Security</p>
            <h1 className="h3 mb-0">Incidents</h1>
          </div>
        </div>
        <div className="heading-actions">
          <button className="btn btn-primary btn-sm"><i className="bi bi-plus-lg" /> Report Incident</button>
        </div>
      </div>

      {/* Status filters */}
      <div className="d-flex flex-wrap gap-1 mb-3">
        {['all', 'open', 'investigating', 'resolved', 'closed'].map((s) => (
          <button
            key={s}
            className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setFilter(s)}
          >
            <span className="text-capitalize">{s}</span>
            <span className="ms-1 badge">{s === 'all' ? MOCK_INCIDENTS.length : MOCK_INCIDENTS.filter((i) => i.status === s).length}</span>
          </button>
        ))}
      </div>

      <div className="row g-3 mb-3">
        {['critical', 'major', 'minor', 'observation'].map((sev) => (
          <div key={sev} className="col-6 col-sm-3">
            <div className="mini-card text-center p-3">
              <strong className="fs-4">{MOCK_INCIDENTS.filter((i) => i.severity === sev).length}</strong>
              <span className={`badge ${SEVERITY_BADGES[sev]} mt-1`}>{sev}</span>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="panel blank-panel">
          <div className="blank-state">
            <i className="bi bi-check-circle fs-1 text-success mb-3 d-block" />
            <h5 className="fw-bold mb-2">No Incidents Found</h5>
            <p className="text-muted small mb-0">All clear for the selected filter.</p>
          </div>
        </div>
      ) : (
        filtered.map((incident) => (
          <IncidentCard
            key={incident.id}
            incident={incident}
            onView={(id) => console.log('View', id)}
            onAssign={(id) => console.log('Assign', id)}
            onResolve={(id) => console.log('Resolve', id)}
          />
        ))
      )}
    </div>
  );
};