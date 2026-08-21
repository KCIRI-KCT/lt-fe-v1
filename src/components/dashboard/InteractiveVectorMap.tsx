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
  bangalore: [12.9716, 77.5946],
  pune: [18.5204, 73.8567],
  delhi: [28.6139, 77.2090],
  kolkata: [22.5726, 88.3639],
  ahmedabad: [23.0225, 72.5714],
  jaipur: [26.9124, 75.7873],
  lucknow: [26.8467, 80.9462],
  nagpur: [21.1458, 79.0882],
  coimbatore: [11.0168, 76.9558],
  kochi: [9.9312, 76.2673],
  chandigarh: [30.7333, 76.7794],
  bhubaneswar: [20.2961, 85.8245],
  surat: [21.1702, 72.8311],
  patna: [25.5941, 85.1376],
  bhopal: [23.2599, 77.4126],
  vadodara: [22.3072, 73.1812],
  visakhapatnam: [17.6868, 83.2185],
  madurai: [9.9252, 78.1198],
  salem: [11.6643, 78.1460],
  tiruchirappalli: [10.7905, 78.7047],
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
  const tileLayerAddedRef = useRef(false);
  // Always keep the latest onActionClick without re-running the marker effect
  const onActionClickRef = useRef(onActionClick);
  useEffect(() => { onActionClickRef.current = onActionClick; });
  const [mapLoaded, setMapLoaded] = useState(false);
  const [fetchedChainages, setFetchedChainages] = useState<ChainageData[]>([]);

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
    // 1. If specific chainage selected, show that single chainage
    if (selectedChainage) {
      const match = effectiveChainages.find((ch) => ch.id === selectedChainage);
      if (match) {
        return [{
          id: match.id,
          name: match.name || match.id,
          site: match.site || selectedSite || 'Site Segment',
          project: match.project || selectedProject || 'L&T Infrastructure Project',
          lat: typeof match.lat === 'number' && !isNaN(match.lat) ? match.lat : (parseFloat(String(match.lat || '')) || 19.076),
          lng: typeof match.lng === 'number' && !isNaN(match.lng) ? match.lng : (parseFloat(String(match.lng || '')) || 72.8777),
          progress: Number(match.progress) || 0,
          status: match.status || 'green',
          safetyScore: Number(match.safetyScore) || 94,
          workers: Number(match.workers) || 48,
          aiAlerts: Number(match.aiAlerts) || (match.status === 'red' ? 6 : match.status === 'yellow' ? 2 : 0),
          highwayProgress: Number(match.highwayProgress) || Math.min(100, Math.round((Number(match.progress) || 50) * 1.1)),
          structuralProgress: Number(match.structuralProgress) || Math.max(0, Math.round((Number(match.progress) || 50) * 0.9)),
          supervisor: match.supervisor || 'Suresh Reddy',
          engineer: match.engineer || 'Priya Sharma',
          cameras: Number(match.cameras) || 4,
          lastUpdate: match.lastUpdate || 'Live Telemetry Active',
        }];
      }
    }

    // 2. If specific site selected, show chainages for that site if available, or site marker
    if (selectedSite) {
      const siteChainages = effectiveChainages.filter((ch) => ch.site === selectedSite);
      if (siteChainages.length > 0) {
        return siteChainages.map((ch) => ({
          id: ch.id,
          name: ch.name || ch.id,
          site: ch.site || selectedSite,
          project: ch.project || selectedProject || 'L&T Infrastructure Project',
          lat: typeof ch.lat === 'number' && !isNaN(ch.lat) ? ch.lat : (parseFloat(String(ch.lat || '')) || 19.076),
          lng: typeof ch.lng === 'number' && !isNaN(ch.lng) ? ch.lng : (parseFloat(String(ch.lng || '')) || 72.8777),
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
    }

    // 3. Filtered sites matching selected project / site (or all sites when none selected)
    const matchingSites = sitesList.filter((s) => {
      if (selectedProject && s.projectName !== selectedProject && s.projectId !== selectedProject) return false;
      if (selectedSite && s.name !== selectedSite && s.id !== selectedSite) return false;
      return true;
    });

    if (matchingSites.length > 0) {
      return matchingSites.map((s, idx) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sAny = s as any;
        const locStr = (s.location || sAny.cityName || s.projectName || s.name || '').toLowerCase();
        let defaultCoord: [number, number] = [19.0760 + (idx % 6) * 1.8, 72.8777 + (idx % 6) * 1.5];
        for (const [cityName, coords] of Object.entries(CITY_COORDS)) {
          if (locStr.includes(cityName)) {
            defaultCoord = [coords[0] + ((idx % 3) * 0.08), coords[1] + ((idx % 3) * 0.08)];
            break;
          }
        }
        const score = Number(s.safetyScore || sAny.safety_score) || 92;
        const latVal = typeof s.latitude === 'number' && !isNaN(s.latitude) && s.latitude !== 0 ? s.latitude : (parseFloat(String(s.latitude || '')) || defaultCoord[0]);
        const lngVal = typeof s.longitude === 'number' && !isNaN(s.longitude) && s.longitude !== 0 ? s.longitude : (parseFloat(String(s.longitude || '')) || defaultCoord[1]);

        return {
          id: s.id,
          name: s.name,
          site: s.name,
          project: s.projectName || selectedProject || 'L&T Operations Project',
          lat: latVal,
          lng: lngVal,
          progress: Number(sAny.progress) || 65,
          status: score >= 90 ? 'green' : score >= 80 ? 'yellow' : 'red',
          safetyScore: score,
          workers: Number(s.workerCount) || 120,
          aiAlerts: Number(sAny.openAlerts) || 2,
          highwayProgress: Math.min(100, Math.round((Number(sAny.progress) || 65) * 1.15)),
          structuralProgress: Math.max(0, Math.round((Number(sAny.progress) || 65) * 0.85)),
          supervisor: s.supervisorName || 'Rajesh Kumar',
          engineer: 'Lead Engineer',
          cameras: Number(sAny.cameraCount) || 8,
          lastUpdate: 'Live Telemetry Active',
        };
      });
    }

    // 4. Fallback to effectiveChainages if sitesList is empty
    return effectiveChainages.map((ch) => ({
      id: ch.id,
      name: ch.name || ch.id,
      site: ch.site || 'Site Segment',
      project: ch.project || 'L&T Project',
      lat: typeof ch.lat === 'number' && !isNaN(ch.lat) ? ch.lat : 19.076,
      lng: typeof ch.lng === 'number' && !isNaN(ch.lng) ? ch.lng : 72.8777,
      progress: Number(ch.progress) || 0,
      status: ch.status || 'green',
      safetyScore: Number(ch.safetyScore) || 94,
      workers: Number(ch.workers) || 48,
      aiAlerts: Number(ch.aiAlerts) || 0,
      highwayProgress: Number(ch.highwayProgress) || 50,
      structuralProgress: Number(ch.structuralProgress) || 50,
      supervisor: ch.supervisor || 'Suresh Reddy',
      engineer: ch.engineer || 'Priya Sharma',
      cameras: Number(ch.cameras) || 4,
      lastUpdate: 'Live Telemetry Active',
    }));
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

  // ── Effect 1: One-time map + tile layer initialization ─────────────────────
  useEffect(() => {
    if (!mapLoaded || !mapContainerRef.current) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const L = (window as any).L;
    if (!L) return;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current, {
        center: [21.8, 78.9],
        zoom: 4.5,
        zoomControl: false,
        attributionControl: false,
      });
      L.control.zoom({ position: 'topright' }).addTo(mapInstanceRef.current);
    }

    // Add tile layer only once
    if (!tileLayerAddedRef.current) {
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
      }).addTo(mapInstanceRef.current);
      tileLayerAddedRef.current = true;
    }
  }, [mapLoaded]);

  // ── Effect 2: Update markers + delegated popup listener ─────────────────────
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const L = (window as any).L;
    if (!L) return;

    const map = mapInstanceRef.current;

    // Clear existing markers
    Object.values(markersRef.current).forEach((m) => map.removeLayer(m));
    markersRef.current = {};

    // Add new markers with popup
    markersData.forEach((ch) => {
      const colorHex = ch.status === 'green' ? '#16a34a' : ch.status === 'yellow' ? '#d97706' : '#dc2626';

      const customIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div style="pointer-events:none; background-color: ${colorHex}44; width: 32px; height: 32px; border-radius: 50%; position: absolute; top: -7px; left: -7px; animation: pulse 2s infinite ease-in-out;"></div>
          <div style="background-color: ${colorHex}; border: 2.5px solid white; width: 20px; height: 20px; border-radius: 50%; position: relative; box-shadow: 0 2px 8px rgba(0,0,0,0.35); cursor: pointer;"></div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      const safeSiteStr = typeof ch.site === 'string' ? ch.site : (ch.site as { name?: string })?.name || String(ch.site || '');
      const siteShortName = safeSiteStr.includes(' - ') ? safeSiteStr.split(' - ')[0] : (safeSiteStr || ch.name);

      // Popup with a button — delegated listener handles React state
      const popupHtml = `
        <div style="min-width:180px; font-family:system-ui,sans-serif;">
          <div style="font-weight:700; font-size:13px; color:#1e293b; margin-bottom:2px;">${siteShortName}</div>
          <div style="font-size:11px; color:#64748b; margin-bottom:6px;">${ch.project}</div>
          <div style="display:flex; gap:6px; margin-bottom:8px;">
            <span style="background:#f0fdf4; color:#16a34a; border-radius:6px; padding:2px 7px; font-size:11px; font-weight:600;">Progress: ${ch.progress}%</span>
            <span style="background:#eff6ff; color:#2563eb; border-radius:6px; padding:2px 7px; font-size:11px; font-weight:600;">Safety: ${ch.safetyScore}%</span>
          </div>
          <button
            data-station-id="${ch.id}"
            style="width:100%; background:#1e293b; color:#fff; border:none; border-radius:8px; padding:6px 12px; font-size:12px; font-weight:600; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:5px;"
          >
            &#9654; Open Station Console
          </button>
        </div>
      `;

      const marker = L.marker([ch.lat, ch.lng], { icon: customIcon }).addTo(map);
      marker.bindPopup(popupHtml, { maxWidth: 220, offset: [0, -8] });
      markersRef.current[ch.id] = marker;
    });

    // ── Delegated document listener: catches popup button clicks ─────────────
    const onDocClick = (e: MouseEvent) => {
      const btn = (e.target as HTMLElement).closest('[data-station-id]') as HTMLElement | null;
      if (btn) {
        const stationId = btn.getAttribute('data-station-id');
        if (stationId) {
          // Close any open popups first
          map.closePopup();
          onActionClickRef.current('details', stationId);
        }
      }
    };
    document.addEventListener('click', onDocClick);

    map.invalidateSize();

    // ── Fly to correct location ───────────────────────────────────────────────
    if (!selectedProject && !selectedSite && !selectedChainage) {
      map.flyTo([21.8, 78.9], 4.5, { animate: true, duration: 1.2 });
    } else if (markersData.length > 1) {
      const group = L.featureGroup(Object.values(markersRef.current));
      const bounds = group.getBounds();
      if (bounds.isValid()) {
        map.flyToBounds(bounds.pad(0.3), { animate: true, duration: 1.2 });
      }
    } else if (markersData.length === 1) {
      map.flyTo([markersData[0].lat, markersData[0].lng], 12, { animate: true, duration: 1.2 });
    } else {
      map.flyTo([21.8, 78.9], 4.5, { animate: true, duration: 1.2 });
    }

    return () => {
      document.removeEventListener('click', onDocClick);
    };
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
              Click any location pin to open Station Console
            </small>
          </div>
        </div>
        <div className="d-flex align-items-center gap-2">
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
    </div>
  );
};
