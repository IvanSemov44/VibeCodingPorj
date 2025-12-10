import React from 'react';

export interface CardProps {
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export default function Card({ title, children, footer, className = '' }: CardProps): React.ReactElement {
  return (
    <div style={{
      background: 'var(--card-bg)',
      borderRadius: 8,
      boxShadow: 'var(--shadow-md)',
      overflow: 'hidden',
      border: '1px solid var(--border-color)',
      transition: 'all 0.3s ease',
      ...parseClassName(className)
    }}>
      {title && (
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-color)',
          fontWeight: 600,
          fontSize: 16,
          color: 'var(--text-primary)'
        }}>
          {title}
        </div>
      )}
      <div style={{ padding: 20 }}>{children}</div>
      {footer && (
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid var(--border-color)',
          background: 'var(--bg-secondary)',
          fontSize: 14,
          color: 'var(--text-secondary)'
        }}>
          {footer}
        </div>
      )}
    </div>
  );
}

function parseClassName(className: string): React.CSSProperties {
  // Keep for future extension; currently we don't translate class names
  if (className && typeof className === 'string') return {};
  return {};
}
