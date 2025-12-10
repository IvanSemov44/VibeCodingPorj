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
  const variants: Record<ButtonVariant, { bg: string; bgHover: string; color: string }> = {
    primary: { bg: 'var(--accent-primary)', bgHover: 'var(--accent-hover)', color: 'white' },
    secondary: { bg: 'var(--bg-secondary)', bgHover: 'var(--bg-tertiary)', color: 'var(--text-primary)' },
    danger: { bg: '#ef4444', bgHover: '#dc2626', color: 'white' },
    ghost: { bg: 'transparent', bgHover: 'var(--bg-secondary)', color: 'var(--text-primary)' }
  };

  const sizes: Record<ButtonSize, { padding: string; fontSize: number }> = {
    sm: { padding: '8px 12px', fontSize: 14 },
    md: { padding: '10px 16px', fontSize: 14 },
    lg: { padding: '12px 20px', fontSize: 16 }
  };

  const variantStyle = variants[variant] || variants.primary;
  const sizeStyle = sizes[size] || sizes.md;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        width: fullWidth ? '100%' : 'auto',
        backgroundColor: disabled || loading ? 'var(--bg-tertiary)' : variantStyle.bg,
        color: variantStyle.color,
        border: variant === 'ghost' ? '1px solid var(--border-color)' : 'none',
        borderRadius: 8,
        fontWeight: 600,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        transition: 'all 0.2s',
        ...sizeStyle
      }}
      onMouseEnter={(e) => {
        if (!disabled && !loading) (e.currentTarget as HTMLButtonElement).style.backgroundColor = variantStyle.bgHover;
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading) (e.currentTarget as HTMLButtonElement).style.backgroundColor = variantStyle.bg;
      }}
      {...rest}
    >
      {loading && <Spinner />}
      <span>{children}</span>
    </button>
  );
}

function Spinner(): React.ReactElement {
  return (
    <>
      <span
        style={{
          width: 14,
          height: 14,
          border: '2px solid rgba(255,255,255,0.6)',
          borderTopColor: 'white',
          borderRadius: '50%',
          display: 'inline-block',
          animation: 'spin 0.8s linear infinite'
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
