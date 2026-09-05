import { getStatusBadgeClass } from '../constants';

export const Tables = () => (
  <div className="container-fluid px-3 px-md-4 py-3 py-lg-4">
    <div className="page-heading mb-4">
      <div className="page-heading-copy">
        <span className="page-icon"><i className="bi bi-table" aria-hidden="true" /></span>
        <div>
          <p className="eyebrow mb-1">Data</p>
          <h1 className="h3 mb-1">Data Tables</h1>
          <p className="text-muted mb-0">Clean responsive table views with status badge tags.</p>
        </div>
      </div>
      <div className="heading-actions">
        <button className="btn btn-outline-secondary btn-sm"><i className="bi bi-download" aria-hidden="true" /> Export</button>
      </div>
    </div>

    <div className="panel p-3">
      <div className="table-responsive">
        <table className="table align-middle mb-0">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Category</th>
              <th>Status</th>
              <th>Date</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {[
              { id: 1, name: 'Wireless Headphones', cat: 'Electronics', status: 'Active', date: '2026-06-12' },
              { id: 2, name: 'Desk Lamp Pro', cat: 'Furniture', status: 'Draft', date: '2026-06-10' },
              { id: 3, name: 'Ergonomic Chair', cat: 'Furniture', status: 'Active', date: '2026-06-08' },
              { id: 4, name: 'USB-C Hub', cat: 'Electronics', status: 'In Progress', date: '2026-06-05' },
              { id: 5, name: 'Notebook Set', cat: 'Stationery', status: 'Active', date: '2026-06-03' },
            ].map((row) => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td className="fw-semibold">{row.name}</td>
                <td>{row.cat}</td>
                <td><span className={`badge ${getStatusBadgeClass(row.status)}`}>{row.status}</span></td>
                <td>{row.date}</td>
                <td className="text-end"><button className="btn btn-light btn-sm">View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);