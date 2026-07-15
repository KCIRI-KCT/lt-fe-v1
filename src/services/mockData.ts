import type {
  UserProfile, Project, Site, Worker, Attendance, Camera,
  AIAlert, Incident, Message, Report, Country, State, City,
  SystemHealth, PPECompliance,
  SiteProgress, StateWiseAnalytics, IncidentTrend
} from '../types';
import { storage, KEYS } from './storage';

const today = new Date().toISOString().split('T')[0];

// Users
const INITIAL_USERS: UserProfile[] = [
  { id: '1', name: 'Kartheeswaran', email: 'karthee@kciri.com', role: 'admin', avatar: 'https://ui-avatars.com/api/?name=Kartheeswaran&background=dc2626&color=fff', workspace: 'KCIRI HQ', phone: '+91-9876543210', location: 'Chennai, TN', department: 'Management', joinedAt: '2024-01-01', employeeId: 'EMP-001', createdAt: '2024-01-01', joiningDate: '2024-01-05', address: '123 Main St, Chennai' },
  { id: '2', name: 'Rajesh Kumar', email: 'rajesh@kciri.com', role: 'site_engineer', avatar: 'https://ui-avatars.com/api/?name=Rajesh+Kumar&background=2563eb&color=fff', workspace: 'KCIRI Projects', phone: '+91-9876543211', location: 'Mumbai, MH', department: 'Projects', joinedAt: '2024-02-15', employeeId: 'EMP-002', createdAt: '2024-02-15', joiningDate: '2024-02-20', address: '456 Link Rd, Mumbai' },
  { id: '3', name: 'Priya Sharma', email: 'priya@kciri.com', role: 'project_manager', avatar: 'https://ui-avatars.com/api/?name=Priya+Sharma&background=0f766e&color=fff', workspace: 'Highway Project', phone: '+91-9876543212', location: 'Delhi', department: 'Project Management', joinedAt: '2024-03-01', employeeId: 'EMP-003', createdAt: '2024-03-01', joiningDate: '2024-03-05', address: '789 Connaught Place, Delhi' },
  { id: '4', name: 'Amit Singh', email: 'amit@kciri.com', role: 'safety_manager', avatar: 'https://ui-avatars.com/api/?name=Amit+Singh&background=d97706&color=fff', workspace: 'Safety Division', phone: '+91-9876543213', location: 'Bangalore, KA', department: 'Safety', joinedAt: '2024-01-20', employeeId: 'EMP-004', createdAt: '2024-01-20', joiningDate: '2024-01-25', address: '101 MG Road, Bangalore' },
  { id: '5', name: 'Suresh Reddy', email: 'suresh@kciri.com', role: 'site_supervisor', avatar: 'https://ui-avatars.com/api/?name=Suresh+Reddy&background=0891b2&color=fff', workspace: 'Site A - KM 45', phone: '+91-9876543214', location: 'Hyderabad, TS', department: 'Site Operations', joinedAt: '2024-04-10', employeeId: 'EMP-005', createdAt: '2024-04-10', joiningDate: '2024-04-15', address: '202 Jubilee Hills, Hyderabad' },
  { id: '6', name: 'Deepa Nair', email: 'deepa@kciri.com', role: 'safety_officer', avatar: 'https://ui-avatars.com/api/?name=Deepa+Nair&background=6b7280&color=fff', workspace: 'Site B - KM 78', phone: '+91-9876543215', location: 'Kochi, KL', department: 'Safety', joinedAt: '2024-05-01', employeeId: 'EMP-006', createdAt: '2024-05-01', joiningDate: '2024-05-05', address: '303 Marine Dr, Kochi' },
];
export const MOCK_USERS: UserProfile[] = (() => {
  const data = storage.get<UserProfile[]>(KEYS.USERS, INITIAL_USERS);
  if (!data || data.length === 0) storage.set(KEYS.USERS, INITIAL_USERS);
  return storage.get<UserProfile[]>(KEYS.USERS, INITIAL_USERS);
})();

export const upsertUser = (user: UserProfile) => {
  const users = MOCK_USERS;
  const idx = users.findIndex((u) => u.id === user.id);
  if (idx >= 0) users[idx] = user; else users.push(user);
  storage.set(KEYS.USERS, users);
};
export const deleteUser = (id: string) => {
  const users = MOCK_USERS.filter((u) => u.id !== id);
  storage.set(KEYS.USERS, users);
};

