// ============================================================================
// Application Constants — AI Construction Monitoring Platform
// ============================================================================

export const APP_NAME = 'AI Progress Monitor';
export const APP_VERSION = '1.0.0';
export const COMPANY_NAME = 'LT';

// ============================================================================
// Storage Keys
// ============================================================================

export const STORAGE_KEYS = {
  SIDEBAR_MINI: 'ai-monitor.sidebarMini',
  THEME: 'ai-monitor.colorTheme',
  AUTH_TOKEN: 'ai-monitor.authToken',
  AUTH_USER: 'ai-monitor.authUser',
  PERMISSIONS: 'ai-monitor.permissions',
} as const;

// ============================================================================
// Breakpoints
// ============================================================================

export const BREAKPOINTS = {
  DESKTOP: '(min-width: 992px)',
  TABLET: '(min-width: 768px)',
  MOBILE: '(max-width: 576px)',
} as const;

// ============================================================================
// Pagination
// ============================================================================

export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [5, 10, 25, 50, 100];

// ============================================================================
// Alert Severity Colors
// ============================================================================

export const SEVERITY_COLORS: Record<string, string> = {
  critical: '#dc2626',
  CRITICAL: '#dc2626',
  high: '#d97706',
  HIGH: '#d97706',
  medium: '#2563eb',
  MEDIUM: '#2563eb',
  low: '#6b7280',
  LOW: '#6b7280',
  major: '#d97706',
  MAJOR: '#d97706',
};

export const SEVERITY_BADGES: Record<string, string> = {
  critical: 'text-bg-danger',
  CRITICAL: 'text-bg-danger',
  high: 'text-bg-warning',
  HIGH: 'text-bg-warning',
  medium: 'text-bg-primary',
  MEDIUM: 'text-bg-primary',
  low: 'text-bg-secondary',
  LOW: 'text-bg-secondary',
  major: 'text-bg-warning',
  MAJOR: 'text-bg-warning',
  minor: 'text-bg-info',
  MINOR: 'text-bg-info',
};

// ============================================================================
// Status Badge Mapping
// ============================================================================

export const STATUS_BADGES: Record<string, string> = {
  // Active -> BLUE tag (text-bg-primary)
  active: 'text-bg-primary',
  Active: 'text-bg-primary',
  ACTIVE: 'text-bg-primary',

  // Progress -> ORANGE tag (text-bg-warning)
  progress: 'text-bg-warning',
  Progress: 'text-bg-warning',
  PROGRESS: 'text-bg-warning',
  'in progress': 'text-bg-warning',
  in_progress: 'text-bg-warning',
  In_Progress: 'text-bg-warning',
  'In Progress': 'text-bg-warning',
  IN_PROGRESS: 'text-bg-warning',
  ongoing: 'text-bg-warning',
  ONGOING: 'text-bg-warning',
  planning: 'text-bg-warning',
  pending: 'text-bg-warning',
  Pending: 'text-bg-warning',
  PENDING: 'text-bg-warning',
  generating: 'text-bg-warning',

  // Open -> GREY tag (text-bg-secondary)
  open: 'text-bg-secondary',
  Open: 'text-bg-secondary',
  OPEN: 'text-bg-secondary',
  new: 'text-bg-secondary',
  New: 'text-bg-secondary',
  NEW: 'text-bg-secondary',
  draft: 'text-bg-secondary',
  Draft: 'text-bg-secondary',
  DRAFT: 'text-bg-secondary',
  acknowledged: 'text-bg-secondary',
  Acknowledged: 'text-bg-secondary',
  dismissed: 'text-bg-secondary',
  leave: 'text-bg-secondary',

  // Completed / Closed / Resolved / Online / Present -> GREEN tag (text-bg-success)
  completed: 'text-bg-success',
  Completed: 'text-bg-success',
  COMPLETED: 'text-bg-success',
  closed: 'text-bg-success',
  Closed: 'text-bg-success',
  CLOSED: 'text-bg-success',
  resolved: 'text-bg-success',
  Resolved: 'text-bg-success',
  online: 'text-bg-success',
  Online: 'text-bg-success',
  ONLINE: 'text-bg-success',
  present: 'text-bg-success',
  Present: 'text-bg-success',
  working: 'text-bg-success',
  Working: 'text-bg-success',
  ready: 'text-bg-success',
  Ready: 'text-bg-success',
  valid: 'text-bg-success',

  // Malfunction / Issue / Error / Offline / Inactive / Cancelled -> RED tag (text-bg-danger)
  malfunction: 'text-bg-danger',
  Malfunction: 'text-bg-danger',
  MALFUNCTION: 'text-bg-danger',
  issue: 'text-bg-danger',
  Issue: 'text-bg-danger',
  ISSUE: 'text-bg-danger',
  error: 'text-bg-danger',
  Error: 'text-bg-danger',
  ERROR: 'text-bg-danger',
  fault: 'text-bg-danger',
  Fault: 'text-bg-danger',
  offline: 'text-bg-danger',
  Offline: 'text-bg-danger',
  OFFLINE: 'text-bg-danger',
  inactive: 'text-bg-danger',
  Inactive: 'text-bg-danger',
  INACTIVE: 'text-bg-danger',
  cancelled: 'text-bg-danger',
  Cancelled: 'text-bg-danger',
  on_hold: 'text-bg-danger',
  absent: 'text-bg-danger',
  critical: 'text-bg-danger',
  Critical: 'text-bg-danger',
  'not working': 'text-bg-danger',
  'Not Working': 'text-bg-danger',
  maintenance: 'text-bg-warning',
  late: 'text-bg-warning',
  half_day: 'text-bg-info',
};

