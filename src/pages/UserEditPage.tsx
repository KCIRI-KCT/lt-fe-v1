<<<<<<< HEAD
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DynamicForm, type FieldConfig } from '../components/forms/DynamicForm';
import { employeeService } from '../services/employeeService';
=======
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DynamicForm, type FieldConfig } from '../components/forms/DynamicForm';
import { MOCK_USERS, upsertUser } from '../services/mockData';
>>>>>>> MS-ltfe-report
import type { UserProfile } from '../types';
import { ROLE_OPTIONS } from '../constants';

export const UserEditPage = () => {
  const navigate = useNavigate();
<<<<<<< HEAD
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  useEffect(() => {
    employeeService.getEmployees().then(setUsersList).catch(() => setUsersList([]));
  }, []);

  const selectedUser = usersList.find((u) => u.id === selectedUserId);

  const handleCancel = () => navigate('/users');

  const handleSubmit = async (data: Record<string, string | boolean>) => {
    if (!selectedUserId) return;
    try {
      await employeeService.updateEmployee(selectedUserId, {
        employee_name: data.name as string,
        email: data.email as string,
        mobile_number: (data.phone as string) || '9000000000',
        designation: data.role as string,
        department: (data.department as string) || 'L&T Operations',
      });
      setSuccessMsg('User updated successfully!');
      setTimeout(() => {
        setSuccessMsg('');
        navigate('/users');
      }, 1500);
    } catch {
      alert('Failed to update user via API.');
    }
=======
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  const selectedUser = MOCK_USERS.find((u) => u.id === selectedUserId);

  const handleCancel = () => navigate('/users');

  const handleSubmit = (data: Record<string, string | boolean>) => {
    if (!selectedUser) return;
    const userData: UserProfile = {
      ...selectedUser,
      name: data.name as string,
      email: data.email as string,
      phone: data.phone as string,
      role: data.role as UserProfile['role'],
      department: data.department as string,
      location: data.location as string,
      workspace: data.workspace as string,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent((data.name as string) || 'User')}&background=2563eb&color=fff`,
    };
    upsertUser(userData);
    setSuccessMsg('User updated successfully!');
    setTimeout(() => {
      setSuccessMsg('');
      navigate('/users');
    }, 1500);
>>>>>>> MS-ltfe-report
  };

  const fields: FieldConfig[] = [
    { name: 'name', label: 'Full Name', type: 'text', placeholder: 'Enter full name', required: true, colSpan: 6 },
    { name: 'email', label: 'Email Address', type: 'email', placeholder: 'user@example.com', required: true, colSpan: 6 },
    { name: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+91-9876543210', colSpan: 6 },
    { name: 'role', label: 'Role', type: 'select', options: ROLE_OPTIONS, required: true, colSpan: 6 },
    { name: 'department', label: 'Department', type: 'text', placeholder: 'Department name', colSpan: 6 },
    { name: 'location', label: 'Location', type: 'text', placeholder: 'City, State', colSpan: 6 },
    { name: 'workspace', label: 'Workspace', type: 'text', placeholder: 'Project/Organization', colSpan: 6 },
  ];

  const initialValues: Record<string, string> = selectedUser ? {
    name: selectedUser.name,
    email: selectedUser.email,
    phone: selectedUser.phone || '',
    role: selectedUser.role,
    department: selectedUser.department || '',
    location: selectedUser.location || '',
    workspace: selectedUser.workspace || '',
  } : {};

  return (
    <div className="container-fluid px-3 px-lg-4 py-4">
      <div className="page-heading">
        <div className="page-heading-copy">
          <span className="page-icon"><i className="bi bi-people" aria-hidden="true" /></span>
          <div>
            <p className="eyebrow mb-1">User Management</p>
            <h1 className="h3 mb-1">Edit User</h1>
            <p className="text-muted mb-0">Select a user to modify their information.</p>
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
        <div className="mb-4 col-md-6">
          <label htmlFor="userSelect" className="form-label fw-bold">Select User to Edit</label>
          <select
            id="userSelect"
            className="form-select"
            value={selectedUserId}
            onChange={(e) => {
              setSelectedUserId(e.target.value);
              setSuccessMsg('');
            }}
          >
            <option value="">-- Choose User --</option>
<<<<<<< HEAD
            {usersList.map((u) => (
=======
            {MOCK_USERS.map((u) => (
>>>>>>> MS-ltfe-report
              <option key={u.id} value={u.id}>
                {u.name} ({u.role.replace(/_/g, ' ')}) - {u.email}
              </option>
            ))}
          </select>
        </div>

        {selectedUser ? (
          <div className="pt-3 border-top">
            <DynamicForm
              key={selectedUserId} // Re-mount form on user selection change
              fields={fields}
              initialValues={initialValues}
              onSubmit={handleSubmit}
              submitLabel="Update User"
              onCancel={handleCancel}
            />
          </div>
        ) : (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-person-bounding-box fs-1 mb-3 d-block" />
            <p className="mb-0">Please select a user from the dropdown above to start editing.</p>
          </div>
        )}
      </div>
    </div>
  );
};
