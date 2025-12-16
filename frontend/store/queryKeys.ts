export const QUERY_KEYS = {
  USER: 'user',
  ENTRIES: 'entries',
  STATS: 'stats',
  TOOLS: 'tools',
  TOOL: 'tool',
  TWO_FA: '2fa',
  TAGS: 'tags',
  ROLES: 'roles',
  CATEGORIES: 'categories',
} as const;

export type QueryKeys = typeof QUERY_KEYS;
