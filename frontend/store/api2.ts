import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  User,
  JournalEntry,
  JournalCreatePayload,
  JournalStats,
  Tool,
  ToolCreatePayload,
  ToolUpdatePayload,
  Tag,
  TagCreatePayload,
  TagUpdatePayload,
  Category,
  CategoryCreatePayload,
  CategoryUpdatePayload,
  RegisterPayload,
  AuthResponse,
  ApiListResponse,
  LoginPayload,
} from '../lib/types';
import * as api from '../lib/api';

export function useGetEntriesQuery(
  params?: Record<string, string | number | boolean>,
  options?: Record<string, unknown>,
) {
  const key = ['entries', params ?? null];
  return useQuery<JournalEntry[]>({
    queryKey: key,
    queryFn: async () => api.getJournalEntries(params ?? {}),
    ...(options || {}),
  });
}

export function useGetStatsQuery(_arg?: unknown, options?: Record<string, unknown>) {
  return useQuery<JournalStats>({
    queryKey: ['stats'],
    queryFn: async () => api.getJournalStats(),
    ...(options || {}),
  });
}

export function useGet2faSecretQuery(options?: Record<string, unknown>) {
  return useQuery<{ provisioning_uri: string | null; secret_mask: string | null } | null>({
    queryKey: ['2fa', 'secret'],
    queryFn: async () => api.get2faSecret(),
    ...(options || {}),
  });
}

export function useGetToolQuery(id?: string | number, options?: Record<string, unknown>) {
  return useQuery<Tool>({
    queryKey: ['tool', typeof id === 'undefined' ? id : String(id)],
    queryFn: async () => api.getTool(String(id)),
    enabled: !!id,
    ...(options || {}),
  });
}

export function useGetToolsQuery(
  params?: Record<string, string | number | boolean>,
  options?: Record<string, unknown>,
) {
  const key = ['tools', params ?? null];
  return useQuery<ApiListResponse<Tool>>({
    queryKey: key,
    queryFn: async () => api.getTools(params ?? {}),
    ...(options || {}),
  });
}

export function useCreateToolMutation() {
  const qc = useQueryClient();
  const m = useMutation<Tool, Error, ToolCreatePayload>({
    mutationFn: async (body) => api.createTool(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tools'] }),
  });
  const trigger = (arg: ToolCreatePayload) => ({ unwrap: () => m.mutateAsync(arg) });
  return [trigger, m] as const;
}

export function useUpdateToolMutation() {
  const qc = useQueryClient();
  const m = useMutation<Tool, Error, { id: string | number; body: ToolUpdatePayload }>({
    mutationFn: async ({ id, body }) => api.updateTool(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tools'] });
      qc.invalidateQueries({ queryKey: ['tool'] });
    },
  });
  const trigger = (arg: { id: string | number; body: ToolUpdatePayload }) => ({
    unwrap: () => m.mutateAsync(arg),
  });
  return [trigger, m] as const;
}

export function useUploadToolScreenshotsMutation() {
  const qc = useQueryClient();
  const m = useMutation<{ screenshots: string[] }, Error, { id: string | number; files: File[] }>({
    mutationFn: async ({ id, files }) => api.uploadToolScreenshots(id, files),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tool'] }),
  });
  const trigger = (arg: { id: string | number; files: File[] }) => ({
    unwrap: () => m.mutateAsync(arg),
  });
  return [trigger, m] as const;
}

export function useDeleteToolMutation() {
  const qc = useQueryClient();
  const m = useMutation<void, Error, string | number>({
    mutationFn: async (id) => api.deleteTool(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ['tools'] });
      qc.invalidateQueries({ queryKey: ['tool', String(id)] });
    },
  });
  const trigger = (arg: string | number) => ({ unwrap: () => m.mutateAsync(arg) });
  return [trigger, m] as const;
}

export function useGetUserQuery(options?: Record<string, unknown>) {
  return useQuery<User | null>({
    queryKey: ['user'],
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
    onSuccess: () => qc.invalidateQueries({ queryKey: ['user'] }),
  });
  const trigger = () => ({ unwrap: () => m.mutateAsync() });
  return [trigger, m] as const;
}

export function useLoginMutation() {
  const qc = useQueryClient();
  const m = useMutation<AuthResponse, Error, LoginPayload>({
    mutationFn: async (body) => api.login(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['user'] }),
  });
  const trigger = (arg: LoginPayload) => ({ unwrap: () => m.mutateAsync(arg) });
  return [trigger, m] as const;
}

