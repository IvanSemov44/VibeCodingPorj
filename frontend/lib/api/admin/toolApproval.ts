import { fetchWithAuth, parseJson } from '../fetch';

export async function getPendingTools(params: Record<string, unknown> = {}): Promise<unknown> {
  const qs = new URLSearchParams(Object.entries(params as Record<string, string>)).toString();
  const url = `/api/admin/tools/pending${qs ? `?${qs}` : ''}`;
  const res = await fetchWithAuth(url);
  return await parseJson(res as unknown as Response);
}

export async function approveTool(id: string | number): Promise<unknown> {
  const res = await fetchWithAuth(`/api/admin/tools/${id}/approve`, { method: 'POST' });
  return await parseJson(res as unknown as Response);
}

export async function rejectTool(id: string | number, reason?: string): Promise<unknown> {
  const res = await fetchWithAuth(`/api/admin/tools/${id}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason }),
  });
  return await parseJson(res as unknown as Response);
}
