export const QUERY_KEYS = {
  USER: 'user',
  ENTRIES: 'entries',
  STATS: 'stats',
  TOOLS: 'tools',
  TOOL: 'tool',
  TAGS: 'tags',
  CATEGORIES: 'categories',
} as const;

export type QueryKeys = typeof QUERY_KEYS;
