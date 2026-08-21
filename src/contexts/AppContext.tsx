import { useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import type { Theme, UserProfile, AppContextState, UserRole } from '../types';
import { AppContext } from './appContextBase';
import { STORAGE_KEYS, BREAKPOINTS } from '../constants';
<<<<<<< HEAD
=======
import { MOCK_USERS } from '../services/mockData';
>>>>>>> MS-ltfe-report

const getSavedItem = (key: string): string | null => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const setSavedItem = (key: string, value: string): void => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage not available
  }
};

const getPreferredTheme = (): Theme => {
  return 'light';
};

const isDesktop = (): boolean => window.matchMedia(BREAKPOINTS.DESKTOP).matches;

// Role-based permissions mapping
const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: [
    'users.view', 'users.create', 'users.edit', 'users.delete',
    'projects.view', 'projects.create', 'projects.edit', 'projects.delete',
    'sites.view', 'sites.create', 'sites.edit', 'sites.delete',
    'workforce.view', 'workforce.create', 'workforce.edit',
    'cameras.view', 'cameras.create', 'cameras.edit',
    'ai_monitoring.view', 'ai_monitoring.acknowledge', 'ai_monitoring.resolve',
    'incidents.view', 'incidents.create', 'incidents.edit', 'incidents.assign', 'incidents.resolve',
    'messages.view', 'messages.send',
    'reports.view', 'reports.generate', 'reports.download',
    'health.view', 'settings.view', 'settings.edit',
  ],
  site_engineer: [
    'projects.view', 'projects.create', 'projects.edit',
    'sites.view', 'sites.create', 'sites.edit',
    'workforce.view',
    'cameras.view',
    'ai_monitoring.view',
    'incidents.view', 'incidents.assign',
    'messages.view', 'messages.send',
    'reports.view', 'reports.generate', 'reports.download',
  ],
  project_manager: [
    'projects.view', 'projects.edit',
    'sites.view', 'sites.create', 'sites.edit',
    'workforce.view', 'workforce.create',
    'cameras.view', 'cameras.edit',
    'ai_monitoring.view', 'ai_monitoring.acknowledge',
    'incidents.view', 'incidents.create', 'incidents.assign',
    'messages.view', 'messages.send',
    'reports.view', 'reports.generate',
  ],
  safety_manager: [
    'sites.view',
    'workforce.view',
    'cameras.view',
    'ai_monitoring.view', 'ai_monitoring.acknowledge', 'ai_monitoring.resolve',
    'incidents.view', 'incidents.create', 'incidents.edit', 'incidents.assign', 'incidents.resolve',
    'messages.view', 'messages.send',
    'reports.view', 'reports.generate', 'reports.download',
  ],
  site_supervisor: [
    'sites.view', 'sites.edit',
    'workforce.view',
    'cameras.view',
    'ai_monitoring.view', 'ai_monitoring.acknowledge',
    'incidents.view', 'incidents.create',
    'messages.view', 'messages.send',
  ],
  safety_officer: [
    'sites.view',
    'cameras.view',
    'ai_monitoring.view', 'ai_monitoring.acknowledge',
    'incidents.view', 'incidents.create',
    'messages.view', 'messages.send',
    'reports.view',
  ],
};

<<<<<<< HEAD
function getSessionUser(): UserProfile | null {
  try {
    const saved = sessionStorage.getItem('user');
    if (saved) return JSON.parse(saved) as UserProfile;
  } catch {
    // ignore
  }
  return null;
}

function getSessionToken(): string | null {
  return sessionStorage.getItem('access_token');
=======
function getInitialUser(): UserProfile {
  const saved = getSavedItem(STORAGE_KEYS.AUTH_USER);
  if (saved) {
    try {
      const parsed = JSON.parse(saved) as UserProfile;
      if (parsed.role as string === 'super_admin') {
        parsed.role = 'admin';
        setSavedItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(parsed));
      } else if (parsed.role as string === 'project_director') {
        parsed.role = 'site_engineer';
        setSavedItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(parsed));
      }
      return parsed;
    } catch {
      // fall through
    }
  }
  const demoUser = MOCK_USERS[0];
  setSavedItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(demoUser));
  return demoUser;
}

function getInitialToken(): string {
  const saved = getSavedItem(STORAGE_KEYS.AUTH_TOKEN);
  if (saved) return saved;
  const token = 'demo-token-12345';
  setSavedItem(STORAGE_KEYS.AUTH_TOKEN, token);
  return token;
>>>>>>> MS-ltfe-report
}

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>(getPreferredTheme);
  const [sidebarTheme, setSidebarThemeState] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('sidebar-theme');
    return (saved as 'dark' | 'light') || 'dark';
  });
  const [sidebarMini, setSidebarMiniState] = useState<boolean>(() => isDesktop() && getSavedItem(STORAGE_KEYS.SIDEBAR_MINI) === 'true');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
