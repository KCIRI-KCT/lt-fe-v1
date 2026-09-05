import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DynamicForm, type FieldConfig } from '../components/forms/DynamicForm';
import { employeeService } from '../services/employeeService';
import type { UserProfile } from '../types';
import { ROLE_OPTIONS } from '../constants';

export const UserEditPage = () => {
  const navigate = useNavigate();
  const { id: routeId } = useParams();
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>(routeId || '');
  const [prevRouteId, setPrevRouteId] = useState(routeId);
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [isLoadingSingle, setIsLoadingSingle] = useState(false);

  // Sync selectedUserId when routeId changes during render
  if (routeId !== prevRouteId) {
    setPrevRouteId(routeId);
    if (routeId && routeId !== 'add') {
      setSelectedUserId(routeId);
    }
  }

  useEffect(() => {
    employeeService.getEmployees().then(setUsersList).catch(() => setUsersList([]));
  }, []);

  // Support direct /users/edit/:id — fetch single employee from API and prefill
  useEffect(() => {
    if (!routeId || routeId === 'add') return;

    const exists = usersList.some((u) => String(u.id) === String(routeId));
    if (exists) return;

    let ignore = false;

    queueMicrotask(() => {
      if (!ignore) setIsLoadingSingle(true);
    });

    employeeService.getEmployee(routeId)
      .then(() => employeeService.getEmployees())
      .then((data) => {
        if (!ignore) setUsersList(data);
      })
      .catch(() => null)
      .finally(() => {
        if (!ignore) setIsLoadingSingle(false);
      });

    return () => {
      ignore = true;
    };
  }, [routeId, usersList]);

  const selectedUser = usersList.find((u) => String(u.id) === String(selectedUserId));

  const handleCancel = () => navigate('/users');

  const handleSubmit = async (data: Record<string, string | boolean>) => {
    if (!selectedUserId) return;
    try {
      const empCode =
        (data.employee_code as string) ||
        selectedUser?.employeeId ||
        ((selectedUser as unknown as Record<string, unknown> | undefined)?.employee_code as string) ||
        `EMP-${selectedUserId}`;

      await employeeService.updateEmployee(selectedUserId, {
        employee_code: empCode,
        employee_name: data.name as string,
        email: data.email as string,
        mobile_number: (data.phone as string) || '',
        phone: (data.phone as string) || '',
        address: (data.address as string) || (data.location as string) || '',
        city: (data.city as string) || '',
        state: (data.state as string) || '',
        country: (data.country as string) || '',
        pincode: (data.pincode as string) || '',
        location: (data.location as string) || '',
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
  };

  const fields: FieldConfig[] = [
    { name: 'employee_code', label: 'Employee Code (employee_code)', type: 'text', placeholder: 'EMP-001', disabled: true, helpText: 'Read-only string identifier', colSpan: 6 },
    { name: 'name', label: 'Full Name', type: 'text', placeholder: 'Enter full name', required: true, colSpan: 6 },
    { name: 'email', label: 'Email Address', type: 'email', placeholder: 'user@example.com', required: true, colSpan: 6 },
    { name: 'phone', label: 'Mobile Number *', type: 'tel', placeholder: '9876543210', required: true, colSpan: 6 },
    { name: 'role', label: 'Role', type: 'select', options: ROLE_OPTIONS, required: true, colSpan: 6 },
    { name: 'department', label: 'Department', type: 'text', placeholder: 'Department name', colSpan: 6 },
    { name: 'address', label: 'Street Address', type: 'text', placeholder: 'Street address', colSpan: 12 },
    { name: 'city', label: 'City', type: 'text', placeholder: 'City', colSpan: 6 },
    { name: 'state', label: 'State', type: 'text', placeholder: 'State', colSpan: 6 },
    { name: 'country', label: 'Country', type: 'text', placeholder: 'Country', colSpan: 6 },
    { name: 'pincode', label: 'Pincode / Postal Code', type: 'text', placeholder: 'Pincode', colSpan: 6 },
    { name: 'workspace', label: 'Assigned Project / Workspace', type: 'text', placeholder: 'Project Name / Code', colSpan: 6 },
    { name: 'siteName', label: 'Assigned Site', type: 'text', placeholder: 'Site Name / Code', colSpan: 6 },
    { name: 'chainageKm', label: 'Assigned Chainage (KM Marker)', type: 'text', placeholder: 'KM 120+400', colSpan: 6 },
  ];

  const initialValues: Record<string, string> = selectedUser ? {
    employee_code: selectedUser.employeeId || ((selectedUser as unknown as Record<string, unknown>).employee_code as string) || `EMP-${selectedUser.id}`,
    name: selectedUser.name || '',
    email: selectedUser.email || '',
    phone: selectedUser.phone || selectedUser.mobile_number || '',
    role: selectedUser.role,
    department: selectedUser.department || '',
    address: selectedUser.address || '',
    city: selectedUser.city || '',
    state: selectedUser.state || '',
    country: selectedUser.country || '',
    pincode: selectedUser.pincode || '',
    location: selectedUser.location || selectedUser.address || '',
    workspace: selectedUser.workspace || selectedUser.projectName || '',
    siteName: selectedUser.siteName || '',
    chainageKm: (selectedUser as unknown as Record<string, string>).chainageKm || '',
  } : {};

  return (
    <div className="container-fluid px-3 px-md-4 py-3 py-lg-4">
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
        {isLoadingSingle && <div className="alert alert-info py-2 small">Loading user {routeId} from API...</div>}
        <div className="mb-4 col-md-6">
          <label htmlFor="userSelect" className="form-label fw-bold">Select User to Edit {routeId ? `(ID: ${routeId})` : ''}</label>
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
            {usersList.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role.replace(/_/g, ' ')}) - {u.email} [{u.mobile_number || u.phone || 'no phone'}]
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
