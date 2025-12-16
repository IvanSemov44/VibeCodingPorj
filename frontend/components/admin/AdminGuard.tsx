import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../lib/constants';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth(true);
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const isAdmin = Boolean(user && Array.isArray(user.roles) && user.roles.includes('owner'));
    if (!isAdmin) {
      // redirect non-admins away from admin pages
      router.replace(ROUTES.DASHBOARD);
    }
  }, [user, loading, router]);

  if (loading) return null;
  const isAdmin = Boolean(user && Array.isArray(user.roles) && user.roles.includes('owner'));
  if (!isAdmin) return null;

  return <>{children}</>;
}
