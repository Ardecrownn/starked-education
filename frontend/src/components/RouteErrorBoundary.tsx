import React, { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw, Home, BookOpen } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface RouteErrorBoundaryProps {
  children: ReactNode;
  /**
   * Human-readable name of the route being wrapped, e.g. "Course Detail".
   * Shown in the error UI and used in console logs.
   */
  routeName: string;
  /** Optional custom fallback node */
  fallback?: ReactNode;
  /** Called when an error is caught */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface RouteErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

// ─── Per-Route Error Boundary ─────────────────────────────────────────────────

/**
 * Per-route error boundary for StarkEd.
 *
 * Wraps a single page/route segment so that a crash in one route does NOT
 * take down the header, navigation, or any other routes that are currently
 * mounted.
 *
 * Usage in pages/_app.tsx:
 *   <RouteErrorBoundary routeName={router.pathname} key={router.pathname}>
 *     <Component {...pageProps} />
 *   </RouteErrorBoundary>
 *
 * The `key={router.pathname}` ensures the boundary is fully unmounted and
 * remounted whenever the user navigates to a different route, automatically
 * clearing any previous error state.
 */
export class RouteErrorBoundary extends Component<
  RouteErrorBoundaryProps,
  RouteErrorBoundaryState
> {
  constructor(props: RouteErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  static getDerivedStateFromError(
    error: Error
  ): Partial<RouteErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });

    // Log with full component stack for easier debugging
    console.error(
      `[RouteErrorBoundary:${this.props.routeName}] Uncaught error:`,
      error
    );
    console.error(
      `[RouteErrorBoundary:${this.props.routeName}] Component stack:`,
      errorInfo.componentStack
    );

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

  // ── Render ─────────────────────────────────────────────────────────────────

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback, routeName } = this.props;
    const isDev = process.env.NODE_ENV === 'development';

    if (!hasError) return children;
    if (fallback) return fallback;

    return (
      <div
        role="alert"
        aria-live="assertive"
        className="min-h-[60vh] flex items-center justify-center bg-gray-50 p-4"
      >
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          {/* Icon */}
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle
              className="w-8 h-8 text-orange-600"
              aria-hidden="true"
            />
          </div>

          {/* Heading */}
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Page Error
          </h2>

          {/* User-facing message */}
          <p className="text-gray-600 mb-4">
            {isDev
              ? (error?.message ?? 'An unexpected error occurred.')
              : `An error occurred on the ${routeName} page. The rest of the app is still working.`}
          </p>

          <p className="text-sm text-gray-400 mb-6">
            Failed in:{' '}
            <span className="font-medium text-gray-600">{routeName}</span>
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
            <button
              onClick={this.handleRetry}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <RefreshCw className="w-4 h-4" aria-hidden="true" />
              Try Again
            </button>

            <button
              onClick={this.handleGoHome}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            >
              <Home className="w-4 h-4" aria-hidden="true" />
              Go Home
            </button>
          </div>

          {/* Browse courses shortcut */}
          <a
            href="/courses"
            className="inline-flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-700 transition-colors"
          >
            <BookOpen className="w-4 h-4" aria-hidden="true" />
            Browse Courses
          </a>

          {/* Dev-only: full stack trace */}
          {isDev && error && (
            <details className="text-left mt-6">
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

export default RouteErrorBoundary;
