import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../../../lib/api';
import { QUERY_KEYS } from '../../queryKeys';

export function useGetPendingToolsQuery(options?: Record<string, unknown>) {
  return useQuery<unknown>({
    queryKey: ['admin', 'pending-tools'],
    queryFn: async () => api.getPendingTools(),
    staleTime: 1000 * 30, // 30 seconds - pending tools should be fairly fresh
    ...(options || {}),
  });
}

export function useApproveToolMutation() {
  const qc = useQueryClient();
  const m = useMutation<unknown, Error, string | number>({
    mutationFn: async (id) => api.approveTool(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'pending-tools'] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.TOOLS] });
    },
  });
  const trigger = (arg: string | number) => ({ unwrap: () => m.mutateAsync(arg) });
  return [trigger, m] as const;
}

export function useRejectToolMutation() {
  const qc = useQueryClient();
  const m = useMutation<unknown, Error, { id: string | number; reason?: string }>({
    mutationFn: async ({ id, reason }) => api.rejectTool(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'pending-tools'] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.TOOLS] });
    },
  });
  const trigger = (arg: { id: string | number; reason?: string }) => ({
    unwrap: () => m.mutateAsync(arg),
  });
  return [trigger, m] as const;
}
