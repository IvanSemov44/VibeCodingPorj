import { fetchWithAuth, parseJson } from '../fetch';

export async function getAdminCategories(params: Record<string, unknown> = {}): Promise<unknown> {
  const qs = new URLSearchParams(Object.entries(params as Record<string, string>)).toString();
  const url = `/api/admin/categories${qs ? `?${qs}` : ''}`;
  const res = await fetchWithAuth(url);
  return await parseJson(res as unknown as Response);
}

export async function getAdminCategory(id: string | number): Promise<unknown> {
  const res = await fetchWithAuth(`/api/admin/categories/${id}`);
  return await parseJson(res as unknown as Response);
}

export async function createAdminCategory(data: {
  name: string;
  description?: string;
}): Promise<unknown> {
  const res = await fetchWithAuth(`/api/admin/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await parseJson(res as unknown as Response);
}

export async function updateAdminCategory(
  id: string | number,
  data: { name: string; description?: string },
): Promise<unknown> {
  const res = await fetchWithAuth(`/api/admin/categories/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await parseJson(res as unknown as Response);
}

export async function deleteAdminCategory(id: string | number): Promise<unknown> {
  const res = await fetchWithAuth(`/api/admin/categories/${id}`, { method: 'DELETE' });
  return await parseJson(res as unknown as Response);
}

export async function getCategoryStats(): Promise<unknown> {
  const res = await fetchWithAuth(`/api/admin/categories/stats`);
  return await parseJson(res as unknown as Response);
}
