import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getUser, getCsrf, logout } from '../lib/api';
import { useTheme } from '../context/ThemeContext';
import type { User } from '../lib/types';

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
    <div style={{ fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--header-bg)', padding: '12px 20px', transition: 'all 0.3s ease' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              <h1 style={{ margin: 0, fontSize: 20, color: 'var(--text-primary)' }}>VibeCoding</h1>
            </Link>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Full-stack starter kit</div>
          </div>

          <nav style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Link href="/" style={{ color: 'var(--text-primary)', textDecoration: 'none', padding: '8px 12px', fontWeight: 500, transition: 'color 0.2s' }}>Home</Link>
            <Link href="/tools" style={{ color: 'var(--text-primary)', textDecoration: 'none', padding: '8px 12px', fontWeight: 500, transition: 'color 0.2s' }}>Tools</Link>
            {!loading && user && (
              <Link href="/dashboard" style={{ color: 'var(--text-primary)', textDecoration: 'none', padding: '8px 12px', fontWeight: 500, transition: 'color 0.2s' }}>Dashboard</Link>
            )}
            
            <button 
              onClick={toggleTheme}
              style={{ 
                padding: '8px 12px', 
                background: 'var(--bg-tertiary)', 
                color: 'var(--text-primary)', 
                border: '1px solid var(--border-color)', 
                borderRadius: 8, 
                cursor: 'pointer', 
                fontWeight: 500,
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>

            {!loading && !user && (
              <Link href="/login" style={{ padding: '10px 16px', background: 'var(--accent-primary)', color: 'white', borderRadius: 6, textDecoration: 'none', fontWeight: 500, transition: 'background 0.2s' }}>Login</Link>
            )}
            {!loading && user && (
              <button onClick={handleLogout} style={{ padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 500, transition: 'background 0.2s' }}>Logout</button>
            )}
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: '28px auto', padding: '0 20px', flex: 1 }}>{children}</main>

      <footer style={{ borderTop: '1px solid var(--border-color)', marginTop: 40, padding: '16px 20px', color: 'var(--text-secondary)', backgroundColor: 'var(--footer-bg)', transition: 'all 0.3s ease' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>© {new Date().getFullYear()} VibeCoding — starter kit</div>
      </footer>
    </div>
  );
}
