// ============================================================================
// Update User Modal Component — Aligned with OpenAPI spec:
// GET /api/auth/profile/ (ApplicationUserProfile) & PATCH /api/employees/{employee_id}/ (PatchedEmployeeRequest)
// Renders read-only controls for employee.employee_code & employee.employee_id
// ============================================================================

import { useState, useEffect } from 'react';
import { DynamicForm, type FieldConfig } from '../forms/DynamicForm';
import { userService, type UserApiPayload } from '../../services/userService';
import { authService } from '../../services/authService';
import { ROLE_OPTIONS } from '../../constants';
import { normalizeRole } from '../../utils/roleUtils';

interface UpdateUserModalProps {
  show: boolean;
  userId: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const UpdateUserModal = ({ show, userId, onClose, onSuccess }: UpdateUserModalProps) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [userData, setUserData] = useState<UserApiPayload | null>(null);

  useEffect(() => {
    let active = true;
    if (show) {
      const fetchPromise = (!userId || userId === 'profile' || userId === 'current')
        ? authService.getProfile()
        : userService.getUser(userId);

      fetchPromise
        .then((data) => {
          if (active) {
            setUserData(data as UserApiPayload);
            setErrorMsg('');
          }
        })
        .catch(() => {
          if (active) {
            setErrorMsg('Failed to load user details from backend API.');
          }
        })
        .finally(() => {
          if (active) {
            setLoading(false);
          }
        });
    }
    return () => {
      active = false;
    };
  }, [show, userId]);

  if (!show) return null;

  const isDataLoading = loading || (!userData && !errorMsg);