export function useRegisterMutation() {
  const qc = useQueryClient();
  const m = useMutation<AuthResponse, Error, RegisterPayload>({
    mutationFn: async (body) => api.register(body as unknown as Record<string, unknown>),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['user'] }),
  });
  const trigger = (arg: RegisterPayload) => ({ unwrap: () => m.mutateAsync(arg) });
  return [trigger, m] as const;
}

export function useGetUser2faQuery(userId?: string | number, options?: Record<string, unknown>) {
  return useQuery<unknown | null>({
    queryKey: ['admin', 'user-2fa', typeof userId === 'undefined' ? userId : String(userId)],
    queryFn: async () => api.getUserTwoFactor(String(userId)),
    enabled: !!userId,
    ...(options || {}),
  });
}

export function useEnable2faMutation() {
  const qc = useQueryClient();
  const m = useMutation<
    { provisioning_uri?: string | null; recovery_codes?: string[] } | null,
    Error,
    void
  >({
    mutationFn: async () => api.enable2faTotp(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['2fa', 'secret'] }),
  });
  const trigger = () => ({ unwrap: () => m.mutateAsync() });
  return [trigger, m] as const;
}

export function useGetTagsQuery(options?: Record<string, unknown>) {
  return useQuery<Tag[]>({
    queryKey: ['tags'],
    queryFn: async () => api.getTags(),
    ...(options || {}),
  });
}

export function useGetCategoriesQuery(options?: Record<string, unknown>) {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => api.getCategories(),
    ...(options || {}),
  });
}

export function useCreateTagMutation() {
  const qc = useQueryClient();
  const m = useMutation<Tag, Error, TagCreatePayload>({
    mutationFn: async (body) => api.createTag(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tags'] }),
  });
  const trigger = (arg: TagCreatePayload) => ({ unwrap: () => m.mutateAsync(arg) });
  return [trigger, m] as const;
}

export function useUpdateTagMutation() {
  const qc = useQueryClient();
  const m = useMutation<Tag, Error, { id: number | string; body: TagUpdatePayload }>({
    mutationFn: async ({ id, body }) => api.updateTag(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tags'] }),
  });
  const trigger = (arg: { id: number | string; body: TagUpdatePayload }) => ({
    unwrap: () => m.mutateAsync(arg),
  });
  return [trigger, m] as const;
}

export function useDeleteTagMutation() {
  const qc = useQueryClient();
  const m = useMutation<void, Error, number | string>({
    mutationFn: async (id) => api.deleteTag(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tags'] }),
  });
  const trigger = (arg: number | string) => ({ unwrap: () => m.mutateAsync(arg) });
  return [trigger, m] as const;
}

export function useCreateCategoryMutation() {
  const qc = useQueryClient();
  const m = useMutation<Category, Error, CategoryCreatePayload>({
    mutationFn: async (body) => api.createCategory(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });
  const trigger = (arg: CategoryCreatePayload) => ({ unwrap: () => m.mutateAsync(arg) });
  return [trigger, m] as const;
}

export function useUpdateCategoryMutation() {
  const qc = useQueryClient();
  const m = useMutation<Category, Error, { id: number | string; body: CategoryUpdatePayload }>({
    mutationFn: async ({ id, body }) => api.updateCategory(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });
  const trigger = (arg: { id: number | string; body: CategoryUpdatePayload }) => ({
    unwrap: () => m.mutateAsync(arg),
  });
  return [trigger, m] as const;
}

export function useDeleteCategoryMutation() {
  const qc = useQueryClient();
  const m = useMutation<void, Error, number | string>({
    mutationFn: async (id) => api.deleteCategory(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });
  const trigger = (arg: number | string) => ({ unwrap: () => m.mutateAsync(arg) });
  return [trigger, m] as const;
}

export function useGetRolesQuery(options?: Record<string, unknown>) {
  return useQuery<{ id: number; name: string }[]>({
    queryKey: ['roles'],
    queryFn: async () => api.getRoles(),
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

export function useCreateEntryMutation() {
  const qc = useQueryClient();
  const m = useMutation<JournalEntry, Error, JournalCreatePayload>({
    mutationFn: async (body) => api.createJournalEntry(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['entries'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });
  const trigger = (arg: JournalCreatePayload) => ({ unwrap: () => m.mutateAsync(arg) });
  return [trigger, m] as const;
}

export function useDeleteEntryMutation() {
  const qc = useQueryClient();
  const m = useMutation<void, Error, number | string>({
    mutationFn: async (id) => api.deleteJournalEntry(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['entries'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });
  const trigger = (arg: number | string) => ({ unwrap: () => m.mutateAsync(arg) });
  return [trigger, m] as const;
}
