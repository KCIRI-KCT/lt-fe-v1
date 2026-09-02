// ============================================================================
// User Service — OpenAPI Spec Alignment:
// GET /api/auth/profile/ (ApplicationUserProfile) & PATCH /api/employees/{employee_id}/ (PatchedEmployeeRequest)
// ============================================================================

import api from './api';
import type { UserProfile } from '../types';
import { normalizeRole } from '../utils/roleUtils';

export interface UserApiPayload {
  id?: string;
  emp_id?: string;
  empId?: string;
  employee_id?: number | string;
  employee_code?: string;
  name?: string;
  employee_name?: string;
  email?: string;
  role?: string;
  designation?: string;
  department?: string;
  phone?: string;
  mobile_number?: string;
  location?: string;
  workspace?: string;
  status?: string;
  joiningDate?: string;
  created_at?: string;
  employee?: Record<string, unknown>;
  [key: string]: unknown;
}

export const userService = {
  /**
   * GET /api/auth/profile/ or GET /api/employees/:id/ or GET /api/users/:id
   * Schema: ApplicationUserProfile (contains nested employee object)
   */
  async getUser(id?: string): Promise<UserApiPayload> {
    let raw: Record<string, unknown>;
    try {
      if (!id || id === 'profile' || id === 'current') {
        const response = await api.get('auth/profile/');
        raw = response.data?.data || response.data;
      } else {
        try {
          const response = await api.get(`employees/${id}/`);
          raw = response.data?.data || response.data;
        } catch {
          const response = await api.get(`users/${id}`);
          raw = response.data?.data || response.data;
        }
      }
    } catch {
      try {
        const response = await api.get(`users/${id}/`);
        raw = response.data?.data || response.data;
      } catch {
        const response = await api.get('auth/profile/');
        raw = response.data?.data || response.data;
      }
    }

    const empObj = (raw.employee as Record<string, unknown> | undefined) || {};
    const employee_id = (empObj.employee_id || raw.employee_id || raw.employeeId || raw.id) as number | string | undefined;
    const employee_code = String(
      empObj.employee_code || raw.employee_code || raw.emp_id || raw.empId || raw.employeeId || raw.employee_id || ''
    );

    const rawRole = String(empObj.designation || raw.role || raw.designation || '');
    const mappedRole = normalizeRole(rawRole);

    return {
      ...raw,
      id: String(raw.id || raw.user_id || id || '1'),
      employee_id,
      employee_code,
      emp_id: employee_code,
      empId: employee_code,
      name: (empObj.employee_name || raw.name || raw.employee_name || raw.username || '') as string,
      email: (empObj.email || raw.email || '') as string,
      role: mappedRole,
      designation: mappedRole,
      department: (empObj.department || raw.department || '') as string,
      phone: (empObj.mobile_number || raw.phone || raw.mobile_number || '') as string,
      location: (raw.location || '') as string,
      workspace: (raw.workspace || '') as string,
      employee: {
        employee_id,
        employee_code,
        employee_name: empObj.employee_name || raw.name || raw.employee_name,
        designation: mappedRole,
        department: empObj.department || raw.department,
        mobile_number: empObj.mobile_number || raw.phone || raw.mobile_number,
      },
    };
  },

  /**
   * Update/Sync Endpoint:
   * PATCH /api/employees/{employee_id}/ (Schema: PatchedEmployeeRequest)
   * Fallback: PUT /api/users/:id
   */
  async updateUser(id: string, payload: UserApiPayload): Promise<UserApiPayload> {
    const empObj = (payload.employee as Record<string, unknown> | undefined) || {};
    const employee_id = payload.employee_id || empObj.employee_id || payload.id || id;
    const employee_code = String(
      payload.employee_code ||
      payload.emp_id ||
      payload.empId ||
      empObj.employee_code ||
      empObj.emp_id ||
      ''
    );

    const roleVal = normalizeRole(String(payload.role || payload.designation || ''));

    const patchedEmployeePayload: Record<string, unknown> = {
      employee_code: employee_code,
      employee_name: payload.name || payload.employee_name,
      designation: roleVal,
      department: payload.department,
      email: payload.email,
      mobile_number: payload.phone || payload.mobile_number,
    };
    if (employee_id) {
      patchedEmployeePayload.employee_id = employee_id;
    }

    let response;
    if (employee_id && String(employee_id) !== 'undefined') {
      try {
        // Primary OpenAPI update spec: PATCH /api/employees/{employee_id}/
        response = await api.patch(`employees/${employee_id}/`, patchedEmployeePayload);
      } catch {
        try {
          response = await api.put(`users/${id}`, {
            ...payload,
            role: roleVal,
            designation: roleVal,
            emp_id: employee_code,
            empId: employee_code,
            employee_code,
            employee_id,
          });
        } catch {
          response = await api.put(`users/${id}/`, {
            ...payload,
            role: roleVal,
            designation: roleVal,
            emp_id: employee_code,
            empId: employee_code,
            employee_code,
            employee_id,
          });
        }
      }
    } else {
      response = await api.put(`users/${id}`, {
        ...payload,
        role: roleVal,
        designation: roleVal,
        emp_id: employee_code,
        empId: employee_code,
        employee_code,
      });
    }

    const data = response.data?.data || response.data;
    const resRole = normalizeRole(String(data?.designation || data?.role || roleVal));
    return {
      ...data,
      employee_id: data?.employee_id || employee_id,
      employee_code: data?.employee_code || employee_code,
      emp_id: data?.emp_id || data?.empId || employee_code,
      empId: data?.empId || data?.emp_id || employee_code,
      role: resRole,
      designation: resRole,
      name: data?.employee_name || data?.name || payload.name,
      email: data?.email || payload.email,
      phone: data?.mobile_number || data?.phone || payload.phone,
      department: data?.department || payload.department,
    };
  },

  /**
   * GET /api/users/
   * Fetches list of users
   */
  async getUsers(params?: Record<string, unknown>): Promise<UserProfile[]> {
    let response;
    try {
      response = await api.get('users', { params });
    } catch {
      response = await api.get('users/', { params });
    }
    const rawData = response.data?.data || response.data;
    const items: UserApiPayload[] = Array.isArray(rawData) ? rawData : rawData?.results || [];

    return items.map((u) => {
      const empIdVal = String(u.emp_id || u.empId || u.employeeId || u.employee_code || u.employee_id || '');
      return {
        id: String(u.id || u.employee_id || ''),
        name: (u.name || u.employee_name || '') as string,
        email: (u.email || '') as string,
        role: normalizeRole(String(u.role || u.designation || '')),
        employeeId: empIdVal,
        emp_id: empIdVal,
        empId: empIdVal,
        employee_id: u.employee_id,
        employee_code: u.employee_code || empIdVal,
        joiningDate: u.joiningDate || (u.created_at ? new Date(u.created_at).toISOString().split('T')[0] : '2024-01-15'),
        address: String(u.address || u.location || 'N/A'),
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent((u.name || u.employee_name || 'User') as string)}&background=2563eb&color=fff`,
        workspace: (u.workspace || 'L&T Main Site') as string,
        phone: (u.phone || u.mobile_number || '') as string,
        department: (u.department || '') as string,
        location: (u.location || '') as string,
      };
    });
  },
};

export default userService;