<<<<<<< HEAD
  
  const initialUser = getSessionUser() || {
    id: '1',
    name: 'Kartheeswaran',
    email: 'karthee@lt.com',
    role: 'admin' as UserRole,
    avatar: 'https://ui-avatars.com/api/?name=Kartheeswaran&background=dc2626&color=fff',
    workspace: 'LT HQ',
  };

  const [authUser, setAuthUser] = useState<UserProfile>(initialUser);
  const [authToken, setAuthToken] = useState<string | null>(getSessionToken);

  const isAuthenticated = Boolean(authToken || sessionStorage.getItem('access_token'));
=======
  const [authUser, setAuthUser] = useState<UserProfile>(getInitialUser);
  const [authToken, setAuthToken] = useState<string>(getInitialToken);

  const isAuthenticated = true; // Demo mode always authenticated
>>>>>>> MS-ltfe-report
  const permissions = useMemo(() => ROLE_PERMISSIONS[authUser.role] || [], [authUser.role]);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    document.documentElement.setAttribute('data-bs-theme', 'light');
  }, []);

  const toggleSidebarTheme = useCallback(() => {
    setSidebarThemeState((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('sidebar-theme', next);
      return next;
    });
  }, []);

  // Handle breakpoint changes
  useEffect(() => {
    const mq = window.matchMedia(BREAKPOINTS.DESKTOP);
    const handler = () => {
      if (isDesktop()) {
        setSidebarOpen(false);
        setSidebarMiniState(getSavedItem(STORAGE_KEYS.SIDEBAR_MINI) === 'true');
      } else {
        setSidebarMiniState(false);
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    setSavedItem(STORAGE_KEYS.THEME, t);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  const toggleSidebar = useCallback(() => {
    if (isDesktop()) {
      setSidebarMiniState((prev) => {
        const next = !prev;
        setSavedItem(STORAGE_KEYS.SIDEBAR_MINI, String(next));
        return next;
      });
    } else {
      setSidebarOpen((prev) => !prev);
    }
  }, []);

  const closeMobileSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const setSidebarMini = useCallback((mini: boolean) => {
    setSidebarMiniState(mini);
    setSavedItem(STORAGE_KEYS.SIDEBAR_MINI, String(mini));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
<<<<<<< HEAD
    try {
      const { authService } = await import('../services/authService');
      const response = await authService.login(email, password);
      if (response.user) {
        setAuthUser(response.user);
      }
      if (response.tokens.access) {
        setAuthToken(response.tokens.access);
      }
    } catch (err: unknown) {
      const axiosErr = err as { code?: string; response?: { status?: number; data?: Record<string, unknown> } };

      // If backend responded with an HTTP error status (400 Bad Request, 401 Unauthorized, 403, etc.)
      if (axiosErr.response) {
        const errorData = axiosErr.response.data;
        const msg = (errorData?.detail as string) ||
                    (errorData?.message as string) ||
                    (errorData?.error as string) ||
                    (Array.isArray(errorData?.non_field_errors) ? (errorData.non_field_errors[0] as string) : '') ||
                    'Invalid username/email or password.';
        throw new Error(msg, { cause: err });
      }

      // If network error / server offline: throw explicit error to prevent invalid token usage
      if (axiosErr.code === 'ERR_NETWORK' || !axiosErr.response) {
        throw new Error('Unable to connect to authentication server. Please verify backend service is running.', { cause: err });
      }

      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('role_id');
    setAuthToken(null);
=======
    // Mock login
    void password; // Suppress unused warning for mock implementation
    const user = MOCK_USERS.find((u) => u.email === email);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    const token = `token-${user.id}-${Date.now()}`;
    setAuthUser(user);
    setAuthToken(token);
    setSavedItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
    setSavedItem(STORAGE_KEYS.AUTH_TOKEN, token);
  }, []);

  const logout = useCallback(() => {
    const demoUser = MOCK_USERS[0];
    setAuthUser(demoUser);
    setAuthToken('demo-token-12345');
    setSavedItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(demoUser));
    setSavedItem(STORAGE_KEYS.AUTH_TOKEN, 'demo-token-12345');
>>>>>>> MS-ltfe-report
  }, []);

  const hasPermission = useCallback((permission: string): boolean => {
    return permissions.includes(permission);
  }, [permissions]);

  const hasRole = useCallback((roles: UserRole[]): boolean => {
    return roles.includes(authUser.role);
  }, [authUser]);

  const value: AppContextState = {
    theme,
    sidebarTheme,
    user: authUser,
    auth: { isAuthenticated, user: authUser, token: authToken, permissions },
    sidebar: { mini: sidebarMini, open: sidebarOpen },
    setTheme,
    toggleTheme,
    toggleSidebarTheme,
    toggleSidebar,
    closeMobileSidebar,
    setSidebarMini,
    login,
    logout,
    hasPermission,
    hasRole,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};