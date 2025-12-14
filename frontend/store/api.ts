import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { JournalEntry, JournalCreatePayload } from '../lib/types';
import * as api from '../lib/api';

export function useGetEntriesQuery(
  params?: Record<string, unknown>,
  options?: Record<string, unknown>
) {
  const key = ['entries', params ?? null];
  return useQuery({
    queryKey: key,
    queryFn: async () => api.getJournalEntries(params ?? {}),
    ...(options || {}),
  });
}

export function useGetStatsQuery(_arg?: unknown, options?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['stats'],
    queryFn: async () => api.getJournalStats(),
    ...(options || {}),
  });
}

// 2FA hooks (public)
export function useGet2faSecretQuery(options?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['2fa', 'secret'],
    queryFn: async () => api.get2faSecret(),
    ...(options || {}),
  });
}

// Tool hooks
export function useGetToolQuery(id?: string | number, options?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['tool', typeof id === 'undefined' ? id : String(id)],
    queryFn: async () => api.getTool(String(id)),
    enabled: !!id,
    ...(options || {}),
  });
}

export function useCreateToolMutation() {
  const qc = useQueryClient();
  const m = useMutation<unknown, Error, unknown>({
    mutationFn: async (body: unknown) => api.createTool(body as unknown as Record<string, unknown>),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tools'] });
    },
  });
  const trigger = (arg: unknown) => ({ unwrap: () => m.mutateAsync(arg) });
  return [trigger, m as unknown] as const;
}

export function useGetToolsQuery(params?: Record<string, unknown>, options?: Record<string, unknown>) {
  const key = ['tools', params ?? null];
  return useQuery({
    queryKey: key,
    queryFn: async () => api.getTools(params ?? {}),
    ...(options || {}),
  });
}

export function useUpdateToolMutation() {
  const qc = useQueryClient();
  const m = useMutation<unknown, Error, { id: string | number; body: unknown }>({
    mutationFn: async ({ id, body }) => api.updateTool(id, body as unknown as Record<string, unknown>),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tools'] });
      qc.invalidateQueries({ queryKey: ['tool'] });
    },
  });
  const trigger = (arg: { id: string | number; body: unknown }) => ({
    unwrap: () => m.mutateAsync(arg),
  });
  return [trigger, m as unknown] as const;
}

export function useUploadToolScreenshotsMutation() {
  const qc = useQueryClient();
  const m = useMutation<unknown, Error, { id: string | number; files: File[] }>({
    mutationFn: async ({ id, files }) => api.uploadToolScreenshots(id, files),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tool'] });
    },
  });
  const trigger = (arg: { id: string | number; files: File[] }) => ({
    unwrap: () => m.mutateAsync(arg),
  });
  return [trigger, m as unknown] as const;
}

export function useDeleteToolMutation() {
  const qc = useQueryClient();
  const m = useMutation<void, Error, string | number>({
    mutationFn: async (id: string | number) => api.deleteTool(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ['tools'] });
      qc.invalidateQueries({ queryKey: ['tool', String(id)] });
    },
  });
  const trigger = (arg: string | number) => ({ unwrap: () => m.mutateAsync(arg) });
  return [trigger, m as unknown] as const;
}

// Auth / user helpers
export function useGetUserQuery(options?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['user'],
    queryFn: async () => api.getUser(),
    ...(options || {}),
  });
}

export function useGetCsrfMutation() {
  const m = useMutation<unknown, Error, void>({
    mutationFn: async () => api.getCsrf(),
  });
  const trigger = () => ({ unwrap: () => m.mutateAsync() });
  return [trigger, m as unknown] as const;
}

export function useLogoutMutation() {
  const qc = useQueryClient();
  const m = useMutation<unknown, Error, void>({
    mutationFn: async () => api.logout(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user'] });
    },
  });
  const trigger = () => ({ unwrap: () => m.mutateAsync() });
  return [trigger, m as unknown] as const;
}

export function useLoginMutation() {
  const qc = useQueryClient();
  const m = useMutation<unknown, Error, { email: string; password: string }>({
    mutationFn: async (body) => api.login(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user'] });
    },
  });
  const trigger = (arg: { email: string; password: string }) => ({
    unwrap: () => m.mutateAsync(arg),
  });
  return [trigger, m as unknown] as const;
}

export function useRegisterMutation() {
  const qc = useQueryClient();
  const m = useMutation<
    unknown,
    Error,
    { name: string; email: string; password: string; password_confirmation?: string }
  >({
    mutationFn: async (body) => api.register(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user'] });
    },
  });
  const trigger = (arg: unknown) => ({ unwrap: () => m.mutateAsync(arg) });
  return [trigger, m as unknown] as const;
}

export function useEnable2faMutation() {
  const qc = useQueryClient();
  const m = useMutation<unknown, Error, void>({
    mutationFn: async () => api.enable2faTotp(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['2fa', 'secret'] });
    },
  });
  const trigger = () => ({ unwrap: () => m.mutateAsync() });
  return [trigger, m as unknown] as const;
}