export const MOCK_COUNTRIES: Country[] = [
  { id: '1', name: 'India', code: 'IN', flag: '🇮🇳' },
];
export const MOCK_STATES: State[] = [
  { id: '1', name: 'Tamil Nadu', countryId: '1', countryName: 'India' },
  { id: '2', name: 'Maharashtra', countryId: '1', countryName: 'India' },
  { id: '3', name: 'Karnataka', countryId: '1', countryName: 'India' },
  { id: '4', name: 'Telangana', countryId: '1', countryName: 'India' },
  { id: '5', name: 'Kerala', countryId: '1', countryName: 'India' },
];
export const MOCK_CITIES: City[] = [
  { id: '1', name: 'Chennai', stateId: '1', stateName: 'Tamil Nadu' },
  { id: '2', name: 'Coimbatore', stateId: '1', stateName: 'Tamil Nadu' },
  { id: '3', name: 'Mumbai', stateId: '2', stateName: 'Maharashtra' },
  { id: '4', name: 'Pune', stateId: '2', stateName: 'Maharashtra' },
  { id: '5', name: 'Bangalore', stateId: '3', stateName: 'Karnataka' },
  { id: '6', name: 'Hyderabad', stateId: '4', stateName: 'Telangana' },
  { id: '7', name: 'Kochi', stateId: '5', stateName: 'Kerala' },
];

// Projects
const INITIAL_PROJECTS: Project[] = [
  {
    id: '1', name: 'Chennai-Bangalore Expressway', code: 'CHE-BLR-EXW', description: '6-lane expressway connecting Chennai and Bangalore',
    cityId: '1', cityName: 'Chennai', stateName: 'Tamil Nadu', startDate: '2024-01-01', endDate: '2026-12-31', status: 'active',
    budget: 25000000000, progress: 35, managerId: '3', managerName: 'Priya Sharma', supervisorId: '5', supervisorName: 'Suresh Reddy',
    engineerId: '2', engineerName: 'Rajesh Kumar', siteCount: 1, workerCount: 1200,
    sites: [
      { id: '101', siteName: 'Valluvarkottam Segment', siteNumber: 'S-101', chainageName: 'Chainage Chennai North', chainageKm: 12.5 }
    ]
  },
  {
    id: '2', name: 'Mumbai Ring Road', code: 'MUM-RR', description: 'Peripheral ring road around Mumbai metropolitan',
    cityId: '3', cityName: 'Mumbai', stateName: 'Maharashtra', startDate: '2024-03-01', endDate: '2027-06-30', status: 'active',
    budget: 35000000000, progress: 22, managerId: '3', managerName: 'Priya Sharma', supervisorId: '5', supervisorName: 'Suresh Reddy',
    engineerId: '2', engineerName: 'Rajesh Kumar', siteCount: 1, workerCount: 980,
    sites: [
      { id: '201', siteName: 'Panvel Link Section', siteNumber: 'S-201', chainageName: 'Chainage Navi Mumbai', chainageKm: 24.8 }
    ]
  },
  {
    id: '3', name: 'Hyderabad Metro Phase II', code: 'HYD-METRO-II', description: 'Metro rail extension to western corridor',
    cityId: '6', cityName: 'Hyderabad', stateName: 'Telangana', startDate: '2024-06-01', endDate: '2028-03-31', status: 'active',
    budget: 45000000000, progress: 15, managerId: '3', managerName: 'Priya Sharma', supervisorId: '5', supervisorName: 'Suresh Reddy',
    engineerId: '2', engineerName: 'Rajesh Kumar', siteCount: 1, workerCount: 1500,
    sites: [
      { id: '301', siteName: 'Hitec City Extension', siteNumber: 'S-301', chainageName: 'Chainage Cyber Corridor', chainageKm: 8.3 }
    ]
  },
  {
    id: '4', name: 'Kochi Port Connectivity', code: 'KOCHI-PORT', description: 'Dedicated freight corridor to Vallarpadam port',
    cityId: '7', cityName: 'Kochi', stateName: 'Kerala', startDate: '2024-02-01', endDate: '2026-09-30', status: 'active',
    budget: 18000000000, progress: 48, managerId: '2', managerName: 'Rajesh Kumar', supervisorId: '5', supervisorName: 'Suresh Reddy',
    engineerId: '2', engineerName: 'Rajesh Kumar', siteCount: 1, workerCount: 650,
    sites: [
      { id: '401', siteName: 'Vallarpadam Yard Connect', siteNumber: 'S-401', chainageName: 'Chainage Terminal Road', chainageKm: 4.1 }
    ]
  },
  {
    id: '5', name: 'Coimbatore Bypass', code: 'CBE-BYPASS', description: 'Eastern bypass for Coimbatore city',
    cityId: '2', cityName: 'Coimbatore', stateName: 'Tamil Nadu', startDate: '2024-09-01', endDate: '2027-12-31', status: 'planning',
    budget: 12000000000, progress: 5, managerId: '3', managerName: 'Priya Sharma', supervisorId: '5', supervisorName: 'Suresh Reddy',
    engineerId: '2', engineerName: 'Rajesh Kumar', siteCount: 1, workerCount: 200,
    sites: [
      { id: '501', siteName: 'Eachanari Bypass', siteNumber: 'S-501', chainageName: 'Chainage Coimbatore East', chainageKm: 16.2 }
    ]
  },
];
export const MOCK_PROJECTS: Project[] = (() => {
  const data = storage.get<Project[]>(KEYS.PROJECTS, INITIAL_PROJECTS);
  if (!data || data.length === 0) storage.set(KEYS.PROJECTS, INITIAL_PROJECTS);
  return storage.get<Project[]>(KEYS.PROJECTS, INITIAL_PROJECTS);
})();

