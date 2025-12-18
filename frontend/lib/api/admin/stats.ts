import { fetchWithAuth, parseJson } from '../fetch';
import type { AdminStats } from '../../types';

export async function getAdminStats(): Promise<AdminStats> {
  const res = await fetchWithAuth(`/api/admin/stats`);
  return (await parseJson(res as unknown as Response)) as AdminStats;
}
