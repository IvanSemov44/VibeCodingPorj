import { useQuery } from '@tanstack/react-query';
import * as api from '../../lib/api';
import { QUERY_KEYS } from '../queryKeys';
import { useCreateMutation } from '../utils/createMutation';
import type { JournalEntry, JournalCreatePayload, JournalStats } from '../../lib/types';

export function useGetEntriesQuery(
  params?: Record<string, string | number | boolean>,
  options?: Record<string, unknown>,
) {
  const key = [QUERY_KEYS.ENTRIES, params ?? null] as const;
  return useQuery<JournalEntry[]>({
    queryKey: key,
    queryFn: async () => api.getJournalEntries(params ?? {}),
    ...(options || {}),
  });
}

export function useGetStatsQuery(_arg?: unknown, options?: Record<string, unknown>) {
  return useQuery<JournalStats>({
    queryKey: [QUERY_KEYS.STATS],
    queryFn: async () => api.getJournalStats(),
    ...(options || {}),
  });
}

export function useCreateEntryMutation() {
  const fn = (body: JournalCreatePayload) => api.createJournalEntry(body);
  return useCreateMutation<JournalCreatePayload, JournalEntry>({
    fn,
    invalidate: [QUERY_KEYS.ENTRIES, QUERY_KEYS.STATS],
  });
}

export function useDeleteEntryMutation() {
  const fn = (id: number | string) => api.deleteJournalEntry(id);
  return useCreateMutation<number | string, void>({
    fn,
    invalidate: [QUERY_KEYS.ENTRIES, QUERY_KEYS.STATS],
  });
}
