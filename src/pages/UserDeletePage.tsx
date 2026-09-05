import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { employeeService } from '../services/employeeService';
import { ROLE_LABELS, ROLE_COLORS } from '../constants';
import type { UserProfile } from '../types';

export const UserDeletePage = () => {
  const navigate = useNavigate();
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [successMsg, setSuccessMsg] = useState<string>('');
  const masterCheckboxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    employeeService.getEmployees().then(setUsersList).catch(() => setUsersList([]));
  }, []);

  const toggleAll = (checked: boolean) => {
    if (checked) {
      setSelectedUserIds(new Set(usersList.map((u) => u.id)));
    } else {
      setSelectedUserIds(new Set());
    }
  };

  const toggleRow = (id: string) => {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleDeleteSelected = async () => {
    if (selectedUserIds.size === 0) return;
    const ids = Array.from(selectedUserIds);
    const count = ids.length;
    try {
      await Promise.all(ids.map((id) => employeeService.deleteEmployee(id)));
      setSelectedUserIds(new Set());
      setSuccessMsg(`Successfully deleted ${count} selected user(s).`);
      setTimeout(() => {
        setSuccessMsg('');
        navigate('/users');
      }, 1500);
    } catch {
      alert('Failed to delete selected users via API.');
    }
  };

  const isAllSelected = usersList.length > 0 && selectedUserIds.size === usersList.length;
  const isIndeterminate = selectedUserIds.size > 0 && !isAllSelected;

  useEffect(() => {
    if (masterCheckboxRef.current) {
      masterCheckboxRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate]);

  return (
    <div className="container-fluid px-3 px-md-4 py-3 py-lg-4">
      <div className="page-heading">
        <div className="page-heading-copy">
          <span className="page-icon"><i className="bi bi-people" aria-hidden="true" /></span>
          <div>
            <p className="eyebrow mb-1">User Management</p>
            <h1 className="h3 mb-1">Bulk Delete Users</h1>
            <p className="text-muted mb-0">Select one or more users to delete from the platform.</p>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="alert alert-success mt-3" role="alert">
          <i className="bi bi-check-circle-fill me-2" />
          {successMsg}
        </div>
      )}

      <div className="panel mt-3">
        {usersList.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-people fs-1 mb-3 d-block text-danger" />
            <p className="mb-0">No users available to delete.</p>
          </div>
        ) : (
          <>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="text-muted">
                {selectedUserIds.size} of {usersList.length} user(s) selected
              </span>
              <button
                className="btn btn-danger"
                disabled={selectedUserIds.size === 0}
                onClick={handleDeleteSelected}
              >
                <i className="bi bi-trash-fill me-2" />
                Delete Selected ({selectedUserIds.size})
              </button>
            </div>

            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>
                      <input
                        ref={masterCheckboxRef}
                        type="checkbox"
                        className="form-check-input"
                        checked={isAllSelected}
                        onChange={(e) => toggleAll(e.target.checked)}
                      />
                    </th>
                    <th>Full Name</th>
                    <th>Photo</th>
                    <th>Email ID</th>
                    <th>Employee ID</th>
                    <th>Created Date</th>
                    <th>Joining Date</th>
                    <th>Role</th>
                    <th>Address</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((user) => {
                    const isChecked = selectedUserIds.has(user.id);
                    return (
                      <tr key={user.id} className={isChecked ? 'table-danger-subtle' : ''}>
                        <td>
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={isChecked}
                            onChange={() => toggleRow(user.id)}
                          />
                        </td>
                        <td>
                          <span className="fw-semibold">{user.name}</span>
                        </td>
                        <td>
                          <img className="avatar-img avatar-sm" src={user.avatar} alt={user.name} style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                        </td>
                        <td>{user.email}</td>
                        <td>{user.employeeId || 'N/A'}</td>
                        <td>{user.createdAt || user.joinedAt || 'N/A'}</td>
                        <td>{user.joiningDate || user.joinedAt || 'N/A'}</td>
                        <td>
                          <span className={`badge ${ROLE_COLORS[user.role] || 'text-bg-secondary'}`}>
                            {ROLE_LABELS[user.role]}
                          </span>
                        </td>
                        <td>
                          <span className="text-truncate d-inline-block" style={{ maxWidth: '150px' }} title={user.address || user.location}>
                            {user.address || user.location || 'N/A'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
