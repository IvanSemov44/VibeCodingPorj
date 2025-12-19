/**
 * AdminLayout
 * Admin panel layout with navigation and access control
 * Only accessible to admin and owner roles
 */

import { ReactNode, useEffect, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/router';
import AdminNav from '../admin/AdminNav';

export interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

export default function AdminLayout({ children, title, description }: AdminLayoutProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Check if user is admin - memoize to prevent recalculation
  const isAdmin = useMemo(
    () =>
      user?.roles?.some((role) =>
        typeof role === 'string'
          ? role === 'admin' || role === 'owner'
          : role?.name === 'admin' || role?.name === 'owner',
      ),
    [user?.roles],
  );

  useEffect(() => {
    if (!loading && user && !isAdmin) {
      router.push('/');
    }
  }, [user, isAdmin, loading, router]);

  if (loading || !user || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--primary-bg)]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[var(--border-color)] border-t-[var(--accent)]"></div>
          <p className="text-[var(--text-secondary)] mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--primary-bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AdminNav />

        {(title || description) && (
          <div className="mb-6">
            {title && <h1 className="text-2xl font-bold text-[var(--text-primary)]">{title}</h1>}
            {description && (
              <p className="mt-1 text-sm text-[var(--text-secondary)]">{description}</p>
            )}
          </div>
        )}

        <div>{children}</div>
      </div>
    </div>
  );
}
