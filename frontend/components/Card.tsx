import React from 'react';

export interface CardProps {
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export default function Card({ title, children, footer, className }: CardProps): React.ReactElement {
  return (
    <div className={`bg-[var(--card-bg)] border border-border rounded-xl shadow-sm ${className || ''}`}>
      {title && (
        <div className="px-5 py-4 border-b border-border font-semibold text-primary-text">
          {title}
        </div>
      )}
      <div className="p-5">{children}</div>
      {footer && (
        <div className="px-5 py-4 border-t border-border text-sm">
          {footer}
        </div>
      )}
    </div>
  );
}
