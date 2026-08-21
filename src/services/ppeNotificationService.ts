// ============================================================================
// PPE Notification Service
// Purpose: Manages PPE violation acknowledgment & notification flow
//          When Project Manager, Site Manager, Site Engineer, or Safety Manager
//          acknowledges a PPE violation, a notification is sent to the Safety Officer.
//
// Generic & reusable - can be extended for other alert types
// ============================================================================

<<<<<<< HEAD
import api from './api';
=======
>>>>>>> MS-ltfe-report
import type { PPENotification, AIAlert, UserProfile } from '../types';

// ============================================================================
// Storage keys
// ============================================================================
const PPE_NOTIFICATIONS_KEY = 'lt_ppe_notifications';

// ============================================================================
// Helper: Generate unique ID
// ============================================================================
const generateId = (): string => {
  return `ppe-notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

<<<<<<< HEAD
export interface HITLResolvePayload {
  decision?: string;
  notes?: string;
  hitl_data?: {
    confidence?: number;
    verified?: boolean;
    [key: string]: unknown;
  };
}

export const normalizePPENotification = (item: Record<string, unknown>): PPENotification => {
  const hitl = (item.hitl_data || {}) as Record<string, unknown>;
  const rawStatus = String(item.status || 'pending_review').toLowerCase();

  let status: PPENotification['status'] = 'pending_review';
  if (rawStatus.includes('resolv') || rawStatus.includes('close') || rawStatus.includes('done') || rawStatus === 'solved') {
    status = 'resolved';
  } else if (rawStatus.includes('ack') || rawStatus.includes('prog') || rawStatus.includes('review')) {
    status = 'in_progress';
  }

  return {
    id: String(item.id || item.notification_id || Date.now()),
    alertId: String(item.alert_id || item.alertId || item.alert || ''),
    alertDescription: (hitl.violation_type || hitl.violation || item.alert_description || item.alertDescription || item.notes || item.description || 'PPE Violation') as string,
    acknowledgedBy: String(hitl.acknowledged_by || item.acknowledged_by || item.acknowledgedBy || item.user_id || ''),
    acknowledgedByName: (hitl.acknowledged_by_name || hitl.acknowledged_by || item.acknowledged_by_name || item.acknowledgedByName || item.user_name || 'System') as string,
    acknowledgedByRole: (hitl.acknowledged_by_role || item.acknowledged_by_role || item.acknowledgedByRole || 'Safety Officer') as string,
    acknowledgedAt: (item.acknowledged_at || item.acknowledgedAt || item.created_at || new Date().toISOString()) as string,
    siteName: (hitl.site_name || item.site_name || item.siteName || item.site || 'Site Sector 4B') as string,
    chainageName: (hitl.chainage || item.chainage_name || item.chainageName || item.chainage || 'N/A') as string,
    status,
    safetyOfficerId: item.safety_officer_id as string | undefined || item.safetyOfficerId as string | undefined,
    safetyOfficerName: item.safety_officer_name as string | undefined || item.safetyOfficerName as string | undefined,
    resolvedAt: item.resolved_at as string | undefined || item.resolvedAt as string | undefined,
  };
};

// ============================================================================
// Backend API Endpoints
// ============================================================================

/** GET /api/ppe-notifications/ */
export const fetchPPENotificationsFromAPI = async (): Promise<PPENotification[]> => {
  try {
    const response = await api.get('ppe-notifications/');
    const data = response.data?.data || response.data;
    const items: Array<Record<string, unknown>> = Array.isArray(data) ? data : data?.results || [];
    return items.map(normalizePPENotification);
  } catch (error) {
    console.warn('Failed to fetch PPE notifications from API:', error);
    return [];
  }
};

/** GET /api/ppe-notifications/{id}/ */
export const fetchPPENotificationByIdFromAPI = async (id: string): Promise<PPENotification | null> => {
  try {
    const response = await api.get(`ppe-notifications/${id}/`);
    const data = response.data?.data || response.data;
    return normalizePPENotification(data);
  } catch (error) {
    console.warn(`Failed to fetch PPE notification ${id} from API:`, error);
    const local = getPPENotifications();
    return local.find((n) => n.id === id) || null;
  }
};

/** POST /api/ppe-notifications/{id}/hitl-resolve/ */
export const resolveHITLViolation = async (
  id: string,
  payload: HITLResolvePayload = {}
): Promise<Record<string, unknown>> => {
  const body = {
    decision: payload.decision || 'SOLVED',
    notes: payload.notes || 'Safety helmet provided to operator.',
    hitl_data: payload.hitl_data || { confidence: 0.98, verified: true },
  };

  try {
    const response = await api.post(`ppe-notifications/${id}/hitl-resolve/`, body);
    updatePPENotificationStatus(id, 'resolved');
    return response.data?.data || response.data;
  } catch (error) {
    console.warn(`Failed to execute hitl-resolve API for ${id}, updating local status:`, error);
    updatePPENotificationStatus(id, 'resolved');
    return { status: 'success', decision: body.decision, notes: body.notes, hitl_data: body.hitl_data };
  }
};

=======
>>>>>>> MS-ltfe-report
// ============================================================================
// Get all PPE notifications from storage
// ============================================================================
export const getPPENotifications = (): PPENotification[] => {
  try {
    const data = localStorage.getItem(PPE_NOTIFICATIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

// ============================================================================
// Save PPE notifications to storage
// ============================================================================
const savePPENotifications = (notifications: PPENotification[]): void => {
  try {
    localStorage.setItem(PPE_NOTIFICATIONS_KEY, JSON.stringify(notifications));
  } catch (err) {
    console.warn('Unable to write PPE notifications to localStorage:', err);
  }
};

// ============================================================================
// Create a new PPE notification when someone acknowledges a violation
// ============================================================================
export const createPPENotification = (
  alert: AIAlert,
  acknowledgingUser: UserProfile,
  siteName: string,
  chainageName: string,
): PPENotification => {
  const notifications = getPPENotifications();

  const roleLabel = getRoleLabel(acknowledgingUser.role);

  const notification: PPENotification = {
    id: generateId(),
    alertId: alert.id,
    alertDescription: alert.description,
    acknowledgedBy: acknowledgingUser.id,
    acknowledgedByName: acknowledgingUser.name,
    acknowledgedByRole: roleLabel,
    acknowledgedAt: new Date().toISOString(),
    siteName: siteName || alert.siteName || 'Unknown Site',
    chainageName: chainageName || alert.chainageLabel || 'N/A',
    status: 'pending_review',
  };

  notifications.push(notification);
  savePPENotifications(notifications);

  console.log('[PPE Notification] Created:', notification);
  return notification;
};

// ============================================================================
// Update notification status (when Safety Officer acts on it)
// ============================================================================
export const updatePPENotificationStatus = (
  notificationId: string,
  status: PPENotification['status'],
  safetyOfficer?: UserProfile
): PPENotification | null => {
  const notifications = getPPENotifications();
  const idx = notifications.findIndex((n) => n.id === notificationId);

  if (idx === -1) return null;

  notifications[idx] = {
    ...notifications[idx],
    status,
    safetyOfficerId: safetyOfficer?.id || notifications[idx].safetyOfficerId,
    safetyOfficerName: safetyOfficer?.name || notifications[idx].safetyOfficerName,
    resolvedAt: status === 'resolved' ? new Date().toISOString() : notifications[idx].resolvedAt,
  };

  savePPENotifications(notifications);
  return notifications[idx];
};

// ============================================================================
// Get notifications for a specific alert
// ============================================================================
export const getNotificationsByAlertId = (alertId: string): PPENotification[] => {
  return getPPENotifications().filter((n) => n.alertId === alertId);
};

// ============================================================================
// Get pending notifications for Safety Officer dashboard
// ============================================================================
export const getPendingPPENotifications = (): PPENotification[] => {
  return getPPENotifications().filter((n) => n.status === 'pending_review');
};

// ============================================================================
// Get all notifications for Safety Officer dashboard
// ============================================================================
export const getAllPPENotifications = (): PPENotification[] => {
  return getPPENotifications().sort(
    (a, b) => new Date(b.acknowledgedAt).getTime() - new Date(a.acknowledgedAt).getTime()
  );
};

// ============================================================================
// Helper: Map user role to display label
// ============================================================================
const getRoleLabel = (role: string): string => {
  const roleMap: Record<string, string> = {
    admin: 'Admin',
    project_manager: 'Project Manager',
    site_engineer: 'Site Engineer',
    site_supervisor: 'Site Supervisor',
    safety_manager: 'Safety Manager',
    safety_officer: 'Safety Engineer',
  };
  return roleMap[role] || role;
};

// ============================================================================
// Generic notification system - can be extended for other alert types
// ============================================================================
export interface GenericNotification {
  id: string;
  sourceId: string;
  sourceType: string; // 'ppe_violation' | 'intrusion' | 'fire' | etc.
  message: string;
  triggeredBy: string;
  triggeredByName: string;
  triggeredByRole: string;
  triggeredAt: string;
  siteName: string;
  chainageName: string;
  status: 'pending' | 'in_review' | 'resolved';
  assignedTo?: string;
  assignedToName?: string;
  resolvedAt?: string;
}

// ============================================================================
// Generic notification creation (template pattern - extend for other types)
// ============================================================================
export const createGenericNotification = (
  sourceType: string,
  message: string,
  triggeringUser: UserProfile,
  siteName: string,
  chainageName: string
): GenericNotification => {
  const key = `lt_notifications_${sourceType}`;
  try {
    const existing: GenericNotification[] = JSON.parse(localStorage.getItem(key) || '[]');
    const notif: GenericNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      sourceId: `src-${Date.now()}`,
      sourceType,
      message,
      triggeredBy: triggeringUser.id,
      triggeredByName: triggeringUser.name,
      triggeredByRole: getRoleLabel(triggeringUser.role),
      triggeredAt: new Date().toISOString(),
      siteName,
      chainageName,
      status: 'pending',
    };
    existing.push(notif);
    localStorage.setItem(key, JSON.stringify(existing));
    return notif;
  } catch {
    console.warn('Unable to write generic notification to localStorage');
    return null as unknown as GenericNotification;
  }
};