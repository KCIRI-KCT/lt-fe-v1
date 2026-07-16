// ============================================================================
// Enterprise Types — AI Construction Monitoring Platform
// ============================================================================

/** Available color themes */
export type Theme = 'light' | 'dark';

/** User roles for permission-based rendering */
export type UserRole =
  | 'super_admin'
  | 'admin'
  | 'project_director'
  | 'project_manager'
  | 'site_supervisor'
  | 'site_engineer'
  | 'safety_manager'
  | 'safety_officer';

/** User profile */
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  workspace: string;
  phone?: string;
  location?: string;
  department?: string;
  joinedAt?: string;
  employeeId?: string;
  createdAt?: string;
  joiningDate?: string;
  address?: string;
}

/** Authentication state */
export interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  token: string | null;
  permissions: string[];
}

/** Sidebar state */
export interface SidebarState {
  mini: boolean;
  open: boolean;
}

/** Global application context */
export interface AppContextState {
  theme: Theme;
  user: UserProfile;
  auth: AuthState;
  sidebar: SidebarState;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  closeMobileSidebar: () => void;
  setSidebarMini: (mini: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (roles: UserRole[]) => boolean;
}

// ============================================================================
// Navigation
// ============================================================================

export interface NavItem {
  label: string;
  path: string;
  icon: string;
  roles?: UserRole[];
  children?: NavItem[];
  badge?: { count: number; variant: string };
}

// ============================================================================
// Project Hierarchy
// ============================================================================

export interface Country {
  id: string;
  name: string;
  code: string;
  flag?: string;
}

export interface State {
  id: string;
  name: string;
  countryId: string;
  countryName?: string;
}

export interface City {
  id: string;
  name: string;
  stateId: string;
  stateName?: string;
}

export interface ProjectRoleAssignment {
  role: 'project_manager' | 'site_supervisor' | 'site_engineer' | 'safety_officer' | 'safety_engineer';
  userId: string;
  userName: string;
  siteId: string;
  siteName: string;
}

export interface Project {
  id: string;
  name: string;
  code: string;
  description?: string;
  cityId: string;
  cityName?: string;
  stateName?: string;
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  budget: number;
  progress: number;
  managerId: string;
  managerName?: string;
  supervisorId?: string;
  supervisorName?: string;
  engineerId?: string;
  engineerName?: string;
  siteCount?: number;
  workerCount?: number;
  sites?: NestedSite[];
  roleAssignments?: ProjectRoleAssignment[];
  deleteRequested?: boolean;
}

export interface NestedSite {
  id: string;
  siteName: string;
  siteNumber: string;
  chainageName: string;
  chainageKm: number;
}

export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';

export interface Site {
  id: string;
  name: string;
  code: string;
  projectId: string;
  projectName?: string;
  location: string;
  latitude: number;
  longitude: number;
  status: SiteStatus;
  supervisorId: string;
  supervisorName?: string;
  startDate: string;
  chainages: number;
  activeCameras: number;
  workerCount: number;
  safetyScore: number;
}

export type SiteStatus = 'active' | 'inactive' | 'maintenance' | 'completed';

export interface Chainage {
  id: string;
  name: string;
  siteId: string;
  kmMarker: number;
  description?: string;
  status: ChainageStatus;
}

export type ChainageStatus = 'active' | 'inactive' | 'completed';

export interface ChainageData {
  id: string;
  name: string;
  project: string;
  site: string;
  supervisor: string;
  engineer: string;
  lat: number;
  lng: number;
  progress: number;
  highwayProgress: number;
  structuralProgress: number;
  workers: number;
  safetyScore: number;
  vehicles: number;
  equipment: number;
  cameras: number;
  ppePending: number;
  aiAlerts: number;
  status: 'green' | 'yellow' | 'red';
  lastUpdate: string;
  elevation: string;
  precipitation: string;
  temperature: string;
}

// ============================================================================
// Workforce
// ============================================================================

export interface Worker {
  id: string;
  name: string;
  employeeId: string;
  phone: string;
  email?: string;
  designation: string;
  siteId: string;
  siteName?: string;
  projectId: string;
  projectName?: string;
  department: string;
  joinDate: string;
  status: WorkerStatus;
  photo?: string;
  documents?: string[];
  emergencyContact?: string;
}

export type WorkerStatus = 'active' | 'inactive' | 'on_leave' | 'terminated';

export interface Attendance {
  id: string;
  workerId: string;
  workerName?: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  status: AttendanceStatus;
  siteId: string;
  siteName?: string;
  hoursWorked?: number;
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'half_day' | 'leave';

// ============================================================================
// Camera & AI Monitoring
// ============================================================================

export interface Camera {
  id: string;
  name: string;
  rtspUrl: string;
  siteId: string;
  siteName?: string;
  location: string;
  status: CameraStatus;
  type: CameraType;
  lastOnline?: string;
  streamUrl?: string;
  resolution?: string;
  healthScore?: number;
}

export type CameraStatus = 'online' | 'offline' | 'error' | 'maintenance';
export type CameraType = 'fixed' | 'ptz' | 'thermal' | '360';

export interface AIAlert {
  id: string;
  cameraId: string;
  cameraName?: string;
  siteId: string;
  siteName?: string;
  projectId?: string;
  chainageId?: string;
  type: AIAlertType;
  severity: AlertSeverity;
  timestamp: string;
  snapshot?: string;
  description: string;
  status: AlertStatus;
  assignedTo?: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
}

export type AIAlertType =
  | 'helmet_violation'
  | 'vest_violation'
  | 'mask_violation'
  | 'fall_detected'
  | 'restricted_zone'
  | 'fire_detected'
  | 'smoke_detected'
  | 'worker_count'
  | 'no_ppe';

export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low';
export type AlertStatus = 'new' | 'acknowledged' | 'resolved' | 'dismissed';

// ============================================================================
// Incidents
// ============================================================================

export interface Incident {
  id: string;
  title: string;
  description: string;
  siteId: string;
  siteName?: string;
  projectId: string;
  projectName?: string;
  type: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  reportedBy: string;
  reportedAt: string;
  assignedTo?: string;
  assignedToName?: string;
  resolvedAt?: string;
  resolution?: string;
  attachments?: string[];
  location?: string;
  isAIGenerated?: boolean;
  aiAlertId?: string;
}

export type IncidentType =
  | 'safety_violation'
  | 'equipment_failure'
  | 'structural_issue'
  | 'fire'
  | 'accident'
  | 'near_miss'
  | 'security_breach'
  | 'environmental'
  | 'other';

export type IncidentSeverity = 'critical' | 'major' | 'minor' | 'observation';
export type IncidentStatus = 'open' | 'investigating' | 'resolved' | 'closed';

// ============================================================================
// Messages
// ============================================================================

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  receiverId: string;
  receiverName?: string;
  subject: string;
  content: string;
  timestamp: string;
  read: boolean;
  priority: MessagePriority;
  attachments?: string[];
  threadId?: string;
}

export type MessagePriority = 'low' | 'normal' | 'high' | 'urgent';

// ============================================================================
// Reports & Analytics
// ============================================================================

export interface Report {
  id: string;
  title: string;
  type: ReportType;
  description?: string;
  generatedAt: string;
  generatedBy: string;
  siteId?: string;
  projectId?: string;
  chainageId?: string;
  dateRange: { start: string; end: string };
  format: 'pdf' | 'csv' | 'excel';
  url?: string;
  status: 'generating' | 'ready' | 'failed';
}

export type ReportType =
  | 'daily_safety'
  | 'weekly_progress'
  | 'monthly_summary'
  | 'incident_report'
  | 'ppe_compliance'
  | 'attendance'
  | 'custom';

// ============================================================================
// Dashboard Metrics
// ============================================================================

export interface MetricCardData {
  label: string;
  value: string;
  icon: string;
  variant: 'primary' | 'success' | 'warning' | 'danger';
  meta: { text: string; value: string; positive?: boolean };
}

export interface PPECompliance {
  helmet: number;
  vest: number;
  mask: number;
  boots: number;
  gloves: number;
}

export interface SiteProgress {
  siteId: string;
  siteName: string;
  planned: number;
  actual: number;
  variance: number;
}

export interface StateWiseAnalytics {
  state: string;
  projects: number;
  sites: number;
  workers: number;
  incidents: number;
  compliance: number;
}

export interface IncidentTrend {
  date: string;
  critical: number;
  major: number;
  minor: number;
  observation: number;
}

// ============================================================================
// System Health
// ============================================================================

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down';
  uptime: string;
  lastChecked: string;
  services: ServiceHealth[];
  alerts: SystemAlert[];
}

export interface ServiceHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  latency: number;
  lastChecked: string;
}

export interface SystemAlert {
  id: string;
  service: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
  timestamp: string;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface APIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  pagination?: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface TableFilters {
  search?: string;
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  [key: string]: unknown;
}