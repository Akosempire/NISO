import { Component, ErrorInfo, ReactNode } from 'react';
import './ErrorBoundary.css';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Surface unexpected errors during development. Production should pipe
    // these into Sentry or similar (DEPLOYMENT_OPERATIONS.md).
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    if (this.props.fallback) {
      return this.props.fallback(error, this.reset);
    }

    return (
      <div className="error-boundary">
        <div className="error-boundary-card">
          <div className="error-boundary-icon" aria-hidden>⚠</div>
          <h2>Something went wrong</h2>
          <p>{error.message || 'An unexpected error occurred.'}</p>
          <button type="button" onClick={this.reset} className="btn-primary">
            Try again
          </button>
        </div>
      </div>
    );
  }
}
