import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../../lib/api';
import { QUERY_KEYS } from '../queryKeys';
import type { AuthResponse, LoginPayload, RegisterPayload, User } from '../../lib/types';

export function useGetUserQuery(options?: Record<string, unknown>) {
  return useQuery<User | null>({
    queryKey: [QUERY_KEYS.USER],
    queryFn: async () => (await api.getUser()) as User | null,
    ...(options || {}),
  });
}

export function useGetCsrfMutation() {
  const m = useMutation<Response, Error, void>({ mutationFn: async () => api.getCsrf() });
  const trigger = () => ({ unwrap: () => m.mutateAsync() });
  return [trigger, m] as const;
}

export function useLogoutMutation() {
  const qc = useQueryClient();
  const m = useMutation<void, Error, void>({
    mutationFn: async () => api.logout(),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.USER] }),
  });
  const trigger = () => ({ unwrap: () => m.mutateAsync() });
  return [trigger, m] as const;
}

export function useLoginMutation() {
  const qc = useQueryClient();
  const m = useMutation<AuthResponse, Error, LoginPayload>({
    mutationFn: async (body) => api.login(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.USER] }),
  });
  const trigger = (arg: LoginPayload) => ({ unwrap: () => m.mutateAsync(arg) });
  return [trigger, m] as const;
}

export function useRegisterMutation() {
  const qc = useQueryClient();
  const m = useMutation<AuthResponse, Error, RegisterPayload>({
    mutationFn: async (body) => api.register(body as unknown as Record<string, unknown>),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.USER] }),
  });
  const trigger = (arg: RegisterPayload) => ({ unwrap: () => m.mutateAsync(arg) });
  return [trigger, m] as const;
}