export const upsertProject = (project: Project) => {
  const projects = MOCK_PROJECTS;
  const idx = projects.findIndex((p) => p.id === project.id);
  if (idx >= 0) projects[idx] = project; else projects.push(project);
  storage.set(KEYS.PROJECTS, projects);
};
export const deleteProject = (id: string) => {
  const projects = MOCK_PROJECTS.filter((p) => p.id !== id);
  storage.set(KEYS.PROJECTS, projects);
};

// Sites
const INITIAL_SITES: Site[] = [
  { id: '1', name: 'Site A - KM 0-15', code: 'CHE-BLR-SA', projectId: '1', projectName: 'Chennai-Bangalore Expressway', location: 'Chennai outskirts, NH-48', latitude: 12.9716, longitude: 80.1994, status: 'active', supervisorId: '5', supervisorName: 'Suresh Reddy', startDate: '2024-01-15', chainages: 15, activeCameras: 8, workerCount: 280, safetyScore: 92 },
  { id: '2', name: 'Site B - KM 15-30', code: 'CHE-BLR-SB', projectId: '1', projectName: 'Chennai-Bangalore Expressway', location: 'Kanchipuram district', latitude: 12.8342, longitude: 79.9784, status: 'active', supervisorId: '5', supervisorName: 'Suresh Reddy', startDate: '2024-02-01', chainages: 15, activeCameras: 6, workerCount: 245, safetyScore: 88 },
  { id: '3', name: 'Site C - KM 30-45', code: 'CHE-BLR-SC', projectId: '1', projectName: 'Chennai-Bangalore Expressway', location: 'Walajapet region', latitude: 12.9242, longitude: 79.4370, status: 'active', supervisorId: '5', supervisorName: 'Suresh Reddy', startDate: '2024-03-01', chainages: 15, activeCameras: 7, workerCount: 260, safetyScore: 95 },
  { id: '4', name: 'Site D - KM 0-12', code: 'MUM-RR-SD', projectId: '2', projectName: 'Mumbai Ring Road', location: 'Panvel region', latitude: 18.9895, longitude: 73.1196, status: 'active', supervisorId: '6', supervisorName: 'Deepa Nair', startDate: '2024-03-15', chainages: 12, activeCameras: 5, workerCount: 190, safetyScore: 85 },
  { id: '5', name: 'Site E - KM 12-25', code: 'MUM-RR-SE', projectId: '2', projectName: 'Mumbai Ring Road', location: 'Kalyan-Shil road', latitude: 19.2399, longitude: 73.1307, status: 'active', supervisorId: '6', supervisorName: 'Deepa Nair', startDate: '2024-04-01', chainages: 13, activeCameras: 6, workerCount: 210, safetyScore: 90 },
];
export const MOCK_SITES: Site[] = (() => {
  const data = storage.get<Site[]>(KEYS.SITES, INITIAL_SITES);
  if (!data || data.length === 0) storage.set(KEYS.SITES, INITIAL_SITES);
  return storage.get<Site[]>(KEYS.SITES, INITIAL_SITES);
})();

export const upsertSite = (site: Site) => {
  const sites = MOCK_SITES;
  const idx = sites.findIndex((s) => s.id === site.id);
  if (idx >= 0) sites[idx] = site; else sites.push(site);
  storage.set(KEYS.SITES, sites);
};
export const deleteSite = (id: string) => {
  const sites = MOCK_SITES.filter((s) => s.id !== id);
  storage.set(KEYS.SITES, sites);
};

