<<<<<<< HEAD
import { useState, useEffect } from 'react';
import { safetyService } from '../services/safetyService';
import type { AIAlert } from '../types';

export const IntrusionDetectionPage = () => {
  const [alerts, setAlerts] = useState<AIAlert[]>([]);
  const [loading, setLoading] = useState(true);

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

  const intrusionAlerts = alerts.filter(a =>
=======
import { MOCK_AI_ALERTS } from '../services/mockData';

export const IntrusionDetectionPage = () => {
  const intrusionAlerts = MOCK_AI_ALERTS.filter(a =>
>>>>>>> MS-ltfe-report
    ['restricted_zone', 'fire_detected', 'smoke_detected'].includes(a.type)
  );

  const stats = [
    { label: 'Restricted Zone Breaches', value: intrusionAlerts.filter(a => a.type === 'restricted_zone').length.toString(), color: '#dc2626', icon: 'bi-sign-stop-fill' },
    { label: 'Fire Detected', value: intrusionAlerts.filter(a => a.type === 'fire_detected').length.toString(), color: '#ea580c', icon: 'bi-fire' },
    { label: 'Smoke Detected', value: intrusionAlerts.filter(a => a.type === 'smoke_detected').length.toString(), color: '#d97706', icon: 'bi-cloud-fill' },
    { label: 'Total Intrusion Events', value: intrusionAlerts.length.toString(), color: '#2563eb', icon: 'bi-shield-exclamation' },
  ];

  const typeLabel = (type: string) => ({
    restricted_zone: 'Restricted Zone Breach',
    fire_detected: 'Fire Detected',
    smoke_detected: 'Smoke Detected',
  }[type] || type.replace('_', ' '));

  const typeIcon = (type: string) => ({
    restricted_zone: 'bi-sign-stop-fill text-danger',
    fire_detected: 'bi-fire text-warning',
    smoke_detected: 'bi-cloud-fill text-secondary',
  }[type] || 'bi-exclamation-circle text-danger');

  return (
    <div className="container-fluid px-3 px-lg-4 py-4">
      <div className="page-heading">
        <div className="page-heading-copy">
          <span className="page-icon"><i className="bi bi-shield-exclamation" aria-hidden="true" /></span>
          <div>
            <p className="eyebrow mb-1">Security & Safety</p>
            <h1 className="h3 mb-1">Intrusion Detection</h1>
            <p className="text-muted mb-0">AI-powered restricted zone monitoring, fire and smoke detection across all camera feeds.</p>
          </div>
        </div>
      </div>

<<<<<<< HEAD
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading intrusion alerts...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Stats */}
=======
      {/* Stats */}
>>>>>>> MS-ltfe-report
      <section className="row g-3 mt-1">
        {stats.map((s, i) => (
          <div key={i} className="col-12 col-sm-6 col-xl-3">
            <div className="panel h-100">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="fw-semibold text-muted small">{s.label}</span>
                <span className="panel-icon" style={{ background: `${s.color}18`, color: s.color }}>
                  <i className={`bi ${s.icon}`} />
                </span>
              </div>
              <div className="h3 fw-bold mb-0" style={{ color: s.color }}>{s.value}</div>
            </div>
          </div>
        ))}
      </section>

      {/* Intrusion Events Table */}
      <section className="panel mt-3">
        <div className="panel-header">
          <div>
            <h2 className="h5 mb-1 section-title">
              <i className="bi bi-exclamation-triangle-fill text-danger" aria-hidden="true" />
              <span>Intrusion & Safety Events</span>
            </h2>
            <p className="text-muted mb-0">
              {intrusionAlerts.length > 0 ? `${intrusionAlerts.length} events detected` : 'No intrusion events detected'}
            </p>
          </div>
        </div>
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>Event Type</th>
                <th>Site</th>
                <th>Camera</th>
                <th className="text-center">Severity</th>
                <th>Timestamp</th>
                <th className="text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {intrusionAlerts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-4">
                    <i className="bi bi-shield-check fs-2 d-block mb-2 text-success" />
                    No intrusion events detected. All zones are secure.
                  </td>
                </tr>
              ) : intrusionAlerts.map(alert => (
                <tr key={alert.id}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <i className={`bi ${typeIcon(alert.type)}`} />
                      <div>
                        <div className="fw-semibold">{typeLabel(alert.type)}</div>
                        <small className="text-muted">{alert.description}</small>
                      </div>
                    </div>
                  </td>
                  <td className="text-muted small">{alert.siteName}</td>
                  <td className="text-muted small">{alert.cameraName}</td>
                  <td className="text-center">
                    <span className={`badge ${alert.severity === 'critical' ? 'text-bg-danger' : alert.severity === 'high' ? 'text-bg-warning' : 'text-bg-secondary'}`}>
                      {alert.severity}
                    </span>
                  </td>
                  <td className="text-muted small">{new Date(alert.timestamp).toLocaleString()}</td>
                  <td className="text-center">
                    <span className={`badge ${alert.status === 'new' ? 'text-bg-danger' : alert.status === 'acknowledged' ? 'text-bg-warning' : 'text-bg-success'}`}>
                      {alert.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Zone Map Placeholder */}
      <section className="panel mt-3">
        <div className="panel-header">
          <div>
            <h2 className="h5 mb-1 section-title">
              <i className="bi bi-map-fill" aria-hidden="true" />
              <span>Restricted Zone Map</span>
            </h2>
            <p className="text-muted mb-0">Camera coverage and restricted zone boundaries</p>
          </div>
        </div>
        <div
          className="rounded d-flex align-items-center justify-content-center text-muted"
          style={{ height: '240px', background: 'var(--bs-tertiary-bg, #f8f9fa)', border: '2px dashed var(--bs-border-color)' }}
        >
          <div className="text-center">
            <i className="bi bi-map fs-1 d-block mb-2" />
            <div className="fw-semibold">Zone Map View</div>
            <small>Interactive map with camera overlays coming soon</small>
          </div>
        </div>
      </section>
<<<<<<< HEAD
    </>
  )}
</div>
=======
    </div>
>>>>>>> MS-ltfe-report
  );
};
