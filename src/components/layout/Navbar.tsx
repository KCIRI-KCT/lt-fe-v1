import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../hooks/useApp';
import { MOCK_NOTIFICATIONS } from '../../services/mockData';
import kcirilogo from '../../assets/kciri_logo.png';
import tidcologo from '../../assets/tidco-logo.png';

export const Navbar = () => {
  const { toggleTheme, theme, user } = useApp();
  const nextTheme = theme === 'dark' ? 'light' : 'dark';
  const iconClass = theme === 'dark' ? 'bi bi-sun' : 'bi bi-moon-stars';
  const [currentTime, setCurrentTime] = useState<string>('');

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
        <Link to="/health" className="navbar-brand d-flex align-items-center me-3">
          <div className="d-flex align-items-center gap-2 border-end pe-3 me-3" style={{ height: '32px' }}>
            <img src={tidcologo} alt="TIDCO" style={{ height: '24px', objectFit: 'contain' }} />
            <span className="text-muted opacity-25" style={{ fontSize: '1.2rem', userSelect: 'none' }}>|</span>
            <img src={kcirilogo} alt="KCIRI" style={{ height: '24px', borderRadius: '4px', objectFit: 'contain' }} />
          </div>
          <span className="fw-bold d-none d-sm-inline text-uppercase tracking-wider text-primary" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}>AI Progress Monitor</span>
        </Link>


        <div className="navbar-actions ms-auto">
          {currentTime && (
            <div className="d-none d-md-flex align-items-center me-3 small text-muted font-monospace border-end pe-3" style={{ height: '24px' }}>
              <i className="bi bi-clock me-2 text-primary" />
              <span>{currentTime}</span>
            </div>
          )}
          <button
            className="icon-button theme-toggle"
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${nextTheme} mode`}
            title={`Switch to ${nextTheme} mode`}
          >
            <i className={iconClass} aria-hidden="true" />
          </button>

          <div className="dropdown">
            <button
              className="icon-button"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              aria-label="Notifications"
            >
              <span className="notification-dot" />
              <i className="bi bi-bell" aria-hidden="true" />
            </button>
            <div className="dropdown-menu dropdown-menu-end notification-menu">
              <div className="dropdown-header fw-bold text-body">Notifications</div>
              {MOCK_NOTIFICATIONS.map((n, i) => (
                <Link key={i} className="dropdown-item" to={n.path}>
                  <span className={`notification-title text-${n.variant}`}>{n.title}</span>
                  <span className="notification-time">{n.time}</span>
                </Link>
              ))}
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