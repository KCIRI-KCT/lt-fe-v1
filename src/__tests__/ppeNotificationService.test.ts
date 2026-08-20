import { describe, it, expect, beforeEach, vi } from 'vitest';
import api from '../services/api';
import {
  getPPENotifications,
  createPPENotification,
  updatePPENotificationStatus,
  getNotificationsByAlertId,
  getPendingPPENotifications,
  getAllPPENotifications,
  createGenericNotification,
  resolveHITLViolation,
} from '../services/ppeNotificationService';
import type { AIAlert, UserProfile } from '../types';

vi.mock('../services/api', () => {
  const mockAxios = {
    get: vi.fn(),
    post: vi.fn().mockResolvedValue({ data: { status: 'success', decision: 'SOLVED' } }),
    put: vi.fn(),
    delete: vi.fn(),
  };
  return { default: mockAxios };
});

describe('ppeNotificationService Unit Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const mockAlert: AIAlert = {
    id: 'alt-100',
    cameraId: 'cam-1',
    siteId: 'site-1',
    type: 'no_ppe',
    severity: 'high',
    timestamp: '2026-08-17T10:00:00Z',
    description: 'No protective helmet detected',
    status: 'new',
  };

  const mockUser: UserProfile = {
    id: 'user-1',
    name: 'Rajesh Kumar',
    email: 'rajesh@lt.com',
    role: 'project_manager',
    avatar: '',
    workspace: 'LT',
  };

  it('should create and retrieve PPE notifications', () => {
    expect(getPPENotifications()).toHaveLength(0);

    const notif = createPPENotification(mockAlert, mockUser, 'Site A', 'KM 45');
    expect(notif.alertId).toBe('alt-100');
    expect(notif.acknowledgedByName).toBe('Rajesh Kumar');
    expect(notif.acknowledgedByRole).toBe('Project Manager');

    const all = getAllPPENotifications();
    expect(all).toHaveLength(1);

    const pending = getPendingPPENotifications();
    expect(pending).toHaveLength(1);

    const byAlert = getNotificationsByAlertId('alt-100');
    expect(byAlert).toHaveLength(1);
  });

  it('should update PPE notification status when reviewed by Safety Officer', () => {
    const notif = createPPENotification(mockAlert, mockUser, 'Site A', 'KM 45');
    const officer: UserProfile = {
      id: 'so-1',
      name: 'Deepa Officer',
      email: 'deepa@lt.com',
      role: 'safety_officer',
      avatar: '',
      workspace: 'LT',
    };

    const updated = updatePPENotificationStatus(notif.id, 'resolved', officer);
    expect(updated?.status).toBe('resolved');
    expect(updated?.safetyOfficerName).toBe('Deepa Officer');
    expect(getPendingPPENotifications()).toHaveLength(0);
  });

  it('should create generic notifications for other alert types', () => {
    const genNotif = createGenericNotification('intrusion', 'Perimeter breached', mockUser, 'Site B', 'KM 78');
    expect(genNotif.sourceType).toBe('intrusion');
    expect(genNotif.triggeredByName).toBe('Rajesh Kumar');
  });

  it('should resolve HITL violation via API call', async () => {
    const res = await resolveHITLViolation('123', {
      decision: 'SOLVED',
      notes: 'Helmet provided',
    });
    expect(api.post).toHaveBeenCalledWith('ppe-notifications/123/hitl-resolve/', {
      decision: 'SOLVED',
      notes: 'Helmet provided',
      hitl_data: { confidence: 0.98, verified: true },
    });
    expect(res).toBeDefined();
    expect(res.decision).toBe('SOLVED');
  });
});
