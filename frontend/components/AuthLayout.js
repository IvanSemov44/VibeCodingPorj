import Link from 'next/link';

/**
 * Layout wrapper for authentication pages (login, register, etc.)
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Page content (typically form in Card)
 * @param {string} props.title - Page title
 * @param {string} props.subtitle - Page subtitle/description
 * @param {string} [props.footerText] - Footer text (e.g., "Don't have an account?")
 * @param {string} [props.footerLink] - Footer link URL
 * @param {string} [props.footerLinkText] - Footer link text (e.g., "Sign up")
 * @returns {JSX.Element} AuthLayout component
 * @example
 * <AuthLayout
 *   title="Welcome Back"
 *   subtitle="Sign in to your account"
 *   footerText="Don't have an account?"
 *   footerLink="/register"
 *   footerLinkText="Sign up"
 * >
 *   <Card>...form content...</Card>
 * </AuthLayout>
 */
export default function AuthLayout({ children, title, subtitle, footerText, footerLink, footerLinkText }) {
  return (
    <div style={{ maxWidth: 480, margin: '60px auto', padding: '0 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1 style={{ margin: 0, marginBottom: 8, fontSize: 32, fontWeight: 700, color: 'var(--text-primary)' }}>
          {title}
        </h1>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 16 }}>
          {subtitle}
        </p>
      </div>

      {children}

      {footerText && (
        <div style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-secondary)', fontSize: 14 }}>
          {footerText}{' '}
          {footerLink && (
            <Link href={footerLink} style={{ color: 'var(--accent-primary)', fontWeight: 500, textDecoration: 'none' }}>
              {footerLinkText}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
