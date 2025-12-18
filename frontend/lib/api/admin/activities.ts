import { fetchWithAuth, parseJson } from '../fetch';

export async function getActivities(params: Record<string, unknown> = {}): Promise<unknown> {
  const qs = new URLSearchParams(Object.entries(params as Record<string, string>)).toString();
  const url = `/api/admin/activities${qs ? `?${qs}` : ''}`;
  const res = await fetchWithAuth(url);
  return await parseJson(res as unknown as Response);
}

export async function getActivityStats(): Promise<unknown> {
  const res = await fetchWithAuth(`/api/admin/activities/stats`);
  return await parseJson(res as unknown as Response);
}
