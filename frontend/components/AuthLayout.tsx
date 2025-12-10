import React from 'react';
import Link from 'next/link';

export interface AuthLayoutProps {
  children: React.ReactNode;
  title: React.ReactNode;
  subtitle: React.ReactNode;
  footerText?: React.ReactNode;
  footerLink?: string;
  footerLinkText?: React.ReactNode;
}

export default function AuthLayout({ children, title, subtitle, footerText, footerLink, footerLinkText }: AuthLayoutProps): React.ReactElement {
  return (
    <div style={{ maxWidth: 480, margin: '60px auto', padding: '0 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1 style={{ margin: 0, marginBottom: 8, fontSize: 32, fontWeight: 700, color: 'var(--text-primary)' }}>
          {title}
        </h1>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 16 }}>{subtitle}</p>
      </div>

      {children}

      {footerText && (
        <div style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-secondary)', fontSize: 14 }}>
          {footerText}{' '}
          {footerLink && (
            <Link href={footerLink} style={{ color: 'var(--accent-primary)', fontWeight: 500, textDecoration: 'none' }}>
              {footerLinkText}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
