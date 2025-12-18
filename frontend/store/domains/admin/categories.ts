import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../../../lib/api';

export function useGetAdminCategoriesQuery(
  params: Record<string, unknown> = {},
  options?: Record<string, unknown>,
) {
  const key = ['admin', 'categories', params];
  return useQuery<{
    data: any[];
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
  }>({
    queryKey: key,
    queryFn: async () =>
      (await api.getAdminCategories(params)) as {
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

export function useCreateAdminCategoryMutation() {
  const qc = useQueryClient();
  const m = useMutation<unknown, Error, { name: string; description?: string }>({
    mutationFn: async (data) => api.createCategory(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'categories'] });
      qc.invalidateQueries({ queryKey: ['admin', 'category-stats'] });
    },
  });
  const trigger = (arg: { name: string; description?: string }) => ({
    unwrap: () => m.mutateAsync(arg),
  });
  return [trigger, m] as const;
}

export function useUpdateAdminCategoryMutation() {
  const qc = useQueryClient();
  const m = useMutation<
    unknown,
    Error,
    { id: string | number; data: { name: string; description?: string } }
  >({
    mutationFn: async ({ id, data }) => api.updateCategory(id, data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['admin', 'categories'] });
      qc.invalidateQueries({ queryKey: ['admin', 'category', String(vars.id)] });
      qc.invalidateQueries({ queryKey: ['admin', 'category-stats'] });
    },
  });
  const trigger = (arg: { id: string | number; data: { name: string; description?: string } }) => ({
    unwrap: () => m.mutateAsync(arg),
  });
  return [trigger, m] as const;
}

export function useDeleteAdminCategoryMutation() {
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
    queryFn: async () =>
      (await api.getCategoryStats()) as {
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
