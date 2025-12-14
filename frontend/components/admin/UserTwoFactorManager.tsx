import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import {
  useGetUser2faQuery,
  useSetUser2faMutation,
  useDisableUser2faMutation,
} from '../../store/api2';

type Status = {
  two_factor_type: string | null;
  two_factor_confirmed_at: string | null;
  has_secret: boolean;
  provisioning_uri?: string | null;
};

export default function UserTwoFactorManager({ userId }: { userId: string }) {
  const [message, setMessage] = useState<string | null>(null);
  const { data: status, error, isLoading, refetch } = useGetUser2faQuery(userId);
  const [setTypeTrigger, setTypeMutation] = useSetUser2faMutation();
  const [disableTrigger, disableMutation] = useDisableUser2faMutation();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // API base is handled by the centralized client; any client-side fallback logic is not needed here.

  // React Query manages loading; ensure data is fetched on mount
  useEffect(() => {
    if (!status) refetch();
  }, [status, refetch]);

  // render provisioning QR when available
  useEffect(() => {
    const s = status as Status | null | undefined;
    if (!s || !s.provisioning_uri || !canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, s.provisioning_uri, { width: 300 }).catch((err: unknown) => {
      console.error('Failed to render provisioning QR:', err);
    });
  }, [status]);

  async function setType(type: 'totp' | 'email' | 'telegram' | 'none') {
    setMessage(null);
    try {
      await setTypeTrigger({ userId, type }).unwrap();
      setMessage('OK');
    } catch (err: unknown) {
      console.error('setType error', err);
    }
  }

  async function disable() {
    setMessage(null);
    try {
      await disableTrigger(userId).unwrap();
      setMessage('2FA disabled');
    } catch (err: unknown) {
      console.error('disable error', err);
    }
  }

  if (isLoading) return <div>Loading...</div>;
  if (error || setTypeMutation.error || disableMutation.error)
    return (
      <div className="text-red-600">
        Error:{' '}
        {(error as unknown as { message?: string })?.message ??
          (setTypeMutation.error as unknown as { message?: string })?.message ??
          (disableMutation.error as unknown as { message?: string })?.message ??
          ''}
      </div>
    );
  if (!status) return <div>No data</div>;

  return (
    <div>
      <h3>2FA for user {userId}</h3>
      <p>Method: {(status as Status).two_factor_type ?? 'none'}</p>
      <p>Confirmed: {(status as Status).two_factor_confirmed_at ?? 'no'}</p>
      {(status as Status).provisioning_uri && (
        <div>
          <p>Provisioning URI available (TOTP)</p>
          <canvas ref={canvasRef} />
          <details>
            <summary>Show provisioning URI</summary>
            <code className="break-all">{(status as Status).provisioning_uri}</code>
          </details>
        </div>
      )}

      <div className="mt-3 flex gap-2 flex-wrap">
        <button
          onClick={() => setType('totp')}
          className="py-1 px-2 bg-blue-600 text-white text-sm rounded border-none cursor-pointer hover:bg-blue-700 transition-colors"
        >
          Enable TOTP
        </button>
        <button
          onClick={() => setType('email')}
          className="py-1 px-2 bg-blue-600 text-white text-sm rounded border-none cursor-pointer hover:bg-blue-700 transition-colors"
        >
          Set Email OTP
        </button>
        <button
          onClick={() => setType('telegram')}
          className="py-1 px-2 bg-blue-600 text-white text-sm rounded border-none cursor-pointer hover:bg-blue-700 transition-colors"
        >
          Set Telegram OTP
        </button>
        <button
          onClick={() => setType('none')}
          className="py-1 px-2 bg-gray-600 text-white text-sm rounded border-none cursor-pointer hover:bg-gray-700 transition-colors"
        >
          Set None
        </button>
        <button
          onClick={disable}
          className="py-1 px-2 bg-red-600 text-white text-sm rounded border-none cursor-pointer hover:bg-red-700 transition-colors"
        >
          Disable 2FA
        </button>
      </div>

      {message && <div className="mt-2 text-green-600">{message}</div>}
    </div>
  );
}
