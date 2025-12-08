/**
 * Form input component with validation and error display
 * @param {Object} props - Component props
 * @param {string} [props.label] - Input label
 * @param {string} [props.type='text'] - Input type (text, email, password, etc.)
 * @param {string} props.value - Input value
 * @param {Function} props.onChange - Change handler that receives the new value
 * @param {string} [props.error] - Error message to display
 * @param {boolean} [props.disabled=false] - Disabled state
 * @param {string} [props.placeholder] - Placeholder text
 * @param {boolean} [props.required=false] - Required field indicator
 * @param {string} [props.helperText] - Helper text below input
 * @returns {JSX.Element} Input component
 * @example
 * <Input
 *   label="Email"
 *   type="email"
 *   value={email}
 *   onChange={setEmail}
 *   error={errors.email}
 *   required
 * />
 */
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
  ...props
}) {
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
        value={value}
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
        onFocus={(e) => e.target.style.borderColor = error ? '#ef4444' : 'var(--accent-primary)'}
        onBlur={(e) => e.target.style.borderColor = error ? '#ef4444' : 'var(--border-color)'}
        {...props}
      />
      {error && (
        <div style={{ color: '#ef4444', fontSize: 13, marginTop: 4 }}>
          {error}
        </div>
      )}
      {!error && helperText && (
        <div style={{ color: 'var(--text-tertiary)', fontSize: 12, marginTop: 4 }}>
          {helperText}
        </div>
      )}
    </div>
  );
}
