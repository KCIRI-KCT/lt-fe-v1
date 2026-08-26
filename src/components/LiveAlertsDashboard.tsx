import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  HardHat,
  Flame,
  AlertTriangle,
  UserX,
  Activity,
  RefreshCw,
  Pause,
  Play,
  Trash2,
  Filter,
  Search,
  Wifi,
  WifiOff,
  Clock,
  CheckCircle2,
  Camera,
  Layers,
  Zap,
} from 'lucide-react';
import { useDetectionAlerts } from '../hooks/useDetectionAlerts';
import type { AIAlert, AlertSeverity, AIAlertType } from '../types';

export interface LiveAlertsDashboardProps {
  siteId?: string;
  siteName?: string;
  initialWsUrl?: string;
}

export const LiveAlertsDashboard: React.FC<LiveAlertsDashboardProps> = ({
  siteId = 'all',
  siteName = 'All Sites Overview',
  initialWsUrl,
}) => {
  const {
    alerts,
    connectionStatus,
    lastError,
    reconnectCount,
    isPaused,
    stats,
    reconnect,
    clearAlerts,
    togglePause,
  } = useDetectionAlerts({
    siteId,
    wsUrl: initialWsUrl,
    maxAlerts: 100,
  });

  // Filter states
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'cards' | 'logs'>('cards');
  const [selectedAlertForModal, setSelectedAlertForModal] = useState<AIAlert | null>(null);

  // Filtered alert list
  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      // Severity filter
      if (selectedSeverity !== 'all' && alert.severity.toLowerCase() !== selectedSeverity.toLowerCase()) {
        return false;
      }
      // Type filter
      if (selectedType !== 'all' && alert.type !== selectedType) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const descMatch = alert.description.toLowerCase().includes(query);
        const camMatch = alert.cameraId.toLowerCase().includes(query);
        const siteMatch = (alert.siteName || alert.siteId).toLowerCase().includes(query);
        const typeMatch = alert.type.toLowerCase().includes(query);
        if (!descMatch && !camMatch && !siteMatch && !typeMatch) {
          return false;
        }
      }
      return true;
    });
  }, [alerts, selectedSeverity, selectedType, searchQuery]);

  // Helper for alert type icon & badge label
  const getAlertTypeMeta = (type: AIAlertType) => {
    switch (type) {
      case 'helmet_violation':
        return { label: 'Helmet Missing', icon: HardHat, colorClass: 'text-warning' };
      case 'vest_violation':
        return { label: 'Safety Vest Missing', icon: ShieldAlert, colorClass: 'text-info' };
      case 'no_ppe':
        return { label: 'No PPE Compliance', icon: ShieldAlert, colorClass: 'text-danger' };
      case 'fall_detected':
        return { label: 'Fall Hazard Detected', icon: AlertTriangle, colorClass: 'text-danger' };
      case 'restricted_zone':
        return { label: 'Restricted Zone Breach', icon: UserX, colorClass: 'text-warning' };
      case 'fire_detected':
      case 'smoke_detected':
        return { label: 'Fire / Smoke Hazard', icon: Flame, colorClass: 'text-danger' };
      default:
        return { label: 'Safety Violation', icon: Activity, colorClass: 'text-primary' };
    }
  };

  // Helper for severity badge styling
  const getSeverityBadgeClass = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical':
        return 'bg-danger text-white';
      case 'high':
        return 'bg-warning text-dark';
      case 'medium':
        return 'bg-info text-dark';
      case 'low':
        return 'bg-secondary text-white';
      default:
        return 'bg-dark text-white';
    }
  };

  // Helper for status indicator
  const renderConnectionBadge = () => {
    switch (connectionStatus) {
      case 'CONNECTED':
        return (
          <span className="badge bg-success-subtle text-success border border-success d-inline-flex align-items-center gap-1 px-3 py-2 rounded-pill">
            <span className="spinner-grow spinner-grow-sm me-1" role="status" aria-hidden="true" style={{ width: '8px', height: '8px' }}></span>
            <Wifi size={14} /> LIVE CONNECTED
          </span>
        );
      case 'CONNECTING':
        return (
          <span className="badge bg-warning-subtle text-warning border border-warning d-inline-flex align-items-center gap-1 px-3 py-2 rounded-pill">
            <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true" style={{ width: '12px', height: '12px' }}></span>
            CONNECTING...
          </span>
        );
      case 'RECONNECTING':
        return (
          <span className="badge bg-warning-subtle text-warning border border-warning d-inline-flex align-items-center gap-1 px-3 py-2 rounded-pill">
            <RefreshCw size={14} className="spin-animation me-1" />
            RECONNECTING (Attempt {reconnectCount})
          </span>
        );
      case 'ERROR':
      case 'DISCONNECTED':
      default:
        return (
          <span className="badge bg-danger-subtle text-danger border border-danger d-inline-flex align-items-center gap-1 px-3 py-2 rounded-pill">
            <WifiOff size={14} /> DISCONNECTED
          </span>
        );
    }
  };

  return (
    <div className="container-fluid p-4 bg-light min-vh-100">
      {/* Header Bar */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4 p-3 bg-white rounded-3 shadow-sm border">
        <div>
          <div className="d-flex align-items-center gap-2">
            <h4 className="fw-bold mb-0 text-dark">Live AI Alert Streaming Console</h4>
            <span className="badge bg-primary-subtle text-primary border border-primary px-2 py-1">
              Jetson Orin Nano Edge
            </span>
          </div>
          <p className="text-muted small mb-0 mt-1">
            Site Context: <strong className="text-dark">{siteName}</strong> ({siteId}) • Real-time computer vision alert feed
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          {renderConnectionBadge()}

          <button
            onClick={togglePause}
            className={`btn btn-sm d-flex align-items-center gap-1 ${isPaused ? 'btn-warning' : 'btn-outline-secondary'}`}
            title={isPaused ? 'Resume stream updates' : 'Pause stream updates'}
          >
            {isPaused ? <Play size={15} /> : <Pause size={15} />}
            {isPaused ? 'Stream Paused' : 'Pause Stream'}
          </button>

          <button
            onClick={reconnect}
            className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
            title="Force reconnect WebSocket"
          >
            <RefreshCw size={15} /> Reconnect
          </button>

          <button
            onClick={clearAlerts}
            className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
            title="Clear alert buffer"
          >
            <Trash2 size={15} /> Clear Feed
          </button>
        </div>
      </div>

      {/* Error Alert Banner */}
      {lastError && (
        <div className="alert alert-danger alert-dismissible fade show d-flex align-items-center justify-content-between" role="alert">
          <div>
            <strong>Stream Warning:</strong> {lastError}
          </div>
          <button onClick={reconnect} className="btn btn-sm btn-danger ms-3">
            Retry Connection
          </button>
        </div>
      )}

      {/* Metrics Summary Row */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-md-3">
          <div className="card border-0 shadow-sm rounded-3 h-100 bg-white border-start border-4 border-primary">
            <div className="card-body p-3 d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Total Alerts</span>
                <h3 className="fw-bold mb-0 text-dark mt-1">{stats.total}</h3>
              </div>
              <div className="p-3 bg-primary-subtle text-primary rounded-circle">
                <Zap size={24} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-md-3">
          <div className="card border-0 shadow-sm rounded-3 h-100 bg-white border-start border-4 border-danger">
            <div className="card-body p-3 d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Critical Hazards</span>
                <h3 className="fw-bold mb-0 text-danger mt-1">{stats.critical}</h3>
              </div>
              <div className="p-3 bg-danger-subtle text-danger rounded-circle">
                <ShieldAlert size={24} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-md-3">
          <div className="card border-0 shadow-sm rounded-3 h-100 bg-white border-start border-4 border-warning">
            <div className="card-body p-3 d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">High Severity</span>
                <h3 className="fw-bold mb-0 text-warning mt-1">{stats.high}</h3>
              </div>
              <div className="p-3 bg-warning-subtle text-warning rounded-circle">
                <AlertTriangle size={24} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-md-3">
          <div className="card border-0 shadow-sm rounded-3 h-100 bg-white border-start border-4 border-info">
            <div className="card-body p-3 d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Medium / Low</span>
                <h3 className="fw-bold mb-0 text-info mt-1">{stats.medium + stats.low}</h3>
              </div>
              <div className="p-3 bg-info-subtle text-info rounded-circle">
                <Activity size={24} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and View Toggle Toolbar */}
      <div className="card border-0 shadow-sm rounded-3 mb-4 bg-white">
        <div className="card-body p-3">
          <div className="row g-3 align-items-center">
            {/* Search Input */}
            <div className="col-12 col-md-4">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light text-muted border-end-0">
                  <Search size={15} />
                </span>
                <input
                  type="text"
                  className="form-control form-control-sm border-start-0 ps-0"
                  placeholder="Filter by description, camera, site..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Severity Filter */}
            <div className="col-6 col-md-3">
              <div className="d-flex align-items-center gap-2">
                <Filter size={15} className="text-muted" />
                <select
                  className="form-select form-select-sm"
                  value={selectedSeverity}
                  onChange={(e) => setSelectedSeverity(e.target.value)}
                >
                  <option value="all">All Severities</option>
                  <option value="critical">Critical Only</option>
                  <option value="high">High Only</option>
                  <option value="medium">Medium Only</option>
                  <option value="low">Low Only</option>
                </select>
              </div>
            </div>

            {/* Violation Type Filter */}
            <div className="col-6 col-md-3">
              <select
                className="form-select form-select-sm"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="all">All Violation Types</option>
                <option value="helmet_violation">Helmet Missing</option>
                <option value="vest_violation">Safety Vest Missing</option>
                <option value="no_ppe">No PPE</option>
                <option value="fall_detected">Fall Hazard</option>
                <option value="restricted_zone">Restricted Zone Breach</option>
                <option value="fire_detected">Fire / Smoke</option>
              </select>
            </div>

            {/* View Mode Tabs */}
            <div className="col-12 col-md-2 text-end">
              <div className="btn-group btn-group-sm w-100" role="group">
                <button
                  type="button"
                  className={`btn ${activeTab === 'cards' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setActiveTab('cards')}
                >
                  <Layers size={14} className="me-1" /> Cards
                </button>
                <button
                  type="button"
                  className={`btn ${activeTab === 'logs' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setActiveTab('logs')}
                >
                  <Clock size={14} className="me-1" /> Logs
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {filteredAlerts.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-3 bg-white text-center p-5 my-4">
          <div className="card-body">
            <div className="p-4 bg-light rounded-circle d-inline-flex mb-3 text-muted">
              <Activity size={40} />
            </div>
            <h5 className="fw-bold text-dark mb-2">No Live Detections Match Your Filter</h5>
            <p className="text-muted small max-w-md mx-auto mb-3">
              {alerts.length === 0
                ? 'Waiting for edge ingestion stream messages from Jetson Orin Nano...'
                : 'Try adjusting your search query or severity filters to view buffered detection events.'}
            </p>
            {alerts.length > 0 && (
              <button
                onClick={() => {
                  setSelectedSeverity('all');
                  setSelectedType('all');
                  setSearchQuery('');
                }}
                className="btn btn-sm btn-outline-primary"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      ) : activeTab === 'cards' ? (
        /* Detection Cards Grid */
        <div className="row g-3">
          {filteredAlerts.map((alert) => {
            const typeMeta = getAlertTypeMeta(alert.type);
            const IconComp = typeMeta.icon;
            const formattedTime = new Date(alert.timestamp).toLocaleTimeString();

            return (
              <div key={alert.id} className="col-12 col-md-6 col-lg-4">
                <div className="card h-100 border-0 shadow-sm rounded-3 bg-white position-relative hover-shadow transition-all">
                  <div className="card-header bg-white border-bottom-0 pt-3 pb-0 d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-2">
                      <span className={`p-2 rounded-circle bg-light ${typeMeta.colorClass}`}>
                        <IconComp size={18} />
                      </span>
                      <span className="fw-bold text-dark small">{typeMeta.label}</span>
                    </div>

                    <span className={`badge px-2 py-1 text-uppercase fw-semibold ${getSeverityBadgeClass(alert.severity)}`}>
                      {alert.severity}
                    </span>
                  </div>

                  <div className="card-body py-2">
                    <p className="card-text text-secondary small mb-2">{alert.description}</p>

                    {/* Snapshot / Bounding Box Preview */}
                    {alert.snapshot && (
                      <div className="position-relative rounded-2 overflow-hidden mb-2 bg-dark text-center" style={{ maxHeight: '160px' }}>
                        <img
                          src={alert.snapshot}
                          alt="Detection Snapshot"
                          className="img-fluid w-100 object-fit-cover"
                          style={{ maxHeight: '160px' }}
                        />
                        {alert.confidence && (
                          <span className="position-absolute bottom-0 end-0 bg-dark bg-opacity-75 text-white px-2 py-1 small rounded-start">
                            Conf: {(alert.confidence * (alert.confidence <= 1 ? 100 : 1)).toFixed(0)}%
                          </span>
                        )}
                      </div>
                    )}

                    <div className="bg-light p-2 rounded-2 small text-muted">
                      <div className="d-flex justify-content-between mb-1">
                        <span><Camera size={13} className="me-1" /> Camera:</span>
                        <strong className="text-dark">{alert.cameraName || alert.cameraId}</strong>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span><Clock size={13} className="me-1" /> Time:</span>
                        <span className="text-dark">{formattedTime}</span>
                      </div>
                    </div>
                  </div>

                  <div className="card-footer bg-white border-top-0 pb-3 pt-0 d-flex justify-content-between align-items-center">
                    <span className="badge bg-light text-dark border">
                      Status: {alert.status.toUpperCase()}
                    </span>
                    <button
                      onClick={() => setSelectedAlertForModal(alert)}
                      className="btn btn-sm btn-link text-decoration-none p-0 fw-semibold text-primary"
                    >
                      View Details &rarr;
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Timestamped Activity Logs View */
        <div className="card border-0 shadow-sm rounded-3 bg-white">
          <div className="card-header bg-white border-bottom p-3">
            <h6 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
              <Clock size={16} /> Real-Time Event Audit Stream ({filteredAlerts.length} entries)
            </h6>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light small text-uppercase">
                  <tr>
                    <th scope="col">Time</th>
                    <th scope="col">Severity</th>
                    <th scope="col">Type</th>
                    <th scope="col">Description</th>
                    <th scope="col">Camera / Location</th>
                    <th scope="col">Confidence</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody className="small">
                  {filteredAlerts.map((alert) => {
                    const typeMeta = getAlertTypeMeta(alert.type);
                    const formattedTime = new Date(alert.timestamp).toLocaleTimeString();

                    return (
                      <tr key={`log-${alert.id}`}>
                        <td className="text-nowrap text-muted fw-mono">{formattedTime}</td>
                        <td>
                          <span className={`badge px-2 py-1 text-uppercase ${getSeverityBadgeClass(alert.severity)}`}>
                            {alert.severity}
                          </span>
                        </td>
                        <td>
                          <span className="fw-semibold">{typeMeta.label}</span>
                        </td>
                        <td className="text-truncate max-w-xs">{alert.description}</td>
                        <td>{alert.cameraName || alert.cameraId}</td>
                        <td>
                          {alert.confidence
                            ? `${(alert.confidence * (alert.confidence <= 1 ? 100 : 1)).toFixed(0)}%`
                            : 'N/A'}
                        </td>
                        <td>
                          <button
                            onClick={() => setSelectedAlertForModal(alert)}
                            className="btn btn-xs btn-outline-secondary py-0 px-2"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Alert Inspector Modal */}
      {selectedAlertForModal && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                  <ShieldAlert size={20} className="text-danger" /> Detection Details ({selectedAlertForModal.id})
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedAlertForModal(null)}
                ></button>
              </div>

              <div className="modal-body p-4">
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <div className="p-3 bg-light rounded-3 mb-3">
                      <h6 className="fw-bold mb-2 text-dark">Violation Overview</h6>
                      <p className="mb-2 text-secondary">{selectedAlertForModal.description}</p>
                      <ul className="list-unstyled mb-0 small">
                        <li className="mb-1"><strong>Severity:</strong> <span className={`badge ${getSeverityBadgeClass(selectedAlertForModal.severity)}`}>{selectedAlertForModal.severity}</span></li>
                        <li className="mb-1"><strong>Category:</strong> {selectedAlertForModal.type}</li>
                        <li className="mb-1"><strong>Status:</strong> {selectedAlertForModal.status}</li>
                        <li className="mb-1"><strong>Timestamp:</strong> {new Date(selectedAlertForModal.timestamp).toLocaleString()}</li>
                        <li><strong>Confidence Score:</strong> {selectedAlertForModal.confidence ? `${(selectedAlertForModal.confidence * (selectedAlertForModal.confidence <= 1 ? 100 : 1)).toFixed(1)}%` : 'N/A'}</li>
                      </ul>
                    </div>

                    <div className="p-3 bg-light rounded-3">
                      <h6 className="fw-bold mb-2 text-dark">Edge Sensor Location</h6>
                      <ul className="list-unstyled mb-0 small">
                        <li className="mb-1"><strong>Site ID:</strong> {selectedAlertForModal.siteId}</li>
                        <li className="mb-1"><strong>Camera ID:</strong> {selectedAlertForModal.cameraId}</li>
                        <li><strong>Chainage Marker:</strong> {selectedAlertForModal.chainageLabel || 'N/A'}</li>
                      </ul>
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <h6 className="fw-bold mb-2 text-dark">Frame Capture & Bounding Box</h6>
                    {selectedAlertForModal.snapshot ? (
                      <img
                        src={selectedAlertForModal.snapshot}
                        alt="Edge Detection Frame"
                        className="img-fluid rounded-3 border shadow-sm w-100"
                      />
                    ) : (
                      <div className="p-5 bg-dark text-white text-center rounded-3">
                        <Camera size={36} className="text-secondary mb-2" />
                        <p className="small mb-0 text-muted">No frame snapshot transmitted for this telemetry event</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-footer border-top">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedAlertForModal(null)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-primary d-flex align-items-center gap-1"
                  onClick={() => setSelectedAlertForModal(null)}
                >
                  <CheckCircle2 size={16} /> Acknowledge Alert
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveAlertsDashboard;
