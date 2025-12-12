import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';

type SecretResp = {
  provisioning_uri: string | null;
  secret_mask: string | null;
};

export default function TwoFactorSetup() {
  const [data, setData] = useState<SecretResp | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const base = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
        const url = base ? `${base}/2fa/secret` : '/api/2fa/secret';

        // Ensure Sanctum CSRF cookie is present for stateful auth
        try {
          const csrfUrl = base ? `${base.replace(/\/api$/, '')}/sanctum/csrf-cookie` : '/sanctum/csrf-cookie';
          await fetch(csrfUrl, { credentials: 'include' });
        } catch {
          // ignore CSRF fetch failures; we'll handle auth errors below
        }

        const res = await fetch(url, { credentials: 'include' });
        // If backend redirected to login or returned an HTML page, treat as unauthenticated
        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          if (res.status === 404) {
            // no secret exists yet
            setData({ provisioning_uri: null, secret_mask: null });
            return;
          }
          // If the backend returned HTML (e.g. login page) treat as unauthenticated
          throw new Error('Not authenticated');
        }
        if (!res.ok) throw new Error('No secret configured');
        const j: SecretResp = await res.json();
        setData(j);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err ?? 'Failed to fetch secret');
        setError(message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function enableTotp() {
    setLoading(true);
    setError(null);
    try {
      const base = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
      const url = base ? `${base}/2fa/enable` : '/api/2fa/enable';
      const res = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'totp' }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Failed to enable 2FA' }));
        throw new Error(err.message || 'Enable failed');
      }

      const json = await res.json();
      // response contains provisioning_uri and recovery_codes
      setData({ provisioning_uri: json.provisioning_uri ?? null, secret_mask: null });
      setRecoveryCodes(json.recovery_codes ?? null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err ?? 'Failed to enable 2FA');
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!data || !data.provisioning_uri || !canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, data.provisioning_uri, { width: 300 }, (err: unknown) => {
      if (err) setError('Failed to render QR');
    });
  }, [data]);

  if (loading) return <div>Loading 2FA setup...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return (
    <div>
      <p>No 2FA setup available.</p>
      <button onClick={enableTotp}>Enable TOTP 2FA</button>
    </div>
  );

  return (
    <div>
      <h3>Two-Factor Authentication (TOTP)</h3>
      <p>Secret: {data.secret_mask}</p>
      <canvas ref={canvasRef} />
      <p>Scan the QR code with your authenticator app or use the provisioning URI.</p>
      <details>
        <summary>Show provisioning URI</summary>
        <code>{data.provisioning_uri}</code>
      </details>
      {recoveryCodes && (
        <div>
          <h4>Recovery codes</h4>
          <ul>
            {recoveryCodes.map((c) => (
              <li key={c}><code>{c}</code></li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
