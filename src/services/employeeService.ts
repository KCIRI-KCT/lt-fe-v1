// ============================================================================
// Employee Service
// ============================================================================

import api from './api';
import type { UserProfile } from '../types';
import { normalizeRole } from '../utils/roleUtils';

export interface EmployeeData {
  employee_id: number;
  employee_code: string;
  employee_name: string;
  designation: string;
  department: string;
  email: string;
  mobile_number: string;
  status: string;
  created_at?: string;
  role?: string;
  address?: string;
  location?: string;
  phone?: string;
}

export const employeeService = {
  async getEmployees(params?: Record<string, unknown>): Promise<UserProfile[]> {
    const response = await api.get('employees/', { params });
    const rawData = response.data?.data || response.data;
    const items: EmployeeData[] = Array.isArray(rawData) ? rawData : rawData?.results || [];

    return items.map((emp) => {
      const phoneVal = String(emp.mobile_number || emp.phone || '');
      const locationVal = String(emp.location || emp.address || '');
      return {
        id: String(emp.employee_id || emp.employee_code),
        name: emp.employee_name,
        email: emp.email,
        role: normalizeRole(emp.designation, emp.department),
        employeeId: emp.employee_code,
        joiningDate: emp.created_at ? new Date(emp.created_at).toISOString().split('T')[0] : '2024-01-15',
        phone: phoneVal,
        mobile_number: phoneVal,
        location: locationVal,
        address: locationVal || 'N/A',
        department: emp.department || 'N/A',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.employee_name)}&background=2563eb&color=fff`,
        workspace: 'L&T Main Site',
      };
    });
  },

  async getEmployee(id: string): Promise<EmployeeData> {
    const response = await api.get(`employees/${id}/`);
    return response.data?.data || response.data;
  },

  async createEmployee(data: Partial<EmployeeData>): Promise<EmployeeData> {
    const response = await api.post('employees/', data);
    return response.data?.data || response.data;
  },

  async updateEmployee(id: string, data: Partial<EmployeeData>): Promise<EmployeeData> {
    const rawData = data as Record<string, unknown>;
    const employee_code = String(
      data.employee_code ||
      rawData.emp_id ||
      rawData.empId ||
      rawData.employeeId ||
      `EMP-${id}`
    );

    const payload = {
      ...data,
      employee_code,
      mobile_number: data.mobile_number || data.phone || rawData.mobile_number || rawData.phone,
      location: data.location || data.address || rawData.location || rawData.address,
    };

    let response;
    try {
      response = await api.put(`employees/${id}/`, payload);
    } catch {
      response = await api.patch(`employees/${id}/`, payload);
    }
    return response.data?.data || response.data;
  },

  async deleteEmployee(id: string): Promise<{ message: string }> {
    const response = await api.delete(`employees/${id}/`);
    return response.data;
  },
};

export default employeeService;
