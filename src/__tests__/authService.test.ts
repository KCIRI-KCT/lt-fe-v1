import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '../services/api';
import authService from '../services/authService';

vi.mock('../services/api', () => {
  const mockAxios = {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  };
  return {
    default: mockAxios,
    clearSessionStorage: vi.fn(() => {
      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('refresh_token');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('role_id');
    }),
  };
});

describe('authService API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it('should authenticate user and map role IDs correctly on login', async () => {
    const mockLoginSuccess = {
      data: {
        status: 'success',
        message: 'Login successful.',
        data: {
          user_id: 1,
          username: 'admin_user',
          role_id: 1,
          account_status: 'ACTIVE',
          employee: {
            employee_id: 101,
            employee_code: 'EMP1001',
            employee_name: 'John Doe',
          },
          tokens: {
            access: 'fake_access_token_123',
            refresh: 'fake_refresh_token_456',
          },
        },
      },
    };

    (api.post as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockLoginSuccess);

    const result = await authService.login('admin_user', 'SecurePassword123!');

    expect(api.post).toHaveBeenCalledWith('auth/login/', {
      username: 'admin_user',
      email: 'admin_user',
      password: 'SecurePassword123!',
    });
    expect(result.tokens.access).toBe('fake_access_token_123');
    expect(result.tokens.refresh).toBe('fake_refresh_token_456');
    expect(result.user.role).toBe('admin');
    expect(sessionStorage.getItem('access_token')).toBe('fake_access_token_123');
  });

  it('should handle role mapping fallback strings when role_id is not 1', async () => {
    (api.post as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        access: 'acc_123',
        refresh: 'ref_456',
        user: { id: 2, name: 'Project Mgr', role: 'Project Manager', role_id: 2 },
      },
    });

    const res = await authService.login('pm_user', 'pass');
    expect(res.user.role).toBe('project_manager');
  });

  it('should register a new user via POST /api/auth/register/', async () => {
    (api.post as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { status: 'success', data: { id: '10', username: 'newuser' } },
    });

    const user = await authService.register({ username: 'newuser', password: 'password123' });
    expect(api.post).toHaveBeenCalledWith('auth/register/', { username: 'newuser', password: 'password123' });
    expect(user.id).toBe('10');
  });

  it('should fetch profile via GET /api/auth/profile/', async () => {
    (api.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { status: 'success', data: { id: '1', name: 'John Doe', role: 'admin' } },
    });

    const profile = await authService.getProfile();
    expect(api.get).toHaveBeenCalledWith('auth/profile/');
    expect(profile.name).toBe('John Doe');
  });

  it('should request OTP via POST /api/auth/request-otp/', async () => {
    (api.post as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { status: 'success', message: 'OTP sent' },
    });

    const res = await authService.requestOTP('EMP1001', 'password_reset');
    expect(api.post).toHaveBeenCalledWith('auth/request-otp/', { identifier: 'EMP1001', purpose: 'password_reset' });
    expect(res.message).toBe('OTP sent');
  });

  it('should execute forgotPassword and forgotUsername calls', async () => {
    (api.post as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { message: 'Password reset successful' },
    });
    const fp = await authService.forgotPassword({ identifier: 'EMP1', otp_code: '123456', new_password: 'new' });
    expect(fp.message).toBe('Password reset successful');

    (api.post as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { status: 'success', data: { username: 'retrieved_user' } },
    });
    const fu = await authService.forgotUsername({ identifier: 'EMP1', otp_code: '123456' });
    expect(fu.username).toBe('retrieved_user');
  });

  it('should check system operational health via GET /api/health/', async () => {
    (api.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { status: 'operational', message: 'API systems normal' },
    });

    const health = await authService.getHealth();
    expect(api.get).toHaveBeenCalledWith('health/');
    expect(health.status).toBe('operational');
  });

  it('should clear session storage on logout', () => {
    sessionStorage.setItem('access_token', 'token');
    authService.logout();
    expect(sessionStorage.getItem('access_token')).toBeNull();
  });
});
