// ============================================================================
// Notification Service — Camera Alerts + System Messages
// ----------------------------------------------------------------------------
// Dedicated notification streams for the global Notification Bell:
//
// - Camera Notifications:
//     GET ai-alerts/            (schema: AIAlert)
//     GET v1/logs/              (query: is_alert=true, severity=CRITICAL)
//   Payload mapping: camera_name, site_name, type, severity, snapshot, timestamp.
//   Direct route: /cameras/{camera_id} (fallback: /cameras).
// - System Notifications:
//     GET messages/             (query: is_read=false, schema: Message)
//   Payload mapping: subject, content, sender_username, priority, timestamp.
//   Direct route: PATCH messages/{message_id}/ { is_read: true }.
//
// NOTE: PPE notification endpoints (/api/ppe-notifications/,
// /api/ppe-acknowledgements/) are deprecated and intentionally NOT referenced
// here. The legacy PPE HITL workflow lives in ppeNotificationService and is
// outside the bell's data sources.
// ============================================================================

import api from './api';
import { storage, KEYS } from './storage';
import { normalizeAIAlert } from './safetyService';
import type { Message, MessagePriority, ProjectRoleAssignment } from '../types';

export interface AllocationNotificationPayload {
  projectName: string;
  cityName: string;
  stateName: string;
  roleAssignments: ProjectRoleAssignment[];
  sites?: { siteName: string; kmMarker?: string }[];
}

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

export type CameraAlertSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface CameraNotification {
  id: string;
  cameraId: string;
  cameraName: string;
  siteName: string;
  type: string;
  severity: CameraAlertSeverity;
  snapshot: string;
  timestamp: string;
  /** Frontend monitor route for this camera. */
  route: string;
}

export interface SystemNotification {
  id: string;
  messageId: string;
  subject: string;
  content: string;
  senderUsername: string;
  priority: MessagePriority;
  timestamp: string;
  read: boolean;
}

export interface NotificationStreams {
  cameraAlerts: CameraNotification[];
  systemMessages: SystemNotification[];
}

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

const toSeverity = (raw: unknown): CameraAlertSeverity => {
  const s = String(raw || 'high').toLowerCase();
  if (s === 'critical' || s === 'crit') return 'critical';
  if (s === 'high') return 'high';
  if (s === 'medium' || s === 'med') return 'medium';
  return 'low';
};

const toString = (value: unknown, fallback = ''): string => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return fallback;
};

const cameraRouteFor = (cameraId: string): string =>
  cameraId && cameraId !== '1' ? `/cameras/${cameraId}` : '/cameras';

