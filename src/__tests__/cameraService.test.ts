import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '../services/api';
import cameraService, { formatCameraStreamUrl, normalizeCamera } from '../services/cameraService';

vi.mock('../services/api', () => {
  const mockAxios = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  };
  return { default: mockAxios };
});

describe('cameraService API Integration & Methods', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('should format camera stream URLs across all protocols and bare IPs', () => {
    expect(formatCameraStreamUrl('')).toBe('http://10.1.82.235:8080/feed/0');
    expect(formatCameraStreamUrl('   ')).toBe('http://10.1.82.235:8080/feed/0');
    expect(formatCameraStreamUrl('rtsp://10.1.82.235:8080/stream1')).toBe('http://10.1.82.235:8080/feed/0');
    expect(formatCameraStreamUrl('http://10.1.82.235:8080/feed/1')).toBe('http://10.1.82.235:8080/feed/1');
    expect(formatCameraStreamUrl('https://10.1.82.235:8080/feed/1')).toBe('https://10.1.82.235:8080/feed/1');
    expect(formatCameraStreamUrl('10.1.82.235:8080')).toBe('http://10.1.82.235:8080/feed/0');
    expect(formatCameraStreamUrl('10.1.82.235:8080/feed/2')).toBe('http://10.1.82.235:8080/feed/2');
    expect(formatCameraStreamUrl('10.1.82.235')).toBe('http://10.1.82.235:8080/feed/0');
  });

  it('should normalize raw camera items correctly', () => {
    expect(normalizeCamera(null).name).toBe('Camera');
    const normalized = normalizeCamera({
      id: 10,
      name: 'Test Cam',
      rtsp_url: '10.1.82.235:8080',
      site: { id: 2, name: 'Site 2' },
      status: 'online',
      type: 'ptz',
    });
    expect(normalized.id).toBe('10');
    expect(normalized.name).toBe('Test Cam');
    expect(normalized.siteId).toBe('2');
    expect(normalized.siteName).toBe('Site 2');
  });

  it('should fetch camera list from GET /api/cameras/', async () => {
    (api.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        success: true,
        data: [
          { id: 1, name: 'CAM-SITE-01', rtsp_url: 'rtsp://10.1.82.235:8080/feed/0', status: 'online', type: 'ptz' },
        ],
      },
    });

    const cameras = await cameraService.getCameras({ siteId: '10' });
    expect(api.get).toHaveBeenCalledWith('cameras/', { params: { siteId: '10' } });
    expect(cameras[0].name).toBe('CAM-SITE-01');
  });

  it('should fallback to local storage if GET /api/cameras/ fails', async () => {
    (api.get as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Network error'));
    const cameras = await cameraService.getCameras();
    expect(Array.isArray(cameras)).toBe(true);
  });

  it('should fetch a single camera by ID via GET /api/cameras/{id}/', async () => {
    (api.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { success: true, data: { id: 1, name: 'CAM-01', rtsp_url: '10.1.82.235:8080' } },
    });
    const cam = await cameraService.getCamera('1');
    expect(api.get).toHaveBeenCalledWith('cameras/1/');
    expect(cam.name).toBe('CAM-01');
  });

  it('should send PTZ commands using POST /api/cameras/{id}/ptz-control/', async () => {
    (api.post as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { success: true, data: { camera_id: 1, action: 'PAN_LEFT' } },
    });

    const result = await cameraService.controlPtz('1', 'PAN_LEFT', -15, 0, 1.2);
    expect(api.post).toHaveBeenCalledWith('cameras/1/ptz-control/', {
      camera_id: '1',
      action: 'PAN_LEFT',
      pan: -15,
      tilt: 0,
      zoom: 1.2,
    });
    expect(result.success).toBe(true);
  });

  it('should fallback to POST /api/cameras/ptz-control/ if {id}/ptz endpoint fails', async () => {
    (api.post as unknown as ReturnType<typeof vi.fn>)
      .mockRejectedValueOnce(new Error('404 Not Found'))
      .mockResolvedValueOnce({ data: { success: true } });

    const result = await cameraService.controlPtz('1', 'TILT_UP');
    expect(api.post).toHaveBeenCalledTimes(2);
    expect(result.success).toBe(true);
  });

  it('should create camera via POST /api/cameras/', async () => {
    (api.post as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { success: true, data: { id: 5, name: 'New Cam', rtsp_url: '10.1.82.235:8080' } },
    });

    const created = await cameraService.createCamera({ name: 'New Cam', rtspUrl: '10.1.82.235:8080', siteId: '1' });
    expect(api.post).toHaveBeenCalledWith('cameras/', expect.objectContaining({ name: 'New Cam' }));
    expect(created.name).toBe('New Cam');
  });

  it('should update camera via PUT /api/cameras/{id}/', async () => {
    (api.put as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { success: true, data: { id: 5, name: 'Updated Cam' } },
    });

    const updated = await cameraService.updateCamera('5', { name: 'Updated Cam' });
    expect(api.put).toHaveBeenCalledWith('cameras/5/', expect.objectContaining({ name: 'Updated Cam' }));
    expect(updated.name).toBe('Updated Cam');
  });

  it('should delete camera via DELETE /api/cameras/{id}/', async () => {
    (api.delete as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: { message: 'Deleted' } });
    const res = await cameraService.deleteCamera('5');
    expect(api.delete).toHaveBeenCalledWith('cameras/5/');
    expect(res.message).toBe('Camera deleted successfully');
  });
});
