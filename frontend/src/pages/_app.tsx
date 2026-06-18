import React from 'react';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { RouteErrorBoundary } from '../components/RouteErrorBoundary';
import '../styles/globals.css';

/**
 * Custom App entry point for StarkEd.
 *
 * Error boundary strategy:
 *
 * 1. <ErrorBoundary> — outermost, root-level boundary.
 *    Catches any error that escapes all inner boundaries (providers, layout
 *    components, etc.) and shows a full-page recovery UI.
 *    NOT keyed on route so it only activates as a last resort.
 *
 * 2. <RouteErrorBoundary key={pathname}> — per-route boundary wrapping only
 *    the active page component.
 *    - key={pathname} ensures the boundary fully resets on every navigation,
 *      so navigating away from an errored page always gives a clean slate.
 *    - Errors here only affect the page area; header, nav, and other layout
 *      elements remain functional.
 *
 * Both boundaries:
 *    - Show a retry button that re-renders the failed subtree.
 *    - Show a "Go Home" button to navigate out of the broken route.
 *    - Display full stack traces in development; user-friendly messages only
 *      in production.
 *    - Log the full error + component stack to the console for debugging.
 */
export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Root-level error reporting — extend to send to a monitoring service
        console.error('[App:RootBoundary] Caught error:', error.message);
        console.error(
          '[App:RootBoundary] Component stack:',
          errorInfo.componentStack
        );
      }}
    >
      {/*
       * key={router.pathname} resets RouteErrorBoundary on every navigation.
       * This satisfies the acceptance criterion:
       * "Navigate away from errored page → error boundary resets"
       */}
      <RouteErrorBoundary
        key={router.pathname}
        routeName={router.pathname}
        onError={(error, errorInfo) => {
          console.error(
            `[App:RouteBoundary:${router.pathname}] Caught error:`,
            error.message
          );
          console.error(
            `[App:RouteBoundary:${router.pathname}] Component stack:`,
            errorInfo.componentStack
          );
        }}
      >
        <Component {...pageProps} />
      </RouteErrorBoundary>
    </ErrorBoundary>
  );
}
