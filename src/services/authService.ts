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

  const str = (roleStr || '').toLowerCase();
  if (str.includes('admin')) return 'admin';
  if (str.includes('project_manager') || str.includes('project manager')) return 'project_manager';
  if (str.includes('supervisor')) return 'site_supervisor';
  if (str.includes('site_engineer') || str.includes('engineer')) return 'site_engineer';
  if (str.includes('safety_manager') || str.includes('safety manager')) return 'safety_manager';
  if (str.includes('safety_officer') || str.includes('safety engineer')) return 'safety_officer';

  return 'admin';
};

export const authService = {
  async login(usernameOrEmail: string, password: string): Promise<LoginResponse> {
    const response = await api.post('auth/login/', {
      username: usernameOrEmail,
      email: usernameOrEmail,
      password,
    });
    const data = response.data?.data || response.data;
    
    // Support nested token structure or flat structure
    const access = data?.tokens?.access || data?.access || data?.access_token;
    const refresh = data?.tokens?.refresh || data?.refresh || data?.refresh_token;
    const rawUser = data?.user || data;

    const normalizedRole = mapRoleIdToUserRole(data?.role_id || rawUser?.role_id, rawUser?.role);
    const user: UserProfile = {
      id: String(rawUser?.user_id || rawUser?.id || '1'),
      name: rawUser?.employee_name || rawUser?.username || rawUser?.name || usernameOrEmail,
      email: rawUser?.email || `${usernameOrEmail}@landt.local`,
      role: normalizedRole,
      avatar: rawUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(rawUser?.username || usernameOrEmail)}&background=2563eb&color=fff`,
      workspace: rawUser?.workspace || 'L&T Operations',
      employeeId: rawUser?.employee_code || rawUser?.employeeId || 'EMP-001',
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
    if (data?.role_id || user.role) {
      sessionStorage.setItem('role_id', String(data?.role_id || user.role));
    }

    return { user, tokens: { access, refresh }, role_id: data?.role_id };
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

