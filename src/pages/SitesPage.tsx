import { useState, useEffect } from 'react';
import { SiteCard } from '../components/cards/SiteCard';
import { siteService } from '../services/siteService';
import type { Site } from '../types';

export const SitesPage = () => {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    let isMounted = true;
    siteService.getSites()
      .then((data) => {
        if (isMounted) setSites(data);
      })
      .catch(() => {
        if (isMounted) setSites([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  const filtered = sites.filter((s) => {
    if (filter !== 'all' && s.status !== filter) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.code.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(6);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filtered.length);
  const paginatedSites = filtered.slice(startIndex, endIndex);

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
          <span className="page-icon"><i className="bi bi-geo-alt" aria-hidden="true" /></span>
          <div>
            <p className="eyebrow mb-1">Construction</p>
            <h1 className="h3 mb-0">Sites</h1>
          </div>
        </div>
        <div className="heading-actions">
          <button className="btn btn-primary btn-sm"><i className="bi bi-plus-lg" /> New Site</button>
        </div>
      </div>

      <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
        <input
          className="form-control form-control-sm table-search"
          type="search"
          placeholder="Search sites..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />
        <div className="d-flex gap-1">
          {['all', 'active', 'inactive', 'maintenance', 'completed'].map((s) => (
            <button
              key={s}
              className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => {
                setFilter(s);
                setCurrentPage(1);
              }}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-2 text-muted">Loading sites...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-5 bg-white rounded border shadow-sm">
          <i className="bi bi-geo-alt-fill fs-1 text-muted d-block mb-2" />
          <h5 className="fw-bold text-dark">No Sites Found</h5>
          <p className="text-muted small mb-0">No construction sites match the specified filter criteria.</p>
        </div>
      ) : (
        <>
          <div className="row g-3 mb-4">
            {paginatedSites.map((site) => (
              <div key={site.id} className="col-12 col-sm-6 col-xl-4">
                <SiteCard site={site} onView={(id) => console.log('View site', id)} />
              </div>
            ))}
          </div>

          {/* Pagination Controls Bar */}
          <div className="card border-0 shadow-sm p-3 bg-white mb-4">
            <div className="d-flex flex-column flex-sm-row align-items-center justify-content-between gap-3">
              <div className="d-flex align-items-center gap-2">
                <span className="small text-muted">
                  Showing <strong>{filtered.length > 0 ? startIndex + 1 : 0}</strong> to <strong>{endIndex}</strong> of <strong>{filtered.length}</strong> sites
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
                  <option value={3}>3 / page</option>
                  <option value={6}>6 / page</option>
                  <option value={12}>12 / page</option>
                  <option value={24}>24 / page</option>
                </select>
              </div>

              {totalPages > 1 && (
                <nav aria-label="Sites pagination">
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