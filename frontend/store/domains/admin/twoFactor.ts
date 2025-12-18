import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../../../lib/api';

export function useGetUser2faQuery(userId?: string | number, options?: Record<string, unknown>) {
  return useQuery<unknown | null>({
    queryKey: ['admin', 'user-2fa', typeof userId === 'undefined' ? userId : String(userId)],
    queryFn: async () => api.getUserTwoFactor(String(userId)),
    enabled: !!userId,
    ...(options || {}),
  });
}

export function useSetUser2faMutation() {
  const qc = useQueryClient();
  const m = useMutation<unknown, Error, { userId: string | number; type: string }>({
    mutationFn: async ({ userId, type }) => api.setUserTwoFactor(String(userId), type),
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({ queryKey: ['admin', 'user-2fa', String(vars.userId)] }),
  });
  const trigger = (arg: { userId: string | number; type: string }) => ({
    unwrap: () => m.mutateAsync(arg),
  });
  return [trigger, m] as const;
}

export function useDisableUser2faMutation() {
  const qc = useQueryClient();
  const m = useMutation<void, Error, string | number>({
    mutationFn: async (userId) => api.disableUserTwoFactor(String(userId)),
    onSuccess: (_data, userId) =>
      qc.invalidateQueries({ queryKey: ['admin', 'user-2fa', String(userId)] }),
  });
  const trigger = (arg: string | number) => ({ unwrap: () => m.mutateAsync(arg) });
  return [trigger, m] as const;
}
