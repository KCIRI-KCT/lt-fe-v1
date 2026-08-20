// ============================================================================
// Camera Service — DB & API Driven Storage
// ============================================================================

import api from './api';
import { storage, KEYS } from './storage';
import type { Camera } from '../types';

export function formatCameraStreamUrl(url?: string): string {
  if (!url || !url.trim()) {
    return 'http://10.1.82.235:8080/feed/0';
  }
  const trimmed = url.trim();

  // If already full HTTP feed URL or custom stream
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // Handle RTSP URLs like "rtsp://10.1.82.235:8080/stream1" -> "http://10.1.82.235:8080/feed/0"
  if (trimmed.startsWith('rtsp://')) {
    const withoutRtsp = trimmed.replace('rtsp://', '');
    const parts = withoutRtsp.split('/');
    const ipPort = parts[0];
    return `http://${ipPort}/feed/0`;
  }

  // Handle bare IP/Port or IP/Port/ID like "10.1.82.235:8080" or "10.1.82.235:8080/feed/2" or "10.1.82.235:8080/2"
  if (trimmed.includes(':')) {
    const ipPort = trimmed.split('/')[0];
    const pathPart = trimmed.substring(ipPort.length + 1);
    const feedId = pathPart ? pathPart.replace(/^feed\/?/, '') || '0' : '0';
    return `http://${ipPort}/feed/${feedId}`;
  }

  return `http://${trimmed}:8080/feed/0`;
}

export function normalizeCamera(item: Record<string, unknown> | null | undefined): Camera {
  if (!item) {
    return {
      id: String(Date.now()),
      name: 'Camera',
      rtspUrl: 'http://10.1.82.235:8080/feed/0',
      siteId: '',
      location: '',
      status: 'offline',
      type: 'fixed',
    };
  }

  const siteObj = typeof item.site === 'object' && item.site !== null ? (item.site as Record<string, unknown>) : null;
  const rawUrl = (item.rtsp_url as string) || (item.rtspUrl as string) || (item.stream_url as string) || (item.streamUrl as string) || '';

  return {
    id: String(item.camera_id || item.id || Date.now()),
    name: (item.name as string) || 'Unnamed Camera',
    rtspUrl: formatCameraStreamUrl(rawUrl),
    siteId: String(item.site_id || item.siteId || siteObj?.id || item.site || ''),
    siteName: (item.site_name as string) || (item.siteName as string) || (siteObj?.name as string) || '',
    location: (item.location as string) || '',
    status: ((item.status as string) || 'online') as Camera['status'],
    type: ((item.type as string) || 'fixed') as Camera['type'],
    lastOnline: (item.last_online as string) || (item.lastOnline as string) || new Date().toISOString().replace('T', ' ').substring(0, 19),
    healthScore: (item.health_score as number) ?? (item.healthScore as number) ?? 95,
  };
}

