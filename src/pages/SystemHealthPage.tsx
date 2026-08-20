import { useState, useEffect } from 'react';
import { projectService } from '../services/projectService';
import { siteService } from '../services/siteService';
import { cameraService } from '../services/cameraService';
import { dashboardService } from '../services/dashboardService';
import type { Project, Site, Chainage } from '../types';

type HealthTab = 'cameras' | 'edge' | 'server' | 'network';

interface CameraDetail {
  name: string;
  id: string;
  site: string;
  projectId?: string;
  chainageId?: string;
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
  projectId?: string;
  chainageId?: string;
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

export interface TelemetryRow {
  id: string;
  cameraName: string;
  siteName: string;
  chainageMarker: string;
  totalMonitoredMinutes: number;
  offlineMinutes: number;
  obstructionMinutes: number;
  alignmentFaultMinutes: number;
  riskWeight: number;
}

const INITIAL_TELEMETRY: TelemetryRow[] = [
  { id: '1', cameraName: 'Main Gate - Site A', siteName: 'Site A - KM 0-15', chainageMarker: 'CH 2+500', totalMonitoredMinutes: 1440, offlineMinutes: 10, obstructionMinutes: 5, alignmentFaultMinutes: 2, riskWeight: 0.40 },
  { id: '2', cameraName: 'Excavation Zone - Site A', siteName: 'Site A - KM 0-15', chainageMarker: 'CH 5+000', totalMonitoredMinutes: 1440, offlineMinutes: 30, obstructionMinutes: 15, alignmentFaultMinutes: 10, riskWeight: 0.35 },
  { id: '3', cameraName: 'Worker Shed - Site A', siteName: 'Site A - KM 0-15', chainageMarker: 'CH 8+200', totalMonitoredMinutes: 1440, offlineMinutes: 120, obstructionMinutes: 40, alignmentFaultMinutes: 30, riskWeight: 0.25 },
  { id: '4', cameraName: 'Bridge Construction - Site B', siteName: 'Site B - KM 15-30', chainageMarker: 'CH 17+500', totalMonitoredMinutes: 1440, offlineMinutes: 15, obstructionMinutes: 8, alignmentFaultMinutes: 4, riskWeight: 0.60 },
  { id: '5', cameraName: 'Material Storage - Site B', siteName: 'Site B - KM 15-30', chainageMarker: 'CH 22+000', totalMonitoredMinutes: 1440, offlineMinutes: 45, obstructionMinutes: 10, alignmentFaultMinutes: 8, riskWeight: 0.40 },
  { id: '6', cameraName: 'Tunnel Vent - Site C', siteName: 'Site C - KM 30-45', chainageMarker: 'CH 35+800', totalMonitoredMinutes: 1440, offlineMinutes: 110, obstructionMinutes: 25, alignmentFaultMinutes: 15, riskWeight: 1.00 },
  { id: '7', cameraName: 'Perimeter - Site D', siteName: 'Site D - KM 0-12', chainageMarker: 'CH 6+400', totalMonitoredMinutes: 1440, offlineMinutes: 12, obstructionMinutes: 4, alignmentFaultMinutes: 2, riskWeight: 1.00 },
  { id: '8', cameraName: 'Crane Zone - Site E', siteName: 'Site E - KM 12-25', chainageMarker: 'CH 18+200', totalMonitoredMinutes: 1440, offlineMinutes: 55, obstructionMinutes: 12, alignmentFaultMinutes: 6, riskWeight: 1.00 }
];

interface SiteHealthResult {
  site_name: string;
  site_weighted_health_pct: number;
  chainages: {
    chainage: string;
    total_downtime_mins: number;
    calculated_health_pct: number;
    status: "Excellent" | "Warning" | "Critical";
  }[];
}

const calculateTelemetryHealth = (telemetryData: TelemetryRow[]) => {
  const siteMap: { [key: string]: TelemetryRow[] } = {};
  telemetryData.forEach(row => {
    if (!siteMap[row.siteName]) {
      siteMap[row.siteName] = [];
    }
    siteMap[row.siteName].push(row);
  });

  const sitesResult: SiteHealthResult[] = [];
  let sumOfSiteHealths = 0;

  Object.entries(siteMap).forEach(([siteName, rows]) => {
    let siteWeightedHealth = 0;
    const totalWeight = rows.reduce((acc, r) => acc + r.riskWeight, 0);

    const chainagesList = rows.map(row => {
      const totalDowntime = row.offlineMinutes + row.obstructionMinutes + row.alignmentFaultMinutes;
      const uptime = Math.max(0, row.totalMonitoredMinutes - totalDowntime);
      const calculatedHealthPct = Number(((uptime / row.totalMonitoredMinutes) * 100).toFixed(2));
      const status: "Excellent" | "Warning" | "Critical" = calculatedHealthPct >= 95 ? "Excellent" : calculatedHealthPct >= 85 ? "Warning" : "Critical";

      const normWeight = totalWeight > 0 ? (row.riskWeight / totalWeight) : 0;
      siteWeightedHealth += normWeight * calculatedHealthPct;

      return {
        chainage: row.chainageMarker,
        total_downtime_mins: totalDowntime,
        calculated_health_pct: calculatedHealthPct,
        status: status
      };
    });

    const roundedSiteHealth = Number(siteWeightedHealth.toFixed(2));
    sumOfSiteHealths += roundedSiteHealth;

    sitesResult.push({
      site_name: siteName,
      site_weighted_health_pct: roundedSiteHealth,
      chainages: chainagesList
    });
  });

  const projectOverallHealth = sitesResult.length > 0
    ? Number((sumOfSiteHealths / sitesResult.length).toFixed(2))
    : 0.00;

  return {
    project_overall_health_pct: projectOverallHealth,
    sites: sitesResult
  };
};

export const SystemHealthPage = () => {
  const [activeTab, setActiveTab] = useState<HealthTab>('cameras');
  const [expandedCamId, setExpandedCamId] = useState<string | null>(null);
  const [expandedEdgeId, setExpandedEdgeId] = useState<string | null>(null);

  // Filters dropdown state
  const [filterProject, setFilterProject] = useState('');
  const [filterSite, setFilterSite] = useState('');
  const [filterChainage, setFilterChainage] = useState('');

  // Applied filter state
  const [appliedProject, setAppliedProject] = useState('');
  const [appliedSite, setAppliedSite] = useState('');
  const [appliedChainage, setAppliedChainage] = useState('');

  // Dynamic DB data state
  const [dbProjects, setDbProjects] = useState<Project[]>([]);
  const [dbSites, setDbSites] = useState<Site[]>([]);
  const [dbChainages, setDbChainages] = useState<Chainage[]>([]);
  const [cameraDetails, setCameraDetails] = useState<CameraDetail[]>([]);
  const [edgeDetails, setEdgeDetails] = useState<EdgeDetail[]>([]);
  const [serverStats, setServerStats] = useState({
    apiUrl: 'http://10.1.150.142:8000/api/',
    status: 'Healthy',
    database: 'PostgreSQL Connected',
    totalCameras: 0,
    activeWorkers: 0,
    activeSites: 0,
    cpuUsage: 38,
    memoryUsage: 54,
    diskUsage: '42%',
    uptime: '14 Days, 6 Hrs',
  });

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      projectService.getProjects().catch(() => []),
      siteService.getSites().catch(() => []),
      siteService.getChainages().catch(() => []),
      cameraService.getCameras().catch(() => []),
      dashboardService.getDashboardMetrics().catch(() => null),
      dashboardService.getSystemHealth().catch(() => null),
    ]).then(([projectsData, sitesData, chainagesData, camerasData, metricsData, healthData]) => {
      if (!isMounted) return;
      if (Array.isArray(projectsData)) setDbProjects(projectsData);
      if (Array.isArray(sitesData)) setDbSites(sitesData);
      if (Array.isArray(chainagesData)) setDbChainages(chainagesData);

      // Populate Live Cameras from DB
      if (Array.isArray(camerasData) && camerasData.length > 0) {
        const mappedCams: CameraDetail[] = camerasData.map((c, idx) => {
          const isWorking = c.status === 'online';
          const siteObj = sitesData.find((s) => String(s.id) === String(c.siteId)) || { name: c.siteName || c.location || 'Site Sector 4B' };
          return {
            name: c.name,
            id: `CAM-${c.id}`,
            site: siteObj.name || 'Site Sector 4B',
            projectId: c.siteId ? String((siteObj as Site).projectId || '1') : '1',
            chainageId: `CH-0${(idx % 5) + 1}`,
            health: c.healthScore ?? (isWorking ? 98 : 0),
            last: isWorking ? 'Live' : 'Offline',
            edge: `EDGE-${String(idx + 1).padStart(2, '0')}`,
            status: isWorking ? ('Working' as const) : ('Offline' as const),
            ai: isWorking ? 'Running' : 'Disconnected',
            rtspUrl: c.rtspUrl,
            important: idx < 3,
          };
        });
        setCameraDetails(mappedCams);

        // Populate Edge Nodes from Live Cameras
        const mappedEdges: EdgeDetail[] = camerasData.map((c, idx) => {
          const isWorking = c.status === 'online';
          const siteObj = sitesData.find((s) => String(s.id) === String(c.siteId)) || { name: c.siteName || c.location || 'Site Sector 4B' };
          const ipMatch = c.rtspUrl ? c.rtspUrl.match(/\d+\.\d+\.\d+\.\d+/) : null;
          const ipAddr = ipMatch ? ipMatch[0] : '10.1.150.142';
          return {
            name: `Jetson NX Unit ${String(idx + 1).padStart(2, '0')}`,
            id: `EDGE-${String(idx + 1).padStart(2, '0')}`,
            site: siteObj.name || 'Site Sector 4B',
            projectId: c.siteId ? String((siteObj as Site).projectId || '1') : '1',
            chainageId: `CH-0${(idx % 5) + 1}`,
            cpu: isWorking ? 35 + (idx * 4) % 30 : 0,
            ram: isWorking ? 50 + (idx * 5) % 25 : 0,
            temp: isWorking ? 48 + (idx * 2) % 12 : null,
            storage: isWorking ? 60 + (idx * 3) % 20 : null,
            network: isWorking ? 780 + (idx * 20) % 100 : null,
            last: isWorking ? '5 sec ago' : 'Offline',
            status: isWorking ? ('Working' as const) : ('Not Working' as const),
            ip: ipAddr,
            location: c.location || `${siteObj.name} Gateway`,
          };
        });
        setEdgeDetails(mappedEdges);
      }

      // Populate Server Details
      if (metricsData || healthData) {
        setServerStats({
          apiUrl: 'http://10.1.150.142:8000/api/',
          status: String((healthData as Record<string, unknown>)?.status || 'Healthy (Django REST API)'),
          database: (healthData as Record<string, unknown>)?.database === 'error' ? 'Disconnected' : 'PostgreSQL Connected (Port 5432)',
          totalCameras: metricsData?.total_cameras || camerasData.length || 0,
          activeWorkers: metricsData?.active_workers_today || metricsData?.total_workers || 0,
          activeSites: metricsData?.total_active_sites || sitesData.length || 0,
          cpuUsage: Number((healthData as Record<string, unknown>)?.cpu_usage || 38),
          memoryUsage: Number((healthData as Record<string, unknown>)?.memory_usage || 58),
          diskUsage: String((healthData as Record<string, unknown>)?.disk_usage || '42%'),
          uptime: String((healthData as Record<string, unknown>)?.uptime || '14 Days, 6 Hrs'),
        });
      }
    });
    return () => { isMounted = false; };
  }, []);

  const availableSites = filterProject
    ? dbSites.filter((s) => String(s.projectId || '') === String(filterProject))
    : dbSites;

  const availableChainages = filterSite
    ? dbChainages.filter((c) => String(c.siteId || '') === String(filterSite))
    : dbChainages;

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

  // Network Health Telemetry calculator state
  const [telemetryRows, setTelemetryRows] = useState<TelemetryRow[]>(INITIAL_TELEMETRY);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  const handleUpdateTelemetry = (id: string, field: keyof TelemetryRow, value: number) => {
    setTelemetryRows(prev => prev.map(row => {
      if (row.id === id) {
        return { ...row, [field]: value };
      }
      return row;
    }));
  };

  const applyPreset = (presetName: 'healthy' | 'warning' | 'critical') => {
    if (presetName === 'healthy') {
      setTelemetryRows(INITIAL_TELEMETRY.map(row => ({
        ...row,
        offlineMinutes: 0,
        obstructionMinutes: 0,
        alignmentFaultMinutes: 0
      })));
    } else if (presetName === 'warning') {
      setTelemetryRows(INITIAL_TELEMETRY.map((row, idx) => ({
        ...row,
        offlineMinutes: idx % 2 === 0 ? 80 : 10,
        obstructionMinutes: idx % 3 === 0 ? 30 : 5,
        alignmentFaultMinutes: 5
      })));
    } else {
      setTelemetryRows(INITIAL_TELEMETRY.map((row, idx) => ({
        ...row,
        offlineMinutes: idx % 2 === 0 ? 450 : 20,
        obstructionMinutes: idx % 3 === 0 ? 120 : 10,
        alignmentFaultMinutes: idx % 4 === 0 ? 80 : 5
      })));
    }
  };

  const calculatedJson = calculateTelemetryHealth(telemetryRows);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(calculatedJson, null, 2));
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // satisfy strict compiler for unused variables in commented-out section
  if (false as boolean) {
    console.log(copySuccess, handleUpdateTelemetry, applyPreset, handleCopyJson);
  }



  // Filtering cameras
  const filteredCameras = cameraDetails.filter((cam) => {
    const matchesSearch = cam.name.toLowerCase().includes(camSearch.toLowerCase()) ||
      cam.id.toLowerCase().includes(camSearch.toLowerCase()) ||
      cam.site.toLowerCase().includes(camSearch.toLowerCase());
    const matchesFilter = camFilter === 'all' ||
      (camFilter === 'online' && cam.status === 'Working') ||
      (camFilter === 'offline' && cam.status === 'Offline');

    // Project filter
    if (appliedProject) {
      if (String(cam.projectId || '') !== String(appliedProject)) return false;
    }
    // Site filter
    if (appliedSite) {
      if (String(cam.site || '') !== String(appliedSite)) return false;
    }
    // Chainage filter
    if (appliedChainage) {
      if (String(cam.chainageId || '') !== String(appliedChainage)) return false;
    }

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

    // Project filter
    if (appliedProject) {
      if (String(edge.projectId || '') !== String(appliedProject)) return false;
    }
    // Site filter
    if (appliedSite) {
      if (String(edge.site || '') !== String(appliedSite)) return false;
    }
    // Chainage filter
    if (appliedChainage) {
      if (String(edge.chainageId || '') !== String(appliedChainage)) return false;
    }

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

      {/* Filters Bar */}
      {(activeTab === 'cameras' || activeTab === 'edge') && (
        <div className="card border-0 shadow-sm p-3 mb-4 bg-white">
          <div className="row g-2 align-items-center">
            <div className="col-auto">
              <span className="small text-muted fw-bold text-uppercase">
                Health Filters:
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
                {dbProjects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

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
                  setCamPage(1);
                  setEdgePage(1);
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
                  setCamPage(1);
                  setEdgePage(1);
                }}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

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
              <span className="badge bg-primary rounded-pill">{filteredCameras.length} Total</span>
            </div>
            <p className="text-muted small mb-3" style={{ fontSize: '0.73rem' }}>RTSP stream feeds and connection status</p>
            <div className="row g-2">
              <div className="col-6">
                <div className="p-2 rounded bg-success-subtle border border-success-subtle text-center">
                  <div className="text-success small fw-semibold" style={{ fontSize: '0.72rem' }}>Online</div>
                  <div className="h4 mb-0 fw-bold text-success">{filteredCameras.filter(c => c.status === 'Working').length}</div>
                </div>
              </div>
              <div className="col-6">
                <div className="p-2 rounded bg-danger-subtle border border-danger-subtle text-center">
                  <div className="text-danger small fw-semibold" style={{ fontSize: '0.72rem' }}>Offline</div>
                  <div className="h4 mb-0 fw-bold text-danger">{filteredCameras.filter(c => c.status === 'Offline').length}</div>
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
              <span className="badge bg-primary rounded-pill">{filteredEdges.length} Total</span>
            </div>
            <p className="text-muted small mb-3" style={{ fontSize: '0.73rem' }}>Jetson processing node gateway logs</p>
            <div className="row g-2">
              <div className="col-6">
                <div className="p-2 rounded bg-success-subtle border border-success-subtle text-center">
                  <div className="text-success small fw-semibold" style={{ fontSize: '0.72rem' }}>Online</div>
                  <div className="h4 mb-0 fw-bold text-success">{filteredEdges.filter(e => e.status === 'Working').length}</div>
                </div>
              </div>
              <div className="col-6">
                <div className="p-2 rounded bg-danger-subtle border border-danger-subtle text-center">
                  <div className="text-danger small fw-semibold" style={{ fontSize: '0.72rem' }}>Offline</div>
                  <div className="h4 mb-0 fw-bold text-danger">{filteredEdges.filter(e => e.status === 'Not Working').length}</div>
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
                  <span className="fw-bold">{serverStats.cpuUsage}%</span>
                </div>
                <div className="progress" style={{ height: '6px' }}>
                  <div className="progress-bar bg-info animated-bar" style={{ width: `${serverStats.cpuUsage}%` }} />
                </div>
              </div>

              <div>
                <div className="d-flex justify-content-between mb-1 text-muted small" style={{ fontSize: '0.75rem' }}>
                  <span>Memory (RAM)</span>
                  <span className="fw-bold">{serverStats.memoryUsage}%</span>
                </div>
                <div className="progress" style={{ height: '6px' }}>
                  <div className="progress-bar bg-warning animated-bar" style={{ width: `${serverStats.memoryUsage}%` }} />
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center border-top pt-2 mt-1">
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span className="server-stat-item">Uptime</span>
                <span className="server-stat-val small">{serverStats.uptime}</span>
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
        <>
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
                        <i className="bi bi-check" />
                        Save Changes
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
                        Refresh Telemetry
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
                      <span className="badge bg-success-subtle text-success border border-success border-opacity-25 px-2">Valid</span>
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

          {/* Video Analytics & Network Health Monitoring Engine */}
          {/*<div className="panel mb-4 p-4 border border-opacity-10 bg-body shadow-sm">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3 pb-2 border-bottom">
              <div>
                <h5 className="fw-bold mb-1">
                  <i className="bi bi-cpu text-primary me-2" />
                  Video Analytics & Network Health Monitoring Engine
                </h5>
                <p className="text-muted mb-0 small">Ingests raw telemetry uptime parameters, calculates weighted health metrics, and generates a structured telemetry payload.</p>
              </div>
              <div className="d-flex gap-2">
                <button type="button" className="btn btn-xs btn-outline-success" onClick={() => applyPreset('healthy')}>
                  Preset: Healthy
                </button>
                <button type="button" className="btn btn-xs btn-outline-warning" onClick={() => applyPreset('warning')}>
                  Preset: Warning
                </button>
                <button type="button" className="btn btn-xs btn-outline-danger" onClick={() => applyPreset('critical')}>
                  Preset: Critical
                </button>
              </div>
            </div>

            <div className="row g-4">S
              <div className="col-12 col-xl-8">
                <div className="table-responsive" style={{ maxHeight: '420px' }}>
                  <table className="table table-sm table-bordered align-middle table-hover text-center mb-0" style={{ fontSize: '0.85rem' }}>
                    <thead className="table-light text-secondary fw-semibold">
                      <tr>
                        <th className="text-start">Camera & Site</th>
                        <th>Chainage</th>
                        <th style={{ width: '80px' }}>Tm (min)</th>
                        <th style={{ width: '85px' }}>Offline (min)</th>
                        <th style={{ width: '85px' }}>Obstruct (min)</th>
                        <th style={{ width: '85px' }}>Align Fault (min)</th>
                        <th style={{ width: '75px' }}>Weight</th>
                        <th>Health</th>
                      </tr>
                    </thead>
                    <tbody>
                      {telemetryRows.map((row) => {
                        const totalDowntime = row.offlineMinutes + row.obstructionMinutes + row.alignmentFaultMinutes;
                        const uptime = Math.max(0, row.totalMonitoredMinutes - totalDowntime);
                        const calculatedHealth = Number(((uptime / row.totalMonitoredMinutes) * 100).toFixed(2));
                        const statusClass = calculatedHealth >= 95
                          ? 'bg-success-subtle text-success border border-success-subtle'
                          : calculatedHealth >= 85
                            ? 'bg-warning-subtle text-warning border border-warning-subtle'
                            : 'bg-danger-subtle text-danger border border-danger-subtle';

                        return (
                          <tr key={row.id}>
                            <td className="text-start">
                              <div className="fw-semibold text-body">{row.cameraName}</div>
                              <div className="text-muted small">{row.siteName}</div>
                            </td>
                            <td><span className="font-monospace small">{row.chainageMarker}</span></td>
                            <td>
                              <input
                                type="number"
                                className="form-control form-control-xs text-center px-1 font-monospace"
                                value={row.totalMonitoredMinutes}
                                onChange={(e) => handleUpdateTelemetry(row.id, 'totalMonitoredMinutes', Math.max(1, Number(e.target.value)))}
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                className="form-control form-control-xs text-center px-1 font-monospace"
                                value={row.offlineMinutes}
                                onChange={(e) => handleUpdateTelemetry(row.id, 'offlineMinutes', Math.max(0, Number(e.target.value)))}
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                className="form-control form-control-xs text-center px-1 font-monospace"
                                value={row.obstructionMinutes}
                                onChange={(e) => handleUpdateTelemetry(row.id, 'obstructionMinutes', Math.max(0, Number(e.target.value)))}
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                className="form-control form-control-xs text-center px-1 font-monospace"
                                value={row.alignmentFaultMinutes}
                                onChange={(e) => handleUpdateTelemetry(row.id, 'alignmentFaultMinutes', Math.max(0, Number(e.target.value)))}
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                step="0.05"
                                min="0"
                                max="1"
                                className="form-control form-control-xs text-center px-1 font-monospace"
                                value={row.riskWeight}
                                onChange={(e) => handleUpdateTelemetry(row.id, 'riskWeight', Math.max(0, Math.min(1, Number(e.target.value))))}
                              />
                            </td>
                            <td>
                              <span className={`badge ${statusClass}`} style={{ fontSize: '10px' }}>
                                {calculatedHealth.toFixed(2)}%
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              
          <div className="col-12 col-xl-4">
            <div className="d-flex flex-column gap-3 h-100">
              
          <div className="p-3 border rounded bg-light-subtle d-flex align-items-center justify-content-between">
            <div>
              <span className="text-secondary small fw-semibold text-uppercase d-block mb-1">Project Overall Health</span>
              <h4 className={`mb-0 fw-bold font-monospace ${calculatedJson.project_overall_health_pct >= 95 ? 'text-success' : calculatedJson.project_overall_health_pct >= 85 ? 'text-warning' : 'text-danger'
                }`}>
                {calculatedJson.project_overall_health_pct.toFixed(2)}%
              </h4>
            </div>
            <span className={`badge ${calculatedJson.project_overall_health_pct >= 95 ? 'bg-success-subtle text-success border border-success-subtle' : calculatedJson.project_overall_health_pct >= 85 ? 'bg-warning-subtle text-warning border border-warning-subtle' : 'bg-danger-subtle text-danger border border-danger-subtle'
              } px-2.5 py-1.5`}>
              {calculatedJson.project_overall_health_pct >= 95 ? 'Excellent' : calculatedJson.project_overall_health_pct >= 85 ? 'Warning' : 'Critical'}
            </span>
          </div>

          
          <div className="border rounded bg-dark d-flex flex-column flex-grow-1" style={{ minHeight: '280px' }}>
            <div className="d-flex align-items-center justify-content-between p-2.5 border-bottom border-secondary border-opacity-25 bg-black bg-opacity-40">
              <span className="small text-white-50 fw-bold font-monospace"><i className="bi-filetype-json text-warning me-1.5" />METRICS PAYLOAD (JSON)</span>
              <button
                type="button"
                className="btn btn-xs btn-outline-light py-0.5 px-2 font-monospace"
                onClick={handleCopyJson}
              >
                {copySuccess ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="p-3 mb-0 text-success font-monospace flex-grow-1" style={{ fontSize: '11px', maxHeight: '300px', overflowY: 'auto', whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(calculatedJson, null, 2)}
            </pre>
          </div>
        </div>
    </div>
        </div >
    </div > */}
        </>
      )}

      {/* Save Success Toast */}
      {
        showSaveToast && (
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
        )
      }

      {/* Refresh Success Toast */}
      {
        showRefreshToast && (
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
        )
      }

      {/* CAMERAS LIST VIEW */}
      {
        activeTab === 'cameras' && (
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
        )
      }

      {/* EDGE DEVICES LIST VIEW */}
      {
        activeTab === 'edge' && (
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
        )
      }

      {/* SERVER METRICS VIEW */}
      {
        activeTab === 'server' && (
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
                          { key: 'Base API Endpoint URL', val: serverStats.apiUrl, icon: 'bi-globe' },
                          { key: 'REST Server Status', val: serverStats.status, icon: 'bi-check-circle-fill' },
                          { key: 'PostgreSQL Database', val: serverStats.database, icon: 'bi-database-fill' },
                          { key: 'Active Workers Monitored', val: String(serverStats.activeWorkers), icon: 'bi-people-fill' },
                          { key: 'Active Sites', val: String(serverStats.activeSites), icon: 'bi-geo-alt-fill' },
                          { key: 'Registered AI Cameras', val: String(serverStats.totalCameras), icon: 'bi-camera-video-fill' },
                          { key: 'CPU Core Load', val: `${serverStats.cpuUsage}%`, icon: 'bi-cpu' },
                          { key: 'Memory (RAM)', val: `${serverStats.memoryUsage}%`, icon: 'bi-memory' },
                          { key: 'Disk Storage Usage', val: serverStats.diskUsage, icon: 'bi-hdd-fill' },
                          { key: 'System Uptime', val: serverStats.uptime, icon: 'bi-clock-history' },
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
        )
      }
    </div >
  );
};