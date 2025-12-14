import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useGetUserQuery, useGetCsrfMutation, useLogoutMutation } from '../store/api2';
import { useAppTheme } from '../hooks/useAppTheme';
import type { User } from '../lib/types';

export default function Layout({ children }: { children: React.ReactNode }): React.ReactElement {
  const [user, setUser] = useState<User | null>(null);
  const { data, refetch } = useGetUserQuery();
  const [csrfTrigger] = useGetCsrfMutation();
  const [logoutTrigger] = useLogoutMutation();
  const [loading, setLoading] = useState<boolean>(true);
  const { theme, toggleTheme } = useAppTheme();

  // Keep stable refs to the latest `csrfTrigger` and `data` so the main
  // effect can depend only on `refetch` (prevents unnecessary re-runs).
  type CsrfTrigger = (() => { unwrap: () => Promise<unknown> }) | undefined;
  const csrfTriggerRef = useRef<CsrfTrigger>(csrfTrigger as CsrfTrigger);
  const dataRef = useRef(data);

  useEffect(() => {
    csrfTriggerRef.current = csrfTrigger;
  }, [csrfTrigger]);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    let mounted = true;

    async function fetchUser() {
      try {
        const trigger = csrfTriggerRef.current;
        if (trigger) {
          await trigger().unwrap().catch(() => {});
        }
        const res = await refetch();
        const u = res?.data ?? dataRef.current;
        if (!mounted) return;
        setUser((u as User) || null);
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
  }, [refetch]);

  async function handleLogout() {
    try {
      await logoutTrigger().unwrap();
      setUser(null);
      window.location.href = '/login';
    } catch (e) {
      console.error('Logout failed', e);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-[var(--header-bg)] border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <Link href="/" className="no-underline text-inherit">
              <h1 className="m-0 text-2xl font-bold text-primary-text">VibeCoding</h1>
            </Link>
            <div className="text-xs text-secondary-text mt-0.5">Full-stack starter kit</div>
          </div>

          <nav className="flex items-center gap-4">
            <Link
              href="/"
              className="px-3 py-2 text-sm font-medium text-primary-text no-underline rounded-md transition-colors hover:bg-secondary-bg"
            >
              Home
            </Link>
            <Link
              href="/tools"
              className="px-3 py-2 text-sm font-medium text-primary-text no-underline rounded-md transition-colors hover:bg-secondary-bg"
            >
              Tools
            </Link>
            {!loading && user && (
              <Link
                href="/dashboard"
                className="px-3 py-2 text-sm font-medium text-primary-text no-underline rounded-md transition-colors hover:bg-secondary-bg"
              >
                Dashboard
              </Link>
            )}

            <button
              onClick={toggleTheme}
              className="w-9 h-9 flex items-center justify-center bg-secondary-bg border-none rounded-full cursor-pointer text-lg transition-all hover:bg-tertiary-bg"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>

            {!loading && !user && (
              <Link
                href="/login"
                className="px-4 py-2 bg-accent text-white text-sm font-semibold rounded-lg no-underline transition-all hover:bg-accent-hover"
              >
                Login
              </Link>
            )}
            {!loading && user && (
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white text-sm font-semibold border-none rounded-lg cursor-pointer transition-all hover:bg-red-600"
              >
                Logout
              </button>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">{children}</main>

      <footer className="bg-[var(--footer-bg)] border-t border-border mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center text-sm text-secondary-text">
          © {new Date().getFullYear()} VibeCoding — starter kit
        </div>
      </footer>
    </div>
  );
}
