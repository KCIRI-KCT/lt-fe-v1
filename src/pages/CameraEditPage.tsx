import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DynamicForm, type FieldConfig } from '../components/forms/DynamicForm';
import { cameraService } from '../services/cameraService';
import { siteService } from '../services/siteService';
import type { Camera, Site } from '../types';
import { CAMERA_TYPE_OPTIONS } from '../constants';

export const CameraEditPage = () => {
  const navigate = useNavigate();
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCamId, setSelectedCamId] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    Promise.allSettled([cameraService.getCameras(), siteService.getSites()])
      .then(([camRes, siteRes]) => {
        if (!isMounted) return;
        if (camRes.status === 'fulfilled') setCameras(camRes.value);
        if (siteRes.status === 'fulfilled') setSites(siteRes.value);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  const selectedCam = cameras.find((c) => c.id === selectedCamId);

  const handleCancel = () => navigate('/cameras');

  const handleSubmit = async (data: Record<string, string | boolean>) => {
    if (!selectedCam) return;
    setSubmitting(true);
    setErrorMsg('');

    try {
      const selectedSiteObj = sites.find((s) => s.id === data.siteId);
      const cameraPayload: Partial<Camera> = {
        name: data.name as string,
        rtspUrl: data.rtspUrl as string,
        siteId: data.siteId as string,
        siteName: selectedSiteObj?.name || selectedCam.siteName || '',
        location: data.location as string,
        type: data.type as Camera['type'],
        healthScore: Number(data.healthScore) || 0,
      };

      await cameraService.updateCamera(selectedCamId, cameraPayload);
      setSuccessMsg('Camera updated successfully!');
      setTimeout(() => {
        setSuccessMsg('');
        navigate('/cameras');
      }, 1500);
    } catch (err) {
      console.error('Failed to update camera:', err);
      setErrorMsg('Failed to update camera. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const fields: FieldConfig[] = [
    { name: 'name', label: 'Camera Name', type: 'text', placeholder: 'e.g., Main Gate - Site A', required: true, colSpan: 6 },
    { name: 'rtspUrl', label: 'Camera IP / Feed URL', type: 'text', placeholder: 'e.g. 10.1.82.235:8080 or http://10.1.82.235:8080/feed/0', required: true, colSpan: 6 },
    { name: 'siteId', label: 'Site', type: 'select', options: sites.map((s) => ({ value: s.id, label: s.name })), required: true, colSpan: 6 },
    { name: 'location', label: 'Location', type: 'text', placeholder: 'Specific location description', required: true, colSpan: 6 },
    { name: 'type', label: 'Camera Type', type: 'select', options: CAMERA_TYPE_OPTIONS, required: true, colSpan: 6 },
    { name: 'healthScore', label: 'Health Score', type: 'number', placeholder: '0-100', colSpan: 6 },
  ];

  const initialValues: Record<string, string> = selectedCam ? {
    name: selectedCam.name,
    rtspUrl: selectedCam.rtspUrl,
    siteId: selectedCam.siteId,
    location: selectedCam.location,
    type: selectedCam.type,
    healthScore: String(selectedCam.healthScore),
  } : {};

  return (
    <div className="container-fluid px-3 px-lg-4 py-4">
      <div className="page-heading">
        <div className="page-heading-copy">
          <span className="page-icon"><i className="bi bi-camera-video" aria-hidden="true" /></span>
          <div>
            <p className="eyebrow mb-1">Camera Management</p>
            <h1 className="h3 mb-1">Update Camera</h1>
            <p className="text-muted mb-0">Select a camera to modify configuration settings.</p>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="alert alert-success mt-3" role="alert">
          <i className="bi bi-check-circle-fill me-2" />
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="alert alert-danger mt-3" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2" />
          {errorMsg}
        </div>
      )}

      <div className="panel mt-3">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status" />
            <p className="mt-2 text-muted">Loading camera data...</p>
          </div>
        ) : (
          <>
            <div className="mb-4 col-md-6">
              <label htmlFor="cameraSelect" className="form-label fw-bold">Select Camera to Edit</label>
              <select
                id="cameraSelect"
                className="form-select"
                value={selectedCamId}
                onChange={(e) => {
                  setSelectedCamId(e.target.value);
                  setSuccessMsg('');
                  setErrorMsg('');
                }}
              >
                <option value="">-- Choose Camera --</option>
                {cameras.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({(c.type || 'fixed').toUpperCase()}) {c.siteName ? `- ${c.siteName}` : ''}
                  </option>
                ))}
              </select>
            </div>

            {selectedCam ? (
              <div className="pt-3 border-top">
                <fieldset disabled={submitting}>
                  <DynamicForm
                    key={selectedCamId} // Re-mount form on camera selection change
                    fields={fields}
                    initialValues={initialValues}
                    onSubmit={handleSubmit}
                    submitLabel={submitting ? 'Updating...' : 'Update Camera'}
                    onCancel={handleCancel}
                  />
                </fieldset>
              </div>
            ) : (
              <div className="text-center py-5 text-muted">
                <i className="bi bi-camera-video-off fs-1 mb-3 d-block" />
                <p className="mb-0">Please select a camera from the dropdown above to start editing.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

