const KEYS = {
  USERS: 'lt_users',
  PROJECTS: 'lt_projects',
  SITES: 'lt_sites',
  WORKERS: 'lt_workers',
  CAMERAS: 'lt_cameras',
  AI_ALERTS: 'lt_ai_alerts',
  INCIDENTS: 'lt_incidents',
  MESSAGES: 'lt_messages',
  REPORTS: 'lt_reports',
  SYSTEM_HEALTH: 'lt_system_health',
  AUTH_USER: 'lt_auth_user',
  AUTH_TOKEN: 'lt_auth_token',
  THEME: 'lt_theme',
  SIDEBAR_MINI: 'lt_sidebar_mini',
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