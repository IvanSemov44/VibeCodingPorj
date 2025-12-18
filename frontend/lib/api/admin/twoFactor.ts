import { fetchWithAuth, parseJson } from '../fetch';

export async function getUserTwoFactor(userId: string): Promise<unknown | null> {
  const res = await fetchWithAuth(`/api/admin/users/${userId}/2fa`);
  if (res.status === 404) return null;
  return await parseJson<unknown>(res);
}

export async function setUserTwoFactor(userId: string, type: string): Promise<unknown> {
  const res = await fetchWithAuth(`/api/admin/users/${userId}/2fa`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type }),
  });
  return await parseJson<unknown>(res);
}

export async function disableUserTwoFactor(userId: string): Promise<void> {
  const res = await fetchWithAuth(`/api/admin/users/${userId}/2fa`, { method: 'DELETE' });
  if (!res.ok) await parseJson(res as unknown as Response);
}
