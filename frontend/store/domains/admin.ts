import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../../lib/api';
import { QUERY_KEYS } from '../queryKeys';
import type {} from '../../lib/types';

export function useGetUser2faQuery(userId?: string | number, options?: Record<string, unknown>) {
  return useQuery<unknown | null>({
    queryKey: ['admin', 'user-2fa', typeof userId === 'undefined' ? userId : String(userId)],
    queryFn: async () => api.getUserTwoFactor(String(userId)),
    enabled: !!userId,
    ...(options || {}),
  });
}

export function useSetUser2faMutation() {
  const qc = useQueryClient();
  const m = useMutation<unknown, Error, { userId: string | number; type: string }>({
    mutationFn: async ({ userId, type }) => api.setUserTwoFactor(String(userId), type),
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({ queryKey: ['admin', 'user-2fa', String(vars.userId)] }),
  });
  const trigger = (arg: { userId: string | number; type: string }) => ({
    unwrap: () => m.mutateAsync(arg),
  });
  return [trigger, m] as const;
}

export function useDisableUser2faMutation() {
  const qc = useQueryClient();
  const m = useMutation<void, Error, string | number>({
    mutationFn: async (userId) => api.disableUserTwoFactor(String(userId)),
    onSuccess: (_data, userId) =>
      qc.invalidateQueries({ queryKey: ['admin', 'user-2fa', String(userId)] }),
  });
  const trigger = (arg: string | number) => ({ unwrap: () => m.mutateAsync(arg) });
  return [trigger, m] as const;
}

export function useGetRolesQuery(options?: Record<string, unknown>) {
  return useQuery<{ id: number; name: string }[]>({
    queryKey: [QUERY_KEYS.ROLES],
    queryFn: async () => api.getRoles(),
    staleTime: 1000 * 60 * 10, // 10 minutes - roles rarely change
    ...(options || {}),
  });
}

export function useGetPendingToolsQuery(options?: Record<string, unknown>) {
  return useQuery<unknown>({
    queryKey: ['admin', 'pending-tools'],
    queryFn: async () => api.getPendingTools(),
    staleTime: 1000 * 30, // 30 seconds - pending tools should be fairly fresh
    ...(options || {}),
  });
}

export function useApproveToolMutation() {
  const qc = useQueryClient();
  const m = useMutation<unknown, Error, string | number>({
    mutationFn: async (id) => api.approveTool(id),
    onSuccess: (_data) => {
      qc.invalidateQueries({ queryKey: ['admin', 'pending-tools'] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.TOOLS] });
    },
  });
  const trigger = (arg: string | number) => ({ unwrap: () => m.mutateAsync(arg) });
  return [trigger, m] as const;
}

export function useRejectToolMutation() {
  const qc = useQueryClient();
  const m = useMutation<unknown, Error, { id: string | number; reason?: string }>({
    mutationFn: async ({ id, reason }) => api.rejectTool(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'pending-tools'] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.TOOLS] });
    },
  });
  const trigger = (arg: { id: string | number; reason?: string }) => ({ unwrap: () => m.mutateAsync(arg) });
  return [trigger, m] as const;
}

export function useGetAdminStatsQuery(options?: Record<string, unknown>) {
  return useQuery<unknown>({
    queryKey: ['admin', 'stats'],
    queryFn: async () => api.getAdminStats(),
    staleTime: 1000 * 60 * 5, // 5 minutes - stats don't change that often
    ...(options || {}),
  });
}

// System health / readiness
export function useGetSystemReadyQuery(options?: Record<string, unknown>) {
  return useQuery<{
    status?: string;
    checks?: Record<string, string>;
  }>({
    queryKey: ['system', 'ready'],
    queryFn: async () => api.getReady(),
    staleTime: 1000 * 60 * 3, // 3 minutes - system status doesn't change often
    ...(options || {}),
  });
}

export function useGetAdminUsersQuery(params: Record<string, unknown> = {}, options?: Record<string, unknown>) {
  const key = ['admin', 'users', params];
  return useQuery<{
    data: any[];
    meta?: Record<string, any>;
    links?: Record<string, any>;
  }>({
    queryKey: key,
    queryFn: async () => (await api.getAdminUsers(params)) as {
      data: any[];
      meta?: Record<string, any>;
      links?: Record<string, any>;
    },
    ...(options || {}),
  });
}

export function useActivateUserMutation() {
  const qc = useQueryClient();
  const m = useMutation<unknown, Error, string | number>({
    mutationFn: async (id) => api.activateUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });
  const trigger = (arg: string | number) => ({ unwrap: () => m.mutateAsync(arg) });
  return [trigger, m] as const;
}

export function useDeactivateUserMutation() {
  const qc = useQueryClient();
  const m = useMutation<unknown, Error, string | number>({
    mutationFn: async (id) => api.deactivateUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });
  const trigger = (arg: string | number) => ({ unwrap: () => m.mutateAsync(arg) });
  return [trigger, m] as const;
}

