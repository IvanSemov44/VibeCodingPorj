import { fetchWithAuth, parseJson } from './fetch';

export async function getUserTwoFactor(userId: string): Promise<unknown | null> {
  const res = await fetchWithAuth(`/api/admin/users/${userId}/2fa`);
  if (res.status === 404) return null;
  return await parseJson<unknown>(res);
}

export async function setUserTwoFactor(userId: string, type: string): Promise<unknown> {
  const res = await fetchWithAuth(`/api/admin/users/${userId}/2fa`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type }),
  });
  return await parseJson<unknown>(res);
}

export async function disableUserTwoFactor(userId: string): Promise<void> {
  const res = await fetchWithAuth(`/api/admin/users/${userId}/2fa`, { method: 'DELETE' });
  if (!res.ok) await parseJson(res as unknown as Response);
}

export async function getPendingTools(params: Record<string, unknown> = {}): Promise<unknown> {
  const qs = new URLSearchParams(Object.entries(params as Record<string, string>)).toString();
  const url = `/api/admin/tools/pending${qs ? `?${qs}` : ''}`;
  const res = await fetchWithAuth(url);
  return await parseJson(res as unknown as Response);
}

export async function approveTool(id: string | number): Promise<unknown> {
  const res = await fetchWithAuth(`/api/admin/tools/${id}/approve`, { method: 'POST' });
  return await parseJson(res as unknown as Response);
}

export async function rejectTool(id: string | number, reason?: string): Promise<unknown> {
  const res = await fetchWithAuth(`/api/admin/tools/${id}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason }),
  });
  return await parseJson(res as unknown as Response);
}

export async function getAdminStats(): Promise<unknown> {
  const res = await fetchWithAuth(`/api/admin/stats`);
  return await parseJson(res as unknown as Response);
}

export async function getAdminUsers(params: Record<string, unknown> = {}): Promise<unknown> {
  const qs = new URLSearchParams(Object.entries(params as Record<string, string>)).toString();
  const url = `/api/admin/users${qs ? `?${qs}` : ''}`;
  const res = await fetchWithAuth(url);
  return await parseJson(res as unknown as Response);
}

export async function activateUser(userId: string | number): Promise<unknown> {
  const res = await fetchWithAuth(`/api/admin/users/${userId}/activate`, { method: 'POST' });
  return await parseJson(res as unknown as Response);
}

export async function deactivateUser(userId: string | number): Promise<unknown> {
  const res = await fetchWithAuth(`/api/admin/users/${userId}/deactivate`, { method: 'POST' });
  return await parseJson(res as unknown as Response);
}

export async function setUserRoles(userId: string | number, roles: Array<string | number>): Promise<unknown> {
  const res = await fetchWithAuth(`/api/admin/users/${userId}/roles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roles }),
  });
  return await parseJson(res as unknown as Response);
}

export async function getActivities(params: Record<string, unknown> = {}): Promise<unknown> {
  const qs = new URLSearchParams(Object.entries(params as Record<string, string>)).toString();
  const url = `/api/admin/activities${qs ? `?${qs}` : ''}`;
  const res = await fetchWithAuth(url);
  return await parseJson(res as unknown as Response);
}

export async function getActivityStats(): Promise<unknown> {
  const res = await fetchWithAuth(`/api/admin/activities/stats`);
  return await parseJson(res as unknown as Response);
}

// Categories
export async function getAdminCategories(params: Record<string, unknown> = {}): Promise<unknown> {
  const qs = new URLSearchParams(Object.entries(params as Record<string, string>)).toString();
  const url = `/api/admin/categories${qs ? `?${qs}` : ''}`;
  const res = await fetchWithAuth(url);
  return await parseJson(res as unknown as Response);
}

export async function getAdminCategory(id: string | number): Promise<unknown> {
  const res = await fetchWithAuth(`/api/admin/categories/${id}`);
  return await parseJson(res as unknown as Response);
}

export async function createAdminCategory(data: { name: string; description?: string }): Promise<unknown> {
  const res = await fetchWithAuth(`/api/admin/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await parseJson(res as unknown as Response);
}

export async function updateAdminCategory(id: string | number, data: { name: string; description?: string }): Promise<unknown> {
  const res = await fetchWithAuth(`/api/admin/categories/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await parseJson(res as unknown as Response);
}

export async function deleteAdminCategory(id: string | number): Promise<unknown> {
  const res = await fetchWithAuth(`/api/admin/categories/${id}`, { method: 'DELETE' });
  return await parseJson(res as unknown as Response);
}

export async function getCategoryStats(): Promise<unknown> {
  const res = await fetchWithAuth(`/api/admin/categories/stats`);
  return await parseJson(res as unknown as Response);
}

// Tags
export async function getAdminTags(params: Record<string, unknown> = {}): Promise<unknown> {
  const qs = new URLSearchParams(Object.entries(params as Record<string, string>)).toString();
  const url = `/api/admin/tags${qs ? `?${qs}` : ''}`;
  const res = await fetchWithAuth(url);
  return await parseJson(res as unknown as Response);
}

export async function getAdminTag(id: string | number): Promise<unknown> {
  const res = await fetchWithAuth(`/api/admin/tags/${id}`);
  return await parseJson(res as unknown as Response);
}

export async function createAdminTag(data: { name: string; description?: string }): Promise<unknown> {
  const res = await fetchWithAuth(`/api/admin/tags`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await parseJson(res as unknown as Response);
}

export async function updateAdminTag(id: string | number, data: { name: string; description?: string }): Promise<unknown> {
  const res = await fetchWithAuth(`/api/admin/tags/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await parseJson(res as unknown as Response);
}

export async function deleteAdminTag(id: string | number): Promise<unknown> {
  const res = await fetchWithAuth(`/api/admin/tags/${id}`, { method: 'DELETE' });
  return await parseJson(res as unknown as Response);
}

export async function getTagStats(): Promise<unknown> {
  const res = await fetchWithAuth(`/api/admin/tags/stats`);
  return await parseJson(res as unknown as Response);
}

// ==================== Comments & Ratings ====================

export async function getComments(toolId: string | number): Promise<unknown> {
  const res = await fetchWithAuth(`/api/tools/${toolId}/comments`);
  return await parseJson(res as unknown as Response);
}

export async function postComment(
  toolId: string | number,
  content: string,
  parent_id?: number
): Promise<unknown> {
  const res = await fetchWithAuth(`/api/tools/${toolId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, parent_id }),
  });
  return await parseJson(res as unknown as Response);
}

export async function deleteComment(commentId: number): Promise<void> {
  await fetchWithAuth(`/api/comments/${commentId}`, { method: 'DELETE' });
}

export async function rateTool(
  toolId: string | number,
  score: number,
  review?: string
): Promise<unknown> {
  const res = await fetchWithAuth(`/api/tools/${toolId}/rating`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ score, review }),
  });
  return await parseJson(res as unknown as Response);
}

export async function deleteRating(toolId: string | number): Promise<void> {
  await fetchWithAuth(`/api/tools/${toolId}/rating`, { method: 'DELETE' });
}
