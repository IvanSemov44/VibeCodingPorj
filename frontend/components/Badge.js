/**
 * Badge component for labels, tags, and status indicators
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Badge content
 * @param {('default'|'primary'|'success'|'warning'|'error'|'purple')} [props.variant='default'] - Badge color variant
 * @param {('sm'|'md'|'lg')} [props.size='md'] - Badge size
 * @returns {JSX.Element} Badge component
 * @example
 * <Badge variant="success" size="sm">Active</Badge>
 */
export default function Badge({ children, variant = 'default', size = 'md' }) {
  const variants = {
    default: { bg: '#e5e7eb', color: '#374151' },
    primary: { bg: '#dbeafe', color: '#1e40af' },
    success: { bg: '#d1fae5', color: '#065f46' },
    warning: { bg: '#fef3c7', color: '#92400e' },
    error: { bg: '#fee2e2', color: '#991b1b' },
    purple: { bg: '#ede9fe', color: '#5b21b6' },
  };

  const sizes = {
    sm: { padding: '2px 8px', fontSize: 11 },
    md: { padding: '4px 10px', fontSize: 12 },
    lg: { padding: '6px 12px', fontSize: 13 },
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
