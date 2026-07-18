// ============================================================================
// PPE Notification Service
// Purpose: Manages PPE violation acknowledgment & notification flow
//          When Project Manager, Site Manager, Site Engineer, or Safety Manager
//          acknowledges a PPE violation, a notification is sent to the Safety Officer.
//
// Generic & reusable - can be extended for other alert types
// ============================================================================

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
    safety_officer: 'Safety Officer',
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