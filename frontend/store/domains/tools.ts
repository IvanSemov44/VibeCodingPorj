import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../../lib/api';
import { QUERY_KEYS } from '../queryKeys';
import { useCreateMutation } from '../utils/createMutation';
import { useOptimisticUpdateWithInvalidation } from '../utils/optimisticUpdate';
import type { Tool, ToolCreatePayload, ToolUpdatePayload, ApiListResponse } from '../../lib/types';

/**
 * Fetch a single tool by ID
 */
export function useGetToolQuery(id?: string | number, options?: Record<string, unknown>) {
  return useQuery<Tool>({
    queryKey: QUERY_KEYS.tools.detail(id || ''),
    queryFn: async () => api.getTool(String(id)),
    enabled: !!id,
    ...(options || {}),
  });
}

/**
 * Fetch all tools with optional filters
 */
export function useGetToolsQuery(
  params?: Record<string, string | number | boolean>,
  options?: Record<string, unknown>,
) {
  return useQuery<ApiListResponse<Tool>>({
    queryKey: QUERY_KEYS.tools.list(params),
    queryFn: async () => api.getTools(params ?? {}),
    staleTime: 1000 * 60 * 2, // 2 minutes
    ...(options || {}),
  });
}

/**
 * Create a new tool
 * Invalidates tools list to ensure fresh data
 */
export function useCreateToolMutation() {
  const fn = (body: ToolCreatePayload) => api.createTool(body);
  return useCreateMutation<ToolCreatePayload, Tool>({
    fn,
    invalidate: [QUERY_KEYS.tools.lists()],
  });
}

/**
 * Update an existing tool
 * Invalidates both the specific tool and tools list
 */
export function useUpdateToolMutation() {
  const qc = useQueryClient();
  const m = useMutation<Tool, unknown, { id: string | number; body: ToolUpdatePayload }>({
    mutationFn: async ({ id, body }) => api.updateTool(id, body),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.tools.lists() });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.tools.detail(vars.id) });
    },
  });
  const trigger = (arg: { id: string | number; body: ToolUpdatePayload }) => ({
    unwrap: () => m.mutateAsync(arg),
  });
  return [trigger, m] as const;
}

/**
 * Upload tool screenshots
 * Invalidates the specific tool's detail query
 */
export function useUploadToolScreenshotsMutation() {
  const fn = ({ id, files }: { id: string | number; files: File[] }) =>
    api.uploadToolScreenshots(id, files);
  return useCreateMutation<{ id: string | number; files: File[] }, { screenshots: string[] }>({
    fn,
    invalidate: [QUERY_KEYS.tools.all],
  });
}

/**
 * Delete a tool screenshot
 * Invalidates tool detail and list queries
 */
export function useDeleteToolScreenshotMutation() {
  const qc = useQueryClient();
  const m = useMutation<{ screenshots?: string[] }, Error, { id: string | number; url: string }>({
    mutationFn: async ({ id, url }) => api.deleteToolScreenshot(id, url),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.tools.detail(vars.id) });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.tools.lists() });
    },
  });

  const trigger = ({ id, url }: { id: string | number; url: string }) => ({
    unwrap: () => m.mutateAsync({ id, url }),
  });

  return [trigger, m] as const;
}

/**
 * Delete a tool
 * Invalidates tools list and specific tool detail queries
 */
export function useDeleteToolMutation() {
  const qc = useQueryClient();
  const m = useMutation<void, Error, string | number>({
    mutationFn: async (id) => api.deleteTool(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.tools.lists() });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.tools.detail(id) });
    },
  });
  const trigger = (arg: string | number) => ({ unwrap: () => m.mutateAsync(arg) });
  return [trigger, m] as const;
}

