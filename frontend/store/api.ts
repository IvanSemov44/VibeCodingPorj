import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { JournalEntry, JournalStats, JournalCreatePayload } from '../lib/types';
import { API_BASE_URL } from '../lib/constants';

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
    queryFn: async () => {
      // Build a request path relative to the API base (do NOT include the base twice)
      const qs = params ? new URLSearchParams(Object.entries(params).reduce((acc, [k, v]) => {
        if (v !== undefined && v !== null) acc[k] = String(v);
        return acc;
      }, {} as Record<string,string>)).toString() : '';
      const path = '/journal' + (qs ? `?${qs}` : '');
      return fetchJson(path) as Promise<JournalEntry[]>;
    },
    ...(options ? options as any : {}),
  } as any);
}

export function useGetStatsQuery(_arg?: any, options?: any) {
  return useQuery({ queryKey: ['stats'], queryFn: async () => fetchJson('/journal/stats') as Promise<JournalStats>, ...(options ? options as any : {}) } as any);
}

export function useCreateEntryMutation() {
  const qc = useQueryClient();
  const m = useMutation<JournalEntry, Error, JournalCreatePayload>({
    mutationFn: async (body: JournalCreatePayload) => fetchJson('/journal', { method: 'POST', body: JSON.stringify(body) }) as Promise<JournalEntry>,
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
    mutationFn: async (id: number | string) => fetchJson(`/journal/${id}`, { method: 'DELETE' }) as Promise<void>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['entries'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });
  const trigger = (arg: number | string) => ({ unwrap: () => m.mutateAsync(arg) });
  return [trigger, m as any] as const;
}

