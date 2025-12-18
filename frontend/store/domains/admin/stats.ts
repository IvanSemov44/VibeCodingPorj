import { useQuery } from '@tanstack/react-query';
import * as api from '../../../lib/api';

export function useGetAdminStatsQuery(options?: Record<string, unknown>) {
  return useQuery<unknown>({
    queryKey: ['admin', 'stats'],
    queryFn: async () => api.getAdminStats(),
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
    queryFn: async () => api.getReady(),
    staleTime: 1000 * 60 * 3, // 3 minutes - system status doesn't change often
    ...(options || {}),
  });
}
