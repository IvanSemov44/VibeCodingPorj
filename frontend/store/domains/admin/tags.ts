import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../../../lib/api';
import type { Tag, ApiListResponse } from '../../../lib/types';

export function useGetAdminTagsQuery(
  params: Record<string, unknown> = {},
  options?: Record<string, unknown>,
) {
  const key = ['admin', 'tags', params];
  return useQuery<ApiListResponse<Tag>>({
    queryKey: key,
    queryFn: async () =>
      (await api.getAdminTags(params)) as ApiListResponse<Tag>,
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

export function useCreateAdminTagMutation() {
  const qc = useQueryClient();
  const m = useMutation<unknown, Error, { name: string; description?: string }>({
    mutationFn: async (data) => api.createTag(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'tags'] });
      qc.invalidateQueries({ queryKey: ['admin', 'tag-stats'] });
    },
  });
  const trigger = (arg: { name: string; description?: string }) => ({
    unwrap: () => m.mutateAsync(arg),
  });
  return [trigger, m] as const;
}

export function useUpdateAdminTagMutation() {
  const qc = useQueryClient();
  const m = useMutation<
    unknown,
    Error,
    { id: string | number; data: { name: string; description?: string } }
  >({
    mutationFn: async ({ id, data }) => api.updateTag(id, data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['admin', 'tags'] });
      qc.invalidateQueries({ queryKey: ['admin', 'tag', String(vars.id)] });
      qc.invalidateQueries({ queryKey: ['admin', 'tag-stats'] });
    },
  });
  const trigger = (arg: { id: string | number; data: { name: string; description?: string } }) => ({
    unwrap: () => m.mutateAsync(arg),
  });
  return [trigger, m] as const;
}

export function useDeleteAdminTagMutation() {
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
    queryFn: async () =>
      (await api.getTagStats()) as {
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
