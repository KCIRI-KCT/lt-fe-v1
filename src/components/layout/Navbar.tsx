import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../hooks/useApp';
import { NotificationBell } from './NotificationBell';
import { Menu, Clock, Volume2, VolumeX, PersonStanding } from 'lucide-react';

export const Navbar = () => {
  const { user, toggleSidebar } = useApp();
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isMuted, setIsMuted] = useState(() => localStorage.getItem('kciri_notif_muted') === 'true');

  const [textSize, setTextSize] = useState<string>(() => localStorage.getItem('kciri_a11y_text') || 'normal');
  const [contrast, setContrast] = useState<string>(() => localStorage.getItem('kciri_a11y_contrast') || 'default');

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
          <img src="/images/lt-logo.png" alt="L&T" style={{ height: '24px', borderRadius: '4px', objectFit: 'contain' }} />
          <span className="text-muted opacity-25" style={{ fontSize: '1.2rem', userSelect: 'none' }}>|</span>
          <img src="/images/kciri_logo.png" alt="KCIRI" style={{ height: '24px', borderRadius: '4px', objectFit: 'contain' }} />
        </div>
        <span className="fw-bold d-none d-sm-inline text-uppercase tracking-wider text-primary" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}>
          SITEAENSE AI CONSTRUCTION PLATFORM
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

          {/* Notifications Bell — Camera Alerts + System streams */}
          <NotificationBell />

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