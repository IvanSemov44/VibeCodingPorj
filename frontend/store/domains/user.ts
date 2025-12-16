import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseQueryResult,
  UseMutationResult,
} from '@tanstack/react-query';
import * as api from '../../lib/api';
import { QUERY_KEYS } from '../queryKeys.ts';
import { useCreateMutation } from '../utils/createMutation';
import type { AuthResponse, LoginPayload, RegisterPayload, User } from '../../lib/types';

export function useGetUserQuery(
  options?: UseQueryOptions<User | null, unknown, User | null>,
): UseQueryResult<User | null, unknown> {
  return useQuery<User | null, unknown, User | null>({
    queryKey: [QUERY_KEYS.USER],
    queryFn: async () => (await api.getUser()) as User | null,
    ...(options || {}),
  });
}

export function useGetCsrfMutation(): readonly [
  () => { unwrap: () => Promise<Response> },
  UseMutationResult<Response, unknown, void>,
] {
  const m = useMutation<Response, unknown, void>({ mutationFn: async () => api.getCsrf() });
  const trigger = () => ({ unwrap: () => m.mutateAsync() });
  return [trigger, m] as const;
}

export function useLogoutMutation(): readonly [
  () => { unwrap: () => Promise<void> },
  UseMutationResult<void, unknown, void>,
] {
  const qc = useQueryClient();
  const m = useMutation<void, unknown, void>({
    mutationFn: async () => api.logout(),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.USER] }),
  });
  const trigger = () => ({ unwrap: () => m.mutateAsync() });
  return [trigger, m] as const;
}

export function useLoginMutation(): readonly [
  (arg: LoginPayload) => { unwrap: () => Promise<AuthResponse> },
  UseMutationResult<AuthResponse, unknown, LoginPayload>,
] {
  const qc = useQueryClient();
  const m = useMutation<AuthResponse, unknown, LoginPayload>({
    mutationFn: async (body) => api.login(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.USER] }),
  });
  const trigger = (arg: LoginPayload) => ({ unwrap: () => m.mutateAsync(arg) });
  return [trigger, m] as const;
}

export function useRegisterMutation(): readonly [
  (arg: RegisterPayload) => { unwrap: () => Promise<AuthResponse> },
  UseMutationResult<AuthResponse, unknown, RegisterPayload>,
] {
  const qc = useQueryClient();
  const m = useMutation<AuthResponse, unknown, RegisterPayload>({
    mutationFn: async (body) => api.register(body as unknown as Record<string, unknown>),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.USER] }),
  });
  const trigger = (arg: RegisterPayload) => ({ unwrap: () => m.mutateAsync(arg) });
  return [trigger, m] as const;
}

// Example using createMutation helper
export function useCreateUserMutation() {
  const apiShim = api as unknown as {
    createUser?: (body: Record<string, unknown>) => Promise<User>;
  };
  const fn = (body: Record<string, unknown>) =>
    apiShim.createUser ? apiShim.createUser(body) : Promise.reject(new Error('not implemented'));
  return useCreateMutation<Record<string, unknown>, User>({ fn, invalidate: [QUERY_KEYS.USER] });
}

export function useGet2faSecretQuery(
  options?: UseQueryOptions<
    { provisioning_uri: string | null; secret_mask: string | null } | null,
    unknown,
    { provisioning_uri: string | null; secret_mask: string | null } | null
  >,
): UseQueryResult<{ provisioning_uri: string | null; secret_mask: string | null } | null, unknown> {
  return useQuery<{ provisioning_uri: string | null; secret_mask: string | null } | null, unknown>({
    queryKey: [QUERY_KEYS.TWO_FA, 'secret'],
    queryFn: async () => api.get2faSecret(),
    ...(options || {}),
  });
}

export function useEnable2faMutation(): readonly [
  () => {
    unwrap: () => Promise<{ provisioning_uri?: string | null; recovery_codes?: string[] } | null>;
  },
  UseMutationResult<
    { provisioning_uri?: string | null; recovery_codes?: string[] } | null,
    unknown,
    void
  >,
] {
  const qc = useQueryClient();
  const m = useMutation<
    { provisioning_uri?: string | null; recovery_codes?: string[] } | null,
    unknown,
    void
  >({
    mutationFn: async () => api.enable2faTotp(),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.TWO_FA, 'secret'] }),
  });
  const trigger = () => ({ unwrap: () => m.mutateAsync() });
  return [trigger, m] as const;
}
