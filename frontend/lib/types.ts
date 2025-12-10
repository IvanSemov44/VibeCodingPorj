// Central domain types for the frontend

export type ID = number;

export type Theme = 'light' | 'dark';

export interface User {
  id: ID;
  name: string;
  email: string;
  roles?: string[];
}

export interface Tag {
  id: ID;
  name: string;
  slug?: string | null;
}

export interface Category {
  id: ID;
  name: string;
  slug?: string | null;
}

export interface Role {
  id: ID;
  name: string;
}

export interface Tool {
  id: ID;
  name?: string;
  description?: string | null;
  url?: string | null;
  screenshots?: string[];
  [key: string]: unknown;
}

export interface ToolCreatePayload {
  name: string;
  url?: string;
  docs_url?: string;
  description?: string;
  usage?: string;
  examples?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'expert' | string;
  categories?: number[];
  roles?: number[];
  tags?: string[];
  screenshots?: string[];
}

export type ToolUpdatePayload = Partial<ToolCreatePayload>;

export interface CategoryCreatePayload {
  name: string;
  slug?: string | null;
}

export type CategoryUpdatePayload = Partial<CategoryCreatePayload>;

export interface TagCreatePayload {
  name: string;
  slug?: string | null;
}

export type TagUpdatePayload = Partial<TagCreatePayload>;

export interface JournalCreatePayload {
  title: string;
  content: string;
  mood?: string | null;
  tags?: string[];
  xp?: number;
}

export type JournalUpdatePayload = Partial<JournalCreatePayload>;

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token?: string;
  meta?: Record<string, unknown>;
}

export interface JournalEntry {
  id: ID;
  title: string;
  content: string;
  mood?: string;
  tags?: string[];
  xp?: number;
  created_at: string;
}

export interface JournalStats {
  total_entries: number;
  total_xp: number;
  entries_this_week: number;
  recent_streak: number;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from?: number;
  to?: number;
}

export interface ApiListResponse<T = unknown> {
  data: T[];
  meta?: PaginationMeta;
}
