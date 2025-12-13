import { fetchWithAuth, parseJson } from './fetch';

export async function get2faSecret(): Promise<{
  provisioning_uri: string | null;
  secret_mask: string | null;
}> {
  try {
    const res = await fetchWithAuth(`/api/2fa/secret`);
    if (res.status === 404) return { provisioning_uri: null, secret_mask: null };
    return await parseJson<{ provisioning_uri: string | null; secret_mask: string | null }>(res);
  } catch (err: unknown) {
    throw err;
  }
}

export async function enable2faTotp(): Promise<{
  provisioning_uri?: string | null;
  recovery_codes?: string[];
} | null> {
  const res = await fetchWithAuth(`/api/2fa/enable`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'totp' }),
  });
  if (!res.ok) return await parseJson(res as unknown as Response);
  return await parseJson(res as unknown as Response);
}
