import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getUser } from '../lib/api';
import { ROUTES } from '../lib/constants';

/**
 * Hook for authentication state and automatic redirect
 * @param {boolean} [requireAuth=true] - If true, redirects to login when unauthenticated
 * @returns {Object} Authentication state
 * @returns {Object|null} return.user - Authenticated user object or null
 * @returns {boolean} return.loading - Loading state
 * @example
 * const { user, loading } = useAuth();
 * if (loading) return <LoadingPage />;
 * if (!user) return null; // Will redirect to login
 */
export function useAuth(requireAuth = true) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await getUser();
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        } else if (requireAuth) {
          router.push(ROUTES.LOGIN);
        }
      } catch (err) {
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

/**
 * Hook that redirects authenticated users away from auth pages
 * Useful for login/register pages that should redirect if already logged in
 * @param {string} [redirectTo=ROUTES.DASHBOARD] - Route to redirect to if authenticated
 * @returns {Object} Checking state
 * @returns {boolean} return.checking - True while checking authentication
 * @example
 * // In login page
 * const { checking } = useRedirectIfAuthenticated();
 * if (checking) return <LoadingPage />;
 */
export function useRedirectIfAuthenticated(redirectTo = ROUTES.DASHBOARD) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await getUser();
        if (res.ok) {
          router.push(redirectTo);
        }
      } catch (err) {
        // User not authenticated, allow access
      } finally {
        setChecking(false);
      }
    }

    checkAuth();
  }, [router, redirectTo]);

  return { checking };
}
