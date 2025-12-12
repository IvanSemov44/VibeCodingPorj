import React from 'react';
import styles from './Input.module.css';
import { cx } from '../lib/classNames';

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
  const inputClassName = cx(
    styles.input,
    error && styles.input_error
  );

  return (
    <div className={styles.wrapper}>
      {label && (
        <label className={styles.label}>
          {label}
          {required && <span className={styles.requiredIndicator}>*</span>}
        </label>
      )}
      <input
        type={type}
        value={typeof value === 'number' ? String(value) : (value ?? '')}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className={inputClassName}
        {...rest}
      />
      {error && (
        <div className={styles.errorMessage}>{error}</div>
      )}
      {!error && helperText && (
        <div className={styles.helperText}>{helperText}</div>
      )}
    </div>
  );
}
