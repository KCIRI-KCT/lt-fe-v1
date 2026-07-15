// ============================================================================
// User Form Page — Create/Edit user with defined input fields
// ============================================================================

import { useNavigate, useParams } from 'react-router-dom';
import { DynamicForm, type FieldConfig } from '../components/forms/DynamicForm';
import { MOCK_USERS, upsertUser } from '../services/mockData';
import type { UserProfile } from '../types';
import { ROLE_OPTIONS } from '../constants';

export const UserFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id && id !== 'add';
  const user = isEdit ? MOCK_USERS.find((u) => u.id === id) : undefined;

  const handleCancel = () => navigate('/users');

  const handleSubmit = (data: Record<string, string | boolean>) => {
    const userData: UserProfile = {
      id: isEdit && user ? user.id : Date.now().toString(),
      name: data.name as string,
      email: data.email as string,
      phone: user?.phone || '',
      role: data.role as UserProfile['role'],
      department: user?.department || '',
      location: user?.location || '',
      workspace: user?.workspace || '',
      avatar: (data.avatar as string) || `https://ui-avatars.com/api/?name=${encodeURIComponent((data.name as string) || 'User')}&background=2563eb&color=fff`,
      joinedAt: (data.joiningDate as string) || user?.joinedAt || new Date().toISOString().split('T')[0],
      employeeId: data.employeeId as string,
      createdAt: (data.createdAt as string) || new Date().toISOString().split('T')[0],
      joiningDate: data.joiningDate as string,
      address: data.address as string,
    };
    upsertUser(userData);
    navigate('/users');
  };

  const fields: FieldConfig[] = [
    { name: 'name', label: 'Full Name', type: 'text', placeholder: 'Enter full name', required: true, colSpan: 6 },
    { name: 'avatar', label: 'Upload Photo', type: 'file', accept: 'image/*', colSpan: 6 },
    { name: 'email', label: 'Email ID', type: 'email', placeholder: 'user@example.com', required: true, colSpan: 6 },
    { name: 'employeeId', label: 'Employee ID', type: 'text', placeholder: 'e.g., EMP-101', required: true, colSpan: 6 },
    { name: 'createdAt', label: 'Created Date', type: 'date', required: true, colSpan: 6 },
    { name: 'joiningDate', label: 'Joining Date', type: 'date', required: true, colSpan: 6 },
    { name: 'role', label: 'Role', type: 'select', options: ROLE_OPTIONS, required: true, colSpan: 6 },
    { name: 'address', label: 'Address', type: 'textarea', placeholder: 'Enter address', colSpan: 12 },
  ];

  // Convert user to format expected by DynamicForm
  const initialValues: Record<string, string> = user ? {
    name: user.name,
    avatar: user.avatar || '',
    email: user.email,
    employeeId: user.employeeId || '',
    createdAt: user.createdAt || user.joinedAt || new Date().toISOString().split('T')[0],
    joiningDate: user.joiningDate || user.joinedAt || new Date().toISOString().split('T')[0],
    role: user.role,
    address: user.address || '',
  } : {
    createdAt: new Date().toISOString().split('T')[0],
    joiningDate: new Date().toISOString().split('T')[0],
  };

  return (
    <div className="container-fluid px-3 px-lg-4 py-4">
      <div className="page-heading">
        <div className="page-heading-copy">
          <span className="page-icon"><i className="bi bi-people" aria-hidden="true" /></span>
          <div>
            <p className="eyebrow mb-1">User Management</p>
            <h1 className="h3 mb-1">{isEdit ? 'Edit User' : 'Create User'}</h1>
            <p className="text-muted mb-0">Manage user information and access.</p>
          </div>
        </div>
      </div>

      <div className="panel mt-3">
        <DynamicForm
          fields={fields}
          initialValues={initialValues}
          onSubmit={handleSubmit}
          submitLabel={isEdit ? 'Update User' : 'Create User'}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};