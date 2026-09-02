import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '../services/api';
import { userService } from '../services/userService';

vi.mock('../services/api', () => {
  const mockAxios = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
    defaults: { headers: { 'Content-Type': 'application/json' } },
  };
  return { default: mockAxios };
});

describe('userService — OpenAPI Spec Alignment (GET /api/auth/profile/ & PATCH /api/employees/{employee_id}/)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch ApplicationUserProfile from GET /api/auth/profile/ and parse nested employee object (employee.employee_id & employee.employee_code)', async () => {
    const mockProfileResponse = {
      data: {
        success: true,
        data: {
          id: 'usr-1',
          username: 'karthee',
          email: 'karthee@lt.com',
          employee: {
            employee_id: 101,
            employee_code: 'LT-2024-001',
            employee_name: 'Kartheeswaran',
            designation: 'Admin',
            department: 'Management',
            mobile_number: '+91-9876543210',
          },
        },
      },
    };

    (api.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockProfileResponse);

    const user = await userService.getUser('profile');

    expect(api.get).toHaveBeenCalledWith('auth/profile/');
    expect(user.employee_id).toBe(101);
    expect(user.employee_code).toBe('LT-2024-001');
    expect(user.emp_id).toBe('LT-2024-001');
    expect(user.name).toBe('Kartheeswaran');
    expect(user.email).toBe('karthee@lt.com');
  });

  it('should update employee entity via PATCH /api/employees/{employee_id}/ according to PatchedEmployeeRequest schema', async () => {
    const updatePayload = {
      id: 'usr-1',
      employee_id: 101,
      employee_code: 'LT-2024-001',
      name: 'Kartheeswaran Updated',
      email: 'karthee@lt.com',
      role: 'admin',
      department: 'Management',
      phone: '+91-9876543210',
    };

    const mockPatchResponse = {
      data: {
        success: true,
        data: {
          employee_id: 101,
          employee_code: 'LT-2024-001',
          employee_name: 'Kartheeswaran Updated',
          designation: 'admin',
          department: 'Management',
          email: 'karthee@lt.com',
          mobile_number: '+91-9876543210',
        },
      },
    };

    (api.patch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockPatchResponse);

    const result = await userService.updateUser('101', updatePayload);

    expect(api.patch).toHaveBeenCalledWith(
      'employees/101/',
      expect.objectContaining({
        employee_name: 'Kartheeswaran Updated',
        designation: 'admin',
        department: 'Management',
        email: 'karthee@lt.com',
        mobile_number: '+91-9876543210',
      })
    );
    expect(result.employee_id).toBe(101);
    expect(result.employee_code).toBe('LT-2024-001');
  });

  it('should fallback and parse flat properties if employee is flat object', async () => {
    const mockFlatResponse = {
      data: {
        id: 'usr-102',
        employee_id: 102,
        employee_code: 'LT-2024-002',
        employee_name: 'Rajesh Kumar',
        email: 'rajesh@lt.com',
        designation: 'project_manager',
      },
    };

    (api.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockFlatResponse);

    const user = await userService.getUser('usr-102');

    expect(user.employee_id).toBe(102);
    expect(user.employee_code).toBe('LT-2024-002');
    expect(user.name).toBe('Rajesh Kumar');
  });

  it('should fetch list of users via getUsers() and include employee_code mapping', async () => {
    const mockUsersResponse = {
      data: {
        success: true,
        data: [
          {
            id: 'usr-101',
            employee_id: 101,
            employee_code: 'LT-2024-001',
            employee_name: 'Kartheeswaran',
            email: 'karthee@lt.com',
            role: 'admin',
          },
        ],
      },
    };

    (api.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockUsersResponse);

    const users = await userService.getUsers();

    expect(users.length).toBe(1);
    expect(users[0].emp_id).toBe('LT-2024-001');
    expect(users[0].employeeId).toBe('LT-2024-001');
  });
});
