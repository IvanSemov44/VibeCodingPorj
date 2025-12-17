import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../../lib/api';
import { QUERY_KEYS } from '../queryKeys';
import { useCreateMutation } from '../utils/createMutation';
import type { Tool, ToolCreatePayload, ToolUpdatePayload, ApiListResponse } from '../../lib/types';

export function useGetToolQuery(id?: string | number, options?: Record<string, unknown>) {
  return useQuery<Tool>({
    queryKey: [QUERY_KEYS.TOOL, typeof id === 'undefined' ? id : String(id)],
    queryFn: async () => api.getTool(String(id)),
    enabled: !!id,
    ...(options || {}),
  });
}

export function useGetToolsQuery(
  params?: Record<string, string | number | boolean>,
  options?: Record<string, unknown>,
) {
  const key = [QUERY_KEYS.TOOLS, params ?? null] as const;
  return useQuery<ApiListResponse<Tool>>({
    queryKey: key,
    queryFn: async () => api.getTools(params ?? {}),
    staleTime: 1000 * 60 * 2, // 2 minutes
    ...(options || {}),
  });
}

export function useCreateToolMutation() {
  const fn = (body: ToolCreatePayload) => api.createTool(body);
  return useCreateMutation<ToolCreatePayload, Tool>({ fn, invalidate: [QUERY_KEYS.TOOLS] });
}

export function useUpdateToolMutation() {
  const fn = ({ id, body }: { id: string | number; body: ToolUpdatePayload }) =>
    api.updateTool(id, body);
  return useCreateMutation<{ id: string | number; body: ToolUpdatePayload }, Tool>({
    fn,
    invalidate: [QUERY_KEYS.TOOLS, QUERY_KEYS.TOOL],
  });
}

export function useUploadToolScreenshotsMutation() {
  const fn = ({ id, files }: { id: string | number; files: File[] }) =>
    api.uploadToolScreenshots(id, files);
  return useCreateMutation<{ id: string | number; files: File[] }, { screenshots: string[] }>({
    fn,
    invalidate: [QUERY_KEYS.TOOL],
  });
}

export function useDeleteToolScreenshotMutation() {
  const qc = useQueryClient();
  const m = useMutation<{ screenshots?: string[] }, Error, { id: string | number; url: string }>({
    mutationFn: async ({ id, url }) => api.deleteToolScreenshot(id, url),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.TOOL, String(vars.id)] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.TOOLS] });
    },
  });

  const trigger = ({ id, url }: { id: string | number; url: string }) => ({
    unwrap: () => m.mutateAsync({ id, url }),
  });

  return [trigger, m] as const;
}

export function useDeleteToolMutation() {
  const qc = useQueryClient();
  const m = useMutation<void, Error, string | number>({
    mutationFn: async (id) => api.deleteTool(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.TOOLS] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.TOOL, String(id)] });
    },
  });
  const trigger = (arg: string | number) => ({ unwrap: () => m.mutateAsync(arg) });
  return [trigger, m] as const;
}
