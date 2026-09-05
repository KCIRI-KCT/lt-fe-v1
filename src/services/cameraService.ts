// ============================================================================
// Camera Service — Strongly Typed OpenAPI Aligned (PaginatedCameraList)
// ============================================================================

import api from './api';
import { invalidateCameras, CAMERAS_QUERY_KEY } from '../lib/queryClient';
import type { Camera } from '../types';

// ---------------------------------------------------------------------------
// OpenAPI Exact Schemas
// ---------------------------------------------------------------------------
export interface CameraRequest {
  name: string; // minLength 1, maxLength 255
  rtsp_url: string; // minLength 1, maxLength 500 — RTSP/HTTP URL
  site: number; // valid FK site integer >0
  location?: string | null; // maxLength 255
  status?: string; // minLength 1, maxLength 20
  type?: string; // minLength 1, maxLength 50
  resolution?: string; // minLength 1, maxLength 50
  health_score?: number; // double
}

export type PatchedCameraRequest = Partial<CameraRequest>;

export interface CameraResponse {
  camera_id: number;
  site_name: string;
  name: string;
  rtsp_url: string;
  location: string | null;
  status: string;
  type: string;
  resolution: string;
  health_score: number;
  created_at: string;
  updated_at: string;
  site: number;
}

export interface PaginatedCameraList {
  count: number;
  next: string | null;
  previous: string | null;
  results: CameraResponse[];
}

// For backwards compat with StandardizedModelViewSet wrapper { success, data, message }
interface StandardizedListWrapper {
  success: boolean;
  data: CameraResponse[] | { count: number; next: string | null; previous: string | null; results: CameraResponse[] };
  message?: string;
}

// ---------------------------------------------------------------------------
// Sanitization & Validation
// ---------------------------------------------------------------------------
const RTSP_URL_REGEX = /^(rtsp|https?):\/\/.+/i;
const BARE_IP_PORT_REGEX = /^\d{1,3}(\.\d{1,3}){3}(:\d{1,5})?(\/.*)?$/;

export function isValidRtspUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed.length < 1 || trimmed.length > 500) return false;
  return RTSP_URL_REGEX.test(trimmed) || BARE_IP_PORT_REGEX.test(trimmed);
}

export function isValidSiteId(site: unknown): site is number {
  const n = Number(site);
  return Number.isInteger(n) && n > 0;
}

export function sanitizeCameraPayload(data: Partial<Camera>): CameraRequest {
  const siteNum = Number(data.siteId ?? (data as unknown as Record<string, unknown>).site);
  if (!isValidSiteId(siteNum)) {
    throw new Error('Invalid site — valid foreign key site integer >0 is required.');
  }
  const rawUrl = String(data.rtspUrl || '').trim();
  if (!isValidRtspUrl(rawUrl)) {
    throw new Error('Invalid rtsp_url — must be a valid RTSP/HTTP URL (rtsp://, http://, https:// or IP:port) 1-500 chars.');
  }
  const name = String(data.name || '').trim();
  if (name.length < 1 || name.length > 255) {
    throw new Error('Invalid name — must be 1-255 characters.');
  }
  // format to canonical feed URL but keep original validation
  const formatted = formatCameraStreamUrl(rawUrl);
  return {
    name,
    rtsp_url: formatted,
    site: siteNum,
    location: data.location ? String(data.location).slice(0, 255) : null,
    status: data.status ? String(data.status).slice(0, 20) : 'online',
    type: data.type ? String(data.type).slice(0, 50) : 'fixed',
    resolution: (data as unknown as Record<string, unknown>).resolution ? String((data as unknown as Record<string, unknown>).resolution).slice(0, 50) : '1920x1080',
    health_score: typeof data.healthScore === 'number' ? data.healthScore : 100,
  };
}

