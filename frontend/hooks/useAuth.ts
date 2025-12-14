import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useGetUserQuery } from '../store/api';
import type { User } from '../lib/types';
import { ROUTES } from '../lib/constants';

export function useAuth(requireAuth = true): { user: User | null; loading: boolean } {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const { data, isLoading } = useGetUserQuery();

  useEffect(() => {
    if (isLoading) return;
    if (data) {
      const res = data as any;
      const maybeRoles = res.roles;
      let normalizedRoles: string[] | undefined = undefined;
      if (Array.isArray(maybeRoles)) {
        normalizedRoles = maybeRoles.map((r) => (typeof r === 'string' ? r : r && (r.name || String(r.id)))) as string[];
      }
      const normalizedUser = { ...(res as any), roles: normalizedRoles ?? res.roles } as User;
      setUser(normalizedUser);
      return;
    }
    if (!data && !isLoading && requireAuth) {
      router.push(ROUTES.LOGIN);
    }
  }, [data, isLoading, requireAuth, router]);

  return { user, loading: isLoading };
}

export function useRedirectIfAuthenticated(redirectTo = ROUTES.DASHBOARD): { checking: boolean } {
  const router = useRouter();
  const [checking, setChecking] = useState<boolean>(true);
  const { data, isLoading } = useGetUserQuery();

  useEffect(() => {
    if (isLoading) return;
    try {
      if (data) router.push(redirectTo);
    } finally {
      setChecking(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, isLoading]);

  return { checking };
}