export function getStatusBadgeClass(status?: string): string {
  if (!status) return 'text-bg-secondary';
  const s = status.trim().toLowerCase();

  // Active -> BLUE tag
  if (s === 'active') return 'text-bg-primary';

  // Progress -> ORANGE tag
  if (s.includes('progress') || s === 'ongoing' || s === 'planning' || s === 'pending' || s === 'generating') {
    return 'text-bg-warning';
  }

  // Open -> GREY tag
  if (s === 'open' || s === 'draft' || s === 'new' || s === 'acknowledged' || s === 'dismissed' || s === 'leave') {
    return 'text-bg-secondary';
  }

  // Completed -> GREEN tag
  if (s === 'completed' || s === 'closed' || s === 'resolved' || s === 'online' || s === 'present' || s === 'working' || s === 'ready' || s === 'valid') {
    return 'text-bg-success';
  }

  // Malfunction / Issue / Error -> RED tag
  if (s.includes('malfunction') || s.includes('issue') || s.includes('error') || s === 'offline' || s === 'inactive' || s === 'cancelled' || s === 'fault' || s === 'failed' || s === 'absent' || s === 'critical' || s === 'not working') {
    return 'text-bg-danger';
  }

  return STATUS_BADGES[status] || STATUS_BADGES[s] || 'text-bg-secondary';
}

// ============================================================================
// AI Alert Type Config
// ============================================================================

export const AI_ALERT_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  helmet_violation: { label: 'Helmet Violation', icon: 'bi bi-person-exclamation', color: '#dc2626' },
  vest_violation: { label: 'Vest Violation', icon: 'bi bi-person-exclamation', color: '#d97706' },
  mask_violation: { label: 'Mask Violation', icon: 'bi bi-shield-exclamation', color: '#2563eb' },
  fall_detected: { label: 'Fall Detected', icon: 'bi bi-person-falling', color: '#dc2626' },
  restricted_zone: { label: 'Restricted Zone', icon: 'bi bi-sign-stop', color: '#d97706' },
  fire_detected: { label: 'Fire Detected', icon: 'bi bi-fire', color: '#dc2626' },
  smoke_detected: { label: 'Smoke Detected', icon: 'bi bi-cloud-fog2', color: '#6b7280' },
  worker_count: { label: 'Worker Count Alert', icon: 'bi bi-people', color: '#2563eb' },
  no_ppe: { label: 'PPE Violation', icon: 'bi bi-shield-slash', color: '#dc2626' },
};

// ============================================================================
// Role Labels
// ============================================================================

export const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  project_director: 'Project Director',
  project_manager: 'Project Manager',
  site_supervisor: 'Site Supervisor',
  site_engineer: 'Site Engineer',
  safety_manager: 'Safety Manager',
  safety_officer: 'Safety Engineer',
};

export const ROLE_COLORS: Record<string, string> = {
  super_admin: 'text-bg-danger',
  admin: 'text-bg-danger',
  project_director: 'text-bg-primary',
  project_manager: 'text-bg-success',
  site_supervisor: 'text-bg-info',
  site_engineer: 'text-bg-primary',
  safety_manager: 'text-bg-warning',
  safety_officer: 'text-bg-secondary',
};

// ============================================================================
// Role Options for Forms
// ============================================================================

