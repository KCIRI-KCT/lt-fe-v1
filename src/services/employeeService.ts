// ============================================================================
// Employee Service
// ============================================================================

import api from './api';
import type { UserProfile, UserRole } from '../types';

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
}

const mapRole = (designation?: string, dept?: string): UserRole => {
  const text = `${designation || ''} ${dept || ''}`.toLowerCase();
  if (text.includes('admin')) return 'admin';
  if (text.includes('project manager')) return 'project_manager';
  if (text.includes('site supervisor')) return 'site_supervisor';
  if (text.includes('site engineer')) return 'site_engineer';
  if (text.includes('safety manager')) return 'safety_manager';
  if (text.includes('safety officer') || text.includes('safety engineer')) return 'safety_officer';
  return 'site_engineer';
};

export const employeeService = {
  async getEmployees(params?: Record<string, unknown>): Promise<UserProfile[]> {
    const response = await api.get('employees/', { params });
    const rawData = response.data?.data || response.data;
    const items: EmployeeData[] = Array.isArray(rawData) ? rawData : rawData?.results || [];

    return items.map((emp) => ({
      id: String(emp.employee_id || emp.employee_code),
      name: emp.employee_name,
      email: emp.email,
      role: mapRole(emp.designation, emp.department),
      employeeId: emp.employee_code,
      joiningDate: emp.created_at ? new Date(emp.created_at).toISOString().split('T')[0] : '2024-01-15',
      address: emp.department || 'L&T Operations',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.employee_name)}&background=2563eb&color=fff`,
      workspace: 'L&T Main Site',
    }));
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
    const response = await api.put(`employees/${id}/`, data);
    return response.data?.data || response.data;
  },

  async deleteEmployee(id: string): Promise<{ message: string }> {
    const response = await api.delete(`employees/${id}/`);
    return response.data;
  },
};

export default employeeService;
