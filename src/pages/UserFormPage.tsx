// ============================================================================
// User Form Page — Custom Form for User creation and editing
// ============================================================================

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MOCK_USERS, upsertUser } from '../services/mockData';
import type { UserProfile } from '../types';
import { ROLE_OPTIONS } from '../constants';

// Auto-generate employee ID function
const generateEmployeeId = (dateString: string) => {
  if (!dateString) return '';
  const year = dateString.split('-')[0] || new Date().getFullYear().toString();
  
  // Find matching users in that year
  const matchingUsers = MOCK_USERS.filter((u) => {
    const uDate = u.joiningDate || u.joinedAt || '';
    return uDate.startsWith(year);
  });
  
  const seq = String(matchingUsers.length + 1).padStart(3, '0');
  return `LT-${year}-${seq}`;
};

export const UserFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id && id !== 'add';
  const user = isEdit ? MOCK_USERS.find((u) => u.id === id) : undefined;

  const today = new Date().toISOString().split('T')[0];

  // Form Field States
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone] = useState(user?.phone || '');
  const [department] = useState(user?.department || '');
  const [location] = useState(user?.location || '');
  const [workspace] = useState(user?.workspace || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [joiningDate, setJoiningDate] = useState(user?.joiningDate || user?.joinedAt || today);
  const [createdAt, setCreatedAt] = useState(user?.createdAt || today);
  const [employeeId, setEmployeeId] = useState(user?.employeeId || generateEmployeeId(today));
  const [role, setRole] = useState(user?.role || '');
  const [address, setAddress] = useState(user?.address || '');

  // Dynamic Custom Roles List (persisted in localStorage)
  const [customRoles, setCustomRoles] = useState<{ value: string; label: string }[]>(() => {
    const saved = localStorage.getItem('lt-custom-role');
    return saved ? JSON.parse(saved) : [];
  });
  const [showAddRoleInput, setShowAddRoleInput] = useState(false);
  const [newRoleLabel, setNewRoleLabel] = useState('');

  // Regenerate Employee ID when joiningDate changes in create mode
  const handleJoiningDateChange = (dateVal: string) => {
    setJoiningDate(dateVal);
    if (!isEdit) {
      setEmployeeId(generateEmployeeId(dateVal));
    }
  };

  const handleAddRole = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!newRoleLabel.trim()) return;

    const value = newRoleLabel.trim().toLowerCase().replace(/\s+/g, '_');
    const label = newRoleLabel.trim();

    const allRoles = [...ROLE_OPTIONS, ...customRoles];
    if (allRoles.some(r => r.value === value)) {
      alert('This role already exists!');
      return;
    }

    const updated = [...customRoles, { value, label }];
    setCustomRoles(updated);
    localStorage.setItem('lt-custom-role', JSON.stringify(updated));
    setRole(value); // Auto-select new role
    setNewRoleLabel('');
    setShowAddRoleInput(false);
  };

  // File Upload Handler for Photo
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Form Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !joiningDate || !employeeId || !role) {
      alert('Please fill in all required fields marked with *');
      return;
    }

    const userData: UserProfile = {
      id: isEdit && user ? user.id : Date.now().toString(),
      name: name.trim(),
      email: email.trim(),
      phone: phone || user?.phone || '',
      role: role as UserProfile['role'],
      department: department || user?.department || '',
      location: location || user?.location || '',
      workspace: workspace || user?.workspace || '',
      avatar: avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=2563eb&color=fff`,
      joinedAt: joiningDate,
      employeeId: employeeId.trim(),
      createdAt: createdAt || new Date().toISOString().split('T')[0],
      joiningDate: joiningDate,
      address: address.trim(),
    };

    upsertUser(userData);
    navigate('/users');
  };

  const allRolesList = [...ROLE_OPTIONS, ...customRoles];

  return (
    <div className="container-fluid px-3 px-lg-4 py-4">
      <div className="page-heading">
        <div className="page-heading-copy">
          <span className="page-icon"><i className="bi bi-people" aria-hidden="true" /></span>
          <div>
            <p className="eyebrow mb-1">User Management</p>
            <h1 className="h3 mb-1">{isEdit ? 'Edit User' : 'Create User'}</h1>
            <p className="text-muted mb-0">Define user profile info, assign joining years, and map user access roles.</p>
          </div>
        </div>
      </div>

      <div className="panel p-4 mt-3">
        <form onSubmit={handleSubmit} className="row g-3">
          {/* Full Name */}
          <div className="col-12 col-md-6">
            <label className="form-label fw-bold small">Full Name *</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Photo Upload */}
          <div className="col-12 col-md-6">
            <label className="form-label fw-bold small">Upload Photo</label>
            <div className="d-flex align-items-center gap-3">
              <input
                type="file"
                className="form-control form-control-sm"
                accept="image/*"
                onChange={handlePhotoUpload}
              />
              {avatar && (
                <div className="d-flex align-items-center gap-2">
                  <img
                    src={avatar}
                    alt="Avatar Preview"
                    className="img-thumbnail"
                    style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '50%' }}
                  />
                  <small className="text-success fw-semibold">Uploaded</small>
                </div>
              )}
            </div>
          </div>

          {/* Email ID */}
          <div className="col-12 col-md-6">
            <label className="form-label fw-bold small">Email ID *</label>
            <input
              type="email"
              className="form-control"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Joining Date */}
          <div className="col-12 col-md-6">
            <label className="form-label fw-bold small">Joining Date *</label>
            <input
              type="date"
              className="form-control"
              value={joiningDate}
              onChange={(e) => handleJoiningDateChange(e.target.value)}
              required
            />
          </div>

          {/* Employee ID */}
          <div className="col-12 col-md-6">
            <label className="form-label fw-bold small">Employee ID *</label>
            <input
              type="text"
              className="form-control"
              placeholder="LT-YYYY-XXX"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              required
            />
            <small className="text-muted small">Auto-generated format: LT-[Joining Year]-[Sequence]</small>
          </div>

          {/* Created Date */}
          <div className="col-12 col-md-6">
            <label className="form-label fw-bold small">Created Date *</label>
            <input
              type="date"
              className="form-control"
              value={createdAt}
              onChange={(e) => setCreatedAt(e.target.value)}
              required
            />
          </div>

          {/* Role Dropdown Selector */}
          <div className="col-12 col-md-6">
            <label className="form-label fw-bold small">Role *</label>
            <div className="d-flex gap-2">
              <select
                className="form-select text-capitalize"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              >
                <option value="">Select Role</option>
                {allRolesList.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="btn btn-outline-primary text-nowrap"
                style={{ fontSize: '0.85rem' }}
                onClick={() => setShowAddRoleInput(!showAddRoleInput)}
              >
                <i className="bi bi-plus-lg me-1" /> Add Role
              </button>
            </div>

            {showAddRoleInput && (
              <div className="mt-2 p-3 border rounded bg-light animate-fade-in">
                <h6 className="fw-bold mb-2 small text-secondary">Add New Platform Role</h6>
                <div className="d-flex gap-2">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Enter custom role label (e.g. Safety Inspector)"
                    value={newRoleLabel}
                    onChange={(e) => setNewRoleLabel(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={handleAddRole}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => { setShowAddRoleInput(false); setNewRoleLabel(''); }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Address Textarea */}
          <div className="col-12">
            <label className="form-label fw-bold small">Address</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Enter complete address details"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          {/* Action Footer Buttons */}
          <div className="col-12 d-flex gap-2 mt-4 border-top pt-3">
            <button type="submit" className="btn btn-primary">
              <i className="bi bi-check-lg me-1" />
              {isEdit ? 'Update Profile' : 'Create User'}
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => navigate('/users')}
            >
              <i className="bi bi-x-lg me-1" />
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};