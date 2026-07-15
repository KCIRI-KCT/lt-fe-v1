export const Tables = () => (
  <div className="container-fluid px-3 px-lg-4 py-4">
    <div className="page-heading">
      <div className="page-heading-copy">
        <span className="page-icon"><i className="bi bi-table" aria-hidden="true" /></span>
        <div>
          <p className="eyebrow mb-1">Data</p>
          <h1 className="h3 mb-1">Tables</h1>
          <p className="text-muted mb-0">View and manage structured data records.</p>
        </div>
      </div>
      <div className="heading-actions">
        <button className="btn btn-outline-secondary btn-sm"><i className="bi bi-download" aria-hidden="true" /> Export</button>
        <button className="btn btn-primary btn-sm"><i className="bi bi-plus-lg" aria-hidden="true" /> Add Record</button>
      </div>
    </div>
    <div className="panel mt-1">
      <div className="panel-header">
        <div>
          <h2 className="h5 mb-1 section-title"><i className="bi bi-list-columns" aria-hidden="true" /><span>All Records</span></h2>
          <p className="text-muted mb-0">Sorted by most recent activity.</p>
        </div>
      </div>
      <div className="table-responsive">
        <table className="table align-middle mb-0">
          <thead>
            <tr><th scope="col">#</th><th scope="col">Name</th><th scope="col">Category</th><th scope="col">Status</th><th scope="col">Date</th><th scope="col" className="text-end">Action</th></tr>
          </thead>
          <tbody>
            {[
              { id: 1, name: 'Wireless Headphones', cat: 'Electronics', status: 'Active', date: '2026-06-12' },
              { id: 2, name: 'Desk Lamp Pro', cat: 'Furniture', status: 'Draft', date: '2026-06-10' },
              { id: 3, name: 'Ergonomic Chair', cat: 'Furniture', status: 'Active', date: '2026-06-08' },
              { id: 4, name: 'USB-C Hub', cat: 'Electronics', status: 'Archived', date: '2026-06-05' },
              { id: 5, name: 'Notebook Set', cat: 'Stationery', status: 'Active', date: '2026-06-03' },
            ].map((row) => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td className="fw-semibold">{row.name}</td>
                <td>{row.cat}</td>
                <td><span className={`badge text-bg-${row.status === 'Active' ? 'success' : row.status === 'Draft' ? 'warning' : 'secondary'}`}>{row.status}</span></td>
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