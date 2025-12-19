import { useQuery } from '@tanstack/react-query';
import * as api from '../../lib/api';
import { QUERY_KEYS } from '../queryKeys';
import { useCreateMutation } from '../utils/createMutation';
import type { JournalEntry, JournalCreatePayload, JournalStats } from '../../lib/types';

/**
 * Fetch journal entries with optional filters
 */
export function useGetEntriesQuery(
  params?: Record<string, string | number | boolean>,
  options?: Record<string, unknown>,
) {
  return useQuery<JournalEntry[]>({
    queryKey: QUERY_KEYS.entries.list(params),
    queryFn: async () => api.getJournalEntries(params ?? {}),
    staleTime: 1000 * 60, // 1 minute
    ...(options || {}),
  });
}

/**
 * Fetch journal statistics
 */
export function useGetStatsQuery(_arg?: unknown, options?: Record<string, unknown>) {
  return useQuery<JournalStats>({
    queryKey: QUERY_KEYS.entries.all,
    queryFn: async () => api.getJournalStats(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...(options || {}),
  });
}

/**
 * Create a new journal entry
 * Invalidates entries list and stats
 */
export function useCreateEntryMutation() {
  const fn = (body: JournalCreatePayload) => api.createJournalEntry(body);
  return useCreateMutation<JournalCreatePayload, JournalEntry>({
    fn,
    invalidate: [QUERY_KEYS.entries.lists(), QUERY_KEYS.entries.all],
  });
}

/**
 * Delete a journal entry
 * Invalidates entries list and stats
 */
export function useDeleteEntryMutation() {
  const fn = (id: number | string) => api.deleteJournalEntry(id);
  return useCreateMutation<number | string, void>({
    fn,
    invalidate: [QUERY_KEYS.entries.lists(), QUERY_KEYS.entries.all],
  });
}

