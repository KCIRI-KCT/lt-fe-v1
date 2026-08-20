import { useState, useEffect } from 'react';
import { AIAlertCard } from '../components/cards/AIAlertCard';
import { safetyService } from '../services/safetyService';
import { AI_ALERT_CONFIG } from '../constants';
import { useApp } from '../hooks/useApp';
import { AlertDetailModal } from '../components/common/AlertDetailModal';
import SupervisorHITLPPEPage from '../HITL - PPE/pages/SupervisorHITLPPEPage';
import { createPPENotification } from '../services/ppeNotificationService';
import type { AIAlert } from '../types';

const STATUS_CONFIGS: Record<string, { icon: string; activeClass: string; color: string }> = {
  all: { icon: 'bi-grid-fill', activeClass: 'bg-primary-subtle border-primary text-primary', color: '#0d6efd' },
  new: { icon: 'bi-exclamation-octagon-fill', activeClass: 'bg-danger-subtle border-danger text-danger', color: '#dc3545' },
  acknowledged: { icon: 'bi-check-circle-fill', activeClass: 'bg-info-subtle border-info text-info', color: '#0dcaf0' },
  resolved: { icon: 'bi-check-all', activeClass: 'bg-success-subtle border-success text-success', color: '#198754' },
  dismissed: { icon: 'bi-x-circle-fill', activeClass: 'bg-secondary-subtle border-secondary text-secondary', color: '#6c757d' },
};

