import { fetchWithAuth, parseJson } from '../fetch';

export async function getAdminStats(): Promise<unknown> {
  const res = await fetchWithAuth(`/api/admin/stats`);
  return await parseJson(res as unknown as Response);
}
