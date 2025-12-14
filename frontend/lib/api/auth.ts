import type { AuthResponse } from '../types';
import { fetchWithAuth, parseJson, getCsrf } from './fetch';
import { API_ENDPOINTS } from '../constants';

export async function login(data: { email: string; password: string }): Promise<AuthResponse> {
  try {
    try {
      await getCsrf();
    } catch {}

    const res = await fetchWithAuth(`${API_ENDPOINTS.LOGIN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: data.email, password: data.password }),
    });

    return await parseJson<AuthResponse>(res);
  } catch (err: unknown) {
    throw err;
  }
}

export async function logout(): Promise<void> {
  const res = await fetchWithAuth(`${API_ENDPOINTS.LOGOUT}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) await parseJson(res as unknown as Response);
}

export async function getUser(): Promise<unknown | null> {
  try {
    let res = await fetchWithAuth(`${API_ENDPOINTS.USER}`);
    if (res.status === 401) {
      try {
        await getCsrf();
        res = await fetchWithAuth(`${API_ENDPOINTS.USER}`);
      } catch {}
    }
    if (res.status === 401) return null;
    return await parseJson(res as unknown as Response);
  } catch (err: unknown) {
    console.error('Get user error:', err);
    throw err;
  }
}

export async function register(data: Record<string, unknown>): Promise<AuthResponse> {
  const res = await fetchWithAuth(`${API_ENDPOINTS.REGISTER}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data as Record<string, unknown>),
  });
  return await parseJson<AuthResponse>(res);
}