export const AIMonitoringPage = () => {
  const { user } = useApp();
  const hiddenTypes = new Set(['helmet_violation', 'vest_violation', 'mask_violation']);
  const [alerts, setAlerts] = useState<AIAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [solvingAlertId, setSolvingAlertId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    safetyService.getAIAlerts()
      .then((data) => {
        if (isMounted) setAlerts(data);
      })
      .catch(() => {
        if (isMounted) setAlerts([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  const handleAcknowledge = async (id: string, alert?: AIAlert) => {
    try {
      await safetyService.updateAIAlertStatus(id, 'acknowledged');
    } catch {
      // ignore offline error
    }
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, status: 'acknowledged', acknowledgedBy: user?.name } : a));

    if (alert && alert.type === 'no_ppe' && user) {
      const siteName = alert.siteName || alert.siteCode || 'Unknown Site';
      const chainageName = alert.chainageLabel || alert.chainageId || 'N/A';
      createPPENotification(alert, user, siteName, chainageName);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await safetyService.updateAIAlertStatus(id, 'resolved');
    } catch {
      // ignore offline error
    }
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, status: 'resolved' } : a));
  };

  const handleSolve = (id: string) => {
    setSolvingAlertId(id);
    console.log('Solve clicked for alert', id);
  };

  // Filters dropdown state
  const [filterProject, setFilterProject] = useState('');
  const [filterSite, setFilterSite] = useState('');
  const [filterChainage, setFilterChainage] = useState('');

  // Applied filter state for mapping
  const [appliedProject, setAppliedProject] = useState('');
  const [appliedSite, setAppliedSite] = useState('');
  const [appliedChainage, setAppliedChainage] = useState('');

  const filtered = alerts.filter((a) => {
    if (hiddenTypes.has(a.type)) return false;
    if (filter !== 'all' && a.status !== filter) return false;
    if (typeFilter !== 'all' && a.type !== typeFilter) return false;

    // Project filter
    if (appliedProject) {
      const projId = appliedProject === 'Chennai-Bangalore Expressway' ? '1' : appliedProject === 'Mumbai Ring Road' ? '2' : '3';
      if (a.projectId !== projId) return false;
    }
    // Site filter
    if (appliedSite) {
      if (a.siteId !== appliedSite && a.siteName !== appliedSite) return false;
    }
    // Chainage filter
    if (appliedChainage && a.chainageId !== appliedChainage) return false;

    return true;
  });

  const selectedAlert = selectedAlertId ? alerts.find((a) => a.id === selectedAlertId) || null : null;
  const solvingAlert = solvingAlertId ? alerts.find((a) => a.id === solvingAlertId) || null : null;

  const handleViewAlert = (id: string) => {
    // All roles can view alert details in the popup modal
    setSelectedAlertId(id);
  };

  return (
    <div className="container-fluid px-3 px-lg-4 py-4">
      <div className="page-heading">
        <div className="page-heading-copy">
          <span className="page-icon"><i className="bi bi-bell-fill" aria-hidden="true" /></span>
          <div>
            <h1 className="h3 mb-0">Alerts</h1>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="card border-0 shadow-sm p-3 mb-4 bg-white">
        <div className="row g-2 align-items-center">
          <div className="col-auto">
            <span className="small text-muted fw-bold text-uppercase">
              Surveillance Filters:
            </span>
          </div>

          {/* Project dropdown */}
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
              <option value="Chennai-Bangalore Expressway">Chennai Expressway</option>
              <option value="Mumbai Ring Road">Mumbai Ring Road</option>
              <option value="Hyderabad Metro Phase II">Hyderabad Metro II</option>
            </select>
          </div>

          {/* Site dropdown */}
          <div className="col-sm-3 col-md-3 col-xl-2">
            <select
              className="form-select form-select-sm"
              value={filterSite}
              onChange={(e) => {
                const selectedVal = e.target.value;
                setFilterSite(selectedVal);
                setFilterChainage('');
                if (selectedVal) {
                  if (['Site A - KM 0-15', 'Site B - KM 15-30', 'Site C - KM 30-45'].includes(selectedVal)) {
                    setFilterProject('Chennai-Bangalore Expressway');
                  } else if (['Site D - KM 0-12', 'Site E - KM 12-25'].includes(selectedVal)) {
                    setFilterProject('Mumbai Ring Road');
                  } else if (['Site F - KM 0-12', 'Site G - KM 12-25'].includes(selectedVal)) {
                    setFilterProject('Hyderabad Metro Phase II');
                  }
                }
              }}
            >
              <option value="">All Sites</option>
              {(!filterProject || filterProject === 'Chennai-Bangalore Expressway') && (
                <>
                  <option value="Site A - KM 0-15">Site A - KM 0-15</option>
                  <option value="Site B - KM 15-30">Site B - KM 15-30</option>
                  <option value="Site C - KM 30-45">Site C - KM 30-45</option>
                </>
              )}
              {(!filterProject || filterProject === 'Mumbai Ring Road') && (
                <>
                  <option value="Site D - KM 0-12">Site D - KM 0-12</option>
                  <option value="Site E - KM 12-25">Site E - KM 12-25</option>
                </>
              )}
              {(!filterProject || filterProject === 'Hyderabad Metro Phase II') && (
                <>
                  <option value="Site F - KM 0-12">Site F - KM 0-12</option>
                  <option value="Site G - KM 12-25">Site G - KM 12-25</option>
                </>
              )}
            </select>
          </div>

          {/* Chainage dropdown */}
          <div className="col-sm-3 col-md-3 col-xl-2">
            <select
              className="form-select form-select-sm"
              value={filterChainage}
              onChange={(e) => setFilterChainage(e.target.value)}
              disabled={!filterSite}
            >
              <option value="">All Chainages</option>
              {filterSite === 'Site A - KM 0-15' && (
                <>
                  <option value="CH-01">CH-01 (KM 2.5)</option>
                  <option value="CH-05">CH-05 (KM 12.0)</option>
                </>
              )}
              {filterSite === 'Site B - KM 15-30' && <option value="CH-10">CH-10 (KM 22.4)</option>}
              {filterSite === 'Site C - KM 30-45' && <option value="CH-15">CH-15 (KM 38.2)</option>}
              {filterSite === 'Site D - KM 0-12' && <option value="CH-20">CH-20 (KM 4.8)</option>}
              {filterSite === 'Site E - KM 12-25' && <option value="CH-25">CH-25 (KM 16.5)</option>}
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
        {['all', 'new', 'acknowledged', 'resolved', 'dismissed'].map((s) => {
          const config = STATUS_CONFIGS[s];
          const count = s === 'all' ? alerts.length : alerts.filter((a) => a.status === s).length;
          const isActive = filter === s;

          return (
            <div key={s} className="col">
              <div
                className={`mini-card text-center p-2.5 h-100 d-flex flex-column align-items-center justify-content-center gap-1 border rounded ${
                  isActive ? config.activeClass : 'bg-white border-light-subtle text-muted'
                }`}
                style={{ cursor: 'pointer', transition: 'all 0.15s ease', minHeight: '85px' }}
                onClick={() => setFilter(s)}
              >
                <i className={`bi ${config.icon} fs-5`} style={{ color: isActive ? 'inherit' : config.color }} />
                <strong className="fs-5 lh-1 text-dark fw-bold">{count}</strong>
                <span className="small text-capitalize" style={{ fontSize: '11px', fontWeight: 500 }}>{s}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Type filter */}
      <div className="d-flex flex-wrap gap-2 mb-4">
        <button className={`btn btn-sm ${typeFilter === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setTypeFilter('all')}>All Types</button>
        <button
          className={`btn btn-sm ${typeFilter === 'no_ppe' ? 'btn-primary' : 'btn-outline-secondary'}`}
          onClick={() => setTypeFilter('no_ppe')}
        >
          <i className="bi bi-person-check-fill me-1" />PPE Compliance
        </button>
        {Object.entries(AI_ALERT_CONFIG)
          .filter(([key]) => key !== 'no_ppe' && !hiddenTypes.has(key))
          .map(([key, config]) => (
          <button
            key={key}
            className={`btn btn-sm ${typeFilter === key ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setTypeFilter(key)}
          >
            <i className={`${config.icon} me-1`} />{config.label}
          </button>
          ))}
      </div>

      {/* Alerts list */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-2 text-muted">Loading AI Alerts...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="panel blank-panel">
          <div className="blank-state">
            <i className="bi bi-check2-circle fs-1 text-success mb-3 d-block" />
            <h5 className="fw-bold mb-2">All Clear</h5>
            <p className="text-muted small mb-0">No alerts match the current filters.</p>
          </div>
        </div>
      ) : (
        filtered.map((alert) => (
          <AIAlertCard
            key={alert.id}
            alert={alert}
            userRole={user?.role}
            onAcknowledge={handleAcknowledge}
            onResolve={handleResolve}
            onSolve={handleSolve}
            onView={handleViewAlert}
          />
        ))
      )}

      <AlertDetailModal alert={selectedAlert} onClose={() => setSelectedAlertId(null)} />

      {solvingAlert && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1040 }} onClick={() => setSolvingAlertId(null)} />
          <div className="modal fade show d-block" tabIndex={-1} role="dialog" aria-modal="true" style={{ zIndex: 1050, overflowY: 'auto' }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px' }}>
                <div className="modal-header bg-dark text-white border-0 py-3" style={{ borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}>
                  <h5 className="modal-title fw-bold mb-0 d-flex align-items-center gap-2">
                    <i className="bi bi-shield-fill-check text-success" />
                    PPE Inspection - Solve Violation
                  </h5>
                  <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={() => setSolvingAlertId(null)} />
                </div>
                <div className="modal-body p-0">
                  <SupervisorHITLPPEPage
                    isModal={true}
                    taskId={solvingAlert.id}
                    initialSiteName={solvingAlert.siteCode || solvingAlert.siteName}
                    initialChainage={solvingAlert.chainageLabel || solvingAlert.chainageId}
                    onClose={() => setSolvingAlertId(null)}
                    onSubmitSuccess={() => {
                      handleResolve(solvingAlert.id);
                      setSolvingAlertId(null);
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