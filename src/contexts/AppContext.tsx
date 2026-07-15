import { useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Theme, UserProfile, AppContextState, UserRole } from '../types';
import { AppContext } from './appContextBase';
import { STORAGE_KEYS, BREAKPOINTS } from '../constants';
import { MOCK_USERS } from '../services/mockData';

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
}

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>(getPreferredTheme);
  const [sidebarMini, setSidebarMiniState] = useState<boolean>(() => isDesktop() && getSavedItem(STORAGE_KEYS.SIDEBAR_MINI) === 'true');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [authUser, setAuthUser] = useState<UserProfile>(getInitialUser);
  const [authToken, setAuthToken] = useState<string>(getInitialToken);

  const isAuthenticated = true; // Demo mode always authenticated
  const permissions = ROLE_PERMISSIONS[authUser.role] || [];

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    document.documentElement.setAttribute('data-bs-theme', 'light');
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
  }, []);

  const hasPermission = useCallback((permission: string): boolean => {
    return permissions.includes(permission);
  }, [permissions]);

  const hasRole = useCallback((roles: UserRole[]): boolean => {
    return roles.includes(authUser.role);
  }, [authUser]);

  const value: AppContextState = {
    theme,
    user: authUser,
    auth: { isAuthenticated, user: authUser, token: authToken, permissions },
    sidebar: { mini: sidebarMini, open: sidebarOpen },
    setTheme,
    toggleTheme,
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