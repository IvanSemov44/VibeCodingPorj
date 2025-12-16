import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../lib/constants';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth(true);
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    let roleNames: string[] = [];
    if (Array.isArray(user?.roles)) {
      roleNames = user.roles
        .map((r: any) => (typeof r === 'string' ? r : r?.name))
        .filter(Boolean) as string[];
    } else if ((user as any)?.role) {
      roleNames = [(user as any).role];
    }
    const isAdmin = roleNames.includes('admin') || roleNames.includes('owner');
    // Debug: log resolved user/roles so we can see why redirects happen
    // eslint-disable-next-line no-console
    console.debug('[AdminGuard] resolved user:', user, 'roles:', roleNames, 'isAdmin:', isAdmin);
    if (!isAdmin) {
      // redirect non-admins away from admin pages
      router.replace(ROUTES.DASHBOARD);
    }
  }, [user, loading, router]);
  if (loading) return null;

  let roleNamesRender: string[] = [];
  if (Array.isArray(user?.roles)) {
    roleNamesRender = user.roles.map((r: any) => (typeof r === 'string' ? r : r?.name)).filter(Boolean) as string[];
  } else if ((user as any)?.role) {
    roleNamesRender = [(user as any).role];
  }
  const isAdminRender = roleNamesRender.includes('admin') || roleNamesRender.includes('owner');
  // Debug log for render path
  // eslint-disable-next-line no-console
  console.debug('[AdminGuard] render user:', user, 'roles:', roleNamesRender, 'isAdmin:', isAdminRender);
  if (!isAdminRender) return null;

  // In development, render a small debug banner with detected roles before showing children
  if (process.env.NODE_ENV !== 'production') {
    return (
      <>
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 py-2 text-sm mb-4">
          AdminGuard debug: roles={JSON.stringify(roleNamesRender)} user={user?.email}
        </div>
        <>{children}</>
      </>
    );
  }

  return <>{children}</>;
}
