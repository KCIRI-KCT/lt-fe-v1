import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../hooks/useApp';
import { MOCK_NOTIFICATIONS } from '../../services/mockData';
import { Menu, Clock, Bell, VideoOff, TriangleAlert, Cpu, Volume2, VolumeX, Accessibility } from 'lucide-react';

function playNavbarChime() {
  if (localStorage.getItem('kciri_notif_muted') === 'true') {
    return;
  }
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const playTone = (freq: number, start: number, duration: number, gain: number) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.connect(g); g.connect(ctx.destination);
      osc.type = 'sine'; osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
      g.gain.setValueAtTime(0, ctx.currentTime + start);
      g.gain.linearRampToValueAtTime(gain, ctx.currentTime + start + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
      osc.start(ctx.currentTime + start); osc.stop(ctx.currentTime + start + duration);
    };
    playTone(523, 0, 0.18, 0.3); playTone(659, 0.14, 0.22, 0.22);
  } catch { /* silent */ }
}


export const Navbar = () => {
  const { user, toggleSidebar } = useApp();
  const [currentTime, setCurrentTime] = useState<string>('');
  const [bellShake, setBellShake] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);
  const [isMuted, setIsMuted] = useState(() => localStorage.getItem('kciri_notif_muted') === 'true');
  const poolIdx = useRef(0);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      localStorage.setItem('kciri_notif_muted', String(next));
      window.dispatchEvent(new Event('storage'));
      return next;
    });
  }, []);

  const [textSize, setTextSize] = useState<string>(() => localStorage.getItem('kciri_a11y_text') || 'normal');
  const [contrast, setContrast] = useState<string>(() => localStorage.getItem('kciri_a11y_contrast') || 'default');

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

  const triggerNavNotif = useCallback(() => {
    setBellShake(true);
    setTimeout(() => setBellShake(false), 800);
    setUnreadCount(c => c + 1);
    playNavbarChime();
  }, []);

  useEffect(() => {
    const handleNotifEvent = (e: Event) => {
      triggerNavNotif();
    };

    const syncMute = () => {
      setIsMuted(localStorage.getItem('kciri_notif_muted') === 'true');
    };

    window.addEventListener('storage', syncMute);
    window.addEventListener('new-app-notification', handleNotifEvent);
    return () => {
      window.removeEventListener('storage', syncMute);
      window.removeEventListener('new-app-notification', handleNotifEvent);
    };
  }, [triggerNavNotif]);

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
        <span className="fw-bold d-none d-sm-inline text-uppercase tracking-wider text-primary" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}>L&T Construction Monitoring</span>


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
            title={isMuted ? "Unmute sound" : "Mute sound"}
            aria-label={isMuted ? "Unmute sound" : "Mute sound"}
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
              <Accessibility size={18} />
            </button>
            <div className="dropdown-menu dropdown-menu-end p-3 shadow-lg border-0" style={{ width: '280px', borderRadius: '12px', background: 'var(--admin-surface, #ffffff)', color: 'var(--admin-text, #1f2933)' }}>
              <div className="dropdown-header fw-bold border-bottom pb-2 mb-2 px-0 d-flex align-items-center gap-2" style={{ color: 'var(--admin-text, #1f2933)' }}>
                <Accessibility size={16} className="text-primary" />
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

          <div className="dropdown">
            <button
              className="icon-button d-flex align-items-center justify-content-center position-relative"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              aria-label="Notifications"
              onClick={() => setUnreadCount(0)}
            >
              {/* Pulsing dot */}
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
              {/* Unread count badge */}
              {unreadCount > 0 && (
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
              )}
              <span className={bellShake ? 'bell-shake' : ''}>
                <Bell size={18} />
              </span>
            </button>
            <div className="dropdown-menu dropdown-menu-end notification-menu p-3" style={{ width: '320px', maxHeight: '420px', overflowY: 'auto' }}>
              <div className="dropdown-header fw-bold text-body border-bottom pb-2 mb-2 px-0">Notifications</div>
              {user?.role === 'admin' ? (
                <div className="d-grid gap-3">
                  <div>
                    <span className="small text-danger fw-bold d-flex align-items-center gap-1.5 mb-1" style={{ fontSize: '0.72rem', letterSpacing: '0.3px' }}>
                      <VideoOff size={12} /> CAMERA FAILURES
                    </span>
                    <div className="d-grid gap-1.5 ps-1">
                      <div className="py-1" style={{ fontSize: '0.78rem' }}>
                        <div className="text-body fw-medium">CAM-204 Stream Disconnected</div>
                        <small className="text-muted">10m ago • Highway Zone B</small>
                      </div>
                      <div className="py-1" style={{ fontSize: '0.78rem' }}>
                        <div className="text-body fw-medium">CAM-105 High packet drop (22%)</div>
                        <small className="text-muted">30m ago • Entrance Gate</small>
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="small text-warning fw-bold d-flex align-items-center gap-1.5 mb-1" style={{ fontSize: '0.72rem', letterSpacing: '0.3px' }}>
                      <TriangleAlert size={12} /> NETWORK FAILURES
                    </span>
                    <div className="d-grid gap-1.5 ps-1">
                      <div className="py-1" style={{ fontSize: '0.78rem' }}>
                        <div className="text-body fw-medium">Gateway Node #2 Ping Failure</div>
                        <small className="text-muted">5m ago • Route Gateway</small>
                      </div>
                      <div className="py-1" style={{ fontSize: '0.78rem' }}>
                        <div className="text-body fw-medium">DNS 2 resolution latency high</div>
                        <small className="text-muted">1h ago • Secondary Server</small>
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="small text-info fw-bold d-flex align-items-center gap-1.5 mb-1" style={{ fontSize: '0.72rem', letterSpacing: '0.3px' }}>
                      <Cpu size={12} /> SYSTEM MALFUNCTIONS
                    </span>
                    <div className="d-grid gap-1.5 ps-1">
                      <div className="py-1" style={{ fontSize: '0.78rem' }}>
                        <div className="text-body fw-medium">EDGE-02 core temperature high (82°C)</div>
                        <small className="text-muted">20m ago • Processing Box</small>
                      </div>
                      <div className="py-1" style={{ fontSize: '0.78rem' }}>
                        <div className="text-body fw-medium">FastAPI local socket overflow</div>
                        <small className="text-muted">2h ago • Main Server</small>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="d-grid gap-2">
                  {MOCK_NOTIFICATIONS.map((n, i) => (
                    <Link key={i} className="dropdown-item py-1 px-2 rounded hover-bg-light" to={n.path} style={{ fontSize: '0.8rem' }}>
                      <div className={`fw-medium text-${n.variant}`}>{n.title}</div>
                      <small className="text-muted d-block mt-0.5">{n.time}</small>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

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