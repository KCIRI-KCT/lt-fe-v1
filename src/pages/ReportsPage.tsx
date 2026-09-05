import { useState, useEffect } from 'react';
import { ReusableDataTable, type Column } from '../components/tables/ReusableDataTable';
import { reportService, generateCSVBlob, generatePDFBlob, fetchLiveDataForReport, openPDFPrintWindow, triggerBrowserDownload } from '../services/reportService';
import { projectService } from '../services/projectService';
import { siteService } from '../services/siteService';
import { GenerateReportModal } from '../components/reports/GenerateReportModal';
import { useApp } from '../hooks/useApp';
import type { Report, Project, Site, Chainage, ReportHistoryItem } from '../types';

const STATUS_CONFIGS: Record<string, { icon: string; activeClass: string; color: string; label: string }> = {
  all: { icon: 'bi-files', activeClass: 'bg-primary-subtle border-primary text-primary', color: '#0d6efd', label: 'All Reports' },
  ready: { icon: 'bi-check-circle-fill', activeClass: 'bg-success-subtle border-success text-success', color: '#198754', label: 'Ready' },
  generating: { icon: 'bi-hourglass-split', activeClass: 'bg-warning-subtle border-warning text-warning', color: '#ffc107', label: 'Generating' },
  pdf: { icon: 'bi-file-pdf-fill', activeClass: 'bg-danger-subtle border-danger text-danger', color: '#dc3545', label: 'PDF Format' },
  excel: { icon: 'bi-file-earmark-excel-fill', activeClass: 'bg-info-subtle border-info text-info', color: '#0dcaf0', label: 'Excel/CSV Format' },
};

