// ============================================================================
// Application Configuration
// ============================================================================

export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
  appName: 'AI Progress Monitor',
  version: '1.0.0',
  enableMockData: true, // Toggle between mock and real API
  auth: {
    tokenKey: 'ai-monitor.authToken',
    refreshTokenKey: 'ai-monitor.refreshToken',
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