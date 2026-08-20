import { useEffect, useRef, useState, useMemo } from 'react';
import { siteService } from '../../services/siteService';
import type { Site, ChainageData } from '../../types';

interface InteractiveVectorMapProps {
  selectedProject: string;
  selectedSite: string;
  selectedChainage: string;
  sitesList?: Site[];
  chainagesList?: ChainageData[];
  onActionClick: (type: 'dashboard' | 'camera' | 'report' | 'details', chainage: string) => void;
}

export interface LocationMarkerDetail {
  id: string;
  name: string;
  site: string;
  project: string;
  lat: number;
  lng: number;
  progress: number;
  status: 'green' | 'yellow' | 'red';
  safetyScore: number;
  workers: number;
  aiAlerts: number;
  highwayProgress: number;
  structuralProgress: number;
  supervisor: string;
  engineer: string;
  cameras: number;
  lastUpdate: string;
}

const CITY_COORDS: Record<string, [number, number]> = {
  mumbai: [19.0760, 72.8777],
  chennai: [13.0827, 80.2707],
  hyderabad: [17.3850, 78.4867],
  bengaluru: [12.9716, 77.5946],
  pune: [18.5204, 73.8567],
  delhi: [28.6139, 77.2090],
};

export const InteractiveVectorMap = ({
  selectedProject,
  selectedSite,
  selectedChainage,
  sitesList = [],
  chainagesList = [],
  onActionClick,
}: InteractiveVectorMapProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<Record<string, any>>({});
  const [mapLoaded, setMapLoaded] = useState(false);
  const [hoveredChainageId, setHoveredChainageId] = useState<string | null>(null);
  const [fetchedChainages, setFetchedChainages] = useState<ChainageData[]>([]);

  // State for the Large Location Popover Box Modal
  const [selectedLocation, setSelectedLocation] = useState<LocationMarkerDetail | null>(null);

  useEffect(() => {
    if (chainagesList.length === 0) {
      siteService.getChainages()
        .then((data) => setFetchedChainages(data as unknown as ChainageData[]))
        .catch(() => null);
    }
  }, [chainagesList.length]);

  const effectiveChainages = chainagesList.length > 0 ? chainagesList : fetchedChainages;

  // Map markers: combine chainages and sites with full rich metadata
  const markersData = useMemo<LocationMarkerDetail[]>(() => {
    if (effectiveChainages.length > 0) {
      return effectiveChainages
        .filter((ch) => {
          if (selectedProject && ch.project !== selectedProject) return false;
          if (selectedSite && ch.site !== selectedSite) return false;
          if (selectedChainage && ch.id !== selectedChainage) return false;
          return true;
        })
        .map((ch) => ({
          id: ch.id,
          name: ch.name || ch.id,
          site: ch.site || selectedSite || 'Site Segment',
          project: ch.project || selectedProject || 'L&T Infrastructure Expressway Corridor',
          lat: typeof ch.lat === 'number' ? ch.lat : (parseFloat(String(ch.lat || '')) || 19.076),
          lng: typeof ch.lng === 'number' ? ch.lng : (parseFloat(String(ch.lng || '')) || 72.8777),
          progress: Number(ch.progress) || 0,
          status: ch.status || 'green',
          safetyScore: Number(ch.safetyScore) || 94,
          workers: Number(ch.workers) || 48,
          aiAlerts: Number(ch.aiAlerts) || (ch.status === 'red' ? 6 : ch.status === 'yellow' ? 2 : 0),
          highwayProgress: Number(ch.highwayProgress) || Math.min(100, Math.round((Number(ch.progress) || 50) * 1.1)),
          structuralProgress: Number(ch.structuralProgress) || Math.max(0, Math.round((Number(ch.progress) || 50) * 0.9)),
          supervisor: ch.supervisor || 'Suresh Reddy',
          engineer: ch.engineer || 'Priya Sharma',
          cameras: Number(ch.cameras) || 4,
          lastUpdate: ch.lastUpdate || 'Live Telemetry Active',
        }));
    }

    return sitesList
      .filter((s) => {
        if (selectedProject && s.projectName !== selectedProject && s.projectId !== selectedProject) return false;
        if (selectedSite && s.name !== selectedSite && s.id !== selectedSite) return false;
        return true;
      })
      .map((s, idx) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sAny = s as any;
        const cityKey = (s.location || sAny.cityName || '').toLowerCase();
        const defaultCoord = CITY_COORDS[cityKey] || [19.076 + idx * 0.5, 72.8777 + idx * 0.5];
        const score = Number(s.safetyScore || sAny.safety_score) || 90;
        return {
          id: s.id,
          name: s.name,
          site: s.name,
          project: s.projectName || selectedProject || 'L&T Operations Hub',
          lat: typeof s.latitude === 'number' ? s.latitude : (parseFloat(String(s.latitude || '')) || defaultCoord[0]),
          lng: typeof s.longitude === 'number' ? s.longitude : (parseFloat(String(s.longitude || '')) || defaultCoord[1]),
          progress: Number(sAny.progress) || 65,
          status: score >= 90 ? 'green' : score >= 80 ? 'yellow' : 'red',
          safetyScore: score,
          workers: Number(s.workerCount) || 120,
          aiAlerts: Number(sAny.openAlerts) || 3,
          highwayProgress: Math.min(100, Math.round((Number(sAny.progress) || 65) * 1.15)),
          structuralProgress: Math.max(0, Math.round((Number(sAny.progress) || 65) * 0.85)),
          supervisor: 'Rajesh Kumar',
          engineer: 'Kartheeswaran',
          cameras: Number(sAny.cameraCount) || 8,
          lastUpdate: 'Live Telemetry Active',
        };
      });
  }, [effectiveChainages, sitesList, selectedProject, selectedSite, selectedChainage]);

  // Load Leaflet dynamically
  useEffect(() => {
    let cssLink = document.getElementById('leaflet-css') as HTMLLinkElement;
    if (!cssLink) {
      cssLink = document.createElement('link');
      cssLink.id = 'leaflet-css';
      cssLink.rel = 'stylesheet';
      cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(cssLink);
    }

    let jsScript = document.getElementById('leaflet-js') as HTMLScriptElement;
    if (!jsScript) {
      jsScript = document.createElement('script');
      jsScript.id = 'leaflet-js';
      jsScript.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      jsScript.onload = () => setMapLoaded(true);
      document.body.appendChild(jsScript);
    } else {
      setTimeout(() => setMapLoaded(true), 0);
    }
  }, []);

  // Initialize and update the Map instance
  useEffect(() => {
    if (!mapLoaded || !mapContainerRef.current) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const L = (window as any).L;
    if (!L) return;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
      });

      L.control.zoom({ position: 'topright' }).addTo(mapInstanceRef.current);
    }

    const map = mapInstanceRef.current;

    // CartoDB Positron style tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(map);

    // Clear existing markers
    Object.values(markersRef.current).forEach((m) => map.removeLayer(m));
    markersRef.current = {};

    // Add new markers
    markersData.forEach((ch) => {
      const colorHex = ch.status === 'green' ? '#16a34a' : ch.status === 'yellow' ? '#d97706' : '#dc2626';

      const customIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div class="marker-pulse" style="background-color: ${colorHex}44; width: 26px; height: 26px; border-radius: 50%; position: absolute; top: -5px; left: -5px; animation: pulse 2s infinite ease-in-out;"></div>
          <div class="marker-pin" style="background-color: ${colorHex}; border: 2px solid white; width: 18px; height: 18px; border-radius: 50%; position: relative; box-shadow: 0 2px 8px rgba(0,0,0,0.3); cursor: pointer;"></div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });

      const marker = L.marker([ch.lat, ch.lng], { icon: customIcon }).addTo(map);

      // Tooltip on hover
      marker.bindTooltip(`<b>${ch.site.split(' - ')[0]} (${ch.name})</b><br/>Progress: ${ch.progress}% · Click for details`, {
        direction: 'top',
        offset: [0, -12],
        opacity: 0.95,
      });

      // Native Leaflet Popup content
      const popupHtml = `
        <div style="font-family: system-ui, sans-serif; min-width: 220px; padding: 4px;">
          <div style="font-weight: 700; font-size: 13px; color: #1e293b; margin-bottom: 2px;">${ch.name}</div>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 8px;">${ch.site}</div>
          <div style="display: flex; gap: 6px; margin-bottom: 8px;">
            <span style="background: #f0fdf4; color: #16a34a; font-weight: 700; padding: 3px 8px; border-radius: 12px; font-size: 11px;">Progress: ${ch.progress}%</span>
            <span style="background: #eff6ff; color: #2563eb; font-weight: 700; padding: 3px 8px; border-radius: 12px; font-size: 11px;">Safety: ${ch.safetyScore}%</span>
          </div>
          <button id="btn-popover-${ch.id}" style="width: 100%; background: #2563eb; color: #fff; border: none; padding: 6px 12px; border-radius: 6px; font-weight: 600; font-size: 11px; cursor: pointer;">
            View Detailed Popover
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml, { maxWidth: 300 });

      marker.on('mouseover', () => {
        setHoveredChainageId(ch.id);
      });

      marker.on('mouseout', () => {
        setHoveredChainageId(null);
      });

      marker.on('click', () => {
        map.setView([ch.lat, ch.lng], 14, { animate: true });
        setSelectedLocation(ch);
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-popover-${ch.id}`);
        if (btn) {
          btn.onclick = () => {
            setSelectedLocation(ch);
          };
        }
      });

      markersRef.current[ch.id] = marker;
    });

    map.invalidateSize();

    if (markersData.length > 1) {
      const group = L.featureGroup(Object.values(markersRef.current));
      map.fitBounds(group.getBounds().pad(0.15));
    } else if (markersData.length === 1) {
      map.setView([markersData[0].lat, markersData[0].lng], 12);
    } else {
      map.setView([20.5937, 78.9629], 5);
    }
  }, [mapLoaded, selectedProject, selectedSite, selectedChainage, markersData]);

  return (
    <div className="d-flex flex-column h-100 bg-white position-relative">
      {/* Header matching "Project Locations Map" */}
      <div className="d-flex align-items-center justify-content-between p-3 border-bottom bg-white z-2">
        <div className="d-flex align-items-center gap-2">
          <i className="bi bi-geo-alt-fill text-primary fs-5" />
          <div>
            <h3 className="h6 mb-0 fw-bold text-body">Project Locations Map</h3>
            <small className="text-muted" style={{ fontSize: '11px' }}>
              Click any location pin to open detailed popover box
            </small>
          </div>
        </div>
        <div className="d-flex align-items-center gap-2">
          {selectedLocation && (
            <button
              className="btn btn-outline-danger btn-sm py-1 px-2.5 d-flex align-items-center gap-1 fw-semibold"
              style={{ fontSize: '11px' }}
              onClick={() => setSelectedLocation(null)}
            >
              <i className="bi bi-x-circle-fill" /> Close Details
            </button>
          )}
          <button
            className="btn btn-link text-primary fw-semibold p-0 text-decoration-none"
            style={{ fontSize: '11px' }}
            onClick={() => alert('Exporting active locations telemetry report')}
          >
            Export Report
          </button>
        </div>
      </div>

      {/* Map Content Box */}
      <div className="position-relative flex-grow-1" style={{ minHeight: '380px' }}>
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

        {!mapLoaded && (
          <div className="position-absolute top-0 start-0 w-100 h-100 bg-white bg-opacity-75 d-flex flex-column align-items-center justify-content-center z-3">
            <div className="spinner-border text-primary spinner-border-sm mb-2" role="status" />
            <span className="small text-muted font-monospace">Loading map telemetry...</span>
          </div>
        )}
      </div>

      {/* ── LARGE POPOVER BOX MODAL DIALOG (OVERLAY OVER SCREEN) ── */}
      {selectedLocation && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{
            zIndex: 1060,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(6px)',
          }}
          onClick={() => setSelectedLocation(null)}
        >
          <div
            className="card border-0 shadow-lg w-100 rounded-4 overflow-hidden bg-white border-start border-5 border-primary"
            style={{
              maxWidth: '640px',
              maxHeight: '92vh',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)',
              animation: 'modalSlideIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Popover Header */}
            <div className="card-header bg-primary text-white p-3.5 d-flex align-items-center justify-content-between border-0">
              <div className="d-flex align-items-center gap-3">
                <span className="badge bg-white text-primary fw-bold p-2.5 rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: 38, height: 38 }}>
                  <i className="bi bi-geo-alt-fill fs-5" />
                </span>
                <div>
                  <h4 className="h5 mb-0 fw-bold text-white">
                    {selectedLocation.name}
                  </h4>
                  <span className="small text-white-50" style={{ fontSize: '12px' }}>
                    {selectedLocation.site} · {selectedLocation.project}
                  </span>
                </div>
              </div>
              <button
                className="btn btn-sm btn-light text-dark rounded-circle p-1.5 d-flex align-items-center justify-content-center"
                style={{ width: 32, height: 32 }}
                onClick={() => setSelectedLocation(null)}
                aria-label="Close popover"
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>

            {/* Popover Body */}
            <div className="card-body p-4 overflow-auto" style={{ maxHeight: 'calc(92vh - 140px)' }}>
              {/* Status Badge & GPS */}
              <div className="d-flex align-items-center justify-content-between mb-3.5 pb-2.5 border-bottom">
                <span className={`badge ${selectedLocation.status === 'green' ? 'bg-success-subtle text-success border border-success-subtle' : selectedLocation.status === 'yellow' ? 'bg-warning-subtle text-warning border border-warning-subtle' : 'bg-danger-subtle text-danger border border-danger-subtle'} rounded-pill px-3 py-1.5 fw-bold`} style={{ fontSize: '12px' }}>
                  <i className="bi bi-circle-fill me-1.5" style={{ fontSize: '8px' }} />
                  {selectedLocation.status === 'green' ? 'Optimal Condition' : selectedLocation.status === 'yellow' ? 'Attention Needed' : 'Critical Hazard'}
                </span>

                <span className="small text-muted font-monospace" style={{ fontSize: '12px' }}>
                  <i className="bi bi-compass text-primary me-1" />
                  GPS: {(Number(selectedLocation.lat) || 19.076).toFixed(4)}, {(Number(selectedLocation.lng) || 72.8777).toFixed(4)}
                </span>
              </div>

              {/* 4 Key Stat Box Tiles */}
              <div className="row g-2.5 mb-4">
                <div className="col-6 col-sm-3">
                  <div className="p-3 rounded-3 bg-success-subtle border border-success-subtle text-center h-100 d-flex flex-column justify-content-center">
                    <small className="text-success fw-semibold d-block mb-1" style={{ fontSize: '11.5px' }}>Overall Progress</small>
                    <span className="h3 fw-bold text-success mb-0">{selectedLocation.progress}%</span>
                  </div>
                </div>
                <div className="col-6 col-sm-3">
                  <div className="p-3 rounded-3 bg-primary-subtle border border-primary-subtle text-center h-100 d-flex flex-column justify-content-center">
                    <small className="text-primary fw-semibold d-block mb-1" style={{ fontSize: '11.5px' }}>Safety Score</small>
                    <span className="h3 fw-bold text-primary mb-0">{selectedLocation.safetyScore}%</span>
                  </div>
                </div>
                <div className="col-6 col-sm-3">
                  <div className="p-3 rounded-3 bg-light border text-center h-100 d-flex flex-column justify-content-center">
                    <small className="text-muted fw-semibold d-block mb-1" style={{ fontSize: '11.5px' }}>Active Workers</small>
                    <span className="h3 fw-bold text-dark mb-0">{selectedLocation.workers}</span>
                  </div>
                </div>
                <div className="col-6 col-sm-3">
                  <div className={`p-3 rounded-3 text-center h-100 d-flex flex-column justify-content-center ${selectedLocation.aiAlerts > 3 ? 'bg-danger-subtle border border-danger-subtle' : 'bg-light border'}`}>
                    <small className={`fw-semibold d-block mb-1 ${selectedLocation.aiAlerts > 3 ? 'text-danger' : 'text-muted'}`} style={{ fontSize: '11.5px' }}>AI Alerts</small>
                    <span className={`h3 fw-bold mb-0 ${selectedLocation.aiAlerts > 3 ? 'text-danger' : 'text-dark'}`}>{selectedLocation.aiAlerts}</span>
                  </div>
                </div>
              </div>

              {/* Progress Detail Breakdowns */}
              <div className="card border-0 bg-light p-3.5 rounded-3 mb-4">
                <span className="small fw-bold text-uppercase text-muted d-block mb-3" style={{ fontSize: '11.5px', letterSpacing: '0.6px' }}>
                  Construction Task Progress Breakdown
                </span>

                <div className="mb-3">
                  <div className="d-flex align-items-center justify-content-between mb-1.5" style={{ fontSize: '13px' }}>
                    <span className="fw-semibold text-dark">Highway Paving & Subbase:</span>
                    <strong className="text-success">{selectedLocation.highwayProgress}%</strong>
                  </div>
                  <div className="progress rounded-pill" style={{ height: '8px' }}>
                    <div className="progress-bar bg-success rounded-pill" style={{ width: `${selectedLocation.highwayProgress}%` }} />
                  </div>
                </div>

                <div>
                  <div className="d-flex align-items-center justify-content-between mb-1.5" style={{ fontSize: '13px' }}>
                    <span className="fw-semibold text-dark">Structural Pier Casting & Girder Launch:</span>
                    <strong className="text-primary">{selectedLocation.structuralProgress}%</strong>
                  </div>
                  <div className="progress rounded-pill" style={{ height: '8px' }}>
                    <div className="progress-bar bg-primary rounded-pill" style={{ width: `${selectedLocation.structuralProgress}%` }} />
                  </div>
                </div>
              </div>

              {/* Operational Context Grid */}
              <span className="small fw-bold text-uppercase text-muted d-block mb-2.5" style={{ fontSize: '11.5px', letterSpacing: '0.6px' }}>
                Operational Team & Telemetry
              </span>
              <div className="row g-2 mb-4" style={{ fontSize: '13px' }}>
                <div className="col-6">
                  <div className="d-flex align-items-center gap-2.5 p-2.5 rounded bg-light border">
                    <i className="bi bi-folder2-open text-primary fs-4" />
                    <div className="text-truncate">
                      <div className="text-muted" style={{ fontSize: '11px' }}>Project Corridor</div>
                      <div className="fw-semibold text-dark text-truncate">{selectedLocation.project}</div>
                    </div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="d-flex align-items-center gap-2.5 p-2.5 rounded bg-light border">
                    <i className="bi bi-person-badge text-success fs-4" />
                    <div className="text-truncate">
                      <div className="text-muted" style={{ fontSize: '11px' }}>Site Supervisor</div>
                      <div className="fw-semibold text-dark text-truncate">{selectedLocation.supervisor}</div>
                    </div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="d-flex align-items-center gap-2.5 p-2.5 rounded bg-light border">
                    <i className="bi bi-person-gear text-info fs-4" />
                    <div className="text-truncate">
                      <div className="text-muted" style={{ fontSize: '11px' }}>Lead Engineer</div>
                      <div className="fw-semibold text-dark text-truncate">{selectedLocation.engineer}</div>
                    </div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="d-flex align-items-center gap-2.5 p-2.5 rounded bg-light border">
                    <i className="bi bi-camera-video text-warning fs-4" />
                    <div className="text-truncate">
                      <div className="text-muted" style={{ fontSize: '11px' }}>IP Cameras</div>
                      <div className="fw-semibold text-dark text-truncate">{selectedLocation.cameras} Active Streams</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons inside Popover */}
              <div className="d-flex flex-wrap align-items-center gap-2 pt-3 border-top">
                <button
                  className="btn btn-primary btn-sm flex-grow-1 fw-semibold py-2 px-3 d-flex align-items-center justify-content-center gap-2"
                  style={{ fontSize: '13px' }}
                  onClick={() => {
                    setSelectedLocation(null);
                    onActionClick('details', selectedLocation.id);
                  }}
                >
                  <i className="bi bi-speedometer2" /> Full Station Console
                </button>
                <button
                  className="btn btn-outline-primary btn-sm fw-semibold py-2 px-3 d-flex align-items-center gap-1.5"
                  style={{ fontSize: '13px' }}
                  onClick={() => {
                    setSelectedLocation(null);
                    onActionClick('camera', selectedLocation.id);
                  }}
                >
                  <i className="bi bi-camera-video-fill" /> Open Camera Feeds
                </button>
                <button
                  className="btn btn-outline-secondary btn-sm fw-semibold py-2 px-3 d-flex align-items-center gap-1.5"
                  style={{ fontSize: '13px' }}
                  onClick={() => {
                    setSelectedLocation(null);
                    onActionClick('report', selectedLocation.id);
                  }}
                >
                  <i className="bi bi-file-earmark-pdf" /> Generate Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Structured Locations List Pills Bottom Bar */}
      <div className="p-3 border-top bg-light-subtle d-flex flex-column justify-content-center z-2" style={{ minHeight: '65px' }}>
        <div className="d-flex align-items-center justify-content-between mb-2">
          <span className="small text-muted fw-bold text-uppercase" style={{ fontSize: '10.5px', letterSpacing: '0.5px' }}>
            Active Map Locations ({markersData.length}) — Click to view Popover Box:
          </span>
        </div>
        <div className="d-flex flex-wrap gap-1.5">
          {markersData.map((loc) => {
            const isHovered = hoveredChainageId === loc.id;
            const isSelected = selectedLocation?.id === loc.id;
            return (
              <button
                key={loc.id}
                className={`btn btn-sm py-1 px-2.5 rounded-pill border d-flex align-items-center gap-1.5 transition-all ${
                  isSelected || isHovered ? 'btn-primary text-white shadow-sm' : 'btn-white bg-white text-dark shadow-xs'
                }`}
                style={{ fontSize: '11.5px' }}
                onMouseEnter={() => setHoveredChainageId(loc.id)}
                onMouseLeave={() => setHoveredChainageId(null)}
                onClick={() => {
                  setSelectedLocation(loc);
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.setView([loc.lat, loc.lng], 14, { animate: true });
                  }
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: isSelected || isHovered ? '#ffffff' : loc.status === 'green' ? '#16a34a' : loc.status === 'yellow' ? '#d97706' : '#dc2626',
                    display: 'inline-block',
                  }}
                />
                <span className="fw-semibold">{loc.name}</span>
                <span className={`badge border ms-1 ${isSelected || isHovered ? 'bg-white bg-opacity-25 text-white' : 'bg-light text-secondary'}`} style={{ fontSize: '10px' }}>
                  {loc.progress}%
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
