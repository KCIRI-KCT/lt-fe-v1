import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useApp } from '../../hooks/useApp';
import { getFirstSidebarRoute } from '../../utils/navigation';
import type { UserRole } from '../../types';

interface ProtectedRouteProps {
  requiredRoles?: UserRole[];
  redirectTo?: string;
}

export const ProtectedRoute = ({ requiredRoles, redirectTo = '/login' }: ProtectedRouteProps) => {
  const { auth, hasRole } = useApp();
  const location = useLocation();

  if (!auth.isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (requiredRoles && requiredRoles.length > 0 && !hasRole(requiredRoles)) {
    const fallback = getFirstSidebarRoute(auth.user?.role);
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
};

export const RoleGuard = ({ roles, children }: { roles: UserRole[]; children: React.ReactNode }) => {
  const { hasRole } = useApp();
  if (!hasRole(roles)) return null;
  return <>{children}</>;
};

export const PermissionGate = ({ permission, children }: { permission: string; children: React.ReactNode }) => {
  const { hasPermission } = useApp();
  if (!hasPermission(permission)) return null;
  return <>{children}</>;
};