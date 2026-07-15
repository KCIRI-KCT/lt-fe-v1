import { useState } from 'react';
import { SiteCard } from '../components/cards/SiteCard';
import { MOCK_SITES } from '../services/mockData';

export const SitesPage = () => {
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filtered = MOCK_SITES.filter((s) => {
    if (filter !== 'all' && s.status !== filter) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.code.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

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
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="d-flex gap-1">
          {['all', 'active', 'inactive', 'maintenance', 'completed'].map((s) => (
            <button
              key={s}
              className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setFilter(s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="row g-3">
        {filtered.map((site) => (
          <div key={site.id} className="col-12 col-sm-6 col-xl-4">
            <SiteCard site={site} onView={(id) => console.log('View site', id)} />
          </div>
        ))}
      </div>
    </div>
  );
};