export function useSetUserRolesMutation() {
  const qc = useQueryClient();
  const m = useMutation<unknown, Error, { userId: string | number; roles: Array<string | number> }>({
    mutationFn: async ({ userId, roles }) => api.setUserRoles(userId, roles),
    onSuccess: (_data, vars) => qc.invalidateQueries({ queryKey: ['admin', 'users', { page: 1 }] }),
  });
  const trigger = (arg: { userId: string | number; roles: Array<string | number> }) => ({ unwrap: () => m.mutateAsync(arg) });
  return [trigger, m] as const;
}

export function useGetActivitiesQuery(params: Record<string, unknown> = {}, options?: Record<string, unknown>) {
  const key = ['admin', 'activities', params];
  return useQuery<{
    data: any[];
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
  }>({
    queryKey: key,
    queryFn: async () => (await api.getActivities(params)) as {
      data: any[];
      current_page?: number;
      last_page?: number;
      per_page?: number;
      total?: number;
    },
    ...(options || {}),
  });
}

export function useGetActivityStatsQuery(options?: Record<string, unknown>) {
  return useQuery<{
    total: number;
    today: number;
    this_week: number;
    top_actions: { action: string; count: number }[];
  }>({
    queryKey: ['admin', 'activity-stats'],
    queryFn: async () => (await api.getActivityStats()) as {
      total: number;
      today: number;
      this_week: number;
      top_actions: { action: string; count: number }[];
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    ...(options || {}),
  });
}

// Categories
export function useGetAdminCategoriesQuery(params: Record<string, unknown> = {}, options?: Record<string, unknown>) {
  const key = ['admin', 'categories', params];
  return useQuery<{
    data: any[];
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
  }>({
    queryKey: key,
    queryFn: async () => (await api.getAdminCategories(params)) as {
      data: any[];
      current_page?: number;
      last_page?: number;
      per_page?: number;
      total?: number;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes - categories don't change often
    ...(options || {}),
  });
}

export function useGetAdminCategoryQuery(id?: string | number, options?: Record<string, unknown>) {
  return useQuery<unknown>({
    queryKey: ['admin', 'category', typeof id === 'undefined' ? id : String(id)],
    queryFn: async () => api.getAdminCategory(String(id)),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...(options || {}),
  });
}

export function useCreateCategoryMutation() {
  const qc = useQueryClient();
  const m = useMutation<unknown, Error, { name: string; description?: string }>({
    mutationFn: async (data) => api.createCategory(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'categories'] });
      qc.invalidateQueries({ queryKey: ['admin', 'category-stats'] });
    },
  });
  const trigger = (arg: { name: string; description?: string }) => ({ unwrap: () => m.mutateAsync(arg) });
  return [trigger, m] as const;
}

export function useUpdateCategoryMutation() {
  const qc = useQueryClient();
  const m = useMutation<unknown, Error, { id: string | number; data: { name: string; description?: string } }>({
    mutationFn: async ({ id, data }) => api.updateCategory(id, data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['admin', 'categories'] });
      qc.invalidateQueries({ queryKey: ['admin', 'category', String(vars.id)] });
      qc.invalidateQueries({ queryKey: ['admin', 'category-stats'] });
    },
  });
  const trigger = (arg: { id: string | number; data: { name: string; description?: string } }) => ({ unwrap: () => m.mutateAsync(arg) });
  return [trigger, m] as const;
}

export function useDeleteCategoryMutation() {
  const qc = useQueryClient();
  const m = useMutation<unknown, Error, string | number>({
    mutationFn: async (id) => api.deleteCategory(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'categories'] });
      qc.invalidateQueries({ queryKey: ['admin', 'category-stats'] });
    },
  });
  const trigger = (arg: string | number) => ({ unwrap: () => m.mutateAsync(arg) });
  return [trigger, m] as const;
}

export function useGetCategoryStatsQuery(options?: Record<string, unknown>) {
  return useQuery<{
    total: number;
    with_tools: number;
    without_tools: number;
    avg_tools_per_category: number;
    top_categories: { id: number; name: string; slug: string; tools_count: number }[];
  }>({
    queryKey: ['admin', 'category-stats'],
    queryFn: async () => (await api.getCategoryStats()) as {
      total: number;
      with_tools: number;
      without_tools: number;
      avg_tools_per_category: number;
      top_categories: { id: number; name: string; slug: string; tools_count: number }[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...(options || {}),
  });
}

// Tags
export function useGetAdminTagsQuery(params: Record<string, unknown> = {}, options?: Record<string, unknown>) {
  const key = ['admin', 'tags', params];
  return useQuery<{
    data: any[];
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
  }>({
    queryKey: key,
    queryFn: async () => (await api.getAdminTags(params)) as {
      data: any[];
      current_page?: number;
      last_page?: number;
      per_page?: number;
      total?: number;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes - tags don't change often
    ...(options || {}),
  });
}

export function useGetAdminTagQuery(id?: string | number, options?: Record<string, unknown>) {
  return useQuery<unknown>({
    queryKey: ['admin', 'tag', typeof id === 'undefined' ? id : String(id)],
    queryFn: async () => api.getAdminTag(String(id)),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...(options || {}),
  });
}

export function useCreateTagMutation() {
  const qc = useQueryClient();
  const m = useMutation<unknown, Error, { name: string; description?: string }>({
    mutationFn: async (data) => api.createTag(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'tags'] });
      qc.invalidateQueries({ queryKey: ['admin', 'tag-stats'] });
    },
  });
  const trigger = (arg: { name: string; description?: string }) => ({ unwrap: () => m.mutateAsync(arg) });
  return [trigger, m] as const;
}

