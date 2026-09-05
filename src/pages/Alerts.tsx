import { useState, useEffect, useCallback } from 'react';
import type { AIAlert } from '../types';
import { safetyService } from '../services/safetyService';
import { AIAlertCard } from '../components/cards/AIAlertCard';
import { AlertDetailModal } from '../components/common/AlertDetailModal';
import { NotificationToast } from '../components/common/NotificationToast';
import SupervisorHITLPPEPage from '../HITL - PPE/pages/SupervisorHITLPPEPage';

export const Alerts = () => {
  const [alerts, setAlerts] = useState<AIAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<AIAlert | null>(null);
  const [solvingAlert, setSolvingAlert] = useState<AIAlert | null>(null);
  
  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'acknowledged' | 'resolved'>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Fetch AI Alerts from backend API
  const fetchAlerts = useCallback(async (isSilent = false) => {
    if (!isSilent) setRefreshing(true);
    try {
      const data = await safetyService.getAIAlerts();
      setAlerts(data);
    } catch (err) {
      console.error('Failed to load live AI alerts:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial load and 12-second polling
  useEffect(() => {
    let isMounted = true;
    safetyService.getAIAlerts()
      .then((data) => {
        if (isMounted) {
          setAlerts(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    const interval = setInterval(() => {
      fetchAlerts(true);
    }, 12000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [fetchAlerts]);

  // Handle status updates (Acknowledge / Resolve)
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const updated = await safetyService.updateAIAlertStatus(id, newStatus);
      setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, ...updated, status: updated.status || (newStatus as AIAlert['status']) } : a)));
    } catch (err) {
      console.error(`Failed to update alert ${id} status:`, err);
    }
  };

  // Open the HITL PPE Report popup to solve the violation
  const handleSolve = (id: string) => {
    const found = alerts.find((a) => a.id === id);
    if (found) setSolvingAlert(found);
  };

  // Filtered Alert List
  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch = 
      (alert.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (alert.cameraName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (alert.siteName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(alert.id).includes(searchQuery);

    const alertStatus = (alert.status || 'open').toLowerCase();
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'open' && (alertStatus === 'open' || alertStatus === 'new')) ||
      alertStatus === statusFilter;

    const alertSev = (alert.severity || 'critical').toLowerCase();
    const matchesSeverity = severityFilter === 'all' || alertSev === severityFilter;

    const matchesType = typeFilter === 'all' || alert.type === typeFilter;

    return matchesSearch && matchesStatus && matchesSeverity && matchesType;
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);

  const totalPages = Math.max(1, Math.ceil(filteredAlerts.length / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredAlerts.length);
  const paginatedAlerts = filteredAlerts.slice(startIndex, endIndex);

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

  // KPI Metrics
  const totalAlerts = alerts.length;
  const openCount = alerts.filter((a) => (a.status || 'open').toLowerCase() === 'open' || (a.status || '').toLowerCase() === 'new').length;
  const criticalCount = alerts.filter((a) => (a.severity || '').toLowerCase() === 'critical').length;
  const resolvedCount = alerts.filter((a) => (a.status || '').toLowerCase() === 'resolved').length;

  return (
    <div className="container-fluid px-3 px-md-4 py-3 py-lg-4">
      
      {/* Toast Notification Container */}
      <NotificationToast />

      {/* Header Banner */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-danger bg-opacity-10 text-danger border border-danger px-2.5 py-1 fw-semibold font-monospace" style={{ fontSize: '11px' }}>
              <i className="bi bi-broadcast me-1" /> LIVE TELEMETRY STREAM
            </span>
            <span className="small text-muted" style={{ fontSize: '12px' }}>Polling every 12s</span>
          </div>
          <h1 className="h3 mb-0 fw-bold text-dark">Live AI Alerts & Safety Violations</h1>
          <p className="text-muted small mb-0">Real-time PPE compliance, intrusion, and hazard detection feed from site IP cameras.</p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button 
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1.5 fw-semibold px-3 py-2"
            onClick={() => fetchAlerts(false)}
            disabled={refreshing}
          >
            <i className={`bi bi-arrow-clockwise ${refreshing ? 'spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh Feed'}
          </button>
        </div>
      </div>

      {/* KPI Metric Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm p-3 bg-white border-start border-4 border-primary">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Total Alerts</span>
                <h3 className="fw-bold mb-0 mt-1">{totalAlerts}</h3>
              </div>
              <div className="bg-primary bg-opacity-10 p-2.5 rounded-circle text-primary">
                <i className="bi bi-bell-fill fs-4" />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm p-3 bg-white border-start border-4 border-warning">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Open Violations</span>
                <h3 className="fw-bold mb-0 mt-1 text-warning">{openCount}</h3>
              </div>
              <div className="bg-warning bg-opacity-10 p-2.5 rounded-circle text-warning">
                <i className="bi bi-exclamation-triangle-fill fs-4" />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm p-3 bg-white border-start border-4 border-danger">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Critical Hazards</span>
                <h3 className="fw-bold mb-0 mt-1 text-danger">{criticalCount}</h3>
              </div>
              <div className="bg-danger bg-opacity-10 p-2.5 rounded-circle text-danger">
                <i className="bi bi-exclamation-octagon-fill fs-4" />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm p-3 bg-white border-start border-4 border-success">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Resolved Today</span>
                <h3 className="fw-bold mb-0 mt-1 text-success">{resolvedCount}</h3>
              </div>
              <div className="bg-success bg-opacity-10 p-2.5 rounded-circle text-success">
                <i className="bi bi-check-circle-fill fs-4" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="card border-0 shadow-sm p-3 mb-4 bg-white">
        <div className="row g-2 align-items-center">
          
          {/* Search Box */}
          <div className="col-12 col-md-4 col-lg-3">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-search text-muted" />
              </span>
              <input
                type="text"
                className="form-select-sm form-control border-start-0 ps-0"
                placeholder="Search alerts, cameras, sites..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          {/* Filters Group */}
          <div className="col-12 col-md-8 col-lg-9 d-flex flex-wrap align-items-center justify-content-md-end gap-2">
            
            {/* Status Filter */}
            <select
              className="form-select form-select-sm w-auto"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as 'all' | 'open' | 'acknowledged' | 'resolved');
                setCurrentPage(1);
              }}
            >
              <option value="all">Status: All</option>
              <option value="open">Open / New</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="resolved">Resolved</option>
            </select>

            {/* Severity Filter */}
            <select
              className="form-select form-select-sm w-auto"
              value={severityFilter}
              onChange={(e) => {
                setSeverityFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">Severity: All</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* Event Type Filter */}
            <select
              className="form-select form-select-sm w-auto"
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">Type: All Violations</option>
              <option value="no_ppe">PPE Violation</option>
              <option value="no_helmet">No Helmet</option>
              <option value="no_vest">No Safety Vest</option>
              <option value="intrusion">Intrusion / Unauthorized Access</option>
              <option value="fall_detected">Fall Detection</option>
              <option value="restricted_zone">Restricted Zone</option>
              <option value="fire_detected">Fire Hazard</option>
            </select>

            {/* Reset Button */}
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setSeverityFilter('all');
                setTypeFilter('all');
                setCurrentPage(1);
              }}
              title="Reset All Filters"
            >
              <i className="bi bi-arrow-counterclockwise" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live AI Alert Cards Feed */}
      {loading ? (
        <div className="text-center py-5 bg-white rounded shadow-sm">
          <div className="spinner-border text-primary mb-3" role="status" />
          <p className="text-muted small font-monospace mb-0">Loading live AI alert telemetry...</p>
        </div>
      ) : filteredAlerts.length > 0 ? (
        <>
          <div className="d-flex flex-column gap-3 mb-4">
            {paginatedAlerts.map((alert) => (
              <AIAlertCard 
                key={alert.id}
                alert={alert}
                onView={(id) => {
                  const found = alerts.find((a) => a.id === id);
                  if (found) setSelectedAlert(found);
                }}
                onAcknowledge={(id) => handleUpdateStatus(id, 'ACKNOWLEDGED')}
                onResolve={handleSolve}
                onSolve={handleSolve}
              />
            ))}
          </div>

          {/* Pagination Controls Bar */}
          <div className="card border-0 shadow-sm p-3 bg-white mb-4">
            <div className="d-flex flex-column flex-sm-row align-items-center justify-content-between gap-3">
              <div className="d-flex align-items-center gap-2">
                <span className="small text-muted">
                  Showing <strong>{filteredAlerts.length > 0 ? startIndex + 1 : 0}</strong> to <strong>{endIndex}</strong> of <strong>{filteredAlerts.length}</strong> alerts
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
                  <option value={50}>50 / page</option>
                </select>
              </div>

              {totalPages > 1 && (
                <nav aria-label="Alerts pagination">
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
      ) : (
        <div className="text-center py-5 bg-white rounded shadow-sm border">
          <i className="bi bi-shield-check fs-1 text-success d-block mb-2" />
          <h5 className="fw-bold text-dark mb-1">No Alerts Matching Filter</h5>
          <p className="text-muted small mb-3">There are currently no active AI safety alerts matching your filter criteria.</p>
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
              setSeverityFilter('all');
              setTypeFilter('all');
              setCurrentPage(1);
            }}
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <AlertDetailModal 
          alert={selectedAlert} 
          onClose={() => setSelectedAlert(null)}
          onResolve={(id) => handleUpdateStatus(id, 'RESOLVED')}
          onSolve={(id) => setSolvingAlert(alerts.find((a) => a.id === id) || null)}
        />
      )}

      {/* HITL PPE - Solve Violation Popup */}
      {solvingAlert && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1040 }} onClick={() => setSolvingAlert(null)} />
          <div className="modal fade show d-block" tabIndex={-1} role="dialog" aria-modal="true" style={{ zIndex: 1050, overflowY: 'auto' }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px' }}>
                <div className="modal-header bg-dark text-white border-0 py-3" style={{ borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}>
                  <h5 className="modal-title fw-bold mb-0 d-flex align-items-center gap-2">
                    <i className="bi bi-shield-fill-check text-success" />
                    PPE Inspection - Solve Violation
                  </h5>
                  <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={() => setSolvingAlert(null)} />
                </div>
                <div className="modal-body p-0">
                  <SupervisorHITLPPEPage
                    isModal={true}
                    taskId={solvingAlert.id}
                    initialSiteName={solvingAlert.siteCode || solvingAlert.siteName}
                    initialChainage={solvingAlert.chainageLabel || solvingAlert.chainageId}
                    onClose={() => setSolvingAlert(null)}
                    onSubmitSuccess={() => {
                      // Mark the AI alert as resolved after the HITL report is submitted
                      handleUpdateStatus(solvingAlert.id, 'RESOLVED');
                      setSolvingAlert(null);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
};