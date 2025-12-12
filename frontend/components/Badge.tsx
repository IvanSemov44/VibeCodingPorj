import React from 'react';
import styles from './Badge.module.css';
import { cx } from '../lib/classNames';

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'purple';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
}

export default function Badge({ children, variant = 'default', size = 'md' }: BadgeProps): React.ReactElement {
  const className = cx(
    styles.badge,
    styles[`badge_${variant}`],
    styles[`badge_${size}`]
  );

  return <span className={className}>{children}</span>;
}
