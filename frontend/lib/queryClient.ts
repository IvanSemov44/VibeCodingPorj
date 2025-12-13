/**
 * React Query Client Configuration
 *
 * Centralized configuration for @tanstack/react-query
 * Used throughout the application for data fetching and caching
 */

import { QueryClient } from '@tanstack/react-query';

/**
 * Global QueryClient instance
 *
 * Configuration:
 * - refetchOnWindowFocus: false - Don't refetch when user switches tabs
 * - retry: 1 - Only retry failed requests once
 * - gcTime: 5 minutes - How long inactive data stays in cache
 * - staleTime: 30 seconds - How long data is considered fresh
 *
 * @see https://tanstack.com/query/latest/docs/react/reference/QueryClient
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Refetch on window focus (useful for keeping data fresh)
      refetchOnWindowFocus: false,

      // Retry failed requests (API might be temporarily down)
      retry: 1,

      // Garbage collection time: how long inactive data stays in cache
      // Renamed from cacheTime in React Query v5
      gcTime: 1000 * 60 * 5, // 5 minutes

      // Stale time: how long data is considered fresh
      // Data will be refetched in the background after this time
      staleTime: 1000 * 30, // 30 seconds
    },
    mutations: {
      // Retry mutations only once
      // Mutations are usually user actions (create, update, delete)
      retry: 1,
    },
  },
});
