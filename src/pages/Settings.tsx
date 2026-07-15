import { useState } from 'react';
import { useApp } from '../hooks/useApp';
import { DynamicForm } from '../components/forms/DynamicForm';
import { MOCK_USERS } from '../services/mockData';

type SettingsTab = 'profile' | 'account' | 'system';

export const Settings = () => {
  const { theme, toggleTheme, user } = useApp();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [successMsg, setSuccessMsg] = useState<string>('');
  
  // Custom states for security validation
  const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean>(false);
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpVerified, setOtpVerified] = useState<boolean>(false);
  const [enteredOtp, setEnteredOtp] = useState<string>('');
  
  // Custom Password States
  const [oldPassword, setOldPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  const profileFields = [
    { name: 'name', label: 'Full Name', type: 'text' as const, placeholder: 'Enter full name', required: true },
    { name: 'email', label: 'Email Address', type: 'email' as const, placeholder: 'Enter email', required: true },
    { name: 'phone', label: 'Phone Number', type: 'tel' as const, placeholder: '+91-9876543210' },
    { name: 'location', label: 'Location', type: 'text' as const, placeholder: 'City, State' },
    { name: 'department', label: 'Department', type: 'text' as const, placeholder: 'Department name' },
    { name: 'workspace', label: 'Workspace / Site Office', type: 'text' as const, placeholder: 'Workspace name' },
  ];

  const systemFields = [
    { name: 'language', label: 'Default Language', type: 'select' as const, options: [
      { label: 'English', value: 'en' },
      { label: 'Hindi', value: 'hi' },
      { label: 'Tamil', value: 'ta' },
    ]},
    { name: 'timezone', label: 'Default Timezone', type: 'select' as const, options: [
      { label: 'IST (UTC+5:30)', value: 'ist' },
      { label: 'UTC', value: 'utc' },
    ]},
    { name: 'alertEmail', label: 'Alert Notification Email Address', type: 'email' as const, placeholder: 'alerts@company.com' },
    { name: 'autoRefresh', label: 'Auto-refresh diagnostics data', type: 'checkbox' as const, placeholder: 'Enable automatic telemetry sync every 30 seconds' },
  ];

  const handleProfileSubmit = (values: Record<string, string | boolean>) => {
    const updatedUser = {
      ...user,
      name: values.name as string,
      email: values.email as string,
      phone: values.phone as string,
      location: values.location as string,
      department: values.department as string,
      workspace: values.workspace as string,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent((values.name as string) || 'User')}&background=2563eb&color=fff`,
    };

    const idx = MOCK_USERS.findIndex(u => u.id === user.id);
    if (idx >= 0) MOCK_USERS[idx] = updatedUser;

    localStorage.setItem('ai-monitor.authUser', JSON.stringify(updatedUser));
    localStorage.setItem('ai-monitor.users', JSON.stringify(MOCK_USERS));

    setSuccessMsg('Profile details saved successfully! Refreshing...');
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  const handleSendOtp = () => {
    setOtpSent(true);
    alert(`Mock OTP Sent: Please input 123456 to verify and unlock the password forms.`);
  };

  const handleVerifyOtp = () => {
    if (enteredOtp === '123456') {
      setOtpVerified(true);
      setSuccessMsg('OTP Code Verified! You may now input a new password.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } else {
      alert('Invalid OTP code. Please enter 123456.');
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpVerified) {
      alert('OTP validation required prior to changing password credentials.');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match.");
      return;
    }
    setSuccessMsg('Account password changed successfully!');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setOtpSent(false);
    setOtpVerified(false);
    setEnteredOtp('');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleSystemSubmit = () => {
    setSuccessMsg('System preferences saved successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="container-fluid px-3 px-lg-4 py-4">
      <div className="page-heading">
        <div className="page-heading-copy">
          <span className="page-icon"><i className="bi bi-gear" aria-hidden="true" /></span>
          <div>
            <p className="eyebrow mb-1">Configuration</p>
            <h1 className="h3 mb-0">Account & Settings</h1>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="alert alert-success mt-3" role="alert">
          <i className="bi bi-check-circle-fill me-2" />
          {successMsg}
        </div>
      )}

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4 mt-2">
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
            <i className="bi bi-person-circle me-2" />Profile Information
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'account' ? 'active' : ''}`} onClick={() => setActiveTab('account')}>
            <i className="bi bi-shield-lock me-2" />Account & Security
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'system' ? 'active' : ''}`} onClick={() => setActiveTab('system')}>
            <i className="bi bi-sliders me-2" />System Preferences
          </button>
        </li>
      </ul>

      <div className="row g-3">
        {/* Main Settings Panel */}
        <div className="col-12 col-xl-8">
          <div className="panel h-100">
            {activeTab === 'profile' && (
              <>
                <div className="panel-header mb-3">
                  <div>
                    <h2 className="h5 mb-1 section-title"><span>Edit Profile Details</span></h2>
                    <p className="text-muted mb-0">Update your public identity details and contact methods.</p>
                  </div>
                </div>
                <DynamicForm
                  key="profile-form"
                  fields={profileFields}
                  initialValues={{
                    name: user.name,
                    email: user.email,
                    phone: user.phone || '',
                    location: user.location || '',
                    department: user.department || '',
                    workspace: user.workspace || '',
                  }}
                  onSubmit={handleProfileSubmit}
                  submitLabel="Update Profile"
                />
              </>
            )}

            {activeTab === 'account' && (
              <>
                <div className="panel-header mb-3 border-bottom pb-2">
                  <div>
                    <h2 className="h5 mb-1 section-title"><span>Account Security & Verification</span></h2>
                    <p className="text-muted mb-0">Manage password access controls, OTP verification, and 2FA.</p>
                  </div>
                </div>

                {/* Two Factor Authentication Option */}
                <div className="p-3 bg-light bg-opacity-5 rounded border border-secondary border-opacity-10 mb-4 mt-2">
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <h6 className="fw-bold mb-1"><i className="bi bi-shield-check text-success me-2" />Two-Factor Authentication (2FA)</h6>
                      <p className="text-muted mb-0 small">Require SMS verification code whenever accessing client credentials.</p>
                    </div>
                    <div className="form-check form-switch mb-0">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        id="2faSwitch"
                        checked={twoFactorEnabled}
                        onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                      />
                      <label className="form-check-label fw-bold small text-body" htmlFor="2faSwitch">
                        {twoFactorEnabled ? 'On' : 'Off'}
                      </label>
                    </div>
                  </div>
                  {twoFactorEnabled && (
                    <div className="mt-2 text-success small">
                      <i className="bi bi-check-circle-fill me-1" />
                      Two-Factor Authentication is active for: <strong>{user.phone || '+91 98765 43210'}</strong>
                    </div>
                  )}
                </div>

                {/* Password reset process containing OTP validation */}
                <h6 className="fw-bold mb-3 text-body-emphasis"><i className="bi bi-key-fill text-warning me-2" />Reset Password</h6>
                <div className="p-3 bg-warning-subtle text-warning-emphasis border border-warning border-opacity-20 rounded mb-4">
                  <div className="small">
                    <strong>OTP Verification Required:</strong> You must request and verify a one-time passcode sent to your registered mobile phone (<strong>{user.phone || '+91 98765 43210'}</strong>) in order to unlock the password modification fields.
                  </div>
                  
                  {!otpSent ? (
                    <button className="btn btn-warning btn-sm mt-3 fw-bold" type="button" onClick={handleSendOtp}>
                      <i className="bi bi-phone-vibrate me-1" />Send OTP Verification Code
                    </button>
                  ) : (
                    <div className="mt-3">
                      <div className="small mb-2 text-muted">Enter verification OTP code sent via SMS:</div>
                      <div className="d-flex gap-2 align-items-center flex-wrap">
                        <input
                          type="text"
                          className="form-control form-control-sm bg-dark text-white border-secondary"
                          style={{ maxWidth: '140px' }}
                          placeholder="e.g. 123456"
                          value={enteredOtp}
                          onChange={(e) => setEnteredOtp(e.target.value)}
                          disabled={otpVerified}
                        />
                        <button className="btn btn-success btn-sm" type="button" onClick={handleVerifyOtp} disabled={otpVerified}>
                          {otpVerified ? 'Verified' : 'Verify Code'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Password input fields (disabled unless OTP is verified!) */}
                <form onSubmit={handlePasswordSubmit} className="d-grid gap-3">
                  <div>
                    <label className="form-label small fw-bold">Current Password</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="••••••••"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      disabled={!otpVerified}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label small fw-bold">New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="At least 8 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={!otpVerified}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label small fw-bold">Confirm New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={!otpVerified}
                      required
                    />
                  </div>
                  <div>
                    <button className="btn btn-primary" type="submit" disabled={!otpVerified}>
                      Save Changes
                    </button>
                    {!otpVerified && (
                      <span className="ms-3 text-muted small"><i className="bi bi-lock-fill me-1" />Validate OTP above to unlock saving.</span>
                    )}
                  </div>
                </form>
              </>
            )}

            {activeTab === 'system' && (
              <>
                <div className="panel-header mb-3">
                  <div>
                    <h2 className="h5 mb-1 section-title"><span>System Parameters</span></h2>
                    <p className="text-muted mb-0">Global choices for regional settings and automatic sync properties.</p>
                  </div>
                </div>
                <DynamicForm
                  key="system-form"
                  fields={systemFields}
                  initialValues={{
                    language: 'en',
                    timezone: 'ist',
                    alertEmail: 'alerts@company.com',
                    autoRefresh: true,
                  }}
                  onSubmit={handleSystemSubmit}
                  submitLabel="Save Preferences"
                />
              </>
            )}
          </div>
        </div>

        {/* Right Settings Columns (Corrected Info-metrics) */}
        <div className="col-12 col-xl-4">
          {/* Appearance Panel */}
          <div className="panel">
            <div className="panel-header">
              <div>
                <h2 className="h5 mb-1 section-title"><i className="bi bi-palette text-primary" /><span>Dashboard Style</span></h2>
                <p className="text-muted mb-0">Customize visual presets.</p>
              </div>
            </div>
            <div className="settings-list mt-3">
              <div
                className="settings-row d-flex justify-content-between align-items-center p-2 rounded cursor-pointer hover-bg"
                style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.03)' }}
                onClick={toggleTheme}
              >
                <div>
                  <strong className="d-block small">Color Theme</strong>
                  <small className="text-muted">Toggle between dark and light modes</small>
                </div>
                <span className={`badge ${theme === 'dark' ? 'text-bg-dark' : 'text-bg-light'} border`}>
                  {theme === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'}
                </span>
              </div>
            </div>
          </div>

          {/* Account Overview details card (Corrected dynamic infometrics) */}
          <div className="panel mt-3">
            <div className="panel-header mb-2">
              <div>
                <h2 className="h5 mb-1 section-title"><i className="bi bi-shield-check text-primary" /><span>Account Details</span></h2>
                <p className="text-muted mb-0">Authority privileges and session indicators.</p>
              </div>
            </div>
            <div className="d-grid gap-2 small text-muted pt-2 border-top border-secondary border-opacity-20">
              <div className="d-flex justify-content-between py-1">
                <span>Account Username:</span>
                <span className="fw-bold text-white">{user.name}</span>
              </div>
              <div className="d-flex justify-content-between py-1">
                <span>Primary Email:</span>
                <span className="fw-bold text-white">{user.email}</span>
              </div>
              <div className="d-flex justify-content-between py-1">
                <span>Account Role:</span>
                <span className="fw-bold text-white text-uppercase" style={{ fontSize: '0.75rem' }}>{user.role.replace(/_/g, ' ')}</span>
              </div>
              <div className="d-flex justify-content-between py-1">
                <span>SMS Mobile Phone:</span>
                <span className="fw-bold text-white">{user.phone || '+91 98765 43210'}</span>
              </div>
              <div className="d-flex justify-content-between py-1">
                <span>2FA Status:</span>
                <span className={`badge ${twoFactorEnabled ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                  {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="d-flex justify-content-between py-1">
                <span>Phone Validation:</span>
                <span className={`badge ${otpVerified ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'}`}>
                  {otpVerified ? 'OTP Verified' : 'Awaiting OTP'}
                </span>
              </div>
              <div className="d-flex justify-content-between py-1">
                <span>Active Workspace:</span>
                <span className="fw-bold text-white">{user.workspace}</span>
              </div>
              <div className="d-flex justify-content-between py-1">
                <span>Active Location:</span>
                <span className="fw-bold text-white">{user.location || 'Chennai, TN'}</span>
              </div>
              <div className="d-flex justify-content-between py-1">
                <span>Client Version:</span>
                <span className="font-monospace text-white">v1.0.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};