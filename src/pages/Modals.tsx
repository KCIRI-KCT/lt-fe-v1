import { useState } from 'react';

export const Modals = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="container-fluid px-3 px-lg-4 py-4">
      <div className="page-heading">
        <div className="page-heading-copy">
          <span className="page-icon"><i className="bi bi-window-stack" aria-hidden="true" /></span>
          <div>
            <p className="eyebrow mb-1">Overlays</p>
            <h1 className="h3 mb-1">Modals</h1>
            <p className="text-muted mb-0">Modal dialogs for confirmations, forms, and detailed views.</p>
          </div>
        </div>
      </div>
      <div className="panel mt-1">
        <h2 className="h5 mb-3 section-title"><i className="bi bi-window" aria-hidden="true" /><span>Modal Example</span></h2>
        <p className="text-muted mb-3">Click the button below to open a sample modal dialog.</p>
        <button className="btn btn-primary" type="button" onClick={() => setShowModal(true)}>
          <i className="bi bi-window-stack" aria-hidden="true" /> Open Modal
        </button>
      </div>

      {/* Modal backdrop */}
      {showModal && (
        <div className="modal-backdrop fade show" onClick={() => setShowModal(false)} />
      )}

      {/* Modal */}
      <div className={`modal fade${showModal ? ' show d-block' : ''}`} tabIndex={-1} role="dialog" aria-modal="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title fw-bold">Confirm Action</h5>
              <button type="button" className="btn-close" aria-label="Close" onClick={() => setShowModal(false)} />
            </div>
            <div className="modal-body">
              <p>Are you sure you want to proceed with this action? This action can be undone.</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={() => setShowModal(false)}>Confirm</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};