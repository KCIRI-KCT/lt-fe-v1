import { useState } from 'react';
import { AIAlertCard } from '../components/cards/AIAlertCard';
import { MOCK_AI_ALERTS } from '../services/mockData';
import { AI_ALERT_CONFIG } from '../constants';

export const AIMonitoringPage = () => {
  const [filter, setFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filtered = MOCK_AI_ALERTS.filter((a) => {
    if (filter !== 'all' && a.status !== filter) return false;
    if (typeFilter !== 'all' && a.type !== typeFilter) return false;
    return true;
  });

  return (
    <div className="container-fluid px-3 px-lg-4 py-4">
      <div className="page-heading">
        <div className="page-heading-copy">
          <span className="page-icon"><i className="bi bi-robot" aria-hidden="true" /></span>
          <div>
            <p className="eyebrow mb-1">AI Surveillance</p>
            <h1 className="h3 mb-0">AI Monitoring</h1>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="row g-3 mt-1 mb-3">
        {['all', 'new', 'acknowledged', 'resolved', 'dismissed'].map((s) => (
          <div key={s} className="col-6 col-sm-4 col-md-2">
            <div className={`mini-card text-center p-3 ${filter === s ? 'border-primary' : ''}`} style={{ cursor: 'pointer' }} onClick={() => setFilter(s)}>
              <strong className="fs-4">{s === 'all' ? MOCK_AI_ALERTS.length : MOCK_AI_ALERTS.filter((a) => a.status === s).length}</strong>
              <span className="text-muted small text-capitalize">{s}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Type filter */}
      <div className="d-flex flex-wrap gap-1 mb-3">
        <button className={`btn btn-sm ${typeFilter === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setTypeFilter('all')}>All Types</button>
        {Object.entries(AI_ALERT_CONFIG).map(([key, config]) => (
          <button
            key={key}
            className={`btn btn-sm ${typeFilter === key ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setTypeFilter(key)}
          >
            <i className={`${config.icon} me-1`} />{config.label}
          </button>
        ))}
      </div>

      {/* Alerts list */}
      {filtered.length === 0 ? (
        <div className="panel blank-panel">
          <div className="blank-state">
            <i className="bi bi-check2-circle fs-1 text-success mb-3 d-block" />
            <h5 className="fw-bold mb-2">All Clear</h5>
            <p className="text-muted small mb-0">No alerts match the current filters.</p>
          </div>
        </div>
      ) : (
        filtered.map((alert) => (
          <AIAlertCard
            key={alert.id}
            alert={alert}
            onAcknowledge={(id) => console.log('Acknowledge', id)}
            onResolve={(id) => console.log('Resolve', id)}
            onView={(id) => console.log('View', id)}
          />
        ))
      )}
    </div>
  );
};