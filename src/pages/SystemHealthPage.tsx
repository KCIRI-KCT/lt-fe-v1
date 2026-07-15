import { useState } from 'react';

type HealthTab = 'cameras' | 'edge' | 'server' | 'network';

interface CameraDetail {
  name: string;
  id: string;
  site: string;
  health: number;
  last: string;
  edge: string;
  status: 'Working' | 'Offline';
  ai: string;
  rtspUrl: string;
  important?: boolean;
}

interface EdgeDetail {
  name: string;
  id: string;
  site: string;
  cpu: number;
  ram: number;
  temp: number | null;
  storage: number | null;
  network: number | null;
  last: string;
  status: 'Working' | 'Not Working';
  ip: string;
  location: string;
}

export const SystemHealthPage = () => {
  const [activeTab, setActiveTab] = useState<HealthTab>('cameras');
  const [expandedCamId, setExpandedCamId] = useState<string | null>(null);
  const [expandedEdgeId, setExpandedEdgeId] = useState<string | null>(null);

  // Search & Filter state for Cameras
  const [camSearch, setCamSearch] = useState<string>('');
  const [camFilter, setCamFilter] = useState<'all' | 'online' | 'offline'>('all');
  const [camPage, setCamPage] = useState(1);
  const [camPageSize, setCamPageSize] = useState(3); // default size 3 to show pagination for small lists

  // Search & Filter state for Edge Devices
  const [edgeSearch, setEdgeSearch] = useState<string>('');
  const [edgeFilter, setEdgeFilter] = useState<'all' | 'online' | 'offline'>('all');
  const [edgePage, setEdgePage] = useState(1);
  const [edgePageSize, setEdgePageSize] = useState(3); // default size 3 to show pagination for small lists

  // Network Refresh states
  const [isRefreshingNetwork, setIsRefreshingNetwork] = useState(false);
  const [showRefreshToast, setShowRefreshToast] = useState(false);

  // Network Config Editable states
  const [savedNetConfig, setSavedNetConfig] = useState({
    interface: 'Ethernet (eth0)',
    ip: '192.168.10.150',
    subnet: '255.255.255.0',
    gateway: '192.168.10.1',
    dns1: '8.8.8.8',
    dns2: '1.1.1.1'
  });
  const [netConfig, setNetConfig] = useState({ ...savedNetConfig });
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [isEditingConfig, setIsEditingConfig] = useState(false);
  const [isEnteringEditMode, setIsEnteringEditMode] = useState(false);

  const handleEnterEditMode = () => {
    setIsEnteringEditMode(true);
    setTimeout(() => {
      setIsEnteringEditMode(false);
      setIsEditingConfig(true);
    }, 800);
  };

  const handleCancelConfig = () => {
    setNetConfig({ ...savedNetConfig }); // revert changes!
    setIsEditingConfig(false);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingConfig(true);
    setTimeout(() => {
      setIsSavingConfig(false);
      setIsEditingConfig(false);
      setSavedNetConfig({ ...netConfig }); // commit changes!
      setShowSaveToast(true);
      setTimeout(() => setShowSaveToast(false), 3000);
    }, 1000);
  };

  const handleRefreshNetwork = () => {
    setIsRefreshingNetwork(true);
    setTimeout(() => {
      setIsRefreshingNetwork(false);
      setShowRefreshToast(true);
      setTimeout(() => setShowRefreshToast(false), 3000);
    }, 1500);
  };

  // Mock Camera Details List (10 cameras)
  const cameraDetails: CameraDetail[] = [
    { name: 'AI Entrance Cam 02', id: 'CAM-201', site: 'Highway Widening Zone B', health: 92, last: 'Live', edge: 'EDGE-05', status: 'Working', ai: 'Running', rtspUrl: 'rtsp://192.168.1.15/stream1', important: true },
    { name: 'AI Tower Crane Cam 03', id: 'CAM-103', site: 'Southern Bypass Package A', health: 98, last: 'Live', edge: 'EDGE-01', status: 'Working', ai: 'Running', rtspUrl: 'rtsp://192.168.1.13/stream1', important: true },
    { name: 'AI Perimeter Cam 05', id: 'CAM-105', site: 'Southern Bypass Package A', health: 95, last: 'Live', edge: 'EDGE-01', status: 'Working', ai: 'Running', rtspUrl: 'rtsp://192.168.1.14/stream1', important: true },
    { name: 'AI Pole Cam 01', id: 'CAM-101', site: 'Southern Bypass Package A', health: 96, last: 'Live', edge: 'EDGE-01', status: 'Working', ai: 'Running', rtspUrl: 'rtsp://192.168.1.10/stream1', important: true },
    { name: 'AI Pole Cam 02', id: 'CAM-102', site: 'Southern Bypass Package A', health: 62, last: '4 min ago', edge: 'EDGE-01', status: 'Offline', ai: 'Disconnected', rtspUrl: 'rtsp://192.168.1.11/stream1', important: false },
    { name: 'AI Tower Cam 07', id: 'CAM-203', site: 'Highway Widening Zone B', health: 93, last: 'Live', edge: 'EDGE-05', status: 'Working', ai: 'Running', rtspUrl: 'rtsp://192.168.1.12/stream1', important: false },
    { name: 'AI Yard Cam 04', id: 'CAM-104', site: 'Southern Bypass Package A', health: 88, last: '12 min ago', edge: 'EDGE-01', status: 'Working', ai: 'Running', rtspUrl: 'rtsp://192.168.1.16/stream1', important: false },
    { name: 'AI Tunnel Cam 08', id: 'CAM-301', site: 'Bridge Approach Segment C', health: 0, last: '1 hr ago', edge: 'EDGE-09', status: 'Offline', ai: 'Disconnected', rtspUrl: 'rtsp://192.168.1.17/stream1', important: false },
    // { name: 'AI Storage Cam 09', id: 'CAM-302', site: 'Bridge Approach Segment C', health: 91, last: 'Live', edge: 'EDGE-09', status: 'Working', ai: 'Running', rtspUrl: 'rtsp://192.168.1.18/stream1', important: false },
    // { name: 'AI Road Cam 10', id: 'CAM-204', site: 'Highway Widening Zone B', health: 87, last: 'Live', edge: 'EDGE-05', status: 'Working', ai: 'Running', rtspUrl: 'rtsp://192.168.1.19/stream1', important: false },
  ];

  // Mock Edge Device Details List (6 edge devices)
  const edgeDetails: EdgeDetail[] = [
    { name: 'Jetson NX Unit 01', id: 'EDGE-01', site: 'Southern Bypass Package A', cpu: 38, ram: 61, temp: 52, storage: 64, network: 845, last: '10 sec ago', status: 'Working', ip: '192.168.10.101', location: 'Site A Office' },
    { name: 'Jetson NX Unit 02', id: 'EDGE-02', site: 'Southern Bypass Package A', cpu: 45, ram: 58, temp: 50, storage: 60, network: 810, last: '5 sec ago', status: 'Working', ip: '192.168.10.104', location: 'Site A Yard' },
    { name: 'Jetson NX Unit 05', id: 'EDGE-05', site: 'Highway Widening Zone B', cpu: 49, ram: 68, temp: 57, storage: 72, network: 772, last: '15 sec ago', status: 'Working', ip: '192.168.10.102', location: 'Site B Entrance' },
    { name: 'Jetson NX Unit 06', id: 'EDGE-06', site: 'Highway Widening Zone B', cpu: 41, ram: 55, temp: 48, storage: 58, network: 790, last: '20 sec ago', status: 'Working', ip: '192.168.10.105', location: 'Site B Main Office' },
    { name: 'Jetson NX Unit 09', id: 'EDGE-09', site: 'Bridge Approach Segment C', cpu: 0, ram: 0, temp: null, storage: null, network: null, last: '18 min ago', status: 'Not Working', ip: '192.168.10.103', location: 'Site C Tunnel Entrance' },
    { name: 'Jetson NX Unit 10', id: 'EDGE-10', site: 'Bridge Approach Segment C', cpu: 0, ram: 0, temp: null, storage: null, network: null, last: '2 hr ago', status: 'Not Working', ip: '192.168.10.106', location: 'Site C Storage Yard' },
  ];

  // Filtering cameras
  const filteredCameras = cameraDetails.filter((cam) => {
    const matchesSearch = cam.name.toLowerCase().includes(camSearch.toLowerCase()) ||
      cam.id.toLowerCase().includes(camSearch.toLowerCase()) ||
      cam.site.toLowerCase().includes(camSearch.toLowerCase());
    const matchesFilter = camFilter === 'all' ||
      (camFilter === 'online' && cam.status === 'Working') ||
      (camFilter === 'offline' && cam.status === 'Offline');
    return matchesSearch && matchesFilter;
  });

  // Filtering edge devices
  const filteredEdges = edgeDetails.filter((edge) => {
    const matchesSearch = edge.name.toLowerCase().includes(edgeSearch.toLowerCase()) ||
      edge.id.toLowerCase().includes(edgeSearch.toLowerCase()) ||
      edge.site.toLowerCase().includes(edgeSearch.toLowerCase());
    const matchesFilter = edgeFilter === 'all' ||
      (edgeFilter === 'online' && edge.status === 'Working') ||
      (edgeFilter === 'offline' && edge.status === 'Not Working');
    return matchesSearch && matchesFilter;
  });

  const handleToggleCam = (id: string) => {
    setExpandedCamId((prev) => (prev === id ? null : id));
  };

  const handleToggleEdge = (id: string) => {
    setExpandedEdgeId((prev) => (prev === id ? null : id));
  };

  const renderPagination = (
    total: number,
    page: number,
    pageSize: number,
    onPageChange: (p: number) => void,
    onPageSizeChange: (s: number) => void
  ) => {
    const totalPages = Math.ceil(total / pageSize) || 1;
    return (
      <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mt-3 border-top pt-3 bg-body-tertiary p-2 rounded">
        <div className="d-flex align-items-center gap-2">
          <small className="text-muted">
            Showing {total === 0 ? 0 : ((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, total)} of {total}
          </small>
          <select
            className="form-select form-select-sm"
            style={{ width: 'auto' }}
            value={pageSize}
            onChange={(e) => {
              onPageSizeChange(Number(e.target.value));
              onPageChange(1);
            }}
          >
            {[3, 5, 10, 20].map((s) => (
              <option key={s} value={s}>{s} / page</option>
            ))}
          </select>
        </div>
        <nav aria-label="List pagination">
          <ul className="pagination pagination-sm mb-0">
            <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>Previous</button>
            </li>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <li key={p} className={`page-item ${p === page ? 'active' : ''}`}>
                <button className="page-link" onClick={() => onPageChange(p)}>{p}</button>
              </li>
            ))}
            <li className={`page-item ${page >= totalPages ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>Next</button>
            </li>
          </ul>
        </nav>
      </div>
    );
  };

  return (
    <div className="container-fluid px-3 px-lg-4 py-4">
      <style dangerouslySetInnerHTML={{
        __html: `
        .health-card-tab {
          cursor: pointer;
          transition: all 0.2s ease-in-out;
          border: 1px solid var(--bs-border-color);
        }
        .health-card-tab:hover {
          transform: translateY(-2px);
          background-color: var(--bs-tertiary-bg);
        }
        .health-card-tab.active {
          border-color: var(--bs-primary);
          background-color: var(--bs-primary-bg-subtle);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.08);
        }
        .health-list-item {
          border: 1px solid var(--bs-border-color);
          border-radius: 8px;
          background-color: var(--bs-body-bg);
          transition: all 0.15s ease-in-out;
        }
        .health-list-item:hover {
          border-color: var(--bs-primary-border-subtle);
          background-color: var(--bs-tertiary-bg);
        }
        .details-box {
          background-color: var(--bs-secondary-bg);
          border-radius: 6px;
          padding: 1rem;
          margin-top: 0.5rem;
          border-left: 3px solid var(--bs-primary);
        }
        .glow-dot-status {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
        }
        .glow-dot-status.green {
          background-color: #22c55e;
          box-shadow: 0 0 6px #22c55e;
        }
        .glow-dot-status.red {
          background-color: #dc2626;
          box-shadow: 0 0 6px #dc2626;
        }
        .scrollable-box {
          max-height: calc(100vh - 380px);
          overflow-y: auto;
          padding-right: 6px;
        }
        @keyframes pulse-grow {
          0% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.8; }
        }
        .glow-pulse-dot {
          animation: pulse-grow 2s infinite ease-in-out;
        }
        @keyframes wave {
          0% { transform: scale(0.8); opacity: 0.5; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        .ping-wave {
          position: absolute;
          width: 20px;
          height: 20px;
          background: rgba(34, 197, 94, 0.4);
          border-radius: 50%;
          animation: wave 1.8s infinite linear;
        }
        .server-stat-item {
          font-size: 0.78rem;
          color: var(--bs-secondary-color);
        }
        .server-stat-val {
          font-weight: bold;
          color: var(--bs-heading-color);
        }
        .animated-bar {
          position: relative;
          overflow: hidden;
        }
        .animated-bar::after {
          content: "";
          position: absolute;
          top: 0; left: 0; bottom: 0; right: 0;
          background-image: linear-gradient(
            -45deg, 
            rgba(255, 255, 255, .15) 25%, 
            transparent 25%, 
            transparent 50%, 
            rgba(255, 255, 255, .15) 50%, 
            rgba(255, 255, 255, .15) 75%, 
            transparent 75%, 
            transparent
          );
          background-size: 40px 40px;
          animation: progress-bar-stripes 2s linear infinite;
        }
      `}} />

      {/* Page Header */}
      <div className="page-heading">
        <div className="page-heading-copy">
          <span className="page-icon"><i className="bi bi-heart-pulse text-danger" aria-hidden="true" /></span>
          <div>
            <p className="eyebrow mb-1">Diagnostics</p>
            <h1 className="h3 mb-0">System Health</h1>
          </div>
        </div>
      </div>

      {/* Main Tab Cards Row */}
      <div className="row g-3 mt-1 mb-4">
        {/* Tab 1: Total Cameras */}
        <div className="col-12 col-md-6 col-lg-3">
          <div
            className={`panel health-card-tab p-4 h-100 ${activeTab === 'cameras' ? 'active' : ''}`}
            onClick={() => setActiveTab('cameras')}
          >
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="eyebrow text-muted text-uppercase fw-bold"><i className="bi bi-camera-video me-2 text-primary" />Cameras</span>
              <span className="badge bg-primary rounded-pill">{cameraDetails.length} Total</span>
            </div>
            <p className="text-muted small mb-3" style={{ fontSize: '0.73rem' }}>RTSP stream feeds and connection status</p>
            <div className="row g-2">
              <div className="col-6">
                <div className="p-2 rounded bg-success-subtle border border-success-subtle text-center">
                  <div className="text-success small fw-semibold" style={{ fontSize: '0.72rem' }}>Online</div>
                  <div className="h4 mb-0 fw-bold text-success">{cameraDetails.filter(c => c.status === 'Working').length}</div>
                </div>
              </div>
              <div className="col-6">
                <div className="p-2 rounded bg-danger-subtle border border-danger-subtle text-center">
                  <div className="text-danger small fw-semibold" style={{ fontSize: '0.72rem' }}>Offline</div>
                  <div className="h4 mb-0 fw-bold text-danger">{cameraDetails.filter(c => c.status === 'Offline').length}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab 2: Total Edge Devices */}
        <div className="col-12 col-md-6 col-lg-3">
          <div
            className={`panel health-card-tab p-4 h-100 ${activeTab === 'edge' ? 'active' : ''}`}
            onClick={() => setActiveTab('edge')}
          >
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="eyebrow text-muted text-uppercase fw-bold"><i className="bi bi-cpu me-2 text-primary" />Edge Devices</span>
              <span className="badge bg-primary rounded-pill">{edgeDetails.length} Total</span>
            </div>
            <p className="text-muted small mb-3" style={{ fontSize: '0.73rem' }}>Jetson processing node gateway logs</p>
            <div className="row g-2">
              <div className="col-6">
                <div className="p-2 rounded bg-success-subtle border border-success-subtle text-center">
                  <div className="text-success small fw-semibold" style={{ fontSize: '0.72rem' }}>Online</div>
                  <div className="h4 mb-0 fw-bold text-success">{edgeDetails.filter(e => e.status === 'Working').length}</div>
                </div>
              </div>
              <div className="col-6">
                <div className="p-2 rounded bg-danger-subtle border border-danger-subtle text-center">
                  <div className="text-danger small fw-semibold" style={{ fontSize: '0.72rem' }}>Offline</div>
                  <div className="h4 mb-0 fw-bold text-danger">{edgeDetails.filter(e => e.status === 'Not Working').length}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab 3: Server */}
        <div className="col-12 col-md-6 col-lg-3">
          <div
            className={`panel health-card-tab p-4 h-100 position-relative overflow-hidden ${activeTab === 'server' ? 'active' : ''}`}
            onClick={() => setActiveTab('server')}
          >
            {/* Ping animation light in corner */}
            <div className="position-absolute" style={{ top: '15px', right: '15px' }}>
              <span className="ping-wave" />
              <span className="glow-dot-status green glow-pulse-dot position-relative" style={{ zIndex: 1, top: '-6px' }} />
            </div>

            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="eyebrow text-muted text-uppercase fw-bold"><i className="bi bi-hdd-network me-2 text-primary" />Server Diagnostics</span>
            </div>
            <p className="text-muted small mb-2" style={{ fontSize: '0.73rem' }}>Core CPU / RAM telemetry & uptime stats</p>

            <div className="d-grid gap-2">
              <div>
                <div className="d-flex justify-content-between mb-1 text-muted small" style={{ fontSize: '0.75rem' }}>
                  <span>CPU Usage</span>
                  <span className="fw-bold">42%</span>
                </div>
                <div className="progress" style={{ height: '6px' }}>
                  <div className="progress-bar bg-info animated-bar" style={{ width: '42%' }} />
                </div>
              </div>

              <div>
                <div className="d-flex justify-content-between mb-1 text-muted small" style={{ fontSize: '0.75rem' }}>
                  <span>Memory (RAM)</span>
                  <span className="fw-bold">68%</span>
                </div>
                <div className="progress" style={{ height: '6px' }}>
                  <div className="progress-bar bg-warning animated-bar" style={{ width: '68%' }} />
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center border-top pt-2 mt-1">
                {/* <span className="server-stat-item">AI Latency</span>
                <span className="server-stat-val small">45 ms</span> */}
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span className="server-stat-item">Uptime</span>
                <span className="server-stat-val small">36 Days, 14 Hrs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab 4: Network Diagnostics */}
        <div className="col-12 col-md-6 col-lg-3">
          <div
            className={`panel health-card-tab p-4 h-100 position-relative overflow-hidden ${activeTab === 'network' ? 'active' : ''}`}
            onClick={() => setActiveTab('network')}
          >
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="eyebrow text-muted text-uppercase fw-bold"><i className="bi bi-hdd-network me-2 text-primary" />Network Config</span>
              <span className="badge bg-success rounded-pill">Connected</span>
            </div>
            <p className="text-muted small mb-3" style={{ fontSize: '0.73rem' }}>Gateway route and interface parameters</p>
            
            <div className="d-grid gap-1 small mt-2">
              <div className="d-flex justify-content-between">
                <span className="text-muted">IP Address:</span>
                <span className="fw-semibold text-body-emphasis">{netConfig.ip}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Interface:</span>
                <span className="fw-semibold text-body-emphasis">{netConfig.interface}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Latency:</span>
                <span className="fw-semibold text-success">12 ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Network Status & Config Card (Visible only when 'network' tab is active) */}
      {activeTab === 'network' && (
        <form onSubmit={handleSaveConfig} className="panel mb-4 p-4 border border-opacity-10 bg-body shadow-sm">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3 pb-2 border-bottom">
            <div>
              <h5 className="fw-bold mb-1">
                <i className="bi bi-hdd-network me-2 text-primary" />
                Network Management & Control
              </h5>
              <p className="text-muted mb-0 small">Real-time status monitoring, network configuration attributes, and gateway routes.</p>
            </div>
            
            {isEditingConfig ? (
              <div className="d-flex align-items-center gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={handleCancelConfig}
                  disabled={isSavingConfig}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-success btn-sm d-flex align-items-center gap-2"
                  disabled={isSavingConfig}
                >
                  {isSavingConfig ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" style={{ width: '12px', height: '12px' }} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-floppy" />
                      Save Configuration
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2"
                  onClick={handleRefreshNetwork}
                  disabled={isRefreshingNetwork}
                >
                  {isRefreshingNetwork ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" style={{ width: '12px', height: '12px' }} />
                      Refreshing...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-arrow-clockwise" />
                      Refresh Network Status
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm d-flex align-items-center gap-2"
                  onClick={handleEnterEditMode}
                  disabled={isEnteringEditMode}
                >
                  {isEnteringEditMode ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" style={{ width: '12px', height: '12px' }} />
                      Loading...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-pencil" />
                      Edit Configuration
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="row g-3">
            {/* Section 1: Network Status */}
            <div className="col-12 col-md-6 col-lg-4">
              <div className="p-3 border rounded bg-body-tertiary h-100 position-relative overflow-hidden">
                <h6 className="fw-bold text-uppercase text-secondary mb-3 small" style={{ letterSpacing: '0.5px' }}>
                  <i className="bi bi-activity text-success me-2" />
                  Network Status
                </h6>
                
                <div className="d-grid gap-2">
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="small text-muted">Gateway Link</span>
                    <span className="badge bg-success-subtle text-success border border-success border-opacity-25 px-2">Connected</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="small text-muted">AI Streams Upload</span>
                    <span className="badge bg-info-subtle text-info border border-info border-opacity-25 px-2">Stable (120 Mbps)</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="small text-muted">Latency (Ping)</span>
                    <strong className="text-success small">12 ms</strong>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="small text-muted">Packet Loss</span>
                    <strong className="text-success small">0.00%</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Network Config */}
            <div className="col-12 col-md-6 col-lg-4">
              <div className="p-3 border rounded bg-body-tertiary h-100">
                <h6 className="fw-bold text-uppercase text-secondary mb-3 small" style={{ letterSpacing: '0.5px' }}>
                  <i className="bi bi-gear-fill text-primary me-2" />
                  Network Config
                </h6>

                <div className="d-grid gap-2" style={{ fontSize: '0.82rem' }}>
                  <div className="d-flex flex-column gap-1">
                    <label className="text-muted small">Active Interface</label>
                    <select
                      className="form-select form-select-sm"
                      value={netConfig.interface}
                      onChange={(e) => setNetConfig({ ...netConfig, interface: e.target.value })}
                      disabled={!isEditingConfig}
                    >
                      <option value="Ethernet (eth0)">Ethernet (eth0)</option>
                      <option value="Ethernet (eth1)">Ethernet (eth1)</option>
                      <option value="Wireless (wlan0)">Wireless (wlan0)</option>
                    </select>
                  </div>
                  <div className="d-flex flex-column gap-1">
                    <label className="text-muted small">IPv4 Address</label>
                    <input
                      type="text"
                      className="form-control form-control-sm text-monospace"
                      value={netConfig.ip}
                      onChange={(e) => setNetConfig({ ...netConfig, ip: e.target.value })}
                      disabled={!isEditingConfig}
                    />
                  </div>
                  <div className="d-flex flex-column gap-1">
                    <label className="text-muted small">Subnet Mask</label>
                    <input
                      type="text"
                      className="form-control form-control-sm text-monospace"
                      value={netConfig.subnet}
                      onChange={(e) => setNetConfig({ ...netConfig, subnet: e.target.value })}
                      disabled={!isEditingConfig}
                    />
                  </div>
                  <div className="d-flex flex-column gap-1">
                    <label className="text-muted small">Default Gateway</label>
                    <input
                      type="text"
                      className="form-control form-control-sm text-monospace"
                      value={netConfig.gateway}
                      onChange={(e) => setNetConfig({ ...netConfig, gateway: e.target.value })}
                      disabled={!isEditingConfig}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Extra Info / Diagnostic Status */}
            <div className="col-12 col-md-12 col-lg-4">
              <div className="p-3 border rounded bg-body-tertiary h-100">
                <h6 className="fw-bold text-uppercase text-secondary mb-3 small" style={{ letterSpacing: '0.5px' }}>
                  <i className="bi-shield-check text-warning me-2" />
                  Security & DNS
                </h6>

                <div className="d-grid gap-2" style={{ fontSize: '0.82rem' }}>
                  <div className="d-flex flex-column gap-1">
                    <label className="text-muted small">DNS Server 1</label>
                    <input
                      type="text"
                      className="form-control form-control-sm text-monospace"
                      value={netConfig.dns1}
                      onChange={(e) => setNetConfig({ ...netConfig, dns1: e.target.value })}
                      disabled={!isEditingConfig}
                    />
                  </div>
                  <div className="d-flex flex-column gap-1">
                    <label className="text-muted small">DNS Server 2</label>
                    <input
                      type="text"
                      className="form-control form-control-sm text-monospace"
                      value={netConfig.dns2}
                      onChange={(e) => setNetConfig({ ...netConfig, dns2: e.target.value })}
                      disabled={!isEditingConfig}
                    />
                  </div>
                  <div className="d-flex justify-content-between align-items-center mt-2 border-top pt-2">
                    <span className="text-muted">SSL Certificate</span>
                    <span className="badge bg-success-subtle text-success border border-success border-opacity-25 px-2">Valid (Managed by Backend)</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted">MQTT Connection</span>
                    <span className="badge bg-success-subtle text-success border border-success border-opacity-25 px-2">Online</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Save Success Toast */}
      {showSaveToast && (
        <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1050 }}>
          <div className="toast show align-items-center text-bg-success border-0 shadow" role="alert" aria-live="assertive" aria-atomic="true">
            <div className="d-flex">
              <div className="toast-body d-flex align-items-center gap-2">
                <i className="bi bi-check-circle-fill text-white fs-5" />
                <span>Network configuration saved successfully!</span>
              </div>
              <button type="button" className="btn-close btn-close-white me-2 m-auto" onClick={() => setShowSaveToast(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Refresh Success Toast */}
      {showRefreshToast && (
        <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1050 }}>
          <div className="toast show align-items-center text-bg-success border-0 shadow" role="alert" aria-live="assertive" aria-atomic="true">
            <div className="d-flex">
              <div className="toast-body d-flex align-items-center gap-2">
                <i className="bi bi-check-circle-fill text-white fs-5" />
                <span>Network telemetry refreshed successfully!</span>
              </div>
              <button type="button" className="btn-close btn-close-white me-2 m-auto" onClick={() => setShowRefreshToast(false)} />
            </div>
          </div>
        </div>
      )}

      {/* CAMERAS LIST VIEW */}
      {activeTab === 'cameras' && (
        <div className="panel">
          <div className="panel-header mb-3 d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2">
            <div>
              <h5 className="fw-bold mb-1"><i className="bi bi-camera-video me-2 text-primary" />Camera Devices</h5>
              <p className="text-muted mb-0">Expand any camera stream to view diagnostics metrics and metadata.</p>
            </div>
          </div>

          {/* Search and Filters for Cameras */}
          <div className="d-flex flex-wrap gap-2 mb-3 align-items-center bg-body-secondary p-2.5 rounded border">
            <div className="flex-grow-1" style={{ minWidth: '240px' }}>
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-body border-secondary text-muted"><i className="bi bi-search" /></span>
                <input
                  type="text"
                  className="form-control bg-body border-secondary text-body"
                  placeholder="Search cameras by name, ID, or site..."
                  value={camSearch}
                  onChange={(e) => { setCamSearch(e.target.value); setCamPage(1); }}
                />
              </div>
            </div>
            <div className="btn-group btn-group-sm">
              <button className={`btn btn-outline-secondary ${camFilter === 'all' ? 'active bg-secondary text-white' : ''}`} onClick={() => { setCamFilter('all'); setCamPage(1); }}>All</button>
              <button className={`btn btn-outline-secondary ${camFilter === 'online' ? 'active bg-success text-white border-success' : ''}`} onClick={() => { setCamFilter('online'); setCamPage(1); }}>Online</button>
              <button className={`btn btn-outline-secondary ${camFilter === 'offline' ? 'active bg-danger text-white border-danger' : ''}`} onClick={() => { setCamFilter('offline'); setCamPage(1); }}>Offline</button>
            </div>
          </div>

          <div className="scrollable-box">
            <div className="d-grid gap-2">
              {filteredCameras.length > 0 ? (
                [...filteredCameras]
                  .sort((a, b) => (b.important ? 1 : 0) - (a.important ? 1 : 0))
                  .slice((camPage - 1) * camPageSize, camPage * camPageSize)
                  .map((cam) => {
                    const isExpanded = expandedCamId === cam.id;
                    return (
                      <div key={cam.id} className="health-list-item p-3">
                        <div
                          className="d-flex align-items-center justify-content-between cursor-pointer"
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleToggleCam(cam.id)}
                        >
                          <div className="d-flex align-items-center gap-3">
                            <span className="fs-5 text-primary"><i className="bi bi-camera-video" /></span>
                            <div>
                              <h6 className="fw-bold mb-0">
                                {cam.name}
                                {cam.important && (
                                  <span className="badge bg-warning-subtle text-warning border border-warning border-opacity-20 ms-2" style={{ fontSize: '0.65rem', padding: '0.15rem 0.35rem' }}>
                                    <i className="bi bi-star-fill" />
                                  </span>
                                )}
                              </h6>
                              <small className="text-muted">{cam.site}</small>
                            </div>
                          </div>

                          <div className="d-flex align-items-center gap-4">
                            <div className="d-none d-sm-block text-center">
                              {/* <small className="text-muted d-block small" style={{ fontSize: '0.75rem' }}>Health</small> */}
                              {/* <strong className={cam.health > 80 ? 'text-success' : 'text-warning'}>{cam.health}%</strong> */}
                            </div>

                            <div className="d-flex align-items-center gap-2">
                              <span className={`glow-dot-status ${cam.status === 'Working' ? 'green' : 'red'}`} />
                              <span className="small text-muted">{cam.status}</span>
                            </div>

                            <span className="text-muted">
                              <i className={`bi ${isExpanded ? 'bi-chevron-up' : 'bi-chevron-down'}`} />
                            </span>
                          </div>
                        </div>

                        {/* Collapsible Content */}
                        {isExpanded && (
                          <div className="details-box">
                            <div className="row g-3">
                              <div className="col-12 col-md-6">
                                <div className="mb-1"><span className="text-muted">Camera ID:</span> <strong className="text-body-emphasis">{cam.id}</strong></div>
                                <div className="mb-1"><span className="text-muted">RTSP URL:</span> <code className="text-body-emphasis">{cam.rtspUrl}</code></div>
                              </div>
                              <div className="col-12 col-md-6">
                                {/* <div className="mb-1"><span className="text-muted">Edge Device:</span> <strong className="text-body-emphasis">{cam.edge}</strong></div> */}
                                {/* <div className="mb-1">
                                  <span className="text-muted">AI Detection Status:</span>{' '}
                                  <span className={`fw-bold ${cam.ai === 'Running' ? 'text-success' : 'text-danger'}`}>{cam.ai}</span>
                                </div> */}
                                <div className="mb-1"><span className="text-muted">Last Active Time:</span> <span className="text-body-emphasis">{cam.last}</span></div>
                                <div className="mb-1"><span className="text-muted">Bitrate Output:</span> <span className="text-body-emphasis">{cam.status === 'Working' ? '3.2 Mbps' : '0 Kbps'}</span></div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
              ) : (
                <div className="text-center py-4 text-muted small">No camera devices match your query.</div>
              )}
            </div>
          </div>
          {renderPagination(filteredCameras.length, camPage, camPageSize, setCamPage, setCamPageSize)}
        </div>
      )}

      {/* EDGE DEVICES LIST VIEW */}
      {activeTab === 'edge' && (
        <div className="panel">
          <div className="panel-header mb-3">
            <div>
              <h5 className="fw-bold mb-1"><i className="bi bi-cpu me-2 text-primary" />Edge Node Processing Units</h5>
              <p className="text-muted mb-0">Expand any Edge gateway processing device to inspect resource status.</p>
            </div>
          </div>

          {/* Search and Filters for Edge Devices */}
          <div className="d-flex flex-wrap gap-2 mb-3 align-items-center bg-body-secondary p-2.5 rounded border">
            <div className="flex-grow-1" style={{ minWidth: '240px' }}>
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-body border-secondary text-muted"><i className="bi bi-search" /></span>
                <input
                  type="text"
                  className="form-control bg-body border-secondary text-body"
                  placeholder="Search edge nodes by name, ID, or location..."
                  value={edgeSearch}
                  onChange={(e) => { setEdgeSearch(e.target.value); setEdgePage(1); }}
                />
              </div>
            </div>
            <div className="btn-group btn-group-sm">
              <button className={`btn btn-outline-secondary ${edgeFilter === 'all' ? 'active bg-secondary text-white' : ''}`} onClick={() => { setEdgeFilter('all'); setEdgePage(1); }}>All</button>
              <button className={`btn btn-outline-secondary ${edgeFilter === 'online' ? 'active bg-success text-white border-success' : ''}`} onClick={() => { setEdgeFilter('online'); setEdgePage(1); }}>Online</button>
              <button className={`btn btn-outline-secondary ${edgeFilter === 'offline' ? 'active bg-danger text-white border-danger' : ''}`} onClick={() => { setEdgeFilter('offline'); setEdgePage(1); }}>Offline</button>
            </div>
          </div>

          <div className="scrollable-box">
            <div className="d-grid gap-2">
              {filteredEdges.length > 0 ? (
                filteredEdges
                  .slice((edgePage - 1) * edgePageSize, edgePage * edgePageSize)
                  .map((edge) => {
                    const isExpanded = expandedEdgeId === edge.id;
                    return (
                      <div key={edge.id} className="health-list-item p-3">
                        <div
                          className="d-flex align-items-center justify-content-between cursor-pointer"
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleToggleEdge(edge.id)}
                        >
                          <div className="d-flex align-items-center gap-3">
                            <span className="fs-5 text-primary"><i className="bi bi-hdd-network" /></span>
                            <div>
                              <h6 className="fw-bold mb-0">{edge.name}</h6>
                              <small className="text-muted">{edge.site}</small>
                            </div>
                          </div>

                          <div className="d-flex align-items-center gap-4">
                            {edge.status === 'Working' ? (
                              <div className="d-none d-sm-block text-center" style={{ minWidth: '100px' }}>
                                <small className="text-muted d-block small" style={{ fontSize: '0.75rem' }}>CPU / RAM</small>
                                <small className="fw-bold text-body-emphasis">{edge.cpu}% / {edge.ram}%</small>
                              </div>
                            ) : (
                              <div className="d-none d-sm-block text-center text-muted small" style={{ minWidth: '100px' }}>-</div>
                            )}

                            <div className="d-flex align-items-center gap-2">
                              <span className={`glow-dot-status ${edge.status === 'Working' ? 'green' : 'red'}`} />
                              <span className="small text-muted">{edge.status === 'Working' ? 'Working' : 'Offline'}</span>
                            </div>

                            <span className="text-muted">
                              <i className={`bi ${isExpanded ? 'bi-chevron-up' : 'bi-chevron-down'}`} />
                            </span>
                          </div>
                        </div>

                        {/* Collapsible Details */}
                        {isExpanded && (
                          <div className="details-box">
                            <div className="row g-3">
                              <div className="col-12 col-md-6">
                                <div className="mb-1"><span className="text-muted">Device ID:</span> <strong className="text-body-emphasis">{edge.id}</strong></div>
                                <div className="mb-1"><span className="text-muted">IP Address:</span> <code className="text-body-emphasis">{edge.ip}</code></div>
                                <div className="mb-1"><span className="text-muted">Gateway Location:</span> <span className="text-body-emphasis">{edge.location}</span></div>
                                <div><span className="text-muted">Last Heartbeat Ping:</span> <span className="text-body-emphasis">{edge.last}</span></div>
                              </div>
                              <div className="col-12 col-md-6">
                                {edge.status === 'Working' ? (
                                  <>
                                    <div className="mb-1"><span className="text-muted">Temperature:</span> <strong className="text-body-emphasis">{edge.temp}°C</strong></div>
                                    <div className="mb-1"><span className="text-muted">Storage Occupied:</span> <strong className="text-body-emphasis">{edge.storage}%</strong></div>
                                    <div><span className="text-muted">Network Throughput:</span> <strong className="text-body-emphasis">{edge.network} Mbps</strong></div>
                                  </>
                                ) : (
                                  <div className="text-danger small"><i className="bi bi-x-circle me-1" />Edge hardware is offline. No metrics available.</div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
              ) : (
                <div className="text-center py-4 text-muted small">No edge nodes match your query.</div>
              )}
            </div>
          </div>
          {renderPagination(filteredEdges.length, edgePage, edgePageSize, setEdgePage, setEdgePageSize)}
        </div>
      )}

      {/* SERVER METRICS VIEW */}
      {activeTab === 'server' && (
        <div className="row g-3 justify-content-center">
          <div className="col-12 col-md-10 col-lg-8">
            <div className="panel">
              <div className="panel-header mb-3 border-bottom border-secondary border-opacity-10 pb-2">
                <div>
                  <h5 className="fw-bold mb-1"><i className="bi bi-server me-2 text-primary" />Server Diagnostics</h5>
                  <p className="text-muted mb-0">Live status details and diagnostic attributes of backend servers.</p>
                </div>
              </div>

              <div className="scrollable-box">
                <div className="table-responsive">
                  <table className="table table-borderless align-middle mb-0">
                    <tbody>
                      {[
                        // { key: 'CPU Usage', val: '39%', icon: 'bi-cpu' },
                        // { key: 'RAM Usage', val: '48%', icon: 'bi-memory' },
                        { key: 'Storage Used', val: '31%', icon: 'bi-hdd-fill' },
                        { key: 'Storage Free', val: '69%', icon: 'bi-hdd' },
                        { key: 'Disk Usage', val: '52%', icon: 'bi-speedometer' },
                        // { key: 'Uptime', val: '36d 14h', icon: 'bi-clock-history' },
                        { key: 'Operating System', val: 'Ubuntu 24.04 LTS', icon: 'bi-shield' },
                        { key: 'Python Compiler', val: '3.11.9', icon: 'bi-code-slash' },
                        { key: 'PostgreSQL Database', val: 'Healthy', icon: 'bi-database-fill' },
                        { key: 'FastAPI Router', val: 'Running', icon: 'bi-router' },
                        { key: 'MQTT Broker', val: 'Running', icon: 'bi-router' },
                      ].map((row, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--bs-border-color-translucent)' }}>
                          <td className="py-2.5 text-muted">
                            <i className={`bi ${row.icon} me-2 text-primary`} />
                            {row.key}
                          </td>
                          <td className="py-2.5 text-end fw-semibold text-body-emphasis">{row.val}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};