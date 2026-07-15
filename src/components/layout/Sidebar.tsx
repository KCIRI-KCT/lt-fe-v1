import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useApp } from '../../hooks/useApp';
import ltlogo from '../../assets/lt-logo.png';

export const Sidebar = () => {
  const { sidebar, closeMobileSidebar, user } = useApp();
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

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
          { label: 'System Health', path: '/health', icon: 'bi bi-heart-pulse' },
          {
            label: 'Camera',
            path: '/cameras',
            icon: 'bi bi-camera-video',
            children: [
              { label: 'All Cameras', path: '/cameras', icon: 'bi bi-card-list' },
              { label: 'Add Camera', path: '/cameras/create', icon: 'bi bi-plus-circle' },
              { label: 'Update Camera', path: '/cameras/edit', icon: 'bi bi-pencil' },
              { label: 'Remove Camera', path: '/cameras/delete', icon: 'bi bi-trash' },
            ]
          },
          {
            label: 'Project Management',
            path: '/projects',
            icon: 'bi bi-building',
            children: [
              { label: 'All Projects', path: '/projects', icon: 'bi bi-card-list' },
              { label: 'Add Project', path: '/projects/create', icon: 'bi bi-plus-circle' },
              { label: 'Update Project', path: '/projects/edit', icon: 'bi bi-pencil' },
              { label: 'Remove Project', path: '/projects/delete', icon: 'bi bi-trash' },
            ]
          },
          {
            label: 'User Create',
            path: '/users',
            icon: 'bi bi-people',
            children: [
              { label: 'All Users', path: '/users', icon: 'bi bi-card-list' },
              { label: 'Add User', path: '/users/create', icon: 'bi bi-person-plus' },
              { label: 'Update User', path: '/users/edit', icon: 'bi bi-pencil' },
              { label: 'Remove User', path: '/users/delete', icon: 'bi bi-trash' },
            ]
          },
          { label: 'Message', path: '/messages', icon: 'bi bi-chat-dots' }
        ];
      case 'project_manager':
        return [
          { label: 'Dashboard', path: '/health', icon: 'bi bi-speedometer2' },
          { label: 'Camera', path: '/cameras', icon: 'bi bi-camera-video' },
          { label: 'Alert', path: '/ai-monitoring', icon: 'bi bi-robot' },
          { label: 'Report', path: '/reports', icon: 'bi bi-file-earmark-bar-graph' },
          { label: 'Message', path: '/messages', icon: 'bi bi-chat-dots' }
        ];
      case 'site_supervisor':
        return [
          { label: 'Dashboard', path: '/health', icon: 'bi bi-speedometer2' },
          { label: 'Camera', path: '/cameras', icon: 'bi bi-camera-video' },
          { label: 'Hitl ppe', path: '/ai-monitoring', icon: 'bi bi-shield-check' },
          { label: 'Report', path: '/reports', icon: 'bi bi-file-earmark-bar-graph' },
          { label: 'Message', path: '/messages', icon: 'bi bi-chat-dots' }
        ];
      case 'site_engineer':
        return [
          { label: 'Dashboard', path: '/health', icon: 'bi bi-speedometer2' },
          { label: 'Camera', path: '/cameras', icon: 'bi bi-camera-video' },
          { label: 'Alert', path: '/ai-monitoring', icon: 'bi bi-robot' },
          { label: 'Report', path: '/reports', icon: 'bi bi-file-earmark-bar-graph' },
          { label: 'Message', path: '/messages', icon: 'bi bi-chat-dots' }
        ];
      case 'safety_manager':
        return [
          { label: 'Dashboard', path: '/health', icon: 'bi bi-speedometer2' },
          { label: 'Camera', path: '/cameras', icon: 'bi bi-camera-video' },
          { label: 'HITL - Notify', path: '/ai-monitoring', icon: 'bi bi-bell-fill' },
          { label: 'Report', path: '/reports', icon: 'bi bi-file-earmark-bar-graph' },
          { label: 'Message', path: '/messages', icon: 'bi bi-chat-dots' }
        ];
      case 'safety_officer':
        return [
          { label: 'Dashboard', path: '/health', icon: 'bi bi-speedometer2' },
          { label: 'Camera', path: '/cameras', icon: 'bi bi-camera-video' },
          { label: 'Hitl ppe', path: '/ai-monitoring', icon: 'bi bi-shield-check' },
          { label: 'Report', path: '/reports', icon: 'bi bi-file-earmark-bar-graph' },
          { label: 'Message', path: '/messages', icon: 'bi bi-chat-dots' }
        ];
      default:
        return [
          { label: 'Dashboard', path: '/health', icon: 'bi bi-speedometer2' },
          { label: 'Message', path: '/messages', icon: 'bi bi-chat-dots' }
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

  return (
    <>
      <div className="sidebar-backdrop" onClick={closeMobileSidebar} style={{ display: sidebar.open ? 'block' : 'none' }} />
      <aside className="admin-sidebar" id="adminSidebar" aria-label="Main navigation">
        <div className="sidebar-header">
          <NavLink className="brand-mark" to="/health" aria-label="AI Progress Monitor">
            <span style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', width: '100%' }}>
              <img style={{ width: '46px', height: '46px', borderRadius: '6px', objectFit: 'contain' }} src={ltlogo} alt="L&T" />
            </span>
          </NavLink>
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
                    onClick={() => toggleMenu(item.label)}
                  >
                    <div className="d-flex align-items-center gap-2">
                      <span className="nav-icon">
                        <i className={item.icon} aria-hidden="true" />
                      </span>
                      <span className="nav-text">{item.label}</span>
                    </div>
                    <span className="nav-arrow text-muted me-1 small">
                      <i className={`bi ${isMenuOpen ? 'bi-chevron-down' : 'bi-chevron-right'}`} />
                    </span>
                  </div>

                  {isMenuOpen && (
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

        {/* Static Session Activity Log displaying recent 3 activities */}
        <div className="sidebar-activity mt-auto p-3 border-top border-secondary border-opacity-10">
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
      </aside>
    </>
  );
};