// Workforce
const INITIAL_WORKERS: Worker[] = [
  { id: '1', name: 'Mohan Raj', employeeId: 'EMP001', phone: '+91-9988776651', email: 'mohan@example.com', designation: 'Heavy Equipment Operator', siteId: '1', siteName: 'Site A - KM 0-15', projectId: '1', projectName: 'Chennai-Bangalore Expressway', department: 'Operations', joinDate: '2024-01-20', status: 'active', emergencyContact: '+91-9988776650' },
  { id: '2', name: 'Kumar Velu', employeeId: 'EMP002', phone: '+91-9988776652', designation: 'Safety Supervisor', siteId: '1', siteName: 'Site A - KM 0-15', projectId: '1', projectName: 'Chennai-Bangalore Expressway', department: 'Safety', joinDate: '2024-01-20', status: 'active', emergencyContact: '+91-9988776650' },
  { id: '3', name: 'Ravi Krishnan', employeeId: 'EMP003', phone: '+91-9988776653', designation: 'Civil Engineer', siteId: '2', siteName: 'Site B - KM 15-30', projectId: '1', projectName: 'Chennai-Bangalore Expressway', department: 'Engineering', joinDate: '2024-02-01', status: 'active' },
  { id: '4', name: 'Selvi Ammal', employeeId: 'EMP004', phone: '+91-9988776654', designation: 'Welder', siteId: '2', siteName: 'Site B - KM 15-30', projectId: '1', projectName: 'Chennai-Bangalore Expressway', department: 'Fabrication', joinDate: '2024-02-10', status: 'active' },
  { id: '5', name: 'Venkatesh Rao', employeeId: 'EMP005', phone: '+91-9988776655', designation: 'Surveyor', siteId: '3', siteName: 'Site C - KM 30-45', projectId: '1', projectName: 'Chennai-Bangalore Expressway', department: 'Survey', joinDate: '2024-03-01', status: 'active' },
  { id: '6', name: 'Lakshmi Narayanan', employeeId: 'EMP006', phone: '+91-9988776656', designation: 'Concrete Mixer Operator', siteId: '3', siteName: 'Site C - KM 30-45', projectId: '1', projectName: 'Chennai-Bangalore Expressway', department: 'Operations', joinDate: '2024-03-05', status: 'on_leave' },
  { id: '7', name: 'Ganesh Pandian', employeeId: 'EMP007', phone: '+91-9988776657', designation: 'Electrician', siteId: '4', siteName: 'Site D - KM 0-12', projectId: '2', projectName: 'Mumbai Ring Road', department: 'Electrical', joinDate: '2024-03-20', status: 'active' },
  { id: '8', name: 'Divya Bharathi', employeeId: 'EMP008', phone: '+91-9988776658', email: 'divya@example.com', designation: 'Junior Engineer', siteId: '4', siteName: 'Site D - KM 0-12', projectId: '2', projectName: 'Mumbai Ring Road', department: 'Engineering', joinDate: '2024-04-01', status: 'active' },
  { id: '9', name: 'Muruganantham', employeeId: 'EMP009', phone: '+91-9988776659', designation: 'Crane Operator', siteId: '5', siteName: 'Site E - KM 12-25', projectId: '2', projectName: 'Mumbai Ring Road', department: 'Operations', joinDate: '2024-04-10', status: 'active' },
  { id: '10', name: 'Anitha Rani', employeeId: 'EMP010', phone: '+91-9988776660', designation: 'Quality Inspector', siteId: '5', siteName: 'Site E - KM 12-25', projectId: '2', projectName: 'Mumbai Ring Road', department: 'Quality', joinDate: '2024-04-15', status: 'active' },
];
export const MOCK_WORKERS: Worker[] = (() => {
  const data = storage.get<Worker[]>(KEYS.WORKERS, INITIAL_WORKERS);
  if (!data || data.length === 0) storage.set(KEYS.WORKERS, INITIAL_WORKERS);
  return storage.get<Worker[]>(KEYS.WORKERS, INITIAL_WORKERS);
})();

// Attendance
const INITIAL_ATTENDANCE: Attendance[] = [
  { id: 'att-1', workerId: '1', workerName: 'Mohan Raj', date: today, checkIn: '6:30 AM', checkOut: '5:30 PM', status: 'present', siteId: '1', siteName: 'Site A - KM 0-15', hoursWorked: 9 },
  { id: 'att-2', workerId: '2', workerName: 'Kumar Velu', date: today, checkIn: '7:30 AM', checkOut: '5:30 PM', status: 'present', siteId: '1', siteName: 'Site A - KM 0-15', hoursWorked: 10 },
];
export const MOCK_ATTENDANCE: Attendance[] = (() => {
  const key = 'kciri_attendance';
  const data = storage.get<Attendance[]>(key, INITIAL_ATTENDANCE);
  if (!data || data.length === 0) storage.set(key, INITIAL_ATTENDANCE);
  return storage.get<Attendance[]>(key, INITIAL_ATTENDANCE);
})();

