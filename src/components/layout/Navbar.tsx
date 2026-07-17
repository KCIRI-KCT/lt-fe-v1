import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../hooks/useApp';
import { MOCK_NOTIFICATIONS } from '../../services/mockData';
import { Menu, Clock, Bell, VideoOff, TriangleAlert, Cpu } from 'lucide-react';


export const Navbar = () => {
  const { user, toggleSidebar } = useApp();
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


        <div className="navbar-actions ms-auto">
          {currentTime && (
            <div className="d-none d-md-flex align-items-center me-3 small text-muted font-monospace border-end pe-3 gap-2" style={{ height: '24px' }}>
              <Clock size={16} className="text-primary" />
              <span>{currentTime}</span>
            </div>
          )}

          <div className="dropdown">
            <button
              className="icon-button d-flex align-items-center justify-content-center"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              aria-label="Notifications"
            >
              <span className="notification-dot" />
              <Bell size={18} />
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