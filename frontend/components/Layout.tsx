import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getUser, getCsrf, logout } from '../lib/api';
import { useTheme } from '../context/ThemeContext';
import type { User } from '../lib/types';
import styles from './Layout.module.css';

export default function Layout({ children }: { children: React.ReactNode }): React.ReactElement {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    let mounted = true;

    async function fetchUser() {
      try {
        await getCsrf();
        const u = await getUser();
        if (!mounted) return;
        setUser(u || null);
      } catch (err) {
        console.error('Error fetching user:', err);
        setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchUser();

    function onLoginEvent() {
      if (!mounted) return;
      setLoading(true);
      fetchUser();
    }

    window.addEventListener('user:login', onLoginEvent);

    return () => {
      mounted = false;
      window.removeEventListener('user:login', onLoginEvent);
    };
  }, []);

  async function handleLogout() {
    try {
      await logout();
      setUser(null);
      window.location.href = '/login';
    } catch (e) {
      console.error('Logout failed', e);
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div>
            <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              <h1 className={styles.brandTitle}>VibeCoding</h1>
            </Link>
            <div className={styles.brandSubtitle}>Full-stack starter kit</div>
          </div>

          <nav className={styles.nav}>
            <Link href="/" className={styles.navLink}>Home</Link>
            <Link href="/tools" className={styles.navLink}>Tools</Link>
            {!loading && user && (
              <Link href="/dashboard" className={styles.navLink}>Dashboard</Link>
            )}

            <button
              onClick={toggleTheme}
              className={styles.themeButton}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>

            {!loading && !user && (
              <Link href="/login" className={styles.loginLink}>Login</Link>
            )}
            {!loading && user && (
              <button onClick={handleLogout} className={styles.logoutButton}>Logout</button>
            )}
          </nav>
        </div>
      </header>

      <main className={styles.main}>{children}</main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>© {new Date().getFullYear()} VibeCoding — starter kit</div>
      </footer>
    </div>
  );
}
