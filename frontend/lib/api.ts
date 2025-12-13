/**
 * Typed API client for backend communication
 * This file is an incremental TypeScript upgrade of the existing `lib/api.js`.
 */
import { API_BASE_URL, API_ENDPOINTS } from './constants';
import { ApiError, handleApiError } from './errors';
import type { Tool, JournalEntry, JournalStats, Tag, Category, User, ApiListResponse, Role, ToolCreatePayload, ToolUpdatePayload, CategoryCreatePayload, CategoryUpdatePayload, TagCreatePayload, TagUpdatePayload, JournalCreatePayload, JournalUpdatePayload, RegisterPayload, AuthResponse } from './types';

const BASE = API_BASE_URL.replace(/\/api\/?$/, '');

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|; )' + name.replace(/([.$?*|{}()\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'));
  return match ? decodeURIComponent(match[2]) : null;
}

let csrfToken: string | null = null;
function currentXsrf(): string {
  return getCookie('XSRF-TOKEN') || csrfToken || '';
}

async function fetchWithAuth(input: RequestInfo, init: RequestInit = {}): Promise<Response> {
  const method = ((init.method as HttpMethod) || 'GET').toUpperCase() as HttpMethod;
  const unsafe: HttpMethod[] = ['POST', 'PUT', 'PATCH', 'DELETE'];

    if (unsafe.includes(method)) {
    const token = currentXsrf();
    if (!token) {
      try { await getCsrf(); } catch { /* let request fail if CSRF required */ }
    }
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    ...(init.headers as Record<string, string> || {})
  };

  const tokenNow = currentXsrf();
  if (tokenNow) headers['X-XSRF-TOKEN'] = tokenNow;

  const response = await fetch(input, Object.assign({}, init, { credentials: 'include', headers }));
  return response;
}

async function parseJson<T>(res: Response): Promise<T> {
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError((json && (json.message || json.error)) || 'Request failed', res.status, json?.errors);
  }
  return json as T;
}

async function parseListResponse<T>(res: Response): Promise<ApiListResponse<T>> {
  const json = await parseJson<unknown>(res);
  if (Array.isArray(json)) return { data: json as unknown as T[] } as ApiListResponse<T>;
  return (json && 'data' in (json as Record<string, unknown>)) ? json as ApiListResponse<T> : { data: [json as unknown as T] } as ApiListResponse<T>;
}

export async function getCsrf(): Promise<Response> {
  try {
    const res = await fetchWithAuth(`${BASE}${API_ENDPOINTS.CSRF}`);
    const cookieVal = getCookie('XSRF-TOKEN');
    if (cookieVal) csrfToken = cookieVal;
    return res;
  } catch (err: unknown) {
    console.error('CSRF fetch error:', err);
    throw handleApiError(err, undefined);
  }
}

