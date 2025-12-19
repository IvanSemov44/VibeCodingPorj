/**
 * BaseLayout
 * Main application layout with navigation header
 * Used for authenticated pages and public pages that need the main layout
 */

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useGetUserQuery, useGetCsrfMutation, useLogoutMutation } from '../../store/domains';
import { useTheme } from '../../hooks/useTheme';
import type { User, Role } from '../../lib/types';

export interface BaseLayoutProps {
  children: React.ReactNode;
}

export default function BaseLayout({ children }: BaseLayoutProps): React.ReactElement {
  const [user, setUser] = useState<User | null>(null);
  const { data, refetch } = useGetUserQuery();
  const [csrfTrigger] = useGetCsrfMutation();
  const [logoutTrigger] = useLogoutMutation();
  const [loading, setLoading] = useState<boolean>(true);
  const { theme, toggleTheme } = useTheme();

  // Determine admin/owner role safely — roles may be strings or objects, or missing
  const isAdmin = React.useMemo(() => {
    const roles = user?.roles || null;
    if (!Array.isArray(roles)) return false;
    return roles.some((role: string | Role | undefined) => {
      if (!role) return false;
      if (typeof role === 'string') return role === 'owner' || role === 'admin';
      if (typeof role === 'object' && 'name' in role)
        return role.name === 'owner' || role.name === 'admin';
      return false;
    });
  }, [user]);

  // Keep stable refs to the latest `csrfTrigger` and `data` so the main
  // effect can depend only on `refetch` (prevents unnecessary re-runs).
  type CsrfTrigger = (() => { unwrap: () => Promise<unknown> }) | undefined;
  const csrfTriggerRef = useRef<CsrfTrigger>(csrfTrigger);
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
          await trigger()
            .unwrap()
            .catch(() => {});
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

          <nav className="flex items-center gap-6">
            <Link href="/tools" className="text-secondary-text no-underline hover:text-primary-text transition-colors">
              Tools
            </Link>
            {user ? (
              <>
                {isAdmin && (
                  <Link href="/admin/tools" className="text-secondary-text no-underline hover:text-primary-text transition-colors">
                    Admin
                  </Link>
                )}
                <button
                  onClick={toggleTheme}
                  className="text-secondary-text hover:text-primary-text transition-colors bg-transparent border-none cursor-pointer"
                  title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
                >
                  {theme === 'light' ? '🌙' : '☀️'}
                </button>
                <div className="text-sm">
                  <div className="text-primary-text font-medium">{user.name}</div>
                  <div className="text-secondary-text">{user.email}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded bg-accent text-white hover:bg-accent-hover transition-colors border-none cursor-pointer font-semibold text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={toggleTheme}
                  className="text-secondary-text hover:text-primary-text transition-colors bg-transparent border-none cursor-pointer"
                  title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
                >
                  {theme === 'light' ? '🌙' : '☀️'}
                </button>
                <Link href="/login" className="text-accent no-underline hover:text-accent-hover transition-colors font-medium">
                  Login
                </Link>
                <Link href="/register" className="px-3 py-1.5 rounded bg-accent text-white no-underline hover:bg-accent-hover transition-colors font-semibold text-sm">
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">{children}</main>

      <footer className="bg-[var(--secondary-bg)] border-t border-border text-center py-6 text-secondary-text text-sm mt-16">
        <p>&copy; {new Date().getFullYear()} VibeCoding. All rights reserved.</p>
      </footer>
    </div>
  );
}
