import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { useGet2faSecretQuery, useEnable2faMutation } from '../store/api';

type SecretResp = {
  provisioning_uri: string | null;
  secret_mask: string | null;
};

export default function TwoFactorSetup() {
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const { data, error, isLoading, refetch } = useGet2faSecretQuery();
  const [enableTrigger, enableMutation] = useEnable2faMutation();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // React Query handles loading; refetch on mount if necessary.
    if (!data) refetch();
  }, [data, refetch]);

  async function enableTotp() {
    try {
      const result = await enableTrigger().unwrap();
      if (result) {
        if ('recovery_codes' in result) setRecoveryCodes(result.recovery_codes ?? null);
        // let query invalidate/refresh
      }
    } catch {
      // set error display via local state if needed
      // result error is available on enableMutation.error
    }
  }

  useEffect(() => {
    const d = data as SecretResp | undefined;
    if (!d || !d.provisioning_uri || !canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, d.provisioning_uri, { width: 300 }, (err: unknown) => {
      if (err) console.error('Failed to render QR', err);
    });
  }, [data]);

  if (isLoading) return <div>Loading 2FA setup...</div>;
  if (error || enableMutation.error)
    return (
      <div>
        Error:{' '}
        {(error as unknown as { message?: string })?.message ??
          (enableMutation.error as unknown as { message?: string })?.message ??
          String(error ?? enableMutation.error ?? '')}
      </div>
    );
  if (!data)
    return (
      <div>
        <p>No 2FA setup available.</p>
        <button onClick={enableTotp} disabled={enableMutation.isLoading}>
          Enable TOTP 2FA
        </button>
        {recoveryCodes && (
          <div>
            <h4>Recovery codes</h4>
            <ul>
              {recoveryCodes.map((c) => (
                <li key={c}>
                  <code>{c}</code>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );

  return (
    <div>
      <h3>Two-Factor Authentication (TOTP)</h3>
      <p>Secret: {(data as SecretResp).secret_mask}</p>
      <canvas ref={canvasRef} />
      <p>Scan the QR code with your authenticator app or use the provisioning URI.</p>
      <details>
        <summary>Show provisioning URI</summary>
        <code>{(data as SecretResp).provisioning_uri}</code>
      </details>
      {recoveryCodes && (
        <div>
          <h4>Recovery codes</h4>
          <ul>
            {recoveryCodes.map((c) => (
              <li key={c}>
                <code>{c}</code>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
