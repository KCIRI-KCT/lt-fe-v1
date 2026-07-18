// ============================================================================
// NotificationListTemplate - Reusable template for displaying notifications
// Can be extended for PPE violations, intrusion alerts, fire alerts, etc.
// ============================================================================

// ============================================================================
// Generic notification item interface
// ============================================================================
export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  sourceType: string;
  sourceTypeLabel: string;
  sourceTypeIcon: string;
  sourceTypeColor: string;
  triggeredByName: string;
  triggeredByRole: string;
  siteName: string;
  chainageName: string;
  timestamp: string;
  status: string;
  statusLabel: string;
  statusColor: string;
}

// ============================================================================
// Props for the template
// ============================================================================
interface NotificationListTemplateProps {
  title: string;
  subtitle: string;
  icon: string;
  iconColor: string;
  notifications: NotificationItem[];
  stats: Array<{ label: string; count: number; icon: string; color: string; bgColor: string }>;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  statusOptions: Array<{ value: string; label: string }>;
  actionButtons?: (notification: NotificationItem) => React.ReactNode;
  isDark?: boolean;
  emptyMessage?: string;
  emptyFilterMessage?: string;
}

// ============================================================================
// Helpers
// ============================================================================
const getTimeAgo = (timestamp: string): string => {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const formatDate = (iso: string): string => {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
};

// ============================================================================
// Component
// ============================================================================
export const NotificationListTemplate = ({
  title,
  subtitle,
  icon,
  iconColor,
  notifications,
  stats,
  statusFilter,
  onStatusFilterChange,
  statusOptions,
  actionButtons,
  isDark = false,
  emptyMessage = 'No notifications found.',
  emptyFilterMessage = 'No notifications in this status.',
}: NotificationListTemplateProps) => {
  const isFiltered = statusFilter !== 'all';

  return (
    <div className="container-fluid px-3 px-lg-4 py-4">
      {/* Page Header */}
      <div className="page-heading mb-4">
        <div className="page-heading-copy">
          <span className="page-icon">
            <i className={`${icon} ${iconColor}`} aria-hidden="true" />
          </span>
          <div>
            <p className="eyebrow mb-1">{subtitle}</p>
            <h1 className="h3 mb-1">{title}</h1>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="col-sm-6 col-md-3">
            <div className={`card border-0 shadow-sm h-100 ${isDark ? 'bg-dark text-white' : ''}`}>
              <div className="card-body d-flex align-items-center gap-3">
                <div
                  className="rounded-circle p-3 d-flex align-items-center justify-content-center"
                  style={{ width: '48px', height: '48px', background: stat.bgColor }}
                >
                  <i className={`${stat.icon} fs-5`} style={{ color: stat.color }} />
                </div>
                <div>
                  <h6 className={`fw-bold mb-0 ${isDark ? 'text-white' : 'text-dark'}`}>
                    {stat.count}
                  </h6>
                  <small className="text-muted">{stat.label}</small>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="d-flex flex-wrap gap-2 mb-4">
        {statusOptions.map((opt) => (
          <button
            key={opt.value}
            className={`btn btn-sm ${statusFilter === opt.value ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => onStatusFilterChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="panel blank-panel">
          <div className="blank-state">
            <i className="bi bi-check2-circle fs-1 text-success mb-3 d-block" />
            <h5 className="fw-bold mb-2">All Clear</h5>
            <p className="text-muted small mb-0">
              {isFiltered ? emptyFilterMessage : emptyMessage}
            </p>
          </div>
        </div>
      ) : (
        <div className="d-grid gap-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className="panel mb-0"
              style={{
                borderLeft: `4px solid ${notif.statusColor}`,
                padding: '16px',
              }}
            >
              <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-3">
                {/* Main content */}
                <div className="flex-grow-1 min-width-0">
                  <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                    <h6 className="fw-bold mb-0 d-flex align-items-center gap-2">
                      <i className={`${notif.sourceTypeIcon}`} style={{ color: notif.sourceTypeColor }} />
                      {notif.sourceTypeLabel}
                    </h6>
                    <span
                      className="badge"
                      style={{
                        background: notif.statusColor,
                        color: '#fff',
                      }}
                    >
                      {notif.statusLabel}
                    </span>
                    <span className="small text-muted">
                      <i className="bi bi-clock me-1" />
                      {getTimeAgo(notif.timestamp)}
                    </span>
                  </div>

                  <p className="text-muted small mb-1">{notif.description}</p>

                  <div className="mt-1">
                    {/* Triggered By */}
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <i className="bi bi-person-check text-info" />
                      <span className="fw-semibold">{notif.triggeredByName}</span>
                      <span className="badge text-bg-light text-dark border">
                        {notif.triggeredByRole}
                      </span>
                    </div>

                    {/* Site & Chainage */}
                    <div className="d-flex flex-wrap gap-3 small text-muted mt-2">
                      <span>
                        <i className="bi bi-geo-alt me-1 text-danger" />
                        Site: <strong>{notif.siteName}</strong>
                      </span>
                      <span>
                        <i className="bi bi-signpost-split me-1 text-warning" />
                        Chainage: <strong>{notif.chainageName}</strong>
                      </span>
                    </div>

                    <div className="small text-muted mt-2">
                      <i className="bi bi-calendar me-1" />
                      Triggered at: {formatDate(notif.timestamp)}
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                {actionButtons && (
                  <div className="d-flex gap-2 mt-2 mt-md-0 ms-md-auto align-self-start align-self-md-center">
                    {actionButtons(notif)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationListTemplate;