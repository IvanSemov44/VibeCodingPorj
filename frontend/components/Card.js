/**
 * Card container component with optional title and footer
 * @param {Object} props - Component props
 * @param {string} [props.title] - Card title
 * @param {React.ReactNode} props.children - Card content
 * @param {React.ReactNode} [props.footer] - Card footer content
 * @param {string} [props.className=''] - Additional CSS class names
 * @returns {JSX.Element} Card component
 * @example
 * <Card title="User Profile" footer="Last updated: 2 days ago">
 *   <p>Card content goes here</p>
 * </Card>
 */
export default function Card({ title, children, footer, className = '' }) {
  return (
    <div style={{
      background: 'var(--card-bg)',
      borderRadius: 8,
      boxShadow: 'var(--shadow-md)',
      overflow: 'hidden',
      border: '1px solid var(--border-color)',
      transition: 'all 0.3s ease',
      ...parseClassName(className)
    }}>
      {title && (
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-color)',
          fontWeight: 600,
          fontSize: 16,
          color: 'var(--text-primary)'
        }}>
          {title}
        </div>
      )}
      <div style={{ padding: 20 }}>
        {children}
      </div>
      {footer && (
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid var(--border-color)',
          background: 'var(--bg-secondary)',
          fontSize: 14,
          color: 'var(--text-secondary)'
        }}>
          {footer}
        </div>
      )}
    </div>
  );
}

function parseClassName(className) {
  // Simple utility to add extra styles from className prop if needed
  return {};
}