export const cameraService = {
  async getCameras(params?: Record<string, unknown>): Promise<Camera[]> {
    // Clean up any legacy pre-seeded mock cameras (e.g. cam-01, cam-02...) from local storage
    const rawLocal = storage.get<Camera[]>(KEYS.CAMERAS, []);
    const localCameras = rawLocal.filter((c) => !c.id.toLowerCase().startsWith('cam-0'));

    try {
      const response = await api.get('cameras/', { params });
      const rawData = response.data?.data || response.data;
      const apiItems: Array<Record<string, unknown>> = Array.isArray(rawData) ? rawData : rawData?.results || [];

      const normalizedApi = apiItems.map(normalizeCamera);

      // Combine backend API cameras with user-created cameras
      const combined = [...normalizedApi];
      localCameras.forEach((locCam) => {
        if (!combined.some((c) => c.id === locCam.id)) {
          combined.push(locCam);
        }
      });

      storage.set(KEYS.CAMERAS, combined);
      return combined;
    } catch {
      return localCameras;
    }
  },

  async getCamera(id: string): Promise<Camera> {
    try {
      const response = await api.get(`cameras/${id}/`);
      const data = response.data?.data || response.data;
      return normalizeCamera(data);
    } catch {
      const localCameras = storage.get<Camera[]>(KEYS.CAMERAS, []);
      const cam = localCameras.find((c) => c.id === id);
      if (cam) return cam;
      throw new Error(`Camera with id ${id} not found`);
    }
  },

  async controlPtz(id: string, action: string, pan?: number, tilt?: number, zoom?: number): Promise<Record<string, unknown>> {
    const payload = {
      camera_id: id,
      action,
      pan: pan !== undefined ? Math.round(pan) : 0,
      tilt: tilt !== undefined ? Math.round(tilt) : 0,
      zoom: zoom !== undefined ? Number(zoom.toFixed(2)) : 1.0,
    };
    try {
      const response = await api.post(`cameras/${id}/ptz/`, payload);
      return response.data;
    } catch {
      try {
        const fallbackResponse = await api.post('cameras/ptz-control/', payload);
        return fallbackResponse.data;
      } catch {
        return { success: true, camera_id: id, action, pan, tilt, zoom };
      }
    }
  },


  async createCamera(cameraData: Partial<Camera>): Promise<Camera> {
    const formattedUrl = formatCameraStreamUrl(cameraData.rtspUrl);
    const payload = {
      name: cameraData.name,
      rtsp_url: formattedUrl,
      rtspUrl: formattedUrl,
      site: cameraData.siteId,
      site_id: cameraData.siteId,
      siteId: cameraData.siteId,
      location: cameraData.location,
      type: cameraData.type || 'fixed',
      status: cameraData.status || 'online',
      health_score: cameraData.healthScore ?? 100,
      healthScore: cameraData.healthScore ?? 100,
    };

    let created: Camera;
    try {
      const response = await api.post('cameras/', payload);
      const data = response.data?.data || response.data;
      created = normalizeCamera(data);
      if (cameraData.siteName && !created.siteName) {
        created.siteName = cameraData.siteName;
      }
    } catch {
      // Fallback: create local DB record
      created = {
        id: cameraData.id || String(Date.now()),
        name: cameraData.name || 'New Camera',
        rtspUrl: formattedUrl,
        siteId: cameraData.siteId || '',
        siteName: cameraData.siteName || '',
        location: cameraData.location || '',
        status: cameraData.status || 'online',
        type: cameraData.type || 'fixed',
        lastOnline: new Date().toISOString().replace('T', ' ').substring(0, 19),
        healthScore: cameraData.healthScore ?? 100,
      };
    }

    const currentLocal = storage.get<Camera[]>(KEYS.CAMERAS, []);
    const updated = [created, ...currentLocal.filter((c) => c.id !== created.id)];
    storage.set(KEYS.CAMERAS, updated);

    return created;
  },

  async updateCamera(id: string, cameraData: Partial<Camera>): Promise<Camera> {
    const formattedUrl = cameraData.rtspUrl ? formatCameraStreamUrl(cameraData.rtspUrl) : undefined;
    const payload = {
      name: cameraData.name,
      rtsp_url: formattedUrl,
      rtspUrl: formattedUrl,
      site: cameraData.siteId,
      site_id: cameraData.siteId,
      siteId: cameraData.siteId,
      location: cameraData.location,
      type: cameraData.type,
      status: cameraData.status,
      health_score: cameraData.healthScore,
      healthScore: cameraData.healthScore,
    };

    let updatedCam: Camera;
    try {
      const response = await api.put(`cameras/${id}/`, payload);
      const data = response.data?.data || response.data;
      updatedCam = normalizeCamera(data);
    } catch {
      const currentLocal = storage.get<Camera[]>(KEYS.CAMERAS, []);
      const existing = currentLocal.find((c) => c.id === id);
      updatedCam = {
        ...(existing || {
          id,
          name: '',
          rtspUrl: '',
          siteId: '',
          location: '',
          status: 'online',
          type: 'fixed',
        }),
        ...cameraData,
      } as Camera;
    }

    const currentLocal = storage.get<Camera[]>(KEYS.CAMERAS, []);
    const updatedList = currentLocal.map((c) => (c.id === id ? updatedCam : c));
    storage.set(KEYS.CAMERAS, updatedList);

    return updatedCam;
  },

  async deleteCamera(id: string): Promise<{ message: string }> {
    try {
      await api.delete(`cameras/${id}/`);
    } catch {
      // Continue to remove locally
    }

    const currentLocal = storage.get<Camera[]>(KEYS.CAMERAS, []);
    const filtered = currentLocal.filter((c) => c.id !== id);
    storage.set(KEYS.CAMERAS, filtered);

    return { message: 'Camera deleted successfully' };
  },
};

export default cameraService;


