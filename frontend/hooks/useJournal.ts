/**
 * useJournal Hook
 * Manages journal data fetching, creation, and deletion
 * Handles loading states, errors, and data synchronization
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import type { JournalEntry, JournalStats, JournalCreatePayload } from '../lib/types';
import {
  useGetEntriesQuery,
  useGetStatsQuery,
  useCreateEntryMutation,
  useDeleteEntryMutation,
} from '../store/api';

export interface JournalFilters {
  search?: string;
  mood?: string;
  tag?: string;
}

export interface UseJournalReturn {
  entries: JournalEntry[];
  stats: JournalStats | null;
  loading: boolean;
  error: string | null;
  loadData: () => Promise<void>;
  createEntry: (data: JournalCreatePayload) => Promise<JournalEntry | null>;
  deleteEntry: (id: number | string) => Promise<void>;
  refreshStats: () => Promise<void>;
}

/**
 * Custom hook for journal data management
 * @param filters - Filter options for journal entries
 * @param autoLoad - Whether to automatically load data on mount (default: true)
 */
export function useJournal(
  filters: JournalFilters = {},
  autoLoad: boolean = true,
): UseJournalReturn {
  // Use RTK Query hooks to manage journal data
  // Build and memoize the params object so its identity is stable across renders
  const memoParams = useMemo(() => {
    const p: Record<string, any> = {};
    if (filters.search) p.search = filters.search;
    if (filters.mood) p.mood = filters.mood;
    if (filters.tag) p.tag = filters.tag;
    return Object.keys(p).length ? p : undefined;
  }, [filters.search, filters.mood, filters.tag]);

  const entriesQuery = useGetEntriesQuery(memoParams, {
    // keepUnusedDataFor default is fine
  });
  const statsQuery = useGetStatsQuery(undefined, {
    refetchOnFocus: false,
    refetchOnReconnect: false,
    refetchOnMountOrArgChange: false,
  });

  const [createEntryMutation, createResult] = useCreateEntryMutation();
  const [deleteEntryMutation, deleteResult] = useDeleteEntryMutation();

  const entries = (entriesQuery.data as JournalEntry[]) ?? [];
  const stats = (statsQuery.data as JournalStats) ?? null;
  const loading =
    entriesQuery.isLoading || (createResult as any).isLoading || (deleteResult as any).isLoading;
  const error =
    (entriesQuery.error as any)?.message ??
    (createResult as any)?.error?.message ??
    (deleteResult as any)?.error?.message ??
    null;

  /**
   * Load journal entries and stats from the API
   */
  // With RTK Query the data is loaded automatically by the hooks above.
  const loadData = useCallback(async () => {
    // RTK Query automatically manages cache; to force refetch use entriesQuery.refetch and statsQuery.refetch
    try {
      await Promise.all([entriesQuery.refetch(), statsQuery.refetch()]);
    } catch (err) {
      console.error('Failed to refetch journal data:', err);
      throw err;
    }
  }, [entriesQuery, statsQuery]);

  /**
   * Create a new journal entry
   */
  const createEntry = useCallback(
    async (data: JournalCreatePayload): Promise<JournalEntry | null> => {
      const result = await createEntryMutation(data)
        .unwrap()
        .catch((err) => {
          // rethrow after logging
          console.error('Failed to create entry', err);
          throw err;
        });
      // RTK Query invalidates tags and will refetch entries/stats automatically
      return result ?? null;
    },
    [createEntryMutation],
  );

  /**
   * Delete a journal entry by ID
   */
  const deleteEntry = useCallback(
    async (id: number | string): Promise<void> => {
      await deleteEntryMutation(id)
        .unwrap()
        .catch((err) => {
          console.error('Failed to delete entry', err);
          throw err;
        });
      // invalidation triggers refetch
    },
    [deleteEntryMutation],
  );

  /**
   * Refresh stats without reloading all entries
   */
  const refreshStats = useCallback(async () => {
    try {
      await statsQuery.refetch();
    } catch (err) {
      console.error('Failed to refresh stats:', err);
    }
  }, [statsQuery]);

  // RTK Query hooks fetch data automatically on mount; no extra effect needed

  return {
    entries,
    stats,
    loading,
    error,
    loadData,
    createEntry,
    deleteEntry,
    refreshStats,
  };
}
