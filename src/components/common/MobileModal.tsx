import type { ReactNode } from 'react';

interface MobileModalProps {
  children: ReactNode;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

/**
 * MobileModal - Reusable responsive modal that works on all screen sizes
 *
 * Features:
 * - Full width on mobile (xs-sm)
 * - Centered with max-width on tablet (md)
 * - Fixed width on desktop (lg+)
 * - Proper z-index and backdrop
 * - Draggable header support
 *
 * Usage:
 * <MobileModal onClose={handleClose} title="Station Details" icon={<i className="bi bi-pin" />}>
 *   <p>Modal content here</p>
 * </MobileModal>
 */
export const MobileModal = ({
  children,
  onClose,
  title,
  subtitle,
  icon,
  footer,
  className = ''
}: MobileModalProps) => {
  return (
    <>
      {/* Backdrop */}
      <div
        className="modal-backdrop fade show"
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1080,
        }}
      />

      {/* Modal */}
      <div
        className={`modal fade show d-block ${className}`}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        style={{ zIndex: 1090 }}
      >
        <div
          className="modal-dialog modal-dialog-centered modal-dialog-scrollable"
          style={{
            maxWidth: 'calc(100vw - 2rem)',
            width: '100%',
            margin: '1rem',
          }}
        >
          <div
            className="modal-content border-0 shadow-lg"
            style={{
              borderRadius: '16px',
              overflow: 'hidden',
              maxWidth: '720px',
              margin: '0 auto',
            }}
          >
            {/* Header */}
            {(title || icon) && (
              <div
                className="modal-header border-0 p-3 p-md-4"
                style={{
                  background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                  color: '#ffffff',
                }}
              >
                <div className="d-flex align-items-center gap-2 gap-md-3">
                  {icon && (
                    <span
                      className="rounded-3 shadow-sm d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{
                        width: '36px',
                        height: '36px',
                        minWidth: '36px',
                        background: 'rgba(255, 255, 255, 0.15)',
                        fontSize: '18px',
                      }}
                    >
                      {icon}
                    </span>
                  )}
                  <div style={{ minWidth: 0 }}>
                    {title && (
                      <h3
                        className="fw-bold text-white mb-0"
                        style={{
                          fontSize: 'clamp(16px, 4vw, 21px)',
                          lineHeight: 1.2,
                        }}
                      >
                        {title}
                      </h3>
                    )}
                    {subtitle && (
                      <small
                        style={{
                          fontSize: 'clamp(11px, 2.5vw, 13.5px)',
                          color: '#94a3b8',
                          fontWeight: 500,
                        }}
                      >
                        {subtitle}
                      </small>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white shadow-none flex-shrink-0"
                  onClick={onClose}
                  aria-label="Close"
                  style={{ opacity: 0.8 }}
                />
              </div>
            )}

            {/* Body */}
            <div
              className="modal-body p-3 p-md-4"
              style={{
                background: '#ffffff',
                maxHeight: 'calc(100vh - 200px)',
                overflowY: 'auto',
              }}
            >
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div
                className="modal-footer border-top p-3 p-md-4 gap-2"
                style={{ background: '#f8fafc' }}
              >
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileModal;