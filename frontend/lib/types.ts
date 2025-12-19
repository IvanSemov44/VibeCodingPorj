// Central domain types for the frontend

export type ID = number;

export type Theme = 'light' | 'dark';

export type BadgeVariant = 'primary' | 'success' | 'error' | 'warning' | 'purple' | 'default';

export interface Role {
  id: ID;
  name: string;
}

export interface User {
  id: ID;
  name: string;
  email: string;
  roles?: (string | Role)[];
}

export interface Tag {
  id: ID;
  name: string;
  slug?: string | null;
  description?: string;
  tools_count?: number;
}

export interface Category {
  id: ID;
  name: string;
  slug?: string | null;
  description?: string;
  tools_count?: number;
}

export interface Tool {
  id: ID;
  name?: string;
  description?: string | null;
  url?: string | null;
  docs_url?: string | null;
  usage?: string | null;
  examples?: string | null;
  difficulty?: string;
  screenshots?: string[];
  average_rating?: number;
  rating_count?: number;
  user_rating?: { score: number };
  slug?: string | null;
  status?: 'pending' | 'approved' | 'rejected';
  is_pending?: boolean;
  is_approved?: boolean;
  user?: { id?: ID; name?: string } | null;
  author_name?: string;
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
  description?: string;
}

export type CategoryUpdatePayload = Partial<CategoryCreatePayload>;

export interface TagCreatePayload {
  name: string;
  slug?: string | null;
  description?: string;
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
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
}

// Admin types
export interface PendingToolStatus {
  id: ID;
  status: 'pending' | 'approved' | 'rejected';
}

export interface AdminUser extends User {
  is_active: boolean;
  email_verified_at?: string | null;
}

export interface ActivityLog {
  id: ID;
  user_id: ID;
  action: string;
  model: string;
  model_id: ID;
  changes?: Record<string, unknown>;
  created_at: string;
}

// Activity type for admin dashboard - different from ActivityLog
export interface Activity {
  id: number;
  subject_type: string;
  subject_id: number;
  action: string;
  user: {
    id: number;
    name: string;
    email: string;
    roles?: string[];
  } | null;
  meta: Record<string, any> | null;
  created_at: string;
  created_at_human: string;
}

export interface CategoryStats {
  total: number;
  with_tools: number;
  without_tools: number;
  avg_tools_per_category: number;
  top_categories: Array<{ id: ID; name: string; slug: string; tools_count: number }>;
}

export interface TagStats {
  total: number;
  with_tools: number;
  without_tools: number;
  avg_tools_per_tag: number;
  top_tags: Array<{ id: ID; name: string; slug: string; tools_count: number }>;
}

export interface AdminStats {
  totalTools: number;
  pendingTools: number;
  approvedTools: number;
  rejectedTools: number;
  activeUsers: number;
  totalUsers: number;
  totalCategories: number;
  totalTags: number;
  recentTools: Array<{
    id: number;
    title: string;
    slug: string;
    user: {
      name: string | null;
      id: number | null;
    };
    created_at: string | null;
  }>;
}

export interface Comment {
  id: ID;
  content: string;
  user: { id: ID; name: string };
  created_at: string;
  upvotes: number;
  downvotes: number;
  replies?: Comment[];
}

export interface CommentResponse {
  data: Comment[];
}
