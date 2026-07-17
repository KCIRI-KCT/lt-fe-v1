import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../hooks/useApp';
import { getNavItemsForRole } from '../../utils/navigation';
import * as Lucide from 'lucide-react';

const mapIconName = (name: string): string => {
  if (!name) return 'CircleHelp';
  const cleanName = name.replace('bi bi-', '').replace('bi-', '');
  switch (cleanName) {
    case 'speedometer':
    case 'speedometer2':
      return 'LayoutDashboard';
    case 'camera-video-fill':
    case 'camera-video':
    case 'camera':
      return 'Camera';
    case 'cpu-fill':
    case 'cpu':
      return 'Cpu';
    case 'heart-pulse':
      return 'HeartPulse';
    case 'building-fill':
    case 'building':
      return 'Building2';
    case 'person-badge-fill':
    case 'person-badge':
      return 'Users';
    case 'chat-left-text-fill':
    case 'chat-left-text':
    case 'chat-dots':
    case 'message':
      return 'MessageSquare';
    case 'bell-fill':
    case 'bell':
      return 'Bell';
    case 'shield-fill-check':
    case 'shield-check':
      return 'ShieldCheck';
    case 'file-earmark-bar-graph-fill':
    case 'file-earmark-bar-graph':
      return 'FileBarChart';
    case 'gear-fill':
    case 'gear':
    case 'settings':
      return 'Settings';
    case 'box-arrow-right':
    case 'logout':
      return 'LogOut';
    case 'card-list':
    case 'list':
      return 'List';
    case 'plus-circle-fill':
    case 'plus-circle':
      return 'PlusCircle';
    case 'pencil-fill':
    case 'pencil':
      return 'Pencil';
    case 'trash-fill':
    case 'trash':
      return 'Trash';
    case 'person-plus-fill':
    case 'person-plus':
      return 'UserPlus';
    case 'activity':
      return 'Activity';
    case 'cone-striped':
      return 'AlertTriangle';
    default:
      return cleanName
        .split(/[-_]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
  }
};

const RenderIcon = ({ name, size = 18, className }: { name: string; size?: number; className?: string }) => {
  const mappedName = mapIconName(name);
  const IconComponent = (Lucide as any)[mappedName];
  if (IconComponent) {
    return <IconComponent size={size} className={className} />;
  }
  return <i className={`${name} ${className || ''}`} aria-hidden="true" />;
};


export const Sidebar = () => {
  const { sidebar, closeMobileSidebar, user, sidebarTheme, toggleSidebarTheme } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
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

  const finalItems = getNavItemsForRole(user?.role || 'admin');

  // Track previous path and mini state to adjust openMenus state during rendering
  const [prevPath, setPrevPath] = useState(location.pathname);
  const [prevMini, setPrevMini] = useState(sidebar.mini);

  if (sidebar.mini !== prevMini) {
    setPrevMini(sidebar.mini);
    if (sidebar.mini) {
      setOpenMenus({});
    }
  }

  if (location.pathname !== prevPath) {
    setPrevPath(location.pathname);
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
  }

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
                        <RenderIcon name={item.icon} size={20} />
                      </span>
                      <span className="nav-text">{item.label}</span>
                    </div>
                    {!sidebar.mini && (
                      <span className="nav-arrow text-muted me-1 small">
                        <RenderIcon name={isMenuOpen ? 'chevron-down' : 'chevron-right'} size={14} />
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
                          <span className="nav-icon" style={{ width: '22px', height: '22px' }}>
                            <RenderIcon name={child.icon} size={14} />
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
                  <RenderIcon name={item.icon} size={20} />
                </span>
                <span className="nav-text">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Theme Switcher Toggle */}
        <div className={`sidebar-theme-toggle mt-auto border-top border-secondary border-opacity-10 d-flex align-items-center ${sidebar.mini ? 'p-2 justify-content-center' : 'p-3 justify-content-between'}`} style={{ minHeight: '57px' }}>
          {!sidebar.mini ? (
            <>
              <span className="small text-muted fw-semibold d-flex align-items-center gap-2" style={{ fontSize: '0.75rem', color: 'var(--admin-sidebar-text)' }}>
                <RenderIcon name={sidebarTheme === 'dark' ? 'moon' : 'sun'} />
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
              className="btn btn-sm btn-link p-0 mx-auto d-flex align-items-center justify-content-center"
              onClick={toggleSidebarTheme}
              title={sidebarTheme === 'dark' ? 'Switch to White Sidebar' : 'Switch to Dark Blue Sidebar'}
              style={{ color: 'var(--admin-sidebar-text)', width: '40px', height: '40px' }}
            >
              <RenderIcon name={sidebarTheme === 'dark' ? 'moon' : 'sun'} size={18} />
            </button>
          )}
        </div>

        {/* Static Session Activity Log displaying recent 3 activities */}
        {!sidebar.mini && (
          <div className="sidebar-activity p-3 border-top border-secondary border-opacity-10">
            <div className="fw-bold mb-2 small text-uppercase text-muted d-flex align-items-center gap-1.5" style={{ fontSize: '0.68rem', letterSpacing: '0.5px' }}>
              <RenderIcon name="activity" className="text-primary" size={18} /> Session Activity
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