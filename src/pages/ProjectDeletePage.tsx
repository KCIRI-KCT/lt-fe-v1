import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_PROJECTS, deleteProject } from '../services/mockData';

export const ProjectDeletePage = () => {
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [successMsg, setSuccessMsg] = useState<string>('');

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(MOCK_PROJECTS.map((p) => p.id));
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

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    const count = selectedIds.length;
    selectedIds.forEach((id) => deleteProject(id));
    setSelectedIds([]);
    setSuccessMsg(`Successfully deleted ${count} selected project(s).`);
    setTimeout(() => {
      setSuccessMsg('');
      navigate('/projects');
    }, 1500);
  };

  const isAllSelected = MOCK_PROJECTS.length > 0 && selectedIds.length === MOCK_PROJECTS.length;

  return (
    <div className="container-fluid px-3 px-lg-4 py-4">
      <div className="page-heading">
        <div className="page-heading-copy">
          <span className="page-icon"><i className="bi bi-building" aria-hidden="true" /></span>
          <div>
            <p className="eyebrow mb-1">Project Management</p>
            <h1 className="h3 mb-1">Remove Projects</h1>
            <p className="text-muted mb-0">Select one or more projects to remove from the platform.</p>
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
        {MOCK_PROJECTS.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-building fs-1 mb-3 d-block text-danger" />
            <p className="mb-0">No projects available to delete.</p>
          </div>
        ) : (
          <>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="text-muted">
                {selectedIds.length} of {MOCK_PROJECTS.length} project(s) selected
              </span>
              <button
                className="btn btn-danger"
                disabled={selectedIds.length === 0}
                onClick={handleDeleteSelected}
              >
                <i className="bi bi-trash-fill me-2" />
                Delete Selected ({selectedIds.length})
              </button>
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
                    <th>Description</th>
                    <th>State & City</th>
                    <th>Start Date</th>
                    <th>Role Assignments</th>
                    <th>Sites & Chainages</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_PROJECTS.map((proj) => {
                    const isChecked = selectedIds.includes(proj.id);
                    return (
                      <tr key={proj.id} className={isChecked ? 'table-danger-subtle' : ''}>
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
                        <td style={{ minWidth: '150px' }}>
                          <span className="text-truncate d-inline-block" style={{ maxWidth: '200px' }} title={proj.description}>
                            {proj.description || 'N/A'}
                          </span>
                        </td>
                        <td>
                          <div>
                            <span className="fw-semibold">{proj.cityName || 'N/A'}</span>
                            <br />
                            <small className="text-muted">{proj.stateName || 'N/A'}</small>
                          </div>
                        </td>
                        <td>{proj.startDate}</td>
                        <td>
                          <div className="small" style={{ minWidth: '220px' }}>
                            {proj.roleAssignments && proj.roleAssignments.length > 0 ? (
                              <div className="d-grid gap-1">
                                {proj.roleAssignments.map((ra, idx) => (
                                  <div key={idx} className="mb-1">
                                    <span className="badge text-bg-light border text-capitalize me-1">{ra.role.replace(/_/g, ' ')}</span>
                                    <strong>{ra.userName}</strong> <span className="text-muted small">({ra.siteName})</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="d-grid gap-1">
                                {proj.managerName && <div><span className="badge text-bg-light border me-1">Manager</span><strong>{proj.managerName}</strong></div>}
                                {proj.supervisorName && <div><span className="badge text-bg-light border me-1">Supervisor</span><strong>{proj.supervisorName}</strong></div>}
                                {proj.engineerName && <div><span className="badge text-bg-light border me-1">Engineer</span><strong>{proj.engineerName}</strong></div>}
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="small" style={{ minWidth: '250px' }}>
                            {proj.sites && proj.sites.length > 0 ? (
                              <div className="d-grid gap-1">
                                {proj.sites.map((s) => (
                                  <div key={s.id} className="p-1 border rounded bg-light mb-1">
                                    <div className="fw-bold">{s.siteName} ({s.siteNumber})</div>
                                    <div className="text-muted small">{s.chainageName} - CH 0+{s.chainageKm}</div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              'N/A'
                            )}
                          </div>
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
