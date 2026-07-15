import { Component, type ReactNode, type ErrorInfo } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="container-fluid px-3 px-lg-4 py-4">
          <div className="panel blank-panel">
            <div className="blank-state">
              <i className="bi bi-exclamation-triangle fs-1 text-danger mb-3 d-block" />
              <h4 className="fw-bold mb-2">Something went wrong</h4>
              <p className="text-muted mb-3">{this.state.error?.message || 'An unexpected error occurred'}</p>
              <button
                className="btn btn-primary"
                onClick={() => this.setState({ hasError: false, error: null })}
              >
                <i className="bi bi-arrow-clockwise me-1" />Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}