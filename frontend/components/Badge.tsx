import React from 'react';

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'purple';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
}

export default function Badge({ children, variant = 'default', size = 'md' }: BadgeProps): React.ReactElement {
  const variants: Record<BadgeVariant, { bg: string; color: string }> = {
    default: { bg: '#e5e7eb', color: '#374151' },
    primary: { bg: '#dbeafe', color: '#1e40af' },
    success: { bg: '#d1fae5', color: '#065f46' },
    warning: { bg: '#fef3c7', color: '#92400e' },
    error: { bg: '#fee2e2', color: '#991b1b' },
    purple: { bg: '#ede9fe', color: '#5b21b6' }
  };

  const sizes: Record<BadgeSize, { padding: string; fontSize: number }> = {
    sm: { padding: '2px 8px', fontSize: 11 },
    md: { padding: '4px 10px', fontSize: 12 },
    lg: { padding: '6px 12px', fontSize: 13 }
  };

  const style = variants[variant] || variants.default;
  const sizeStyle = sizes[size] || sizes.md;

  return (
    <span style={{
      display: 'inline-block',
      background: style.bg,
      color: style.color,
      borderRadius: 12,
      fontWeight: 600,
      lineHeight: 1.2,
      ...sizeStyle
    }}>
      {children}
    </span>
  );
}
