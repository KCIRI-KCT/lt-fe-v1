const getApiBaseUrl = (): string => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  return 'http://siteaense.kct.ac.in/api/';
};

export const config = {
  apiBaseUrl: getApiBaseUrl(),
  appName: 'Siteaense',
  version: '1.0.0',
  enableMockData: false, // Set to false to use real Django API
  auth: {
    tokenKey: 'access_token',
    refreshTokenKey: 'refresh_token',
    tokenExpiry: 3600, // 1 hour
  },
  features: {
    aiMonitoring: true,
    messaging: true,
    reports: true,
    systemHealth: true,
  },
  monitoring: {
    alertPollInterval: 30000, // 30 seconds
    healthCheckInterval: 60000, // 1 minute
  },
} as const;