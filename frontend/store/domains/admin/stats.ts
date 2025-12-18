import { useQuery } from '@tanstack/react-query';
import { getAdminStats, getReady } from '../../../lib/api';
import type { AdminStats } from '../../../lib/types';

export type { AdminStats } from '../../../lib/types';

export function useGetAdminStatsQuery(options?: Record<string, unknown>) {
  return useQuery<AdminStats>({
    queryKey: ['admin', 'stats'],
    queryFn: async () => getAdminStats(),
    staleTime: 1000 * 60 * 5, // 5 minutes - stats don't change that often
    ...(options || {}),
  });
}

// System health / readiness
export function useGetSystemReadyQuery(options?: Record<string, unknown>) {
  return useQuery<{
    status?: string;
    checks?: Record<string, string>;
  }>({
    queryKey: ['system', 'ready'],
    queryFn: async () => getReady(),
    staleTime: 1000 * 60 * 3, // 3 minutes - system status doesn't change often
    ...(options || {}),
  });
}
