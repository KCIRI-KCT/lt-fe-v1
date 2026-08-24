import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from './hooks/useApp';
import { getFirstSidebarRoute } from './utils/navigation';
import { AppProvider } from './contexts/AppContext';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { LoadingState } from './components/common/LoadingState';
import type { UserRole } from './types';

// ============================================================================
// Lazy loaded pages for route-based code splitting
// ============================================================================
const LoginPage = lazy(() => import('./pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })));
const UsersPage = lazy(() => import('./pages/Users').then((m) => ({ default: m.Users })));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage').then((m) => ({ default: m.ProjectsPage })));
const SitesPage = lazy(() => import('./pages/SitesPage').then((m) => ({ default: m.SitesPage })));
const WorkforcePage = lazy(() => import('./pages/WorkforcePage').then((m) => ({ default: m.WorkforcePage })));
const CamerasPage = lazy(() => import('./pages/CamerasPage').then((m) => ({ default: m.CamerasPage })));
const AIMonitoringPage = lazy(() => import('./pages/Alerts').then((m) => ({ default: m.Alerts })));
const AlertsPage = lazy(() => import('./pages/Alerts').then((m) => ({ default: m.Alerts })));
const IncidentsPage = lazy(() => import('./pages/IncidentsPage').then((m) => ({ default: m.IncidentsPage })));
const MessagesPage = lazy(() => import('./pages/MessagesPage').then((m) => ({ default: m.MessagesPage })));
const ReportsPage = lazy(() => import('./pages/ReportsPage').then((m) => ({ default: m.ReportsPage })));
const SystemHealthPage = lazy(() => import('./pages/SystemHealthPage').then((m) => ({ default: m.SystemHealthPage })));
const ProjectManagerDashboard = lazy(() => import('./pages/dashboards/ProjectManagerDashboard').then((m) => ({ default: m.ProjectManagerDashboard })));
const SafetyOfficerDashboard = lazy(() => import('./pages/dashboards/safety/SafetyOfficerDashboard').then((m) => ({ default: m.SafetyOfficerDashboard })));
const SiteEngineerDashboard = lazy(() => import('./pages/dashboards/SiteEngineerDashboard').then((m) => ({ default: m.SiteEngineerDashboard })));
const ProfilePage = lazy(() => import('./pages/Profile').then((m) => ({ default: m.Profile })));
const SettingsPage = lazy(() => import('./pages/Settings').then((m) => ({ default: m.Settings })));
const UserFormPage = lazy(() => import('./pages/UserFormPage').then((m) => ({ default: m.UserFormPage })));
const ProjectFormPage = lazy(() => import('./pages/ProjectFormPage').then((m) => ({ default: m.ProjectFormPage })));
const CameraFormPage = lazy(() => import('./pages/CameraFormPage').then((m) => ({ default: m.CameraFormPage })));
const UserEditPage = lazy(() => import('./pages/UserEditPage').then((m) => ({ default: m.UserEditPage })));
const UserDeletePage = lazy(() => import('./pages/UserDeletePage').then((m) => ({ default: m.UserDeletePage })));
const ProjectEditPage = lazy(() => import('./pages/ProjectEditPage').then((m) => ({ default: m.ProjectEditPage })));
const ProjectDeletePage = lazy(() => import('./pages/ProjectDeletePage').then((m) => ({ default: m.ProjectDeletePage })));
const CameraEditPage = lazy(() => import('./pages/CameraEditPage').then((m) => ({ default: m.CameraEditPage })));
const CameraDeletePage = lazy(() => import('./pages/CameraDeletePage').then((m) => ({ default: m.CameraDeletePage })));
// New role-based pages
const ProgressPage = lazy(() => import('./pages/ProgressPage').then((m) => ({ default: m.ProgressPage })));
const PPEDetectionPage = lazy(() => import('./pages/PPEDetectionPage').then((m) => ({ default: m.PPEDetectionPage })));
const IntrusionDetectionPage = lazy(() => import('./pages/IntrusionDetectionPage').then((m) => ({ default: m.IntrusionDetectionPage })));

const PageLoader = () => <LoadingState message="Loading page..." />;

const HomeRedirect = () => {
  const { auth } = useApp();
  return <Navigate to={getFirstSidebarRoute(auth.user?.role)} replace />;
};

const CatchAllRedirect = () => {
  const { auth } = useApp();
  if (auth.isAuthenticated && auth.user) {
    return <Navigate to={getFirstSidebarRoute(auth.user.role)} replace />;
  }
  return <Navigate to="/login" replace />;
};

// ============================================================================
// Role-based route guards
// ============================================================================
const AllRoles: UserRole[] = ['admin', 'project_manager', 'site_supervisor', 'site_engineer', 'safety_manager', 'safety_officer'];
const SuperAdminOnly: UserRole[] = ['admin'];
const ProjectRoles: UserRole[] = ['admin', 'project_manager', 'site_supervisor', 'site_engineer', 'safety_manager', 'safety_officer'];
const SafetyRoles: UserRole[] = ['admin', 'project_manager', 'site_supervisor', 'site_engineer', 'safety_manager', 'safety_officer'];
const SiteRoles: UserRole[] = ['admin', 'project_manager', 'site_supervisor', 'site_engineer', 'safety_manager', 'safety_officer'];
const WorkforceRoles: UserRole[] = ['admin', 'project_manager', 'site_supervisor', 'site_engineer'];
const ProgressRoles: UserRole[] = ['admin', 'project_manager', 'site_supervisor', 'site_engineer', 'safety_manager', 'safety_officer'];
// PPE Detection & Intrusion: Safety Manager and Safety Officer only
const SafetyDetectionRoles: UserRole[] = ['admin', 'safety_manager', 'safety_officer'];

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/logout" element={<LoginPage />} />

              {/* Protected routes with layout */}
              <Route element={<ProtectedRoute requiredRoles={AllRoles} />}>
                <Route element={<Layout />}>
                  <Route path="/" element={<HomeRedirect />} />

                  {/* User Management - Super Admin only */}
                  <Route element={<ProtectedRoute requiredRoles={SuperAdminOnly} />}>
                    <Route path="/users" element={<UsersPage />} />
                    <Route path="/users/create" element={<UserFormPage />} />
                    <Route path="/users/edit" element={<UserEditPage />} />
                    <Route path="/users/delete" element={<UserDeletePage />} />
                    <Route path="/users/:id" element={<UserFormPage />} />
                  </Route>

                  {/* Projects */}
                  <Route element={<ProtectedRoute requiredRoles={ProjectRoles} />}>
                    <Route path="/projects" element={<ProjectsPage />} />
                    <Route path="/projects/create" element={<ProjectFormPage />} />
                    <Route path="/projects/edit" element={<ProjectEditPage />} />
                    <Route path="/projects/delete" element={<ProjectDeletePage />} />
                    <Route path="/projects/:id" element={<ProjectFormPage />} />
                  </Route>

                  {/* Sites */}
                  <Route element={<ProtectedRoute requiredRoles={SiteRoles} />}>
                    <Route path="/sites" element={<SitesPage />} />
                  </Route>

                  {/* Workforce */}
                  <Route element={<ProtectedRoute requiredRoles={WorkforceRoles} />}>
                    <Route path="/workforce" element={<WorkforcePage />} />
                  </Route>

                  {/* Cameras */}
                  <Route element={<ProtectedRoute requiredRoles={SiteRoles} />}>
                    <Route path="/cameras" element={<CamerasPage />} />
                    <Route path="/cameras/create" element={<CameraFormPage />} />
                    <Route path="/cameras/edit" element={<CameraEditPage />} />
                    <Route path="/cameras/delete" element={<CameraDeletePage />} />
                    <Route path="/cameras/:id" element={<CameraFormPage />} />
                  </Route>

                  {/* AI Monitoring / Activity Recognition */}
                  <Route element={<ProtectedRoute requiredRoles={SafetyRoles} />}>
                    <Route path="/ai-monitoring" element={<AIMonitoringPage />} />
                    <Route path="/alerts" element={<AlertsPage />} />
                  </Route>

                  {/* Incidents */}
                  <Route element={<ProtectedRoute requiredRoles={SafetyRoles} />}>
                    <Route path="/incidents" element={<IncidentsPage />} />
                  </Route>

                  {/* Progress Measurement — all roles except admin-only */}
                  <Route element={<ProtectedRoute requiredRoles={ProgressRoles} />}>
                    <Route path="/progress" element={<ProgressPage />} />
                  </Route>

                  {/* PPE Detection — Safety Manager & Safety Officer */}
                  <Route element={<ProtectedRoute requiredRoles={SafetyDetectionRoles} />}>
                    <Route path="/ppe-detection" element={<PPEDetectionPage />} />
                  </Route>

                  {/* Intrusion Detection — Safety Manager & Safety Officer */}
                  <Route element={<ProtectedRoute requiredRoles={SafetyDetectionRoles} />}>
                    <Route path="/intrusion-detection" element={<IntrusionDetectionPage />} />
                  </Route>

                  {/* Messages - accessible to all authenticated users */}
                  <Route path="/messages" element={<MessagesPage />} />

                  {/* Reports */}
                  <Route element={<ProtectedRoute requiredRoles={ProjectRoles} />}>
                    <Route path="/reports" element={<ReportsPage />} />
                  </Route>

                  {/* Dashboards */}
                  <Route element={<ProtectedRoute requiredRoles={['admin'] as UserRole[]} />}>
                    <Route path="/health" element={<SystemHealthPage />} />
                  </Route>
                  <Route element={<ProtectedRoute requiredRoles={['admin', 'project_manager'] as UserRole[]} />}>
                    <Route path="/project-manager" element={<ProjectManagerDashboard />} />
                  </Route>
                  <Route element={<ProtectedRoute requiredRoles={['admin', 'site_engineer', 'site_supervisor'] as UserRole[]} />}>
                    <Route path="/site-engineer" element={<SiteEngineerDashboard />} />
                  </Route>

                  {/* Safety Dashboard */}
                  <Route element={<ProtectedRoute requiredRoles={['admin', 'safety_officer', 'safety_manager'] as UserRole[]} />}>
                    <Route path="/safety-officer" element={<SafetyOfficerDashboard />} />
                  </Route>

                  {/* User pages */}
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/settings" element={<SettingsPage />} />

                </Route>
              </Route>

              {/* Catch all - redirect to dynamic home or login */}
              <Route path="*" element={<CatchAllRedirect />} />
            </Routes>
          </Suspense>
        </AppProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
