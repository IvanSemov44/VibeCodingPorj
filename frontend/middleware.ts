import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: ['/admin', '/admin/:path*', '/api/admin/:path*'],
};

interface FetchResult {
  ok: boolean;
  status: number;
  url: string;
  body: string;
  json?: Record<string, unknown> | null;
}

interface UserResponse {
  id?: number;
  name?: string;
  email?: string;
  roles?: Array<{ name: string } | string>;
}

function extractRoleNames(user: unknown): string[] {
  if (!user || typeof user !== 'object') return [];
  const userData = user as Record<string, unknown>;

  if (Array.isArray(userData.roles)) {
    return userData.roles
      .map((r) => {
        if (typeof r === 'string') return r;
        if (typeof r === 'object' && r !== null && 'name' in r) {
          return (r as Record<string, unknown>).name as string;
        }
        return null;
      })
      .filter((r): r is string => r !== null);
  }

  if (typeof userData.role === 'string') return [userData.role];
  return [];
}

    async function getUserFromApi(req: NextRequest, apiBase: string): Promise<FetchResult> {
      const headers: HeadersInit = {};
      const cookie = req.headers.get('cookie');
      if (!cookie) return { ok: false, status: 0, url: apiBase, body: 'no-cookie' };
      headers['cookie'] = cookie;

      const buildPath = (base: string) => (base.endsWith('/api') ? `${base}/user` : `${base}/api/user`);

      const candidates = [
        apiBase,
        'http://backend/api',
        'http://host.docker.internal:8201/api',
        'http://127.0.0.1:8201/api',
      ];

      let lastErr: FetchResult | null = null;
      for (const base of candidates) {
        const userPath = buildPath(base);
        try {
          const res = await fetch(userPath, { headers, cache: 'no-store' });
          const text = await res.text();
          let json: Record<string, unknown> | null = null;
          try { json = text ? JSON.parse(text) : null; } catch { json = null; }
          if (res.ok) return { ok: true, status: res.status, url: userPath, body: text, json };
          // record non-ok response but continue trying
          lastErr = { ok: false, status: res.status, url: userPath, body: text, json };
        } catch (error) {
          lastErr = { ok: false, status: 0, url: userPath, body: String(error) };
        }
      }
      return lastErr ?? { ok: false, status: 0, url: apiBase, body: 'unreachable' };
    }

export default async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Protect admin UI pages: call backend to validate session + roles.
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? new URL(req.url).origin;
    let result = await getUserFromApi(req, apiBase);
    // Fallback: try localhost backend in case container hostname cannot be reached
    if (!result.ok) {
      const fallback = await getUserFromApi(req, 'http://localhost:8201/api');
      // If fallback returns something, prefer it but include both statuses
      result = result.ok ? result : fallback;
    }
    const user = result?.json?.user ?? result?.json?.data ?? result?.json ?? null;

    if (!user) {
      // No valid session — redirect to login and set debug header
      const loginUrl = new URL('/login', req.url);
      const res = NextResponse.redirect(loginUrl);
      res.headers.set('x-mw-debug', 'no-user-found');
      res.headers.set('x-mw-backend-status', String(result.status || 0));
      const snippet = typeof result.body === 'string' ? result.body.slice(0, 200) : JSON.stringify(result.body || '');
      try { res.headers.set('x-mw-backend-body', encodeURIComponent(snippet)); } catch (e) {}
      return res;
    }

    // Normalize roles and enforce admin/owner for page access
    const roleNames = extractRoleNames(user);

    const allowed = roleNames.includes('admin') || roleNames.includes('owner');
    if (!allowed) {
      // Authenticated but not allowed — send to dashboard with debug header
      const home = new URL('/', req.url);
      const res = NextResponse.redirect(home);
      res.headers.set('x-mw-debug', 'user-not-authorized');
      res.headers.set('x-mw-backend-status', String(result.status || 0));
      return res;
    }

    return NextResponse.next();
  }

  // For API admin endpoints perform an authoritative role check via backend.
  if (pathname.startsWith('/api/admin')) {
    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? new URL(req.url).origin;
    const userJson = await getUserFromApi(req, apiBase as string);
    const userData = (userJson.json as unknown as Record<string, unknown>)?.user ?? (userJson.json as unknown as Record<string, unknown>)?.data ?? userJson.json ?? null;

    if (!userData) {
      return new NextResponse(JSON.stringify({ message: 'Unauthenticated.' }), {
        status: 401,
        headers: { 'content-type': 'application/json' },
      });
    }

    // Normalize roles (support array of role objects or single role string)
    const roleNames = extractRoleNames(userData as User);

    const allowed = roleNames.includes('admin') || roleNames.includes('owner');
    if (allowed) return NextResponse.next();

    return new NextResponse(JSON.stringify({ message: 'Forbidden.' }), {
      status: 403,
      headers: { 'content-type': 'application/json' },
    });
  }

  return NextResponse.next();
}
