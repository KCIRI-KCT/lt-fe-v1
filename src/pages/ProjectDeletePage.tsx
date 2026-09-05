import { useState, useEffect, useCallback, useRef } from 'react';
import { projectService } from '../services/projectService';
import type { Project } from '../types';

export const ProjectDeletePage = () => {
  const [activeTab, setActiveTab] = useState<'request' | 'approve'>('request');
  const [selectedProjectIds, setSelectedProjectIds] = useState<Set<string>>(new Set());
  const [toastMsg, setToastMsg] = useState<string>('');
  const [projectsList, setProjectsList] = useState<Project[]>([]);
  const masterCheckboxRef = useRef<HTMLInputElement>(null);

  const fetchProjects = useCallback(async () => {
    try {
      const data = await projectService.getProjects();
      setProjectsList(data);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    projectService.getProjects()
      .then((data) => setProjectsList(data))
      .catch(() => null);
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Filter projects by current state
  const pendingRequests = projectsList.filter((p) => p.deleteRequested);
  const activeProjects = projectsList.filter((p) => !p.deleteRequested);

  const currentList = activeTab === 'request' ? activeProjects : pendingRequests;

  const getProjId = (proj: Project): string => {
    return String(proj.id || proj.project_id || proj.code || '');
  };

  const toggleAll = (checked: boolean) => {
    if (checked) {
      setSelectedProjectIds(new Set(currentList.map(getProjId)));
    } else {
      setSelectedProjectIds(new Set());
    }
  };

  const toggleRow = (id: string) => {
    setSelectedProjectIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Tab 1 Action: Submit Request
  const handleSubmitRequests = async () => {
    if (selectedProjectIds.size === 0) return;
    const ids = Array.from(selectedProjectIds);
    
    await Promise.allSettled(
      ids.map((id) => projectService.requestDeleteProject(id, 'User requested deletion via console'))
    );

    showToast(`Successfully submitted delete requests for ${ids.length} project(s).`);
    setSelectedProjectIds(new Set());
    fetchProjects();
  };

  // Tab 2 Action: Approve Request (Permanent Delete)
  const handleApproveRequests = async () => {
    if (selectedProjectIds.size === 0) return;
    const ids = Array.from(selectedProjectIds);
    const count = ids.length;

    await Promise.allSettled(
      ids.map((id) => projectService.confirmDeleteProject(id))
    );

    showToast(`Approved deletion. Permanently removed ${count} project(s).`);
    setSelectedProjectIds(new Set());
    fetchProjects();
  };

  // Tab 2 Action: Reject Request (Restore Status)
  const handleRejectRequests = async () => {
    if (selectedProjectIds.size === 0) return;
    const ids = Array.from(selectedProjectIds);
    const count = ids.length;

    await Promise.allSettled(
      ids.map((id) => projectService.updateProject(id, { deleteRequested: false }))
    );

    showToast(`Rejected delete requests. Restored ${count} project(s) to active status.`);
    setSelectedProjectIds(new Set());
    fetchProjects();
  };

  const isAllSelected = currentList.length > 0 && selectedProjectIds.size === currentList.length;
  const isIndeterminate = selectedProjectIds.size > 0 && !isAllSelected;

  useEffect(() => {
    if (masterCheckboxRef.current) {
      masterCheckboxRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate]);

  return (
    <div className="container-fluid px-3 px-md-4 py-3 py-lg-4">
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
          onClick={() => { setActiveTab('request'); setSelectedProjectIds(new Set()); }}
        >
          <i className="bi bi-file-earmark-arrow-up me-1" />
          1. Submit Delete Request ({activeProjects.length})
        </button>
        <button
          className={`btn btn-link py-2 px-3 text-decoration-none border-bottom border-2 rounded-0 small fw-semibold ${activeTab === 'approve' ? 'border-danger text-danger fw-bold' : 'border-transparent text-muted'}`}
          onClick={() => { setActiveTab('approve'); setSelectedProjectIds(new Set()); }}
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
                {selectedProjectIds.size} of {currentList.length} project(s) selected
              </span>

              <div className="d-flex gap-2">
                {activeTab === 'request' ? (
                  <button
                    className="btn btn-primary btn-sm"
                    disabled={selectedProjectIds.size === 0}
                    onClick={handleSubmitRequests}
                  >
                    <i className="bi bi-send me-1.5" />
                    Submit Delete Request ({selectedProjectIds.size})
                  </button>
                ) : (
                  <>
                    <button
                      className="btn btn-danger btn-sm"
                      disabled={selectedProjectIds.size === 0}
                      onClick={handleApproveRequests}
                    >
                      <i className="bi bi-check-circle me-1.5" />
                      Approve Deletion ({selectedProjectIds.size})
                    </button>
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      disabled={selectedProjectIds.size === 0}
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
                        ref={masterCheckboxRef}
                        type="checkbox"
                        className="form-check-input"
                        checked={isAllSelected}
                        onChange={(e) => toggleAll(e.target.checked)}
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
                    const pId = getProjId(proj);
                    const isChecked = selectedProjectIds.has(pId);
                    return (
                      <tr key={pId} className={isChecked ? (activeTab === 'request' ? 'table-primary-subtle' : 'table-danger-subtle') : ''}>
                        <td>
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={isChecked}
                            onChange={() => toggleRow(pId)}
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
