import { useState } from 'react';
import { useApp } from '../hooks/useApp';
import { useNavigate } from 'react-router-dom';
import { ROLE_LABELS, ROLE_COLORS } from '../constants';

export const Profile = () => {
  const { user } = useApp();
  const navigate = useNavigate();
  const [activityOpen, setActivityOpen] = useState<boolean>(true);

  // Role description block
  const roleDescriptions: Record<string, string> = {
    admin: 'Total system access, credentials control, security audit configurations, and user assignments.',
    site_engineer: 'On-site execution alignment, technical drawings validation, field progress check, and safety audit logging.',
    project_manager: 'Management of designated projects, local sites overview, camera streams configuration, and worker shifts.',
    safety_manager: 'Responsible for safety audits, AI alert configurations, review of safety violations, and compliance scores.',
    site_supervisor: 'Supervises daily operations at designated sites, monitors worker attendance, and logs field incidents.',
    safety_officer: 'On-site compliance validation, worker safety briefing records, and live stream feed auditing.',
  };

  const currentDesc = roleDescriptions[user.role] || 'Member of the monitoring and diagnostics division.';

  return (
    <div className="container-fluid px-3 px-lg-4 py-4" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Page Header */}
      <div className="page-heading align-items-center">
        <div className="page-heading-copy">
          <span className="page-icon">
            <i className="bi bi-person-badge text-primary" aria-hidden="true" />
          </span>
          <div>
            <p className="eyebrow mb-1">Account</p>
            <h1 className="h3 mb-0">Profile Overview</h1>
          </div>
        </div>
        <div className="heading-actions d-flex gap-2">
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setActivityOpen(!activityOpen)}
          >
            <i className={`bi ${activityOpen ? 'bi-layout-sidebar-inset-reverse' : 'bi-layout-sidebar-inset'} me-1`} />
            {activityOpen ? 'Hide Log' : 'Show Activity Log'}
          </button>
          <button
            className="btn btn-primary btn-sm"
            type="button"
            onClick={() => navigate('/settings')}
          >
            <i className="bi bi-gear-fill me-1" /> Configure Profile
          </button>
        </div>
      </div>

      <div className="row g-3 mt-1">
        {/* Main User Information Panel (Responsive Grid) */}
        <div className={activityOpen ? "col-12 col-xl-8" : "col-12 col-xl-12"}>
          <div className="panel profile-card h-100">
            <div className="profile-cover mb-4" style={{ height: '140px', background: 'linear-gradient(135deg, #1e293b, #0f172a)', borderRadius: '8px 8px 0 0', position: 'relative' }}>
              <div className="w-100 h-100 d-flex align-items-center justify-content-center text-white opacity-10">
                <i className="bi bi-shield-lock-fill display-2" />
              </div>
            </div>

            <div className="d-flex flex-column flex-md-row align-items-center align-items-md-end gap-3 px-3" style={{ marginTop: '-80px', marginBottom: '24px' }}>
              <img
                className="avatar-img avatar-xl rounded-circle border border-4 border-dark shadow"
                style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2563eb&color=fff`}
                alt={user.name}
              />
              <div className="text-center text-md-start flex-grow-1">
                <span className={`badge ${ROLE_COLORS[user.role] || 'text-bg-secondary'} px-2 py-1 mb-1`}>
                  {ROLE_LABELS[user.role]}
                </span>
                <h2 className="h3 fw-bold mb-1">{user.name}</h2>
                <p className="text-muted small mb-0">{user.email}</p>
              </div>
            </div>

            {/* Profile Info Details Grid */}
            <div className="px-3">
              <h5 className="fw-bold mb-3 border-bottom pb-2 text-body-emphasis"><i className="bi bi-info-circle me-2 text-primary" />User Information</h5>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <div className="p-3 bg-body-secondary border rounded">
                    <div className="text-muted small">Full Name</div>
                    <strong className="text-body-emphasis">{user.name}</strong>
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="p-3 bg-body-secondary border rounded">
                    <div className="text-muted small">Official Email Address</div>
                    <strong className="text-body-emphasis">{user.email}</strong>
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="p-3 bg-body-secondary border rounded">
                    <div className="text-muted small">Mobile Number</div>
                    <strong className="text-body-emphasis">{user.phone || '+91 98765 43210'}</strong>
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="p-3 bg-body-secondary border rounded">
                    <div className="text-muted small">Site Location / Hub</div>
                    <strong className="text-body-emphasis">{user.location || 'Chennai, TN'}</strong>
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="p-3 bg-body-secondary border rounded">
                    <div className="text-muted small">Department</div>
                    <strong className="text-body-emphasis">{user.department || 'Operations Control'}</strong>
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="p-3 bg-body-secondary border rounded">
                    <div className="text-muted small">Active Workspace</div>
                    <strong className="text-body-emphasis">{user.workspace}</strong>
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="p-3 bg-body-secondary border rounded">
                    <div className="text-muted small">Employee ID</div>
                    <strong className="text-body-emphasis font-monospace">EMP-2026-9043</strong>
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="p-3 bg-body-secondary border rounded">
                    <div className="text-muted small">Joined Date</div>
                    <strong className="text-body-emphasis">January 14, 2024</strong>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-primary-bg-subtle text-primary rounded border border-primary border-opacity-10">
                <h6 className="fw-bold mb-1">Authority Description</h6>
                <p className="mb-0 small">{currentDesc}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Collapsible Session Activity Log Sidebar Panel */}
        {activityOpen && (
          <div className="col-12 col-xl-4">
            <div className="panel h-100 d-flex flex-column">
              <div className="panel-header d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
                <div>
                  <h5 className="fw-bold mb-0 text-body-emphasis">
                    <i className="bi bi-activity text-primary me-2" aria-hidden="true" />
                    <span>Session Activity Log</span>
                  </h5>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Collapse panel"
                  onClick={() => setActivityOpen(false)}
                />
              </div>

              <div className="flex-grow-1 overflow-auto pe-1">
                <div className="activity-list d-grid gap-3">
                  {[
                    { title: 'Authorized Sign-in', desc: 'Secure login registered from Chrome Browser.', date: 'Just now', icon: 'bi-shield-check', color: 'bg-success' },
                    { title: 'Profile Settings Accessed', desc: 'Credentials cache reviewed in preferences.', date: '10 minutes ago', icon: 'bi-gear-wide', color: 'bg-primary' },
                    { title: 'System Diagnostics Checked', desc: 'System Health monitor opened to audit edge devices.', date: '2 hours ago', icon: 'bi-heart-pulse', color: 'bg-danger' },
                    { title: 'Camera Fleet Screen Loaded', desc: 'IP Camera live feeds and PTZ configuration audited.', date: 'Yesterday', icon: 'bi-camera-video', color: 'bg-warning' },
                    { title: 'Workspace Log Generated', desc: 'Exported daily workforce attendance details.', date: '2 days ago', icon: 'bi-file-earmark-spreadsheet', color: 'bg-info' },
                  ].map((act, i) => (
                    <div key={i} className="d-flex gap-3 align-items-start p-3 rounded bg-body-secondary border">
                      <span className={`d-flex align-items-center justify-content-center text-white rounded-circle ${act.color}`} style={{ width: '32px', height: '32px', minWidth: '32px', fontSize: '0.85rem' }}>
                        <i className={`bi ${act.icon}`} />
                      </span>
                      <div>
                        <h6 className="fw-bold mb-0.5 small text-body-emphasis">{act.title}</h6>
                        <p className="text-muted small mb-1" style={{ fontSize: '0.78rem' }}>{act.desc}</p>
                        <small className="text-muted font-monospace" style={{ fontSize: '0.7rem' }}>{act.date}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};