// Cameras
const INITIAL_CAMERAS: Camera[] = [
  { id: '1', name: 'Main Gate - Site A', rtspUrl: 'rtsp://192.168.1.10/stream1', siteId: '1', siteName: 'Site A - KM 0-15', location: 'Main Entrance', status: 'online', type: 'fixed', lastOnline: today, healthScore: 95 },
  { id: '2', name: 'Excavation Zone - Site A', rtspUrl: 'rtsp://192.168.1.11/stream1', siteId: '1', siteName: 'Site A - KM 0-15', location: 'Excavation Area', status: 'online', type: 'ptz', lastOnline: today, healthScore: 88 },
  { id: '3', name: 'Worker Shed - Site A', rtspUrl: 'rtsp://192.168.1.12/stream1', siteId: '1', siteName: 'Site A - KM 0-15', location: 'Worker Rest Area', status: 'offline', type: 'fixed', lastOnline: '2026-07-12', healthScore: 45 },
  { id: '4', name: 'Bridge Construction - Site B', rtspUrl: 'rtsp://192.168.1.20/stream1', siteId: '2', siteName: 'Site B - KM 15-30', location: 'Bridge Pier 3', status: 'online', type: 'fixed', lastOnline: today, healthScore: 91 },
  { id: '5', name: 'Material Storage - Site B', rtspUrl: 'rtsp://192.168.1.21/stream1', siteId: '2', siteName: 'Site B - KM 15-30', location: 'Storage Yard', status: 'online', type: 'ptz', lastOnline: today, healthScore: 87 },
  { id: '6', name: 'Tunnel Vent - Site C', rtspUrl: 'rtsp://192.168.1.30/stream1', siteId: '3', siteName: 'Site C - KM 30-45', location: 'Tunnel Ventilation', status: 'maintenance', type: 'fixed', lastOnline: '2026-07-10', healthScore: 62 },
  { id: '7', name: 'Perimeter - Site D', rtspUrl: 'rtsp://192.168.1.40/stream1', siteId: '4', siteName: 'Site D - KM 0-12', location: 'North Boundary', status: 'online', type: '360', lastOnline: today, healthScore: 93 },
  { id: '8', name: 'Crane Zone - Site E', rtspUrl: 'rtsp://192.168.1.50/stream1', siteId: '5', siteName: 'Site E - KM 12-25', location: 'Crane Operation Area', status: 'online', type: 'ptz', lastOnline: today, healthScore: 84 },
];
export const MOCK_CAMERAS: Camera[] = (() => {
  const data = storage.get<Camera[]>(KEYS.CAMERAS, INITIAL_CAMERAS);
  if (!data || data.length === 0) storage.set(KEYS.CAMERAS, INITIAL_CAMERAS);
  return storage.get<Camera[]>(KEYS.CAMERAS, INITIAL_CAMERAS);
})();

export const upsertCamera = (camera: Camera) => {
  const cameras = MOCK_CAMERAS;
  const idx = cameras.findIndex((c) => c.id === camera.id);
  if (idx >= 0) cameras[idx] = camera; else cameras.push(camera);
  storage.set(KEYS.CAMERAS, cameras);
};
export const deleteCamera = (id: string) => {
  const cameras = MOCK_CAMERAS.filter((c) => c.id !== id);
  storage.set(KEYS.CAMERAS, cameras);
};

// AI Alerts
const INITIAL_AI_ALERTS: AIAlert[] = [
  { id: '1', cameraId: '1', cameraName: 'Main Gate - Site A', siteId: '1', siteName: 'Site A - KM 0-15', type: 'helmet_violation', severity: 'high', timestamp: new Date(Date.now() - 300000).toISOString(), description: 'Worker detected without helmet at main gate entry', status: 'new' },
  { id: '2', cameraId: '2', cameraName: 'Excavation Zone - Site A', siteId: '1', siteName: 'Site A - KM 0-15', type: 'vest_violation', severity: 'medium', timestamp: new Date(Date.now() - 1800000).toISOString(), description: '3 workers without safety vests in excavation zone', status: 'acknowledged', acknowledgedBy: 'Suresh Reddy', acknowledgedAt: new Date(Date.now() - 900000).toISOString() },
  { id: '3', cameraId: '4', cameraName: 'Bridge Construction - Site B', siteId: '2', siteName: 'Site B - KM 15-30', type: 'fall_detected', severity: 'critical', timestamp: new Date(Date.now() - 3600000).toISOString(), description: 'Possible fall detected near bridge pier edge', status: 'new' },
  { id: '4', cameraId: '5', cameraName: 'Material Storage - Site B', siteId: '2', siteName: 'Site B - KM 15-30', type: 'restricted_zone', severity: 'high', timestamp: new Date(Date.now() - 7200000).toISOString(), description: 'Unauthorized personnel in restricted storage area', status: 'resolved', acknowledgedBy: 'Deepa Nair', acknowledgedAt: new Date(Date.now() - 5400000).toISOString(), resolvedAt: new Date(Date.now() - 3600000).toISOString() },
  { id: '5', cameraId: '7', cameraName: 'Perimeter - Site D', siteId: '4', siteName: 'Site D - KM 0-12', type: 'fire_detected', severity: 'critical', timestamp: new Date(Date.now() - 600000).toISOString(), description: 'Fire detected near perimeter fence, possible trash burning', status: 'new' },
  { id: '6', cameraId: '8', cameraName: 'Crane Zone - Site E', siteId: '5', siteName: 'Site E - KM 12-25', type: 'mask_violation', severity: 'low', timestamp: new Date(Date.now() - 14400000).toISOString(), description: 'Worker without mask in dust-prone crane zone', status: 'dismissed' },
  { id: '7', cameraId: '3', cameraName: 'Worker Shed - Site A', siteId: '1', siteName: 'Site A - KM 0-15', type: 'worker_count', severity: 'medium', timestamp: new Date(Date.now() - 28800000).toISOString(), description: 'Worker count exceeds safe limit in rest area', status: 'resolved', resolvedAt: new Date(Date.now() - 21600000).toISOString() },
  { id: '8', cameraId: '2', cameraName: 'Excavation Zone - Site A', siteId: '1', siteName: 'Site A - KM 0-15', type: 'smoke_detected', severity: 'high', timestamp: new Date(Date.now() - 43200000).toISOString(), description: 'Smoke detected near excavation machinery', status: 'acknowledged', acknowledgedBy: 'Suresh Reddy', acknowledgedAt: new Date(Date.now() - 36000000).toISOString() },
];
export const MOCK_AI_ALERTS: AIAlert[] = (() => {
  const data = storage.get<AIAlert[]>(KEYS.AI_ALERTS, INITIAL_AI_ALERTS);
  if (!data || data.length === 0) storage.set(KEYS.AI_ALERTS, INITIAL_AI_ALERTS);
  return storage.get<AIAlert[]>(KEYS.AI_ALERTS, INITIAL_AI_ALERTS);
})();

// Incidents
const INITIAL_INCIDENTS: Incident[] = [
  { id: '1', title: 'Worker fall from scaffolding', description: 'Worker slipped from scaffolding at height of 4m, minor injuries reported', siteId: '1', siteName: 'Site A - KM 0-15', projectId: '1', projectName: 'Chennai-Bangalore Expressway', type: 'accident', severity: 'major', status: 'open', reportedBy: 'Kumar Velu', reportedAt: new Date(Date.now() - 86400000).toISOString(), assignedTo: '4', assignedToName: 'Amit Singh', location: 'Pier 4, Scaffolding Area', isAIGenerated: true, aiAlertId: '3' },
  { id: '2', title: 'Equipment malfunction - Excavator', description: 'Hydraulic excavator JCB-422 showing abnormal hydraulic pressure fluctuations', siteId: '2', siteName: 'Site B - KM 15-30', projectId: '1', projectName: 'Chennai-Bangalore Expressway', type: 'equipment_failure', severity: 'major', status: 'investigating', reportedBy: 'Ravi Krishnan', reportedAt: new Date(Date.now() - 172800000).toISOString(), assignedTo: '5', assignedToName: 'Suresh Reddy', location: 'Excavation Zone B2' },
  { id: '3', title: 'Near miss - Crane swing', description: 'Crane load swung near workers during hoisting operation, no injuries', siteId: '5', siteName: 'Site E - KM 12-25', projectId: '2', projectName: 'Mumbai Ring Road', type: 'near_miss', severity: 'minor', status: 'resolved', reportedBy: 'Muruganantham', reportedAt: new Date(Date.now() - 259200000).toISOString(), assignedTo: '6', assignedToName: 'Deepa Nair', resolvedAt: new Date(Date.now() - 172800000).toISOString(), resolution: 'Crane operator retrained, safety zone expanded' },
  { id: '4', title: 'Fire near fuel storage', description: 'Small fire broke out near diesel storage area, extinguished by safety team', siteId: '4', siteName: 'Site D - KM 0-12', projectId: '2', projectName: 'Mumbai Ring Road', type: 'fire', severity: 'critical', status: 'closed', reportedBy: 'Divya Bharathi', reportedAt: new Date(Date.now() - 604800000).toISOString(), assignedTo: '4', assignedToName: 'Amit Singh', resolvedAt: new Date(Date.now() - 518400000).toISOString(), resolution: 'Fire safety audit completed, additional extinguishers installed', isAIGenerated: true, aiAlertId: '5' },
  { id: '5', title: 'Safety violation - No helmet zone', description: 'Visiting contractor observed without helmet in active construction zone', siteId: '3', siteName: 'Site C - KM 30-45', projectId: '1', projectName: 'Chennai-Bangalore Expressway', type: 'safety_violation', severity: 'observation', status: 'open', reportedBy: 'Venkatesh Rao', reportedAt: new Date(Date.now() - 43200000).toISOString(), location: 'Tunnel entrance', isAIGenerated: true, aiAlertId: '1' },
];
export const MOCK_INCIDENTS: Incident[] = (() => {
  const data = storage.get<Incident[]>(KEYS.INCIDENTS, INITIAL_INCIDENTS);
  if (!data || data.length === 0) storage.set(KEYS.INCIDENTS, INITIAL_INCIDENTS);
  return storage.get<Incident[]>(KEYS.INCIDENTS, INITIAL_INCIDENTS);
})();

