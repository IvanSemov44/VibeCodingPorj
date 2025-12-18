import { fetchWithAuth, parseJson } from '../fetch';

export async function getAdminTags(params: Record<string, unknown> = {}): Promise<unknown> {
  const qs = new URLSearchParams(Object.entries(params as Record<string, string>)).toString();
  const url = `/api/admin/tags${qs ? `?${qs}` : ''}`;
  const res = await fetchWithAuth(url);
  return await parseJson(res as unknown as Response);
}

export async function getAdminTag(id: string | number): Promise<unknown> {
  const res = await fetchWithAuth(`/api/admin/tags/${id}`);
  return await parseJson(res as unknown as Response);
}

export async function createAdminTag(data: {
  name: string;
  description?: string;
}): Promise<unknown> {
  const res = await fetchWithAuth(`/api/admin/tags`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await parseJson(res as unknown as Response);
}

export async function updateAdminTag(
  id: string | number,
  data: { name: string; description?: string },
): Promise<unknown> {
  const res = await fetchWithAuth(`/api/admin/tags/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await parseJson(res as unknown as Response);
}

export async function deleteAdminTag(id: string | number): Promise<unknown> {
  const res = await fetchWithAuth(`/api/admin/tags/${id}`, { method: 'DELETE' });
  return await parseJson(res as unknown as Response);
}

export async function getTagStats(): Promise<unknown> {
  const res = await fetchWithAuth(`/api/admin/tags/stats`);
  return await parseJson(res as unknown as Response);
}