export const ReportsPage = () => {
  const { user } = useApp();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Dynamic DB data state
  const [dbProjects, setDbProjects] = useState<Project[]>([]);
  const [dbSites, setDbSites] = useState<Site[]>([]);
  const [dbChainages, setDbChainages] = useState<Chainage[]>([]);

  // Filters dropdown state
  const [filterProject, setFilterProject] = useState('');
  const [filterSite, setFilterSite] = useState('');
  const [filterChainage, setFilterChainage] = useState('');

  // Applied filter state
  const [appliedProject, setAppliedProject] = useState('');
  const [appliedSite, setAppliedSite] = useState('');
  const [appliedChainage, setAppliedChainage] = useState('');

  // Modal and state
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [previewReport, setPreviewReport] = useState<Report | null>(null);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      reportService.getReports().catch(() => []),
      projectService.getProjects().catch(() => []),
      siteService.getSites().catch(() => []),
      siteService.getChainages().catch(() => []),
    ]).then(([reportsData, projectsData, sitesData, chainagesData]) => {
      if (!isMounted) return;
      if (Array.isArray(reportsData)) setReports(reportsData);
      if (Array.isArray(projectsData)) setDbProjects(projectsData);
      if (Array.isArray(sitesData)) setDbSites(sitesData);
      if (Array.isArray(chainagesData)) setDbChainages(chainagesData);
    }).finally(() => {
      if (isMounted) setLoading(false);
    });
    return () => { isMounted = false; };
  }, []);

  const handleDownloadReport = async (r: Report) => {
    const cleanTitle = (r.title || 'Report').replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
    
    const liveData = await fetchLiveDataForReport({
      projectId: r.projectId,
      siteId: r.siteId,
      chainageId: r.chainageId,
    });

    if (r.format === 'csv' || r.format === 'excel') {
      const blob = generateCSVBlob(r, liveData);
      triggerBrowserDownload(blob, `${cleanTitle}.csv`);
    } else {
      openPDFPrintWindow(r, liveData);
      const blob = generatePDFBlob(r, liveData);
      triggerBrowserDownload(blob, `${cleanTitle}.pdf`);
    }
  };

  const handleNewReportGenerated = (newHistoryItem: ReportHistoryItem) => {
    const formatKey = (newHistoryItem.format || 'PDF').toLowerCase() as 'pdf' | 'csv' | 'excel';
    const newReport: Report = {
      id: String(newHistoryItem.id || Date.now()),
      title: newHistoryItem.reportName || 'Generated Report',
      type: (newHistoryItem.reportType?.toLowerCase().replace(/\s+/g, '_') || 'daily_safety') as Report['type'],
      description: `Report for ${newHistoryItem.project} - ${newHistoryItem.site} (${newHistoryItem.chainage})`,
      generatedAt: new Date().toISOString(),
      generatedBy: newHistoryItem.generatedBy || user?.name || 'User',
      format: formatKey,
      status: 'ready',
      projectId: newHistoryItem.projectId || appliedProject || undefined,
      siteId: newHistoryItem.siteId || appliedSite || undefined,
      chainageId: newHistoryItem.chainageId || appliedChainage || undefined,
    };

    reportService.addReport(newReport);
    setReports((prev) => [newReport, ...prev.filter((r) => String(r.id) !== String(newReport.id))]);
  };

  const availableSites = filterProject
    ? dbSites.filter((s) => String(s.projectId || '') === String(filterProject))
    : dbSites;

  const availableChainages = filterSite
    ? dbChainages.filter((c) => String(c.siteId || '') === String(filterSite))
    : dbChainages;

  const filtered = reports.filter((r) => {
    if (search && !r.title.toLowerCase().includes(search.toLowerCase()) && !r.generatedBy.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === 'ready' && r.status !== 'ready') return false;
    if (filter === 'generating' && r.status !== 'generating') return false;
    if (filter === 'pdf' && r.format !== 'pdf') return false;
    if (filter === 'excel' && (r.format !== 'excel' && r.format !== 'csv')) return false;

    // Role-based Site Scoping for Site Engineer / Site Supervisor (stashed enhancement)
    if (user?.role === 'site_engineer' || user?.role === 'site_supervisor') {
      const userSite = user.siteId || user.siteName;
      if (userSite && r.siteId && String(r.siteId) !== String(userSite)) return false;
    }

    if (appliedProject && r.projectId && String(r.projectId) !== String(appliedProject)) return false;
    if (appliedSite && r.siteId && String(r.siteId) !== String(appliedSite)) return false;
    if (appliedChainage && r.chainageId && String(r.chainageId) !== String(appliedChainage)) return false;

    return true;
  });

  const sliced = filtered.slice((page - 1) * pageSize, page * pageSize);

  const columns: Column<Report>[] = [
    {
      key: 'title', header: 'Report', render: (r) => (
        <div>
          <p className="fw-semibold mb-0 text-dark">{r.title}</p>
          <small className="text-muted">{r.description || 'System Analytics Report'}</small>
        </div>
      )
    },
    {
      key: 'type', header: 'Type', render: (r) => (
        <span className="badge text-bg-primary text-capitalize">{r.type.replace(/_/g, ' ')}</span>
      )
    },
    {
      key: 'format', header: 'Format', render: (r) => (
        <span className={`badge ${r.format === 'pdf' ? 'text-bg-danger' : r.format === 'excel' ? 'text-bg-success' : 'text-bg-info'}`}>
          <i className={`bi ${r.format === 'pdf' ? 'bi-file-pdf-fill' : r.format === 'csv' ? 'bi-filetype-csv' : 'bi-file-earmark-excel-fill'} me-1`} />
          {r.format.toUpperCase()}
        </span>
      )
    },
    { key: 'generatedBy', header: 'Generated By' },
    { key: 'generatedAt', header: 'Date', render: (r) => new Date(r.generatedAt).toLocaleDateString() },
    {
      key: 'status', header: 'Status', render: (r) => (
        <span className={`badge ${r.status === 'ready' ? 'text-bg-success' : r.status === 'generating' ? 'text-bg-warning' : 'text-bg-danger'}`}>
          {r.status}
        </span>
      )
    },
    {
      key: 'actions', header: 'Action', className: 'text-end', render: (r) => (
        <div className="d-flex gap-1 justify-content-end">
          {r.status === 'ready' && (
            <button
              className="btn btn-sm btn-outline-primary"
              title={`Download ${r.format.toUpperCase()}`}
              onClick={() => handleDownloadReport(r)}
            >
              <i className="bi bi-download" />
            </button>
          )}
          <button
            className="btn btn-sm btn-outline-secondary"
            title="Preview Details"
            onClick={() => setPreviewReport(r)}
          >
            <i className="bi bi-eye" />
          </button>
        </div>
      )
    },
  ];

  return (
    <div className="container-fluid px-3 px-md-4 py-3 py-lg-4">
      {/* Header */}
      <div className="page-heading d-flex justify-content-between align-items-center mb-4">
        <div className="page-heading-copy d-flex align-items-center gap-2">
          <span className="page-icon bg-primary text-white p-2 rounded">
            <i className="bi bi-file-earmark-bar-graph fs-4" aria-hidden="true" />
          </span>
          <div>
            <h1 className="h3 mb-0 fw-bold">Reports & History</h1>
            <p className="text-muted small mb-0">Generate and export standard PDF & CSV reports across all site locations.</p>
          </div>
        </div>
        <div className="heading-actions d-flex gap-2">
          <button
            className="btn btn-primary btn-sm px-3 shadow-sm fw-semibold"
            onClick={() => setShowGenerateModal(true)}
          >
            <i className="bi bi-plus-lg me-1" /> Generate Report
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="card border-0 shadow-sm p-3 mb-4 bg-white">
        <div className="row g-2 align-items-center">
          <div className="col-auto">
            <span className="small text-muted fw-bold text-uppercase">
              Report Filters:
            </span>
          </div>

          {/* Project dropdown - only for Admin and PM */}
          {(user?.role === 'admin' || user?.role === 'project_manager' || !user?.role) && (
            <div className="col-sm-3 col-md-3 col-xl-2">
              <select
                className="form-select form-select-sm"
                value={filterProject}
                onChange={(e) => {
                  setFilterProject(e.target.value);
                  setFilterSite('');
                  setFilterChainage('');
                }}
              >
                <option value="">All Projects</option>
                {dbProjects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Site dropdown */}
          <div className="col-sm-3 col-md-3 col-xl-2">
            <select
              className="form-select form-select-sm"
              value={filterSite}
              onChange={(e) => {
                setFilterSite(e.target.value);
                setFilterChainage('');
              }}
            >
              <option value="">All Sites</option>
              {availableSites.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.code || s.location})</option>
              ))}
            </select>
          </div>

          {/* Chainage dropdown */}
          <div className="col-sm-3 col-md-3 col-xl-2">
            <select
              className="form-select form-select-sm"
              value={filterChainage}
              onChange={(e) => setFilterChainage(e.target.value)}
              disabled={!filterSite && availableChainages.length === 0}
            >
              <option value="">All Chainages</option>
              {availableChainages.map((c) => (
                <option key={c.id} value={c.id}>{c.name} {c.kmMarker ? `(${c.kmMarker})` : ''}</option>
              ))}
            </select>
          </div>

          {/* Action buttons */}
          <div className="col-auto ms-auto d-flex gap-2">
            <button
              className="btn btn-sm btn-primary px-3 fw-bold"
              onClick={() => {
                setAppliedProject(filterProject);
                setAppliedSite(filterSite);
                setAppliedChainage(filterChainage);
              }}
            >
              Apply Filter
            </button>
            <button
              className="btn btn-sm btn-outline-secondary px-3"
              onClick={() => {
                setFilterProject('');
                setFilterSite('');
                setFilterChainage('');
                setAppliedProject('');
                setAppliedSite('');
                setAppliedChainage('');
              }}
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="row row-cols-2 row-cols-sm-3 row-cols-md-5 g-3 mt-1 mb-4">
        {['all', 'ready', 'generating', 'pdf', 'excel'].map((s) => {
          const config = STATUS_CONFIGS[s];
          const count = s === 'all'
            ? reports.length
            : (s === 'ready' || s === 'generating')
              ? reports.filter((r) => r.status === s).length
              : reports.filter((r) => r.format === s || (s === 'excel' && r.format === 'csv')).length;

          const isActive = filter === s;

          return (
            <div key={s} className="col">
              <div
                className={`mini-card text-center p-2.5 h-100 d-flex flex-column align-items-center justify-content-center gap-1 border rounded ${isActive ? config.activeClass : 'bg-white border-light-subtle text-muted'
                  }`}
                style={{ cursor: 'pointer', transition: 'all 0.2s ease', minHeight: '85px' }}
                onClick={() => { setFilter(s); setPage(1); }}
              >
                <i className={`bi ${config.icon} fs-5`} style={{ color: isActive ? 'inherit' : config.color }} />
                <strong className="fs-5 lh-1 text-dark fw-bold">{count}</strong>
                <span className="small text-capitalize" style={{ fontSize: '11px', fontWeight: 500 }}>{config.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-2 text-muted">Loading report records...</p>
        </div>
      ) : (
        <ReusableDataTable
          columns={columns}
          data={sliced}
          keyExtractor={(r) => r.id}
          searchQuery={search}
          onSearch={(q) => { setSearch(q); setPage(1); }}
          searchPlaceholder="Search reports by title or author..."
          total={filtered.length}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          showPagination={true}
        />
      )}

      {/* Generate Report Modal */}
      <GenerateReportModal
        show={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        onGenerate={handleNewReportGenerated}
      />

      {/* Preview Modal */}
      {previewReport && (
        <div className="modal-backdrop-custom" onClick={() => setPreviewReport(null)}>
          <div className="modal-dialog-custom" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-content-custom p-4">
              <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                <h5 className="fw-bold mb-0">
                  <i className="bi bi-file-earmark-text me-2 text-primary" />
                  Report Details & Audit Summary
                </h5>
                <button className="btn-close" onClick={() => setPreviewReport(null)} />
              </div>
              <div className="mb-3">
                <h6 className="fw-bold text-dark">{previewReport.title}</h6>
                <p className="text-muted small">{previewReport.description || 'No additional description provided.'}</p>
              </div>
              <div className="row g-2 mb-3 bg-light p-3 rounded">
                <div className="col-6"><small className="text-muted d-block">Report Type:</small><strong>{previewReport.type}</strong></div>
                <div className="col-6"><small className="text-muted d-block">File Format:</small><span className="badge text-bg-info text-uppercase">{previewReport.format}</span></div>
                <div className="col-6"><small className="text-muted d-block">Generated By:</small><strong>{previewReport.generatedBy}</strong></div>
                <div className="col-6"><small className="text-muted d-block">Generated At:</small><strong>{new Date(previewReport.generatedAt).toLocaleString()}</strong></div>
                <div className="col-6"><small className="text-muted d-block">Status:</small><span className="badge text-bg-success">{previewReport.status}</span></div>
              </div>
              <div className="d-flex justify-content-end gap-2">
                <button className="btn btn-outline-secondary btn-sm" onClick={() => setPreviewReport(null)}>Close</button>
                <button className="btn btn-primary btn-sm" onClick={() => { handleDownloadReport(previewReport); setPreviewReport(null); }}>
                  <i className="bi bi-download me-1" /> Download {previewReport.format.toUpperCase()}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};