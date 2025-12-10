import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getUser } from '../lib/api';
import type { User } from '../lib/types';
import { ROUTES } from '../lib/constants';

export function useAuth(requireAuth = true): { user: User | null; loading: boolean } {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await getUser();
        if (res) {
          setUser(res as User);
        } else if (requireAuth) {
          router.push(ROUTES.LOGIN);
        }
      } catch {
        if (requireAuth) {
          router.push(ROUTES.LOGIN);
        }
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [router, requireAuth]);

  return { user, loading };
}

export function useRedirectIfAuthenticated(redirectTo = ROUTES.DASHBOARD): { checking: boolean } {
  const router = useRouter();
  const [checking, setChecking] = useState<boolean>(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await getUser();
        if (res) {
          router.push(redirectTo);
        }
      } catch {
        // not authenticated; allow access
      } finally {
        setChecking(false);
      }
    }

    checkAuth();
  }, [router, redirectTo]);

  return { checking };
}
