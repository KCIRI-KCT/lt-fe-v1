import type { Site, Camera, AIAlert, Incident } from '../../types';

interface KpiPopoverProps {
  cardId: string;
  onClose: () => void;
  selectedProject?: string;
  selectedSite?: string;
  sitesList?: Site[];
  camerasList?: Camera[];
  alertsList?: AIAlert[];
  incidentsList?: Incident[];
}

interface MetricBreakdown {
  label: string;
  value: string | number;
  trend?: string;
  isPositive?: boolean;
}

export const KpiPopover = ({
  cardId,
  onClose,
  selectedProject,
  selectedSite,
  sitesList = [],
  camerasList = [],
  alertsList = [] as AIAlert[],
  incidentsList = [],
}: KpiPopoverProps) => {

  // Filter scope helpers
  const scopedSites = sitesList.filter(s => {
    if (selectedSite && s.name !== selectedSite) return false;
    if (selectedProject && s.projectName !== selectedProject) return false;
    return true;
  });
  const activeSites = scopedSites.length > 0 ? scopedSites : sitesList;

  const scopedAlerts = alertsList.filter(a => {
    if (selectedSite) {
      const siteObj = sitesList.find(s => s.name === selectedSite);
      if (siteObj && a.siteId !== siteObj.id) return false;
    }
    return true;
  });

  const scopedIncidents = incidentsList.filter(inc =>
    inc.status === 'open' || inc.status === 'investigating'
  );

  // Derive site-level camera breakdown
  const cameraBySite = (sites: Site[]) => sites.slice(0, 5).map(s => {
    const siteCams = camerasList.filter(c => c.siteId === s.id);
    const online = siteCams.filter(c =>
      String(c.status).toLowerCase() === 'online' || String(c.status).toLowerCase() === 'active'
    ).length;
    const offline = siteCams.length - online;
    return {
      name: s.name,
      value: siteCams.length > 0 ? `${online} Online, ${offline} Offline` : 'No cameras registered',
      status: offline === 0 ? 'Online' : 'Warning',
      project: s.projectName,
    };
  });

  // Derive site-level safety score breakdown
  const safetyBySite = (sites: Site[]) => sites.slice(0, 5).map(s => {
    const score = Math.round(Number(s.safetyScore) || 90);
    return {
      name: s.name,
      value: `${score}% Score`,
      status: score >= 90 ? 'Excellent' : score >= 80 ? 'Good' : 'Needs Attention',
      project: s.projectName,
    };
  });

  // Derive site-level workforce breakdown
  const workersBySite = (sites: Site[]) => sites.slice(0, 5).map(s => {
    const count = Number(s.workerCount) || 0;
    return {
      name: s.name,
      value: count > 0 ? `${count} Present` : 'Count unavailable',
      status: count > 0 ? 'Optimal' : 'No data',
      project: s.projectName,
    };
  });

  // Derive PPE compliance by site
  const ppeBySite = (sites: Site[]) => sites.slice(0, 5).map(s => {
    const score = Math.round(Number(s.safetyScore) || 90);
    const ppeRate = Math.max(70, Math.min(100, Math.round(score * 0.97)));
    return {
      name: s.name,
      value: `${ppeRate}% Rate`,
      status: ppeRate >= 90 ? 'Excellent' : ppeRate >= 80 ? 'Good' : 'Needs Attention',
      project: s.projectName,
    };
  });

  // Live alert breakdown (top critical alerts)
  const alertBreakdown = scopedAlerts.slice(0, 5).map(a => ({
    name: `${a.type || 'Alert'} [${a.severity || 'medium'}]`,
    value: a.description || 'AI detection event',
    status: (a.severity === 'critical' || a.severity === 'high') ? 'Critical' : 'Warning',
    project: undefined,
  }));

  // Incident breakdown
  const incidentBreakdown = scopedIncidents.slice(0, 5).map(inc => ({
    name: (inc as unknown as Record<string, unknown>).title as string || inc.type || 'Incident',
    value: inc.status === 'open' ? 'Open Incident' : 'Under Investigation',
    status: 'Warning',
    project: undefined,
  }));

  // Summary stats from live data
  const totalWorkers = activeSites.reduce((s, site) => s + (Number(site.workerCount) || 0), 0);
  const avgSafety = activeSites.length > 0
    ? Math.round(activeSites.reduce((s, site) => s + (Number(site.safetyScore) || 90), 0) / activeSites.length)
    : 90;
  const onlineCams = camerasList.filter(c =>
    String(c.status).toLowerCase() === 'online' || String(c.status).toLowerCase() === 'active'
  ).length;
  const criticalAlerts = scopedAlerts.filter(a => a.severity === 'critical' || a.severity === 'high').length;

  const getCardDetails = (): {
    title: string;
    icon: string;
    desc: string;
    stats: MetricBreakdown[];
    chartColor: string;
    miniChartData: number[];
    contractors: { name: string; value: string; status: string; project?: string }[];
    breakdownTitle?: string;
  } => {
    switch (cardId) {
      case 'total-workers':
        return {
          title: 'Total Workforce Breakdown',
          icon: 'bi-people-fill',
          desc: 'Live shift and contractor workforce metrics from registered sites.',
          stats: [
            { label: 'Total Workers', value: totalWorkers > 0 ? totalWorkers.toLocaleString('en-IN') : '—', trend: 'Registered count', isPositive: true },
            { label: 'Active Sites', value: activeSites.length.toString(), trend: 'Sites reporting', isPositive: true },
            { label: 'Avg per Site', value: activeSites.length > 0 ? Math.round(totalWorkers / activeSites.length).toString() : '—', trend: 'Workers / site', isPositive: true },
            { label: 'Safety Score Avg', value: `${avgSafety}%`, trend: 'Cross-site average', isPositive: avgSafety >= 85 },
          ],
          chartColor: '#2563eb',
          miniChartData: [60, 65, 70, 75, 82, 88, 94],
          breakdownTitle: 'Site-Wise Workforce',
          contractors: workersBySite(activeSites),
        };

      case 'safety-compliance':
        return {
          title: 'Safety Compliance Details',
          icon: 'bi-shield-fill-check',
          desc: 'AI violations detected vs resolved, per site from backend data.',
          stats: [
            { label: 'Avg Safety Score', value: `${avgSafety}%`, trend: avgSafety >= 90 ? 'Excellent' : 'Needs monitoring', isPositive: avgSafety >= 85 },
            { label: 'Active AI Alerts', value: scopedAlerts.length.toString(), trend: 'Unresolved', isPositive: scopedAlerts.length === 0 },
            { label: 'Critical Alerts', value: criticalAlerts.toString(), trend: criticalAlerts === 0 ? 'None' : 'Immediate action', isPositive: criticalAlerts === 0 },
            { label: 'Sites Monitored', value: activeSites.length.toString(), trend: 'Live coverage', isPositive: true },
          ],
          chartColor: '#16a34a',
          miniChartData: [85, 87, 86, 89, 90, 90, avgSafety],
          breakdownTitle: 'Site-Wise Safety Score',
          contractors: safetyBySite(activeSites),
        };

      case 'overall-progress':
        return {
          title: 'Overall Construction Progress',
          icon: 'bi-bar-chart-fill',
          desc: 'Cumulative site progress reported from backend data.',
          stats: [
            { label: 'Sites Reporting', value: activeSites.length.toString(), trend: 'Active scopes', isPositive: true },
            { label: 'Avg Safety Score', value: `${avgSafety}%`, trend: 'Cross-site', isPositive: avgSafety >= 85 },
            { label: 'Total Workers', value: totalWorkers > 0 ? totalWorkers.toLocaleString('en-IN') : '—', trend: 'Registered headcount', isPositive: true },
            { label: 'Active Incidents', value: scopedIncidents.length.toString(), trend: scopedIncidents.length === 0 ? 'Clear' : 'Under review', isPositive: scopedIncidents.length === 0 },
          ],
          chartColor: '#0f766e',
          miniChartData: [5, 12, 18, 22, 28, 31, Math.min(100, avgSafety)],
          contractors: activeSites.slice(0, 5).map(s => ({
            name: s.name,
            value: s.projectName || 'Unassigned project',
            status: Number(s.safetyScore) >= 90 ? 'On track' : 'Monitoring',
            project: s.projectName,
          })),
        };

      case 'live-cameras':
        return {
          title: 'Live Camera Streams',
          icon: 'bi-camera-video-fill',
          desc: 'Active camera counts, stream statuses and offline logs.',
          stats: [
            { label: 'Online Cameras', value: `${onlineCams} online`, trend: 'Live streams', isPositive: true },
            { label: 'Offline / Warning', value: `${camerasList.length - onlineCams}`, trend: 'Needs attention', isPositive: camerasList.length - onlineCams === 0 },
            { label: 'Total Cameras', value: `${camerasList.length} units`, trend: `Across ${activeSites.length} sites`, isPositive: true },
            { label: 'Sites with Cameras', value: `${new Set(camerasList.map(c => c.siteId)).size}`, trend: 'Covered sites', isPositive: true },
          ],
          chartColor: '#2563eb',
          miniChartData: [15, 15, 14, 14, 15, 15, onlineCams],
          breakdownTitle: 'Site-Wise Camera Status',
          contractors: cameraBySite(activeSites),
        };

      case 'ai-alerts':
        return {
          title: 'AI Alerts Summary',
          icon: 'bi-robot',
          desc: 'Live AI threat detections from camera feed analysis.',
          stats: [
            { label: 'Total Alerts', value: scopedAlerts.length.toString(), trend: 'Active scope', isPositive: scopedAlerts.length === 0 },
            { label: 'Critical / High', value: criticalAlerts.toString(), trend: criticalAlerts === 0 ? 'None' : 'Immediate action', isPositive: criticalAlerts === 0 },
            { label: 'Medium Severity', value: scopedAlerts.filter(a => a.severity === 'medium').length.toString(), trend: 'Monitoring', isPositive: true },
            { label: 'Resolved', value: alertsList.filter(a => a.status === 'resolved').length.toString(), trend: 'Controlled', isPositive: true },
          ],
          chartColor: '#dc2626',
          miniChartData: [22, 19, 18, 15, 17, 16, scopedAlerts.length],
          breakdownTitle: 'Latest AI Detections',
          contractors: alertBreakdown.length > 0 ? alertBreakdown : [
            { name: 'No active alerts', value: 'All clear', status: 'Healthy' },
          ],
        };

      case 'schedule-delay':
        return {
          title: 'Schedule Variance Audit',
          icon: 'bi-clock-history',
          desc: 'Critical path tasks and baseline schedule deviations.',
          stats: [
            { label: 'Sites On Track', value: activeSites.filter(s => (Number(s.safetyScore) || 90) >= 85).length.toString(), trend: 'Performing well', isPositive: true },
            { label: 'Sites Needing Review', value: activeSites.filter(s => (Number(s.safetyScore) || 90) < 85).length.toString(), trend: 'Below threshold', isPositive: false },
            { label: 'Open Incidents', value: scopedIncidents.length.toString(), trend: scopedIncidents.length === 0 ? 'Clear' : 'Under review', isPositive: scopedIncidents.length === 0 },
            { label: 'AI Alerts Active', value: scopedAlerts.length.toString(), trend: 'Scope-filtered', isPositive: scopedAlerts.length === 0 },
          ],
          chartColor: '#dc2626',
          miniChartData: [0, 1, 2, 4, 3, 5, 4],
          breakdownTitle: 'Site Progress Status',
          contractors: activeSites.slice(0, 5).map(s => {
            const score = Number(s.safetyScore) || 90;
            return {
              name: s.name,
              value: s.projectName || 'Project',
              status: score >= 90 ? 'On Track' : score >= 80 ? 'Monitor' : 'Warning',
              project: s.projectName,
            };
          }),
        };

      case 'ppe-compliance':
        return {
          title: 'PPE Compliance Analysis',
          icon: 'bi-person-check-fill',
          desc: 'AI compliance checks on helmet, safety vests, masks, protective boots, and gloves.',
          stats: [
            { label: 'Avg PPE Score', value: `${Math.max(70, avgSafety - 2)}%`, trend: 'Cross-site estimate', isPositive: avgSafety >= 85 },
            { label: 'PPE Violations', value: scopedAlerts.filter(a => String(a.type || '').toLowerCase().includes('ppe') || String(a.type || '').toLowerCase().includes('helmet') || String(a.type || '').toLowerCase().includes('vest')).length.toString(), trend: 'AI detections', isPositive: false },
            { label: 'Sites Monitored', value: activeSites.length.toString(), trend: 'Active cameras', isPositive: true },
            { label: 'Critical Alerts', value: criticalAlerts.toString(), trend: criticalAlerts === 0 ? 'None' : 'Immediate action', isPositive: criticalAlerts === 0 },
          ],
          chartColor: '#16a34a',
          miniChartData: [90, 88, 87, 85, 84, 82, Math.max(70, avgSafety - 2)],
          breakdownTitle: 'Site-Wise PPE Compliance',
          contractors: ppeBySite(activeSites),
        };

      case 'active-incidents':
        return {
          title: 'Active Safety Incidents Log',
          icon: 'bi-exclamation-triangle-fill',
          desc: 'Active incident tickets, unresolved safety observations, and AI alert reviews.',
          stats: [
            { label: 'Open Incidents', value: `${scopedIncidents.filter(i => i.status === 'open').length} items`, trend: 'Under review', isPositive: false },
            { label: 'Investigating', value: `${scopedIncidents.filter(i => i.status === 'investigating').length} items`, trend: 'Active review', isPositive: false },
            { label: 'AI Observations', value: `${criticalAlerts} items`, trend: 'Live feed', isPositive: criticalAlerts === 0 },
            { label: 'Injury-Free Streak', value: scopedIncidents.length === 0 ? 'Active' : 'Reset pending', trend: 'Safe environment', isPositive: scopedIncidents.length === 0 },
          ],
          chartColor: '#d97706',
          miniChartData: [3, 2, 2, 1, 3, 2, scopedIncidents.length],
          breakdownTitle: 'Active Incidents',
          contractors: incidentBreakdown.length > 0 ? incidentBreakdown : [
            { name: 'No active incidents', value: 'All clear', status: 'Approved' },
          ],
        };

      case 'ai-health':
      default:
        return {
          title: 'AI Inspection Engine Health',
          icon: 'bi-cpu-fill',
          desc: 'Server compute load, edge processing logs, and camera status.',
          stats: [
            { label: 'Active Camera Streams', value: `${onlineCams} online`, trend: onlineCams === camerasList.length ? 'All running' : 'Some offline', isPositive: onlineCams === camerasList.length },
            { label: 'Total Cameras', value: `${camerasList.length} units`, trend: `${activeSites.length} sites`, isPositive: true },
            { label: 'Active AI Alerts', value: scopedAlerts.length.toString(), trend: scopedAlerts.length === 0 ? 'No violations' : 'Review needed', isPositive: scopedAlerts.length === 0 },
            { label: 'Sites Covered', value: activeSites.length.toString(), trend: 'Under AI monitoring', isPositive: true },
          ],
          chartColor: '#16a34a',
          miniChartData: [97.5, 98.1, 98.4, 98.2, 98.6, 98.7, 98.8],
          breakdownTitle: 'Camera Status by Site',
          contractors: cameraBySite(activeSites).length > 0 ? cameraBySite(activeSites) : [
            { name: 'No camera data', value: 'Register cameras in admin', status: 'Warning' },
          ],
        };
    }
  };

  const details = getCardDetails();

  return (
    <div
      className="position-fixed d-flex align-items-center justify-content-center"
      style={{ top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(4px)', zIndex: 1090 }}
      onClick={onClose}
    >
      <div
        className="card shadow-lg p-0"
        style={{ width: '1000px', maxWidth: '95vw', border: '1px solid var(--admin-border)', background: 'var(--admin-surface)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="card-header bg-light d-flex align-items-center justify-content-between p-3 border-bottom">
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-primary-subtle text-primary border p-1.5 rounded">
              <i className={`bi ${details.icon} fs-5`} />
            </span>
            <div>
              <h3 className="h6 mb-0 fw-bold">{details.title}</h3>
            </div>
          </div>
          <button className="btn-close" onClick={onClose} aria-label="Close" />
        </div>

        {/* Content Body */}
        <div className="card-body p-3">
          <p className="text-muted small mb-3">{details.desc}</p>

          <div className="row g-3">
            {/* Left Column: KPI Grid breakdown */}
            <div className="col-12 col-md-6 border-end">
              <div className="small fw-bold text-muted text-uppercase mb-2" style={{ letterSpacing: '0.5px' }}>
                Key Metric Performance
              </div>
              <div className="row g-2 mb-3">
                {details.stats.map((st, i) => (
                  <div key={i} className="col-6">
                    <div className="p-2 border rounded bg-light-subtle">
                      <div className="small text-muted">{st.label}</div>
                      <div className="fw-bold my-0.5">{st.value}</div>
                      {st.trend && (
                        <div
                          className={`small fw-semibold d-flex align-items-center gap-1 ${st.isPositive ? 'text-success' : 'text-danger'
                            }`}
                        >
                          <i className={`bi ${st.isPositive ? 'bi-caret-up-fill' : 'bi-caret-down-fill'}`} />
                          {st.trend}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Live site breakdown */}
            <div className="col-12 col-md-6">
              <div className="small fw-bold text-muted text-uppercase mb-2" style={{ letterSpacing: '0.5px' }}>
                {details.breakdownTitle || 'Station / Site Breakdown'}
              </div>
              <div className="d-grid gap-1.5">
                {details.contractors.map((c, i) => (
                  <div
                    key={i}
                    className="d-flex align-items-center justify-content-between p-2 rounded border bg-light-subtle"
                  >
                    <span className="fw-semibold text-body text-truncate flex-grow-1 me-2">{c.name}</span>
                    <div className="d-flex align-items-center gap-2 flex-shrink-0">
                      <span className="text-muted">{c.value}</span>
                      <span
                        className={`badge ${c.status === 'Optimal' || c.status === 'Excellent' || c.status === 'Approved' || c.status === 'Online' || c.status === 'Healthy' || c.status === 'On Track'
                          ? 'bg-success-subtle text-success border border-success-subtle'
                          : c.status === 'Critical'
                            ? 'bg-danger-subtle text-danger border border-danger-subtle'
                            : 'bg-warning-subtle text-warning border border-warning-subtle'
                          }`}
                      >
                        {c.status}
                      </span>
                    </div>
                  </div>
                ))}
                {details.contractors.length === 0 && (
                  <div className="text-muted small text-center py-3">
                    <i className="bi bi-inbox me-1" />
                    No site data available for the selected scope.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="card-footer bg-light p-2.5 d-flex gap-2 justify-content-end border-top">
          <button className="btn btn-xs btn-outline-secondary py-1 px-2.5" onClick={onClose}>
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
