import { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../hooks/useApp';
import { getNavItemsForRole } from '../../utils/navigation';


export const Sidebar = () => {
  const { sidebar, closeMobileSidebar, user } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const [sidebarTheme, setSidebarTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('sidebar-theme');
    return (saved as 'dark' | 'light') || 'dark'; // Default to dark blue
  });

  const toggleSidebarTheme = () => {
    const next = sidebarTheme === 'dark' ? 'light' : 'dark';
    setSidebarTheme(next);
    localStorage.setItem('sidebar-theme', next);
  };

  const handleNavClick = () => {
    closeMobileSidebar();
  };

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  // Define navigation config per role matching the reference table:
  const getNavItemsForRole = (role: string) => {
    switch (role) {
      case 'admin':
        return [
          { label: 'System Health', path: '/health', icon: 'bi bi-cpu-fill' },
          {
            label: 'Camera',
            path: '/cameras',
            icon: 'bi bi-camera-video-fill',
            children: [
              { label: 'All Cameras', path: '/cameras', icon: 'bi bi-card-list' },
              { label: 'Add Camera', path: '/cameras/create', icon: 'bi bi-plus-circle-fill' },
              { label: 'Update Camera', path: '/cameras/edit', icon: 'bi bi-pencil-fill' },
              { label: 'Remove Camera', path: '/cameras/delete', icon: 'bi bi-trash-fill' },
            ]
          },
          {
            label: 'Project Management',
            path: '/projects',
            icon: 'bi bi-building-fill',
            children: [
              { label: 'All Projects', path: '/projects', icon: 'bi bi-card-list' },
              { label: 'Add Project', path: '/projects/create', icon: 'bi bi-plus-circle-fill' },
              { label: 'Update Project', path: '/projects/edit', icon: 'bi bi-pencil-fill' },
              { label: 'Delete Request', path: '/projects/delete', icon: 'bi bi-trash-fill' },
            ]
          },
          {
            label: 'User Create',
            path: '/users',
            icon: 'bi bi-person-badge-fill',
            children: [
              { label: 'All Users', path: '/users', icon: 'bi bi-card-list' },
              { label: 'Add User', path: '/users/create', icon: 'bi bi-person-plus-fill' },
              { label: 'Update User', path: '/users/edit', icon: 'bi bi-pencil-fill' },
              { label: 'Remove User', path: '/users/delete', icon: 'bi bi-trash-fill' },
            ]
          },
          { label: 'Message', path: '/messages', icon: 'bi bi-chat-left-text-fill' }
        ];
      case 'project_manager':
        return [
          { label: 'Dashboard', path: '/project-manager', icon: 'bi bi-speedometer' },
          { label: 'Camera', path: '/cameras', icon: 'bi bi-camera-video-fill' },
          { label: 'Alert', path: '/ai-monitoring', icon: 'bi bi-robot' },
          { label: 'Report', path: '/reports', icon: 'bi bi-file-earmark-bar-graph-fill' },
          { label: 'Message', path: '/messages', icon: 'bi bi-chat-left-text-fill' }
        ];
      case 'site_supervisor':
        return [
          { label: 'Dashboard', path: '/health', icon: 'bi bi-speedometer' },
          { label: 'Camera', path: '/cameras', icon: 'bi bi-camera-video-fill' },
          { label: 'Hitl ppe', path: '/ai-monitoring', icon: 'bi bi-shield-fill-check' },
          { label: 'Report', path: '/reports', icon: 'bi bi-file-earmark-bar-graph-fill' },
          { label: 'Message', path: '/messages', icon: 'bi bi-chat-left-text-fill' }
        ];
      case 'site_engineer':
        return [
          { label: 'Dashboard', path: '/health', icon: 'bi bi-speedometer' },
          { label: 'Camera', path: '/cameras', icon: 'bi bi-camera-video-fill' },
          { label: 'Alert', path: '/ai-monitoring', icon: 'bi bi-robot' },
          { label: 'Report', path: '/reports', icon: 'bi bi-file-earmark-bar-graph-fill' },
          { label: 'Message', path: '/messages', icon: 'bi bi-chat-left-text-fill' }
        ];
      case 'safety_manager':
        return [
          { label: 'Dashboard', path: '/health', icon: 'bi bi-speedometer' },
          { label: 'Camera', path: '/cameras', icon: 'bi bi-camera-video-fill' },
          { label: 'HITL - Notify', path: '/ai-monitoring', icon: 'bi bi-bell-fill' },
          { label: 'Report', path: '/reports', icon: 'bi bi-file-earmark-bar-graph-fill' },
          { label: 'Message', path: '/messages', icon: 'bi bi-chat-left-text-fill' }
        ];
      case 'safety_officer':
        return [
          { label: 'Dashboard', path: '/health', icon: 'bi bi-speedometer' },
          { label: 'Camera', path: '/cameras', icon: 'bi bi-camera-video-fill' },
          { label: 'Hitl ppe', path: '/ai-monitoring', icon: 'bi bi-shield-fill-check' },
          { label: 'Report', path: '/reports', icon: 'bi bi-file-earmark-bar-graph-fill' },
          { label: 'Message', path: '/messages', icon: 'bi bi-chat-left-text-fill' }
        ];
      default:
        return [
          { label: 'Dashboard', path: '/health', icon: 'bi bi-speedometer' },
          { label: 'Message', path: '/messages', icon: 'bi bi-chat-left-text-fill' }
        ];
    }
  };

  const finalItems = getNavItemsForRole(user?.role || 'admin');

  // Automatically open dropdowns matching the current path
  useEffect(() => {
    const currentPath = location.pathname;
    const newOpenMenus = { ...openMenus };
    let updated = false;

    finalItems.forEach((item) => {
      if (item.children) {
        const isActiveParent = currentPath === item.path || item.children.some((child) => currentPath === child.path);
        if (isActiveParent && !openMenus[item.label]) {
          newOpenMenus[item.label] = true;
          updated = true;
        }
      }
    });

    if (updated) {
      setOpenMenus(newOpenMenus);
    }
  }, [location.pathname]);

  // Collapse submenus when sidebar mini mode is active
  useEffect(() => {
    if (sidebar.mini) {
      setOpenMenus({});
    }
  }, [sidebar.mini]);

  return (
    <>
      <div className="sidebar-backdrop" onClick={closeMobileSidebar} style={{ display: sidebar.open ? 'block' : 'none' }} />
      <aside className={`admin-sidebar sidebar-theme-${sidebarTheme}`} id="adminSidebar" aria-label="Main navigation">
        <div className="sidebar-header" style={{ padding: sidebar.mini ? '1.35rem 0.5rem' : '1.35rem 1.25rem 1.15rem' }}>
          <span style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', width: '100%' }}>
            <img
              style={{
                width: sidebar.mini ? '36px' : '46px',
                height: sidebar.mini ? '36px' : '46px',
                borderRadius: '6px',
                objectFit: 'contain',
                filter: sidebarTheme === 'dark' ? 'brightness(0) invert(1)' : 'none',
                transition: 'all 0.2s ease'
              }}
              src="/images/lt-logo.png"
              alt="L&T"
            />
          </span>
        </div>

        <nav className="sidebar-nav">
          {finalItems.map((item) => {
            const hasChildren = !!item.children && item.children.length > 0;
            const isMenuOpen = !!openMenus[item.label];

            if (hasChildren) {
              const currentPath = location.pathname;
              const isParentActive = currentPath === item.path || item.children?.some((child) => currentPath === child.path);

              return (
                <div key={item.path} className="sidebar-menu-group">
                  <div
                    className={`nav-link d-flex align-items-center justify-content-between ${isParentActive ? 'active' : ''}`}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => {
                      if (sidebar.mini) {
                        navigate(item.path);
                      } else {
                        toggleMenu(item.label);
                      }
                    }}
                  >
                    <div className="d-flex align-items-center gap-2">
                      <span className="nav-icon">
                        <i className={item.icon} aria-hidden="true" />
                      </span>
                      <span className="nav-text">{item.label}</span>
                    </div>
                    {!sidebar.mini && (
                      <span className="nav-arrow text-muted me-1 small">
                        <i className={`bi ${isMenuOpen ? 'bi-chevron-down' : 'bi-chevron-right'}`} />
                      </span>
                    )}
                  </div>

                  {isMenuOpen && !sidebar.mini && (
                    <div className="sidebar-submenu-list ps-3 mt-1 d-grid gap-1">
                      {item.children?.map((child) => (
                        <NavLink
                          key={child.path}
                          className={({ isActive }) => `nav-link py-2 min-height-0${isActive ? ' active' : ''}`}
                          style={{ minHeight: '38px', fontSize: '0.875rem' }}
                          to={child.path}
                          onClick={handleNavClick}
                        >
                          <span className="nav-icon" style={{ width: '22px', height: '22px', fontSize: '0.65rem' }}>
                            <i className={child.icon} aria-hidden="true" />
                          </span>
                          <span className="nav-text">{child.label}</span>
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <NavLink
                key={item.path}
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                to={item.path}
                end={item.path === '/dashboard'}
                onClick={handleNavClick}
              >
                <span className="nav-icon">
                  <i className={item.icon} aria-hidden="true" />
                </span>
                <span className="nav-text">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Theme Switcher Toggle */}
        <div className="sidebar-theme-toggle mt-auto p-3 border-top border-secondary border-opacity-10 d-flex align-items-center justify-content-between" style={{ minHeight: '57px' }}>
          {!sidebar.mini ? (
            <>
              <span className="small text-muted fw-semibold" style={{ fontSize: '0.75rem', color: 'var(--admin-sidebar-text)' }}>
                <i className={`bi ${sidebarTheme === 'dark' ? 'bi-moon-stars-fill' : 'bi-sun-fill'} me-2`} style={{ color: 'var(--admin-sidebar-icon)' }} />
                {sidebarTheme === 'dark' ? 'Dark Blue Sidebar' : 'White Sidebar'}
              </span>
              <div className="form-check form-switch mb-0">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="sidebarThemeToggle"
                  checked={sidebarTheme === 'dark'}
                  onChange={toggleSidebarTheme}
                  style={{ cursor: 'pointer' }}
                />
              </div>
            </>
          ) : (
            <button
              type="button"
              className="btn btn-sm btn-link p-0 text-muted mx-auto d-flex align-items-center justify-content-center"
              onClick={toggleSidebarTheme}
              title={sidebarTheme === 'dark' ? 'Switch to White Sidebar' : 'Switch to Dark Blue Sidebar'}
              style={{ color: 'var(--admin-sidebar-text)', width: '32px', height: '32px' }}
            >
              <i className={`bi ${sidebarTheme === 'dark' ? 'bi-moon-stars-fill' : 'bi-sun-fill'} fs-5`} style={{ color: 'var(--admin-sidebar-icon)' }} />
            </button>
          )}
        </div>

        {/* Static Session Activity Log displaying recent 3 activities */}
        {!sidebar.mini && (
          <div className="sidebar-activity p-3 border-top border-secondary border-opacity-10">
            <div className="fw-bold mb-2 small text-uppercase text-muted" style={{ fontSize: '0.68rem', letterSpacing: '0.5px' }}>
              <i className="bi bi-activity me-1 text-primary" />Session Activity
            </div>
            <div className="d-grid gap-2" style={{ fontSize: '0.72rem' }}>
              <div className="d-flex align-items-center gap-2 text-muted">
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                <span>Authorized Sign-in: Chrome</span>
              </div>
              <div className="d-flex align-items-center gap-2 text-muted">
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3b82f6', display: 'inline-block' }} />
                <span>Settings: 2FA Active</span>
              </div>
              <div className="d-flex align-items-center gap-2 text-muted">
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
                <span>Diagnostics Audited</span>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};