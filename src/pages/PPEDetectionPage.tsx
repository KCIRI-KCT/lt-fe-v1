import { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboardService';
import { safetyService } from '../services/safetyService';
import type { AIAlert } from '../types';

import { fetchPPENotificationsFromAPI } from '../services/ppeNotificationService';

export const PPEDetectionPage = () => {
  const [ppeCompliance, setPpeCompliance] = useState({
    helmet: 95,
    vest: 92,
    mask: 88,
    boots: 96,
    gloves: 85,
  });
  const [ppeAlerts, setPpeAlerts] = useState<AIAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      dashboardService.getDashboardMetrics().catch(() => null),
      safetyService.getAIAlerts().catch(() => []),
      fetchPPENotificationsFromAPI().catch(() => []),
    ]).then(([metrics, alerts, ppeNotifs]) => {
      if (!isMounted) return;
      if (metrics?.ppeCompliance) {
        setPpeCompliance(metrics.ppeCompliance);
      }

      const ppeAsAlerts: AIAlert[] = (ppeNotifs || []).map((n) => ({
        id: n.id,
        type: 'no_ppe' as AIAlert['type'],
        description: `${n.alertDescription} (Acknowledged by ${n.acknowledgedByName})`,
        siteId: '',
        siteName: n.siteName,
        chainageId: '',
        chainageLabel: n.chainageName,
        cameraId: '',
        cameraName: 'Site Camera',
        severity: 'critical' as AIAlert['severity'],
        timestamp: n.acknowledgedAt || new Date().toISOString(),
        status: (n.status === 'resolved' ? 'resolved' : n.status === 'in_progress' ? 'acknowledged' : 'new') as AIAlert['status'],
        acknowledgedBy: n.acknowledgedByName,
      }));

      const filteredAi = Array.isArray(alerts)
        ? alerts.filter((a) => ['helmet_violation', 'vest_violation', 'mask_violation', 'no_ppe'].includes(a.type))
        : [];

      const combined = [...filteredAi];
      ppeAsAlerts.forEach((ppeItem) => {
        const existingIdx = combined.findIndex((a) => a.id === ppeItem.id || a.id === ppeItem.id.replace('ppe-notif-', ''));
        if (existingIdx !== -1) {
          if (ppeItem.status === 'resolved') {
            combined[existingIdx] = { ...combined[existingIdx], status: 'resolved' };
          }
        } else {
          combined.push(ppeItem);
        }
      });

      setPpeAlerts(combined);
    }).finally(() => {
      if (isMounted) setLoading(false);
    });
    return () => { isMounted = false; };
  }, []);

  const ppeItems = [
    { key: 'helmet' as const, label: 'Helmet', icon: 'bi-shield-fill-check', color: '#2563eb' },
    { key: 'vest' as const, label: 'Safety Vest', icon: 'bi-person-fill', color: '#d97706' },
    { key: 'mask' as const, label: 'Face Mask', icon: 'bi-mask', color: '#0891b2' },
    { key: 'boots' as const, label: 'Safety Boots', icon: 'bi-boot', color: '#0f766e' },
    { key: 'gloves' as const, label: 'Gloves', icon: 'bi-hand-index-fill', color: '#dc2626' },
  ];

  const avgCompliance = Math.round(
    Object.values(ppeCompliance).reduce((s, v) => s + v, 0) / Object.values(ppeCompliance).length
  );

  const statusColor = (pct: number) =>
    pct >= 90 ? '#16a34a' : pct >= 80 ? '#d97706' : '#dc2626';

  const statusLabel = (pct: number) =>
    pct >= 90 ? 'text-bg-success' : pct >= 80 ? 'text-bg-warning' : 'text-bg-danger';

  const alertTypeLabel = (type: string) => ({
    helmet_violation: 'No Helmet',
    vest_violation: 'No Vest',
    mask_violation: 'No Mask',
    no_ppe: 'No PPE',
  }[type] || type.replace('_', ' '));

  return (
    <div className="container-fluid px-3 px-lg-4 py-4">
      <div className="page-heading">
        <div className="page-heading-copy">
          <span className="page-icon"><i className="bi bi-shield-fill-check" aria-hidden="true" /></span>
          <div>
            <p className="eyebrow mb-1">Safety Compliance</p>
            <h1 className="h3 mb-1">PPE Detection</h1>
            <p className="text-muted mb-0">Real-time AI-powered PPE compliance monitoring across all sites.</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading PPE detection data...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Overall Score */}
          <section className="row g-3 mt-1">
            <div className="col-12 col-md-4">
              <div className="panel h-100 text-center py-4">
                <div style={{ fontSize: '3rem', color: statusColor(avgCompliance), fontWeight: 700 }}>
                  {avgCompliance}%
                </div>
                <div className="fw-semibold mt-1">Overall PPE Compliance</div>
                <div className="text-muted small mt-1">Average across all 5 PPE categories</div>
                <span className={`badge mt-2 ${statusLabel(avgCompliance)}`}>
                  {avgCompliance >= 90 ? 'Target Met' : avgCompliance >= 80 ? 'Below Target' : 'Critical'}
                </span>
              </div>
            </div>
            <div className="col-12 col-md-8">
              <div className="panel h-100">
                <h2 className="h5 mb-3 section-title">
                  <i className="bi bi-person-check" aria-hidden="true" />
                  <span>PPE Category Breakdown</span>
                </h2>
                <div className="d-grid gap-3">
                  {ppeItems.map(item => {
                    const val = ppeCompliance[item.key] || 0;
                    return (
                      <div key={item.key}>
                        <div className="d-flex justify-content-between mb-1 align-items-center">
                          <div className="d-flex align-items-center gap-2">
                            <i className={`bi ${item.icon}`} style={{ color: item.color }} />
                            <small className="fw-bold">{item.label}</small>
                          </div>
                          <div className="d-flex align-items-center gap-2">
                            <small className="fw-bold" style={{ color: statusColor(val) }}>{val}%</small>
                            <span className={`badge ${statusLabel(val)}`} style={{ fontSize: '0.68rem' }}>
                              {val >= 90 ? 'Good' : val >= 80 ? 'Watch' : 'Action'}
                            </span>
                          </div>
                        </div>
                        <div className="progress" style={{ height: '10px' }}>
                          <div
                            className="progress-bar"
                            style={{
                              width: `${val}%`,
                              background: `linear-gradient(90deg, ${item.color}, ${item.color}bb)`,
                            }}
                            role="progressbar"
                            aria-valuenow={val}
                            aria-valuemin={0}
                            aria-valuemax={100}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* PPE Violation Alerts */}
          <section className="panel mt-3">
            <div className="panel-header">
              <div>
                <h2 className="h5 mb-1 section-title">
                  <i className="bi bi-exclamation-triangle-fill text-danger" aria-hidden="true" />
                  <span>PPE Violation Alerts</span>
                </h2>
                <p className="text-muted mb-0">{ppeAlerts.length} active PPE violations detected by AI</p>
              </div>
            </div>
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr>
                    <th>Violation</th>
                    <th>Site</th>
                    <th>Camera</th>
                    <th className="text-center">Severity</th>
                    <th>Time</th>
                    <th className="text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ppeAlerts.length === 0 ? (
                    <tr><td colSpan={6} className="text-center text-muted py-4">No PPE violations detected</td></tr>
                  ) : ppeAlerts.map(alert => {
                    const sevLower = String(alert.severity || 'critical').toLowerCase();
                    return (
                      <tr key={alert.id}>
                        <td>
                          <div className="fw-semibold">{alertTypeLabel(alert.type)}</div>
                          <small className="text-muted">{alert.description}</small>
                        </td>
                        <td className="text-muted small">{alert.siteName}</td>
                        <td className="text-muted small">{alert.cameraName}</td>
                        <td className="text-center">
                          <span className={`badge ${sevLower === 'critical' ? 'text-bg-danger' : sevLower === 'high' || sevLower === 'major' ? 'text-bg-warning' : 'text-bg-secondary'}`}>
                            {sevLower}
                          </span>
                        </td>
                        <td className="text-muted small">{new Date(alert.timestamp).toLocaleTimeString()}</td>
                        <td className="text-center">
                          <span className={`badge ${alert.status === 'new' ? 'text-bg-danger' : alert.status === 'acknowledged' ? 'text-bg-warning' : 'text-bg-success'}`}>
                            {alert.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
};
