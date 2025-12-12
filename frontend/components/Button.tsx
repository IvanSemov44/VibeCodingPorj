import React from 'react';
import styles from './Button.module.css';
import { cx } from '../lib/classNames';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

type BaseButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'>;

export interface ButtonProps extends BaseButtonProps {
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
}

export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  ...rest
}: ButtonProps): React.ReactElement {
  const className = cx(
    styles.button,
    styles[`button_${variant}`],
    styles[`button_${size}`],
    (disabled || loading) && styles.button_disabled,
    loading && styles.button_loading,
    fullWidth && styles.button_fullWidth
  );

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={className}
      {...rest}
    >
      {loading && <span className={styles.spinner} />}
      <span>{children}</span>
    </button>
  );
}
