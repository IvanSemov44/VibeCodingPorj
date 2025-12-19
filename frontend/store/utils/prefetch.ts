import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '../queryKeys';
import * as api from '../../lib/api';

/**
 * Hook to prefetch tool details on demand
 * Useful for prefetching on hover or navigation prediction
 */
export function usePrefetchTool() {
  const qc = useQueryClient();

  return (id: string | number) => {
    qc.prefetchQuery({
      queryKey: QUERY_KEYS.tools.detail(id),
      queryFn: () => api.getTool(String(id)),
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  };
}

/**
 * Hook to prefetch tools list
 * Useful for prefetching on navigation or filter changes
 */
export function usePrefetchTools() {
  const qc = useQueryClient();

  return (filters?: Record<string, string | number | boolean>) => {
    qc.prefetchQuery({
      queryKey: QUERY_KEYS.tools.list(filters),
      queryFn: () => api.getTools(filters ?? {}),
      staleTime: 1000 * 60 * 2, // 2 minutes
    });
  };
}

/**
 * Hook to prefetch categories
 * Useful for prefetching before category management page
 */
export function usePrefetchCategories() {
  const qc = useQueryClient();

  return () => {
    qc.prefetchQuery({
      queryKey: QUERY_KEYS.categories.list(),
      queryFn: () => api.getCategories(),
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  };
}

/**
 * Hook to prefetch tags
 * Useful for prefetching before tags management page
 */
export function usePrefetchTags() {
  const qc = useQueryClient();

  return () => {
    qc.prefetchQuery({
      queryKey: QUERY_KEYS.tags.list(),
      queryFn: () => api.getTags(),
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  };
}

/**
 * Hook to prefetch journal entries
 * Useful for prefetching before journal page
 */
export function usePrefetchEntries() {
  const qc = useQueryClient();

  return (filters?: Record<string, string | number | boolean>) => {
    qc.prefetchQuery({
      queryKey: QUERY_KEYS.entries.list(filters),
      queryFn: () => api.getJournalEntries(filters ?? {}),
      staleTime: 1000 * 60, // 1 minute
    });
  };
}

/**
 * Hook to prefetch user profile
 * Useful for prefetching on app initialization
 */
export function usePrefetchUser() {
  const qc = useQueryClient();

  return () => {
    qc.prefetchQuery({
      queryKey: QUERY_KEYS.user.me(),
      queryFn: () => api.getUser(),
      staleTime: 1000 * 60 * 30, // 30 minutes
    });
  };
}

/**
 * Helper hook that returns all prefetch functions
 * Useful for one-time setup in layout or app component
 */
export function usePrefetchHooks() {
  return {
    prefetchTool: usePrefetchTool(),
    prefetchTools: usePrefetchTools(),
    prefetchCategories: usePrefetchCategories(),
    prefetchTags: usePrefetchTags(),
    prefetchEntries: usePrefetchEntries(),
    prefetchUser: usePrefetchUser(),
  };
}
