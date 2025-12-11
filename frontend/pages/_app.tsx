import React from 'react';
import type { AppProps } from 'next/app';
import Layout from '../components/Layout';
import { ToastProvider } from '../components/Toast';
import { ThemeProvider } from '../context/ThemeContext';
import '../styles/globals.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { store } from '../store';

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps): React.ReactElement {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <ThemeProvider>
          <ToastProvider>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </ToastProvider>
        </ThemeProvider>
      </Provider>
    </QueryClientProvider>
  );
}
