import { useState } from 'react';
import { ReusableDataTable, type Column } from '../components/tables/ReusableDataTable';
import { MOCK_WORKERS } from '../services/mockData';
import type { Worker } from '../types';
import { STATUS_BADGES } from '../constants';

const columns: Column<Worker>[] = [
  { key: 'name', header: 'Worker', render: (w) => (
    <div>
      <p className="fw-semibold mb-0">{w.name}</p>
      <small className="text-muted">{w.employeeId}</small>
    </div>
  )},
  { key: 'designation', header: 'Designation' },
  { key: 'department', header: 'Department' },
  { key: 'siteName', header: 'Site' },
  { key: 'status', header: 'Status', render: (w) => (
    <span className={`badge ${STATUS_BADGES[w.status] || 'text-bg-secondary'}`}>{w.status}</span>
  )},
  { key: 'phone', header: 'Contact' },
  { key: 'actions', header: 'Action', className: 'text-end', render: () => (
    <button className="btn btn-light btn-sm">View</button>
  )},
];

export const WorkforcePage = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const filtered = MOCK_WORKERS.filter((w) =>
    !search || w.name.toLowerCase().includes(search.toLowerCase()) || w.employeeId.toLowerCase().includes(search.toLowerCase())
  );

  const sliced = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="container-fluid px-3 px-lg-4 py-4">
      <div className="page-heading">
        <div className="page-heading-copy">
          <span className="page-icon"><i className="bi bi-person-badge" aria-hidden="true" /></span>
          <div>
            <p className="eyebrow mb-1">Human Resources</p>
            <h1 className="h3 mb-0">Workforce</h1>
          </div>
        </div>
        <div className="heading-actions">
          <button className="btn btn-outline-secondary btn-sm"><i className="bi bi-download" /> Export</button>
          <button className="btn btn-primary btn-sm"><i className="bi bi-person-plus" /> Add Worker</button>
        </div>
      </div>
      <ReusableDataTable
        columns={columns}
        data={sliced}
        keyExtractor={(w) => w.id}
        searchQuery={search}
        onSearch={(q) => { setSearch(q); setPage(1); }}
        searchPlaceholder="Search workers..."
        total={filtered.length}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        showPagination={true}
      />
    </div>
  );
};