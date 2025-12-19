/**
 * Standardized Query Key structure following TanStack Query best practices
 * https://tanstack.com/query/latest/docs/react/important-defaults#_top
 *
 * Key structure: [domain, 'list'|'detail', filter/id, ...]
 * This ensures proper cache invalidation and query composition
 */

export const QUERY_KEYS = {
  // User domain
  user: {
    all: ['user'] as const,
    profile: () => [...QUERY_KEYS.user.all, 'profile'] as const,
    me: () => [...QUERY_KEYS.user.all, 'me'] as const,
  },

  // Tools domain
  tools: {
    all: ['tools'] as const,
    lists: () => [...QUERY_KEYS.tools.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...QUERY_KEYS.tools.lists(), { filters }] as const,
    details: () => [...QUERY_KEYS.tools.all, 'detail'] as const,
    detail: (id: string | number) => [...QUERY_KEYS.tools.details(), id] as const,
    search: (query: string) => [...QUERY_KEYS.tools.all, 'search', query] as const,
  },

  // Categories domain
  categories: {
    all: ['categories'] as const,
    lists: () => [...QUERY_KEYS.categories.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...QUERY_KEYS.categories.lists(), { filters }] as const,
    details: () => [...QUERY_KEYS.categories.all, 'detail'] as const,
    detail: (id: string | number) => [...QUERY_KEYS.categories.details(), id] as const,
  },

  // Tags domain
  tags: {
    all: ['tags'] as const,
    lists: () => [...QUERY_KEYS.tags.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...QUERY_KEYS.tags.lists(), { filters }] as const,
    details: () => [...QUERY_KEYS.tags.all, 'detail'] as const,
    detail: (id: string | number) => [...QUERY_KEYS.tags.details(), id] as const,
  },

  // Entries/Journal domain
  entries: {
    all: ['entries'] as const,
    lists: () => [...QUERY_KEYS.entries.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...QUERY_KEYS.entries.lists(), { filters }] as const,
    details: () => [...QUERY_KEYS.entries.all, 'detail'] as const,
    detail: (id: string | number) => [...QUERY_KEYS.entries.details(), id] as const,
  },

  // Admin domain
  admin: {
    all: ['admin'] as const,
    activities: () => [...QUERY_KEYS.admin.all, 'activities'] as const,
    activity: (filters?: Record<string, unknown>) =>
      [...QUERY_KEYS.admin.activities(), { filters }] as const,
    analytics: () => [...QUERY_KEYS.admin.all, 'analytics'] as const,
    stats: () => [...QUERY_KEYS.admin.all, 'stats'] as const,
    users: () => [...QUERY_KEYS.admin.all, 'users'] as const,
    user: (id: string | number) =>
      [...QUERY_KEYS.admin.users(), id] as const,
  },

  // Authentication domain
  auth: {
    all: ['auth'] as const,
    twoFactor: () => [...QUERY_KEYS.auth.all, '2fa'] as const,
    twoFactorStatus: () => [...QUERY_KEYS.auth.twoFactor(), 'status'] as const,
  },

  // Roles domain
  roles: {
    all: ['roles'] as const,
    lists: () => [...QUERY_KEYS.roles.all, 'list'] as const,
    list: () => [...QUERY_KEYS.roles.lists()] as const,
  },
} as const;

export type QueryKeys = typeof QUERY_KEYS;

/**
 * Helper function to invalidate all queries in a domain
 * Usage: invalidateQueries({ queryKey: QUERY_KEYS.tools.all })
 */
export function getDomainKeyPrefix(domain: keyof typeof QUERY_KEYS) {
  return QUERY_KEYS[domain].all;
}

