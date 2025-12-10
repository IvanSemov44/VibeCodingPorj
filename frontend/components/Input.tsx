import React from 'react';

type BaseInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>;

export interface InputProps extends BaseInputProps {
  label?: string;
  value?: string | number;
  onChange: (value: string) => void;
  error?: string | null;
  helperText?: string | null;
  required?: boolean;
}

export default function Input({
  label,
  type = 'text',
  value,
  onChange,
  error,
  disabled = false,
  placeholder,
  required = false,
  helperText,
  ...rest
}: InputProps): React.ReactElement {
  return (
    <div>
      {label && (
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, fontSize: 14, color: 'var(--text-primary)' }}>
          {label}
          {required && <span style={{ color: '#ef4444', marginLeft: 4 }}>*</span>}
        </label>
      )}
      <input
        type={type}
        value={typeof value === 'number' ? String(value) : (value ?? '')}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '10px 14px',
          borderRadius: 8,
          border: `1px solid ${error ? '#ef4444' : 'var(--border-color)'}`,
          fontSize: 14,
          boxSizing: 'border-box',
          background: disabled ? 'var(--bg-tertiary)' : 'var(--card-bg)',
          color: 'var(--text-primary)',
          transition: 'all 0.2s',
          outline: 'none'
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = error ? '#ef4444' : 'var(--accent-primary)')}
        onBlur={(e) => (e.currentTarget.style.borderColor = error ? '#ef4444' : 'var(--border-color)')}
        {...rest}
      />
      {error && (
        <div style={{ color: '#ef4444', fontSize: 13, marginTop: 4 }}>{error}</div>
      )}
      {!error && helperText && (
        <div style={{ color: 'var(--text-tertiary)', fontSize: 12, marginTop: 4 }}>{helperText}</div>
      )}
    </div>
  );
}