export function useUpdateTagMutation() {
  const qc = useQueryClient();
  const m = useMutation<unknown, Error, { id: string | number; data: { name: string; description?: string } }>({
    mutationFn: async ({ id, data }) => api.updateTag(id, data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['admin', 'tags'] });
      qc.invalidateQueries({ queryKey: ['admin', 'tag', String(vars.id)] });
      qc.invalidateQueries({ queryKey: ['admin', 'tag-stats'] });
    },
  });
  const trigger = (arg: { id: string | number; data: { name: string; description?: string } }) => ({ unwrap: () => m.mutateAsync(arg) });
  return [trigger, m] as const;
}

export function useDeleteTagMutation() {
  const qc = useQueryClient();
  const m = useMutation<unknown, Error, string | number>({
    mutationFn: async (id) => api.deleteTag(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'tags'] });
      qc.invalidateQueries({ queryKey: ['admin', 'tag-stats'] });
    },
  });
  const trigger = (arg: string | number) => ({ unwrap: () => m.mutateAsync(arg) });
  return [trigger, m] as const;
}

export function useGetTagStatsQuery(options?: Record<string, unknown>) {
  return useQuery<{
    total: number;
    with_tools: number;
    without_tools: number;
    avg_tools_per_tag: number;
    top_tags: { id: number; name: string; slug: string; tools_count: number }[];
  }>({
    queryKey: ['admin', 'tag-stats'],
    queryFn: async () => (await api.getTagStats()) as {
      total: number;
      with_tools: number;
      without_tools: number;
      avg_tools_per_tag: number;
      top_tags: { id: number; name: string; slug: string; tools_count: number }[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...(options || {}),
  });
}

// ==================== Comments & Ratings ====================

export function useGetCommentsQuery(toolId: string | number, options?: Record<string, unknown>) {
  return useQuery<{
    data: Array<{
      id: number;
      content: string;
      user: { id: number; name: string };
      created_at: string;
      upvotes: number;
      downvotes: number;
      replies?: Array<{ id: number; content: string; user: { id: number; name: string }; created_at: string }>;
    }>;
  }>({
    queryKey: ['comments', toolId],
    queryFn: async () => api.getComments(toolId),
    enabled: !!toolId,
    ...(options || {}),
  });
}

export function usePostCommentMutation() {
  const qc = useQueryClient();
  const m = useMutation<unknown, Error, { toolId: string | number; content: string; parent_id?: number }>({
    mutationFn: async ({ toolId, content, parent_id }) => api.postComment(toolId, content, parent_id),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['comments', vars.toolId] });
    },
  });
  const trigger = (arg: { toolId: string | number; content: string; parent_id?: number }) => ({
    unwrap: () => m.mutateAsync(arg),
  });
  return [trigger, m] as const;
}

export function useDeleteCommentMutation() {
  const qc = useQueryClient();
  const m = useMutation<void, Error, { commentId: number; toolId: string | number }>({
    mutationFn: async ({ commentId }) => api.deleteComment(commentId),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['comments', vars.toolId] });
    },
  });
  const trigger = (arg: { commentId: number; toolId: string | number }) => ({ unwrap: () => m.mutateAsync(arg) });
  return [trigger, m] as const;
}

export function useRateToolMutation() {
  const qc = useQueryClient();
  const m = useMutation<unknown, Error, { toolId: string | number; score: number; review?: string }>({
    mutationFn: async ({ toolId, score, review }) => api.rateTool(toolId, score, review),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.TOOLS] });
      qc.invalidateQueries({ queryKey: ['tool', vars.toolId] });
    },
  });
  const trigger = (arg: { toolId: string | number; score: number; review?: string }) => ({
    unwrap: () => m.mutateAsync(arg),
  });
  return [trigger, m] as const;
}

export function useDeleteRatingMutation() {
  const qc = useQueryClient();
  const m = useMutation<void, Error, string | number>({
    mutationFn: async (toolId) => api.deleteRating(toolId),
    onSuccess: (_data, toolId) => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.TOOLS] });
      qc.invalidateQueries({ queryKey: ['tool', toolId] });
    },
  });
  const trigger = (arg: string | number) => ({ unwrap: () => m.mutateAsync(arg) });
  return [trigger, m] as const;
}
