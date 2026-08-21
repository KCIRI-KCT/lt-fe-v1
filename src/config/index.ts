// ============================================================================
// Application Configuration
// ============================================================================

export const config = {
<<<<<<< HEAD
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://10.1.150.142:8000/api/',
  appName: 'AI Progress Monitor',
  version: '1.0.0',
  enableMockData: false, // Set to false to use real Django API
  auth: {
    tokenKey: 'access_token',
    refreshTokenKey: 'refresh_token',
=======
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
  appName: 'AI Progress Monitor',
  version: '1.0.0',
  enableMockData: true, // Toggle between mock and real API
  auth: {
    tokenKey: 'ai-monitor.authToken',
    refreshTokenKey: 'ai-monitor.refreshToken',
>>>>>>> MS-ltfe-report
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