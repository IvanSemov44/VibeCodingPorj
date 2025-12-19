/**
 * Next.js App Component
 *
 * Entry point for the application that wraps all pages with providers.
 * Sets up global state management, data fetching, theming, and error handling.
 */

import React from 'react';
import type { AppProps } from 'next/app';
import { QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';

// Global styles
import '../styles/globals.css';

// Components
import Layout from '../components/layouts';
import { ToastContainer } from '../components/Toast';
import ErrorBoundary from '../components/ErrorBoundary';
import { ThemeInitializer } from '../components/ThemeInitializer';

// Configuration
import { queryClient } from '../lib/queryClient';
import { store } from '../store';

export default function App({ Component, pageProps }: AppProps): React.ReactElement {
  return (
    // 1. ErrorBoundary - Catches all React errors (outermost layer)
    <ErrorBoundary>
      {/* 2. React Query - Server state management & caching */}
      <QueryClientProvider client={queryClient}>
        {/* 3. Redux - Client state management (theme, journal, etc.) */}
        <Provider store={store}>
          {/* 4. ThemeInitializer - Load theme from localStorage */}
          <ThemeInitializer>
            {/* 6. Layout - App structure (header, footer, nav) */}
            <Layout>
              {/* 7. Page Component - Your actual page content */}
              <Component {...pageProps} />
            </Layout>
            <ToastContainer />
          </ThemeInitializer>
        </Provider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
