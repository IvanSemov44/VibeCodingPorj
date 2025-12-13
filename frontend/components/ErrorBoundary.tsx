/**
 * ErrorBoundary Component
 * Catches JavaScript errors anywhere in the child component tree and displays a fallback UI
 */

import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    console.error('Error caught by ErrorBoundary:', error, errorInfo);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
    // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
          <div className="text-[64px] mb-4">
            ⚠️
          </div>
          <h2 className="m-0 mb-2 text-2xl font-bold text-primary-text">
            Something went wrong
          </h2>
          <p className="m-0 mb-6 text-sm text-secondary-text max-w-[500px]">
            We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
          </p>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mb-6 p-4 bg-secondary-bg border border-border rounded-lg text-left max-w-[600px] w-full">
              <summary className="cursor-pointer font-semibold mb-2">
                Error Details (Development Only)
              </summary>
              <pre className="text-xs overflow-auto text-red-500">
                {this.state.error.toString()}
                {'\n\n'}
                {this.state.error.stack}
              </pre>
            </details>
          )}

          <div className="flex gap-3">
            <button
              onClick={this.handleReset}
              className="py-3 px-6 bg-secondary-bg text-primary-text border border-border rounded-lg text-sm font-semibold cursor-pointer transition-all hover:bg-tertiary-bg"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="py-3 px-6 bg-accent text-white border-none rounded-lg text-sm font-semibold cursor-pointer transition-opacity hover:opacity-90"
            >
              Go to Homepage
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
