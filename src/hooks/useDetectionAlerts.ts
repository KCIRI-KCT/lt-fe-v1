import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { AIAlert, AlertSeverity, AlertStatus } from '../types';
import { config } from '../config';

export type ConnectionStatus =
  | 'CONNECTING'
  | 'CONNECTED'
  | 'DISCONNECTED'
  | 'RECONNECTING'
  | 'ERROR';

export interface UseDetectionAlertsOptions {
  siteId?: string;
  wsUrl?: string;
  maxAlerts?: number;
  initialBackoffMs?: number;
  maxBackoffMs?: number;
  backoffMultiplier?: number;
  maxReconnectAttempts?: number;
  autoConnect?: boolean;
}

export interface StreamStats {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface UseDetectionAlertsReturn {
  alerts: AIAlert[];
  connectionStatus: ConnectionStatus;
  lastError: string | null;
  reconnectCount: number;
  isPaused: boolean;
  stats: StreamStats;
  reconnect: () => void;
  clearAlerts: () => void;
  pauseStream: () => void;
  resumeStream: () => void;
  togglePause: () => void;
}

/**
 * Custom React hook for high-throughput WebSocket computer vision detection alerts.
 * Features automatic reconnection with exponential backoff and stream buffering.
 */
export function useDetectionAlerts(
  siteIdOrOptions: string | UseDetectionAlertsOptions = 'all'
): UseDetectionAlertsReturn {
  const options: UseDetectionAlertsOptions = useMemo(() => {
    if (typeof siteIdOrOptions === 'string') {
      return { siteId: siteIdOrOptions };
    }
    return siteIdOrOptions;
  }, [siteIdOrOptions]);

  const {
    siteId = 'all',
    wsUrl,
    maxAlerts = 100,
    initialBackoffMs = 1000,
    maxBackoffMs = 30000,
    backoffMultiplier = 1.5,
    maxReconnectAttempts = 10,
    autoConnect = true,
  } = options;

  const [alerts, setAlerts] = useState<AIAlert[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('DISCONNECTED');
  const [lastError, setLastError] = useState<string | null>(null);
  const [reconnectCount, setReconnectCount] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const socketRef = useRef<WebSocket | null>(null);
  const backoffDelayRef = useRef<number>(initialBackoffMs);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isIntentionalDisconnectRef = useRef<boolean>(false);
  const isPausedRef = useRef<boolean>(isPaused);
  const connectRef = useRef<() => void>(() => {});

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // Calculate stream statistics based on current alert buffer
  const stats: StreamStats = useMemo(() => {
    return alerts.reduce(
      (acc, alert) => {
        acc.total += 1;
        const sev = (alert.severity || 'low').toLowerCase();
        if (sev === 'critical') acc.critical += 1;
        else if (sev === 'high') acc.high += 1;
        else if (sev === 'medium') acc.medium += 1;
        else acc.low += 1;
        return acc;
      },
      { total: 0, critical: 0, high: 0, medium: 0, low: 0 }
    );
  }, [alerts]);

  // Construct target WebSocket URL (same-origin relative proxying or explicit URL)
  const getWebSocketUrl = useCallback(() => {
    if (wsUrl) return wsUrl;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';

    let targetHost = typeof window !== 'undefined' ? window.location.host : '10.1.150.142:3000';
    try {
      if (config.apiBaseUrl && config.apiBaseUrl.startsWith('http')) {
        const url = new URL(config.apiBaseUrl);
        targetHost = url.host;
      }
    } catch {
      // fallback to same origin
    }

    return `${protocol}//${targetHost}/ws/alerts/${encodeURIComponent(siteId)}/`;
  }, [wsUrl, siteId]);

  // Normalize raw incoming payload into structured AIAlert
  const parseAlertData = useCallback((rawData: unknown): AIAlert[] => {
    try {
      let dataPayload = rawData;
      if (typeof rawData === 'string') {
        dataPayload = JSON.parse(rawData);
      }

      // If wrapped in message container: { type: 'detection_alert', data: {...} }
      if (
        typeof dataPayload === 'object' &&
        dataPayload !== null &&
        'data' in dataPayload &&
        'type' in dataPayload &&
        (dataPayload as { type: string }).type === 'detection_alert'
      ) {
        dataPayload = (dataPayload as { data: unknown }).data;
      }

      const items = Array.isArray(dataPayload) ? dataPayload : [dataPayload];

      return items
        .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
        .map((item, idx) => {
          const timestamp =
            typeof item.timestamp === 'string'
              ? item.timestamp
              : new Date().toISOString();

          const severity: AlertSeverity = ['critical', 'high', 'medium', 'low'].includes(
            String(item.severity).toLowerCase()
          )
            ? (String(item.severity).toLowerCase() as AlertSeverity)
            : 'medium';

          const status: AlertStatus = ['new', 'open', 'acknowledged', 'resolved', 'dismissed'].includes(
            String(item.status).toLowerCase()
          )
            ? (String(item.status).toLowerCase() as AlertStatus)
            : 'new';

          return {
            id: String(item.id || `alert-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`),
            cameraId: String(item.cameraId || item.camera_id || 'CAM-01'),
            cameraName: item.cameraName ? String(item.cameraName) : item.camera_name ? String(item.camera_name) : undefined,
            siteId: String(item.siteId || item.site_id || siteId),
            siteName: item.siteName ? String(item.siteName) : item.site_name ? String(item.site_name) : undefined,
            type: (item.type || item.alert_type || 'no_ppe') as AIAlert['type'],
            severity,
            timestamp,
            snapshot: item.snapshot ? String(item.snapshot) : item.image_url ? String(item.image_url) : undefined,
            description: String(item.description || item.message || 'Detection alert triggered'),
            status,
            confidence: typeof item.confidence === 'number' ? item.confidence : undefined,
            boundingBox:
              typeof item.boundingBox === 'object' && item.boundingBox !== null
                ? (item.boundingBox as AIAlert['boundingBox'])
                : typeof item.bounding_box === 'object' && item.bounding_box !== null
                ? (item.bounding_box as AIAlert['boundingBox'])
                : undefined,
          };
        });
    } catch (err) {
      console.error('[useDetectionAlerts] Failed to parse WebSocket message payload:', err);
      return [];
    }
  }, [siteId]);

  // Connect to WebSocket with auto-retry
  const connect = useCallback(() => {
    if (socketRef.current) {
      if (
        socketRef.current.readyState === WebSocket.OPEN ||
        socketRef.current.readyState === WebSocket.CONNECTING
      ) {
        return;
      }
      socketRef.current.close();
    }

    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current as ReturnType<typeof setTimeout>);
      reconnectTimerRef.current = null;
    }

    isIntentionalDisconnectRef.current = false;
    setConnectionStatus((prev) => (prev === 'DISCONNECTED' ? 'CONNECTING' : 'RECONNECTING'));

    const url = getWebSocketUrl();

    try {
      const ws = new WebSocket(url);
      socketRef.current = ws;

      ws.onopen = () => {
        setConnectionStatus('CONNECTED');
        setLastError(null);
        setReconnectCount(0);
        backoffDelayRef.current = initialBackoffMs;
      };

      ws.onmessage = (event: MessageEvent) => {
        if (isPausedRef.current) return;

        const newAlerts = parseAlertData(event.data);
        if (newAlerts.length > 0) {
          setAlerts((prev) => {
            const updated = [...newAlerts, ...prev];
            return updated.slice(0, maxAlerts);
          });
        }
      };

      ws.onerror = (event) => {
        console.warn('[useDetectionAlerts] WebSocket error observed:', event);
        setLastError('WebSocket connection error occurred');
      };

      ws.onclose = () => {
        socketRef.current = null;

        if (isIntentionalDisconnectRef.current) {
          setConnectionStatus('DISCONNECTED');
          return;
        }

        setReconnectCount((prevCount) => {
          const nextCount = prevCount + 1;

          if (nextCount > maxReconnectAttempts) {
            setConnectionStatus('ERROR');
            setLastError(`Max reconnect attempts (${maxReconnectAttempts}) reached.`);
            return prevCount;
          }

          setConnectionStatus('RECONNECTING');

          const currentDelay = backoffDelayRef.current;
          const nextDelay = Math.min(currentDelay * backoffMultiplier, maxBackoffMs);
          backoffDelayRef.current = nextDelay;

          reconnectTimerRef.current = setTimeout(() => {
            connectRef.current();
          }, currentDelay);

          return nextCount;
        });
      };
    } catch (err) {
      console.error('[useDetectionAlerts] Exception establishing WebSocket connection:', err);
      setConnectionStatus('ERROR');
      setLastError(err instanceof Error ? err.message : 'Connection failed');
    }
  }, [
    getWebSocketUrl,
    initialBackoffMs,
    maxAlerts,
    maxBackoffMs,
    backoffMultiplier,
    maxReconnectAttempts,
    parseAlertData,
  ]);

  const disconnect = useCallback(() => {
    isIntentionalDisconnectRef.current = true;
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current as ReturnType<typeof setTimeout>);
      reconnectTimerRef.current = null;
    }
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    setConnectionStatus('DISCONNECTED');
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    setReconnectCount(0);
    backoffDelayRef.current = initialBackoffMs;
    connect();
  }, [connect, disconnect, initialBackoffMs]);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  const pauseStream = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resumeStream = useCallback(() => {
    setIsPaused(false);
  }, []);

  const togglePause = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    if (autoConnect) {
      timer = setTimeout(() => {
        connect();
      }, 0);
    }

    return () => {
      if (timer) clearTimeout(timer);
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    alerts,
    connectionStatus,
    lastError,
    reconnectCount,
    isPaused,
    stats,
    reconnect,
    clearAlerts,
    pauseStream,
    resumeStream,
    togglePause,
  };
}
