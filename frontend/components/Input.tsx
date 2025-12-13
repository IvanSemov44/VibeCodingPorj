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
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-semibold text-primary-text mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        value={typeof value === 'number' ? String(value) : (value ?? '')}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full px-3 py-2 bg-primary-bg border rounded-lg text-sm text-primary-text outline-none transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
          error ? 'border-red-500 focus:border-red-600' : 'border-border focus:border-accent'
        }`}
        {...rest}
      />
      {error && (
        <div className="mt-1 text-xs text-red-600">{error}</div>
      )}
      {!error && helperText && (
        <div className="mt-1 text-xs text-secondary-text">{helperText}</div>
      )}
    </div>
  );
}
