import { useState, useEffect } from 'react';
import { safetyService } from '../services/safetyService';
import type { AIAlert } from '../types';

export const IntrusionDetectionPage = () => {
  const [alerts, setAlerts] = useState<AIAlert[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);

  useEffect(() => {
    let isMounted = true;
    safetyService.getAIAlerts()
      .then((data) => {
        if (isMounted) setAlerts(data);
      })
      .catch(() => {
        if (isMounted) setAlerts([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  const intrusionAlerts = alerts.filter(a =>
    ['restricted_zone', 'fire_detected', 'smoke_detected'].includes(a.type)
  );

  const stats = [
    { label: 'Restricted Zone Breaches', value: intrusionAlerts.filter(a => a.type === 'restricted_zone').length.toString(), color: '#dc2626', icon: 'bi-sign-stop-fill' },
    { label: 'Fire Detected', value: intrusionAlerts.filter(a => a.type === 'fire_detected').length.toString(), color: '#ea580c', icon: 'bi-fire' },
    { label: 'Smoke Detected', value: intrusionAlerts.filter(a => a.type === 'smoke_detected').length.toString(), color: '#d97706', icon: 'bi-cloud-fill' },
    { label: 'Total Intrusion Events', value: intrusionAlerts.length.toString(), color: '#2563eb', icon: 'bi-shield-exclamation' },
  ];

  const typeLabel = (type: string) => ({
    restricted_zone: 'Restricted Zone Breach',
    fire_detected: 'Fire Detected',
    smoke_detected: 'Smoke Detected',
  }[type] || type.replace('_', ' '));

  const typeIcon = (type: string) => ({
    restricted_zone: 'bi-sign-stop-fill text-danger',
    fire_detected: 'bi-fire text-warning',
    smoke_detected: 'bi-cloud-fill text-secondary',
  }[type] || 'bi-exclamation-circle text-danger');

  const totalPages = Math.max(1, Math.ceil(intrusionAlerts.length / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, intrusionAlerts.length);
  const paginatedAlerts = intrusionAlerts.slice(startIndex, endIndex);

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
    <div className="container-fluid px-3 px-lg-4 py-4">
      <div className="page-heading">
        <div className="page-heading-copy">
          <span className="page-icon"><i className="bi bi-shield-exclamation" aria-hidden="true" /></span>
          <div>
            <p className="eyebrow mb-1">Security & Safety</p>
            <h1 className="h3 mb-1">Intrusion Detection</h1>
            <p className="text-muted mb-0">AI-powered restricted zone monitoring, fire and smoke detection across all camera feeds.</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading intrusion alerts...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Stats */}
          <section className="row g-3 mt-1 mb-4">
            {stats.map((s, i) => (
              <div key={i} className="col-12 col-sm-6 col-xl-3">
                <div className="panel h-100">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="fw-semibold text-muted small">{s.label}</span>
                    <span className="panel-icon" style={{ background: `${s.color}18`, color: s.color }}>
                      <i className={`bi ${s.icon}`} />
                    </span>
                  </div>
                  <div className="h3 fw-bold mb-0" style={{ color: s.color }}>{s.value}</div>
                </div>
              </div>
            ))}
          </section>

          {/* Intrusion Events Table */}
          <section className="panel mt-3">
            <div className="panel-header">
              <div>
                <h2 className="h5 mb-1 section-title">
                  <i className="bi bi-exclamation-triangle-fill text-danger" aria-hidden="true" />
                  <span>Intrusion & Safety Events</span>
                </h2>
                <p className="text-muted mb-0">
                  {intrusionAlerts.length > 0 ? `${intrusionAlerts.length} events detected` : 'No intrusion events detected'}
                </p>
              </div>
            </div>
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr>
                    <th>Event Type</th>
                    <th>Site</th>
                    <th>Camera</th>
                    <th className="text-center">Severity</th>
                    <th>Timestamp</th>
                    <th className="text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {intrusionAlerts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center text-muted py-4">
                        <i className="bi bi-shield-check fs-2 d-block mb-2 text-success" />
                        No intrusion events detected. All zones are secure.
                      </td>
                    </tr>
                  ) : paginatedAlerts.map(alert => (
                    <tr key={alert.id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <i className={`bi ${typeIcon(alert.type)}`} />
                          <div>
                            <div className="fw-semibold">{typeLabel(alert.type)}</div>
                            <small className="text-muted">{alert.description}</small>
                          </div>
                        </div>
                      </td>
                      <td className="text-muted small">{alert.siteName}</td>
                      <td className="text-muted small">{alert.cameraName}</td>
                      <td className="text-center">
                        <span className={`badge ${alert.severity === 'critical' ? 'text-bg-danger' : alert.severity === 'high' ? 'text-bg-warning' : 'text-bg-secondary'}`}>
                          {alert.severity}
                        </span>
                      </td>
                      <td className="text-muted small">{new Date(alert.timestamp).toLocaleString()}</td>
                      <td className="text-center">
                        <span className={`badge ${alert.status === 'new' ? 'text-bg-danger' : alert.status === 'acknowledged' ? 'text-bg-warning' : 'text-bg-success'}`}>
                          {alert.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls Bar */}
            {intrusionAlerts.length > 0 && (
              <div className="p-3 border-top bg-light-subtle">
                <div className="d-flex flex-column flex-sm-row align-items-center justify-content-between gap-3">
                  <div className="d-flex align-items-center gap-2">
                    <span className="small text-muted">
                      Showing <strong>{startIndex + 1}</strong> to <strong>{endIndex}</strong> of <strong>{intrusionAlerts.length}</strong> events
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
                    <nav aria-label="Intrusion events pagination">
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
            )}
          </section>

          {/* Zone Map Placeholder */}
          <section className="panel mt-4">
            <div className="panel-header">
              <div>
                <h2 className="h5 mb-1 section-title">
                  <i className="bi bi-map-fill" aria-hidden="true" />
                  <span>Restricted Zone Map</span>
                </h2>
                <p className="text-muted mb-0">Camera coverage and restricted zone boundaries</p>
              </div>
            </div>
            <div
              className="rounded d-flex align-items-center justify-content-center text-muted"
              style={{ height: '240px', background: 'var(--bs-tertiary-bg, #f8f9fa)', border: '2px dashed var(--bs-border-color)' }}
            >
              <div className="text-center">
                <i className="bi bi-map fs-1 d-block mb-2" />
                <div className="fw-semibold">Zone Map View</div>
                <small>Interactive map with camera overlays coming soon</small>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
};
