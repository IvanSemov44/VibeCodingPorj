import { useQuery } from '@tanstack/react-query';
import * as api from '../../lib/api';
import { QUERY_KEYS } from '../queryKeys';
import { useCreateMutation } from '../utils/createMutation';
import type { Tag, TagCreatePayload, TagUpdatePayload } from '../../lib/types';

/**
 * Fetch all tags
 */
export function useGetTagsQuery(options?: Record<string, unknown>) {
  return useQuery<Tag[]>({
    queryKey: QUERY_KEYS.tags.list(),
    queryFn: async () => api.getTags(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...(options || {}),
  });
}

/**
 * Create a new tag
 */
export function useCreateTagMutation() {
  const fn = (body: TagCreatePayload) => api.createTag(body);
  return useCreateMutation<TagCreatePayload, Tag>({
    fn,
    invalidate: [QUERY_KEYS.tags.lists()],
  });
}

/**
 * Update an existing tag
 */
export function useUpdateTagMutation() {
  const fn = ({ id, body }: { id: number | string; body: TagUpdatePayload }) =>
    api.updateTag(id, body);
  return useCreateMutation<{ id: number | string; body: TagUpdatePayload }, Tag>({
    fn,
    invalidate: [QUERY_KEYS.tags.lists()],
  });
}

/**
 * Delete a tag
 */
export function useDeleteTagMutation() {
  const fn = (id: number | string) => api.deleteTag(id);
  return useCreateMutation<number | string, void>({
    fn,
    invalidate: [QUERY_KEYS.tags.lists()],
  });
}

