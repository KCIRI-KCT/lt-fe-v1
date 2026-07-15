import { useApp } from '../../hooks/useApp';
import { SuperAdminDashboard } from './SuperAdminDashboard';

// Role-specific dashboards can be built similarly
const SiteEngineerDashboard = SuperAdminDashboard;
const ProjectManagerDashboard = SuperAdminDashboard;
const SafetyManagerDashboard = SuperAdminDashboard;
const SiteSupervisorDashboard = SuperAdminDashboard;
const SafetyOfficerDashboard = SuperAdminDashboard;

export const RoleBasedDashboard = () => {
  const { user } = useApp();

  const dashboards: Record<string, React.FC> = {
    admin: SuperAdminDashboard,
    site_engineer: SiteEngineerDashboard,
    project_manager: ProjectManagerDashboard,
    safety_manager: SafetyManagerDashboard,
    site_supervisor: SiteSupervisorDashboard,
    safety_officer: SafetyOfficerDashboard,
  };

  const DashboardComponent = dashboards[user.role] || SuperAdminDashboard;
  return <DashboardComponent />;
};