// Messages
const INITIAL_MESSAGES: Message[] = [
  { id: '1', senderId: '2', senderName: 'Rajesh Kumar', receiverId: '3', receiverName: 'Priya Sharma', subject: 'Project Review Meeting', content: 'Please schedule a project review meeting for the Chennai-Bangalore expressway this Friday.', timestamp: new Date(Date.now() - 3600000).toISOString(), read: false, priority: 'high' },
  { id: '2', senderId: '4', senderName: 'Amit Singh', receiverId: '5', receiverName: 'Suresh Reddy', subject: 'Safety Audit Schedule', content: 'The monthly safety audit for Site A is scheduled for next Wednesday. Please ensure all safety documentation is ready.', timestamp: new Date(Date.now() - 7200000).toISOString(), read: false, priority: 'normal' },
  { id: '3', senderId: '5', senderName: 'Suresh Reddy', receiverId: '4', receiverName: 'Amit Singh', subject: 'Re: Safety Audit Schedule', content: 'Understood. I will have all the documents prepared by Tuesday evening.', timestamp: new Date(Date.now() - 5400000).toISOString(), read: true, priority: 'normal' },
  { id: '4', senderId: '3', senderName: 'Priya Sharma', receiverId: '2', receiverName: 'Rajesh Kumar', subject: 'Material Delivery Delay', content: 'The steel reinforcement delivery for Site B has been delayed by 2 days due to transport issues.', timestamp: new Date(Date.now() - 14400000).toISOString(), read: false, priority: 'high' },
  { id: '5', senderId: '6', senderName: 'Deepa Nair', receiverId: '4', receiverName: 'Amit Singh', subject: 'PPE Compliance Report', content: 'Attached is the weekly PPE compliance report. Helmet compliance is at 94%, vest at 89%.', timestamp: new Date(Date.now() - 28800000).toISOString(), read: true, priority: 'low' },
];
export const MOCK_MESSAGES: Message[] = (() => {
  const data = storage.get<Message[]>(KEYS.MESSAGES, INITIAL_MESSAGES);
  if (!data || data.length === 0) storage.set(KEYS.MESSAGES, INITIAL_MESSAGES);
  return storage.get<Message[]>(KEYS.MESSAGES, INITIAL_MESSAGES);
})();

// Reports
const INITIAL_REPORTS: Report[] = [
  { id: '1', title: 'Daily Safety Report - Site A', type: 'daily_safety', description: 'Daily safety inspection report for Site A', generatedAt: new Date().toISOString(), generatedBy: 'Deepa Nair', siteId: '1', projectId: '1', dateRange: { start: today, end: today }, format: 'pdf', status: 'ready' },
  { id: '2', title: 'Weekly Progress - Chennai Expressway', type: 'weekly_progress', description: 'Weekly construction progress report', generatedAt: new Date(Date.now() - 86400000).toISOString(), generatedBy: 'Priya Sharma', projectId: '1', dateRange: { start: new Date(Date.now() - 604800000).toISOString().split('T')[0], end: today }, format: 'pdf', status: 'ready' },
  { id: '3', title: 'Monthly Incident Summary - June 2026', type: 'incident_report', description: 'Summary of all incidents reported in June', generatedAt: new Date(Date.now() - 86400000).toISOString(), generatedBy: 'Amit Singh', dateRange: { start: '2026-06-01', end: '2026-06-30' }, format: 'excel', status: 'ready' },
  { id: '4', title: 'PPE Compliance - Q2 2026', type: 'ppe_compliance', description: 'Quarterly PPE compliance analysis', generatedAt: new Date(Date.now() - 172800000).toISOString(), generatedBy: 'Deepa Nair', dateRange: { start: '2026-04-01', end: '2026-06-30' }, format: 'pdf', status: 'ready' },
  { id: '5', title: 'Attendance Report - July 2026', type: 'attendance', description: 'Monthly workforce attendance report', generatedAt: new Date().toISOString(), generatedBy: 'Suresh Reddy', siteId: '1', projectId: '1', dateRange: { start: '2026-07-01', end: today }, format: 'csv', status: 'generating' },
];
export const MOCK_REPORTS: Report[] = (() => {
  const data = storage.get<Report[]>(KEYS.REPORTS, INITIAL_REPORTS);
  if (!data || data.length === 0) storage.set(KEYS.REPORTS, INITIAL_REPORTS);
  return storage.get<Report[]>(KEYS.REPORTS, INITIAL_REPORTS);
})();

