import React from 'react';
import Layout from '../components/Layout';
import { ToastProvider } from '../components/Toast';
import { ThemeProvider } from '../context/ThemeContext';
import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ToastProvider>
    </ThemeProvider>
  );
}
