import { createContext } from 'react';
import type { AppContextState } from '../types';

export const defaultAppContext: AppContextState = {
  theme: 'light',
  user: { id: '', name: '', email: '', role: 'admin', avatar: '', workspace: '' },
  auth: { isAuthenticated: true, user: null, token: null, permissions: [] },
  sidebar: { mini: false, open: false },
  setTheme: () => {},
  toggleTheme: () => {},
  toggleSidebar: () => {},
  closeMobileSidebar: () => {},
  setSidebarMini: () => {},
  login: async () => {},
  logout: () => {},
  hasPermission: () => false,
  hasRole: () => false,
};

export const AppContext = createContext<AppContextState | undefined>(undefined);