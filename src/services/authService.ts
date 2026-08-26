// ============================================================================
// Auth Service
// ============================================================================

import api, { clearSessionStorage } from './api';
import type { UserProfile, UserRole } from '../types';

export interface LoginResponse {
  user: UserProfile;
  tokens: {
    access: string;
    refresh: string;
  };
  role_id?: number | string;
}

const mapRoleIdToUserRole = (roleId?: number | string, roleStr?: string): UserRole => {
  const rId = Number(roleId);
  if (rId === 1) return 'admin';
  if (rId === 2) return 'project_manager';
  if (rId === 3) return 'site_supervisor';
  if (rId === 4 || rId === 5) return 'site_engineer';
  if (rId === 6) return 'safety_manager';
  if (rId === 7) return 'safety_officer';

  const str = (roleStr || '').toLowerCase().replace(/[\s_-]+/g, '');
  if (str.includes('admin')) return 'admin';
  if (str.includes('projectmanager')) return 'project_manager';
  if (str.includes('sitesupervisor') || str.includes('supervisor')) return 'site_supervisor';
  if (str.includes('siteengineer')) return 'site_engineer';
  if (str.includes('safetymanager')) return 'safety_manager';
  if (str.includes('safetyengineer') || str.includes('safetyofficer')) return 'safety_officer';
  if (str.includes('engineer')) return 'site_engineer';

  return 'admin';
};

export const authService = {
  async login(usernameOrEmail: string, password: string): Promise<LoginResponse> {
    let response: { data: unknown };
    try {
      // Primary backend login endpoint: POST /api/token/
      response = await api.post('token/', {
        username: usernameOrEmail,
        password,
      });
    } catch {
      // Fallback endpoint: POST /api/auth/login/
      response = await api.post('auth/login/', {
        username: usernameOrEmail,
        email: usernameOrEmail,
        password,
      });
    }

    const resObj = response.data as Record<string, unknown> | undefined;
    const data = (resObj?.data as Record<string, unknown> | undefined) || resObj || {};
    
    // Support nested token structure or flat structure
    const tokens = data.tokens as Record<string, string> | undefined;
    const access = String(tokens?.access || data.access || data.access_token || '');
    const refresh = String(tokens?.refresh || data.refresh || data.refresh_token || '');
    const rawUser = (data.user as Record<string, unknown> | undefined) || data;

    const roleInput = String(rawUser.role_name || rawUser.role || rawUser.username || usernameOrEmail);
    const roleIdVal = (data.role_id || rawUser.role_id) as string | number | undefined;
    const normalizedRole = mapRoleIdToUserRole(roleIdVal, roleInput);
    const user: UserProfile = {
      id: String(rawUser.user_id || rawUser.id || '1'),
      name: String(rawUser.employee_name || rawUser.username || rawUser.name || usernameOrEmail),
      email: String(rawUser.email || `${usernameOrEmail}@lt.com`),
      role: normalizedRole,
      avatar: String(rawUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(String(rawUser.username || usernameOrEmail))}&background=2563eb&color=fff`),
      workspace: String(rawUser.workspace || 'L&T Operations'),
      employeeId: String(rawUser.employee_code || rawUser.employeeId || 'EMP-001'),
    };

    if (access) {
      sessionStorage.setItem('access_token', access);
    }
    if (refresh) {
      sessionStorage.setItem('refresh_token', refresh);
    }
    if (user) {
      sessionStorage.setItem('user', JSON.stringify(user));
    }
    if (roleIdVal || user.role) {
      sessionStorage.setItem('role_id', String(roleIdVal || user.role));
    }

    return { user, tokens: { access, refresh }, role_id: roleIdVal as string | number | undefined };
  },

  async register(data: Record<string, unknown>): Promise<UserProfile> {
    const response = await api.post('auth/register/', data);
    return response.data?.data || response.data;
  },

  async getProfile(): Promise<UserProfile> {
    const response = await api.get('auth/profile/');
    const user = response.data?.data || response.data;
    if (user) {
      sessionStorage.setItem('user', JSON.stringify(user));
    }
    return user;
  },

  async requestOTP(identifier: string, purpose: string): Promise<{ message: string }> {
    const response = await api.post('auth/request-otp/', { identifier, purpose });
    return response.data;
  },

  async forgotPassword(data: { identifier: string; otp_code: string; new_password: string }): Promise<{ message: string }> {
    const response = await api.post('auth/forgot-password/', data);
    return response.data;
  },

  async forgotUsername(data: { identifier: string; otp_code: string }): Promise<{ username: string }> {
    const response = await api.post('auth/forgot-username/', data);
    return response.data?.data || response.data;
  },

  async getHealth(): Promise<{ status: string; message?: string; timestamp?: string }> {
    const response = await api.get('health/');
    return response.data;
  },

  logout(): void {
    clearSessionStorage();
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  },
};

export default authService;

