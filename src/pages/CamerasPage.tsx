import { useState, useEffect } from 'react';
import { CameraCard } from '../components/cards/CameraCard';
import { cameraService } from '../services/cameraService';
import type { Camera } from '../types';

export const CamerasPage = () => {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [selectedSite, setSelectedSite] = useState<string>('all');
  const [selectedChainage, setSelectedChainage] = useState<string>('all');
  const [activeCamId, setActiveCamId] = useState<string | null>(null);
  const [ptzAction, setPtzAction] = useState<string>('');
  const [camOffset, setCamOffset] = useState({ x: 0, y: 0, zoom: 1 });
  const [timestamp, setTimestamp] = useState<string>('');
  const [showReportToast, setShowReportToast] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  useEffect(() => {
    let isMounted = true;
    cameraService.getCameras()
      .then((data) => {
        if (isMounted) setCameras(data);
      })
      .catch(() => {
        if (isMounted) setCameras([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  // Camera HUD overlay states
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [shutterFlash, setShutterFlash] = useState(false);
  const [streamError, setStreamError] = useState(false);
  const [actionToastMsg, setActionToastMsg] = useState('');
  const [showActionToast, setShowActionToast] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    if (isRecording) {
      timer = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRecording]);

  const formatDuration = (sec: number) => {
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleToggleRecording = (camName: string) => {
    if (isRecording) {
      setIsRecording(false);
      setRecordingSeconds(0);
      setActionToastMsg(`Video recording saved as ${camName.replace(/\s+/g, '_')}_clip.mp4 to local logs.`);
      setShowActionToast(true);
      setTimeout(() => setShowActionToast(false), 3000);
    } else {
      setIsRecording(true);
      setRecordingSeconds(0);
      setActionToastMsg(`Recording started for ${camName}...`);
      setShowActionToast(true);
      setTimeout(() => setShowActionToast(false), 2500);
    }
  };

  const handleTakeSnapshot = (camName: string) => {
    setShutterFlash(true);
    setTimeout(() => setShutterFlash(false), 300);
    setActionToastMsg(`Snapshot saved as ${camName.replace(/\s+/g, '_')}_snap.jpg to device storage.`);
    setShowActionToast(true);
    setTimeout(() => setShowActionToast(false), 3000);
  };

  // Extract unique Sites and Chainages dynamically
  const siteOptions = Array.from(
    new Set(
      cameras.map((c) => {
        const parts = c.siteName?.split(' - ') || [];
        return parts[0] || '';
      }).filter(Boolean)
    )
  );

  const chainageOptions = Array.from(
    new Set(
      cameras.map((c) => {
        const parts = c.siteName?.split(' - ') || [];
        return parts[1] || '';
      }).filter(Boolean)
    )
  );

  // Camera malfunctions derived dynamically from offline or error status cameras
  const malfunctions = cameras
    .filter((c) => c.status === 'offline' || c.status === 'error' || c.status === 'maintenance')
    .map((c, i) => ({
      id: `m-${c.id}`,
      name: c.name,
      siteName: c.siteName || 'Site Main',
      code: `CAM-${String(i + 1).padStart(2, '0')}`,
      frequency: c.status === 'error' ? 14 : 4,
      lastTime: c.lastOnline || new Date().toISOString().replace('T', ' ').substring(0, 19),
      issue: c.status === 'error' ? 'RTSP socket connection handshake reset' : 'Camera feed offline / connectivity loss',
    }));

  const filtered = cameras.filter((c) => {
    const statusStr = String(c.status).toLowerCase();
    if (filter === 'online' && statusStr !== 'online' && statusStr !== 'active') return false;
    if (filter === 'offline' && (statusStr === 'online' || statusStr === 'active')) return false;
    if (filter !== 'all' && filter !== 'online' && filter !== 'offline' && statusStr !== filter) return false;

    const parts = c.siteName?.split(' - ') || [];
    const sitePart = parts[0] || '';
    if (selectedSite !== 'all' && sitePart !== selectedSite) return false;

    const chainagePart = parts[1] || '';
    if (selectedChainage !== 'all' && chainagePart !== selectedChainage) return false;

    return true;
  });

  const activeCamera = cameras.find((c) => c.id === activeCamId);

  const handleGenerateReport = () => {
    setIsGeneratingReport(true);
    setTimeout(() => {
      setIsGeneratingReport(false);
      setShowReportToast(true);
      setTimeout(() => setShowReportToast(false), 3000);
    }, 1200);
  };

  // Update live stream timestamp
  useEffect(() => {
    if (!activeCamId) return;
    const interval = setInterval(() => {
      setTimestamp(new Date().toLocaleString());
    }, 1000);

    return () => clearInterval(interval);
  }, [activeCamId]);

  // Handle Camera Status Toggle
  const handleToggleCameraStatus = async (id: string) => {
    const targetCam = cameras.find((c) => c.id === id);
    if (!targetCam) return;
    const newStatus: Camera['status'] = targetCam.status === 'online' ? 'offline' : 'online';

    setCameras((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );
    setActionToastMsg(`Camera "${targetCam.name}" status changed to ${newStatus.toUpperCase()}`);
    setShowActionToast(true);
    setTimeout(() => setShowActionToast(false), 3000);

    try {
      await cameraService.updateCamera(id, { status: newStatus });
    } catch (err) {
      console.error('Failed to update camera status:', err);
    }
  };

  // Handle PTZ action trigger
  const handlePtz = async (action: string) => {
    setPtzAction(action);
    let nextX = camOffset.x;
    let nextY = camOffset.y;
    let nextZoom = camOffset.zoom;

    switch (action) {
      case 'PAN LEFT': nextX = camOffset.x - 30; break;
      case 'PAN RIGHT': nextX = camOffset.x + 30; break;
      case 'TILT UP': nextY = camOffset.y - 30; break;
      case 'TILT DOWN': nextY = camOffset.y + 30; break;
      case 'ZOOM IN': nextZoom = Math.min(3.5, Number((camOffset.zoom + 0.35).toFixed(2))); break;
      case 'ZOOM OUT': nextZoom = Math.max(1, Number((camOffset.zoom - 0.35).toFixed(2))); break;
      case 'RESET': nextX = 0; nextY = 0; nextZoom = 1; break;
    }

    setCamOffset({ x: nextX, y: nextY, zoom: nextZoom });

    if (activeCamId) {
      try {
        await cameraService.controlPtz(activeCamId, action, nextX, nextY, nextZoom);
      } catch (err) {
        console.error('Failed to send PTZ command to camera:', err);
      }
    }

    setTimeout(() => {
      setPtzAction('');
    }, 1000);
  };

  // Keyboard Shortcuts for PTZ Camera Controls
  useEffect(() => {
    if (!activeCamId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement as HTMLElement;
      if (activeEl && ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeEl.tagName)) {
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          handlePtz('PAN LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          handlePtz('PAN RIGHT');
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          handlePtz('TILT UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          handlePtz('TILT DOWN');
          break;
        case '+':
        case '=':
          e.preventDefault();
          handlePtz('ZOOM IN');
          break;
        case '-':
        case '_':
          e.preventDefault();
          handlePtz('ZOOM OUT');
          break;
        case 'r':
        case 'R':
        case 'Home':
          e.preventDefault();
          handlePtz('RESET');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeCamId, camOffset]);

  return (
    <div className="container-fluid px-3 px-lg-4 py-4">
      {/* Dynamic Modal CSS */}
       {/* Dynamic Modal CSS */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .live-stream-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(8px);
          z-index: 1050; display: flex; align-items: center; justify-content: center;
          padding: 1.5rem;
        }
        .live-stream-modal {
          background: #111827 !important;
          color: #ffffff !important; width: 100%;
          border-radius: 12px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.1);
        }
        .live-stream-modal h5, 
        .live-stream-modal h6, 
        .live-stream-modal span, 
        .live-stream-modal div {
          color: #ffffff;
        }
        .live-stream-modal .text-muted, 
        .live-stream-modal label {
          color: rgba(255, 255, 255, 0.6) !important;
        }
        .stream-viewscreen {
          background: #000; border-radius: 6px; position: relative;
          overflow: hidden; aspect-ratio: 16/9; display: flex;
          align-items: center; justify-content: center;
        }
        .stream-cam-placeholder {
          width: 100%; height: 100%; transition: transform 0.3s ease;
          background: linear-gradient(135deg, #1e293b, #0f172a);
          display: flex; flex-direction: column; align-items: center; justify-content: center;
        }
        .scanlines {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
          background-size: 100% 4px, 6px 100%; pointer-events: none;
        }
        .ptz-grid {
          display: grid; grid-template-columns: repeat(3, 46px);
          grid-gap: 8px; justify-content: center;
        }
        .ptz-btn {
          width: 46px; height: 46px; border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.06);
          color: #fff; display: flex; align-items: center; justify-content: center;
          transition: all 0.15s ease;
        }
        .ptz-btn:hover {
          background: var(--bs-primary, #2563eb); border-color: var(--bs-primary, #2563eb);
          transform: scale(1.05);
        }
        .ptz-btn:active {
          transform: scale(0.95);
        }
        @keyframes shutterFlash {
          0% { opacity: 0.95; }
          100% { opacity: 0; }
        }
        .shutter-flash-overlay {
          position: absolute; top: 0; left: 0; right: 0; bottom: 0;
          background: #ffffff; z-index: 100; pointer-events: none;
          animation: shutterFlash 0.35s ease-out forwards;
        }
        .text-blink {
          animation: blinkText 1.2s infinite alternate;
        }
        @keyframes blinkText {
          0% { opacity: 0.3; }
          100% { opacity: 1; }
        }
        .backdrop-blur {
          backdrop-filter: blur(8px);
        }
      `}} />

      <div className="page-heading">
        <div className="page-heading-copy">
          <span className="page-icon"><i className="bi bi-camera-video" aria-hidden="true" /></span>
          <div>
            <p className="eyebrow mb-1">Surveillance</p>
            <h1 className="h3 mb-0">Cameras</h1>
          </div>
        </div>
      </div>

      {/* Integrated Search & Filters Card */}
      <div className="card p-3 mb-4 bg-body border border-opacity-10 shadow-sm">
        <div className="row g-3 align-items-end">
          {/* Status Filter */}
          <div className="col-12 col-lg-5">
            <label className="form-label text-muted small fw-semibold">Filter by Status</label>
            <div className="d-flex flex-wrap gap-1">
              {['all', 'online', 'offline', 'error', 'maintenance'].map((s) => {
                const count = s === 'all'
                  ? cameras.length
                  : s === 'online'
                  ? cameras.filter((c) => {
                      const str = String(c.status).toLowerCase();
                      return str === 'online' || str === 'active';
                    }).length
                  : s === 'offline'
                  ? cameras.filter((c) => {
                      const str = String(c.status).toLowerCase();
                      return str !== 'online' && str !== 'active';
                    }).length
                  : cameras.filter((c) => String(c.status).toLowerCase() === s).length;

                return (
                  <button
                    key={s}
                    type="button"
                    className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => setFilter(s)}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Site Filter */}
          <div className="col-12 col-sm-4 col-lg-2">
            <label htmlFor="siteFilter" className="form-label text-muted small fw-semibold">Filter by Site</label>
            <select
              id="siteFilter"
              className="form-select form-select-sm"
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value)}
            >
              <option value="all">All Sites</option>
              {siteOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Chainage Filter */}
          <div className="col-12 col-sm-4 col-lg-3">
            <label htmlFor="chainageFilter" className="form-label text-muted small fw-semibold">Filter by Chainage</label>
            <select
              id="chainageFilter"
              className="form-select form-select-sm"
              value={selectedChainage}
              onChange={(e) => setSelectedChainage(e.target.value)}
            >
              <option value="all">All Chainages</option>
              {chainageOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Reset Button */}
          <div className="col-12 col-md-5 col-lg-2">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center gap-1.5"
              onClick={() => {
                setFilter('all');
                setSelectedSite('all');
                setSelectedChainage('all');
              }}
              disabled={filter === 'all' && selectedSite === 'all' && selectedChainage === 'all'}
            >
              {/* <i className="bi bi-x-circle" /> */}
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Left Column: Camera Cards Grid */}
        <div className="col-12 col-lg-8">
          <div className="row g-3">
            {loading ? (
              <div className="col-12 text-center py-5">
                <div className="spinner-border text-primary" role="status" />
                <p className="mt-2 text-muted">Loading camera feeds...</p>
              </div>
            ) : filtered.length > 0 ? (
              filtered.map((cam) => (
                <div key={cam.id} className="col-12 col-md-6">
                  <CameraCard camera={cam} onView={(id) => setActiveCamId(id)} onToggle={handleToggleCameraStatus} />
                </div>
              ))
            ) : (
              <div className="col-12 text-center py-5 border rounded bg-body-secondary text-muted">
                <i className="bi bi-camera-video-off fs-1 mb-2 d-block" />
                No cameras match the selected site/chainage filter criteria.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Camera Malfunction Diagnostic Card */}
        <div className="col-12 col-lg-4">
          <div className="card border border-opacity-10 shadow-sm bg-body">
            <div className="card-header bg-transparent border-bottom py-3 d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-clipboard2-pulse text-danger fs-5" />
                <h5 className="mb-0 fw-bold" style={{ fontSize: '0.95rem' }}>Camera Malfunction Log</h5>
              </div>
              <button
                type="button"
                className="btn btn-outline-danger btn-xs d-flex align-items-center gap-1 py-1 px-2"
                style={{ fontSize: '0.7rem' }}
                disabled={isGeneratingReport}
                onClick={handleGenerateReport}
              >
                {isGeneratingReport ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" style={{ width: '10px', height: '10px' }} />
                    Exporting...
                  </>
                ) : (
                  <>
                    <i className="bi bi-file-earmark-arrow-down" />
                    Export Report
                  </>
                )}
              </button>
            </div>
            <div className="card-body p-3">
              <p className="text-muted small mb-3">Diagnostic status log of recurring failures. High frequency alerts float to the top.</p>

              <div className="d-grid gap-3">
                {malfunctions.map((log) => (
                  <div key={log.id} className="p-3 rounded border border-danger border-opacity-10 bg-danger bg-opacity-10 position-relative">
                    <div className="d-flex justify-content-between align-items-start gap-2 mb-1">
                      <span className="fw-bold text-body-emphasis small" style={{ fontSize: '0.82rem' }}>{log.name}</span>
                      <span className="badge bg-danger-subtle text-danger border border-danger border-opacity-25 font-monospace" style={{ fontSize: '0.65rem' }}>
                        {log.frequency} Issues
                      </span>
                    </div>
                    <div className="text-muted mb-2" style={{ fontSize: '0.75rem' }}>
                      <i className="bi bi-clock me-1 text-danger" />
                      <strong>{log.lastTime}</strong>
                    </div>
                    <div className="text-secondary small border-top pt-1 mt-1 font-monospace" style={{ fontSize: '0.72rem' }}>
                      {log.issue}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification for Report Generation */}
      {showReportToast && (
        <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1100 }}>
          <div className="toast show align-items-center text-white bg-success border-0 shadow-lg" role="alert" aria-live="assertive" aria-atomic="true">
            <div className="d-flex">
              <div className="toast-body d-flex align-items-center gap-2">
                <i className="bi bi-check-circle-fill fs-5" />
                <span>Malfunction Diagnostic Report successfully generated and downloaded.</span>
              </div>
              <button type="button" className="btn-close btn-close-white me-2 m-auto" onClick={() => setShowReportToast(false)} aria-label="Close" />
            </div>
          </div>
        </div>
      )}

      {/* Action Success Toast */}
      {showActionToast && (
        <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1100 }}>
          <div className="toast show align-items-center text-white bg-dark border border-secondary shadow-lg animate-fade-in" role="alert">
            <div className="d-flex">
              <div className="toast-body d-flex align-items-center gap-2">
                {isRecording ? (
                  <i className="bi bi-record-circle-fill text-danger text-blink" />
                ) : (
                  <i className="bi bi-check-circle-fill text-success" />
                )}
                <span>{actionToastMsg}</span>
              </div>
              <button type="button" className="btn-close btn-close-white me-2 m-auto" onClick={() => setShowActionToast(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Stream Viewer Popup Modal */}
      {activeCamera && (() => {
        return (
          <div className="live-stream-overlay">
            <div
              className="live-stream-modal"
              style={{
                maxWidth: isExpanded ? '1140px' : '900px',
                transition: 'max-width 0.3s ease-in-out',
              }}
            >
              {/* Modal Header */}
              <div className="d-flex align-items-center justify-content-between p-3 border-bottom border-secondary">
                <div className="d-flex align-items-center gap-3 flex-wrap">
                  <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                    <i className="bi bi-broadcast text-danger" />
                    <span>Live Stream: {activeCamera.name}</span>
                  </h5>
                  {/* Switch Camera Dropdown */}
                  <div className="d-flex align-items-center gap-2">
                    <label htmlFor="camSelectModal" className="small text-muted mb-0 text-nowrap">Switch Cam:</label>
                    <select
                      id="camSelectModal"
                      className="form-select form-select-sm bg-dark text-white border-secondary"
                      style={{ minWidth: '180px' }}
                      value={activeCamera.id}
                      onChange={(e) => {
                        setActiveCamId(e.target.value);
                        setCamOffset({ x: 0, y: 0, zoom: 1 });
                        setIsExpanded(false);
                        setIsRecording(false);
                        setRecordingSeconds(0);
                        setStreamError(false);
                      }}
                    >
                      {cameras.filter(c => c.status === 'online').map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.type.toUpperCase()})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => {
                    setActiveCamId(null);
                    setIsExpanded(false);
                    setIsRecording(false);
                    setRecordingSeconds(0);
                  }}
                  aria-label="Close"
                />
              </div>

              {/* Modal Body */}
              <div className="p-3">
                <div className="row g-3">
                  {/* Viewscreen */}
                  <div className="col-12 col-lg-8">
                    <div className="stream-viewscreen">
                      {/* Photo Snapshot Shutter Flash */}
                      {shutterFlash && <div className="shutter-flash-overlay" />}

                      {/* Video Recording HUD Status */}
                      {isRecording && (
                        <div
                          className="position-absolute top-0 start-0 m-3 p-2 bg-dark bg-opacity-75 rounded border border-danger d-flex align-items-center gap-2 font-monospace text-danger small text-blink"
                          style={{ zIndex: 10 }}
                        >
                          <i className="bi bi-record-fill" />
                          <span>REC</span>
                          <span>{formatDuration(recordingSeconds)}</span>
                        </div>
                      )}

                      <div
                        className="stream-cam-placeholder position-relative overflow-hidden w-100 h-100"
                      >
                        {activeCamera.rtspUrl && (activeCamera.rtspUrl.startsWith('http://') || activeCamera.rtspUrl.startsWith('https://')) && !streamError ? (
                          <div className="position-relative w-100 h-100 d-flex align-items-center justify-content-center bg-black overflow-hidden">
                            <img
                              src={activeCamera.rtspUrl}
                              alt={activeCamera.name}
                              className="w-100 h-100 object-fit-cover"
                              style={{
                                transform: `translate(${camOffset.x}px, ${camOffset.y}px) scale(${camOffset.zoom})`,
                                transformOrigin: 'center center',
                                transition: 'transform 0.12s cubic-bezier(0.2, 0.8, 0.2, 1)',
                              }}
                              onError={() => setStreamError(true)}
                            />
                          </div>
                        ) : (
                          <div className="d-flex flex-column align-items-center justify-content-center p-4 h-100">
                            <i className="bi bi-camera-video fs-1 mb-2 opacity-50 text-info" />
                            <p className="fw-semibold text-uppercase tracking-wider opacity-75 mb-1">{activeCamera.type} Live Feed</p>
                            <code className="small text-white bg-dark bg-opacity-75 px-3 py-1.5 rounded border border-secondary mb-2">
                              {activeCamera.rtspUrl}
                            </code>
                            {streamError && (
                              <div className="badge bg-warning bg-opacity-20 text-warning border border-warning px-3 py-1 mt-1 d-flex align-items-center gap-1">
                                <i className="bi bi-exclamation-triangle-fill" /> Direct Feed Standby / Connection Retrying...
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="scanlines" />

                      {/* HUD Overlays */}
                      <div className="position-absolute top-0 start-0 p-3 text-success fw-bold font-monospace small">
                        LIVE • {activeCamera.status.toUpperCase()}
                      </div>
                      <div className="position-absolute top-0 end-0 p-3 text-white fw-bold font-monospace small">
                        {timestamp}
                      </div>
                      <div className="position-absolute bottom-0 start-0 p-3 text-white font-monospace small bg-dark bg-opacity-70 rounded-end">
                        Hz: 30 FPS | Res: 1920x1080 | Bitrate: {activeCamera.type === 'ptz' ? '4.8' : '3.2'} Mbps | PTZ: P {Math.round(camOffset.x / 2.5)}° / T {Math.round(-camOffset.y / 2.5)}° / Z {camOffset.zoom.toFixed(1)}x
                      </div>
                      {ptzAction && (
                        <div className="position-absolute bottom-0 end-0 p-3 text-warning fw-bold font-monospace small bg-black bg-opacity-70 rounded-start">
                          COMMAND: {ptzAction}
                        </div>
                      )}

                      {/* HUD Control Overlay Buttons */}
                      <div
                        className="position-absolute bottom-0 end-0 m-3 d-flex align-items-center gap-2 bg-dark bg-opacity-75 backdrop-blur px-3 py-1.5 rounded-pill border border-secondary border-opacity-50"
                        style={{ zIndex: 20 }}
                      >
                        {/* Video Record Option */}
                        <button
                          type="button"
                          className="btn btn-xs btn-link p-0 text-white border-0 text-decoration-none d-flex align-items-center gap-1"
                          onClick={() => handleToggleRecording(activeCamera.name)}
                          title={isRecording ? 'Stop Recording' : 'Start Recording'}
                        >
                          <i className={`bi ${isRecording ? 'bi-stop-circle-fill text-danger text-blink' : 'bi-record-circle text-white'}`} style={{ fontSize: '1rem' }} />
                        </button>
                        <span className="text-secondary opacity-50">|</span>

                        {/* Snapshot Option */}
                        <button
                          type="button"
                          className="btn btn-xs btn-link p-0 text-white border-0"
                          onClick={() => handleTakeSnapshot(activeCamera.name)}
                          title="Take Snapshot"
                        >
                          <i className="bi bi-camera" style={{ fontSize: '0.9rem' }} />
                        </button>
                        <span className="text-secondary opacity-50">|</span>

                        {/* Expand Option */}
                        <button
                          type="button"
                          className="btn btn-xs btn-link p-0 text-white border-0"
                          onClick={() => setIsExpanded(!isExpanded)}
                          title={isExpanded ? 'Collapse View' : 'Expand View'}
                        >
                          <i className={`bi ${isExpanded ? 'bi-fullscreen-exit' : 'bi-fullscreen'}`} style={{ fontSize: '0.85rem' }} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* PTZ Controls */}
                  <div className="col-12 col-lg-4 d-flex flex-column justify-content-between">
                    <div className="p-3 border border-secondary rounded" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <h6 className="fw-bold mb-3 border-bottom border-secondary pb-2">
                        <i className="bi bi-sliders me-2 text-primary" />PTZ Controller
                      </h6>

                      {/* Coordinates display */}
                      <div className="d-flex align-items-center justify-content-between mb-3 gap-2" style={{ fontSize: '11px' }}>
                        <div className="bg-dark bg-opacity-75 p-1.5 rounded border border-secondary text-center flex-grow-1">
                          <div className="small text-uppercase text-secondary fw-semibold" style={{ fontSize: '8px', letterSpacing: '0.3px' }}>Pan</div>
                          <div className="fw-bold text-success font-monospace" style={{ fontSize: '12px' }}>{Math.round(camOffset.x / 2.5)}°</div>
                        </div>
                        <div className="bg-dark bg-opacity-75 p-1.5 rounded border border-secondary text-center flex-grow-1">
                          <div className="small text-uppercase text-secondary fw-semibold" style={{ fontSize: '8px', letterSpacing: '0.3px' }}>Tilt</div>
                          <div className="fw-bold text-success font-monospace" style={{ fontSize: '12px' }}>{Math.round(-camOffset.y / 2.5)}°</div>
                        </div>
                        <div className="bg-dark bg-opacity-75 p-1.5 rounded border border-secondary text-center flex-grow-1">
                          <div className="small text-uppercase text-secondary fw-semibold" style={{ fontSize: '8px', letterSpacing: '0.3px' }}>Zoom</div>
                          <div className="fw-bold text-success font-monospace" style={{ fontSize: '12px' }}>{camOffset.zoom.toFixed(2)}x</div>
                        </div>
                      </div>

                      {/* Directional Pad */}
                      <div className="my-4">
                        <div className="ptz-grid">
                          {/* Row 1 */}
                          <div />
                          <button className="ptz-btn" title="Tilt Up" onClick={() => handlePtz('TILT UP')}>
                            <i className="bi bi-chevron-up" />
                          </button>
                          <div />

                          {/* Row 2 */}
                          <button className="ptz-btn" title="Pan Left" onClick={() => handlePtz('PAN LEFT')}>
                            <i className="bi bi-chevron-left" />
                          </button>
                          <button className="ptz-btn text-muted" title="Center" onClick={() => handlePtz('RESET')}>
                            <i className="bi bi-house" />
                          </button>
                          <button className="ptz-btn" title="Pan Right" onClick={() => handlePtz('PAN RIGHT')}>
                            <i className="bi bi-chevron-right" />
                          </button>

                          {/* Row 3 */}
                          <div />
                          <button className="ptz-btn" title="Tilt Down" onClick={() => handlePtz('TILT DOWN')}>
                            <i className="bi bi-chevron-down" />
                          </button>
                          <div />
                        </div>
                      </div>

                      {/* Zoom / Scale */}
                      <div className="d-flex justify-content-center gap-2 mt-3">
                        <button className="btn btn-sm btn-outline-light px-3" onClick={() => handlePtz('ZOOM IN')}>
                          <i className="bi bi-plus-circle me-1" />Zoom In
                        </button>
                        <button className="btn btn-sm btn-outline-light px-3" onClick={() => handlePtz('ZOOM OUT')}>
                          <i className="bi bi-dash-circle me-1" />Zoom Out
                        </button>
                      </div>
                    </div>

                    <div className="p-2 border border-secondary rounded text-muted small mt-2" style={{ background: 'rgba(255,255,255,0.02)' }}>
                      <i className="bi bi-info-circle me-2" />
                      Interactive PTZ controller moves camera stream coordinates and adjusts zoom scaling factors.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};