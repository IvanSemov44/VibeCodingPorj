import type { Tool, ApiListResponse, ToolCreatePayload, ToolUpdatePayload } from '../types';
import { fetchWithAuth, parseJson, parseListResponse } from './fetch';
import { z } from 'zod';
import { parseAndValidate } from './validation';

export async function getTools(
  params: Record<string, string | number | boolean> = {},
): Promise<ApiListResponse<Tool>> {
  const qs = new URLSearchParams(
    Object.entries(params).reduce<Record<string, string>>(
      (acc, [k, v]) => ({ ...acc, [k]: String(v) }),
      {},
    ),
  ).toString();
  const res = await fetchWithAuth(`/api/tools${qs ? '?' + qs : ''}`);
  return await parseListResponse<Tool>(res);
}

export async function getTool(id: number | string): Promise<Tool> {
  const res = await fetchWithAuth(`/api/tools/${id}`);

  // Example runtime schema for tool responses. Adjust as needed for stricter validation.
  const ToolSchema = z
    .object({
      id: z.number(),
      name: z.string().optional(),
      description: z.string().nullable().optional(),
      url: z.string().nullable().optional(),
      screenshots: z.array(z.string()).optional(),
    })
    .passthrough();

  return await parseAndValidate<Tool>(res, ToolSchema);
}

export async function createTool(data: ToolCreatePayload): Promise<Tool> {
  const res = await fetchWithAuth(`/api/tools`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await parseJson<Tool>(res);
}

export async function updateTool(id: number | string, data: ToolUpdatePayload): Promise<Tool> {
  const res = await fetchWithAuth(`/api/tools/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await parseJson<Tool>(res);
}

export async function deleteTool(id: number | string): Promise<void> {
  const res = await fetchWithAuth(`/api/tools/${id}`, { method: 'DELETE' });
  if (!res.ok) await parseJson(res);
}

export async function uploadToolScreenshots(
  id: number | string,
  files: FileList | File[],
): Promise<{ screenshots: string[] }> {
  const form = new FormData();
  const fileArray: File[] = files instanceof FileList ? Array.from(files) : files;
  for (const f of fileArray) form.append('screenshots[]', f);
  const res = await fetchWithAuth(`/api/tools/${id}/screenshots`, { method: 'POST', body: form });
  return await parseJson<{ screenshots: string[] }>(res);
}

export async function deleteToolScreenshot(
  id: number | string,
  url: string,
): Promise<{ screenshots: string[] }> {
  const res = await fetchWithAuth(`/api/tools/${id}/screenshots`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  return await parseJson<{ screenshots: string[] }>(res);
}
