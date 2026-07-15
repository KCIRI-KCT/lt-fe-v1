import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../hooks/useApp';
import { MOCK_USERS } from '../../services/mockData';
import ltlogo from '../../assets/lt-logo.png'

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
      navigate('/dashboard');
    } catch {
      setError('Invalid credentials. Try: karthee@kciri.com');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-body">
      <div className="auth-page">
        <div className="auth-card">
          <div className="text-center mb-4">
            <img src={ltlogo} alt="KCIRI" style={{ height: '60px' }} />
            <h2 className="h4 mt-3 fw-bold">AI Progress Monitor</h2>
            <p className="text-muted small">Enterprise Construction Monitoring Platform</p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="alert alert-danger py-2 small">{error}</div>
            )}

            <div className="mb-3">
              <label htmlFor="email" className="form-label fw-semibold">Email</label>
              <input
                type="email"
                className="form-control"
                id="email"
                placeholder="karthee@kciri.com"
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
                placeholder="Enter password"
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
            <p className="text-muted small mb-2 text-center">Demo Accounts:</p>
            <div className="d-grid gap-1">
              {MOCK_USERS.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  className="btn btn-light btn-sm text-start"
                  onClick={() => { setEmail(u.email); setPassword('demo123'); }}
                >
                  <span className="badge me-2" style={{ fontSize: '0.65rem' }}>{u.role.replace('_', ' ')}</span>
                  {u.email}
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