export function sanitizePatchedPayload(data: Partial<Camera>): PatchedCameraRequest {
  const out: PatchedCameraRequest = {};
  if (data.name !== undefined) {
    const v = String(data.name).trim();
    if (v.length < 1 || v.length > 255) throw new Error('Invalid name 1-255');
    out.name = v;
  }
  if (data.rtspUrl !== undefined) {
    const v = String(data.rtspUrl).trim();
    if (!isValidRtspUrl(v)) throw new Error('Invalid rtsp_url');
    out.rtsp_url = formatCameraStreamUrl(v);
  }
  if (data.siteId !== undefined || (data as unknown as Record<string, unknown>).site !== undefined) {
    const n = Number(data.siteId ?? (data as unknown as Record<string, unknown>).site);
    if (!isValidSiteId(n)) throw new Error('Invalid site FK integer');
    out.site = n;
  }
  if (data.location !== undefined) out.location = String(data.location).slice(0, 255) as unknown as string;
  if (data.status !== undefined) out.status = String(data.status).slice(0, 20);
  if (data.type !== undefined) out.type = String(data.type).slice(0, 50);
  const res = (data as unknown as Record<string, unknown>).resolution as string | undefined;
  if (res !== undefined) out.resolution = String(res).slice(0, 50);
  if (data.healthScore !== undefined) out.health_score = Number(data.healthScore);
  return out;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
export function formatCameraStreamUrl(url?: string): string {
  if (!url || !url.trim()) {
    return 'http://10.1.82.235:8080/feed/0';
  }
  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  if (trimmed.startsWith('rtsp://')) {
    const withoutRtsp = trimmed.replace('rtsp://', '');
    const parts = withoutRtsp.split('/');
    const ipPort = parts[0];
    return `http://${ipPort}/feed/0`;
  }
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
    status: ((item.status as string) || 'offline') as Camera['status'],
    type: ((item.type as string) || 'fixed') as Camera['type'],
    lastOnline: (item.last_online as string) || (item.lastOnline as string) || new Date().toISOString().replace('T', ' ').substring(0, 19),
    healthScore: (item.health_score as number) ?? (item.healthScore as number) ?? 95,
    // keep raw OpenAPI fields for reference
    camera_id: item.camera_id as number | undefined,
    site: item.site as number | undefined,
  } as unknown as Camera;
}

export async function pingCameraHealth(camera: Camera): Promise<Camera> {
  if (!camera.rtspUrl || camera.status === 'offline') {
    return { ...camera, status: 'offline', healthScore: 0 };
  }
  const startTime = Date.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    await fetch(camera.rtspUrl, { method: 'HEAD', mode: 'no-cors', signal: controller.signal });
    clearTimeout(timeoutId);
    const latency = Date.now() - startTime;
    const healthScore = Math.max(50, Math.min(100, 100 - Math.round(latency / 30)));
    return { ...camera, status: 'online', healthScore, lastOnline: new Date().toISOString().replace('T', ' ').substring(0, 19) };
  } catch {
    return { ...camera, status: 'offline', healthScore: 0 };
  }
}

export async function checkAllCamerasHealth(cameras: Camera[]): Promise<Camera[]> {
  return Promise.all(cameras.map((c) => pingCameraHealth(c)));
}

// Extract standardized error message { success: false, message }
function extractApiErrorMessage(err: unknown): string {
  const e = err as { response?: { data?: Record<string, unknown> }; message?: string };
  const data = e?.response?.data as Record<string, unknown> | undefined;
  if (data) {
    if (typeof data.message === 'string' && data.message) return data.message;
    if (typeof data.detail === 'string' && data.detail) return data.detail;
    if (typeof data.error === 'string' && data.error) return data.error;
    if (data.errors && typeof data.errors === 'object') {
      const entries = Object.entries(data.errors as Record<string, string[]>);
      const msg = entries.map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' | ');
      if (msg) return msg;
    }
    if (typeof data.success === 'boolean' && data.success === false && typeof data.message === 'string') {
      return data.message as string;
    }
  }
  if (e?.message) return e.message;
  return 'Unexpected error';
}

