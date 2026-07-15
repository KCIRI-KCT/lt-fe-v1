const KEYS = {
  USERS: 'kciri_users',
  PROJECTS: 'kciri_projects',
  SITES: 'kciri_sites',
  WORKERS: 'kciri_workers',
  CAMERAS: 'kciri_cameras',
  AI_ALERTS: 'kciri_ai_alerts',
  INCIDENTS: 'kciri_incidents',
  MESSAGES: 'kciri_messages',
  REPORTS: 'kciri_reports',
  SYSTEM_HEALTH: 'kciri_system_health',
  AUTH_USER: 'kciri_auth_user',
  AUTH_TOKEN: 'kciri_auth_token',
  THEME: 'kciri_theme',
  SIDEBAR_MINI: 'kciri_sidebar_mini',
};

export const storage = {
  get: <T>(key: string, fallback: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  },

  set: (key: string, value: unknown) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage full or unavailable
    }
  },

  remove: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  },
};

export { KEYS };