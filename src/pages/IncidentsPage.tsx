import { useState, useEffect } from 'react';
import { IncidentCard } from '../components/cards/IncidentCard';
import { safetyService } from '../services/safetyService';
import { SEVERITY_BADGES } from '../constants';
import type { Incident } from '../types';

export const IncidentsPage = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);

  useEffect(() => {
    let isMounted = true;
    safetyService.getIncidents()
      .then((data) => {
        if (isMounted) setIncidents(data);
      })
      .catch(() => {
        if (isMounted) setIncidents([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  const filtered = incidents.filter((i) => filter === 'all' || i.status === filter);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filtered.length);
  const paginatedIncidents = filtered.slice(startIndex, endIndex);

  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, safeCurrentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="container-fluid px-3 px-md-4 py-3 py-lg-4">
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
            onClick={() => {
              setFilter(s);
              setCurrentPage(1);
            }}
          >
            <span className="text-capitalize">{s}</span>
            <span className="ms-1 badge">{s === 'all' ? incidents.length : incidents.filter((i) => i.status === s).length}</span>
          </button>
        ))}
      </div>

      <div className="row g-3 mb-3">
        {['critical', 'major', 'minor', 'observation'].map((sev) => (
          <div key={sev} className="col-6 col-sm-3">
            <div className="mini-card text-center p-3">
              <strong className="fs-4">{incidents.filter((i) => i.severity === sev).length}</strong>
              <span className={`badge ${SEVERITY_BADGES[sev]} mt-1`}>{sev}</span>
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-2 text-muted">Loading safety incidents...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="panel blank-panel">
          <div className="blank-state">
            <i className="bi bi-check-circle fs-1 text-success mb-3 d-block" />
            <h5 className="fw-bold mb-2">No Incidents Found</h5>
            <p className="text-muted small mb-0">All clear for the selected filter.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="d-flex flex-column gap-3 mb-4">
            {paginatedIncidents.map((incident) => (
              <IncidentCard
                key={incident.id}
                incident={incident}
                onView={(id) => console.log('View', id)}
                onAssign={(id) => console.log('Assign', id)}
                onResolve={(id) => console.log('Resolve', id)}
              />
            ))}
          </div>

          {/* Pagination Controls Bar */}
          <div className="card border-0 shadow-sm p-3 bg-white mb-4">
            <div className="d-flex flex-column flex-sm-row align-items-center justify-content-between gap-3">
              <div className="d-flex align-items-center gap-2">
                <span className="small text-muted">
                  Showing <strong>{filtered.length > 0 ? startIndex + 1 : 0}</strong> to <strong>{endIndex}</strong> of <strong>{filtered.length}</strong> incidents
                </span>
                <span className="text-muted mx-1">|</span>
                <select
                  className="form-select form-select-sm"
                  style={{ width: 'auto' }}
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value={5}>5 / page</option>
                  <option value={10}>10 / page</option>
                  <option value={20}>20 / page</option>
                </select>
              </div>

              {totalPages > 1 && (
                <nav aria-label="Incidents pagination">
                  <ul className="pagination pagination-sm mb-0">
                    <li className={`page-item ${safeCurrentPage <= 1 ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={safeCurrentPage <= 1}
                      >
                        <i className="bi bi-chevron-left me-1" />Previous
                      </button>
                    </li>
                    {getPageNumbers().map((p) => (
                      <li key={p} className={`page-item ${p === safeCurrentPage ? 'active' : ''}`}>
                        <button className="page-link" onClick={() => setCurrentPage(p)}>{p}</button>
                      </li>
                    ))}
                    <li className={`page-item ${safeCurrentPage >= totalPages ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={safeCurrentPage >= totalPages}
                      >
                        Next<i className="bi bi-chevron-right ms-1" />
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};