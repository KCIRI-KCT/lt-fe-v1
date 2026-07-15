// ============================================================================
// Camera Form Page — Create/Edit camera with defined input fields
// ============================================================================

import { useNavigate, useParams } from 'react-router-dom';
import { DynamicForm, type FieldConfig } from '../components/forms/DynamicForm';
import { MOCK_CAMERAS, MOCK_SITES, upsertCamera } from '../services/mockData';
import type { Camera } from '../types';
import { CAMERA_TYPE_OPTIONS } from '../constants';

export const CameraFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id && id !== 'add';
  const camera = isEdit ? MOCK_CAMERAS.find((c) => c.id === id) : undefined;

  const handleCancel = () => navigate('/cameras');

  const handleSubmit = (data: Record<string, string | boolean>) => {
    const cameraData: Camera = {
      id: isEdit && camera ? camera.id : Date.now().toString(),
      name: data.name as string,
      rtspUrl: data.rtspUrl as string,
      siteId: data.siteId as string,
      siteName: MOCK_SITES.find((s) => s.id === data.siteId)?.name || '',
      location: data.location as string,
      status: isEdit ? camera?.status || 'online' : 'online',
      type: data.type as Camera['type'],
      lastOnline: isEdit ? camera?.lastOnline || '' : '',
      healthScore: Number(data.healthScore) || 0,
    };
    upsertCamera(cameraData);
    navigate('/cameras');
  };

  const fields: FieldConfig[] = [
    { name: 'name', label: 'Camera Name', type: 'text', placeholder: 'e.g., Main Gate - Site A', required: true, colSpan: 6 },
    { name: 'rtspUrl', label: 'RTSP URL', type: 'text', placeholder: 'rtsp://192.168.1.10/stream1', required: true, colSpan: 6 },
    { name: 'siteId', label: 'Site', type: 'select', options: MOCK_SITES.map((s) => ({ value: s.id, label: s.name })), required: true, colSpan: 6 },
    { name: 'location', label: 'Location', type: 'text', placeholder: 'Specific location description', required: true, colSpan: 6 },
    { name: 'type', label: 'Camera Type', type: 'select', options: CAMERA_TYPE_OPTIONS, required: true, colSpan: 6 },
    { name: 'healthScore', label: 'Health Score', type: 'number', placeholder: '0-100', colSpan: 6 },
  ];

  const initialValues: Record<string, string> = camera ? {
    name: camera.name,
    rtspUrl: camera.rtspUrl,
    siteId: camera.siteId,
    location: camera.location,
    type: camera.type,
    healthScore: String(camera.healthScore),
  } : {};

  return (
    <div className="container-fluid px-3 px-lg-4 py-4">
      <div className="page-heading">
        <div className="page-heading-copy">
          <span className="page-icon"><i className="bi bi-camera-video" aria-hidden="true" /></span>
          <div>
            <p className="eyebrow mb-1">Camera Management</p>
            <h1 className="h3 mb-1">{isEdit ? 'Edit Camera' : 'Create Camera'}</h1>
            <p className="text-muted mb-0">Manage camera configuration and settings.</p>
          </div>
        </div>
      </div>

      <div className="panel mt-3">
        <DynamicForm
          fields={fields}
          initialValues={initialValues}
          onSubmit={handleSubmit}
          submitLabel={isEdit ? 'Update Camera' : 'Create Camera'}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};