import React from 'react';

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'purple';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]',
  primary: 'bg-accent text-white',
  success: 'bg-[var(--alert-success-bg)] text-[var(--alert-success-text)]',
  warning: 'bg-[var(--alert-warning-bg)] text-[var(--alert-warning-text)]',
  error: 'bg-[var(--alert-error-bg)] text-[var(--alert-error-text)]',
  purple: 'bg-[var(--accent-primary)] text-white',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-[11px]',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-[13px]',
};

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
}: BadgeProps): React.ReactElement {
  return (
    <span
      className={`inline-block rounded-xl font-semibold leading-tight ${variantStyles[variant]} ${sizeStyles[size]}`}
    >
      {children}
    </span>
  );
}
