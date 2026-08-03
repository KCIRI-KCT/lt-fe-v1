interface LoadingStateProps {
  message?: string;
  spinnerSize?: 'sm' | 'md' | 'lg';
}

export const LoadingState = ({ message = 'Loading...', spinnerSize = 'md' }: LoadingStateProps) => {
  const sizeClass = spinnerSize === 'sm' ? 'fs-5' : spinnerSize === 'lg' ? 'fs-1' : 'fs-3';
  return (
    <div className="panel blank-panel">
      <div className="text-center">
        <div className={`spinner-border text-primary ${sizeClass} mb-3`} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted mb-0">{message}</p>
      </div>
    </div>
  );
};

export const SkeletonLoader = ({ rows = 5 }: { rows?: number }) => (
  <div className="panel">
    <div className="d-grid gap-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="d-flex align-items-center gap-3">
          <div className="placeholder placeholder-lg rounded" style={{ width: '48px', height: '48px' }} />
          <div className="flex-grow-1">
            <div className="placeholder placeholder-sm w-75 rounded mb-2" />
            <div className="placeholder placeholder-xs w-50 rounded" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const EmptyState = ({
  icon = 'bi bi-inbox',
  title = 'No data available',
  description,
  action,
}: {
  icon?: string;
  title?: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}) => (
  <div className="panel blank-panel">
    <div className="blank-state">
      <i className={`${icon} fs-1 text-muted mb-3 d-block`} />
      <h5 className="fw-bold mb-2">{title}</h5>
      {description && <p className="text-muted small mb-3">{description}</p>}
      {action && (
        <button className="btn btn-primary btn-sm" onClick={action.onClick}>
          <i className="bi bi-plus-lg me-1" />{action.label}
        </button>
      )}
    </div>
  </div>
);