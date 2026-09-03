// ============================================================================
// useNotificationBell — polling data hook for the global Notification Bell
// ----------------------------------------------------------------------------
// Lightweight polling hook (React Query / SWR style auto-refresh without the
// extra dependency): fetches Camera + System notification streams on an
// interval, with guards so the drawer never freezes:
//
// - AbortController + request timeout per cycle (slow networks can't pile up)
// - No overlapping fetches (a cycle is skipped while one is in flight)
// - 401/403 surfaced via `isUnauthorized` instead of throwing into the UI
// - Stale data is kept on transient errors (drawer shows last good state)
// ============================================================================

import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { config } from '../config';
import {
  getCameraNotifications,
  getNotificationStreams,
  markMessageRead,
  isActiveCameraAlert,
  type CameraNotification,
  type SystemNotification,
} from '../services/notificationService';

const FETCH_TIMEOUT_MS = 10000;
const MUTED_KEY = 'kciri_notif_muted';
const DISMISSED_CAM_KEY = 'kciri_dismissed_cam_notifs';

function playBellChime() {
  if (localStorage.getItem(MUTED_KEY) === 'true') return;
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioContextClass();
    const playTone = (freq: number, start: number, duration: number, gain: number) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.connect(g);
      g.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
      g.gain.setValueAtTime(0, ctx.currentTime + start);
      g.gain.linearRampToValueAtTime(gain, ctx.currentTime + start + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    };
    playTone(523, 0, 0.18, 0.3);
    playTone(659, 0.14, 0.22, 0.22);
  } catch {
    /* silent fallback */
  }
}

const loadDismissed = (): Set<string> => {
  try {
    const saved = localStorage.getItem(DISMISSED_CAM_KEY);
    return saved ? new Set(JSON.parse(saved) as string[]) : new Set();
  } catch {
    return new Set();
  }
};

export interface UseNotificationBellResult {
  cameraAlerts: CameraNotification[];
  systemMessages: SystemNotification[];
  /** Dynamic badge: active camera alerts + unread system messages. */
  unreadCount: number;
  activeCameraCount: number;
  unreadSystemCount: number;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  /** True when the last failure was 401/403 (session / permission issue). */
  isUnauthorized: boolean;
  bellShake: boolean;
  refresh: () => void;
  dismissCameraAlert: (id: string) => void;
  clearCameraAlerts: () => void;
  markSystemRead: (messageId: string) => Promise<void>;
}

export function useNotificationBell(
  pollIntervalMs: number = config.monitoring.alertPollInterval,
  opts?: { includeSystem?: boolean },
): UseNotificationBellResult {
  // System (message) notifications are admin-only. All other roles
  // (project_manager, site_engineer, site_supervisor, safety_manager,
  // safety_officer) receive camera alerts only.
  const includeSystem = opts?.includeSystem ?? true;
  const [cameraAlerts, setCameraAlerts] = useState<CameraNotification[]>([]);
  const [systemMessages, setSystemMessages] = useState<SystemNotification[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(loadDismissed);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [bellShake, setBellShake] = useState(false);

  const inFlightRef = useRef(false);
  const mountedRef = useRef(true);
  const knownIdsRef = useRef<Set<string>>(new Set());
  const firstLoadRef = useRef(true);
  const dismissedRef = useRef(dismissed);
  dismissedRef.current = dismissed;

  const fetchStreams = useCallback(
    async (isManual = false) => {      if (inFlightRef.current) return; // skip overlapping cycles
      inFlightRef.current = true;
      if (isManual) setRefreshing(true);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

      try {
        const streams = includeSystem
          ? await getNotificationStreams(controller.signal)
          : { cameraAlerts: await getCameraNotifications(undefined, controller.signal), systemMessages: [] };
        if (!mountedRef.current) return;
        const dismissedIds = dismissedRef.current;

        const freshCameras = streams.cameraAlerts.filter((n) => !dismissedIds.has(n.id));

        if (!firstLoadRef.current) {
          const hasNew = freshCameras.some((n) => !knownIdsRef.current.has(n.id));
          if (hasNew) {
            setBellShake(true);
            setTimeout(() => {
              if (mountedRef.current) setBellShake(false);
            }, 800);
            playBellChime();
          }
        }
        freshCameras.forEach((n) => knownIdsRef.current.add(n.id));

        setCameraAlerts(freshCameras);
        setSystemMessages(streams.systemMessages);
        setError(null);
        setIsUnauthorized(false);
        firstLoadRef.current = false;
      } catch (err) {
        if (!mountedRef.current) return;
        // Aborted (timeout/unmount) — keep stale data, no error flash.
        if (axios.isCancel(err) || (err as Error)?.name === 'CanceledError') return;
        const status = axios.isAxiosError(err) ? err.response?.status : undefined;
        if (status === 401 || status === 403) {
          setIsUnauthorized(true);
          setError(
            status === 401
              ? 'Session expired. Please sign in again.'
              : 'You do not have permission to view notifications.',
          );
        } else {
          setError('Unable to refresh notifications. Showing last available data.');
        }
      } finally {
        clearTimeout(timeoutId);
        inFlightRef.current = false;
        if (mountedRef.current) {
          setLoading(false);
          if (isManual) setRefreshing(false);
        }
      }
    },
    [includeSystem],
  );

  useEffect(() => {
    mountedRef.current = true;
    fetchStreams();
    const interval = setInterval(() => fetchStreams(), pollIntervalMs);
    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, [fetchStreams, pollIntervalMs]);

  const refresh = useCallback(() => {
    setError(null);
    fetchStreams(true);
  }, [fetchStreams]);

  const persistDismissed = useCallback((ids: Set<string>) => {
    setDismissed(ids);
    try {
      localStorage.setItem(DISMISSED_CAM_KEY, JSON.stringify([...ids]));
    } catch {
      /* storage error ignored */
    }
  }, []);

  const dismissCameraAlert = useCallback(
    (id: string) => {
      const next = new Set(dismissedRef.current);
      next.add(id);
      persistDismissed(next);
      setCameraAlerts((prev) => prev.filter((n) => n.id !== id));
    },
    [persistDismissed],
  );

  const clearCameraAlerts = useCallback(() => {
    const next = new Set(dismissedRef.current);
    cameraAlerts.forEach((n) => next.add(n.id));
    persistDismissed(next);
    setCameraAlerts([]);
  }, [cameraAlerts, persistDismissed]);

  const markSystemRead = useCallback(async (messageId: string) => {
    if (!includeSystem) return;
    // Optimistic removal so the drawer feels instant on latency.
    setSystemMessages((prev) => prev.filter((m) => m.messageId !== messageId));
    try {
      await markMessageRead(messageId);
    } catch {
      // Re-sync on next poll; an explicit refresh recovers the item.
      fetchStreams();
    }
  }, [fetchStreams, includeSystem]);

  const activeCameraCount = cameraAlerts.filter(isActiveCameraAlert).length;
  const unreadSystemCount = systemMessages.length;

  return {
    cameraAlerts,
    systemMessages,
    unreadCount: activeCameraCount + unreadSystemCount,
    activeCameraCount,
    unreadSystemCount,
    loading,
    refreshing,
    error,
    isUnauthorized,
    bellShake,
    refresh,
    dismissCameraAlert,
    clearCameraAlerts,
    markSystemRead,
  };
}

export default useNotificationBell;
