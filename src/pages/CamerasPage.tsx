import { useState, useEffect } from 'react';
import { CameraCard } from '../components/cards/CameraCard';
import { MOCK_CAMERAS } from '../services/mockData';

export const CamerasPage = () => {
  const [filter, setFilter] = useState<string>('all');
  const [activeCamId, setActiveCamId] = useState<string | null>(null);
  const [ptzAction, setPtzAction] = useState<string>('');
  const [camOffset, setCamOffset] = useState({ x: 0, y: 0, zoom: 1 });
  const [timestamp, setTimestamp] = useState<string>('');

  const filtered = MOCK_CAMERAS.filter((c) => filter === 'all' || c.status === filter);
  const activeCamera = MOCK_CAMERAS.find((c) => c.id === activeCamId);

  // Update live stream timestamp
  useEffect(() => {
    if (!activeCamId) return;
    const interval = setInterval(() => {
      setTimestamp(new Date().toLocaleString());
    }, 1000);
    return () => clearInterval(interval);
  }, [activeCamId]);

  // Handle PTZ action trigger
  const handlePtz = (action: string) => {
    setPtzAction(action);
    setCamOffset((prev) => {
      switch (action) {
        case 'PAN LEFT': return { ...prev, x: prev.x - 10 };
        case 'PAN RIGHT': return { ...prev, x: prev.x + 10 };
        case 'TILT UP': return { ...prev, y: prev.y - 10 };
        case 'TILT DOWN': return { ...prev, y: prev.y + 10 };
        case 'ZOOM IN': return { ...prev, zoom: Math.min(3, prev.zoom + 0.15) };
        case 'ZOOM OUT': return { ...prev, zoom: Math.max(1, prev.zoom - 0.15) };
        case 'RESET': return { x: 0, y: 0, zoom: 1 };
        default: return prev;
      }
    });

    setTimeout(() => {
      setPtzAction('');
    }, 1000);
  };

  return (
    <div className="container-fluid px-3 px-lg-4 py-4">
      {/* Dynamic Modal CSS */}
      <style dangerouslySetInnerHTML={{ __html: `
        .live-stream-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(8px);
          z-index: 1050; display: flex; align-items: center; justify-content: center;
          padding: 1.5rem;
        }
        .live-stream-modal {
          background: var(--admin-sidebar-soft, #1f2937);
          color: #ffffff; width: 100%; max-width: 900px;
          border-radius: 12px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.1);
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

      <div className="d-flex flex-wrap gap-1 mb-3">
        {['all', 'online', 'offline', 'error', 'maintenance'].map((s) => (
          <button
            key={s}
            className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setFilter(s)}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)} ({s === 'all' ? MOCK_CAMERAS.length : MOCK_CAMERAS.filter((c) => c.status === s).length})
          </button>
        ))}
      </div>

      <div className="row g-3">
        {filtered.map((camera) => (
          <div key={camera.id} className="col-12 col-sm-6 col-xl-4 col-xxl-3">
            <CameraCard camera={camera} onView={(id) => setActiveCamId(id)} />
          </div>
        ))}
      </div>

      {/* Stream Viewer Popup Modal */}
      {activeCamera && (
        <div className="live-stream-overlay">
          <div className="live-stream-modal">
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
                    }}
                  >
                    {MOCK_CAMERAS.filter(c => c.status === 'online').map((c) => (
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
                onClick={() => setActiveCamId(null)}
                aria-label="Close"
              />
            </div>

            {/* Modal Body */}
            <div className="p-3">
              <div className="row g-3">
                {/* Viewscreen */}
                <div className="col-12 col-lg-8">
                  <div className="stream-viewscreen">
                    <div
                      className="stream-cam-placeholder"
                      style={{
                        transform: `translate(${camOffset.x}px, ${camOffset.y}px) scale(${camOffset.zoom})`,
                      }}
                    >
                      <i className="bi bi-camera-video fs-1 mb-2 opacity-50" />
                      <p className="fw-semibold text-uppercase tracking-wider opacity-75">{activeCamera.type} Feed</p>
                      <code className="small text-muted bg-dark bg-opacity-50 px-2 py-1 rounded">{activeCamera.rtspUrl}</code>
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
                      Hz: 30 FPS | Res: 1920x1080 | Bitrate: {activeCamera.type === 'ptz' ? '4.8' : '3.2'} Mbps
                    </div>
                    {ptzAction && (
                      <div className="position-absolute bottom-0 end-0 p-3 text-warning fw-bold font-monospace small bg-black bg-opacity-70 rounded-start">
                        COMMAND: {ptzAction}
                      </div>
                    )}
                  </div>
                </div>

                {/* Controls */}
                <div className="col-12 col-lg-4 d-flex flex-column justify-content-between">
                  <div className="panel bg-dark bg-opacity-50 border-secondary p-3">
                    <h6 className="fw-bold mb-3 border-bottom border-secondary pb-2">
                      <i className="bi bi-sliders me-2 text-primary" />PTZ Controller
                    </h6>

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

                  <div className="panel bg-dark bg-opacity-20 border-secondary p-2 text-muted small mt-2">
                    <i className="bi bi-info-circle me-2" />
                    Interactive PTZ controller moves simulated workspace coordinates and adjusts zoom scaling factors.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};