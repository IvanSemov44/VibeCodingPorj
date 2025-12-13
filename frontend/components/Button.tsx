import React from 'react';

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

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-white hover:bg-accent-hover',
  secondary: 'bg-secondary-bg text-primary-text hover:bg-tertiary-bg',
  danger: 'bg-red-500 text-white hover:bg-red-600',
  ghost: 'bg-transparent text-primary-text border border-border hover:bg-secondary-bg',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3 text-base',
};

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
  const baseClasses =
    'border-none rounded-lg cursor-pointer font-semibold flex items-center justify-center gap-2 font-[inherit] transition-all duration-200';
  const disabledClasses = disabled || loading ? 'bg-tertiary-bg cursor-not-allowed opacity-60' : '';
  const loadingClasses = loading ? 'cursor-wait' : '';
  const widthClasses = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantStyles[variant]} ${sizeStyles[size]} ${disabledClasses} ${loadingClasses} ${widthClasses}`}
      {...rest}
    >
      {loading && (
        <span className="w-3.5 h-3.5 border-2 border-white/60 border-t-white rounded-full inline-block animate-spin" />
      )}
      <span>{children}</span>
    </button>
  );
}
