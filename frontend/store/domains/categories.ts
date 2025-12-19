import { useQuery } from '@tanstack/react-query';
import * as api from '../../lib/api';
import { QUERY_KEYS } from '../queryKeys';
import { useCreateMutation } from '../utils/createMutation';
import type { Category, CategoryCreatePayload, CategoryUpdatePayload } from '../../lib/types';

/**
 * Fetch all categories
 */
export function useGetCategoriesQuery(options?: Record<string, unknown>) {
  return useQuery<Category[]>({
    queryKey: QUERY_KEYS.categories.list(),
    queryFn: async () => api.getCategories(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...(options || {}),
  });
}

/**
 * Create a new category
 */
export function useCreateCategoryMutation() {
  const fn = (body: CategoryCreatePayload) => api.createCategory(body);
  return useCreateMutation<CategoryCreatePayload, Category>({
    fn,
    invalidate: [QUERY_KEYS.categories.lists()],
  });
}

/**
 * Update an existing category
 */
export function useUpdateCategoryMutation() {
  const fn = ({ id, body }: { id: number | string; body: CategoryUpdatePayload }) =>
    api.updateCategory(id, body);
  return useCreateMutation<{ id: number | string; body: CategoryUpdatePayload }, Category>({
    fn,
    invalidate: [QUERY_KEYS.categories.lists()],
  });
}

/**
 * Delete a category
 */
export function useDeleteCategoryMutation() {
  const fn = (id: number | string) => api.deleteCategory(id);
  return useCreateMutation<number | string, void>({
    fn,
    invalidate: [QUERY_KEYS.categories.lists()],
  });
}