  const handleFormSubmit = async (values: Record<string, string | boolean>) => {
    try {
      setErrorMsg('');
      const empObject = (userData?.employee as Record<string, unknown> | undefined) || {};
      const empCodeValue = String(
        values.employee_code ||
        userData?.employee_code ||
        empObject.employee_code ||
        userData?.emp_id ||
        userData?.empId ||
        empObject.emp_id ||
        empObject.empId ||
        ''
      );
      const empIdValue: string | number =
        (userData?.employee_id as string | number | undefined) ||
        (empObject.employee_id as string | number | undefined) ||
        userData?.id ||
        (empObject.id as string | number | undefined) ||
        userId ||
        1;

      const selectedRole = normalizeRole(values.role as string);

      const updatePayload: UserApiPayload = {
        id: String(userId || userData?.id || '1'),
        employee_id: empIdValue,
        employee_code: empCodeValue,
        emp_id: empCodeValue,
        empId: empCodeValue,
        name: values.name as string,
        employee_name: values.name as string,
        email: values.email as string,
        mobile_number: (values.phone as string) || '',
        phone: (values.phone as string) || '',
        role: selectedRole,
        designation: selectedRole,
        department: (values.department as string) || '',
        location: (values.location as string) || '',
        workspace: (values.workspace as string) || '',
      };

      // OpenAPI Alignment: Update employee entity via PATCH /api/employees/{employee_id}/ (PatchedEmployeeRequest)
      await userService.updateUser(String(empIdValue), updatePayload);
      setSuccessMsg('User profile updated successfully via API!');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1200);
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: Record<string, unknown> | string } };
      const errData = apiErr.response?.data;
      if (errData && typeof errData === 'object') {
        const messages = Object.entries(errData).map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`);
        setErrorMsg(messages.join(' | '));
      } else {
        setErrorMsg('Failed to update employee profile via PATCH /api/employees/{employee_id}/.');
      }
    }
  };

  const fields: FieldConfig[] = [
    {
      name: 'employee_code',
      label: 'Employee Code (employee.employee_code)',
      type: 'text',
      disabled: true,
      colSpan: 6,
      helpText: 'Read-only string identifier (maxLength: 50)',
    },
    {
      name: 'employee_id',
      label: 'Employee ID (employee.employee_id)',
      type: 'text',
      disabled: true,
      colSpan: 6,
      helpText: 'Read-only integer database primary key',
    },
    {
      name: 'name',
      label: 'Full Name',
      type: 'text',
      placeholder: 'Enter full name',
      required: true,
      colSpan: 6,
    },
    {
      name: 'email',
      label: 'Email Address',
      type: 'email',
      placeholder: 'user@example.com',
      required: true,
      colSpan: 6,
    },
    {
      name: 'phone',
      label: 'Phone / Mobile Number',
      type: 'tel',
      placeholder: '+91-9876543210',
      colSpan: 6,
    },
    {
      name: 'role',
      label: 'Role / Designation',
      type: 'select',
      options: ROLE_OPTIONS,
      required: true,
      colSpan: 6,
    },
    {
      name: 'department',
      label: 'Department',
      type: 'text',
      placeholder: 'Department name',
      colSpan: 6,
    },
    {
      name: 'location',
      label: 'Location',
      type: 'text',
      placeholder: 'City, State',
      colSpan: 6,
    },
    {
      name: 'workspace',
      label: 'Workspace',
      type: 'text',
      placeholder: 'Project/Organization',
      colSpan: 6,
    },
  ];

  const empObject = (userData?.employee as Record<string, unknown> | undefined) || {};
  const currentEmpCode = String(
    userData?.employee_code ||
    empObject.employee_code ||
    userData?.emp_id ||
    userData?.empId ||
    userData?.employeeId ||
    empObject.emp_id ||
    empObject.empId ||
    ''
  );
  const currentEmpId = String(
    userData?.employee_id ||
    empObject.employee_id ||
    userData?.id ||
    empObject.id ||
    ''
  );

  const initialValues: Record<string, string> = userData ? {
    employee_code: currentEmpCode,
    employee_id: currentEmpId,
    name: (userData.name || userData.employee_name || empObject.employee_name || '') as string,
    email: (userData.email || empObject.email || '') as string,
    phone: (userData.phone || userData.mobile_number || empObject.mobile_number || '') as string,
    role: normalizeRole(String(userData.role || userData.designation || empObject.designation || '')),
    department: (userData.department || empObject.department || '') as string,
    location: (userData.location || userData.address || empObject.location || empObject.address || '') as string,
    workspace: (userData.workspace || '') as string,
  } : {};

  return (
    <>
      {/* Modal Backdrop */}
      <div className="modal-backdrop fade show" style={{ zIndex: 1050 }} onClick={onClose} />

      {/* Modal Container */}
      <div className="modal fade show d-block" tabIndex={-1} role="dialog" aria-modal="true" style={{ zIndex: 1055 }}>
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content shadow-lg border-0" style={{ borderRadius: '12px' }}>
            {/* Modal Header */}
            <div className="modal-header bg-light border-bottom px-4 py-3">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-person-badge text-primary fs-5" />
                <h5 className="modal-title fw-bold mb-0">Update User Profile (OpenAPI Spec)</h5>
              </div>
              <button type="button" className="btn-close" aria-label="Close" onClick={onClose} />
            </div>

            {/* Modal Body */}
            <div className="modal-body p-4" style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
              {isDataLoading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading user profile...</span>
                  </div>
                  <p className="text-muted mt-2 mb-0">Fetching ApplicationUserProfile via GET /api/auth/profile/...</p>
                </div>
              ) : errorMsg ? (
                <div className="alert alert-danger" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2" />
                  {errorMsg}
                </div>
              ) : userData ? (
                <>
                  {successMsg && (
                    <div className="alert alert-success mb-3" role="alert">
                      <i className="bi bi-check-circle-fill me-2" />
                      {successMsg}
                    </div>
                  )}
                  <DynamicForm
                    key={`${userId || 'profile'}-${userData.id || userData.employee_id || ''}`}
                    fields={fields}
                    initialValues={initialValues}
                    onSubmit={handleFormSubmit}
                    submitLabel="Save Changes"
                    onCancel={onClose}
                  />
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UpdateUserModal;
