/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react';

export interface NotifItem {
  id: string;
  title: string;
  time: string;
  variant: 'danger' | 'warning' | 'primary' | 'success';
  path: string;
}

// ── Web Audio API: synthesise a short alert chime ───────────────────────────
function playAlertSound() {
  if (localStorage.getItem('kciri_notif_muted') === 'true') {
    return;
  }
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();

    const playTone = (freq: number, start: number, duration: number, gain: number) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
      gainNode.gain.setValueAtTime(0, ctx.currentTime + start);
      gainNode.gain.linearRampToValueAtTime(gain, ctx.currentTime + start + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    };

    // Two-tone chime: C5 → E5
    playTone(523, 0, 0.18, 0.35);
    playTone(659, 0.14, 0.22, 0.25);
  } catch {
    // AudioContext blocked — silent fallback
  }
}

// ── useNotifications hook — exported for reuse in dashboards ────────────────
// eslint-disable-next-line react-refresh/only-export-components
export function useNotifications(intervalMs = 60000) {
  void intervalMs;
  const [inlineAlert, setInlineAlert] = useState<NotifItem | null>(null);
  const [bellShake, setBellShake] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMuted, setIsMuted] = useState(() => localStorage.getItem('kciri_notif_muted') === 'true');

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      localStorage.setItem('kciri_notif_muted', String(next));
      window.dispatchEvent(new Event('storage'));
      return next;
    });
  }, []);

  const triggerNotification = useCallback((item?: Partial<NotifItem>) => {
    const notif: NotifItem = {
      id: item?.id || `notif-${Date.now()}`,
      title: item?.title || 'System Alert Notification',
      time: item?.time || 'Just now',
      variant: item?.variant || 'primary',
      path: item?.path || '/alerts',
    };

    // Bell shake
    setBellShake(true);
    setTimeout(() => setBellShake(false), 800);

    // Sound (only if not muted)
    playAlertSound();

    // Increment unread
    setUnreadCount(c => c + 1);

    // Inline alert between greeting & button
    const inlineItem = { ...notif, id: `inline-${Date.now()}` };
    setInlineAlert(inlineItem);
    setTimeout(() => setInlineAlert(null), 5000);

    // Dispatch global event for Navbar synchronization
    const event = new CustomEvent('new-app-notification', { detail: inlineItem });
    window.dispatchEvent(event);
  }, []);

  const clearUnread = useCallback(() => setUnreadCount(0), []);

  // Listen to external mute changes
  useEffect(() => {
    const syncMute = () => {
      setIsMuted(localStorage.getItem('kciri_notif_muted') === 'true');
    };
    window.addEventListener('storage', syncMute);
    return () => window.removeEventListener('storage', syncMute);
  }, []);

  return { toasts: [], inlineAlert, bellShake, unreadCount, clearUnread, triggerNotification, isMuted, toggleMute };
}

// ── Variant helpers ──────────────────────────────────────────────────────────
const VARIANT_ICON: Record<string, string> = {
  danger: 'bi-exclamation-triangle-fill',
  warning: 'bi-exclamation-circle-fill',
  primary: 'bi-info-circle-fill',
  success: 'bi-check-circle-fill',
};
const VARIANT_BG: Record<string, string> = {
  danger: '#fee2e2',
  warning: '#fef9c3',
  primary: '#eff6ff',
  success: '#f0fdf4',
};
const VARIANT_BORDER: Record<string, string> = {
  danger: '#fca5a5',
  warning: '#fde047',
  primary: '#93c5fd',
  success: '#86efac',
};
const VARIANT_COLOR: Record<string, string> = {
  danger: '#dc2626',
  warning: '#d97706',
  primary: '#2563eb',
  success: '#16a34a',
};

// ── Toast Stack (fixed top-right) ───────────────────────────────────────────
export const ToastStack = ({ toasts }: { toasts: NotifItem[] }) => (
  <div
    style={{
      position: 'fixed',
      top: '80px',
      right: '16px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      pointerEvents: 'none',
      maxWidth: '340px',
      width: '100%',
    }}
  >
    {toasts.map(t => (
      <div
        key={t.id}
        className="notif-toast"
        style={{
          background: VARIANT_BG[t.variant] || '#fff',
          border: `1.5px solid ${VARIANT_BORDER[t.variant] || '#e5e7eb'}`,
          borderRadius: '12px',
          padding: '12px 14px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.10)',
          pointerEvents: 'auto',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Progress bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: '3px',
            background: VARIANT_COLOR[t.variant],
            borderRadius: '0 0 0 12px',
            animation: 'toast-progress 5s linear forwards',
          }}
        />
        <div className="d-flex align-items-start gap-2">
          <i
            className={`bi ${VARIANT_ICON[t.variant] || 'bi-bell-fill'} mt-0.5`}
            style={{ color: VARIANT_COLOR[t.variant], fontSize: '16px', flexShrink: 0 }}
          />
          <div className="flex-grow-1">
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#111827', lineHeight: 1.4 }}>
              {t.title}
            </div>
            <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '3px' }}>
              <i className="bi bi-clock me-1" />{t.time}
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// ── Inline Alert Banner (between greeting & button) ─────────────────────────
export const InlineAlertBanner = ({ alert }: { alert: NotifItem }) => (
  <div
    className="notif-inline-alert w-100"
    style={{
      background: VARIANT_BG[alert.variant],
      border: `1.5px solid ${VARIANT_BORDER[alert.variant]}`,
      borderRadius: '10px',
      padding: '8px 12px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      fontSize: '12px',
      fontWeight: 500,
      color: '#111827',
      boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
      maxWidth: '480px',
      wordBreak: 'break-word',
    }}
  >
    <span
      style={{
        background: VARIANT_COLOR[alert.variant],
        borderRadius: '50%',
        width: '28px',
        height: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <i className={`bi ${VARIANT_ICON[alert.variant]}`} style={{ color: '#fff', fontSize: '13px' }} />
    </span>
    <div style={{ flex: '1 1 auto', minWidth: 0 }}>
      <div style={{ fontWeight: 700, color: VARIANT_COLOR[alert.variant], fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
        New Alert
      </div>
      <div style={{ marginTop: '1px', fontSize: '11px', lineHeight: 1.3 }}>{alert.title}</div>
    </div>
    <span style={{ color: '#9ca3af', fontSize: '10px', marginLeft: 'auto', whiteSpace: 'nowrap', flexShrink: 0 }}>
      {alert.time}
    </span>
  </div>
);

export const NotificationToast = ({ toasts = [] }: { toasts?: NotifItem[] }) => (
  <ToastStack toasts={toasts} />
);
