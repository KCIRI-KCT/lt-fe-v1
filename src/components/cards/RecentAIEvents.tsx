import type { AIAlert } from '../../types';
import { Link } from 'react-router-dom';

interface RecentAIEventsProps {
  alerts: AIAlert[];
  className?: string;
}

const SEVERITY_MAP: Record<string, { cls: string; badge: string; icon: string }> = {
  critical: { cls: 'text-danger',  badge: 'text-bg-danger',  icon: 'bi-exclamation-octagon-fill' },
  high:     { cls: 'text-warning', badge: 'text-bg-warning', icon: 'bi-exclamation-triangle-fill' },
  medium:   { cls: 'text-primary', badge: 'text-bg-primary', icon: 'bi-info-circle-fill' },
  low:      { cls: 'text-secondary',badge: 'text-bg-secondary',icon: 'bi-dash-circle-fill' },
};

const TYPE_LABELS: Record<string, string> = {
  helmet_violation:  'Helmet Violation',
  vest_violation:    'Vest Violation',
  fall_detected:     'Fall Detected',
  restricted_zone:   'Restricted Zone',
  fire_detected:     'Fire Detected',
  mask_violation:    'Mask Violation',
  worker_count:      'Worker Count',
  smoke_detected:    'Smoke Detected',
};

const timeAgo = (iso: string): string => {
  const diff = (Date.now() - new Date(iso).getTime()) / 60000;
  if (diff < 1) return 'just now';
  if (diff < 60) return `${Math.floor(diff)}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
};

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  new:          { label: 'New',          cls: 'text-bg-danger' },
  acknowledged: { label: 'Acknowledged', cls: 'text-bg-warning' },
  resolved:     { label: 'Resolved',     cls: 'text-bg-success' },
  dismissed:    { label: 'Dismissed',    cls: 'text-bg-secondary' },
};

export const RecentAIEvents = ({ alerts, className = '' }: RecentAIEventsProps) => {
  const sorted = [...alerts].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  ).slice(0, 6);

  return (
    <div className={`panel ${className}`}>
      <div className="panel-header">
        <div>
          <h2 className="h5 mb-1 section-title">
            <i className="bi bi-robot" aria-hidden="true" />
            <span>Recent AI Events</span>
          </h2>
          <p className="text-muted mb-0">Latest alerts from AI monitoring</p>
        </div>
        <Link className="btn btn-outline-secondary btn-sm" to="/ai-monitoring">
          View All
        </Link>
      </div>

      <div className="d-grid gap-2" style={{ maxHeight: 340, overflowY: 'auto' }}>
        {sorted.length === 0 && (
          <p className="text-muted text-center py-4 mb-0">No recent AI events.</p>
        )}
        {sorted.map((alert) => {
          const sev = SEVERITY_MAP[alert.severity] ?? SEVERITY_MAP.low;
          const st  = STATUS_MAP[alert.status]   ?? STATUS_MAP.new;
          return (
            <div
              key={alert.id}
              className="d-flex align-items-start gap-3 p-2 rounded"
              style={{ background: 'var(--admin-surface, #f8fafc)' }}
            >
              {/* Icon */}
              <span
                className={`flex-shrink-0 d-flex align-items-center justify-content-center rounded-circle ${sev.badge}`}
                style={{ width: 32, height: 32, fontSize: '0.8rem' }}
              >
                <i className={`bi ${sev.icon}`} />
              </span>

              {/* Content */}
              <div className="flex-grow-1 min-width-0">
                <div className="d-flex justify-content-between align-items-start gap-1">
                  <p className="fw-semibold mb-0 small text-truncate">
                    {TYPE_LABELS[alert.type] ?? alert.type}
                  </p>
                  <span className={`badge ${st.cls} flex-shrink-0`} style={{ fontSize: '0.65rem' }}>
                    {st.label}
                  </span>
                </div>
                <p className="text-muted mb-1 small" style={{ fontSize: '0.75rem', lineHeight: 1.3 }}>
                  {alert.description}
                </p>
                <div className="d-flex gap-2 small text-muted" style={{ fontSize: '0.7rem' }}>
                  <span><i className="bi bi-camera-video me-1" />{alert.cameraName}</span>
                  <span>·</span>
                  <span><i className="bi bi-clock me-1" />{timeAgo(alert.timestamp)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
