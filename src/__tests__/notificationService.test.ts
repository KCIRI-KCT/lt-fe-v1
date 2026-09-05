import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '../services/api';
import notificationService, {
  getCameraNotifications,
  getSystemNotifications,
  markMessageRead,
  getNotificationStreams,
  isActiveCameraAlert,
} from '../services/notificationService';

vi.mock('../services/api', () => {
  const mockAxios = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  };
  return { default: mockAxios };
});

describe('notificationService — Camera + System streams (PPE deprecated)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('should fetch camera alerts from GET ai-alerts/ and map AIAlert payload', async () => {
    (api.get as unknown as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        data: {
          success: true,
          data: [
            {
              id: 'alt-9',
              camera_id: '7',
              camera_name: 'Gate Cam',
              site_name: 'Site A',
              type: 'helmet_violation',
              severity: 'CRITICAL',
              snapshot: 'http://img/snap.jpg',
              timestamp: '2026-09-01T10:00:00Z',
            },
          ],
        },
      })
      .mockResolvedValueOnce({ data: { success: true, data: [] } });

    const alerts = await getCameraNotifications();
    expect(api.get).toHaveBeenCalledWith('ai-alerts/', expect.anything());
    expect(alerts).toHaveLength(1);
    expect(alerts[0]).toMatchObject({
      cameraName: 'Gate Cam',
      siteName: 'Site A',
      type: 'helmet_violation',
      severity: 'critical',
      snapshot: 'http://img/snap.jpg',
      route: '/cameras/7',
    });
  });

  it('should query GET v1/logs/ with is_alert=true and severity=CRITICAL', async () => {
    (api.get as unknown as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ data: { success: true, data: [] } })
      .mockResolvedValueOnce({
        data: {
          success: true,
          data: [
            {
              id: 'log-3',
              camera_id: '4',
              camera_name: 'Yard Cam',
              site_name: 'Site B',
              event_type: 'stream_disconnect',
              severity: 'CRITICAL',
              timestamp: '2026-09-02T08:00:00Z',
            },
          ],
        },
      });

    const alerts = await getCameraNotifications();
    expect(api.get).toHaveBeenCalledWith(
      'v1/logs/',
      expect.objectContaining({ params: expect.objectContaining({ is_alert: true, severity: 'CRITICAL' }) }),
    );
    expect(alerts).toHaveLength(1);
    expect(alerts[0]).toMatchObject({ cameraName: 'Yard Cam', route: '/cameras/4' });
  });

  it('should fall back to /cameras route when camera id is unknown', async () => {
    (api.get as unknown as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        data: { success: true, data: [{ id: 'alt-1', type: 'intrusion', severity: 'HIGH' }] },
      })
      .mockResolvedValueOnce({ data: { success: true, data: [] } });

    const alerts = await getCameraNotifications();
    expect(alerts[0].route).toBe('/cameras');
  });

  it('should return the surviving stream when only one source fails', async () => {
    // ai-alerts succeeds, v1/logs fails -> resolves with ai-alerts data (empty here).
    (api.get as unknown as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ data: { success: true, data: [] } })
      .mockRejectedValueOnce(new Error('logs down'));

    const alerts = await getCameraNotifications();
    expect(alerts).toEqual([]);
  });

  it('should fetch unread system messages via GET messages/ with is_read=false', async () => {
    (api.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        success: true,
        data: [
          {
            id: 'm-1',
            subject: 'Shift handover',
            content: 'Review night logs',
            sender_username: 'supervisor_01',
            priority: 'HIGH',
            created_at: '2026-09-02T09:00:00Z',
            is_read: false,
          },
          { id: 'm-2', subject: 'Old', is_read: true },
        ],
      },
    });

    const messages = await getSystemNotifications();
    expect(api.get).toHaveBeenCalledWith(
      'messages/',
      expect.objectContaining({ params: expect.objectContaining({ is_read: false }) }),
    );
    expect(messages).toHaveLength(1);
    expect(messages[0]).toMatchObject({
      messageId: 'm-1',
      subject: 'Shift handover',
      senderUsername: 'supervisor_01',
      priority: 'high',
    });
  });

  it('should mark a message read via PATCH messages/{id}/ with { is_read: true }', async () => {
    (api.patch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { success: true, data: { id: 'm-1', is_read: true } },
    });

    await markMessageRead('m-1');
    expect(api.patch).toHaveBeenCalledWith('messages/m-1/', { is_read: true });
  });

  it('should flag critical/high camera alerts as badge-active', () => {
    expect(isActiveCameraAlert({ severity: 'critical' } as never)).toBe(true);
    expect(isActiveCameraAlert({ severity: 'high' } as never)).toBe(true);
    expect(isActiveCameraAlert({ severity: 'medium' } as never)).toBe(false);
    expect(isActiveCameraAlert({ severity: 'low' } as never)).toBe(false);
  });

  it('should reject combined streams only when both sources fail (auth errors propagate)', async () => {
    const authErr = Object.assign(new Error('Unauthorized'), { response: { status: 401 } });
    (api.get as unknown as ReturnType<typeof vi.fn>)
      .mockRejectedValueOnce(authErr)
      .mockRejectedValueOnce(authErr)
      .mockRejectedValueOnce(authErr)
      .mockRejectedValueOnce(authErr);

    await expect(getNotificationStreams()).rejects.toThrow('Unauthorized');
  });

  it('should expose no PPE endpoint references', () => {
    expect((notificationService as Record<string, unknown>)['getPPENotifications']).toBeUndefined();
    expect((notificationService as Record<string, unknown>)['acknowledgePPE']).toBeUndefined();
  });
});