export const cameraService = {
  // GET /api/cameras/ — PaginatedCameraList with optional page, search, ordering, site filter
  async getCameras(params?: Record<string, unknown>): Promise<Camera[]> {
    try {
      const response = await api.get('cameras/', { params });
      const payload = response.data as StandardizedListWrapper | PaginatedCameraList | CameraResponse[];
      // Handle StandardizedModelViewSet wrapper { success, data: Paginated }
      const dataField = (payload as StandardizedListWrapper).data ?? payload;
      if (Array.isArray(dataField)) {
        return (dataField as unknown as Record<string, unknown>[]).map((r) => normalizeCamera(r as Record<string, unknown>));
      }
      const paginated = dataField as PaginatedCameraList;
      if (paginated.results && Array.isArray(paginated.results)) {
        return paginated.results.map((r) => normalizeCamera(r as unknown as Record<string, unknown>));
      }
      if (Array.isArray((payload as unknown as Record<string, unknown>).results)) {
        return ((payload as unknown as Record<string, unknown>).results as Record<string, unknown>[]).map(normalizeCamera);
      }
      return [];
    } catch (err) {
      const msg = extractApiErrorMessage(err);
      throw new Error(msg, { cause: err });
    }
  },

  // GET /api/cameras/ with pagination metadata
  async getCamerasPaginated(params?: Record<string, unknown>): Promise<PaginatedCameraList> {
    const response = await api.get('cameras/', { params });
    const payload = response.data as StandardizedListWrapper | PaginatedCameraList;
    const dataField = (payload as StandardizedListWrapper).data ?? payload;
    if (Array.isArray(dataField)) {
      const results = (dataField as unknown as CameraResponse[]);
      return { count: results.length, next: null, previous: null, results };
    }
    const paginated = dataField as PaginatedCameraList;
    if (paginated && Array.isArray(paginated.results)) return paginated;
    return { count: 0, next: null, previous: null, results: [] };
  },

  // GET /api/cameras/{camera_id}/
  async getCamera(id: string | number): Promise<Camera> {
    try {
      const response = await api.get(`cameras/${id}/`);
      const payload = response.data as { success?: boolean; data?: Record<string, unknown> } & Record<string, unknown>;
      const data = (payload.data as Record<string, unknown>) ?? payload;
      return normalizeCamera(data as Record<string, unknown>);
    } catch (err) {
      throw new Error(extractApiErrorMessage(err), { cause: err });
    }
  },

  // POST /api/cameras/
  async createCamera(cameraData: Partial<Camera>): Promise<Camera> {
    const payload = sanitizeCameraPayload(cameraData);
    try {
      const response = await api.post('cameras/', payload);
      const data = (response.data as { success?: boolean; data?: Record<string, unknown> } & Record<string, unknown>).data ?? response.data;
      const created = normalizeCamera(data as Record<string, unknown>);
      if (cameraData.siteName && !created.siteName) created.siteName = cameraData.siteName;
      // Cache invalidation — TanStack React Query
      invalidateCameras();
      return created;
    } catch (err) {
      const msg = extractApiErrorMessage(err);
      // Handle standardized { success: false, message }
      throw new Error(msg, { cause: err });
    }
  },

  // PUT/PATCH /api/cameras/{camera_id}/
  async updateCamera(id: string | number, cameraData: Partial<Camera>): Promise<Camera> {
    const payload = sanitizePatchedPayload(cameraData);
    try {
      // Prefer PUT per OpenAPI, fallback to PATCH handled by backend
      const response = await api.put(`cameras/${id}/`, payload);
      const data = (response.data as { success?: boolean; data?: Record<string, unknown> } & Record<string, unknown>).data ?? response.data;
      const updated = normalizeCamera(data as Record<string, unknown>);
      invalidateCameras();
      return updated;
    } catch (err) {
      const msg = extractApiErrorMessage(err);
      throw new Error(msg, { cause: err });
    }
  },

  async patchCamera(id: string | number, cameraData: PatchedCameraRequest): Promise<Camera> {
    try {
      const response = await api.patch(`cameras/${id}/`, cameraData);
      const data = (response.data as { data?: Record<string, unknown> } & Record<string, unknown>).data ?? response.data;
      const updated = normalizeCamera(data as Record<string, unknown>);
      invalidateCameras();
      return updated;
    } catch (err) {
      throw new Error(extractApiErrorMessage(err), { cause: err });
    }
  },

  // DELETE /api/cameras/{camera_id}/ — 204 No Content
  async deleteCamera(id: string | number): Promise<{ message: string }> {
    try {
      await api.delete(`cameras/${id}/`);
      invalidateCameras();
      return { message: 'Camera deleted successfully' };
    } catch (err) {
      const msg = extractApiErrorMessage(err);
      throw new Error(msg, { cause: err });
    }
  },

  async controlPtz(id: string | number, action: string, pan?: number, tilt?: number, zoom?: number): Promise<Record<string, unknown>> {
    const payload = {
      camera_id: Number(id) || id,
      action: action.toUpperCase(),
      pan: pan !== undefined ? Number(pan.toFixed(1)) : 0.0,
      tilt: tilt !== undefined ? Number(tilt.toFixed(1)) : 0.0,
      zoom: zoom !== undefined ? Number(zoom.toFixed(1)) : 1.0,
    };
    try {
      const response = await api.post(`cameras/${id}/ptz-control/`, payload);
      return response.data;
    } catch {
      try {
        const fallbackResponse = await api.post(`cameras/${id}/ptz/`, payload);
        return (fallbackResponse.data as Record<string, unknown>)?.data as Record<string, unknown> ?? fallbackResponse.data;
      } catch (err) {
        throw new Error(extractApiErrorMessage(err), { cause: err });
      }
    }
  },
};

export { CAMERAS_QUERY_KEY };
export default cameraService;
