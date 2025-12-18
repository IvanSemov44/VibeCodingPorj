import type {
  Category,
  Role,
  Tag,
  CategoryCreatePayload,
  CategoryUpdatePayload,
  TagCreatePayload,
  TagUpdatePayload,
} from '../types';
import { fetchWithAuth, parseJson, parseListResponse } from './fetch';

export async function getCategories(): Promise<Category[]> {
  const res = await fetchWithAuth(`/api/categories`);
  return (await parseListResponse<Category>(res)).data;
}
export async function getRoles(): Promise<Role[]> {
  const res = await fetchWithAuth(`/api/roles`);
  return (await parseListResponse<Role>(res)).data;
}
export async function getTags(): Promise<Tag[]> {
  const res = await fetchWithAuth(`/api/tags`);
  return (await parseListResponse<Tag>(res)).data;
}

export async function createCategory(data: CategoryCreatePayload): Promise<Category> {
  const res = await fetchWithAuth(`/api/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await parseJson<Category>(res);
}

export async function updateCategory(
  id: number | string,
  data: CategoryUpdatePayload,
): Promise<Category> {
  const res = await fetchWithAuth(`/api/categories/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await parseJson<Category>(res);
}

export async function deleteCategory(id: number | string): Promise<void> {
  const res = await fetchWithAuth(`/api/categories/${id}`, { method: 'DELETE' });
  if (!res.ok) await parseJson(res as unknown as Response);
}

export async function createTag(data: TagCreatePayload): Promise<Tag> {
  const res = await fetchWithAuth(`/api/tags`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await parseJson<Tag>(res);
}

export async function updateTag(id: number | string, data: TagUpdatePayload): Promise<Tag> {
  const res = await fetchWithAuth(`/api/tags/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await parseJson<Tag>(res);
}

export async function deleteTag(id: number | string): Promise<void> {
  const res = await fetchWithAuth(`/api/tags/${id}`, { method: 'DELETE' });
  if (!res.ok) await parseJson(res as unknown as Response);
}

// Health endpoints (liveness / readiness)
export async function getHealth(): Promise<Record<string, unknown>> {
  const res = await fetchWithAuth(`/api/health`);
  return await parseJson<Record<string, unknown>>(res);
}

export async function getReady(): Promise<Record<string, unknown>> {
  const res = await fetchWithAuth(`/api/ready`);
  return await parseJson<any>(res);
}
