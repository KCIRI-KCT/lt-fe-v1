import { useState, useEffect, useCallback } from 'react';
import type { AIAlert } from '../types';
import { safetyService } from '../services/safetyService';
import { AIAlertCard } from '../components/cards/AIAlertCard';
import { AlertDetailModal } from '../components/common/AlertDetailModal';
import { NotificationToast } from '../components/common/NotificationToast';

export const Alerts = () => {
  const [alerts, setAlerts] = useState<AIAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<AIAlert | null>(null);
  
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

  // KPI Metrics
  const totalAlerts = alerts.length;
  const openCount = alerts.filter((a) => (a.status || 'open').toLowerCase() === 'open' || (a.status || '').toLowerCase() === 'new').length;
  const criticalCount = alerts.filter((a) => (a.severity || '').toLowerCase() === 'critical').length;
  const resolvedCount = alerts.filter((a) => (a.status || '').toLowerCase() === 'resolved').length;

  return (
    <div className="container-fluid px-3 px-lg-4 py-4">
      
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
                <span className="small text-uppercase text-muted fw-bold" style={{ fontSize: '11px' }}>Total Detections</span>
                <h3 className="fw-bold mb-0 text-dark mt-1">{totalAlerts}</h3>
              </div>
              <div className="rounded-circle bg-primary bg-opacity-10 p-3 text-primary d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                <i className="bi bi-bell-fill fs-5" />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm p-3 bg-white border-start border-4 border-danger">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="small text-uppercase text-muted fw-bold" style={{ fontSize: '11px' }}>Open Violations</span>
                <h3 className="fw-bold mb-0 text-danger mt-1">{openCount}</h3>
              </div>
              <div className="rounded-circle bg-danger bg-opacity-10 p-3 text-danger d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                <i className="bi bi-exclamation-octagon-fill fs-5" />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm p-3 bg-white border-start border-4 border-warning">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="small text-uppercase text-muted fw-bold" style={{ fontSize: '11px' }}>Critical Severity</span>
                <h3 className="fw-bold mb-0 text-warning text-darken mt-1">{criticalCount}</h3>
              </div>
              <div className="rounded-circle bg-warning bg-opacity-10 p-3 text-warning text-darken d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                <i className="bi bi-shield-exclamation fs-5" />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm p-3 bg-white border-start border-4 border-success">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="small text-uppercase text-muted fw-bold" style={{ fontSize: '11px' }}>Resolved Alerts</span>
                <h3 className="fw-bold mb-0 text-success mt-1">{resolvedCount}</h3>
              </div>
              <div className="rounded-circle bg-success bg-opacity-10 p-3 text-success d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                <i className="bi bi-check-circle-fill fs-5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar Panel */}
      <div className="card border-0 shadow-sm mb-4 bg-white p-3">
        <div className="d-flex flex-column flex-lg-row align-items-stretch align-items-lg-center justify-content-between gap-3">
          
          {/* Status Filter Tabs */}
          <div className="btn-group btn-group-sm" role="group" aria-label="Status Filters">
            <button 
              type="button" 
              className={`btn px-3 fw-semibold ${statusFilter === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setStatusFilter('all')}
            >
              All Alerts ({totalAlerts})
            </button>
            <button 
              type="button" 
              className={`btn px-3 fw-semibold ${statusFilter === 'open' ? 'btn-danger' : 'btn-outline-secondary'}`}
              onClick={() => setStatusFilter('open')}
            >
              Open ({openCount})
            </button>
            <button 
              type="button" 
              className={`btn px-3 fw-semibold ${statusFilter === 'acknowledged' ? 'btn-warning text-dark' : 'btn-outline-secondary'}`}
              onClick={() => setStatusFilter('acknowledged')}
            >
              Acknowledged
            </button>
            <button 
              type="button" 
              className={`btn px-3 fw-semibold ${statusFilter === 'resolved' ? 'btn-success' : 'btn-outline-secondary'}`}
              onClick={() => setStatusFilter('resolved')}
            >
              Resolved ({resolvedCount})
            </button>
          </div>

          {/* Search Input & Dropdowns */}
          <div className="d-flex flex-wrap align-items-center gap-2">
            
            {/* Search Input */}
            <div className="input-group input-group-sm" style={{ width: '220px' }}>
              <span className="input-group-text bg-light border-end-0"><i className="bi bi-search text-muted" /></span>
              <input 
                type="text"
                className="form-select-sm form-control border-start-0 bg-light"
                placeholder="Search alerts, cameras..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Severity Filter */}
            <select 
              className="form-select form-select-sm bg-light" 
              style={{ width: '130px' }}
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* Violation Type Filter */}
            <select 
              className="form-select form-select-sm bg-light" 
              style={{ width: '160px' }}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Violation Types</option>
              <option value="helmet_violation">Helmet Violation</option>
              <option value="vest_violation">Vest Violation</option>
              <option value="mask_violation">Mask Violation</option>
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
          <p className="text-muted small font-monospace mb-0">Loading live AI alert telemetry from 10.1.150.142:8000...</p>
        </div>
      ) : filteredAlerts.length > 0 ? (
        <div className="d-flex flex-column gap-3">
          {filteredAlerts.map((alert) => (
            <AIAlertCard 
              key={alert.id}
              alert={alert}
              onView={(id) => {
                const found = alerts.find((a) => a.id === id);
                if (found) setSelectedAlert(found);
              }}
              onAcknowledge={(id) => handleUpdateStatus(id, 'ACKNOWLEDGED')}
              onResolve={(id) => handleUpdateStatus(id, 'RESOLVED')}
              onSolve={(id) => handleUpdateStatus(id, 'RESOLVED')}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-5 bg-white rounded shadow-sm border">
          <i className="bi bi-shield-check fs-1 text-success d-block mb-2" />
          <h5 className="fw-bold text-dark mb-1">No Alerts Matching Filter</h5>
          <p className="text-muted small mb-3">There are currently no active AI safety alerts matching your filter criteria.</p>
          <button className="btn btn-sm btn-outline-primary" onClick={() => { setSearchQuery(''); setStatusFilter('all'); setSeverityFilter('all'); setTypeFilter('all'); }}>
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
        />
      )}

    </div>
  );
};