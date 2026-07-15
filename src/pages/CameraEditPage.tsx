import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DynamicForm, type FieldConfig } from '../components/forms/DynamicForm';
import { MOCK_CAMERAS, MOCK_SITES, upsertCamera } from '../services/mockData';
import type { Camera } from '../types';
import { CAMERA_TYPE_OPTIONS } from '../constants';

export const CameraEditPage = () => {
  const navigate = useNavigate();
  const [selectedCamId, setSelectedCamId] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  const selectedCam = MOCK_CAMERAS.find((c) => c.id === selectedCamId);

  const handleCancel = () => navigate('/cameras');

  const handleSubmit = (data: Record<string, string | boolean>) => {
    if (!selectedCam) return;
    const cameraData: Camera = {
      ...selectedCam,
      name: data.name as string,
      rtspUrl: data.rtspUrl as string,
      siteId: data.siteId as string,
      siteName: MOCK_SITES.find((s) => s.id === data.siteId)?.name || '',
      location: data.location as string,
      type: data.type as Camera['type'],
      healthScore: Number(data.healthScore) || 0,
    };
    upsertCamera(cameraData);
    setSuccessMsg('Camera updated successfully!');
    setTimeout(() => {
      setSuccessMsg('');
      navigate('/cameras');
    }, 1500);
  };

  const fields: FieldConfig[] = [
    { name: 'name', label: 'Camera Name', type: 'text', placeholder: 'e.g., Main Gate - Site A', required: true, colSpan: 6 },
    { name: 'rtspUrl', label: 'RTSP URL', type: 'text', placeholder: 'rtsp://192.168.1.10/stream1', required: true, colSpan: 6 },
    { name: 'siteId', label: 'Site', type: 'select', options: MOCK_SITES.map((s) => ({ value: s.id, label: s.name })), required: true, colSpan: 6 },
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

      <div className="panel mt-3">
        <div className="mb-4 col-md-6">
          <label htmlFor="cameraSelect" className="form-label fw-bold">Select Camera to Edit</label>
          <select
            id="cameraSelect"
            className="form-select"
            value={selectedCamId}
            onChange={(e) => {
              setSelectedCamId(e.target.value);
              setSuccessMsg('');
            }}
          >
            <option value="">-- Choose Camera --</option>
            {MOCK_CAMERAS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.type.toUpperCase()}) - {c.siteName}
              </option>
            ))}
          </select>
        </div>

        {selectedCam ? (
          <div className="pt-3 border-top">
            <DynamicForm
              key={selectedCamId} // Re-mount form on camera selection change
              fields={fields}
              initialValues={initialValues}
              onSubmit={handleSubmit}
              submitLabel="Update Camera"
              onCancel={handleCancel}
            />
          </div>
        ) : (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-camera-video-off fs-1 mb-3 d-block" />
            <p className="mb-0">Please select a camera from the dropdown above to start editing.</p>
          </div>
        )}
      </div>
    </div>
  );
};
