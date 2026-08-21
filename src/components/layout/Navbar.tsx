import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../hooks/useApp';
import { safetyService } from '../../services/safetyService';
import { cameraService } from '../../services/cameraService';
import { Menu, Clock, Bell, Volume2, VolumeX, PersonStanding } from 'lucide-react';

function playNavbarChime() {
  if (localStorage.getItem('kciri_notif_muted') === 'true') {
    return;
  }
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioContextClass();
    const playTone = (freq: number, start: number, duration: number, gain: number) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.connect(g);
      g.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
      g.gain.setValueAtTime(0, ctx.currentTime + start);
      g.gain.linearRampToValueAtTime(gain, ctx.currentTime + start + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    };
    playTone(523, 0, 0.18, 0.3);
    playTone(659, 0.14, 0.22, 0.22);
  } catch {
    /* silent fallback */
  }
}

export const Navbar = () => {
  const { user, toggleSidebar } = useApp();
  const [currentTime, setCurrentTime] = useState<string>('');
  const [bellShake, setBellShake] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMuted, setIsMuted] = useState(() => localStorage.getItem('kciri_notif_muted') === 'true');
  const [liveNotifications, setLiveNotifications] = useState<Array<{
    id: string;
    title: string;
    description: string;
    time: string;
    variant: 'danger' | 'warning' | 'primary' | 'info';
    path: string;
    category: 'camera' | 'ai_alert' | 'system';
  }>>([]);

  const [clearedIds, setClearedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('kciri_cleared_notifs');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Timestamp (ms) of last "Clear All" — notifications older than this are hidden
  const [clearedAt, setClearedAt] = useState<number>(() => {
    const saved = localStorage.getItem('kciri_cleared_at');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [textSize, setTextSize] = useState<string>(() => localStorage.getItem('kciri_a11y_text') || 'normal');
  const [contrast, setContrast] = useState<string>(() => localStorage.getItem('kciri_a11y_contrast') || 'default');

  const knownAlertIdsRef = useRef<Set<string>>(new Set());
  const isFirstLoadRef = useRef(true);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      localStorage.setItem('kciri_notif_muted', String(next));
      window.dispatchEvent(new Event('storage'));
      return next;
    });
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('a11y-text-large', 'a11y-text-xl');
    if (textSize === 'large') {
      root.classList.add('a11y-text-large');
    } else if (textSize === 'xl') {
      root.classList.add('a11y-text-xl');
    }
    localStorage.setItem('kciri_a11y_text', textSize);
  }, [textSize]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('a11y-high-contrast', 'a11y-grayscale');
    if (contrast === 'high') {
      root.classList.add('a11y-high-contrast');
    } else if (contrast === 'grayscale') {
      root.classList.add('a11y-grayscale');
    }
    localStorage.setItem('kciri_a11y_contrast', contrast);
  }, [contrast]);

  const handleTextSizeChange = (size: string) => setTextSize(size);
  const handleContrastChange = (c: string) => setContrast(c);
  const resetAccessibility = () => {
    setTextSize('normal');
    setContrast('default');
  };

  // Fetch real notifications from camera and AI alerts (10.1.150.142:8000/api/ai-alerts)
  const fetchLiveNotifications = useCallback(async () => {
    try {
      const [alerts, cameras] = await Promise.allSettled([
        safetyService.getAIAlerts(),
        cameraService.getCameras(),
      ]);

      const notifs: Array<{
        id: string;
        title: string;
        description: string;
        time: string;
        variant: 'danger' | 'warning' | 'primary' | 'info';
        path: string;
        category: 'camera' | 'ai_alert' | 'system';
      }> = [];

      let hasNewDetection = false;

      // 1. Live AI Alerts from backend
      if (alerts.status === 'fulfilled' && Array.isArray(alerts.value)) {
        alerts.value.slice(0, 15).forEach((alt) => {
          if (clearedIds.has(alt.id)) return;
          // Suppress alerts that existed before the last "Clear All"
          if (clearedAt > 0 && alt.timestamp) {
            const alertMs = new Date(alt.timestamp).getTime();
            if (alertMs <= clearedAt) return;
          }
          if (!isFirstLoadRef.current && !knownAlertIdsRef.current.has(alt.id)) {
            hasNewDetection = true;
          }
          knownAlertIdsRef.current.add(alt.id);

          const isCritical = alt.severity === 'critical' || alt.severity === 'high';
          const timeStr = alt.timestamp ? new Date(alt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live';

          notifs.push({
            id: alt.id,
            title: alt.description || `${alt.type.replace(/_/g, ' ').toUpperCase()} Violation`,
            description: `${alt.cameraName || 'Camera Feed'} • ${alt.siteName || 'Site Segment'}`,
            time: timeStr,
            variant: isCritical ? 'danger' : 'warning',
            path: '/ai-monitoring',
            category: 'ai_alert',
          });
        });
      }

      // 2. Camera Feeds & Offline Disconnects
      if (cameras.status === 'fulfilled' && Array.isArray(cameras.value)) {
        cameras.value.forEach((cam) => {
          const camId = `cam-stat-${cam.id}`;
          if (clearedIds.has(camId)) return;

          const isOffline = cam.status === 'offline' || String(cam.status) === 'inactive' || cam.status === 'error';
          if (isOffline) {
            notifs.push({
              id: camId,
              title: `${cam.name} Stream Disconnected`,
              description: `${cam.location || cam.siteName || 'Corridor Zone'} (Offline Feed)`,
              time: 'Live',
              variant: 'danger',
              path: '/cameras',
              category: 'camera',
            });
          }
        });
      }

      setLiveNotifications(notifs);
      setUnreadCount(notifs.length);

      if (hasNewDetection) {
        setBellShake(true);
        setTimeout(() => setBellShake(false), 800);
        playNavbarChime();
      }

      isFirstLoadRef.current = false;
    } catch {
      // Fallback gracefully
    }
  }, [clearedIds, clearedAt]);

  useEffect(() => {
    fetchLiveNotifications();
    const interval = setInterval(fetchLiveNotifications, 15000);
    return () => clearInterval(interval);
  }, [fetchLiveNotifications]);

  const handleClearAll = () => {
    const now = Date.now();
    const allCurrentIds = new Set(liveNotifications.map((n) => n.id));
    // Save individual IDs
    setClearedIds((prev) => {
      const merged = new Set([...prev, ...allCurrentIds]);
      try {
        localStorage.setItem('kciri_cleared_notifs', JSON.stringify([...merged]));
      } catch {
        // storage error ignored
      }
      return merged;
    });
    // Save "cleared at" timestamp so re-polled alerts older than this are suppressed
    setClearedAt(now);
    try {
      localStorage.setItem('kciri_cleared_at', String(now));
    } catch {
      // storage error ignored
    }
    setLiveNotifications([]);
    setUnreadCount(0);
  };

  useEffect(() => {
    const syncMute = () => {
      setIsMuted(localStorage.getItem('kciri_notif_muted') === 'true');
    };
    window.addEventListener('storage', syncMute);
    return () => window.removeEventListener('storage', syncMute);
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const date = new Date();
      let hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      const ampm = hours >= 12 ? 'pm' : 'am';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const formatted = `${String(hours).padStart(2, '0')}:${minutes}:${seconds} ${ampm}, ${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
      setCurrentTime(formatted);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <nav className="navbar admin-navbar navbar-expand bg-white">
      <div className="container-fluid px-3 px-lg-4">
        <button
          className="btn btn-sm btn-link text-body me-2 border-0 p-0 d-flex align-items-center justify-content-center"
          type="button"
          onClick={toggleSidebar}
          aria-label="Toggle Sidebar"
          title="Toggle Sidebar"
        >
          <Menu size={24} />
        </button>

        <div className="d-flex align-items-center gap-2 border-end pe-3 me-3" style={{ height: '32px' }}>
          <img src="/images/tidco-logo.png" alt="TIDCO" style={{ height: '24px', objectFit: 'contain' }} />
          <span className="text-muted opacity-25" style={{ fontSize: '1.2rem', userSelect: 'none' }}>|</span>
          <img src="/images/kciri_logo.png" alt="KCIRI" style={{ height: '24px', borderRadius: '4px', objectFit: 'contain' }} />
        </div>
        <span className="fw-bold d-none d-sm-inline text-uppercase tracking-wider text-primary" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}>
          L&T Construction Monitoring
        </span>

        <div className="navbar-actions ms-auto d-flex align-items-center gap-2">
          {currentTime && (
            <div className="d-none d-md-flex align-items-center me-2 small text-muted font-monospace border-end pe-3 gap-2" style={{ height: '24px' }}>
              <Clock size={16} className="text-primary" />
              <span>{currentTime}</span>
            </div>
          )}

          {/* Mute/Unmute Audio Alert Chime Toggle */}
          <button
            className="icon-button d-flex align-items-center justify-content-center text-muted"
            style={{ border: 'none', background: 'transparent' }}
            type="button"
            onClick={toggleMute}
            title={isMuted ? 'Unmute sound' : 'Mute sound'}
            aria-label={isMuted ? 'Unmute sound' : 'Mute sound'}
          >
            {isMuted ? <VolumeX size={18} className="text-danger" /> : <Volume2 size={18} className="text-success" />}
          </button>

          {/* Accessibility Center Dropdown */}
          <div className="dropdown">
            <button
              className="icon-button d-flex align-items-center justify-content-center text-muted"
              style={{ border: 'none', background: 'transparent' }}
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              title="Accessibility Center"
              aria-label="Accessibility Center"
            >
              <PersonStanding size={18} />
            </button>
            <div className="dropdown-menu dropdown-menu-end p-3 shadow-lg border-0" style={{ width: '280px', borderRadius: '12px', background: 'var(--admin-surface, #ffffff)', color: 'var(--admin-text, #1f2933)' }}>
              <div className="dropdown-header fw-bold border-bottom pb-2 mb-2 px-0 d-flex align-items-center gap-2" style={{ color: 'var(--admin-text, #1f2933)' }}>
                <PersonStanding size={16} className="text-primary" />
                <span>Accessibility Center</span>
              </div>

              {/* Text Size Controls */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted mb-1.5">Text Size</label>
                <div className="d-flex gap-1">
                  <button
                    className={`btn btn-xs flex-grow-1 py-1 px-1.5 border small ${textSize === 'normal' ? 'btn-primary' : 'btn-white bg-white text-dark'}`}
                    onClick={() => handleTextSizeChange('normal')}
                    style={{ fontSize: '11px' }}
                  >
                    Normal
                  </button>
                  <button
                    className={`btn btn-xs flex-grow-1 py-1 px-1.5 border small ${textSize === 'large' ? 'btn-primary' : 'btn-white bg-white text-dark'}`}
                    onClick={() => handleTextSizeChange('large')}
                    style={{ fontSize: '11px' }}
                  >
                    Large
                  </button>
                  <button
                    className={`btn btn-xs flex-grow-1 py-1 px-1.5 border small ${textSize === 'xl' ? 'btn-primary' : 'btn-white bg-white text-dark'}`}
                    onClick={() => handleTextSizeChange('xl')}
                    style={{ fontSize: '11px' }}
                  >
                    X-Large
                  </button>
                </div>
              </div>

              {/* Contrast / Color Theme Settings */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted mb-1.5">Contrast & Filters</label>
                <div className="d-grid gap-1.5">
                  <button
                    className={`btn btn-sm text-start py-1 px-2 border d-flex align-items-center justify-content-between ${contrast === 'default' ? 'btn-primary' : 'btn-white bg-white text-dark'}`}
                    onClick={() => handleContrastChange('default')}
                  >
                    <span style={{ fontSize: '12px' }}>Default Theme</span>
                    <i className="bi bi-circle-half" />
                  </button>
                  <button
                    className={`btn btn-sm text-start py-1 px-2 border d-flex align-items-center justify-content-between ${contrast === 'high' ? 'btn-primary' : 'btn-white bg-white text-dark'}`}
                    onClick={() => handleContrastChange('high')}
                  >
                    <span style={{ fontSize: '12px' }}>High Contrast</span>
                    <i className="bi bi-contrast" />
                  </button>
                  <button
                    className={`btn btn-sm text-start py-1 px-2 border d-flex align-items-center justify-content-between ${contrast === 'grayscale' ? 'btn-primary' : 'btn-white bg-white text-dark'}`}
                    onClick={() => handleContrastChange('grayscale')}
                  >
                    <span style={{ fontSize: '12px' }}>Grayscale Filter</span>
                    <i className="bi bi-eye-slash-fill" />
                  </button>
                </div>
              </div>

              {/* Reset Button */}
              <div className="pt-2 border-top">
                <button
                  className="btn btn-sm btn-outline-danger w-100 py-1"
                  onClick={resetAccessibility}
                  style={{ fontSize: '12px' }}
                >
                  Reset to Default
                </button>
              </div>
            </div>
          </div>

          {/* Notifications Dropdown */}
          <div className="dropdown">
            <button
              className="icon-button d-flex align-items-center justify-content-center position-relative"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              aria-label="Notifications"
              onClick={() => setUnreadCount(0)}
            >
              {unreadCount > 0 && (
                <>
                  <span
                    className="notification-dot notification-dot-pulse"
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      background: '#dc2626',
                      width: '9px',
                      height: '9px',
                      borderRadius: '50%',
                      border: '1.5px solid #fff',
                    }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      top: '-2px',
                      right: '-4px',
                      background: '#dc2626',
                      color: '#fff',
                      fontSize: '9px',
                      fontWeight: 700,
                      borderRadius: '10px',
                      padding: '1px 4px',
                      lineHeight: 1.4,
                      minWidth: '16px',
                      textAlign: 'center',
                      border: '1.5px solid #fff',
                    }}
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                </>
              )}
              <span className={bellShake ? 'bell-shake' : ''}>
                <Bell size={18} />
              </span>
            </button>
            <div className="dropdown-menu dropdown-menu-end notification-menu p-3 shadow-lg" style={{ width: '340px', maxHeight: '440px', overflowY: 'auto', borderRadius: '12px' }}>
              <div className="d-flex align-items-center justify-content-between border-bottom pb-2 mb-2 px-0">
                <span className="dropdown-header fw-bold text-body p-0 m-0">Notifications</span>
                {liveNotifications.length > 0 && (
                  <button
                    className="btn btn-link btn-xs text-primary p-0 text-decoration-none fw-semibold"
                    style={{ fontSize: '11.5px' }}
                    onClick={handleClearAll}
                  >
                    Clear all
                  </button>
                )}
              </div>

              {liveNotifications.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <Bell size={24} className="opacity-25 mb-2 d-block mx-auto" />
                  <div className="small fw-semibold">No new notifications</div>
                  <div className="text-muted" style={{ fontSize: '11px' }}>Live feed from cameras and AI alerts will appear here</div>
                </div>
              ) : (
                <div className="d-grid gap-2">
                  {liveNotifications.map((n) => (
                    <Link
                      key={n.id}
                      className="dropdown-item py-1.5 px-2 rounded hover-bg-light border-bottom border-light text-wrap"
                      to={n.path}
                      style={{ fontSize: '0.8rem' }}
                    >
                      <div className="d-flex align-items-start justify-content-between gap-1">
                        <div className={`fw-semibold text-${n.variant} text-truncate`} style={{ maxWidth: '210px' }}>
                          {n.title}
                        </div>
                        <span className="badge bg-light text-muted font-monospace" style={{ fontSize: '9.5px' }}>
                          {n.time}
                        </span>
                      </div>
                      <small className="text-muted d-block mt-0.5" style={{ fontSize: '11px' }}>
                        {n.description}
                      </small>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* User Profile Dropdown */}
          <div className="dropdown">
            <button
              className="profile-button dropdown-toggle"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <img
                className="avatar-img avatar-sm"
                src={user.avatar}
                alt={user.name}
              />
              <span className="profile-name d-none d-sm-inline">{user.name}</span>
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li>
                <span className="dropdown-item-text small text-muted">{user.role.replace(/_/g, ' ')}</span>
              </li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <Link className="dropdown-item" to="/profile">
                  Profile
                </Link>
              </li>
              <li>
                <Link className="dropdown-item" to="/settings">
                  Account settings
                </Link>
              </li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <Link className="dropdown-item" to="/login">
                  Sign out
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};