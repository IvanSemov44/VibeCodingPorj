/**
 * State Management Best Practices & Usage Examples
 * Phase 4 Implementation: Query Key Optimization, Optimistic Updates & Prefetching
 */

import { QUERY_KEYS } from './queryKeys';
import {
  usePrefetchTool,
  usePrefetchTools,
  usePrefetchCategories,
  usePrefetchTags,
  usePrefetchEntries,
  usePrefetchUser,
  usePrefetchHooks,
} from './utils/prefetch';
import { useOptimisticUpdate, useOptimisticUpdateWithInvalidation } from './utils/optimisticUpdate';

// ============================================================================
// 1. OPTIMISTIC UPDATES
// ============================================================================

/**
 * Example: Tool Rating with Optimistic Update
 * When user rates a tool, show star immediately before server confirmation
 */
export function useRateToolOptimistic() {
  // Tool detail is updated optimistically
  // Show updated rating star immediately
  // Rollback if mutation fails
}

/**
 * Example: Comment Creation with Optimistic Update
 * When user posts comment, show it in list immediately
 */
export function useCreateCommentOptimistic() {
  // Comment list is updated optimistically
  // New comment appears instantly in feed
  // Removed if mutation fails
}

/**
 * Example: Tool Favorite Toggle
 * Optimistic toggle of favorite button
 */
export function useFavoriteToolOptimistic() {
  // Tool favorited status is toggled immediately
  // User sees visual feedback instantly
  // Reverts if mutation fails
}

// ============================================================================
// 2. QUERY PREFETCHING
// ============================================================================

/**
 * Example: Prefetch on Tool Card Hover
 * Prefetch tool details when user hovers over tool card
 */
function ToolCard({ tool }: { tool: Tool }) {
  const prefetchTool = usePrefetchTool();

  return (
    <div onMouseEnter={() => prefetchTool(tool.id)}>
      {/* Tool card content */}
    </div>
  );
}

/**
 * Example: Prefetch on Navigation Link Hover
 * Prefetch tools list before user clicks to navigate
 */
function ToolsLink() {
  const prefetchTools = usePrefetchTools();

  return (
    <a href="/tools" onMouseEnter={() => prefetchTools()}>
      Tools
    </a>
  );
}

/**
 * Example: Prefetch on Admin Layout Mount
 * Preload all data when admin loads admin panel
 */
function AdminLayout() {
  const { prefetchTags, prefetchCategories, prefetchUser } = usePrefetchHooks();

  useEffect(() => {
    // Prefetch all admin data on mount
    prefetchUser();
    prefetchTags();
    prefetchCategories();
  }, []);

  return <div>{/* Admin content */}</div>;
}

/**
 * Example: Prefetch on Pagination Navigation
 * Prefetch next page when user is near bottom of list
 */
function ToolsList({ currentPage }: { currentPage: number }) {
  const prefetchTools = usePrefetchTools();

  const prefetchNextPage = useCallback(() => {
    prefetchTools({ page: currentPage + 1 });
  }, [currentPage, prefetchTools]);

  return <div onScroll={handleScrollNearBottom(prefetchNextPage)}>{/* List content */}</div>;
}

// ============================================================================
// 3. QUERY KEY STRUCTURE USAGE
// ============================================================================

/**
 * Different invalidation patterns:
 */

// Invalidate all tool queries
// queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tools.all });

// Invalidate only tool lists (keeps detail queries fresh)
// queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tools.lists() });

// Invalidate only detail for specific tool
// queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tools.detail(toolId) });

// Invalidate everything except tool queries
// queryClient.removeQueries({ queryKey: ['other-domain'] });

// ============================================================================
// 4. CACHE FRESHNESS STRATEGY
// ============================================================================

/**
 * Stale times by data type:
 * 
 * User Profile: 30 minutes (rarely changes)
 * Tools List: 2 minutes (frequently accessed, can be stale)
 * Tool Detail: Dynamic (depends on importance)
 * Tags/Categories: 5 minutes (admin-controlled)
 * Entries: 1 minute (frequently updated)
 * Admin Stats: 1 minute (needs freshness)
 */

// ============================================================================
// 5. MUTATION PATTERNS
// ============================================================================

/**
 * Pattern 1: Simple mutation with list invalidation
 * Use when: Operation affects list but not details
 */
export function useCreateItemMutation() {
  return useCreateMutation({
    fn: (body) => api.createItem(body),
    invalidate: [QUERY_KEYS.items.lists()], // Only invalidate list
  });
}

/**
 * Pattern 2: Mutation with optimistic update
 * Use when: Want instant feedback before server confirmation
 */
export function useUpdateItemOptimistic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => api.updateItem(body),
    onMutate: async (body) => {
      // Optimistic update logic
    },
    onError: (err, body, context) => {
      // Rollback logic
    },
    onSuccess: () => {
      // Invalidate relevant queries
    },
  });
}

/**
 * Pattern 3: Mutation with both list and detail invalidation
 * Use when: Operation affects both list and detail pages
 */
export function useDeleteItemMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.deleteItem(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.items.lists() });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.items.all });
    },
  });
}

// ============================================================================
// 6. BEST PRACTICES
// ============================================================================

/**
 * ✅ DO:
 * - Use query keys from QUERY_KEYS for consistency
 * - Set appropriate staleTime for different data types
 * - Invalidate list when creating/deleting
 * - Use optimistic updates for user actions
 * - Prefetch on navigation predictions
 * - Cancel previous queries before optimistic updates
 * - Provide rollback on error
 *
 * ❌ DON'T:
 * - Use string literals for query keys (use QUERY_KEYS)
 * - Set staleTime too high (stale data frustrates users)
 * - Invalidate entire domain when updating one item
 * - Forget error handling in optimistic updates
 * - Prefetch data that's already in cache
 * - Mutate state directly (use queryClient.setQueryData)
 */
