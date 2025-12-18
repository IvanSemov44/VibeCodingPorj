import { fetchWithAuth, parseJson } from '../fetch';

export async function getAdminUsers(params: Record<string, unknown> = {}): Promise<unknown> {
  const qs = new URLSearchParams(Object.entries(params as Record<string, string>)).toString();
  const url = `/api/admin/users${qs ? `?${qs}` : ''}`;
  const res = await fetchWithAuth(url);
  return await parseJson(res as unknown as Response);
}

export async function activateUser(userId: string | number): Promise<unknown> {
  const res = await fetchWithAuth(`/api/admin/users/${userId}/activate`, { method: 'POST' });
  return await parseJson(res as unknown as Response);
}

export async function deactivateUser(userId: string | number): Promise<unknown> {
  const res = await fetchWithAuth(`/api/admin/users/${userId}/deactivate`, { method: 'POST' });
  return await parseJson(res as unknown as Response);
}

export async function setUserRoles(
  userId: string | number,
  roles: Array<string | number>,
): Promise<unknown> {
  const res = await fetchWithAuth(`/api/admin/users/${userId}/roles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roles }),
  });
  return await parseJson(res as unknown as Response);
}
