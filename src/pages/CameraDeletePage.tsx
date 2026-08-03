import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_CAMERAS, deleteCamera } from '../services/mockData';
import { STATUS_BADGES } from '../constants';

export const CameraDeletePage = () => {
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [successMsg, setSuccessMsg] = useState<string>('');

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(MOCK_CAMERAS.map((c) => c.id));
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
    selectedIds.forEach((id) => deleteCamera(id));
    setSelectedIds([]);
    setSuccessMsg(`Successfully deleted ${count} selected camera(s).`);
    setTimeout(() => {
      setSuccessMsg('');
      navigate('/cameras');
    }, 1500);
  };

  const isAllSelected = MOCK_CAMERAS.length > 0 && selectedIds.length === MOCK_CAMERAS.length;

  return (
    <div className="container-fluid px-3 px-lg-4 py-4">
      <div className="page-heading">
        <div className="page-heading-copy">
          <span className="page-icon"><i className="bi bi-camera-video" aria-hidden="true" /></span>
          <div>
            <p className="eyebrow mb-1">Camera Management</p>
            <h1 className="h3 mb-1">Remove Cameras</h1>
            <p className="text-muted mb-0">Select one or more cameras to remove from the platform.</p>
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
        {MOCK_CAMERAS.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-camera-video fs-1 mb-3 d-block text-danger" />
            <p className="mb-0">No cameras available to delete.</p>
          </div>
        ) : (
          <>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="text-muted">
                {selectedIds.length} of {MOCK_CAMERAS.length} camera(s) selected
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
                    <th>Camera Name</th>
                    <th>Site</th>
                    <th>Location</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th className="text-center">Health</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_CAMERAS.map((cam) => {
                    const isChecked = selectedIds.includes(cam.id);
                    return (
                      <tr key={cam.id} className={isChecked ? 'table-danger-subtle' : ''}>
                        <td>
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={isChecked}
                            onChange={(e) => handleSelectOne(cam.id, e.target.checked)}
                          />
                        </td>
                        <td>
                          <div>
                            <p className="fw-semibold mb-0">{cam.name}</p>
                            <code className="small text-muted">{cam.rtspUrl}</code>
                          </div>
                        </td>
                        <td>{cam.siteName || 'N/A'}</td>
                        <td>{cam.location || 'N/A'}</td>
                        <td><span className="badge text-bg-light border text-uppercase">{cam.type}</span></td>
                        <td>
                          <span className={`badge ${STATUS_BADGES[cam.status] || 'text-bg-secondary'}`}>
                            {cam.status}
                          </span>
                        </td>
                        <td className="text-center">
                          <span className={`fw-bold ${cam.healthScore && cam.healthScore >= 80 ? 'text-success' : cam.healthScore && cam.healthScore >= 50 ? 'text-warning' : 'text-danger'}`}>
                            {cam.healthScore}%
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