export const ROLE_OPTIONS = [
  // { value: 'super_admin', label: 'Super Admin' },
  { value: 'admin', label: 'Admin' },
  // { value: 'project_director', label: 'Project Director' },
  { value: 'project_manager', label: 'Project Manager' },
  { value: 'site_supervisor', label: 'Site Supervisor' },
  { value: 'site_engineer', label: 'Site Engineer' },
  { value: 'safety_manager', label: 'Safety Manager' },
  { value: 'safety_officer', label: 'Safety Engineer' },
];

// ============================================================================
// Camera Type Options
// ============================================================================

export const CAMERA_TYPE_OPTIONS = [
  { value: 'fixed', label: 'Fixed Camera' },
  { value: 'ptz', label: 'PTZ Camera' },
  { value: '360', label: '360 Camera' },
];

// ============================================================================
// Site Status Options
// ============================================================================

export const SITE_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'on_hold', label: 'On Hold' },
];

// ============================================================================
// Date Formats
// ============================================================================

export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  DISPLAY_TIME: 'MMM dd, yyyy HH:mm',
  API: 'yyyy-MM-dd',
  API_DATETIME: "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
  TIME: 'HH:mm',
} as const;

// ============================================================================
// API Endpoints
// ============================================================================

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile',
  },
  USERS: {
    BASE: '/users',
    BY_ID: (id: string) => `/users/${id}`,
    PERMISSIONS: (id: string) => `/users/${id}/permissions`,
  },
  PROJECTS: {
    BASE: '/projects',
    BY_ID: (id: string) => `/projects/${id}`,
    SITES: (id: string) => `/projects/${id}/sites`,
  },
  SITES: {
    BASE: '/sites',
    BY_ID: (id: string) => `/sites/${id}`,
    CHAINAGES: (id: string) => `/sites/${id}/chainages`,
    CAMERAS: (id: string) => `/sites/${id}/cameras`,
    WORKERS: (id: string) => `/sites/${id}/workers`,
  },
  WORKFORCE: {
    BASE: '/workforce',
    BY_ID: (id: string) => `/workforce/${id}`,
    ATTENDANCE: '/workforce/attendance',
    ATTENDANCE_BY_ID: (id: string) => `/workforce/attendance/${id}`,
  },
  CAMERAS: {
    BASE: '/cameras',
    BY_ID: (id: string) => `/cameras/${id}`,
    STREAM: (id: string) => `/cameras/${id}/stream`,
    HEALTH: (id: string) => `/cameras/${id}/health`,
  },
  AI_MONITORING: {
    ALERTS: '/ai-monitoring/alerts',
    ALERT_BY_ID: (id: string) => `/ai-monitoring/alerts/${id}`,
    ACKNOWLEDGE: (id: string) => `/ai-monitoring/alerts/${id}/acknowledge`,
    RESOLVE: (id: string) => `/ai-monitoring/alerts/${id}/resolve`,
    ANALYTICS: '/ai-monitoring/analytics',
  },
  INCIDENTS: {
    BASE: '/incidents',
    BY_ID: (id: string) => `/incidents/${id}`,
    ASSIGN: (id: string) => `/incidents/${id}/assign`,
    RESOLVE: (id: string) => `/incidents/${id}/resolve`,
  },
  MESSAGES: {
    BASE: '/messages',
    BY_ID: (id: string) => `/messages/${id}`,
    THREAD: (id: string) => `/messages/thread/${id}`,
    UNREAD: '/messages/unread/count',
  },
  REPORTS: {
    BASE: '/reports',
    BY_ID: (id: string) => `/reports/${id}`,
    GENERATE: '/reports/generate',
    DOWNLOAD: (id: string) => `/reports/${id}/download`,
  },
  HEALTH: {
    SYSTEM: '/health/system',
    SERVICES: '/health/services',
  },
  HIERARCHY: {
    COUNTRIES: '/hierarchy/countries',
    STATES: '/hierarchy/states',
    CITIES: '/hierarchy/cities',
  },
  DASHBOARD: {
    SUPER_ADMIN: '/dashboard/super-admin',
    PROJECT_DIRECTOR: '/dashboard/project-director',
    PROJECT_MANAGER: '/dashboard/project-manager',
    SAFETY_MANAGER: '/dashboard/safety-manager',
    SITE_SUPERVISOR: '/dashboard/site-supervisor',
    SAFETY_OFFICER: '/dashboard/safety-officer',
  },
} as const;