/** AIAlert statuses that still count as "active" for the unread badge. */
const isActiveAlertStatus = (status: string): boolean =>
  status === 'open' || status === 'new';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const normalizeLogAlert = (raw: any): CameraNotification | null => {
  if (!raw) return null;
  const cameraId = toString(raw.camera_id ?? raw.cameraId ?? raw.camera ?? '', '');
  const id = toString(raw.id ?? raw.log_id ?? raw.alert_id ?? Date.now());
  return {
    id: `log-${id}`,
    cameraId,
    cameraName: toString(raw.camera_name ?? raw.cameraName ?? raw.camera ?? 'Camera Feed', 'Camera Feed'),
    siteName: toString(raw.site_name ?? raw.siteName ?? raw.site ?? 'Site Segment', 'Site Segment'),
    type: toString(raw.type ?? raw.event_type ?? raw.alert_type ?? 'camera_event', 'camera_event'),
    severity: toSeverity(raw.severity),
    snapshot: toString(raw.snapshot ?? raw.image ?? raw.image_url ?? raw.imageUrl ?? ''),
    timestamp: toString(raw.timestamp ?? raw.created_at ?? raw.createdAt ?? new Date().toISOString()),
    route: cameraRouteFor(cameraId),
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const normalizeSystemMessage = (raw: any): SystemNotification | null => {
  if (!raw) return null;
  const id = toString(raw.id ?? raw.message_id ?? Date.now());
  return {
    id: `msg-${id}`,
    messageId: id,
    subject: toString(raw.subject ?? '(No subject)', '(No subject)'),
    content: toString(raw.content ?? raw.body ?? raw.message ?? ''),
    senderUsername: toString(raw.sender_username ?? raw.senderName ?? raw.sender_name ?? raw.sender ?? 'System', 'System'),
    priority: (toString(raw.priority ?? 'normal', 'normal').toLowerCase() || 'normal') as MessagePriority,
    timestamp: toString(raw.timestamp ?? raw.created_at ?? raw.createdAt ?? new Date().toISOString()),
    read: Boolean(raw.is_read ?? raw.read ?? false),
  };
};

// ----------------------------------------------------------------------------
// Camera Notifications
// ----------------------------------------------------------------------------

/**
 * GET /api/ai-alerts/ + GET /api/v1/logs/?is_alert=true&severity=CRITICAL
 * merged into a single CameraNotification stream (newest first).
 */
export async function getCameraNotifications(
  params?: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<CameraNotification[]> {
  const requestConfig = signal ? { params, signal } : { params };

  const [alertsRes, logsRes] = await Promise.allSettled([
    api.get('ai-alerts/', requestConfig),
    api.get('v1/logs/', {
      ...requestConfig,
      params: { is_alert: true, severity: 'CRITICAL', ...(params || {}) },
    }),
  ]);

  const notifications: CameraNotification[] = [];

  if (alertsRes.status === 'fulfilled') {
    const data = alertsRes.value.data?.data || alertsRes.value.data;
    const list: unknown[] = Array.isArray(data) ? data : data?.results || [];
    list.forEach((raw) => {
      const alert = normalizeAIAlert(raw);
      if (!alert || !alert.id) return;
      notifications.push({
        id: alert.id,
        cameraId: alert.cameraId || '',
        cameraName: alert.cameraName || 'Camera Feed',
        siteName: alert.siteName || 'Site Segment',
        type: alert.type,
        severity: toSeverity(alert.severity),
        snapshot: alert.snapshot || '',
        timestamp: alert.timestamp,
        route: cameraRouteFor(alert.cameraId || ''),
      });
    });
  }

  if (logsRes.status === 'fulfilled') {
    const data = logsRes.value.data?.data || logsRes.value.data;
    const list: unknown[] = Array.isArray(data) ? data : data?.results || [];
    list.forEach((raw) => {
      const notif = normalizeLogAlert(raw);
      if (notif) notifications.push(notif);
    });
  }

  if (alertsRes.status === 'rejected' && logsRes.status === 'rejected') {
    throw alertsRes.reason;
  }

  return notifications.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
}

/** Alias for the unread-badge count: active (open/new) critical+high alerts. */
export const isActiveCameraAlert = (notif: CameraNotification): boolean =>
  notif.severity === 'critical' || notif.severity === 'high';

// ----------------------------------------------------------------------------
// System Notifications
// ----------------------------------------------------------------------------

/**
 * GET /api/messages/?is_read=false — unread system messages.
 */
export async function getSystemNotifications(
  params?: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<SystemNotification[]> {
  const response = await api.get('messages/', {
    ...(signal ? { signal } : {}),
    params: { is_read: false, ...(params || {}) },
  });
  const data = response.data?.data || response.data;
  const list: unknown[] = Array.isArray(data) ? data : data?.results || [];
  return list
    .map(normalizeSystemMessage)
    .filter((n): n is SystemNotification => n !== null && !n.read);
}

/**
 * PATCH /api/messages/{message_id}/ { is_read: true } — mark as read.
 */
export async function markMessageRead(messageId: string): Promise<Message> {
  const response = await api.patch(`messages/${messageId}/`, { is_read: true });
  return response.data?.data || response.data;
}

// ----------------------------------------------------------------------------
// Combined streams & Allocation Dispatcher
// ----------------------------------------------------------------------------

/**
 * Dispatch system notifications to all allocated personnel when an Admin
 * creates or updates a Project / Site with role assignments.
 */
export async function dispatchAllocationNotifications(
  payload: AllocationNotificationPayload
): Promise<void> {
  const { projectName, cityName, stateName, roleAssignments, sites } = payload;
  if (!roleAssignments || roleAssignments.length === 0) return;

  const sitesSummary = sites && sites.length > 0
    ? sites.map((s) => (s.kmMarker ? `${s.siteName} (${s.kmMarker})` : s.siteName)).join(', ')
    : 'All Project Sites';

  const roleTitles: Record<string, string> = {
    project_manager: 'Project Manager',
    site_supervisor: 'Site Supervisor',
    site_engineer: 'Site Engineer',
    safety_officer: 'Safety Officer',
    safety_engineer: 'Safety Engineer',
  };

  const localMessages: Message[] = storage.get(KEYS.MESSAGES, []);

  for (const ra of roleAssignments) {
    if (!ra.userId || !ra.userName) continue;
    const roleTitle = roleTitles[ra.role] || ra.role.replace('_', ' ').toUpperCase();
    const msgId = `alloc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    
    const subject = `[Admin Allocation] Assigned as ${roleTitle} — ${projectName}`;
    const content = `Hello ${ra.userName},\n\nAdmin has allocated you as ${roleTitle} for Project '${projectName}' located at ${cityName}, ${stateName}.\n\nAllocated Site(s): ${sitesSummary}\nAssigned Site Segment: ${ra.siteName || 'All Sites'}\n\nPlease review your assigned sites and project resources in the dashboard console.`;

    const newMsg: Message & Record<string, unknown> = {
      id: msgId,
      senderId: 'admin',
      senderName: 'Admin (Super Admin)',
      sender_username: 'Admin (Super Admin)',
      receiverId: ra.userId,
      receiverName: ra.userName,
      recipient_id: ra.userId,
      subject,
      content,
      priority: 'high',
      read: false,
      is_read: false,
      timestamp: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    // 1. Send via POST /api/messages/ API endpoint
    try {
      await api.post('messages/', newMsg);
    } catch {
      // Backend api offline fallback to local storage
    }

    // 2. Persist locally for immediate Notification Bell delivery
    const exists = localMessages.some(m => String(m.id) === String(msgId));
    if (!exists) {
      localMessages.unshift(newMsg as Message);
    }
  }

  storage.set(KEYS.MESSAGES, localMessages);
}

/**
 * Fetch both streams concurrently. Never rejects when only one side fails —
 * returns whichever stream succeeded (empty array for the failed one) so the
 * drawer never freezes on partial outages. Rejects only if BOTH fail, letting
 * the caller distinguish auth/network errors (401/403) for graceful handling.
 */
export async function getNotificationStreams(signal?: AbortSignal): Promise<NotificationStreams> {
  const [cameras, system] = await Promise.allSettled([
    getCameraNotifications(undefined, signal),
    getSystemNotifications(undefined, signal),
  ]);

  if (cameras.status === 'rejected' && system.status === 'rejected') {
    throw cameras.reason;
  }

  return {
    cameraAlerts: cameras.status === 'fulfilled' ? cameras.value : [],
    systemMessages: system.status === 'fulfilled' ? system.value : [],
  };
}

export const notificationService = {
  getCameraNotifications,
  getSystemNotifications,
  markMessageRead,
  getNotificationStreams,
  dispatchAllocationNotifications,
  isActiveCameraAlert,
  isActiveAlertStatus,
};

export default notificationService;
