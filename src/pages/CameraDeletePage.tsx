import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { cameraService } from '../services/cameraService';
import type { Camera } from '../types';
import { STATUS_BADGES } from '../constants';

export const CameraDeletePage = () => {
  const navigate = useNavigate();
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCameraIds, setSelectedCameraIds] = useState<Set<string>>(new Set());
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [deleting, setDeleting] = useState<boolean>(false);
  const masterCheckboxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let isMounted = true;
    cameraService.getCameras()
      .then((data) => {
        if (isMounted) setCameras(data);
      })
      .catch(() => {
        if (isMounted) setCameras([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  const toggleAll = (checked: boolean) => {
    if (checked) {
      setSelectedCameraIds(new Set(cameras.map((c) => c.id)));
    } else {
      setSelectedCameraIds(new Set());
    }
  };

  const toggleRow = (id: string) => {
    setSelectedCameraIds((prev) => {
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
    if (selectedCameraIds.size === 0) return;
    setDeleting(true);
    const ids = Array.from(selectedCameraIds);
    const count = ids.length;

    try {
      await Promise.all(ids.map((id) => cameraService.deleteCamera(id)));
      setCameras((prev) => prev.filter((c) => !selectedCameraIds.has(c.id)));
      setSelectedCameraIds(new Set());
      setSuccessMsg(`Successfully deleted ${count} selected camera(s).`);
      setTimeout(() => {
        setSuccessMsg('');
        navigate('/cameras');
      }, 1500);
    } catch (err) {
      console.error('Failed to delete cameras:', err);
    } finally {
      setDeleting(false);
    }
  };

  const isAllSelected = cameras.length > 0 && selectedCameraIds.size === cameras.length;
  const isIndeterminate = selectedCameraIds.size > 0 && !isAllSelected;

  useEffect(() => {
    if (masterCheckboxRef.current) {
      masterCheckboxRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate]);

  return (
    <div className="container-fluid px-3 px-md-4 py-3 py-lg-4">
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
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status" />
            <p className="mt-2 text-muted">Loading camera list...</p>
          </div>
        ) : cameras.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-camera-video fs-1 mb-3 d-block text-danger" />
            <p className="mb-0">No cameras available to delete.</p>
          </div>
        ) : (
          <>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="text-muted">
                {selectedCameraIds.size} of {cameras.length} camera(s) selected
              </span>
              <button
                className="btn btn-danger"
                disabled={selectedCameraIds.size === 0 || deleting}
                onClick={handleDeleteSelected}
              >
                <i className="bi bi-trash-fill me-2" />
                {deleting ? 'Deleting...' : `Delete Selected (${selectedCameraIds.size})`}
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
                    <th>Camera Name</th>
                    <th>Site</th>
                    <th>Location</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th className="text-center">Health</th>
                  </tr>
                </thead>
                <tbody>
                  {cameras.map((cam) => {
                    const isChecked = selectedCameraIds.has(cam.id);
                    return (
                      <tr key={cam.id} className={isChecked ? 'table-danger-subtle' : ''}>
                        <td>
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={isChecked}
                            onChange={() => toggleRow(cam.id)}
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

