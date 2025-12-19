import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../../../lib/api';
import { QUERY_KEYS } from '../../queryKeys';

export function useGetCommentsQuery(toolId: string | number, options?: Record<string, unknown>) {
  return useQuery<{
    data: Array<{
      id: number;
      content: string;
      user: { id: number; name: string };
      created_at: string;
      upvotes: number;
      downvotes: number;
      replies?: Array<{
        id: number;
        content: string;
        user: { id: number; name: string };
        created_at: string;
      }>;
    }>;
  }>({
    queryKey: ['comments', toolId],
    queryFn: async () =>
      api.getComments(toolId) as Promise<{
        data: Array<{
          id: number;
          content: string;
          user: { id: number; name: string };
          created_at: string;
          upvotes: number;
          downvotes: number;
          replies?: Array<{
            id: number;
            content: string;
            user: { id: number; name: string };
            created_at: string;
          }>;
        }>;
      }>,
    enabled: !!toolId,
    ...(options || {}),
  });
}

export function usePostCommentMutation() {
  const qc = useQueryClient();
  const m = useMutation<
    unknown,
    Error,
    { toolId: string | number; content: string; parent_id?: number }
  >({
    mutationFn: async ({ toolId, content, parent_id }) =>
      api.postComment(toolId, content, parent_id),
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
  const trigger = (arg: { commentId: number; toolId: string | number }) => ({
    unwrap: () => m.mutateAsync(arg),
  });
  return [trigger, m] as const;
}

export function useRateToolMutation() {
  const qc = useQueryClient();
  const m = useMutation<
    unknown,
    Error,
    { toolId: string | number; score: number; review?: string }
  >({
    mutationFn: async ({ toolId, score, review }) => api.rateTool(toolId, score, review),
    onSuccess: (_data, vars) => {
      // Invalidate the tool list
      qc.invalidateQueries({ queryKey: QUERY_KEYS.tools.lists() });
      // Invalidate the specific tool to refresh rating display
      qc.invalidateQueries({ queryKey: QUERY_KEYS.tools.detail(vars.toolId) });
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
      qc.invalidateQueries({ queryKey: QUERY_KEYS.tools.lists() });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.tools.detail(toolId) });
    },
  });
  const trigger = (arg: string | number) => ({ unwrap: () => m.mutateAsync(arg) });
  return [trigger, m] as const;
}
