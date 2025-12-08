/**
 * Loading spinner component
 * @param {Object} props - Component props
 * @param {('sm'|'md'|'lg'|'xl')} [props.size='md'] - Spinner size
 * @param {string} [props.color='var(--accent-primary)'] - Spinner color (CSS color value)
 * @returns {JSX.Element} LoadingSpinner component
 * @example
 * <LoadingSpinner size="lg" color="#3b82f6" />
 */
export default function LoadingSpinner({ size = 'md', color = 'var(--accent-primary)' }) {
  const sizes = {
    sm: 16,
    md: 24,
    lg: 32,
    xl: 48
  };

  const spinnerSize = sizes[size] || sizes.md;

  return (
    <div style={{
      width: spinnerSize,
      height: spinnerSize,
      border: `3px solid ${color}20`,
      borderTopColor: color,
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite'
    }}>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

/**
 * Full-page loading component with spinner and message
 * @param {Object} props - Component props
 * @param {string} [props.message='Loading...'] - Loading message to display
 * @returns {JSX.Element} LoadingPage component
 * @example
 * if (loading) return <LoadingPage message="Fetching data..." />;
 */
export function LoadingPage({ message = 'Loading...' }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      gap: 16
    }}>
      <LoadingSpinner size="lg" />
      <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
        {message}
      </p>
    </div>
  );
}
