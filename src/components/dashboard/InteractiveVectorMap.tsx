import { useEffect, useRef, useState, useMemo } from 'react';
import { MOCK_CHAINAGES } from '../../services/mockData';

interface InteractiveVectorMapProps {
  selectedProject: string;
  selectedSite: string;
  selectedChainage: string;
  onActionClick: (type: 'dashboard' | 'camera' | 'report' | 'details', chainage: string) => void;
}

export const InteractiveVectorMap = ({
  selectedProject,
  selectedSite,
  selectedChainage,
  onActionClick,
}: InteractiveVectorMapProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<Record<string, any>>({});
  const [mapLoaded, setMapLoaded] = useState(false);
  const [hoveredChainageId, setHoveredChainageId] = useState<string | null>(null);

  // Filter chainages memoized to prevent infinite renders or dependency warnings
  const filteredChainages = useMemo(() => {
    return MOCK_CHAINAGES.filter((ch) => {
      if (selectedProject && ch.project !== selectedProject) return false;
      if (selectedSite && ch.site !== selectedSite) return false;
      if (selectedChainage && ch.id !== selectedChainage) return false;
      return true;
    });
  }, [selectedProject, selectedSite, selectedChainage]);

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

    // Use CartoDB Positron style tile layer - clean, light monochrome vector look matching Velzon
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(map);

    // Clear existing markers
    Object.values(markersRef.current).forEach((m) => map.removeLayer(m));
    markersRef.current = {};

    // Add new markers
    filteredChainages.forEach((ch) => {
      const colorHex = ch.status === 'green' ? '#16a34a' : ch.status === 'yellow' ? '#d97706' : '#dc2626';

      const customIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div class="marker-pulse" style="background-color: ${colorHex}44; width: 22px; height: 22px; border-radius: 50%; position: absolute; top: -4px; left: -4px; animation: pulse 2s infinite ease-in-out;"></div>
          <div class="marker-pin" style="background-color: ${colorHex}; border: 1.5px solid white; width: 14px; height: 14px; border-radius: 50%; position: relative; box-shadow: 0 1px 3px rgba(0,0,0,0.15);"></div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      const marker = L.marker([ch.lat, ch.lng], { icon: customIcon }).addTo(map);

      // Tooltip/popup on hover
      marker.bindTooltip(`<b>${ch.site.split(' - ')[0]} (${ch.id})</b><br/>Progress: ${ch.progress}%`, {
        direction: 'top',
        offset: [0, -10],
        opacity: 0.95
      });

      marker.on('mouseover', () => {
        setHoveredChainageId(ch.id);
      });

      marker.on('mouseout', () => {
        setHoveredChainageId(null);
      });

      marker.on('click', () => {
        map.setView([ch.lat, ch.lng], 14);
        onActionClick('details', ch.id);
      });

      markersRef.current[ch.id] = marker;
    });

    // Invalidate size to ensure container dimensions are fresh before bounds calculation
    map.invalidateSize();

    if (filteredChainages.length > 1) {
      const group = L.featureGroup(Object.values(markersRef.current));
      map.fitBounds(group.getBounds().pad(0.15));
    } else if (filteredChainages.length === 1) {
      map.setView([filteredChainages[0].lat, filteredChainages[0].lng], 12);
    } else {
      map.setView([20.5937, 78.9629], 5);
    }
  }, [mapLoaded, selectedProject, selectedSite, selectedChainage, filteredChainages, onActionClick]);

  return (
    <div className="d-flex flex-column h-100 bg-white">
      {/* Header matching "Project Locations Map" in Velzon */}
      <div className="d-flex align-items-center justify-content-between p-3 border-bottom">
        <h3 className="h6 mb-0 fw-bold text-body">Project Locations Map</h3>
        <button
          className="btn btn-link text-primary fw-semibold p-0 text-decoration-none"
          style={{ fontSize: '11px' }}
          onClick={() => alert('Exporting active stations report')}
        >
          Export Report
        </button>
      </div>

      {/* Map Content Box */}
      <div className="position-relative flex-grow-1" style={{ minHeight: '150px' }}>
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

        {!mapLoaded && (
          <div className="position-absolute top-0 start-0 w-100 h-100 bg-white bg-opacity-75 d-flex flex-column align-items-center justify-content-center">
            <div className="spinner-border text-primary spinner-border-sm mb-2" role="status" />
            <span className="small text-muted font-monospace">Loading map...</span>
          </div>
        )}
      </div>

      {/* Structured Locations progress list bottom panel */}
      <div className="p-3 border-top bg-light-subtle d-flex flex-column justify-content-center" style={{ minHeight: '60px' }}>
        {hoveredChainageId ? (() => {
          const ch = MOCK_CHAINAGES.find((c) => c.id === hoveredChainageId);
          if (!ch) return null;
          const colorHex = ch.status === 'green' ? 'bg-success' : ch.status === 'yellow' ? 'bg-warning' : 'bg-danger';
          return (
            <div
              className="d-flex align-items-center justify-content-between gap-3 text-muted"
              style={{ fontSize: '11px' }}
            >
              <span className="fw-semibold text-body text-truncate" style={{ maxWidth: '150px' }}>
                {ch.site.split(' - ')[0]} ({ch.id})
              </span>
              <div className="progress flex-grow-1" style={{ height: '5px' }}>
                <div
                  className={`progress-bar ${colorHex}`}
                  style={{ width: `${ch.progress}%` }}
                  role="progressbar"
                />
              </div>
              <span className="fw-bold text-dark" style={{ width: '32px', textAlign: 'right' }}>
                {ch.progress}%
              </span>
            </div>
          );
        })() : (
          <div className="text-muted text-center small py-1" style={{ fontSize: '11px' }}>
            <i className="bi bi-info-circle me-1.5 text-primary" />
            Hover over a marker on the map to view progress details
          </div>
        )}
      </div>
    </div>
  );
};