export async function login(data: { email: string; password: string }): Promise<AuthResponse> {
  try {
    try { await getCsrf(); } catch {}

    const res = await fetchWithAuth(`${BASE}${API_ENDPOINTS.LOGIN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: data.email, password: data.password })
    });

    return await parseJson<AuthResponse>(res);
  } catch (err: unknown) {
    if (err instanceof ApiError) throw err;
    throw handleApiError(err, undefined);
  }
}

export async function getUser(): Promise<User | null> {
  try {
    let res = await fetchWithAuth(`${BASE}${API_ENDPOINTS.USER}`);
    if (res.status === 401) {
      try {
        await getCsrf();
        res = await fetchWithAuth(`${BASE}${API_ENDPOINTS.USER}`);
      } catch {}
    }
    if (res.status === 401) return null;
    return await parseJson<User>(res);
  } catch (err: unknown) {
    console.error('Get user error:', err);
    throw handleApiError(err, undefined);
  }
}

// Public lists
export async function getCategories(): Promise<Category[]> { const res = await fetchWithAuth(`${BASE}/api/categories`); return (await parseListResponse<Category>(res)).data; }
export async function getRoles(): Promise<Role[]> { const res = await fetchWithAuth(`${BASE}/api/roles`); return (await parseListResponse<Role>(res)).data; }
export async function getTags(): Promise<Tag[]> { const res = await fetchWithAuth(`${BASE}/api/tags`); return (await parseListResponse<Tag>(res)).data; }

// Admin helpers
export async function createCategory(data: CategoryCreatePayload): Promise<Category> {
  const res = await fetchWithAuth(`${BASE}/api/categories`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  return await parseJson<Category>(res);
}

export async function updateCategory(id: number | string, data: CategoryUpdatePayload): Promise<Category> {
  const res = await fetchWithAuth(`${BASE}/api/categories/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  return await parseJson<Category>(res);
}

export async function deleteCategory(id: number | string): Promise<void> {
  const res = await fetchWithAuth(`${BASE}/api/categories/${id}`, { method: 'DELETE' });
  if (!res.ok) await parseJson(res); // will throw
}

export async function createTag(data: TagCreatePayload): Promise<Tag> {
  const res = await fetchWithAuth(`${BASE}/api/tags`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  return await parseJson<Tag>(res);
}

export async function updateTag(id: number | string, data: TagUpdatePayload): Promise<Tag> {
  const res = await fetchWithAuth(`${BASE}/api/tags/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  return await parseJson<Tag>(res);
}

export async function deleteTag(id: number | string): Promise<void> {
  const res = await fetchWithAuth(`${BASE}/api/tags/${id}`, { method: 'DELETE' });
  if (!res.ok) await parseJson(res);
}

export async function register(data: RegisterPayload): Promise<AuthResponse> {
  const res = await fetchWithAuth(`${BASE}${API_ENDPOINTS.REGISTER}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  return await parseJson<AuthResponse>(res);
}

export async function logout(): Promise<void> { const res = await fetchWithAuth(`${BASE}${API_ENDPOINTS.LOGOUT}`, { method: 'POST', headers: { 'Content-Type': 'application/json' } }); if (!res.ok) await parseJson(res); }

export async function getJournalEntries(params: Record<string, string | number | boolean> = {}): Promise<JournalEntry[]> {
  const qs = new URLSearchParams(Object.entries(params).reduce<Record<string,string>>((acc, [k,v]) => ({ ...acc, [k]: String(v) }), {})).toString();
  const res = await fetchWithAuth(`${BASE}/api/journal${qs ? '?' + qs : ''}`);
  return (await parseListResponse<JournalEntry>(res)).data;
}

export async function createJournalEntry(data: JournalCreatePayload): Promise<JournalEntry> {
  const res = await fetchWithAuth(`${BASE}/api/journal`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  return await parseJson<JournalEntry>(res);
}

export async function updateJournalEntry(id: number | string, data: JournalUpdatePayload): Promise<JournalEntry> {
  const res = await fetchWithAuth(`${BASE}/api/journal/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  return await parseJson<JournalEntry>(res);
}

export async function deleteJournalEntry(id: number | string): Promise<void> {
  const res = await fetchWithAuth(`${BASE}/api/journal/${id}`, { method: 'DELETE' });
  if (!res.ok) await parseJson(res);
}

export async function getJournalStats(): Promise<JournalStats> { const res = await fetchWithAuth(`${BASE}/api/journal/stats`); return await parseJson<JournalStats>(res); }

// 2FA endpoints (public)
export async function get2faSecret(): Promise<{ provisioning_uri: string | null; secret_mask: string | null }> {
  try {
    const res = await fetchWithAuth(`${BASE}/api/2fa/secret`);
    // Normalize 404 -> no secret
    if (res.status === 404) return { provisioning_uri: null, secret_mask: null };
    return await parseJson<{ provisioning_uri: string | null; secret_mask: string | null }>(res);
  } catch (err: unknown) {
    throw handleApiError(err, undefined);
  }
}

export async function enable2faTotp(): Promise<{ provisioning_uri?: string | null; recovery_codes?: string[] } | null> {
  const res = await fetchWithAuth(`${BASE}/api/2fa/enable`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'totp' }) });
  if (!res.ok) return await parseJson(res as unknown as Response);
  return await parseJson(res as unknown as Response);
}

// Tools API
export async function getTools(params: Record<string, string | number | boolean> = {}): Promise<ApiListResponse<Tool>> {
  const qs = new URLSearchParams(Object.entries(params).reduce<Record<string,string>>((acc, [k,v]) => ({ ...acc, [k]: String(v) }), {})).toString();
  const res = await fetchWithAuth(`${BASE}/api/tools${qs ? '?' + qs : ''}`);
  return await parseListResponse<Tool>(res);
}

export async function getTool(id: number | string): Promise<Tool> {
  const res = await fetchWithAuth(`${BASE}/api/tools/${id}`);
  const parsed = await parseJson<unknown>(res);
  // API may return { data: Tool } or Tool directly — normalize to Tool
  if (parsed && typeof parsed === 'object' && 'data' in (parsed as Record<string, unknown>)) {
    return (parsed as Record<string, unknown>).data as Tool;
  }
  return parsed as Tool;
}

export async function createTool(data: ToolCreatePayload): Promise<Tool> {
  const res = await fetchWithAuth(`${BASE}/api/tools`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  return await parseJson<Tool>(res);
}

export async function updateTool(id: number | string, data: ToolUpdatePayload): Promise<Tool> {
  const res = await fetchWithAuth(`${BASE}/api/tools/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  return await parseJson<Tool>(res);
}

export async function deleteTool(id: number | string): Promise<void> { const res = await fetchWithAuth(`${BASE}/api/tools/${id}`, { method: 'DELETE' }); if (!res.ok) await parseJson(res); }

export async function uploadToolScreenshots(id: number | string, files: FileList | File[]): Promise<{ screenshots: string[] }> {
  const form = new FormData();
  const fileArray: File[] = files instanceof FileList ? Array.from(files) : files;
  for (const f of fileArray) form.append('screenshots[]', f);
  const res = await fetchWithAuth(`${BASE}/api/tools/${id}/screenshots`, { method: 'POST', body: form });
  return await parseJson<{ screenshots: string[] }>(res);
}

export async function deleteToolScreenshot(id: number | string, url: string): Promise<{ screenshots: string[] }> {
  const res = await fetchWithAuth(`${BASE}/api/tools/${id}/screenshots`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) });
  return await parseJson<{ screenshots: string[] }>(res);
}

// Admin: per-user 2FA management
export async function getUserTwoFactor(userId: string): Promise<unknown | null> {
  const res = await fetchWithAuth(`${BASE}/api/admin/users/${userId}/2fa`);
  if (res.status === 404) return null;
  return await parseJson<unknown>(res);
}

export async function setUserTwoFactor(userId: string, type: string): Promise<unknown> {
  const res = await fetchWithAuth(`${BASE}/api/admin/users/${userId}/2fa`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type }) });
  return await parseJson<unknown>(res);
}

export async function disableUserTwoFactor(userId: string): Promise<void> {
  const res = await fetchWithAuth(`${BASE}/api/admin/users/${userId}/2fa`, { method: 'DELETE' });
  if (!res.ok) await parseJson(res as unknown as Response);
}
