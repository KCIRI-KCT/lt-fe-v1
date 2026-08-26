import React, { act } from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { useDetectionAlerts } from '../hooks/useDetectionAlerts';
import type { UseDetectionAlertsReturn, UseDetectionAlertsOptions } from '../hooks/useDetectionAlerts';

// Mock WebSocket implementation for unit tests
class MockWebSocket {
  static instances: MockWebSocket[] = [];
  url: string;
  readyState: number = WebSocket.CONNECTING;
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onclose: ((event: { code: number; reason: string }) => void) | null = null;

  constructor(url: string) {
    this.url = url;
    MockWebSocket.instances.push(this);
  }

  close() {
    this.readyState = WebSocket.CLOSED;
    if (this.onclose) {
      this.onclose({ code: 1000, reason: 'Normal closure' });
    }
  }

  simulateOpen() {
    this.readyState = WebSocket.OPEN;
    if (this.onopen) this.onopen();
  }

  simulateMessage(data: unknown) {
    if (this.onmessage) {
      this.onmessage({ data: typeof data === 'string' ? data : JSON.stringify(data) });
    }
  }

  simulateError(errEvent: Event = new Event('error')) {
    if (this.onerror) this.onerror(errEvent);
  }
}

describe('useDetectionAlerts Hook', () => {
  const originalWebSocket = globalThis.WebSocket;
  let container: HTMLDivElement | null = null;
  let root: Root | null = null;

  beforeEach(() => {
    (globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    MockWebSocket.instances = [];
    // @ts-expect-error Mocking global WebSocket
    globalThis.WebSocket = MockWebSocket;
    vi.useFakeTimers();

    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    if (root) {
      act(() => {
        root?.unmount();
      });
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
    globalThis.WebSocket = originalWebSocket;
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  function renderHookHelper(options: UseDetectionAlertsOptions = { siteId: 'site-42' }) {
    const hookRef: { current: UseDetectionAlertsReturn | null } = { current: null };

    function TestComponent() {
      hookRef.current = useDetectionAlerts(options);
      return null;
    }

    act(() => {
      root?.render(<TestComponent />);
    });

    return hookRef;
  }

  it('should initialize with default state and attempt WebSocket connection', () => {
    const hookRef = renderHookHelper({ siteId: 'site-42' });

    expect(hookRef.current?.connectionStatus).toBe('CONNECTING');
    expect(hookRef.current?.alerts).toEqual([]);
    expect(hookRef.current?.lastError).toBeNull();

    expect(MockWebSocket.instances.length).toBe(1);
    expect(MockWebSocket.instances[0].url).toContain('/ws/alerts/site-42/');
  });

  it('should transition to CONNECTED on WebSocket open', () => {
    const hookRef = renderHookHelper({ siteId: 'site-1' });
    const wsInstance = MockWebSocket.instances[0];

    act(() => {
      wsInstance.simulateOpen();
    });

    expect(hookRef.current?.connectionStatus).toBe('CONNECTED');
    expect(hookRef.current?.lastError).toBeNull();
  });

  it('should receive and parse detection alert messages into alerts state', () => {
    const hookRef = renderHookHelper({ siteId: 'site-1' });
    const wsInstance = MockWebSocket.instances[0];

    act(() => {
      wsInstance.simulateOpen();
    });

    const mockAlert = {
      id: 'alert-001',
      cameraId: 'CAM-05',
      type: 'helmet_violation',
      severity: 'critical',
      description: 'Worker missing helmet near crane zone',
      confidence: 0.94,
    };

    act(() => {
      wsInstance.simulateMessage({ type: 'detection_alert', data: mockAlert });
    });

    expect(hookRef.current?.alerts.length).toBe(1);
    expect(hookRef.current?.alerts[0].id).toBe('alert-001');
    expect(hookRef.current?.alerts[0].severity).toBe('critical');
    expect(hookRef.current?.stats.critical).toBe(1);
    expect(hookRef.current?.stats.total).toBe(1);
  });

  it('should clear alerts when clearAlerts is called', () => {
    const hookRef = renderHookHelper({ siteId: 'site-1' });
    const wsInstance = MockWebSocket.instances[0];

    act(() => {
      wsInstance.simulateOpen();
      wsInstance.simulateMessage({ id: 'a1', severity: 'high', description: 'Vest missing' });
    });

    expect(hookRef.current?.alerts.length).toBe(1);

    act(() => {
      hookRef.current?.clearAlerts();
    });

    expect(hookRef.current?.alerts.length).toBe(0);
  });

  it('should pause and resume incoming stream updates', () => {
    const hookRef = renderHookHelper({ siteId: 'site-1' });
    const wsInstance = MockWebSocket.instances[0];

    act(() => {
      wsInstance.simulateOpen();
      hookRef.current?.pauseStream();
    });

    expect(hookRef.current?.isPaused).toBe(true);

    act(() => {
      wsInstance.simulateMessage({ id: 'a1', severity: 'low', description: 'Test alert' });
    });

    expect(hookRef.current?.alerts.length).toBe(0);

    act(() => {
      hookRef.current?.resumeStream();
    });

    expect(hookRef.current?.isPaused).toBe(false);
  });
});
