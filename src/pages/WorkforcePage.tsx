import { useState, useEffect } from 'react';
import { ReusableDataTable, type Column } from '../components/tables/ReusableDataTable';
import { workerService } from '../services/workerService';
import { fetchLiveDataForReport, generatePDFBlob, generateCSVBlob, openPDFPrintWindow, triggerBrowserDownload } from '../services/reportService';
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
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  useEffect(() => {
    let isMounted = true;
    workerService.getWorkers()
      .then((data) => {
        if (isMounted) setWorkers(data);
      })
      .catch(() => {
        if (isMounted) setWorkers([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  const filtered = workers.filter((w) =>
    !search || w.name.toLowerCase().includes(search.toLowerCase()) || w.employeeId.toLowerCase().includes(search.toLowerCase())
  );

  const sliced = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="container-fluid px-3 px-md-4 py-3 py-lg-4">
      <div className="page-heading">
        <div className="page-heading-copy">
          <span className="page-icon"><i className="bi bi-person-badge" aria-hidden="true" /></span>
          <div>
            <p className="eyebrow mb-1">Human Resources</p>
            <h1 className="h3 mb-0">Workforce</h1>
          </div>
        </div>
        <div className="heading-actions d-flex gap-2">
          <div className="dropdown">
            <button
              className="btn btn-outline-secondary btn-sm dropdown-toggle fw-semibold"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <i className="bi bi-download me-1" /> Export Report
            </button>
            <ul className="dropdown-menu dropdown-menu-end shadow-sm">
              <li>
                <button
                  className="dropdown-item d-flex align-items-center gap-2 small text-danger"
                  onClick={async () => {
                    const liveData = await fetchLiveDataForReport();
                    openPDFPrintWindow({ title: 'Workforce Attendance & Deployment Report', format: 'pdf' }, liveData);
                    const blob = generatePDFBlob({ title: 'Workforce_Attendance_Report', format: 'pdf' }, liveData);
                    triggerBrowserDownload(blob, 'workforce_attendance_report.pdf');
                  }}
                >
                  <i className="bi bi-file-pdf-fill" /> Export PDF (L&amp;T Standard)
                </button>
              </li>
              <li>
                <button
                  className="dropdown-item d-flex align-items-center gap-2 small text-success"
                  onClick={async () => {
                    const liveData = await fetchLiveDataForReport();
                    const blob = generateCSVBlob({ title: 'Workforce_Attendance_Report', format: 'csv' }, liveData);
                    triggerBrowserDownload(blob, 'workforce_attendance_report.csv');
                  }}
                >
                  <i className="bi bi-filetype-csv" /> Export CSV Dataset
                </button>
              </li>
            </ul>
          </div>
          <button className="btn btn-primary btn-sm"><i className="bi bi-person-plus me-1" /> Add Worker</button>
        </div>
      </div>
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-2 text-muted">Loading workforce data...</p>
        </div>
      ) : (
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
      )}
    </div>
  );
};