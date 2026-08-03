import { useState } from 'react';
import { MOCK_PROJECTS, upsertProject, deleteProject } from '../services/mockData';

export const ProjectDeletePage = () => {
  const [activeTab, setActiveTab] = useState<'request' | 'approve'>('request');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [toastMsg, setToastMsg] = useState<string>('');
  const [refreshState, setRefreshState] = useState<number>(0);

  // Force component re-render when local storage/arrays modify
  const triggerRefresh = () => {
    setSelectedIds([]);
    setRefreshState(prev => prev + 1);
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Filter projects by current state
  const pendingRequests = MOCK_PROJECTS.filter((p) => p.deleteRequested);
  const activeProjects = MOCK_PROJECTS.filter((p) => !p.deleteRequested);

  const currentList = activeTab === 'request' ? activeProjects : pendingRequests;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(currentList.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  // Tab 1 Action: Submit Request
  const handleSubmitRequests = () => {
    if (selectedIds.length === 0) return;
    
    selectedIds.forEach((id) => {
      const proj = MOCK_PROJECTS.find((p) => p.id === id);
      if (proj) {
        upsertProject({ ...proj, deleteRequested: true });
      }
    });

    showToast(`Successfully submitted delete requests for ${selectedIds.length} project(s).`);
    triggerRefresh();
  };

  // Tab 2 Action: Approve Request (Permanent Delete)
  const handleApproveRequests = () => {
    if (selectedIds.length === 0) return;
    const count = selectedIds.length;

    selectedIds.forEach((id) => {
      deleteProject(id);
    });

    showToast(`Approved deletion. Permanently removed ${count} project(s).`);
    triggerRefresh();
  };

  // Tab 2 Action: Reject Request (Restore Status)
  const handleRejectRequests = () => {
    if (selectedIds.length === 0) return;
    const count = selectedIds.length;

    selectedIds.forEach((id) => {
      const proj = MOCK_PROJECTS.find((p) => p.id === id);
      if (proj) {
        upsertProject({ ...proj, deleteRequested: false });
      }
    });

    showToast(`Rejected delete requests. Restored ${count} project(s) to active status.`);
    triggerRefresh();
  };

  const isAllSelected = currentList.length > 0 && selectedIds.length === currentList.length;

  return (
    <div className="container-fluid px-3 px-lg-4 py-4" key={refreshState}>
      {/* Top Banner Message */}
      {toastMsg && (
        <div className="position-fixed bottom-0 end-0 m-4 p-3 bg-dark text-white rounded-3 shadow-lg d-flex align-items-center gap-2 animate-fade-in" style={{ zIndex: 1050 }}>
          <i className="bi bi-info-circle-fill text-info" />
          <span className="small fw-semibold">{toastMsg}</span>
        </div>
      )}

      <div className="page-heading">
        <div className="page-heading-copy">
          <span className="page-icon"><i className="bi bi-building" aria-hidden="true" /></span>
          <div>
            <p className="eyebrow mb-1">Project Management</p>
            <h1 className="h3 mb-1">Delete Project Approvals</h1>
            <p className="text-muted mb-0">Submit project deletion requests, or authorize requests as a Project Manager.</p>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="d-flex border-bottom mt-4 mb-3">
        <button
          className={`btn btn-link py-2 px-3 text-decoration-none border-bottom border-2 rounded-0 small fw-semibold ${activeTab === 'request' ? 'border-primary text-primary fw-bold' : 'border-transparent text-muted'}`}
          onClick={() => { setActiveTab('request'); setSelectedIds([]); }}
        >
          <i className="bi bi-file-earmark-arrow-up me-1" />
          1. Submit Delete Request ({activeProjects.length})
        </button>
        <button
          className={`btn btn-link py-2 px-3 text-decoration-none border-bottom border-2 rounded-0 small fw-semibold ${activeTab === 'approve' ? 'border-danger text-danger fw-bold' : 'border-transparent text-muted'}`}
          onClick={() => { setActiveTab('approve'); setSelectedIds([]); }}
        >
          <i className="bi bi-shield-check me-1" />
          2. Pending Approvals (Project Manager Panel) ({pendingRequests.length})
        </button>
      </div>

      <div className="panel p-4">
        {currentList.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-folder-x fs-1 mb-3 d-block text-secondary" />
            <p className="mb-0">
              {activeTab === 'request'
                ? 'No active projects available to request deletion.'
                : 'No pending delete requests needing approval.'}
            </p>
          </div>
        ) : (
          <>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
              <span className="text-muted small">
                {selectedIds.length} of {currentList.length} project(s) selected
              </span>

              <div className="d-flex gap-2">
                {activeTab === 'request' ? (
                  <button
                    className="btn btn-primary btn-sm"
                    disabled={selectedIds.length === 0}
                    onClick={handleSubmitRequests}
                  >
                    <i className="bi bi-send me-1.5" />
                    Submit Delete Request ({selectedIds.length})
                  </button>
                ) : (
                  <>
                    <button
                      className="btn btn-danger btn-sm"
                      disabled={selectedIds.length === 0}
                      onClick={handleApproveRequests}
                    >
                      <i className="bi bi-check-circle me-1.5" />
                      Approve Deletion ({selectedIds.length})
                    </button>
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      disabled={selectedIds.length === 0}
                      onClick={handleRejectRequests}
                    >
                      <i className="bi bi-x-circle me-1.5" />
                      Reject Request
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={isAllSelected}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      />
                    </th>
                    <th>Project</th>
                    <th>State & City</th>
                    <th>Timeline Dates</th>
                    <th>Role Assignments</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {currentList.map((proj) => {
                    const isChecked = selectedIds.includes(proj.id);
                    return (
                      <tr key={proj.id} className={isChecked ? (activeTab === 'request' ? 'table-primary-subtle' : 'table-danger-subtle') : ''}>
                        <td>
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={isChecked}
                            onChange={(e) => handleSelectOne(proj.id, e.target.checked)}
                          />
                        </td>
                        <td>
                          <div>
                            <p className="fw-semibold mb-0">{proj.name}</p>
                            <small className="text-muted">{proj.code}</small>
                          </div>
                        </td>
                        <td>
                          <div>
                            <span className="fw-semibold">{proj.cityName || 'N/A'}</span>
                            <br />
                            <small className="text-muted">{proj.stateName || 'N/A'}</small>
                          </div>
                        </td>
                        <td>
                          <small className="text-muted">
                            {proj.startDate} <span className="fw-bold">to</span> {proj.endDate || 'N/A'}
                          </small>
                        </td>
                        <td>
                          <div className="small" style={{ minWidth: '220px' }}>
                            {proj.roleAssignments && proj.roleAssignments.length > 0 ? (
                              <div className="d-grid gap-1">
                                {proj.roleAssignments.map((ra, idx) => (
                                  <div key={idx} className="mb-0.5">
                                    <span className="badge text-bg-light border text-capitalize me-1" style={{ fontSize: '0.65rem' }}>{ra.role.replace(/_/g, ' ')}</span>
                                    <strong>{ra.userName}</strong>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-muted">No personnel configured</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${proj.deleteRequested ? 'bg-warning text-dark' : 'bg-success-subtle text-success-emphasis border'} text-capitalize`}>
                            {proj.deleteRequested ? 'Delete Requested' : proj.status}
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
