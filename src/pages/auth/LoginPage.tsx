import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../hooks/useApp';
import { getFirstSidebarRoute } from '../../utils/navigation';

const DEMO_ACCOUNTS = [
  { username: 'admin', label: 'Admin', role: 'admin' },
  { username: 'pm_user', label: 'Project Manager', role: 'project_manager' },
  { username: 'supervisor_user', label: 'Site Supervisor', role: 'site_supervisor' },
  { username: 'site_eng_user', label: 'Site Engineer', role: 'site_engineer' },
  { username: 'proj_eng_user', label: 'Project Engineer', role: 'project_engineer' },
  { username: 'safety_mgr_user', label: 'Safety Manager', role: 'safety_manager' },
  { username: 'safety_eng_user', label: 'Safety Engineer', role: 'safety_officer' },
];

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useApp();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      const savedUserStr = sessionStorage.getItem('user');
      let targetPath = '/dashboards';
      if (savedUserStr) {
        try {
          const user = JSON.parse(savedUserStr);
          targetPath = getFirstSidebarRoute(user.role) || '/dashboards';
        } catch {
          // ignore
        }
      }
      navigate(targetPath);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid username/email or password.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-body">
      <div className="auth-page">
        <div className="auth-card">
          <div className="text-center mb-4">
            <img src="/images/lt-logo.png" alt="LT" style={{ height: '60px' }} />
            <h2 className="h4 mt-3 fw-bold">L&T CONSTRUCTION MONITORING</h2>
            <p className="text-muted small">Enterprise Construction Monitoring Platform</p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="alert alert-danger py-2 small">{error}</div>
            )}

            <div className="mb-3">
              <label htmlFor="email" className="form-label fw-semibold">Username / Email</label>
              <input
                type="text"
                className="form-control"
                id="email"
                placeholder="Enter Username (e.g. admin, pm_user)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label fw-semibold">Password</label>
              <input
                type="password"
                className="form-control"
                id="password"
                placeholder="Enter Password (e.g. Admin@123)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button className="btn btn-primary w-100" type="submit" disabled={loading}>
              {loading ? (
                <><span className="spinner-border spinner-border-sm me-2" />Signing in...</>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-4">
            <p className="text-muted small mb-2 text-center">Quick Select Backend Account (Password: <code>Admin@123</code>):</p>
            <div className="d-grid gap-1">
              {DEMO_ACCOUNTS.map((u) => (
                <button
                  key={u.username}
                  type="button"
                  className="btn btn-secondary btn-sm text-start"
                  onClick={() => { setEmail(u.username); setPassword('Admin@123'); }}
                >
                  <span className="badge me-2" style={{ fontSize: '0.65rem' }}>{u.label}</span>
                  {u.username}
                </button>
              ))}
            </div>
          </div>

          <p className="auth-footer mt-3">
            &copy; 2026 KCIRI. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};