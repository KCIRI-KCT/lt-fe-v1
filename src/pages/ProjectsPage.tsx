import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FilterableTable, type Column } from '../components/tables/ReusableDataTable';
import { MOCK_PROJECTS } from '../services/mockData';
import { STATUS_BADGES } from '../constants';

interface ProjectSiteRow {
  id: string;
  projectId: string;
  projectName: string;
  cityName: string;
  stateName: string;
  siteName: string;
  siteNumber: string;
  chainageName: string;
  chainageKm: number;
  managerName: string;
  managerId: string;
  supervisorName: string;
  supervisorId: string;
  engineerName: string;
  engineerId: string;
}

export const ProjectsPage = () => {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<string>('projectName');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterValues, setFilterValues] = useState<Record<string, string>>({
    stateName: '',
    cityName: '',
    managerName: '',
    supervisorName: '',
    engineerName: '',
  });

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const columns: Column<ProjectSiteRow>[] = [
    {
      key: 'projectName',
      header: 'Project Name',
      sortable: true,
      render: (r) => (
        <div className="d-flex align-items-center gap-1">
          <button
            type="button"
            className="btn btn-link p-0 text-start fw-semibold text-primary text-decoration-none"
            onClick={() => {
              setSelectedProjectId(r.projectId);
              setShowDetails(true);
            }}
          >
            {r.projectName}
          </button>
          <button
            type="button"
            className="btn btn-link p-0 text-muted"
            onClick={() => {
              setSelectedProjectId(r.projectId);
              setShowDetails(true);
            }}
            title="Quick Details"
          >
            <i className="bi bi-info-circle small" />
          </button>
        </div>
      )
    },
    { key: 'cityName', header: 'City', sortable: true },
    { key: 'stateName', header: 'State', sortable: true },
    { key: 'siteName', header: 'Site Name', sortable: true },
    { key: 'siteNumber', header: 'Site Number', sortable: true },
    { key: 'chainageName', header: 'Chainage Name', sortable: true, render: (r) => r.chainageName === 'N/A' ? 'N/A' : `${r.chainageName} (CH 0+${r.chainageKm})` },
    { key: 'managerName', header: 'Project Manager', sortable: true },
    { key: 'supervisorName', header: 'Site Supervisor', sortable: true },
    { key: 'engineerName', header: 'Site Engineer', sortable: true },
  ];

  // Flat-map projects to get a list of all project-site items
  const rows: ProjectSiteRow[] = MOCK_PROJECTS.flatMap((p) => {
    const sites = p.sites || [];
    if (sites.length === 0) {
      return [{
        id: `${p.id}-no-site`,
        projectId: p.id,
        projectName: p.name,
        cityName: p.cityName || 'N/A',
        stateName: p.stateName || 'N/A',
        siteName: 'N/A',
        siteNumber: 'N/A',
        chainageName: 'N/A',
        chainageKm: 0,
        managerName: p.managerName || 'N/A',
        managerId: p.managerId || '',
        supervisorName: p.supervisorName || 'N/A',
        supervisorId: p.supervisorId || '',
        engineerName: p.engineerName || 'N/A',
        engineerId: p.engineerId || '',
      }];
    }
    return sites.map((s) => ({
      id: `${p.id}-${s.id}`,
      projectId: p.id,
      projectName: p.name,
      cityName: p.cityName || 'N/A',
      stateName: p.stateName || 'N/A',
      siteName: s.siteName,
      siteNumber: s.siteNumber,
      chainageName: s.chainageName,
      chainageKm: s.chainageKm,
      managerName: p.managerName || 'N/A',
      managerId: p.managerId || '',
      supervisorName: p.supervisorName || 'N/A',
      supervisorId: p.supervisorId || '',
      engineerName: p.engineerName || 'N/A',
      engineerId: p.engineerId || '',
    }));
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilterValues({
      stateName: '',
      cityName: '',
      managerName: '',
      supervisorName: '',
      engineerName: '',
    });
    setPage(1);
  };

  const handleSort = (key: string, order: 'asc' | 'desc') => {
    setSortBy(key);
    setSortOrder(order);
  };

  // Generate filter options dynamically
  const uniqueCities = Array.from(new Set(rows.map(r => r.cityName))).map(c => ({ label: c, value: c }));
  const uniqueStates = Array.from(new Set(rows.map(r => r.stateName))).map(s => ({ label: s, value: s }));
  const uniquePMs = Array.from(new Set(rows.map(r => r.managerName))).map(m => ({ label: m, value: m }));
  const uniqueSupervisors = Array.from(new Set(rows.map(r => r.supervisorName))).map(s => ({ label: s, value: s }));
  const uniqueEngineers = Array.from(new Set(rows.map(r => r.engineerName))).map(e => ({ label: e, value: e }));

  const filters = [
    { key: 'stateName', label: 'State', type: 'select' as const, options: uniqueStates },
    { key: 'cityName', label: 'City', type: 'select' as const, options: uniqueCities },
    { key: 'managerName', label: 'Project Manager', type: 'select' as const, options: uniquePMs },
    { key: 'supervisorName', label: 'Site Supervisor', type: 'select' as const, options: uniqueSupervisors },
    { key: 'engineerName', label: 'Site Engineer', type: 'select' as const, options: uniqueEngineers },
  ];

  const filtered = rows.filter((r) => {
    const matchesSearch = !search ||
      r.projectName.toLowerCase().includes(search.toLowerCase()) ||
      r.siteName.toLowerCase().includes(search.toLowerCase()) ||
      r.siteNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.chainageName.toLowerCase().includes(search.toLowerCase());

    const matchesState = !filterValues.stateName || r.stateName === filterValues.stateName;
    const matchesCity = !filterValues.cityName || r.cityName === filterValues.cityName;
    const matchesPM = !filterValues.managerName || r.managerName === filterValues.managerName;
    const matchesSupervisor = !filterValues.supervisorName || r.supervisorName === filterValues.supervisorName;
    const matchesEngineer = !filterValues.engineerName || r.engineerName === filterValues.engineerName;

    return matchesSearch && matchesState && matchesCity && matchesPM && matchesSupervisor && matchesEngineer;
  });

  const sorted = [...filtered].sort((a, b) => {
    let valA = a[sortBy as keyof ProjectSiteRow] || '';
    let valB = b[sortBy as keyof ProjectSiteRow] || '';

    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const sliced = sorted.slice((page - 1) * pageSize, page * pageSize);

  const selectedProject = MOCK_PROJECTS.find(p => p.id === selectedProjectId);

  return (
    <div className="container-fluid px-3 px-lg-4 py-4">
      <div className="page-heading">
        <div className="page-heading-copy">
          <span className="page-icon"><i className="bi bi-building" aria-hidden="true" /></span>
          <div>
            <p className="eyebrow mb-1">Infrastructure</p>
            <h1 className="h3 mb-0">Projects</h1>
          </div>
        </div>
      </div>

      <FilterableTable
        columns={columns}
        data={sliced}
        keyExtractor={(r) => r.id}
        searchQuery={search}
        onSearch={(q) => { setSearch(q); setPage(1); }}
        searchPlaceholder="Search by project, site, chainage..."
        total={sorted.length}
        filters={filters}
        filterValues={filterValues}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        showPagination={true}
        rowClassName={(r) => {
          const parentProj = MOCK_PROJECTS.find(p => p.id === r.projectId);
          return parentProj?.status === 'completed' ? 'project-row-finished' : '';
        }}
      />

      {showDetails && selectedProject && (() => {
        const getWeeks = (startStr?: string, endStr?: string) => {
          if (!startStr || !endStr) return { finished: 0, remaining: 0 };
          const today = new Date();
          const start = new Date(startStr);
          const end = new Date(endStr);
          if (isNaN(start.getTime()) || isNaN(end.getTime())) return { finished: 0, remaining: 0 };

          let finished = 0;
          if (today.getTime() > start.getTime()) {
            const elapsedMs = Math.min(today.getTime(), end.getTime()) - start.getTime();
            finished = Math.max(0, Math.ceil(elapsedMs / (1000 * 60 * 60 * 24 * 7)));
          }
          
          let remaining = 0;
          if (today.getTime() < end.getTime()) {
            const remainingMs = end.getTime() - Math.max(today.getTime(), start.getTime());
            remaining = Math.max(0, Math.ceil(remainingMs / (1000 * 60 * 60 * 24 * 7)));
          }
          
          return { finished, remaining };
        };

        const { finished, remaining } = getWeeks(selectedProject.startDate, selectedProject.endDate);

        return (
          <>
            <div className="modal-backdrop fade show" onClick={() => setShowDetails(false)} />
            <div className="modal fade show d-block" tabIndex={-1} role="dialog" aria-modal="true" style={{ background: 'rgba(0,0,0,0.5)' }}>
              <div className="modal-dialog modal-lg modal-dialog-centered">
                <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '12px' }}>
                  <div className="modal-header bg-light border-bottom">
                    <div>
                      <span className="eyebrow mb-1 text-muted text-uppercase small" style={{ fontSize: '0.7rem' }}>Project Details</span>
                      <h5 className="modal-title fw-bold text-primary">{selectedProject.name}</h5>
                      <span className="badge bg-secondary-subtle text-secondary-emphasis border mt-1" style={{ fontSize: '0.75rem' }}>{selectedProject.code}</span>
                    </div>
                    <button type="button" className="btn-close" aria-label="Close" onClick={() => setShowDetails(false)} />
                  </div>
                  <div className="modal-body p-4" style={{ maxHeight: 'calc(100vh - 220px)', overflowY: 'auto' }}>
                    <div className="row g-4">
                      {/* General Info */}
                      <div className="col-12">
                        <div className="bg-light p-3 rounded border">
                          <h6 className="fw-bold mb-2 text-uppercase text-secondary small" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>Description</h6>
                          <p className="mb-0 text-muted" style={{ fontSize: '0.9rem' }}>{selectedProject.description || 'No description provided.'}</p>
                        </div>
                      </div>

                      <div className="col-6 col-md-3">
                        <h6 className="fw-bold mb-1 text-uppercase text-secondary small" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>Location</h6>
                        <p className="mb-0 fw-semibold">{selectedProject.cityName}, {selectedProject.stateName}</p>
                      </div>
                      <div className="col-6 col-md-3">
                        <h6 className="fw-bold mb-1 text-uppercase text-secondary small" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>Start / End Date</h6>
                        <p className="mb-0 fw-semibold">{selectedProject.startDate} to {selectedProject.endDate || 'N/A'}</p>
                      </div>
                      <div className="col-6 col-md-3">
                        <h6 className="fw-bold mb-1 text-uppercase text-secondary small" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>Weeks Timeline</h6>
                        <p className="mb-0 small">
                          Finished: <strong className="text-success">{finished}</strong> | Remaining: <strong className="text-primary">{remaining}</strong>
                        </p>
                      </div>
                      <div className="col-6 col-md-3">
                        <h6 className="fw-bold mb-1 text-uppercase text-secondary small" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>Status</h6>
                        <span className={`badge ${STATUS_BADGES[selectedProject.status] || 'text-bg-secondary'} text-capitalize`}>
                          {selectedProject.status}
                        </span>
                      </div>

                      <div className="col-12">
                        <h6 className="fw-bold mb-1 text-uppercase text-secondary small" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>Overall Progress</h6>
                        <div className="d-flex align-items-center gap-2 mt-1">
                          <div className="progress flex-grow-1" style={{ height: '8px' }}>
                            <div className="progress-bar" style={{ width: `${selectedProject.progress}%` }} />
                          </div>
                          <span className="fw-bold">{selectedProject.progress}%</span>
                        </div>
                      </div>

                      {/* Role Assignments */}
                      <div className="col-12 col-md-6">
                        <div className="border rounded p-3 bg-white h-100">
                          <h6 className="fw-bold border-bottom pb-2 mb-3 text-primary" style={{ fontSize: '0.85rem' }}><i className="bi bi-people-fill me-2" />Personnel & Role Assignments</h6>
                          {selectedProject.roleAssignments && selectedProject.roleAssignments.length > 0 ? (
                            <div className="d-grid gap-2">
                              {selectedProject.roleAssignments.map((ra, idx) => (
                                <div key={idx} className="p-2 border rounded bg-light-subtle d-flex flex-column">
                                  <div className="d-flex justify-content-between align-items-center mb-1">
                                    <span className="badge bg-primary-subtle text-primary border text-capitalize small" style={{ fontSize: '0.65rem' }}>
                                      {ra.role.replace(/_/g, ' ')}
                                    </span>
                                  </div>
                                  <div className="fw-bold" style={{ fontSize: '0.9rem' }}>{ra.userName}</div>
                                  <div className="text-muted small" style={{ fontSize: '0.75rem' }}><i className="bi bi-geo-alt me-1" />Allocated Site: {ra.siteName}</div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="d-grid gap-2 text-muted small">
                              {selectedProject.managerName && (
                                <div className="p-2 border rounded bg-light-subtle">
                                  <span className="badge bg-light border text-secondary me-1">Manager</span>
                                  <strong>{selectedProject.managerName}</strong>
                                </div>
                              )}
                              {selectedProject.supervisorName && (
                                <div className="p-2 border rounded bg-light-subtle">
                                  <span className="badge bg-light border text-secondary me-1">Supervisor</span>
                                  <strong>{selectedProject.supervisorName}</strong>
                                </div>
                              )}
                              {selectedProject.engineerName && (
                                <div className="p-2 border rounded bg-light-subtle">
                                  <span className="badge bg-light border text-secondary me-1">Engineer</span>
                                  <strong>{selectedProject.engineerName}</strong>
                                </div>
                              )}
                              {!selectedProject.managerName && !selectedProject.supervisorName && !selectedProject.engineerName && 'No personnel assigned.'}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Sites and Chainages */}
                      <div className="col-12 col-md-6">
                        <div className="border rounded p-3 bg-white h-100">
                          <h6 className="fw-bold border-bottom pb-2 mb-3 text-primary" style={{ fontSize: '0.85rem' }}><i className="bi bi-geo-alt-fill me-2" />Sites & Chainages ({selectedProject.sites?.length || 0})</h6>
                          {selectedProject.sites && selectedProject.sites.length > 0 ? (
                            <div className="d-grid gap-2" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                              {selectedProject.sites.map((s) => (
                                <div key={s.id} className="p-2 border rounded bg-light-subtle">
                                  <div className="fw-bold text-dark" style={{ fontSize: '0.9rem' }}>{s.siteName} ({s.siteNumber})</div>
                                  <div className="text-muted small" style={{ fontSize: '0.75rem' }}>{s.chainageName} — CH 0+{s.chainageKm}</div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-muted small mb-0">No sites configured for this project.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer bg-light border-top">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowDetails(false)}>Close Details</button>
                    {selectedProject.status === 'completed' ? (
                      <button type="button" className="btn btn-primary" disabled title="Completed projects cannot be edited">
                        <i className="bi bi-lock-fill me-1" /> Edit Disabled (Finished)
                      </button>
                    ) : (
                      <Link to={`/projects/${selectedProject.id}`} className="btn btn-primary">
                        <i className="bi bi-pencil me-1" /> Edit Project
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        );
      })()}
    </div>
  );
};