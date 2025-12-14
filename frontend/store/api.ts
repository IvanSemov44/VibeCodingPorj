import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { JournalEntry, JournalStats, JournalCreatePayload } from '../lib/types';
import { API_BASE_URL } from '../lib/constants';
import * as api from '../lib/api';

const _apiBaseServer = 'http://backend/api';

function joinBaseAndPath(base: string, path: string) {
  return base.replace(/\/$/, '') + '/' + path.replace(/^\//, '');
}

let _apiBaseClient = '';
if (API_BASE_URL && API_BASE_URL.length) {
  // Use provided API_BASE_URL as-is (strip trailing slash)
  _apiBaseClient = API_BASE_URL.replace(/\/$/, '');
} else if (typeof window !== 'undefined') {
  // Default to origin + /api when running in the browser
  _apiBaseClient = joinBaseAndPath(window.location.origin || '', 'api');
}

const _baseUrl = typeof window === 'undefined' ? _apiBaseServer : _apiBaseClient;

async function fetchJson(path: string, opts: RequestInit = {}) {
  const res = await fetch(joinBaseAndPath(_baseUrl, path), {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || res.statusText || `HTTP ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export function useGetEntriesQuery(params?: Record<string, any>, options?: any) {
  const key = ['entries', params ?? null];
  return useQuery({
    queryKey: key,
    queryFn: async () => api.getJournalEntries(params ?? {}),
    ...(options ? (options as any) : {}),
  } as any);
}

export function useGetStatsQuery(_arg?: any, options?: any) {
  return useQuery({
    queryKey: ['stats'],
    queryFn: async () => api.getJournalStats(),
    ...(options ? (options as any) : {}),
  } as any);
}

// 2FA hooks (public)
export function useGet2faSecretQuery(options?: any) {
  return useQuery({
    queryKey: ['2fa', 'secret'],
    queryFn: async () => api.get2faSecret(),
    ...(options || {}),
  } as any);
}

// Tool hooks
export function useGetToolQuery(id?: string | number, options?: any) {
  return useQuery({
    queryKey: ['tool', typeof id === 'undefined' ? id : String(id)],
    queryFn: async () => api.getTool(String(id)),
    enabled: !!id,
    ...(options || {}),
  } as any);
}

export function useCreateToolMutation() {
  const qc = useQueryClient();
  const m = useMutation<any, Error, any>({
    mutationFn: async (body) => api.createTool(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tools'] });
    },
  });
  const trigger = (arg: any) => ({ unwrap: () => m.mutateAsync(arg) });
  return [trigger, m as any] as const;
}

export function useGetToolsQuery(params?: Record<string, any>, options?: any) {
  const key = ['tools', params ?? null];
  return useQuery({
    queryKey: key,
    queryFn: async () => api.getTools(params ?? {}),
    ...(options || {}),
  } as any);
}

export function useUpdateToolMutation() {
  const qc = useQueryClient();
  const m = useMutation<any, Error, { id: string | number; body: any }>({
    mutationFn: async ({ id, body }) => api.updateTool(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tools'] });
      qc.invalidateQueries({ queryKey: ['tool'] });
    },
  });
  const trigger = (arg: { id: string | number; body: any }) => ({ unwrap: () => m.mutateAsync(arg) });
  return [trigger, m as any] as const;
}

export function useUploadToolScreenshotsMutation() {
  const qc = useQueryClient();
  const m = useMutation<any, Error, { id: string | number; files: File[] }>({
    mutationFn: async ({ id, files }) => api.uploadToolScreenshots(id, files as any),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tool'] });
    },
  });
  const trigger = (arg: { id: string | number; files: File[] }) => ({ unwrap: () => m.mutateAsync(arg) });
  return [trigger, m as any] as const;
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
  return [trigger, m as any] as const;
}

// Auth / user helpers
export function useGetUserQuery(options?: any) {
  return useQuery({
    queryKey: ['user'],
    queryFn: async () => api.getUser(),
    ...(options || {}),
  } as any);
}

export function useGetCsrfMutation() {
  const m = useMutation<any, Error, void>({
    mutationFn: async () => api.getCsrf(),
  });
  const trigger = () => ({ unwrap: () => m.mutateAsync() });
  return [trigger, m as any] as const;
}

export function useLogoutMutation() {
  const qc = useQueryClient();
  const m = useMutation<any, Error, void>({
    mutationFn: async () => api.logout(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user'] });
    },
  });
  const trigger = () => ({ unwrap: () => m.mutateAsync() });
  return [trigger, m as any] as const;
}

export function useEnable2faMutation() {
  const qc = useQueryClient();
  const m = useMutation<any, Error, void>({
    mutationFn: async () => api.enable2faTotp(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['2fa', 'secret'] });
    },
  });
  const trigger = () => ({ unwrap: () => m.mutateAsync() });
  return [trigger, m as any] as const;
}

// Admin: per-user 2FA hooks
export function useGetUser2faQuery(userId: string | number, options?: any) {
  return useQuery({
    queryKey: ['admin', 'user-2fa', String(userId)],
    queryFn: async () => api.getUserTwoFactor(String(userId)),
    ...(options || {}),
  } as any);
}

// Tags / categories / roles common queries
export function useGetTagsQuery(options?: any) {
  return useQuery({
    queryKey: ['tags'],
    queryFn: async () => api.getTags(),
    ...(options || {}),
  } as any);
}

export function useGetCategoriesQuery(options?: any) {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => api.getCategories(),
    ...(options || {}),
  } as any);
}

export function useGetRolesQuery(options?: any) {
  return useQuery({
    queryKey: ['roles'],
    queryFn: async () => api.getRoles(),
    ...(options || {}),
  } as any);
}

export function useSetUser2faMutation() {
  const qc = useQueryClient();
  const m = useMutation<any, Error, { userId: string | number; type: string }>({
    mutationFn: async ({ userId, type }) => api.setUserTwoFactor(String(userId), type),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['admin', 'user-2fa', String(vars.userId)] });
    },
  });
  const trigger = (arg: { userId: string | number; type: string }) => ({
    unwrap: () => m.mutateAsync(arg),
  });
  return [trigger, m as any] as const;
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
  return [trigger, m as any] as const;
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
  return [trigger, m as any] as const;
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
  return [trigger, m as any] as const;
}
