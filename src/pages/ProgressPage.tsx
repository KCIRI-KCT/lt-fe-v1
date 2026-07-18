import { useState } from 'react';
import { MOCK_CHAINAGES } from '../services/mockData';

export const ProgressPage = () => {
  const [view, setView] = useState<'highway' | 'structural'>('highway');

  const overallHighway = Math.round(
    MOCK_CHAINAGES.reduce((s, c) => s + c.highwayProgress, 0) / MOCK_CHAINAGES.length
  );
  const overallStructural = Math.round(
    MOCK_CHAINAGES.reduce((s, c) => s + c.structuralProgress, 0) / MOCK_CHAINAGES.length
  );
  const overallProgress = Math.round(
    MOCK_CHAINAGES.reduce((s, c) => s + c.progress, 0) / MOCK_CHAINAGES.length
  );

  const statusColor = (pct: number) =>
    pct >= 75 ? '#16a34a' : pct >= 50 ? '#d97706' : '#dc2626';

  return (
    <div className="container-fluid px-3 px-lg-4 py-4">
      <div className="page-heading">
        <div className="page-heading-copy">
          <span className="page-icon"><i className="bi bi-bar-chart-steps" aria-hidden="true" /></span>
          <div>
            <p className="eyebrow mb-1">Progress Measurement</p>
            <h1 className="h3 mb-1">Construction Progress</h1>
            <p className="text-muted mb-0">Highway and structural progress tracking across all chainages.</p>
          </div>
        </div>
        <div className="heading-actions">
          <div className="btn-group btn-group-sm" role="group">
            <button
              type="button"
              className={`btn ${view === 'highway' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setView('highway')}
            >Highway</button>
            <button
              type="button"
              className={`btn ${view === 'structural' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setView('structural')}
            >Structural</button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <section className="row g-3 mt-1">
        {[
          { label: 'Overall Progress', value: `${overallProgress}%`, color: statusColor(overallProgress), icon: 'bi-bar-chart-fill' },
          { label: 'Highway Progress', value: `${overallHighway}%`, color: statusColor(overallHighway), icon: 'bi-road' },
          { label: 'Structural Progress', value: `${overallStructural}%`, color: statusColor(overallStructural), icon: 'bi-building' },
          { label: 'Active Chainages', value: MOCK_CHAINAGES.length.toString(), color: '#2563eb', icon: 'bi-geo-alt-fill' },
        ].map((card, i) => (
          <div key={i} className="col-12 col-sm-6 col-xl-3">
            <div className="panel h-100">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="fw-semibold text-muted small">{card.label}</span>
                <span className="panel-icon" style={{ background: `${card.color}18`, color: card.color }}>
                  <i className={`bi ${card.icon}`} />
                </span>
              </div>
              <div className="h3 fw-bold mb-0" style={{ color: card.color }}>{card.value}</div>
            </div>
          </div>
        ))}
      </section>

      {/* Chainage Progress Table */}
      <section className="panel mt-3">
        <div className="panel-header">
          <div>
            <h2 className="h5 mb-1 section-title">
              <i className="bi bi-list-check" aria-hidden="true" />
              <span>Chainage-wise Progress</span>
            </h2>
            <p className="text-muted mb-0">Detailed breakdown per chainage — {view === 'highway' ? 'Highway' : 'Structural'} view</p>
          </div>
        </div>
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>Chainage</th>
                <th>Site</th>
                <th>Project</th>
                <th className="text-center">Overall</th>
                <th className="text-center">{view === 'highway' ? 'Highway' : 'Structural'}</th>
                <th className="text-center">Workers</th>
                <th className="text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_CHAINAGES.map((ch) => {
                const pct = view === 'highway' ? ch.highwayProgress : ch.structuralProgress;
                const color = statusColor(pct);
                return (
                  <tr key={ch.id}>
                    <td>
                      <div className="fw-semibold">{ch.name}</div>
                      <small className="text-muted">{ch.id}</small>
                    </td>
                    <td className="text-muted small">{ch.site}</td>
                    <td className="text-muted small">{ch.project}</td>
                    <td className="text-center">
                      <div className="d-flex align-items-center gap-2 justify-content-center">
                        <div className="progress flex-grow-1" style={{ height: '6px', maxWidth: '80px' }}>
                          <div className="progress-bar" style={{ width: `${ch.progress}%`, background: statusColor(ch.progress) }} />
                        </div>
                        <small className="fw-bold">{ch.progress}%</small>
                      </div>
                    </td>
                    <td className="text-center">
                      <div className="d-flex align-items-center gap-2 justify-content-center">
                        <div className="progress flex-grow-1" style={{ height: '8px', maxWidth: '100px' }}>
                          <div className="progress-bar" style={{ width: `${pct}%`, background: color }} />
                        </div>
                        <small className="fw-bold" style={{ color }}>{pct}%</small>
                      </div>
                    </td>
                    <td className="text-center fw-semibold">{ch.workers}</td>
                    <td className="text-center">
                      <span className={`badge ${ch.status === 'green' ? 'text-bg-success' : ch.status === 'yellow' ? 'text-bg-warning' : 'text-bg-danger'}`}>
                        {ch.status === 'green' ? 'On Track' : ch.status === 'yellow' ? 'Delayed' : 'Critical'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
