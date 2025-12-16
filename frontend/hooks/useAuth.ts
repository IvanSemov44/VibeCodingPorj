import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useGetUserQuery } from '../store/domains';
import type { User } from '../lib/types';
import { ROUTES } from '../lib/constants';

export function useAuth(requireAuth = true): { user: User | null; loading: boolean } {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const { data, isLoading } = useGetUserQuery();

  useEffect(() => {
    if (isLoading) return;
    if (data) {
      const raw = data as unknown;
      if (raw && typeof raw === 'object') {
        const obj = raw as Record<string, unknown>;
        const maybeRoles = obj.roles;
        let normalizedRoles: string[] | undefined = undefined;
        if (Array.isArray(maybeRoles)) {
          normalizedRoles = maybeRoles
            .map((r) => {
              if (typeof r === 'string') return r;
              if (r && typeof r === 'object') {
                const o = r as Record<string, unknown>;
                if (typeof o.name === 'string') return o.name;
                if (o.id !== undefined) return String(o.id);
              }
              return '';
            })
            .filter(Boolean) as string[];
        }
        const normalizedUser = {
          ...(obj as unknown as User),
          roles: normalizedRoles ?? (obj.roles as unknown as string[] | undefined),
        } as unknown as User;
        setUser(normalizedUser);
        return;
      }
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
