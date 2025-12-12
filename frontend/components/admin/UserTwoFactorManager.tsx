import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';

type Status = {
  two_factor_type: string | null;
  two_factor_confirmed_at: string | null;
  has_secret: boolean;
  provisioning_uri?: string | null;
};

export default function UserTwoFactorManager({ userId }: { userId: string }) {
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  let base = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
  if (!base && typeof window !== 'undefined') {
    // Fallback to backend dev host when NEXT_PUBLIC_API_URL isn't provided to the client.
    // Frontend dev server runs on :8200, backend nginx on :8201 in this workspace.
    base = `${window.location.protocol}//${window.location.hostname}:8201/api`;
    console.warn('UserTwoFactorManager: using fallback API base', base);
  }

  function getCookie(name: string) {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  }

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = base ? `${base}/admin/users/${userId}/2fa` : `/api/admin/users/${userId}/2fa`;
      const csrf = base ? `${base.replace(/\/api$/, '')}/sanctum/csrf-cookie` : '/sanctum/csrf-cookie';
      await fetch(csrf, { credentials: 'include' }).catch(() => null);
      const res = await fetch(url, { credentials: 'include' });
      const contentType = res.headers.get('content-type') || '';
      if (!res.ok) {
        // If backend redirected to login (302) or returned auth error, navigate to login page
        if (res.status === 302 || res.status === 401 || res.status === 419) {
          try { window.location.href = '/login'; } catch {};
          throw new Error('Unauthenticated - redirecting to login');
        }

        // Not found often means the target user doesn't exist or you lack permission.
        if (res.status === 404) {
          setStatus(null);
          setError('Not found: user not found or insufficient permissions.');
          return;
        }

        // try to read body for diagnostics
        const text = await res.text().catch(() => '');
        throw new Error(`Status ${res.status}: ${text.slice(0, 300)}`);
      }

      if (!contentType.includes('application/json')) {
        const text = await res.text().catch(() => '');
        // If backend returned an HTML login redirect, go to login
        if (res.status === 302 || res.status === 401 || res.status === 419) {
          try { window.location.href = '/login'; } catch {}
          throw new Error('Unauthenticated - redirecting to login');
        }

        if (res.status === 404) {
          setStatus(null);
          setError('Not found: user not found or insufficient permissions.');
          return;
        }

        throw new Error(`Expected JSON but got ${contentType}: ${text.slice(0, 300)}`);
      }

      const j = await res.json();
      setStatus(j);
    } catch (err: unknown) {
      console.error('UserTwoFactorManager.load error:', err);
      const message = err instanceof Error ? err.message : String(err ?? 'Error');
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [userId, base]);

  React.useEffect(() => { void load(); }, [load]);

  // render provisioning QR when available
  useEffect(() => {
    if (!status || !status.provisioning_uri || !canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, status.provisioning_uri, { width: 300 }).catch((err: unknown) => {
      console.error('Failed to render provisioning QR:', err);
    });
  }, [status]);

  async function setType(type: 'totp' | 'email' | 'telegram' | 'none') {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const url = base ? `${base}/admin/users/${userId}/2fa` : `/api/admin/users/${userId}/2fa`;
      // Ensure CSRF cookie is present
      const csrfUrl = base ? `${base.replace(/\/api$/, '')}/sanctum/csrf-cookie` : '/sanctum/csrf-cookie';
      await fetch(csrfUrl, { credentials: 'include' }).catch(() => null);

      const xsrf = getCookie('XSRF-TOKEN');

      const res = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(xsrf ? { 'X-XSRF-TOKEN': xsrf } : {}),
        },
        body: JSON.stringify({ type: type }),
      });
      const contentType = res.headers.get('content-type') || '';
      const j = contentType.includes('application/json') ? await res.json().catch(() => ({})) : null;
      if (!res.ok) {
        const text = j ? (j.message || JSON.stringify(j)) : await res.text().catch(() => '');
        throw new Error(text || `Status ${res.status}`);
      }
      setMessage(j.message || 'OK');
      // refresh status — if totp, API returns provisioning_uri
      await load();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err ?? 'Error');
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function disable() {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const url = base ? `${base}/admin/users/${userId}/2fa` : `/api/admin/users/${userId}/2fa`;
      const csrfUrl = base ? `${base.replace(/\/api$/, '')}/sanctum/csrf-cookie` : '/sanctum/csrf-cookie';
      await fetch(csrfUrl, { credentials: 'include' }).catch(() => null);
      const xsrf = getCookie('XSRF-TOKEN');
      const res = await fetch(url, { method: 'DELETE', credentials: 'include', headers: xsrf ? { 'X-XSRF-TOKEN': xsrf } : {} });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Status ${res.status}: ${text.slice(0,300)}`);
      }
      setMessage('2FA disabled');
      await load();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err ?? 'Error');
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;
  if (!status) return <div>No data</div>;

  return (
    <div>
      <h3>2FA for user {userId}</h3>
      <p>Method: {status.two_factor_type ?? 'none'}</p>
      <p>Confirmed: {status.two_factor_confirmed_at ?? 'no'}</p>
      {status.provisioning_uri && (
        <div>
          <p>Provisioning URI available (TOTP)</p>
          <canvas ref={canvasRef} />
          <details>
            <summary>Show provisioning URI</summary>
            <code style={{ wordBreak: 'break-all' }}>{status.provisioning_uri}</code>
          </details>
        </div>
      )}

      <div style={{ marginTop: 12 }}>
        <button onClick={() => setType('totp')}>Enable TOTP</button>
        <button onClick={() => setType('email')} style={{ marginLeft: 8 }}>Set Email OTP</button>
        <button onClick={() => setType('telegram')} style={{ marginLeft: 8 }}>Set Telegram OTP</button>
        <button onClick={() => setType('none')} style={{ marginLeft: 8 }}>Set None</button>
        <button onClick={disable} style={{ marginLeft: 8 }}>Disable 2FA</button>
      </div>

      {message && <div style={{ marginTop: 8, color: 'green' }}>{message}</div>}
    </div>
  );
}