// Dashboard
export const MOCK_PPE_COMPLIANCE: PPECompliance = { helmet: 94, vest: 89, mask: 76, boots: 82, gloves: 71 };
export const MOCK_SITE_PROGRESS: SiteProgress[] = [
  { siteId: '1', siteName: 'Site A - KM 0-15', planned: 38, actual: 35, variance: -3 },
  { siteId: '2', siteName: 'Site B - KM 15-30', planned: 32, actual: 34, variance: 2 },
  { siteId: '3', siteName: 'Site C - KM 30-45', planned: 28, actual: 25, variance: -3 },
];
export const MOCK_STATE_WISE: StateWiseAnalytics[] = [
  { state: 'Tamil Nadu', projects: 2, sites: 3, workers: 785, incidents: 18, compliance: 92 },
  { state: 'Maharashtra', projects: 1, sites: 2, workers: 400, incidents: 12, compliance: 88 },
];
export const MOCK_INCIDENT_TRENDS: IncidentTrend[] = [
  { date: '2026-01', critical: 2, major: 5, minor: 8, observation: 12 },
  { date: '2026-02', critical: 1, major: 3, minor: 6, observation: 10 },
  { date: '2026-03', critical: 3, major: 4, minor: 9, observation: 14 },
];

// System Health
export const MOCK_SYSTEM_HEALTH: SystemHealth = {
  status: 'healthy',
  uptime: '99.98%',
  lastChecked: new Date().toISOString(),
  services: [
    { name: 'AI Detection Engine', status: 'healthy', latency: 45, lastChecked: new Date().toISOString() },
    { name: 'Camera Stream Service', status: 'healthy', latency: 82, lastChecked: new Date().toISOString() },
  ],
  alerts: [],
};

// Notifications
export const MOCK_NOTIFICATIONS = [
  { title: 'New AI Alert: Helmet Violation', time: '5 minutes ago', path: '/ai-monitoring', variant: 'danger' },
  { title: 'Fire Detected at Site D', time: '10 minutes ago', path: '/incidents', variant: 'danger' },
  { title: 'Daily Safety Report Ready', time: '1 hour ago', path: '/reports', variant: 'primary' },
  { title: 'Camera #3 Offline', time: '2 hours ago', path: '/cameras', variant: 'warning' },
];

export const NAV_ITEMS_CONFIG = [
  { label: 'System Health', path: '/health', icon: 'bi bi-heart-pulse', roles: ['super_admin'] },
  {
    label: 'Camera Management',
    path: '/cameras',
    icon: 'bi bi-camera-video',
    roles: ['super_admin', 'project_manager', 'safety_manager', 'site_supervisor'],
    children: [
      { label: 'All Cameras', path: '/cameras', icon: 'bi bi-card-list' },
      { label: 'Add Camera', path: '/cameras/create', icon: 'bi bi-plus-circle' },
      { label: 'Update Camera', path: '/cameras/edit', icon: 'bi bi-pencil' },
      { label: 'Remove Camera', path: '/cameras/delete', icon: 'bi bi-trash' },
    ],
  },
  {
    label: 'User Management',
    path: '/users',
    icon: 'bi bi-people',
    roles: ['super_admin'],
    children: [
      { label: 'All Users', path: '/users', icon: 'bi bi-card-list' },
      { label: 'Add User', path: '/users/create', icon: 'bi bi-person-plus' },
      { label: 'Update User', path: '/users/edit', icon: 'bi bi-pencil' },
      { label: 'Remove User', path: '/users/delete', icon: 'bi bi-trash' },
    ],
  },
  {
    label: 'Project Management',
    path: '/projects',
    icon: 'bi bi-building',
    roles: ['super_admin', 'project_director', 'project_manager'],
    children: [
      { label: 'All Projects', path: '/projects', icon: 'bi bi-card-list' },
      { label: 'Add Project', path: '/projects/create', icon: 'bi bi-plus-circle' },
      { label: 'Update Project', path: '/projects/edit', icon: 'bi bi-pencil' },
      { label: 'Remove Project', path: '/projects/delete', icon: 'bi bi-trash' },
    ],
  },
  { label: 'Messages', path: '/messages', icon: 'bi bi-chat-dots', roles: undefined },
];

export const MOCK_DASHBOARD_METRICS = {
  admin: [
    { label: 'Active Projects', value: '5', icon: 'bi bi-building', variant: 'primary' as const, meta: { text: 'total ongoing', value: '12% increase', positive: true } },
    { label: 'Active Sites', value: '22', icon: 'bi bi-geo-alt', variant: 'success' as const, meta: { text: 'across all projects', value: '+3 new', positive: true } },
    { label: 'Total Workforce', value: '3,855', icon: 'bi bi-people', variant: 'warning' as const, meta: { text: 'active workers', value: '+2.4%', positive: true } },
    { label: 'Safety Score', value: '89.6%', icon: 'bi bi-shield-check', variant: 'danger' as const, meta: { text: 'overall rating', value: '-1.2%', positive: false } },
  ],
};