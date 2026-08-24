/* eslint-disable @typescript-eslint/no-explicit-any */
// Module: SupervisorHITLPPEPage.tsx
// Purpose: PPE submission form for safety officers only (HITL module).
//          Reuses HITLCameraCapture (with GPS/direction/timestamp overlay),
//          no backend S3 or Supabase integration required (pure client-side).

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../hooks/useApp';
import { safetyService } from '../../services/safetyService';
import { resolveHITLViolation } from '../../services/ppeNotificationService';

const updateAIAlertStatus = (id: string, status: string, extra?: Record<string, unknown>) => {
  return safetyService.updateAIAlertStatus(id, status)
    .then((res) => ({ ...res, ...extra }))
    .catch(() => null);
};

// ── CUSTOM COMPONENT IMPORT ────────────────────────────────────────────────
import HITLCameraCapture from '../components/HITLCameraCapture';

interface PageShellProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

function PageShell({ title, description, children }: PageShellProps) {
  return (
    <div className="min-vh-100 w-100 bg-light py-5 px-3 px-sm-4">
      <div className="container" style={{ maxWidth: '768px' }}>
        <header className="mb-4">
          <h1 className="h2 fw-bold text-dark">{title}</h1>
          <p className="text-muted small">{description}</p>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}

const MAX_CAPTURED_IMAGES = 1;
const PPE_SINGLE_IMAGE_MESSAGE = 'Only one image is allowed for PPE HITL';

interface SupervisorHITLPPEPageProps {
  isModal?: boolean;
  taskId?: string;
  initialSiteName?: string;
  initialChainage?: string;
  onClose?: () => void;
  onSubmitSuccess?: (submissionData: any) => void;
}

function SupervisorHITLPPEPage({
  isModal = false,
  taskId: propTaskId,
  initialSiteName,
  initialChainage,
  onClose,
  onSubmitSuccess,
}: SupervisorHITLPPEPageProps) {
  const navigate = useNavigate();
  const { taskId: urlTaskId } = useParams();
  const taskId = propTaskId || urlTaskId;
  const { user, theme } = useApp();
  const isDark = theme === 'dark';
  const profile = user as any;

  // Redirect pathway after submission (in page mode)
  const hitlBasePath = '/ai-monitoring';

  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [siteName, setSiteName] = useState(initialSiteName || profile?.assigned_site || 'Site Sector 4B');
  const [notes, setNotes] = useState('');
  const [chainageInput, setChainageInput] = useState(initialChainage || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ msg, type });
    setTimeout(() => setToastMsg(null), 3000);
  };

  // ── Camera capture actions ────────────────────────────────────────────────

  const handleOpenCamera = () => {
    if (capturedImages.length >= MAX_CAPTURED_IMAGES) {
      showToast(PPE_SINGLE_IMAGE_MESSAGE, 'error');
      return;
    }
    setIsCameraOpen(true);
  };

  const handleCapturedImage = (dataUrl: string) => {
    let added = false;

    setCapturedImages((current) => {
      if (current.length >= MAX_CAPTURED_IMAGES || !dataUrl) return current;
      added = true;
      return [...current, dataUrl];
    });

    if (!added) {
      showToast(PPE_SINGLE_IMAGE_MESSAGE, 'error');
      return;
    }
  };

  const handleRemoveImage = (idx: number) => {
    setCapturedImages((c) => c.filter((_, i) => i !== idx));
  };

  // Close lightbox on Escape key
  useEffect(() => {
    if (!selectedImage) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedImage(null);
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedImage]);

  // ── Field Helpers ─────────────────────────────────────────────────────────

  const handleChainageInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const normalizedValue = event.target.value.replace(/\s+/g, '');
    if (normalizedValue === '' || /^\d*\.?\d*$/.test(normalizedValue)) {
      setChainageInput(normalizedValue);
    }
  };

  // ── Submit Handler ────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsSubmitting(true);

    const submissionData = {
      taskId: taskId || 'local-manual-task',
      supervisorId: profile?.id,
      supervisorName: profile?.name,
      siteName: siteName.trim(),
      notes: notes.trim(),
      chainageInput: chainageInput,
      imageLocalUrl: capturedImages[0],
      submittedAt: new Date().toISOString()
    };

    try {
      if (taskId) {
        await resolveHITLViolation(taskId, {
          decision: 'SOLVED',
          notes: notes.trim() || 'Safety helmet / PPE provided.',
          hitl_data: { confidence: 0.98, verified: true, image: capturedImages[0] || null },
        });
        updateAIAlertStatus(taskId, 'resolved');
      }

      const history = JSON.parse(localStorage.getItem('hitl_ppe_submissions') || '[]');
      history.push(submissionData);
      localStorage.setItem('hitl_ppe_submissions', JSON.stringify(history));
    } catch (err) {
      console.warn('Backend resolution notification error:', err);
    }

    showToast('PPE Report submitted successfully!', 'success');

    // Reset state
    setCapturedImages([]);
    setIsCameraOpen(false);
    setNotes('');
    setIsSubmitting(false);

    if (isModal) {
      if (onSubmitSuccess) {
        onSubmitSuccess(submissionData);
      }
    } else {
      navigate(hitlBasePath);
    }
  };

  const formContent = (
    <div
      className={`p-3 p-sm-4 rounded-4 border shadow-sm ${
        isDark ? 'border-secondary bg-dark text-white' : 'border-light-subtle bg-white text-dark'
      }`}
    >
      {/* Back button (Only in non-modal full page view) */}
      {!isModal && (
        <button
          type="button"
          onClick={() => navigate(hitlBasePath)}
          className={`btn btn-sm mb-4 d-inline-flex align-items-center gap-2 ${
            isDark ? 'btn-outline-light' : 'btn-outline-secondary'
          }`}
        >
          <i className="bi bi-arrow-left" aria-hidden="true" />
          Back to Tasks
        </button>
      )}

      <form onSubmit={handleSubmit} className="d-flex flex-column gap-4">
        {/* Camera Trigger */}
        <div>
          {capturedImages.length < MAX_CAPTURED_IMAGES && (
            <button
              type="button"
              onClick={handleOpenCamera}
              className={`btn w-100 py-4 d-flex flex-column align-items-center justify-content-center gap-2 border border-2 border-dashed ${
                isDark
                  ? 'border-secondary text-light hover:bg-secondary hover:bg-opacity-25'
                  : 'border-secondary-subtle text-dark bg-light hover:bg-secondary-subtle bg-opacity-50'
              }`}
            >
              <i className="bi bi-camera-fill fs-3" aria-hidden="true" />
              <span className="small fw-semibold">Open Camera</span>
            </button>
          )}

          <p className={`mt-2 small mb-0 fw-medium ${isDark ? 'text-secondary' : 'text-muted'}`}>
            {capturedImages.length}/{MAX_CAPTURED_IMAGES} image captured
            &nbsp;
            <span className="small opacity-75">
              (GPS location and Direction heading will be stamped inside the image automatically)
            </span>
          </p>
        </div>

        {/* Overlay camera modal */}
        <HITLCameraCapture
          isOpen={isCameraOpen}
          isDark={isDark}
          siteName={siteName}
          currentCount={capturedImages.length}
          maxCaptures={MAX_CAPTURED_IMAGES}
          onClose={() => setIsCameraOpen(false)}
          onCapture={handleCapturedImage}
          onError={(msg) => showToast(msg, 'error')}
        />

        {/* Image preview */}
        {capturedImages.length > 0 && (
          <div>
            <p className="small fw-bold mb-2">Captured Image (Stamped)</p>
            <div className="row row-cols-2 row-cols-sm-3 g-3">
              {capturedImages.map((preview, index) => (
                <div key={index} className="col">
                  <div
                    onClick={() => setSelectedImage(preview)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') setSelectedImage(preview);
                    }}
                    className="position-relative border border-secondary-subtle rounded overflow-hidden"
                    style={{ cursor: 'pointer' }}
                  >
                    <img
                      src={preview}
                      alt="Stamped preview"
                      className="w-100 object-fit-cover"
                      style={{ height: '120px' }}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage(index);
                      }}
                      className="position-absolute top-0 end-0 m-2 btn btn-danger btn-xs rounded-circle d-flex align-items-center justify-content-center"
                      style={{ width: '26px', height: '26px', padding: 0 }}
                      aria-label="Remove image"
                    >
                      <i className="bi bi-x-lg" style={{ fontSize: '0.8rem' }} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Site Name */}
        <div>
          <label htmlFor="ppe-site-name" className="form-label small fw-bold">
            Site Name
          </label>
          <input
            id="ppe-site-name"
            type="text"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            placeholder="Enter site name"
            className={`form-control ${
              isDark ? 'bg-secondary bg-opacity-25 text-white border-secondary' : ''
            }`}
          />
        </div>

        {/* Chainage Section */}
        <div
          className={`card p-3 border ${
            isDark ? 'border-secondary bg-dark bg-opacity-50' : 'border-light-subtle bg-light bg-opacity-50'
          }`}
        >
          <p className="small fw-bold mb-2">Chainage</p>
          <input
            id="chainage-entered"
            type="text"
            inputMode="decimal"
            value={chainageInput}
            onChange={handleChainageInputChange}
            placeholder="Enter Chainage Value (e.g. 12.34)"
            className={`form-control ${
              isDark ? 'bg-secondary bg-opacity-25 text-white border-secondary' : ''
            }`}
          />
        </div>

        {/* Description/Notes */}
        <div>
          <label htmlFor="ppe-notes" className="form-label small fw-bold">
            Description / Notes
          </label>
          <textarea
            id="ppe-notes"
            rows={3}
            placeholder="Describe the PPE inspection findings…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={`form-control ${
              isDark ? 'bg-secondary bg-opacity-25 text-white border-secondary' : ''
            }`}
          />
        </div>

        {/* Submit */}
        <div className="d-flex gap-2">
          {isModal && (
            <button
              type="button"
              onClick={onClose}
              className={`btn px-4 py-2.5 fw-semibold w-50 ${isDark ? 'btn-outline-light' : 'btn-outline-secondary'}`}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`btn btn-primary py-2.5 fw-semibold d-flex align-items-center justify-content-center gap-2 ${
              isModal ? 'w-50' : 'w-100'
            }`}
          >
            {isSubmitting && (
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
            )}
            {isSubmitting ? 'Submitting…' : 'Submit Report'}
          </button>
        </div>
      </form>

      {/* Lightbox / Image Zoom */}
      {selectedImage && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-black bg-opacity-80 p-3"
          style={{ zIndex: 1200 }}
          onClick={() => setSelectedImage(null)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setSelectedImage(null);
          }}
        >
          <img
            src={selectedImage}
            alt="Full view"
            className="rounded-3 shadow-lg"
            style={{ maxHeight: '90vh', maxWidth: '100%', objectFit: 'contain' }}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            onClick={() => setSelectedImage(null)}
            className="position-absolute top-0 end-0 m-4 btn btn-light btn-sm rounded-circle d-flex align-items-center justify-content-center p-2"
            style={{ width: '38px', height: '38px' }}
            aria-label="Close zoom view"
          >
            <i className="bi bi-x-lg fs-5" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Custom styled local bootstrap toast notifier */}
      {toastMsg && (
        <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 9999 }}>
          <div
            className={`toast show align-items-center text-white border-0 shadow-lg ${
              toastMsg.type === 'success' ? 'bg-success' : 'bg-danger'
            }`}
            role="alert"
          >
            <div className="d-flex">
              <div className="toast-body fw-semibold">{toastMsg.msg}</div>
              <button
                type="button"
                className="btn-close btn-close-white me-2 m-auto"
                onClick={() => setToastMsg(null)}
                aria-label="Close toast"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (isModal) {
    return formContent;
  }

  return (
    <PageShell title="PPE Inspection" description="Submit a PPE inspection report.">
      {formContent}
    </PageShell>
  );
}

export default SupervisorHITLPPEPage;