import React, { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Optional custom fallback rendered instead of the default error UI */
  fallback?: ReactNode;
  /** Called whenever an uncaught error is captured */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Maximum number of inline retries before asking the user to reload */
  maxRetries?: number;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

// ─── Root Error Boundary ──────────────────────────────────────────────────────

/**
 * Root-level React error boundary for StarkEd.
 *
 * - Catches any uncaught render/lifecycle error in the tree below it.
 * - Shows a friendly fallback UI with Retry and Go Home actions.
 * - In development the full stack trace is shown; in production a friendly
 *   message is displayed and the error is reported to the console.
 * - Resets automatically when the user navigates to a different route
 *   (achieved by passing key={router.pathname} from _app.tsx).
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  private readonly maxRetries: number;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.maxRetries = props.maxRetries ?? 3;
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });

    // Always log with component stack so DevTools shows it
    console.error('[ErrorBoundary] Uncaught error:', error);
    console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);

    this.props.onError?.(error, errorInfo);
  }

  // ── Actions ────────────────────────────────────────────────────────────────

  private handleRetry = (): void => {
    this.setState((prev) => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prev.retryCount + 1,
    }));
  };

  private handleGoHome = (): void => {
    this.setState(
      { hasError: false, error: null, errorInfo: null, retryCount: 0 },
      () => {
        window.location.href = '/';
      }
    );
  };

  private handleReload = (): void => {
    window.location.reload();
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  render(): ReactNode {
    const { hasError, error, errorInfo, retryCount } = this.state;
    const { children, fallback } = this.props;
    const isDev = process.env.NODE_ENV === 'development';
    const retriesExhausted = retryCount >= this.maxRetries;

    if (!hasError) return children;
    if (fallback) return fallback;

    return (
      <div
        role="alert"
        aria-live="assertive"
        className="min-h-screen flex items-center justify-center bg-gray-50 p-4"
      >
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Icon */}
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle
              className="w-8 h-8 text-red-600"
              aria-hidden="true"
            />
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Something went wrong
          </h1>

          {/* User-facing message */}
          <p className="text-gray-600 mb-2">
            {isDev
              ? (error?.message ?? 'An unexpected error occurred.')
              : 'An unexpected error occurred. Please try one of the options below.'}
          </p>

          {/* Retry counter hint */}
          {!retriesExhausted && (
            <p className="text-sm text-gray-400 mb-6">
              {this.maxRetries - retryCount} retry attempt
              {this.maxRetries - retryCount !== 1 ? 's' : ''} remaining
            </p>
          )}

          {retriesExhausted && (
            <p className="text-sm text-amber-600 mb-6">
              The error persists. Please reload the page or return home.
            </p>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
            {!retriesExhausted && (
              <button
                onClick={this.handleRetry}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <RefreshCw className="w-4 h-4" aria-hidden="true" />
                Try Again
              </button>
            )}

            <button
              onClick={retriesExhausted ? this.handleReload : this.handleGoHome}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            >
              {retriesExhausted ? (
                <>
                  <RefreshCw className="w-4 h-4" aria-hidden="true" />
                  Reload Page
                </>
              ) : (
                <>
                  <Home className="w-4 h-4" aria-hidden="true" />
                  Go Home
                </>
              )}
            </button>
          </div>

          {/* Dev-only: full stack trace */}
          {isDev && error && (
            <details className="text-left mt-2">
              <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600 select-none">
                Stack trace (development only)
              </summary>
              <div className="mt-3 space-y-3">
                <pre className="p-3 bg-red-50 rounded-lg text-xs text-red-700 overflow-x-auto whitespace-pre-wrap break-all">
                  {error.stack}
                </pre>
                {errorInfo?.componentStack && (
                  <pre className="p-3 bg-gray-100 rounded-lg text-xs text-gray-700 overflow-x-auto whitespace-pre-wrap break-all">
                    {errorInfo.componentStack}
                  </pre>
                )}
              </div>
            </details>
          )}
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
