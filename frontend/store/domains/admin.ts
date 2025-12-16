import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../../lib/api';
import { QUERY_KEYS } from '../queryKeys';
import type {} from '../../lib/types';

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

export function useGetRolesQuery(options?: Record<string, unknown>) {
  return useQuery<{ id: number; name: string }[]>({
    queryKey: [QUERY_KEYS.ROLES],
    queryFn: async () => api.getRoles(),
    ...(options || {}),
  });
}

export function useGetPendingToolsQuery(options?: Record<string, unknown>) {
  return useQuery<unknown>({
    queryKey: ['admin', 'pending-tools'],
    queryFn: async () => api.getPendingTools(),
    ...(options || {}),
  });
}

export function useApproveToolMutation() {
  const qc = useQueryClient();
  const m = useMutation<unknown, Error, string | number>({
    mutationFn: async (id) => api.approveTool(id),
    onSuccess: (_data) => {
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
  const trigger = (arg: { id: string | number; reason?: string }) => ({ unwrap: () => m.mutateAsync(arg) });
  return [trigger, m] as const;
}

export function useGetAdminStatsQuery(options?: Record<string, unknown>) {
  return useQuery<unknown>({
    queryKey: ['admin', 'stats'],
    queryFn: async () => api.getAdminStats(),
    ...(options || {}),
  });
}

export function useGetAdminUsersQuery(params: Record<string, unknown> = {}, options?: Record<string, unknown>) {
  const key = ['admin', 'users', params];
  return useQuery<{
    data: any[];
    meta?: Record<string, any>;
    links?: Record<string, any>;
  }>({
    queryKey: key,
    queryFn: async () => (await api.getAdminUsers(params)) as {
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
  const m = useMutation<unknown, Error, { userId: string | number; roles: Array<string | number> }>({
    mutationFn: async ({ userId, roles }) => api.setUserRoles(userId, roles),
    onSuccess: (_data, vars) => qc.invalidateQueries({ queryKey: ['admin', 'users', { page: 1 }] }),
  });
  const trigger = (arg: { userId: string | number; roles: Array<string | number> }) => ({ unwrap: () => m.mutateAsync(arg) });
  return [trigger, m] as const;
}