// Admin: per-user 2FA hooks
export function useGetUser2faQuery(userId: string | number, options?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['admin', 'user-2fa', String(userId)],
    queryFn: async () => api.getUserTwoFactor(String(userId)),
    ...(options || {}),
  });
}

// Tags / categories / roles common queries
export function useGetTagsQuery(options?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['tags'],
    queryFn: async () => api.getTags(),
    ...(options || {}),
  });
}

export function useGetCategoriesQuery(options?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => api.getCategories(),
    ...(options || {}),
  });
}

export function useCreateTagMutation() {
  const qc = useQueryClient();
  const m = useMutation<unknown, Error, unknown>({
    mutationFn: async (body: unknown) => api.createTag(body as unknown as Record<string, unknown>),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tags'] }),
  });
  const trigger = (arg: unknown) => ({ unwrap: () => m.mutateAsync(arg) });
  return [trigger, m as unknown] as const;
}

export function useUpdateTagMutation() {
  const qc = useQueryClient();
  const m = useMutation<unknown, Error, { id: number | string; body: unknown }>({
    mutationFn: async ({ id, body }) => api.updateTag(id, body as unknown as Record<string, unknown>),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tags'] }),
  });
  const trigger = (arg: { id: number | string; body: unknown }) => ({
    unwrap: () => m.mutateAsync(arg),
  });
  return [trigger, m as unknown] as const;
}

export function useDeleteTagMutation() {
  const qc = useQueryClient();
  const m = useMutation<void, Error, number | string>({
    mutationFn: async (id: number | string) => api.deleteTag(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tags'] }),
  });
  const trigger = (arg: number | string) => ({ unwrap: () => m.mutateAsync(arg) });
  return [trigger, m as unknown] as const;
}

export function useCreateCategoryMutation() {
  const qc = useQueryClient();
  const m = useMutation<unknown, Error, unknown>({
    mutationFn: async (body: unknown) => api.createCategory(body as unknown as Record<string, unknown>),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });
  const trigger = (arg: unknown) => ({ unwrap: () => m.mutateAsync(arg) });
  return [trigger, m as unknown] as const;
}

export function useUpdateCategoryMutation() {
  const qc = useQueryClient();
  const m = useMutation<unknown, Error, { id: number | string; body: unknown }>({
    mutationFn: async ({ id, body }) => api.updateCategory(id, body as unknown as Record<string, unknown>),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });
  const trigger = (arg: { id: number | string; body: unknown }) => ({
    unwrap: () => m.mutateAsync(arg),
  });
  return [trigger, m as unknown] as const;
}

export function useDeleteCategoryMutation() {
  const qc = useQueryClient();
  const m = useMutation<void, Error, number | string>({
    mutationFn: async (id: number | string) => api.deleteCategory(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });
  const trigger = (arg: number | string) => ({ unwrap: () => m.mutateAsync(arg) });
  return [trigger, m as unknown] as const;
}

export function useGetRolesQuery(options?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['roles'],
    queryFn: async () => api.getRoles(),
    ...(options || {}),
  });
}

export function useSetUser2faMutation() {
  const qc = useQueryClient();
  const m = useMutation<unknown, Error, { userId: string | number; type: string }>({
    mutationFn: async ({ userId, type }) => api.setUserTwoFactor(String(userId), type),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['admin', 'user-2fa', String(vars.userId)] });
    },
  });
  const trigger = (arg: { userId: string | number; type: string }) => ({
    unwrap: () => m.mutateAsync(arg),
  });
  return [trigger, m as unknown] as const;
}

export function useDisableUser2faMutation() {
  const qc = useQueryClient();
  const m = useMutation<void, Error, string | number>({
    mutationFn: async (userId) => api.disableUserTwoFactor(String(userId)),
    onSuccess: (_data, userId) => {
      qc.invalidateQueries({ queryKey: ['admin', 'user-2fa', String(userId)] });
    },
  });
  const trigger = (arg: string | number) => ({ unwrap: () => m.mutateAsync(arg) });
  return [trigger, m as unknown] as const;
}

export function useCreateEntryMutation() {
  const qc = useQueryClient();
  const m = useMutation<JournalEntry, Error, JournalCreatePayload>({
    mutationFn: async (body: JournalCreatePayload) =>
      api.createJournalEntry(body) as Promise<JournalEntry>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['entries'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });
  const trigger = (arg: JournalCreatePayload) => ({ unwrap: () => m.mutateAsync(arg) });
  return [trigger, m as unknown] as const;
}

export function useDeleteEntryMutation() {
  const qc = useQueryClient();
  const m = useMutation<void, Error, number | string>({
    mutationFn: async (id: number | string) => api.deleteJournalEntry(id) as Promise<void>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['entries'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });
  const trigger = (arg: number | string) => ({ unwrap: () => m.mutateAsync(arg) });
  return [trigger, m as unknown] as const;
}
