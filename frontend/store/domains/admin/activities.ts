import { useQuery } from '@tanstack/react-query';
import * as api from '../../../lib/api';
import type { ActivityLog, ApiListResponse } from '../../../lib/types';

export function useGetActivitiesQuery(
  params: Record<string, unknown> = {},
  options?: Record<string, unknown>,
) {
  const key = ['admin', 'activities', params];
  return useQuery<ApiListResponse<ActivityLog>>({
    queryKey: key,
    queryFn: async () =>
      (await api.getActivities(params)) as ApiListResponse<ActivityLog>,
    ...(options || {}),
  });
}

export function useGetActivityStatsQuery(options?: Record<string, unknown>) {
  return useQuery<{
    total: number;
    today: number;
    this_week: number;
    top_actions: { action: string; count: number }[];
  }>({
    queryKey: ['admin', 'activity-stats'],
    queryFn: async () =>
      (await api.getActivityStats()) as {
        total: number;
        today: number;
        this_week: number;
        top_actions: { action: string; count: number }[];
      },
    staleTime: 1000 * 60 * 2, // 2 minutes
    ...(options || {}),
  });
}
