import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../../../lib/api';
import { QUERY_KEYS } from '../../queryKeys';

export function useGetRolesQuery(options?: Record<string, unknown>) {
  return useQuery<{ id: number; name: string }[]>({
    queryKey: [QUERY_KEYS.ROLES],
    queryFn: async () => api.getRoles(),
    staleTime: 1000 * 60 * 10, // 10 minutes - roles rarely change
    ...(options || {}),
  });
}

export function useGetAdminUsersQuery(
  params: Record<string, unknown> = {},
  options?: Record<string, unknown>,
) {
  const key = ['admin', 'users', params];
  return useQuery<{
    data: any[];
    meta?: Record<string, any>;
    links?: Record<string, any>;
  }>({
    queryKey: key,
    queryFn: async () =>
      (await api.getAdminUsers(params)) as {
        data: any[];
        meta?: Record<string, any>;
        links?: Record<string, any>;
      },
    ...(options || {}),
  });
}

export function useActivateUserMutation() {
  const qc = useQueryClient();
  const m = useMutation<unknown, Error, string | number>({
    mutationFn: async (id) => api.activateUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });
  const trigger = (arg: string | number) => ({ unwrap: () => m.mutateAsync(arg) });
  return [trigger, m] as const;
}

export function useDeactivateUserMutation() {
  const qc = useQueryClient();
  const m = useMutation<unknown, Error, string | number>({
    mutationFn: async (id) => api.deactivateUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });
  const trigger = (arg: string | number) => ({ unwrap: () => m.mutateAsync(arg) });
  return [trigger, m] as const;
}

export function useSetUserRolesMutation() {
  const qc = useQueryClient();
  const m = useMutation<unknown, Error, { userId: string | number; roles: Array<string | number> }>(
    {
      mutationFn: async ({ userId, roles }) => api.setUserRoles(userId, roles),
      onSuccess: () =>
        qc.invalidateQueries({ queryKey: ['admin', 'users', { page: 1 }] }),
    },
  );
  const trigger = (arg: { userId: string | number; roles: Array<string | number> }) => ({
    unwrap: () => m.mutateAsync(arg),
  });
  return [trigger, m] as const;
}
