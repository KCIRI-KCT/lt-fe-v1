// ============================================================================
// Camera Form Page — Create/Edit camera with defined input fields
// ============================================================================

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DynamicForm, type FieldConfig } from '../components/forms/DynamicForm';
import { cameraService } from '../services/cameraService';
import { siteService } from '../services/siteService';
import type { Camera, Site } from '../types';
import { CAMERA_TYPE_OPTIONS } from '../constants';

export const CameraFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id && id !== 'add';

  const [camera, setCamera] = useState<Camera | undefined>(undefined);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        const fetchedSites = await siteService.getSites();
        if (isMounted) setSites(fetchedSites);

        if (isEdit && id) {
          const cam = await cameraService.getCamera(id);
          if (isMounted) setCamera(cam);
        }
      } catch (err) {
        console.error('Error loading camera form data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();
    return () => { isMounted = false; };
  }, [id, isEdit]);

  const handleCancel = () => navigate('/cameras');

  const handleSubmit = async (data: Record<string, string | boolean>) => {
    setSubmitting(true);
    setErrorMsg('');

    try {
      const selectedSite = sites.find((s) => s.id === data.siteId);
      const cameraPayload: Partial<Camera> = {
        name: data.name as string,
        rtspUrl: data.rtspUrl as string,
        siteId: data.siteId as string,
        siteName: selectedSite?.name || '',
        location: data.location as string,
        type: data.type as Camera['type'],
        status: isEdit ? camera?.status || 'online' : 'online',
        healthScore: Number(data.healthScore) || 100,
      };

      if (isEdit && id) {
        await cameraService.updateCamera(id, cameraPayload);
      } else {
        await cameraService.createCamera(cameraPayload);
      }

      navigate('/cameras');
    } catch (err) {
      console.error('Failed to save camera:', err);
      setErrorMsg('Failed to save camera. Please check input values and try again.');
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
            <p className="mt-2 text-muted">Loading form details...</p>
          </div>
        ) : (
          <fieldset disabled={submitting}>
            <DynamicForm
              fields={fields}
              initialValues={initialValues}
              onSubmit={handleSubmit}
              submitLabel={submitting ? 'Saving Camera...' : isEdit ? 'Update Camera' : 'Create Camera'}
              onCancel={handleCancel}
            />
          </fieldset>
        )}
      </div>
    </div>
  );
};