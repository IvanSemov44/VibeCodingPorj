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
    <div className="max-w-[480px] my-[60px] mx-auto px-5">
      <div className="text-center mb-8">
        <h1 className="m-0 mb-2 text-[32px] font-bold text-primary-text">
          {title}
        </h1>
        <p className="m-0 text-secondary-text text-base">{subtitle}</p>
      </div>

      {children}

      {footerText && (
        <div className="text-center mt-6 text-secondary-text text-sm">
          {footerText}{' '}
          {footerLink && (
            <Link href={footerLink} className="text-accent font-medium no-underline hover:text-accent-hover transition-colors">
              {footerLinkText}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
