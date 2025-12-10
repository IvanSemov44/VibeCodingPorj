import React from 'react';

export const styles: Record<string, React.CSSProperties> = {
  pageContainer: {
    maxWidth: 480,
    margin: '60px auto',
    padding: '0 20px'
  },
  contentContainer: {
    maxWidth: 1100,
    margin: '0 auto'
  },
  pageTitle: {
    margin: 0,
    marginBottom: 8,
    fontSize: 32,
    fontWeight: 700,
    color: 'var(--text-primary)'
  },
  pageSubtitle: {
    margin: 0,
    color: 'var(--text-secondary)',
    fontSize: 16
  },
  sectionHeader: { textAlign: 'center', marginBottom: 32 },
  form: { display: 'flex', flexDirection: 'column', gap: 20 },
  linkText: { color: 'var(--accent-primary)', fontWeight: 500, textDecoration: 'none' },
  footerText: { textAlign: 'center', marginTop: 24, color: 'var(--text-secondary)', fontSize: 14 },
  flexCenter: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
  flexBetween: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  flexColumn: { display: 'flex', flexDirection: 'column' }
};

export const transition = {
  default: 'all 0.2s ease',
  slow: 'all 0.3s ease'
} as const;
