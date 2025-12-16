import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: ['/admin', '/admin/:path*', '/api/admin/:path*'],
};

    async function getUserFromApi(req: NextRequest, apiBase: string) {
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

      let lastErr: any = null;
      for (const base of candidates) {
        const userPath = buildPath(base);
        try {
          const res = await fetch(userPath, { headers, cache: 'no-store' });
          const text = await res.text();
          let json = null;
          try { json = text ? JSON.parse(text) : null; } catch (e) { json = null; }
          if (res.ok) return { ok: true, status: res.status, url: userPath, body: text, json };
          // record non-ok response but continue trying
          lastErr = { ok: false, status: res.status, url: userPath, body: text, json };
        } catch (e) {
          lastErr = { ok: false, status: 0, url: userPath, body: String(e) };
        }
      }
      return lastErr ?? { ok: false, status: 0, url: apiBase, body: 'unreachable' };
    }

export default async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Protect admin UI pages: call backend to validate session + roles.
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? new URL(req.url).origin;
    let result = await getUserFromApi(req, apiBase as string);
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
    let roleNames: string[] = [];
    if (Array.isArray(user.roles)) {
      roleNames = user.roles.map((r: any) => r?.name).filter(Boolean);
    } else if ((user as any).role) {
      roleNames = [(user as any).role];
    }

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
    const user = userJson?.user ?? userJson?.data ?? userJson ?? null;

    if (!user) {
      return new NextResponse(JSON.stringify({ message: 'Unauthenticated.' }), {
        status: 401,
        headers: { 'content-type': 'application/json' },
      });
    }

    // Normalize roles (support array of role objects or single role string)
    let roleNames: string[] = [];
    if (Array.isArray(user.roles)) {
      roleNames = user.roles.map((r: any) => r?.name).filter(Boolean);
    } else if ((user as any).role) {
      roleNames = [(user as any).role];
    }

    const allowed = roleNames.includes('admin') || roleNames.includes('owner');
    if (allowed) return NextResponse.next();

    return new NextResponse(JSON.stringify({ message: 'Forbidden.' }), {
      status: 403,
      headers: { 'content-type': 'application/json' },
    });
  }

  return NextResponse.next();
}
